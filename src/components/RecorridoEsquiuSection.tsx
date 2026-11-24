import React from 'react';
import {
  MapPin,
  Headphones,
  ChevronRight,
  CheckCircle2,
  Navigation,
  Camera,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SectionEditButton } from './SectionEditButton';
import { INITIAL_PLACES } from '../data/initialData';
import { Audioguide } from '../types';
import { RecorridoEsquiuStopConfig } from '../types/siteConfig';

const DEFAULT_ESQUIU_STOPS: RecorridoEsquiuStopConfig[] = [
  {
    placeId: 'casa-natal-esquiu',
    order: 1,
    distanceFromPrevious: '',
    tip: 'Vivienda colonial donde nació el fraile el 11 de mayo de 1826, orador de la Constitución Nacional.',
  },
  {
    placeId: 'iglesia-san-jose',
    order: 2,
    distanceFromPrevious: '800 m desde la Casa Natal',
    tip: 'Templo de 1780 donde fue bautizado el Beato Esquiú, con pila bautismal histórica y retablo colonial.',
  },
  {
    placeId: 'monumento-esquiu',
    order: 3,
    distanceFromPrevious: '1.2 km desde la Iglesia de San José',
    tip: 'Imponente escultura conmemorativa con tres arcadas franciscanas y mirador panorámico.',
  },
];

