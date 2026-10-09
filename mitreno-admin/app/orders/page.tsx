'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building2,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Eye,
  X,
  FileText,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Navigation,
  MapPin,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { isAuthenticated, fetchApplications } from '../../lib/api';
import { getBackendUrl } from '../../lib/config';

interface CustomerDetails {
  name: string;
  phone: string;
  alternatePhone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
}

interface OrderComplaint {
  id: string;
  reason: string;
  status: string;
  created_at?: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCity: string;
  customerPhone?: string;
  customerDetails?: CustomerDetails;
  boutiqueId?: string;
  boutiqueName: string;
  boutiqueCity?: string;
  boutiqueUpi: string;
  itemSummary: string;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  paymentMethod: string;
  settlementStatus: 'settled' | 'in_escrow' | 'processing' | 'refunded';
  sellerStatus?: string;
  orderStatus?: string;
  isAccepted?: boolean;
  elapsedTime?: string;
  elapsedMinutes?: number;
  slaStatus?: 'accepted' | 'on_track' | 'warning' | 'critical';
  orderDate: string;
  settledDate?: string;
  complaints?: OrderComplaint[];
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'MIT-94812',
    orderNumber: 'MIT-94812',
    customerName: 'Aarav Singhal',
    customerCity: 'Delhi',
    boutiqueName: 'Maison Al-Mansoor Atelier',
    boutiqueCity: 'Delhi',
    boutiqueUpi: 'ashraf.mansoor@okhdfcbank',
    itemSummary: 'Royal Emerald Raw Silk Sherwani (Size 42)',
    grossAmount: 38500,
    platformFee: 2887,
    netPayout: 35613,
    paymentMethod: 'UPI (GPay)',
    settlementStatus: 'settled',
    orderDate: '2026-09-04 14:22',
    settledDate: '2026-09-04 18:00',
  },
  {
    id: 'MIT-94808',
    orderNumber: 'MIT-94808',
    customerName: 'Pooja Hegde',
    customerCity: 'Mumbai',
    boutiqueName: 'Zari Heritage Weaves',
    boutiqueCity: 'Bengaluru',
    boutiqueUpi: 'zariweaves@sbi',
    itemSummary: 'Authentic Kanchipuram Brocade Saree',
    grossAmount: 24000,
    platformFee: 1920,
    netPayout: 22080,
    paymentMethod: 'HDFC Credit Card',
    settlementStatus: 'in_escrow',
    orderDate: '2026-09-04 11:45',
  },
  {
    id: 'MIT-94799',
    orderNumber: 'MIT-94799',
    customerName: 'Devansh Kulkarni',
    customerCity: 'Pune',
    boutiqueName: 'UrbanThreadz Streetwear Hub',
    boutiqueCity: 'Pune',
    boutiqueUpi: 'urbanthreadz@icici',
    itemSummary: 'Cyberpunk Modular Heavy Parka + Cargo Set',
    grossAmount: 11900,
    platformFee: 714,
    netPayout: 11186,
    paymentMethod: 'UPI (PhonePe)',
    settlementStatus: 'processing',
    orderDate: '2026-09-04 09:12',
  },
  {
    id: 'MIT-94781',
    orderNumber: 'MIT-94781',
    customerName: 'Sanya Malhotra',
    customerCity: 'Bengaluru',
    boutiqueName: 'Kicks & Crown Vault',
    boutiqueCity: 'Mumbai',
    boutiqueUpi: 'kicksandcrown@kotak',
    itemSummary: 'Air Jordan 1 Retro High OG "Lost & Found" (UK 8)',
    grossAmount: 32000,
    platformFee: 2240,
    netPayout: 29760,
    paymentMethod: 'Razorpay UPI',
    settlementStatus: 'settled',
    orderDate: '2026-09-03 21:30',
    settledDate: '2026-09-04 10:15',
  },
  {
    id: 'MIT-94762',
    orderNumber: 'MIT-94762',
    customerName: 'Tariq Butt',
    customerCity: 'Hyderabad',
    boutiqueName: 'Noor-e-Kashmir Pashmina Guild',
    boutiqueCity: 'Srinagar',
    boutiqueUpi: 'noorekashmir@jkb',
    itemSummary: 'Pure Handspun Cashmere Sozni Shawl (Ivory)',
    grossAmount: 45000,
    platformFee: 3825,
    netPayout: 41175,
    paymentMethod: 'ICICI Netbanking',
    settlementStatus: 'in_escrow',
    orderDate: '2026-09-03 16:50',
  },
  {
    id: 'MIT-94740',
    orderNumber: 'MIT-94740',
    customerName: 'Ananya Roy',
    customerCity: 'Kolkata',
    boutiqueName: 'Maison Al-Mansoor Atelier',
    boutiqueCity: 'Delhi',
    boutiqueUpi: 'ashraf.mansoor@okhdfcbank',
    itemSummary: 'Hand-embroidered Velvet Bundi Jacket',
    grossAmount: 16500,
    platformFee: 1237,
    netPayout: 15263,
    paymentMethod: 'Axis Debit Card',
    settlementStatus: 'settled',
    orderDate: '2026-09-02 18:10',
    settledDate: '2026-09-03 14:00',
  },
];

