import React from 'react';
import {
  Mountain,
  Footprints,
  Compass,
  AlertTriangle,
  Droplets,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronRight,
  Navigation,
  Info,
  Camera,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Place } from '../types';

export const SierrasSenderosSection: React.FC = () => {
  const { places, setSelectedPlace } = useData();

  // Find Casa de Piedra
  const casaDePiedra = places.find((p) => p.id === 'casa-de-piedra');

  const handleOpenCasaDePiedra = () => {
    if (casaDePiedra) {
      setSelectedPlace(casaDePiedra);
    }
  };

  return (
    <section id="seccion-sierras-senderos" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Mountain className="w-3.5 h-3.5 text-emerald-600" />
            <span>Naturaleza & Aventura</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
            Sierras y Senderos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Trekking, quebradas y miradores naturales en la Sierra de Gracián
          </p>
        </div>
      </div>

      {/* SPECIAL FEATURED HERO: CASA DE PIEDRA */}
      <div
        id="card-destacada-casa-de-piedra"
        onClick={handleOpenCasaDePiedra}
        className="group relative bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-3xl overflow-hidden shadow-xl border-2 border-emerald-500/80 cursor-pointer transition-all duration-300 hover:shadow-2xl flex flex-col justify-end min-h-[360px] sm:min-h-[390px] p-5 sm:p-7 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
          <span className="bg-emerald-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5" />
            <span>Atractivo Destacado</span>
          </span>

          <span className="bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Dificultad Moderada</span>
          </span>
        </div>

        {/* Content details */}
        <div className="relative z-10 space-y-3 mt-auto">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Sierra de Gracián · La Tercena / La Falda</span>
          </div>

          <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
            Casa de Piedra
          </h3>

          <p className="text-slate-200 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
            Majestuosa formación rocosa natural ubicada sobre la Sierra de Gracián. Su gran abertura rocosa funciona visualmente como un imponente ventanal natural con vistas panorámicas únicas hacia todo el Valle de Fray Mamerto Esquiú.
          </p>

          {/* Trekking Specs Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/20 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Duración</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                2 a 3 horas
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Hidratación</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Mínimo 1.5 L
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Calzado</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                Suela con agarre
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Cuidado</span>
              <span className="font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Reserva Natural
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[11px] text-amber-200 flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Caminata serrana de montaña. Fotografía pendiente de relevamiento.</span>
            </span>

            <button
              type="button"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition self-end sm:self-auto"
            >
              <span>Ver ficha y recomendaciones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Other Mountain & Hillside Trails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sierra de Gracián overview card */}
        <div
          onClick={() => {
            const p = places.find((x) => x.id === 'sendero-gracian');
            if (p) setSelectedPlace(p);
          }}
          className="bg-white hover:bg-slate-50/90 rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-center p-1 shrink-0 border border-slate-700">
              <Camera className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-[8px] font-black text-amber-300 uppercase leading-none">
                Foto pend.
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Cordón Oriental
              </span>
              <h4 className="font-display font-black text-sm text-slate-900 truncate mt-1">
                Sierra de Gracián & Mirador 360°
              </h4>
              <span className="text-xs text-slate-500">La Carrera · Senderismo panorámico</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ascensos por la ladera oriental con vista al valle y al Dique. Flora autóctona de quebracho, algarrobo y cactus columnares.
          </p>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 pt-1 border-t border-slate-100">
            <span>Dificultad: Baja - Media</span>
            <span>Ver detalles →</span>
          </div>
        </div>

        {/* Cuesta del Cura / Cuesta de Las Pirquitas */}
        <div
          onClick={() => {
            const p = places.find((x) => x.id === 'cuesta-del-cura');
            if (p) setSelectedPlace(p);
          }}
          className="bg-white hover:bg-slate-50/90 rounded-3xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-center p-1 shrink-0 border border-slate-700">
              <Camera className="w-4 h-4 text-sky-400 mb-0.5" />
              <span className="text-[8px] font-black text-amber-300 uppercase leading-none">
                Foto pend.
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                Sendero Histórico
              </span>
              <h4 className="font-display font-black text-sm text-slate-900 truncate mt-1">
                Cuesta del Cura & Cuesta del Gracián
              </h4>
              <span className="text-xs text-slate-500">Caminos ancestrales entre cerros</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Antiguo paso de herradura utilizado por arrieros y el propio Fray Mamerto Esquiú para cruzar las serranías hacia el valle contiguo.
          </p>
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 pt-1 border-t border-slate-100">
            <span>Dificultad: Moderada</span>
            <span>Ver detalles →</span>
          </div>
        </div>
      </div>
    </section>
  );
};
