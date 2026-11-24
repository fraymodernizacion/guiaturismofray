import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Place,
  TouristEvent,
  Audioguide,
  Experience,
  PassportStamp,
  TouristBadge,
  UserLocation,
  CategoryId,
  ActiveTab,
} from '../types';
import {
  INITIAL_PLACES,
  INITIAL_EVENTS,
  INITIAL_AUDIOGUIDES,
  INITIAL_EXPERIENCES,
  INITIAL_PASSPORT_STAMPS,
  INITIAL_BADGES,
  INITIAL_USER_PRESETS,
} from '../data/initialData';
import { SiteConfig, HeroConfig, CategoriesSectionConfig, ImperdiblesSectionConfig, ConoceFraySectionConfig, QueHacerSectionConfig, RecorridoEsquiuSectionConfig, EmblemaFeConfig, FooterConfig } from '../types/siteConfig';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig';
import { calculateDistanceKm, isValidCoordinate } from '../utils/geoUtils';
import { computeTopographicalRouteEstimate, calculateHaversineKm } from '../utils/routesService';
import { audioNarrator } from '../utils/audioNarrator';

interface DataContextType {
  places: Place[];
  events: TouristEvent[];
  audioguides: Audioguide[];
  experiences: Experience[];
  passportStamps: PassportStamp[];
  badges: TouristBadge[];
  favorites: string[];
  userLocation: UserLocation;
  isLocating: boolean;
  locationError: string | null;
  clearLocationError: () => void;
  activeCategory: CategoryId | null;
  searchQuery: string;
  selectedPlace: Place | null;
  activeTab: ActiveTab;
  activeAudioGuide: Audioguide | null;
  isAudioPlaying: boolean;
  isAudioPaused: boolean;
  audioProgress: number;
  audioCurrentTimeSec: number;
  audioPlaybackRate: number;
  isUsefulInfoModalOpen: boolean;
  isAdminModalOpen: boolean;
  isQrShareModalOpen: boolean;
  isLocationPromptModalOpen: boolean;
  setIsLocationPromptModalOpen: (open: boolean) => void;
  allowLocationPermission: () => void;
  denyLocationPermission: () => void;
  retryLocationPermission: () => void;
  selectedStampForCheckIn: PassportStamp | null;

  // Site Configuration & Visual Editor
  siteConfig: SiteConfig;
  sectionToEdit: string | null;
  setSectionToEdit: (section: string | null) => void;
  placeToEdit: Place | null;
  setPlaceToEdit: (place: Place | null) => void;
  isCreatePlaceModalOpen: boolean;
  setIsCreatePlaceModalOpen: (open: boolean) => void;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
  updateHeroConfig: (hero: Partial<HeroConfig>) => void;
  updateCategoriesConfig: (categories: Partial<CategoriesSectionConfig>) => void;
  updateImperdiblesConfig: (imperdibles: Partial<ImperdiblesSectionConfig>) => void;
  updateConoceFrayConfig: (conoce: Partial<ConoceFraySectionConfig>) => void;
  updateQueHacerConfig: (queHacer: Partial<QueHacerSectionConfig>) => void;
  updateRecorridoEsquiuConfig: (recorrido: Partial<RecorridoEsquiuSectionConfig>) => void;
  updateEmblemaFeConfig: (emblema: Partial<EmblemaFeConfig>) => void;
  updateFooterConfig: (footer: Partial<FooterConfig>) => void;
  resetSiteConfigToDefault: () => void;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActiveCategory: (cat: CategoryId | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPlace: (place: Place | null) => void;
  toggleFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;
  setUserLocation: (loc: UserLocation) => void;
  requestRealGeolocation: () => void;
  
  // Audio actions
  playAudioguide: (guide: Audioguide) => void;
  pauseAudioguide: () => void;
  resumeAudioguide: () => void;
  stopAudioguide: () => void;
  setAudioPlaybackRate: (rate: number) => void;

  // Modals
  setIsUsefulInfoModalOpen: (open: boolean) => void;
  setIsAdminModalOpen: (open: boolean) => void;
  setIsQrShareModalOpen: (open: boolean) => void;
  setSelectedStampForCheckIn: (stamp: PassportStamp | null) => void;
  unlockPassportStamp: (stampId: string) => void;

  // Admin CRUD
  addPlace: (place: Omit<Place, 'id'>) => void;
  updatePlace: (place: Place) => void;
  deletePlace: (id: string) => void;
  addEvent: (event: Omit<TouristEvent, 'id'>) => void;
  updateEvent: (event: TouristEvent) => void;
  deleteEvent: (id: string) => void;
  addAudioguide: (guide: Omit<Audioguide, 'id'>) => void;
  updateAudioguide: (guide: Audioguide) => void;
  deleteAudioguide: (id: string) => void;
  resetAllDataToDefault: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLACES: 'fray_turismo_places_v2',
  EVENTS: 'fray_turismo_events_v2',
  AUDIOGUIDES: 'fray_turismo_audioguides_v2',
  PASSPORT: 'fray_turismo_passport_v2',
  FAVORITES: 'fray_turismo_favorites_v2',
  LOCATION: 'fray_turismo_location_v2',
  SITE_CONFIG: 'fray_turismo_site_config_v1',
  LOCATION_PROMPT_SEEN: 'fray_turismo_location_prompt_seen_v1',
};

const getStoredOrDefault = <T,>(key: string, fallbackKey: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    if (parsed === null || parsed === undefined) return defaultValue;
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue) && typeof parsed !== 'object') {
      return defaultValue;
    }
    return parsed;
  } catch {
    return defaultValue;
  }
};

/**
 * Valida si una ruta de imagen es utilizable y accesible en la aplicación.
 * Rechaza strings vacíos, undefined, rutas rotas, placeholders o rutas obsoletas.
 */
