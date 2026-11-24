import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Loader2,
  Plus,
  Star,
  Link2,
  AlertTriangle,
} from 'lucide-react';
import { optimizeImageForWeb, formatFileSizeKb } from '../utils/imageOptimizer';

interface AdminPhotoUploaderProps {
  /** Primary image URL */
  mainImage?: string;
  /** Additional gallery image URLs */
  gallery?: string[];
  /** Preferred atomic updater to avoid stale-closure overwrites when updating both mainImage and gallery */
  onPhotosChange?: (mainImage: string, gallery: string[]) => void;
  /** Individual updaters (supported for single-image forms or legacy callers) */
  onMainImageChange?: (url: string) => void;
  onGalleryChange?: (gallery: string[]) => void;
  /** Backward-compatible aliases used by single-photo editors */
  currentImageUrl?: string;
  onPhotoUploaded?: (url: string) => void;
  /** Hide the multi-photo gallery block when editing a single image (Hero, Eventos, Audioguías, Imperdibles) */
  singleImageOnly?: boolean;
  /** Notify parent form while an image is optimizing/uploading so Save can wait */
  onUploadingChange?: (isUploading: boolean) => void;
  placeName?: string;
  title?: string;
  helpText?: string;
}

export const AdminPhotoUploader: React.FC<AdminPhotoUploaderProps> = ({
  mainImage: mainImageProp,
  gallery = [],
  onPhotosChange,
  onMainImageChange,
  onGalleryChange,
  currentImageUrl,
  onPhotoUploaded,
  singleImageOnly = false,
  onUploadingChange,
  placeName = 'lugar',
  title,
  helpText,
}) => {
  const effectiveMainImage =
    mainImageProp !== undefined ? mainImageProp : currentImageUrl || '';
  const effectiveSingleOnly =
    singleImageOnly || (!onPhotosChange && !onGalleryChange && Boolean(onPhotoUploaded));

  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualGalleryUrl, setManualGalleryUrl] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewError(false);
  }, [effectiveMainImage]);

  useEffect(() => {
    onUploadingChange?.(isUploadingMain || isUploadingGallery);
  }, [isUploadingMain, isUploadingGallery, onUploadingChange]);

  const emitPhotoUpdate = (nextMain: string, nextGallery: string[]) => {
    const cleanGallery = effectiveSingleOnly
      ? []
      : Array.from(new Set(nextGallery.filter((u) => typeof u === 'string' && u.trim() !== '')));

    if (onPhotosChange) {
      onPhotosChange(nextMain, cleanGallery);
      return;
    }

    if (onMainImageChange) {
      onMainImageChange(nextMain);
    }
    if (onPhotoUploaded) {
      onPhotoUploaded(nextMain);
    }
    if (!effectiveSingleOnly && onGalleryChange) {
      onGalleryChange(cleanGallery);
    }
  };

  // Optimize client-side (resize + WebP/JPEG compression) and upload to /api/upload
  const uploadFileToServer = async (
    file: File
  ): Promise<{ url: string; sizeBytes: number; originalSizeBytes: number }> => {
    const optimized = await optimizeImageForWeb(file, 1400, 0.82);

    const cleanPlaceName = (placeName || 'foto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 32) || 'foto';

    const filename = `${cleanPlaceName}_${Date.now()}.${optimized.extension}`;

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        dataUrl: optimized.dataUrl,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor (${res.status}) al subir la imagen`);
    }

    const data = await res.json();
    if (!data?.url) {
      throw new Error('El servidor no devolvió la URL de la fotografía');
    }

    return {
      url: data.url,
      sizeBytes: optimized.optimizedSize,
      originalSizeBytes: optimized.originalSize,
    };
  };

  // Handle Main Photo Upload
  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploadingMain(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploaded = await uploadFileToServer(file);
      const nextGallery = effectiveSingleOnly
        ? []
        : gallery.includes(uploaded.url)
        ? gallery
        : [uploaded.url, ...gallery];

      emitPhotoUpdate(uploaded.url, nextGallery);
      setPreviewError(false);
      setUploadSuccess(
        `Foto optimizada y subida (${formatFileSizeKb(uploaded.sizeBytes)}). Recordá hacer clic en "Guardar" para confirmar.`
      );
    } catch (err: any) {
      console.error('Error uploading main photo:', err);
      setUploadError(err?.message || 'Error al subir la fotografía.');
    } finally {
      setIsUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    }
  };

  // Handle Gallery Photo Upload
  const handleGalleryFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const newUrls: string[] = [];
      let totalSizeBytes = 0;

      for (let i = 0; i < files.length; i++) {
        const uploaded = await uploadFileToServer(files[i]);
        newUrls.push(uploaded.url);
        totalSizeBytes += uploaded.sizeBytes;
      }

      const updatedGallery = Array.from(new Set([...gallery, ...newUrls]));
      const nextMain = effectiveMainImage || newUrls[0] || '';
      emitPhotoUpdate(nextMain, updatedGallery);

      setUploadSuccess(
        `${newUrls.length === 1 ? '1 foto agregada' : `${newUrls.length} fotos agregadas`} (${formatFileSizeKb(totalSizeBytes)}). Hacé clic en "Guardar" para confirmar.`
      );
    } catch (err: any) {
      console.error('Error uploading gallery photos:', err);
      setUploadError(err?.message || 'Error al subir fotos de galería.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleSetAsMain = (url: string) => {
    const nextGallery = effectiveSingleOnly
      ? []
      : gallery.includes(url)
      ? gallery
      : [url, ...gallery];
    emitPhotoUpdate(url, nextGallery);
    setPreviewError(false);
    setUploadError(null);
    setUploadSuccess('Foto seleccionada. Hacé clic en "Guardar" para aplicar el cambio.');
  };

  const handleRemoveMainPhoto = () => {
    if (effectiveSingleOnly) {
      emitPhotoUpdate('', []);
    } else {
      const remaining = gallery.filter((item) => item !== effectiveMainImage);
      emitPhotoUpdate(remaining[0] || '', remaining);
    }
    setUploadSuccess('Foto eliminada del borrador. Hacé clic en "Guardar" para confirmar.');
  };

  const handleRemoveGalleryPhoto = (url: string) => {
    const updated = gallery.filter((item) => item !== url);
    const nextMain = effectiveMainImage === url ? updated[0] || '' : effectiveMainImage;
    emitPhotoUpdate(nextMain, updated);
  };

  const handleAddManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) return;
    handleSetAsMain(url);
    setManualUrl('');
  };

  const handleAddManualGalleryUrl = () => {
    const url = manualGalleryUrl.trim();
    if (!url) return;
    const updatedGallery = gallery.includes(url) ? gallery : [...gallery, url];
    emitPhotoUpdate(effectiveMainImage || url, updatedGallery);
    setManualGalleryUrl('');
  };

  const municipalPresets = [
    { title: 'Casa Natal de Esquiú', url: '/images/casa-natal-esquiu.webp' },
    { title: 'Dique Las Pirquitas', url: '/images/dique-las-pirquitas.webp' },
    { title: 'Iglesia San José', url: '/images/iglesia-san-jose.webp' },
    { title: 'Monumento Beato Esquiú', url: '/images/monumento-beato-esquiu.webp' },
  ];

  const headerTitle =
    title ||
    (effectiveSingleOnly
      ? 'FOTOGRAFÍA DE PORTADA'
      : 'FOTO PRINCIPAL Y GALERÍA DEL ATRACTIVO');

  const headerHelp =
    helpText ||
    'Se optimiza automáticamente a formato liviano (WebP) para mantener la página rápida y guardarse permanentemente en el servidor.';

  return (
    <div className="space-y-4 bg-slate-100/90 p-4 rounded-2xl border-2 border-slate-300">
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div>
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
            <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{headerTitle}</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{headerHelp}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualUrlInput(!showManualUrlInput)}
          className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 underline flex items-center gap-1 shrink-0"
        >
          <Link2 className="w-3 h-3" />
          <span>{showManualUrlInput ? 'Ocultar URL' : 'Pegar URL'}</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Error al subir fotografía: {uploadError}</span>
        </div>
      )}

      {uploadSuccess && !uploadError && (
        <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Main Image Section */}
      <div>
        <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{effectiveSingleOnly ? 'IMAGEN ACTUAL' : 'FOTO PRINCIPAL'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Photo Preview */}
          <div className="md:col-span-1 flex flex-col">
            <div className="relative aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center group">
              {effectiveMainImage && !previewError ? (
                <>
                  <img
                    src={effectiveMainImage}
                    alt="Foto principal"
                    onError={() => setPreviewError(true)}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-emerald-950/90 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Cargada</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMainPhoto}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    title="Eliminar fotografía"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : effectiveMainImage && previewError ? (
                <div className="flex flex-col items-center justify-center p-3 text-center text-amber-300">
                  <AlertTriangle className="w-7 h-7 mb-1" />
                  <span className="text-[11px] font-bold">No se pudo previsualizar</span>
                  <span className="text-[9px] text-slate-400 break-all line-clamp-2 mt-0.5">
                    Subí nuevamente la foto desde tu dispositivo
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-300">Sin foto asignada</span>
                  <span className="text-[9px] text-slate-500">
                    Hacé clic en &quot;Subir fotografía&quot;
                  </span>
                </div>
              )}

              {isUploadingMain && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 p-2 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                  <span className="text-[11px] font-black">Optimizando y subiendo...</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Controls for Main Photo */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-2.5">
            <input
              type="file"
              ref={mainFileInputRef}
              onChange={handleMainFileSelect}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={isUploadingMain || isUploadingGallery}
                onClick={() => mainFileInputRef.current?.click()}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50"
              >
                {isUploadingMain ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizando y subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      {effectiveMainImage
                        ? 'Cambiar fotografía'
                        : 'Seleccionar archivo / Subir fotografía'}
                    </span>
                  </>
                )}
              </button>

              {effectiveMainImage && (
                <button
                  type="button"
                  disabled={isUploadingMain}
                  onClick={handleRemoveMainPhoto}
                  className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar foto</span>
                </button>
              )}
            </div>

            <div className="text-[10px] text-slate-600 font-medium">
              Acepta cualquier foto desde celular o PC (JPG, PNG, WEBP). Se comprime automáticamente a ~100-200 KB para no recargar el sitio.
            </div>

            {/* Quick Presets for Municipal Photos */}
            <div className="pt-1">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                O elegir del Archivo Municipal:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {municipalPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.url}
                    onClick={() => handleSetAsMain(preset.url)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      effectiveMainImage === preset.url
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📸 {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual URL input option */}
            {showManualUrlInput && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Pegar URL de foto principal:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://... o /uploads/..."
                    className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section (only for places / multi-image items) */}
      {!effectiveSingleOnly && (
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Galería de Fotos Adicionales ({gallery.length})
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                Podés subir múltiples fotos livianas para el carrusel de la ficha.
              </span>
            </div>

            <input
              type="file"
              ref={galleryFileInputRef}
              onChange={handleGalleryFilesSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploadingGallery || isUploadingMain}
              onClick={() => galleryFileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50 shrink-0"
            >
              {isUploadingGallery ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Optimizando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agregar fotos a galería</span>
                </>
              )}
            </button>
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
              {gallery.map((photoUrl, idx) => {
                const isMain = photoUrl === effectiveMainImage;
                return (
                  <div
                    key={`${photoUrl}-${idx}`}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                      isMain
                        ? 'border-emerald-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Galería ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {isMain && (
                      <span className="absolute top-1 left-1 bg-emerald-600 text-white p-0.5 rounded-md shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetAsMain(photoUrl)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                          title="Hacer foto principal"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPhoto(photoUrl)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                        title="Eliminar de la galería"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
              No hay fotos adicionales en la galería aún.
            </div>
          )}

          {showManualUrlInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={manualGalleryUrl}
                onChange={(e) => setManualGalleryUrl(e.target.value)}
                placeholder="Pegar URL para agregar a galería..."
                className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddManualGalleryUrl}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Agregar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
