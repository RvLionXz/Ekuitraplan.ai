// Session Helper - Database operations for trip metadata
// Used for revision detection (Opsi 2)
//
// Simplified version for now - full DB integration will come later

export interface TripMetadata {
  region: string;
  from_location: string;
  duration_days: number;
  title?: string;
  total_eco_score?: number;
}

export interface SavedTripMetadata {
  id: string;
  userId: string;
  region: string;
  from_location: string;
  duration_days: number;
  title?: string;
  total_eco_score?: number;
  carbon_kg: number;
  distance_km: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get the most recent trip metadata for a user
 * Used for revision detection
 * 
 * CURRENT: Returns null (placeholder for full DB implementation)
 * TODO: Implement once Trip model has from_location field added
 */
export async function getPreviousTripMetadata(
  userId: string
): Promise<SavedTripMetadata | null> {
  // Simplified for now - returns null
  // Full implementation: query Trip model where userId && status='planning', order by createdAt desc
  console.log(`[session-helper] Would load previous trip for user: ${userId}`);
  return null;
}

/**
 * Save current trip metadata for revision detection
 * Called after successful AI response
 * 
 * CURRENT: Just logged (placeholder for full DB implementation)
 */
export async function saveTripMetadata(
  userId: string,
  metadata: TripMetadata & { carbon_kg?: number; distance_km?: number },
  tripId?: string
): Promise<SavedTripMetadata | null> {
  // Simplified for now
  console.log(`[session-helper] Would save trip for user: ${userId}`, metadata);
  
  return {
    id: tripId || 'temp',
    userId: userId,
    region: metadata.region,
    from_location: metadata.from_location,
    duration_days: metadata.duration_days,
    title: metadata.title,
    total_eco_score: metadata.total_eco_score,
    carbon_kg: metadata.carbon_kg || 0,
    distance_km: metadata.distance_km || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Compare two trip metadata to determine if it's a revision or new trip
 */
export function isRevisionTrip(
  current: TripMetadata,
  previous: SavedTripMetadata | null
): {
  isRevision: boolean;
  reason: string;
} {
  if (!previous) {
    return {
      isRevision: false,
      reason: 'No previous trip found'
    };
  }
  
  // Check if key parameters are the same
  const regionSame = current.region.toLowerCase() === previous.region.toLowerCase();
  const durationSame = current.duration_days === previous.duration_days;
  const fromSame = current.from_location.toLowerCase() === previous.from_location.toLowerCase();
  
  if (regionSame && durationSame && fromSame) {
    return {
      isRevision: true,
      reason: `Same trip: ${current.region}, ${current.duration_days} days`
    };
  }
  
  return {
    isRevision: false,
    reason: `Different: ${current.region} vs ${previous.region}, ${current.duration_days} vs ${previous.duration_days} days`
  };
}