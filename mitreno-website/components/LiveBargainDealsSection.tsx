'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Product } from '@/lib/products-data';

interface LiveBargainDealsSectionProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  onOpenCategoryDeals?: (categoryKey: string, title: string, subtitle?: string) => void;
}

export const LiveBargainDealsSection: React.FC<LiveBargainDealsSectionProps> = ({
  products,
  onOpenProduct,
  onSelectCategory,
  onOpenCategoryDeals,
}) => {
  // Live stock-market ticker simulation
  const [tickerIndex, setTickerIndex] = useState(0);

  // Products mapping
  const boysDeal = products[0] || {
    id: 'afz-004',
    name: 'Boys Streetwear Hoodie',
    price: 2499,
    originalPrice: 3499,
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
  };

  const girlsDeal = products.find((p) => p.name?.toLowerCase().includes('crop') || p.name?.toLowerCase().includes('poplin')) || products[1] || {
    id: 'afz-005',
    name: 'Girls Aesthetic Co-ord Fit',
    price: 1899,
    originalPrice: 2999,
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  };

  const mensDeal = products.find((p) => p.category === 'tops' && p.id !== boysDeal.id) || products[2] || boysDeal;
  const shoesDeal = products.find((p) => p.category === 'shoes' || p.category === 'bottoms') || products[3] || boysDeal;
  const womensDeal = products.find((p) => p.name?.toLowerCase().includes('silk') || p.name?.toLowerCase().includes('resort')) || products[4] || boysDeal;
  const brandDeal = products[5] || boysDeal;

  // Real-time fluctuating stock-market ticker items
  const STOCK_TICKERS = useMemo(
    () => [
      { code: 'BOYS-FIT', label: "BOYS' STREETWEAR", price: '₹749', delta: '-40%', isDrop: true, trend: 'SURGE DIP' },
      { code: 'GIRLS-Y2K', label: "GIRLS' FASHION", price: '₹699', delta: '-45%', isDrop: true, trend: 'FLASH DROP' },
      { code: 'MEN-STREET', label: "MEN'S WEAR", price: '₹649', delta: '-35%', isDrop: true, trend: 'HIGH DEMAND' },
      { code: 'WOMEN-COUT', label: "WOMEN'S & SAREES", price: '₹999', delta: '-42%', isDrop: true, trend: 'FLASH CRASH' },
      { code: 'SNEAK-KICKS', label: 'SHOES & SNEAKERS', price: '₹1,249', delta: '-50%', isDrop: true, trend: 'SURGE DIP' },
      { code: 'BOUTIQUE-BID', label: 'LIVE COUNTER-OFFERS', price: '86 Bids', delta: '+24%', isDrop: false, trend: 'ACTIVE NOW' },
      { code: 'ATELIER-LUX', label: 'DIRECT KARIGAR', price: '₹1,499', delta: '-60%', isDrop: true, trend: 'ALL-TIME LOW' },
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % STOCK_TICKERS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [STOCK_TICKERS.length]);

  const activeTicker = STOCK_TICKERS[tickerIndex];

  const handleCategoryClick = (catKey: string, fallbackProd: any, title?: string, subtitle?: string) => {
    // Real-time Click Telemetry to Go Backend
    try {
      fetch('http://localhost:8080/api/campaigns/bargain-engine/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_key: catKey, title: title || catKey }),
      }).catch(() => {});
    } catch (_) {}

    if (onOpenCategoryDeals && title) {
      onOpenCategoryDeals(catKey, title, subtitle);
      return;
    }
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
    onOpenProduct(fallbackProd as Product);
  };

  return (
    <div className="w-full px-2 sm:px-3 md:px-4 mb-5 select-none">
      {/* Outer Warm Champagne/Ivory Container (Strict Blinkit Light Palette: NO Dark Backgrounds) */}
      <div className="relative rounded-[26px] sm:rounded-[32px] bg-[#FAF5EC] border border-[#E8DEC9] p-3 sm:p-4 shadow-[0_6px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        
        {/* Header: ✦ THE Live Bargain DEALS ✦ */}
        <div className="relative text-center mb-2.5 space-y-1">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[#C5963A] text-xs sm:text-sm">✦</span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#5C3A21]">
              THE
            </span>
            <h2 className="font-serif italic font-normal text-2xl sm:text-3.5xl md:text-4xl text-[#4A1521] px-1 leading-none tracking-tight">
              Live Bargain
            </h2>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#5C3A21]">
              DEALS
            </span>
            <span className="text-[#C5963A] text-xs sm:text-sm">✦</span>
          </div>

          {/* Live Stock-Market Up/Down Ticker Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE3D3] border border-[#DECDB8] text-[#4A1521] text-[10px] sm:text-[11px] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="text-[#6B4B35] font-black uppercase text-[9px] tracking-wider">
                INDEX:
              </span>
              <span className="font-extrabold text-[#2E1C12]">{activeTicker.label}</span>
              <span className="font-mono text-[#2E1C12]">{activeTicker.price}</span>
              
              {activeTicker.isDrop ? (
                <span className="inline-flex items-center text-[#B71C1C] font-black">
                  <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                  <span>{activeTicker.delta}</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-[#2E7D32] font-black">
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                  <span>{activeTicker.delta}</span>
                </span>
              )}

              <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-[#4A1521] text-white text-[8px] font-black uppercase tracking-wider">
                {activeTicker.trend}
              </span>
            </div>
          </div>
        </div>

        {/* Blinkit-Style 3x2 Symmetrical Bento Grid (All 6 Dabbas Perfectly Balanced) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          
          {/* COLUMN 1: Boys' Collection & Girls' Fashion (Split Cards, Zero Dead Space) */}
          <div className="flex flex-col gap-1.5 sm:gap-2.5">
            {/* Tile 1: Boys' Collection */}
            <div
              onClick={() => handleCategoryClick('boys', boysDeal, "Boys' Collection: Streetwear & Hoodies", '320 GSM Loopback & Vintage Washes')}
              className="flex-1 rounded-2xl sm:rounded-3xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
            >
              <div>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#2E1C12] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-block">
                  Up to 60% OFF
                </span>
                <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                  Boys&apos; Collection
                </h4>
              </div>
              <div className="relative w-full aspect-[4/2.7] mt-1 rounded-lg overflow-hidden bg-[#E5D7C3]/40">
                <Image
                  src={boysDeal.thumbnail || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'}
                  alt="Boys' Streetwear"
                  fill
                  sizes="(max-width: 640px) 33vw, 180px"
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                />
              </div>
            </div>

            {/* Tile 2: Girls' Fashion */}
            <div
              onClick={() => handleCategoryClick('girls', girlsDeal, "Girls' Fashion: Y2K & Trendy Fits", 'Resort Co-ords, Crop Jackets & Silks')}
              className="flex-1 rounded-2xl sm:rounded-3xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
            >
              <div>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#2E1C12] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-block">
                  Up to 70% OFF
                </span>
                <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                  Girls&apos; Fashion
                </h4>
              </div>
              <div className="relative w-full aspect-[4/2.7] mt-1 rounded-lg overflow-hidden bg-[#E5D7C3]/40">
                <Image
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                  alt="Girls' Fashion"
                  fill
                  sizes="(max-width: 640px) 33vw, 180px"
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 2: Men's Wear & Shoes/Sneakers */}
          <div className="flex flex-col gap-1.5 sm:gap-2.5">
            {/* Tile 3: Men's Category */}
            <div
              onClick={() => handleCategoryClick('mens', mensDeal, "Men's Wear: The Gentleman's Curation", 'Pure French Linen, Structured Shirts & Trousers')}
              className="flex-1 rounded-2xl sm:rounded-3xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
            >
              <div>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#2E1C12] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-block">
                  Up to 65% OFF
                </span>
                <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                  Men&apos;s Wear
                </h4>
              </div>
              <div className="relative w-full aspect-[4/2.7] mt-1 rounded-lg overflow-hidden bg-[#E5D7C3]/40">
                <Image
                  src={mensDeal.thumbnail || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'}
                  alt="Men's Collection"
                  fill
                  sizes="(max-width: 640px) 33vw, 180px"
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                />
              </div>
            </div>

            {/* Tile 4: Shoes / Footwear Category */}
            <div
              onClick={() => handleCategoryClick('shoes', shoesDeal, "Shoes & Sneakers: Direct Karigar", 'Retro Kicks, Calfskin Loafers & Slides')}
              className="flex-1 rounded-2xl sm:rounded-3xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
            >
              <div>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#2E1C12] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-block">
                  Up to 75% OFF
                </span>
                <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                  Shoes &amp; Sneakers
                </h4>
              </div>
              <div className="relative w-full aspect-[4/2.7] mt-1 rounded-lg overflow-hidden bg-[#E5D7C3]/40">
                <Image
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop"
                  alt="Shoes & Sneakers"
                  fill
                  sizes="(max-width: 640px) 33vw, 180px"
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 3: Women's Wear & BEST BRAND OFFERS */}
          <div className="flex flex-col gap-1.5 sm:gap-2.5">
            {/* Tile 5: Women's Category */}
            <div
              onClick={() => handleCategoryClick('womens', womensDeal, "Women's & Sarees: Bespoke Karigar", 'Pure Silk, Zari & Lucknowi Chikankari')}
              className="flex-1 rounded-2xl sm:rounded-3xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
            >
              <div>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#2E1C12] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-block">
                  Up to 80% OFF
                </span>
                <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                  Women&apos;s &amp; Sarees
                </h4>
              </div>
              <div className="relative w-full aspect-[4/2.7] mt-1 rounded-lg overflow-hidden bg-[#E5D7C3]/40">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"
                  alt="Women's Collection"
                  fill
                  sizes="(max-width: 640px) 33vw, 180px"
                  className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
                />
              </div>
            </div>

            {/* Tile 6: BEST BRAND OFFERS */}
            <div
              onClick={() => handleCategoryClick('brands', brandDeal, "Best Brand Offers: Curated Boutiques", 'Top Verified Local Boutiques with Live Bargains')}
              className="flex-1 rounded-2xl sm:rounded-3xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
            >
              <span className="font-serif font-black text-[9px] sm:text-xs text-[#4A1521] uppercase tracking-wider leading-tight">
                BEST BRAND
              </span>
              <span className="font-serif italic font-normal text-sm sm:text-base text-[#4A1521] leading-none mt-0.5">
                OFFERS
              </span>
              <span className="text-[#C5963A] text-xs mt-1">✦</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-[#7A5B44] mt-0.5 tracking-tight">
                100% Direct Karigar
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Attached Wide Deal Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-[#DECDB8]/80">
          <div
            onClick={() => handleCategoryClick('boys', boysDeal, "Buy 2 at Special Bargain", 'Streetwear Bundles & Verified Overstock')}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] cursor-pointer transition-all shadow-[0_2px_6px_rgba(0,0,0,0.04)] group"
          >
            <span className="text-[10px] sm:text-[11px] font-black text-[#4A1521] truncate">
              BUY 2 AT SPECIAL BARGAIN • Live Counter-Offers
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4A1521] group-hover:translate-x-1 transition-transform shrink-0 ml-1.5" />
          </div>

          <div
            onClick={() => handleCategoryClick('womens', girlsDeal, "Min 50% Off Collection", 'Entire Verified Boutique Range')}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] cursor-pointer transition-all shadow-[0_2px_6px_rgba(0,0,0,0.04)] group"
          >
            <span className="text-[10px] sm:text-[11px] font-black text-[#4A1521] truncate">
              MIN 50% OFF • Real Boutique Verified Overstock
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4A1521] group-hover:translate-x-1 transition-transform shrink-0 ml-1.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
