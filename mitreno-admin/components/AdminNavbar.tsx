'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Bell,
  LogOut,
  Sparkles,
  ExternalLink,
  Activity,
  Layers,
} from 'lucide-react';
import { clearAdminToken } from '../lib/api';

interface AdminNavbarProps {
  pendingCount?: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ pendingCount = 0 }) => {
  const router = useRouter();

  const handleLogout = () => {
    clearAdminToken();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-6 flex items-center justify-between text-neutral-900 shadow-xs">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nvilar-icon.png"
            alt="NVILAR"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-neutral-900 text-base">
                NVILAR
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Enterprise Marketplace Management
            </p>
          </div>
        </Link>
      </div>

      {/* Right Stats & Controls */}
      <div className="flex items-center gap-4">
        {/* Operational Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span>System 100% Operational</span>
        </div>

        {/* View Main Store Link */}
        <a
          href={process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://nvilar.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-900 text-xs font-semibold transition-colors border border-neutral-200 shadow-2xs"
        >
          <span>Main App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Pending Badge */}
        {pendingCount > 0 && (
          <Link
            href="/applications?status=pending_review"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>{pendingCount} Pending KYC</span>
          </Link>
        )}

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-neutral-900 font-extrabold text-xs flex items-center justify-center ring-2 ring-neutral-200 shadow-xs">
              AD
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-neutral-900 leading-tight">Admin Ashraf</p>
              <p className="text-[10px] text-neutral-500 font-medium">Super Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg bg-neutral-100 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
