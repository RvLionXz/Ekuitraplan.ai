// Carbon Service - Hitung emisi karbon dari transportasi
// Menggunakan emissions.dev API
// DOCS: https://emissions.dev/docs/api/travel/calculate
// 
// NOTE: Dengan Maps Grounding enabled di route.ts,
// Gemini akan menggunakan Maps untuk distances secara otomatis.
// File ini berfungsi sebagai tambahan untuk emissions.dev API calls.

const EMISSIONS_API_KEY = process.env.EMISSIONS_API_KEY;
const EMISSIONS_API_URL = "https://api.emissions.dev/v1";

interface EmissionsResponse {
  co2e: number;
  co2e_unit: string;
  co2e_grams: number;
  per_passenger_kg: number;
  per_passenger_g: number;
}

// Country code mapping (ISO 3166-1 alpha-2)
const COUNTRY_CODES: Record<string, string> = {
  // Indonesia cities
  indonesia: "ID",
  jakarta: "ID",
  bali: "ID",
  bandung: "ID",
  surabaya: "ID",
  yogyakarta: "ID",
  jogja: "ID",
  lombok: "ID",
  medan: "ID",
  makassar: "ID",
  semarang: "ID",
  denpasar: "ID",
  aceh: "ID",
  // International
  singapore: "SG",
  malaysia: "MY",
  kuala_lumpur: "MY",
  thailand: "TH",
  bangkok: "TH",
  vietnam: "VN",
  hanoi: "VN",
  ho_chi_minh: "VN",
  philippines: "PH",
  manila: "PH",
  australia: "AU",
  sydney: "AU",
  melbourne: "AU",
  japan: "JP",
  tokyo: "JP",
  osaka: "JP",
  korea: "KR",
  seoul: "KR",
  china: "CN",
  hongkong: "HK",
  taiwan: "TW",
  india: "IN",
  usa: "US",
  united_states: "US",
  uk: "GB",
  united_kingdom: "GB",
  london: "GB",
  germany: "DE",
  france: "FR",
  paris: "FR",
  italy: "IT",
  netherlands: "NL",
  amsterdam: "NL",
  spain: "ES",
  barcelona: "ES",
  dubai: "AE",
  uae: "AE",
};

function getCountryCode(city: string): string {
  const normalized = city.toLowerCase().trim();
  return COUNTRY_CODES[normalized] || "ID"; // Default to Indonesia
}

/**
 * Hitung emisi karbon dari flight menggunakan emissions.dev API
 * @param from - Kota asal
 * @param to - Kota tujuan
 * @param passengers - Jumlah penumpang
 * @param isRoundTrip - Apakah round trip (handled separately)
 */
export async function calculateFlightCarbonEmissions(
  from: string,
  to: string,
  passengers: number = 1,
  isRoundTrip: boolean = false
): Promise<{
  carbon_kg: number;
  distance_km: number;
  per_passenger_kg: number;
} | null> {
  if (!EMISSIONS_API_KEY) {
    console.warn("EMISSIONS_API_KEY not configured");
    return null;
  }

  try {
    const originCountry = getCountryCode(from);
    const destCountry = getCountryCode(to);

    // Build query params
    const params = new URLSearchParams({
      origin_country: originCountry,
      origin_location: from,
      destination_country: destCountry,
      destination_location: to,
      transport_mode: "flight",
      cabin_class: "economy",
      passengers: passengers.toString(),
      return_trip: isRoundTrip.toString()
    });

    const url = `${EMISSIONS_API_URL}/travel/emissions?${params}`;
    console.log("Emissions.dev request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${EMISSIONS_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Emissions.dev HTTP error:", response.status, responseText);
      return null;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Emissions.dev JSON parse error:", responseText);
      return null;
    }

    console.log("Emissions.dev response:", JSON.stringify(data, null, 2));

    // Parse response - emissions.dev format
    const attrs = data?.data?.attributes;
    if (!attrs) {
      console.error("Emissions.dev unexpected response:", data);
      return null;
    }

    const emissions = attrs.emissions || {};
    const route = attrs.route || {};
    
    // Check for invalid data - emissions.dev failed to resolve location correctly
    const resolvedOrigin = route?.origin?.resolved || "";
    const resolvedDest = route?.destination?.resolved || "";
    const distance = route.total_distance_km || 0;
    
    // Invalid if: 0 distance OR origin resolved to Jakarta (wrong location)
    const isInvalid = distance === 0 || 
      (resolvedOrigin && !resolvedOrigin.includes(from) && !resolvedOrigin.includes("Aceh")) ||
      (resolvedDest && !resolvedDest.includes(to.replace(", Indonesia", "").split(",")[0]) && !resolvedDest.includes("Aceh"));
    
    if (isInvalid) {
      console.log("[carbon] Invalid emissions.dev data, will use fallback");
      return {
        carbon_kg: 0,
        distance_km: 0,
        per_passenger_kg: 0
      };
    }

    return {
      carbon_kg: emissions.co2e || 0,
      distance_km: route.total_distance_km || 0,
      per_passenger_kg: emissions.per_passenger_kg || 0
    };
  } catch (error) {
    console.error("Emissions calculation error:", error);
    return null;
  }
}

