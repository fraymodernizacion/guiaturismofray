import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Download,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  Headphones,
  Database,
  Search,
  Layers,
  Loader2,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Place, TouristEvent, Audioguide, CategoryId, PlaceTag } from '../types';
import { CATEGORIES } from '../data/initialData';
import { AdminPhotoUploader } from './AdminPhotoUploader';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';

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

const SITE_SECTIONS_LIST = [
  {
    id: 'hero',
    icon: '🏔️',
    title: 'Portada Principal / Hero',
    description: 'Título, subtítulo, imagen de fondo y buscador principal.',
  },
  {
    id: 'tourismOffices',
    icon: '📍',
    title: 'Oficinas de Turismo',
    description: 'Los 3 puntos de atención, horarios, teléfonos, WhatsApp y enlaces de Maps.',
  },
  {
    id: 'categories',
    icon: '🗂️',
    title: 'Categorías de Fray',
    description: 'Nombres, emojis, orden y visibilidad de cada categoría en la pantalla inicial.',
  },
  {
    id: 'imperdibles',
    icon: '⭐',
    title: 'Imperdibles de Fray',
    description: 'Tarjetas destacadas, fotos personalizadas, textos y orden.',
  },
  {
    id: 'recorridoEsquiu',
    icon: '⛪',
    title: 'Tras las Huellas del Beato',
    description: 'Circuito Histórico & de Fe, paradas, distancias y consejos.',
  },
  {
    id: 'conoceFray',
    icon: '🌿',
    title: 'Conocé Fray',
    description: 'Identidad territorial, textos descriptivos y pilares históricos.',
  },
  {
    id: 'queHacer',
    icon: '🎉',
    title: 'Qué Hacer en Fray',
    description: 'Títulos y atajos rápidos de actividades recreativas.',
  },
  {
    id: 'emblemaFe',
    icon: '✨',
    title: 'Emblema: Tierra de Milagros',
    description: 'Etiqueta, título, descripción y visibilidad del bloque de fe.',
  },
  {
    id: 'footer',
    icon: '🏛️',
    title: 'Footer Institucional y Contactos',
    description: 'Datos de la Municipalidad, Secretaría, teléfonos, redes y localidades.',
  },
];

