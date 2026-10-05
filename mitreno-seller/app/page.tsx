'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Store,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Truck,
  MessageSquare,
  BadgeCheck,
  Layers,
  ShoppingBag,
  CreditCard,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { SellerDashboard } from '@/components/seller/SellerDashboard';
import { SellerOnboardingModal } from '@/components/SellerOnboardingModal';
import AuthScreen from '@/components/AuthScreen';

export default function SellerHomePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  
  // Seller Application State
  const [appStatus, setAppStatus] = useState<'none' | 'pending_review' | 'approved' | 'rejected' | 'cancelled'>('none');
  const [appData, setAppData] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  
  // Modal states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fetch live seller status when user is authenticated
  const fetchStatus = async () => {
    if (!user) {
      setAppStatus('none');
      setAppData(null);
      setIsLoadingStatus(false);
      return;
    }

    try {
      setIsLoadingStatus(true);
      const res = await apiClient.get('/api/seller/status', { user_id: user.uid });
      if (res && res.success) {
        setAppStatus(res.status || 'none');
        setAppData(res.application || res);
      } else {
        setAppStatus('none');
      }
    } catch (err) {
      console.error('Failed to fetch seller status:', err);
      setAppStatus('none');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center mb-4 animate-bounce shadow-xl shadow-amber-400/20">
          <Store className="w-6 h-6 stroke-[2.5]" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-neutral-400">
          Loading Mitreno Seller Studio...
        </p>
      </div>
    );
  }

  // CASE 1: APPROVED SELLER -> FULL STANDALONE SELLER DASHBOARD
  if (user && appStatus === 'approved') {
    return (
      <main className="min-h-screen bg-neutral-950">
        <SellerDashboard onClose={() => {}} />
      </main>
    );
  }

  // CASE 2: PENDING REVIEW -> LIVE APPLICATION TRACKING PORTAL
  if (user && appStatus === 'pending_review') {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        {/* Top Navbar */}
        <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                MITRENO <span className="text-amber-400 font-extrabold text-xs uppercase px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">PARTNER HUB</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 hidden sm:inline">{user.phoneNumber || user.email || 'Boutique Partner'}</span>
            <button
              onClick={() => logout()}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Status Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Verification In Progress
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Application Under Review
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Business: <strong className="text-neutral-200">{appData?.business_name || 'Your Boutique'}</strong>
                </p>
              </div>
            </div>

            {/* Stepper */}
            <div className="space-y-4 my-6 py-4 border-y border-neutral-800/80">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">KYC Documents Submitted</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Identity documents, bank details & store address recorded.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-xs text-amber-400 animate-pulse">
                  ●
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">Underwriting Verification</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Our compliance team is verifying Aadhaar, PAN, and business category (ETA 24-48 hours).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-40">
                <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-300">Studio Activation</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Your boutique goes live on Mitreno customer app and website.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={fetchStatus}
                disabled={isLoadingStatus}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                Check Status
              </button>

              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to cancel your seller application?')) {
                    await apiClient.post('/api/seller/cancel', { user_id: user.uid });
                    fetchStatus();
                  }
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Cancel Application
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // CASE 3: REJECTED -> EXPLANATION & RE-APPLY
  if (user && appStatus === 'rejected') {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <header className="border-b border-neutral-800 bg-neutral-900/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-base font-black text-white">MITRENO SELLER STUDIO</h1>
          </div>
          <button onClick={() => logout()} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300">Sign Out</button>
        </header>

        <div className="flex-1 max-w-lg mx-auto w-full p-6 flex flex-col justify-center">
          <div className="bg-neutral-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Application Needs Attention</h2>
            <p className="text-xs text-rose-300/80 mt-2 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
              Reason: {appData?.rejection_reason || 'Document verification could not be completed. Please upload clearer photo IDs.'}
            </p>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="mt-6 w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm transition-all"
            >
              Update Documents & Re-Apply
            </button>
          </div>
        </div>

        <SellerOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => {
            setIsOnboardingOpen(false);
            fetchStatus();
          }}
        />
      </main>
    );
  }

  // CASE 4: PUBLIC GUEST / UNREGISTERED -> HIGH-CONVERTING GOOGLE SEO LANDING PAGE
  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-amber-400 selection:text-neutral-950 flex flex-col">
      {/* Top Enterprise Navigation */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Seller Studio</span>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">MITRENO</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-400/20"
                >
                  Complete KYC Application
                </button>
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 text-white font-bold text-xs transition-all"
                >
                  Seller Login
                </button>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-400/20 hover:scale-[1.02]"
                >
                  Start Selling &rarr;
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wide uppercase shadow-lg shadow-amber-400/10 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Join 500+ Top Fashion Boutiques & Designers</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Grow Your Boutique with <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-300 bg-clip-text text-transparent">Mitreno</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Reach thousands of local luxury and streetwear shoppers in your city. Take advantage of <strong className="text-white font-bold">0% commission intro rates</strong>, <strong className="text-white font-bold">30-minute hyperlocal express dispatch</strong>, and real-time customer deal negotiation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (user) {
                  setIsOnboardingOpen(true);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-amber-400/25 hover:scale-[1.03] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Your Boutique (2 Mins)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Already a Seller? Login</span>
            </button>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-12 border-t border-neutral-800/80">
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">0%</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Intro Commission Tier</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-white">30 Min</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Hyperlocal Express Dispatch</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">24 Hours</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Direct UPI Payouts</p>
            </div>
            <div className="text-center p-3">
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Price Control & Chat Deals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-6 bg-neutral-900/40 border-y border-neutral-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">Boutique Powerhouse</span>
            <h3 className="text-3xl font-black text-white mt-1">Engineered for Modern Fashion Creators</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">30-Min Hyperlocal Reach</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Connect your physical boutique directly to shoppers in your city with automated delivery rider pickup via Delhivery Air and local couriers.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Real-Time Customer Bargaining</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Convert window shoppers into paid orders. Negotiate and accept custom deals right inside the live seller chat with immediate checkout links.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white mb-2">Direct Bank & UPI Settlements</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Enjoy transparent accounting with automatic 24-hour settlements directly to your registered bank account or UPI ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Roadmap */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">Launch in 3 Steps</span>
            <h3 className="text-3xl font-black text-white mt-1">Start Selling in Minutes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-3xl font-black text-amber-400">01</span>
              <h5 className="text-sm font-black text-white mt-3">Submit KYC Details</h5>
              <p className="text-xs text-neutral-400 mt-1">Fill boutique name, Aadhaar/PAN, and store address in 2 minutes.</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-3xl font-black text-amber-400">02</span>
              <h5 className="text-sm font-black text-white mt-3">Upload Catalog</h5>
              <p className="text-xs text-neutral-400 mt-1">List kurtas, hoodies, sarees, or dresses with custom fabric GSM specs.</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-3xl font-black text-amber-400">03</span>
              <h5 className="text-sm font-black text-white mt-3">Fulfill & Earn</h5>
              <p className="text-xs text-neutral-400 mt-1">Get instant sound chimes on your phone/tablet when an order arrives.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => {
                if (user) {
                  setIsOnboardingOpen(true);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-amber-400/25 hover:scale-[1.03] cursor-pointer"
            >
              Start Your Application &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-10 px-6 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Mitreno Marketplace Technologies. All rights reserved.</p>
        <p className="mt-1">Mitreno Seller Studio &bull; Connecting India's Elite Boutiques</p>
      </footer>

      {/* KYC Onboarding Modal */}
      <SellerOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          fetchStatus();
        }}
      />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
            >
              ✕
            </button>
            <div className="p-6">
              <div className="mb-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center mx-auto mb-2 font-black">
                  <Store className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-white">Seller Studio Login</h3>
                <p className="text-xs text-neutral-400 mt-1">Enter your registered phone number to access your boutique</p>
              </div>
              <AuthScreen />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