/**
 * Hitung round trip carbon emissions (outbound + return)
 */
export async function calculateRoundTripCarbonEmissions(
  from: string,
  to: string,
  passengers: number = 1
): Promise<{
  outbound: { carbon_kg: number; distance_km: number; per_passenger_kg: number } | null;
  return_: { carbon_kg: number; distance_km: number; per_passenger_kg: number } | null;
  total_kg: number;
  distance_km: number;
  per_passenger_kg: number;
  with_buffer: number;
}> {
  const [outbound, return_] = await Promise.all([
    calculateFlightCarbonEmissions(from, to, passengers, false),
    calculateFlightCarbonEmissions(to, from, passengers, false)
  ]);

  const totalCarbon = (outbound?.carbon_kg || 0) + (return_?.carbon_kg || 0);
  const totalDistance = (outbound?.distance_km || 0) + (return_?.distance_km || 0);
  const perPassenger = (outbound?.per_passenger_kg || 0) + (return_?.per_passenger_kg || 0);
  const buffer = totalCarbon * 0.1; // 10% regeneration buffer

  return {
    outbound,
    return_,
    total_kg: Math.round(totalCarbon),
    distance_km: Math.round(totalDistance),
    per_passenger_kg: Math.round(perPassenger * 10) / 10,
    with_buffer: Math.round((totalCarbon + buffer) * 10) / 10
  };
}

/**
 * Format carbon result untuk display (alias for backward compatibility)
 */
export function formatCarbonDisplay(carbonKg: number): string {
  if (carbonKg < 1) {
    return `${Math.round(carbonKg * 1000)} gram CO2`;
  }
  if (carbonKg < 1000) {
    return `${Math.round(carbonKg)} kg CO2`;
  }
  return `${(carbonKg / 1000).toFixed(1)} ton CO2`;
}

// Transport mode emoji mapping
export const TRANSPORT_ICONS: Record<string, string> = {
  rail: "🚇",
  bus: "🚌",
  car: "🚗",
  taxi: "🚕",
  walk: "🚶",
  ferry: "⛴️",
  flight: "✈️"
};

/**
 * Map various transport mode strings (including Indonesian) to valid API modes
 */
function mapTransportMode(mode: string): 'flight' | 'rail' | 'car' | 'bus' | 'ferry' | 'taxi' | 'walk' | 'ojek'{
  const m = mode.toLowerCase().trim();
  
  // Walking
  if (m.includes('jalan') || m.includes('walk') || m.includes('kaki')) return 'walk';
  
  // Rail/Public Transport
  if (
    m.includes('mrt') || 
    m.includes('lrt') || 
    m.includes('kereta') || 
    m.includes('rail') || 
    m.includes('train') || 
    m.includes('krl') ||
    m.includes('commuter')
  ) return 'rail';
  
  // Bus
  if (m.includes('bus') || m.includes('transjakarta') || m.includes('angkot')) return 'bus';
  
  // Taxi/Ride-sharing
  if (m.includes('taksi') || m.includes('taxi') || m.includes('grab') || m.includes('gojek') || m.includes('ojek')) return 'taxi';
  
  // Car
  if (m.includes('mobil') || m.includes('car') || m.includes('pribadi')) return 'car';
  
  // Ferry
  if (m.includes('kapal') || m.includes('ferry') || m.includes('laut')) return 'ferry';
  
  // Flight
  if (m.includes('pesawat') || m.includes('flight') || m.includes('udara')) return 'flight';

  return 'car'; // Fallback
}

