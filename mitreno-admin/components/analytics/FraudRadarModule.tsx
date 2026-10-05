'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserX,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Ban,
  PhoneCall,
} from 'lucide-react';
import { fetchFraudRadar } from '../../lib/api';
import { FraudRadarData } from '../../lib/types';

interface FraudRadarModuleProps {
  period: string;
  isDark: boolean;
  formatINR: (amount: number) => string;
  card3DClass: string;
}

export function FraudRadarModule({
  period,
  isDark,
  formatINR,
  card3DClass,
}: FraudRadarModuleProps) {
  const [data, setData] = useState<FraudRadarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFraudRadar(period);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load fraud radar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const filteredPincodes = (data?.pincode_risks || []).filter(
    (p) =>
      p.pincode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const summary = data?.summary || {
    total_orders: 0,
    total_cancelled_orders: 0,
    rto_rate_pct: 0,
    overdue_dispatch_count: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 4 SUMMARY MISSION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Audited */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Audited Orders
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {summary.total_orders}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Total volume processed</span>
            </div>
          </div>
        </div>

        {/* Total Cancelled / RTO */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
              Cancelled &amp; RTO
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-600'}`}>
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              {summary.total_cancelled_orders}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Orders revoked before delivery</span>
            </div>
          </div>
        </div>

        {/* RTO Risk Rate */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Market RTO Rate
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <UserX className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {summary.rto_rate_pct}%
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Cancellation ratio in period</span>
            </div>
          </div>
        </div>

        {/* SLA Dispatch Breaches */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
              Dispatch SLA Breaches
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : 'bg-orange-50 border border-orange-200 text-orange-600'}`}>
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              {summary.overdue_dispatch_count}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Pending seller dispatch &gt; 48h</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN GRID: HIGH RISK PINCODES & SERIAL CANCELLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* HIGH-RISK PINCODES MATRIX */}
        <div className={`${card3DClass} p-5 sm:p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-950/60 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Regional Pincode Risk Matrix
                </h3>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search pincode or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs font-bold rounded-xl border outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 shadow-2xs'
                  }`}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-300 bg-slate-800/60' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                    <th className="py-3 px-3 rounded-l-lg">Pincode</th>
                    <th className="py-3 px-3">City</th>
                    <th className="py-3 px-3 text-right">Orders</th>
                    <th className="py-3 px-3 text-right">Cancelled</th>
                    <th className="py-3 px-3 text-right">RTO Rate</th>
                    <th className="py-3 px-3 text-center rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPincodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400">
                        No pincodes recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    filteredPincodes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className={`py-3 px-3 font-mono font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                          {item.pincode}
                        </td>
                        <td className={`py-3 px-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {item.city}
                        </td>
                        <td className={`py-3 px-3 text-right font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {item.total_orders}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                          {item.cancelled_orders}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-600 dark:text-amber-400">
                          {item.cancel_rate_pct}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                              item.risk_level === 'CRITICAL'
                                ? isDark
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/40'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                : isDark
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {item.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <span>Pincodes with &gt; 50% RTO automatically highlighted</span>
            <span className={`font-black text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>● Direct PostGIS / Postgres Query</span>
          </div>
        </div>

        {/* SERIAL CANCELLERS & COD ABUSERS */}
        <div className={`${card3DClass} p-5 sm:p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                  <UserX className="w-4.5 h-4.5" />
                </div>
                <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Serial Cancellers &amp; COD Watchlist
                </h3>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold border ${isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {(data?.serial_cancellers || []).length} Flagged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-300 bg-slate-800/60' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                    <th className="py-3 px-3 rounded-l-lg">Customer</th>
                    <th className="py-3 px-3 text-right">Orders</th>
                    <th className="py-3 px-3 text-right">Cancelled</th>
                    <th className="py-3 px-3 text-right">Cancelled GMV</th>
                    <th className="py-3 px-3 text-center rounded-r-lg">Safety Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data?.serial_cancellers || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400">
                        No serial cancellers detected in this period.
                      </td>
                    </tr>
                  ) : (
                    (data?.serial_cancellers || []).map((user, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user.full_name || 'Guest Buyer'}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {user.phone || 'No phone'}
                            </span>
                            {user.phone && (
                              <button
                                onClick={() => copyPhone(user.phone)}
                                title="Copy Phone Number"
                                className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                {copiedPhone === user.phone ? '✓ Copied' : 'Copy'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className={`py-3 px-3 text-right font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {user.total_orders}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                          {user.cancelled_orders} ({user.cancel_rate_pct}%)
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-600 dark:text-amber-400">
                          {formatINR(user.cancelled_volume)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                              user.risk_action === 'DISABLE_COD'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-700/50'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-700/50'
                            }`}
                          >
                            <Ban className="w-3 h-3" />
                            {user.risk_action}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <span>Flagged accounts get COD disabled on high-ticket orders</span>
            <span className="font-black text-rose-500">● Auto Protection Rule Active</span>
          </div>
        </div>
      </div>

      {/* DISPATCH SLA OVERDUE WATCHDOG */}
      <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-950/60 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Dispatch SLA Overdue Watchdog
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Orders placed &gt; 48 hours ago without logistics tracking handover
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
            (data?.overdue_dispatches || []).length > 0
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-700'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200'
          }`}>
            {(data?.overdue_dispatches || []).length} SLA Breaches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-300 bg-slate-800/60' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                <th className="py-3 px-3.5 rounded-l-lg">Order ID</th>
                <th className="py-3 px-3.5">Boutique / Shop</th>
                <th className="py-3 px-3.5">Destination</th>
                <th className="py-3 px-3.5 text-right">Order Value</th>
                <th className="py-3 px-3.5 text-right">Time Since Order</th>
                <th className="py-3 px-3.5 text-center rounded-r-lg">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.overdue_dispatches || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                    All paid/placed orders dispatched within standard 48-hour SLA!
                  </td>
                </tr>
              ) : (
                (data?.overdue_dispatches || []).map((ord, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className={`py-3 px-3.5 font-mono font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {ord.order_id}
                    </td>
                    <td className={`py-3 px-3.5 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {ord.shop_name}
                    </td>
                    <td className={`py-3 px-3.5 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {ord.customer_city || 'India'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatINR(ord.total_paid)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-rose-600 dark:text-rose-400">
                      {Math.round(ord.hours_elapsed)} hrs ago
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                        CRITICAL BREACH
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
