export type CategoryId =
  | 'visitar'
  | 'comer'
  | 'merendar'
  | 'campings'
  | 'dormir'
  | 'naturaleza'
  | 'religioso'
  | 'actividades'
  | 'cerca'
  | 'senderos'
  | 'historia'
  | 'eventos'
  | 'audioguias'
  | 'info';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  shortLabel: string;
  emoji: string;
  iconName: string;
  color: string;
  bgLight: string;
  description: string;
}

export type PlaceTag =
  | 'Abierto ahora'
  | 'Pet friendly'
  | 'Accesible'
  | 'Con niños'
  | 'Al aire libre'
  | 'Estacionamiento'
  | 'Opciones vegetarianas'
  | 'Económico'
  | 'Wi-Fi'
  | 'Acepta Mercado Pago'
  | 'Piscina'
  | 'Vista a las sierras'
  | 'Trekking'
  | 'Sendero de montaña'
  | 'Patrimonio Esquiú'
  | 'Monumento Histórico'
  | 'Cuidado ambiental';

export interface TrekkingDetails {
  difficulty: 'Baja' | 'Moderada' | 'Exigente' | 'Alta montaña';
  durationHours: string; // e.g. "2 a 3 horas"
  distanceKm?: number;
  elevationGain?: string; // e.g. "+380 m"
  waterRecommended: string; // e.g. "Mínimo 1.5 L por persona"
  footwearRecommended: string; // e.g. "Calzado de trekking con buen agarre"
  bestTimeToVisit: string; // e.g. "Temprano por la mañana o antes del atardecer"
  environmentalCare: string[];
  safetyWarnings: string[];
  requiresGuide?: boolean;
}

export interface RouteEstimate {
  distanceMeters: number;
  distanceKm: number;
  formattedDistance: string; // e.g. "850 m" or "4.2 km"
  walkingDurationMinutes: number;
  drivingDurationMinutes: number;
  formattedWalking: string; // e.g. "11 min caminando"
  formattedDriving: string; // e.g. "3 min en auto"
  summaryText: string; // e.g. "A 850 m de tu ubicación · 11 min caminando · 3 min en auto"
  isEstimateAccurate: boolean;
  source?: 'google_routes_api' | 'topographical_model';
}

export interface Place {
  id: string;
  name: string;
  category: CategoryId;
  secondaryCategories?: CategoryId[];
  subCategory?: string; // e.g. "Sierras y Senderos", "Patrimonio Religioso"
  shortDescription: string;
  description: string;
  address: string;
  locality: string; // e.g. "San José de Piedra Blanca", "Las Pirquitas", "San Antonio", "La Tercena", "La Carrera", "Collagasta", "Pomancillo Este", "Pomancillo Oeste"
  localityId?: 'san-jose' | 'san-antonio' | 'las-pirquitas' | 'la-tercena' | 'la-carrera' | 'collagasta' | 'pomancillo-este' | 'pomancillo-oeste';
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  image: string;
  gallery: string[];
  openingHours: string;
  phone: string;
  whatsapp: string; // international digits, e.g. "5493834123456"
  instagram?: string; // handle without @ or full url
  facebook?: string;
  tags: PlaceTag[];
  services: string[];
  priceLevel?: '$' | '$$' | '$$$';
  featured?: boolean;
  isImperdible?: boolean;
  audioguideId?: string;
  distanceKm?: number;
  routeInfo?: RouteEstimate;
  validationStatus?: 'verificado' | 'pendiente_validacion' | 'dato_pendiente_actualizacion';
  validationNote?: string;
  sourceGuide?: string;
  photoPendingNote?: string; // e.g. "FOTO PENDIENTE: vista panorámica de Casa de Piedra hacia el Valle de Fray Mamerto Esquiú"
  photoCredit?: string; // e.g. "Turismo Catamarca / Municipalidad de Fray Mamerto Esquiú"
  trekkingInfo?: TrekkingDetails;
  isHeritageEsquiu?: boolean;
  googleMapsUrl?: string;
  safetyWarning?: string;
}

export interface TouristEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or formatted
  dateBadge: string; // "SÁB 28 ENE"
  time: string;
  category: 'música' | 'peña' | 'feria' | 'deporte' | 'taller' | 'infantil' | 'patrimonio';
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  image: string;
  isFree: boolean;
  priceText?: string;
  organizer?: string;
  placeId?: string;
}

export interface Audioguide {
  id: string;
  placeId: string;
  title: string;
  subtitle: string;
  duration: string; // "0:42 min"
  audioSeconds: number;
  audioUrl?: string; // Optimized MP3/audio file path when available
  coverImage: string;
  shortSummary: string;
  narrativeText: string;
  historicalFacts: string[];
  nextPlaceId: string;
  nextPlaceReason: string;
}

export interface Experience {
  id: string;
  title: string;
  tagline: string;
  category: string;
  duration: string;
  idealFor: string; // "Familias / Parejas / Amigos"
  coverImage: string;
  description: string;
  stops: {
    placeId: string;
    stopOrder: number;
    tip: string;
  }[];
  highlights: string[];
  badgeText: string;
}

export interface PassportStamp {
  id: string;
  placeId: string;
  title: string;
  locality: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  photo: string;
  trivia: string;
}

export interface TouristBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiredStamps: number;
  unlocked: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  name: string;
  isRealGps?: boolean;
  accuracy?: number; // meters from coords.accuracy
  timestamp?: number; // epoch ms
  isAccuracyImproving?: boolean;
  permissionDenied?: boolean;
  errorMessage?: string;
  isCustomPreset?: boolean;
}

export type ActiveTab =
  | 'inicio'
  | 'explorar'
  | 'mapa'
  | 'agenda'
  | 'guardados'
  | 'cerca'
  | 'audioguias'
  | 'experiencias'
  | 'pasaporte';
