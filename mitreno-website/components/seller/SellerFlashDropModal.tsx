'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Clock,
  TrendingUp,
  Sparkles,
  Flame,
  ShieldCheck,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { getBackendUrl } from '@/lib/config';

interface ProductItemProps {
  id: string;
  name: string;
  base_price: number;
  thumbnail: string;
  category?: string;
  total_stock?: number;
}

interface SellerFlashDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItemProps | null;
  onSuccess: () => void;
}

export const SellerFlashDropModal: React.FC<SellerFlashDropModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [flashPrice, setFlashPrice] = useState<number>(() => {
    return product ? Math.round(product.base_price * 0.75) : 599;
  });
  const [stockLimit, setStockLimit] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update default flash price when product changes
  React.useEffect(() => {
    if (product) {
      setFlashPrice(Math.round(product.base_price * 0.75));
      setErrorMessage(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const basePrice = product.base_price || 999;
  const discountPercent = basePrice > 0 ? Math.round(((basePrice - flashPrice) / basePrice) * 100) : 0;
  const isValidDiscount = discountPercent >= 10 && flashPrice > 0 && flashPrice < basePrice;

  const handleApplyPreset = (percent: number) => {
    const calculated = Math.round(basePrice * (1 - percent / 100));
    setFlashPrice(calculated);
    setErrorMessage(null);
  };

  const handleLaunch = async () => {
    if (!isValidDiscount) {
      setErrorMessage(`Please provide at least 10% discount (Flash price must be less than ₹${Math.round(basePrice * 0.9)})`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/seller/flash-drop/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          flash_price: flashPrice,
          duration_minutes: durationMinutes,
          stock_limit: stockLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to launch flash drop');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[SellerFlashDropModal] Launch error:', err);
      setErrorMessage(err.message || 'Network error while launching drop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Flame className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  Launch Flash Surge Drop
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/90 text-neutral-950">
                    Free Top Rank
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Zero ad cost. Give a real discount to dominate the top feed.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 space-y-5">
            {/* Target Product Summary */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 shrink-0">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Target Inventory
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-neutral-500 line-through">
                    ₹{basePrice.toLocaleString('en-IN')} (Current)
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ➔ ₹{flashPrice.toLocaleString('en-IN')} ({discountPercent}% OFF)
                  </span>
                </div>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. Surge Duration (Countdown on Top)</span>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 lowercase">
                  <Clock className="w-3 h-3" />
                  Auto-reverts to ₹{basePrice} at 00:00
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { mins: 15, label: '15 Mins', badge: 'High Velocity' },
                  { mins: 20, label: '20 Mins', badge: 'Balanced' },
                  { mins: 30, label: '30 Mins', badge: 'Max Reach' },
                ].map((d) => {
                  const isSelected = durationMinutes === d.mins;
                  return (
                    <button
                      key={d.mins}
                      type="button"
                      onClick={() => setDurationMinutes(d.mins)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-neutral-950 dark:text-white shadow-sm ring-2 ring-amber-500/30'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="block text-sm font-black">{d.label}</span>
                      <span className="block text-[10px] font-medium text-neutral-400 mt-0.5">
                        {d.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flash Price & Discount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  2. Flash Price (INR)
                </label>
                <div className="flex items-center gap-1.5">
                  {[20, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleApplyPreset(pct)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  value={flashPrice || ''}
                  onChange={(e) => {
                    setFlashPrice(Number(e.target.value));
                    setErrorMessage(null);
                  }}
                  placeholder="Enter flash price"
                  className="w-full pl-8 pr-28 py-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-black text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : '0%'}
                </div>
              </div>

              {!isValidDiscount && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Minimum 10% discount required to unlock Top Feed Rank.
                </p>
              )}
            </div>

            {/* Stock Limit Allocation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  3. Flash Stock Allocation
                </label>
                <span className="text-[11px] font-bold text-neutral-500">
                  {stockLimit} pieces allocated
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={Math.min(50, product.total_stock || 30)}
                value={stockLimit}
                onChange={(e) => setStockLimit(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                <span>3 pcs (Scarcity)</span>
                <span>Max: {Math.min(50, product.total_stock || 30)} pcs</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleLaunch}
              disabled={isSubmitting || !isValidDiscount}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || !isValidDiscount
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-neutral-950 font-black shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                  <span>Pinning to Top of Mitreno...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Launch {durationMinutes}-Min Surge (Go Live on Top)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
