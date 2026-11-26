import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  Building,
  Calendar,
  Headphones,
  Database,
  LogOut,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminPanelModal } from './AdminPanelModal';

export const AdminRouteView: React.FC = () => {
  const {
    adminUser,
    isAuthenticated,
    isLoading,
    loginError,
    loginWithDirectCredentials,
    loginWithMunicipalPasscode,
    loginWithGoogle,
    logout,
    navigateToPublic,
    authorizedEmails,
  } = useAuth();

  const [email, setEmail] = useState<string>('prensafray@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [activeLoginMode, setActiveLoginMode] = useState<'password' | 'passcode'>('password');
  const [passcode, setPasscode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (activeLoginMode === 'password') {
      await loginWithDirectCredentials(email, password);
    } else {
      await loginWithMunicipalPasscode(passcode, email);
    }

    setSubmitting(false);
  };

  // If already authenticated and authorized, show the full management dashboard
  if (isAuthenticated && adminUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        {/* Admin Bar */}
        <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                FT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm text-white">
                    Fray Turismo · Panel de Control
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/30">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Sesión activa: <span className="text-emerald-400 font-bold">{adminUser.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={navigateToPublic}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver App Pública</span>
              </button>

              <button
                onClick={logout}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>

        {/* Embedded Admin Panel Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6">
          <AdminPanelModal forceVisibleInRoute={true} />
        </main>
      </div>
    );
  }

  // Not authenticated: Show Secure Login Barrier
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top minimal header */}
      <div className="p-4 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          onClick={navigateToPublic}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Volver a la Guía Turística</span>
        </button>

        <span className="text-[11px] font-black text-slate-500 tracking-wider uppercase">
          Portal Interno Municipal
        </span>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="text-center space-y-3 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-900/40">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Acceso Restringido</span>
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                Gestión Turística Municipal
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Área exclusiva para el personal autorizado de la Dirección de Turismo de Fray Mamerto Esquiú.
              </p>
            </div>
          </div>

          {/* Error Banner if any */}
          {loginError && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-rose-300">Acceso denegado</p>
                <p className="text-[11px] text-rose-200/90 mt-0.5">{loginError}</p>
              </div>
            </div>
          )}

          {/* Primary Google Sign-In */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isLoading || submitting}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 text-sm font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                G
              </span>
              <span>Iniciar con Google Autorizado</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Cuentas habilitadas: prensafray@gmail.com y afines</span>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="bg-slate-900 px-3 text-slate-500">O clave municipal</span>
            </div>
          </div>

          {/* Secondary Passcode Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Correo electrónico institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prensafray@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Clave de seguridad municipal
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={activeLoginMode === 'password' ? password : passcode}
                  onChange={(e) => {
                    setActiveLoginMode('passcode');
                    setPasscode(e.target.value);
                  }}
                  placeholder="Ingresá tu clave..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Verificando credenciales...' : 'Ingresar con clave'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-[11px] text-slate-600">
        Municipalidad de Fray Mamerto Esquiú · San José de Piedra Blanca, Catamarca
      </div>
    </div>
  );
};
