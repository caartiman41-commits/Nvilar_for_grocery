'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Activity,
  Zap,
  Store,
  Compass,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  Radio,
  Eye,
  CheckCircle2,
  Flame,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { fetchLiveActivities } from '../../lib/api';
import { LiveActivityData } from '../../lib/types';

interface LiveActivitiesModuleProps {
  period: string;
  isDark: boolean;
  formatINR: (amount: number) => string;
  card3DClass: string;
}

export function LiveActivitiesModule({
  period,
  isDark,
  formatINR,
  card3DClass,
}: LiveActivitiesModuleProps) {
  const [data, setData] = useState<LiveActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchLiveActivities(period);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load live activities telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh pulse every 20 seconds for real-time live presence
    const timer = setInterval(loadData, 20000);
    return () => clearInterval(timer);
  }, [period]);

  const pulse = data?.pulse || {
    active_now: 0,
    last_1h: 0,
    dau_today: 0,
    wau_7d: 0,
    mau_30d: 0,
    stickiness_pct: 0,
    online_sellers_count: 0,
    total_sellers_count: 0,
  };

  const filteredBoutiques = (data?.boutiques || []).filter(
    (b) =>
      b.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hourly velocity SVG spline coordinates
  const hourlyList = data?.hourly_velocity || [];
  const maxHourlySessions = Math.max(...hourlyList.map((h) => h.sessions_count), 5);

  const hourlySvgPoints = useMemo(() => {
    if (hourlyList.length === 0) return { line: '', area: '', points: [] };
    const width = 640;
    const height = 130;
    const paddingX = 20;

    const pts = hourlyList.map((h, idx) => {
      const x = paddingX + (idx / Math.max(1, hourlyList.length - 1)) * (width - 2 * paddingX);
      const normalized = h.sessions_count / maxHourlySessions;
      const y = height - normalized * (height - 30) - 10;
      return { x: Math.round(x), y: Math.round(y), label: h.hour_label, count: h.sessions_count };
    });

    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      line += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const area = `${line} L ${lastX} ${height} L ${firstX} ${height} Z`;

    return { line, area, points: pts };
  }, [hourlyList, maxHourlySessions]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 4 LIVE TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Live Shoppers (Online Right Now) */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Active Now
              </span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
              <Radio className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {pulse.active_now}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">● 5-Min Pulse</span>
              <span>•</span>
              <span>Concurrent shoppers</span>
            </div>
          </div>
        </div>

        {/* 2. Last 1 Hour Footfall */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Last 1 Hour
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {pulse.last_1h}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>Unique device sessions</span>
            </div>
          </div>
        </div>

        {/* 3. Daily Active Users (DAU) & Stickiness */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              DAU (24 Hours)
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-600'}`}>
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              {pulse.dau_today}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="font-bold text-purple-600 dark:text-purple-400">{pulse.stickiness_pct}% Stickiness</span>
              <span>•</span>
              <span>{pulse.wau_7d} WAU</span>
            </div>
          </div>
        </div>

        {/* 4. Online Merchants / Boutiques */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Online Boutiques
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <Store className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {pulse.online_sellers_count} <span className="text-sm font-bold text-slate-400">/ {pulse.total_sellers_count}</span>
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Taking Orders &amp; Bargains</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN TELEMETRY GRID: LIVE FUNNEL & SEARCH RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LIVE CUSTOMER SCREEN / FUNNEL DISTRIBUTION */}
        <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-950/60 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Compass className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Live Customer Navigation Funnel
                </h3>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Where shoppers are navigating right now in the marketplace
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold border ${isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              Live Routes
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {(data?.funnel || []).map((fn, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {fn.zone_name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {fn.user_count} shoppers
                    </span>
                    <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      ({fn.pct_share}%)
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-blue-600'
                        : idx === 1
                        ? 'bg-amber-500'
                        : idx === 2
                        ? 'bg-emerald-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, fn.pct_share))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <span>Aggregated from real-time client route presence</span>
            <span className="font-black text-blue-600 dark:text-blue-400">● Zero Guesswork</span>
          </div>
        </div>

        {/* REAL-TIME SEARCH & DEMAND RADAR */}
        <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                <Search className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Live Search &amp; Demand Radar
                </h3>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Keywords typed by buyers in search bar (Past 24 hours)
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold border ${isDark ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              Top Queries
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {(data?.search_trends || []).map((term, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isDark
                    ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className={`font-black text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    "{term.keyword}"
                  </div>
                  <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                    {term.growth_tag}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {term.query_count}
                  </span>
                  <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    searches
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <span>Identifies emerging ethnic fashion demand in real-time</span>
            <span className="font-black text-rose-600 dark:text-rose-400">● Real Search Telemetry</span>
          </div>
        </div>
      </div>

      {/* HOURLY FOOTFALL VELOCITY SPLINE (24 HOURS) */}
      <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-cyan-950/60 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                24-Hour Footfall Velocity Spline
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Hourly visitor volume today to discover peak customer traffic periods
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-md font-bold border self-start sm:self-auto ${isDark ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
            Peak Traffic Wave
          </span>
        </div>

        {/* SVG Spline Chart */}
        <div className="relative w-full h-36">
          <svg viewBox="0 0 640 130" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hourlyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Baseline Gridlines */}
            <line x1="0" y1="125" x2="640" y2="125" stroke={isDark ? '#334155' : '#E2E8F0'} strokeDasharray="3 3" />
            <line x1="0" y1="65" x2="640" y2="65" stroke={isDark ? '#1e293b' : '#F1F5F9'} strokeDasharray="3 3" />

            {/* Shaded Area */}
            {hourlySvgPoints.area && (
              <path d={hourlySvgPoints.area} fill="url(#hourlyAreaGradient)" />
            )}

            {/* Stroke Line */}
            {hourlySvgPoints.line && (
              <path
                d={hourlySvgPoints.line}
                fill="none"
                stroke="#0891b2"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data point dots */}
            {hourlySvgPoints.points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#06b6d4"
                stroke={isDark ? '#0B0F19' : '#FFFFFF'}
                strokeWidth="2"
                className="cursor-pointer hover:r-5 transition-all"
                onClick={() => setSelectedHour(pt.label)}
              />
            ))}
          </svg>
        </div>

        {/* Hour Label Pills */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 overflow-x-auto pt-1">
          {hourlyList.filter((_, idx) => idx % 3 === 0).map((h, i) => (
            <span key={i} className="whitespace-nowrap font-mono">{h.hour_label}</span>
          ))}
        </div>
      </div>

      {/* ACTIVE BOUTIQUES REAL-TIME ROSTER TABLE */}
      <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Merchant Live Telemetry Roster
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Active boutique sellers, presence timestamps, and real-time operational status
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search boutique or city..."
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
                <th className="py-3 px-3.5 rounded-l-lg">Boutique Name</th>
                <th className="py-3 px-3.5">Hub City</th>
                <th className="py-3 px-3.5 text-center">Live Status</th>
                <th className="py-3 px-3.5">Current Action</th>
                <th className="py-3 px-3.5 text-right">Actionable Orders</th>
                <th className="py-3 px-3.5 text-center rounded-r-lg">Tier Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBoutiques.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400">
                    No boutiques matched query.
                  </td>
                </tr>
              ) : (
                filteredBoutiques.map((btq, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {btq.shop_name}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ID: {btq.shop_id}
                      </div>
                    </td>
                    <td className={`py-3 px-3.5 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {btq.city}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                          btq.is_online
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {btq.is_online ? '● ONLINE NOW' : `Offline (${btq.last_seen_ago})`}
                      </span>
                    </td>
                    <td className={`py-3 px-3.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {btq.current_action}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black">
                      {btq.pending_orders > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {btq.pending_orders} pending
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {btq.plan_type === 'pro_monthly' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          👑 PRO VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          ⚡ STARTER
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          <span>Sellers heartbeat auto-refreshes every 20 seconds</span>
          <span className="font-black text-amber-600 dark:text-amber-400">● Live Presence Stream</span>
        </div>
      </div>
    </div>
  );
}
