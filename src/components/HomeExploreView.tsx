import React, { useState } from 'react';
import {
  Search,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CategoryPills } from './CategoryPills';
import { PlaceCard } from './PlaceCard';
import { ReligiousPlaceCard } from './ReligiousPlaceCard';
import { ConoceFraySection } from './ConoceFraySection';
import { ImperdiblesSection } from './ImperdiblesSection';
import { RecorridoEsquiuSection } from './RecorridoEsquiuSection';
import { CATEGORIES } from '../data/initialData';
import { InstitutionalFooterBanner, TierraDeMilagrosBadge } from './BrandLogos';
import { SectionEditButton } from './SectionEditButton';
import { Place } from '../types';
import { getCategoryDisplay, matchesPlaceSearch } from '../utils/searchPlaces';

const RELIGIOUS_EXCEL_ORDER: string[] = [
  'iglesia-san-antonio-padua',
  'iglesia-san-jose',
  'casa-natal-esquiu',
  'capilla-nuestra-senora-del-rosario',
  'santuario-senor-de-los-milagros',
  'capilla-nuestra-senora-de-las-mercedes',
  'capilla-rosario-collagasta',
  'iglesia-san-francisco-asis',
  'capilla-santa-barbara',
  'iglesia-nuestra-senora-del-valle',
  'monumento-esquiu',
  'calvario-falda-san-antonio',
  'calvario-collagasta',
  'calvario-las-pirquitas',
];

