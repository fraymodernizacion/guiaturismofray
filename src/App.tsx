import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeExploreView } from './components/HomeExploreView';
import { ExplorarView } from './components/ExplorarView';
import { InteractiveMap } from './components/InteractiveMap';
import { AgendaSection } from './components/AgendaSection';
import { SavedFavoritesView } from './components/SavedFavoritesView';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { UsefulInfoModal } from './components/UsefulInfoModal';
import { QrShareModal } from './components/QrShareModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminRouteView } from './components/AdminRouteView';
import { AudioPlayerFloating } from './components/AudioPlayerFloating';
import { LocationWelcomeModal } from './components/LocationWelcomeModal';
import { GpsTestView } from './components/GpsTestView';

const checkIsGpsTestRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;
  return (
    path === '/gps-test' ||
    path.startsWith('/gps-test/') ||
    hash === '#/gps-test' ||
    hash === '#gps-test' ||
    search.includes('route=gps-test') ||
    search.includes('view=gps-test')
  );
};

const MainAppRouter: React.FC = () => {
  const { isCurrentRouteAdmin } = useAuth();
  const {
    activeTab,
    isLocationPromptModalOpen,
    allowLocationPermission,
    denyLocationPermission,
    isLocating,
  } = useData();

  // If visiting /admin route, show the private protected Admin Area
  if (isCurrentRouteAdmin) {
    return <AdminRouteView />;
  }

  // Public Tourist PWA
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Fixed App Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 pt-3 pb-24">
        {activeTab === 'inicio' && <HomeExploreView />}
        {activeTab === 'explorar' && <ExplorarView />}
        {(activeTab === 'mapa' || activeTab === 'cerca') && <InteractiveMap />}
        {activeTab === 'agenda' && <AgendaSection />}
        {activeTab === 'guardados' && <SavedFavoritesView />}
      </main>

      {/* Floating Audio Player when listening */}
      <AudioPlayerFloating />

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav />

      {/* Public Modals & Dialogs */}
      <LocationWelcomeModal
        isOpen={isLocationPromptModalOpen}
        onAllow={allowLocationPermission}
        onDeny={denyLocationPermission}
        isLocating={isLocating}
      />
      <PlaceDetailModal />
      <UsefulInfoModal />
      <QrShareModal />
      <AdminPanelModal />
    </div>
  );
};

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  declare props: { children: React.ReactNode };
  state: { hasError: boolean } = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[APP RENDER ERROR]:', error);
  }

  handleRecover = () => {
    try {
      localStorage.removeItem('fray_turismo_site_config_v1');
      localStorage.removeItem('fray_turismo_places_v2');
      localStorage.removeItem('fray_turismo_events_v2');
      localStorage.removeItem('fray_turismo_audioguides_v2');
      localStorage.removeItem('fray_turismo_favorites_v2');
      localStorage.removeItem('fray_turismo_location_v2');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4">
            <h2 className="font-display font-black text-xl text-slate-900">
              Visitá Fray
            </h2>
            <p className="text-sm text-slate-600">
              Ocurrió un problema al cargar los datos guardados en el navegador.
            </p>
            <button
              onClick={this.handleRecover}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md transition"
            >
              Restablecer y recargar app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [isGpsTest, setIsGpsTest] = useState<boolean>(checkIsGpsTestRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsGpsTest(checkIsGpsTestRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Isolated GPS Test route (completely decoupled from Leaflet & DataContext)
  if (isGpsTest) {
    return <GpsTestView />;
  }

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <MainAppRouter />
        </DataProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
