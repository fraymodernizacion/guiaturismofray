import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
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
  const [latText, setLatText] = useState<string>('');
  const [lngText, setLngText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const isOpen = isAuthenticated && (Boolean(placeToEdit) || isCreatePlaceModalOpen);
  const isCreating = isCreatePlaceModalOpen && !placeToEdit;

  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsDeleting(false);
    setIsSaving(false);

    if (placeToEdit) {
      setFormData({
        ...placeToEdit,
        gallery: Array.isArray(placeToEdit.gallery) ? [...placeToEdit.gallery] : [],
        tags: Array.isArray(placeToEdit.tags) ? [...placeToEdit.tags] : [],
        services: Array.isArray(placeToEdit.services) ? [...placeToEdit.services] : [],
      });
      setLatText(Number.isFinite(placeToEdit.lat) ? String(placeToEdit.lat) : '-28.3846');
      setLngText(Number.isFinite(placeToEdit.lng) ? String(placeToEdit.lng) : '-65.7335');
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
        image: '',
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
      setLatText('-28.3846');
      setLngText('-65.7335');
    }
  }, [placeToEdit, isCreatePlaceModalOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSaving) return;
    setPlaceToEdit(null);
    setIsCreatePlaceModalOpen(false);
    setIsDeleting(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.category) {
      setErrorMsg('Completá el nombre y la categoría antes de guardar.');
      return;
    }
    if (isUploadingPhoto) {
      setErrorMsg('Esperá a que termine de subir la fotografía.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    const parsedLat = parseFloat(latText.replace(',', '.'));
    const parsedLng = parseFloat(lngText.replace(',', '.'));
    const safeLat = Number.isFinite(parsedLat) ? parsedLat : formData.lat ?? -28.3846;
    const safeLng = Number.isFinite(parsedLng) ? parsedLng : formData.lng ?? -65.7335;

    const mainImg = (formData.image || '').trim();
    const existingGallery = Array.isArray(formData.gallery)
      ? formData.gallery.filter((u) => typeof u === 'string' && u.trim() !== '')
      : [];
    const galleryImgs = mainImg
      ? Array.from(new Set([mainImg, ...existingGallery]))
      : existingGallery;

    try {
      let ok = false;
      if (isCreating) {
        ok = await addPlace({
          name: formData.name.trim(),
          category: formData.category as CategoryId,
          shortDescription: (formData.shortDescription || '').trim(),
          description: (formData.description || '').trim(),
          address: (formData.address || 'San José de Piedra Blanca').trim(),
          locality: (formData.locality || 'San José de Piedra Blanca').trim(),
          lat: safeLat,
          lng: safeLng,
          image: mainImg,
          gallery: galleryImgs,
          openingHours: (formData.openingHours || 'Lunes a Domingo 09:00 a 20:00 hs').trim(),
          phone: (formData.phone || '').trim(),
          whatsapp: (formData.whatsapp || '').trim(),
          instagram: (formData.instagram || '').trim(),
          tags: formData.tags || ['Abierto ahora', 'Con niños'],
          services: formData.services || ['Atención turística'],
          priceLevel: formData.priceLevel || '$',
          validationStatus: formData.validationStatus || 'verificado',
          validationNote: formData.validationNote || 'Verificado por Municipalidad 2026/2027',
          sourceGuide: formData.sourceGuide || 'Guía Turística FME 2026',
          googleMapsUrl: formData.googleMapsUrl?.trim() || undefined,
          photoPendingNote: mainImg ? undefined : formData.photoPendingNote,
        });
      } else if (formData.id) {
        ok = await updatePlace({
          ...(formData as Place),
          name: formData.name.trim(),
          shortDescription: (formData.shortDescription || '').trim(),
          description: (formData.description || '').trim(),
          address: (formData.address || '').trim(),
          locality: (formData.locality || '').trim(),
          openingHours: (formData.openingHours || '').trim(),
          phone: (formData.phone || '').trim(),
          whatsapp: (formData.whatsapp || '').trim(),
          instagram: (formData.instagram || '').trim(),
          googleMapsUrl: formData.googleMapsUrl?.trim() || undefined,
          image: mainImg,
          gallery: galleryImgs,
          photoPendingNote: mainImg ? undefined : formData.photoPendingNote,
          lat: safeLat,
          lng: safeLng,
        });
      }

      if (!ok) {
        setErrorMsg(
          'No se pudo confirmar el guardado en el servidor. Revisá tu conexión e intentá nuevamente.'
        );
        setIsSaving(false);
        return;
      }

      setSuccessMsg('¡Ficha y fotografías guardadas permanentemente!');
      setTimeout(() => {
        setIsSaving(false);
        setPlaceToEdit(null);
        setIsCreatePlaceModalOpen(false);
      }, 450);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error al guardar la ficha.');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    setIsSaving(true);
    const ok = await deletePlace(formData.id);
    setIsSaving(false);
    if (ok) {
      handleClose();
    } else {
      setErrorMsg('No se pudo confirmar la eliminación en el servidor.');
    }
  };

  const toggleTag = (tag: PlaceTag) => {
    setFormData((prev) => {
      const current = prev.tags || [];
      return {
        ...prev,
        tags: current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      };
    });
  };

  return (
    <div
      id="place-editor-backdrop"
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={handleClose}
    >
      <div
        id="place-editor-sheet"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md shrink-0">
                  {isCreating ? 'NUEVA FICHA' : 'EDITAR FICHA'}
                </span>
                <h2 className="font-display font-black text-base sm:text-lg text-white truncate">
                  {isCreating ? 'Agregar Atractivo / Comercio' : formData.name || 'Editar Ficha'}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Información completa, fotografías optimizadas, horarios y coordenadas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-600 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-bold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

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
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value as CategoryId }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Relato histórico, características, recomendaciones para el turista..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Photo Management (Atomic update) */}
          <AdminPhotoUploader
            mainImage={formData.image || ''}
            gallery={formData.gallery || []}
            onPhotosChange={(image, gallery) =>
              setFormData((prev) => ({
                ...prev,
                image,
                gallery,
                photoPendingNote: image ? undefined : prev.photoPendingNote,
              }))
            }
            onUploadingChange={setIsUploadingPhoto}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, locality: e.target.value }))}
                placeholder="ej. San José de Piedra Blanca, Las Pirquitas..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Latitud GPS
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={latText}
                onChange={(e) => setLatText(e.target.value)}
                placeholder="-28.3846"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Longitud GPS
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={lngText}
                onChange={(e) => setLngText(e.target.value)}
                placeholder="-65.7335"
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, googleMapsUrl: e.target.value }))
                }
                placeholder="ej. https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Horarios de Atención
              </label>
              <input
                type="text"
                value={formData.openingHours || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, openingHours: e.target.value }))
                }
                placeholder="ej. Mar a Dom 09 a 19 hs"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="383 4491020"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp (con código de país)
              </label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
                placeholder="@turismofray"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Validation Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado de Validación
              </label>
              <select
                value={formData.validationStatus || 'verificado'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validationStatus: e.target.value as any }))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="verificado">✅ Verificado oficialmente</option>
                <option value="pendiente_validacion">⏳ Pendiente de validación 2026/2027</option>
                <option value="dato_pendiente_actualizacion">⚠️ Requiere actualización</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nota de Validación
              </label>
              <input
                type="text"
                value={formData.validationNote || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validationNote: e.target.value }))
                }
                placeholder="Verificado por Municipalidad 2026/2027"
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
                    {isSelected ? '✓ ' : ''}
                    {tag}
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
                      disabled={isSaving}
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
                disabled={isSaving}
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploadingPhoto}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                {isSaving || isUploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isUploadingPhoto ? 'Subiendo foto...' : 'Guardando...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isCreating ? 'Crear Ficha y Publicar' : 'Guardar Ficha'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