// =============== DEFAULT EMISSION FACTORS FOR LOCAL TRANSPORT =================

// kg CO2 per passenger-km (approximate values for Indonesia)
// Based on typical vehicle emission factors
// Updated: comprehensive mapping for all transport types
const LOCAL_EMISSION_FACTORS: Record<string, number> = {
  // Two-wheelers
  ojek: 0.20,          // Motorbike (ojek) - high emissions
  ojet: 0.20,          // ojet variant
  motor: 0.20,         // motorcycle
  'sepeda motor': 0.20,  // motorbike
  
  // Cars
  taxi: 0.15,           // Taxi/ride-share
  taksi: 0.15,          // Taxi
  car: 0.15,           // Private car
  mobil: 0.15,         // Car
  'sewa mobil': 0.12,    // Rental car (more efficient)
  'self drive': 0.12,   // Self-drive
  'private drive': 0.15,
  
  // Walking
  walk: 0,               // Walking - zero emissions
  'jalan kaki': 0,        // Jalan kaki
  'berjalan kaki': 0,
  
  // Water transport
  ferry: 0.08,         // Ferry
  ferri: 0.08,
  kapal: 0.10,          // Ship/boat
  perahu: 0.10,         // Traditional boat
  'perahu kecil': 0.10, // Small boat
  boat: 0.10,
  
  // Flight (long-haul - handled separately)
  flight: 0.20,         // Flight (long distance)
  pesawat: 0.20,
  udara: 0.20,
  
  // Bus
  bus: 0.10,
  umum: 0.10,
};

/**
 * Parse transport string - handle combos like "Sewa mobil/jalan kaki"
 * Returns the most eco-friendly option (lowest emission)
 */
function parseTransportMode(transport: string): string {
  if (!transport) return 'car';
  
  const t = transport.toLowerCase().trim();
  
  // Handle combo strings - take first or most eco-friendly
  const parts = t.split(/[\/]/).map(p => p.trim());
  
  // Priority: walk > ferry > bus > boat > ojek > taxi > car > flight
  for (const part of parts) {
    if (part.includes('jalan') || part.includes('walk')) return 'walk';
    if (part.includes('ferry') || part.includes('kapal') || part.includes('perahu')) return 'boat';
    if (part.includes('bus') || part.includes('umum')) return 'bus';
    if (part.includes('ojek') || part.includes('motor')) return 'ojek';
    if (part.includes('taxi') || part.includes('taksi')) return 'taxi';
    if (part.includes('mobil') || part.includes('car') || part.includes('sewa')) return 'car';
    if (part.includes('flight') || part.includes('pesawat')) return 'flight';
  }
  
  // Default: return first part
  return parts[0] || 'car';
}

// Default distance estimates per activity type (km)
const LOCAL_DISTANCE_ESTIMATES: Record<string, number> = {
  // Short local trips
  'check-in': 5,
  'checkin': 5,
  ' snorkeling': 3,
  'snorkeling': 3,
  'diving': 5,
  'sunset': 5,
  'pantai': 3,
  'beach': 3,
  'museum': 2,
  'tugu': 3,
  // Medium trips
  'trekking': 8,
  'hutan': 10,
  'air terjun': 8,
  'waterfall': 8,
  // Long trips (unlikely for local)
  'default': 5
};

/**
 * Estimate local emissions for in-destination travel
 * Uses default factors instead of API calls (faster, no external dependencies)
 */
