'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MapPin, Store, TrendingUp, Zap } from 'lucide-react';
import { Product } from '@/lib/products-data';
import { PriceHistoryModal } from './PriceHistoryModal';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  isSaved?: boolean;
  onToggleSave?: (productId: string) => void;
  isNearby?: boolean;
  hasExpressDelivery?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  isSaved = false,
  onToggleSave,
  isNearby,
  hasExpressDelivery,
}) => {
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);

  // Determine if product belongs to a nearby boutique or has express delivery
  const isNearbyOrExpress = Boolean(
    isNearby ||
    hasExpressDelivery ||
    (product as any).has_express_delivery ||
    (product as any).express_delivery ||
    (product as any).hasExpressDelivery ||
    (product as any).expressDelivery ||
    (product as any).is_nearby ||
    (product as any).isNearby ||
    (product.shop as any)?.isNearby ||
    (product.shop as any)?.is_nearby ||
    (product.shop as any)?.express_delivery ||
    (product.shop as any)?.has_express_delivery ||
    (product as any).delivery_tier === 'today' ||
    (product as any).deliveryTier === 'today' ||
    (product as any).deliveryPromise?.tier === 'today' ||
    product.shop?.verified ||
    (product.shop?.location && (
      product.shop.location.toLowerCase().includes('guwahati') ||
      product.shop.location.toLowerCase().includes('mumbai') ||
      product.shop.location.toLowerCase().includes('delhi') ||
      product.shop.location.toLowerCase().includes('blr') ||
      product.shop.location.toLowerCase().includes('bangalore')
    ))
  );

  // Calculate discount percentage if originalPrice exists
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onOpenProduct(product)}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/50 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_28px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.02)] hover:border-neutral-300/80 transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer h-full"
    >
      {/* 3:4 Vertical Portrait Image Container */}
      <div className="relative w-full aspect-[4/4.5] overflow-hidden bg-neutral-50/50 border-b border-neutral-100">
        {/* Main Product Image */}
        <div className="relative w-full h-full">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Out of Stock Overlay & Badges */}
        {product.isOutOfStock ? (
          <>
            <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-[0.5px] z-10 pointer-events-none transition-opacity" />
            <div className="absolute top-2 left-2 z-20 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md border border-rose-400/40 flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Out of Stock
              </span>
            </div>
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-black tracking-widest uppercase border border-white/20 shadow-lg">
                Sold Out
              </span>
            </div>
          </>
        ) : null}

        {/* Top-Left Badges (Sponsored Ad, Micro Delivery & Verified Store) */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none flex flex-col gap-1 items-start">
          {(product as any).is_sponsored && (
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-neutral-950 text-[9px] font-black tracking-wider uppercase shadow-md border border-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-pulse" />
              Sponsored • Ad
            </span>
          )}

          {!product.isOutOfStock && isNearbyOrExpress && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-extrabold text-emerald-700 shadow-sm border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Today</span>
            </span>
          )}

          {!product.isOutOfStock && product.shop?.verified && (
            <span className="px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-md text-[9px] font-sans font-bold tracking-wide text-[#388E3C] shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]" />
              VERIFIED
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Bookmark Toggle */}
        {onToggleSave && (
          <button
            type="button"
            id={`save-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(product.id);
            }}
            className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full backdrop-blur-md transition-all duration-250 cursor-pointer active:scale-90 ${
              isSaved
                ? 'bg-white text-rose-600 shadow-md scale-105 border border-rose-100'
                : 'bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200/80 shadow-sm'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save to My Edit'}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        )}
      </div>

      {/* Inside Card Product Specs with beautiful margins and colorful vibrant typography */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1">
          {/* Shop Name & Rating in perfect balance */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 max-w-[75%]">
              <div className="bg-neutral-100/80 p-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.08)] border border-neutral-200/60 shrink-0">
                <Store className="w-2.5 h-2.5 text-neutral-500" />
              </div>
              <span className="text-[11px] font-medium text-neutral-500 truncate font-sans tracking-wide uppercase">
                {product.shop?.name || 'Local Boutique'}
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-[#388E3C] px-1.5 py-0.5 rounded shrink-0">
              {product.shop?.rating ? Number(product.shop.rating).toFixed(1) : 'New'} ★
            </div>
          </div>

          {/* Product Name (Clean weight, natural capitalization) */}
          <h3 className="text-[13px] font-medium text-neutral-800 leading-snug group-hover:text-[#2874F0] transition-colors font-sans line-clamp-2 min-h-[2.3rem] lowercase capitalize mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Location - Clean spacing, vibrant accents */}
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-base font-bold font-sans tracking-tight ${product.isOutOfStock ? 'text-neutral-400' : 'text-neutral-900'}`}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.isOutOfStock ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80">
                  Out of Stock
                </span>
              ) : (
                product.originalPrice && (
                  <>
                    <span className="text-xs text-neutral-500 line-through font-medium font-sans">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-xs font-bold text-[#388E3C] font-sans tracking-wide">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </>
                )
              )}
            </div>

            {/* 7-Day Price Trend Interactive Badge */}
            <button
              type="button"
              id={`price-trend-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsPriceHistoryOpen(true);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#388E3C] text-[10px] font-bold border border-emerald-200/60 shadow-2xs transition-all active:scale-95 cursor-pointer ml-auto"
              title="7-Day Verified Price History & Trend"
            >
              <TrendingUp className="w-3 h-3 text-[#388E3C]" />
              <span>7d Trend</span>
            </button>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium tracking-wide font-sans mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#2874F0] shrink-0" />
            <span className="truncate capitalize lowercase">{product.shop?.location || 'Mumbai Market'}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Price History Modal */}
      <PriceHistoryModal
        isOpen={isPriceHistoryOpen}
        onClose={() => setIsPriceHistoryOpen(false)}
        productId={product.id}
        productName={product.name}
        currentPrice={product.price}
        originalPrice={product.originalPrice}
        onSelectBuy={() => onOpenProduct(product)}
      />
    </div>
  );
};
