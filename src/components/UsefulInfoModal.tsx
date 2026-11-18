import React from 'react';
import {
  X,
  PhoneCall,
  Bus,
  Shield,
  MapPin,
  Pill,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { USEFUL_INFO_DATA } from '../data/initialData';
import { getWhatsAppUrl } from '../utils/geoUtils';
import { FrayIsotype, TierraDeMilagrosBadge } from './BrandLogos';

export const UsefulInfoModal: React.FC = () => {
  const { isUsefulInfoModalOpen, setIsUsefulInfoModalOpen } = useData();

  if (!isUsefulInfoModalOpen) return null;

  const handleCall = (phone: string) => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
  };

  const handleWhatsAppTurismo = () => {
    const url = getWhatsAppUrl(
      USEFUL_INFO_DATA.officialContacts.whatsappTurismo,
      '¡Hola! Me comunico desde la app Fray Turismo. Quería hacer una consulta turística.'
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="useful-info-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={() => setIsUsefulInfoModalOpen(false)}
    >
      <div
        id="useful-info-sheet"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom duration-300"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white border border-white/20">
              <FrayIsotype className="w-6 h-6" withPlus={false} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-tight">
                Información & Emergencias
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Municipalidad de Fray Mamerto Esquiú
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUsefulInfoModalOpen(false)}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Quick Direct WhatsApp Tourism Desk */}
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-blue-950 truncate">
                  Centro de Atención Turística FME
                </h4>
                <p className="text-[11px] text-blue-700 font-medium truncate">
                  Asistencia en vivo para visitantes por WhatsApp
                </p>
              </div>
            </div>

            <button
              onClick={handleWhatsAppTurismo}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-xs active:scale-95"
            >
              Chatear
            </button>
          </div>

          {/* Emergencias Médicas y Seguridad - Provincia de Catamarca */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>Teléfonos de emergencia · Provincia de Catamarca</span>
            </h4>

            <div className="space-y-2">
              {USEFUL_INFO_DATA.emergencyNumbers.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {item.desc}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {item.address}
                    </p>
                  </div>

                  <a
                    href={`tel:${item.phone.replace(/\D/g, '')}`}
                    className="py-2.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs transition active:scale-95 tabular-nums whitespace-nowrap"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{item.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Puntos de Información Turística */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Puestos de informes presenciales</span>
            </h4>

            <div className="space-y-2">
              {USEFUL_INFO_DATA.touristOffices.map((office, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50/50 border border-blue-200/80 p-3.5 rounded-2xl space-y-1"
                >
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                    {office.title}
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    📍 {office.address}
                  </p>
                  <p className="text-[11px] text-blue-800 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    {office.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Colectivos y Transporte Urbano */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-teal-600" />
              <span>Colectivos & Transporte hacia Fray</span>
            </h4>

            <div className="space-y-2">
              {USEFUL_INFO_DATA.transportLines.map((bus, idx) => (
                <div
                  key={idx}
                  className="bg-teal-50/50 border border-teal-200/80 p-3.5 rounded-2xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-teal-950">
                      {bus.name}
                    </h5>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                      {bus.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {bus.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Farmacias de turno */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Farmacias en Fray</span>
            </h4>

            <div className="space-y-2">
              {USEFUL_INFO_DATA.pharmacies.map((pharmacy, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {pharmacy.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium">
                      📍 {pharmacy.address}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCall(pharmacy.phone)}
                    className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Llamar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tierra de Milagros badge */}
          <TierraDeMilagrosBadge />

          {/* Test Route Link */}
          <div className="pt-2 text-center">
            <a
              href="/gps-test"
              onClick={(e) => {
                e.preventDefault();
                setIsUsefulInfoModalOpen(false);
                window.history.pushState({}, '', '/gps-test');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-emerald-700 underline"
            >
              <span>🔬 Abrir página de prueba aislada (/gps-test)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
