'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Package,
  ShoppingBag,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowLeft,
  Store,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { SellerSidebar, SellerTab } from './SellerSidebar';
import { SellerBottomNav } from './SellerBottomNav';
import { SellerWelcomeModal } from './SellerWelcomeModal';
import { SellerOrders } from './SellerOrders';
import { SellerNearbyOrders } from './SellerNearbyOrders';
import { SellerProducts } from './SellerProducts';
import { SellerChat } from './SellerChat';
import { SellerProfile } from './SellerProfile';
import { SellerReels } from './SellerReels';
import { SellerAds } from './SellerAds';
import { SellerAnalytics } from './SellerAnalytics';
import { SellerBilling } from './SellerBilling';
import { SellerSettings } from './SellerSettings';
import { SellerNotificationsDrawer } from './SellerNotificationsDrawer';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

interface SellerDashboardProps {
  userId?: string;
  shopId?: string;
  onClose: () => void;
}

interface ShopData {
  id: string;
  owner_id: string;
  name: string;
  logo_url?: string;
  cover_image?: string;
  bio?: string;
  rating?: number;
  review_count?: number;
  is_verified?: boolean;
  city?: string;
  market_name?: string;
  category?: string;
  payout_upi_id?: string;
  status?: string;
  plan_type?: string;
}

interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  new_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  return_requests: number;
  hyperlocal_orders?: number;
  total_products: number;
  active_products: number;
  out_of_stock_products: number;
  unread_chats: number;
  unread_notifications: number;
}

