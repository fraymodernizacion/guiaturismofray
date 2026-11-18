import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  Filter,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CATEGORIES, INITIAL_USER_PRESETS } from '../data/initialData';
import { CategoryId, Place } from '../types';
import { formatDistance, getDirectionsUrl, getWhatsAppUrl, isValidCoordinate } from '../utils/geoUtils';

// Fix Leaflet's default icon path issues in bundled React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category pin colors & emojis
const categoryPinStyles: Record<string, { bg: string; border: string; emoji: string }> = {
  visitar: { bg: '#d97706', border: '#b45309', emoji: '📸' },
  comer: { bg: '#f97316', border: '#c2410c', emoji: '🍴' },
  merendar: { bg: '#f43f5e', border: '#be123c', emoji: '☕' },
  campings: { bg: '#0891b2', border: '#0e7490', emoji: '🏊' },
  dormir: { bg: '#3b82f6', border: '#1d4ed8', emoji: '🛏️' },
  naturaleza: { bg: '#10b981', border: '#047857', emoji: '🌿' },
  historia: { bg: '#854d0e', border: '#713f12', emoji: '⛪' },
  actividades: { bg: '#06b6d4', border: '#0e7490', emoji: '🚲' },
  eventos: { bg: '#a855f7', border: '#7e22ce', emoji: '🎭' },
  default: { bg: '#64748b', border: '#334155', emoji: '📍' },
};

