'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Flame, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { getBackendUrl } from '@/lib/config';
import { Product } from '@/lib/products-data';
import { PriceHistoryModal } from './PriceHistoryModal';

interface FlashOfferDTO {
  id: string;
  product_id: string;
  shop_id: string;
  original_price: number;
  flash_price: number;
  discount_percent: number;
  duration_minutes: number;
  starts_at: string;
  expires_at: string;
  stock_limit: number;
  sold_quantity: number;
  status: string;
  product?: {
    id: string;
    name: string;
    thumbnail: string;
    base_price: number;
    original_price: number;
    category: string;
  };
  shop?: {
    id: string;
    name: string;
    location?: string;
  };
}

interface TopSurgeDropsProps {
  onOpenProduct: (product: any) => void;
}

export const TopSurgeDrops: React.FC<TopSurgeDropsProps> = ({ onOpenProduct }) => {
  const [drops, setDrops] = useState<FlashOfferDTO[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [selectedHistoryProductId, setSelectedHistoryProductId] = useState<string | null>(null);

  // Poll for active flash drops
  useEffect(() => {
    let isMounted = true;

    const fetchActiveDrops = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/flash-drops/active`);
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.drops)) {
          setDrops(json.drops);
        }
      } catch (err) {
        // Fallback
      }
    };

    fetchActiveDrops();
    const pollInterval = setInterval(fetchActiveDrops, 15000); // 15s refresh
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Real-time 1-second countdown ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (drops.length === 0) return null;

  return (
    <div className="w-full mb-6">
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/5 p-4 sm:p-5 border border-amber-500/30 dark:border-amber-500/20 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.15)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Section Header */}
        <div className="relative flex items-center justify-between gap-3 mb-3.5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-neutral-950 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-950 dark:text-white">
                  ⚡ Live Surge Drops
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                  All-Time Lows
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                Sellers cut margins for top placement. Price surges back to normal at 00:00!
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Horizontal Cards Carousel */}
        <div className="relative flex gap-3.5 overflow-x-auto pb-1.5 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
          {drops.map((drop) => {
            const expiryTime = new Date(drop.expires_at).getTime();
            const remainingSec = Math.max(0, Math.floor((expiryTime - now) / 1000));
            const mins = Math.floor(remainingSec / 60);
            const secs = remainingSec % 60;
            const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            const isExpired = remainingSec <= 0;

            if (isExpired) return null;

            const product = drop.product;
            if (!product) return null;

            return (
              <div
                key={drop.id}
                onClick={() => onOpenProduct({ ...product, price: drop.flash_price, originalPrice: drop.original_price })}
                className="group relative flex-shrink-0 w-[260px] sm:w-[280px] rounded-2xl bg-white dark:bg-neutral-900 border border-amber-500/40 dark:border-amber-500/30 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer snap-start flex flex-col"
              >
                {/* Image + Overlays */}
                <div className="relative w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Countdown Clock (Top Left) */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-neutral-950/85 backdrop-blur-md text-white text-[11px] font-black tracking-wider flex items-center gap-1.5 border border-amber-400/40 shadow-sm">
                    <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="font-mono text-amber-300">{timerStr}</span>
                  </div>

                  {/* Discount Badge (Top Right) */}
                  <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {drop.discount_percent}% OFF
                  </div>

                  {/* Stock Left Ticker (Bottom of image) */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between text-white text-[10px] font-bold">
                    <span className="truncate">{drop.shop?.name || 'Verified Boutique'}</span>
                    <span className="text-amber-300 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Only {drop.stock_limit - drop.sold_quantity} left
                    </span>
                  </div>
                </div>

                {/* Body & Pricing */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h4>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-neutral-950 dark:text-white">
                          ₹{drop.flash_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{drop.original_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        Lowest in 7 Days
                      </span>
                    </div>

                    {/* View 7d Trend Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHistoryProductId(product.id);
                      }}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                      title="View Verified 7-Day Price Chart"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded 7-Day Price History Modal for Surge Items */}
      {selectedHistoryProductId && (
        <PriceHistoryModal
          isOpen={!!selectedHistoryProductId}
          onClose={() => setSelectedHistoryProductId(null)}
          productId={selectedHistoryProductId}
        />
      )}
    </div>
  );
};