export const RecorridoEsquiuSection: React.FC = () => {
  const { places, setSelectedPlace, playAudioguide, audioguides, siteConfig } = useData();
  const { isAuthenticated, isEditorMode } = useAuth();

  const esquiuConfig = siteConfig?.recorridoEsquiu || {
    title: 'Tras las Huellas del Beato',
    subtitle: 'Seguí los pasos del orador de la Constitución en su tierra natal',
    badge: 'Circuito Histórico & de Fe',
    introDescription: 'Un itinerario de fe y memoria que conecta la Casa Natal, el templo de San José donde fue bautizado y el mirador con el monumento serrano.',
    stops: DEFAULT_ESQUIU_STOPS,
    highlights: ['Casa Natal del Beato', 'Pila bautismal de 1826', 'Mirador panorámico 360°'],
    audioGuidePlaceId: 'casa-natal-esquiu',
  };

  const configuredStops =
    Array.isArray(esquiuConfig.stops) && esquiuConfig.stops.length > 0
      ? esquiuConfig.stops
      : DEFAULT_ESQUIU_STOPS;

  const handleOpenPlace = (placeId: string) => {
    const foundPlace =
      places.find((p) => p.id === placeId) ||
      INITIAL_PLACES.find((p) => p.id === placeId);

    if (foundPlace) {
      setSelectedPlace(foundPlace);
    }
  };

  const handlePlayAudio = (e: React.MouseEvent, audio: Audioguide) => {
    e.stopPropagation();
    playAudioguide(audio);
  };

  return (
    <section id="circuito-pasos-esquiu" className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 border border-amber-800/40 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400/90 text-amber-950 px-3 py-0.5 rounded-full font-sans">
                {esquiuConfig.badge || 'Circuito Histórico & de Fe'}
              </span>
              <span className="text-[11px] font-semibold text-amber-200">
                Tierra de Milagros
              </span>
            </div>

            {isAuthenticated && isEditorMode && (
              <SectionEditButton
                sectionId="recorridoEsquiu"
                sectionTitle="Tras las Huellas del Beato"
              />
            )}
          </div>

          <h2 className="font-display font-black text-xl sm:text-3xl text-white tracking-tight leading-tight">
            {esquiuConfig.title || 'Tras las Huellas del Beato'}
          </h2>

          <p className="text-amber-100/90 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
            {esquiuConfig.introDescription ||
              esquiuConfig.subtitle ||
              'Seguí los pasos del orador de la Constitución en su tierra natal.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-amber-200 font-semibold">
            <span>📍 {configuredStops.length} Paradas</span>
            <span>·</span>
            <span>🚗 2.0 km de circuito</span>
            <span>·</span>
            <span>⏱️ 1 a 2 horas</span>
          </div>
        </div>
      </div>

      {/* Connected Timeline Vertical Cards */}
      <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-amber-200/80">
        {configuredStops.map((stop, index) => {
          const targetPlaceId = stop.placeId || (stop as any).id;
          const livePlace =
            places.find((p) => p.id === targetPlaceId) ||
            INITIAL_PLACES.find((p) => p.id === targetPlaceId);

          const stopNumber = stop.order || index + 1;
          const placeName =
            stop.customTitle?.trim() ||
            livePlace?.name ||
            (stop as any).name ||
            `Parada ${stopNumber}`;

          const placeLocality =
            livePlace?.locality ||
            (stop as any).locality ||
            'San José de Piedra Blanca';

          const placeDescription =
            stop.tip?.trim() ||
            livePlace?.shortDescription ||
            (stop as any).highlight ||
            (stop as any).subtitle ||
            '';

          // Distancia respecto de la parada anterior:
          // Mostrar únicamente cuando exista un dato confirmado
          const rawDistance =
            stop.distanceFromPrevious !== undefined
              ? stop.distanceFromPrevious
              : (stop as any).distanceFromPrevious;

          const distanceText =
            typeof rawDistance === 'string' && rawDistance.trim() !== ''
              ? rawDistance.trim()
              : index === 1
              ? '800 m desde la Casa Natal'
              : index === 2
              ? '1.2 km desde la Iglesia de San José'
              : '';

          // Fotografía oficial vinculada
          const currentImage = livePlace?.image || (stop as any).image || '';
          const hasOfficialPhoto = Boolean(
            currentImage &&
              currentImage.trim() !== '' &&
              !currentImage.includes('unsplash.com') &&
              !currentImage.includes('placeholder')
          );

          // Audioguía confirmada vinculada al atractivo
          const matchedAudio = audioguides.find(
            (a) =>
              a.placeId === targetPlaceId ||
              a.placeId === livePlace?.id ||
              (livePlace?.audioguideId && a.id === livePlace.audioguideId)
          );
          const hasAudio = Boolean(matchedAudio);

          return (
            <div
              key={targetPlaceId || index}
              id={`circuito-parada-${targetPlaceId || index + 1}`}
              onClick={() => handleOpenPlace(targetPlaceId)}
              className="relative pl-12 group cursor-pointer"
            >
              {/* 1. Número de parada */}
              <div className="absolute left-2.5 top-5 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-md border-2 border-white group-hover:scale-110 group-hover:bg-amber-700 transition">
                {stopNumber}
              </div>

              {/* Tarjeta Vertical de la Parada */}
              <div className="bg-white hover:bg-amber-50/40 rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* 2. Fotografía principal (o espacio neutro si no hay) */}
                  {hasOfficialPhoto ? (
                    <div className="relative shrink-0">
                      <img
                        src={currentImage}
                        alt={placeName}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className =
                              'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-center p-1 shrink-0 border border-slate-200 text-slate-400 text-[9px] font-semibold';
                            fallback.innerText = 'Foto pend.';
                            parent.appendChild(fallback);
                          }
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    /* Espacio neutro sin inventar imágenes */
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-center p-1 shrink-0 border border-slate-200 text-slate-400">
                      <Camera className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                        Foto pend.
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 3. Distancia respecto de la parada anterior (solo si confirmada) */}
                      {distanceText !== '' && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200/60">
                          <Navigation className="w-2.5 h-2.5 text-amber-700" />
                          <span>{distanceText}</span>
                        </span>
                      )}

                      {/* 4. Localidad */}
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{placeLocality}</span>
                      </span>

                      {hasOfficialPhoto && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Foto oficial</span>
                        </span>
                      )}
                    </div>

                    {/* 5. Nombre del atractivo */}
                    <h3 className="font-display font-black text-sm sm:text-base text-slate-900 group-hover:text-amber-900 transition leading-snug">
                      {placeName}
                    </h3>

                    {/* 6. Descripción breve (máximo 2 o 3 líneas) */}
                    {placeDescription && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {placeDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* 7. Botón Audio & 8. Botón Ficha */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Botón Audio: solo cuando exista audioguía real */}
                  {hasAudio && matchedAudio && (
                    <button
                      type="button"
                      id={`btn-audio-circuito-${targetPlaceId}`}
                      onClick={(e) => handlePlayAudio(e, matchedAudio)}
                      className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border border-amber-200 cursor-pointer shadow-2xs"
                      title={`Escuchar audioguía de ${placeName}`}
                    >
                      <Headphones className="w-3.5 h-3.5 text-amber-800" />
                      <span className="hidden sm:inline">Audio</span>
                    </button>
                  )}

                  {/* Botón Ficha: abre la ficha completa dentro de la PWA */}
                  <button
                    type="button"
                    id={`btn-ficha-circuito-${targetPlaceId}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPlace(targetPlaceId);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs group-hover:bg-amber-900"
                    title={`Ver ficha completa de ${placeName}`}
                  >
                    <span>Ficha</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