export const InteractiveMap: React.FC = () => {
  const {
    places,
    userLocation,
    setUserLocation,
    requestRealGeolocation,
    retryLocationPermission,
    isLocating,
    locationError,
    clearLocationError,
    setSelectedPlace,
    toggleFavorite,
    isFavorite,
  } = useData();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [selectedMapCategory, setSelectedMapCategory] = useState<CategoryId | 'all'>('all');
  const [highlightedPlace, setHighlightedPlace] = useState<Place | null>(null);

  // Filter places based on selected map category and valid coordinates
  const filteredPlaces = places.filter((p) => {
    if (!isValidCoordinate(p.lat, p.lng)) return false;
    return (
      selectedMapCategory === 'all' ||
      p.category === selectedMapCategory ||
      Boolean(p.secondaryCategories?.includes(selectedMapCategory))
    );
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
      });

      // Add clean CartoDB Voyager or OSM tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Municipalidad de FME',
        maxZoom: 19,
      }).addTo(map);

      // Add top-right zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Marker group
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      leafletMapRef.current = map;
    }

    return () => {
      // Keep map alive or clean on unmount
    };
  }, []);

  const hasCenteredFirstGpsRef = useRef<boolean>(false);

  // Auto-center map on the FIRST real GPS location acquisition
  useEffect(() => {
    if (userLocation.isRealGps && !hasCenteredFirstGpsRef.current && leafletMapRef.current) {
      hasCenteredFirstGpsRef.current = true;
      leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
    }
  }, [userLocation.isRealGps, userLocation.lat, userLocation.lng]);

  // Update User Marker (Single marker, position & circle updated without moving map view)
  useEffect(() => {
    if (!leafletMapRef.current) return;

    if (userMarkerRef.current) {
      leafletMapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      leafletMapRef.current.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    // If real GPS with accuracy, draw soft precision circle
    if (userLocation.isRealGps && userLocation.accuracy && userLocation.accuracy > 0) {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: userLocation.accuracy,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 6',
      }).addTo(leafletMapRef.current);
      accuracyCircleRef.current = circle;
    }

    // Custom user pulse icon with '📍 Vos'
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
        <div class="relative px-2 py-0.5 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center gap-1 text-white text-[11px] font-black tracking-tight whitespace-nowrap">
          <span>📍</span>
          <span>Vos</span>
        </div>
      </div>
    `;

    const userDivIcon = L.divIcon({
      html: userIconHtml,
      className: 'custom-user-marker',
      iconSize: [52, 28],
      iconAnchor: [26, 14],
    });

    const accuracyText = userLocation.isRealGps
      ? `GPS en vivo · Margen: ±${userLocation.accuracy ?? '--'}m`
      : `Punto de referencia: ${userLocation.name}`;

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userDivIcon,
      zIndexOffset: 1000,
    })
      .addTo(leafletMapRef.current)
      .bindPopup(
        `<div style="font-family: inherit; text-align: center; padding: 4px;">
          <p style="margin: 0; font-weight: 900; font-size: 13px; color: #059669;">📍 Vos</p>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #475569; font-weight: 600;">${accuracyText}</p>
        </div>`
      );

    userMarkerRef.current = userMarker;
  }, [userLocation]);

  // Update Place Markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredPlaces.forEach((place) => {
      const pinStyle = categoryPinStyles[place.category] || categoryPinStyles.default;

      const isHigh = highlightedPlace?.id === place.id;
      const markerHtml = `
        <div class="cursor-pointer transition-transform transform hover:scale-125 ${
          isHigh ? 'scale-125' : ''
        }">
          <div style="
            background-color: ${pinStyle.bg};
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">${pinStyle.emoji}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-cat-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      const hasImage = Boolean(place.image && place.image.trim() !== '');
      const popupHtml = `
        <div style="font-family: inherit; max-width: 210px; padding: 2px;">
          ${hasImage ? `<img src="${place.image}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />` : ''}
          <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.2;">${place.name}</h4>
          <p style="margin: 3px 0 8px 0; font-size: 11px; color: #64748b; font-weight: 500;">${place.locality}</p>
          <button id="btn-popup-${place.id}" style="width: 100%; padding: 7px 10px; background: #059669; color: white; border: none; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(5,150,105,0.3);">
            Ver ficha completa →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setHighlightedPlace(place);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${place.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedPlace(place);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredPlaces, highlightedPlace]);

  // Center on user position
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
    }
  };

  // Center on a specific place card click
  const handleSelectPlaceOnMap = (place: Place) => {
    setHighlightedPlace(place);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
    }
  };

  return (
    <div id="cerca-de-mi-view" className="relative flex flex-col h-[calc(100vh-140px)] min-h-[500px] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
      {/* Top Filter Controls Floating Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 space-y-2 pointer-events-none">
        {/* Category Horizontal Scroll Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedMapCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap shadow-xs transition ${
              selectedMapCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white/95 text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            Todos ({places.length})
          </button>

          {CATEGORIES.filter((c) => !['cerca', 'audioguias', 'info'].includes(c.id)).map((cat) => {
            const isSelected = selectedMapCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedMapCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap shadow-xs flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : 'bg-white/95 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Re-center & GPS button */}
      <div className="absolute right-3 top-16 z-20 flex flex-col items-end gap-2">
        <button
          id="btn-map-use-my-location"
          onClick={requestRealGeolocation}
          disabled={isLocating}
          className="px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg flex items-center gap-1.5 text-xs font-bold transition border border-emerald-500/30"
          title="Usar mi ubicación"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <span className="text-sm">📍</span>
          )}
          <span>{isLocating ? 'Obteniendo...' : 'Usar mi ubicación'}</span>
        </button>

        <button
          id="btn-map-recenter"
          onClick={handleRecenter}
          className="w-10 h-10 rounded-2xl bg-white text-slate-800 hover:text-emerald-600 shadow-md border border-slate-200 flex items-center justify-center transition active:scale-95"
          title="Centrar en mi ubicación"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Location Error Prompt in Map */}
      {locationError && (
        <div className="absolute top-16 left-3 max-w-sm z-20 bg-amber-50/95 backdrop-blur-md border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 shadow-xl animate-fadeIn flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-bold text-[12px] leading-tight text-amber-950">
                {locationError}
              </p>
            </div>
            <button
              onClick={clearLocationError}
              className="text-amber-700 hover:text-amber-950 p-0.5 text-xs font-bold shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
            <button
              onClick={retryLocationPermission}
              disabled={isLocating}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>Reintentar</span>
            </button>

            <select
              id="select-map-fallback-location"
              value={userLocation.name}
              onChange={(e) => {
                const found = INITIAL_USER_PRESETS.find((p) => p.name === e.target.value);
                if (found) {
                  setUserLocation(found);
                  clearLocationError();
                }
              }}
              className="text-[11px] bg-white border border-amber-300 rounded-lg px-2 py-1 text-slate-800 font-bold"
            >
              <option value="" disabled>Elegir punto de referencia</option>
              {INITIAL_USER_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-100 z-10" />

      {/* Bottom Horizontal Carousel of Places on Map */}
      <div className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 pointer-events-auto">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {filteredPlaces.map((place) => {
              const isHigh = highlightedPlace?.id === place.id;
              return (
                <div
                  key={place.id}
                  onClick={() => handleSelectPlaceOnMap(place)}
                  className={`w-72 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border shadow-lg cursor-pointer shrink-0 transition-all duration-200 flex gap-2.5 items-center ${
                    isHigh
                      ? 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/90'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {place.image && place.image.trim() !== '' ? (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 text-sky-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md truncate">
                        {place.locality}
                      </span>
                      {place.distanceKm !== undefined && (
                        <span className="text-[10px] font-bold text-slate-500">
                          {formatDistance(place.distanceKm)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate mt-1">
                      {place.name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlace(place);
                      }}
                      className="mt-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      Ver ficha completa →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
