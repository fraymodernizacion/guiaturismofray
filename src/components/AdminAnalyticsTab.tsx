import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  RefreshCw,
  Download,
  Trash2,
  Smartphone,
  Monitor,
  Eye,
  Compass,
  Calendar,
  TrendingUp,
  Lock,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DailyVisitPoint {
  date: string;
  label: string;
  visits: number;
  placeViews: number;
}

interface RankedMetric {
  id: string;
  label: string;
  count: number;
}

interface AnalyticsStatsResponse {
  totalVisits: number;
  todayVisits: number;
  last7DaysVisits: number;
  last30DaysVisits: number;
  totalPlaceViews: number;
  totalSectionClicks: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
  devices: {
    mobile: number;
    desktop: number;
  };
  dailyVisits: DailyVisitPoint[];
  topSections: RankedMetric[];
  topPlaces: RankedMetric[];
  generatedAt: string;
}

interface AdminAnalyticsTabProps {
  onFeedback?: (msg: string) => void;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({ onFeedback }) => {
  const { adminUser, adminToken, setAdminToken, getAuthToken, loginWithGoogle } = useAuth();

  const [authMode, setAuthMode] = useState<'loading' | 'unclaimed' | 'claimed' | 'env'>('loading');
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState<string>('');
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [stats, setStats] = useState<AnalyticsStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  const adminEmail = adminUser?.email || 'prensafray@gmail.com';

  const loadAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth-status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAuthMode(data.mode === 'env' || data.mode === 'claimed' ? data.mode : 'unclaimed');
      } else {
        setAuthMode('claimed');
      }
    } catch {
      setAuthMode('claimed');
    }
  }, []);

  const fetchStats = useCallback(
    async (tokenToUse: string) => {
      setLoadingStats(true);
      setStatsError('');
      try {
        const res = await fetch('/api/uso/resumen', {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        });
        if (res.status === 401) {
          setAdminToken(null);
          setStats(null);
          await loadAuthStatus();
          return;
        }
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          setStatsError(errBody.error || 'No se pudieron cargar las estadísticas.');
          return;
        }
        const data: AnalyticsStatsResponse = await res.json();
        setStats(data);
      } catch {
        setStatsError('Error de conexión al consultar las estadísticas.');
      } finally {
        setLoadingStats(false);
      }
    },
    [setAdminToken, loadAuthStatus]
  );

  useEffect(() => {
    let active = true;
    const init = async () => {
      const liveToken = adminToken || (await getAuthToken());
      if (!active) return;
      if (liveToken) {
        void fetchStats(liveToken);
      } else {
        void loadAuthStatus();
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, [adminToken, getAuthToken, fetchStats, loadAuthStatus]);

  const handleUnlockOrClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanPass = passcodeInput.trim();
    if (authMode === 'unclaimed') {
      if (cleanPass.length < 6) {
        setAuthError('Elegí una clave de al menos 6 caracteres.');
        return;
      }
      if (cleanPass !== confirmPasscodeInput.trim()) {
        setAuthError('Las claves no coinciden.');
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      const endpoint = authMode === 'unclaimed' ? '/api/admin/claim' : '/api/admin/session';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          passcode: cleanPass,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.needsSetup) {
          setAuthMode('unclaimed');
        }
        setAuthError(data.error || 'No se pudo validar el acceso.');
        return;
      }
      if (typeof data.token === 'string') {
        setAdminToken(data.token);
        setPasscodeInput('');
        setConfirmPasscodeInput('');
        if (authMode === 'unclaimed') {
          onFeedback?.('¡Clave de estadísticas activada con éxito!');
        }
      }
    } catch {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleResetCounter = async () => {
    if (!adminToken) return;
    setResetting(true);
    try {
      const res = await fetch('/api/uso/reiniciar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        setConfirmReset(false);
        onFeedback?.('Contador de visitas reiniciado a cero.');
        await fetchStats(adminToken);
      } else {
        setStatsError('No se pudo reiniciar el contador.');
      }
    } catch {
      setStatsError('Error de conexión al reiniciar el contador.');
    } finally {
      setResetting(false);
    }
  };

  const handleExportCsv = () => {
    if (!stats) return;
    const csvCell = (value: string) => {
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows: string[] = [
      'Fecha,Visitas,Fichas consultadas',
      ...stats.dailyVisits.map((d) => `${d.date},${d.visits},${d.placeViews}`),
      '',
      'Resumen,Valor',
      `Visitas totales,${stats.totalVisits}`,
      `Visitas hoy,${stats.todayVisits}`,
      `Últimos 7 días,${stats.last7DaysVisits}`,
      `Últimos 30 días,${stats.last30DaysVisits}`,
      `Fichas vistas,${stats.totalPlaceViews}`,
      `Celulares,${stats.devices.mobile}`,
      `Computadoras,${stats.devices.desktop}`,
      '',
      'Sección más consultada,Consultas',
      ...stats.topSections.map((s) => `${csvCell(s.label)},${s.count}`),
      '',
      'Lugar más visto,Consultas',
      ...stats.topPlaces.map((p) => `${csvCell(p.label)},${p.count}`),
    ];

    const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fray_turismo_visitas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onFeedback?.('Informe de visitas descargado en formato Excel/CSV.');
  };

  const formatDateTimeAr = (iso: string | null): string => {
    if (!iso) return 'Sin registros todavía';
    try {
      return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Argentina/Buenos_Aires',
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 16).replace('T', ' ');
    }
  };

  // Protected server session gate (token stays only in memory)
  if (!adminToken) {
    if (authMode === 'loading') {
      return (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-xs font-bold">Verificando acceso privado a estadísticas...</p>
        </div>
      );
    }

    const isFirstSetup = authMode === 'unclaimed';

    return (
      <div className="max-w-md mx-auto py-6">
        <form
          onSubmit={handleUnlockOrClaim}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              {isFirstSetup ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-display font-black text-base text-slate-900">
                {isFirstSetup
                  ? 'Activar acceso privado a Estadísticas'
                  : 'Estadísticas Privadas de Gestión'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {isFirstSetup
                  ? 'Definí por única vez tu clave de administrador para consultar el registro de visitas.'
                  : 'Ingresá tu clave de gestión para desbloquear el reporte de visitas.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={authSubmitting}
            onClick={async () => {
              setAuthSubmitting(true);
              setAuthError('');
              const ok = await loginWithGoogle();
              setAuthSubmitting(false);
              if (ok) {
                onFeedback?.('Sesión verificada con Google.');
              }
            }}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
          >
            <span className="w-5 h-5 rounded-full bg-white text-slate-900 font-black text-[11px] flex items-center justify-center">
              G
            </span>
            <span>Desbloquear con Google ({adminEmail})</span>
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold">
              <span className="bg-white px-2 text-slate-400">O usar clave municipal</span>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cuenta administradora
              </label>
              <input
                type="email"
                value={adminEmail}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isFirstSetup ? 'Elegí tu clave (mínimo 6 caracteres)' : 'Clave de administración'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {isFirstSetup && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar clave
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={authSubmitting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
          >
            {authSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>
              {isFirstSetup ? 'Guardar clave y ver estadísticas' : 'Ver registro de visitas'}
            </span>
          </button>
        </form>
      </div>
    );
  }

  if (loadingStats && !stats) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <p className="text-xs font-bold">Cargando registro de visitas...</p>
      </div>
    );
  }

  if (statsError && !stats) {
    return (
      <div className="max-w-md mx-auto py-8 text-center space-y-3">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
          {statsError}
        </div>
        <button
          type="button"
          onClick={() => fetchStats(adminToken)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const maxDailyVisits = Math.max(1, ...stats.dailyVisits.map((d) => d.visits));
  const totalDeviceVisits = stats.devices.mobile + stats.devices.desktop;
  const mobilePct =
    totalDeviceVisits > 0 ? Math.round((stats.devices.mobile / totalDeviceVisits) * 100) : 0;
  const desktopPct = totalDeviceVisits > 0 ? 100 - mobilePct : 0;
  const maxSectionCount = Math.max(1, ...(stats.topSections.map((s) => s.count) || [1]));
  const maxPlaceCount = Math.max(1, ...(stats.topPlaces.map((p) => p.count) || [1]));

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h4 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Registro de Visitas y Uso de la App</span>
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Solo visible para administradores · Cuenta cada ingreso y consulta de forma anónima, sin pedir registro a los turistas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => fetchStats(adminToken)}
            disabled={loadingStats}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Visitas Totales
            </span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            {stats.totalVisits.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Desde: {stats.firstVisitAt ? formatDateTimeAr(stats.firstVisitAt) : 'Hoy'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-sky-600 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Visitas Hoy
            </span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            {stats.todayVisits.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Última: {formatDateTimeAr(stats.lastVisitAt)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Últimos 7 días
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            {stats.last7DaysVisits.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Últimos 30 días: {stats.last30DaysVisits.toLocaleString('es-AR')}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-teal-600 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Fichas Consultadas
            </span>
            <Compass className="w-4 h-4" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            {stats.totalPlaceViews.toLocaleString('es-AR')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Secciones exploradas: {stats.totalSectionClicks.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* 14-day Bar Chart */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="font-bold text-sm text-slate-900">
              Visitas por día (últimos 14 días)
            </h5>
            <p className="text-[11px] text-slate-500">
              Hora oficial de Argentina (Catamarca)
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Cada apertura suma +1
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 items-end h-36 pt-4">
          {stats.dailyVisits.map((day) => {
            const heightPct = day.visits > 0 ? Math.max(10, Math.round((day.visits / maxDailyVisits) * 100)) : 4;
            return (
              <div
                key={day.date}
                className="flex flex-col items-center justify-end h-full gap-1 group"
                title={`${day.label}: ${day.visits} visitas · ${day.placeViews} fichas vistas`}
              >
                <span className="text-[10px] font-bold text-slate-600">
                  {day.visits > 0 ? day.visits : ''}
                </span>
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className={`w-full max-w-[26px] rounded-t-md transition-all ${
                      day.visits > 0
                        ? 'bg-emerald-600 group-hover:bg-emerald-500'
                        : 'bg-slate-100'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-slate-500 truncate w-full text-center">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Split */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Celulares: {stats.devices.mobile} ({mobilePct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-sky-600" />
            Computadoras: {stats.devices.desktop} ({desktopPct}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-600 h-full transition-all"
            style={{ width: `${mobilePct}%` }}
          />
          <div
            className="bg-sky-500 h-full transition-all"
            style={{ width: `${desktopPct}%` }}
          />
        </div>
      </div>

      {/* Top Sections & Top Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Sections */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h5 className="font-bold text-sm text-slate-900">Secciones más consultadas</h5>
          {stats.topSections.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              A medida que los visitantes naveguen las categorías, aparecerán aquí.
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats.topSections.map((sec) => (
                <div key={sec.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">{sec.label}</span>
                    <span className="font-black text-emerald-700 shrink-0">{sec.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.max(6, Math.round((sec.count / maxSectionCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Places */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h5 className="font-bold text-sm text-slate-900">Lugares y comercios más vistos</h5>
          {stats.topPlaces.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Cuando los turistas abran una ficha, el ranking se actualizará automáticamente.
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats.topPlaces.map((pl) => (
                <div key={pl.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">{pl.label}</span>
                    <span className="font-black text-sky-700 shrink-0">{pl.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.max(6, Math.round((pl.count / maxPlaceCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Counter Control */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-800">Reiniciar registro de visitas</p>
          <p className="text-[11px] text-slate-500">
            Útil si querés empezar a contar desde cero al lanzar oficialmente la campaña.
          </p>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetCounter}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              {resetting ? 'Reiniciando...' : 'Sí, poner en cero'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Poner contador en cero</span>
          </button>
        )}
      </div>
    </div>
  );
};
