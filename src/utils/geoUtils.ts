import { isValidCoordinate, calculateHaversineKm, formatDistanceString, computeTopographicalRouteEstimate } from './routesService';
import { RouteEstimate, UserLocation } from '../types';

export { isValidCoordinate, formatDistanceString };

/**
 * Calculates road/route distance in kilometers between two points.
 * Returns undefined if either point has invalid coordinates (e.g. 0,0 or null).
 */
export function calculateDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | undefined {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return undefined;
  }
  const straight = calculateHaversineKm(lat1!, lon1!, lat2!, lon2!);
  // Road factor to approximate road network vs straight line
  const roadFactor = straight < 1 ? 1.2 : 1.28;
  const roadKm = straight * roadFactor;
  return Math.round(roadKm * 10) / 10;
}

/**
 * Format distance in a human-friendly string (e.g. "850 m" or "4.2 km")
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) return '';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Generate Google Maps navigation URL with real origin (user location) and destination
 */
export function getDirectionsUrl(
  destLat: number,
  destLng: number,
  placeName?: string,
  userLocation?: { lat: number; lng: number } | null
): string {
  const hasOrigin = userLocation && isValidCoordinate(userLocation.lat, userLocation.lng);
  const originParam = hasOrigin ? `&origin=${userLocation.lat},${userLocation.lng}` : '';

  if (placeName && !hasOrigin) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&destination_place_id=${encodeURIComponent(
      placeName
    )}`;
  }
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destLat},${destLng}&travelmode=driving`;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function getPlaceRouteSummary(
  place: { lat: number; lng: number; routeInfo?: RouteEstimate; distanceKm?: number },
  userLoc?: UserLocation
): string {
  if (!isValidCoordinate(place.lat, place.lng)) {
    return 'Ubicación a confirmar';
  }
  if (place.routeInfo?.summaryText) {
    return place.routeInfo.summaryText;
  }
  if (typeof place.distanceKm === 'number') {
    return `A ${formatDistance(place.distanceKm)} de tu ubicación`;
  }
  return '';
}

