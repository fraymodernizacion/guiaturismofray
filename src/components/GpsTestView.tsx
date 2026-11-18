import React, { useState } from 'react';
import { Navigation, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, HelpCircle, ArrowLeft } from 'lucide-react';

export const GpsTestView: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const [errorInfo, setErrorInfo] = useState<{
    code?: number;
    message?: string;
  } | null>(null);

  // Environment checks
  const isSecureContext = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHref = typeof window !== 'undefined' ? window.location.href : '';
  const isIframe = typeof window !== 'undefined' ? window.top !== window.self : false;
  const hasGeolocationApi = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const handleTestLocation = () => {
    if (!hasGeolocationApi) {
      setStatus('error');
      setErrorInfo({
        code: -1,
        message: 'navigator.geolocation no está disponible en este navegador.',
      });
      return;
    }

    setStatus('loading');
    setErrorInfo(null);
    setCoords(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[GPS TEST SUCCESS]:', position);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp || Date.now(),
        });
        setStatus('success');
      },
      (error) => {
        console.error('[GPS TEST ERROR]:', error);
        setErrorInfo({
          code: error.code,
          message: error.message || 'Error desconocido al solicitar ubicación.',
        });
        setStatus('error');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      }
    );
  };

  const getErrorCodeExplanation = (code?: number) => {
    switch (code) {
      case 1:
        return 'PERMISSION_DENIED (1): El usuario o el navegador rechazó el permiso de ubicación.';
      case 2:
        return 'POSITION_UNAVAILABLE (2): La señal GPS o red no está disponible en este momento.';
      case 3:
        return 'TIMEOUT (3): Se agotó el tiempo de espera (30s) sin obtener una lectura válida.';
      default:
        return `Código de error: ${code ?? 'N/A'}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/80">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la App</span>
          </a>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-700/80 text-emerald-400 border border-slate-600">
            Modo Diagnóstico Aislado
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Prueba de ubicación
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Prueba aislada de <code className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300 font-mono">navigator.geolocation</code> nativo del dispositivo.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <button
            id="btn-gps-test-trigger"
            onClick={handleTestLocation}
            disabled={status === 'loading'}
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-98 disabled:opacity-60 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {status === 'loading' ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Solicitando GPS al dispositivo...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 fill-current" />
                <span>📍 Usar mi ubicación</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-400 text-center">
            Al tocar el botón se ejecutará la solicitud nativa con timeout de 30s.
          </span>
        </div>

        {/* Success Output */}
        {status === 'success' && coords && (
          <div className="bg-emerald-950/70 border-2 border-emerald-500/80 rounded-2xl p-5 mb-6 animate-fadeIn text-emerald-100 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-black text-lg">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h2>Ubicación encontrada</h2>
            </div>

            <div className="space-y-2 text-sm font-medium">
              <div className="flex justify-between py-1 border-b border-emerald-900/60">
                <span className="text-slate-300">Latitud:</span>
                <span className="font-mono font-bold text-white">{coords.latitude}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/60">
                <span className="text-slate-300">Longitud:</span>
                <span className="font-mono font-bold text-white">{coords.longitude}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/60">
                <span className="text-slate-300">Precisión:</span>
                <span className="font-mono font-bold text-emerald-300">
                  ± {Math.round(coords.accuracy)} metros
                </span>
              </div>
              <div className="flex justify-between py-1 text-xs text-slate-400">
                <span>Timestamp:</span>
                <span className="font-mono">{new Date(coords.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Verification link */}
            <div className="mt-4 pt-3 border-t border-emerald-900/80">
              <a
                id="link-osm-verification"
                href={`https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=17/${coords.latitude}/${coords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <span>Abrir esta posición en OpenStreetMap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[10px] text-emerald-300/80 text-center mt-1.5">
                Comprueba si las coordenadas corresponden al lugar físico donde te encuentras.
              </p>
            </div>
          </div>
        )}

        {/* Error Output */}
        {status === 'error' && (
          <div className="bg-rose-950/70 border-2 border-rose-500/80 rounded-2xl p-5 mb-6 animate-fadeIn text-rose-100 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-rose-400 font-black text-lg">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2>Error al obtener ubicación</h2>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-rose-900/40 p-2.5 rounded-xl border border-rose-800/60">
                <p className="text-rose-200 font-bold mb-1">
                  Código: <span className="text-white">{errorInfo?.code ?? 'N/A'}</span>
                </p>
                <p className="text-rose-300 text-[11px]">
                  {getErrorCodeExplanation(errorInfo?.code)}
                </p>
              </div>

              <div className="bg-rose-900/40 p-2.5 rounded-xl border border-rose-800/60">
                <p className="text-rose-200 font-bold mb-1">Mensaje nativo del navegador:</p>
                <p className="text-rose-100 text-[11px]">{errorInfo?.message || 'Sin mensaje adicional'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Environment Diagnostics for Testing */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px] mb-1">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Datos del Entorno de Ejecución:</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] text-slate-300">
            <div className="flex justify-between bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
              <span className="text-slate-400">navigator.geolocation:</span>
              <span className={hasGeolocationApi ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {hasGeolocationApi ? 'Existe / Disponible' : 'NO DISPONIBLE'}
              </span>
            </div>

            <div className="flex justify-between bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
              <span className="text-slate-400">window.isSecureContext:</span>
              <span className={isSecureContext ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {isSecureContext ? 'true (HTTPS / Seguro)' : 'false (No seguro - GPS bloqueado)'}
              </span>
            </div>

            <div className="flex flex-col bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40 truncate">
              <span className="text-slate-400 text-[10px]">window.location.origin:</span>
              <span className="text-slate-200 font-bold truncate mt-0.5">{currentOrigin}</span>
            </div>

            <div className="flex justify-between bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
              <span className="text-slate-400">Ejecutando en iframe:</span>
              <span className={isIframe ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isIframe ? 'Sí (Vista previa AI Studio)' : 'No (Pestaña / Navegador directo)'}
              </span>
            </div>
          </div>

          {isIframe && (
            <div className="mt-2.5 p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-[11px] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Atención:</strong> Estás dentro del iframe de previsualización. Para la prueba real de iPhone/Android, copia y abre la URL directa en el navegador del teléfono.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
