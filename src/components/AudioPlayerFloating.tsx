import React from 'react';
import {
  Play,
  Pause,
  X,
  Volume2,
  Headphones,
  Maximize2,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const AudioPlayerFloating: React.FC = () => {
  const {
    activeAudioGuide,
    isAudioPlaying,
    isAudioPaused,
    audioProgress,
    resumeAudioguide,
    pauseAudioguide,
    stopAudioguide,
    setActiveTab,
  } = useData();

  if (!activeAudioGuide) return null;

  return (
    <div
      id="floating-audio-player"
      className="fixed bottom-[64px] sm:bottom-[68px] left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl p-3 shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom duration-300"
    >
      {/* Top progress line */}
      <div className="absolute top-0 left-4 right-4 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${audioProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Cover thumbnail & Info */}
        <div
          onClick={() => setActiveTab('audioguias')}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative bg-slate-800 border border-white/10 flex items-center justify-center">
            {activeAudioGuide.coverImage && activeAudioGuide.coverImage.trim() !== '' ? (
              <img
                src={activeAudioGuide.coverImage}
                alt={activeAudioGuide.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            )}
            {isAudioPlaying && activeAudioGuide.coverImage && activeAudioGuide.coverImage.trim() !== '' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
              Audioguía en curso
            </p>
            <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
              {activeAudioGuide.title}
            </h4>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (isAudioPlaying) {
                pauseAudioguide();
              } else {
                resumeAudioguide();
              }
            }}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md active:scale-95 transition"
            aria-label={isAudioPlaying ? 'Pausar' : 'Reanudar'}
          >
            {isAudioPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={stopAudioguide}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition"
            aria-label="Cerrar reproductor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
