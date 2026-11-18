import React from 'react';
import {
  Sparkles,
  MapPin,
  Mountain,
  ChevronRight,
  Headphones,
  Info,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Place } from '../types';
import { SectionEditButton } from './SectionEditButton';

export const ImperdiblesSection: React.FC = () => {
  const { places, setSelectedPlace, siteConfig, setSectionToEdit } = useData();
  const { isAuthenticated, isEditorMode } = useAuth();

  const imperdiblesConfig = siteConfig?.imperdibles || {
    title: 'Imperdibles de Fray',
    subtitle: 'Los hitos emblemáticos confirmados de Fray Mamerto Esquiú',
    badge: 'Selección Territorial',
    items: [],
  };

  const handleOpenPlace = (placeId: string, customItem: any) => {
    const existing = places.find((p) => p.id === placeId);
    if (existing) {
      setSelectedPlace(existing);
    } else {
      const fallbackPlace: Place = {
        id: placeId,
        name: customItem?.customTitle || 'Atractivo Imperdible',
        category: placeId.includes('dique') ? 'naturaleza' : 'religioso',
        subCategory: 'Patrimonio de Fray',
        shortDescription: customItem?.customTagline || 'Hito turístico imperdible en Fray Mamerto Esquiú',
        description: customItem?.customHighlight || 'Atractivo turístico de Fray Mamerto Esquiú, Catamarca.',
        address: 'Fray Mamerto Esquiú, Catamarca',
        locality: 'Fray Mamerto Esquiú',
        lat: -28.3812,
        lng: -65.7311,
        image: customItem?.customImage || '/images/dique-las-pirquitas.webp',
        gallery: customItem?.customImage ? [customItem.customImage] : [],
        openingHours: 'Visita libre y guiada según temporada.',
        phone: '+54 383 4491020',
        whatsapp: '5493834491020',
        tags: ['Al aire libre', 'Vista a las sierras', 'Patrimonio Esquiú', 'Con niños'],
        services: ['Acceso turístico', 'Cartelería interpretativa', 'Fotografía panorámica'],
        featured: true,
        isImperdible: true,
        validationStatus: 'verificado',
        sourceGuide: 'Guía Turística Oficial Fray Mamerto Esquiú',
      };
      setSelectedPlace(fallbackPlace);
    }
  };

  const displayedItems = Array.isArray(imperdiblesConfig.items) && imperdiblesConfig.items.length > 0
    ? imperdiblesConfig.items
    : [
        {
          placeId: 'casa-natal-esquiu',
          customTitle: 'Casa Natal de Fray Mamerto Esquiú',
          customTagline: 'Patrimonio histórico y religioso nacional',
          customImage: '/images/casa-natal-esquiu.webp',
          customBadge: 'Monumento Histórico',
          customBadgeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
          customHighlight: 'Cuna natal de adobe colonial conservada bajo templete protector.',
          customPhotoNote: 'Fotografía oficial · Templete Protector',
          isVisible: true,
        },
        {
          placeId: 'monumento-esquiu',
          customTitle: 'Monumento al Beato Mamerto Esquiú',
          customTagline: 'Escultura de Antonio Emilio Forner y las tres arcadas',
          customImage: '/images/monumento-beato-esquiu.webp',
          customBadge: 'Patrimonio de Fray',
          customBadgeColor: 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white',
          customHighlight: 'Imponente figura de 2,30 m con arcadas franciscanas al pie de las sierras.',
          customPhotoNote: 'Fotografía oficial · Cartel y Acceso al Monumento',
          isVisible: true,
        },
        {
          placeId: 'dique-las-pirquitas',
          customTitle: 'Dique Las Pirquitas',
          customTagline: 'Paisaje, naturaleza y actividades en el embalse',
          customImage: '/images/dique-las-pirquitas.webp',
          customBadge: 'Naturaleza & Dique',
          customBadgeColor: 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white',
          customHighlight: 'Espejo de agua entre cerros, deportes náuticos y atardeceres serranos.',
          customPhotoNote: 'Fotografía oficial · Embalse y Murallón',
          isVisible: true,
        },
      ];

  return (
    <section id="seccion-imperdibles-fray" className="relative space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <span>{imperdiblesConfig.badge || 'Selección Territorial'}</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
            {imperdiblesConfig.title || 'Imperdibles de Fray'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {imperdiblesConfig.subtitle || 'Los hitos emblemáticos confirmados de Fray Mamerto Esquiú'}
          </p>
        </div>

        {isAuthenticated && isEditorMode && (
          <SectionEditButton
            sectionId="imperdibles"
            sectionTitle="Imperdibles"
            addActionLabel="Tarjeta"
            onAddAction={() => setSectionToEdit('imperdibles')}
          />
        )}
      </div>

      {/* Grid of Large Photographic / Verified Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedItems.filter(item => item.isVisible !== false).map((item, idx) => {
          const livePlace = places.find((p) => p.id === item.placeId);
          const currentImage = item.customImage || livePlace?.image || '';
          const isVerified = Boolean(
            currentImage &&
              currentImage.trim() !== '' &&
              !currentImage.includes('unsplash.com') &&
              !currentImage.includes('placeholder')
          );
          const title = item.customTitle || livePlace?.name || 'Imperdible';
          const highlight = item.customHighlight || livePlace?.shortDescription || '';
          const locality = livePlace?.locality || 'Fray Mamerto Esquiú';

          return (
            <div
              key={`${item.placeId}-${idx}`}
              onClick={() => handleOpenPlace(item.placeId, item)}
              className="group relative bg-slate-950 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-slate-800 cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end min-h-[290px] p-5 text-white"
            >
              {/* Background Photo or Pending Graphic */}
              {isVerified ? (
                <>
                  <img
                    src={currentImage}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-[0.75]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 flex flex-col justify-start p-5">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center opacity-70">
                    <Camera className="w-8 h-8 text-sky-400 mb-1" />
                    <span className="text-[11px] font-black uppercase text-amber-300">
                      Fotografía pendiente
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
                </div>
              )}

              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
                    item.customBadgeColor || 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  }`}
                >
                  {item.customBadge || 'Imperdible'}
                </span>

                <div className="flex items-center gap-1.5">
                  {isVerified && (
                    <span className="bg-slate-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Foto oficial FME</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Content info */}
              <div className="relative z-10 space-y-2 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{locality}</span>
                </div>

                <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight leading-snug group-hover:text-amber-200 transition-colors">
                  {title}
                </h3>

                <p className="text-slate-200 text-xs font-normal line-clamp-2 leading-relaxed">
                  {highlight}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-white/15 text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  <span>Ver ficha completa</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
