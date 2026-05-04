// Eco Activity Service - Cari eco activity via Search Grounding
// Menggunakan Google Search Grounding untuk finding eco activities di lokasi tujuan

interface EcoActivity {
  name: string;
  type: "mangrove" | "coral" | "beach-cleanup" | "tree-planting" | "conservation" | "general";
  location: string;
  description: string;
  impact: string;
}

// Fallback activities jika search tidak dapat hasil
const FALLBACK_ACTIVITIES: Record<string, EcoActivity[]> = {
  // Bali
  bali: [
    {
      name: "Mangrove Planting at Taman Sari",
      type: "mangrove",
      location: "Bali",
      description: "Tanam mangrove di kawasan konservasi mangrove Taman Sari, membatu penyerapan karbon dan perlindungan pantai.",
      impact: "Menanam 1 mangrove dapat menyerap hingga 10kg CO2/tahun"
    },
    {
      name: "Coral Restoration at Tulamben",
      type: "coral",
      location: "Bali - Tulamben",
      description: "Bantu restorasi terumbu karang di dive site Tulamben yang terkenal.",
      impact: "1m² coral reef支持 100+ species laut"
    }
  ],
  // Jakarta
  jakarta: [
    {
      name: "Urban Tree Planting",
      type: "tree-planting",
      location: "Jakarta",
      description: "Tanam pohon di kawasan hijau Urban Forest Jakarta.",
      impact: "1 pohon menyerap hingga 22kg CO2/tahun"
    }
  ],
  // Kalimantan
  kalimantan: [
    {
      name: "Orangutan Conservation Support",
      type: "conservation",
      location: "Kalimantan",
      description: "Dukung konservasi orangutan di Taman Nasional Tanjung Puting.",
      impact: "Support habitat preservation untuk endangered species"
    }
  ],
  // Default
  default: [
    {
      name: "Tree Planting Program",
      type: "tree-planting",
      location: "Indonesia",
      description: "Tanam pohon di program reforestasi terdekat.",
      impact: "1 pohon menyerap 10-22kg CO2/tahun"
    },
    {
      name: "Carbon Offset Donation",
      type: "general",
      location: "Indonesia",
      description: "Donasi ke program carbon offset terverifikasi.",
      impact: "Kompensasi emisi karbon via program tersertifikasi"
    }
  ]
};

function getActivitiesByRegion(region: string): EcoActivity[] {
  const normalizedRegion = region.toLowerCase().trim();
  
  // Exact match
  if (FALLBACK_ACTIVITIES[normalizedRegion]) {
    return FALLBACK_ACTIVITIES[normalizedRegion];
  }
  
  // Partial match (e.g., "Bali" in "Nusa Dua Bali")
  for (const key of Object.keys(FALLBACK_ACTIVITIES)) {
    if (normalizedRegion.includes(key)) {
      return FALLBACK_ACTIVITIES[key];
    }
  }
  
  return FALLBACK_ACTIVITIES.default;
}

/**
 * Get eco activities untuk suatu lokasi
 * Priority: Search Grounding result → Fallback list
 * 
 * NOTE: Search Grounding akan diintegrasikan via Google AI tool
 * Untuk sekarang, menggunakan predefined fallback list
 */
export async function getEcoActivities(location: string): Promise<EcoActivity[]> {
  // Get activities from fallback list based on region
  const activities = getActivitiesByRegion(location);
  
  // Return activities - untuk sekarang tanpa Search Grounding
  // Nanti bisa diintegrasikan dengan Google Search Grounding
  return activities;
}

/**
 * Get satu eco activity suggestion untuk ditampilkan di itinerary
 */
export async function getEcoActivitySuggestion(location: string): Promise<EcoActivity | null> {
  const activities = await getEcoActivities(location);
  
  if (activities.length === 0) {
    return FALLBACK_ACTIVITIES.default[0];
  }
  
  // Return random activity dari list
  const randomIndex = Math.floor(Math.random() * activities.length);
  return activities[randomIndex];
}

/**
 * Format eco activity untuk display
 */
export function formatEcoActivityDisplay(activity: EcoActivity): string {
  return `${activity.name} - ${activity.description} (Impact: ${activity.impact})`;
}