import React from 'react';
import {
  Utensils,
  Coffee,
  BedDouble,
  Trees,
  Mountain,
  Landmark,
  CalendarCheck,
  Compass,
  MapPin,
  Headphones,
  Info,
  Waves,
  Camera,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/initialData';
import { CategoryId } from '../types';
import { SectionEditButton } from './SectionEditButton';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  Coffee,
  BedDouble,
  Bed: BedDouble,
  Trees,
  Mountain,
  Landmark,
  Church: Landmark,
  CalendarCheck,
  Compass,
  MapPin,
  Headphones,
  Info,
  Waves,
  Camera,
  Sparkles,
};

const categoryColorAccents: Record<
  string,
  { bg: string; text: string; ring: string; border: string; iconBg: string }
> = {
  visitar: {
    bg: 'bg-amber-600',
    text: 'text-white',
    ring: 'ring-amber-400',
    border: 'border-amber-700',
    iconBg: 'bg-amber-700',
  },
  comer: {
    bg: 'bg-orange-500',
    text: 'text-white',
    ring: 'ring-orange-400',
    border: 'border-orange-600',
    iconBg: 'bg-orange-600',
  },
  merendar: {
    bg: 'bg-rose-500',
    text: 'text-white',
    ring: 'ring-rose-400',
    border: 'border-rose-600',
    iconBg: 'bg-rose-600',
  },
  campings: {
    bg: 'bg-cyan-600',
    text: 'text-white',
    ring: 'ring-cyan-400',
    border: 'border-cyan-700',
    iconBg: 'bg-cyan-700',
  },
  dormir: {
    bg: 'bg-blue-600',
    text: 'text-white',
    ring: 'ring-blue-400',
    border: 'border-blue-700',
    iconBg: 'bg-blue-700',
  },
  religioso: {
    bg: 'bg-indigo-600',
    text: 'text-white',
    ring: 'ring-indigo-400',
    border: 'border-indigo-700',
    iconBg: 'bg-indigo-700',
  },
  naturaleza: {
    bg: 'bg-teal-600',
    text: 'text-white',
    ring: 'ring-teal-400',
    border: 'border-teal-700',
    iconBg: 'bg-teal-700',
  },
  senderos: {
    bg: 'bg-emerald-700',
    text: 'text-white',
    ring: 'ring-emerald-400',
    border: 'border-emerald-800',
    iconBg: 'bg-emerald-800',
  },
  actividades: {
    bg: 'bg-sky-600',
    text: 'text-white',
    ring: 'ring-sky-400',
    border: 'border-sky-700',
    iconBg: 'bg-sky-700',
  },
};

export const CategoryPills: React.FC = () => {
  const { activeCategory, setActiveCategory, siteConfig } = useData();
  const { isAuthenticated, isEditorMode } = useAuth();

  const configuredItems = siteConfig?.categories?.items;
  const visibleCategories =
    Array.isArray(configuredItems) && configuredItems.length > 0
      ? [...configuredItems]
          .filter((cat) => cat.isVisible !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : CATEGORIES.filter(
          (cat) => cat.id !== 'naturaleza' && cat.id !== 'actividades' && cat.id !== 'cerca'
        );

  const sectionTitle = siteConfig?.categories?.title || 'Categorías de Fray';

  const handleCategoryClick = (catId: CategoryId) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(catId);
    }
  };

  return (
    <section id="categories-section" className="py-1">
      <div className="flex items-center justify-between gap-2 mb-2.5 px-1 flex-wrap">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>{sectionTitle}</span>
        </h2>

        <div className="flex items-center gap-2">
          {isAuthenticated && isEditorMode && (
            <SectionEditButton sectionId="categories" sectionTitle="Categorías" />
          )}
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200"
            >
              Ver todas
            </button>
          )}
        </div>
      </div>

      {/* Grid of category buttons designed for high touch friendliness on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {visibleCategories.map((cat) => {
          const Icon = iconMap[cat.iconName] || Compass;
          const isSelected = activeCategory === cat.id;
          const accent = categoryColorAccents[cat.id] || categoryColorAccents.comer;

          return (
            <button
              key={cat.id}
              id={`cat-card-${cat.id}`}
              onClick={() => handleCategoryClick(cat.id as CategoryId)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group relative overflow-hidden active:scale-95 ${
                isSelected
                  ? `${accent.bg} text-white ${accent.border} shadow-md ring-2 ${accent.ring}`
                  : 'bg-white hover:bg-slate-50/90 text-slate-800 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-2xl" role="img" aria-label={cat.label}>
                  {cat.emoji}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <p
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {cat.label}
                </p>
                <p
                  className={`text-[10px] mt-0.5 line-clamp-1 font-medium ${
                    isSelected ? 'text-white/80' : 'text-slate-500'
                  }`}
                >
                  {cat.shortLabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
