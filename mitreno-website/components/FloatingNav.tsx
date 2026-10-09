'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, Bookmark, Search, User, Compass, Layers, BookOpen } from 'lucide-react';

export type NavTab = 'runway' | 'discover' | 'ai-mirror' | 'wardrobe' | 'my-edit' | 'journal';

interface FloatingNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cartCount: number;
  savedCount: number;
  onOpenBag: () => void;
  onOpenAIChat: () => void;
  onOpenAIMirror: () => void;
  onOpenProfile: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  savedCount,
  onOpenBag,
  onOpenAIChat,
  onOpenAIMirror,
  onOpenProfile,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Floating Navigation */}
      <header
        id="desktop-floating-nav"
        className={`fixed top-5 left-0 right-0 z-40 hidden md:flex justify-center items-center px-6 transition-all duration-300 pointer-events-none`}
      >
        <div
          className={`pointer-events-auto flex items-center justify-between gap-6 px-6 py-3 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
              : 'bg-white/80 backdrop-blur-lg border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
          }`}
        >
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onSelectTab('runway')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <span className="font-serif-editorial text-2xl font-bold tracking-widest text-[#0A0F1D] group-hover:text-[#1246B8] transition-colors">
              NVILAR
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1246B8]"></span>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/40">
            <button
              id="nav-tab-runway"
              onClick={() => onSelectTab('runway')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'runway'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              Runway
            </button>

            <button
              id="nav-tab-discover"
              onClick={() => onSelectTab('discover')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'discover'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              Discover
            </button>

            <button
              id="nav-tab-ai-mirror"
              onClick={onOpenAIMirror}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-mirror'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#1246B8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1246B8] group-hover:text-white" />
              <span>AI Mirror</span>
            </button>

            <button
              id="nav-tab-wardrobe"
              onClick={() => onSelectTab('wardrobe')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'wardrobe'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              Wardrobe
            </button>

            <button
              id="nav-tab-my-edit"
              onClick={() => onSelectTab('my-edit')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'my-edit'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              <span>My Edit</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-journal"
              onClick={() => onSelectTab('journal')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-[#1246B8] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0A0F1D]'
              }`}
            >
              Journal
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              id="nav-search-trigger"
              onClick={() => onSelectTab('discover')}
              title="Search styles"
              className="p-2 rounded-full text-slate-700 hover:text-[#1246B8] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              id="nav-ai-concierge-trigger"
              onClick={onOpenAIChat}
              title="NVILAR AI Stylist"
              className="px-3 py-1.5 rounded-full bg-[#1246B8]/10 text-[#1246B8] hover:bg-[#1246B8] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-[#1246B8]/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>NVILAR AI</span>
            </button>

            <button
              id="nav-bag-trigger"
              onClick={onOpenBag}
              className="relative p-2 rounded-full text-slate-800 hover:text-[#1246B8] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1246B8] text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              id="nav-profile-trigger"
              onClick={onOpenProfile}
              title="Profile & Preferences"
              className="p-2 rounded-full text-slate-700 hover:text-[#1246B8] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Minimal Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex md:hidden items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/60">
        <button
          onClick={() => onSelectTab('runway')}
          className="flex items-center gap-1.5 focus:outline-none"
        >
          <span className="font-serif-editorial text-xl font-bold tracking-widest text-[#0A0F1D]">
            NVILAR
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1246B8]"></span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIChat}
            className="p-2 rounded-full text-[#1246B8] bg-blue-50 border border-blue-100"
            title="NVILAR AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBag}
            className="relative p-2 rounded-full text-slate-800"
            title="Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#1246B8] text-white text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Floating Navigation */}
      <div
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        <button
          onClick={() => onSelectTab('runway')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'runway' ? 'text-[#1246B8] font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">Runway</span>
        </button>

        <button
          onClick={() => onSelectTab('discover')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'discover' ? 'text-[#1246B8] font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">Discover</span>
        </button>

        <button
          onClick={onOpenAIMirror}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-[#1246B8] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1246B8] mt-1">
            AI Mirror
          </span>
        </button>

        <button
          onClick={() => onSelectTab('wardrobe')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'wardrobe' ? 'text-[#1246B8] font-bold' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">Wardrobe</span>
        </button>

        <button
          onClick={() => onSelectTab('my-edit')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors relative ${
            activeTab === 'my-edit' ? 'text-[#1246B8] font-bold' : 'text-slate-500'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wider">My Edit</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#1246B8]"></span>
          )}
        </button>
      </div>
    </>
  );
};
