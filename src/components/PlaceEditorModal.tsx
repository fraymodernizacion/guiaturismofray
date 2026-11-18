import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Clock,
  Tag,
  CheckCircle,
  AlertCircle,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Place, CategoryId, PlaceTag } from '../types';
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

export const PlaceEditorModal: React.FC = () => {
  const {
    placeToEdit,
    setPlaceToEdit,
    isCreatePlaceModalOpen,
    setIsCreatePlaceModalOpen,
    addPlace,
    updatePlace,
    deletePlace,
  } = useData();

  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Partial<Place>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const isOpen = isAuthenticated && (Boolean(placeToEdit) || isCreatePlaceModalOpen);
  const isCreating = isCreatePlaceModalOpen && !placeToEdit;

  useEffect(() => {
    if (placeToEdit) {
      setFormData({
        ...placeToEdit,
        gallery: Array.isArray(placeToEdit.gallery) ? [...placeToEdit.gallery] : [],
        tags: Array.isArray(placeToEdit.tags) ? [...placeToEdit.tags] : [],
        services: Array.isArray(placeToEdit.services) ? [...placeToEdit.services] : [],
      });
    } else if (isCreatePlaceModalOpen) {
      setFormData({
        name: '',
        category: 'visitar',
        shortDescription: '',
        description: '',
        address: 'San José de Piedra Blanca',
        locality: 'San José de Piedra Blanca',
        lat: -28.3846,
        lng: -65.7335,
        image: '/images/dique-las-pirquitas.webp',
        gallery: [],
        openingHours: 'Lunes a Domingo 09:00 a 20:00 hs',
        phone: '383 4491020',
        whatsapp: '5493834491020',
        instagram: '',
        tags: ['Abierto ahora', 'Con niños'],
        services: ['Atención turística'],
        priceLevel: '$',
        validationStatus: 'verificado',
        validationNote: 'Verificado por Municipalidad 2026/2027',
      });
    }
  }, [placeToEdit, isCreatePlaceModalOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setPlaceToEdit(null);
    setIsCreatePlaceModalOpen(false);
    setIsDeleting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    const mainImg = formData.image || '';
    const galleryImgs = Array.isArray(formData.gallery) && formData.gallery.length > 0
      ? (mainImg && !formData.gallery.includes(mainImg) ? [mainImg, ...formData.gallery] : formData.gallery)
      : (mainImg ? [mainImg] : []);

    if (isCreating) {
      addPlace({
        name: formData.name,
        category: formData.category as CategoryId,
        shortDescription: formData.shortDescription || '',
        description: formData.description || '',
        address: formData.address || 'Piedra Blanca',
        locality: formData.locality || 'San José de Piedra Blanca',
        lat: Number(formData.lat) || -28.3846,
        lng: Number(formData.lng) || -65.7335,
        image: mainImg,
        gallery: galleryImgs,
        openingHours: formData.openingHours || 'Lunes a Domingo 09:00 a 20:00 hs',
        phone: formData.phone || '383 4491020',
        whatsapp: formData.whatsapp || '5493834491020',
        instagram: formData.instagram || '',
        tags: formData.tags || ['Abierto ahora', 'Con niños'],
        services: formData.services || ['Atención turística'],
        priceLevel: formData.priceLevel || '$',
        validationStatus: 'verificado',
        validationNote: 'Verificado por Municipalidad 2026/2027',
        sourceGuide: 'Guía Turística FME 2026',
        googleMapsUrl: formData.googleMapsUrl || undefined,
      });
    } else if (formData.id) {
      updatePlace({
        ...(formData as Place),
        image: mainImg,
        gallery: galleryImgs,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      });
    }

    handleClose();
  };

  const handleDelete = () => {
    if (formData.id) {
      deletePlace(formData.id);
      handleClose();
    }
  };

  const toggleTag = (tag: PlaceTag) => {
    const current = formData.tags || [];
    if (current.includes(tag)) {
      setFormData({ ...formData, tags: current.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...current, tag] });
    }
  };

  return (
    <div
      id="place-editor-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={handleClose}
    >
      <div
        id="place-editor-sheet"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.2 rounded-md">
                  {isCreating ? 'NUEVA FICHA' : 'EDITAR FICHA'}
                </span>
                <h2 className="font-display font-black text-base sm:text-lg text-white">
                  {isCreating ? 'Agregar Atractivo / Comercio' : formData.name || 'Editar Ficha'}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Información completa, galería de fotos, horarios y coordenadas
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Atractivo / Comercio *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej. Casa Natal de Fray Mamerto Esquiú"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría Principal *
              </label>
              <select
                required
                value={formData.category || 'visitar'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryId })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bajada Breve (para tarjetas y listados)
              </label>
              <input
                type="text"
                value={formData.shortDescription || ''}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="ej. Monumento Histórico Nacional con su templete protector"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción Completa e Historia
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Relato histórico, características, recomendaciones para el turista..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Photo Management */}
          <AdminPhotoUploader
            mainImage={formData.image || ''}
            gallery={formData.gallery || []}
            onMainImageChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            onGalleryChange={(newGallery) => setFormData((prev) => ({ ...prev, gallery: newGallery }))}
            placeName={formData.name || 'lugar'}
          />

          {/* Location & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dirección / Ubicación
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="ej. Calle San Martín s/n"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Localidad de Fray
              </label>
              <input
                type="text"
                value={formData.locality || ''}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="ej. San José de Piedra Blanca, Las Pirquitas..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Latitud GPS
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.lat || ''}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Longitud GPS
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.lng || ''}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enlace Oficial de Google Maps (URL / Compartir)
              </label>
              <input
                type="text"
                value={formData.googleMapsUrl || ''}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                placeholder="ej. https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Horarios de Atención
              </label>
              <input
                type="text"
                value={formData.openingHours || ''}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                placeholder="ej. Mar a Dom 09 a 19 hs"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="5493834491020"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instagram (@usuario)
              </label>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@turismofray"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Etiquetas y Características
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_AVAILABLE_TAGS.map((tag) => {
                const isSelected = formData.tags?.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
            {!isCreating && (
              <div>
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-bold">¿Confirmás eliminar?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      Sí, Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Ficha</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{isCreating ? 'Crear Ficha y Publicar' : 'Guardar Ficha'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
