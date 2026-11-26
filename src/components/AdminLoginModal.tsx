import React, { useState } from 'react';
import {
  Mail,
  KeyRound,
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithGoogle,
    loginWithMunicipalPasscode,
    loginError,
    isLoading,
    activateEditorMode,
  } = useAuth();

  const [email, setEmail] = useState<string>('prensafray@gmail.com');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscodeForm, setShowPasscodeForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    const success = await loginWithGoogle();
    setSubmitting(false);
    if (success) {
      activateEditorMode();
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await loginWithMunicipalPasscode(passcode, email);
    setSubmitting(false);
    if (success) {
      setPasscode('');
      activateEditorMode();
    }
  };

  return (
    <div
      id="admin-login-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setIsLoginModalOpen(false)}
    >
      <div
        id="admin-login-modal-card"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 mx-auto shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-black text-xl text-white tracking-tight">
              Acceso Administración
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Municipalidad de Fray Mamerto Esquiú
            </p>
          </div>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Primary Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting || isLoading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-sm font-black transition active:scale-98 shadow-lg flex items-center justify-center gap-3 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Conectando con Google...</span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                G
              </span>
              <span>Continuar con Google Autorizado</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center mt-2.5">
          Usá tu cuenta institucional habilitada (ej. <span className="text-slate-200 font-semibold">prensafray@gmail.com</span>).
        </p>

        {/* Secondary Municipal Passcode Option */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          {!showPasscodeForm ? (
            <button
              type="button"
              onClick={() => setShowPasscodeForm(true)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ingresar con clave municipal alternativa</span>
            </button>
          ) : (
            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Autorizado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prensafray@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Clave de Seguridad Municipal
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Validar e ingresar</span>
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Atajo rápido: Presioná <kbd className="px-1.5 py-0.5 bg-slate-800 rounded-md text-amber-400 font-mono text-[10px]">Alt + A</kbd> en cualquier momento para ingresar.
          </p>
        </div>
      </div>
    </div>
  );
};
