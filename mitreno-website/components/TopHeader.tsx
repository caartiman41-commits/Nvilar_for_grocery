'use client';

import React, { useState } from 'react';
import { Search, X, MapPin, ChevronDown, SlidersHorizontal, Check } from 'lucide-react';

export interface CategoryFilter {
  id: string;
  label: string;
  emoji?: string;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'mens', label: "Men's", emoji: '👕' },
  { id: 'womens', label: "Women's", emoji: '👗' },
  { id: 'tshirts', label: 'T-Shirts', emoji: '👕' },
  { id: 'shoes', label: 'Shoes', emoji: '👟' },
  { id: 'accessories', label: 'Accessories', emoji: '🧢' },
];

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'gsm-desc';
  onSortChange: (val: 'featured' | 'price-asc' | 'price-desc' | 'gsm-desc') => void;
  onOpenProfile?: () => void;
  onOpenAIChat?: () => void;
  selectedCity?: { name: string; state_code: string } | null;
  onOpenCityExplorer?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  selectedCity,
  onOpenCityExplorer,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <header
        id="top-sticky-header"
        className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-neutral-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all"
      >
      <div className="max-w-7xl mx-auto px-3.5 md:px-6 pt-2.5 pb-2 space-y-2.5">
        {/* ROW 1: Location Selector & Brand Mark with Filter Dropdown */}
        <div className="flex items-center justify-between">
          {/* Location Selector */}
          <button
            type="button"
            onClick={onOpenCityExplorer}
            className="flex flex-col group cursor-pointer text-left focus:outline-none select-none transition-transform active:scale-95"
            title="Click to explore and select a different city or state"
          >
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">
              Exploring
            </span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#1246B8] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black text-neutral-900 group-hover:text-[#1246B8] transition-colors tracking-tight">
                {selectedCity ? `${selectedCity.name}, ${selectedCity.state_code}` : 'Mumbai, MH'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Brand Mark & Filter Dropdown */}
          <div className="flex items-center gap-2.5 relative">
            {/* Mitreno Brand Mark */}
            <div className="flex items-center select-none">
              <span className="font-serif-editorial text-2xl font-black tracking-tight text-neutral-950">
                Mitreno
              </span>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                id="header-filter-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200/80 text-[11px] font-black text-neutral-900 transition-all select-none cursor-pointer active:scale-95 shadow-2xs"
              >
                <SlidersHorizontal className="w-3 h-3 text-neutral-800" />
                <span>Filter</span>
                <ChevronDown className={`w-3 h-3 text-neutral-600 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Options with Ticks */}
              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsFilterOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-neutral-200/90 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[9px] font-black tracking-widest text-neutral-400 uppercase border-b border-neutral-100 mb-1">
                      Sort & Filter
                    </div>
                    {[
                      { value: 'featured', label: 'Curated Runway' },
                      { value: 'price-asc', label: 'Price: Low to High' },
                      { value: 'price-desc', label: 'Price: High to Low' },
                      { value: 'gsm-desc', label: 'Fabric Weight (GSM)' },
                    ].map((opt) => {
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            onSortChange(opt.value as any);
                            setIsFilterOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#1246B8] stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Omni-Search Input */}
        <div className="relative w-full">
          <div className="relative flex items-center group">
            <Search className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none group-focus-within:text-neutral-900 transition-colors z-10" />
            <input
              id="header-omni-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search local stores, streetwear, jackets..."
              className="w-full pl-11 pr-10 py-2.5 md:py-3 rounded-2xl bg-neutral-100/90 focus:bg-white text-xs md:text-sm text-neutral-900 font-semibold placeholder:text-neutral-400 border border-neutral-200/80 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 shadow-2xs outline-none transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 3: Curated Market Filter Strip (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-3.5 px-3.5 md:-mx-6 md:px-6">
          {CATEGORY_FILTERS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-pill-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-neutral-950 text-white font-extrabold shadow-md border border-neutral-950 scale-[1.02]'
                    : 'bg-neutral-100/80 hover:bg-neutral-200/70 border border-neutral-200/70 text-neutral-700 font-bold shadow-2xs'
                }`}
              >
                {cat.emoji && (
                  <span className={`text-[13px] ${!isSelected && 'opacity-80'}`}>
                    {cat.emoji}
                  </span>
                )}
                <span className="tracking-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      </header>
    </>
  );
};

