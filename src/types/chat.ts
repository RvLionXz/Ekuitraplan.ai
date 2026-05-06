import type { ItineraryData, CarbonData, EcoActivity, DiscoveryData, EcoComparison, RecommendedActivity } from "./itinerary";

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  data?: {
    itinerary?: ItineraryData;
    discoveryData?: DiscoveryData;
    carbonData?: CarbonData;
    ecoActivity?: EcoActivity;
    ecoComparisons?: EcoComparison[];
    recommendedActivities?: RecommendedActivity[];
  };
}

export interface ChatRequest {
  messages: {
    role: 'user' | 'model';
    content: string;
  }[];
}

export interface ChatResponse {
  chat_response: string;
  itinerary_data: ItineraryData | null;
  carbon_data: CarbonData | null;
  eco_activity: EcoActivity | null;
  recommended_activities: RecommendedActivity[];
  eco_comparisons: EcoComparison[];
  enriched_data: DiscoveryData | null;
  maps_grounded: boolean;
}

export interface HoveredItem {
  type: 'hotel' | 'activity' | 'flight';
  name: string;
  image: string;
  location: string;
  label: string;
}