const formatDisplayId = (id?: string, orderNumber?: string) => {
  const target = (orderNumber || id || '').trim();
  if (!target) return 'MIT-0000';
  const cleanDigits = target.replace(/\D/g, '');
  if (cleanDigits.length >= 4) {
    return `MIT-${cleanDigits.slice(-4)}`;
  }
  return `MIT-${target.slice(-4).toUpperCase().padStart(4, '0')}`;
};

export default function OrdersSettlementsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unaccepted' | 'in_escrow' | 'processing' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [warningOrder, setWarningOrder] = useState<OrderItem | null>(null);
  const [warningNote, setWarningNote] = useState('');
  const [isWarningSending, setIsWarningSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchLiveOrders = async () => {
    try {
      setIsLiveLoading(true);
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch admin live orders:', err);
    } finally {
      setIsLiveLoading(false);
    }
  };

  const handleWarnMerchant = async (ord: OrderItem, customNote?: string) => {
    try {
      setIsWarningSending(true);
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/orders/${ord.id}/warn-seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: customNote || warningNote }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMsg(`🚨 Urgent warning dispatched to ${ord.boutiqueName}! Logged to merchant email & in-app studio.`);
        setTimeout(() => setToastMsg(null), 4500);
        setWarningOrder(null);
        setWarningNote('');
        fetchLiveOrders();
      } else {
        alert(data.error || 'Failed to dispatch warning');
      }
    } catch (err) {
      console.error('Failed to warn merchant:', err);
    } finally {
      setIsWarningSending(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchApplications('pending_review').then((res) => {
      setPendingCount(res.counts.pending);
    }).catch(() => {});

    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const metrics = useMemo(() => {
    const totalGmv = orders.reduce((sum, o) => sum + (Number(o.grossAmount) || 0), 0);
    const platformRevenue = orders.reduce((sum, o) => sum + (Number(o.platformFee) || 0), 0);
    const escrowHeld = orders
      .filter((o) => o.settlementStatus === 'in_escrow' || o.settlementStatus === 'processing')
      .reduce((sum, o) => sum + (Number(o.netPayout) || 0), 0);
    const unacceptedCount = orders.filter((o) => !o.isAccepted).length;
    return {
      totalGmv,
      platformRevenue,
      escrowHeld,
      unacceptedCount,
      totalOrders: orders.length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) {
        return activeTab === 'all' || (activeTab === 'unaccepted' ? !o.isAccepted : o.settlementStatus === activeTab);
      }
      const formatted = formatDisplayId(o.id, o.orderNumber).toLowerCase();
      const matchSearch =
        formatted.includes(q) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        (o.customerDetails?.phone && o.customerDetails.phone.toLowerCase().includes(q)) ||
        (o.customerCity && o.customerCity.toLowerCase().includes(q)) ||
        (o.boutiqueName && o.boutiqueName.toLowerCase().includes(q)) ||
        (o.boutiqueCity && o.boutiqueCity.toLowerCase().includes(q)) ||
        (o.boutiqueUpi && o.boutiqueUpi.toLowerCase().includes(q)) ||
        (o.itemSummary && o.itemSummary.toLowerCase().includes(q));

      const matchTab =
        activeTab === 'all' ||
        (activeTab === 'unaccepted' ? !o.isAccepted : o.settlementStatus === activeTab);
      return matchSearch && matchTab;
    });
  }, [orders, searchQuery, activeTab]);

  const handleSettlePayout = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            settlementStatus: 'settled',
            settledDate: 'Just now',
          };
        }
        return o;
      })
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              settlementStatus: 'settled',
              settledDate: 'Just now',
            }
          : null
      );
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={pendingCount} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Link href="/" className="hover:text-neutral-700 font-medium">
                  Dashboard
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-neutral-700 font-bold">Orders & Settlements</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2.5">
                <span>Orders & Vendor Settlements</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Escrow Protected
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Real-time customer transactions, multi-boutique live orders, SLA tracking, and vendor payouts.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Sync {lastSyncTime ? `(${lastSyncTime})` : 'Active'}</span>
              </div>
              <button
                onClick={fetchLiveOrders}
                disabled={isLiveLoading}
                className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
                title="Refresh Live Orders"
              >
                <RefreshCw className={`w-4 h-4 ${isLiveLoading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs font-bold">{toastMsg}</p>
              </div>
              <button
                onClick={() => setToastMsg(null)}
                className="p-1 hover:bg-amber-200/60 rounded-lg text-amber-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SLA Warning Banner if unaccepted orders exist */}
          {metrics.unacceptedCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 font-bold shrink-0">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-900">
                    {metrics.unacceptedCount} Order{metrics.unacceptedCount > 1 ? 's' : ''} Awaiting Merchant Confirmation
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Merchants must accept orders within 30 minutes to ensure premium luxury delivery SLA.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('unaccepted')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                View Pending SLA ({metrics.unacceptedCount})
              </button>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL GMV */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    TOTAL GMV
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>

                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                  <span>₹{metrics.totalGmv.toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span className="font-semibold text-slate-400">Multi-Boutique</span>
                <span className="font-bold text-emerald-600">Active GMV</span>
              </div>
            </div>

            {/* Card 2: NET PLATFORM REVENUE */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                    NET REVENUE
                  </span>
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>

                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                  <span>₹{metrics.platformRevenue.toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span className="font-semibold text-slate-400">Platform Take</span>
                <span className="font-bold text-indigo-600">7.5% Standard Cut</span>
              </div>
            </div>

            {/* Card 3: ESCROW HELD */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                    ESCROW HELD
                  </span>
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>

                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                  <span>₹{metrics.escrowHeld.toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{
                      width:
                        metrics.totalGmv > 0
                          ? `${Math.min(100, Math.max(10, Math.round((metrics.escrowHeld / metrics.totalGmv) * 100)))}%`
                          : '40%',
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span className="font-semibold text-slate-400">Security Status</span>
                <span className="font-bold text-amber-600">Pending Delivery</span>
              </div>
            </div>

            {/* Card 4: PENDING SLA CONFIRMATION */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        metrics.unacceptedCount > 0 ? 'bg-rose-500' : 'bg-slate-400'
                      } animate-pulse flex-shrink-0`}
                    />
                    PENDING SLA
                  </span>
                  <AlertTriangle
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      metrics.unacceptedCount > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-400'
                    }`}
                  />
                </div>

                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                  <span className={metrics.unacceptedCount > 0 ? 'text-rose-600' : 'text-slate-900'}>
                    {metrics.unacceptedCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 ml-auto">
                    of {metrics.totalOrders} orders
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${metrics.unacceptedCount > 0 ? 'bg-rose-500' : 'bg-slate-300'}`}
                    style={{
                      width:
                        metrics.totalOrders > 0
                          ? `${Math.min(100, Math.max(8, Math.round((metrics.unacceptedCount / metrics.totalOrders) * 100)))}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span className="font-semibold text-slate-400">Acceptance SLA</span>
                <span className={`font-bold ${metrics.unacceptedCount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {metrics.unacceptedCount > 0 ? 'Action Required' : 'All Clear'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs & Search */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100/70 rounded-xl w-full md:w-auto overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All Orders' },
                  { id: 'unaccepted', label: `Pending SLA (${metrics.unacceptedCount})` },
                  { id: 'in_escrow', label: 'In Escrow' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'settled', label: 'Settled' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? tab.id === 'unaccepted' && metrics.unacceptedCount > 0
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID (#MIT-XXXXX), customer, or merchant..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-600 transition-colors"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-5 py-3.5">Order ID & Date</th>
                    <th className="px-5 py-3.5">Customer & Doorstep GPS</th>
                    <th className="px-5 py-3.5">Boutique & Item</th>
                    <th className="px-5 py-3.5">Merchant SLA</th>
                    <th className="px-5 py-3.5">Financial Breakdown</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                        No orders match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className={`hover:bg-neutral-50/50 transition-colors ${!ord.isAccepted && ord.slaStatus === 'critical' ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black font-mono text-neutral-900 text-xs tracking-wide">
                              #{formatDisplayId(ord.id, ord.orderNumber)}
                            </span>
                            <button
                              onClick={() => {
                                const id = formatDisplayId(ord.id, ord.orderNumber);
                                navigator.clipboard.writeText(id);
                                setCopiedOrderId(id);
                                setTimeout(() => setCopiedOrderId(null), 2000);
                              }}
                              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                              title="Copy Order ID"
                            >
                              {copiedOrderId === formatDisplayId(ord.id, ord.orderNumber) ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{ord.orderDate}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                              {ord.paymentMethod}
                            </span>
                            {ord.complaints && ord.complaints.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                {ord.complaints.length} Dispute
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                Clean
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-neutral-900">{ord.customerName}</p>
                          <p className="text-[11px] text-neutral-600 font-mono mt-0.5">
                            {ord.customerPhone || ord.customerDetails?.phone || ord.customerCity}
                          </p>
                          {ord.customerDetails?.alternatePhone && (
                            <p className="text-[10px] text-neutral-400 font-mono">
                              Alt: {ord.customerDetails.alternatePhone}
                            </p>
                          )}
                          {ord.customerDetails?.latitude && ord.customerDetails?.longitude && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${ord.customerDetails.latitude},${ord.customerDetails.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-colors mt-1"
                              title={`GPS: ${ord.customerDetails.latitude}, ${ord.customerDetails.longitude}`}
                            >
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>Doorstep GPS</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-indigo-600">{ord.boutiqueName}</p>
                          <p className="text-[11px] text-neutral-600 truncate max-w-xs mt-0.5">
                            {ord.itemSummary}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {ord.isAccepted ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Merchant Confirmed
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                ord.slaStatus === 'critical'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {ord.slaStatus === 'critical' ? 'SLA Critical' : 'Acceptance Pending'}
                              </span>
                              <p className="text-[10px] text-neutral-500 font-mono">
                                Elapsed: {ord.elapsedTime || 'Just now'}
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-neutral-900">₹{ord.grossAmount.toLocaleString('en-IN')}</p>
                          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                            Vendor: ₹{ord.netPayout.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-medium">
                            Fee: ₹{ord.platformFee.toLocaleString('en-IN')}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            ord.settlementStatus === 'settled'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : ord.settlementStatus === 'in_escrow'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : ord.settlementStatus === 'refunded'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {ord.settlementStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!ord.isAccepted && (
                              <button
                                onClick={() => setWarningOrder(ord)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Dispatch urgent SLA reminder to boutique"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Warn</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                            {ord.settlementStatus !== 'settled' && (
                              <button
                                onClick={() => handleSettlePayout(ord.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Settle
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning Confirmation Modal */}
          {warningOrder && (
            <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-amber-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="p-6 border-b border-amber-100 bg-amber-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-amber-950">Dispatch Urgent SLA Warning</h3>
                      <p className="text-xs text-amber-700 font-medium">
                        Target Boutique: <span className="font-bold">{warningOrder.boutiqueName}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setWarningOrder(null);
                      setWarningNote('');
                    }}
                    className="p-2 rounded-lg hover:bg-amber-200/50 text-amber-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-medium">Order Number:</span>
                      <span className="font-bold font-mono text-neutral-900">#{formatDisplayId(warningOrder.id, warningOrder.orderNumber)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-medium">Customer:</span>
                      <span className="font-bold text-neutral-900">{warningOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-medium">Waiting Elapsed Time:</span>
                      <span className="font-bold font-mono text-rose-600">{warningOrder.elapsedTime || 'Under 30m'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Urgent Warning Message / Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={warningNote}
                      onChange={(e) => setWarningNote(e.target.value)}
                      placeholder={`Please confirm and accept order #${formatDisplayId(warningOrder.id, warningOrder.orderNumber)} immediately. High-priority luxury client is waiting.`}
                      className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      This will pop up in the boutique's Seller Studio and be logged to the boutique's registered merchant contact.
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      setWarningOrder(null);
                      setWarningNote('');
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleWarnMerchant(warningOrder)}
                    disabled={isWarningSending}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isWarningSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{isWarningSending ? 'Dispatching...' : 'Send Urgent Warning'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-neutral-900 font-mono tracking-tight">
                          #{formatDisplayId(selectedOrder.id, selectedOrder.orderNumber)}
                        </h3>
                        <button
                          onClick={() => {
                            const idToCopy = formatDisplayId(selectedOrder.id, selectedOrder.orderNumber);
                            navigator.clipboard.writeText(idToCopy);
                            setCopiedOrderId(idToCopy);
                            setTimeout(() => setCopiedOrderId(null), 2000);
                          }}
                          className="px-2 py-0.5 rounded-md hover:bg-neutral-200/70 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-neutral-300/80 cursor-pointer"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === formatDisplayId(selectedOrder.id, selectedOrder.orderNumber) ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-neutral-500">Placed: {selectedOrder.orderDate}</p>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                  {/* Customer Complaints & Dispute Status Section */}
                  {selectedOrder.complaints && selectedOrder.complaints.length > 0 ? (
                    <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-300 text-rose-950 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black text-xs text-rose-900">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Active Customer Complaint / Return Request ({selectedOrder.complaints.length})</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white">
                          Action Required
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedOrder.complaints.map((c, i) => (
                          <div key={c.id || i} className="p-3 bg-white/95 rounded-xl border border-rose-200 text-xs shadow-2xs">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-neutral-800 font-bold">Issue #{c.id || `RET-${i + 1}`}</span>
                              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                {c.status}
                              </span>
                            </div>
                            <p className="mt-1.5 font-bold text-neutral-900 text-[11px] bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                              &ldquo;{c.reason}&rdquo;
                            </p>
                            {c.created_at && (
                              <p className="text-[10px] text-neutral-400 mt-1">
                                Logged on: {new Date(c.created_at).toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-950">Customer Satisfaction: No Complaints</p>
                          <p className="text-[11px] text-emerald-700">Clean order in good standing. Zero returns or disputes filed.</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified Clean
                      </span>
                    </div>
                  )}

                  {/* Merchant / Dukandar Details */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-indigo-600" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Merchant / Dukandar Information</p>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Fulfilling Boutique
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-neutral-400 text-[11px]">Boutique / Shop Name:</span>
                        <p className="font-bold text-neutral-900 text-sm">{selectedOrder.boutiqueName}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">Boutique City / Location:</span>
                        <p className="font-semibold text-neutral-800">{selectedOrder.boutiqueCity || selectedOrder.customerCity || 'India'}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">Vendor UPI ID:</span>
                        <p className="font-mono font-bold text-emerald-700">{selectedOrder.boutiqueUpi || 'Pending Registration'}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">Merchant Account ID:</span>
                        <p className="font-mono text-xs text-neutral-600">{selectedOrder.boutiqueId || 'sel_registered'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Merchant SLA Status Card */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    selectedOrder.isAccepted
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : selectedOrder.slaStatus === 'critical'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      {selectedOrder.isAccepted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                      )}
                      <div>
                        <p className="font-bold text-xs">
                          {selectedOrder.isAccepted
                            ? 'Boutique has confirmed and accepted order'
                            : `Awaiting Boutique Acceptance (Elapsed: ${selectedOrder.elapsedTime || 'Just now'})`}
                        </p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Merchant: <span className="font-bold">{selectedOrder.boutiqueName}</span>
                        </p>
                      </div>
                    </div>
                    {!selectedOrder.isAccepted && (
                      <button
                        onClick={() => {
                          setWarningOrder(selectedOrder);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        ⚠️ Warn Boutique
                      </button>
                    )}
                  </div>

                  {/* Purchased Item */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">Purchased Product</p>
                    <p className="font-bold text-neutral-900 text-sm">{selectedOrder.itemSummary}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-neutral-600">
                      <span>Payment Mode: <strong className="text-neutral-900">{selectedOrder.paymentMethod}</strong></span>
                      <span>•</span>
                      <span>Order Gross: <strong className="text-neutral-900">₹{selectedOrder.grossAmount.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  {/* Customer Details & Doorstep GPS */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase text-neutral-400">Customer & Delivery Details</p>
                      {selectedOrder.customerDetails?.latitude && selectedOrder.customerDetails?.longitude && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.customerDetails.latitude},${selectedOrder.customerDetails.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>Open Doorstep in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-neutral-400 text-[11px]">Customer Name:</span>
                        <p className="font-bold text-neutral-900 text-sm">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[11px]">Primary Phone:</span>
                        <p className="font-mono font-bold text-neutral-900">
                          {selectedOrder.customerPhone || selectedOrder.customerDetails?.phone || 'Not provided'}
                        </p>
                      </div>
                      {selectedOrder.customerDetails?.alternatePhone && (
                        <div>
                          <span className="text-neutral-400 text-[11px]">Alternate Phone:</span>
                          <p className="font-mono font-bold text-neutral-700">
                            {selectedOrder.customerDetails.alternatePhone}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-neutral-400 text-[11px]">Delivery Destination:</span>
                        <p className="font-medium text-neutral-800">
                          {selectedOrder.customerDetails?.street ? `${selectedOrder.customerDetails.street}, ` : ''}
                          {selectedOrder.customerCity}
                          {selectedOrder.customerDetails?.pincode ? ` - ${selectedOrder.customerDetails.pincode}` : ''}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.customerDetails?.latitude && selectedOrder.customerDetails?.longitude && (
                      <div className="mt-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-neutral-500">Live Geolocation Lock:</span>
                        <span className="font-bold text-neutral-800">
                          LAT: {selectedOrder.customerDetails.latitude} | LON: {selectedOrder.customerDetails.longitude}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Financial calculation */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                    <p className="text-[11px] font-bold uppercase text-neutral-500">Financial Settlement Breakdown</p>
                    <div className="flex justify-between text-neutral-700">
                      <span>Customer Paid (Gross):</span>
                      <span className="font-bold font-mono">₹{selectedOrder.grossAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-indigo-700">
                      <span>Nvilar Platform Fee (Retained 7.5%):</span>
                      <span className="font-bold font-mono">- ₹{selectedOrder.platformFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-sm text-neutral-900">
                      <span>Vendor Net Receivable:</span>
                      <span className="font-mono text-emerald-700">₹{selectedOrder.netPayout.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Status: <span className="font-bold uppercase text-neutral-700">{selectedOrder.settlementStatus}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedOrder.settlementStatus !== 'settled' && (
                      <button
                        onClick={() => handleSettlePayout(selectedOrder.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Release Vendor Payout Now
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
