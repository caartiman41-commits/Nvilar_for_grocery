'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  Store,
  Film,
  Sparkles,
  BarChart3,
  Settings,
  ArrowLeft,
  BadgeCheck,
  CircleDot,
  ExternalLink,
  Zap,
  Receipt,
  Crown,
} from 'lucide-react';

export type SellerTab =
  | 'dashboard'
  | 'orders'
  | 'hyperlocal'
  | 'products'
  | 'chat'
  | 'profile'
  | 'ads'
  | 'analytics'
  | 'billing'
  | 'settings';

interface SellerSidebarProps {
  activeTab: SellerTab;
  onTabChange: (tab: SellerTab) => void;
  shop: {
    id: string;
    name: string;
    logo_url?: string;
    city?: string;
    category?: string;
    rating?: number;
    is_verified?: boolean;
    status?: string;
    plan_type?: string;
  };
  metrics?: {
    new_orders?: number;
    unread_chats?: number;
    total_products?: number;
    hyperlocal_orders?: number;
  };
  onOpenUpgradePlan?: () => void;
  onExit: () => void;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenUpgradePlan,
  shop,
  metrics,
  onExit,
}) => {
  const [activePlanId, setActivePlanId] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mitreno_seller_active_plan') || shop.plan_type || 'pay_as_you_sell';
    }
    return shop.plan_type || 'pay_as_you_sell';
  });

  React.useEffect(() => {
    if (shop.plan_type) {
      setActivePlanId(shop.plan_type);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mitreno_seller_active_plan', shop.plan_type);
      }
    }
  }, [shop.plan_type]);

  React.useEffect(() => {
    const handlePlanChange = (e: any) => {
      if (e.detail?.plan_id) {
        setActivePlanId(e.detail.plan_id);
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mitreno_seller_active_plan');
        if (stored) setActivePlanId(stored);
      }
    };
    window.addEventListener('mitreno:plan_changed', handlePlanChange);
    return () => window.removeEventListener('mitreno:plan_changed', handlePlanChange);
  }, []);

  const isProActive = activePlanId === 'pro_monthly' || shop.plan_type === 'pro_monthly';

  const navItems: {
    id: SellerTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      badge: metrics?.new_orders && metrics.new_orders > 0 ? metrics.new_orders : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'hyperlocal',
      label: '⚡ Nearby Orders',
      icon: Zap,
      badge: metrics?.hyperlocal_orders !== undefined && metrics.hyperlocal_orders > 0 ? metrics.hyperlocal_orders : undefined,
      badgeColor: 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800 border border-amber-200 font-black',
    },
    {
      id: 'products',
      label: 'Products',
      icon: ShoppingBag,
      badge: metrics?.total_products !== undefined ? metrics.total_products : undefined,
      badgeColor: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    },
    {
      id: 'chat',
      label: 'Customer Chat',
      icon: MessageSquare,
      badge: metrics?.unread_chats && metrics.unread_chats > 0 ? metrics.unread_chats : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'profile',
      label: 'Store Profile',
      icon: Store,
    },
    {
      id: 'ads',
      label: 'Ads & Boost',
      icon: Sparkles,
      badge: 'PRO',
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: Receipt,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="relative z-10 w-64 h-full bg-white border-r border-neutral-200/90 shadow-[8px_0_24px_-20px_rgba(15,23,42,0.45)] flex flex-col shrink-0 select-none">
      {/* Shop Brand Header */}
      <div className="p-5 border-b border-neutral-200/90">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-md shadow-amber-500/10 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-neutral-100 overflow-hidden flex items-center justify-center font-black text-amber-600 text-lg">
              {shop.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                shop.name?.slice(0, 2).toUpperCase() || 'NV'
              )}
            </div>
            {shop.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white">
                <BadgeCheck className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-neutral-950 truncate tracking-tight">
                {shop.name || 'My Boutique'}
              </h2>
            </div>
            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
              {shop.city ? `${shop.city} • ` : ''}
              {shop.category || 'Fashion'}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-100 shadow-[0_2px_8px_-6px_rgba(16,185,129,0.5)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">Store Live & Active</span>
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            {shop.id?.split('_').slice(-1)[0] || 'LIVE'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin scrollbar-thumb-neutral-300">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Store Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-[0_4px_12px_-8px_rgba(245,158,11,0.55)]'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-amber-600' : 'text-neutral-500 group-hover:text-neutral-800'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.id === 'billing' ? (
                isProActive ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenUpgradePlan) {
                        onOpenUpgradePlan();
                      } else {
                        onTabChange('billing');
                      }
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Nvilar Pro Active • Click to Manage Plan"
                  >
                    PRO
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenUpgradePlan) {
                        onOpenUpgradePlan();
                      } else {
                        onTabChange('billing');
                      }
                    }}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 hover:border-amber-300 transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    title="Upgrade Commercial Plan"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                    <span>Upgrade Plan</span>
                  </div>
                )
              ) : item.badge !== undefined ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Footer / Exit to Customer App */}
      <div className="p-3 border-t border-neutral-200/90 space-y-2">
        <button
          onClick={onExit}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 text-xs font-semibold border border-neutral-200 transition-colors shadow-[0_2px_8px_-7px_rgba(15,23,42,0.45)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Nvilar App</span>
        </button>
      </div>
    </aside>
  );
};