interface OrderPreview {
  id: string;
  buyer_id?: string;
  customer_name?: string;
  total_paid: number;
  order_status: string;
  seller_status: string;
  placed_at: string;
  payment_mode?: string;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  userId: propUserId,
  shopId: propShopId,
  onClose,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || (typeof window !== 'undefined' ? (localStorage.getItem('mitreno_user_id') || localStorage.getItem('mitreno_seller_user_id') || 'KD56AHEqvOWX322JKlVB4jkMoju2') : 'KD56AHEqvOWX322JKlVB4jkMoju2');
  const shopId = propShopId || '';
  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');
  const [billingView, setBillingView] = useState<'ledger' | 'upgrade_plans'>('ledger');
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_revenue: 0,
    total_orders: 0,
    new_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    return_requests: 0,
    hyperlocal_orders: 0,
    total_products: 0,
    active_products: 0,
    out_of_stock_products: 0,
    unread_chats: 0,
    unread_notifications: 1,
  });
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [acceptToast, setAcceptToast] = useState<string | null>(null);

  // Check first-time onboarding
  useEffect(() => {
    const hasVisited = localStorage.getItem('mitreno_seller_has_onboarded');
    if (!hasVisited) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleFinishOnboarding = () => {
    localStorage.setItem('mitreno_seller_has_onboarded', 'true');
    setShowWelcomeModal(false);
  };

  // Fetch live dashboard metrics
  const fetchDashboardData = async (isBackground = false) => {
    if (!userId && !shopId) {
      if (!isBackground) setIsLoading(false);
      return;
    }
    try {
      if (!isBackground) setIsLoading(true);
      const params: Record<string, string> = {};
      if (shopId) {
        params.shop_id = shopId;
      } else if (userId) {
        params.user_id = userId;
      }

      const data = await apiClient.get('/api/seller/dashboard', params);
      if (data.success && data.shop) {
        setShop(data.shop);
        if (data.metrics) {
          setMetrics((prev) => {
            if (isBackground && data.metrics.new_orders > (prev.new_orders || 0)) {
              sellerAudio.playMessageChime();
            }
            return data.metrics;
          });
        }
        if (data.recent_orders) setRecentOrders(data.recent_orders);
      } else {
        // Backend SellerGuard response handling
        console.warn("Backend rejected seller dashboard access:", data.status, data.message || data.error);
        if (data.status === 'pending_review') {
          // Keep seller informed
          console.info("Application is pending review");
        }
        if (!isBackground && onClose) onClose();
      }
    } catch (err) {
      console.error('Failed to fetch seller dashboard data:', err);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [userId, shopId]);

  // Listen for order status updates from other tabs / windows
  useEffect(() => {
    const handleStatusUpdate = (e: any) => {
      const orderId = e.detail?.orderId;
      const status = e.detail?.status;
      if (orderId && status && status !== 'new') {
        setRecentOrders((prev) => prev.filter((o) => o.id !== orderId));
        fetchDashboardData(true);
      }
    };
    window.addEventListener('mitreno_order_status_updated', handleStatusUpdate);
    return () => window.removeEventListener('mitreno_order_status_updated', handleStatusUpdate);
  }, []);

  // Quick 1-click accept order right from dashboard
  const handleQuickAcceptOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    try {
      setAcceptingOrderId(orderId);
      const data = await apiClient.post(`/api/seller/orders/${orderId}/accept`);
      if (data.success) {
        sellerAudio.playDealChime();
        setAcceptToast(`Order #${orderId.slice(-5).toUpperCase()} accepted! Moved to Packaging.`);
        setTimeout(() => setAcceptToast(null), 3500);

        // Immediate removal from incoming new orders list
        setRecentOrders((prev) => prev.filter((o) => o.id !== orderId));
        setMetrics((prev) => ({
          ...prev,
          new_orders: Math.max(0, prev.new_orders - 1),
          processing_orders: prev.processing_orders + 1,
        }));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('mitreno_order_status_updated', {
              detail: { orderId, status: 'accepted' },
            })
          );
          localStorage.setItem(
            'mitreno_order_update_broadcast',
            JSON.stringify({ orderId, status: 'accepted', timestamp: Date.now() })
          );
        }

        fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Failed to accept order from dashboard:', err);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const getLocalShopData = (): { name: string; city: string; category: string } => {
    if (typeof window === 'undefined') return { name: '', city: '', category: '' };
    try {
      const raw = localStorage.getItem('mitreno_seller_applications');
      if (raw) {
        const apps = JSON.parse(raw);
        if (Array.isArray(apps) && apps.length > 0) {
          const app = apps[0];
          return {
            name: app.business_name || app.businessName || '',
            city: app.shop_address?.city || app.city || '',
            category: app.business_category || app.businessCategory || '',
          };
        }
      }
    } catch {}
    return { name: '', city: '', category: '' };
  };

  const localInfo = getLocalShopData();
  const displayShopName = shop?.name || localInfo.name || 'My Boutique';
  const displayCity = shop?.city || localInfo.city || 'India';
  const displayCategory = shop?.category || localInfo.category || 'Fashion & Apparel';

  const isFlushTab = ['orders', 'hyperlocal', 'products', 'chat', 'analytics', 'profile', 'billing'].includes(activeTab);

  return (
    <div className="fixed inset-0 z-[60] flex bg-neutral-950 text-neutral-900 overflow-hidden font-sans">
      {/* 1. Desktop / Tablet Sidebar (Kept Classic Black) */}
      <div className="hidden md:block h-full shrink-0">
        <SellerSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'billing') {
              setBillingView('ledger');
            }
          }}
          onOpenUpgradePlan={() => {
            setActiveTab('billing');
            setBillingView('upgrade_plans');
          }}
          shop={shop || { id: 'shop_demo', name: displayShopName, is_verified: true, plan_type: (typeof window !== 'undefined' ? localStorage.getItem('mitreno_seller_active_plan') || 'pay_as_you_sell' : 'pay_as_you_sell') }}
          metrics={{
            new_orders: metrics.new_orders,
            unread_chats: metrics.unread_chats,
            total_products: metrics.total_products,
            hyperlocal_orders: metrics.hyperlocal_orders,
          }}
          onExit={onClose}
        />
      </div>

      {/* 2. Main Studio Content Area (Premium White/Light Theme) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F8F9FA] text-neutral-900">
        {/* Top Header Bar (Only visible on Dashboard) */}
        {activeTab === 'dashboard' && (
          <header className="h-16 border-b border-neutral-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 shrink-0"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight truncate flex items-center gap-1.5">
                    <span>Welcome, {displayShopName}</span>
                    <span className="text-base">👋</span>
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                    Live Boutique
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 hidden sm:block truncate font-medium">
                  {displayCity} • {displayCategory}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Refresh live metrics */}
              <button
                onClick={() => fetchDashboardData()}
                disabled={isLoading}
                className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Refresh Stats"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              </button>

              {/* Notification bell */}
              <button
                onClick={() => {
                  sellerAudio.playMessageChime();
                  setShowNotificationsDrawer(true);
                }}
                className="relative w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {metrics.unread_notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>

              {/* Exit to Customer App button on Desktop */}
              <button
                onClick={onClose}
                className="hidden md:flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-semibold text-neutral-800 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>Customer App</span>
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Tab Body */}
        <main className={`flex-1 overflow-y-auto ${isFlushTab ? 'p-0' : 'p-4 sm:p-6'} pb-20 md:pb-6 scrollbar-thin scrollbar-thumb-neutral-300`}>
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
              {/* High-Priority New Order Incoming Alert Bar */}
              {metrics.new_orders > 0 && (
                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-yellow-500/15 border-2 border-amber-400/80 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.25)] flex items-center justify-between gap-3 cursor-pointer hover:border-amber-500 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform animate-bounce">
                      <Package className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                          🚨 New Order Received!
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black">
                          {metrics.new_orders} {metrics.new_orders === 1 ? 'Action Required' : 'Actions Required'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 font-medium truncate mt-0.5">
                        Customers are waiting for order acceptance and dispatch. Tap here to review now.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-black shrink-0 group-hover:bg-amber-400 transition-colors shadow-xs">
                    <span>Review Orders</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              )}

              {/* KPI Metrics Grid (Compact Height, Crisp 3D Shadow Depth & High Contrast) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Revenue */}
                <div className="py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-200 relative overflow-hidden group hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-neutral-500 mb-1">
                    <span className="text-xs font-bold text-neutral-600">Total Revenue</span>
                    <div className="w-6.5 h-6.5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                      <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                    ₹{metrics.total_revenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Direct UPI Payouts</span>
                  </div>
                </div>

                {/* 2. New Orders */}
                <div 
                  onClick={() => setActiveTab('orders')}
                  className="py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-2xl bg-white border border-neutral-200/90 hover:border-amber-400 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 relative overflow-hidden group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-neutral-500 mb-1">
                    <span className="text-xs font-bold text-neutral-600">New Orders</span>
                    <div className="w-6.5 h-6.5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-xs">
                      <Package className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                    {metrics.new_orders}
                  </div>
                  <div className="text-[10px] text-indigo-700 font-bold mt-0.5 flex items-center gap-1">
                    <span>{metrics.new_orders > 0 ? 'Action required' : 'All clear'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>

                {/* 3. Total Products */}
                <div 
                  onClick={() => setActiveTab('products')}
                  className="py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 relative overflow-hidden group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-neutral-500 mb-1">
                    <span className="text-xs font-bold text-neutral-600">Catalog Items</span>
                    <div className="w-6.5 h-6.5 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                    {metrics.total_products}
                  </div>
                  <div className="text-[10px] text-neutral-600 font-semibold mt-0.5">
                    {metrics.active_products} active in store
                  </div>
                </div>

                {/* 4. Customer Rating */}
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 relative overflow-hidden group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-neutral-500 mb-1">
                    <span className="text-xs font-bold text-neutral-600">Store Rating</span>
                    <div className="w-6.5 h-6.5 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0 shadow-xs">
                      ⭐
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
                    {shop?.rating !== undefined && shop?.rating !== null ? Number(shop.rating).toFixed(1) : '0.0'}
                  </div>
                  <div className="text-[10px] text-neutral-600 font-semibold mt-0.5">
                    {shop?.review_count ?? 0} customer reviews
                  </div>
                </div>
              </div>

              {/* Quick Hub Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* Recent / Incoming Orders Card (Only shows pending orders awaiting acceptance) */}
                <div className="lg:col-span-2 rounded-3xl bg-white border border-neutral-200/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] p-4 sm:p-6">
                  {(() => {
                    const pendingNewOrders = recentOrders.filter((order) => {
                      const st = (order.seller_status || order.order_status || 'new').toLowerCase();
                      return st === 'new';
                    });

                    return (
                      <>
                        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-amber-600 stroke-[2.5]" />
                            <h3 className="text-sm font-black text-neutral-950">Recent Orders</h3>
                            {pendingNewOrders.length > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-black animate-pulse">
                                {pendingNewOrders.length} New
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                                All Clear
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline"
                          >
                            <span>View All ({metrics.total_orders})</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {pendingNewOrders.length === 0 ? (
                            <div className="py-10 text-center text-neutral-400">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                              </div>
                              <p className="text-xs font-bold text-neutral-800">No new orders waiting right now</p>
                              <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
                                All orders have been accepted or processed. New incoming orders will appear here immediately for 1-click acceptance.
                              </p>
                              <button
                                onClick={() => setActiveTab('orders')}
                                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors border border-neutral-200 shadow-2xs"
                              >
                                <span>Manage All Orders ({metrics.total_orders})</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            pendingNewOrders.map((order) => {
                              return (
                                <div
                                  key={order.id}
                                  onClick={() => setActiveTab('orders')}
                                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-white border-2 border-amber-400/90 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.25)] hover:border-amber-500 hover:shadow-[0_6px_20px_-4px_rgba(245,158,11,0.35)] transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                                      <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-extrabold text-neutral-950 truncate flex items-center gap-1.5">
                                        <span>Order #{order.id.slice(0, 10).toUpperCase()}</span>
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                      </div>
                                      <div className="text-[11px] text-neutral-600 font-medium truncate mt-0.5">
                                        {order.customer_name || 'Customer'} • {new Date(order.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                      <div className="text-xs font-black text-neutral-950">
                                        ₹{order.total_paid?.toLocaleString('en-IN')}
                                      </div>
                                      <span className="text-[10px] font-extrabold text-amber-800">
                                        {order.payment_mode || 'Prepaid'}
                                      </span>
                                    </div>

                                    <button
                                      disabled={acceptingOrderId === order.id}
                                      onClick={(e) => handleQuickAcceptOrder(e, order.id)}
                                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-black text-xs transition-all shadow-xs flex items-center gap-1.5"
                                      title="Accept Order & Move to Packaging"
                                    >
                                      {acceptingOrderId === order.id ? (
                                        <>
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          <span>Accepting...</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                                          <span>Accept Order</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Quick Growth Tips Card */}
                <div className="rounded-3xl bg-white border border-neutral-200/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] p-4 sm:p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                      <h3 className="text-sm font-black text-neutral-950">Seller Growth Engine</h3>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      Boost your shop visibility and turn shoppers into loyal repeat buyers:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div 
                        onClick={() => setActiveTab('chat')}
                        className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 hover:border-emerald-300 hover:bg-white shadow-2xs hover:shadow-xs cursor-pointer transition-all flex items-start gap-2.5"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <div>
                          <h4 className="text-xs font-extrabold text-neutral-950">Customer Deals</h4>
                          <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">Send custom discount deals directly in customer chat.</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab('reels')}
                        className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 hover:border-rose-300 hover:bg-white shadow-2xs hover:shadow-xs cursor-pointer transition-all flex items-start gap-2.5"
                      >
                        <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <div>
                          <h4 className="text-xs font-extrabold text-neutral-950">Upload Fashion Reel</h4>
                          <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">Showcase runway fits and tag your catalog products.</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab('ads')}
                        className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:border-purple-300 cursor-pointer transition-colors flex items-start gap-2.5"
                      >
                        <TrendingUp className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">Promote in {shop?.city || 'City'}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Get 5x more clicks with home carousel sponsored banners.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>UPI ID: {shop?.payout_upi_id || 'Configured'}</span>
                    <span className="text-emerald-700 font-semibold">T+1 Settlement</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS (Phase 2 Live) */}
          {activeTab === 'orders' && (
            <SellerOrders
              userId={userId}
              shopId={shop?.id}
              onRefreshMetrics={fetchDashboardData}
            />
          )}

          {/* TAB 2.5: HYPER-LOCAL 9KM SAME-DAY DISPATCH */}
          {activeTab === 'hyperlocal' && (
            <SellerNearbyOrders
              userId={userId}
              shopId={shop?.id}
              onRefreshMetrics={fetchDashboardData}
            />
          )}

          {/* TAB 3: PRODUCTS (Phase 3 Live) */}
          {activeTab === 'products' && (
            <SellerProducts
              userId={userId}
              shopId={shop?.id}
              onRefreshMetrics={fetchDashboardData}
            />
          )}

          {/* TAB 4: CHAT & CUSTOM IN-CHAT PRICING (Phase 4 Live) */}
          {activeTab === 'chat' && (
            <SellerChat
              userId={userId}
              shopId={shop?.id}
              onRefreshMetrics={fetchDashboardData}
            />
          )}

          {/* TAB 5: BOUTIQUE PROFILE (Phase 5 Live) */}
          {activeTab === 'profile' && (
            <SellerProfile
              userId={userId}
              shopId={shop?.id}
              onRefreshMetrics={fetchDashboardData}
              onNavigateToTab={(t: string) => setActiveTab(t as SellerTab)}
            />
          )}

          {/* TAB 6: REELS & DROPS (Phase 6 Live) */}
          {activeTab === 'reels' && (
            <SellerReels
              userId={userId}
              shopId={shop?.id}
              onNavigateToTab={(t: string) => setActiveTab(t as SellerTab)}
            />
          )}

          {/* TAB 7: ADS & PROMOTIONS (Phase 7 Live) */}
          {activeTab === 'ads' && (
            <SellerAds
              userId={userId}
              shopId={shop?.id}
              onNavigateToTab={(t: string) => setActiveTab(t as SellerTab)}
            />
          )}

          {/* TAB 8: ANALYTICS & INSIGHTS (Phase 8 Live) */}
          {activeTab === 'analytics' && (
            <SellerAnalytics
              userId={userId}
              shopId={shop?.id}
              onNavigateToTab={(t: string) => setActiveTab(t as SellerTab)}
            />
          )}

          {/* TAB 8.5: BILLING & COMMISSIONS */}
          {activeTab === 'billing' && (
            <SellerBilling
              userId={userId}
              shopId={shop?.id}
              activeView={billingView}
              onViewChange={setBillingView}
              onNavigateToTab={(t: string) => setActiveTab(t as SellerTab)}
              onPlanChanged={fetchDashboardData}
            />
          )}

          {/* TAB 9: BOUTIQUE SETTINGS & PAYOUTS (Phase 9 Live) */}
          {activeTab === 'settings' && (
            <SellerSettings
              userId={userId}
              shopId={shop?.id}
              onRefreshMetrics={fetchDashboardData}
            />
          )}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <SellerBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metrics={{
          new_orders: metrics.new_orders,
          unread_chats: metrics.unread_chats,
        }}
        onExit={onClose}
      />

      {/* 4. First-Time Welcome Modal */}
      <SellerWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        shopName={shop?.name || 'Your Boutique'}
        cityName={shop?.city || 'Mitreno'}
        onGetStarted={handleFinishOnboarding}
      />

      {/* 5. Phase 10: Notification Center Slide-in Drawer */}
      <SellerNotificationsDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        userId={userId}
        shopId={shop?.id}
        onNavigateToTab={(t: string) => {
          setActiveTab(t as SellerTab);
          setShowNotificationsDrawer(false);
        }}
        onUnreadCountChange={(count) => {
          setMetrics(prev => ({ ...prev, unread_notifications: count }));
        }}
      />

      {/* Floating Action Success Toast */}
      {acceptToast && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 stroke-[2.5]" />
          <span className="text-xs font-bold">{acceptToast}</span>
        </div>
      )}
    </div>
  );
};
