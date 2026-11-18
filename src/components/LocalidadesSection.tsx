import React, { useState } from 'react';
import {
  MapPin,
  Trees,
  Compass,
  Utensils,
  BedDouble,
  ChevronRight,
  Sparkles,
  Mountain,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PlaceCard } from './PlaceCard';

export interface LocalityInfo {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  filterKeywords: string[];
}

export const LOCALITIES_DATA: LocalityInfo[] = [
  {
    id: 'san-jose',
    name: 'San José de Piedra Blanca',
    shortName: 'San José',
    tagline: 'Cuna del Beato Esquiú, historia colonial y plaza central',
    description: 'Capital histórica y cultural del departamento. Alberga la Casa Natal de Fray Mamerto Esquiú, la Iglesia Parroquial de 1780, el Monumento Mirador y las Ruinas del Trapiche Azucarero.',
    badge: 'Historia & Fe',
    gradient: 'from-amber-900 via-stone-850 to-stone-950',
    filterKeywords: ['San José', 'Piedra Blanca'],
  },
  {
    id: 'villa-las-pirquitas',
    name: 'Villa Las Pirquitas',
    shortName: 'Las Pirquitas',
    tagline: 'Dique, deportes náuticos, murallón y descanso serrano',
    description: 'El gran centro recreativo y náutico de Catamarca. Su embalse verde esmeralda invita a navegar en kayak, pescar pejerrey, acampar en su camping municipal y recorrer el Paseo Las Moras.',
    badge: 'Lago & Montaña',
    gradient: 'from-blue-900 via-slate-850 to-cyan-950',
    filterKeywords: ['Pirquitas', 'Las Pirquitas', 'Dique'],
  },
  {
    id: 'san-antonio',
    name: 'San Antonio',
    shortName: 'San Antonio',
    tagline: 'Costanera del Río del Valle, gastronomía y balnearios',
    description: 'Famoso por su agradable costanera arbolada junto al Río del Valle, parrilladas criollas, alquiler de bicicletas de paseo y vida social al aire libre.',
    badge: 'Río & Sabores',
    gradient: 'from-emerald-900 via-slate-850 to-teal-950',
    filterKeywords: ['San Antonio', 'La Falda de San Antonio'],
  },
  {
    id: 'la-tercena',
    name: 'La Tercena',
    shortName: 'La Tercena',
    tagline: 'Santuario del Señor de los Milagros y acceso a Casa de Piedra',
    description: 'Pueblo de arraigada fe y tradiciones. Punto de partida para los ascensos y trekking a la Sierra de Gracián y sede del venerado templo del Señor de los Milagros.',
    badge: 'Devoción & Sierras',
    gradient: 'from-rose-900 via-stone-850 to-stone-950',
    filterKeywords: ['La Tercena', 'Tercena'],
  },
  {
    id: 'la-carrera',
    name: 'La Carrera',
    shortName: 'La Carrera',
    tagline: 'Caminos serranos, Cuesta del Gracián y gastronomía de campo',
    description: 'Entorno de campos verdes y vistas panorámicas hacia la sierra. Ideal para el cicloturismo, cabalgatas guiadas, clubes de campo y meriendas criollas.',
    badge: 'Paisaje Rural',
    gradient: 'from-teal-900 via-slate-850 to-emerald-950',
    filterKeywords: ['La Carrera', 'Carrera'],
  },
  {
    id: 'collagasta',
    name: 'Collagasta',
    shortName: 'Collagasta',
    tagline: 'Casonas de adobe, Laguna Victoria y casas de té con encanto',
    description: 'Rincón de paz con nogales centenarios, arquitectura tradicional y espacios de relajación como Laguna Victoria y acogedoras casas de té artesanales.',
    badge: 'Tranquilidad & Té',
    gradient: 'from-orange-900 via-stone-850 to-amber-950',
    filterKeywords: ['Collagasta'],
  },
  {
    id: 'pomancillo-este',
    name: 'Pomancillo Este',
    shortName: 'Pomancillo Este',
    tagline: 'Ribera del Río del Valle, bosque nativo y cabañas',
    description: 'Ubicado en la margen este del río, ofrece un contacto íntimo con la flora del Chaco Serrano, arboledas frondosas y complejos de cabañas para desconectar.',
    badge: 'Naturaleza Pura',
    gradient: 'from-green-900 via-slate-850 to-emerald-950',
    filterKeywords: ['Pomancillo Este', 'Pomancillo'],
  },
  {
    id: 'pomancillo-oeste',
    name: 'Pomancillo Oeste',
    shortName: 'Pomancillo Oeste',
    tagline: 'Sierras del oeste, senderos campestres y vistas abiertas',
    description: 'Pequeño paraje rural donde el tiempo parece detenerse. Senderos de montaña entre jarillas y algarrobos con amplias vistas panorámicas al valle.',
    badge: 'Sierras & Silencio',
    gradient: 'from-slate-900 via-stone-850 to-stone-950',
    filterKeywords: ['Pomancillo Oeste'],
  },
];

