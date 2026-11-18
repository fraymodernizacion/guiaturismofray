import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  X,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithDirectCredentials,
    loginWithMunicipalPasscode,
    loginError,
    isLoading,
    activateEditorMode,
  } = useAuth();

  const [email, setEmail] = useState<string>('prensafray@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'password' | 'passcode'>('password');
  const [passcode, setPasscode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let success = false;

    if (activeMode === 'password') {
      success = await loginWithDirectCredentials(email, password);
    } else {
      success = await loginWithMunicipalPasscode(passcode, email);
    }

    setSubmitting(false);
    if (success) {
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
        {/* Subtle background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
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

        {/* Mode switcher tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveMode('password')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeMode === 'password'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Contraseña</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('passcode')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeMode === 'passcode'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Clave Municipal</span>
          </button>
        </div>

        {/* Error Alert */}
        {loginError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {activeMode === 'password' ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Clave de Seguridad Municipal
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="FrayTurismo2026!"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-98 shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Validando credenciales...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Ingresar al Modo Editor</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Atajo rápido: Presioná <kbd className="px-1.5 py-0.5 bg-slate-800 rounded-md text-amber-400 font-mono text-[10px]">Alt + A</kbd> en cualquier momento para ingresar.
          </p>
        </div>
      </div>
    </div>
  );
};
