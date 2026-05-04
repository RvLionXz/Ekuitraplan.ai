import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { getEnrichedData } from "@/lib/travel-simulator";
import { aiConfig, systemPrompts } from "@/lib/ai-config";
import { calculateRoundTripCarbonEmissions, formatCarbonDisplay } from "@/lib/carbon";
import { getEcoActivitySuggestion, formatEcoActivityDisplay } from "@/lib/eco-activity";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Missing GOOGLE_API_KEY");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Tool declaration for COMPLETE itinerary generation (itinerary + carbon + eco)
const ITINERARY_TOOL = {
  name: "generate_regenerative_itinerary",
  description: "Generate complete travel itinerary with carbon calculation and eco activity suggestions.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chat_response: { type: Type.STRING, description: "Warm closing message" },
      trip_metadata: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Trip title" },
          region: { type: Type.STRING, description: "Destination region" },
          from_location: { type: Type.STRING, description: "Origin city for carbon calculation" },
          total_eco_score: { type: Type.NUMBER, description: "Eco score 0-100" }
        }
      },
      carbon_data: {
        type: Type.OBJECT,
        description: "Carbon emissions from transportation",
        properties: {
          total_emissions_kg: { type: Type.NUMBER, description: "Total carbon emissions in kg" },
          emissions_with_buffer_kg: { type: Type.NUMBER, description: "Emissions with 10% buffer" },
          transport_type: { type: Type.STRING, description: "Type of transport (flight/car)" },
          distance_km: { type: Type.NUMBER, description: "Total distance in km" }
        }
      },
      eco_activity: {
        type: Type.OBJECT,
        description: "Suggested eco activity for this trip",
        properties: {
          name: { type: Type.STRING, description: "Activity name" },
          type: { type: Type.STRING, description: "Type: mangrove/coral/tree-planting/conservation" },
          location: { type: Type.STRING, description: "Location where activity takes place" },
          description: { type: Type.STRING, description: "Activity description" },
          impact: { type: Type.STRING, description: "Environmental impact description" }
        }
      },
      itinerary: {
        type: Type.ARRAY,
        description: "Daily itinerary array",
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER, description: "Day number" },
            theme: { type: Type.STRING, description: "Day theme" },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  location: { type: Type.STRING },
                  eco_impact: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    },
    required: ["chat_response", "trip_metadata", "itinerary"]
  }
};

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

    // Get system prompt based on model
    const systemPrompt = currentModel.provider === "gemini" 
      ? systemPrompts.travelPlannerMinimal 
      : systemPrompts.travelPlanner;

    // Send request with tool
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: [ITINERARY_TOOL] }],
        httpOptions: {
          timeout: currentModel.timeout
        }
      }
    });

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
      
      if (functionCallPart?.functionCall) {
        const fc = functionCallPart.functionCall;
        console.log("Function call detected:", fc.name);
        
        if (fc.name === "generate_regenerative_itinerary" && fc.args) {
          const args = typeof fc.args === 'string' ? JSON.parse(fc.args) : fc.args;
console.log("Full itinerary args:", JSON.stringify(args, null, 2));
          
          // Extract data from AI response
          const region = args.trip_metadata?.region || "Indonesia";
          const fromLocation = args.trip_metadata?.from_location || "Jakarta";
          
          // Calculate carbon using emissions.dev API
          const carbonResult = await calculateRoundTripCarbonEmissions(fromLocation, region, 2);
          
          // Get eco activity suggestion (async)
          const ecoActivity = await getEcoActivitySuggestion(region);

          console.log("Carbon result:", carbonResult);
          console.log("Eco activity:", ecoActivity);

          // Build response
          itineraryData = {
            trip_metadata: args.trip_metadata || { 
              title: "Petualangan Seru", 
              region, 
              total_eco_score: 80 
            },
            itinerary: args.itinerary || []
          };

          carbonData = carbonResult ? {
            total_emissions_kg: carbonResult.total_kg,
            emissions_with_buffer_kg: carbonResult.with_buffer,
            transport_type: "flight",
            distance_km: carbonResult.distance_km || 0
          } : null;
          
          ecoActivityData = ecoActivity || null;
          
          // Get enriched data
          const hotels = getEnrichedData(region, 'hotel');
          const flights = getEnrichedData(region, 'flight');
          
          return NextResponse.json({ 
            chat_response: args.chat_response || "Perjalanan Anda sudah siap! ✨",
            itinerary_data: itineraryData,
            carbon_data: carbonData,
            eco_activity: ecoActivityData,
            enriched_data: { hotels, flights }
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