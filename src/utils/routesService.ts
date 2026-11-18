import { RouteEstimate, UserLocation } from '../types';

// In-memory cache for route calculations
const routeCache = new Map<string, { estimate: RouteEstimate; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Validate geographic coordinates
 */
export function isValidCoordinate(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Haversine formula for geodesic distance in kilometers
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format duration in friendly Spanish (e.g. "11 min", "1 h 15 min")
 */
export function formatDurationMinutes(minutes: number, mode: 'caminando' | 'en auto'): string {
  const roundedMin = Math.max(1, Math.round(minutes));
  if (roundedMin < 60) {
    return `${roundedMin} min ${mode}`;
  }
  const hours = Math.floor(roundedMin / 60);
  const remainingMins = roundedMin % 60;
  if (remainingMins === 0) {
    return `${hours} h ${mode}`;
  }
  return `${hours} h ${remainingMins} min ${mode}`;
}

/**
 * Format distance in meters or kilometers
 */
export function formatDistanceString(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    // Round to nearest 10m for clean readability
    const roundedMeters = Math.round(distanceMeters / 10) * 10;
    return `${Math.max(10, roundedMeters)} m`;
  }
  const km = distanceMeters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Compute route estimation with topographical road model or Google Maps Routes API
 */
export function computeTopographicalRouteEstimate(
  origLat: number,
  origLng: number,
  destLat: number,
  destLng: number,
  accuracyMeters?: number
): RouteEstimate | null {
  if (!isValidCoordinate(origLat, origLng) || !isValidCoordinate(destLat, destLng)) {
    return null;
  }

  const straightKm = calculateHaversineKm(origLat, origLng, destLat, destLng);
  // Real-world road curvature factor for Fray Mamerto Esquiú terrain (approx 1.25x - 1.35x straight line)
  const roadFactor = straightKm < 1 ? 1.2 : 1.28;
  const roadDistanceKm = straightKm * roadFactor;
  const distanceMeters = Math.round(roadDistanceKm * 1000);

  // Speeds:
  // Walking: ~4.5 km/h (75 m/min)
  // Driving: ~38 km/h on provincial routes & streets (urban/scenic pace)
  const walkingMinutes = (roadDistanceKm / 4.5) * 60;
  const drivingMinutes = Math.max(1, (roadDistanceKm / 38) * 60);

  const formattedDist = formatDistanceString(distanceMeters);
  const formattedWalk = formatDurationMinutes(walkingMinutes, 'caminando');
  const formattedDrive = formatDurationMinutes(drivingMinutes, 'en auto');

  const isAccurate = accuracyMeters === undefined || accuracyMeters <= 100;

  return {
    distanceMeters,
    distanceKm: Math.round(roadDistanceKm * 10) / 10,
    formattedDistance: formattedDist,
    walkingDurationMinutes: Math.round(walkingMinutes),
    drivingDurationMinutes: Math.round(drivingMinutes),
    formattedWalking: formattedWalk,
    formattedDriving: formattedDrive,
    summaryText: `A ${formattedDist} de tu ubicación · ${formattedWalk} · ${formattedDrive}`,
    isEstimateAccurate: isAccurate,
    source: 'topographical_model',
  };
}

/**
 * Fetch real route from backend (Google Maps Routes API proxy or cached estimate)
 */
export async function fetchRouteEstimate(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  userLocation?: UserLocation
): Promise<RouteEstimate | null> {
  if (!isValidCoordinate(origin.lat, origin.lng) || !isValidCoordinate(destination.lat, destination.lng)) {
    return null;
  }

  const cacheKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}-${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.estimate;
  }

  // Fast baseline immediate estimate
  const localEstimate = computeTopographicalRouteEstimate(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng,
    userLocation?.accuracy
  );

  try {
    const res = await fetch('/api/routes/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        accuracy: userLocation?.accuracy,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.estimate) {
        routeCache.set(cacheKey, { estimate: data.estimate, timestamp: Date.now() });
        return data.estimate as RouteEstimate;
      }
    }
  } catch (e) {
    // Network or offline fallback
  }

  if (localEstimate) {
    routeCache.set(cacheKey, { estimate: localEstimate, timestamp: Date.now() });
  }

  return localEstimate;
}
