import React from 'react';
import { Edit3, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface SectionEditButtonProps {
  sectionId: string;
  sectionTitle?: string;
  onAddAction?: () => void;
  addActionLabel?: string;
  className?: string;
  compact?: boolean;
}

export const SectionEditButton: React.FC<SectionEditButtonProps> = ({
  sectionId,
  sectionTitle,
  onAddAction,
  addActionLabel = 'Agregar',
  className = '',
  compact = false,
}) => {
  const { isAuthenticated, isEditorMode } = useAuth();
  const { setSectionToEdit } = useData();

  if (!isAuthenticated || !isEditorMode) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl shadow-md border-2 border-amber-300 animate-in fade-in zoom-in-95 z-20 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        id={`btn-edit-section-${sectionId}`}
        onClick={() => setSectionToEdit(sectionId)}
        className="flex items-center gap-1.5 text-xs font-black hover:bg-amber-300 px-1.5 py-0.5 rounded-lg transition active:scale-95"
        title={`Editar contenidos, textos y fotos de ${sectionTitle || sectionId}`}
      >
        <Edit3 className="w-3.5 h-3.5 text-slate-950" />
        <span>✏️ Editar {sectionTitle ? sectionTitle : 'sección'}</span>
      </button>

      {onAddAction && (
        <>
          <span className="text-amber-700/60 font-bold">|</span>
          <button
            type="button"
            id={`btn-add-section-${sectionId}`}
            onClick={onAddAction}
            className="flex items-center gap-1 text-xs font-black hover:bg-amber-300 px-1.5 py-0.5 rounded-lg transition active:scale-95"
            title={`Agregar nuevo elemento a ${sectionTitle || sectionId}`}
          >
            <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
            <span>+{addActionLabel}</span>
          </button>
        </>
      )}
    </div>
  );
};