export const LocalidadesSection: React.FC = () => {
  const { places } = useData();
  const [selectedLocalityId, setSelectedLocalityId] = useState<string | null>(null);

  const selectedLocality = LOCALITIES_DATA.find((l) => l.id === selectedLocalityId);

  // Filter places for selected locality
  const localityPlaces = selectedLocality
    ? places.filter((p) =>
        selectedLocality.filterKeywords.some(
          (kw) =>
            p.locality.toLowerCase().includes(kw.toLowerCase()) ||
            p.address.toLowerCase().includes(kw.toLowerCase())
        )
      )
    : [];

  return (
    <section id="seccion-localidades-fray" className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Territorio Integral</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
            Descubrí Fray por localidad
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Fray es todo el departamento: explorá cada uno de sus 8 pueblos
          </p>
        </div>

        {selectedLocalityId && (
          <button
            onClick={() => setSelectedLocalityId(null)}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 transition"
          >
            Ver todas las localidades
          </button>
        )}
      </div>

      {/* Grid Localities Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LOCALITIES_DATA.map((loc) => {
          const isSelected = selectedLocalityId === loc.id;
          const count = places.filter((p) =>
            loc.filterKeywords.some(
              (kw) =>
                p.locality.toLowerCase().includes(kw.toLowerCase()) ||
                p.address.toLowerCase().includes(kw.toLowerCase())
            )
          ).length;

          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocalityId(isSelected ? null : loc.id)}
              className={`relative rounded-2xl overflow-hidden text-left transition-all duration-200 border flex flex-col justify-end p-3.5 min-h-[140px] group bg-gradient-to-br ${loc.gradient} ${
                isSelected
                  ? 'ring-2 ring-blue-600 ring-offset-2 shadow-lg scale-[1.02] border-blue-500'
                  : 'border-slate-800 hover:border-slate-600 hover:shadow-md'
              }`}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="relative z-10 space-y-1 text-white">
                <span className="text-[9px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full inline-block border border-white/20">
                  {loc.badge}
                </span>
                <h3 className="font-display font-black text-xs sm:text-sm tracking-tight text-white leading-tight">
                  {loc.shortName}
                </h3>
                <span className="text-[10px] text-slate-300 font-semibold block">
                  {count} {count === 1 ? 'lugar' : 'lugares'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail drawer when a locality is active */}
      {selectedLocality && (
        <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-md space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  {selectedLocality.badge}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {selectedLocality.name}
                </span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 mt-1">
                {selectedLocality.name}
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                {selectedLocality.description}
              </p>
            </div>

            <div className="bg-blue-50/80 px-4 py-2.5 rounded-2xl border border-blue-100 text-center shrink-0">
              <span className="text-lg font-black text-blue-900 block leading-none">
                {localityPlaces.length}
              </span>
              <span className="text-[10px] font-bold text-blue-700 uppercase">
                Opciones registradas
              </span>
            </div>
          </div>

          {/* Places in this locality */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Atractivos, gastronomía y servicios en {selectedLocality.shortName}:
            </h4>

            {localityPlaces.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
                Actualmente no hay prestadores cargados directamente en {selectedLocality.name}.
                <br />
                Podés sumarlos o editarlos desde el Panel de Administración.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {localityPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
