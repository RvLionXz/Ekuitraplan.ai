interface EcoActivity {
  name: string;
  type: "mangrove" | "coral" | "beach-cleanup" | "tree-planting" | "conservation" | "general";
  location: string;
  description: string;
  impact: string;
}

const FALLBACK_ACTIVITIES: Record<string, EcoActivity[]> = {
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
  jakarta: [
    {
      name: "Urban Tree Planting",
      type: "tree-planting",
      location: "Jakarta",
      description: "Tanam pohon di kawasan hijau Urban Forest Jakarta.",
      impact: "1 pohon penyerapan hingga 22kg CO2/tahun"
    }
  ],
  kalimantan: [
    {
      name: "Orangutan Conservation Support",
      type: "conservation",
      location: "Kalimantan",
      description: "Dukung konservasi orangutan di Taman Nasional Tanjung Puting.",
      impact: "Support habitat preservation untuk endangered species"
    }
  ],
  default: [
    {
      name: "Tree Planting Program",
      type: "tree-planting",
      location: "Indonesia",
      description: "Tanam pohon di program reforestasi terdekat.",
      impact: "1 pohon penyerapan 10-22kg CO2/tahun"
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

  if (FALLBACK_ACTIVITIES[normalizedRegion]) {
    return FALLBACK_ACTIVITIES[normalizedRegion];
  }

  for (const key of Object.keys(FALLBACK_ACTIVITIES)) {
    if (normalizedRegion.includes(key)) {
      return FALLBACK_ACTIVITIES[key];
    }
  }

  return FALLBACK_ACTIVITIES.default;
}

export async function getEcoActivities(location: string): Promise<EcoActivity[]> {
  const activities = getActivitiesByRegion(location);
  return activities;
}

export async function getEcoActivitySuggestion(location: string): Promise<EcoActivity | null> {
  const activities = await getEcoActivities(location);

  if (activities.length === 0) {
    return FALLBACK_ACTIVITIES.default[0];
  }

  const randomIndex = Math.floor(Math.random() * activities.length);
  return activities[randomIndex];
}

export function formatEcoActivityDisplay(activity: EcoActivity): string {
  return `${activity.name} - ${activity.description} (Impact: ${activity.impact})`;
}