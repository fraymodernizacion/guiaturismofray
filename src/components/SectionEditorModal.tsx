import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AdminPhotoUploader } from './AdminPhotoUploader';
import {
  CategoryItemConfig,
  ImperdibleCustomItem,
  QueHacerActivityPill,
  RecorridoEsquiuStopConfig,
  TourismOfficesSectionConfig,
} from '../types/siteConfig';
import { TOURISM_OFFICES, TOURISM_OFFICES_META } from '../data/tourismOfficesData';

const SECTION_TABS = [
  { id: 'hero', label: 'Portada' },
  { id: 'tourismOffices', label: 'Oficinas' },
  { id: 'categories', label: 'Categorías' },
  { id: 'imperdibles', label: 'Imperdibles' },
  { id: 'recorridoEsquiu', label: 'Recorrido Esquiú' },
  { id: 'conoceFray', label: 'Conocé Fray' },
  { id: 'queHacer', label: 'Qué Hacer' },
  { id: 'emblemaFe', label: 'Emblema Fe' },
  { id: 'footer', label: 'Footer' },
];

export const SectionEditorModal: React.FC = () => {
  const {
    sectionToEdit,
    setSectionToEdit,
    siteConfig,
    updateHeroConfig,
    updateTourismOfficesConfig,
    updateCategoriesConfig,
    updateImperdiblesConfig,
    updateConoceFrayConfig,
    updateQueHacerConfig,
    updateRecorridoEsquiuConfig,
    updateEmblemaFeConfig,
    updateFooterConfig,
    places,
  } = useData();

  const { isAuthenticated } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  const buildDefaultOfficesForm = (): TourismOfficesSectionConfig => ({
    title: siteConfig.tourismOffices?.title || TOURISM_OFFICES_META.categoria,
    sharedPhone: siteConfig.tourismOffices?.sharedPhone || TOURISM_OFFICES_META.telefono_compartido,
    offices: (siteConfig.tourismOffices?.offices || TOURISM_OFFICES).map((o) => ({
      ...o,
      horarios: o.horarios.map((h) => ({
        ...h,
        tramos: h.tramos ? h.tramos.map((t) => ({ ...t })) : undefined,
      })),
    })),
  });

  // Local state clones for seamless editing
  const [heroForm, setHeroForm] = useState(() => ({ ...siteConfig.hero }));
  const [officesForm, setOfficesForm] = useState<TourismOfficesSectionConfig>(() =>
    buildDefaultOfficesForm()
  );
  const [categoriesTitle, setCategoriesTitle] = useState(
    () => siteConfig.categories.title || 'Categorías de Fray'
  );
  const [categoriesList, setCategoriesList] = useState<CategoryItemConfig[]>(() =>
    siteConfig.categories.items.map((c) => ({ ...c }))
  );
  const [imperdiblesForm, setImperdiblesForm] = useState(() => ({
    ...siteConfig.imperdibles,
    items: siteConfig.imperdibles.items.map((i) => ({ ...i })),
  }));
  const [conoceFrayForm, setConoceFrayForm] = useState(() => ({
    ...siteConfig.conoceFray,
    pillars: siteConfig.conoceFray.pillars.map((p) => ({ ...p })),
  }));
  const [queHacerForm, setQueHacerForm] = useState(() => ({
    ...siteConfig.queHacer,
    activityPills: siteConfig.queHacer.activityPills.map((p) => ({ ...p })),
  }));
  const [recorridoForm, setRecorridoForm] = useState(() => ({
    ...siteConfig.recorridoEsquiu,
    stops: siteConfig.recorridoEsquiu.stops.map((s) => ({ ...s })),
  }));
  const [emblemaForm, setEmblemaForm] = useState(() => ({ ...siteConfig.emblemaFe }));
  const [footerForm, setFooterForm] = useState(() => ({ ...siteConfig.footer }));

  // Sync local draft ONLY when switching to a new section (never overwrite active user typing)
  useEffect(() => {
    if (!sectionToEdit) return;
    setSuccessMsg('');
    setErrorMsg('');
    setIsUploadingPhoto(false);

    setHeroForm({ ...siteConfig.hero });
    setOfficesForm(buildDefaultOfficesForm());
    setCategoriesTitle(siteConfig.categories.title || 'Categorías de Fray');
    setCategoriesList(siteConfig.categories.items.map((c) => ({ ...c })));
    setImperdiblesForm({
      ...siteConfig.imperdibles,
      items: siteConfig.imperdibles.items.map((i) => ({ ...i })),
    });
    setConoceFrayForm({
      ...siteConfig.conoceFray,
      pillars: siteConfig.conoceFray.pillars.map((p) => ({ ...p })),
    });
    setQueHacerForm({
      ...siteConfig.queHacer,
      activityPills: siteConfig.queHacer.activityPills.map((p) => ({ ...p })),
    });
    setRecorridoForm({
      ...siteConfig.recorridoEsquiu,
      stops: siteConfig.recorridoEsquiu.stops.map((s) => ({ ...s })),
    });
    setEmblemaForm({ ...siteConfig.emblemaFe });
    setFooterForm({ ...siteConfig.footer });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionToEdit]);

  if (!isAuthenticated || !sectionToEdit) return null;

  const showSuccess = (msg: string) => {
    setErrorMsg('');
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingPhoto) {
      setErrorMsg('Esperá a que termine de subir la fotografía antes de guardar.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      let ok = false;
      let label = 'Sección';

      if (sectionToEdit === 'hero') {
        ok = await updateHeroConfig(heroForm);
        label = 'Portada / Hero';
      } else if (sectionToEdit === 'tourismOffices') {
        ok = await updateTourismOfficesConfig(officesForm);
        label = 'Oficinas de Turismo';
      } else if (sectionToEdit === 'categories') {
        const ordered = categoriesList.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
        ok = await updateCategoriesConfig({ title: categoriesTitle, items: ordered });
        label = 'Categorías';
      } else if (sectionToEdit === 'imperdibles') {
        ok = await updateImperdiblesConfig(imperdiblesForm);
        label = 'Imperdibles de Fray';
      } else if (sectionToEdit === 'conoceFray') {
        ok = await updateConoceFrayConfig(conoceFrayForm);
        label = 'Conocé Fray';
      } else if (sectionToEdit === 'queHacer') {
        ok = await updateQueHacerConfig(queHacerForm);
        label = 'Qué Hacer en Fray';
      } else if (sectionToEdit === 'recorridoEsquiu') {
        const orderedStops = recorridoForm.stops.map((s, idx) => ({ ...s, order: idx + 1 }));
        ok = await updateRecorridoEsquiuConfig({ ...recorridoForm, stops: orderedStops });
        label = 'Recorrido del Beato Esquiú';
      } else if (sectionToEdit === 'emblemaFe') {
        ok = await updateEmblemaFeConfig(emblemaForm);
        label = 'Emblema de Fe';
      } else if (sectionToEdit === 'footer') {
        ok = await updateFooterConfig(footerForm);
        label = 'Footer Institucional';
      }

      if (!ok) {
        setErrorMsg(
          'No se pudo confirmar el guardado en el servidor. Verificá la conexión e intentá nuevamente.'
        );
      } else {
        showSuccess(`✓ ${label} guardado permanentemente en el servidor.`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error al guardar la sección.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionName = () => {
    switch (sectionToEdit) {
      case 'hero':
        return 'Portada Principal / Hero';
      case 'tourismOffices':
        return 'Oficinas de Turismo';
      case 'categories':
        return 'Categorías y Filtros';
      case 'imperdibles':
        return 'Imperdibles de Fray (Atractivos Ícono)';
      case 'conoceFray':
        return 'Conocé Fray (Pilares e Identidad)';
      case 'queHacer':
        return 'Qué Hacer en Fray (Propuestas y Actividades)';
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
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={() => !isSaving && setSectionToEdit(null)}
    >
      <div
        id="section-editor-sheet"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              ✏️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md shrink-0">
                  MODO EDITOR
                </span>
                <h2 className="font-display font-black text-base sm:text-lg text-white truncate">
                  {getSectionName()}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Editá cualquier sección y hacé clic en Guardar para persistir los cambios
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !isSaving && setSectionToEdit(null)}
            className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Section Switcher Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SECTION_TABS.map((tab) => {
            const active = sectionToEdit === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSectionToEdit(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Success / Error alerts */}
        {successMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-600 text-white px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{errorMsg}</span>
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
                    onChange={(e) => setHeroForm((prev) => ({ ...prev, title: e.target.value }))}
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
                    onChange={(e) => setHeroForm((prev) => ({ ...prev, tagline: e.target.value }))}
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
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, subtitle: e.target.value }))}
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
                    onChange={(e) =>
                      setHeroForm((prev) => ({ ...prev, locationBadge: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Placeholder del Buscador
                  </label>
                  <input
                    type="text"
                    value={heroForm.searchPlaceholder}
                    onChange={(e) =>
                      setHeroForm((prev) => ({ ...prev, searchPlaceholder: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Hero Image Uploader (Fixed props!) */}
              <AdminPhotoUploader
                mainImage={heroForm.bgImage || ''}
                singleImageOnly
                onMainImageChange={(newUrl) =>
                  setHeroForm((prev) => ({ ...prev, bgImage: newUrl }))
                }
                onUploadingChange={setIsUploadingPhoto}
                placeName="portada_hero"
                title="Fotografía de Fondo de la Portada"
                helpText="Subí una foto del Dique Las Pirquitas, las sierras o paisajes de Fray. Se optimiza automáticamente."
              />
            </div>
          )}

          {/* =================================================== */}
          {/* 1B. TOURISM OFFICES SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'tourismOffices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={officesForm.title}
                    onChange={(e) =>
                      setOfficesForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Compartido (encabezado)
                  </label>
                  <input
                    type="text"
                    value={officesForm.sharedPhone}
                    onChange={(e) =>
                      setOfficesForm((prev) => ({ ...prev, sharedPhone: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Oficinas de Atención ({officesForm.offices.length})
                </h3>

                {officesForm.offices.map((office, oIdx) => (
                  <div
                    key={office.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800">
                        Oficina #{oIdx + 1}: {office.nombre_boton}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Texto del botón
                        </label>
                        <input
                          type="text"
                          value={office.nombre_boton}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = { ...next[oIdx], nombre_boton: e.target.value };
                              return { ...prev, offices: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Referencia corta
                        </label>
                        <input
                          type="text"
                          value={office.referencia_corta}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = { ...next[oIdx], referencia_corta: e.target.value };
                              return { ...prev, offices: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Nombre completo en ficha
                        </label>
                        <input
                          type="text"
                          value={office.nombre}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = { ...next[oIdx], nombre: e.target.value };
                              return { ...prev, offices: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Ubicación / Dirección
                        </label>
                        <input
                          type="text"
                          value={office.ubicacion}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = { ...next[oIdx], ubicacion: e.target.value };
                              return { ...prev, offices: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={office.telefono}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = { ...next[oIdx], telefono: e.target.value };
                              return { ...prev, offices: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Enlace WhatsApp
                        </label>
                        <input
                          type="text"
                          value={office.whatsapp_url}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = { ...next[oIdx], whatsapp_url: e.target.value };
                              return { ...prev, offices: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Enlace Google Maps (opcional)
                        </label>
                        <input
                          type="text"
                          value={office.google_maps_url || ''}
                          onChange={(e) =>
                            setOfficesForm((prev) => {
                              const next = [...prev.offices];
                              next[oIdx] = {
                                ...next[oIdx],
                                google_maps_url: e.target.value.trim() || null,
                              };
                              return { ...prev, offices: next };
                            })
                          }
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Schedules */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      <span className="block text-[11px] font-bold text-slate-600">
                        Horarios de atención
                      </span>
                      {office.horarios.map((h, hIdx) => (
                        <div key={hIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={h.dias}
                            onChange={(e) =>
                              setOfficesForm((prev) => {
                                const next = [...prev.offices];
                                const horarios = [...next[oIdx].horarios];
                                horarios[hIdx] = { ...horarios[hIdx], dias: e.target.value };
                                next[oIdx] = { ...next[oIdx], horarios };
                                return { ...prev, offices: next };
                              })
                            }
                            placeholder="Días"
                            className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                          />
                          {h.tramos && h.tramos.length > 0 ? (
                            <div className="sm:col-span-2 grid grid-cols-2 gap-1.5">
                              {h.tramos.map((t, tIdx) => (
                                <div key={tIdx} className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={t.desde}
                                    onChange={(e) =>
                                      setOfficesForm((prev) => {
                                        const next = [...prev.offices];
                                        const horarios = [...next[oIdx].horarios];
                                        const tramos = [...(horarios[hIdx].tramos || [])];
                                        tramos[tIdx] = { ...tramos[tIdx], desde: e.target.value };
                                        horarios[hIdx] = { ...horarios[hIdx], tramos };
                                        next[oIdx] = { ...next[oIdx], horarios };
                                        return { ...prev, offices: next };
                                      })
                                    }
                                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                    placeholder="Desde"
                                  />
                                  <span className="text-[10px] text-slate-400">a</span>
                                  <input
                                    type="text"
                                    value={t.hasta}
                                    onChange={(e) =>
                                      setOfficesForm((prev) => {
                                        const next = [...prev.offices];
                                        const horarios = [...next[oIdx].horarios];
                                        const tramos = [...(horarios[hIdx].tramos || [])];
                                        tramos[tIdx] = { ...tramos[tIdx], hasta: e.target.value };
                                        horarios[hIdx] = { ...horarios[hIdx], tramos };
                                        next[oIdx] = { ...next[oIdx], horarios };
                                        return { ...prev, offices: next };
                                      })
                                    }
                                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                    placeholder="Hasta"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="sm:col-span-2 flex items-center gap-2">
                              <input
                                type="text"
                                value={h.desde || ''}
                                onChange={(e) =>
                                  setOfficesForm((prev) => {
                                    const next = [...prev.offices];
                                    const horarios = [...next[oIdx].horarios];
                                    horarios[hIdx] = { ...horarios[hIdx], desde: e.target.value };
                                    next[oIdx] = { ...next[oIdx], horarios };
                                    return { ...prev, offices: next };
                                  })
                                }
                                className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                placeholder="Desde (ej. 09:00)"
                              />
                              <span className="text-xs text-slate-400">a</span>
                              <input
                                type="text"
                                value={h.hasta || ''}
                                onChange={(e) =>
                                  setOfficesForm((prev) => {
                                    const next = [...prev.offices];
                                    const horarios = [...next[oIdx].horarios];
                                    horarios[hIdx] = { ...horarios[hIdx], hasta: e.target.value };
                                    next[oIdx] = { ...next[oIdx], horarios };
                                    return { ...prev, offices: next };
                                  })
                                }
                                className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                                placeholder="Hasta (ej. 19:00)"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* 2. CATEGORIES SECTION */}
          {/* =================================================== */}
          {sectionToEdit === 'categories' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título de la Sección
                </label>
                <input
                  type="text"
                  value={categoriesTitle}
                  onChange={(e) => setCategoriesTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600 font-medium">
                  Configurá el nombre, texto corto, emoji, orden y visibilidad de cada categoría:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const newCat: CategoryItemConfig = {
                      id: `cat-${Date.now()}`,
                      label: 'Nueva Categoría',
                      shortLabel: 'Ver más',
                      emoji: '✨',
                      iconName: 'Compass',
                      color: 'from-emerald-700 to-teal-800',
                      bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200',
                      description: 'Descripción de la nueva categoría',
                      isVisible: true,
                      sortOrder: categoriesList.length + 1,
                    };
                    setCategoriesList((prev) => [...prev, newCat]);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              <div className="space-y-3">
                {categoriesList.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full">
                      <input
                        type="text"
                        value={cat.emoji}
                        onChange={(e) =>
                          setCategoriesList((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, emoji: e.target.value } : c))
                          )
                        }
                        className="w-10 h-10 text-center text-lg bg-white border border-slate-300 rounded-xl shrink-0"
                        title="Emoji representativo"
                      />

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={cat.label}
                          onChange={(e) =>
                            setCategoriesList((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, label: e.target.value } : c))
                            )
                          }
                          className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg"
                          placeholder="Nombre principal"
                        />
                        <input
                          type="text"
                          value={cat.shortLabel}
                          onChange={(e) =>
                            setCategoriesList((prev) =>
                              prev.map((c, i) =>
                                i === idx ? { ...c, shortLabel: e.target.value } : c
                              )
                            )
                          }
                          className="w-full px-2.5 py-1 text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg"
                          placeholder="Subtítulo corto"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          setCategoriesList((prev) => {
                            if (idx === 0) return prev;
                            const next = [...prev];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            return next;
                          })
                        }
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === categoriesList.length - 1}
                        onClick={() =>
                          setCategoriesList((prev) => {
                            if (idx === prev.length - 1) return prev;
                            const next = [...prev];
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            return next;
                          })
                        }
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCategoriesList((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, isVisible: !c.isVisible } : c))
                          )
                        }
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 ${
                          cat.isVisible
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                        title={cat.isVisible ? 'Visible para turistas' : 'Oculto'}
                      >
                        {cat.isVisible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span>{cat.isVisible ? 'Visible' : 'Oculta'}</span>
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
                    onChange={(e) =>
                      setImperdiblesForm((prev) => ({ ...prev, title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setImperdiblesForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
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
                  onChange={(e) =>
                    setImperdiblesForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
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
                      const availablePlace =
                        places.find(
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
                      setImperdiblesForm((prev) => ({
                        ...prev,
                        items: [...prev.items, newItem],
                      }));
                    }}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Tarjeta</span>
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
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <select
                              value={item.placeId}
                              onChange={(e) => {
                                const newPlaceId = e.target.value;
                                const targetPlace = places.find((p) => p.id === newPlaceId);
                                setImperdiblesForm((prev) => {
                                  const next = [...prev.items];
                                  next[idx] = {
                                    ...next[idx],
                                    placeId: newPlaceId,
                                    customTitle: targetPlace?.name || next[idx].customTitle,
                                    customImage: targetPlace?.image || next[idx].customImage,
                                  };
                                  return { ...prev, items: next };
                                });
                              }}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 max-w-[260px]"
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
                              onClick={() =>
                                setImperdiblesForm((prev) => {
                                  if (idx === 0) return prev;
                                  const next = [...prev.items];
                                  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                  return { ...prev, items: next };
                                })
                              }
                              className="p-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === imperdiblesForm.items.length - 1}
                              onClick={() =>
                                setImperdiblesForm((prev) => {
                                  if (idx === prev.items.length - 1) return prev;
                                  const next = [...prev.items];
                                  [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                                  return { ...prev, items: next };
                                })
                              }
                              className="p-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setImperdiblesForm((prev) => ({
                                  ...prev,
                                  items: prev.items.filter((_, i) => i !== idx),
                                }))
                              }
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
                              onChange={(e) =>
                                setImperdiblesForm((prev) => {
                                  const next = [...prev.items];
                                  next[idx] = { ...next[idx], customTitle: e.target.value };
                                  return { ...prev, items: next };
                                })
                              }
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
                              onChange={(e) =>
                                setImperdiblesForm((prev) => {
                                  const next = [...prev.items];
                                  next[idx] = { ...next[idx], customBadge: e.target.value };
                                  return { ...prev, items: next };
                                })
                              }
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                              Bajada / Destacado de la tarjeta
                            </label>
                            <input
                              type="text"
                              value={item.customTagline || ''}
                              onChange={(e) =>
                                setImperdiblesForm((prev) => {
                                  const next = [...prev.items];
                                  next[idx] = { ...next[idx], customTagline: e.target.value };
                                  return { ...prev, items: next };
                                })
                              }
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Image Uploader for this imperdible (Fixed props!) */}
                        <AdminPhotoUploader
                          mainImage={item.customImage || place?.image || ''}
                          singleImageOnly
                          onMainImageChange={(newUrl) =>
                            setImperdiblesForm((prev) => {
                              const next = [...prev.items];
                              next[idx] = { ...next[idx], customImage: newUrl };
                              return { ...prev, items: next };
                            })
                          }
                          onUploadingChange={setIsUploadingPhoto}
                          placeName={item.customTitle || 'imperdible'}
                          title={`Foto para ${item.customTitle || 'Imperdible'}`}
                        />
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
                    onChange={(e) =>
                      setConoceFrayForm((prev) => ({ ...prev, title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setConoceFrayForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
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
                  onChange={(e) =>
                    setConoceFrayForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto Principal de Presentación (tarjeta oscura)
                </label>
                <textarea
                  rows={3}
                  value={conoceFrayForm.leadParagraph || ''}
                  onChange={(e) =>
                    setConoceFrayForm((prev) => ({ ...prev, leadParagraph: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-900">
                  Pilares de Identidad Territorial
                </h4>
                {conoceFrayForm.pillars.map((pillar, pIdx) => (
                  <div
                    key={pillar.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) =>
                          setConoceFrayForm((prev) => {
                            const next = [...prev.pillars];
                            next[pIdx] = { ...next[pIdx], title: e.target.value };
                            return { ...prev, pillars: next };
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                        placeholder="Título del Pilar"
                      />
                      <input
                        type="text"
                        value={pillar.subtitle}
                        onChange={(e) =>
                          setConoceFrayForm((prev) => {
                            const next = [...prev.pillars];
                            next[pIdx] = { ...next[pIdx], subtitle: e.target.value };
                            return { ...prev, pillars: next };
                          })
                        }
                        className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                        placeholder="Subtítulo"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={pillar.phrase}
                      onChange={(e) =>
                        setConoceFrayForm((prev) => {
                          const next = [...prev.pillars];
                          next[pIdx] = { ...next[pIdx], phrase: e.target.value };
                          return { ...prev, pillars: next };
                        })
                      }
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
                    onChange={(e) =>
                      setQueHacerForm((prev) => ({ ...prev, title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setQueHacerForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={queHacerForm.subtitle}
                  onChange={(e) =>
                    setQueHacerForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

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
                        targetCategory: 'visitar',
                      };
                      setQueHacerForm((prev) => ({
                        ...prev,
                        activityPills: [...prev.activityPills, newPill],
                      }));
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    + Agregar Atajo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {queHacerForm.activityPills.map((pill, idx) => (
                    <div
                      key={pill.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={pill.emoji}
                        onChange={(e) =>
                          setQueHacerForm((prev) => {
                            const next = [...prev.activityPills];
                            next[idx] = { ...next[idx], emoji: e.target.value };
                            return { ...prev, activityPills: next };
                          })
                        }
                        className="w-8 h-8 text-center bg-white border border-slate-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={pill.label}
                        onChange={(e) =>
                          setQueHacerForm((prev) => {
                            const next = [...prev.activityPills];
                            next[idx] = { ...next[idx], label: e.target.value };
                            return { ...prev, activityPills: next };
                          })
                        }
                        className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQueHacerForm((prev) => ({
                            ...prev,
                            activityPills: prev.activityPills.filter((_, i) => i !== idx),
                          }))
                        }
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
                    onChange={(e) =>
                      setRecorridoForm((prev) => ({ ...prev, title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setRecorridoForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtítulo / Texto Narrativo del Encabezado
                </label>
                <textarea
                  rows={2}
                  value={recorridoForm.introDescription || recorridoForm.subtitle || ''}
                  onChange={(e) =>
                    setRecorridoForm((prev) => ({
                      ...prev,
                      introDescription: e.target.value,
                      subtitle: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-900">
                    Paradas del Circuito ({recorridoForm.stops.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const nextPlace =
                        places.find(
                          (p) => !recorridoForm.stops.some((s) => s.placeId === p.id)
                        ) || places[0];
                      if (!nextPlace) return;
                      const newStop: RecorridoEsquiuStopConfig = {
                        placeId: nextPlace.id,
                        order: recorridoForm.stops.length + 1,
                        customTitle: nextPlace.name,
                        distanceFromPrevious: '',
                        tip: nextPlace.shortDescription || '',
                      };
                      setRecorridoForm((prev) => ({
                        ...prev,
                        stops: [...prev.stops, newStop],
                      }));
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Parada</span>
                  </button>
                </div>

                {recorridoForm.stops.map((stop, sIdx) => {
                  const place = places.find((p) => p.id === stop.placeId);
                  return (
                    <div
                      key={`${stop.placeId}-${sIdx}`}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-black text-amber-800 shrink-0">
                            Parada #{sIdx + 1}
                          </span>
                          <select
                            value={stop.placeId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              const p = places.find((item) => item.id === newId);
                              setRecorridoForm((prev) => {
                                const next = [...prev.stops];
                                next[sIdx] = {
                                  ...next[sIdx],
                                  placeId: newId,
                                  customTitle: p?.name || next[sIdx].customTitle,
                                };
                                return { ...prev, stops: next };
                              });
                            }}
                            className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg max-w-[240px]"
                          >
                            {places.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={sIdx === 0}
                            onClick={() =>
                              setRecorridoForm((prev) => {
                                if (sIdx === 0) return prev;
                                const next = [...prev.stops];
                                [next[sIdx - 1], next[sIdx]] = [next[sIdx], next[sIdx - 1]];
                                return { ...prev, stops: next };
                              })
                            }
                            className="p-1 bg-white border border-slate-200 rounded-lg disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={sIdx === recorridoForm.stops.length - 1}
                            onClick={() =>
                              setRecorridoForm((prev) => {
                                if (sIdx === prev.stops.length - 1) return prev;
                                const next = [...prev.stops];
                                [next[sIdx + 1], next[sIdx]] = [next[sIdx], next[sIdx + 1]];
                                return { ...prev, stops: next };
                              })
                            }
                            className="p-1 bg-white border border-slate-200 rounded-lg disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setRecorridoForm((prev) => ({
                                ...prev,
                                stops: prev.stops.filter((_, i) => i !== sIdx),
                              }))
                            }
                            className="p-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={stop.customTitle || place?.name || ''}
                          onChange={(e) =>
                            setRecorridoForm((prev) => {
                              const next = [...prev.stops];
                              next[sIdx] = { ...next[sIdx], customTitle: e.target.value };
                              return { ...prev, stops: next };
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                          placeholder="Título visible de la parada"
                        />
                        <input
                          type="text"
                          value={stop.distanceFromPrevious || ''}
                          onChange={(e) =>
                            setRecorridoForm((prev) => {
                              const next = [...prev.stops];
                              next[sIdx] = {
                                ...next[sIdx],
                                distanceFromPrevious: e.target.value,
                              };
                              return { ...prev, stops: next };
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                          placeholder="Distancia (ej. 800 m desde la Casa Natal)"
                        />
                      </div>

                      <input
                        type="text"
                        value={stop.tip || ''}
                        onChange={(e) =>
                          setRecorridoForm((prev) => {
                            const next = [...prev.stops];
                            next[sIdx] = { ...next[sIdx], tip: e.target.value };
                            return { ...prev, stops: next };
                          })
                        }
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                        placeholder="Descripción o consejo para el turista"
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
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, municipalTitle: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, secretaria: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bajada de Marca (debajo del logo Visitá Fray)
                  </label>
                  <input
                    type="text"
                    value={footerForm.tagline}
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Texto de Copyright / Pie
                  </label>
                  <input
                    type="text"
                    value={footerForm.copyrightText}
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, copyrightText: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFooterForm((prev) => ({ ...prev, email: e.target.value }))
                    }
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
                  onChange={(e) =>
                    setFooterForm((prev) => ({ ...prev, localitiesText: e.target.value }))
                  }
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
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-800">
                  Mostrar bloque &quot;Fray Tierra de Milagros&quot; en el sitio
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setEmblemaForm((prev) => ({ ...prev, isVisible: !prev.isVisible }))
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    emblemaForm.isVisible
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {emblemaForm.isVisible ? 'Visible' : 'Oculto'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Etiqueta Superior (Badge)
                  </label>
                  <input
                    type="text"
                    value={emblemaForm.badge}
                    onChange={(e) =>
                      setEmblemaForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título del Emblema
                  </label>
                  <input
                    type="text"
                    value={emblemaForm.title}
                    onChange={(e) =>
                      setEmblemaForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto Descriptivo
                </label>
                <textarea
                  rows={3}
                  value={emblemaForm.bodyText}
                  onChange={(e) =>
                    setEmblemaForm((prev) => ({ ...prev, bodyText: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setSectionToEdit(null)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cerrar
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
                  <span>Guardar Cambios de la Sección</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
