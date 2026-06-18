"use client";

import React from "react";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  previewImageUrl: string;
  onClose: () => void;
}

export function ImagePreviewModal({
  previewImageUrl,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        title="Fechar"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={previewImageUrl}
        alt="Visualização do Anexo"
        className="max-w-full max-h-[80vh] md:max-h-[90vh] rounded-xl object-contain shadow-2xl animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
