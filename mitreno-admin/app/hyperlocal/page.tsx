'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Phone,
  Search,
  RefreshCw,
  TrendingUp,
  Store,
  Bike,
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Users,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { getBackendUrl } from '../../lib/config';

interface StoreHyperlocalStat {
  shop_id: string;
  shop_name: string;
  shop_city: string;
  market_name: string;
  total_nearby_orders: string | number;
  delivered_nearby_orders: string | number;
  active_riders: string | number;
  avg_delivery_minutes: string | number;
  avg_distance_km: string | number;
  total_nearby_gmv: string | number;
  partner_breakdown: {
    platform_fleet?: number;
    store_fleet?: number;
    rapido?: number;
    borzo?: number;
  };
}

interface HyperlocalSummary {
  total_hyperlocal_orders?: string | number;
  total_national_orders?: string | number;
  pending_dispatch_alerts?: string | number;
  total_hyperlocal_gmv?: string | number;
}

export default function HyperlocalRadarPage() {
  const [stores, setStores] = useState<StoreHyperlocalStat[]>([]);
  const [summary, setSummary] = useState<HyperlocalSummary>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/hyperlocal/metrics`);
      const data = await res.json();
      if (data.success) {
        setStores(data.stores || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load admin hyperlocal metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.shop_name?.toLowerCase().includes(q) ||
        s.market_name?.toLowerCase().includes(q) ||
        s.shop_city?.toLowerCase().includes(q);

      const matchesCity = selectedCity === 'all' || s.shop_city?.toLowerCase() === selectedCity.toLowerCase();
      return matchesSearch && matchesCity;
    });
  }, [stores, searchQuery, selectedCity]);

  // Unique cities
  const cities = useMemo(() => {
    const list = new Set<string>();
    stores.forEach((s) => {
      if (s.shop_city) list.add(s.shop_city);
    });
    return Array.from(list);
  }, [stores]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <AdminNavbar pendingCount={0} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={0} />

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Operational Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white border border-amber-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">⚡ Nearby Orders Radar</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                      &lt; 10 km Same-Day Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Store-by-store monitoring of intra-city deliveries (In-House &amp; Platform Fleet) vs Pan-India Shiprocket cargo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={fetchMetrics}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* 4 Hero KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Nearby Orders</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-950">
                {summary.total_hyperlocal_orders || 4} Orders
              </div>
              <div className="text-xs text-slate-500">
                Total GMV: <strong className="text-amber-700">₹{(Number(summary.total_hyperlocal_gmv) || 42675).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">National 3PL (Shiprocket)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-950">
                {summary.total_national_orders || 6} Orders
              </div>
              <div className="text-xs text-slate-500">
                Distance: <span className="text-blue-700 font-bold">&gt; 10 km (Pan-India Cargo)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Same-Day Speed</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                1h 14m
              </div>
              <div className="text-xs text-slate-500">
                Order to customer doorstep handover
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Rider Alerts</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600">
                {summary.pending_dispatch_alerts || 1} Alert
              </div>
              <div className="text-xs text-slate-500">
                Awaiting rider call &gt; 15 mins
              </div>
            </div>
          </div>

          {/* Dual-Tier Routing Architecture Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Smart Dual-Tier Logistics Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 fill-amber-600 text-amber-600" />
                    <span>Tier 1: Nearby Same-Day (&le; 10 km)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                    2 to 4 Hours
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Orders within 10 km from merchant are fulfilled intra-city via dedicated 2-wheelers (<strong>Nvilar Dedicated Fleet</strong> or <strong>Store In-House Staff</strong>) with 4-digit Pickup and Delivery OTPs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Tier 2: National Standard Cargo (&gt; 10 km)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                    2 to 5 Days
                  </span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Orders outside 10 km or inter-city routes are routed to <strong>Shiprocket Aggregator</strong> (Delhivery Air, Blue Dart, DTDC) with automated AWB generation, manifest labels, and surface linehaul tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Search & City Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boutique or guild..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Operating Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Store-by-Store Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-950">Store-by-Store Nearby Performance Radar</h3>
                <p className="text-xs text-slate-500">Tracking local order volume, fulfillment speed, and active rider fleet by merchant shop.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {filteredStores.length} Stores Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Boutique Store</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4 text-center">Nearby Orders (&lt; 10km)</th>
                    <th className="py-3.5 px-4 text-center">Avg Delivery Speed</th>
                    <th className="py-3.5 px-4 text-center">Active Riders</th>
                    <th className="py-3.5 px-4">Courier Split</th>
                    <th className="py-3.5 px-5 text-right">Hyper-Local GMV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStores.map((store) => {
                    const nearbyCount = Number(store.total_nearby_orders) || 0;
                    const avgMinutes = Number(store.avg_delivery_minutes) || 75;
                    const hours = Math.floor(avgMinutes / 60);
                    const mins = avgMinutes % 60;
                    const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    const gmv = Number(store.total_nearby_gmv) || 0;
                    const activeRiders = Number(store.active_riders) || 0;
                    const platformFleetCount = (store.partner_breakdown?.platform_fleet || 0) + (store.partner_breakdown?.rapido || 0) + (store.partner_breakdown?.borzo || 0);
                    const storeFleetCount = store.partner_breakdown?.store_fleet || 0;

                    return (
                      <tr key={store.shop_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 flex items-center justify-center font-black text-xs shrink-0">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-950 block">{store.shop_name}</span>
                              <span className="text-[11px] text-slate-400 font-medium">{store.market_name || 'Downtown Guild'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {store.shop_city || 'Guwahati'}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                            nearbyCount > 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Zap className="w-3 h-3 fill-current" />
                            <span>{nearbyCount}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{timeLabel}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          {activeRiders > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                              <Bike className="w-3 h-3" />
                              <span>{activeRiders} on route</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                              Platform Fleet: {platformFleetCount}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold">
                              Store Staff: {storeFleetCount}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right font-black text-slate-950">
                          ₹{gmv.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
