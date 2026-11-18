import React from 'react';
import { Calendar, Compass, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';

export const QueHacerSection: React.FC = () => {
  const { events, setActiveTab, setActiveCategory } = useData();

  const featuredEvents = (Array.isArray(events) ? events : []).slice(0, 2);

  return (
    <section id="seccion-que-hacer" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <span>Propuestas destacadas</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
            Qué hacer en Fray
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Eventos, paseos y actividades programadas
          </p>
        </div>

        <button
          onClick={() => setActiveTab('agenda')}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1"
        >
          <span>Ver agenda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Highlighted Proposals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {featuredEvents.map((evt) => (
          <div
            key={evt.id}
            onClick={() => {
              setActiveTab('agenda');
            }}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md p-4 flex flex-col justify-between cursor-pointer transition group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {evt.category.toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  {evt.dateBadge} · {evt.time}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition">
                {evt.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {evt.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{evt.locationName || evt.address}</span>
              </div>
              <span className="font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                Detalles →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Activity Pill Shortcuts */}
      <div className="bg-emerald-50/60 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs border border-emerald-100">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          ¿Buscás paseos al aire libre?
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('naturaleza')}
            className="font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition shadow-2xs"
          >
            Naturaleza
          </button>
          <button
            onClick={() => setActiveCategory('religioso')}
            className="font-bold text-teal-800 hover:text-teal-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition shadow-2xs"
          >
            Turismo religioso
          </button>
          <button
            onClick={() => setActiveCategory('actividades')}
            className="font-bold text-cyan-800 hover:text-cyan-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition shadow-2xs"
          >
            Actividades
          </button>
        </div>
      </div>
    </section>
  );
};
