import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit3,
  Eye,
  Sliders,
  LogOut,
  Plus,
  Layers,
  MapPin,
  Calendar,
  Headphones,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const QUICK_SECTIONS = [
  { id: 'hero', label: 'Portada / Hero' },
  { id: 'tourismOffices', label: 'Oficinas de Turismo' },
  { id: 'categories', label: 'Categorías' },
  { id: 'imperdibles', label: 'Imperdibles de Fray' },
  { id: 'recorridoEsquiu', label: 'Recorrido Beato Esquiú' },
  { id: 'conoceFray', label: 'Conocé Fray' },
  { id: 'queHacer', label: 'Qué Hacer' },
  { id: 'emblemaFe', label: 'Emblema Tierra de Milagros' },
  { id: 'footer', label: 'Footer y Contactos' },
];

export const AdminTopBar: React.FC = () => {
  const { adminUser, isAuthenticated, isEditorMode, setIsEditorMode, logout, navigateToAdmin } =
    useAuth();
  const { setIsCreatePlaceModalOpen, setSectionToEdit, setIsAdminModalOpen, saveStatus } =
    useData();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSectionsMenu, setShowSectionsMenu] = useState(false);

  if (!isAuthenticated || !adminUser) return null;

  return (
    <aside
      id="admin-top-bar"
      aria-label="Barra de Administración y Modo Editor"
      className="sticky top-0 z-50 bg-slate-950 text-white border-b-2 border-amber-400 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Admin Identifier */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-display font-black text-xs sm:text-sm text-white tracking-tight">
                ADMINISTRACIÓN FRAY TURISMO
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-400/40">
                {adminUser.role === 'superadmin' ? 'SUPERADMIN' : 'EDITOR'}
              </span>
              {saveStatus.state === 'saving' && (
                <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-sky-400/30">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Guardando...</span>
                </span>
              )}
              {saveStatus.state === 'saved' && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Guardado</span>
                </span>
              )}
              {saveStatus.state === 'error' && (
                <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-400/30">
                  <AlertCircle className="w-3 h-3" />
                  <span>Error al guardar</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs font-mono">
              {adminUser.email}
            </p>
          </div>
        </div>

        {/* Center / Actions: Mode Switchers */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Panel de Gestión (Full CMS) */}
          <button
            id="btn-admin-bar-panel"
            onClick={navigateToAdmin}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 active:scale-95 shadow-2xs"
            title="Abrir Panel de Gestión CMS en pantalla completa"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Panel de Gestión</span>
            <span className="sm:hidden">Panel</span>
          </button>

          {/* Dropdown Secciones */}
          <div className="relative">
            <button
              id="btn-admin-bar-sections"
              onClick={() => {
                setShowSectionsMenu(!showSectionsMenu);
                setShowAddMenu(false);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 active:scale-95 shadow-2xs"
              title="Elegir cualquier sección de la página para editar"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secciones</span>
            </button>

            {showSectionsMenu && (
              <div
                className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowSectionsMenu(false)}
              >
                {QUICK_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setSectionToEdit(sec.id);
                      setShowSectionsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center justify-between"
                  >
                    <span>{sec.label}</span>
                    <Edit3 className="w-3 h-3 text-amber-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Modo Editor */}
          <button
            id="btn-admin-bar-toggle-editor"
            onClick={() => setIsEditorMode(!isEditorMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shadow-2xs ${
              isEditorMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Activar o desactivar botones de edición sobre la página"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modo Editor:</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-black ${
                isEditorMode ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {isEditorMode ? 'Activo ✏️' : 'Pausado'}
            </span>
          </button>

          {/* Vista Pública Preview */}
          {isEditorMode && (
            <button
              id="btn-admin-bar-preview"
              onClick={() => setIsEditorMode(false)}
              className="px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900/80 text-sky-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-sky-700/60 active:scale-95"
              title="Previsualizar el sitio exactamente como lo ve el turista"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Vista Pública</span>
            </button>
          )}

          {/* Dropdown / Botón + Agregar Contenido */}
          <div className="relative">
            <button
              id="btn-admin-bar-add"
              onClick={() => {
                setShowAddMenu(!showAddMenu);
                setShowSectionsMenu(false);
              }}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 border border-amber-300 active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
              <span>Agregar</span>
            </button>

            {showAddMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowAddMenu(false)}
              >
                <button
                  onClick={() => {
                    setIsCreatePlaceModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Nuevo Atractivo / Comercio</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdminModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Gestionar Eventos / Agenda</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdminModalOpen(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition"
                >
                  <Headphones className="w-4 h-4 text-cyan-400" />
                  <span>Gestionar Audioguías</span>
                </button>
              </div>
            )}
          </div>

          {/* Cerrar Sesión */}
          <button
            id="btn-admin-bar-logout"
            onClick={logout}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-500/30 active:scale-95"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
