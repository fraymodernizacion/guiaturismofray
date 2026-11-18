import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Users,
  Compass,
  ArrowRight,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Experience } from '../types';

export const ExperiencesSection: React.FC = () => {
  const { experiences, places, setSelectedPlace, setActiveTab } = useData();
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const handleOpenPlace = (placeId: string) => {
    const found = places.find((p) => p.id === placeId);
    if (found) {
      setSelectedPlace(found);
    }
  };

  return (
    <section id="experiences-section" className="py-4 space-y-4">
      {/* Section Title & Subtitle */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Itinerarios y Recorridos</span>
        </div>
        <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mt-0.5">
          Experiencias para descubrir Fray
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Circuitos diseñados para que aproveches al máximo tu día según tus gustos y compañía.
        </p>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiences.map((exp) => (
          <article
            key={exp.id}
            id={`exp-card-${exp.id}`}
            onClick={() => setSelectedExperience(exp)}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 transition overflow-hidden cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Photo or Atmospheric Gradient & Badge */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                {exp.coverImage &&
                exp.coverImage.trim() !== '' &&
                !exp.coverImage.includes('unsplash.com') ? (
                  <>
                    <img
                      src={exp.coverImage}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.75]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    {exp.badgeText}
                  </span>
                </div>

                {/* Bottom Details on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                  <div className="flex items-center gap-3 text-xs font-medium text-emerald-200 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exp.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {exp.idealFor}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white leading-tight">
                    {exp.title}
                  </h3>
                </div>
              </div>

              {/* Tagline & Highlights */}
              <div className="p-4 space-y-2.5">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {exp.tagline}
                </p>

                {/* Highlights List */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Action */}
            <div className="p-4 pt-0">
              <button className="w-full py-2.5 px-3 bg-slate-50 group-hover:bg-emerald-50 group-hover:text-emerald-950 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition border border-slate-200 group-hover:border-emerald-300">
                <span>Ver itinerario completo ({exp.stops.length} paradas)</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Experience Itinerary Modal */}
      {selectedExperience && (
        <div
          id="exp-detail-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedExperience(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom duration-300"
          >
            {/* Header with image or gradient */}
            <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
              {selectedExperience.coverImage &&
              selectedExperience.coverImage.trim() !== '' &&
              !selectedExperience.coverImage.includes('unsplash.com') ? (
                <>
                  <img
                    src={selectedExperience.coverImage}
                    alt={selectedExperience.title}
                    className="w-full h-full object-cover brightness-[0.70]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              <button
                onClick={() => setSelectedExperience(null)}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-lg cursor-pointer z-10 transition"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white z-10">
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                  {selectedExperience.category}
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-1">
                  {selectedExperience.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-emerald-200 mt-1 font-semibold">
                  <span>⏱ {selectedExperience.duration}</span>
                  <span>👥 {selectedExperience.idealFor}</span>
                </div>
              </div>
            </div>

            {/* Description & Stops */}
            <div className="p-4 sm:p-6 space-y-5">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {selectedExperience.description}
              </p>

              {/* Step-by-Step Stops Timeline */}
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                  Paradas del recorrido ({selectedExperience.stops.length})
                </h4>

                <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-200">
                  {selectedExperience.stops.map((stop, idx) => {
                    const place = places.find((p) => p.id === stop.placeId);
                    if (!place) return null;

                    return (
                      <div
                        key={idx}
                        className="relative flex items-start gap-3.5 pl-1 group"
                      >
                        {/* Stop Number Circle */}
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 z-10 ring-4 ring-white shadow-xs">
                          {stop.stopOrder}
                        </div>

                        {/* Stop Card */}
                        <div
                          onClick={() => handleOpenPlace(place.id)}
                          className="flex-1 bg-slate-50 hover:bg-emerald-50/50 p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {place.name}
                            </h5>
                            <span className="text-[11px] text-emerald-600 font-black shrink-0">
                              Ver lugar →
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {place.locality}
                          </p>

                          {/* Tip */}
                          <div className="mt-2 bg-white p-2.5 rounded-xl border border-slate-200/70 text-[11px] text-slate-700 font-medium leading-normal">
                            <span className="font-black text-emerald-800">Consejo: </span>
                            {stop.tip}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedExperience(null);
                    setActiveTab('cerca');
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <Compass className="w-4 h-4" />
                  <span>Ver todas las paradas en el mapa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
