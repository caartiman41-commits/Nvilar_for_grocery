'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Star,
  MapPin,
  Lock,
  Unlock,
  Ban,
  Trash2,
  DollarSign,
  ShoppingBag,
  XCircle,
  AlertTriangle,
  Percent,
  Building2,
  Globe,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { ShopKundliModal } from '../../components/ShopKundliModal';
import { CityCommissionModal } from '../../components/CityCommissionModal';
import {
  isAuthenticated,
  fetchAdminShops,
  fetchStates,
  fetchCitiesByState,
  suspendShop,
  activateShop,
  terminateShop,
  deleteShop,
  fetchApplications,
} from '../../lib/api';
import { AdminShopItem, StateItem, CityItem } from '../../lib/types';

export default function ActiveBoutiquesPage() {
  const router = useRouter();
  const [boutiques, setBoutiques] = useState<AdminShopItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Kundli Cockpit Modal state
  const [kundliShopId, setKundliShopId] = useState<string | null>(null);
  const [isKundliOpen, setIsKundliOpen] = useState(false);

  // Commission Modal state
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [commissionCityId, setCommissionCityId] = useState('');
  const [commissionCityName, setCommissionCityName] = useState('');
  const [commissionRate, setCommissionRate] = useState(10.0);

  // Action Dialog States (Suspend / Terminate / Delete)
  const [actionShop, setActionShop] = useState<AdminShopItem | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'terminate' | 'delete' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shopList, stateList, appRes] = await Promise.all([
        fetchAdminShops({
          state_id: selectedState !== 'all' ? selectedState : undefined,
          city_id: selectedCity !== 'all' ? selectedCity : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }),
        fetchStates(),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setBoutiques(shopList);
      setStates(stateList);
      setPendingCount(appRes.counts.pending);
    } catch (err) {
      console.error('Failed to load boutiques directory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedState, selectedCity, statusFilter, categoryFilter]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router, loadData]);

  // Handle State Change -> Load Cities
  const handleStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('all');
    if (stateId === 'all') {
      setCities([]);
    } else {
      try {
        const res = await fetchCitiesByState(stateId);
        setCities(res.cities || []);
      } catch (err) {
        console.error('Failed to load cities for state:', err);
        setCities([]);
      }
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Open Full-Screen Kundli Cockpit
  const handleOpenKundli = (shopId: string) => {
    setKundliShopId(shopId);
    setIsKundliOpen(true);
  };

  // Open City Commission Modal
  const handleOpenCommissionModal = (cityId: string, currentRate: number, cityName?: string) => {
    setCommissionCityId(cityId);
    setCommissionCityName(cityName || 'Selected City');
    setCommissionRate(currentRate);
    setCommissionModalOpen(true);
  };

  const handleCommissionSuccess = (newRate: number, updatedCount: number) => {
    showToast('success', `Commission updated to ${newRate.toFixed(2)}% across ${updatedCount} boutiques in ${commissionCityName}.`);
    loadData();
  };

  const handleExecuteAction = async () => {
    if (!actionShop || !actionType) return;
    setIsProcessing(true);

    if (actionType === 'suspend') {
      const res = await suspendShop(actionShop.id, actionReason || 'Temporary administrative suspension');
      setIsProcessing(false);
      if (res.success) {
        setBoutiques(prev => prev.map(s => s.id === actionShop.id ? { ...s, status: 'suspended', status_reason: actionReason } : s));
        closeActionModal();
        showToast('success', `Boutique "${actionShop.name}" has been suspended.`);
      } else {
        showToast('error', res.error || 'Failed to suspend shop');
      }
    } else if (actionType === 'terminate') {
      const res = await terminateShop(actionShop.id, actionReason || 'Terminated permanently for compliance breach');
      setIsProcessing(false);
      if (res.success) {
        setBoutiques(prev => prev.map(s => s.id === actionShop.id ? { ...s, status: 'terminated', status_reason: actionReason } : s));
        closeActionModal();
        showToast('success', `Boutique "${actionShop.name}" has been terminated and banned.`);
      } else {
        showToast('error', res.error || 'Failed to terminate shop');
      }
    } else if (actionType === 'delete') {
      if (confirmInput !== actionShop.name) {
        alert('Store name does not match confirmation.');
        setIsProcessing(false);
        return;
      }
      const res = await deleteShop(actionShop.id);
      setIsProcessing(false);
      if (res.success) {
        setBoutiques(prev => prev.filter(s => s.id !== actionShop.id));
        closeActionModal();
        showToast('success', `Boutique "${actionShop.name}" permanently deleted.`);
      } else {
        showToast('error', res.error || 'Failed to delete shop');
      }
    }
  };

  const handleActivate = async (shop: AdminShopItem) => {
    const res = await activateShop(shop.id);
    if (res.success) {
      setBoutiques(prev => prev.map(s => s.id === shop.id ? { ...s, status: 'active', status_reason: null } : s));
      showToast('success', `Boutique "${shop.name}" is now active and live.`);
    } else {
      showToast('error', res.error || 'Failed to activate shop');
    }
  };

  const closeActionModal = () => {
    setActionShop(null);
    setActionType(null);
    setActionReason('');
    setConfirmInput('');
  };

  // Client-side quick search filter on current loaded records
  const filteredBoutiques = useMemo(() => {
    return boutiques.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.owner_name && b.owner_name.toLowerCase().includes(q)) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        (b.city_name && b.city_name.toLowerCase().includes(q)) ||
        (b.state_name && b.state_name.toLowerCase().includes(q)) ||
        (b.market_name && b.market_name.toLowerCase().includes(q)) ||
        (b.payout_upi_id && b.payout_upi_id.toLowerCase().includes(q));

      const matchCat = categoryFilter === 'all' || b.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchState = selectedState === 'all' || b.state_id === selectedState;
      const matchCity = selectedCity === 'all' || b.city_id === selectedCity;

      return matchSearch && matchCat && matchStatus && matchState && matchCity;
    });
  }, [boutiques, searchQuery, categoryFilter, statusFilter, selectedState, selectedCity]);

  // Aggregate Metrics for Ribbon
  const totalGmvSum = useMemo(() => {
    return boutiques.reduce((acc, b) => acc + Number(b.total_revenue || 0), 0);
  }, [boutiques]);

  const totalOrdersSum = useMemo(() => {
    return boutiques.reduce((acc, b) => acc + Number(b.total_orders || 0), 0);
  }, [boutiques]);

  const totalCancelledSum = useMemo(() => {
    return boutiques.reduce((acc, b) => acc + Number(b.cancelled_orders_count || 0), 0);
  }, [boutiques]);

  const avgCancellationRate = useMemo(() => {
    return totalOrdersSum > 0 ? ((totalCancelledSum / totalOrdersSum) * 100).toFixed(1) : '0.0';
  }, [totalOrdersSum, totalCancelledSum]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('all');
    setSelectedCity('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setCities([]);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <AdminNavbar pendingCount={pendingCount} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Executive Breadcrumb & Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
                <Link href="/" className="hover:text-slate-700 transition-colors">Dashboard</Link>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-800 font-semibold">Boutique Operations</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-indigo-600 font-bold">National Boutique Directory</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Store className="w-5 h-5" />
                </div>
                <span>National Master Boutique Directory</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  {boutiques.filter(b => b.status === 'active').length} Live
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
                Option A National Master Registry: Comprehensive oversight across all states, tier-1/tier-2 markets, live GMV, Amazon-style defect audits, and city commission cascades.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Refresh Boutique Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>

              <Link
                href="/markets"
                className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Geographic Markets</span>
              </Link>

              <Link
                href="/applications?status=pending_review"
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span>Applications ({pendingCount})</span>
              </Link>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-2xs transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* High-Density 4-KPI Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Revenue */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  TOTAL REVENUE (₹)
                </span>
                <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono">₹{totalGmvSum.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Gross</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: totalGmvSum > 0 ? '100%' : '5%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Cumulative gross sales</span>
                <span className="text-emerald-600 font-bold">100% Settled</span>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  COMPLETED ORDERS
                </span>
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono">{totalOrdersSum.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Orders</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, Math.min(100, 100 - Number(avgCancellationRate)))}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Total processed orders</span>
                <span className="text-indigo-600 font-bold">{(100 - Number(avgCancellationRate)).toFixed(0)}% Fulfilled</span>
              </div>
            </div>

            {/* Cancelled Orders */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                  CANCELLED ORDERS
                </span>
                <XCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono text-rose-600">{totalCancelledSum.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Defects</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(Number(avgCancellationRate), totalCancelledSum > 0 ? 5 : 0))}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Cancellation rate</span>
                <span className={`font-bold font-mono ${Number(avgCancellationRate) >= 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {avgCancellationRate}%
                </span>
              </div>
            </div>

            {/* Live Boutiques */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  LIVE BOUTIQUES
                </span>
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="font-mono">{boutiques.filter(b => b.status === 'active').length}</span>
                <span className="text-xs font-normal text-slate-400">/ {boutiques.length} Total</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${boutiques.length > 0 ? Math.round((boutiques.filter(b => b.status === 'active').length / boutiques.length) * 100) : 0}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span className="text-amber-600 font-semibold">{boutiques.filter(b => b.status === 'suspended').length} Suspended</span>
                <span className="text-rose-600 font-semibold">{boutiques.filter(b => b.status === 'terminated').length} Terminated</span>
              </div>
            </div>
          </div>

          {/* Dynamic Geographic & Operational Filter Bar - High Contrast 3D */}
          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search boutique name, owner, city, state, market, UPI ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-slate-50/50 hover:bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-400 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* State Filter */}
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="all">All States ({states.length})</option>
                  {states.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={selectedState === 'all' && cities.length === 0}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 disabled:opacity-50 shadow-xs focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="all">
                    {selectedState === 'all' ? 'Select State First' : `All Cities (${cities.length})`}
                  </option>
                  {cities.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="Traditional & Ethnic">Traditional & Ethnic</option>
                <option value="Luxury & Designer">Luxury & Designer</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Sneakers & Footwear">Sneakers & Footwear</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">All Status ({boutiques.length})</option>
                <option value="active">Active ({boutiques.filter(b => b.status === 'active').length})</option>
                <option value="suspended">Suspended ({boutiques.filter(b => b.status === 'suspended').length})</option>
                <option value="terminated">Terminated ({boutiques.filter(b => b.status === 'terminated').length})</option>
              </select>

              {/* Reset Filters button */}
              {(searchQuery || selectedState !== 'all' || selectedCity !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer border border-slate-300"
                  title="Reset all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Boutique Directory Table - Sharp Executive Design */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            {isLoading ? (
              <div className="p-16 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Loading national boutique records...</p>
              </div>
            ) : filteredBoutiques.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <Store className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No boutiques match your filters</p>
                <p className="text-[11px] text-slate-400">Try adjusting your geographic territory or category filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3.5">Boutique</th>
                      <th className="px-4 py-3.5">Territory</th>
                      <th className="px-4 py-3.5">Owner & Banking</th>
                      <th className="px-4 py-3.5">Gross Revenue</th>
                      <th className="px-4 py-3.5">Commission %</th>
                      <th className="px-4 py-3.5">Fulfillment & ODR</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBoutiques.map((b) => {
                      const cancelRate = b.total_orders > 0 
                        ? ((b.cancelled_orders_count / b.total_orders) * 100).toFixed(1)
                        : '0.0';
                      const isHighCancellation = Number(cancelRate) >= 10;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Boutique Brand & Logo */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {b.logo_url ? (
                                <img
                                  src={b.logo_url}
                                  alt={b.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0 bg-slate-50 shadow-xs"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-sm shrink-0 shadow-xs">
                                  {b.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 max-w-[220px]">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    onClick={() => handleOpenKundli(b.id)}
                                    className="font-extrabold text-slate-900 text-sm hover:text-indigo-600 transition-colors cursor-pointer truncate"
                                    title="Open Full-Screen Shop Kundli"
                                  >
                                    {b.name}
                                  </span>
                                  {b.is_verified && (
                                    <span title="Verified Merchant">
                                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                                  <span className="text-slate-700 font-semibold">{b.category || 'Apparel'}</span>
                                  <span>•</span>
                                  <span className="truncate">{b.market_name || 'Central Market'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Geographic Territory */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
                                {b.state_code || 'IN'}
                              </span>
                              <span className="font-bold text-slate-900 text-xs">
                                {b.city_name || b.city || 'Guwahati'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 font-medium">
                              {b.state_name || 'Assam'}
                            </p>
                            {(() => {
                              const bLat = b.latitude ?? (b as any).shop_address?.latitude;
                              const bLng = b.longitude ?? (b as any).shop_address?.longitude;
                              const latNum = bLat != null && bLat !== '' && !isNaN(Number(bLat)) ? Number(bLat) : null;
                              const lngNum = bLng != null && bLng !== '' && !isNaN(Number(bLng)) ? Number(bLng) : null;
                              const hasGps = latNum !== null && lngNum !== null && (latNum !== 0 || lngNum !== 0);

                              if (!hasGps) return null;

                              return (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    title={`GPS Radar Locked: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>GPS</span>
                                  </span>
                                  <a
                                    href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    title={`Open ${b.name} in Google Maps (${latNum.toFixed(4)}, ${lngNum.toFixed(4)})`}
                                  >
                                    <span>📍 Maps</span>
                                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                  </a>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Owner & UPI */}
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-900 text-xs">{b.owner_name || 'Boutique Owner'}</p>
                            <p className="text-[11px] text-slate-600 font-medium mt-0.5">{b.owner_phone || '+91 98765 00000'}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">UPI</span>
                              <span className="text-[11px] text-slate-700 font-semibold truncate max-w-[130px]" title={b.payout_upi_id || 'unlinked'}>
                                {b.payout_upi_id || 'unlinked'}
                              </span>
                            </div>
                          </td>

                          {/* Revenue */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-extrabold text-slate-900 text-sm tracking-tight">
                              ₹{Number(b.total_revenue || 0).toLocaleString('en-IN')}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 font-medium">
                              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.total_orders || 0} orders</span>
                            </div>
                          </td>

                          {/* Commission Rate */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-xs">
                                <Percent className="w-3 h-3 text-indigo-600" />
                                <span>{Number(b.commission_rate || 10).toFixed(1)}%</span>
                              </span>
                              {b.city_id && (
                                <button
                                  onClick={() => handleOpenCommissionModal(b.city_id!, Number(b.commission_rate || 10), b.city_name || b.city)}
                                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                                  title="Edit city-level commission"
                                >
                                  City %
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                              Benchmark: {b.city_commission_rate ? `${Number(b.city_commission_rate).toFixed(1)}%` : '10.0%'}
                            </p>
                          </td>

                          {/* Fulfillment & Defect */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold border shadow-2xs ${
                                isHighCancellation 
                                  ? 'bg-rose-50 text-rose-800 border-rose-300' 
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}>
                                {cancelRate}% ODR
                              </span>
                              {isHighCancellation && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-2xs">
                                  ALERT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 font-medium">
                              <span>{b.cancelled_orders_count || 0} cancelled</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-700 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                {b.rating || 4.8}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {b.status === 'active' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                Active
                              </span>
                            )}
                            {b.status === 'suspended' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                                Suspended
                              </span>
                            )}
                            {b.status === 'terminated' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                                Terminated
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Kundli Cockpit Trigger */}
                              <button
                                onClick={() => handleOpenKundli(b.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                title="Open Full-Screen Amazon Seller Central Kundli Cockpit"
                              >
                                <span>Kundli</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>

                              {/* Re-activate / Suspend */}
                              {b.status === 'suspended' || b.status === 'terminated' ? (
                                <button
                                  onClick={() => handleActivate(b)}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                                  title="Restore / Activate Store"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setActionShop(b); setActionType('suspend'); }}
                                  className="p-1.5 rounded-lg border border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                                  title="Suspend Store (Temporary)"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Terminate */}
                              {b.status !== 'terminated' && (
                                <button
                                  onClick={() => { setActionShop(b); setActionType('terminate'); }}
                                  className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                                  title="Terminate / Ban Store"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => { setActionShop(b); setActionType('delete'); }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                                title="Permanently Delete Store"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Modal (Suspend / Terminate / Delete) */}
          {actionType && actionShop && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    {actionType === 'suspend' && <Lock className="w-4 h-4 text-amber-600" />}
                    {actionType === 'terminate' && <Ban className="w-4 h-4 text-rose-600" />}
                    {actionType === 'delete' && <Trash2 className="w-4 h-4 text-rose-600" />}
                    <span className="capitalize text-sm">{actionType} Boutique Store</span>
                  </div>
                  <button onClick={closeActionModal} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {actionType === 'suspend' && (
                    <>
                      Temporarily disabling <strong>{actionShop.name}</strong> will hide its catalog products and bargain rooms from customers until re-activated.
                    </>
                  )}
                  {actionType === 'terminate' && (
                    <>
                      Terminating <strong>{actionShop.name}</strong> revokes all merchant privileges, cancels active listings, and flags the owner phone/UPI for compliance.
                    </>
                  )}
                  {actionType === 'delete' && (
                    <>
                      ⚠️ <strong>Permanently deleting</strong> will hard-remove <strong>{actionShop.name}</strong> from the database. This action cannot be undone.
                    </>
                  )}
                </p>

                {actionType !== 'delete' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reason for {actionType} *</label>
                    <textarea
                      rows={3}
                      placeholder={`State why this store is being ${actionType}ed...`}
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Type store name <code className="text-rose-600 font-bold">{actionShop.name}</code> to confirm deletion:
                    </label>
                    <input
                      type="text"
                      placeholder={actionShop.name}
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs focus:outline-hidden focus:border-rose-500 font-bold"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={closeActionModal}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteAction}
                    disabled={isProcessing || (actionType === 'delete' && confirmInput !== actionShop.name)}
                    className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer ${
                      actionType === 'suspend'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : `Confirm ${actionType}`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full-Screen Amazon Seller Central Style Shop Kundli Cockpit Modal */}
          <ShopKundliModal
            shopId={kundliShopId}
            isOpen={isKundliOpen}
            onClose={() => {
              setIsKundliOpen(false);
              setKundliShopId(null);
            }}
            onStatusChange={(sId, newStatus) => {
              setBoutiques(prev => prev.map(s => s.id === sId ? { ...s, status: newStatus } : s));
            }}
            onOpenCommissionModal={(cId, rate) => {
              const shop = boutiques.find(b => b.id === kundliShopId);
              handleOpenCommissionModal(cId, rate, shop?.city_name || shop?.city);
            }}
          />

          {/* 1-Click City Commission Modal */}
          <CityCommissionModal
            isOpen={commissionModalOpen}
            cityId={commissionCityId}
            cityName={commissionCityName}
            initialRate={commissionRate}
            onClose={() => setCommissionModalOpen(false)}
            onSuccess={handleCommissionSuccess}
          />
        </main>
      </div>
    </div>
  );
}
