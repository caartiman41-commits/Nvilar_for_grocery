'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingBag,
  Eye,
  MessageSquare,
  Sparkles,
  Download,
  Layers,
  ChevronRight,
  Zap,
  RefreshCw,
  Award,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Clock,
  Truck,
  CreditCard,
  ArrowUpRight,
  Activity,
  Radar,
  Timer,
  Wallet,
  Building2,
  Check,
  ExternalLink,
  CircleDot,
  Boxes
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

interface TimelinePoint {
  date_label: string;
  date_full?: string;
  revenue: number;
  orders: number;
  units_sold: number;
}

interface SummaryData {
  total_sales: number;
  total_orders: number;
  delivered_orders?: number;
  delivered_revenue?: number;
  cancelled_orders?: number;
  cancelled_value?: number;
  rto_orders?: number;
  rto_value?: number;
  active_orders?: number;
  new_orders?: number;
  packaging_orders?: number;
  shipped_orders?: number;
  pipeline_revenue?: number;
  average_order_value: number;
  chat_deal_rate: number;
  total_units_sold: number;
}

interface PayoutsData {
  net_earnings: number;
  gross_revenue: number;
  platform_fee: number;
  pending_pipeline_revenue?: number;
  next_payout_date: string;
  payout_upi_id: string;
  prepaid_orders: number;
  cod_orders: number;
  prepaid_ratio_pct: number;
}

interface LogisticsData {
  new_orders?: number;
  packaging_orders?: number;
  pending_dispatch: number;
  in_transit: number;
  delivered_count: number;
  cancelled_count?: number;
  rto_count?: number;
  on_time_rate_pct: number;
  avg_dispatch_hrs: number;
}

interface ReturnReason {
  reason: string;
  percentage: number;
}

interface ReturnsData {
  total_returns: number;
  today_returns: number;
  return_rate_pct: number;
  return_value: number;
  risk_level: 'low' | 'moderate' | 'high';
  reasons: ReturnReason[];
}

interface FunnelData {
  impressions: number;
  product_views: number;
  price_inquiries: number;
  special_offers_sent: number;
  completed_orders: number;
  conversion_rate_pct: number;
}

interface CategoryShare {
  category: string;
  revenue: number;
  units: number;
  percentage: number;
}

interface TopProduct {
  id: string;
  name: string;
  thumbnail?: string;
  base_price: number;
  category?: string;
  fabric?: string;
  units_sold: number;
  revenue_generated: number;
}

interface AnalyticsPayload {
  success: boolean;
  shop?: { id: string; name: string };
  timeframe: '7d' | '30d' | 'all';
  summary: SummaryData;
  payouts?: PayoutsData;
  logistics?: LogisticsData;
  returns: ReturnsData;
  timeline: TimelinePoint[];
  funnel: FunnelData;
  categories: CategoryShare[];
  top_products: TopProduct[];
  ai_insights: string[];
}

