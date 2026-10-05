'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  Store,
  MapPin,
  ShoppingBag,
  MessageSquare,
  Image as ImageIcon,
  Megaphone,
  Film,
  Shield,
  Settings,
  HelpCircle,
  Zap,
  BarChart3,
} from 'lucide-react';

interface AdminSidebarProps {
  pendingCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ pendingCount = 0 }) => {
  const pathname = usePathname();

  const operationsItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      title: 'Seller Applications',
      href: '/applications',
      icon: FileCheck2,
      active: pathname.startsWith('/applications'),
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      title: 'Active Boutiques',
      href: '/shops',
      icon: Store,
      active: pathname.startsWith('/shops'),
    },
    {
      title: 'Cities & Markets',
      href: '/markets',
      icon: MapPin,
      active: pathname.startsWith('/markets'),
    },
    {
      title: 'Marketplace Analytics',
      href: '/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/analytics'),
    },
  ];

  const marketplaceItems = [
    {
      title: 'Orders & Settlements',
      href: '/orders',
      icon: ShoppingBag,
      active: pathname.startsWith('/orders'),
    },
    {
      title: '⚡ Nearby Orders Radar',
      href: '/hyperlocal',
      icon: Zap,
      active: pathname.startsWith('/hyperlocal'),
      badge: '< 10km',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      title: 'Live Bargain Rooms',
      href: '/bargains',
      icon: MessageSquare,
      active: pathname.startsWith('/bargains'),
    },
    {
      title: 'Banners Management',
      href: '/banners',
      icon: ImageIcon,
      active: pathname.startsWith('/banners'),
    },
    {
      title: 'Sponsored Ads',
      href: '/ads',
      icon: Megaphone,
      active: pathname.startsWith('/ads'),
    },
    {
      title: 'Reels Moderation',
      href: '/reels',
      icon: Film,
      active: pathname.startsWith('/reels'),
    },
    {
      title: 'Security & Keys',
      href: '/settings',
      icon: Shield,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full overflow-y-auto p-4 text-slate-700 shadow-xs select-none">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 mb-2">
            Operations
          </p>
          <nav className="space-y-1">
            {operationsItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    item.active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.active
                          ? 'bg-white text-indigo-700'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 mb-2">
            Marketplace Engine
          </p>
          <nav className="space-y-1">
            {marketplaceItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    item.active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Cloud & R2 Status Footer */}
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-neutral-600 font-bold">Cloudflare R2 Storage</span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Connected
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
          KYC direct photo bucket: <code className="text-indigo-600 font-semibold">mitreno-seller-docs</code>
        </p>
      </div>
    </aside>
  );
};
