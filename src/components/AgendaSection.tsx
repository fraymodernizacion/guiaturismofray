import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Sparkles,
  Ticket,
  CalendarPlus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { TouristEvent } from '../types';
import { getDirectionsUrl } from '../utils/geoUtils';

export const AgendaSection: React.FC = () => {
  const { events, places, setSelectedPlace, userLocation } = useData();

  const [dateFilter, setDateFilter] = useState<'todos' | 'hoy' | 'finde'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesCat = selectedCategory === 'todos' || ev.category === selectedCategory;
    // Simple filter logic for demo
    if (dateFilter === 'hoy') {
      return matchesCat && ev.id === 'ev-peña-verano'; // Highlight today's featured
    }
    if (dateFilter === 'finde') {
      return matchesCat && ['ev-peña-verano', 'ev-kayak-atardecer', 'ev-feria-artesanos'].includes(ev.id);
    }
    return matchesCat;
  });

  const handleDirections = (ev: TouristEvent) => {
    window.open(getDirectionsUrl(ev.lat, ev.lng, ev.locationName, userLocation), '_blank', 'noopener,noreferrer');
  };

  const handleViewPlace = (placeId?: string) => {
    if (!placeId) return;
    const found = places.find((p) => p.id === placeId);
    if (found) {
      setSelectedPlace(found);
    }
  };

  const handleAddToCalendar = (ev: TouristEvent) => {
    // Generate Google Calendar Link
    const startTime = `${ev.date.replace(/-/g, '')}T210000Z`;
    const endTime = `${ev.date.replace(/-/g, '')}T235900Z`;
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      ev.title
    )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
      ev.description
    )}&location=${encodeURIComponent(ev.address)}`;

    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="agenda-section" className="py-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-emerald-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-purple-950/10 relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
            Agenda Fray Turismo
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mt-2">
            ¿Qué hacemos hoy en Fray?
          </h2>
          <p className="text-purple-100 text-xs sm:text-sm max-w-lg mt-1 font-medium leading-relaxed">
            Peñas bajo las estrellas, ferias artesanales, travesías náuticas y actividades culturales en cada rincón del departamento.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setDateFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
              dateFilter === 'todos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos los eventos
          </button>
          <button
            onClick={() => setDateFilter('hoy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
              dateFilter === 'hoy'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔥 Hoy
          </button>
          <button
            onClick={() => setDateFilter('finde')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
              dateFilter === 'finde'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌟 Este fin de semana
          </button>
        </div>

        <span className="text-xs text-slate-500 font-bold shrink-0 bg-slate-100 px-2.5 py-1 rounded-xl">
          {filteredEvents.length} actividades
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'todos', label: 'Todas las categorías' },
          { id: 'peña', label: '🎸 Peñas & Música' },
          { id: 'feria', label: '🏺 Ferias & Artesanos' },
          { id: 'deporte', label: '🚣 Deportes & Agua' },
          { id: 'taller', label: '🎨 Talleres' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events List Cards */}
      <div className="space-y-3.5">
        {filteredEvents.map((ev) => (
          <article
            key={ev.id}
            id={`event-card-${ev.id}`}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-300 transition overflow-hidden flex flex-col sm:flex-row group"
          >
            {/* Event Photo & Date Badge */}
            <div className="sm:w-56 h-44 sm:h-auto relative shrink-0 bg-slate-900 overflow-hidden flex items-center justify-center">
              {ev.image && ev.image.trim() !== '' ? (
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Calendar className="w-12 h-12 text-purple-400 opacity-60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Date Box */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-2 text-center shadow-md min-w-[60px] border border-white/40">
                <span className="block text-[10px] font-black text-purple-700 uppercase tracking-wider">
                  {ev.dateBadge.split(' ')[0]}
                </span>
                <span className="block font-black text-lg leading-tight text-slate-900">
                  {ev.dateBadge.split(' ')[1]}
                </span>
                <span className="block text-[9px] font-bold text-slate-500 uppercase">
                  {ev.dateBadge.split(' ')[2]}
                </span>
              </div>

              {/* Free / Price tag */}
              <div className="absolute bottom-3 left-3">
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs ${
                    ev.isFree
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {ev.isFree ? 'Entrada Libre' : 'Arancelado'}
                </span>
              </div>
            </div>

            {/* Event Info Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ev.time}</span>
                  {ev.organizer && (
                    <span className="text-slate-400">· {ev.organizer}</span>
                  )}
                </div>

                <h3 className="font-display font-black text-base sm:text-lg text-slate-900 leading-tight group-hover:text-purple-700 transition">
                  {ev.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                  {ev.description}
                </p>

                {/* Location */}
                <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{ev.locationName}</p>
                    <p className="text-[11px] text-slate-500">{ev.address}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDirections(ev)}
                    className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-300" />
                    <span>Cómo llegar</span>
                  </button>

                  <button
                    onClick={() => handleAddToCalendar(ev)}
                    className="py-2.5 px-3.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition"
                    title="Agendar en Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-purple-600" />
                    <span>Agendar</span>
                  </button>
                </div>

                {ev.placeId && (
                  <button
                    onClick={() => handleViewPlace(ev.placeId)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>Ver punto turístico</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
