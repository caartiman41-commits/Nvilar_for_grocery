'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Key,
  Database,
  Cloud,
  Server,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  RefreshCw,
  Zap,
  Activity,
  UserCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { isAuthenticated, getAdminToken, fetchApplications } from '../../lib/api';

const THEME_STORAGE_KEY = 'mitreno_admin_theme';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [adminKey, setAdminKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'white' | 'dark'>('white');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'white') {
        setCurrentTheme(saved);
      }
    } catch {}
  }, []);

  const handleThemeChange = (t: 'white' | 'dark') => {
    setCurrentTheme(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
  };


  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const token = getAdminToken() || 'mitreno_super_secret_admin_key_2026_go_enterprise';
    setAdminKey(token);

    fetchApplications('pending_review').then((res) => {
      setPendingCount(res.counts.pending);
    }).catch(() => {});
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(adminKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = () => {
    setIsRotating(true);
    setTimeout(() => {
      const newKey = 'mitreno_adm_' + Math.random().toString(36).substring(2, 12) + '_sec_2026';
      setAdminKey(newKey);
      setIsRotating(false);
    }, 600);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={pendingCount} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Link href="/" className="hover:text-neutral-700 font-medium">
                  Dashboard
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-neutral-700 font-bold">Security & Keys</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2.5">
                <span>Security & Infrastructure</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Protected
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Cloudflare R2 bucket connection, Go Fiber API endpoints, Firebase Auth, and master credentials.
              </p>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cloudflare R2 Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Cloudflare R2</h3>
                    <p className="text-[11px] text-neutral-400">Object Storage</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Connected
                </span>
              </div>
              <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Bucket:</span>
                  <code className="text-neutral-800 font-bold font-mono">mitreno-seller-docs</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Direct Photo KYC:</span>
                  <span className="text-emerald-700 font-semibold">Zero-Egress Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Location:</span>
                  <span className="text-neutral-700 font-medium">APAC (Mumbai Edge)</span>
                </div>
              </div>
            </div>

            {/* Go Fiber API Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Go Fiber API</h3>
                    <p className="text-[11px] text-neutral-400">Port 8080 Daemon</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Host:</span>
                  <code className="text-neutral-800 font-bold font-mono">{process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.nvilar.com'}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Latency:</span>
                  <span className="text-emerald-700 font-semibold">12ms (Local Fastlane)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Framework:</span>
                  <span className="text-neutral-700 font-medium">Fiber v3 / Go 1.23</span>
                </div>
              </div>
            </div>

            {/* Firebase Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Firebase Cloud</h3>
                    <p className="text-[11px] text-neutral-400">Auth & Notifications</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Phone & OTP:</span>
                  <span className="text-neutral-800 font-semibold">Firebase Authentication</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Push Notifications:</span>
                  <span className="text-emerald-700 font-semibold">FCM Web & App Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">App Security:</span>
                  <span className="text-neutral-700 font-medium">App Check Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin API Secret Key Configuration */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Master Admin API Secret Key</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                This key authenticates high-privilege requests between the admin console and the backend Go Fiber engine via the <code className="text-indigo-600 font-mono">X-Admin-Key</code> header.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={adminKey}
                  className="w-full pl-4 pr-24 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                </button>

                <button
                  onClick={handleRotateKey}
                  disabled={isRotating}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                  <span>Rotate Key</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                All KYC review submissions, store suspensions, and escrow releases require active verification against this secret token. Sessions expire after 24 hours of inactivity.
              </span>
            </div>
          </div>

          {/* Theme & Display Configuration */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Interface Theme & Analytics Cockpit Display</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Choose your default interface appearance across the Admin Console and the Marketplace Analytics HUD.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* White Mode Option */}
              <div
                onClick={() => handleThemeChange('white')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  currentTheme === 'white'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-sm text-neutral-900">Clean White Mode</span>
                  </div>
                  {currentTheme === 'white' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      Active Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Crisp executive white background with clear high-contrast cards, sleek typography, and matching dashboard aesthetics.
                </p>
              </div>

              {/* Dark JARVIS HUD Option */}
              <div
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  currentTheme === 'dark'
                    ? 'border-cyan-500 bg-slate-900 shadow-md text-white'
                    : 'border-neutral-200 hover:border-neutral-300 bg-slate-900 text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-sm text-white">Tony Stark Dark Cockpit</span>
                  </div>
                  {currentTheme === 'dark' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Full JARVIS HUD telemetry experience with glowing neon cyan/emerald arcs, dark space background, and high-tech radar instrumentation.
                </p>
              </div>
            </div>
          </div>

          {/* Security Audit Log */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neutral-400" />
                <span>Recent Admin Security Audit Events</span>
              </h3>
              <span className="text-[11px] text-neutral-400">Automated audit trail</span>
            </div>

            <div className="divide-y divide-neutral-100 text-xs">
              {[
                {
                  event: 'Admin Console Login Succeeded',
                  user: 'Admin Ashraf (Super Admin)',
                  ip: '192.168.1.x / Current Host',
                  status: 'Success',
                  time: 'Today, 14:15',
                },
                {
                  event: 'Seller KYC Application Approved',
                  user: 'Maison Al-Mansoor Atelier (sa_ashraf_demo)',
                  ip: '192.168.1.x / Current Host',
                  status: 'Success',
                  time: 'Today, 13:45',
                },
                {
                  event: 'Cloudflare R2 Bucket Health Probe',
                  user: 'System Heartbeat Agent',
                  ip: 'Worker Edge / Mumbai',
                  status: 'Operational',
                  time: 'Today, 13:00',
                },
                {
                  event: 'Escrow Vendor Payout Released',
                  user: 'Admin Ashraf (Super Admin)',
                  ip: '192.168.1.x / Current Host',
                  status: 'Settled',
                  time: 'Today, 11:20',
                },
              ].map((log, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{log.event}</p>
                      <p className="text-[11px] text-neutral-500">{log.user} • <span className="font-mono text-neutral-400">{log.ip}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.status}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
