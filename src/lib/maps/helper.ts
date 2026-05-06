const DESTINATION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  bali: { latitude: -8.4095, longitude: 115.1889 },
  denpasar: { latitude: -8.6705, longitude: 115.2126 },
  ubud: { latitude: -8.5069, longitude: 115.2625 },
  kuta: { latitude: -8.7180, longitude: 115.1686 },
  seminyak: { latitude: -8.6914, longitude: 115.1628 },
  canggu: { latitude: -8.6478, longitude: 115.1384 },
  nusa_dua: { latitude: -8.8131, longitude: 115.2303 },
  uluwatu: { latitude: -8.8158, longitude: 115.0922 },
  sanur: { latitude: -8.6914, longitude: 115.2615 },
  legian: { latitude: -8.7046, longitude: 115.1618 },
  jimbaran: { latitude: -8.7683, longitude: 115.1573 },
  kedungu: { latitude: -8.6528, longitude: 115.1315 },
  amed: { latitude: -8.3362, longitude: 115.6283 },
  tulamben: { latitude: -8.2773, longitude: 115.5935 },
  lovina: { latitude: -8.1581, longitude: 115.0424 },
  sidemen: { latitude: -8.4247, longitude: 115.5512 },
  jatiluwih: { latitude: -8.3582, longitude: 115.1098 },

  yogyakarta: { latitude: -7.7956, longitude: 110.3695 },
  jogja: { latitude: -7.7956, longitude: 110.3695 },
  jogjakarta: { latitude: -7.7956, longitude: 110.3695 },
  borobudur: { latitude: -7.6075, longitude: 110.2037 },
  prambanan: { latitude: -7.7219, longitude: 110.4927 },
  malioboro: { latitude: -7.7907, longitude: 110.3602 },

  jakarta: { latitude: -6.2088, longitude: 106.8456 },
  bandung: { latitude: -6.9175, longitude: 107.6191 },
  bogor: { latitude: -6.5952, longitude: 106.8163 },
  depok: { latitude: -6.4025, longitude: 106.7942 },

  surabaya: { latitude: -7.2575, longitude: 112.7521 },
  malang: { latitude: -7.9785, longitude: 112.6306 },
  bromo: { latitude: -7.9425, longitude: 112.9530 },

  medan: { latitude: 3.5889, longitude: 98.6736 },
  lake_toba: { latitude: 2.3527, longitude: 99.0238 },
  parpat: { latitude: 2.5435, longitude: 98.9365 },

  aceh: { latitude: 4.3699, longitude: 97.068 },
  banda_aceh: { latitude: 5.5483, longitude: 95.3192 },
  lhokseumawe: { latitude: 5.1939, longitude: 97.4253 },

  lombok: { latitude: -8.5885, longitude: 116.1154 },
  raja_ampat: { latitude: -0.5966, longitude: 130.8103 },
  komodo: { latitude: -8.5858, longitude: 119.7561 },
  labuan_bajo: { latitude: -8.5037, longitude: 119.8923 },
  belitung: { latitude: -2.8833, longitude: 107.8844 },
  banjarmasin: { latitude: -3.3191, longitude: 114.5909 },
  makassar: { latitude: -5.1437, longitude: 119.4121 },
  manado: { latitude: 1.4744, longitude: 124.842 },
  bunaken: { latitude: 1.6228, longitude: 124.4104 },
  pontianak: { latitude: -0.0263, longitude: 109.3153 },
  palembang: { latitude: -2.991, longitude: 104.7658 },
  jambi: { latitude: -1.6102, longitude: 103.6136 },
  padang: { latitude: -0.9481, longitude: 100.3618 },
  bukittinggi: { latitude: -0.3051, longitude: 100.3699 },
  padang_panjang: { latitude: -0.4582, longitude: 100.4799 },

  singapore: { latitude: 1.3521, longitude: 103.8198 },
  bangkok: { latitude: 13.7563, longitude: 100.5018 },
  kuala_lumpur: { latitude: 3.139, longitude: 101.6869 },
  tokio: { latitude: 35.6762, longitude: 139.6503 },
  sydney: { latitude: -33.8688, longitude: 151.2093 },
  melbourne: { latitude: -37.8136, longitude: 144.9631 },
  bali_indonesia: { latitude: -8.4095, longitude: 115.1889 },
};

export function getCoordinates(destination: string): { latitude: number; longitude: number } | null {
  if (!destination) return null;

  const normalized = destination.toLowerCase().trim();

  if (DESTINATION_COORDINATES[normalized]) {
    return DESTINATION_COORDINATES[normalized];
  }

  for (const key of Object.keys(DESTINATION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return DESTINATION_COORDINATES[key];
    }
  }

  console.log(`[maps-helper] Coordinates not found for "${destination}", will try Nominatim`);
  return null;
}

export function parseLocationFromText(text: string): string {
  const normalized = text.toLowerCase();

  const patterns = [
    "ke bali",
    "di bali",
    "bali",
    "ke jogja",
    "di jogja",
    "jogja",
    "ke yogyakarta",
    "di yogyakarta",
    "ke jakarta",
    "di jakarta",
    "jakarta",
    "ke bandung",
    "di bandung",
    "bandung",
    "ke surabaya",
    "di surabaya",
    "surabaya",
    "ke lombok",
    "di lombok",
    "lombok",
    "ke aceh",
    "di aceh",
  ];

  for (const pattern of patterns) {
    if (normalized.includes(pattern)) {
      return pattern.replace(/ke |di /g, "").trim();
    }
  }

  return "bali";
}