export const isValidImagePath = (path?: string | null): boolean => {
  if (!path || typeof path !== 'string') return false;
  const trimmed = path.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;

  // Rechazar placeholders genéricos
  if (trimmed.includes('placeholder') || trimmed.includes('unsplash.com')) return false;

  // Rechazar rutas incorrectas no válidas para Vite
  if (trimmed.startsWith('/public/images/') || trimmed.startsWith('/src/uploads/') || trimmed.startsWith('/src/assets/images/')) {
    return false;
  }

  // Rechazar ilustraciones o nombres temporales obsoletos de trapiche
  if (
    trimmed === '/images/trapiche-azucarero.jpg' ||
    trimmed === '/images/trapiche-azucarero-arcos.jpg' ||
    trimmed === '/images/Trapiche Azucarero.png'
  ) {
    return false;
  }

  // Cargas personalizadas realizadas por el usuario/admin en /uploads/ o data URLs
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('data:image/')) {
    return true;
  }

  // Fotografías estáticas oficiales en /images/
  if (trimmed.startsWith('/images/')) {
    return true;
  }

  // URLs externas válidas
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }

  // Rutas legacy en /uploads/ que ya fueron migradas a /images/
  const legacyMigratedUploads = [
    '/uploads/casa-natal-esquiu.jpg',
    '/uploads/monumento-beato-esquiu.jpg',
    '/uploads/monumento-esquiu.jpg',
    '/uploads/casona-piedra-blanca.jpg',
    '/uploads/dique-las-pirquitas.jpg',
    '/uploads/dique-las-pirquitas-hero.jpg',
    '/uploads/dique-las-pirquitas-principal.jpg',
  ];
  if (legacyMigratedUploads.includes(trimmed)) {
    return false;
  }

  // Hashes temporales o nombres de prueba obsoletos
  if (trimmed.length > 40 && (trimmed.includes('mXG2') || trimmed.includes('baMFZ') || trimmed.includes('regenerated_image'))) {
    return false;
  }

  // Otras rutas estáticas directas en raíz
  if (trimmed.startsWith('/')) {
    return true;
  }

  return false;
};

const LEGACY_IMAGE_MAP: Record<string, string> = {
  '/dique%20las%20pirquitas.jpg': '/images/dique-las-pirquitas.webp',
  '/dique las pirquitas.jpg': '/images/dique-las-pirquitas.webp',
  '/images/dique-las-pirquitas.jpg': '/images/dique-las-pirquitas.webp',
  '/images/dique-las-pirquitas-hero.jpg': '/images/dique-las-pirquitas.webp',
  '/uploads/dique-las-pirquitas.jpg': '/images/dique-las-pirquitas.webp',
  '/uploads/dique-las-pirquitas-hero.jpg': '/images/dique-las-pirquitas.webp',
  '/uploads/dique-las-pirquitas-principal.jpg': '/images/dique-las-pirquitas.webp',
  '/uploads/dique-las-pirquitas-panoramica.jpg': '/images/dique-las-pirquitas.webp',
  '/images/casa-natal-esquiu.jpg': '/images/casa-natal-esquiu.webp',
  '/uploads/casa-natal-esquiu.jpg': '/images/casa-natal-esquiu.webp',
  '/images/monumento-beato-esquiu.jpg': '/images/monumento-beato-esquiu.webp',
  '/uploads/monumento-beato-esquiu.jpg': '/images/monumento-beato-esquiu.webp',
  '/uploads/monumento-esquiu.jpg': '/images/monumento-beato-esquiu.webp',
  '/Monumento Fray.jpg': '/images/monumento-beato-esquiu.webp',
  '/images/iglesia-san-jose.jpg': '/images/iglesia-san-jose.webp',
  '/images/templo-san-jose-piedra-blanca.jpg': '/images/iglesia-san-jose.webp',
  '/images/casona-piedra-blanca.jpg': '/images/casona-piedra-blanca.webp',
  '/uploads/casona-piedra-blanca.jpg': '/images/casona-piedra-blanca.webp',
  '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.png': '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.webp',
  '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.jpg': '/assets/aistudio/imagen_2026-11-17_190955385_d3f30181.webp',
  '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.png': '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.webp',
  '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.jpg': '/assets/aistudio/Santuario_en_la_ladera_monta_osa_50fa8eb0.webp',
  '/assets/aistudio/vertedero__camara_png_0f9de3fb.png': '/assets/aistudio/vertedero__camara_png_0f9de3fb.webp',
  '/assets/aistudio/vertedero__camara_png_0f9de3fb.jpg': '/assets/aistudio/vertedero__camara_png_0f9de3fb.webp',
  '/assets/aistudio/images__17__d2f32618.jpg': '/assets/aistudio/images__17__d2f32618.webp',
  '/assets/aistudio/238734_bab774f1.jpg': '/assets/aistudio/238734_bab774f1.webp',
  '/assets/aistudio/images__16__a85576a0.jpg': '/assets/aistudio/images__16__a85576a0.webp',
  '/assets/aistudio/iglesia_de_collagasta_35f92255.JPG': '/assets/aistudio/iglesia_de_collagasta_35f92255.webp',
  '/assets/aistudio/Pomancillo_catamarca_paisajes__21__c5936801.JPG': '/assets/aistudio/Pomancillo_catamarca_paisajes__21__c5936801.webp',
  '/assets/aistudio/images__18__f7fb378b.jpg': '/assets/aistudio/images__18__f7fb378b.webp',
  '/assets/aistudio/Paisajes_de_Catamarca._Las_Pirquitas__5__99e70619.JPG': '/assets/aistudio/Paisajes_de_Catamarca._Las_Pirquitas__5__99e70619.webp',
  '/assets/aistudio/calvario-030_e176e712.jpg': '/assets/aistudio/calvario-030_e176e712.webp',
  '/assets/aistudio/Collagasta_Catamarca__23__05c72993.JPG': '/assets/aistudio/Collagasta_Catamarca__23__05c72993.webp',
};

export const normalizeLegacyImagePath = (path?: string | null): string => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  return LEGACY_IMAGE_MAP[trimmed] || trimmed;
};

