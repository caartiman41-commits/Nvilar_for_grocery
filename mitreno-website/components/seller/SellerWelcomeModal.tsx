'use client';

import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, ShoppingBag, MessageSquare, Flame, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SellerWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  cityName?: string;
  onGetStarted: () => void;
}

export const SellerWelcomeModal: React.FC<SellerWelcomeModalProps> = ({
  isOpen,
  onClose,
  shopName,
  cityName = 'India',
  onGetStarted,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive multi-stage confetti
      try {
        const count = 200;
        const defaults = { origin: { y: 0.6 } };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch (err) {
        console.warn('Confetti trigger skipped:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-neutral-900 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 60px rgba(245, 158, 11, 0.1)'
        }}
      >
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 text-amber-800 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Verified Nvilar Partner
          </span>
          <span className="text-xs text-neutral-500 font-medium">Live in {cityName}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 leading-tight">
          Congratulations! <br />
          <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
            {shopName || 'Your Boutique'}
          </span> is Live ✨
        </h2>

        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          Aapka seller application approve ho gaya hai. Aapki boutique ab pure Bharat ke customers ke liye active hai. Shuru karne ke liye niche diye steps complete kijiye:
        </p>

        {/* Milestones / Checklist */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900">Add Your Products</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Step 1</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">List your inventory with custom sizing, fabric specs, and HD gallery photos.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900">Live Customer Chat</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Step 2</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Bargain directly and offer customer-exclusive custom pricing deals.</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onGetStarted}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all duration-200 active:scale-[0.98]"
          >
            <span>Enter Seller Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 font-medium text-xs transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
