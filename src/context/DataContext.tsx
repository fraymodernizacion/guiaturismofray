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
import {
  SiteConfig,
  HeroConfig,
  TourismOfficesSectionConfig,
  CategoriesSectionConfig,
  ImperdiblesSectionConfig,
  ConoceFraySectionConfig,
  QueHacerSectionConfig,
  RecorridoEsquiuSectionConfig,
  EmblemaFeConfig,
  FooterConfig,
} from '../types/siteConfig';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig';
import { calculateDistanceKm, isValidCoordinate } from '../utils/geoUtils';
import { computeTopographicalRouteEstimate, calculateHaversineKm } from '../utils/routesService';
import { audioNarrator } from '../utils/audioNarrator';

export interface SaveStatus {
  state: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
  updatedAt?: number;
}

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
  saveStatus: SaveStatus;
  sectionToEdit: string | null;
  setSectionToEdit: (section: string | null) => void;
  placeToEdit: Place | null;
  setPlaceToEdit: (place: Place | null) => void;
  isCreatePlaceModalOpen: boolean;
  setIsCreatePlaceModalOpen: (open: boolean) => void;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => Promise<boolean>;
  updateHeroConfig: (hero: Partial<HeroConfig>) => Promise<boolean>;
  updateTourismOfficesConfig: (tourismOffices: Partial<TourismOfficesSectionConfig>) => Promise<boolean>;
  updateCategoriesConfig: (categories: Partial<CategoriesSectionConfig>) => Promise<boolean>;
  updateImperdiblesConfig: (imperdibles: Partial<ImperdiblesSectionConfig>) => Promise<boolean>;
  updateConoceFrayConfig: (conoce: Partial<ConoceFraySectionConfig>) => Promise<boolean>;
  updateQueHacerConfig: (queHacer: Partial<QueHacerSectionConfig>) => Promise<boolean>;
  updateRecorridoEsquiuConfig: (recorrido: Partial<RecorridoEsquiuSectionConfig>) => Promise<boolean>;
  updateEmblemaFeConfig: (emblema: Partial<EmblemaFeConfig>) => Promise<boolean>;
  updateFooterConfig: (footer: Partial<FooterConfig>) => Promise<boolean>;
  resetSiteConfigToDefault: () => Promise<boolean>;

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
  addPlace: (place: Omit<Place, 'id'>) => Promise<boolean>;
  updatePlace: (place: Place) => Promise<boolean>;
  deletePlace: (id: string) => Promise<boolean>;
  addEvent: (event: Omit<TouristEvent, 'id'>) => Promise<boolean>;
  updateEvent: (event: TouristEvent) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  addAudioguide: (guide: Omit<Audioguide, 'id'>) => Promise<boolean>;
  updateAudioguide: (guide: Audioguide) => Promise<boolean>;
  deleteAudioguide: (id: string) => Promise<boolean>;
  resetAllDataToDefault: () => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLACES: 'fray_turismo_places_v2',
  PLACES_UPDATED_AT: 'fray_turismo_places_updated_at_v1',
  EVENTS: 'fray_turismo_events_v2',
  EVENTS_UPDATED_AT: 'fray_turismo_events_updated_at_v1',
  AUDIOGUIDES: 'fray_turismo_audioguides_v2',
  AUDIOGUIDES_UPDATED_AT: 'fray_turismo_audioguides_updated_at_v1',
  PASSPORT: 'fray_turismo_passport_v2',
  FAVORITES: 'fray_turismo_favorites_v2',
  LOCATION: 'fray_turismo_location_v2',
  SITE_CONFIG: 'fray_turismo_site_config_v1',
  SITE_CONFIG_UPDATED_AT: 'fray_turismo_site_config_updated_at_v1',
  LOCATION_PROMPT_SEEN: 'fray_turismo_location_prompt_seen_v1',
};

const HARD_REMOVED_PLACE_IDS = new Set([
  'campanas-del-rosario',
  'casa-de-te-la-calera',
  'helados-plaza-sanjose',
  'casona-piedra-blanca',
  'parrilla-el-quincho',
  'astor-pizza-in-te-glia',
  'buena-vida-resto',
]);

