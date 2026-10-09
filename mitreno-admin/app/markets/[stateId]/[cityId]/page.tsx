'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Store, Plus, ArrowLeft, Search, CheckCircle2, AlertCircle, ShieldAlert,
  ShieldCheck, Eye, RefreshCw, Star, Ban, Sparkles, Filter, X, ChevronRight,
  TrendingUp, Package, Clock, CreditCard, User, Phone, Mail, ArrowUpRight,
  FileSpreadsheet, Activity, AlertTriangle, CheckCircle, BarChart3, Settings
} from 'lucide-react';
import { AdminNavbar } from '@/components/AdminNavbar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ShopKundliModal } from '@/components/ShopKundliModal';
import { CityCommissionModal } from '@/components/CityCommissionModal';
import {
  isAuthenticated,
  fetchCityDetail,
  updateCity,
  suspendShopInCity,
  activateShopInCity,
  fetchApplications,
  createShop
} from '@/lib/api';
import { CityItem, CityShopDetail, StateItem } from '@/lib/types';

export default function CityShopsPage() {
  const router = useRouter();
  const params = useParams();
  const stateId = params.stateId as string;
  const cityId = params.cityId as string;

  const [city, setCity] = useState<(CityItem & { state_name?: string; state_code?: string; default_commission_rate?: number }) | null>(null);
  const [shops, setShops] = useState<CityShopDetail[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'terminated'>('all');
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Suspend modal state
  const [suspendingShop, setSuspendingShop] = useState<CityShopDetail | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Edit City settings modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);

  // Direct Boutique Registration Modal State
  const [isCreateShopOpen, setIsCreateShopOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newMarketName, setNewMarketName] = useState('');
  const [newCategory, setNewCategory] = useState('Traditional & Ethnic');
  const [newShopBio, setNewShopBio] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPayoutUpi, setNewPayoutUpi] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState('10.0');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  // Full-Screen Shop Kundli & City Commission Modals
  const [selectedKundliShopId, setSelectedKundliShopId] = useState<string | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [detailData, appRes] = await Promise.all([
        fetchCityDetail(cityId),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setCity(detailData.city as any);
      setShops(detailData.shops || []);
      setPendingCount(appRes.counts?.pending || 0);

      if (detailData.city) {
        setEditName(detailData.city.name || '');
        setEditPincode(detailData.city.pincode_prefix || '');
        setEditIsFeatured(!!detailData.city.is_featured);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to load city details' });
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
  }, [router, cityId]);

  // Filtered shops
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.category && shop.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (shop.market_name && shop.market_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchQuery, statusFilter]);

  // Metrics
  const activeCount = shops.filter((s) => s.status === 'active').length;
  const suspendedCount = shops.filter((s) => s.status === 'suspended').length;
  const totalRev = shops.reduce((acc, s) => acc + (Number(s.total_revenue) || 0), 0);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Shop Suspend Handler
  const handleConfirmSuspend = async () => {
    if (!suspendingShop) return;
    if (!suspendReason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }
    setActionLoading(suspendingShop.id);
    try {
      const res = await suspendShopInCity(suspendingShop.id, suspendReason);
      if (res.success) {
        setFeedback({ type: 'success', message: `${suspendingShop.name} has been suspended.` });
        setSuspendingShop(null);
        setSuspendReason('');
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to suspend shop.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Shop Activate Handler
  const handleActivate = async (shop: CityShopDetail) => {
    setActionLoading(shop.id);
    try {
      const res = await activateShopInCity(shop.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `${shop.name} is now active.` });
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to activate shop.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // City Settings Save
  const handleSaveCitySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateCity(cityId, {
        name: editName,
        pincode_prefix: editPincode,
        is_featured: editIsFeatured,
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'City settings updated successfully.' });
        setIsEditModalOpen(false);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update city.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Direct Boutique Onboarding
  const handleCreateBoutique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) {
      alert('Boutique Name is required');
      return;
    }
    setIsCreatingShop(true);
    try {
      const res = await createShop({
        name: newShopName.trim(),
        city_id: cityId,
        state_id: stateId,
        market_name: newMarketName.trim() || 'Central Market',
        category: newCategory,
        bio: newShopBio.trim() || undefined,
        owner_name: newOwnerName.trim() || undefined,
        owner_phone: newOwnerPhone.trim() || undefined,
        owner_email: newOwnerEmail.trim() || undefined,
        payout_upi_id: newPayoutUpi.trim() || 'unlinked',
        commission_rate: newCommissionRate ? parseFloat(newCommissionRate) : (city?.default_commission_rate ? Number(city.default_commission_rate) : 10.0),
        logo_url: newLogoUrl.trim() || undefined,
      });

      if (res.success && res.shop) {
        setShops(prev => [res.shop, ...prev]);
        setIsCreateShopOpen(false);
        setNewShopName('');
        setNewMarketName('');
        setNewCategory('Traditional & Ethnic');
        setNewShopBio('');
        setNewOwnerName('');
        setNewOwnerPhone('');
        setNewOwnerEmail('');
        setNewPayoutUpi('');
        setNewCommissionRate('');
        setNewLogoUrl('');
        setFeedback({ type: 'success', message: `Boutique "${newShopName}" registered and onboarded live to ${city?.name}!` });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to register boutique' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error onboarding boutique' });
    } finally {
      setIsCreatingShop(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={pendingCount} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-7 max-w-7xl">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-700 font-medium transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/markets" className="hover:text-slate-700 font-medium transition-colors">States & Territories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/markets/${stateId}`} className="hover:text-slate-700 font-medium capitalize transition-colors">
              {city?.state_name || stateId.replace(/_/g, ' ')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-bold">{city?.name || cityId}</span>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-fadeIn shadow-xs ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* City Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <Link
                  href={`/markets/${stateId}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Back to State"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      {city?.name || 'City Store Operations'}
                    </h1>
                    {city?.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Featured Hub
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                    <span>
                      Territory: <strong className="text-slate-800">{city?.state_name || stateId}</strong> ({city?.state_code || stateId.toUpperCase()})
                    </span>
                    {city?.pincode_prefix && (
                      <>
                        <span>•</span>
                        <span>PIN Prefix: <code className="text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">{city.pincode_prefix}xxx</code></span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-center">
                {/* 1-Click City Commission Trigger */}
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>City Take: <strong>{city?.default_commission_rate || 10}%</strong></span>
                  <span className="text-[10px] text-indigo-500 font-normal underline ml-0.5">Edit</span>
                </button>

                {/* Direct Boutique Onboarding Button */}
                <button
                  type="button"
                  onClick={() => {
                    setNewCommissionRate(city?.default_commission_rate ? String(city.default_commission_rate) : '10.0');
                    setIsCreateShopOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Boutique</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={loadData}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  title="Refresh Store Telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Registered Shops</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{shops.length}</div>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-black">Active Boutiques</div>
                <div className="text-xl font-black text-emerald-600 mt-0.5">{activeCount}</div>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-rose-500 uppercase tracking-wider font-black">Suspended / Held</div>
                <div className="text-xl font-black text-rose-600 mt-0.5">{suspendedCount}</div>
              </div>
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-indigo-600 uppercase tracking-wider font-black">City GMV Revenue</div>
                <div className="text-xl font-black text-indigo-600 mt-0.5">{formatCurrency(totalRev)}</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shops by name, category, market cluster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-bold mr-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {(['all', 'active', 'suspended', 'terminated'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Boutique Store Table */}
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
              <p className="text-xs font-bold text-slate-500">Retrieving boutique stores in {city?.name || 'this city'}...</p>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="p-16 bg-white border border-slate-200/80 rounded-3xl text-center shadow-xs">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No boutiques found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'No boutique stores match your active search filters.'
                  : `There are currently no shops registered under ${city?.name || 'this city'}. Approved seller applications will appear here.`}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-4">Boutique Store</th>
                      <th className="px-6 py-4">Market / Category</th>
                      <th className="px-6 py-4 text-center">Rating</th>
                      <th className="px-6 py-4 text-right">Lifetime GMV</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Amazon-Style Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShops.map((shop) => {
                      const isSuspended = shop.status === 'suspended';
                      const isTerminated = shop.status === 'terminated';
                      const isActive = shop.status === 'active';
                      const shopRev = Number(shop.total_revenue || 0);

                      return (
                        <tr
                          key={shop.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-black text-slate-800 overflow-hidden shrink-0 shadow-2xs">
                                {shop.logo_url ? (
                                  <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                                ) : (
                                  shop.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{shop.name}</span>
                                  {shop.is_verified && (
                                    <span title="Verified Merchant">
                                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{shop.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{shop.market_name || 'Downtown Marketplace'}</div>
                            <div className="text-xs text-slate-400 font-medium">{shop.category || 'Fashion & Lifestyle'}</div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {Number(shop.rating || 4.9).toFixed(1)}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">({shop.review_count || 128} reviews)</div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="font-black text-slate-900 text-base">
                              ₹{shopRev.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">{shop.total_orders || 140} total orders</div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Store
                              </span>
                            )}
                            {isSuspended && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={shop.status_reason || 'Suspended'}>
                                <Ban className="w-3 h-3" /> Suspended
                              </span>
                            )}
                            {isTerminated && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <ShieldAlert className="w-3 h-3" /> Terminated
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Full-Screen Shop Kundli View Button */}
                              <button
                                onClick={() => setSelectedKundliShopId(shop.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Open Full Screen Shop Kundli & Analytics"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Shop Kundli</span>
                              </button>

                              {isActive && (
                                <button
                                  onClick={() => {
                                    setSuspendingShop(shop);
                                    setSuspendReason('');
                                  }}
                                  disabled={actionLoading === shop.id}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                  title="Suspend Shop"
                                >
                                  Suspend
                                </button>
                              )}
                              {isSuspended && (
                                <button
                                  onClick={() => handleActivate(shop)}
                                  disabled={actionLoading === shop.id}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  {actionLoading === shop.id ? 'Reactivating...' : 'Reactivate'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FULL-SCREEN AMAZON-STYLE SELLER KUNDLI COCKPIT */}
            <ShopKundliModal
              shopId={selectedKundliShopId}
              isOpen={!!selectedKundliShopId}
              onClose={() => setSelectedKundliShopId(null)}
              onStatusChange={(sId, newSt) => {
                setShops(prev => prev.map(s => s.id === sId ? { ...s, status: newSt } : s));
              }}
              onOpenCommissionModal={() => {
                if (city) setIsCommissionModalOpen(true);
              }}
            />

            {/* 1-CLICK CITY COMMISSION MODAL */}
            {city && (
              <CityCommissionModal
                isOpen={isCommissionModalOpen}
                cityId={city.id}
                cityName={city.name}
                initialRate={Number(city.default_commission_rate || 10)}
                onClose={() => setIsCommissionModalOpen(false)}
                onSuccess={(newRate, updatedCount) => {
                  setCity(prev => prev ? { ...prev, default_commission_rate: newRate } : null);
                  setShops(prev => prev.map(s => ({ ...s, commission_rate: newRate })));
                  setFeedback({
                    type: 'success',
                    message: `Commission updated to ${newRate}% for ${city.name} and cascaded to ${updatedCount} shop(s).`,
                  });
                  setTimeout(() => setFeedback(null), 5000);
                }}
              />
            )}

            {/* SUSPEND REASON MODAL */}
            {suspendingShop && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scaleUp">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Suspend Boutique Store</h3>
                    </div>
                    <button
                      onClick={() => setSuspendingShop(null)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 text-xs">
                    <p className="text-slate-600">
                      You are suspending <strong>{suspendingShop.name}</strong>. Their product listings will be temporarily suppressed from the customer catalog.
                    </p>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Reason for Suspension
                      </label>
                      <textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="e.g. Order defect rate exceeded 2.5%, customer counterfeit dispute, or KYC update required..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSuspendingShop(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSuspend}
                        disabled={actionLoading === suspendingShop.id}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span>{actionLoading === suspendingShop.id ? 'Suspending...' : 'Confirm Suspension'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit City Settings Modal */}
            {isEditModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Edit City Hub Settings</h3>
                    </div>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveCitySettings} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        City Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Postal PIN Code Prefix
                      </label>
                      <input
                        type="text"
                        value={editPincode}
                        onChange={(e) => setEditPincode(e.target.value)}
                        placeholder="e.g. 400"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="featuredCheck"
                        checked={editIsFeatured}
                        onChange={(e) => setEditIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="featuredCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                        Feature this city as a Top Hub in Customer Explore
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Direct Boutique Registration Modal */}
            {isCreateShopOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-300 my-8">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Direct Boutique Onboarding</h3>
                        <p className="text-xs text-slate-500 font-medium">Add local merchant boutique directly to {city?.name} hub</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsCreateShopOpen(false)}
                      className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateBoutique} className="p-6 space-y-4">
                    {/* Boutique Name & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Boutique Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newShopName}
                          onChange={(e) => setNewShopName(e.target.value)}
                          placeholder="e.g. Silk Horizon, Muga Sarees"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Merchandise Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        >
                          <option value="Traditional & Ethnic">Traditional & Ethnic</option>
                          <option value="Luxury & Designer">Luxury & Designer</option>
                          <option value="Streetwear">Streetwear</option>
                          <option value="Sneakers & Footwear">Sneakers & Footwear</option>
                        </select>
                      </div>
                    </div>

                    {/* Local Market & Commission Rate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Market / Street / Mall
                        </label>
                        <input
                          type="text"
                          value={newMarketName}
                          onChange={(e) => setNewMarketName(e.target.value)}
                          placeholder="e.g. Pan Bazar, GS Road, City Center"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Boutique Commission (%)
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

                    {/* Owner Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Merchant / Owner Name
                        </label>
                        <input
                          type="text"
                          value={newOwnerName}
                          onChange={(e) => setNewOwnerName(e.target.value)}
                          placeholder="e.g. Ashraf Ali"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Owner Mobile Number
                        </label>
                        <input
                          type="text"
                          value={newOwnerPhone}
                          onChange={(e) => setNewOwnerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Owner Email & Payout UPI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Owner Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={newOwnerEmail}
                          onChange={(e) => setNewOwnerEmail(e.target.value)}
                          placeholder="owner@boutique.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Payout UPI ID
                        </label>
                        <input
                          type="text"
                          value={newPayoutUpi}
                          onChange={(e) => setNewPayoutUpi(e.target.value)}
                          placeholder="merchant@oksbi"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Store Description / Bio
                      </label>
                      <textarea
                        rows={2}
                        value={newShopBio}
                        onChange={(e) => setNewShopBio(e.target.value)}
                        placeholder="Authentic silk & ethnic wear boutique verified on Nvilar marketplace."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsCreateShopOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingShop}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                      >
                        {isCreatingShop ? 'Onboarding...' : 'Onboard Boutique'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
    </div>
  );
}
