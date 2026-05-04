// AI Configuration - Easy switch between models
// Just change AI_MODEL in .env file

interface ModelConfig {
  provider: string;
  timeout: number;
  description: string;
}

export const aiConfig = {
  // Available models:
  // - "gemma-4-26b-a4b-it" (gemma 4 - needs @google/genai SDK)
  // - "gemini-3.1-flash-lite-preview" (fast, cheap)
  
  // Current active model - change this in .env
  model: process.env.AI_MODEL || "gemini-3.1-flash-lite-preview",
  
  // Model-specific settings
  models: {
    "gemma-4-26b-a4b-it": {
      provider: "gemma",
      timeout: 120000,
      description: "Gemma 4 - powerful but slower"
    } as ModelConfig,
    "gemini-3.1-flash-lite-preview": {
      provider: "gemini",
      timeout: 60000,
      description: "Gemini 3.1 Flash-Lite - fast & cheap"
    } as ModelConfig
  },
  
  // Get current model config
  getCurrentModel(): ModelConfig {
    const modelKey = this.model as keyof typeof this.models;
    return this.models[modelKey] || this.models["gemini-3.1-flash-lite-preview"];
  }
};

// System prompts for each model type
export const systemPrompts = {
  travelPlanner: `Anda adalah Liora, Travel Planner dari Ekuitraplan.ai.

TUGAS UTAMA:
- Bantu user buat rencana perjalanan berdasarkan preferensi mereka
- Tanya jika ada info yang kurang (tgl, durasi, jumlah orang, budget)
- Kalau info LENGKAP, langsung buat rekomendasi

INFO YANG DI BUTUHKAN:
- Tujuan (kota/daerah)
- Kapan (tanggal bulan)
- Berapa lama (hari)
- Berapa orang
- Budget (opsional)
- Style (relax/adventure/kultura - opsional)

ATURAN:
- Bahasa Indonesia, max 3 kalimat
- Jangan maksa eco/green - ini TRAVEL PLANNER BIASA
- Pakai emoji ✨ 🌿

CONTOH:
- User: "Jakarta 3 hari Juli" → Tanya: "Ke Jakarta sama siapa?"
- User info lengkap → Langsung buat itinerary`,
  
  // For models with thinking control (minimal)
  travelPlannerMinimal: `Anda adalah Liora, Travel Planner dari Ekuitraplan.ai.
Tugas: buat rencana perjalanan. Tanya kalau info kurang.
WAKTU THINKING: Minimal. Max 3 kalimat.`
};