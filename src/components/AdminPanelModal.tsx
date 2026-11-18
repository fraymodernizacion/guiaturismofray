import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  Headphones,
  Database,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Place, TouristEvent, Audioguide, CategoryId, PlaceTag } from '../types';
import { CATEGORIES } from '../data/initialData';
import { AdminPhotoUploader } from './AdminPhotoUploader';

const ALL_AVAILABLE_TAGS: PlaceTag[] = [
  'Abierto ahora',
  'Pet friendly',
  'Accesible',
  'Con niños',
  'Al aire libre',
  'Estacionamiento',
  'Opciones vegetarianas',
  'Económico',
  'Wi-Fi',
  'Acepta Mercado Pago',
  'Piscina',
  'Vista a las sierras',
];

interface AdminPanelModalProps {
  forceVisibleInRoute?: boolean;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ forceVisibleInRoute = false }) => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    places,
    addPlace,
    updatePlace,
    deletePlace,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    audioguides,
    addAudioguide,
    updateAudioguide,
    deleteAudioguide,
    resetAllDataToDefault,
  } = useData();

  const { adminUser, isAuthenticated, navigateToPublic } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<'places' | 'events' | 'audioguides' | 'data'>('places');
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminValidationFilter, setAdminValidationFilter] = useState<'all' | 'pendiente_validacion' | 'verificado'>('all');

  // Editing state for Place
  const [editingPlace, setEditingPlace] = useState<Partial<Place> | null>(null);
  const [isCreatingPlace, setIsCreatingPlace] = useState<boolean>(false);

  // Editing state for Event
  const [editingEvent, setEditingEvent] = useState<Partial<TouristEvent> | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  // Editing state for Audioguide
  const [editingGuide, setEditingGuide] = useState<Partial<Audioguide> | null>(null);
  const [isCreatingGuide, setIsCreatingGuide] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!forceVisibleInRoute && !isAdminModalOpen) return null;

  const showFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Save Place
  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace?.name || !editingPlace?.category) return;

    const mainImg = editingPlace.image || '';
    const galleryImgs = Array.isArray(editingPlace.gallery) && editingPlace.gallery.length > 0
      ? (mainImg && !editingPlace.gallery.includes(mainImg) ? [mainImg, ...editingPlace.gallery] : editingPlace.gallery)
      : (mainImg ? [mainImg] : []);

    if (isCreatingPlace) {
      addPlace({
        name: editingPlace.name,
        category: editingPlace.category as CategoryId,
        shortDescription: editingPlace.shortDescription || '',
        description: editingPlace.description || '',
        address: editingPlace.address || 'Piedra Blanca',
        locality: editingPlace.locality || 'San José de Piedra Blanca',
        lat: editingPlace.lat || -28.3846,
        lng: editingPlace.lng || -65.7335,
        image: mainImg,
        gallery: galleryImgs,
        openingHours: editingPlace.openingHours || 'Lunes a Domingo 09:00 a 20:00 hs',
        phone: editingPlace.phone || '383 4491020',
        whatsapp: editingPlace.whatsapp || '5493834491020',
        instagram: editingPlace.instagram || '',
        tags: editingPlace.tags || ['Abierto ahora', 'Con niños'],
        services: editingPlace.services || ['Atención turística'],
        priceLevel: editingPlace.priceLevel || '$',
        validationStatus: editingPlace.validationStatus || 'pendiente_validacion',
        validationNote: editingPlace.validationNote || 'Pendiente de validación 2026/2027',
        sourceGuide: editingPlace.sourceGuide || 'Guía Turística FME',
      });
      showFeedback('¡Comercio / Atractivo y fotos guardadas permanentemente!');
    } else if (editingPlace.id) {
      const placeToUpdate: Place = {
        ...(editingPlace as Place),
        image: mainImg,
        gallery: galleryImgs,
      };
      updatePlace(placeToUpdate);
      showFeedback('¡Fotografías y datos guardados permanentemente!');
    }

    setEditingPlace(null);
    setIsCreatingPlace(false);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.date) return;

    if (isCreatingEvent) {
      addEvent({
        title: editingEvent.title,
        date: editingEvent.date,
        dateBadge: editingEvent.dateBadge || 'HOY',
        time: editingEvent.time || '20:00 hs',
        category: (editingEvent.category as any) || 'peña',
        locationName: editingEvent.locationName || 'Plaza San José',
        address: editingEvent.address || 'San José de Piedra Blanca',
        lat: editingEvent.lat || -28.3846,
        lng: editingEvent.lng || -65.7335,
        description: editingEvent.description || '',
        image: editingEvent.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        isFree: editingEvent.isFree ?? true,
        priceText: editingEvent.priceText || 'Entrada Libre',
        organizer: editingEvent.organizer || 'Turismo FME',
      });
      showFeedback('¡Evento agregado a la Agenda!');
    } else if (editingEvent.id) {
      updateEvent(editingEvent as TouristEvent);
      showFeedback('¡Evento modificado exitosamente!');
    }

    setEditingEvent(null);
    setIsCreatingEvent(false);
  };

  // Save Audioguide
  const handleSaveGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide?.title || !editingGuide?.narrativeText) return;

    if (isCreatingGuide) {
      addAudioguide({
        placeId: editingGuide.placeId || 'casa-natal-esquiu',
        title: editingGuide.title,
        subtitle: editingGuide.subtitle || '',
        duration: editingGuide.duration || '2:30 min',
        audioSeconds: editingGuide.audioSeconds || 150,
        coverImage: editingGuide.coverImage || '',
        shortSummary: editingGuide.shortSummary || '',
        narrativeText: editingGuide.narrativeText,
        historicalFacts: editingGuide.historicalFacts || [],
        nextPlaceId: editingGuide.nextPlaceId,
        nextPlaceReason: editingGuide.nextPlaceReason,
      });
      showFeedback('¡Audioguía agregada exitosamente!');
    } else if (editingGuide.id) {
      updateAudioguide(editingGuide as Audioguide);
      showFeedback('¡Audioguía actualizada exitosamente!');
    }

    setEditingGuide(null);
    setIsCreatingGuide(false);
  };

  // Export JSON backup
  const handleExportData = () => {
    const backup = {
      places,
      events,
      audioguides,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fray_turismo_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showFeedback('¡Copia de seguridad descargada!');
  };

  const handleClose = () => {
    if (forceVisibleInRoute) {
      navigateToPublic();
    } else {
      setIsAdminModalOpen(false);
    }
  };

  const containerContent = (
    <div
      id="admin-panel-container"
      className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200"
    >
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                Panel de Gestión Turística
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Fray Mamerto Esquiú
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Modificá comercios, horarios, fotos, agenda y audioguías en tiempo real sin tocar código.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-admin-return-to-site"
            onClick={handleClose}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/15 active:scale-95"
            title="Volver a navegar la página"
          >
            <span>← Volver al sitio</span>
          </button>
          <button
            id="btn-close-admin-panel"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title={forceVisibleInRoute ? 'Volver a la App Pública' : 'Cerrar panel'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

        {/* Feedback Alert banner */}
        {successMessage && (
          <div className="bg-emerald-600 text-white text-xs font-black px-4 py-2 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 overflow-x-auto no-scrollbar px-3">
          {[
            { id: 'places', label: `Comercios y Atractivos (${places.length})`, icon: Building },
            { id: 'events', label: `Agenda de Eventos (${events.length})`, icon: Calendar },
            { id: 'audioguides', label: `Audioguías (${audioguides.length})`, icon: Headphones },
            { id: 'data', label: 'Copias de Seguridad / Restaurar', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveAdminTab(tab.id as any);
                  setEditingPlace(null);
                  setEditingEvent(null);
                  setEditingGuide(null);
                }}
                className={`py-3 px-4 text-xs font-black flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content by Tab */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/70">
          {/* TAB 1: PLACES & SHOPS */}
          {activeAdminTab === 'places' && (
            <div className="space-y-4">
              {editingPlace ? (
                /* Place Form */
                <form
                  onSubmit={handleSavePlace}
                  className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-black text-base text-slate-900">
                      {isCreatingPlace ? '➕ Agregar nuevo comercio o atractivo' : `✏️ Editar: ${editingPlace.name}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingPlace(null)}
                      className="text-xs font-black text-slate-500 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Nombre del lugar / comercio *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPlace.name || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Categoría *
                      </label>
                      <select
                        value={editingPlace.category || 'comer'}
                        onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value as CategoryId })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.emoji} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Localidad (Piedra Blanca, Las Pirquitas, San Antonio, etc.)
                      </label>
                      <input
                        type="text"
                        value={editingPlace.locality || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, locality: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Dirección exacta
                      </label>
                      <input
                        type="text"
                        value={editingPlace.address || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, address: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Horarios de atención
                      </label>
                      <input
                        type="text"
                        value={editingPlace.openingHours || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, openingHours: e.target.value })}
                        placeholder="Ej. Mar a Dom: 09:00 a 13:00 y 17:00 a 21:00 hs"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        WhatsApp (con código de país, ej. 5493834123456)
                      </label>
                      <input
                        type="text"
                        value={editingPlace.whatsapp || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, whatsapp: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Instagram (usuario sin @)
                      </label>
                      <input
                        type="text"
                        value={editingPlace.instagram || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, instagram: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Persistent Photo Uploader Component */}
                    <div className="sm:col-span-2">
                      <AdminPhotoUploader
                        mainImage={editingPlace.image || ''}
                        gallery={editingPlace.gallery || []}
                        onMainImageChange={(url) => setEditingPlace({ ...editingPlace, image: url })}
                        onGalleryChange={(gallery) => setEditingPlace({ ...editingPlace, gallery })}
                        placeName={editingPlace.name || 'atractivo'}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Descripción completa
                      </label>
                      <textarea
                        rows={3}
                        value={editingPlace.description || ''}
                        onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Validation & Source Data Fields */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Estado de Validación
                      </label>
                      <select
                        value={editingPlace.validationStatus || 'pendiente_validacion'}
                        onChange={(e) =>
                          setEditingPlace({
                            ...editingPlace,
                            validationStatus: e.target.value as any,
                          })
                        }
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="pendiente_validacion">⏳ Pendiente de validación 2026/2027</option>
                        <option value="verificado">✅ Verificado oficialmente</option>
                        <option value="dato_pendiente_actualizacion">⚠️ Requiere actualización</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Fuente de Información
                      </label>
                      <input
                        type="text"
                        value={editingPlace.sourceGuide || ''}
                        onChange={(e) =>
                          setEditingPlace({ ...editingPlace, sourceGuide: e.target.value })
                        }
                        placeholder="Ej. Guía Turística PDF / Relevamiento Municipal"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Nota de Validación interna / pública
                      </label>
                      <input
                        type="text"
                        value={editingPlace.validationNote || ''}
                        onChange={(e) =>
                          setEditingPlace({ ...editingPlace, validationNote: e.target.value })
                        }
                        placeholder="Ej. Pendiente de validación 2026/2027: Verificar precios y horarios."
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Tags selector */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1.5">
                        Etiquetas y características
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_AVAILABLE_TAGS.map((tag) => {
                          const isSelected = editingPlace.tags?.includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => {
                                const cur = editingPlace.tags || [];
                                const updated = isSelected
                                  ? cur.filter((t) => t !== tag)
                                  : [...cur, tag];
                                setEditingPlace({ ...editingPlace, tags: updated });
                              }}
                              className={`text-[11px] font-black px-2.5 py-1 rounded-xl border transition ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlace(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar cambios</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Places Table */
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Buscar por nombre o localidad..."
                        className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setEditingPlace({
                          category: 'comer',
                          tags: ['Abierto ahora', 'Con niños'],
                          services: ['Atención turística'],
                        });
                        setIsCreatingPlace(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar nuevo lugar / comercio</span>
                    </button>
                  </div>

                  {/* Filter Pills for Validation */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-600">Filtrar por validación:</span>
                    <button
                      type="button"
                      onClick={() => setAdminValidationFilter('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        adminValidationFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Todos ({places.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminValidationFilter('pendiente_validacion')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        adminValidationFilter === 'pendiente_validacion'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      ⏳ Pendiente de validación (
                      {
                        places.filter(
                          (p) =>
                            p.validationStatus === 'pendiente_validacion' ||
                            !p.validationStatus
                        ).length
                      }
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminValidationFilter('verificado')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        adminValidationFilter === 'verificado'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      ✅ Verificados (
                      {places.filter((p) => p.validationStatus === 'verificado').length})
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="divide-y divide-slate-100">
                      {places
                        .filter((p) => {
                          const matchesSearch =
                            p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                            p.locality.toLowerCase().includes(adminSearch.toLowerCase());
                          if (!matchesSearch) return false;
                          if (adminValidationFilter === 'pendiente_validacion') {
                            return (
                              p.validationStatus === 'pendiente_validacion' ||
                              !p.validationStatus
                            );
                          }
                          if (adminValidationFilter === 'verificado') {
                            return p.validationStatus === 'verificado';
                          }
                          return true;
                        })
                        .map((place) => (
                          <div
                            key={place.id}
                            className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {place.image && place.image.trim() !== '' ? (
                                <img
                                  src={place.image}
                                  alt={place.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 text-[10px] font-bold">
                                  Sin foto
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                    {place.category}
                                  </span>
                                  {place.validationStatus === 'verificado' ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                      ✓ Verificado
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                                      ⏳ Pendiente 2026/2027
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate mt-1">
                                  {place.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate font-medium">
                                  {place.locality} · {place.openingHours}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingPlace(place);
                                  setIsCreatingPlace(false);
                                }}
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar ${place.name}?`)) {
                                    deletePlace(place.id);
                                    showFeedback('Lugar eliminado');
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: EVENTS & AGENDA */}
          {activeAdminTab === 'events' && (
            <div className="space-y-4">
              {editingEvent ? (
                /* Event Form */
                <form
                  onSubmit={handleSaveEvent}
                  className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-black text-base text-slate-900">
                      {isCreatingEvent ? '➕ Publicar nuevo evento' : `✏️ Editar: ${editingEvent.title}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="text-xs font-black text-slate-500"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Título del evento *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingEvent.title || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Fecha (YYYY-MM-DD) *
                      </label>
                      <input
                        type="date"
                        required
                        value={editingEvent.date || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Hora
                      </label>
                      <input
                        type="text"
                        value={editingEvent.time || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                        placeholder="Ej. 21:00 hs"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Lugar / Espacio
                      </label>
                      <input
                        type="text"
                        value={editingEvent.locationName || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, locationName: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Organiza
                      </label>
                      <input
                        type="text"
                        value={editingEvent.organizer || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Descripción del evento
                      </label>
                      <textarea
                        rows={3}
                        value={editingEvent.description || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Publicar evento</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setEditingEvent({
                          date: new Date().toISOString().slice(0, 10),
                          isFree: true,
                          category: 'peña',
                        });
                        setIsCreatingEvent(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar evento a la agenda</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                            {ev.date} · {ev.time}
                          </span>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate mt-1">
                            {ev.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate font-medium">
                            📍 {ev.locationName}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingEvent(ev);
                              setIsCreatingEvent(false);
                            }}
                            className="p-2 text-slate-600 hover:text-emerald-600 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar ${ev.title}?`)) {
                                deleteEvent(ev.id);
                                showFeedback('Evento eliminado');
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: AUDIOGUIDES */}
          {activeAdminTab === 'audioguides' && (
            <div className="space-y-4">
              {editingGuide ? (
                <form onSubmit={handleSaveGuide} className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-display font-black text-base text-slate-900">
                      {isCreatingGuide ? '✨ Nueva Audioguía' : `✏️ Editando: ${editingGuide.title}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingGuide(null)}
                      className="text-xs font-black text-slate-500"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Título de la audioguía *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingGuide.title || ''}
                        onChange={(e) => setEditingGuide({ ...editingGuide, title: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Subtítulo / Temática
                      </label>
                      <input
                        type="text"
                        value={editingGuide.subtitle || ''}
                        onChange={(e) => setEditingGuide({ ...editingGuide, subtitle: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Duración estimada (ej. 2:40 min)
                      </label>
                      <input
                        type="text"
                        value={editingGuide.duration || ''}
                        onChange={(e) => setEditingGuide({ ...editingGuide, duration: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <AdminPhotoUploader
                        mainImage={editingGuide.coverImage || ''}
                        gallery={[]}
                        onMainImageChange={(url) => setEditingGuide({ ...editingGuide, coverImage: url })}
                        onGalleryChange={() => {}}
                        placeName={editingGuide.title || 'Audioguía'}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Resumen corto
                      </label>
                      <input
                        type="text"
                        value={editingGuide.shortSummary || ''}
                        onChange={(e) => setEditingGuide({ ...editingGuide, shortSummary: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Texto de locución / Narrativa completa *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={editingGuide.narrativeText || ''}
                        onChange={(e) => setEditingGuide({ ...editingGuide, narrativeText: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingGuide(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar audioguía</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setEditingGuide({
                          duration: '2:30 min',
                          audioSeconds: 150,
                          historicalFacts: [],
                        });
                        setIsCreatingGuide(true);
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar nueva audioguía</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {audioguides.map((guide) => (
                      <div
                        key={guide.id}
                        className="p-4 bg-white rounded-3xl border border-slate-200 flex items-start justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                              ⏱ {guide.duration}
                            </span>
                            {guide.coverImage && (
                              <span className="text-[10px] font-bold text-slate-500">📸 Con portada</span>
                            )}
                          </div>
                          <h4 className="font-black text-sm text-slate-900 mt-1 truncate">
                            {guide.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">{guide.subtitle}</p>
                          <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl font-medium mt-1">
                            {guide.narrativeText}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingGuide(guide);
                              setIsCreatingGuide(false);
                            }}
                            className="p-2 text-slate-600 hover:text-teal-600 rounded-lg transition"
                            title="Editar audioguía"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar audioguía ${guide.title}?`)) {
                                deleteAudioguide(guide.id);
                                showFeedback('Audioguía eliminada');
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Eliminar audioguía"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeAdminTab === 'data' && (
            <div className="space-y-4 max-w-lg mx-auto py-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-black text-base text-slate-900">
                    Copia de Seguridad Municipal
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Exportá los datos actualizados para compartirlos con el equipo de Turismo o guardarlos en tu computadora.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleExportData}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Descargar archivo JSON de respaldo</span>
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          '¿Deseas restaurar todos los datos iniciales de Fray Mamerto Esquiú? Esto borrará modificaciones de prueba.'
                        )
                      ) {
                        resetAllDataToDefault();
                        showFeedback('Datos restaurados a los valores oficiales del municipio');
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>Restaurar datos iniciales de Fray</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (forceVisibleInRoute) {
    return containerContent;
  }

  return (
    <div
      id="admin-panel-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {containerContent}
    </div>
  );
};
