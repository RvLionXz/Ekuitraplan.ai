import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { getEnrichedData } from "@/lib/travel-simulator";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Missing GOOGLE_API_KEY");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// System prompt untuk Liora
const SYSTEM_PROMPT = `Anda adalah Liora, Kurator Perjalanan Regeneratif dari Ekuitraplan.ai.

ATURAN:
- Pesan 1 & 2: JANGAN kasih itinerary, tanya dulu tentang preferensi
- Puji destino secara puitis
- Tanya satu pertanyaan tentang preferensi (akomodasi/aktivitas)
- Bahasa: Indonesia santai dan elegan, max 3 kalimat
- Pakai emoji ✨ 🌿

Contoh: "Ah, Kalimantan... ✨ Apakah Anda ingin eco-resort atau homestay lokal?"`;

// Tool declaration untuk generate itinerary - LENGKAP
const ITINERARY_TOOL = {
  name: "generate_regenerative_itinerary",
  description: "Menghasilkan rencana perjalanan regeneratif lengkap dengan aktivitas harian.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chat_response: { type: Type.STRING, description: "Respons penutup yang hangat" },
      trip_metadata: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Judul trip yang menarik" },
          region: { type: Type.STRING, description: "Nama wilayah/destinasi" },
          total_eco_score: { type: Type.NUMBER, description: "Skor eco-friendly 0-100" }
        }
      },
      itinerary: {
        type: Type.ARRAY,
        description: "Array aktivitas per hari",
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER, description: "Nomor hari (1, 2, 3...)" },
            theme: { type: Type.STRING, description: "Tema hari ini" },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "Jam aktivitas (09:00)" },
                  activity: { type: Type.STRING, description: "Nama aktivitas" },
                  location: { type: Type.STRING, description: "Lokasi" },
                  eco_impact: { type: Type.STRING, description: "Dampak positif" },
                  description: { type: Type.STRING, description: "Deskripsi singkat" }
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
    
    // Format history untuk dikirim ke model
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    const lastMessage = messages[messages.length - 1].content;

    // Kirim dengan tools untuk itinerary generation
    const response = await ai.models.generateContent({
      model: "gemma-4-26b-a4b-it",
      contents: contents,  // Kirim semua history
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [ITINERARY_TOOL] }]
      }
    });

    // Parse response - cek function call dulu
    const candidates = (response as any).candidates;
    let aiText = "";
    let itineraryData = null;
    
    if (candidates && candidates[0]?.content?.parts) {
      const parts = candidates[0].content.parts;
      
      // Cek apakah ada function call
      const functionCallPart = parts.find((p: any) => p.functionCall);
      
      if (functionCallPart?.functionCall) {
        const fc = functionCallPart.functionCall;
        console.log("Function call:", fc.name, fc.args);
        
        // Jika ada function call, generate itinerary data
        if (fc.name === "generate_regenerative_itinerary" && fc.args) {
          const args = typeof fc.args === 'string' ? JSON.parse(fc.args) : fc.args;
          
          console.log("Full itinerary args:", JSON.stringify(args, null, 2));
          
          // Extract SEMUA field dari args
          const region = args.trip_metadata?.region || "Kalimantan";
          const itineraryData = {
            trip_metadata: args.trip_metadata || { 
              title: "Petualangan di Kalimantan", 
              region, 
              total_eco_score: 85 
            },
            itinerary: args.itinerary || []
          };
          
          // Get enriched data
          const hotels = getEnrichedData(region, 'hotel');
          const flights = getEnrichedData(region, 'flight');
          
          return NextResponse.json({ 
            chat_response: args.chat_response || "Perjalanan Anda sudah siap! ✨",
            itinerary_data: itineraryData,
            enriched_data: { hotels, flights }
          });
        }
      }
      
      // Kalau tidak ada function call,ambil text biasa
      const cleanParts = parts.filter((p: any) => p.thought !== true && !p.functionCall);
      aiText = cleanParts.map((p: any) => p.text).join('\n').trim();
    }
    
    // Fallback
    if (!aiText) {
      aiText = response.text || "Maaf, saya butuh waktu lebih lama untuk merespons. Coba lagi ya!";
    }

    return NextResponse.json({ 
      chat_response: aiText,
      itinerary_data: null,
      enriched_data: null
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan AI" }, { status: 500 });
  }
}