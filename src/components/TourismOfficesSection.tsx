import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  X,
  Info,
} from 'lucide-react';
import {
  TOURISM_OFFICES,
  TOURISM_OFFICES_META,
  TourismOffice,
  OfficeScheduleEntry,
} from '../data/tourismOfficesData';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SectionEditButton } from './SectionEditButton';

const formatScheduleHours = (entry: OfficeScheduleEntry): string => {
  if (entry.tramos && entry.tramos.length > 0) {
    return entry.tramos.map((t) => `${t.desde} a ${t.hasta} hs`).join(' · ');
  }
  if (entry.desde && entry.hasta) {
    return `${entry.desde} a ${entry.hasta} hs`;
  }
  return '';
};

const getCleanPhoneHref = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return `tel:${digits}`;
};

export const TourismOfficesSection: React.FC = () => {
  const { siteConfig } = useData();
  const { isAuthenticated, isEditorMode } = useAuth();
  const [selectedOffice, setSelectedOffice] = useState<TourismOffice | null>(null);

  const sectionTitle = siteConfig?.tourismOffices?.title || TOURISM_OFFICES_META.categoria;
  const sharedPhone =
    siteConfig?.tourismOffices?.sharedPhone || TOURISM_OFFICES_META.telefono_compartido;
  const officesList =
    Array.isArray(siteConfig?.tourismOffices?.offices) &&
    siteConfig.tourismOffices.offices.length > 0
      ? siteConfig.tourismOffices.offices
      : TOURISM_OFFICES;

  useEffect(() => {
    if (!selectedOffice) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOffice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOffice]);

  return (
    <section
      id="oficinas-turismo-section"
      aria-labelledby="oficinas-turismo-heading"
      className="space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
        <h2
          id="oficinas-turismo-heading"
          className="font-display font-bold text-sm sm:text-base text-slate-900 tracking-tight"
        >
          {sectionTitle}
        </h2>
        <div className="flex items-center gap-2">
          {isAuthenticated && isEditorMode && (
            <SectionEditButton sectionId="tourismOffices" sectionTitle="Oficinas de Turismo" />
          )}
          <span className="text-xs text-slate-500 font-medium tabular-nums whitespace-nowrap">
            Tel. {sharedPhone}
          </span>
        </div>
      </div>

      {/* Three compact office buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {officesList.map((office) => (
          <button
            key={office.id}
            id={`btn-oficina-${office.id}`}
            type="button"
            onClick={() => setSelectedOffice(office)}
            className="w-full min-h-[56px] px-3.5 py-2.5 bg-white hover:bg-emerald-50/60 active:scale-[0.99] rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs transition flex items-center justify-between gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="block font-display font-bold text-sm text-slate-900 group-hover:text-emerald-900 leading-tight truncate whitespace-nowrap">
                  {office.nombre_boton}
                </span>
                <span className="block text-xs text-slate-500 font-medium leading-tight truncate mt-0.5">
                  {office.referencia_corta}
                </span>
              </div>
            </div>

            <ChevronRight
              className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0 transition-colors"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {/* Office Detail Modal / Bottom Sheet */}
      {selectedOffice && (
        <div
          id="tourism-office-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tourism-office-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedOffice(null)}
        >
          <div
            id="tourism-office-modal-sheet"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-y-auto shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200"
          >
            {/* Mobile drag handle visual cue */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-slate-200" aria-hidden="true" />
            </div>

            {/* Header */}
            <div className="px-5 pt-4 sm:pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-700">
                  {sectionTitle}
                </p>
                <h3
                  id="tourism-office-modal-title"
                  className="font-display font-bold text-lg sm:text-xl text-slate-900 leading-snug mt-0.5 text-balance"
                >
                  {selectedOffice.nombre}
                </h3>
              </div>

              <button
                type="button"
                id="btn-close-office-modal"
                onClick={() => setSelectedOffice(null)}
                aria-label="Cerrar ficha de oficina de turismo"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-5">
              {/* Ubicación */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Ubicación</p>
                  <p className="text-sm font-medium text-slate-900 leading-relaxed mt-0.5">
                    {selectedOffice.ubicacion}
                  </p>
                </div>
              </div>

              {/* Horarios */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">Horarios de atención</p>
                  <ul className="mt-1.5 space-y-2">
                    {selectedOffice.horarios.map((entry) => (
                      <li
                        key={entry.dias}
                        className="text-sm text-slate-900 flex flex-col"
                      >
                        <span className="font-semibold text-slate-800">{entry.dias}</span>
                        <span className="text-slate-600 tabular-nums">
                          {formatScheduleHours(entry)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Teléfono de atención</p>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
                    {selectedOffice.telefono}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={getCleanPhoneHref(selectedOffice.telefono)}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  >
                    <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Llamar</span>
                  </a>

                  <a
                    href={selectedOffice.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {selectedOffice.google_maps_url ? (
                  <a
                    href={selectedOffice.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span>Cómo llegar en Google Maps</span>
                  </a>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Enlace de Google Maps pendiente de confirmación.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