export function estimateLocalEmissions(
  transport: string,
  activityLocation?: string,
  activityName?: string
): {
  actual_carbon_kg: number;
  taxi_carbon_kg: number;
  saved_carbon_kg: number;
  distance_km: number;
  actual_mode: string;
  message: string;
} {
  // Use new parseTransportMode to handle combos
  const mode = parseTransportMode(transport);
  
  // Determine distance based on activity
  let distanceKm = 5; // default
  const activityLower = (activityName || activityLocation || '').toLowerCase();
  
  // Check for long-distance travel (flights)
  const isFlight = mode === 'flight' || 
    (transport?.toLowerCase().includes('flight') || transport?.toLowerCase().includes('pesawat'));
  
  if (isFlight && activityLower.includes('penerbangan')) {
    // Long-haul flight - use actual distance from carbon_data or estimate
    distanceKm = 150; // Assume ~150km for short domestic flight
  }
  
  for (const [key, dist] of Object.entries(LOCAL_DISTANCE_ESTIMATES)) {
    if (activityLower.includes(key)) {
      distanceKm = dist;
      break;
    }
  }
  
  // Get emission factor
  const factor = LOCAL_EMISSION_FACTORS[mode] ?? 0.15;
  const actualEmissions = Number((distanceKm * factor).toFixed(2));
  const taxiEmissions = Number((distanceKm * 0.15).toFixed(2)); // taxi baseline
  
  // Calculate savings (if actual is better than taxi)
  const saved = actualEmissions < taxiEmissions 
    ? Number((taxiEmissions - actualEmissions).toFixed(2))
    : 0;
  
  // Generate message
  let message = '';
  if (mode === 'walk') {
    message = 'Jalan kaki - nol emisi! 🌿';
  } else if (isFlight) {
    message = 'Penerbangan jarak jauh - pertimbangkan carbon offset! ✈️';
  } else if (saved > 0.5) {
    message = `Kamu menghemat ${saved}kg CO₂ dengan pilihan ini! 🌿`;
  } else if (mode === 'ojek' || mode === 'taxi') {
    message = 'Opsi transportasi lokal yang umum 👍';
  } else {
    message = 'Pilihan yang schon! ✨';
  }
  
  return {
    actual_carbon_kg: actualEmissions,
    taxi_carbon_kg: taxiEmissions,
    saved_carbon_kg: saved,
    distance_km: distanceKm,
    actual_mode: mode,
    message
  };
}

/**
 * Calculate eco comparison - compare actual transport vs taxi
 * Returns CO2 saved by choosing eco-friendly transport
 */