export function generatePlacesQuery(
  destination: string,
  type: "hotel" | "restaurant" | "attraction" | "activity",
  additionalContext?: string
): string {
  const baseQuery = {
    hotel: `eco-friendly hotels in ${destination} with high ratings`,
    restaurant: `local restaurants in ${destination} with good reviews`,
    attraction: `popular tourist attractions in ${destination}`,
    activity: `eco-friendly activities and conservation programs in ${destination}`,
  };

  const query = baseQuery[type];
  return additionalContext ? `${query}, ${additionalContext}` : query;
}

export function generateDistanceQuery(from: string, to: string): string {
  return `distance from ${from} to ${to} in kilometers`;
}

export function isValidLocation(destination: string): boolean {
  const coords = getCoordinates(destination);
  return coords !== null;
}

export interface MapsDebugInfo {
  query: string;
  destination: string;
  coordinates: { latitude: number; longitude: number } | null;
  fallbackUsed: boolean;
}

export function createDebugInfo(
  query: string,
  destination: string
): MapsDebugInfo {
  const coordinates = getCoordinates(destination);
  return {
    query,
    destination,
    coordinates,
    fallbackUsed: coordinates === DESTINATION_COORDINATES[destination.toLowerCase()],
  };
}

export function extractDurationFromText(text: string): number | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  const hariMatch = lowerText.match(/(\d+)\s*(?:hari|day|days)/);
  if (hariMatch) {
    const days = parseInt(hariMatch[1], 10);
    if (days > 0 && days <= 365) return days;
  }

  const mingguMatch = lowerText.match(/(\d+)\s*(?:minggu|week|weeks)/);
  if (mingguMatch) {
    const weeks = parseInt(mingguMatch[1], 10);
    const days = weeks * 7;
    if (days > 0 && days <= 365) return days;
  }

  const bulanMatch = lowerText.match(/(\d+)\s*(?:bulan|month|months)/);
  if (bulanMatch) {
    const months = parseInt(bulanMatch[1], 10);
    const days = months * 30;
    if (days > 0 && days <= 365) return days;
  }

  return null;
}

interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeId?: string;
  };
}

interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: Array<{
    segment?: { startIndex?: number; endIndex?: number };
    groundingChunkIndices?: number[];
  }>;
  googleMapsWidgetContextToken?: string;
}

interface ToolResultPart {
  toolResult?: {
    functionResponse?: {
      name?: string;
      response?: {
        result?: any;
      };
    };
    id?: string;
  };
}

export function extractMapsDistance(
  toolResultPart: ToolResultPart | undefined,
  groundingMetadata: GroundingMetadata | undefined
): number | null {
  if (toolResultPart?.toolResult?.functionResponse?.response?.result) {
    const result = toolResultPart.toolResult.functionResponse.response.result;

    if (result.distance_km || result.distance) {
      console.log("[maps] Distance extracted from toolResult:", result.distance_km || result.distance);
      return result.distance_km || result.distance;
    }

    if (result.routes?.length > 0) {
      const distance = result.routes[0]?.distance?.value || result.routes[0]?.distance?.text;
      if (distance) {
        console.log("[maps] Distance extracted from routes:", distance);
        return typeof distance === "string" ? parseFloat(distance) : distance;
      }
    }
  }

  if (groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
    console.log("[maps] Places from grounding:", groundingMetadata.groundingChunks.map((c) => c.maps?.title));
  }

  return null;
}

export function extractMapsPlaces(
  groundingMetadata: GroundingMetadata | undefined
): Array<{ title: string; placeId: string; uri: string }> {
  if (!groundingMetadata?.groundingChunks) return [];

  return groundingMetadata.groundingChunks
    .filter((chunk) => chunk.maps)
    .map((chunk) => ({
      title: chunk.maps?.title || "",
      placeId: chunk.maps?.placeId || "",
      uri: chunk.maps?.uri || ""
    }));
}

export interface PlaceWithCoordinates {
  title: string;
  placeId: string;
  uri: string;
  latitude: number | null;
  longitude: number | null;
}

function extractCoordinatesFromUri(uri: string): { latitude: number | null; longitude: number | null } {
  if (!uri) return { latitude: null, longitude: null };

  try {
    const placeMatch = uri.match(/\/place\/(-?[\d.]+),(-?[\d.]+)\//);
    if (placeMatch) {
      return {
        latitude: parseFloat(placeMatch[1]),
        longitude: parseFloat(placeMatch[2])
      };
    }

    const atMatch = uri.match(/@(-?[\d.]+),(-?[\d.]+),/);
    if (atMatch) {
      return {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2])
      };
    }

    const queryMatch = uri.match(/[?&]q=(-?[\d.]+),(-?[\d.]+)/);
    if (queryMatch) {
      return {
        latitude: parseFloat(queryMatch[1]),
        longitude: parseFloat(queryMatch[2])
      };
    }
  } catch (error) {
    console.warn("[maps-helper] Failed to extract coordinates from URI:", uri);
  }

  return { latitude: null, longitude: null };
}

export function extractPlacesWithCoordinates(
  groundingMetadata: GroundingMetadata | undefined
): PlaceWithCoordinates[] {
  if (!groundingMetadata?.groundingChunks) return [];

  return groundingMetadata.groundingChunks
    .filter((chunk) => chunk.maps)
    .map((chunk) => {
      const uri = chunk.maps?.uri || "";
      const coords = extractCoordinatesFromUri(uri);

      return {
        title: chunk.maps?.title || "",
        placeId: chunk.maps?.placeId || "",
        uri: uri,
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    })
    .filter((place) => place.title);
}