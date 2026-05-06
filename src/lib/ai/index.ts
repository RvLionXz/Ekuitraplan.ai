import { Type } from "@google/genai";

export { aiConfig, systemPrompts } from "./config";
export { fetchWithRetry } from "./retry";

export const ITINERARY_TOOL = {
  name: "generate_regenerative_itinerary",
  description:
    "Generate complete travel itinerary with carbon calculation and eco activity suggestions.",
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
          duration_days: {
            type: Type.NUMBER,
            description: "JUMLAH HARI yang diminta user - WAJIB SESUAI dengan input"
          },
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
          type: {
            type: Type.STRING,
            description: "Type: mangrove/coral/tree-planting/conservation"
          },
          location: { type: Type.STRING, description: "Location where activity takes place" },
          description: { type: Type.STRING, description: "Activity description" },
          impact: { type: Type.STRING, description: "Environmental impact description" }
        }
      },
      recommended_activities: {
        type: Type.ARRAY,
        description:
          "Grounded eco-friendly activities list for the destination from verified sources",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            eco_score: { type: Type.NUMBER, description: "Eco-friendliness score 1-100" }
          }
        }
      },
      itinerary: {
        type: Type.ARRAY,
        description:
          "Daily itinerary array - WAJIB contiene exactamente duration_days yang diminta user. Ejemplo: kalau user minta 20 hari, itinerary HARUS contain tepat 20 hari dengan day 1-20.",
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER, description: "Day number (1, 2, 3... sesuai durasi)" },
            theme: { type: Type.STRING, description: "Day theme" },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: {
                    type: Type.STRING,
                    description:
                      "Waktu deskriptif: Pagi, Siang, Sore, Malam. JANGAN gunakan angka jam."
                  },
                  activity: { type: Type.STRING },
                  location: { type: Type.STRING },
                  latitude: { type: Type.NUMBER, description: "Koordinat lintang (latitude) - contoh: -8.5052" },
                  longitude: {
                    type: Type.NUMBER,
                    description: "Koordinat bujur (longitude) - contoh: 115.1889"
                  },
                  placeId: { type: Type.STRING, description: "Google Maps Place ID (opsional)" },
                  transport: {
                    type: Type.STRING,
                    description: "Transport mode: MRT, jalankaki, taksi, bus, car"
                  },
                  eco_impact: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    },
    required: ["chat_response", "trip_metadata", "itinerary", "carbon_data", "recommended_activities"]
  }
};