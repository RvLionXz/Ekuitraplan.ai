import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const ITINERARY_TOOL = {
  functionDeclarations: [
    {
      name: "generate_regenerative_itinerary",
      description: "Menghasilkan rencana perjalanan regeneratif yang ramah lingkungan di Indonesia.",
      parameters: {
        type: "OBJECT",
        properties: {
          chat_response: {
            type: "STRING",
            description: "Narasi sapaan dan ringkasan singkat perjalanan dalam 2-3 kalimat saja."
          },
          itinerary_data: {
            type: "OBJECT",
            description: "Data terstruktur itinerary dalam format JSON.",
            properties: {
              trip_metadata: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  region: { type: "STRING" },
                  total_eco_score: { type: "NUMBER" },
                  carbon_offset_kg: { type: "NUMBER" }
                }
              },
              itinerary: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    day: { type: "NUMBER" },
                    theme: { type: "STRING" },
                    activities: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          time: { type: "STRING" },
                          activity: { type: "STRING" },
                          location: { type: "STRING" },
                          eco_impact: { type: "STRING" },
                          description: { type: "STRING" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["chat_response", "itinerary_data"]
      }
    }
  ]
};

const SYSTEM_PROMPT = `
Anda adalah "Ekuitraplan AI", pakar perencana perjalanan regeneratif di Indonesia.
Tugas Anda adalah merancang liburan ramah lingkungan.

PENTING:
Setiap kali pengguna meminta rencana perjalanan, Anda HARUS memanggil fungsi 'generate_regenerative_itinerary' dengan data yang sesuai.
Jangan memberikan jawaban teks biasa. Gunakan fungsi tersebut untuk mengirimkan respon chat dan data JSON secara bersamaan.
Jaga agar 'chat_response' tetap singkat, padat, dan inspiratif (maksimal 3 kalimat).
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({ 
      model: "gemma-4-26b-a4b-it",
      tools: [ITINERARY_TOOL]
    });

    const result = await model.generateContent(lastMessage);
    const response = await result.response;
    
    // Check for function calls
    const functionCall = response.functionCalls()?.[0];
    
    if (functionCall) {
      return NextResponse.json({ 
        chat_response: functionCall.args.chat_response,
        itinerary_data: functionCall.args.itinerary_data
      });
    }

    // Fallback for simple chat
    return NextResponse.json({ 
      chat_response: response.text(),
      itinerary_data: null
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan AI" }, { status: 500 });
  }
}
