import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Type,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Link,
  MapPin,
  Calendar,
  Headphones,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AdminPhotoUploader } from './AdminPhotoUploader';
import { CategoryItemConfig, QuickHeroBadge, ImperdibleCustomItem, ConocePillarConfig, QueHacerActivityPill, RecorridoEsquiuStopConfig } from '../types/siteConfig';

export const SectionEditorModal: React.FC = () => {
  const {
    sectionToEdit,
    setSectionToEdit,
    siteConfig,
    updateHeroConfig,
    updateCategoriesConfig,
    updateImperdiblesConfig,
    updateConoceFrayConfig,
    updateQueHacerConfig,
    updateRecorridoEsquiuConfig,
    updateEmblemaFeConfig,
    updateFooterConfig,
    places,
    events,
    audioguides,
    setIsCreatePlaceModalOpen,
  } = useData();

  const { isAuthenticated } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Local state clones for seamless editing
  const [heroForm, setHeroForm] = useState(() => ({ ...siteConfig.hero }));
  const [categoriesList, setCategoriesList] = useState<CategoryItemConfig[]>(() => [
    ...siteConfig.categories.items,
  ]);
  const [imperdiblesForm, setImperdiblesForm] = useState(() => ({ ...siteConfig.imperdibles }));
  const [conoceFrayForm, setConoceFrayForm] = useState(() => ({ ...siteConfig.conoceFray }));
  const [queHacerForm, setQueHacerForm] = useState(() => ({ ...siteConfig.queHacer }));
  const [recorridoForm, setRecorridoForm] = useState(() => ({ ...siteConfig.recorridoEsquiu }));
  const [emblemaForm, setEmblemaForm] = useState(() => ({ ...siteConfig.emblemaFe }));
  const [footerForm, setFooterForm] = useState(() => ({ ...siteConfig.footer }));

  // Keep synced if section changes
  React.useEffect(() => {
    if (sectionToEdit) {
      setHeroForm({ ...siteConfig.hero });
      setCategoriesList([...siteConfig.categories.items]);
      setImperdiblesForm({ ...siteConfig.imperdibles });
      setConoceFrayForm({ ...siteConfig.conoceFray });
      setQueHacerForm({ ...siteConfig.queHacer });
      setRecorridoForm({ ...siteConfig.recorridoEsquiu });
      setEmblemaForm({ ...siteConfig.emblemaFe });
      setFooterForm({ ...siteConfig.footer });
    }
  }, [sectionToEdit, siteConfig]);

  if (!isAuthenticated || !sectionToEdit) return null;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectionToEdit === 'hero') {
      updateHeroConfig(heroForm);
      showSuccess('¡Portada / Hero guardado con éxito!');
    } else if (sectionToEdit === 'categories') {
      updateCategoriesConfig({ items: categoriesList });
      showSuccess('¡Categorías y filtros actualizados!');
    } else if (sectionToEdit === 'imperdibles') {
      updateImperdiblesConfig(imperdiblesForm);
      showSuccess('¡Sección Imperdibles actualizada!');
    } else if (sectionToEdit === 'conoceFray') {
      updateConoceFrayConfig(conoceFrayForm);
      showSuccess('¡Sección Conocé Fray actualizada!');
    } else if (sectionToEdit === 'queHacer') {
      updateQueHacerConfig(queHacerForm);
      showSuccess('¡Sección Qué Hacer actualizada!');
    } else if (sectionToEdit === 'recorridoEsquiu') {
      updateRecorridoEsquiuConfig(recorridoForm);
      showSuccess('¡Recorrido del Beato Esquiú actualizado!');
    } else if (sectionToEdit === 'emblemaFe') {
      updateEmblemaFeConfig(emblemaForm);
      showSuccess('¡Emblema de Fe actualizado!');
    } else if (sectionToEdit === 'footer') {
      updateFooterConfig(footerForm);
      showSuccess('¡Footer institucional y contactos actualizados!');
    }
  };

  const getSectionName = () => {
    switch (sectionToEdit) {
      case 'hero':
        return 'Portada Principal / Hero';
      case 'categories':
        return 'Categorías y Filtros';
      case 'imperdibles':
        return 'Imperdibles de Fray (Atractivos Ícono)';
      case 'conoceFray':
        return 'Conocé Fray (Pilares e Identidad)';
      case 'queHacer':
        return 'Qué Hacer en Fray (Propuestas y Eventos)';
      case 'recorridoEsquiu':
        return 'Tras las Huellas del Beato (Circuito Histórico & de Fe)';
      case 'emblemaFe':
        return 'Emblema: Fray Tierra de Milagros';
      case 'footer':
        return 'Footer Institucional y Contactos';
      default:
        return 'Sección';
    }
  };

  return (
    <div
      id="section-editor-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={() => setSectionToEdit(null)}
    >
      <div
        id="section-editor-sheet"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
              ✏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.2 rounded-md">
                  MODO EDITOR
                </span>
                <h2 className="font-display font-black text-base sm:text-lg text-white">
                  {getSectionName()}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Modificá textos, fotografías, orden y botones en vivo
              </p>
            </div>
          </div>

          <button
            onClick={() => setSectionToEdit(null)}
            className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success alert */}
        {successMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* =================================================== */}
          {/* 1. HERO SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'hero' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    required
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tagline Superior
                  </label>
                  <input
                    type="text"
                    value={heroForm.tagline}
                    onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bajada / Subtítulo Descriptivo
                </label>
                <textarea
                  rows={2}
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge de Ubicación
                  </label>
                  <input
                    type="text"
                    value={heroForm.locationBadge}
                    onChange={(e) => setHeroForm({ ...heroForm, locationBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge de Temporada
                  </label>
                  <input
                    type="text"
                    value={heroForm.seasonBadge}
                    onChange={(e) => setHeroForm({ ...heroForm, seasonBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Placeholder del Buscador
                </label>
                <input
                  type="text"
                  value={heroForm.searchPlaceholder}
                  onChange={(e) => setHeroForm({ ...heroForm, searchPlaceholder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Hero Image Uploader */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-900">
                  Fotografía de Fondo de la Portada
                </label>
                <AdminPhotoUploader
                  currentImageUrl={heroForm.bgImage}
                  onPhotoUploaded={(newUrl) => setHeroForm({ ...heroForm, bgImage: newUrl })}
                  title="Cambiar Foto de Fondo de la Portada"
                  helpText="Subí una foto de alta calidad del Dique Las Pirquitas, las sierras o paisajes de Fray."
                />
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 2. CATEGORIES SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 font-medium">
                  Configurá el nombre, icono emoji y visibilidad de cada categoría turística:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const newCat: CategoryItemConfig = {
                      id: `cat-${Date.now()}`,
                      label: 'Nueva Categoría',
                      shortLabel: 'Categoría',
                      emoji: '✨',
                      iconName: 'Sparkles',
                      color: 'from-emerald-700 to-teal-800',
                      bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200',
                      description: 'Descripción de la nueva categoría',
                      isVisible: true,
                      sortOrder: categoriesList.length + 1,
                    };
                    setCategoriesList([...categoriesList, newCat]);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Categoría</span>
                </button>
              </div>

              <div className="space-y-3">
                {categoriesList.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={cat.emoji}
                        onChange={(e) => {
                          const updated = [...categoriesList];
                          updated[idx].emoji = e.target.value;
                          setCategoriesList(updated);
                        }}
                        className="w-10 h-10 text-center text-lg bg-white border border-slate-300 rounded-xl"
                        title="Emoji representativo"
                      />

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={cat.label}
                          onChange={(e) => {
                            const updated = [...categoriesList];
                            updated[idx].label = e.target.value;
                            setCategoriesList(updated);
                          }}
                          className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg"
                          placeholder="Nombre de la categoría"
                        />
                        <input
                          type="text"
                          value={cat.description}
                          onChange={(e) => {
                            const updated = [...categoriesList];
                            updated[idx].description = e.target.value;
                            setCategoriesList(updated);
                          }}
                          className="w-full px-2.5 py-1 text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg"
                          placeholder="Descripción corta"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {/* Order shift */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return;
                          const updated = [...categoriesList];
                          const temp = updated[idx - 1];
                          updated[idx - 1] = updated[idx];
                          updated[idx] = temp;
                          setCategoriesList(updated);
                        }}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === categoriesList.length - 1}
                        onClick={() => {
                          if (idx === categoriesList.length - 1) return;
                          const updated = [...categoriesList];
                          const temp = updated[idx + 1];
                          updated[idx + 1] = updated[idx];
                          updated[idx] = temp;
                          setCategoriesList(updated);
                        }}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Visibility */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...categoriesList];
                          updated[idx].isVisible = !updated[idx].isVisible;
                          setCategoriesList(updated);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                          cat.isVisible
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                        title={cat.isVisible ? 'Visible para turistas' : 'Oculto'}
                      >
                        {cat.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 3. IMPERDIBLES SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'imperdibles' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={imperdiblesForm.title}
                    onChange={(e) => setImperdiblesForm({ ...imperdiblesForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge Superior
                  </label>
                  <input
                    type="text"
                    value={imperdiblesForm.badge}
                    onChange={(e) => setImperdiblesForm({ ...imperdiblesForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtítulo Descriptivo
                </label>
                <input
                  type="text"
                  value={imperdiblesForm.subtitle}
                  onChange={(e) => setImperdiblesForm({ ...imperdiblesForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Tarjetas Destacadas ({imperdiblesForm.items.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const availablePlace = places.find(
                        (p) => !imperdiblesForm.items.some((item) => item.placeId === p.id)
                      ) || places[0];
                      if (!availablePlace) return;

                      const newItem: ImperdibleCustomItem = {
                        placeId: availablePlace.id,
                        customTitle: availablePlace.name,
                        customTagline: availablePlace.shortDescription,
                        customImage: availablePlace.image,
                        customBadge: 'Imperdible de Fray',
                        customBadgeColor: 'bg-emerald-600 text-white',
                        customHighlight: availablePlace.description,
                        customPhotoNote: `Fotografía oficial · ${availablePlace.name}`,
                        isVisible: true,
                      };
                      setImperdiblesForm({
                        ...imperdiblesForm,
                        items: [...imperdiblesForm.items, newItem],
                      });
                    }}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Tarjeta Imperdible</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {imperdiblesForm.items.map((item, idx) => {
                    const place = places.find((p) => p.id === item.placeId);
                    return (
                      <div
                        key={`${item.placeId}-${idx}`}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <select
                              value={item.placeId}
                              onChange={(e) => {
                                const newPlaceId = e.target.value;
                                const targetPlace = places.find((p) => p.id === newPlaceId);
                                const updatedItems = [...imperdiblesForm.items];
                                updatedItems[idx] = {
                                  ...updatedItems[idx],
                                  placeId: newPlaceId,
                                  customTitle: targetPlace?.name || updatedItems[idx].customTitle,
                                  customImage: targetPlace?.image || updatedItems[idx].customImage,
                                };
                                setImperdiblesForm({ ...imperdiblesForm, items: updatedItems });
                              }}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            >
                              {places.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.locality})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const updated = [...imperdiblesForm.items];
                                const temp = updated[idx - 1];
                                updated[idx - 1] = updated[idx];
                                updated[idx] = temp;
                                setImperdiblesForm({ ...imperdiblesForm, items: updated });
                              }}
                              className="p-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === imperdiblesForm.items.length - 1}
                              onClick={() => {
                                if (idx === imperdiblesForm.items.length - 1) return;
                                const updated = [...imperdiblesForm.items];
                                const temp = updated[idx + 1];
                                updated[idx + 1] = updated[idx];
                                updated[idx] = temp;
                                setImperdiblesForm({ ...imperdiblesForm, items: updated });
                              }}
                              className="p-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = imperdiblesForm.items.filter((_, i) => i !== idx);
                                setImperdiblesForm({ ...imperdiblesForm, items: updated });
                              }}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg border border-rose-200"
                              title="Eliminar de imperdibles"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                              Título Personalizado
                            </label>
                            <input
                              type="text"
                              value={item.customTitle || ''}
                              onChange={(e) => {
                                const updated = [...imperdiblesForm.items];
                                updated[idx].customTitle = e.target.value;
                                setImperdiblesForm({ ...imperdiblesForm, items: updated });
                              }}
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                              Badge de la Tarjeta
                            </label>
                            <input
                              type="text"
                              value={item.customBadge || ''}
                              onChange={(e) => {
                                const updated = [...imperdiblesForm.items];
                                updated[idx].customBadge = e.target.value;
                                setImperdiblesForm({ ...imperdiblesForm, items: updated });
                              }}
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Image Uploader for this imperdible */}
                        <div>
                          <AdminPhotoUploader
                            currentImageUrl={item.customImage || place?.image || ''}
                            onPhotoUploaded={(newUrl) => {
                              const updated = [...imperdiblesForm.items];
                              updated[idx].customImage = newUrl;
                              setImperdiblesForm({ ...imperdiblesForm, items: updated });
                            }}
                            title={`Foto para ${item.customTitle || 'Imperdible'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 4. CONOCE FRAY SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'conoceFray' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={conoceFrayForm.title}
                    onChange={(e) => setConoceFrayForm({ ...conoceFrayForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge de Identidad
                  </label>
                  <input
                    type="text"
                    value={conoceFrayForm.badge}
                    onChange={(e) => setConoceFrayForm({ ...conoceFrayForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtítulo / Bajada
                </label>
                <textarea
                  rows={2}
                  value={conoceFrayForm.subtitle}
                  onChange={(e) => setConoceFrayForm({ ...conoceFrayForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-900">
                  Pilares de Identidad Territorial
                </h4>
                {conoceFrayForm.pillars.map((pillar, pIdx) => (
                  <div key={pillar.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const updated = [...conoceFrayForm.pillars];
                          updated[pIdx].title = e.target.value;
                          setConoceFrayForm({ ...conoceFrayForm, pillars: updated });
                        }}
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                        placeholder="Título del Pilar"
                      />
                      <input
                        type="text"
                        value={pillar.subtitle}
                        onChange={(e) => {
                          const updated = [...conoceFrayForm.pillars];
                          updated[pIdx].subtitle = e.target.value;
                          setConoceFrayForm({ ...conoceFrayForm, pillars: updated });
                        }}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                        placeholder="Subtítulo"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={pillar.phrase}
                      onChange={(e) => {
                        const updated = [...conoceFrayForm.pillars];
                        updated[pIdx].phrase = e.target.value;
                        setConoceFrayForm({ ...conoceFrayForm, pillars: updated });
                      }}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                      placeholder="Frase descriptiva del pilar"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 5. QUE HACER SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'queHacer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={queHacerForm.title}
                    onChange={(e) => setQueHacerForm({ ...queHacerForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge Superior
                  </label>
                  <input
                    type="text"
                    value={queHacerForm.badge}
                    onChange={(e) => setQueHacerForm({ ...queHacerForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={queHacerForm.subtitle}
                  onChange={(e) => setQueHacerForm({ ...queHacerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Activity Pills List */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-900">
                    Atajos Rápidos de Actividades ({queHacerForm.activityPills.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newPill: QueHacerActivityPill = {
                        id: `pill-${Date.now()}`,
                        label: 'Nueva Actividad',
                        emoji: '✨',
                        targetCategory: 'actividades',
                      };
                      setQueHacerForm({
                        ...queHacerForm,
                        activityPills: [...queHacerForm.activityPills, newPill],
                      });
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    + Agregar Atajo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {queHacerForm.activityPills.map((pill, idx) => (
                    <div key={pill.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                      <input
                        type="text"
                        value={pill.emoji}
                        onChange={(e) => {
                          const updated = [...queHacerForm.activityPills];
                          updated[idx].emoji = e.target.value;
                          setQueHacerForm({ ...queHacerForm, activityPills: updated });
                        }}
                        className="w-8 h-8 text-center bg-white border border-slate-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={pill.label}
                        onChange={(e) => {
                          const updated = [...queHacerForm.activityPills];
                          updated[idx].label = e.target.value;
                          setQueHacerForm({ ...queHacerForm, activityPills: updated });
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = queHacerForm.activityPills.filter((_, i) => i !== idx);
                          setQueHacerForm({ ...queHacerForm, activityPills: updated });
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 6. RECORRIDO ESQUIU SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'recorridoEsquiu' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={recorridoForm.title}
                    onChange={(e) => setRecorridoForm({ ...recorridoForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Badge de Circuito
                  </label>
                  <input
                    type="text"
                    value={recorridoForm.badge}
                    onChange={(e) => setRecorridoForm({ ...recorridoForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto Narrativo / Introductorio
                </label>
                <textarea
                  rows={2}
                  value={recorridoForm.introDescription}
                  onChange={(e) => setRecorridoForm({ ...recorridoForm, introDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Stops management */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-900">
                  Paradas del Circuito
                </h4>
                {recorridoForm.stops.map((stop, sIdx) => {
                  const place = places.find((p) => p.id === stop.placeId);
                  return (
                    <div key={stop.placeId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          Parada #{sIdx + 1}: {place?.name || stop.placeId}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={stop.tip}
                        onChange={(e) => {
                          const updated = [...recorridoForm.stops];
                          updated[sIdx].tip = e.target.value;
                          setRecorridoForm({ ...recorridoForm, stops: updated });
                        }}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                        placeholder="Consejo o recomendación de la parada"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 7. FOOTER INSTITUCIONAL */}
          {/* =================================================== */}
          {sectionToEdit === 'footer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título Municipal
                  </label>
                  <input
                    type="text"
                    value={footerForm.municipalTitle}
                    onChange={(e) => setFooterForm({ ...footerForm, municipalTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Secretaría / Área
                  </label>
                  <input
                    type="text"
                    value={footerForm.secretaria}
                    onChange={(e) => setFooterForm({ ...footerForm, secretaria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={footerForm.phone}
                    onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Oficial
                  </label>
                  <input
                    type="text"
                    value={footerForm.whatsapp}
                    onChange={(e) => setFooterForm({ ...footerForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email de Turismo
                  </label>
                  <input
                    type="email"
                    value={footerForm.email}
                    onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Listado de Localidades
                </label>
                <input
                  type="text"
                  value={footerForm.localitiesText}
                  onChange={(e) => setFooterForm({ ...footerForm, localitiesText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 8. EMBLEMA FE */}
          {/* =================================================== */}
          {sectionToEdit === 'emblemaFe' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Emblema
                </label>
                <input
                  type="text"
                  value={emblemaForm.title}
                  onChange={(e) => setEmblemaForm({ ...emblemaForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto Descriptivo
                </label>
                <textarea
                  rows={3}
                  value={emblemaForm.bodyText}
                  onChange={(e) => setEmblemaForm({ ...emblemaForm, bodyText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSectionToEdit(null)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios de la Sección</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
