import React from 'react';
import {
  PhoneCall,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { INITIAL_USER_PRESETS } from '../data/initialData';
import { FrayMainBrand } from './BrandLogos';

export const Header: React.FC = () => {
  const {
    setActiveCategory,
    userLocation,
    setUserLocation,
    retryLocationPermission,
    isLocating,
    locationError,
    clearLocationError,
    setIsUsefulInfoModalOpen,
    setActiveTab,
  } = useData();

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5">
        {/* Top Brand & Quick Actions Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Official Logo Brand */}
          <div
            onClick={() => {
              setActiveTab('inicio');
              setActiveCategory(null);
            }}
            className="cursor-pointer transition hover:opacity-90 active:scale-98"
          >
            <FrayMainBrand />
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Useful info & emergency */}
            <button
              id="btn-useful-info-header"
              onClick={() => setIsUsefulInfoModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 text-rose-800 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/90 border border-rose-200 rounded-xl transition flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-xs"
              title="Teléfonos de emergencia e información útil"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Info & Ayuda</span>
            </button>
          </div>
        </div>

        {/* Simple Clean Location Error Box */}
        {locationError && (
          <div className="mt-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 bg-amber-50 text-amber-950 border border-amber-200 rounded-xl text-xs animate-fadeIn shadow-xs">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-bold text-amber-900 leading-tight">
                {locationError}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                id="btn-retry-location"
                onClick={retryLocationPermission}
                disabled={isLocating}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>Reintentar</span>
              </button>

              <select
                id="select-fallback-location"
                value={userLocation.name}
                onChange={(e) => {
                  const found = INITIAL_USER_PRESETS.find((p) => p.name === e.target.value);
                  if (found) {
                    setUserLocation(found);
                    clearLocationError();
                  }
                }}
                className="text-xs bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-slate-800 font-bold focus:ring-1 focus:ring-amber-400"
              >
                <option value="" disabled>Elegir punto de referencia</option>
                {INITIAL_USER_PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>

              <button
                onClick={clearLocationError}
                className="text-amber-700 hover:text-amber-950 font-bold p-1 text-xs"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
