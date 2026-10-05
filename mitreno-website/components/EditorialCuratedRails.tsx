'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle2, Star, ShieldCheck, Tag } from 'lucide-react';
import { Product } from '@/lib/products-data';

interface EditorialCuratedRailsProps {
  products: Product[];
  allShops: any[];
  onOpenCategoryDeals: (categoryKey: string, title: string, subtitle?: string) => void;
  onOpenProduct: (product: Product) => void;
  onOpenStoreProfile?: (shop: any) => void;
}

export const EditorialCuratedRails: React.FC<EditorialCuratedRailsProps> = ({
  products,
  allShops,
  onOpenCategoryDeals,
  onOpenProduct,
  onOpenStoreProfile,
}) => {
  // Curated Fallback or Matching Products
  const menLinen = products.find((p) => p.name?.toLowerCase().includes('linen') || p.category === 'tops') || products[0];
  const menStreetwear = products.find((p) => p.name?.toLowerCase().includes('hoodie') || p.name?.toLowerCase().includes('terry')) || products[1] || products[0];
  const menPants = products.find((p) => p.category === 'bottoms') || products[2] || products[0];

  const womenSaree = products.find((p) => p.name?.toLowerCase().includes('silk') || p.name?.toLowerCase().includes('chikankari')) || products[3] || products[0];
  const womenKurti = products.find((p) => p.name?.toLowerCase().includes('kurta') || p.name?.toLowerCase().includes('resort')) || products[4] || products[0];
  const womenCoord = products.find((p) => p.category === 'accessories' || p.category === 'tops') || products[5] || products[0];

  const shoesSneaker = products.find((p) => p.category === 'shoes') || products[6] || products[0];

  return (
    <div className="w-full space-y-5 sm:space-y-6 px-2 sm:px-3 md:px-4 mb-6 select-none">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: FOR HIM (The Gentleman's Curation)
          Warm Champagne Gold Luxury Banner + 3-Card Pedestals
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] sm:rounded-[30px] bg-[#FAF5EC] border border-[#E8DEC9] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Section Header Bar with Gold Accent */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8DEC9]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5963A]" />
            <h3 className="font-serif italic text-base sm:text-lg md:text-xl font-bold text-[#4A1521] tracking-tight">
              For Him <span className="font-sans font-normal text-xs text-[#7A5B44] not-italic ml-1 hidden sm:inline">• The Gentleman&apos;s Curation</span>
            </h3>
          </div>
          <button
            onClick={() => onOpenCategoryDeals('mens', "For Him: Gentleman's Curation", 'Pure European Linen, Streetwear & Tailored Trousers')}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#4A1521] hover:text-[#2E1C12] transition-colors cursor-pointer group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4A1521] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3-Column Pedestal Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {/* Card 1: Linen Shirts */}
          <div
            onClick={() => onOpenCategoryDeals('mens', "For Him: Structured Linen Shirts", 'Normandy French Linen Under ₹1,999')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src={menLinen.thumbnail || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'}
                alt="Linen Shirts"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  UNDER ₹1,999*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Linen Shirts</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                MIN. 40% OFF*
              </span>
            </div>
          </div>

          {/* Card 2: 320 GSM Hoodies */}
          <div
            onClick={() => onOpenCategoryDeals('mens', "For Him: Heavyweight Streetwear", 'Loopback Terry 320+ GSM Pieces')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src={menStreetwear.thumbnail || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'}
                alt="Heavyweight Streetwear"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  UNDER ₹2,499*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Streetwear</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                MIN. 50% OFF*
              </span>
            </div>
          </div>

          {/* Card 3: Tailored Pants */}
          <div
            onClick={() => onOpenCategoryDeals('mens', "For Him: Pleated Wool Trousers", 'High-Twist Wool & Belgian Linen Tailoring')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src={menPants.thumbnail || 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'}
                alt="Pleated Trousers"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  UNDER ₹2,999*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Pleated Pants</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                MIN. 45% OFF*
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: FOR HER (The Bespoke Edit)
          Royal Wine/Rose Luxury Banner + 3-Card Pedestals
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] sm:rounded-[30px] bg-[#FAF5EC] border border-[#E8DEC9] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Section Header Bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8DEC9]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9E2A2B]" />
            <h3 className="font-serif italic text-base sm:text-lg md:text-xl font-bold text-[#4A1521] tracking-tight">
              For Her <span className="font-sans font-normal text-xs text-[#7A5B44] not-italic ml-1 hidden sm:inline">• The Bespoke Karigar Edit</span>
            </h3>
          </div>
          <button
            onClick={() => onOpenCategoryDeals('womens', "For Her: Bespoke Karigar Edit", 'Handcrafted Sarees, Chikankari Suits & Co-ords')}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#4A1521] hover:text-[#2E1C12] transition-colors cursor-pointer group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4A1521] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3-Column Pedestal Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {/* Card 1: Pure Chanderi Sarees */}
          <div
            onClick={() => onOpenCategoryDeals('womens', "For Her: Pure Chanderi & Zari Sarees", 'Direct Weavers of Chanderi & Varanasi')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"
                alt="Pure Silk Sarees"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  MIN. 50% OFF*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Zari Sarees</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                HANDLOOM SILK
              </span>
            </div>
          </div>

          {/* Card 2: Hand-Embroidered Chikankari */}
          <div
            onClick={() => onOpenCategoryDeals('womens', "For Her: Chikankari Kurta Sets", 'Lucknowi Handwork with Modal & Georgette')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800"
                alt="Chikankari Kurta Sets"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  MIN. 60% OFF*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Kurta Sets</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                DIRECT KARIGAR
              </span>
            </div>
          </div>

          {/* Card 3: Resort Co-ords */}
          <div
            onClick={() => onOpenCategoryDeals('womens', "For Her: Resort Linen Co-ords", 'Effortless Summer Silhouettes')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
                alt="Resort Co-ords"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  UNDER ₹2,499*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Resort Co-ords</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                MIN. 45% OFF*
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: FOOTWEAR & LEATHER (Direct Karigar Craft)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] sm:rounded-[30px] bg-[#FAF5EC] border border-[#E8DEC9] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Section Header Bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8DEC9]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A5A36]" />
            <h3 className="font-serif italic text-base sm:text-lg md:text-xl font-bold text-[#4A1521] tracking-tight">
              Footwear &amp; Leather <span className="font-sans font-normal text-xs text-[#7A5B44] not-italic ml-1 hidden sm:inline">• Direct Karigar Craft</span>
            </h3>
          </div>
          <button
            onClick={() => onOpenCategoryDeals('shoes', 'Footwear & Artisan Leather', 'Retro Sneakers, Italian Derbies & Leather Slides')}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#4A1521] hover:text-[#2E1C12] transition-colors cursor-pointer group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4A1521] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3-Column Pedestal Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {/* Card 1: Retro Sneakers */}
          <div
            onClick={() => onOpenCategoryDeals('shoes', 'Retro Street Sneakers', 'Vibrant Gum Soles & Suede Accents')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"
                alt="Retro Street Sneakers"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  MIN. 40% OFF*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Retro Sneakers</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                LIMITED RUN
              </span>
            </div>
          </div>

          {/* Card 2: Handcrafted Loafers */}
          <div
            onClick={() => onOpenCategoryDeals('shoes', 'Handcrafted Leather Loafers', 'Full-Grain Calfskin & Goodyear Welt')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src="https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800"
                alt="Leather Loafers"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  MIN. 45% OFF*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Leather Loafers</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                FULL-GRAIN
              </span>
            </div>
          </div>

          {/* Card 3: Artisan Slides */}
          <div
            onClick={() => onOpenCategoryDeals('shoes', 'Artisan Leather Slides', 'Molded Footbed & Hand-Stitched Leather')}
            className="rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-1.5 sm:p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.11)] active:translate-y-[1px] group"
          >
            <div className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-[#E5D7C3]/40">
              <Image
                src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800"
                alt="Artisan Leather Slides"
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-1 sm:p-1.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                  MIN. 50% OFF*
                </span>
              </div>
            </div>
            <div className="mt-1.5 text-center">
              <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#2E1C12] truncate">Artisan Slides</h4>
              <span className="text-[8px] sm:text-[9px] font-black text-[#4A1521] uppercase tracking-wider block mt-0.5">
                COMFORT WEAR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: BRANDS TO BAG (Curated Verified Boutiques Showcase)
          Exact match to user's screenshot with blue checkmark badges!
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] sm:rounded-[30px] bg-[#FAF5EC] border border-[#E8DEC9] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8DEC9]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#C5963A] text-xs">✦</span>
            <h3 className="font-serif italic text-base sm:text-lg md:text-xl font-bold text-[#4A1521] tracking-tight">
              Brands to Bag <span className="font-sans font-normal text-xs text-[#7A5B44] not-italic ml-1 hidden sm:inline">• Top Verified Ateliers</span>
            </h3>
          </div>
          <button
            onClick={() => onOpenCategoryDeals('brands', 'Brands to Bag: Curated Boutiques', 'Direct Deals from Verified Boutique Ateliers')}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#4A1521] hover:text-[#2E1C12] transition-colors cursor-pointer group"
          >
            <span>All Boutiques</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#4A1521] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Horizontal Verified Boutique Cards Rail */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {allShops.map((shop) => (
            <div
              key={shop.id || shop.name}
              onClick={() => {
                if (onOpenStoreProfile) {
                  onOpenStoreProfile(shop);
                } else {
                  onOpenCategoryDeals('brands', `Atelier: ${shop.name}`, `${shop.locationName || 'Verified Boutique'} • Verified Direct Deals`);
                }
              }}
              className="w-[125px] sm:w-[145px] rounded-2xl bg-[#EFE3D3] hover:bg-[#EAE0D1] border border-[#DFD1BF] p-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] active:scale-95 shrink-0 group"
            >
              {/* Boutique Circular Logo with Verified Ring */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#4A1521] to-[#C5963A] shadow-2xs">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-neutral-200">
                  <Image
                    src={shop.logo || 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400'}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                {shop.verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2874F0] fill-current" />
                  </span>
                )}
              </div>

              {/* Boutique Name & Verification Tick */}
              <div className="flex items-center justify-center gap-1 mt-1.5 w-full">
                <span className="font-serif font-black text-xs text-[#2E1C12] truncate max-w-[90px]">
                  {shop.name}
                </span>
                {shop.verified && (
                  <CheckCircle2 className="w-3 h-3 text-[#2874F0] shrink-0" />
                )}
              </div>

              {/* Star Rating & Location */}
              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-800 mt-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{shop.rating || '4.8'}</span>
              </div>

              <span className="text-[8px] text-[#7A5B44] font-medium truncate w-full mt-0.5">
                {shop.locationName ? shop.locationName.split(',')[0] : 'Kolkata'}
              </span>

              {/* Deal Tag */}
              <div className="mt-1.5 px-2 py-0.5 rounded-full bg-[#4A1521] text-white text-[8px] font-black uppercase tracking-wider">
                Live Deals
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
