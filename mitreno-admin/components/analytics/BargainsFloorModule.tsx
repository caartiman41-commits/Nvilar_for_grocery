'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Flame,
  TrendingUp,
  Percent,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';
import { fetchBargainsFloor } from '../../lib/api';
import { BargainsFloorData } from '../../lib/types';

interface BargainsFloorModuleProps {
  period: string;
  isDark: boolean;
  formatINR: (amount: number) => string;
  card3DClass: string;
}

export function BargainsFloorModule({
  period,
  isDark,
  formatINR,
  card3DClass,
}: BargainsFloorModuleProps) {
  const [data, setData] = useState<BargainsFloorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchBargainsFloor(period);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load bargains floor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const intelligence = data?.intelligence || {
    avg_discount_asked: 0,
    avg_discount_accepted: 0,
    total_negotiations: 0,
    accepted_count: 0,
    conversion_rate_pct: 0,
  };

  const filteredStream = (data?.stream || []).filter(
    (s) =>
      s.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 4 BARGAINS INTELLIGENCE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Negotiations Opened */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Total Negotiations
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {intelligence.total_negotiations}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Customer price talks initiated</span>
            </div>
          </div>
        </div>

        {/* Accepted Deals */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Agreed Deals
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {intelligence.accepted_count}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">{intelligence.conversion_rate_pct}% conversion</span>
            </div>
          </div>
        </div>

        {/* Avg Discount Asked */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
              Avg Discount Asked
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-600'}`}>
              <Percent className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              {intelligence.avg_discount_asked}%
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Average price cut sought by buyer</span>
            </div>
          </div>
        </div>

        {/* Avg Discount Accepted */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Avg Discount Accepted
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              <Flame className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {intelligence.avg_discount_accepted}%
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Seller sweet spot threshold</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE NEGOTIATION FLOOR TABLE */}
      <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Live Bargaining Floor Stream
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time negotiations between Indian buyers and registered boutique sellers
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search buyer, product, shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-xs font-bold rounded-xl border outline-hidden transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 shadow-2xs'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-300 bg-slate-800/60' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                <th className="py-3 px-3.5 rounded-l-lg">Buyer</th>
                <th className="py-3 px-3.5">Product &amp; Boutique</th>
                <th className="py-3 px-3.5 text-right">Original MRP</th>
                <th className="py-3 px-3.5 text-right">Buyer Offer</th>
                <th className="py-3 px-3.5 text-right">Seller Offer</th>
                <th className="py-3 px-3.5 text-right">Discount Asked</th>
                <th className="py-3 px-3.5 text-center rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStream.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-bold text-slate-400">
                    No active bargain sessions recorded in this period.
                  </td>
                </tr>
              ) : (
                filteredStream.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.buyer_name || 'Anonymous Buyer'}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ID: {item.negotiation_id}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className={`font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {item.product_name}
                      </div>
                      <div className={`text-[11px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        {item.shop_name}
                      </div>
                    </td>
                    <td className={`py-3 px-3.5 text-right line-through font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatINR(item.original_price)}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatINR(item.buyer_last_offer)}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {formatINR(item.seller_last_offer)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-rose-600 dark:text-rose-400">
                      {item.discount_asked_pct}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                          item.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          <span>Nvilar AI sets automatic upper/lower acceptable limits for each boutique</span>
          <span className="font-black text-amber-600 dark:text-amber-400">● Live WebSocket / Polling Synced</span>
        </div>
      </div>
    </div>
  );
}