const safeLocalStorageSet = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[STORAGE] Could not write ${key} to localStorage:`, err);
  }
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
 * Prioriza SIEMPRE las fotografías cargadas por el administrador (/uploads/, /images/, etc.)
 * y respeta la eliminación explícita cuando `respectExplicitEmpty` está activo.
 */
export const resolveSafePlaceImages = (
  stored?: Partial<Place> | null,
  initial?: Place,
  respectExplicitEmpty: boolean = false
): { image: string; gallery: string[] } => {
  const initialImage =
    initial?.image && isValidImagePath(initial.image)
      ? normalizeLegacyImagePath(initial.image)
      : '';
  const initialGallery = Array.isArray(initial?.gallery)
    ? Array.from(new Set(initial.gallery.filter(isValidImagePath).map((u) => normalizeLegacyImagePath(u))))
    : [];

  let resolvedImage = '';
  const storedHasValidImage = Boolean(stored && stored.image && isValidImagePath(stored.image));
  const storedExplicitlyEmpty = Boolean(
    stored &&
      stored.image !== undefined &&
      String(stored.image).trim() === '' &&
      respectExplicitEmpty
  );

  if (storedHasValidImage) {
    resolvedImage = normalizeLegacyImagePath(stored!.image);
  } else if (storedExplicitlyEmpty) {
    resolvedImage = '';
  } else if (initialImage) {
    resolvedImage = initialImage;
  }

  let resolvedGallery: string[] = [];
  if (stored && Array.isArray(stored.gallery)) {
    const validStoredGallery = Array.from(
      new Set(stored.gallery.filter(isValidImagePath).map((u) => normalizeLegacyImagePath(u)))
    );
    if (validStoredGallery.length > 0) {
      resolvedGallery = validStoredGallery;
    } else if (!respectExplicitEmpty && initialGallery.length > 0 && !storedExplicitlyEmpty) {
      resolvedGallery = initialGallery;
    }
  } else if (initialGallery.length > 0) {
    resolvedGallery = initialGallery;
  }

  if (resolvedImage && !resolvedGallery.includes(resolvedImage)) {
    resolvedGallery = [resolvedImage, ...resolvedGallery];
  } else if (!resolvedImage && resolvedGallery.length > 0 && !respectExplicitEmpty) {
    resolvedImage = resolvedGallery[0];
  }

  return {
    image: resolvedImage,
    gallery: resolvedGallery,
  };
};

/**
 * Fusiona los datos persistidos en servidor/cliente con el baseline inicial.
 * REGLA FUNDAMENTAL: toda edición guardada por el administrador (textos, fotos, horarios,
 * coordenadas, contactos, validación) SIEMPRE prevalece y jamás se sobrescribe al recargar.
 */
export const mergePlaceWithBaseline = (
  initPlace: Place,
  storedPlace?: Partial<Place>
): Place => {
  if (!storedPlace) return initPlace;

  const { image, gallery } = resolveSafePlaceImages(storedPlace, initPlace, false);

  const resolvedLat =
    typeof storedPlace.lat === 'number' && !isNaN(storedPlace.lat)
      ? storedPlace.lat
      : initPlace.lat;

  const resolvedLng =
    typeof storedPlace.lng === 'number' && !isNaN(storedPlace.lng)
      ? storedPlace.lng
      : initPlace.lng;

  const merged: Place = {
    ...initPlace,
    ...storedPlace,
    id: initPlace.id,
    name: storedPlace.name !== undefined && storedPlace.name.trim() !== '' ? storedPlace.name : initPlace.name,
    shortDescription:
      storedPlace.shortDescription !== undefined ? storedPlace.shortDescription : initPlace.shortDescription,
    description:
      storedPlace.description !== undefined ? storedPlace.description : initPlace.description,
    address: storedPlace.address !== undefined ? storedPlace.address : initPlace.address,
    locality: storedPlace.locality !== undefined ? storedPlace.locality : initPlace.locality,
    openingHours:
      storedPlace.openingHours !== undefined ? storedPlace.openingHours : initPlace.openingHours,
    phone: storedPlace.phone !== undefined ? storedPlace.phone : initPlace.phone,
    whatsapp: storedPlace.whatsapp !== undefined ? storedPlace.whatsapp : initPlace.whatsapp,
    googleMapsUrl:
      storedPlace.googleMapsUrl !== undefined ? storedPlace.googleMapsUrl : initPlace.googleMapsUrl,
    tags: Array.isArray(storedPlace.tags) ? storedPlace.tags : initPlace.tags,
    services: Array.isArray(storedPlace.services) ? storedPlace.services : initPlace.services,
    secondaryCategories:
      storedPlace.secondaryCategories !== undefined
        ? storedPlace.secondaryCategories
        : initPlace.secondaryCategories,
    image,
    gallery,
    lat: resolvedLat,
    lng: resolvedLng,
  };

  // Si ya cuenta con fotografía válida cargada, limpiar nota de foto pendiente
  if (image && image.trim() !== '') {
    merged.photoPendingNote = undefined;
  }

  return merged;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Places state - preserve stored modifications & photographs without clobbering edits
  const [places, setPlaces] = useState<Place[]>(() => {
    const storedConfig = getStoredOrDefault<SiteConfig>(STORAGE_KEYS.SITE_CONFIG, '', DEFAULT_SITE_CONFIG);
    const deletedIds = new Set<string>([
      ...Array.from(HARD_REMOVED_PLACE_IDS),
      ...(Array.isArray(storedConfig?.deletedPlaceIds) ? storedConfig.deletedPlaceIds : []),
    ]);

    const raw = getStoredOrDefault<Place[]>(STORAGE_KEYS.PLACES, '', INITIAL_PLACES);
    if (!Array.isArray(raw) || raw.length === 0) {
      return INITIAL_PLACES.filter((p) => !deletedIds.has(p.id));
    }

    const storedMap = new Map(raw.map((p) => [p.id, p]));
    const mergedBaseline = INITIAL_PLACES.filter((p) => !deletedIds.has(p.id)).map((initPlace) => {
      const stored = storedMap.get(initPlace.id);
      if (stored) {
        storedMap.delete(initPlace.id);
        return mergePlaceWithBaseline(initPlace, stored);
      }
      return initPlace;
    });

    const additionalPlaces = Array.from(storedMap.values())
      .filter((p) => p && p.id && !deletedIds.has(p.id))
      .map((p) => {
        const { image, gallery } = resolveSafePlaceImages(p, undefined, true);
        return { ...p, image, gallery, ...(image ? { photoPendingNote: undefined } : {}) };
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

  // Audioguides state with image fallback & official audioUrl upgrade
  const [audioguides, setAudioguides] = useState<Audioguide[]>(() => {
    const raw = getStoredOrDefault<Audioguide[]>(STORAGE_KEYS.AUDIOGUIDES, 'fray_verano_audioguides_v1', INITIAL_AUDIOGUIDES);
    if (!Array.isArray(raw) || raw.length === 0) return INITIAL_AUDIOGUIDES;
    const storedMap = new Map(raw.map((g) => [g.id, g]));
    const merged = INITIAL_AUDIOGUIDES.map((initGuide) => {
      const stored = storedMap.get(initGuide.id);
      if (!stored) return initGuide;
      storedMap.delete(initGuide.id);
      // If baseline now has an official recorded audioUrl that stored copy lacked, replace with the new official audioguide
      if (initGuide.audioUrl && !stored.audioUrl) {
        return initGuide;
      }
      const coverImage = stored.coverImage && isValidImagePath(stored.coverImage)
        ? normalizeLegacyImagePath(stored.coverImage)
        : (initGuide.coverImage && isValidImagePath(initGuide.coverImage) ? normalizeLegacyImagePath(initGuide.coverImage) : '');
      const hasRemovedNextPlace = stored.nextPlaceId === 'casa-de-te-la-calera';
      return {
        ...initGuide,
        ...stored,
        audioUrl: stored.audioUrl || initGuide.audioUrl,
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
    return Array.isArray(raw)
      ? raw.filter((id) => id !== 'casa-de-te-la-calera' && id !== 'helados-plaza-sanjose')
      : ['casa-natal-esquiu', 'dique-las-pirquitas'];
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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ state: 'idle' });

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
      tourismOffices: {
        ...(DEFAULT_SITE_CONFIG.tourismOffices || { title: 'Oficinas de Turismo', sharedPhone: '', offices: [] }),
        ...(stored?.tourismOffices || {}),
      },
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

  // Always keep refs synced with latest state so explicit server saves never read stale closures
  const placesRef = useRef<Place[]>(places);
  placesRef.current = places;
  const eventsRef = useRef<TouristEvent[]>(events);
  eventsRef.current = events;
  const audioguidesRef = useRef<Audioguide[]>(audioguides);
  audioguidesRef.current = audioguides;
  const siteConfigRef = useRef<SiteConfig>(siteConfig);
  siteConfigRef.current = siteConfig;

  // Hydrate siteConfig, places, events, and audioguides from persistent server on mount
  useEffect(() => {
    let isMounted = true;

    const hydrateFromServer = async () => {
      let deletedFromServer: string[] = [];

      const getLocalUpdatedAt = (key: string): number => {
        try {
          const val = Number(localStorage.getItem(key) || '0');
          return Number.isFinite(val) ? val : 0;
        } catch {
          return 0;
        }
      };

      const isAdminLocal = (() => {
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
      })();

      // 1. Hydrate Site Config first so deletedPlaceIds is known before merging places
      try {
        const res = await fetch('/api/site-config', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverTs = Number(data?.revisionTimestamp || 0);
          const localTs = getLocalUpdatedAt(STORAGE_KEYS.SITE_CONFIG_UPDATED_AT);

          if (localTs > serverTs && isAdminLocal) {
            // Re-sync newer local admin config to server revision store
            fetch('/api/site-config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ config: siteConfigRef.current }),
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((saved) => {
                if (saved?.revisionTimestamp) {
                  safeLocalStorageSet(STORAGE_KEYS.SITE_CONFIG_UPDATED_AT, saved.revisionTimestamp);
                }
              })
              .catch(() => {});
          } else if (isMounted && data?.config && typeof data.config === 'object') {
            if (Array.isArray(data.config.deletedPlaceIds)) {
              deletedFromServer = data.config.deletedPlaceIds;
            }
            const serverHero = data.config.hero || {};
            const migratedHeroSubtitle =
              serverHero.subtitle ===
              'Valles serranos, agua esmeralda, cuna del Beato y tradiciones vivas en Catamarca.'
                ? DEFAULT_SITE_CONFIG.hero.subtitle
                : serverHero.subtitle;

            setSiteConfigState((prev) => {
              const mergedConfig: SiteConfig = {
                ...DEFAULT_SITE_CONFIG,
                ...prev,
                ...data.config,
                tourismOffices: {
                  ...(DEFAULT_SITE_CONFIG.tourismOffices || { title: 'Oficinas de Turismo', sharedPhone: '', offices: [] }),
                  ...(prev.tourismOffices || {}),
                  ...(data.config.tourismOffices || {}),
                },
                hero: {
                  ...DEFAULT_SITE_CONFIG.hero,
                  ...(prev.hero || {}),
                  ...serverHero,
                  ...(serverHero.bgImage ? { bgImage: normalizeLegacyImagePath(serverHero.bgImage) } : {}),
                  ...(migratedHeroSubtitle ? { subtitle: migratedHeroSubtitle } : {}),
                },
                categories: {
                  ...DEFAULT_SITE_CONFIG.categories,
                  ...(prev.categories || {}),
                  ...(data.config.categories || {}),
                },
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
                conoceFray: {
                  ...DEFAULT_SITE_CONFIG.conoceFray,
                  ...(prev.conoceFray || {}),
                  ...(data.config.conoceFray || {}),
                },
                queHacer: {
                  ...DEFAULT_SITE_CONFIG.queHacer,
                  ...(prev.queHacer || {}),
                  ...(data.config.queHacer || {}),
                },
                recorridoEsquiu: {
                  ...DEFAULT_SITE_CONFIG.recorridoEsquiu,
                  ...(prev.recorridoEsquiu || {}),
                  ...(data.config.recorridoEsquiu || {}),
                },
                emblemaFe: {
                  ...DEFAULT_SITE_CONFIG.emblemaFe,
                  ...(prev.emblemaFe || {}),
                  ...(data.config.emblemaFe || {}),
                },
                footer: {
                  ...DEFAULT_SITE_CONFIG.footer,
                  ...(prev.footer || {}),
                  ...(data.config.footer || {}),
                },
              };
              siteConfigRef.current = mergedConfig;
              safeLocalStorageSet(STORAGE_KEYS.SITE_CONFIG, mergedConfig);
              if (serverTs > 0) {
                safeLocalStorageSet(STORAGE_KEYS.SITE_CONFIG_UPDATED_AT, serverTs);
              }
              return mergedConfig;
            });
          }
        }
      } catch (err: any) {
        console.warn('[SYNC] Notice: /api/site-config initial load:', err?.message);
      }

      // 2. Hydrate Places (with automatic recovery of unsynced local admin edits)
      try {
        const localCachedPlaces = getStoredOrDefault<Place[]>(STORAGE_KEYS.PLACES, '', []);
        const localMap = new Map<string, Place>(
          Array.isArray(localCachedPlaces)
            ? localCachedPlaces.filter((p) => p && p.id).map((p) => [p.id, p])
            : []
        );
        const localPlacesTs = getLocalUpdatedAt(STORAGE_KEYS.PLACES_UPDATED_AT);

        const res = await fetch('/api/places', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverPlacesTs = Number(data?.revisionTimestamp || 0);

          if (isMounted && Array.isArray(data?.places) && data.places.length > 0) {
            const serverPlaces = data.places as Place[];
            const deletedIds = new Set<string>([
              ...Array.from(HARD_REMOVED_PLACE_IDS),
              ...deletedFromServer,
              ...(Array.isArray(siteConfigRef.current?.deletedPlaceIds)
                ? siteConfigRef.current.deletedPlaceIds
                : []),
            ]);
            const serverMap = new Map<string, Place>(serverPlaces.map((p) => [p.id, p]));
            let recoveredFromLocal = false;

            const rescueLocalFields = (serverMerged: Place, localCandidate?: Place): Place => {
              if (!localCandidate) return serverMerged;

              // If this browser saved edits strictly after the server's latest revision, local wins
              if (localPlacesTs > serverPlacesTs && isAdminLocal) {
                recoveredFromLocal = true;
                return mergePlaceWithBaseline(serverMerged, localCandidate);
              }

              // Even without a prior timestamp, rescue non-empty fields that were added locally
              // (e.g., Google Maps URLs, uploaded photos, coordinates, hours, contacts)
              const patched: Place = { ...serverMerged };
              let changed = false;

              const localMaps = (localCandidate.googleMapsUrl || '').trim();
              const serverMaps = (serverMerged.googleMapsUrl || '').trim();
              if (localMaps && (!serverMaps || (serverPlacesTs === 0 && isAdminLocal && localMaps !== serverMaps))) {
                patched.googleMapsUrl = localMaps;
                changed = true;
              }

              const localImg = (localCandidate.image || '').trim();
              const serverImg = (serverMerged.image || '').trim();
              if (localImg && localImg.startsWith('/uploads/') && (!serverImg || (serverPlacesTs === 0 && isAdminLocal && localImg !== serverImg))) {
                patched.image = localImg;
                patched.gallery = Array.from(
                  new Set([localImg, ...(Array.isArray(localCandidate.gallery) ? localCandidate.gallery : [])])
                );
                patched.photoPendingNote = undefined;
                changed = true;
              }

              if (
                isValidCoordinate(localCandidate.lat, localCandidate.lng) &&
                (!isValidCoordinate(serverMerged.lat, serverMerged.lng) ||
                  (serverPlacesTs === 0 &&
                    isAdminLocal &&
                    (localCandidate.lat !== serverMerged.lat || localCandidate.lng !== serverMerged.lng)))
              ) {
                patched.lat = localCandidate.lat;
                patched.lng = localCandidate.lng;
                changed = true;
              }

              const optionalTextFields = ['openingHours', 'phone', 'whatsapp', 'instagram', 'address'] as const;
              for (const field of optionalTextFields) {
                const lv = (localCandidate[field] || '').trim();
                const sv = (serverMerged[field] || '').trim();
                if (lv && (!sv || (serverPlacesTs === 0 && isAdminLocal && lv !== sv))) {
                  patched[field] = lv;
                  changed = true;
                }
              }

              if (changed) {
                recoveredFromLocal = true;
              }
              return patched;
            };

            const mergedBaseline: Place[] = INITIAL_PLACES.filter((init) => !deletedIds.has(init.id)).map(
              (init) => {
                const serverItem = serverMap.get(init.id);
                if (serverItem) {
                  serverMap.delete(init.id);
                  const baseMerged = mergePlaceWithBaseline(init, serverItem);
                  return rescueLocalFields(baseMerged, localMap.get(init.id));
                }
                return rescueLocalFields(init, localMap.get(init.id));
              }
            );

            const remainingServer = Array.from(serverMap.values())
              .filter((p) => p && p.id && !deletedIds.has(p.id))
              .map((p) => {
                const { image, gallery } = resolveSafePlaceImages(p, undefined, true);
                const normalized = { ...p, image, gallery, ...(image ? { photoPendingNote: undefined } : {}) };
                return rescueLocalFields(normalized, localMap.get(p.id));
              });

            // Also recover any brand-new custom places created locally if local timestamp is newer
            const knownIds = new Set([...mergedBaseline, ...remainingServer].map((p) => p.id));
            const recoveredNewLocal: Place[] = [];
            if (localPlacesTs > serverPlacesTs && isAdminLocal) {
              for (const lp of localMap.values()) {
                if (lp && lp.id && !knownIds.has(lp.id) && !deletedIds.has(lp.id)) {
                  recoveredNewLocal.push(lp);
                  recoveredFromLocal = true;
                }
              }
            }

            const finalPlaces = [...recoveredNewLocal, ...mergedBaseline, ...remainingServer];
            placesRef.current = finalPlaces;
            setPlaces(finalPlaces);
            safeLocalStorageSet(STORAGE_KEYS.PLACES, finalPlaces);

            if (recoveredFromLocal && isAdminLocal) {
              // Automatically push recovered local edits into the server's append-only revision store
              fetch('/api/places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ places: finalPlaces }),
              })
                .then((r) => (r.ok ? r.json() : null))
                .then((saved) => {
                  if (saved?.revisionTimestamp) {
                    safeLocalStorageSet(STORAGE_KEYS.PLACES_UPDATED_AT, saved.revisionTimestamp);
                    if (isMounted) {
                      setSaveStatus({
                        state: 'saved',
                        message: 'Cambios recuperados y guardados permanentemente en el servidor',
                        updatedAt: Date.now(),
                      });
                    }
                  }
                })
                .catch((err) => console.warn('[SYNC] Auto-recovery push failed:', err));
            } else if (serverPlacesTs > 0) {
              safeLocalStorageSet(STORAGE_KEYS.PLACES_UPDATED_AT, serverPlacesTs);
            }
          }
        }
      } catch (err: any) {
        console.warn('[SYNC] Notice: /api/places initial load:', err?.message);
      }

      // 3. Hydrate Events from server
      try {
        const res = await fetch('/api/events', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverTs = Number(data?.revisionTimestamp || 0);
          const localTs = getLocalUpdatedAt(STORAGE_KEYS.EVENTS_UPDATED_AT);
          if (localTs > serverTs && isAdminLocal) {
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ events: eventsRef.current }),
            }).catch(() => {});
          } else if (isMounted && Array.isArray(data?.events)) {
            const filteredEvents = (data.events as TouristEvent[]).filter(
              (ev) => ev && ev.placeId !== 'casa-de-te-la-calera' && ev.id !== 'ev-taller-ceramica'
            );
            eventsRef.current = filteredEvents;
            setEvents(filteredEvents);
            safeLocalStorageSet(STORAGE_KEYS.EVENTS, filteredEvents);
            if (serverTs > 0) safeLocalStorageSet(STORAGE_KEYS.EVENTS_UPDATED_AT, serverTs);
          }
        }
      } catch (err: any) {
        console.warn('[SYNC] Notice: /api/events initial load:', err?.message);
      }

      // 4. Hydrate Audioguides from server
      try {
        const res = await fetch('/api/audioguides', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverTs = Number(data?.revisionTimestamp || 0);
          const localTs = getLocalUpdatedAt(STORAGE_KEYS.AUDIOGUIDES_UPDATED_AT);
          if (localTs > serverTs && isAdminLocal) {
            fetch('/api/audioguides', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioguides: audioguidesRef.current }),
            }).catch(() => {});
          } else if (isMounted && Array.isArray(data?.audioguides) && data.audioguides.length > 0) {
            const initById = new Map(INITIAL_AUDIOGUIDES.map((g) => [g.id, g]));
            const serverGuides = (data.audioguides as Audioguide[]).map((g) => {
              const initMatch = initById.get(g.id);
              if (initMatch?.audioUrl && !g.audioUrl) {
                return initMatch;
              }
              return {
                ...g,
                audioUrl: g.audioUrl || initMatch?.audioUrl,
                coverImage: g.coverImage ? normalizeLegacyImagePath(g.coverImage) : (initMatch?.coverImage || ''),
              };
            });
            audioguidesRef.current = serverGuides;
            setAudioguides(serverGuides);
            safeLocalStorageSet(STORAGE_KEYS.AUDIOGUIDES, serverGuides);
            if (serverTs > 0) safeLocalStorageSet(STORAGE_KEYS.AUDIOGUIDES_UPDATED_AT, serverTs);
          }
        }
      } catch (err: any) {
        console.warn('[SYNC] Notice: /api/audioguides initial load:', err?.message);
      }
    };

    hydrateFromServer();

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

  // Keep lightweight client-only preferences synced to localStorage safely
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.PASSPORT, passportStamps);
  }, [passportStamps]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  const setUserLocation = (loc: UserLocation) => {
    // If switching to manual preset, clear any real-time GPS watcher
    if (!loc.isRealGps && watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setUserLocationState(loc);
    safeLocalStorageSet(STORAGE_KEYS.LOCATION, loc);
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
      },
      guide.audioUrl
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

  // Explicit server persistence helpers (never called accidentally on public page load)
  const persistPlacesToServer = async (nextPlaces: Place[]): Promise<boolean> => {
    const saveTs = Date.now();
    placesRef.current = nextPlaces;
    setPlaces(nextPlaces);
    safeLocalStorageSet(STORAGE_KEYS.PLACES, nextPlaces);
    safeLocalStorageSet(STORAGE_KEYS.PLACES_UPDATED_AT, saveTs);
    setSaveStatus({ state: 'saving', message: 'Guardando cambios en el servidor...' });
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ places: nextPlaces }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Error HTTP ${res.status}`);
      }
      const saved = await res.json().catch(() => ({}));
      if (saved?.revisionTimestamp) {
        safeLocalStorageSet(STORAGE_KEYS.PLACES_UPDATED_AT, saved.revisionTimestamp);
      }
      setSaveStatus({ state: 'saved', message: 'Cambios guardados permanentemente', updatedAt: Date.now() });
      return true;
    } catch (err: any) {
      console.error('[SYNC ERROR] /api/places:', err);
      setSaveStatus({
        state: 'error',
        message: err?.message || 'No se pudo guardar en el servidor. Intentá nuevamente.',
        updatedAt: Date.now(),
      });
      return false;
    }
  };

  const persistEventsToServer = async (nextEvents: TouristEvent[]): Promise<boolean> => {
    const saveTs = Date.now();
    eventsRef.current = nextEvents;
    setEvents(nextEvents);
    safeLocalStorageSet(STORAGE_KEYS.EVENTS, nextEvents);
    safeLocalStorageSet(STORAGE_KEYS.EVENTS_UPDATED_AT, saveTs);
    setSaveStatus({ state: 'saving', message: 'Guardando agenda...' });
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: nextEvents }),
      });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const saved = await res.json().catch(() => ({}));
      if (saved?.revisionTimestamp) {
        safeLocalStorageSet(STORAGE_KEYS.EVENTS_UPDATED_AT, saved.revisionTimestamp);
      }
      setSaveStatus({ state: 'saved', message: 'Agenda guardada permanentemente', updatedAt: Date.now() });
      return true;
    } catch (err: any) {
      console.error('[SYNC ERROR] /api/events:', err);
      setSaveStatus({ state: 'error', message: 'Error al guardar la agenda en el servidor', updatedAt: Date.now() });
      return false;
    }
  };

  const persistAudioguidesToServer = async (nextGuides: Audioguide[]): Promise<boolean> => {
    const saveTs = Date.now();
    audioguidesRef.current = nextGuides;
    setAudioguides(nextGuides);
    safeLocalStorageSet(STORAGE_KEYS.AUDIOGUIDES, nextGuides);
    safeLocalStorageSet(STORAGE_KEYS.AUDIOGUIDES_UPDATED_AT, saveTs);
    setSaveStatus({ state: 'saving', message: 'Guardando audioguías...' });
    try {
      const res = await fetch('/api/audioguides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioguides: nextGuides }),
      });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const saved = await res.json().catch(() => ({}));
      if (saved?.revisionTimestamp) {
        safeLocalStorageSet(STORAGE_KEYS.AUDIOGUIDES_UPDATED_AT, saved.revisionTimestamp);
      }
      setSaveStatus({ state: 'saved', message: 'Audioguía guardada permanentemente', updatedAt: Date.now() });
      return true;
    } catch (err: any) {
      console.error('[SYNC ERROR] /api/audioguides:', err);
      setSaveStatus({ state: 'error', message: 'Error al guardar audioguías en el servidor', updatedAt: Date.now() });
      return false;
    }
  };

  const persistSiteConfig = async (updated: SiteConfig): Promise<boolean> => {
    const saveTs = Date.now();
    siteConfigRef.current = updated;
    setSiteConfigState(updated);
    safeLocalStorageSet(STORAGE_KEYS.SITE_CONFIG, updated);
    safeLocalStorageSet(STORAGE_KEYS.SITE_CONFIG_UPDATED_AT, saveTs);
    setSaveStatus({ state: 'saving', message: 'Guardando sección en el servidor...' });
    try {
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: updated }),
      });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const saved = await res.json().catch(() => ({}));
      if (saved?.revisionTimestamp) {
        safeLocalStorageSet(STORAGE_KEYS.SITE_CONFIG_UPDATED_AT, saved.revisionTimestamp);
      }
      setSaveStatus({ state: 'saved', message: 'Sección guardada permanentemente', updatedAt: Date.now() });
      return true;
    } catch (err: any) {
      console.error('[SYNC ERROR] /api/site-config:', err);
      setSaveStatus({
        state: 'error',
        message: 'No se pudo guardar la sección en el servidor.',
        updatedAt: Date.now(),
      });
      return false;
    }
  };

  // Admin actions (Protected with authorization check + explicit server persistence)
  const addPlace = async (newPlace: Omit<Place, 'id'>): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de agregar un lugar.');
      return false;
    }
    const id = `place-${Date.now()}`;
    const safeImages = resolveSafePlaceImages(newPlace, undefined, true);
    const sanitizedPlace: Place = {
      ...newPlace,
      id,
      image: safeImages.image,
      gallery: safeImages.gallery,
      ...(safeImages.image ? { photoPendingNote: undefined } : {}),
    };
    const nextPlaces = [sanitizedPlace, ...placesRef.current];
    return persistPlacesToServer(nextPlaces);
  };

  const updatePlace = async (updated: Place): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de editar un lugar o modificar su validación.');
      return false;
    }
    const safeImages = resolveSafePlaceImages(updated, undefined, true);
    const sanitizedUpdated: Place = {
      ...updated,
      image: safeImages.image,
      gallery: safeImages.gallery,
      ...(safeImages.image ? { photoPendingNote: undefined } : {}),
    };
    const nextPlaces = placesRef.current.map((p) =>
      p.id === sanitizedUpdated.id ? sanitizedUpdated : p
    );
    if (selectedPlace?.id === sanitizedUpdated.id) {
      setSelectedPlace(sanitizedUpdated);
    }
    return persistPlacesToServer(nextPlaces);
  };

  const deletePlace = async (id: string): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de eliminar un lugar.');
      return false;
    }
    const nextPlaces = placesRef.current.filter((p) => p.id !== id);
    if (selectedPlace?.id === id) {
      setSelectedPlace(null);
    }
    const existingDeleted = Array.isArray(siteConfigRef.current.deletedPlaceIds)
      ? siteConfigRef.current.deletedPlaceIds
      : [];
    const nextDeleted = Array.from(new Set([...existingDeleted, id]));
    const [placesOk] = await Promise.all([
      persistPlacesToServer(nextPlaces),
      persistSiteConfig({
        ...siteConfigRef.current,
        deletedPlaceIds: nextDeleted,
        updatedAt: new Date().toISOString(),
      }),
    ]);
    return placesOk;
  };

  const addEvent = async (newEvent: Omit<TouristEvent, 'id'>): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de agregar un evento.');
      return false;
    }
    const id = `event-${Date.now()}`;
    const nextEvents = [{ ...newEvent, id }, ...eventsRef.current];
    return persistEventsToServer(nextEvents);
  };

  const updateEvent = async (updated: TouristEvent): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de editar un evento.');
      return false;
    }
    const nextEvents = eventsRef.current.map((e) => (e.id === updated.id ? updated : e));
    return persistEventsToServer(nextEvents);
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de eliminar un evento.');
      return false;
    }
    const nextEvents = eventsRef.current.filter((e) => e.id !== id);
    return persistEventsToServer(nextEvents);
  };

  const addAudioguide = async (newGuide: Omit<Audioguide, 'id'>): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de agregar una audioguía.');
      return false;
    }
    const id = `audio-${Date.now()}`;
    const nextGuides = [{ ...newGuide, id }, ...audioguidesRef.current];
    return persistAudioguidesToServer(nextGuides);
  };

  const updateAudioguide = async (updated: Audioguide): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de modificar una audioguía.');
      return false;
    }
    const nextGuides = audioguidesRef.current.map((g) => (g.id === updated.id ? updated : g));
    if (activeAudioGuide?.id === updated.id) {
      setActiveAudioGuide(updated);
    }
    return persistAudioguidesToServer(nextGuides);
  };

  const deleteAudioguide = async (id: string): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de eliminar una audioguía.');
      return false;
    }
    const nextGuides = audioguidesRef.current.filter((g) => g.id !== id);
    if (activeAudioGuide?.id === id) {
      stopAudioguide();
    }
    return persistAudioguidesToServer(nextGuides);
  };

  const updateSiteConfig = async (newConfig: Partial<SiteConfig>): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de editar configuración del sitio.');
      return false;
    }
    const updated: SiteConfig = {
      ...siteConfigRef.current,
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };
    return persistSiteConfig(updated);
  };

  const updateHeroConfig = async (hero: Partial<HeroConfig>): Promise<boolean> => {
    return updateSiteConfig({ hero: { ...siteConfigRef.current.hero, ...hero } });
  };

  const updateTourismOfficesConfig = async (
    tourismOffices: Partial<TourismOfficesSectionConfig>
  ): Promise<boolean> => {
    const current = siteConfigRef.current.tourismOffices ||
      DEFAULT_SITE_CONFIG.tourismOffices || {
        title: 'Oficinas de Turismo',
        sharedPhone: '',
        offices: [],
      };
    return updateSiteConfig({
      tourismOffices: {
        ...current,
        ...tourismOffices,
      },
    });
  };

  const updateCategoriesConfig = async (categories: Partial<CategoriesSectionConfig>): Promise<boolean> => {
    return updateSiteConfig({ categories: { ...siteConfigRef.current.categories, ...categories } });
  };

  const updateImperdiblesConfig = async (imperdibles: Partial<ImperdiblesSectionConfig>): Promise<boolean> => {
    return updateSiteConfig({ imperdibles: { ...siteConfigRef.current.imperdibles, ...imperdibles } });
  };

  const updateConoceFrayConfig = async (conoce: Partial<ConoceFraySectionConfig>): Promise<boolean> => {
    return updateSiteConfig({ conoceFray: { ...siteConfigRef.current.conoceFray, ...conoce } });
  };

  const updateQueHacerConfig = async (queHacer: Partial<QueHacerSectionConfig>): Promise<boolean> => {
    return updateSiteConfig({ queHacer: { ...siteConfigRef.current.queHacer, ...queHacer } });
  };

  const updateRecorridoEsquiuConfig = async (recorrido: Partial<RecorridoEsquiuSectionConfig>): Promise<boolean> => {
    return updateSiteConfig({ recorridoEsquiu: { ...siteConfigRef.current.recorridoEsquiu, ...recorrido } });
  };

  const updateEmblemaFeConfig = async (emblema: Partial<EmblemaFeConfig>): Promise<boolean> => {
    return updateSiteConfig({ emblemaFe: { ...siteConfigRef.current.emblemaFe, ...emblema } });
  };

  const updateFooterConfig = async (footer: Partial<FooterConfig>): Promise<boolean> => {
    return updateSiteConfig({ footer: { ...siteConfigRef.current.footer, ...footer } });
  };

  const resetSiteConfigToDefault = async (): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de restaurar configuración.');
      return false;
    }
    return persistSiteConfig({ ...DEFAULT_SITE_CONFIG, updatedAt: new Date().toISOString() });
  };

  const resetAllDataToDefault = async (): Promise<boolean> => {
    if (!checkIsAdminAuthorized()) {
      console.warn('[ACCESO DENEGADO] Intento no autorizado de restaurar base de datos.');
      return false;
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.PLACES);
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.AUDIOGUIDES);
      localStorage.removeItem(STORAGE_KEYS.PASSPORT);
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      localStorage.removeItem(STORAGE_KEYS.SITE_CONFIG);
    } catch {}

    setPassportStamps(INITIAL_PASSPORT_STAMPS);
    setFavorites(['casa-natal-esquiu', 'dique-las-pirquitas']);
    setUserLocation(INITIAL_USER_PRESETS[0]);

    const results = await Promise.all([
      persistPlacesToServer(INITIAL_PLACES),
      persistEventsToServer(INITIAL_EVENTS),
      persistAudioguidesToServer(INITIAL_AUDIOGUIDES),
      persistSiteConfig({ ...DEFAULT_SITE_CONFIG, deletedPlaceIds: [], updatedAt: new Date().toISOString() }),
    ]);
    return results.every(Boolean);
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
        saveStatus,
        sectionToEdit,
        setSectionToEdit,
        placeToEdit,
        setPlaceToEdit,
        isCreatePlaceModalOpen,
        setIsCreatePlaceModalOpen,
        updateSiteConfig,
        updateHeroConfig,
        updateTourismOfficesConfig,
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
