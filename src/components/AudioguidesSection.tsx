import React, { useState } from 'react';
import {
  Headphones,
  Play,
  Pause,
  Clock,
  Sparkles,
  MapPin,
  ArrowRight,
  BookOpen,
  Volume2,
  Navigation,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Audioguide } from '../types';
import { getDirectionsUrl } from '../utils/geoUtils';

export const AudioguidesSection: React.FC = () => {
  const {
    audioguides,
    activeAudioGuide,
    isAudioPlaying,
    isAudioPaused,
    audioProgress,
    audioCurrentTimeSec,
    audioPlaybackRate,
    setAudioPlaybackRate,
    playAudioguide,
    pauseAudioguide,
    resumeAudioguide,
    stopAudioguide,
    places,
    setSelectedPlace,
  } = useData();

  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  const handleTogglePlay = (guide: Audioguide) => {
    if (activeAudioGuide?.id === guide.id) {
      if (isAudioPlaying) {
        pauseAudioguide();
      } else if (isAudioPaused) {
        resumeAudioguide();
      } else {
        playAudioguide(guide);
      }
    } else {
      playAudioguide(guide);
    }
  };

  const handleNextPlaceClick = (nextPlaceId: string) => {
    const nextPlace = places.find((p) => p.id === nextPlaceId);
    if (nextPlace) {
      setSelectedPlace(nextPlace);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section id="audioguides-section" className="py-4 space-y-5">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white border border-white/20">
            <Headphones className="w-3.5 h-3.5" />
            <span>Audioguías Oficiales de Fray</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-2 leading-tight">
            Escuchá la historia en el lugar de los hechos
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-lg mt-1 font-medium leading-relaxed">
            Ponete los auriculares o subí el volumen de tu celular. Relatos inmersivos sobre la cuna del Beato Esquiú, el dique y nuestras tradiciones.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Audioguides List */}
      <div className="space-y-5">
        {audioguides.map((guide) => {
          const isCurrentActive = activeAudioGuide?.id === guide.id;
          const isPlaying = isCurrentActive && isAudioPlaying;
          const isTranscriptOpen = expandedTranscriptId === guide.id;
          const nextPlace = places.find((p) => p.id === guide.nextPlaceId);

          return (
            <article
              key={guide.id}
              id={`audioguide-card-${guide.id}`}
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-lg ${
                isCurrentActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/10'
                  : 'border-slate-200/90'
              }`}
            >
              {/* Top Banner with Image or Atmospheric Graphic & Play Trigger */}
              <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden bg-slate-950">
                {guide.coverImage &&
                guide.coverImage.trim() !== '' &&
                !guide.coverImage.includes('unsplash.com') ? (
                  <>
                    <img
                      src={guide.coverImage}
                      alt={guide.title}
                      className="w-full h-full object-cover brightness-[0.70]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Big Play/Pause Button on Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <button
                    id={`btn-play-guide-${guide.id}`}
                    onClick={() => handleTogglePlay(guide)}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                    aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-white" />
                    ) : (
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Top Duration Pill */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{guide.duration}</span>
                </div>

                {/* Active Indicator Pulse */}
                {isCurrentActive && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse z-10">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Reproduciendo' : 'Pausado'}</span>
                  </div>
                )}

                {/* Bottom Title on Image */}
                <div className="absolute bottom-3 left-4 right-4 text-white z-10">
                  <h3 className="font-display font-black text-lg sm:text-xl text-white leading-tight">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-200 font-medium line-clamp-1 mt-0.5">
                    {guide.subtitle}
                  </p>
                </div>
              </div>

              {/* Player Progress Bar when active */}
              {isCurrentActive && (
                <div className="bg-slate-900 text-white p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>{formatSeconds(audioCurrentTimeSec)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-sans">Velocidad:</span>
                      {[1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setAudioPlaybackRate(rate)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            audioPlaybackRate === rate
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                    <span>{guide.duration}</span>
                  </div>

                  {/* Scrubber Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Audioguide Content Body */}
              <div className="p-4 sm:p-5 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {guide.shortSummary}
                </p>

                {/* Historical Facts Checklist */}
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    Datos históricos clave
                  </h4>
                  <div className="space-y-1.5">
                    {guide.historicalFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transcript Toggle Accordion */}
                <div className="pt-2">
                  <button
                    onClick={() =>
                      setExpandedTranscriptId(isTranscriptOpen ? null : guide.id)
                    }
                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-between border border-slate-200 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      <span>{isTranscriptOpen ? 'Ocultar transcripción' : 'Leer transcripción completa'}</span>
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      {isTranscriptOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isTranscriptOpen && (
                    <div className="mt-2.5 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium animate-in fade-in duration-200">
                      {guide.narrativeText}
                    </div>
                  )}
                </div>

                {/* REQUIRED FEATURE: "A pocos minutos de acá también podés conocer…" Next Recommendation Card */}
                {nextPlace && (
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>A pocos minutos de acá también podés conocer:</span>
                    </div>

                    <div
                      onClick={() => handleNextPlaceClick(nextPlace.id)}
                      className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-emerald-200/80 hover:border-emerald-500 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {nextPlace.image && nextPlace.image.trim() !== '' ? (
                          <img
                            src={nextPlace.image}
                            alt={nextPlace.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <Compass className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                            {nextPlace.name}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">
                            {guide.nextPlaceReason}
                          </p>
                        </div>
                      </div>

                      <button className="p-2 bg-emerald-100 group-hover:bg-emerald-600 text-emerald-800 group-hover:text-white rounded-lg transition shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
