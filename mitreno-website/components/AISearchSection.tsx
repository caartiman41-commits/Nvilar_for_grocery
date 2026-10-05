'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Upload, Image as ImageIcon, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products-data';
import Image from 'next/image';

interface AISearchSectionProps {
  onOpenProduct: (product: Product) => void;
}

const ROTATING_PROMPTS = [
  'Black linen shirt for a sunset dinner in Goa…',
  'Relaxed minimalist outfit under ₹4,000…',
  'Deconstructed blazer for an art gallery opening…',
  'Heavyweight white hoodie with double reverse pleat trousers…',
  'Breathable 240 GSM linen for warm coastal weather…',
];

export const AISearchSection: React.FC<AISearchSectionProps> = ({
  onOpenProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'visual'>('text');

  // Text AI search results
  const [aiResult, setAiResult] = useState<{
    extractedIntent?: {
      occasion: string;
      vibe: string;
      silhouette: string;
      preferredFabric: string;
    };
    stylistNote?: string;
    matchedProductIds: string[];
    matchRationales?: Record<string, string>;
  } | null>(null);

  // Visual search states
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [visualAnalysis, setVisualAnalysis] = useState<{
    detectedGarment?: string;
    detectedColor?: string;
    detectedSilhouette?: string;
    estimatedFabric?: string;
    styleVibe?: string;
    similarityAnalysis?: string;
    matchedProductIds?: string[];
    matchScores?: Record<string, number>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder prompts
  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % ROTATING_PROMPTS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Execute Text AI Search
  const handleExecuteSearch = async (queryText?: string) => {
    const textToSearch = queryText || searchQuery;
    if (!textToSearch.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSearch }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Image Upload for Visual Search
  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadedImagePreview(base64);
      setIsSearching(true);
      try {
        const res = await fetch('/api/ai/visual-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        setVisualAnalysis(data);
      } catch (err) {
        console.error('Visual search error:', err);
      } finally {
        setIsSearching(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const matchedProducts = aiResult
    ? PRODUCTS.filter((p) => aiResult.matchedProductIds?.includes(p.id))
    : visualAnalysis
    ? PRODUCTS.filter((p) => visualAnalysis.matchedProductIds?.includes(p.id))
    : [];

  return (
    <div id="ai-discover-container" className="w-full min-h-screen bg-[#FAFAFC] pt-24 pb-20 px-4 md:px-14">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1246B8]/10 text-[#1246B8] text-xs font-mono tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEMANTIC DISCOVERY ENGINE</span>
          </div>
          <h1 className="font-serif-editorial text-3xl md:text-5xl font-normal text-[#0A0F1D] tracking-tight">
            What are you looking for?
          </h1>
          <p className="text-sm text-slate-600 font-light">
            Search naturally by mood, occasion, fabric weight, or upload a reference image to find matching pieces.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-full border border-slate-200/80 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setSearchMode('text')}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                searchMode === 'text'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              Natural Language Search
            </button>
            <button
              onClick={() => setSearchMode('visual')}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                searchMode === 'visual'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Search with Image</span>
            </button>
          </div>
        </div>

        {/* Text Search Box */}
        {searchMode === 'text' ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch();
              }}
              className="relative flex items-center bg-white rounded-2xl border-2 border-slate-200 focus-within:border-[#1246B8] shadow-lg shadow-slate-200/50 transition-all overflow-hidden p-2"
            >
              <div className="p-3 text-slate-400">
                <Search className="w-5 h-5 text-[#1246B8]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ROTATING_PROMPTS[promptIndex]}
                className="w-full py-2.5 px-2 text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 rounded-xl bg-[#1246B8] hover:bg-[#0E3692] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-70"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Inspiration Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Try searching:</span>
              {ROTATING_PROMPTS.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(prompt);
                    handleExecuteSearch(prompt);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 hover:border-[#1246B8]/30 border border-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Visual Search Dropzone */
          <div className="max-w-2xl mx-auto space-y-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#1246B8]/40 hover:border-[#1246B8] bg-white rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center gap-4 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />

              {uploadedImagePreview ? (
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                  <Image
                    src={uploadedImagePreview}
                    alt="Uploaded Reference"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                    Click to Change Image
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1246B8] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
              )}

              <div>
                <p className="text-base font-bold text-slate-900">
                  {uploadedImagePreview ? 'Image Loaded' : 'Upload or Drag & Drop Garment Photo'}
                </p>
                <p className="text-xs text-slate-500 font-light mt-1">
                  AI will inspect fabric weave, collar geometry, and silhouette to match our catalog
                </p>
              </div>

              {isSearching && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1246B8] bg-blue-50 px-4 py-2 rounded-full animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Neural vision analyzing garment attributes...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Intent & Vision Breakdown */}
        <AnimatePresence>
          {aiResult?.extractedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1246B8]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1246B8] font-bold">
                    AI Intent Extraction
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {matchedProducts.length} Pieces Ranked
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Occasion</span>
                  <span className="font-semibold text-slate-900">{aiResult.extractedIntent.occasion}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Vibe</span>
                  <span className="font-semibold text-slate-900">{aiResult.extractedIntent.vibe}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Silhouette</span>
                  <span className="font-semibold text-slate-900">{aiResult.extractedIntent.silhouette}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Fabric Drape</span>
                  <span className="font-semibold text-slate-900">{aiResult.extractedIntent.preferredFabric}</span>
                </div>
              </div>

              {aiResult.stylistNote && (
                <p className="text-xs text-slate-600 italic bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  “{aiResult.stylistNote}”
                </p>
              )}
            </motion.div>
          )}

          {visualAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1246B8]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1246B8] font-bold">
                    Visual Silhouette Detection
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {visualAnalysis.styleVibe}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase text-[10px]">Garment</span>
                  <span className="font-semibold text-slate-900">{visualAnalysis.detectedGarment}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase text-[10px]">Color Palette</span>
                  <span className="font-semibold text-slate-900">{visualAnalysis.detectedColor}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase text-[10px]">Cut Profile</span>
                  <span className="font-semibold text-slate-900">{visualAnalysis.detectedSilhouette}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 block uppercase text-[10px]">Estimated Texture</span>
                  <span className="font-semibold text-slate-900">{visualAnalysis.estimatedFabric}</span>
                </div>
              </div>

              {visualAnalysis.similarityAnalysis && (
                <p className="text-xs text-slate-600 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  {visualAnalysis.similarityAnalysis}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-editorial text-2xl font-normal text-[#0A0F1D]">
              {matchedProducts.length > 0 ? 'Curated Semantic Matches' : 'Explore Featured Pieces'}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {(matchedProducts.length > 0 ? matchedProducts : PRODUCTS).length} Styles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(matchedProducts.length > 0 ? matchedProducts : PRODUCTS).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#1246B8]/40 hover:shadow-lg transition-all group flex flex-col"
              >
                <div
                  className="relative h-72 w-full bg-slate-100 cursor-pointer overflow-hidden"
                  onClick={() => onOpenProduct(product)}
                >
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.gsm > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
                      {product.gsm} GSM
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#1246B8] font-bold">
                      {product.fit} • {product.collection.split('—')[0]}
                    </span>
                    <h3
                      onClick={() => onOpenProduct(product)}
                      className="font-bold text-[#0A0F1D] text-sm mt-0.5 group-hover:text-[#1246B8] transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-mono font-bold text-[#0A0F1D] text-sm">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
