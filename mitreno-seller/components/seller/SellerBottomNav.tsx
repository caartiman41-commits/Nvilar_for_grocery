'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  MoreHorizontal,
  Store,
  Film,
  Sparkles,
  BarChart3,
  Settings,
  ArrowLeft,
  X,
  Zap,
  Receipt,
} from 'lucide-react';
import { SellerTab } from './SellerSidebar';

interface SellerBottomNavProps {
  activeTab: SellerTab;
  onTabChange: (tab: SellerTab) => void;
  metrics?: {
    new_orders?: number;
    unread_chats?: number;
  };
  onExit: () => void;
}

export const SellerBottomNav: React.FC<SellerBottomNavProps> = ({
  activeTab,
  onTabChange,
  metrics,
  onExit,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const primaryTabs: {
    id: SellerTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Studio',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      badge: metrics?.new_orders && metrics.new_orders > 0 ? metrics.new_orders : undefined,
    },
    {
      id: 'products',
      label: 'Catalog',
      icon: ShoppingBag,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      badge: metrics?.unread_chats && metrics.unread_chats > 0 ? metrics.unread_chats : undefined,
    },
  ];

  const moreItems: {
    id: SellerTab;
    label: string;
    icon: React.ElementType;
    desc: string;
  }[] = [
    {
      id: 'hyperlocal',
      label: '⚡ Nearby Orders',
      icon: Zap,
      desc: 'Same-day orders under 10 km',
    },
    {
      id: 'profile',
      label: 'Store Profile',
      icon: Store,
      desc: 'Stories, bio & showroom grid',
    },
    {
      id: 'reels',
      label: 'Reels & Drops',
      icon: Film,
      desc: 'Upload visual drops for city feed',
    },
    {
      id: 'ads',
      label: 'Ads & Promotions',
      icon: Sparkles,
      desc: 'Boost boutique & search listings',
    },
    {
      id: 'analytics',
      label: 'Sales & Analytics',
      icon: BarChart3,
      desc: 'Revenue insights & order trends',
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: Receipt,
      desc: 'Platform fee, commission & GST invoices',
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: Settings,
      desc: 'Payout UPI & store preferences',
    },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200 px-2 py-2 flex items-center justify-around safe-area-bottom shadow-lg">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive ? 'text-amber-600 font-bold' : 'text-neutral-500 font-medium hover:text-neutral-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-600' : 'text-neutral-500'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-black flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-amber-600 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setShowMoreDrawer(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
            ['profile', 'reels', 'ads', 'analytics', 'settings'].includes(activeTab)
              ? 'text-amber-600 font-bold'
              : 'text-neutral-500 font-medium hover:text-neutral-900'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">More</span>
          {['profile', 'reels', 'ads', 'analytics', 'settings'].includes(activeTab) && (
            <div className="w-1 h-1 rounded-full bg-amber-600 mt-0.5" />
          )}
        </button>
      </nav>

      {/* Slide-Up More Drawer */}
      {showMoreDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full bg-white border-t border-neutral-200 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 safe-area-bottom text-neutral-900 shadow-2xl"
          >
            {/* Drawer handle */}
            <div className="w-12 h-1.5 rounded-full bg-neutral-300 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-950">More Store Tools</h3>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setShowMoreDrawer(false);
                    }}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-colors ${
                      isActive
                        ? 'bg-amber-50 border border-amber-300 text-amber-800'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-amber-100 text-amber-700' : 'bg-neutral-200/80 text-neutral-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-neutral-950">{item.label}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 truncate">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Exit Mitreno app */}
            <div className="mt-5 pt-3 border-t border-neutral-100">
              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onExit();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to Mitreno Customer App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