/**
 * Realiza un merge seguro de imágenes entre el registro persistido y la ficha inicial oficial.
 * Garantiza que una imagen válida de INITIAL_PLACES jamás sea sobrescrita por un valor vacío o roto.
 */
export const resolveSafePlaceImages = (
  stored?: Partial<Place> | null,
  initial?: Place
): { image: string; gallery: string[] } => {
  const initialImage = initial?.image && isValidImagePath(initial.image)
    ? normalizeLegacyImagePath(initial.image)
    : '';
  const initialGallery = Array.isArray(initial?.gallery)
    ? Array.from(new Set(initial.gallery.filter(isValidImagePath).map((u) => normalizeLegacyImagePath(u))))
    : [];

  let resolvedImage = initialImage;
  if (stored && stored.image && isValidImagePath(stored.image)) {
    resolvedImage = normalizeLegacyImagePath(stored.image);
  } else if (initialImage) {
    resolvedImage = initialImage;
  }

  let resolvedGallery: string[] = [];
  if (stored && Array.isArray(stored.gallery) && stored.gallery.length > 0) {
    const validStoredGallery = Array.from(
      new Set(stored.gallery.filter(isValidImagePath).map((u) => normalizeLegacyImagePath(u)))
    );
    if (validStoredGallery.length > 0) {
      resolvedGallery = validStoredGallery;
    }
  }

  if (resolvedGallery.length === 0) {
    if (initialGallery.length > 0) {
      resolvedGallery = initialGallery;
    } else if (resolvedImage) {
      resolvedGallery = [resolvedImage];
    }
  }

  if (resolvedImage && !resolvedGallery.includes(resolvedImage)) {
    resolvedGallery = [resolvedImage, ...resolvedGallery];
  }

  return {
    image: resolvedImage,
    gallery: resolvedGallery,
  };
};

/**
 * Fusiona de forma segura los datos guardados en cliente/servidor con la ficha oficial baseline.
 * Preserva modificaciones de contenido del usuario sin destruir las imágenes oficiales.
 */
