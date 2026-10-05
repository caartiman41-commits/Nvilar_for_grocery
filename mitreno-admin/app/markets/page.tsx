'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Plus, ChevronRight, Store, Building2, CheckCircle2, AlertCircle,
  Sparkles, Search, X, Globe, Map, TrendingUp, ArrowUpRight, Compass
} from 'lucide-react';
import { AdminNavbar } from '@/components/AdminNavbar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { isAuthenticated, fetchStates, createState, fetchApplications } from '@/lib/api';
import { StateItem } from '@/lib/types';

// Sleek accent palette for cards hairline borders
const STATE_ACCENTS: Record<string, { bar: string; badge: string; text: string }> = {
  maharashtra: { bar: 'from-amber-500 to-orange-600', badge: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-600' },
  karnataka: { bar: 'from-rose-500 to-red-600', badge: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-600' },
  delhi_ncr: { bar: 'from-blue-500 to-indigo-600', badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600' },
  assam: { bar: 'from-teal-500 to-emerald-600', badge: 'bg-teal-50 text-teal-700 border-teal-200', text: 'text-teal-600' },
  tamil_nadu: { bar: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600' },
  west_bengal: { bar: 'from-purple-500 to-indigo-600', badge: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-600' },
  rajasthan: { bar: 'from-amber-500 to-yellow-600', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600' },
  uttar_pradesh: { bar: 'from-indigo-500 to-blue-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-600' },
  telangana: { bar: 'from-pink-500 to-rose-600', badge: 'bg-pink-50 text-pink-700 border-pink-200', text: 'text-pink-600' },
  gujarat: { bar: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', text: 'text-cyan-600' },
  jammu_kashmir: { bar: 'from-sky-500 to-cyan-600', badge: 'bg-sky-50 text-sky-700 border-sky-200', text: 'text-sky-600' },
};

const defaultAccent = { bar: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-600' };

export default function MarketsPage() {
  const router = useRouter();
  const [states, setStates] = useState<StateItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for new state
  const [newStateName, setNewStateName] = useState('');
  const [newStateCode, setNewStateCode] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stateList, appRes] = await Promise.all([
        fetchStates(),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setStates(stateList);
      setPendingCount(appRes.counts?.pending || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName || !newStateCode) {
      alert('State name and code are required.');
      return;
    }
    setSubmitting(true);
    const res = await createState({ name: newStateName, code: newStateCode.toUpperCase() });
    setSubmitting(false);

    if (res.success && res.state) {
      setStates(prev => [res.state!, ...prev]);
      setIsModalOpen(false);
      setNewStateName('');
      setNewStateCode('');
      showToast('success', `State "${newStateName}" (${newStateCode.toUpperCase()}) registered!`);
    } else {
      showToast('error', res.error || 'Failed to register state');
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredStates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return states;
    return states.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [states, searchQuery]);

  // Aggregate stats with safe Number conversion
  const totalCities = states.reduce((acc, s) => acc + Number(s.city_count || 0), 0);
  const totalShops = states.reduce((acc, s) => acc + Number(s.shop_count || 0), 0);
  const totalRevenue = states.reduce((acc, s) => acc + Number(s.total_revenue || 0), 0);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={pendingCount} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-7 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Link href="/" className="hover:text-slate-700 font-medium transition-colors">Dashboard</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-700 font-bold">Geographic Hierarchy</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Globe className="w-5 h-5" />
                </div>
                <span>Cities & Markets Engine</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                National territorial hierarchy: <strong>State → City → Boutique Store</strong>. Click any state to inspect city hubs and manage merchant operations.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 hover:shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register State</span>
            </button>
          </div>

          {/* Feedback Toast */}
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2.5 transition-all shadow-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Executive High-Density KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Registered States */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  REGISTERED STATES
                </span>
                <Map className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono">{states.length}</span>
                <span className="text-xs font-semibold text-slate-500">States</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, states.length > 0 ? Math.max(15, Math.round((states.length / 28) * 100)) : 0)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Active territories</span>
                <span className="text-indigo-600 font-bold">{states.length}/28 States</span>
              </div>
            </div>

            {/* Total Cities */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  TOTAL CITIES
                </span>
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono">{totalCities}</span>
                <span className="text-xs font-semibold text-slate-500">Cities</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, totalCities * 4))}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Commercial hubs</span>
                <span className="text-blue-600 font-bold">{states.length > 0 ? (totalCities / states.length).toFixed(1) : 0} avg/state</span>
              </div>
            </div>

            {/* Partner Boutiques */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  PARTNER BOUTIQUES
                </span>
                <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono">{totalShops}</span>
                <span className="text-xs font-semibold text-slate-500">Boutiques</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, totalShops * 2))}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Verified storefronts</span>
                <span className="text-amber-700 font-bold">{totalCities > 0 ? (totalShops / totalCities).toFixed(1) : 0} avg/city</span>
              </div>
            </div>

            {/* Total Revenue (GMV) */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  TOTAL REVENUE (GMV)
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="text-emerald-600 font-mono">{formatCurrency(totalRevenue)}</span>
                <span className="text-xs font-semibold text-slate-500">GMV</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: totalRevenue > 0 ? '100%' : '5%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>All-time volume</span>
                <span className="text-emerald-600 font-bold">100% Platform GMV</span>
              </div>
            </div>
          </div>

          {/* Search & State Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state name or code..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="text-[11px] font-bold text-slate-500 self-end sm:self-center">
              Showing {filteredStates.length} of {states.length} territories
            </div>
          </div>

          {/* Executive State Cards Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 mt-2.5 font-semibold">Synchronizing territorial telemetry...</p>
            </div>
          ) : filteredStates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <p className="text-sm font-bold text-slate-700">No matching states found</p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                No territory matches "{searchQuery}". You can register a new state using the button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStates.map((state) => {
                const revNumber = Number(state.total_revenue || 0);

                return (
                  <Link
                    key={state.id}
                    href={`/markets/${state.id}`}
                    className="group bg-white rounded-xl border border-slate-200/90 hover:border-indigo-600/60 p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* State Monogram & Name */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs group-hover:bg-indigo-600 transition-colors">
                            {state.code}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                              {state.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-semibold text-slate-500">Live Territory</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-indigo-50 border border-slate-200/80 group-hover:border-indigo-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>

                      {/* 3 Metric Segments */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100">
                        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 text-left">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <Building2 className="w-3 h-3 text-slate-400" /> Cities
                          </div>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{Number(state.city_count || 0)}</p>
                        </div>

                        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 text-left">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <Store className="w-3 h-3 text-slate-400" /> Boutiques
                          </div>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{Number(state.shop_count || 0)}</p>
                        </div>

                        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 text-left">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <TrendingUp className="w-3 h-3 text-slate-400" /> GMV
                          </div>
                          <p className="text-xs font-black text-emerald-600 mt-1 truncate" title={`₹${revNumber.toLocaleString('en-IN')}`}>
                            {formatCurrency(revNumber)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Link Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                      <span>Explore Cities & Boutiques</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-indigo-600" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Register State Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Map className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Register New State</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateState} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      State Name
                    </label>
                    <input
                      type="text"
                      value={newStateName}
                      onChange={(e) => setNewStateName(e.target.value)}
                      placeholder="e.g. Punjab, Kerala, Odisha"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      State Code (2-3 Letters)
                    </label>
                    <input
                      type="text"
                      value={newStateCode}
                      onChange={(e) => setNewStateCode(e.target.value.toUpperCase())}
                      placeholder="e.g. PB, KL, OD"
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all"
                    >
                      {submitting ? 'Registering...' : 'Confirm Registration'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
