import React from 'react';
import { Heart, Compass, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PlaceCard } from './PlaceCard';

export const SavedFavoritesView: React.FC = () => {
  const { places, favorites, setActiveTab } = useData();

  const savedPlaces = places.filter((p) => favorites.includes(p.id));

  return (
    <section id="saved-favorites-view" className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Mis Lugares Guardados</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mt-0.5">
            Tus favoritos en Fray
          </h2>
        </div>

        <span className="text-xs font-black text-slate-600 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200">
          {savedPlaces.length} guardados
        </span>
      </div>

      {savedPlaces.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-display font-black text-base text-slate-900">
            Todavía no guardaste ningún lugar
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
            Tocá el corazón ❤️ en cualquier atractivo, restaurante o cabaña para tenerlo a mano durante tu viaje.
          </p>
          <button
            onClick={() => setActiveTab('inicio')}
            className="py-2.5 px-5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-700 transition active:scale-95"
          >
            Explorar Fray
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </section>
  );
};
