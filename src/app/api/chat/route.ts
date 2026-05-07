import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { aiConfig, systemPrompts, ITINERARY_TOOL, fetchWithRetry } from "@/lib/ai";
import { geocodePlace } from "@/lib/maps";
import { getEnrichedData } from "@/lib/data";
import {
  createDebugInfo,
  extractMapsDistance,
  extractMapsPlaces,
  extractPlacesWithCoordinates,
  extractDurationFromText,
  getCoordinates
} from "@/lib/maps";
import {
  calculateRoundTripCarbonEmissions,
  calculateEcoComparison,
  formatCarbonDisplay,
  estimateLocalEmissions
} from "@/lib/carbon";
import { getEcoActivitySuggestion, formatEcoActivityDisplay } from "@/lib/carbon/eco-activity";
import {
  getPreviousTripMetadata,
  saveTripMetadata,
  isRevisionTrip,
  type TripMetadata
} from "@/lib/session";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Missing GOOGLE_API_KEY");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: Request) {
  try {
    if (!ai) {
      return NextResponse.json({ error: "Konfigurasi AI belum lengkap" }, { status: 500 });
    }

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
    }
    
    // Get model config
    const currentModel = aiConfig.getCurrentModel();
    const modelName = aiConfig.model;
    console.log(`Using model: ${modelName} (${currentModel.description})`);
    
    // Format history
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;

    // ═══════════════════════════════════════════════════════════
    // REVISION DETECTION - Load previous trip metadata
    // ═══════════════════════════════════════════════════════════
    // For now, use simple heuristic (messages count > 1 = likely revision)
    // In production, load from database using userId
    const isLikelyRevision = messages.length > 1;
    const previousTrip = null; // Would load from DB in production: await getPreviousTripMetadata(userId)
    
    // Get system prompt based on model
    const systemPrompt = currentModel.provider === "gemini" 
      ? systemPrompts.travelPlannerMinimal 
      : systemPrompts.travelPlanner;
    
    // Use user input directly for Maps context - trust AI to understand destination
    // No regex parsing needed - Maps Grounding will handle location via AI
    const locationContext = lastMessage;
    
    // Extract duration from user input
    const durationDays = extractDurationFromText(lastMessage);
    console.log(`[duration] Extracted duration: ${durationDays} days`);
    
    console.log(`[maps] Using user input directly: ${locationContext.substring(0, 50)}...`);
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: Maps Grounding Call (separate, text-only)
    // We call the model with ONLY googleMaps tool to force
    // grounded place search. No regex or coordinates needed.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let mapsContext = "";
    let groundingChunks: any[] = [];
    
    if (locationContext && locationContext.length > 3) {
      try {
        const mapsPrompt = `Berikan informasi tentang tempat wisata, restoran, dan aktivitas menarik di ${locationContext}. Fokus pada tempat yang eco-friendly dan berkelanjutan. Sertakan nama tempat, lokasi, dan deskripsi singkat.`;
        
        // Use retry for Maps grounding call (might hit rate limits)
        const mapsResponse = await fetchWithRetry(
          "Maps grounding (Step 1)",
          () => ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: mapsPrompt }] }],
            config: {
              tools: [{ googleMaps: {} }],
              httpOptions: { timeout: 30000 }
            }
          })
        );
        
        // Extract grounding metadata from Maps-only call
        const mapsCandidates = (mapsResponse as any).candidates;
        const mapsGrounding = mapsCandidates?.[0]?.groundingMetadata;
        
        console.log("[maps] Step 1 candidate keys:", Object.keys(mapsCandidates?.[0] || {}));
        
        if (mapsGrounding) {
          groundingChunks = mapsGrounding?.groundingChunks || [];
          console.log("[maps] ✅ Step 1 grounding found:", {
            chunks: groundingChunks.length,
            supports: mapsGrounding?.groundingSupports?.length || 0,
            widgetToken: mapsGrounding?.googleMapsWidgetContextToken ? "present" : "none"
          });
          
          if (groundingChunks.length > 0) {
            console.log("[maps] Sample chunks:", JSON.stringify(groundingChunks.slice(0, 3), null, 2));
          }
          
          // Extract Maps text to use as context for Step 2
          const mapsText = mapsCandidates?.[0]?.content?.parts
            ?.filter((p: any) => p.text && p.thought !== true)
            ?.map((p: any) => p.text)
            ?.join("\n") || "";
          
          if (mapsText) {
            mapsContext = `\n\n[DATA TEMPAT DARI GOOGLE MAPS]:\n${mapsText}\n`;
            console.log("[maps] ✅ Maps context extracted:", mapsContext.length, "chars");
          }
        } else {
          console.log("[maps] ⚠ Step 1: No grounding metadata returned");
          // Still try to get text response
          const mapsText = mapsResponse.text || "";
          if (mapsText) {
            mapsContext = `\n\n[REFERENSI TEMPAT]:\n${mapsText}\n`;
            console.log("[maps] Using text fallback from Maps call:", mapsText.length, "chars");
          }
        }
      } catch (mapsError) {
        console.error("[maps] Step 1 Maps call failed (non-fatal):", mapsError);
        // Continue without Maps data - non-fatal error
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: Function Calling (with Maps context injected)
    // Now call the model with function declarations only,
    // injecting Maps data as part of the system prompt.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("[maps] Step 2: Generating itinerary with function calling...");
    
    // Build duration instruction
    const durationInstruction = durationDays 
      ? `\n📅 DURASI: User meminta ${durationDays} hari. WAJIB generate itinerary dengan tepat ${durationDays} hari!\n⚠️ JANGAN 生成 kurang dari yang diminta!` 
      : `\n📅 DURASI: Tidak terdeteksi! Jika durasi tidak jelas, tanya user dulu перед generate!`;
    
    const enrichedSystemPrompt = mapsContext 
      ? `${systemPrompt}${durationInstruction}\n\nGunakan data tempat berikut untuk membuat rekomendasi yang akurat dan berbasis data nyata:${mapsContext}`
      : `${systemPrompt}${durationInstruction}`;
    
    // Use retry for API calls that might fail due to rate limits
    const response = await fetchWithRetry(
      "generateContent (Step 2)",
      () => ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: enrichedSystemPrompt,
          tools: [{ functionDeclarations: [ITINERARY_TOOL] }],
          toolConfig: {
            functionCallingConfig: {
              mode: "ANY" as any,
              allowedFunctionNames: ["generate_regenerative_itinerary"]
            }
          },
          httpOptions: {
            timeout: currentModel.timeout
          }
        }
      })
    );

    // Parse response
    const candidates = (response as any).candidates;
    let aiText = "";
    let itineraryData = null;
    let carbonData = null;
    let ecoActivityData = null;
    
    if (candidates && candidates[0]?.content?.parts) {
      const parts = candidates[0].content.parts;
      
      // Check function call
      const functionCallPart = parts.find((p: any) => p.functionCall);
      
      console.log("[step2] Parts types:", JSON.stringify(parts.map((p: any) => Object.keys(p))));
      
      if (functionCallPart?.functionCall) {
        const fc = functionCallPart.functionCall;
        console.log("Function call detected:", fc.name);
        
        // Use Maps grounding data from Step 1
        const mapsPlaces = extractMapsPlaces({ groundingChunks } as any);
        const mapsPlacesWithCoords = extractPlacesWithCoordinates({ groundingChunks } as any);
        console.log("[maps] Grounded places from Step 1:", mapsPlaces.length);
        console.log("[maps] Places with coordinates:", mapsPlacesWithCoords.filter(p => p.latitude).length);
        
        if (fc.name === "generate_regenerative_itinerary" && fc.args) {
          const args = typeof fc.args === 'string' ? JSON.parse(fc.args) : fc.args;
          console.log("Full itinerary args:", JSON.stringify(args, null, 2));
          
          // ═══════════════════════════════════════════════════════════
          // SERVER-SIDE VALIDATION: Check if AI is asking for more info
          // ═══════════════════════════════════════════════════════════
          const needsMoreInfo = args.needs_more_info === true;
          const hasItinerary = Array.isArray(args.itinerary) && args.itinerary.length > 0;
          
          // Check required fields in trip_metadata
          const tripMeta = args.trip_metadata || {};
          const requiredMetaFields = ['region', 'from_location', 'duration_days'];
          const missingMetaFields = requiredMetaFields.filter(
            f => !tripMeta[f] || tripMeta[f] === null || tripMeta[f] === undefined
          );
          
          const hasValidMeta = missingMetaFields.length === 0;
          
          // Check if carbon_data has required fields
          const aiCarbonData = args.carbon_data || {};
          const hasValidCarbon = aiCarbonData.total_emissions_kg > 0 && aiCarbonData.distance_km > 0;
          
          // If needs_more_info OR has invalid metadata OR has empty itinerary -> return chat only
          if (needsMoreInfo || !hasItinerary || !hasValidMeta || !hasValidCarbon) {
            console.log("[validation] Blocking itinerary generation:");
            console.log("  - needs_more_info:", needsMoreInfo);
            console.log("  - hasItinerary:", hasItinerary);
            console.log("  - hasValidMeta:", hasValidMeta, "| missing:", missingMetaFields);
            console.log("  - hasValidCarbon:", hasValidCarbon);
            
            // Return chat response only - do NOT generate itinerary
            return NextResponse.json({ 
              chat_response: args.chat_response || "Silakan berikan detail tambahan untuk perjalanan Anda.",
              needs_more_info: true,
              missing_info: args.missing_info || missingMetaFields,
              itinerary_data: null,
              carbon_data: null,
              eco_activity: null,
              enriched_data: null,
              recommended_activities: [],
              eco_comparisons: [],
              maps_grounded: groundingChunks.length > 0
            });
          }
          
          console.log("[validation] ✅ All required fields present, proceeding with itinerary generation...");

          // ═══════════════════════════════════════════════════════════
// INJECT COORDINATES INTO ITINERARY ACTIVITIES
// 3-Level Fallback: Maps Grounding → DESTINATION_COORDINATES → Nominatim
// ═══════════════════════════════════════════════════════════
          if (args.itinerary) {
            // Build a combined coordinates lookup
            const placeCoordMap = new Map<string, { latitude: number; longitude: number; placeId: string; source: string }>();
            
            // LEVEL 1: Maps Grounding (if available)
            if (mapsPlacesWithCoords.length > 0) {
              console.log("[coords] Level 1: Loading from Maps Grounding...");
              for (const place of mapsPlacesWithCoords) {
                if (place.title && place.latitude !== null && place.longitude !== null) {
                  placeCoordMap.set(place.title.toLowerCase(), {
                    latitude: place.latitude,
                    longitude: place.longitude,
                    placeId: place.placeId,
                    source: "maps"
                  });
                }
              }
            }
            
            // LEVEL 2: DESTINATION_COORDINATES fallback + Nominatim
            console.log("[coords] Level 2: Loading from DESTINATION_COORDINATES + location field...");
            
            // Collect unique location queries for Nominatim
            const locationQueries = new Set<string>();
            
            for (const day of args.itinerary) {
              if (day.activities) {
                for (const activity of day.activities) {
                  if (activity.activity && !activity.latitude) {
                    const activityText = activity.activity;
                    const activityLocation = activity.location; // AI SUDAH MENYEDIAKAN INI!
                    const activityLower = activityText.toLowerCase();
                    let matchedCoord: { latitude: number; longitude: number; placeId: string; source: string } | undefined;
                    
                    // Try LEVEL 1: Maps Grounding exact match
                    matchedCoord = placeCoordMap.get(activityLower);
                    
                    // Try LEVEL 2a: activity.location first (INI YANG BENAR!)
                    if (!matchedCoord && activityLocation) {
                      const destCoord = getCoordinates(activityLocation);
                      if (destCoord) {
                        matchedCoord = {
                          latitude: destCoord.latitude,
                          longitude: destCoord.longitude,
                          placeId: `dest:${activityLocation.toLowerCase()}`,
                          source: "destination-location"
                        };
                      }
                    }
                    
                    // Try LEVEL 2b: DESTINATION_COORDINATES fuzzy match on activity text
                    if (!matchedCoord) {
                      // Extract likely place names from activity (e.g., "Pura Taman Ayun" -> "taman ayun")
                      const placeKeywords = [
                        /pura\s+(\w+)/i,
                        /museum\s+(\w+)/i,
                        /rice\s+terrace/gi,
                        /air\s+terjun/gi,
                        /desa\s+(\w+)/i,
                        /cafe\s+(\w+)/i,
                        /restaurant\s+(\w+)/i,
                        /hotel\s+(\w+)/i,
                        /(\w+)\s+village/i
                      ];
                      
                      for (const keyword of placeKeywords) {
                        const match = activityText.match(keyword);
                        if (match) {
                          const placeName = match[1] || match[0];
                          const destCoord = getCoordinates(placeName);
                          if (destCoord) {
                            matchedCoord = {
                              latitude: destCoord.latitude,
                              longitude: destCoord.longitude,
                              placeId: `dest:${placeName.toLowerCase()}`,
                              source: "destination-keyword"
                            };
                            break;
                          }
                        }
                      }
                    }
                    
                    // Try LEVEL 3: Nominatim for activity.location only
                    if (!matchedCoord && activityLocation) {
                      // Skip generic activities
                      const isGenericActivity = /^(makan|bersantai|check|beli|belanja|libur|jalan|rute|penerbangan|perjalanan|transport|tiba|datang|pulang|check|out|in)$/i.test(activityText);
                      if (!isGenericActivity) {
                        locationQueries.add(activityLocation);
                      }
                    }
                    
                    // Assign coordinates if found
                    if (matchedCoord) {
                      activity.latitude = matchedCoord.latitude;
                      activity.longitude = matchedCoord.longitude;
                      activity.placeId = matchedCoord.placeId;
                      console.log(`[coords] ✅ ${activity.activity} -> ${matchedCoord.source} (${matchedCoord.latitude}, ${matchedCoord.longitude})`);
                    } else if (!locationQueries.has(activityLocation || '')) {
                      console.log(`[coords] ⏳ ${activity.activity} (${activityLocation}) -> pending Nominatim`);
                    }
                  }
                }
              }
            }
            
            // LEVEL 3: Nominatim lookup (ONLY activity.location, NOT activity text)
            const uniqueLocations = Array.from(locationQueries);
            if (uniqueLocations.length > 0) {
              console.log(`[coords] Level 3: Running Nominatim for ${uniqueLocations.length} locations...`);
              
              for (const loc of uniqueLocations) {
                try {
                  const result = await geocodePlace(loc);
                  if (result) {
                    // Find and update all activities with this location
                    for (const day of args.itinerary || []) {
                      if (day.activities) {
                        for (const activity of day.activities) {
                          if (activity.location && activity.location.toLowerCase() === loc.toLowerCase()) {
                            if (!activity.latitude) {
                              activity.latitude = result.latitude;
                              activity.longitude = result.longitude;
                              activity.placeId = result.placeId;
                              console.log(`[coords] ✅ ${activity.activity} (${activity.location}) -> nominatim (${result.latitude}, ${result.longitude})`);
                            }
                          }
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.warn(`[nominatim] Failed for: ${loc}`);
                }
              }
            }
            
            // Count how many activities have coordinates
            let coordsCount = 0;
            for (const day of args.itinerary || []) {
              if (day.activities) {
                for (const activity of day.activities) {
                  if (activity.latitude && activity.longitude) coordsCount++;
                }
              }
            }
            console.log(`[maps] ✅ Coordinate injection complete: ${coordsCount} activities with coordinates`);
          }
          
          // Extract data from AI response (should be valid after validation above)
          const region = args.trip_metadata?.region;
          const fromLocation = args.trip_metadata?.from_location;
          const durationDays = args.trip_metadata?.duration_days;
          
          // Double-check (safety net)
          if (!region || !fromLocation || !durationDays) {
            console.error("[validation] CRITICAL: Missing required fields despite validation pass!");
            console.error("  region:", region);
            console.error("  fromLocation:", fromLocation);
            console.error("  durationDays:", durationDays);
            return NextResponse.json({ 
              chat_response: "Maaf, terjadi kesalahan. Silakan coba lagi.",
              needs_more_info: true,
              missing_info: ["region", "from_location", "duration_days"],
              itinerary_data: null,
              carbon_data: null,
              eco_activity: null,
              enriched_data: null,
              recommended_activities: [],
              eco_comparisons: [],
              maps_grounded: groundingChunks.length > 0
            });
          }
          
          // ═══════════════════════════════════════════════════════════
          // REVISION DETECTION - Compare with previous trip
          // ═══════════════════════════════════════════════════════════
          const currentMetadata: TripMetadata = {
            region: region,
            from_location: fromLocation,
            duration_days: durationDays
          };
          
          // Simple revision detection:
          // - If messages.length > 1 AND same trip metadata = revision
          // - Otherwise = new trip
          const revisionCheck = isRevisionTrip(currentMetadata, previousTrip);
          
          // Also check simple heuristic: if multiple messages in session
          const isRevision = revisionCheck.isRevision || (isLikelyRevision && messages.length > 1);
          
          console.log(`[revision] ${isRevision ? 'REVISION' : 'NEW TRIP'} - ${revisionCheck.reason}${
            isLikelyRevision && messages.length > 1 ? ' (session-based)' : ''
          }`);
          
          // Calculate carbon using emissions.dev API
          let carbonResult = await calculateRoundTripCarbonEmissions(fromLocation, region, 2);
          
          // Fallback to AI's carbon_data if emissions.dev failed or if revision
          const aiCarbon = args.carbon_data;
          
          // If revision detected, prefer AI's carbon_data (more stable) 
          // unless emissions.dev returns valid data
          const useAIFallback = isRevision || 
            !carbonResult || 
            carbonResult.total_kg === 0 || 
            carbonResult.distance_km === 0;
          
          if (useAIFallback) {
            // Check if AI returned valid carbon_data
            const hasValidCarbonData = aiCarbon?.total_emissions_kg && aiCarbon.total_emissions_kg > 0;
            
            if (hasValidCarbonData) {
              // Use AI's carbon data (preferred)
              console.log("[carbon] Using AI's carbon_data");
              carbonResult = {
                outbound: { 
                  carbon_kg: aiCarbon.total_emissions_kg / 2,
                  distance_km: aiCarbon.distance_km || 0,
                  per_passenger_kg: aiCarbon.total_emissions_kg / 2
                },
                return_: { 
                  carbon_kg: aiCarbon.total_emissions_kg / 2,
                  distance_km: aiCarbon.distance_km || 0,
                  per_passenger_kg: aiCarbon.total_emissions_kg / 2
                },
                total_kg: aiCarbon.total_emissions_kg,
                distance_km: (aiCarbon.distance_km || 0) * 2,
                per_passenger_kg: aiCarbon.total_emissions_kg,
                with_buffer: aiCarbon.emissions_with_buffer_kg || Math.round(aiCarbon.total_emissions_kg * 1.1)
              };
            } else {
              // AI didn't return carbon_data - use DEFAULT estimation based on transport
              console.log("[carbon] AI missing carbon_data - using default estimation");
              
              // Default: Flight Medan-Sabang approx 170kg per passenger (round trip)
              const defaultFlightCarbon = 170; // kg per person
              const defaultDistance = 840; // km (Medan-Sabang round trip)
              
              // Check for other transports in itinerary to adjust
              const hasBusOrFerry = args.itinerary?.some((day: any) => 
                day.activities?.some((act: any) => 
                  act.transport?.toLowerCase().includes('bus') || 
                  act.transport?.toLowerCase().includes('ferry')
                )
              );
              
              // If using bus+ferry, estimate lower
              const multiplier = hasBusOrFerry ? 0.8 : 1.0;
              const estimatedCarbon = Math.round(defaultFlightCarbon * multiplier);
              
              carbonResult = {
                outbound: { 
                  carbon_kg: Math.round(estimatedCarbon / 2),
                  distance_km: Math.round(defaultDistance * multiplier / 2),
                  per_passenger_kg: Math.round(estimatedCarbon / 2)
                },
                return_: { 
                  carbon_kg: Math.round(estimatedCarbon / 2),
                  distance_km: Math.round(defaultDistance * multiplier / 2),
                  per_passenger_kg: Math.round(estimatedCarbon / 2)
                },
                total_kg: estimatedCarbon,
                distance_km: Math.round(defaultDistance * multiplier),
                per_passenger_kg: estimatedCarbon,
                with_buffer: Math.round(estimatedCarbon * 1.1)
              };
            }
          }
          
          // Get eco activity suggestion (async)
          const ecoActivity = await getEcoActivitySuggestion(region);

          console.log("Carbon result:", carbonResult);
          console.log("Eco activity:", ecoActivity);

          // Calculate eco comparison for activities with transport info
          const allActivities = args.itinerary?.flatMap((day: any) => 
            (day.activities || []).map((act: any) => ({ ...act, day: day.day }))
          ) || [];
          
          const activitiesWithTransport = allActivities
            .filter((act: any) => act.transport && act.location)
            .slice(0, 8);
          
          const ecoComparisons: any[] = [];
          
          for (const act of activitiesWithTransport) {
            // Use default local estimation instead of API call
            // This avoids the broken emissions.dev lookup for local destinations
            const comparison = estimateLocalEmissions(
              act.transport,
              act.location,
              act.activity
            );
            
            const ecoData = {
              activity: act.activity,
              transport: act.transport,
              day: act.day,
              ...comparison
            };
            ecoComparisons.push(ecoData);
          }
          
          console.log("Eco comparisons:", ecoComparisons);
          
          // Build enriched itinerary with eco data attached to each activity
          // Create lookup from ecoComparisons array
          const ecoLookup: Record<string, any> = {};
          for (const eco of ecoComparisons) {
            ecoLookup[`${eco.day}-${eco.activity}`] = eco;
          }
          
          const enrichedItinerary = args.itinerary?.map((day: any) => ({
            ...day,
            activities: (day.activities || []).map((act: any) => {
              const key = `${day.day}-${act.activity}`;
              const ecoData = ecoLookup[key];
              return {
                ...act,
                eco_comparison: ecoData || null,
                eco_saved_kg: ecoData?.saved_carbon_kg || 0,
                eco_message: ecoData?.message || null
              };
            })
          })) || [];

          // Calculate total carbon saved
          const totalSavedKg = ecoComparisons.reduce((sum, item) => sum + (item.saved_carbon_kg || 0), 0);
          
          console.log("Total saved carbon:", totalSavedKg);

          // Build response
          itineraryData = {
            trip_metadata: args.trip_metadata || { 
              title: "Petualangan Seru", 
              region, 
              total_eco_score: 80 
            },
            itinerary: enrichedItinerary,
            recommended_activities: args.recommended_activities || []
          };

          carbonData = carbonResult ? {
            total_emissions_kg: carbonResult.total_kg,
            emissions_with_buffer_kg: carbonResult.with_buffer,
            total_saved_kg: Math.round(totalSavedKg * 10) / 10,
            transport_type: "flight",
            distance_km: carbonResult.distance_km || 0
          } : null;
          
          ecoActivityData = ecoActivity || null;
          
          // Get recommended activities from AI response
          const recommendedActivities = args.recommended_activities || [];
          
          // Get enriched data - use existing fromLocation for flights
          const hotels = getEnrichedData(region, 'hotel');
          const flights = getEnrichedData(region, 'flight', fromLocation);
          
          return NextResponse.json({ 
            chat_response: args.chat_response || "Perjalanan Anda sudah siap! ✨",
            itinerary_data: itineraryData,
            carbon_data: carbonData,
            eco_activity: ecoActivityData,
            recommended_activities: recommendedActivities,
            eco_comparisons: ecoComparisons,
            enriched_data: { hotels, flights },
            maps_grounded: groundingChunks.length > 0
          });
        }
      }
      
      // Get text response if no function call
      const cleanParts = parts.filter((p: any) => p.thought !== true && !p.functionCall);
      aiText = cleanParts.map((p: any) => p.text).join('\n').trim();
    }
    
    if (!aiText) {
      aiText = response.text || "Maaf, saya butuh waktu lebih lama. Coba lagi ya!";
    }

    return NextResponse.json({ 
      chat_response: aiText,
      itinerary_data: null,
      carbon_data: null,
      eco_activity: null,
      enriched_data: null
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan AI" }, { status: 500 });
  }
}