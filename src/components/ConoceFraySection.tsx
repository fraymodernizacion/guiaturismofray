import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SectionEditButton } from './SectionEditButton';

export const ConoceFraySection: React.FC = () => {
  const { siteConfig } = useData();
  const { isAuthenticated, isEditorMode } = useAuth();
  const [showFullHistory, setShowFullHistory] = useState<boolean>(false);

  const conoceConfig = siteConfig?.conoceFray || {
    title: 'Conocé Fray Mamerto Esquiú',
    subtitle: 'Naturaleza viva, historia fundacional y el espíritu de Catamarca',
    badge: 'Identidad Territorial',
    pillars: [],
  };

  return (
    <section id="seccion-conoce-fray" className="space-y-4">
      {/* Header with identity styling */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {conoceConfig.badge || 'Identidad Territorial'}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Valle Central · Catamarca
            </span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight mt-1">
            {conoceConfig.title || 'Conocé Fray Mamerto Esquiú'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {conoceConfig.subtitle || 'Naturaleza viva, historia fundacional y el espíritu de Catamarca'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && isEditorMode && (
            <SectionEditButton sectionId="conoceFray" sectionTitle="Conocé Fray" />
          )}

          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            <span>{showFullHistory ? 'Resumir' : 'Historia y origen'}</span>
          </button>
        </div>
      </div>

      {/* Narrative overview card */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-500/20 space-y-3 relative overflow-hidden">
        <div className="relative z-10 space-y-2.5">
          <p className="text-emerald-50 text-xs sm:text-sm font-normal leading-relaxed">
            Ubicado en la <span className="text-white font-bold">Región Centro de Catamarca</span> e integrado al Valle Central, <span className="text-emerald-300 font-bold">Fray Mamerto Esquiú</span> combina paisajes serranos, naturaleza, historia, espiritualidad y una profunda identidad cultural.
          </p>

          <p className="text-teal-100/80 text-xs leading-relaxed">
            Su territorio se despliega en un valle rodeado por formaciones montañosas: la imponente <span className="text-white font-semibold">Sierra de Gracián</span> al este y las sierras hacia la Capital al oeste. El <span className="text-white font-semibold">Río del Valle</span> atraviesa sus pueblos y da vida al emblemático <span className="text-emerald-300 font-semibold">Dique Las Pirquitas</span>.
          </p>

          {showFullHistory && (
            <div className="pt-3 border-t border-emerald-700/40 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-emerald-900/40 p-3 rounded-2xl border border-emerald-600/30">
                <Calendar className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">20 de Octubre de 1621 · Merced de Allpatauca</span>
                  <p className="text-[11px] text-emerald-100/80 mt-0.5">
                    Hito fundacional documentado del poblamiento del actual territorio departamental, con antecedentes ancestrales de culturas originarias prehispánicas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-900/40 p-3 rounded-2xl border border-emerald-600/30">
                <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">De Piedra Blanca a Fray Mamerto Esquiú (1934)</span>
                  <p className="text-[11px] text-emerald-100/80 mt-0.5">
                    Conocido históricamente como Piedra Blanca, adoptó en 1934 el nombre del beato orador de la Constitución nacido aquí el 11 de mayo de 1826.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
