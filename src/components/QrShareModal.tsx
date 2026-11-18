import React, { useState } from 'react';
import {
  X,
  QrCode,
  Share2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const QrShareModal: React.FC = () => {
  const { isQrShareModalOpen, setIsQrShareModalOpen } = useData();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isQrShareModalOpen) return null;

  const currentUrl = window.location.href;
  // Generate high quality QR Code image using public QR service with custom colors
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=1c1917&bgcolor=ffffff&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FRAY TURISMO - Todo Fray en tu celular',
          text: 'Ingresá a la plataforma turística oficial de Fray Mamerto Esquiú, Catamarca:',
          url: currentUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      id="qr-share-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsQrShareModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Acceso Móvil Instantáneo</span>
          </div>
          <button
            onClick={() => setIsQrShareModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-display font-black text-xl text-slate-900 leading-tight">
            Fray Turismo en tu celular
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Escaneá con la cámara de cualquier teléfono para abrir la guía turística sin descargar nada.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-blue-50/60 rounded-3xl border-2 border-dashed border-blue-300 flex items-center justify-center">
          <img
            src={qrImageUrl}
            alt="Código QR Fray Turismo"
            className="w-48 h-48 rounded-2xl shadow-md bg-white p-2.5"
          />
        </div>

        <p className="text-[11px] text-slate-400 font-mono truncate bg-slate-50 p-2.5 rounded-2xl border border-slate-200 font-medium">
          {currentUrl}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
