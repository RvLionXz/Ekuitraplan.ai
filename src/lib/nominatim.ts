// Nominatim Geocoding Client
// Free geocoding API from OpenStreetMap
// Documentation: https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

// Rate limiting: max 1 request per second (Nominatim policy)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second in ms

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  placeId: string;
  type: string;
}

/**
 * Apply rate limiting before making request
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

/**
 * Geocode a place name to coordinates using Nominatim
 * @param query - Place name to search (e.g., "Tegalalang Rice Terrace, Ubud, Bali")
 * @returns GeocodeResult with latitude, longitude, or null if not found
 */
export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  if (!query || query.trim().length < 3) {
    return null;
  }
  
  try {
    await applyRateLimit();
    
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      addressdetails: "0",
      accept_language: "en"
    });
    
    const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "EkuitraPlan/1.0 (Travel Planner; https://ekuitraplan.ai)",
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      console.warn(`[nominatim] HTTP error: ${response.status}`);
      return null;
    }
    
    const results: NominatimResult[] = await response.json();
    
    if (!results || results.length === 0) {
      console.log(`[nominatim] No results for: ${query}`);
      return null;
    }
    
    const result = results[0];
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      placeId: String(result.place_id),
      type: result.type
    };
  } catch (error) {
    console.error("[nominatim] Geocoding error:", error);
    return null;
  }
}

/**
 * Geocode multiple places with rate limiting
 * @param queries - Array of place names
 * @returns Map of place name to GeocodeResult
 */
export async function geocodePlaces(
  queries: string[]
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  
  for (const query of queries) {
    // Skip empty queries
    if (!query || query.trim().length < 3) {
      continue;
    }
    
    const result = await geocodePlace(query);
    if (result) {
      results.set(query.toLowerCase(), result);
    }
    
    // Rate limiting is already applied in geocodePlace
  }
  
  return results;
}

/**
 * Reverse geocode coordinates to address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Display name of the location
 */
export async function reverseGeocode(
  latitude: number, 
  longitude: number
): Promise<string | null> {
  try {
    await applyRateLimit();
    
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      zoom: "18", // Address level
      addressdetails: "0"
    });
    
    const url = `${NOMINATIM_REVERSE_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "EkuitraPlan/1.0 (Travel Planner; https://ekuitraplan.ai)",
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.display_name || null;
  } catch (error) {
    console.error("[nominatim] Reverse geocoding error:", error);
    return null;
  }
}