export const mergePlaceWithBaseline = (
  initPlace: Place,
  storedPlace?: Partial<Place>
): Place => {
  if (!storedPlace) return initPlace;

  const { image, gallery } = resolveSafePlaceImages(storedPlace, initPlace);

  const migratedReligiousIds = new Set([
    'santuario-senor-de-los-milagros',
    'casa-natal-esquiu',
    'iglesia-san-jose',
    'monumento-esquiu',
    'capilla-nuestra-senora-de-las-mercedes',
  ]);
  const isMigratedReligiousPlace = migratedReligiousIds.has(initPlace.id);

  const isMigratedGastronomiaPlace =
    storedPlace.sourceGuide === 'Guía Turística Oficial Fray Mamerto Esquiú' &&
    initPlace.sourceGuide === 'Guía de Verano 2025-2026 · Fray Mamerto Esquiú';

  const isMigratedQueVisitarPlace =
    initPlace.sourceGuide === 'Visita Fray · Catálogo Qué visitar (2026)' &&
    storedPlace.sourceGuide !== 'Visita Fray · Catálogo Qué visitar (2026)';

  const mergedName =
    storedPlace.name === 'Antiguo Trapiche y Molino Histórico' || isMigratedReligiousPlace || isMigratedGastronomiaPlace || isMigratedQueVisitarPlace
      ? initPlace.name
      : (storedPlace.name || initPlace.name);

  const mergedShortDescription =
    isMigratedReligiousPlace || isMigratedGastronomiaPlace || isMigratedQueVisitarPlace
      ? initPlace.shortDescription
      : (storedPlace.shortDescription || initPlace.shortDescription);

  const mergedDescription =
    isMigratedReligiousPlace || isMigratedGastronomiaPlace || isMigratedQueVisitarPlace
      ? initPlace.description
      : (storedPlace.description || initPlace.description);

  const mergedGoogleMapsUrl = isMigratedReligiousPlace
    ? initPlace.googleMapsUrl
    : (storedPlace.googleMapsUrl || initPlace.googleMapsUrl);

  const isOldTrapicheCoords =
    initPlace.id === 'trapiche-azucarero' &&
    (storedPlace.lat === -28.378 || !storedPlace.googleMapsUrl);

  const isOldPalumaCoords =
    initPlace.id === 'paluma-cerveceria' &&
    (storedPlace.lat === -28.384 || !storedPlace.googleMapsUrl);

  const isOldAmadeusCoords =
    initPlace.id === 'amadeus-bar' &&
    (storedPlace.lat === -28.3835 || !storedPlace.googleMapsUrl);

  const isOldChaperioCoords =
    initPlace.id === 'el-chaperio-de-mamerto' &&
    (storedPlace.lat === -28.3855 || !storedPlace.googleMapsUrl);

  const resolvedLat =
    isOldTrapicheCoords || isOldPalumaCoords || isOldAmadeusCoords || isOldChaperioCoords || typeof storedPlace.lat !== 'number' || isNaN(storedPlace.lat)
      ? initPlace.lat
      : storedPlace.lat;

  const resolvedLng =
    isOldTrapicheCoords || isOldPalumaCoords || isOldAmadeusCoords || isOldChaperioCoords || typeof storedPlace.lng !== 'number' || isNaN(storedPlace.lng)
      ? initPlace.lng
      : storedPlace.lng;

  const resolvedAddress =
    isMigratedReligiousPlace ||
    isMigratedGastronomiaPlace ||
    isMigratedQueVisitarPlace ||
    (!storedPlace.address && !!initPlace.address) ||
    ((initPlace.id === 'dique-las-pirquitas' || initPlace.id === 'vertedero-dique-pirquitas') &&
      storedPlace.address === 'Ruta Provincial 1, Las Pirquitas') ||
    (initPlace.id === 'casa-natal-esquiu' &&
      (storedPlace.address === 'Calle del Beato s/n, Piedra Blanca' || storedPlace.address === 'Av. La Callecita'))
      ? initPlace.address
      : (storedPlace.address !== undefined ? storedPlace.address : initPlace.address);

  const resolvedOpeningHours =
    isMigratedReligiousPlace ||
    isMigratedGastronomiaPlace ||
    isMigratedQueVisitarPlace ||
    (initPlace.id === 'vertedero-dique-pirquitas' &&
      storedPlace.openingHours === 'Acceso y miradores públicos permanentes.')
      ? initPlace.openingHours
      : (storedPlace.openingHours !== undefined ? storedPlace.openingHours : initPlace.openingHours);

  const unionSecondaryCategories = Array.from(
    new Set([
      ...(initPlace.secondaryCategories || []),
      ...(storedPlace.secondaryCategories || []),
    ])
  );
  const resolvedSecondaryCategories =
    unionSecondaryCategories.length > 0 ? unionSecondaryCategories : undefined;

  if (isMigratedGastronomiaPlace || isMigratedQueVisitarPlace) {
    return {
      ...storedPlace,
      ...initPlace,
      secondaryCategories: resolvedSecondaryCategories,
      image,
      gallery,
      googleMapsUrl: mergedGoogleMapsUrl,
      lat: resolvedLat,
      lng: resolvedLng,
    };
  }

  return {
    ...initPlace,
    ...storedPlace,
    name: mergedName,
    shortDescription: mergedShortDescription,
    description: mergedDescription,
    address: resolvedAddress,
    openingHours: resolvedOpeningHours,
    secondaryCategories: resolvedSecondaryCategories,
    image,
    gallery,
    googleMapsUrl: mergedGoogleMapsUrl,
    safetyWarning: storedPlace.safetyWarning || initPlace.safetyWarning,
    lat: resolvedLat,
    lng: resolvedLng,
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Places state - ensure confirmed baseline places and user/admin modifications & photographs are properly preserved
  const [places, setPlaces] = useState<Place[]>(() => {
    const raw = getStoredOrDefault<Place[]>(STORAGE_KEYS.PLACES, '', INITIAL_PLACES);
    if (!Array.isArray(raw) || raw.length === 0) return INITIAL_PLACES;
    
    // Create map of stored modifications
    const storedMap = new Map(raw.map((p) => [p.id, p]));
    const mergedBaseline = INITIAL_PLACES.map((initPlace) => {
      const stored = storedMap.get(initPlace.id);
      if (stored) {
        storedMap.delete(initPlace.id);
        return mergePlaceWithBaseline(initPlace, stored);
      }
      return initPlace;
    });

    // Also include any newly created places that were not in INITIAL_PLACES
    const removedPlaceIds = new Set(['campanas-del-rosario', 'casa-de-te-la-calera']);
    const additionalPlaces = Array.from(storedMap.values())
      .filter((p) => !removedPlaceIds.has(p.id))
      .map((p) => {
        const { image, gallery } = resolveSafePlaceImages(p);
        return { ...p, image, gallery };
      });
    return [...mergedBaseline, ...additionalPlaces];
  });

  // Events state
  const [events, setEvents] = useState<TouristEvent[]>(() => {
    const raw = getStoredOrDefault(STORAGE_KEYS.EVENTS, 'fray_verano_events_v1', INITIAL_EVENTS);
    return Array.isArray(raw)
      ? raw.filter((ev) => ev.placeId !== 'casa-de-te-la-calera' && ev.id !== 'ev-taller-ceramica')
      : INITIAL_EVENTS;
  });

  // Audioguides state with image fallback
  const [audioguides, setAudioguides] = useState<Audioguide[]>(() => {
    const raw = getStoredOrDefault<Audioguide[]>(STORAGE_KEYS.AUDIOGUIDES, 'fray_verano_audioguides_v1', INITIAL_AUDIOGUIDES);
    if (!Array.isArray(raw) || raw.length === 0) return INITIAL_AUDIOGUIDES;
    const storedMap = new Map(raw.map((g) => [g.id, g]));
    const merged = INITIAL_AUDIOGUIDES.map((initGuide) => {
      const stored = storedMap.get(initGuide.id);
      if (!stored) return initGuide;
      storedMap.delete(initGuide.id);
      const coverImage = stored.coverImage && isValidImagePath(stored.coverImage)
        ? normalizeLegacyImagePath(stored.coverImage)
        : (initGuide.coverImage && isValidImagePath(initGuide.coverImage) ? normalizeLegacyImagePath(initGuide.coverImage) : '');
      const hasRemovedNextPlace = stored.nextPlaceId === 'casa-de-te-la-calera';
      return {
        ...initGuide,
        ...stored,
        coverImage,
        ...(hasRemovedNextPlace
          ? {
              nextPlaceId: initGuide.nextPlaceId,
              nextPlaceReason: initGuide.nextPlaceReason,
            }
          : {}),
      };
    });
    return [...merged, ...Array.from(storedMap.values())];
  });

  // Experiences
  const [experiences] = useState<Experience[]>(INITIAL_EXPERIENCES);

  // Passport state with image fallback
  const [passportStamps, setPassportStamps] = useState<PassportStamp[]>(() => {
    const raw = getStoredOrDefault<PassportStamp[]>(STORAGE_KEYS.PASSPORT, 'fray_verano_passport_v1', INITIAL_PASSPORT_STAMPS);
    if (!Array.isArray(raw) || raw.length === 0) return INITIAL_PASSPORT_STAMPS;
    const storedMap = new Map(raw.map((s) => [s.id, s]));
    const merged = INITIAL_PASSPORT_STAMPS.map((initStamp) => {
      const stored = storedMap.get(initStamp.id);
      if (!stored) return initStamp;
      storedMap.delete(initStamp.id);
      const photo = stored.photo && isValidImagePath(stored.photo)
        ? normalizeLegacyImagePath(stored.photo)
        : (initStamp.photo && isValidImagePath(initStamp.photo) ? normalizeLegacyImagePath(initStamp.photo) : '');
      return {
        ...initStamp,
        ...stored,
        photo,
      };
    });
    return [...merged, ...Array.from(storedMap.values())];
  });

  // Badges derived
  const [badges, setBadges] = useState<TouristBadge[]>(INITIAL_BADGES);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const raw = getStoredOrDefault(STORAGE_KEYS.FAVORITES, 'fray_verano_favorites_v1', ['casa-natal-esquiu', 'dique-las-pirquitas']);
    return Array.isArray(raw) ? raw.filter((id) => id !== 'casa-de-te-la-calera') : ['casa-natal-esquiu', 'dique-las-pirquitas'];
  });

  // User location default (Plaza San José de Piedra Blanca). 
  // We do NOT persist old GPS coordinates as if they were current live GPS across new sessions.
  const [userLocation, setUserLocationState] = useState<UserLocation>(() => {
    const saved = getStoredOrDefault<UserLocation | null>(STORAGE_KEYS.LOCATION, 'fray_verano_location_v1', null);
    if (saved && !saved.isRealGps && typeof saved.lat === 'number' && typeof saved.lng === 'number') {
      return saved;
    }
    return INITIAL_USER_PRESETS[0];
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationPromptModalOpen, setIsLocationPromptModalOpen] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bestReadingRef = useRef<{ lat: number; lng: number; accuracy: number; timestamp: number } | null>(null);

  // Initial check on app mount: check if first time visitor to show the Location Welcome modal
  useEffect(() => {
    try {
      const hasSeenPrompt = localStorage.getItem(STORAGE_KEYS.LOCATION_PROMPT_SEEN);
      if (!hasSeenPrompt) {
        setIsLocationPromptModalOpen(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Low-level clean execution of navigator.geolocation
  const executeGeolocationRequest = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Tu navegador o dispositivo no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    bestReadingRef.current = null;

    // Clear any previous active watcher or timer
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchTimerRef.current !== null) {
      clearTimeout(watchTimerRef.current);
      watchTimerRef.current = null;
    }

    // Helper to evaluate and apply a candidate reading
    const processCandidateLocation = (lat: number, lng: number, acc: number, time: number) => {
      const roundedAcc = Math.round(acc);

      // Strict accuracy threshold: accuracy > 1000 m must NOT be used as real user location
      if (roundedAcc > 1000) {
        return false;
      }

      const prevBest = bestReadingRef.current;
      if (!prevBest || roundedAcc < prevBest.accuracy) {
        bestReadingRef.current = { lat, lng, accuracy: roundedAcc, timestamp: time };

        const newLoc: UserLocation = {
          lat,
          lng,
          name: '📍 Vos',
          isRealGps: true,
          accuracy: roundedAcc,
          timestamp: time,
        };

        setUserLocationState(newLoc);
        setLocationError(null);

        // If we achieved high quality accuracy (<= 100m), we can stop watching early
        if (roundedAcc <= 100 && watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          if (watchTimerRef.current) {
            clearTimeout(watchTimerRef.current);
            watchTimerRef.current = null;
          }
          setIsLocating(false);
        }

        return true;
      }
      return false;
    };

    // 1. Initial getCurrentPosition call (triggers native iOS/Android prompt if needed)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = pos.timestamp || Date.now();
        const accepted = processCandidateLocation(latitude, longitude, accuracy, timestamp);

        // If initial accuracy was acceptable (<= 1000m), we are done locating unless watch finds better
        if (accepted && Math.round(accuracy) <= 100) {
          setIsLocating(false);
          return;
        }

        // 2. Start watchPosition for up to 25 seconds to refine reading and get lower accuracy
        const watchId = navigator.geolocation.watchPosition(
          (watchPos) => {
            const wLat = watchPos.coords.latitude;
            const wLng = watchPos.coords.longitude;
            const wAcc = watchPos.coords.accuracy;
            const wTime = watchPos.timestamp || Date.now();
            processCandidateLocation(wLat, wLng, wAcc, wTime);
          },
          (watchErr) => {
            console.warn('[GEOLOCATION WATCH NOTICE]:', watchErr);
          },
          { enableHighAccuracy: true, maximumAge: 0 }
        );
        watchIdRef.current = watchId;

        // Stop watching after 25 seconds
        watchTimerRef.current = setTimeout(() => {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setIsLocating(false);

          // If after 25s no reading <= 1000m was found, show simple error
          if (!bestReadingRef.current) {
            setLocationError('No pudimos usar tu ubicación');
          }
        }, 25000);
      },
      (err) => {
        setIsLocating(false);
        console.warn('[GEOLOCATION ERROR]:', err);
        setLocationError('No pudimos usar tu ubicación');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  const requestRealGeolocation = useCallback(() => {
    executeGeolocationRequest();
  }, [executeGeolocationRequest]);

  const allowLocationPermission = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_PROMPT_SEEN, 'true');
    } catch {}
    setIsLocationPromptModalOpen(false);
    requestRealGeolocation();
  };

  const denyLocationPermission = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_PROMPT_SEEN, 'true');
    } catch {}
    setIsLocationPromptModalOpen(false);
  };

  const retryLocationPermission = () => {
    clearLocationError();
    requestRealGeolocation();
  };

  // Clear any location error
  const clearLocationError = () => {
    setLocationError(null);
  };

  // Cleanup watcher and timer on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (watchTimerRef.current !== null) {
        clearTimeout(watchTimerRef.current);
      }
    };
  }, []);

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Audio Guide Player State
  const [activeAudioGuide, setActiveAudioGuide] = useState<Audioguide | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTimeSec, setAudioCurrentTimeSec] = useState<number>(0);
  const [audioPlaybackRate, setAudioPlaybackRateState] = useState<number>(1.0);

  // Modals & Editor States
  const [isUsefulInfoModalOpen, setIsUsefulInfoModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isQrShareModalOpen, setIsQrShareModalOpen] = useState<boolean>(false);
  const [selectedStampForCheckIn, setSelectedStampForCheckIn] = useState<PassportStamp | null>(null);

  // Visual In-Context Editor & Section Editing States
  const [sectionToEdit, setSectionToEdit] = useState<string | null>(null);
  const [placeToEdit, setPlaceToEdit] = useState<Place | null>(null);
  const [isCreatePlaceModalOpen, setIsCreatePlaceModalOpen] = useState<boolean>(false);

  // Site Configuration state
  const [siteConfig, setSiteConfigState] = useState<SiteConfig>(() => {
    const stored = getStoredOrDefault(STORAGE_KEYS.SITE_CONFIG, '', DEFAULT_SITE_CONFIG);
    const normalizedBg = stored?.hero?.bgImage ? normalizeLegacyImagePath(stored.hero.bgImage) : DEFAULT_SITE_CONFIG.hero.bgImage;
    const normalizedItems = Array.isArray(stored?.imperdibles?.items)
      ? stored.imperdibles.items.map((item) => ({
          ...item,
          customImage: item.customImage ? normalizeLegacyImagePath(item.customImage) : item.customImage,
        }))
      : DEFAULT_SITE_CONFIG.imperdibles.items;

    const updatedHeroSubtitle =
      stored?.hero?.subtitle ===
      'Valles serranos, agua esmeralda, cuna del Beato y tradiciones vivas en Catamarca.'
        ? DEFAULT_SITE_CONFIG.hero.subtitle
        : stored?.hero?.subtitle;

    return {
      ...DEFAULT_SITE_CONFIG,
      ...stored,
      hero: {
        ...DEFAULT_SITE_CONFIG.hero,
        ...(stored?.hero || {}),
        bgImage: normalizedBg,
        ...(updatedHeroSubtitle ? { subtitle: updatedHeroSubtitle } : {}),
      },
      imperdibles: {
        ...DEFAULT_SITE_CONFIG.imperdibles,
        ...(stored?.imperdibles || {}),
        items: normalizedItems,
      },
    };
  });

  // Sync siteConfig with persistent server on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/site-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !data.config) return;
        const serverHero = data.config.hero || {};
        const migratedHeroSubtitle =
          serverHero.subtitle ===
          'Valles serranos, agua esmeralda, cuna del Beato y tradiciones vivas en Catamarca.'
            ? DEFAULT_SITE_CONFIG.hero.subtitle
            : serverHero.subtitle;
        setSiteConfigState((prev) => ({
          ...DEFAULT_SITE_CONFIG,
          ...prev,
          ...data.config,
          hero: {
            ...DEFAULT_SITE_CONFIG.hero,
            ...(prev.hero || {}),
            ...serverHero,
            ...(serverHero.bgImage ? { bgImage: normalizeLegacyImagePath(serverHero.bgImage) } : {}),
            ...(migratedHeroSubtitle ? { subtitle: migratedHeroSubtitle } : {}),
          },
          categories: { ...DEFAULT_SITE_CONFIG.categories, ...(prev.categories || {}), ...(data.config.categories || {}) },
          imperdibles: {
            ...DEFAULT_SITE_CONFIG.imperdibles,
            ...(prev.imperdibles || {}),
            ...(data.config.imperdibles || {}),
            ...(Array.isArray(data.config.imperdibles?.items)
              ? {
                  items: data.config.imperdibles.items.map((item: any) => ({
                    ...item,
                    customImage: item.customImage ? normalizeLegacyImagePath(item.customImage) : item.customImage,
                  })),
                }
              : {}),
          },
          conoceFray: { ...DEFAULT_SITE_CONFIG.conoceFray, ...(prev.conoceFray || {}), ...(data.config.conoceFray || {}) },
          queHacer: { ...DEFAULT_SITE_CONFIG.queHacer, ...(prev.queHacer || {}), ...(data.config.queHacer || {}) },
          recorridoEsquiu: { ...DEFAULT_SITE_CONFIG.recorridoEsquiu, ...(prev.recorridoEsquiu || {}), ...(data.config.recorridoEsquiu || {}) },
          emblemaFe: { ...DEFAULT_SITE_CONFIG.emblemaFe, ...(prev.emblemaFe || {}), ...(data.config.emblemaFe || {}) },
          footer: { ...DEFAULT_SITE_CONFIG.footer, ...(prev.footer || {}), ...(data.config.footer || {}) },
        }));
      })
      .catch((err) => {
        console.warn('[SYNC] Notice: /api/site-config initial load:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update places with calculated distances whenever userLocation or places changes
  const placesWithDistances = useMemo(() => {
    const hasValidUserLoc = isValidCoordinate(userLocation.lat, userLocation.lng);
    return places.map((place) => {
      const hasValidPlaceCoord = isValidCoordinate(place.lat, place.lng);
      if (!hasValidUserLoc || !hasValidPlaceCoord) {
        return { ...place, distanceKm: undefined, routeInfo: undefined };
      }
      const routeInfo = computeTopographicalRouteEstimate(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lng,
        userLocation.accuracy
      );
      return {
        ...place,
        distanceKm: routeInfo?.distanceKm,
        routeInfo: routeInfo || undefined,
      };
    });
  }, [places, userLocation.lat, userLocation.lng, userLocation.accuracy]);

  // Recalculate badges when stamps change
  useEffect(() => {
    const unlockedCount = passportStamps.filter((s) => s.unlocked).length;
    setBadges((prev) =>
      prev.map((b) => ({
        ...b,
        unlocked: unlockedCount >= b.requiredStamps,
      }))
    );
  }, [passportStamps]);

  // Sync with persistent server database on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/places')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !Array.isArray(data.places) || data.places.length === 0) return;
        const serverPlaces = Array.isArray(data.places) ? (data.places as Place[]) : [];
        const serverMap = new Map<string, Place>(serverPlaces.map((p: Place) => [p.id, p]));

        setPlaces((prev) => {
          const prevMap = new Map<string, Place>(prev.map((p: Place) => [p.id, p]));
          const merged: Place[] = INITIAL_PLACES.map((init: Place) => {
            const serverItem = serverMap.get(init.id);
            const clientItem = prevMap.get(init.id);
            const item: Place | undefined = serverItem || clientItem;
            if (item) {
              serverMap.delete(init.id);
              prevMap.delete(init.id);
              return mergePlaceWithBaseline(init, item);
            }
            return init;
          });

          // Also include remaining server and client newly created places
          const removedPlaceIds = new Set(['campanas-del-rosario', 'casa-de-te-la-calera']);
          const remainingServer = Array.from(serverMap.values())
            .filter((p) => !removedPlaceIds.has(p.id))
            .map((p) => {
              const { image, gallery } = resolveSafePlaceImages(p);
              return { ...p, image, gallery };
            });

          const remainingClient = Array.from(prevMap.values())
            .filter((p) => !removedPlaceIds.has(p.id) && !serverPlaces.some((sp) => sp.id === p.id))
            .map((p) => {
              const { image, gallery } = resolveSafePlaceImages(p);
              return { ...p, image, gallery };
            });

          return [...merged, ...remainingServer, ...remainingClient];
        });
      })
      .catch((err) => {
        console.warn('[SYNC] Notice: /api/places initial load:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist to local storage and sync to server API
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
    fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ places }),
    }).catch(() => {
      // Ignored for offline usage
    });
  }, [places]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIOGUIDES, JSON.stringify(audioguides));
  }, [audioguides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PASSPORT, JSON.stringify(passportStamps));
  }, [passportStamps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const setUserLocation = (loc: UserLocation) => {
    // If switching to manual preset, clear any real-time GPS watcher
    if (!loc.isRealGps && watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setUserLocationState(loc);
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
  };

  const toggleFavorite = (placeId: string) => {
    setFavorites((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const isFavorite = (placeId: string) => favorites.includes(placeId);

  // Audio Guide Actions
  const playAudioguide = (guide: Audioguide) => {
    setActiveAudioGuide(guide);
    setIsAudioPlaying(true);
    setIsAudioPaused(false);
    setAudioProgress(0);
    setAudioCurrentTimeSec(0);

    audioNarrator.speak(
      guide.narrativeText,
      guide.audioSeconds,
      (progress, timeSec) => {
        setAudioProgress(progress);
        setAudioCurrentTimeSec(timeSec);
      },
      () => {
        setIsAudioPlaying(false);
        setIsAudioPaused(false);
        setAudioProgress(100);
      }
    );
  };

  const pauseAudioguide = () => {
    audioNarrator.pause();
    setIsAudioPaused(true);
    setIsAudioPlaying(false);
  };

  const resumeAudioguide = () => {
    audioNarrator.resume();
    setIsAudioPaused(false);
    setIsAudioPlaying(true);
  };

  const stopAudioguide = () => {
    audioNarrator.stop();
    setIsAudioPlaying(false);
    setIsAudioPaused(false);
    setActiveAudioGuide(null);
    setAudioProgress(0);
    setAudioCurrentTimeSec(0);
  };

  const setAudioPlaybackRate = (rate: number) => {
    setAudioPlaybackRateState(rate);
    audioNarrator.setPlaybackRate(rate);
  };

  // Passport Stamp unlock
  const unlockPassportStamp = (stampId: string) => {
    const today = new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    setPassportStamps((prev) =>
      prev.map((stamp) =>
        stamp.id === stampId ? { ...stamp, unlocked: true, unlockedAt: today } : stamp
      )
    );

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#eab308', '#10b981', '#3b82f6', '#8b5cf6'],
    });
  };

  // Security validation check: Only authorized municipal admins can alter data
  const checkIsAdminAuthorized = (): boolean => {
    try {
      const stored = localStorage.getItem('fray_turismo_admin_session_v1');
      if (!stored) return false;
      const user = JSON.parse(stored);
      const authorized = [
        'prensafray@gmail.com',
        'turismofray@gmail.com',
        'prensafraymarmerto@gmail.com',
        'turismo@fraymarmertoesquiu.gob.ar',
        'admin@fraymarmertoesquiu.gob.ar',
      ];
      return !!(user?.email && authorized.some((e) => e.toLowerCase() === user.email.toLowerCase()));
    } catch {
      return false;
    }
  };

  // Admin actions (Protected with authorization check)
  const addPlace = (newPlace: Omit<Place, 'id'>) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de agregar un lugar.');
      return;
    }
    const id = `place-${Date.now()}`;
    const safeImages = resolveSafePlaceImages(newPlace);
    const sanitizedPlace: Place = {
      ...newPlace,
      id,
      image: safeImages.image,
      gallery: safeImages.gallery,
    };
    setPlaces((prev) => [sanitizedPlace, ...prev]);
  };

  const updatePlace = (updated: Place) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de editar un lugar o modificar su validación.');
      return;
    }
    const initMatch = INITIAL_PLACES.find((p) => p.id === updated.id);
    const safeImages = resolveSafePlaceImages(updated, initMatch);
    const sanitizedUpdated: Place = {
      ...updated,
      image: safeImages.image,
      gallery: safeImages.gallery,
    };
    setPlaces((prev) => prev.map((p) => (p.id === sanitizedUpdated.id ? sanitizedUpdated : p)));
    if (selectedPlace?.id === sanitizedUpdated.id) {
      setSelectedPlace(sanitizedUpdated);
    }
  };

  const deletePlace = (id: string) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de eliminar un lugar.');
      return;
    }
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlace?.id === id) {
      setSelectedPlace(null);
    }
  };

  const addEvent = (newEvent: Omit<TouristEvent, 'id'>) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de agregar un evento.');
      return;
    }
    const id = `event-${Date.now()}`;
    setEvents((prev) => [{ ...newEvent, id }, ...prev]);
  };

  const updateEvent = (updated: TouristEvent) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de editar un evento.');
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const deleteEvent = (id: string) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de eliminar un evento.');
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addAudioguide = (newGuide: Omit<Audioguide, 'id'>) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de agregar una audioguía.');
      return;
    }
    const id = `audio-${Date.now()}`;
    setAudioguides((prev) => [{ ...newGuide, id }, ...prev]);
  };

  const updateAudioguide = (updated: Audioguide) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de modificar una audioguía.');
      return;
    }
    setAudioguides((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    if (activeAudioGuide?.id === updated.id) {
      setActiveAudioGuide(updated);
    }
  };

  const deleteAudioguide = (id: string) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de eliminar una audioguía.');
      return;
    }
    setAudioguides((prev) => prev.filter((g) => g.id !== id));
    if (activeAudioGuide?.id === id) {
      stopAudioguide();
    }
  };

  // Site Config Persistence & Mutation Handlers
  const persistSiteConfig = (updated: SiteConfig) => {
    setSiteConfigState(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    // Also push to server
    fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: updated }),
    }).catch((err) => console.warn('[SYNC ERROR] /api/site-config:', err));
  };

  const updateSiteConfig = (newConfig: Partial<SiteConfig>) => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de editar configuración del sitio.');
      return;
    }
    const updated: SiteConfig = {
      ...siteConfig,
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };
    persistSiteConfig(updated);
  };

  const updateHeroConfig = (hero: Partial<HeroConfig>) => {
    updateSiteConfig({ hero: { ...siteConfig.hero, ...hero } });
  };

  const updateCategoriesConfig = (categories: Partial<CategoriesSectionConfig>) => {
    updateSiteConfig({ categories: { ...siteConfig.categories, ...categories } });
  };

  const updateImperdiblesConfig = (imperdibles: Partial<ImperdiblesSectionConfig>) => {
    updateSiteConfig({ imperdibles: { ...siteConfig.imperdibles, ...imperdibles } });
  };

  const updateConoceFrayConfig = (conoce: Partial<ConoceFraySectionConfig>) => {
    updateSiteConfig({ conoceFray: { ...siteConfig.conoceFray, ...conoce } });
  };

  const updateQueHacerConfig = (queHacer: Partial<QueHacerSectionConfig>) => {
    updateSiteConfig({ queHacer: { ...siteConfig.queHacer, ...queHacer } });
  };

  const updateRecorridoEsquiuConfig = (recorrido: Partial<RecorridoEsquiuSectionConfig>) => {
    updateSiteConfig({ recorridoEsquiu: { ...siteConfig.recorridoEsquiu, ...recorrido } });
  };

  const updateEmblemaFeConfig = (emblema: Partial<EmblemaFeConfig>) => {
    updateSiteConfig({ emblemaFe: { ...siteConfig.emblemaFe, ...emblema } });
  };

  const updateFooterConfig = (footer: Partial<FooterConfig>) => {
    updateSiteConfig({ footer: { ...siteConfig.footer, ...footer } });
  };

  const resetSiteConfigToDefault = () => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de restaurar configuración.');
      return;
    }
    persistSiteConfig(DEFAULT_SITE_CONFIG);
  };

  const resetAllDataToDefault = () => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de restaurar base de datos.');
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.PLACES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIOGUIDES);
    localStorage.removeItem(STORAGE_KEYS.PASSPORT);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.SITE_CONFIG);

    setPlaces(INITIAL_PLACES);
    setEvents(INITIAL_EVENTS);
    setAudioguides(INITIAL_AUDIOGUIDES);
    setPassportStamps(INITIAL_PASSPORT_STAMPS);
    setFavorites(['casa-natal-esquiu', 'dique-las-pirquitas']);
    setUserLocation(INITIAL_USER_PRESETS[0]);
    setSiteConfigState(DEFAULT_SITE_CONFIG);
  };

  return (
    <DataContext.Provider
      value={{
        places: placesWithDistances,
        events,
        audioguides,
        experiences,
        passportStamps,
        badges,
        favorites,
        userLocation,
        isLocating,
        locationError,
        clearLocationError,
        activeCategory,
        searchQuery,
        selectedPlace,
        activeTab,
        activeAudioGuide,
        isAudioPlaying,
        isAudioPaused,
        audioProgress,
        audioCurrentTimeSec,
        audioPlaybackRate,

        // Modals & Popups
        isUsefulInfoModalOpen,
        setIsUsefulInfoModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isQrShareModalOpen,
        setIsQrShareModalOpen,
        isLocationPromptModalOpen,
        setIsLocationPromptModalOpen,
        allowLocationPermission,
        denyLocationPermission,
        retryLocationPermission,
        selectedStampForCheckIn,
        setSelectedStampForCheckIn,
        unlockPassportStamp,

        // Site config & editor
        siteConfig,
        sectionToEdit,
        setSectionToEdit,
        placeToEdit,
        setPlaceToEdit,
        isCreatePlaceModalOpen,
        setIsCreatePlaceModalOpen,
        updateSiteConfig,
        updateHeroConfig,
        updateCategoriesConfig,
        updateImperdiblesConfig,
        updateConoceFrayConfig,
        updateQueHacerConfig,
        updateRecorridoEsquiuConfig,
        updateEmblemaFeConfig,
        updateFooterConfig,
        resetSiteConfigToDefault,

        setActiveTab,
        setActiveCategory,
        setSearchQuery,
        setSelectedPlace,
        toggleFavorite,
        isFavorite,
        setUserLocation,
        requestRealGeolocation,

        playAudioguide,
        pauseAudioguide,
        resumeAudioguide,
        stopAudioguide,
        setAudioPlaybackRate,

        addPlace,
        updatePlace,
        deletePlace,
        addEvent,
        updateEvent,
        deleteEvent,
        addAudioguide,
        updateAudioguide,
        deleteAudioguide,
        resetAllDataToDefault,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
