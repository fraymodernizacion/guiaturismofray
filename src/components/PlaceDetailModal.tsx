import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Headphones,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import { Place } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getDirectionsUrl, isValidCoordinate } from '../utils/geoUtils';
import { CATEGORIES } from '../data/initialData';

interface PlaceDetailModalProps {
  place?: Place | null;
  onClose?: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place: propPlace,
  onClose,
}) => {
  const {
    selectedPlace,
    setSelectedPlace,
    audioguides,
    playAudioguide,
    places,
    setPlaceToEdit,
    userLocation,
  } = useData();

  const { isAuthenticated, isEditorMode } = useAuth();

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [imgError, setImgError] = useState(false);

  const place = propPlace !== undefined ? propPlace : selectedPlace;

  useEffect(() => {
    setImgError(false);
    setActivePhotoIndex(0);
  }, [place?.id, place?.image]);

  if (!place) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setSelectedPlace(null);
    }
  };

  const handleOpenEditor = () => {
    handleClose();
    setPlaceToEdit(place);
  };

  const categoryInfo = CATEGORIES.find((c) => c.id === place.category);
  const audioguide = audioguides.find(
    (a) => (place.id && a.placeId === place.id) || (place.audioguideId && a.id === place.audioguideId)
  );

  const categoryBadgeLabel =
    place.subCategory && place.subCategory.trim() !== ''
      ? place.subCategory
      : categoryInfo?.label
      ? `${categoryInfo.emoji ? categoryInfo.emoji + ' ' : ''}${categoryInfo.label}`
      : null;

  // Fotografías reales:
  // Se prioriza la imagen principal y se agregan las fotos de galería sin duplicados
  const rawPhotos = [
    ...(place.image && typeof place.image === 'string' && place.image.trim() !== '' ? [place.image] : []),
    ...(Array.isArray(place.gallery) ? place.gallery : []),
  ];
  const verifiedPhotos = Array.from(new Set(rawPhotos))
    .filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim() !== ''));
  const hasVerifiedPhotos = verifiedPhotos.length > 0 && !imgError;
  const allPhotos = verifiedPhotos;

  // Nearby places in the same locality or category
  const nearbyPlaces = places
    .filter((p) => p.id !== place.id)
    .sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999))
    .slice(0, 3);

  const directionsHref =
    place.googleMapsUrl ||
    (place.id === 'casa-natal-esquiu'
      ? 'https://maps.app.goo.gl/ZnX2YUWqjrBW843TA'
      : place.id === 'dique-las-pirquitas'
      ? 'https://maps.app.goo.gl/hyK2JveNJ2APqnfG6'
      : place.id === 'vertedero-dique-pirquitas'
      ? 'https://maps.app.goo.gl/6HMZY2BCMHpr3HpF8'
      : isValidCoordinate(place.lat, place.lng)
      ? getDirectionsUrl(place.lat, place.lng, place.name || 'Lugar', userLocation)
      : undefined);

  const handleStartAudio = () => {
    if (audioguide) {
      playAudioguide(audioguide);
    }
  };

  return (
    <div
      id="place-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        id="place-detail-sheet"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom duration-300"
      >
        {/* Top Sticky Bar on Mobile */}
        <div className="relative">
          {hasVerifiedPhotos && allPhotos[activePhotoIndex] ? (
            /* Main Gallery Carousel with Photos */
            <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden group">
              <img
                src={allPhotos[activePhotoIndex]}
                alt={place.name || 'Lugar'}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              {/* Close Button */}
              <button
                id="btn-close-place-detail"
                onClick={handleClose}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black flex items-center justify-center transition z-10"
                aria-label="Cerrar ficha"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Category Badge & Badge */}
              <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-2">
                {categoryBadgeLabel && (
                  <span className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                    {categoryBadgeLabel}
                  </span>
                )}
              </div>

              {/* Carousel Navigation Arrows */}
              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Bottom Title on Image */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{place.locality || 'Fray Mamerto Esquiú'}</span>
                </div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mt-1 leading-tight">
                  {place.name}
                </h2>
              </div>
            </div>
          ) : (
            /* Fotografía Pendiente Header (Neutral Placeholder) */
            <div className="relative bg-slate-900 p-5 sm:p-6 overflow-hidden border-b border-slate-800">
              {/* Top Controls */}
              <div className="flex items-center justify-between relative z-10 mb-4">
                {categoryBadgeLabel ? (
                  <span className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                    {categoryBadgeLabel}
                  </span>
                ) : (
                  <div />
                )}

                <button
                  id="btn-close-place-detail"
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/10"
                  aria-label="Cerrar ficha"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{place.locality || 'Fray Mamerto Esquiú'}</span>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  {place.name}
                </h2>
              </div>
            </div>
          )}

          {/* Photo Thumbnail Strip if multiple verified photos */}
          {hasVerifiedPhotos && allPhotos.length > 1 && (
            <div className="flex gap-2 p-2 bg-slate-100 overflow-x-auto no-scrollbar">
              {allPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 scale-105 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${place.name} foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Admin Editor Quick Action */}
          {isAuthenticated && isEditorMode && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Modo Editor Activo: podés editar la foto, textos y datos de esta ficha</span>
              </div>
              <button
                onClick={handleOpenEditor}
                className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar este lugar</span>
              </button>
            </div>
          )}

          {/* Audioguide Banner if available */}
          {audioguide && (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between gap-3 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Headphones className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black text-emerald-300 tracking-wider">
                      Audioguía Oficial
                    </span>
                    {audioguide.duration && <span className="text-xs text-white/70">· {audioguide.duration}</span>}
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">
                    {audioguide.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={handleStartAudio}
                className="py-2 px-3.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black shrink-0 shadow-xs transition active:scale-95"
              >
                ▶ Escuchar
              </button>
            </div>
          )}

          {/* Photo Pending Banner / Notice (only for places without photos) */}
          {!hasVerifiedPhotos && place.photoPendingNote && (
            <div className="bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-3xl p-4 text-amber-950 flex items-start gap-3">
              <span className="text-xl shrink-0">📸</span>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  Fotografía Territorial en Relevamiento
                </span>
                <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                  {place.photoPendingNote}
                </p>
                <p className="text-[11px] text-amber-700">
                  Estamos integrando el banco de imágenes oficial de Fray Mamerto Esquiú para brindarte vistas fidedignas de este atractivo.
                </p>
              </div>
            </div>
          )}

          {/* TREKKING & SENDERISMO SPECIAL SECTION */}
          {place.trekkingInfo && (
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-emerald-500/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                    ⛰️
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                      Ficha Técnica de Montaña
                    </span>
                    <h4 className="font-display font-black text-base text-white">
                      Guía del Sendero & Trekking
                    </h4>
                  </div>
                </div>

                {place.trekkingInfo.difficulty && (
                  <span className="bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-full shadow-sm">
                    {place.trekkingInfo.difficulty}
                  </span>
                )}
              </div>

              {/* Grid of Mountain Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {place.trekkingInfo.durationHours && (
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-slate-300 uppercase block font-semibold">Duración aprox.</span>
                    <span className="font-bold text-white text-sm">
                      {place.trekkingInfo.durationHours}
                    </span>
                  </div>
                )}

                {place.trekkingInfo.distanceKm && (
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-slate-300 uppercase block font-semibold">Distancia</span>
                    <span className="font-bold text-white text-sm">
                      {place.trekkingInfo.distanceKm} km
                    </span>
                  </div>
                )}

                {place.trekkingInfo.elevationGain && (
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-slate-300 uppercase block font-semibold">Desnivel</span>
                    <span className="font-bold text-white text-sm">
                      {place.trekkingInfo.elevationGain}
                    </span>
                  </div>
                )}

                {place.trekkingInfo.bestTimeToVisit && (
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-slate-300 uppercase block font-semibold">Mejor horario</span>
                    <span className="font-bold text-emerald-300 text-xs line-clamp-1">
                      {place.trekkingInfo.bestTimeToVisit}
                    </span>
                  </div>
                )}
              </div>

              {/* Equipment & Water Recommendations */}
              {(place.trekkingInfo.waterRecommended || place.trekkingInfo.footwearRecommended) && (
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  {place.trekkingInfo.waterRecommended && (
                    <div className="flex items-start gap-2 text-slate-200">
                      <span className="text-cyan-400 font-bold shrink-0">💧 Hidratación:</span>
                      <span>{place.trekkingInfo.waterRecommended}</span>
                    </div>
                  )}
                  {place.trekkingInfo.footwearRecommended && (
                    <div className="flex items-start gap-2 text-slate-200">
                      <span className="text-amber-400 font-bold shrink-0">👟 Calzado:</span>
                      <span>{place.trekkingInfo.footwearRecommended}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Environmental Care Rules */}
              {Array.isArray(place.trekkingInfo.environmentalCare) && place.trekkingInfo.environmentalCare.length > 0 && (
                <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1.5 text-xs">
                  <span className="font-black text-emerald-300 text-[11px] uppercase tracking-wider block">
                    🌿 Cuidado Ambiental & Reserva Natural
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {place.trekkingInfo.environmentalCare.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Warnings */}
              {Array.isArray(place.trekkingInfo.safetyWarnings) && place.trekkingInfo.safetyWarnings.length > 0 && (
                <div className="bg-amber-950/60 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5 text-xs">
                  <span className="font-black text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Advertencias de Seguridad</span>
                  </span>
                  <ul className="space-y-1 text-amber-100/90">
                    {place.trekkingInfo.safetyWarnings.map((warn, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0">⚠️</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {place.description && (
            <div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Sobre este lugar
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                {place.description}
              </p>
            </div>
          )}

          {/* Preventive & Risk Notice */}
          {place.safetyWarning && (
            <div className="bg-amber-50 border border-amber-200/90 rounded-3xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Medidas preventivas y de riesgo
                </p>
                <p className="text-xs text-amber-900 font-semibold leading-relaxed mt-1">
                  {place.safetyWarning}
                </p>
              </div>
            </div>
          )}

          {/* Address & Hours Information */}
          {(place.address || directionsHref || place.openingHours) && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 space-y-3">
              {(place.address || directionsHref) && (
                <div className="flex items-start justify-between gap-3">
                  {place.address ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-slate-900">Dirección</p>
                        <p className="text-xs text-slate-600 font-medium">{place.address}</p>
                        {place.locality && !place.address.toLowerCase().includes('fray mamerto esqui') && (
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {place.locality}, Fray Mamerto Esquiú, Catamarca
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 self-center">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-black text-slate-900">Cómo llegar</p>
                    </div>
                  )}
                  {directionsHref && (
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-xl transition"
                      title="Abrir en Google Maps"
                    >
                      <span>Maps</span>
                      <Navigation className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {place.openingHours && (
                <div className={`flex items-start gap-3 ${(place.address || directionsHref) ? 'pt-2 border-t border-slate-200/60' : ''}`}>
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-slate-900">Horarios de atención</p>
                    <p className="text-xs text-slate-700 font-medium">{place.openingHours}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Services & Amenities */}
          {Array.isArray(place.services) && place.services.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Servicios disponibles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {place.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby places suggestions */}
          {nearbyPlaces.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
                Otros lugares cerca de acá
              </h4>
              <div className="space-y-2">
                {nearbyPlaces.map((np) => (
                  <div
                    key={np.id}
                    onClick={() => {
                      setSelectedPlace(np);
                      setActivePhotoIndex(0);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-white cursor-pointer transition shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {np.image && np.image.trim() !== '' ? (
                        <img
                          src={np.image}
                          alt={np.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                          <MapPin className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {np.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-medium">
                          {np.locality}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 shrink-0 ml-2">
                      Ver →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