interface SearchResultCardProps {
  place: Place;
  onSelect: (place: Place) => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ place, onSelect }) => {
  const [imgError, setImgError] = useState(false);
  const categoryInfo = getCategoryDisplay(place.category);
  const hasImage = Boolean(place.image && place.image.trim() !== '' && !imgError);

  return (
    <button
      type="button"
      id={`search-result-${place.id}`}
      onClick={() => onSelect(place)}
      className="w-full text-left bg-white hover:bg-emerald-50/40 active:scale-[0.99] rounded-2xl border border-slate-200 hover:border-emerald-400 p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition flex items-center gap-3.5 sm:gap-4 group focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500"
    >
      {hasImage && (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70">
          <img
            src={place.image}
            alt={place.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800">
          <span aria-hidden="true">{categoryInfo.emoji}</span>
          <span className="truncate">{categoryInfo.label}</span>
          {place.locality && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium truncate">{place.locality}</span>
            </>
          )}
        </div>

        <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
          {place.name}
        </h3>

        {place.shortDescription && (
          <p className="text-sm text-slate-600 line-clamp-1">
            {place.shortDescription}
          </p>
        )}
      </div>

      <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
        <ChevronRight className="w-5 h-5" />
      </div>
    </button>
  );
};

export const HomeExploreView: React.FC = () => {
  const {
    places,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    setSelectedPlace,
    siteConfig,
  } = useData();

  const { isAuthenticated, isEditorMode } = useAuth();
  const heroData = siteConfig?.hero || {
    title: 'FRAY TURISMO',
    subtitle: 'Un lugar para descubrir, disfrutar y volver a visitar.',
    tagline: 'Naturaleza · Historia · Paisaje',
    locationBadge: 'Catamarca · Argentina',
    seasonBadge: 'Guía Oficial de Verano',
    bgImage: '/images/dique-las-pirquitas.webp',
    searchPlaceholder: '¿Qué lugar estás buscando?',
  };

  const hasSearchQuery = Boolean(searchQuery && searchQuery.trim() !== '');

  // Search across all existing categories, names, localities, descriptions, tags, and services
  const searchMatchedPlaces = hasSearchQuery
    ? places.filter((p) => matchesPlaceSearch(p, searchQuery))
    : [];

  // Category filter when browsing by category pills
  const categoryFilteredPlaces = activeCategory
    ? places
        .filter((p) => p.category === activeCategory || p.secondaryCategories?.includes(activeCategory))
        .sort((a, b) => {
          if (activeCategory !== 'religioso') return 0;
          const idxA = RELIGIOUS_EXCEL_ORDER.indexOf(a.id);
          const idxB = RELIGIOUS_EXCEL_ORDER.indexOf(b.id);
          return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        })
    : [];

  const isCategoryFiltering = Boolean(activeCategory && !hasSearchQuery);

  return (
    <div id="home-view" className="space-y-8 pb-10">
      {/* 1. HERO PRINCIPAL: Verde, Naturaleza, Vida & Paisaje */}
      <div
        id="hero-principal"
        className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-200/80 bg-emerald-950 min-h-[360px] sm:min-h-[400px] flex flex-col justify-between p-5 sm:p-7 group text-white"
      >
        {/* Real photo background (Dique Las Pirquitas - official photography) */}
        <img
          src={heroData.bgImage || '/images/dique-las-pirquitas.webp'}
          alt="Fray Turismo - Dique Las Pirquitas, Catamarca"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.72]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/images/dique-las-pirquitas.webp')) {
              target.src = '/images/dique-las-pirquitas.webp';
            }
          }}
        />

        {/* Gradiente fresco natural verde esmeralda y teal */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-teal-950/45 to-black/25 pointer-events-none" />

        {/* Top bar in Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-400/40 shadow-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
            <span>{heroData.locationBadge || 'Catamarca · Argentina'}</span>
          </span>

          <div className="flex items-center gap-2">
            {isAuthenticated && isEditorMode && (
              <SectionEditButton sectionId="hero" sectionTitle="Portada / Hero" />
            )}
          </div>
        </div>

        {/* Center / Bottom Hero Content */}
        <div className="relative z-10 space-y-4 mt-auto pt-6">
          <div>
            {heroData.tagline && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 backdrop-blur-xs text-emerald-300 text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full border border-emerald-300/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroData.tagline}</span>
              </div>
            )}
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none drop-shadow-sm">
              {heroData.title || 'FRAY TURISMO'}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-medium mt-1 drop-shadow-xs max-w-lg">
              {!heroData.subtitle ||
              heroData.subtitle ===
                'Valles serranos, agua esmeralda, cuna del Beato y tradiciones vivas en Catamarca.'
                ? 'Un lugar para descubrir, disfrutar y volver a visitar.'
                : heroData.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 2. ÚNICO BUSCADOR GENERAL (Debajo del banner principal y antes de las categorías) */}
      <section id="buscador-general-section" aria-label="Buscador general de Visitá Fray" className="space-y-4">
        <div className="relative w-full">
          <label htmlFor="general-search-input" className="sr-only">
            ¿Qué lugar estás buscando?
          </label>
          <Search
            aria-hidden="true"
            className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            id="general-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="¿Qué lugar estás buscando?"
            autoComplete="off"
            className="w-full min-h-[54px] pl-12 sm:pl-14 pr-14 py-3.5 bg-white text-slate-900 placeholder:text-slate-500 rounded-2xl border-2 border-emerald-200/90 hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-lg font-medium transition shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              id="btn-clear-general-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Resultados del buscador general */}
        {hasSearchQuery && (
          <div id="seccion-resultados-busqueda" className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-sm sm:text-base font-bold text-slate-800">
                {searchMatchedPlaces.length}{' '}
                {searchMatchedPlaces.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[40px] px-3.5 py-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
              >
                Limpiar búsqueda
              </button>
            </div>

            {searchMatchedPlaces.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  No encontramos lugares con esa búsqueda
                </p>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Probá con otro nombre, localidad, categoría o palabra clave.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
                >
                  Ver todos los lugares
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchMatchedPlaces.map((place) => (
                  <SearchResultCard
                    key={place.id}
                    place={place}
                    onSelect={setSelectedPlace}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. CATEGORÍAS PRINCIPALES */}
      <section id="seccion-categorias">
        <CategoryPills />
      </section>

      {/* FILTERED RESULTS BY CATEGORY (Shown if user selects a category) */}
      {isCategoryFiltering ? (
        <section id="seccion-resultados-filtrados" className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {categoryFilteredPlaces.length} opciones confirmadas en Fray
              </p>
            </div>

            <button
              onClick={() => {
                setActiveCategory(null);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
            >
              Volver al inicio
            </button>
          </div>

          {categoryFilteredPlaces.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <div className="text-4xl">🌿</div>
              <h3 className="font-bold text-base text-slate-900">
                No encontramos lugares con esa búsqueda
              </h3>
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSearchQuery('');
                }}
                className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryFilteredPlaces.map((place) =>
                activeCategory === 'religioso' ? (
                  <ReligiousPlaceCard key={place.id} place={place} />
                ) : (
                  <PlaceCard key={place.id} place={place} />
                )
              )}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 3. IMPERDIBLES DE FRAY (Confirmed: Casa Natal, Monumento, Dique con fotos reales) */}
          <ImperdiblesSection />

          {/* 4. RUTA HISTÓRICA Y DE FE DEL BEATO ESQUIÚ (Audioguías y paradas confirmadas) */}
          <div id="seccion-recorrido-esquiu">
            <RecorridoEsquiuSection />
          </div>

          {/* 5. CONOCÉ FRAY (Identidad, Geografía y Pilares) */}
          <ConoceFraySection />

          {/* 6. EMBLEMA DE FE & PATRIMONIO */}
          <TierraDeMilagrosBadge />

          {/* 8. FOOTER INSTITUCIONAL */}
          <InstitutionalFooterBanner />
        </>
      )}
    </div>
  );
};
