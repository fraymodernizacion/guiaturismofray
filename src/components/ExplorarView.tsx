import React, { useState } from 'react';
import { X, SlidersHorizontal, ArrowUpDown, Navigation } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PlaceCard } from './PlaceCard';
import { CategoryPills } from './CategoryPills';
import { CATEGORIES } from '../data/initialData';
import { matchesPlaceSearch } from '../utils/searchPlaces';

export const ExplorarView: React.FC = () => {
  const {
    places,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    userLocation,
  } = useData();

  const [sortBy, setSortBy] = useState<'default' | 'nearest' | 'az'>('default');

  const filteredPlaces = places
    .filter((p) => {
      const matchesCat =
        !activeCategory ||
        p.category === activeCategory ||
        Boolean(p.secondaryCategories?.includes(activeCategory));
      const matchesQuery = matchesPlaceSearch(p, searchQuery);

      return matchesCat && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        const distA = a.distanceKm ?? 999999;
        const distB = b.distanceKm ?? 999999;
        return distA - distB;
      }
      if (sortBy === 'az') {
        return a.name.localeCompare(b.name, 'es');
      }
      return 0;
    });

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div id="explorar-view" className="space-y-6 pb-12">
      {/* Title & Description */}
      <div className="px-1">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Explorar Fray
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          Directorio turístico oficial de Fray Mamerto Esquiú
        </p>
      </div>

      {/* Category selector */}
      <CategoryPills />

      {searchQuery.trim() !== '' && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
          <span>
            Filtro activo: <strong className="font-bold">"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-lg hover:bg-emerald-100 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      )}

      {/* Results Header, Sorting & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-800">
            {activeCategoryObj ? activeCategoryObj.label : 'Todos los atractivos y servicios'}
          </h2>
          <span className="text-xs bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
            {filteredPlaces.length}
          </span>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 transition ml-1"
            >
              Ver todos
            </button>
          )}
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-bold text-slate-500 pl-1.5 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Ordenar:
          </span>
          <button
            id="sort-default-btn"
            onClick={() => setSortBy('default')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
              sortBy === 'default'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recomendados
          </button>
          <button
            id="sort-nearest-btn"
            onClick={() => setSortBy('nearest')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
              sortBy === 'nearest'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3 h-3 fill-current" />
            <span>Más cerca</span>
          </button>
          <button
            id="sort-az-btn"
            onClick={() => setSortBy('az')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
              sortBy === 'az'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Places Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="text-4xl">🌿</div>
          <h3 className="font-bold text-base text-slate-900">
            No se encontraron resultados
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Probá ajustando la búsqueda o seleccionando otra categoría turística de Fray.
          </p>
          <button
            onClick={() => {
              setActiveCategory(null);
              setSearchQuery('');
              setSortBy('default');
            }}
            className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
};

