export interface TripMetadata {
  title: string;
  region: string;
  from_location: string;
  duration_days: number;
  total_eco_score: number;
}

export interface Activity {
  time: string;
  activity: string;
  location: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  transport: string;
  eco_impact?: string;
  description?: string;
}

export interface DayItinerary {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface CarbonData {
  total_emissions_kg: number;
  emissions_with_buffer_kg: number;
  total_saved_kg?: number;
  transport_type: string;
  distance_km: number;
}

export interface EcoActivity {
  name: string;
  type: string;
  location: string;
  description: string;
  impact: string;
}

export interface RecommendedActivity {
  name: string;
  location: string;
  description: string;
  eco_score: number;
}

export interface EcoComparison {
  activity: string;
  transport: string;
  day: number;
  actual_carbon_kg: number;
  taxi_carbon_kg: number;
  saved_carbon_kg: number;
  distance_km: number;
  actual_mode: string;
  message: string;
}

export interface ItineraryData {
  trip_metadata: TripMetadata;
  itinerary: DayItinerary[];
  recommended_activities: RecommendedActivity[];
}

export interface DiscoveryData {
  hotels?: Hotel[];
  flights?: Flight[];
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviews_count: number;
  price: string;
  eco_badge: string;
  description: string;
  reviews: string[];
  image: string;
}

export interface Flight {
  airline: string;
  from: string;
  to: string;
  price: string;
  carbon: string;
}