'use client';

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  X,
  ExternalLink,
  ShieldCheck,
  Download,
  Copy,
  Check,
} from 'lucide-react';

interface DocumentImageViewerProps {
  title: string;
  docNumber?: string | null;
  imageUrl?: string | null;
  isOptional?: boolean;
  canCopy?: boolean;
}

export const DocumentImageViewer: React.FC<DocumentImageViewerProps> = ({
  title,
  docNumber,
  imageUrl,
  isOptional = false,
  canCopy = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (docNumber) {
      navigator.clipboard.writeText(docNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!imageUrl && isOptional) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-center">
        <p className="text-xs font-bold text-neutral-500">{title}</p>
        <p className="text-[11px] text-neutral-400 mt-1">Not provided (Optional)</p>
      </div>
    );
  }

  const effectiveUrl = imageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';

  return (
    <>
      <div className="rounded-xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs hover:border-indigo-300 transition-all group">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">{title}</h4>
            </div>
            {docNumber && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs font-mono text-neutral-500 tracking-wider font-semibold">
                  {docNumber}
                </p>
                {canCopy && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer transition-colors"
                    title="Copy number"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Inspect</span>
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative h-44 bg-neutral-100 flex items-center justify-center cursor-pointer overflow-hidden group-hover:opacity-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectiveUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-neutral-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="px-3 py-1.5 rounded-full bg-white/95 text-neutral-900 text-xs font-bold shadow-md flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
              Click to Zoom &amp; Verify
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800 text-white">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{title} Photo Verification</span>
                {docNumber && (
                  <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded text-indigo-300">
                    {docNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Inspect document edges, stamp, photo alignment, and number match.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-neutral-400 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <a
                href={effectiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Open Original"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setZoom(1);
                  setRotation(0);
                }}
                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 transition-colors ml-2"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={effectiveUrl}
              alt={title}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-2xl ring-1 ring-neutral-700"
            />
          </div>
        </div>
      )}
    </>
  );
};
