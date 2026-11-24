import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useData, isValidImagePath, normalizeLegacyImagePath } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SectionEditButton } from './SectionEditButton';
import { WELCOME_CAROUSEL_CONFIG } from '../data/tourismOfficesData';
import { Place } from '../types';

interface ResolvedSlide {
  id: string;
  name: string;
  image: string;
  place?: Place;
}

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const WelcomeHeroCarousel: React.FC = () => {
  const { places, siteConfig, setSelectedPlace } = useData();
  const { isAuthenticated, isEditorMode } = useAuth();

  const heroData = siteConfig?.hero || {
    title: 'FRAY TURISMO',
    subtitle: 'Un lugar para descubrir, disfrutar y volver a visitar.',
    tagline: 'Naturaleza · Historia · Paisaje',
    locationBadge: 'Catamarca · Argentina',
    seasonBadge: '',
    bgImage: '/images/dique-las-pirquitas.webp',
    searchPlaceholder: '¿Qué lugar estás buscando?',
  };

  const fallbackImage =
    heroData.bgImage && isValidImagePath(heroData.bgImage)
      ? normalizeLegacyImagePath(heroData.bgImage)
      : '/images/dique-las-pirquitas.webp';

  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
    }
    return !WELCOME_CAROUSEL_CONFIG.reproduccion_automatica;
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Touch swipe tracking for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  // Subscribe to OS prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsPaused(true);
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Resolve only slides that have a real, valid photo available in the project or place catalog
  const slides: ResolvedSlide[] = useMemo(() => {
    const resolved: ResolvedSlide[] = [];

    for (const item of WELCOME_CAROUSEL_CONFIG.lugares) {
      let matchedPlace: Place | undefined;

      if (item.placeId) {
        matchedPlace = places.find((p) => p.id === item.placeId);
      }
      if (!matchedPlace) {
        matchedPlace = places.find((p) => {
          const normName = normalizeText(p.name);
          return item.matchTerms.some((term) => normName.includes(normalizeText(term)));
        });
      }

      const candidateImages = [
        item.imagen,
        matchedPlace?.image,
        ...(Array.isArray(matchedPlace?.gallery) ? matchedPlace.gallery : []),
      ];

      let validImg = '';
      for (const candidate of candidateImages) {
        if (candidate && isValidImagePath(candidate)) {
          const normalized = normalizeLegacyImagePath(candidate);
          if (!failedImages.has(normalized)) {
            validImg = normalized;
            break;
          }
        }
      }

      if (validImg) {
        resolved.push({
          id: matchedPlace?.id || normalizeText(item.nombre).replace(/\s+/g, '-'),
          name: item.nombre,
          image: validImg,
          place: matchedPlace,
        });
      }
    }

    return resolved;
  }, [places, failedImages]);

  // Keep activeIndex in bounds when slides array changes
  useEffect(() => {
    if (slides.length > 0 && activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  const hasMultipleSlides = slides.length > 1;
  const currentSlide = slides.length > 0 ? slides[activeIndex % slides.length] : null;

  const goToNext = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) =>
      WELCOME_CAROUSEL_CONFIG.bucle
        ? (prev + 1) % slides.length
        : Math.min(prev + 1, slides.length - 1)
    );
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) =>
      WELCOME_CAROUSEL_CONFIG.bucle
        ? (prev - 1 + slides.length) % slides.length
        : Math.max(prev - 1, 0)
    );
  }, [slides.length]);

  // Autoplay loop
  useEffect(() => {
    if (!hasMultipleSlides || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(goToNext, WELCOME_CAROUSEL_CONFIG.intervalo_ms);
    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, isPaused, prefersReducedMotion, goToNext]);

  const handleImageError = (imagePath: string) => {
    setFailedImages((prev) => {
      if (prev.has(imagePath)) return prev;
      const next = new Set(prev);
      next.add(imagePath);
      return next;
    });
  };

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!WELCOME_CAROUSEL_CONFIG.permitir_deslizar_en_celular || !hasMultipleSlides) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || !hasMultipleSlides) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    // Track horizontal swipe only when clearly horizontal
    if (Math.abs(dx) > Math.abs(dy)) {
      touchDeltaXRef.current = dx;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !hasMultipleSlides) return;
    const dx = touchDeltaXRef.current;
    touchStartRef.current = null;
    touchDeltaXRef.current = 0;

    if (Math.abs(dx) >= 45) {
      if (dx < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const resolvedSubtitle =
    !heroData.subtitle ||
    heroData.subtitle ===
      'Valles serranos, agua esmeralda, cuna del Beato y tradiciones vivas en Catamarca.'
      ? 'Un lugar para descubrir, disfrutar y volver a visitar.'
      : heroData.subtitle;

  return (
    <div
      id="hero-principal"
      role="region"
      aria-roledescription={hasMultipleSlides ? 'carousel' : undefined}
      aria-label={WELCOME_CAROUSEL_CONFIG.titulo}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-200/80 bg-emerald-950 min-h-[370px] sm:min-h-[410px] flex flex-col justify-between p-5 sm:p-7 text-white select-none"
    >
      {/* Background image layer: Carousel slides with smooth crossfade, or fallback welcome image */}
      {slides.length > 0 ? (
        <div className="absolute inset-0">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex % slides.length;
            return (
              <img
                key={slide.id}
                src={slide.image}
                alt={`${slide.name} — Fray Mamerto Esquiú, Catamarca`}
                referrerPolicy="no-referrer"
                onError={() => handleImageError(slide.image)}
                aria-hidden={!isActive}
                className={`absolute inset-0 w-full h-full object-cover brightness-[0.74] ${
                  prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-700 ease-out'
                } ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              />
            );
          })}
        </div>
      ) : (
        <img
          src={fallbackImage}
          alt="Fray Turismo - Dique Las Pirquitas, Catamarca"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.72]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/images/dique-las-pirquitas.webp')) {
              target.src = '/images/dique-las-pirquitas.webp';
            }
          }}
        />
      )}

      {/* Measured contrast scrim for high legibility over photography */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-teal-950/45 to-black/30 pointer-events-none" />

      {/* Top bar in Hero */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="bg-emerald-900/75 backdrop-blur-md text-emerald-50 text-xs font-semibold px-3 py-1 rounded-full border border-white/15">
          {heroData.locationBadge || 'Catamarca · Argentina'}
        </span>

        <div className="flex items-center gap-2">
          {isAuthenticated && isEditorMode && (
            <SectionEditButton sectionId="hero" sectionTitle="Portada / Hero" />
          )}
        </div>
      </div>

      {/* Bottom Hero Content: Preserved welcome text + recommended place & carousel controls */}
      <div className="relative z-10 space-y-4 mt-auto pt-6">
        <div>
          {heroData.tagline && (
            <div className="inline-flex items-center gap-1.5 text-emerald-200 text-xs font-semibold tracking-wide mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
              <span>{heroData.tagline}</span>
            </div>
          )}
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none drop-shadow-sm text-balance">
            {heroData.title || 'FRAY TURISMO'}
          </h1>
          <p className="text-emerald-50/95 text-sm sm:text-base font-medium mt-1.5 drop-shadow-xs max-w-lg leading-snug">
            {resolvedSubtitle}
          </p>
        </div>

        {/* Recommended Place Name + Carousel Controls */}
        {currentSlide && WELCOME_CAROUSEL_CONFIG.mostrar_nombre_del_lugar && (
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-emerald-200/90 leading-tight">
                {WELCOME_CAROUSEL_CONFIG.titulo}
                {hasMultipleSlides && (
                  <span className="ml-2 text-emerald-100/80 tabular-nums">
                    {(activeIndex % slides.length) + 1} / {slides.length}
                  </span>
                )}
              </p>

              {currentSlide.place ? (
                <button
                  type="button"
                  onClick={() => setSelectedPlace(currentSlide.place!)}
                  className="mt-0.5 inline-flex items-center gap-1.5 text-left text-sm sm:text-base font-bold text-white hover:text-emerald-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-md max-w-full"
                  title={`Ver ficha de ${currentSlide.name}`}
                >
                  <MapPin className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                  <span className="truncate">{currentSlide.name}</span>
                </button>
              ) : (
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-white max-w-full">
                  <MapPin className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                  <span className="truncate">{currentSlide.name}</span>
                </p>
              )}
            </div>

            {/* Carousel Controls: Anterior / Pausar o Reanudar / Siguiente */}
            {hasMultipleSlides && (
              <div
                className="flex items-center gap-1.5 shrink-0"
                role="group"
                aria-label="Controles del carrusel de lugares recomendados"
              >
                <button
                  type="button"
                  id="btn-carousel-prev"
                  onClick={goToPrev}
                  aria-label="Lugar recomendado anterior"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-black/45 hover:bg-black/65 text-white border border-white/20 flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  id="btn-carousel-toggle"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? 'Reanudar reproducción automática' : 'Pausar reproducción automática'}
                  aria-pressed={isPaused}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-black/45 hover:bg-black/65 text-white border border-white/20 flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  id="btn-carousel-next"
                  onClick={goToNext}
                  aria-label="Siguiente lugar recomendado"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-black/45 hover:bg-black/65 text-white border border-white/20 flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Subtle interactive slide selector bars when multiple slides exist */}
        {hasMultipleSlides && (
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Seleccionar diapositiva">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex % slides.length;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Ver ${slide.name}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                    isActive
                      ? 'flex-1 max-w-[48px] bg-emerald-300'
                      : 'w-6 bg-white/35 hover:bg-white/60'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
