'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Plus, ChevronRight, Store, Building2, CheckCircle2, AlertCircle,
  ArrowLeft, Search, X, Star, Sparkles, TrendingUp, Globe, ArrowUpRight, Compass
} from 'lucide-react';
import { AdminNavbar } from '@/components/AdminNavbar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { CityCommissionModal } from '@/components/CityCommissionModal';
import { isAuthenticated, fetchCitiesByState, createCity, fetchApplications } from '@/lib/api';
import { StateItem, CityItem } from '@/lib/types';

export default function StateCitiesPage() {
  const router = useRouter();
  const params = useParams();
  const stateId = params.stateId as string;

  const [state, setState] = useState<StateItem | null>(null);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Commission Modal State
  const [commissionModalCity, setCommissionModalCity] = useState<{ id: string; name: string; rate: number } | null>(null);

  // Form State
  const [newCityName, setNewCityName] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newTier, setNewTier] = useState('Tier 2');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState('10.0');
  const [newPincode, setNewPincode] = useState('');
  const [newIsFeatured, setNewIsFeatured] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cityData, appRes] = await Promise.all([
        fetchCitiesByState(stateId),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setState(cityData.state);
      setCities(cityData.cities || []);
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
  }, [router, stateId]);

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName) {
      alert('City name is required.');
      return;
    }
    setSubmitting(true);
    const res = await createCity({
      state_id: stateId,
      name: newCityName.trim(),
      district: newDistrict.trim() || undefined,
      tier: newTier,
      latitude: newLatitude ? parseFloat(newLatitude) : undefined,
      longitude: newLongitude ? parseFloat(newLongitude) : undefined,
      default_commission_rate: newCommissionRate ? parseFloat(newCommissionRate) : 10.0,
      pincode_prefix: newPincode.trim() || undefined,
      is_featured: newIsFeatured,
    });
    setSubmitting(false);

    if (res.success && res.city) {
      setCities(prev => [res.city!, ...prev]);
      setIsModalOpen(false);
      setNewCityName('');
      setNewDistrict('');
      setNewTier('Tier 2');
      setNewLatitude('');
      setNewLongitude('');
      setNewCommissionRate('10.0');
      setNewPincode('');
      setNewIsFeatured(false);
      setFeedback({ type: 'success', message: `City "${newCityName}" (${newTier}) registered under ${state?.name}!` });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to register city' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const filteredCities = searchQuery
    ? cities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.pincode_prefix && c.pincode_prefix.includes(searchQuery)))
    : cities;

  const totalShops = cities.reduce((acc, c) => acc + Number(c.live_shop_count || c.shop_count || 0), 0);
  const totalRev = cities.reduce((acc, c) => acc + Number(c.total_revenue || 0), 0);
  const featuredCount = cities.filter(c => c.is_featured).length;

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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-700 font-medium transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/markets" className="hover:text-slate-700 font-medium transition-colors">States & Territories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-bold">{state?.name || stateId}</span>
          </div>

          {/* State Hero Header */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/markets')}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Back to States"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                      {state?.name || 'Loading State...'}
                    </h1>
                    {state?.code && (
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white shadow-xs font-mono">
                        {state.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Territory hubs and registered commercial cities. Drill into any city to oversee store-level analytics and operations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register City</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Cities</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{cities.length}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Municipal regions</p>
              </div>
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Partner Boutiques</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalShops}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active & verified</p>
              </div>
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">Featured Hubs</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{featuredCount}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Priority customer feed</p>
              </div>
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">State GMV Revenue</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalRev)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Cumulative volume</p>
              </div>
            </div>
          </div>

          {/* Toast */}
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2.5 shadow-xs ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
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

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city name or postal prefix..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing {filteredCities.length} of {cities.length} cities
            </div>
          </div>

          {/* Cities Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 mt-3 font-semibold">Loading municipal hubs...</p>
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700">No cities registered in {state?.name || 'this state'}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add the first commercial city to enable boutique merchant onboarding in this territory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCities.map((city) => {
                const cityRevenue = Number(city.total_revenue || 0);
                const commRate = Number(city.default_commission_rate || 10);

                return (
                  <div
                    key={city.id}
                    className="group bg-white border border-slate-200/90 hover:border-indigo-600/60 rounded-xl p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <Link
                              href={`/markets/${stateId}/${city.id}`}
                              className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors"
                            >
                              {city.name}
                            </Link>
                            {city.is_featured && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Featured
                              </span>
                            )}
                          </div>
                          {city.pincode_prefix && (
                            <p className="text-[11px] text-slate-400 font-mono">PIN: {city.pincode_prefix}xxx</p>
                          )}
                        </div>

                        {/* City Commission Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCommissionModalCity({ id: city.id, name: city.name, rate: commRate });
                          }}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-[10px] font-black text-indigo-700 flex items-center gap-1 transition-all cursor-pointer"
                          title="Click to change city commission rate"
                        >
                          <span>{commRate}% Take</span>
                          <span className="text-indigo-500 font-normal underline">Edit</span>
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-left">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <Store className="w-3 h-3 text-slate-400" /> Boutiques
                          </div>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{city.live_shop_count || city.shop_count || 0}</p>
                        </div>
                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-left">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <TrendingUp className="w-3 h-3 text-slate-400" /> City GMV
                          </div>
                          <p className="text-xs font-black text-emerald-600 mt-1 truncate">
                            {formatCurrency(cityRevenue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        city.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${city.is_active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {city.is_active !== false ? 'Active Hub' : 'Inactive'}
                      </span>
                      <Link
                        href={`/markets/${stateId}/${city.id}`}
                        className="text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 text-[11px] font-bold transition-colors"
                      >
                        Manage Shops <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comprehensive Register City Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-300 my-8">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Register Commercial Hub</h3>
                      <p className="text-xs text-slate-500 font-medium">Adding regional city & boutique cluster under {state?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCity} className="p-6 space-y-4">
                  {/* City Name & District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        City Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        placeholder="e.g. Guwahati, Silchar, Dibrugarh"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        District / Administrative Region
                      </label>
                      <input
                        type="text"
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        placeholder="e.g. Kamrup Metropolitan, Cachar"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Tier & Commission Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Commercial Tier
                      </label>
                      <select
                        value={newTier}
                        onChange={(e) => setNewTier(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                      >
                        <option value="Tier 1">Tier 1 (Metro / State Capital)</option>
                        <option value="Tier 2">Tier 2 (Commercial Growth Hub)</option>
                        <option value="Tier 3">Tier 3 (Emerging / Regional Market)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Default Commission (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={newCommissionRate}
                          onChange={(e) => setNewCommissionRate(e.target.value)}
                          placeholder="10.0"
                          className="w-full px-3.5 py-2 pr-8 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        />
                        <span className="absolute right-3 top-2 text-xs font-extrabold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>

                  {/* GPS Coordinates: Lat & Lng */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Latitude (GPS)</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newLatitude}
                        onChange={(e) => setNewLatitude(e.target.value)}
                        placeholder="e.g. 26.144517"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Longitude (GPS)</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newLongitude}
                        onChange={(e) => setNewLongitude(e.target.value)}
                        placeholder="e.g. 91.736237"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* PIN Prefix & Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Postal PIN Code Prefix
                      </label>
                      <input
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="e.g. 781, 788, 400"
                        maxLength={6}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newIsFeatured}
                          onChange={(e) => setNewIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          Priority Featured Hub in Explorer
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                    >
                      {submitting ? 'Registering Hub...' : 'Register City'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 1-Click City Commission Modal */}
          {commissionModalCity && (
            <CityCommissionModal
              isOpen={!!commissionModalCity}
              cityId={commissionModalCity.id}
              cityName={commissionModalCity.name}
              initialRate={commissionModalCity.rate}
              onClose={() => setCommissionModalCity(null)}
              onSuccess={(newRate, updatedCount) => {
                setCities(prev => prev.map(c => c.id === commissionModalCity.id ? { ...c, default_commission_rate: newRate } : c));
                setFeedback({
                  type: 'success',
                  message: `Commission set to ${newRate}% for ${commissionModalCity.name}. Applied to ${updatedCount} boutique(s) in database.`,
                });
                setTimeout(() => setFeedback(null), 5000);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