export async function calculateEcoComparison(
  from: string,
  to: string,
  actualMode: string,
  passengers: number = 1
): Promise<{
  actual_carbon_kg: number;
  taxi_carbon_kg: number;
  saved_carbon_kg: number;
  distance_km: number;
  actual_mode: string;
  message: string;
} | null> {
  if (!EMISSIONS_API_KEY) {
    console.warn("EMISSIONS_API_KEY not configured");
    return null;
  }

  // Normalize transport mode
  const mode = mapTransportMode(actualMode);
  
  try {
    const originCountry = getCountryCode(from);
    const destCountry = getCountryCode(to);

    // If it's walking, we only need to calculate the baseline (taxi)
    const taxiParams = new URLSearchParams({
      origin_country: originCountry,
      origin_location: from,
      destination_country: destCountry,
      destination_location: to,
      transport_mode: 'taxi',
      passengers: passengers.toString(),
      return_trip: 'false'
    });

    if (mode === 'walk') {
      const taxiRes = await fetch(`${EMISSIONS_API_URL}/travel/emissions?${taxiParams}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${EMISSIONS_API_KEY}` }
      });

      if (!taxiRes.ok) return null;
      const taxiData = await taxiRes.json();
      const taxiEmissions = taxiData?.data?.attributes?.emissions?.co2e || 0;
      const distance = taxiData?.data?.attributes?.route?.total_distance_km || 0;

      return {
        actual_carbon_kg: 0,
        taxi_carbon_kg: taxiEmissions,
        saved_carbon_kg: Math.round(taxiEmissions * 10) / 10,
        distance_km: distance,
        actual_mode: 'walk',
        message: taxiEmissions > 0 
          ? `Jalan kaki menyelamatkan ${Math.round(taxiEmissions * 10) / 10}kg CO₂ dibanding taksi! 🌿` 
          : 'Pilihan yang sangat ramah lingkungan! ✨'
      };
    }

    // For other modes, calculate both
    const actualParams = new URLSearchParams({
      origin_country: originCountry,
      origin_location: from,
      destination_country: destCountry,
      destination_location: to,
      transport_mode: mode === 'flight' ? 'flight' : mode, // Ensure valid API mode
      passengers: passengers.toString(),
      return_trip: 'false'
    });

    // Make both requests in parallel
    const [actualRes, taxiRes] = await Promise.all([
      fetch(`${EMISSIONS_API_URL}/travel/emissions?${actualParams}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${EMISSIONS_API_KEY}` }
      }),
      fetch(`${EMISSIONS_API_URL}/travel/emissions?${taxiParams}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${EMISSIONS_API_KEY}` }
      })
    ]);

    if (!actualRes.ok || !taxiRes.ok) {
      console.error('Eco comparison API error:', actualRes.status, taxiRes.status);
      return null;
    }

    const actualData = await actualRes.json();
    const taxiData = await taxiRes.json();

    const actualEmissions = actualData?.data?.attributes?.emissions?.co2e || 0;
    const taxiEmissions = taxiData?.data?.attributes?.emissions?.co2e || 0;
    const distance = actualData?.data?.attributes?.route?.total_distance_km || 0;

    // Calculate savings
    const saved = Math.max(0, taxiEmissions - actualEmissions);
    
    // Generate message based on mode and savings
    let message = '';
    if (mode === 'rail' || mode === 'bus') {
      message = saved > 0.1 
        ? `Naik transportasi umum hemat ${saved.toFixed(1)}kg CO₂! 🚌`
        : 'Transportasi umum pilihan cerdas & hijau! ✨';
    } else if (saved > 0.1) {
      message = `Kamu menghemat ${saved.toFixed(1)}kg CO₂ dengan pilihan ini! 🌿`;
    } else {
      message = 'Pilihan transportasi Anda sudah baik! ✨';
    }

    console.log('Eco comparison result:', { mode, actualEmissions, taxiEmissions, saved, distance });

    return {
      actual_carbon_kg: actualEmissions,
      taxi_carbon_kg: taxiEmissions,
      saved_carbon_kg: Math.round(saved * 10) / 10,
      distance_km: distance,
      actual_mode: mode,
      message
    };
  } catch (error) {
    console.error('Eco comparison error:', error);
    return null;
  }
}

// ============ TRANSPORT RECOMMENDATION LOGIC ============

interface TransportRecommendation {
  recommended: string;
  emoji: string;
  reason: string;
  alternative?: string;
}

export const getRecommendedTransport = (distanceKm: number): TransportRecommendation => {
  // Distance-based transport recommendation
  
  if (distanceKm <= 1) {
    return {
      recommended: 'jalan kaki',
      emoji: '🚶',
      reason: 'Dalam radius 1km, jalan kaki adalah pilihan terbaik!',
      alternative: 'sepeda'
    };
  } else if (distanceKm <= 3) {
    return {
      recommended: 'sepeda',
      emoji: '🚲',
      reason: 'Dalam 3km, bersepeda lebih sehat & ramah lingkungan.',
      alternative: 'ojek online'
    };
  } else if (distanceKm <= 10) {
    return {
      recommended: 'ojek online / scooter',
      emoji: '🏍',
      reason: 'Untuk jarak 3-10km, ojek online lebih efisien.',
      alternative: 'sewa sepeda motor'
    };
  } else if (distanceKm <= 50) {
    return {
      recommended: 'sewa mobil / driver',
      emoji: '🚗',
      reason: 'Untuk jarak sedang, sewa mobil dengandriver lebih nyaman.',
      alternative: 'travel berbagi'
    };
  } else if (distanceKm <= 150) {
    return {
      recommended: 'travel antar jemput',
      emoji: '🚐',
      reason: 'Untuk jarak 50-150km, travel antar jemput lebih hemat.',
      alternative: 'sewa mobil'
    };
  } else {
    return {
      recommended: 'flight',
      emoji: '✈️',
      reason: 'Untuk jarak jauh antar pulau, flight lebih cepat.',
      alternative: 'ferry'
    };
  }
};

