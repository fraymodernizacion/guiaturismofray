import { CATEGORIES } from '../data/initialData';
import { CategoryId, Place } from '../types';

export interface ResolvedCategoryDisplay {
  label: string;
  shortLabel: string;
  emoji: string;
  keywords: string;
}

const EXTRA_CATEGORY_META: Record<string, ResolvedCategoryDisplay> = {
  historia: {
    label: 'Historia y Monumentos',
    shortLabel: 'Historia',
    emoji: '🏺',
    keywords: 'historia monumentos historicos patrimonio cultura artesanias',
  },
  senderos: {
    label: 'Senderos y Montaña',
    shortLabel: 'Senderos',
    emoji: '🥾',
    keywords: 'senderos trekking caminata montana sierras',
  },
  eventos: {
    label: 'Eventos y Cultura',
    shortLabel: 'Eventos',
    emoji: '🎭',
    keywords: 'eventos agenda festivales cultura penias',
  },
  audioguias: {
    label: 'Audioguías',
    shortLabel: 'Audioguías',
    emoji: '🎧',
    keywords: 'audioguias recorrido historia esquiu',
  },
  info: {
    label: 'Información útil',
    shortLabel: 'Info',
    emoji: 'ℹ️',
    keywords: 'informacion util servicios',
  },
};

const CATEGORY_SYNONYMS: Partial<Record<CategoryId, string>> = {
  visitar: 'lugares turisticos atractivos monumentos historicos paseos turismo',
  comer: 'bares y restaurantes gastronomia comida parrillada empanadas',
  merendar: 'bares cafeterias casas de te heladerias reposteria merienda',
  campings: 'piletas campings natacion acampe recreativo clubes quinta',
  dormir: 'alojamientos hospedaje cabanas hosterias posadas hoteles',
  naturaleza: 'lugares turisticos naturaleza dique rios balnearios sierras paisajes',
  religioso: 'monumentos historicos iglesias templos santuarios turismo religioso patrimonio',
  actividades: 'actividades deportes kayak senderismo paseos recreacion',
  historia: 'monumentos historicos historia patrimonio cultura artesanias',
};

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCategoryDisplay(categoryId: CategoryId): ResolvedCategoryDisplay {
  const found = CATEGORIES.find((c) => c.id === categoryId);
  if (found) {
    return {
      label: found.label,
      shortLabel: found.shortLabel,
      emoji: found.emoji,
      keywords: `${found.description} ${CATEGORY_SYNONYMS[categoryId] || ''}`,
    };
  }

  return (
    EXTRA_CATEGORY_META[categoryId] || {
      label: 'Atractivo turístico',
      shortLabel: 'Turismo',
      emoji: '📍',
      keywords: CATEGORY_SYNONYMS[categoryId] || 'lugares turisticos',
    }
  );
}

export function matchesPlaceSearch(place: Place, rawQuery: string): boolean {
  const normalizedQuery = normalizeSearchText(rawQuery);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  if (tokens.length === 0) return true;

  const categoryInfo = getCategoryDisplay(place.category);

  const searchableContent = normalizeSearchText(
    [
      place.name,
      place.locality,
      place.address,
      place.subCategory || '',
      place.shortDescription,
      place.description,
      place.category,
      categoryInfo.label,
      categoryInfo.shortLabel,
      categoryInfo.keywords,
      ...(place.tags || []),
      ...(place.services || []),
      place.isHeritageEsquiu ? 'patrimonio beato esquiu monumento historico' : '',
    ].join(' ')
  );

  return tokens.every((token) => searchableContent.includes(token));
}
