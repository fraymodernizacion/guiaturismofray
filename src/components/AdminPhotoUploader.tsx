import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Loader2,
  Plus,
  Star,
  Link2,
  FolderOpen,
} from 'lucide-react';

interface AdminPhotoUploaderProps {
  mainImage: string;
  gallery: string[];
  onMainImageChange: (url: string) => void;
  onGalleryChange: (gallery: string[]) => void;
  placeName?: string;
}

export const AdminPhotoUploader: React.FC<AdminPhotoUploaderProps> = ({
  mainImage,
  gallery = [],
  onMainImageChange,
  onGalleryChange,
  placeName = 'lugar',
}) => {
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualGalleryUrl, setManualGalleryUrl] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to upload a single File object to the persistent server endpoint
  const uploadFileToServer = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const cleanPlaceName = placeName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .slice(0, 30);
          const extension = file.name.split('.').pop() || 'jpg';
          const filename = `${cleanPlaceName}_${Date.now()}.${extension}`;

          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename,
              dataUrl,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Error al subir la imagen al servidor');
          }

          const data = await res.json();
          if (data.url) {
            resolve(data.url);
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo en el navegador'));
      reader.readAsDataURL(file);
    });
  };

  // Handle Main Photo Upload
  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploadingMain(true);
    setUploadError(null);

    try {
      const permanentUrl = await uploadFileToServer(file);
      onMainImageChange(permanentUrl);

      // Also ensure this image is in gallery
      if (!gallery.includes(permanentUrl)) {
        onGalleryChange([permanentUrl, ...gallery]);
      }
    } catch (err: any) {
      console.error('Error uploading main photo:', err);
      setUploadError(err.message || 'Error al subir la fotografía.');
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

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const permanentUrl = await uploadFileToServer(file);
        newUrls.push(permanentUrl);
      }

      const updatedGallery = Array.from(new Set([...gallery, ...newUrls]));
      onGalleryChange(updatedGallery);

      // If main image was empty, set first uploaded image as main
      if (!mainImage && newUrls.length > 0) {
        onMainImageChange(newUrls[0]);
      }
    } catch (err: any) {
      console.error('Error uploading gallery photos:', err);
      setUploadError(err.message || 'Error al subir fotos de galería.');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  // Set specific gallery image as main
  const handleSetAsMain = (url: string) => {
    onMainImageChange(url);
    if (!gallery.includes(url)) {
      onGalleryChange([url, ...gallery]);
    }
  };

  // Remove photo from gallery
  const handleRemoveGalleryPhoto = (url: string) => {
    const updated = gallery.filter((item) => item !== url);
    onGalleryChange(updated);
    if (mainImage === url) {
      onMainImageChange(updated[0] || '');
    }
  };

  // Add manual URL
  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    onMainImageChange(manualUrl.trim());
    if (!gallery.includes(manualUrl.trim())) {
      onGalleryChange([manualUrl.trim(), ...gallery]);
    }
    setManualUrl('');
  };

  const handleAddManualGalleryUrl = () => {
    if (!manualGalleryUrl.trim()) return;
    const url = manualGalleryUrl.trim();
    if (!gallery.includes(url)) {
      onGalleryChange([...gallery, url]);
    }
    setManualGalleryUrl('');
  };

  // Municipal photo repository presets for quick selection
  const municipalPresets = [
    {
      title: 'Casa Natal de Esquiú (Templete)',
      url: '/images/casa-natal-esquiu.webp',
    },
    {
      title: 'Dique Las Pirquitas (Principal)',
      url: '/images/dique-las-pirquitas.webp',
    },
    {
      title: 'Iglesia San José de Piedra Blanca',
      url: '/images/iglesia-san-jose.webp',
    },
    {
      title: 'Monumento Beato Esquiú (Mirador)',
      url: '/images/monumento-beato-esquiu.webp',
    },
  ];

  return (
    <div className="space-y-4 bg-slate-100/90 p-4 rounded-2xl border-2 border-slate-300">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div>
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>FOTO PRINCIPAL Y GALERÍA DEL ATRACTIVO</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
            Cargá fotografías directamente desde tu computadora (JPG, PNG, WEBP). Se guardan de forma permanente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualUrlInput(!showManualUrlInput)}
          className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 underline flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          <span>{showManualUrlInput ? 'Ocultar URL' : 'O pegar URL'}</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-black rounded-xl flex items-center gap-2">
          <span>⚠️ Error al subir fotografía: {uploadError}</span>
        </div>
      )}

      {/* Main Image Section */}
      <div>
        <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>FOTO PRINCIPAL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Photo Preview */}
          <div className="md:col-span-1 flex flex-col">
            <div className="relative aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center group">
              {mainImage ? (
                <>
                  <img
                    src={mainImage}
                    alt="Foto principal"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-emerald-950/90 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Foto Principal Actual</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onMainImageChange('')}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    title="Eliminar fotografía"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-300">Sin foto asignada</span>
                  <span className="text-[9px] text-slate-500">Hacé clic en &quot;Seleccionar archivo&quot;</span>
                </div>
              )}

              {isUploadingMain && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                  <span className="text-[11px] font-black">Subiendo al servidor...</span>
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
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={isUploadingMain}
                onClick={() => mainFileInputRef.current?.click()}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50"
              >
                {isUploadingMain ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo fotografía...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{mainImage ? 'Cambiar fotografía' : 'Seleccionar archivo / Subir fotografía'}</span>
                  </>
                )}
              </button>

              {mainImage && (
                <button
                  type="button"
                  onClick={() => onMainImageChange('')}
                  className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar fotografía</span>
                </button>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-medium">
              Formatos admitidos: <strong>JPG, PNG, WEBP</strong>. La imagen se guarda permanentemente en la ficha.
            </div>

            {/* Quick Presets for Municipal Photos */}
            <div className="pt-1">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                O elegir foto precargada del Archivo Municipal:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {municipalPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.url}
                    onClick={() => handleSetAsMain(preset.url)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      mainImage === preset.url
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
                    type="url"
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

      {/* Gallery Section */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Galería de Fotos Adicionales ({gallery.length})
            </label>
            <span className="text-[10px] text-slate-500 font-medium">
              Podés subir múltiples fotos para el carrusel de la ficha.
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
            disabled={isUploadingGallery}
            onClick={() => galleryFileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50"
          >
            {isUploadingGallery ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Subiendo galería...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agregar fotos a galería</span>
              </>
            )}
          </button>
        </div>

        {/* Gallery Thumbnails Grid */}
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
            {gallery.map((photoUrl, idx) => {
              const isMain = photoUrl === mainImage;
              return (
                <div
                  key={`${photoUrl}-${idx}`}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                    isMain ? 'border-emerald-500 shadow-xs' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={photoUrl}
                    alt={`Galería ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badges and actions */}
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

        {/* Manual Gallery URL addition if toggled */}
        {showManualUrlInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="url"
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
    </div>
  );
};
