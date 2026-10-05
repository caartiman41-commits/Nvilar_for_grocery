'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'ai' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-md px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto bg-[#0A0F1D]/95 text-white backdrop-blur-xl border border-white/10 rounded-full px-5 py-3.5 shadow-2xl flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'ai' ? (
                <div className="w-6 h-6 rounded-full bg-[#1246B8] flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div>
                <p className="font-medium tracking-tight text-white">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-white/70 font-light">{t.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/50 hover:text-white transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