interface AdminPanelModalProps {
  forceVisibleInRoute?: boolean;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ forceVisibleInRoute = false }) => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    adminPanelTab: activeAdminTab,
    setAdminPanelTab: setActiveAdminTab,
    setSectionToEdit,
    siteConfig,
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

  const { navigateToPublic } = useAuth();
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminValidationFilter, setAdminValidationFilter] = useState<
    'all' | 'pendiente_validacion' | 'verificado'
  >('all');

  // Editing state for Place
  const [editingPlace, setEditingPlace] = useState<Partial<Place> | null>(null);
  const [placeLatText, setPlaceLatText] = useState<string>('-28.3846');
  const [placeLngText, setPlaceLngText] = useState<string>('-65.7335');
  const [isCreatingPlace, setIsCreatingPlace] = useState<boolean>(false);

  // Editing state for Event
  const [editingEvent, setEditingEvent] = useState<Partial<TouristEvent> | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  // Editing state for Audioguide
  const [editingGuide, setEditingGuide] = useState<Partial<Audioguide> | null>(null);
  const [isCreatingGuide, setIsCreatingGuide] = useState<boolean>(false);

  // Upload & Save state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!forceVisibleInRoute && !isAdminModalOpen) return null;

  const showFeedback = (msg: string) => {
    setErrorMessage('');
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (msg: string) => {
    setSuccessMessage('');
    setErrorMessage(msg);
  };

  const openPlaceEditor = (place: Place) => {
    setErrorMessage('');
    setEditingPlace({
      ...place,
      gallery: Array.isArray(place.gallery) ? [...place.gallery] : [],
      tags: Array.isArray(place.tags) ? [...place.tags] : [],
      services: Array.isArray(place.services) ? [...place.services] : [],
    });
    setPlaceLatText(Number.isFinite(place.lat) ? String(place.lat) : '-28.3846');
    setPlaceLngText(Number.isFinite(place.lng) ? String(place.lng) : '-65.7335');
    setIsCreatingPlace(false);
  };

  const openCreatePlace = () => {
    setErrorMessage('');
    setEditingPlace({
      name: '',
      category: 'comer',
      shortDescription: '',
      description: '',
      locality: 'San José de Piedra Blanca',
      address: '',
      openingHours: 'Lunes a Domingo 09:00 a 20:00 hs',
      phone: '',
      whatsapp: '',
      instagram: '',
      image: '',
      gallery: [],
      tags: ['Abierto ahora', 'Con niños'],
      services: ['Atención turística'],
      validationStatus: 'verificado',
      validationNote: 'Verificado por Municipalidad 2026/2027',
    });
    setPlaceLatText('-28.3846');
    setPlaceLngText('-65.7335');
    setIsCreatingPlace(true);
  };

  // Save Place
  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace?.name?.trim() || !editingPlace?.category) {
      showError('Completá el nombre y la categoría del lugar.');
      return;
    }
    if (isUploadingPhoto) {
      showError('Esperá a que termine de subir la fotografía antes de guardar.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const parsedLat = parseFloat(placeLatText.replace(',', '.'));
    const parsedLng = parseFloat(placeLngText.replace(',', '.'));
    const safeLat = Number.isFinite(parsedLat) ? parsedLat : editingPlace.lat ?? -28.3846;
    const safeLng = Number.isFinite(parsedLng) ? parsedLng : editingPlace.lng ?? -65.7335;

    const mainImg = (editingPlace.image || '').trim();
    const existingGallery = Array.isArray(editingPlace.gallery)
      ? editingPlace.gallery.filter((u) => typeof u === 'string' && u.trim() !== '')
      : [];
    const galleryImgs = mainImg
      ? Array.from(new Set([mainImg, ...existingGallery]))
      : existingGallery;

    try {
      let ok = false;
      if (isCreatingPlace) {
        ok = await addPlace({
          name: editingPlace.name.trim(),
          category: editingPlace.category as CategoryId,
          shortDescription: (editingPlace.shortDescription || '').trim(),
          description: (editingPlace.description || '').trim(),
          address: (editingPlace.address || 'Piedra Blanca').trim(),
          locality: (editingPlace.locality || 'San José de Piedra Blanca').trim(),
          lat: safeLat,
          lng: safeLng,
          image: mainImg,
          gallery: galleryImgs,
          openingHours: (editingPlace.openingHours || 'Lunes a Domingo 09:00 a 20:00 hs').trim(),
          phone: (editingPlace.phone || '').trim(),
          whatsapp: (editingPlace.whatsapp || '').trim(),
          instagram: (editingPlace.instagram || '').trim(),
          googleMapsUrl: editingPlace.googleMapsUrl?.trim() || undefined,
          tags: editingPlace.tags || ['Abierto ahora', 'Con niños'],
          services: editingPlace.services || ['Atención turística'],
          priceLevel: editingPlace.priceLevel || '$',
          validationStatus: editingPlace.validationStatus || 'verificado',
          validationNote: editingPlace.validationNote || 'Verificado por Municipalidad 2026/2027',
          sourceGuide: editingPlace.sourceGuide || 'Guía Turística FME',
          photoPendingNote: mainImg ? undefined : editingPlace.photoPendingNote,
        });
      } else if (editingPlace.id) {
        const placeToUpdate: Place = {
          ...(editingPlace as Place),
          name: editingPlace.name.trim(),
          shortDescription: (editingPlace.shortDescription || '').trim(),
          description: (editingPlace.description || '').trim(),
          address: (editingPlace.address || '').trim(),
          locality: (editingPlace.locality || '').trim(),
          openingHours: (editingPlace.openingHours || '').trim(),
          phone: (editingPlace.phone || '').trim(),
          whatsapp: (editingPlace.whatsapp || '').trim(),
          instagram: (editingPlace.instagram || '').trim(),
          googleMapsUrl: editingPlace.googleMapsUrl?.trim() || undefined,
          lat: safeLat,
          lng: safeLng,
          image: mainImg,
          gallery: galleryImgs,
          photoPendingNote: mainImg ? undefined : editingPlace.photoPendingNote,
        };
        ok = await updatePlace(placeToUpdate);
      }

      if (!ok) {
        showError('No se pudo confirmar el guardado en el servidor. Intentá nuevamente.');
        return;
      }

      showFeedback(
        isCreatingPlace
          ? '¡Comercio / Atractivo y fotos guardadas permanentemente en el servidor!'
          : '¡Fotografías y datos guardados permanentemente en el servidor!'
      );
      setEditingPlace(null);
      setIsCreatingPlace(false);
    } catch (err: any) {
      showError(err?.message || 'Error al guardar el lugar.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title?.trim() || !editingEvent?.date) {
      showError('Completá el título y la fecha del evento.');
      return;
    }
    if (isUploadingPhoto) {
      showError('Esperá a que termine de subir la fotografía del evento.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      let ok = false;
      if (isCreatingEvent) {
        ok = await addEvent({
          title: editingEvent.title.trim(),
          date: editingEvent.date,
          dateBadge: editingEvent.dateBadge || 'PRÓXIMO',
          time: editingEvent.time || '20:00 hs',
          category: (editingEvent.category as any) || 'peña',
          locationName: editingEvent.locationName || 'Plaza San José',
          address: editingEvent.address || 'San José de Piedra Blanca',
          lat: editingEvent.lat || -28.3846,
          lng: editingEvent.lng || -65.7335,
          description: editingEvent.description || '',
          image: editingEvent.image || '/images/dique-las-pirquitas.webp',
          isFree: editingEvent.isFree ?? true,
          priceText: editingEvent.priceText || 'Entrada Libre',
          organizer: editingEvent.organizer || 'Turismo FME',
        });
      } else if (editingEvent.id) {
        ok = await updateEvent(editingEvent as TouristEvent);
      }

      if (!ok) {
        showError('No se pudo guardar el evento en el servidor. Intentá nuevamente.');
        return;
      }

      showFeedback(
        isCreatingEvent
          ? '¡Evento publicado y guardado permanentemente!'
          : '¡Evento actualizado y guardado permanentemente!'
      );
      setEditingEvent(null);
      setIsCreatingEvent(false);
    } catch (err: any) {
      showError(err?.message || 'Error al guardar el evento.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Audioguide
  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide?.title?.trim() || !editingGuide?.narrativeText?.trim()) {
      showError('Completá el título y el texto de locución.');
      return;
    }
    if (isUploadingPhoto) {
      showError('Esperá a que termine de subir la foto de portada.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      let ok = false;
      if (isCreatingGuide) {
        ok = await addAudioguide({
          placeId: editingGuide.placeId || 'casa-natal-esquiu',
          title: editingGuide.title.trim(),
          subtitle: editingGuide.subtitle || '',
          duration: editingGuide.duration || '2:30 min',
          audioSeconds: editingGuide.audioSeconds || 150,
          coverImage: editingGuide.coverImage || '',
          shortSummary: editingGuide.shortSummary || '',
          narrativeText: editingGuide.narrativeText.trim(),
          historicalFacts: editingGuide.historicalFacts || [],
          nextPlaceId: editingGuide.nextPlaceId,
          nextPlaceReason: editingGuide.nextPlaceReason,
        });
      } else if (editingGuide.id) {
        ok = await updateAudioguide(editingGuide as Audioguide);
      }

      if (!ok) {
        showError('No se pudo guardar la audioguía en el servidor. Intentá nuevamente.');
        return;
      }

      showFeedback(
        isCreatingGuide
          ? '¡Audioguía agregada y guardada permanentemente!'
          : '¡Audioguía actualizada y guardada permanentemente!'
      );
      setEditingGuide(null);
      setIsCreatingGuide(false);
    } catch (err: any) {
      showError(err?.message || 'Error al guardar la audioguía.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const backup = {
      siteConfig,
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
    URL.revokeObjectURL(url);
    showFeedback('¡Copia de seguridad completa descargada!');
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
      className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-800 max-h-[92vh] animate-in zoom-in-95 duration-200"
    >
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                Panel de Gestión Turística
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Fray Mamerto Esquiú
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Editá secciones del sitio, comercios, fotos optimizadas, agenda y audioguías con guardado permanente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

      {/* Feedback Alert banners */}
      {successMessage && (
        <div className="bg-emerald-600 text-white text-xs font-black px-4 py-2.5 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-600 text-white text-xs font-black px-4 py-2.5 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-white/80 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100/80 overflow-x-auto no-scrollbar px-3">
        {[
          { id: 'analytics', label: 'Visitas y Estadísticas', icon: BarChart3 },
          { id: 'places', label: `Comercios y Atractivos (${places.length})`, icon: Building },
          { id: 'sections', label: `Secciones del Sitio (${SITE_SECTIONS_LIST.length})`, icon: Layers },
          { id: 'events', label: `Agenda de Eventos (${events.length})`, icon: Calendar },
          { id: 'audioguides', label: `Audioguías (${audioguides.length})`, icon: Headphones },
          { id: 'data', label: 'Respaldo / Restaurar', icon: Database },
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
                setPendingDeleteId(null);
                setErrorMessage('');
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
              <form
                onSubmit={handleSavePlace}
                className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-black text-base text-slate-900">
                    {isCreatingPlace
                      ? '➕ Agregar nuevo comercio o atractivo'
                      : `✏️ Editar: ${editingPlace.name}`}
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
                      onChange={(e) =>
                        setEditingPlace((prev) => ({ ...(prev || {}), name: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={editingPlace.category || 'comer'}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          category: e.target.value as CategoryId,
                        }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Bajada breve (texto corto visible en la tarjeta)
                    </label>
                    <input
                      type="text"
                      value={editingPlace.shortDescription || ''}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          shortDescription: e.target.value,
                        }))
                      }
                      placeholder="Ej. Comida regional, empanadas al horno de barro y patio serrano"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Localidad (Piedra Blanca, Las Pirquitas, San Antonio, etc.)
                    </label>
                    <input
                      type="text"
                      value={editingPlace.locality || ''}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({ ...(prev || {}), locality: e.target.value }))
                      }
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
                      onChange={(e) =>
                        setEditingPlace((prev) => ({ ...(prev || {}), address: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Latitud GPS
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={placeLatText}
                      onChange={(e) => setPlaceLatText(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Longitud GPS
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={placeLngText}
                      onChange={(e) => setPlaceLngText(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Enlace de Google Maps (opcional)
                    </label>
                    <input
                      type="text"
                      value={editingPlace.googleMapsUrl || ''}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          googleMapsUrl: e.target.value,
                        }))
                      }
                      placeholder="https://maps.app.goo.gl/..."
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
                      onChange={(e) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          openingHours: e.target.value,
                        }))
                      }
                      placeholder="Ej. Mar a Dom: 09:00 a 13:00 y 17:00 a 21:00 hs"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={editingPlace.phone || ''}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({ ...(prev || {}), phone: e.target.value }))
                      }
                      placeholder="383 4491020"
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
                      onChange={(e) =>
                        setEditingPlace((prev) => ({ ...(prev || {}), whatsapp: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Instagram (usuario sin @)
                    </label>
                    <input
                      type="text"
                      value={editingPlace.instagram || ''}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({ ...(prev || {}), instagram: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Persistent Photo Uploader Component (Atomic update — no stale closures!) */}
                  <div className="sm:col-span-2">
                    <AdminPhotoUploader
                      mainImage={editingPlace.image || ''}
                      gallery={editingPlace.gallery || []}
                      onPhotosChange={(image, gallery) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          image,
                          gallery,
                          photoPendingNote: image ? undefined : prev?.photoPendingNote,
                        }))
                      }
                      onUploadingChange={setIsUploadingPhoto}
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
                      onChange={(e) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          description: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Estado de Validación
                    </label>
                    <select
                      value={editingPlace.validationStatus || 'pendiente_validacion'}
                      onChange={(e) =>
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          validationStatus: e.target.value as any,
                        }))
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
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          sourceGuide: e.target.value,
                        }))
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
                        setEditingPlace((prev) => ({
                          ...(prev || {}),
                          validationNote: e.target.value,
                        }))
                      }
                      placeholder="Ej. Verificado por Municipalidad 2026/2027"
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
                            onClick={() =>
                              setEditingPlace((prev) => {
                                const cur = prev?.tags || [];
                                const updated = cur.includes(tag)
                                  ? cur.filter((t) => t !== tag)
                                  : [...cur, tag];
                                return { ...(prev || {}), tags: updated };
                              })
                            }
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
                    disabled={isSaving}
                    onClick={() => setEditingPlace(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingPhoto}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition disabled:opacity-50"
                  >
                    {isSaving || isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isUploadingPhoto ? 'Subiendo foto...' : 'Guardando...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
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
                    type="button"
                    onClick={openCreatePlace}
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
                          p.validationStatus === 'pendiente_validacion' || !p.validationStatus
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
                            p.validationStatus === 'pendiente_validacion' || !p.validationStatus
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
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
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
                            {pendingDeleteId === place.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const ok = await deletePlace(place.id);
                                    setPendingDeleteId(null);
                                    if (ok) showFeedback('Lugar eliminado permanentemente');
                                    else showError('No se pudo eliminar en el servidor');
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openPlaceEditor(place)}
                                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteId(place.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: SITE SECTIONS */}
        {activeAdminTab === 'sections' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <h4 className="font-display font-black text-sm text-emerald-950">
                Editor Completo de Todas las Secciones de la Guía
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Seleccioná cualquier sección para editar sus títulos, textos, horarios, enlaces o fotografías. Todos los cambios se guardan permanentemente en el servidor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SITE_SECTIONS_LIST.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSectionToEdit(sec.id)}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 text-left transition shadow-2xs hover:shadow-md flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl">{sec.icon}</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <span>Editar</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h5 className="font-display font-black text-sm text-slate-900">
                      {sec.title}
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{sec.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS & AGENDA */}
        {activeAdminTab === 'events' && (
          <div className="space-y-4">
            {editingEvent ? (
              <form
                onSubmit={handleSaveEvent}
                className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-black text-base text-slate-900">
                    {isCreatingEvent
                      ? '➕ Publicar nuevo evento'
                      : `✏️ Editar: ${editingEvent.title}`}
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
                      onChange={(e) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), title: e.target.value }))
                      }
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
                      onChange={(e) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), date: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Hora</label>
                    <input
                      type="text"
                      value={editingEvent.time || ''}
                      onChange={(e) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), time: e.target.value }))
                      }
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
                      onChange={(e) =>
                        setEditingEvent((prev) => ({
                          ...(prev || {}),
                          locationName: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Organiza</label>
                    <input
                      type="text"
                      value={editingEvent.organizer || ''}
                      onChange={(e) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), organizer: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Etiqueta de fecha (ej. HOY, SÁBADO, FINDE)
                    </label>
                    <input
                      type="text"
                      value={editingEvent.dateBadge || ''}
                      onChange={(e) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), dateBadge: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Entrada / Precio
                    </label>
                    <input
                      type="text"
                      value={editingEvent.priceText || ''}
                      onChange={(e) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), priceText: e.target.value }))
                      }
                      placeholder="Entrada Libre y Gratuita"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <AdminPhotoUploader
                      mainImage={editingEvent.image || ''}
                      singleImageOnly
                      onMainImageChange={(url) =>
                        setEditingEvent((prev) => ({ ...(prev || {}), image: url }))
                      }
                      onUploadingChange={setIsUploadingPhoto}
                      placeName={editingEvent.title || 'evento'}
                      title="Fotografía del Evento"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Descripción del evento
                    </label>
                    <textarea
                      rows={3}
                      value={editingEvent.description || ''}
                      onChange={(e) =>
                        setEditingEvent((prev) => ({
                          ...(prev || {}),
                          description: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingPhoto}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition disabled:opacity-50"
                  >
                    {isSaving || isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar evento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent({
                        date: new Date().toISOString().slice(0, 10),
                        isFree: true,
                        priceText: 'Entrada Libre',
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
                        {pendingDeleteId === ev.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await deleteEvent(ev.id);
                                setPendingDeleteId(null);
                                if (ok) showFeedback('Evento eliminado permanentemente');
                                else showError('No se pudo eliminar el evento');
                              }}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEvent({ ...ev });
                                setIsCreatingEvent(false);
                              }}
                              className="p-2 text-slate-600 hover:text-emerald-600 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(ev.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: AUDIOGUIDES */}
        {activeAdminTab === 'audioguides' && (
          <div className="space-y-4">
            {editingGuide ? (
              <form
                onSubmit={handleSaveGuide}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-display font-black text-base text-slate-900">
                    {isCreatingGuide
                      ? '✨ Nueva Audioguía'
                      : `✏️ Editando: ${editingGuide.title}`}
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
                      onChange={(e) =>
                        setEditingGuide((prev) => ({ ...(prev || {}), title: e.target.value }))
                      }
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
                      onChange={(e) =>
                        setEditingGuide((prev) => ({ ...(prev || {}), subtitle: e.target.value }))
                      }
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
                      onChange={(e) =>
                        setEditingGuide((prev) => ({ ...(prev || {}), duration: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <AdminPhotoUploader
                      mainImage={editingGuide.coverImage || ''}
                      singleImageOnly
                      onMainImageChange={(url) =>
                        setEditingGuide((prev) => ({ ...(prev || {}), coverImage: url }))
                      }
                      onUploadingChange={setIsUploadingPhoto}
                      placeName={editingGuide.title || 'Audioguía'}
                      title="Foto de Portada de la Audioguía"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Resumen corto
                    </label>
                    <input
                      type="text"
                      value={editingGuide.shortSummary || ''}
                      onChange={(e) =>
                        setEditingGuide((prev) => ({
                          ...(prev || {}),
                          shortSummary: e.target.value,
                        }))
                      }
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
                      onChange={(e) =>
                        setEditingGuide((prev) => ({
                          ...(prev || {}),
                          narrativeText: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setEditingGuide(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingPhoto}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition disabled:opacity-50"
                  >
                    {isSaving || isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar audioguía</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
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
                            <span className="text-[10px] font-bold text-slate-500">
                              📸 Con portada
                            </span>
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
                        {pendingDeleteId === guide.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await deleteAudioguide(guide.id);
                                setPendingDeleteId(null);
                                if (ok) showFeedback('Audioguía eliminada permanentemente');
                                else showError('No se pudo eliminar la audioguía');
                              }}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGuide({ ...guide });
                                setIsCreatingGuide(false);
                              }}
                              className="p-2 text-slate-600 hover:text-teal-600 rounded-lg transition"
                              title="Editar audioguía"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(guide.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Eliminar audioguía"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 5: ANALYTICS & VISIT COUNTER (ADMIN ONLY) */}
        {activeAdminTab === 'analytics' && (
          <AdminAnalyticsTab onFeedback={showFeedback} />
        )}

        {/* TAB 6: BACKUP & RESTORE */}
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
                  Todos los cambios y fotografías optimizadas se guardan automáticamente en el servidor. Podés descargar un respaldo completo en JSON cuando quieras.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Descargar archivo JSON de respaldo</span>
                </button>

                {confirmResetAll ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-rose-800">
                      ¿Seguro que querés restaurar todos los textos y lugares a los valores de fábrica?
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={async () => {
                          setIsSaving(true);
                          await resetAllDataToDefault();
                          setIsSaving(false);
                          setConfirmResetAll(false);
                          showFeedback('Datos restaurados a los valores oficiales del municipio');
                        }}
                        className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        Sí, restaurar todo
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetAll(false)}
                        className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(true)}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>Restaurar datos iniciales de Fray</span>
                  </button>
                )}
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
