import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';

interface PlacePhotoDisplayProps {
  image?: string | null;
  alt: string;
  categoryEmoji?: string;
  locality?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  showVerifiedBadge?: boolean;
  compact?: boolean;
}

/**
 * Componente de visualización fotográfica turística:
 * - Si existe fotografía real cargada/válida, la renderiza con object-fit: cover.
 * - Si no existe imagen cargada o falla la carga, muestra un placeholder neutro y limpio.
 */
export const PlacePhotoDisplay: React.FC<PlacePhotoDisplayProps> = ({
  image,
  alt,
  locality,
  className = '',
  aspectRatio = 'video',
  showVerifiedBadge = true,
  compact = false,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  const hasValidImage = Boolean(
    image &&
      typeof image === 'string' &&
      image.trim() !== '' &&
      !hasError
  );

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-[16/10]'
      : aspectRatio === 'wide'
      ? 'aspect-[16/9]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : '';

  if (hasValidImage) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${aspectClass} ${className}`}>
        <img
          src={image!}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Sutil gradiente para contraste y legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Badge de Foto Confirmada */}
        {showVerifiedBadge && !compact && (
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 bg-slate-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Foto confirmada</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Placeholder Discreto y neutro cuando aún no se ha cargado fotografía
  if (compact) {
    return (
      <div className={`relative overflow-hidden bg-slate-800 flex flex-col items-center justify-center p-2 text-center text-slate-300 ${aspectClass} ${className}`}>
        <Camera className="w-5 h-5 text-slate-400 mb-1" />
        <span className="text-[10px] font-bold text-slate-200 leading-tight">
          Fray Turismo
        </span>
        <span className="text-[9px] text-slate-400">
          Foto pendiente
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-200 border-b border-slate-800 select-none ${aspectClass} ${className}`}>
      {/* Contenido del Placeholder Neutro */}
      <div className="relative z-10 flex flex-col items-center max-w-xs space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 shadow-inner backdrop-blur-xs">
          <Camera className="w-5 h-5" />
        </div>

        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 bg-white/10 border border-white/20 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-0.5">
            <span>Fotografía pendiente</span>
          </div>
          <p className="text-xs font-semibold text-white">
            {alt}
          </p>
          {locality && (
            <p className="text-[11px] text-slate-400">
              {locality}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

