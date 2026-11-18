import React from 'react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

interface LocationWelcomeModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isLocating?: boolean;
}

export const LocationWelcomeModal: React.FC<LocationWelcomeModalProps> = ({
  isOpen,
  onAllow,
  onDeny,
  isLocating = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-location-welcome"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-location-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm sm:max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden transform transition-all animate-scaleUp">
        {/* Decorative background accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Top Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs mb-4">
          <MapPin className="w-8 h-8 text-emerald-600 animate-bounce" />
        </div>

        {/* Title */}
        <h3
          id="modal-location-title"
          className="text-2xl font-black text-slate-900 tracking-tight mb-3"
        >
          📍 Activá tu ubicación
        </h3>

        {/* Clear, simple friendly description for tourists & seniors */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-medium">
          Usamos tu ubicación únicamente para mostrarte lugares cercanos y ayudarte a recorrer Fray.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            id="btn-allow-location"
            onClick={onAllow}
            disabled={isLocating}
            className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl text-base font-black shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-5 h-5 fill-current" />
            <span>{isLocating ? 'Activando...' : 'Activar ubicación'}</span>
          </button>

          <button
            id="btn-deny-location"
            onClick={onDeny}
            disabled={isLocating}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-600 hover:text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            Continuar sin ubicación
          </button>
        </div>
      </div>
    </div>
  );
};


