import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SectionEditButton } from './SectionEditButton';

/**
 * Logotipo Principal "Visitá Fray"
 * Reproducción fiel del logotipo oficial:
 * - Rayos de sol / chispas verdes sobre la 'V' de Visitá
 * - Tipografía "Visitá" en verde esmeralda institucional
 * - Tipografía "Fray" en azul noche / grafito
 * - Pétalos decorativos (azul y verde) + signo "+" magenta sobre el final de Fray
 */
export const VisitaFrayLogo: React.FC<{
  className?: string;
  variant?: 'white' | 'color' | 'header';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({
  className = '',
  variant = 'header',
  size = 'md',
}) => {
  const isWhite = variant === 'white';

  return (
    <div className={`relative inline-flex flex-col select-none leading-none ${className}`}>
      <svg
        viewBox="0 0 320 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={
          size === 'sm'
            ? 'h-8 sm:h-9 w-auto'
            : size === 'md'
            ? 'h-10 sm:h-12 w-auto'
            : size === 'lg'
            ? 'h-14 sm:h-16 w-auto'
            : 'h-20 sm:h-24 w-auto'
        }
      >
        {/* Rayos / chispas verdes sobre la V de Visitá */}
        <g stroke={isWhite ? '#6EE7B7' : '#059669'} strokeWidth="5.5" strokeLinecap="round">
          <line x1="22" y1="46" x2="10" y2="46" />
          <line x1="26" y1="34" x2="14" y2="22" />
          <line x1="38" y1="28" x2="38" y2="14" />
        </g>

        {/* Texto "Visitá" en verde esmeralda */}
        <text
          x="32"
          y="78"
          fill={isWhite ? '#FFFFFF' : '#009E60'}
          fontFamily="'Poppins', system-ui, sans-serif"
          fontWeight="900"
          fontSize="56"
          letterSpacing="-1.5px"
          style={{ filter: isWhite ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))' : 'none' }}
        >
          Visitá
        </text>

        {/* Texto "Fray" en azul marino oscuro / blanco */}
        <text
          x="200"
          y="78"
          fill={isWhite ? '#E0F2FE' : '#0F172A'}
          fontFamily="'Poppins', system-ui, sans-serif"
          fontWeight="900"
          fontSize="56"
          letterSpacing="-1px"
          style={{ filter: isWhite ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))' : 'none' }}
        >
          Fray
        </text>

        {/* Acento Pétalo Azul sobre Fray */}
        <path
          d="M304 38 C302 24, 314 20, 318 22 C318 34, 308 44, 304 38 Z"
          fill={isWhite ? '#60A5FA' : '#2563EB'}
        />

        {/* Acento Pétalo Verde sobre Fray */}
        <path
          d="M312 50 C310 42, 324 40, 326 44 C324 54, 314 56, 312 50 Z"
          fill={isWhite ? '#34D399' : '#10B981'}
        />

        {/* Signo "+" Rosa / Magenta institucional */}
        <g stroke={isWhite ? '#F472B6' : '#E11D48'} strokeWidth="5" strokeLinecap="round">
          <line x1="316" y1="68" x2="316" y2="80" />
          <line x1="310" y1="74" x2="322" y2="74" />
        </g>
      </svg>
    </div>
  );
};

/** Alias retrocompatible para el logo */
export const VeraneaEnFrayLogo = VisitaFrayLogo;

/**
 * Badge "Guía de Verano 2025 - 2026"
 */
