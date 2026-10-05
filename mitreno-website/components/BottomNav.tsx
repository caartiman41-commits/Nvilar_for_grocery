'use client';

import React from 'react';
import { Home, ShoppingBag, Box, User, MessageCircle } from 'lucide-react';

export type BottomNavTab = 'home' | 'feed' | 'cart' | 'chats' | 'profile';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, cartCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] transition-all duration-300">
      <div className="w-full flex items-center justify-between px-2 pt-1.5 pb-1 relative max-w-lg mx-auto">
        
        {/* Nav Items */}
        <div className="flex items-center justify-between w-full">
          {/* Explore / Home */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-11 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'home' ? 'text-[#1246B8]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'home' ? 'bg-[#1246B8]/10 text-[#1246B8]' : ''
            }`}>
              <Home 
                className={`w-[22px] h-[22px] transition-transform duration-200 ${activeTab === 'home' ? 'scale-105 fill-[#1246B8]/20' : ''}`} 
                strokeWidth={activeTab === 'home' ? 2.4 : 1.7} 
              />
            </div>
            <span className={`text-[10px] tracking-tight ${activeTab === 'home' ? 'font-bold text-[#1246B8]' : 'font-medium'}`}>
              Explore
            </span>
          </button>

          {/* Drops */}
          <button
            onClick={() => onTabChange('feed')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-11 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'feed' ? 'text-[#1246B8]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'feed' ? 'bg-[#1246B8]/10 text-[#1246B8]' : ''
            }`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={activeTab === 'feed' ? 2.4 : 1.7} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`w-[22px] h-[22px] transition-transform duration-200 ${activeTab === 'feed' ? 'scale-105 fill-[#1246B8]/20' : ''}`}
              >
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                <path d="M10 9l5 3-5 3z" fill={activeTab === 'feed' ? '#1246B8' : 'none'} />
              </svg>
            </div>
            <span className={`text-[10px] tracking-tight ${activeTab === 'feed' ? 'font-bold text-[#1246B8]' : 'font-medium'}`}>
              Drops
            </span>
          </button>

          {/* Chats */}
          <button
            onClick={() => onTabChange('chats')}
            className={`relative flex flex-col items-center justify-center gap-1 w-full h-11 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'chats' ? 'text-[#1246B8]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center relative ${
              activeTab === 'chats' ? 'bg-[#1246B8]/10 text-[#1246B8]' : ''
            }`}>
              <MessageCircle 
                className={`w-[22px] h-[22px] transition-transform duration-200 ${activeTab === 'chats' ? 'scale-105 fill-[#1246B8]/20' : ''}`} 
                strokeWidth={activeTab === 'chats' ? 2.4 : 1.7} 
              />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                2
              </span>
            </div>
            <span className={`text-[10px] tracking-tight ${activeTab === 'chats' ? 'font-bold text-[#1246B8]' : 'font-medium'}`}>
              Chats
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-11 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'profile' ? 'text-[#1246B8]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              activeTab === 'profile' ? 'bg-[#1246B8]/10 text-[#1246B8]' : ''
            }`}>
              <User 
                className={`w-[22px] h-[22px] transition-transform duration-200 ${activeTab === 'profile' ? 'scale-105 fill-[#1246B8]/20' : ''}`} 
                strokeWidth={activeTab === 'profile' ? 2.4 : 1.7} 
              />
            </div>
            <span className={`text-[10px] tracking-tight ${activeTab === 'profile' ? 'font-bold text-[#1246B8]' : 'font-medium'}`}>
              Profile
            </span>
          </button>

          {/* Bag */}
          <button
            onClick={() => onTabChange('cart')}
            className={`relative flex flex-col items-center justify-center gap-1 w-full h-11 transition-all active:scale-95 cursor-pointer ${
              activeTab === 'cart' ? 'text-[#1246B8]' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={`px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center relative ${
              activeTab === 'cart' ? 'bg-[#1246B8]/10 text-[#1246B8]' : ''
            }`}>
              <ShoppingBag 
                className={`w-[22px] h-[22px] transition-transform duration-200 ${activeTab === 'cart' ? 'scale-105 fill-[#1246B8]/20' : ''}`} 
                strokeWidth={activeTab === 'cart' ? 2.4 : 1.7} 
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#1246B8] text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-tight ${activeTab === 'cart' ? 'font-bold text-[#1246B8]' : 'font-medium'}`}>
              Bag
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

