import React from 'react';
import { MapPin, PhoneCall } from 'lucide-react';
import { useData } from '../context/DataContext';
import { isValidCoordinate } from '../utils/geoUtils';

const OFFICIAL_FACEBOOK_URL = 'https://www.facebook.com/FrayMamertoEsquiuMunicipalidad/';
const OFFICIAL_INSTAGRAM_URL = 'https://www.instagram.com/fray_municipalidad/';

export const BottomNav: React.FC = () => {
  const { userLocation, setIsUsefulInfoModalOpen, siteConfig } = useData();

  const configuredFacebook = siteConfig?.footer?.facebookUrl?.trim();
  const facebookUrl =
    configuredFacebook &&
    configuredFacebook !== 'https://facebook.com' &&
    configuredFacebook !== 'https://www.facebook.com'
      ? configuredFacebook
      : OFFICIAL_FACEBOOK_URL;

  const configuredInstagram = siteConfig?.footer?.instagramUrl?.trim();
  const instagramUrl =
    configuredInstagram &&
    configuredInstagram !== 'https://instagram.com' &&
    configuredInstagram !== 'https://www.instagram.com'
      ? configuredInstagram
      : OFFICIAL_INSTAGRAM_URL;

  const hasUserGps = Boolean(
    userLocation?.isRealGps && isValidCoordinate(userLocation.lat, userLocation.lng)
  );

  const googleMapsUrl = hasUserGps
    ? `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`
    : 'https://www.google.com/maps/search/?api=1&query=Fray+Mamerto+Esqui%C3%BA,+Catamarca,+Argentina';

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Accesos rápidos inferiores"
      className="fixed bottom-3 left-3 right-3 z-40 pointer-events-none"
    >
      <div className="max-w-md mx-auto pointer-events-auto bg-[#0B0F17]/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl px-2 py-2 grid grid-cols-4 items-center gap-1">
        {/* Facebook de la Municipalidad */}
        <a
          id="nav-btn-facebook"
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="w-6 h-6 text-[#3B82F6]"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-tight mt-1 whitespace-nowrap">
            Facebook
          </span>
        </a>

        {/* Instagram de la Municipalidad */}
        <a
          id="nav-btn-instagram"
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="w-6 h-6 text-[#EC4899]"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-tight mt-1 whitespace-nowrap">
            Instagram
          </span>
        </a>

        {/* Abrir Google Maps del dispositivo */}
        <a
          id="nav-btn-mapa"
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
        >
          <MapPin
            aria-hidden="true"
            className="w-6 h-6 text-[#22C55E] stroke-[2.1]"
          />
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-tight mt-1 whitespace-nowrap">
            Mapa
          </span>
        </a>

        {/* Teléfonos de emergencia de Catamarca */}
        <button
          id="nav-btn-emergencias"
          type="button"
          onClick={() => setIsUsefulInfoModalOpen(true)}
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
        >
          <PhoneCall
            aria-hidden="true"
            className="w-6 h-6 text-[#F87171] stroke-[2.1]"
          />
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-tight mt-1 whitespace-nowrap">
            Emergencias
          </span>
        </button>
      </div>
    </nav>
  );
};