export const GuiaDeVeranoBadge: React.FC<{
  className?: string;
  variant?: 'cyan' | 'white' | 'dark';
}> = ({ className = '', variant = 'cyan' }) => {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center px-3.5 py-1.5 rounded-2xl select-none shadow-md border ${
        variant === 'cyan'
          ? 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600 text-white border-cyan-300/60'
          : variant === 'dark'
          ? 'bg-slate-900/90 text-white border-slate-700'
          : 'bg-white text-sky-800 border-sky-200'
      } ${className}`}
    >
      <div className="flex items-center gap-1 leading-none">
        <span className="font-display font-black text-xs sm:text-sm tracking-tight text-white uppercase drop-shadow-xs">
          Guía
        </span>
        <span className="text-[10px] font-bold text-cyan-200 lowercase">de</span>
        <span className="font-display font-black text-xs sm:text-sm tracking-tight text-amber-300 uppercase drop-shadow-xs">
          Verano
        </span>
      </div>
      <span className="text-[9px] font-extrabold tracking-wider text-cyan-100 mt-0.5">
        2026 — 2027
      </span>
    </div>
  );
};

/**
 * Robot Mascota Asistente de Fray (con audífonos y carita sonriente feliz)
 */
export const FrayMascotRobot: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  waving?: boolean;
}> = ({ className = '', size = 'md', waving = true }) => {
  const dimension =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'md'
      ? 'w-14 h-14'
      : size === 'lg'
      ? 'w-20 h-20'
      : 'w-28 h-28';

  return (
    <div className={`relative inline-flex items-center justify-center select-none shrink-0 ${dimension} ${className}`}>
      <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        {/* Sombra de apoyo */}
        <ellipse cx="80" cy="170" rx="35" ry="6" fill="#000000" fillOpacity="0.15" />

        {/* Piernitas / Base */}
        <rect x="58" y="130" width="18" height="30" rx="9" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="84" y="130" width="18" height="30" rx="9" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />

        {/* Torso */}
        <rect x="50" y="85" width="60" height="55" rx="20" fill="url(#bodyGradient)" stroke="#CBD5E1" strokeWidth="2" />
        {/* Luz de pecho rosa */}
        <rect x="68" y="105" width="24" height="6" rx="3" fill="#FB7185" />

        {/* Brazo Izquierdo (apoyado) */}
        <path d="M50 95 C40 105 38 125 45 135" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />

        {/* Brazo Derecho (Saludando entusiasta) */}
        {waving ? (
          <path d="M110 95 C125 85 135 65 140 45" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
        ) : (
          <path d="M110 95 C120 105 122 125 115 135" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
        )}
        {waving && (
          <circle cx="140" cy="45" r="9" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
        )}

        {/* Diadema de Auriculares */}
        <path d="M35 50 C35 20 125 20 125 50" stroke="#64748B" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Orejeras Rosa/Gris de los Auriculares */}
        <rect x="25" y="40" width="14" height="30" rx="7" fill="#F43F5E" stroke="#E11D48" strokeWidth="2" />
        <rect x="121" y="40" width="14" height="30" rx="7" fill="#F43F5E" stroke="#E11D48" strokeWidth="2" />

        {/* Cabeza Redonda / Casco Blanco */}
        <rect x="36" y="20" width="88" height="70" rx="32" fill="url(#headGradient)" stroke="#E2E8F0" strokeWidth="2" />

        {/* Pantalla Visor Facial Cyan Oscuro */}
        <rect x="46" y="32" width="68" height="46" rx="20" fill="#0369A1" stroke="#0284C7" strokeWidth="1.5" />

        {/* Ojos / Expresión Feliz Brillante (Arcos Cyan) */}
        <path d="M57 48 Q64 42 71 48" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M89 48 Q96 42 103 48" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Boca Sonriente Cyan */}
        <path d="M72 60 Q80 68 88 60" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="#38BDF8" />

        {/* Gradientes */}
        <defs>
          <linearGradient id="headGradient" x1="80" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="bodyGradient" x1="80" y1="85" x2="80" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Isotipo Oficial Fray (Doble curva: Azul Institucional + Verde Naturaleza + Acento Magenta)
 */
export const FrayIsotype: React.FC<{ className?: string; withPlus?: boolean }> = ({
  className = 'w-8 h-8',
  withPlus = true,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Curva Azul Superior */}
        <path
          d="M26 44C21 38 23 28 31 24C38 20 48 23 53 30L65 47C72 57 88 56 94 45L103 29C108 20 118 19 123 25C129 32 127 43 118 49L90 69C75 79 55 77 42 64L26 44Z"
          fill="#2563EB"
        />
        {/* Curva Verde Inferior */}
        <path
          d="M48 76C44 71 46 62 53 58C60 55 69 57 74 64L82 75C88 84 102 83 107 74L114 62C118 54 126 53 131 58C136 64 134 73 127 79L103 96C91 104 74 102 64 91L48 76Z"
          fill="#84CC16"
        />
      </svg>
      {withPlus && (
        <span className="absolute -bottom-1 -right-1 font-black text-xs sm:text-sm text-[#E11D48] leading-none select-none drop-shadow-xs">
          +
        </span>
      )}
    </div>
  );
};

/**
 * Marca Principal del Encabezado: "Visitá Fray"
 */
export const FrayMainBrand: React.FC<{
  className?: string;
  theme?: 'light' | 'dark' | 'transparent';
  subtitle?: string;
}> = ({
  className = '',
  theme = 'light',
  subtitle = 'Guía Oficial de Turismo',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Robot Mascota Saludando */}
      <div className="relative shrink-0">
        <FrayMascotRobot size="sm" className="w-9 h-9 sm:w-10 sm:h-10" />
      </div>

      <div className="flex flex-col justify-center">
        {/* Logo Textual "Visitá Fray" + Año 2026/27 */}
        <div className="flex items-center gap-1.5 leading-none">
          {/* Logo tipográfico con chispas de sol y detalles oficiales */}
          <div className="relative inline-flex items-center gap-1">
            {/* 3 Rayitos verdes sobre la V */}
            <span className="relative font-display font-black text-lg sm:text-xl tracking-tight text-[#009E60]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -top-2 -left-2.5 w-3.5 h-3.5 text-emerald-500 pointer-events-none"
              >
                <g stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="20" x2="2" y2="20" />
                  <line x1="14" y1="14" x2="4" y2="4" />
                  <line x1="20" y1="12" x2="20" y2="2" />
                </g>
              </svg>
              Visitá
            </span>

            {/* Fray + Acento floral y plus */}
            <span className="relative font-display font-black text-lg sm:text-xl tracking-tight text-slate-900">
              Fray
              {/* Petalos azul + verde y signo + */}
              <span className="inline-flex items-center align-super -mr-1 ml-0.5">
                <span className="text-[#E11D48] text-xs font-black leading-none">+</span>
              </span>
            </span>
          </div>

          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
            2026/27
          </span>
        </div>
        <p className={`text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 truncate max-w-[190px] sm:max-w-none ${isDark ? 'text-emerald-100' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};

/**
 * Emblema "Fray Tierra de Milagros" (Patrimonio, Turismo Religioso y Beato Esquiú)
 */
export const TierraDeMilagrosBadge: React.FC<{
  className?: string;
  variant?: 'badge' | 'card' | 'seal';
  compact?: boolean;
}> = ({ className = '', variant = 'badge', compact = false }) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-900/90 via-teal-900/90 to-emerald-900/90 text-white shadow-md border border-white/20 backdrop-blur-md ${className}`}>
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-300">
            <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM6 8V10H8V20H10V14H14V20H16V10H18V8H6Z" />
          </svg>
        </div>
        <div className="text-left">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">Tierra de Milagros</div>
          <div className="text-[9px] text-slate-200 font-medium">Catamarca · Argentina</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950 p-5 text-white border border-white/15 shadow-xl ${className}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-600/30 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-500 p-0.5 shrink-0 shadow-lg shadow-blue-900/50 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex flex-col items-center justify-center p-2 text-white">
            <div className="w-7 h-7 rounded-full border border-amber-300/80 flex items-center justify-center text-amber-300 mb-0.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 2.9 13.1 2 12 2ZM4 8H20L18 10H15V22H9V10H6L4 8Z" />
              </svg>
            </div>
            <span className="text-[8px] font-black tracking-widest text-emerald-300 uppercase">Esquiú</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-1">
            Patrimonio & Fe
          </span>
          <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight leading-tight">
            Fray, <span className="bg-gradient-to-r from-blue-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">Tierra de Milagros</span>
          </h3>
          <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed max-w-md">
            Cuna del Beato Fray Mamerto Esquiú. Recorré los templos históricos, museos y el circuito de fe en el corazón de Catamarca.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Footer / Institutional Branding Bar con las marcas oficiales
 */
export const InstitutionalFooterBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { siteConfig } = useData();
  const { isAuthenticated, isEditorMode, setIsLoginModalOpen } = useAuth();
  const footerData = siteConfig?.footer || {
    municipalTitle: 'Municipalidad de Fray Mamerto Esquiú',
    secretaria: 'Secretaría de Turismo, Cultura y Desarrollo Productivo',
    phone: '383 4491020',
    whatsapp: '5493834491020',
    email: 'turismo@fraymarmertoesquiu.gob.ar',
    localitiesText: 'San José de Piedra Blanca · La Falda · San Antonio · Las Pirquitas · La Carrera · Collagasta · Pomancillo',
  };

  return (
    <footer id="institutional-footer" className={`relative bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800 ${className}`}>
      {/* Editor Button */}
      {isAuthenticated && isEditorMode && (
        <div className="absolute top-4 right-4 z-20">
          <SectionEditButton sectionId="footer" sectionTitle="Footer y Contactos" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Brand 1: Visitá Fray */}
        <div className="space-y-1.5 text-center md:text-left flex flex-col items-center md:items-start">
          <VisitaFrayLogo variant="white" size="sm" />
          <p className="text-[11px] text-slate-300 font-medium">
            Guía Oficial de Turismo 2026 - 2027
          </p>
        </div>

        {/* Brand 2: Tierra de Milagros */}
        <div className="flex flex-col items-center justify-center text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
          <p className="font-display font-black text-base bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Fray Tierra de Milagros
          </p>
          <p className="text-[10px] tracking-widest text-slate-300 uppercase font-bold mt-0.5">
            Catamarca · Argentina
          </p>
        </div>

        {/* Brand 3: Fray Municipalidad + */}
        <div className="text-center md:text-right space-y-1">
          <div className="flex items-center justify-center md:justify-end gap-2">
            <FrayIsotype className="w-6 h-6" />
            <span className="font-black text-base text-white">{footerData.municipalTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {footerData.secretaria}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <p>© 2026–2027 Municipalidad de Fray Mamerto Esquiú. Todos los derechos reservados.</p>
          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-slate-600 hover:text-slate-400 transition p-1 text-[10px] flex items-center gap-0.5 opacity-60 hover:opacity-100"
              title="Acceso Administración Municipal (Alt+A)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Gestión</span>
            </button>
          )}
        </div>
        <p className="text-slate-400 font-medium">
          {footerData.localitiesText}
        </p>
      </div>
    </footer>
  );
};
