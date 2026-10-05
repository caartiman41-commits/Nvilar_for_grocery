'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, ArrowUp, ArrowDown, ChevronRight, Eye, Layers } from 'lucide-react';
import { RUNWAY_LOOKS, PRODUCTS, Product, RunwayLook } from '@/lib/products-data';
import Image from 'next/image';

interface RunwaySectionProps {
  onOpenProduct: (product: Product) => void;
  onOpenTryOn: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const RunwaySection: React.FC<RunwaySectionProps> = ({
  onOpenProduct,
  onOpenTryOn,
  onAddToCart,
  onNavigateTab,
}) => {
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [activeImageAngle, setActiveImageAngle] = useState<'hero' | 'secondary'>('hero');

  const currentLook: RunwayLook = RUNWAY_LOOKS[currentLookIndex];
  const featuredProduct: Product =
    PRODUCTS.find((p) => p.id === currentLook.featuredProductId) || PRODUCTS[0];

  const handleNextLook = () => {
    setCurrentLookIndex((prev) => (prev + 1) % RUNWAY_LOOKS.length);
    setActiveImageAngle('hero');
  };

  const handlePrevLook = () => {
    setCurrentLookIndex((prev) => (prev - 1 + RUNWAY_LOOKS.length) % RUNWAY_LOOKS.length);
    setActiveImageAngle('hero');
  };

  // Keyboard navigation for vertical runway swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNextLook();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePrevLook();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="runway-hero-container" className="relative w-full min-h-screen bg-[#070B14] text-white overflow-hidden">
      {/* Editorial Runway Canvas */}
      <div className="relative w-full h-screen flex flex-col justify-between">
        {/* Visual Background with Spring Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentLook.id}-${activeImageAngle}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0 select-none"
          >
            <Image
              src={activeImageAngle === 'hero' ? currentLook.heroImage : currentLook.secondaryImage}
              alt={currentLook.title}
              fill
              priority
              referrerPolicy="no-referrer"
              className="object-cover object-center brightness-[0.88] contrast-[1.05]"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-[#070B14]/60 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Top Tagline & Season Metadata */}
        <div className="relative z-10 pt-24 md:pt-28 px-6 md:px-14 flex items-start justify-between">
          <motion.div
            key={`meta-${currentLook.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-medium tracking-widest text-white/90 uppercase">
                {currentLook.season}
              </span>
              <span className="text-white/60 text-xs font-mono tracking-wider">
                {currentLook.badge}
              </span>
            </div>
            <h1 className="font-serif-editorial text-3xl md:text-5xl font-normal tracking-wide text-white drop-shadow-md">
              {currentLook.title}
            </h1>
            <p className="text-xs md:text-sm text-white/70 max-w-md font-light tracking-wide">
              {currentLook.subtitle}
            </p>
          </motion.div>

          {/* Look Pagination Indicator */}
          <div className="hidden md:flex flex-col items-end gap-3">
            <div className="font-mono text-xs tracking-widest text-white/70 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              0{currentLookIndex + 1} <span className="text-white/40">/</span> 0{RUNWAY_LOOKS.length}
            </div>

            {/* Vertical Swipe Controls */}
            <div className="flex flex-col gap-1.5">
              <button
                id="runway-prev-btn"
                onClick={handlePrevLook}
                aria-label="Previous Runway Look"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center border border-white/15 transition-all cursor-pointer group"
              >
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                id="runway-next-btn"
                onClick={handleNextLook}
                aria-label="Next Runway Look"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center border border-white/15 transition-all cursor-pointer group"
              >
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Runway Product Tag */}
        <div className="relative z-10 pb-20 md:pb-12 px-4 md:px-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div
            key={`tag-${featuredProduct.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-5 md:p-6 max-w-xl shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400">
                  {currentLook.lookNumber} • {featuredProduct.fabric}
                </span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white mt-0.5">
                  {featuredProduct.name}
                </h2>
                <p className="text-xs text-white/70 line-clamp-2 mt-1 font-light">
                  {featuredProduct.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl md:text-2xl font-bold text-white font-mono">
                  ₹{featuredProduct.price.toLocaleString('en-IN')}
                </div>
                {featuredProduct.gsm > 0 && (
                  <span className="text-[11px] text-white/60 font-mono">
                    {featuredProduct.gsm} GSM
                  </span>
                )}
              </div>
            </div>

            {/* Micro Angle Switcher */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-xs">
              <span className="text-white/50 text-[11px]">Angle:</span>
              <button
                onClick={() => setActiveImageAngle('hero')}
                className={`px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-medium transition-all ${
                  activeImageAngle === 'hero'
                    ? 'bg-white text-[#0A0F1D]'
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setActiveImageAngle('secondary')}
                className={`px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-medium transition-all ${
                  activeImageAngle === 'secondary'
                    ? 'bg-white text-[#0A0F1D]'
                    : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                Profile Drape
              </button>
            </div>

            {/* Runway Action CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                id="runway-tryon-btn"
                onClick={() => onOpenTryOn(featuredProduct)}
                className="w-full py-3 px-4 rounded-xl bg-[#1246B8] hover:bg-[#0E3692] text-white text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>✦ TRY IT ON</span>
              </button>

              <button
                id="runway-addbag-btn"
                onClick={() => onAddToCart(featuredProduct)}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <button
                id="runway-viewlook-btn"
                onClick={() => onOpenProduct(featuredProduct)}
                className="w-full py-3 px-4 rounded-xl bg-white text-[#0A0F1D] hover:bg-slate-100 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-700" />
                <span>VIEW DETAILS</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Collection Jump */}
          <div className="hidden lg:flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <span className="text-xs text-white/70 font-mono">Curated Drops</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <button
              onClick={() => {
                const el = document.getElementById('curated-collections-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
            >
              Explore Collections & Editorial Masonry
            </button>
          </div>
        </div>

        {/* Mobile Swipe Indicators */}
        <div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {RUNWAY_LOOKS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentLookIndex(idx)}
              className={`w-1.5 rounded-full transition-all ${
                idx === currentLookIndex ? 'h-6 bg-[#1246B8]' : 'h-1.5 bg-white/40'
              }`}
              aria-label={`Go to look ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