// Validate if AI's transport choice makes sense for the given distance
export const validateTransportChoice = (choice: string, distanceKm: number): { valid: boolean; reason?: string; suggestion?: string } => {
  const choiceLower = choice.toLowerCase();
  
  // Invalid choices that don't match distance
  if (choiceLower.includes('jalan kaki') || choiceLower.includes('walk')) {
    if (distanceKm > 3) {
      const rec = getRecommendedTransport(distanceKm);
      return {
        valid: false,
        reason: `Jalan kaki ${distanceKm}km tidak masuk akal.`,
        suggestion: `${rec.recommended} (${rec.emoji})`
      };
    }
  }
  
  if (choiceLower.includes('taksi') || choiceLower.includes('taxi')) {
    if (distanceKm > 100) {
      const rec = getRecommendedTransport(distanceKm);
      return {
        valid: false,
        reason: `Taksi jarak ${distanceKm}km terlalu mahal.`,
        suggestion: `${rec.recommended} (${rec.emoji})`
      };
    }
  }
  
  if (choiceLower.includes('car') && !choiceLower.includes('sewa')) {
    // AI used "car" but meant something else - check if reasonable
    if (distanceKm < 5 || distanceKm > 80) {
      const rec = getRecommendedTransport(distanceKm);
      return {
        valid: false,
        reason: `Pilihan transport tidak sesuai jarak ${distanceKm}km.`,
        suggestion: `${rec.recommended} (${rec.emoji})`
      };
    }
  }
  
  return { valid: true };
}

// ============ FALLBACK DISTANCE ESTIMATION ============
// Used when Maps Grounding doesn't return distance

interface DestinationPair {
  from: string;
  to: string;
  estimatedKm: number;
}

// Rough distance estimates for common routes (fallback)
const FALLBACK_DISTANCES: DestinationPair[] = [
  { from: 'kuta', to: 'ubud', estimatedKm: 30 },
  { from: 'kuta', to: 'uluwatu', estimatedKm: 25 },
  { from: 'kuta', to: 'seminyak', estimatedKm: 8 },
  { from: 'kuta', to: 'canggu', estimatedKm: 15 },
  { from: 'kuta', to: 'sanur', estimatedKm: 20 },
  { from: 'kuta', to: 'nusa dua', estimatedKm: 15 },
  { from: 'ubud', to: 'tegallalang', estimatedKm: 8 },
  { from: 'ubud', to: 'prambanan', estimatedKm: 35 },
  { from: 'ubud', to: 'borobudur', estimatedKm: 45 },
  { from: 'denpasar', to: 'badung', estimatedKm: 10 },
  { from: 'jakarta', to: 'bandung', estimatedKm: 150 },
  { from: 'jakarta', to: 'bogor', estimatedKm: 60 },
  { from: 'jakarta', to: 'bali', estimatedKm: 2500 }, // flight
  { from: 'surabaya', to: 'malang', estimatedKm: 90 },
];

/**
 * Fallback distance estimation - used when Maps Grounding fails
 * This is a ROUGH estimate only!
 */
export function getEstimatedDistance(from: string, to: string): number | null {
  const fromNorm = from.toLowerCase();
  const toNorm = to.toLowerCase();
  
  // Direct match
  for (const pair of FALLBACK_DISTANCES) {
    if ((fromNorm.includes(pair.from) || pair.from.includes(fromNorm)) &&
        (toNorm.includes(pair.to) || pair.to.includes(toNorm))) {
      console.warn(`[carbon] Using fallback distance ${pair.estimatedKm}km for ${from} → ${to}`);
      return pair.estimatedKm;
    }
  }
  
  // Check reverse
  for (const pair of FALLBACK_DISTANCES) {
    if ((fromNorm.includes(pair.to) || pair.to.includes(fromNorm)) &&
        (toNorm.includes(pair.from) || pair.from.includes(toNorm))) {
      console.warn(`[carbon] Using fallback distance ${pair.estimatedKm}km for ${from} → ${to} (reverse)`);
      return pair.estimatedKm;
    }
  }
  
  // Default - return null so caller can handle
  console.warn(`[carbon] No fallback distance for ${from} → ${to}`);
  return null;
}