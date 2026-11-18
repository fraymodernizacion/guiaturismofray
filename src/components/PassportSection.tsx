import React, { useState } from 'react';
import {
  Stamp,
  Award,
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  Gift,
  MapPin,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PassportStamp } from '../types';
import { FrayIsotype } from './BrandLogos';

export const PassportSection: React.FC = () => {
  const {
    passportStamps,
    badges,
    unlockPassportStamp,
    places,
    setSelectedPlace,
  } = useData();

  const [activeCheckInStamp, setActiveCheckInStamp] = useState<PassportStamp | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);

  const unlockedCount = passportStamps.filter((s) => s.unlocked).length;
  const progressPercent = Math.round((unlockedCount / passportStamps.length) * 100);

  const handleSimulateCheckIn = (stamp: PassportStamp) => {
    unlockPassportStamp(stamp.id);
    setActiveCheckInStamp(null);
  };

  const handleInspectPlace = (placeId: string) => {
    const found = places.find((p) => p.id === placeId);
    if (found) {
      setSelectedPlace(found);
    }
  };

  return (
    <section id="passport-section" className="py-4 space-y-5">
      {/* Passport Hero Cover with Official Municipal Look */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-blue-400/30">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FrayIsotype className="w-7 h-7" withPlus={false} />
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                Pasaporte Digital Oficial
              </span>
            </div>
            <span className="bg-white/10 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/15">
              Nº FME-2026
            </span>
          </div>

          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              Pasaporte Fray Turismo
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-normal mt-1 leading-relaxed">
              Visitá los atractivos turísticos, registrá tu llegada y desbloqueá sellos digitales e insignias exclusivas de Fray.
            </p>
          </div>

          {/* Progress Bar & Counter */}
          <div className="bg-black/30 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-blue-100">Progreso del viaje</span>
              <span className="text-white">
                {unlockedCount} de {passportStamps.length} sellos ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10 pointer-events-none text-9xl">
          🏛️
        </div>
      </div>

      {/* Reward Voucher Alert if unlocked 2+ */}
      {unlockedCount >= 2 && (
        <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Gift className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
                ¡Tenés un beneficio municipal desbloqueado!
              </h4>
              <p className="text-[11px] text-blue-100 mt-0.5 font-normal">
                Retirá un souvenir artesanal o descuento en el Centro de Información Turística.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVoucherModal(true)}
            className="py-2 px-3.5 bg-white text-slate-900 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs shrink-0 transition active:scale-95"
          >
            Ver cupón
          </button>
        </div>
      )}

      {/* Badges / Insignias Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Insignias turísticas ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                badge.unlocked
                  ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-400/20'
                  : 'bg-slate-50/80 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  badge.unlocked ? 'bg-blue-100 shadow-xs' : 'bg-slate-200'
                }`}
              >
                {badge.unlocked ? badge.icon : '🔒'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {badge.name}
                  </h4>
                  {badge.unlocked && (
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stamps Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sellos coleccionables en Fray
          </h3>
          <span className="text-xs text-slate-500 font-bold">
            Tocá un sello para registrar visita
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {passportStamps.map((stamp) => {
            const place = places.find((p) => p.id === stamp.placeId);

            return (
              <div
                key={stamp.id}
                id={`stamp-card-${stamp.id}`}
                className={`rounded-3xl border p-4 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  stamp.unlocked
                    ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-500/10'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          stamp.unlocked
                            ? 'bg-blue-100 border-2 border-blue-300 text-blue-900 shadow-xs'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {stamp.icon}
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {stamp.locality}
                        </span>
                        <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 leading-tight">
                          {stamp.title}
                        </h4>
                      </div>
                    </div>

                    {/* Stamp Mark or Lock */}
                    {stamp.unlocked ? (
                      <div className="animate-stamp shrink-0 border-2 border-blue-600 text-blue-700 font-black px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider bg-blue-50 shadow-xs">
                        SELLADO ✓
                      </div>
                    ) : (
                      <div className="shrink-0 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Pendiente</span>
                      </div>
                    )}
                  </div>

                  {/* Trivia or description */}
                  <p className="text-xs text-slate-600 mt-2.5 bg-slate-100/70 p-2.5 rounded-2xl border border-slate-200/50 leading-relaxed font-normal">
                    {stamp.trivia}
                  </p>
                </div>

                {/* Card Action footer */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  {place && (
                    <button
                      onClick={() => handleInspectPlace(place.id)}
                      className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>Ver atractivo</span>
                    </button>
                  )}

                  {stamp.unlocked ? (
                    <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registrado el {stamp.unlockedAt}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveCheckInStamp(stamp)}
                      className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Escanear / Registrar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Check-in Simulator Modal */}
      {activeCheckInStamp && (
        <div
          id="qr-checkin-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveCheckInStamp(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Punto Turístico
              </span>
              <h3 className="font-display font-bold text-xl text-slate-900 mt-0.5">
                {activeCheckInStamp.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                ¿Estás en {activeCheckInStamp.locality}? Confirmá tu visita para desbloquear este sello en tu Pasaporte.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium">
              🏛️ Punto de validación oficial Municipalidad de FME
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSimulateCheckIn(activeCheckInStamp)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Stamp className="w-4 h-4" />
                <span>¡Sellar mi visita ahora!</span>
              </button>

              <button
                onClick={() => setActiveCheckInStamp(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div
          id="voucher-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowVoucherModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center text-3xl">
              🎁
            </div>

            <div>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                Voucher Turístico Oficial
              </span>
              <h3 className="font-display font-bold text-xl text-slate-900 mt-1">
                Souvenir / Beneficio Fray Turismo
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Presentá esta pantalla en el Centro de Información Turística de Plaza San José para canjear tu presente.
              </p>
            </div>

            {/* Code */}
            <div className="bg-slate-900 text-amber-300 font-mono text-lg font-bold py-3 rounded-2xl tracking-widest border-2 border-dashed border-amber-400">
              FRAY-TURISMO-{Math.floor(1000 + Math.random() * 9000)}
            </div>

            <button
              onClick={() => setShowVoucherModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
