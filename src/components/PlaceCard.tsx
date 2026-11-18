import React from 'react';
import {
  MapPin,
  Heart,
  Navigation,
  MessageCircle,
  Headphones,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { Place } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDistance, getDirectionsUrl, getWhatsAppUrl, isValidCoordinate } from '../utils/geoUtils';
import { CATEGORIES } from '../data/initialData';
import { PlacePhotoDisplay } from './PlacePhotoDisplay';

interface PlaceCardProps {
  place: Place;
  compact?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, compact = false }) => {
  const {
    setSelectedPlace,
    toggleFavorite,
    isFavorite,
    audioguides,
    playAudioguide,
    setPlaceToEdit,
    userLocation,
  } = useData();

  const { isAuthenticated, isEditorMode } = useAuth();

  const isFav = isFavorite(place.id);
  const categoryInfo = CATEGORIES.find((c) => c.id === place.category);
  const audioguide = audioguides.find((a) => a.placeId === place.id || a.id === place.audioguideId);

  const handleEditPlace = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaceToEdit(place);
  };

  const hasDirections = Boolean(place.googleMapsUrl || isValidCoordinate(place.lat, place.lng));

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const directUrl = place.googleMapsUrl || (place.id === 'casa-natal-esquiu' ? 'https://maps.app.goo.gl/ZnX2YUWqjrBW843TA' : undefined);
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!isValidCoordinate(place.lat, place.lng)) return;
    window.open(
      getDirectionsUrl(place.lat, place.lng, place.name, userLocation),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = `¡Hola! Los encontré en Fray Turismo. Quería consultar sobre ${place.name}.`;
    window.open(getWhatsAppUrl(place.whatsapp, msg), '_blank', 'noopener,noreferrer');
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(place.id);
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioguide) {
      playAudioguide(audioguide);
    }
  };

  if (compact) {
    return (
      <div
        id={`place-card-compact-${place.id}`}
        onClick={() => setSelectedPlace(place)}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex cursor-pointer hover:border-blue-300 hover:shadow-md transition duration-200 group"
      >
        <div className="w-28 h-28 relative shrink-0 overflow-hidden">
          <PlacePhotoDisplay
            image={place.image}
            alt={place.name}
            categoryEmoji={categoryInfo?.emoji}
            locality={place.locality}
            aspectRatio="square"
            compact={true}
            className="w-full h-full"
          />
          {place.distanceKm !== undefined && (
            <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
              {formatDistance(place.distanceKm)}
            </span>
          )}
        </div>

        <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full truncate border border-emerald-200">
                {categoryInfo?.emoji} {categoryInfo?.shortLabel}
              </span>
              <div className="flex items-center gap-1">
                {isAuthenticated && isEditorMode && (
                  <button
                    onClick={handleEditPlace}
                    title="Editar lugar (Modo Editor)"
                    className="p-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={handleToggleFav}
                  aria-label={isFav ? 'Quitar de guardados' : 'Guardar lugar'}
                  className="text-slate-400 hover:text-rose-600 p-1 transition"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'fill-[#E11D48] text-[#E11D48]' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 mt-1 group-hover:text-emerald-700 transition">
              {place.name}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
              {place.locality}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {place.validationStatus === 'verificado' ? 'Verificado' : 'Guía FME'}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">Ver ficha →</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article
      id={`place-card-${place.id}`}
      onClick={() => setSelectedPlace(place)}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:shadow-blue-950/5 hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Top Image Container with Strict Verified Photo Filter */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <PlacePhotoDisplay
          image={place.image}
          alt={place.name}
          categoryEmoji={categoryInfo?.emoji}
          locality={place.locality}
          aspectRatio="video"
          className="w-full h-full"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
          {/* Category Chip */}
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-white/40">
            <span>{categoryInfo?.emoji}</span>
            <span>{categoryInfo?.shortLabel}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {/* Editor mode quick button */}
            {isAuthenticated && isEditorMode && (
              <button
                onClick={handleEditPlace}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-amber-300 transition active:scale-95"
                title="Editar este atractivo"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}

            {/* Audioguide indicator */}
            {audioguide && (
              <button
                onClick={handlePlayAudio}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition"
                title="Escuchar audioguía"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Audio</span>
              </button>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleToggleFav}
              aria-label={isFav ? 'Quitar de guardados' : 'Guardar en mis favoritos'}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-600 transition shadow-xs"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFav ? 'fill-[#E11D48] text-[#E11D48]' : 'stroke-[2px]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Image Stats (Distance & Locality) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none z-10">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-medium truncate">{place.locality}</span>
          </div>

          {place.distanceKm !== undefined && (
            <div className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs border border-white/20">
              a {formatDistance(place.distanceKm)}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
              {place.name}
            </h3>
            {place.priceLevel && (
              <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {place.priceLevel}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {place.shortDescription}
          </p>

          {/* Tags Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium bg-emerald-50/70 text-emerald-950 px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-200/50"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {tag}
              </span>
            ))}
            {place.tags.length > 3 && (
              <span className="text-[11px] font-medium text-slate-400 self-center">
                +{place.tags.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {hasDirections ? (
            <button
              onClick={handleDirections}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              <span>Cómo llegar</span>
            </button>
          ) : (
            <span className="flex-1 py-2.5 px-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Ubicación por confirmar</span>
            </span>
          )}

          {place.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
              title="Consultar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          <button
            onClick={() => setSelectedPlace(place)}
            className="py-2.5 px-3.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 rounded-xl text-xs font-bold border border-emerald-200/80 transition"
          >
            Ficha →
          </button>
        </div>
      </div>
    </article>
  );
};