interface SellerAnalyticsProps {
  userId?: string;
  shopId?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({
  userId: propUserId,
  shopId,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || (typeof window !== 'undefined' ? (localStorage.getItem('mitreno_user_id') || localStorage.getItem('mitreno_seller_user_id') || 'KD56AHEqvOWX322JKlVB4jkMoju2') : 'KD56AHEqvOWX322JKlVB4jkMoju2');
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('all');
  const [chartMetric, setChartMetric] = useState<'sales' | 'orders' | 'units'>('sales');
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchAnalytics = async (selectedTimeframe = timeframe) => {
    try {
      setIsLoading(true);
      const backendUrl = getBackendUrl();
      const params = new URLSearchParams();
      if (shopId) params.set('shop_id', shopId);
      if (userId) params.set('user_id', userId);
      params.set('timeframe', selectedTimeframe);

      const res = await fetch(`${backendUrl}/api/seller/analytics?${params.toString()}`, {
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error('Failed to load seller analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [shopId, userId, timeframe]);

  // Clean, High-DPI Canvas Chart Rendering (Normal Clean Typography)
  useEffect(() => {
    if (!canvasRef.current || !data?.timeline || data.timeline.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const points = data.timeline;
    const values = points.map(p => {
      if (chartMetric === 'sales') return p.revenue;
      if (chartMetric === 'orders') return p.orders;
      return p.units_sold;
    });

    const maxVal = Math.max(...values, chartMetric === 'sales' ? 1000 : 5);
    const minVal = 0;

    const paddingX = 48;
    const paddingY = 32;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const stepX = points.length > 1 ? usableWidth / (points.length - 1) : usableWidth;

    const coords = points.map((p, i) => {
      const val = chartMetric === 'sales' ? p.revenue : chartMetric === 'orders' ? p.orders : p.units_sold;
      const x = paddingX + i * stepX;
      const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * usableHeight;
      return { x, y, point: p, val };
    });

    // Horizontal Grid Lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = paddingY + (usableHeight / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();

      const labelVal = Math.round(maxVal - (maxVal / gridRows) * i);
      ctx.fillStyle = 'rgba(100, 116, 139, 0.85)';
      ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        chartMetric === 'sales'
          ? labelVal >= 1000 ? `₹${(labelVal / 1000).toFixed(0)}k` : `₹${labelVal}`
          : `${labelVal}`,
        paddingX - 10,
        y + 3
      );
    }

    // Color Scheme based on Selected Metric
    let primaryColor = '#f59e0b'; // Amber for sales
    let gradientStart = 'rgba(245, 158, 11, 0.18)';
    if (chartMetric === 'orders') {
      primaryColor = '#8b5cf6'; // Violet for orders
      gradientStart = 'rgba(139, 92, 246, 0.18)';
    } else if (chartMetric === 'units') {
      primaryColor = '#0284c7'; // Sky for units
      gradientStart = 'rgba(2, 132, 199, 0.18)';
    }

    // Draw Smooth Area Gradient
    const gradient = ctx.createLinearGradient(0, paddingY, 0, height - paddingY);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, height - paddingY);
    ctx.lineTo(coords[0].x, coords[0].y);

    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX = (curr.x + next.x) / 2;
      ctx.bezierCurveTo(cpX, curr.y, cpX, next.y, next.x, next.y);
    }

    ctx.lineTo(coords[coords.length - 1].x, height - paddingY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Main Curve Line
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX = (curr.x + next.x) / 2;
      ctx.bezierCurveTo(cpX, curr.y, cpX, next.y, next.x, next.y);
    }
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Data Nodes & Date Labels
    coords.forEach(({ x, y, point }) => {
      // Circle Dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Date Label below
      ctx.fillStyle = 'rgba(71, 85, 105, 0.9)';
      ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.date_label, x, height - 10);
    });
  }, [data, chartMetric]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!data) return;
    setIsExporting(true);
    sellerAudio.playMessageChime();

    try {
      let csv = 'Date,Sales (INR),Orders Count,Units Sold\n';
      data.timeline.forEach(row => {
        csv += `"${row.date_label}",${row.revenue},${row.orders},${row.units_sold}\n`;
      });
      csv += '\nPayouts & Settlement Ledger\n';
      csv += `Net Earnings (INR),${payouts.net_earnings}\n`;
      csv += `Gross Sales (INR),${payouts.gross_revenue}\n`;
      csv += `Platform Fee (INR),${payouts.platform_fee}\n`;
      csv += `Prepaid Ratio,${payouts.prepaid_ratio_pct}%\n`;
      csv += `Payout UPI VPA,${payouts.payout_upi_id}\n`;
      csv += '\nLogistics & Dispatch Overview\n';
      csv += `Pending Dispatch,${logistics.pending_dispatch}\n`;
      csv += `In Transit,${logistics.in_transit}\n`;
      csv += `Delivered Orders,${logistics.delivered_count}\n`;
      csv += `On-Time Delivery %,${logistics.on_time_rate_pct}%\n`;
      csv += `Avg Dispatch Turnaround (Hours),${logistics.avg_dispatch_hrs}\n`;
      csv += '\nReturns & RTO Summary\n';
      csv += `Total Returns,${data.returns.total_returns}\n`;
      csv += `Return Rate %,${data.returns.return_rate_pct}%\n`;
      csv += `Return Value (INR),${data.returns.return_value}\n`;

      csv += '\nTop Performing Products,Units Sold,Revenue Generated (INR)\n';
      data.top_products.forEach(p => {
        csv += `"${p.name.replace(/"/g, '""')}",${p.units_sold},${p.revenue_generated}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mitreno_analytics_${timeframe}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const summary: SummaryData = data?.summary || {
    total_sales: 0,
    total_orders: 0,
    average_order_value: 0,
    chat_deal_rate: 0,
    total_units_sold: 0,
  };

  const payouts: PayoutsData = data?.payouts || {
    net_earnings: Math.round(summary.total_sales * 0.95),
    gross_revenue: summary.total_sales,
    platform_fee: Math.round(summary.total_sales * 0.05),
    next_payout_date: 'Upcoming Monday (Weekly Cycle)',
    payout_upi_id: 'seller@upi',
    prepaid_orders: summary.total_orders,
    cod_orders: 0,
    prepaid_ratio_pct: 100.0,
  };

  const logistics: LogisticsData = data?.logistics || {
    pending_dispatch: summary.total_orders,
    in_transit: 0,
    delivered_count: 0,
    on_time_rate_pct: 98.6,
    avg_dispatch_hrs: 14,
  };

  const returns = data?.returns || {
    total_returns: 0,
    today_returns: 0,
    return_rate_pct: 0,
    return_value: 0,
    risk_level: 'low',
    reasons: [
      { reason: 'Size & Fitting Issue', percentage: 55 },
      { reason: 'Courier RTO (Customer Not Available)', percentage: 25 },
      { reason: 'Color / Fabric Expectation', percentage: 20 },
    ],
  };

  const funnel = data?.funnel || {
    impressions: 0,
    product_views: 0,
    price_inquiries: 0,
    special_offers_sent: 0,
    completed_orders: 0,
    conversion_rate_pct: 0,
  };

  return (
    <div className="w-full bg-[#FAFAFB] text-neutral-900 min-h-screen animate-in fade-in duration-200">
      {/* CLEAN STICKY HEADER (WHITE/LIGHT THEME) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pt-3.5 pb-3 px-4 sm:px-6 border-b border-neutral-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Store Feed
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                Boutique Command Center
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight flex items-center gap-2">
              <span>Performance Analytics</span>
              {data?.shop?.name && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 font-semibold text-neutral-700 border border-neutral-200">
                  {data.shop.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live sales performance, scheduled payouts, order dispatch tracker, and boutique growth insights.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Timeframe Selector */}
            <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === '7d'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === '30d'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === 'all'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchAnalytics(timeframe)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-950 shadow-2xs transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={isExporting || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors shadow-2xs active:scale-95"
              title="Download Statement CSV"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce text-amber-500' : ''}`} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-12 space-y-6">

        {/* 1. TOP 6 CORE KPI CARDS (DELIVERED-ONLY REVENUE & FULL ORDER BREAKDOWN) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {/* Card 1: Total Net Sales (Delivered Only) */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all antialiased">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight">Total Net Sales</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-neutral-950 tracking-tight leading-tight">
              ₹{summary.total_sales.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
              <span className="truncate">From {summary.delivered_orders ?? logistics.delivered_count} delivered</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all antialiased">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight">Total Orders</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                <Package className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-neutral-950 tracking-tight leading-tight">
              {summary.total_orders}
            </div>
            <div className="text-xs text-purple-700 font-bold mt-1.5 flex items-center gap-1">
              <span className="truncate">Avg ₹{summary.average_order_value.toLocaleString('en-IN')} / order</span>
            </div>
          </div>

          {/* Card 3: Pending Orders */}
          <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all antialiased">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight">Pending Orders</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-amber-700 tracking-tight leading-tight">
              {summary.active_orders ?? (logistics.pending_dispatch + logistics.in_transit)}
            </div>
            <div className="text-xs text-amber-700 font-bold mt-1.5 flex items-center gap-1">
              <span className="truncate">₹{(summary.pipeline_revenue ?? payouts.pending_pipeline_revenue ?? 0).toLocaleString('en-IN')} in pipeline</span>
            </div>
          </div>

          {/* Card 4: Total Delivered */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all antialiased">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight">Total Delivered</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-emerald-700 tracking-tight leading-tight">
              {summary.delivered_orders ?? logistics.delivered_count}
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-1.5">
              <span className="truncate">{summary.total_units_sold} garments delivered</span>
            </div>
          </div>

          {/* Card 5: Cancelled Orders */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all antialiased">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight">Cancelled</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-rose-600 tracking-tight leading-tight">
              {summary.cancelled_orders ?? logistics.cancelled_count ?? 0}
            </div>
            <div className="text-xs text-rose-600 font-bold mt-1.5">
              <span className="truncate">₹{(summary.cancelled_value ?? 0).toLocaleString('en-IN')} cancelled</span>
            </div>
          </div>

          {/* Card 6: Returns & RTO */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all antialiased">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight">RTO & Returns</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                returns.risk_level === 'high'
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-neutral-950 tracking-tight leading-tight">
              {summary.rto_orders ?? returns.total_returns} <span className="text-xs font-bold text-neutral-600">({returns.return_rate_pct}%)</span>
            </div>
            <div className="text-xs text-blue-700 font-bold mt-1.5 flex items-center gap-1">
              <span className="truncate">₹{returns.return_value.toLocaleString('en-IN')} returned</span>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE TREND MONITOR GRAPH (3 METRIC TOGGLES) */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>Performance & Sales Trend</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                  Live Updates
                </span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Switch between daily delivered revenue, order count, or garment pieces delivered.
              </p>
            </div>

            <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-xl p-1 shrink-0 text-xs">
              <button
                onClick={() => setChartMetric('sales')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  chartMetric === 'sales'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 font-medium'
                }`}
              >
                Delivered Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  chartMetric === 'orders'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 font-medium'
                }`}
              >
                Orders (Count)
              </button>
              <button
                onClick={() => setChartMetric('units')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  chartMetric === 'units'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 font-medium'
                }`}
              >
                Garments (Pieces)
              </button>
            </div>
          </div>

          {/* Canvas Chart */}
          <div className="relative w-full h-64 sm:h-72">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-neutral-400">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
                <span className="text-xs font-medium">Loading sales curves...</span>
              </div>
            ) : (
              <canvas ref={canvasRef} className="w-full h-full block" />
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DUAL ACTIONABLE MODULES: OPTION A & OPTION B                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ------------------------------------------------------------- */}
          {/* OPTION A: LIVE PAYOUT & MONEY BALANCE MONITOR                 */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-5 shadow-xs relative overflow-hidden">
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-950">
                    Live Payout & Money Balance
                  </h3>
                  <div className="text-xs text-neutral-500">
                    Strictly Calculated from Delivered Orders
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Cycle</span>
              </div>
            </div>

            {/* Primary Net Balance Hero Card */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-50/50 via-white to-neutral-50 border border-emerald-200/80 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Net Payable Earnings (Delivered)
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  Ready for Transfer
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight">
                ₹{payouts.net_earnings.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-neutral-500">
                95% of delivered order sales (₹{payouts.gross_revenue.toLocaleString('en-IN')}) after 5% platform fee.
              </p>
            </div>

            {/* 3-Column Financial Breakdown Ledger */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="text-xs text-neutral-500 font-medium">Delivered Sales</div>
                <div className="text-base font-bold text-neutral-950 mt-0.5">
                  ₹{payouts.gross_revenue.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-neutral-400">{summary.delivered_orders ?? logistics.delivered_count} delivered</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="text-xs text-neutral-500 font-medium">Platform Fee</div>
                <div className="text-base font-bold text-neutral-700 mt-0.5">
                  - ₹{payouts.platform_fee.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-neutral-400">5% standard fee</div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="text-xs text-amber-800 font-medium">Active Pipeline</div>
                <div className="text-base font-bold text-amber-700 mt-0.5">
                  ₹{(payouts.pending_pipeline_revenue ?? summary.pipeline_revenue ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-amber-700/80">{summary.active_orders ?? 0} in-progress</div>
              </div>
            </div>

            {/* Next Scheduled Payout & Destination VPA */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  Scheduled Payout Release:
                </span>
                <span className="font-bold text-neutral-900">
                  {payouts.next_payout_date}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  Beneficiary Account:
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-800 text-xs border border-neutral-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {payouts.payout_upi_id}
                </span>
              </div>
            </div>

            {/* Payment Channel Health: Prepaid vs COD */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-medium">Payment Mode Breakdown:</span>
                <span className="font-bold text-emerald-700">
                  {payouts.prepaid_ratio_pct}% Prepaid ({payouts.prepaid_orders} Prepaid / {payouts.cod_orders} COD)
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden flex border border-neutral-200">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, payouts.prepaid_ratio_pct))}%` }}
                />
                <div
                  className="bg-neutral-300 h-full transition-all duration-500"
                  style={{ width: `${100 - Math.min(100, Math.max(15, payouts.prepaid_ratio_pct))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero RTO return risk on prepaid orders
                </span>
                <span className="font-semibold text-neutral-600">Low Risk</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigateToTab?.('billing')}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] shadow-xs"
              >
                <span>View Billing & Plans</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* OPTION B: LOGISTICS & DISPATCH COMMAND RADAR                  */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-5 shadow-xs relative overflow-hidden">
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-950">
                    Logistics & Dispatch Radar
                  </h3>
                  <div className="text-xs text-neutral-500">
                    Real-time Courier & Fulfillment Tracker
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Live Radar Active</span>
              </div>
            </div>

            {/* Primary Action Required Alert Box */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-amber-50/60 via-white to-neutral-50 border border-amber-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                  <Radar className="w-4 h-4 text-amber-600" />
                  Orders Awaiting Dispatch
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  logistics.pending_dispatch > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {logistics.pending_dispatch > 0 ? 'Action Needed Today' : 'All Dispatched'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight">
                  {logistics.pending_dispatch}
                </span>
                <span className="text-xs font-medium text-neutral-500">
                  garments pending shipment
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Dispatch orders before 4:00 PM to maintain high courier priority and top-tier customer ratings.
              </p>
            </div>

            {/* 3-Stage Visual Pipeline Nodes */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="text-xs font-semibold text-neutral-600">
                Live Shipment Stages
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center relative">
                {/* Node 1 */}
                <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="text-sm font-bold text-amber-600">
                    {logistics.pending_dispatch}
                  </div>
                  <div className="text-xs font-medium text-neutral-800 mt-0.5">
                    To Pack
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Print Slip
                  </div>
                </div>

                {/* Node 2 */}
                <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="text-sm font-bold text-blue-600">
                    {logistics.in_transit}
                  </div>
                  <div className="text-xs font-medium text-neutral-800 mt-0.5">
                    In Transit
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Courier Run
                  </div>
                </div>

                {/* Node 3 */}
                <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="text-sm font-bold text-emerald-600">
                    {logistics.delivered_count}
                  </div>
                  <div className="text-xs font-medium text-neutral-800 mt-0.5">
                    Delivered
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Completed
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Telemetry & Dispatch Speed Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200">
                <div className="text-xs font-medium text-neutral-500">On-Time Delivery Rate</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">
                  {logistics.on_time_rate_pct}%
                </div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High On-Time SLA
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200">
                <div className="text-xs font-medium text-neutral-500">Average Turnaround</div>
                <div className="text-base font-bold text-neutral-900 mt-0.5">
                  {logistics.avg_dispatch_hrs} Hours
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Target: under 24 hours
                </div>
              </div>
            </div>

            {/* Open Orders Tab Action Button */}
            <button
              onClick={() => onNavigateToTab?.('orders')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Package className="w-4 h-4" />
              <span>Open Dispatch Orders</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 4. TWO-COLUMN INTELLIGENCE: SHOPPER STEPS & RTO TRACKER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Customer Shopping Steps */}
          <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-950">Customer Shopping Steps</h3>
              </div>
              <span className="text-xs text-neutral-500">
                Visitor Conversion Pipeline
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Step 1: Products Viewed */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 flex items-center gap-1.5 font-medium">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    1. Garments Viewed
                  </span>
                  <span className="font-bold text-neutral-950">
                    {funnel.product_views.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200/60">
                  <div className="h-full bg-blue-500 rounded-full w-full" />
                </div>
              </div>

              {/* Step 2: Price Inquiries */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    2. Price Inquiries (Chat Bargains)
                  </span>
                  <span className="font-bold text-neutral-950">
                    {funnel.price_inquiries.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200/60">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${funnel.product_views > 0 ? Math.min(100, Math.max(15, Math.round((funnel.price_inquiries / Math.max(1, funnel.product_views)) * 100))) : 25}%`
                    }}
                  />
                </div>
              </div>

              {/* Step 3: Special Offers Sent */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5 text-purple-500" />
                    3. Special Offers Sent
                  </span>
                  <span className="font-bold text-neutral-950">
                    {funnel.special_offers_sent.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200/60">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${funnel.price_inquiries > 0 ? Math.min(100, Math.max(10, Math.round((funnel.special_offers_sent / Math.max(1, funnel.price_inquiries)) * 100))) : 15}%`
                    }}
                  />
                </div>
              </div>

              {/* Step 4: Completed Orders */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 flex items-center gap-1.5 font-medium">
                    <Package className="w-3.5 h-3.5 text-emerald-500" />
                    4. Completed & Paid Orders
                  </span>
                  <span className="font-bold text-emerald-600">
                    {funnel.completed_orders.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200/60">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${funnel.special_offers_sent > 0 ? Math.min(100, Math.max(8, Math.round((funnel.completed_orders / Math.max(1, funnel.special_offers_sent)) * 100))) : 10}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Returns & RTO Tracker */}
          <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-neutral-950">Returns & Courier RTO Tracker</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                returns.risk_level === 'high'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {returns.risk_level === 'high' ? 'Action Recommended' : 'Healthy Performance'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="text-xs text-neutral-500 font-medium">Return Rate</div>
                <div className="text-lg font-bold text-neutral-950 mt-0.5">
                  {returns.return_rate_pct}%
                </div>
                <div className="text-xs text-neutral-400">Total orders</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="text-xs text-neutral-500 font-medium">Today's Returns</div>
                <div className="text-lg font-bold text-neutral-950 mt-0.5">
                  {returns.today_returns}
                </div>
                <div className="text-xs text-neutral-400">New returns</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="text-xs text-neutral-500 font-medium">Value Returned</div>
                <div className="text-lg font-bold text-neutral-950 mt-0.5">
                  ₹{returns.return_value.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-neutral-400">Total refund value</div>
              </div>
            </div>

            {/* Return Reason Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-neutral-800">Primary Return Factors:</div>
              {returns.reasons.map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">{r.reason}</span>
                    <span className="font-bold text-neutral-900">{r.percentage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. AI BOUTIQUE GROWTH ADVISOR */}
        <div className="rounded-3xl bg-linear-to-br from-purple-50/60 via-white to-neutral-50 border border-purple-200/90 p-5 sm:p-6 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Nvilar AI Growth Advisor</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200">
              Smart Advisor
            </span>
          </div>

          <h4 className="text-sm font-bold text-neutral-950">
            Recommended Boutique Optimizations
          </h4>

          <div className="space-y-2.5 pt-1">
            {data?.ai_insights && data.ai_insights.length > 0 ? (
              data.ai_insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-purple-100/90 flex items-start gap-3 text-xs text-neutral-700 leading-relaxed shadow-2xs"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                  <span>{insight}</span>
                </div>
              ))
            ) : (
              <div className="p-3.5 rounded-2xl bg-white border border-purple-100 text-xs text-neutral-600">
                Deliver orders within 24 hours to earn high rating badges and rank higher in discovery feeds.
              </div>
            )}
          </div>
        </div>

        {/* 6. TOP PERFORMING GARMENTS TABLE */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-neutral-950">Top Performing Garments</h3>
            </div>
            <button
              onClick={() => onNavigateToTab?.('products')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Manage Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {!data?.top_products || data.top_products.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No garment sales recorded in this timeframe.
              </div>
            ) : (
              data.top_products.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:bg-neutral-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-neutral-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                      {prod.thumbnail ? (
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-neutral-950 truncate">
                        {prod.name}
                      </h4>
                      <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-neutral-700">₹{prod.base_price?.toLocaleString('en-IN')}</span>
                        {prod.category && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-400">{prod.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-xs font-bold text-emerald-600">
                        ₹{prod.revenue_generated.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {prod.units_sold} units sold
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
