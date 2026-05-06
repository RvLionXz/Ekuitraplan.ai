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

export async function getPreviousTripMetadata(
  userId: string
): Promise<SavedTripMetadata | null> {
  console.log(`[session-helper] Would load previous trip for user: ${userId}`);
  return null;
}

export async function saveTripMetadata(
  userId: string,
  metadata: TripMetadata & { carbon_kg?: number; distance_km?: number },
  tripId?: string
): Promise<SavedTripMetadata | null> {
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