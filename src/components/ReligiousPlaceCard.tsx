import React, { useState, useEffect } from 'react';
import { Landmark, Navigation } from 'lucide-react';
import { Place } from '../types';
import { useData } from '../context/DataContext';
import { getDirectionsUrl } from '../utils/geoUtils';

interface ReligiousPlaceCardProps {
  place: Place;
}

export const ReligiousPlaceCard: React.FC<ReligiousPlaceCardProps> = ({ place }) => {
  const { setSelectedPlace, userLocation } = useData();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [place.image]);

  const hasPhoto = Boolean(place.image && place.image.trim() !== '' && !imgError);
  const reviewText = (place.shortDescription || place.description || '').trim();
  const mapsUrl =
    place.googleMapsUrl ||
    getDirectionsUrl(place.lat, place.lng, place.name, userLocation);

  return (
    <article
      id={`religious-place-card-${place.id}`}
      onClick={() => setSelectedPlace(place)}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Fotografía del lugar */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        {hasPhoto ? (
          <img
            src={place.image}
            alt={place.name}
            onError={() => setImgError(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-200">
              <Landmark className="w-7 h-7" />
            </div>
          </div>
        )}
      </div>

      {/* Nombre, breve reseña y botón Cómo llegar */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-800 transition-colors leading-snug">
            {place.name}
          </h3>

          {reviewText && (
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {reviewText}
            </p>
          )}
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xs"
        >
          <Navigation className="w-4 h-4 text-amber-300" />
          <span>Cómo llegar</span>
        </a>
      </div>
    </article>
  );
};
