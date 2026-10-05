'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Eye, Bookmark, Check } from 'lucide-react';
import { COLLECTIONS, PRODUCTS, Product } from '@/lib/products-data';
import Image from 'next/image';

interface CuratedCollectionsProps {
  onOpenProduct: (product: Product) => void;
  onOpenTryOn: (product: Product) => void;
  onToggleSave: (productId: string) => void;
  savedProductIds: string[];
}

export const CuratedCollections: React.FC<CuratedCollectionsProps> = ({
  onOpenProduct,
  onOpenTryOn,
  onToggleSave,
  savedProductIds,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  const filteredProducts =
    selectedCollection === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => {
          if (selectedCollection === 'linen-edit') return p.collection.includes('Linen');
          if (selectedCollection === 'after-dark') return p.collection.includes('After Dark');
          if (selectedCollection === 'monochrome') return p.collection.includes('Monochrome');
          if (selectedCollection === 'oversized') return p.fit === 'Oversized';
          if (selectedCollection === 'essentials') return p.collection.includes('Essentials');
          return true;
        });

  return (
    <section
      id="curated-collections-section"
      className="w-full bg-[#FFFFFF] py-20 px-4 md:px-14 border-t border-slate-100"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#1246B8] font-bold">
              CURATED DROPS • EDITORIAL SELECTION
            </span>
            <h2 className="font-serif-editorial text-3xl md:text-5xl font-normal text-[#0A0F1D] tracking-tight">
              Architectural Silhouettes
            </h2>
            <p className="text-sm text-slate-600 max-w-xl font-light">
              Crafted with uncompromising density and pure European flax, silk, and virgin wool.
              Experience every garment in your own fit before ordering.
            </p>
          </div>

          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCollection('all')}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCollection === 'all'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-[#0A0F1D] hover:bg-slate-200/60'
              }`}
            >
              All Drops
            </button>
            {COLLECTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCollection(c.id)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCollection === c.id
                    ? 'bg-[#1246B8] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-[#0A0F1D] hover:bg-slate-200/60'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Masonry Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => {
            const isSaved = savedProductIds.includes(product.id);
            // Asymmetrical layout styling
            const isTall = index % 3 === 0;

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative flex flex-col bg-[#FAFAFA] rounded-2xl overflow-hidden border border-slate-200/70 hover:border-[#1246B8]/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Image Container with Hover Zoom & Action Overlay */}
                <div
                  className={`relative w-full ${
                    isTall ? 'h-[440px]' : 'h-[360px]'
                  } bg-slate-100 overflow-hidden cursor-pointer`}
                  onClick={() => onOpenProduct(product)}
                >
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    referrerPolicy="no-referrer"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono tracking-wider text-slate-900 font-semibold border border-white/60 shadow-sm">
                        {product.collection.split('—')[0].trim()}
                      </span>
                      {product.gsm > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[9px] font-mono text-white/90">
                          {product.gsm} GSM
                        </span>
                      )}
                    </div>

                    {/* Bookmark / Save to Edit Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(product.id);
                      }}
                      className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all ${
                        isSaved
                          ? 'bg-[#1246B8] text-white shadow-md'
                          : 'bg-white/80 text-slate-700 hover:text-[#1246B8] hover:bg-white'
                      }`}
                      title={isSaved ? 'Saved in My Edit' : 'Save to My Edit'}
                      aria-label="Save look"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Hover Overlay with Quick Try-On CTA */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTryOn(product);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#1246B8] hover:bg-[#0E3692] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>✦ Try It On</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProduct(product);
                        }}
                        className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 transition-transform hover:scale-105"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-5 flex flex-col justify-between flex-1 bg-white space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{product.fit} Silhouette</span>
                      <span>{product.fabric.split(',')[0]}</span>
                    </div>
                    <h3
                      onClick={() => onOpenProduct(product)}
                      className="font-bold text-[#0A0F1D] text-base mt-1 group-hover:text-[#1246B8] transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-light">
                      {product.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="font-mono text-base font-bold text-[#0A0F1D]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-mono ml-2">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenTryOn(product)}
                      className="text-xs font-bold tracking-wider text-[#1246B8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>AI MIRROR</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
