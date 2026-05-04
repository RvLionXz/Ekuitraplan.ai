// Carbon Service - Hitung emisi karbon dari transportasi
// Menggunakan emissions.dev API
// Docs: https://emissions.dev/docs/api/travel/calculate

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
function mapTransportMode(mode: string): 'flight' | 'rail' | 'car' | 'bus' | 'ferry' | 'taxi' | 'walk' {
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