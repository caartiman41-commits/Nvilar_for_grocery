'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  Ban,
  Lock,
  Unlock,
  Percent,
  MapPin,
  Phone,
  Mail,
  User,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  CreditCard,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { ShopKundliData } from '../lib/types';
import { fetchShopKundli, suspendShopInCity, activateShopInCity } from '../lib/api';

interface ShopKundliModalProps {
  shopId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (shopId: string, newStatus: 'active' | 'suspended' | 'terminated') => void;
  onOpenCommissionModal?: (cityId: string, currentRate: number) => void;
}

export const ShopKundliModal: React.FC<ShopKundliModalProps> = ({
  shopId,
  isOpen,
  onClose,
  onStatusChange,
  onOpenCommissionModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'financials' | 'products' | 'kyc'>('overview');
  const [kundliData, setKundliData] = useState<ShopKundliData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation state
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('High Order Defect Rate or customer fulfillment delay');

  useEffect(() => {
    if (!isOpen || !shopId) {
      setKundliData(null);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchShopKundli(shopId);
        if (isMounted) {
          if (data && data.success) {
            setKundliData(data);
          } else {
            setError('Failed to load merchant analytics record.');
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading shop data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    // Close on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, shopId, onClose]);

  if (!isOpen) return null;

  const shop = kundliData?.shop;
  const metrics = kundliData?.metrics;
  const orders = kundliData?.orders_breakdown;
  const financials = kundliData?.financials;
  const products = kundliData?.products || [];

  const handleToggleSuspend = async () => {
    if (!shop) return;
    setIsProcessingAction(true);
    setActionNotice(null);

    if (shop.status === 'suspended') {
      const res = await activateShopInCity(shop.id);
      setIsProcessingAction(false);
      if (res.success) {
        setKundliData((prev) => prev ? { ...prev, shop: { ...prev.shop, status: 'active', status_reason: null } } : null);
        setActionNotice({ type: 'success', message: 'Boutique re-activated for customer orders.' });
        if (onStatusChange) onStatusChange(shop.id, 'active');
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to activate boutique' });
      }
    } else {
      const res = await suspendShopInCity(shop.id, suspendReason);
      setIsProcessingAction(false);
      setSuspendModalOpen(false);
      if (res.success) {
        setKundliData((prev) => prev ? { ...prev, shop: { ...prev.shop, status: 'suspended', status_reason: suspendReason } } : null);
        setActionNotice({ type: 'success', message: `Boutique suspended: ${suspendReason}` });
        if (onStatusChange) onStatusChange(shop.id, 'suspended');
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to suspend boutique' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* FULL SCREEN CONTAINER */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {/* TOP COCKPIT APPBAR */}
        <header className="h-16 px-6 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-3.5">
            {/* Store Logo or Monogram */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/50 flex items-center justify-center text-white font-black text-sm shadow-xs overflow-hidden shrink-0">
              {shop?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <span>{shop?.name?.slice(0, 2).toUpperCase() || 'BT'}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  {shop?.name || 'Boutique Cockpit'}
                </h1>
                {shop?.is_verified && (
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Verified Partner
                  </span>
                )}
                {shop?.status === 'active' && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Store
                  </span>
                )}
                {shop?.status === 'suspended' && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Suspended
                  </span>
                )}
                {shop?.status === 'terminated' && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Banned
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {shop?.market_name || shop?.city_name || 'Market Cluster'}, {shop?.state_code || 'IN'}
                </span>
                <span>•</span>
                <span className="text-slate-500">{shop?.category || 'Fashion & Apparel'}</span>
                {(() => {
                  const sLat = (shop as any)?.latitude;
                  const sLng = (shop as any)?.longitude;
                  const latNum = sLat != null && sLat !== '' && !isNaN(Number(sLat)) ? Number(sLat) : null;
                  const lngNum = sLng != null && sLng !== '' && !isNaN(Number(sLng)) ? Number(sLng) : null;
                  const hasGps = latNum !== null && lngNum !== null && (latNum !== 0 || lngNum !== 0);

                  if (!hasGps) return null;

                  return (
                    <>
                      <span>•</span>
                      <a
                        href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                        title={`Live GPS Radar: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>📍 Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </>
                  );
                })()}
                <span>•</span>
                <span className="font-mono text-slate-400">ID: {shop?.id}</span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {/* City Commission Badge & Trigger */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
              <Percent className="w-3.5 h-3.5 text-indigo-600" />
              <span>Platform Take:</span>
              <span className="text-indigo-600 font-black">{shop?.commission_rate || 10}%</span>
              {shop?.city_id && onOpenCommissionModal && (
                <button
                  type="button"
                  onClick={() => onOpenCommissionModal(shop.city_id!, Number(shop.commission_rate || 10))}
                  className="ml-1 text-[10px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Quick Suspend / Re-activate */}
            {shop?.status === 'active' ? (
              <button
                type="button"
                onClick={() => setSuspendModalOpen(true)}
                disabled={isProcessingAction}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Suspend Store</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleSuspend}
                disabled={isProcessingAction}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Re-activate Store</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Close Cockpit (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* FEEDBACK NOTICE */}
        {actionNotice && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-slate-700 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* LOADING & ERROR STATES */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-600">Loading Deep Seller Analytics & Kundli Record...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Record Not Available</h3>
            <p className="text-xs text-slate-500 max-w-md">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Back to Directory
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TOP HIGH-DENSITY METRIC RIBBON */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
              {/* Gross GMV */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Gross Sales (GMV)</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  ₹{Number(financials?.gross_gmv || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] font-bold text-emerald-600">Lifetime orders volume</span>
              </div>

              {/* Total Orders */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Orders Processed</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {metrics?.total_orders || 0}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">
                  {metrics?.average_order_value ? `AOV: ₹${metrics.average_order_value}` : 'No orders yet'}
                </span>
              </div>

              {/* Order Defect Rate (Amazon Spec) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Order Defect Rate (ODR)</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                </span>
                <p className={`text-xl font-black mt-1 ${
                  (metrics?.order_defect_rate || 0) > 2 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {metrics?.order_defect_rate || 0}%
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Target: &lt; 1.0%</span>
              </div>

              {/* On-Time Dispatch */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>On-Time Dispatch</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {metrics?.on_time_dispatch_rate || 100}%
                </p>
                <span className="text-[10px] font-bold text-emerald-600">Within 24hr commitment</span>
              </div>

              {/* Net Seller Payout */}
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-between">
                  <span>Net Payout Settled</span>
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                </span>
                <p className="text-xl font-black text-indigo-950 mt-1">
                  ₹{Number(financials?.net_payable || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-indigo-700 font-bold">Post {financials?.commission_rate}% fee</span>
              </div>
            </div>

            {/* TAB SELECTOR STRIP */}
            <div className="px-6 bg-white border-b border-slate-200 flex items-center gap-1 shrink-0">
              {[
                { id: 'overview', label: '1. Store Health & Run-Rate', icon: TrendingUp },
                { id: 'orders', label: '2. Orders & Return Audit', icon: ShoppingBag },
                { id: 'financials', label: '3. Financial Settlement Ledger', icon: DollarSign },
                { id: 'products', label: `4. Product Catalog (${products.length})`, icon: Package },
                { id: 'kyc', label: '5. KYC & Merchant Controls', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT - SCROLLABLE COCKPIT VIEW */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: STORE HEALTH & RUN-RATE */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Performance Alert Banner if Suspended */}
                  {shop?.status === 'suspended' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-black">Boutique Suspended from Customer Feed</h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Reason: {shop.status_reason || 'Administrative restriction'}. All product listings are currently suppressed from search.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Traffic & Defect Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Visitor Flow */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black uppercase text-slate-400">Traffic & Conversion</span>
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Estimated Monthly Visitors:</span>
                          <span className="font-bold text-slate-900">{metrics?.monthly_visitors || 350}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Storefront Conversion:</span>
                          <span className="font-bold text-emerald-600">{metrics?.conversion_rate || '3.8%'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Customer Rating:</span>
                          <span className="font-bold text-amber-600">★ {metrics?.customer_rating || 4.8} ({metrics?.review_count || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Amazon Policy Thresholds */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black uppercase text-slate-400">Compliance Thresholds</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Order Defect Rate (ODR):</span>
                          <span className="font-bold text-slate-900">{metrics?.order_defect_rate || 0}% (Target &lt;1%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Late Shipment Rate:</span>
                          <span className="font-bold text-slate-900">{metrics?.late_shipment_rate || 0}% (Target &lt;4%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Pre-fulfillment Cancellation:</span>
                          <span className="font-bold text-slate-900">{metrics?.cancelled_orders || 0} orders</span>
                        </div>
                      </div>
                    </div>

                    {/* Store Bio & Identity */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-black uppercase text-slate-400">Boutique Heritage</span>
                        <Store className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {shop?.bio || 'Verified artisan boutique showcasing authentic regional handloom and apparel collections on Mitreno.'}
                      </p>
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                        Member since: {shop?.created_at ? new Date(shop.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '2026'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS & RETURN AUDIT */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Delivered</span>
                      <p className="text-2xl font-black text-emerald-600 mt-1">{orders?.delivered || 0}</p>
                      <span className="text-[10px] text-slate-400">Successful</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Shipped</span>
                      <p className="text-2xl font-black text-indigo-600 mt-1">{orders?.shipped || 0}</p>
                      <span className="text-[10px] text-slate-400">With Courier</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">In-Transit</span>
                      <p className="text-2xl font-black text-blue-600 mt-1">{orders?.in_transit || 0}</p>
                      <span className="text-[10px] text-slate-400">Inter-city hub</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Seller Cancelled</span>
                      <p className="text-2xl font-black text-rose-600 mt-1">{orders?.merchant_cancelled || 0}</p>
                      <span className="text-[10px] text-rose-500 font-bold">Defect Strike</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Buyer Cancelled</span>
                      <p className="text-2xl font-black text-slate-700 mt-1">{orders?.buyer_cancelled || 0}</p>
                      <span className="text-[10px] text-slate-400">24hr Window</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wide mb-3">
                      Order Fulfillment Policies
                    </h3>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>All orders placed on Mitreno have a mandatory 24-hour buyer cancellation cooling period.</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Merchant self-cancellations directly impact seller standing and will trigger automatic review if defect rate exceeds 2.5%.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCIAL SETTLEMENT LEDGER */}
              {activeTab === 'financials' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Ledger Breakdown */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-3">
                      Revenue & Deductions Ledger
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Total Gross Merchandise Value (GMV):</span>
                        <span className="font-bold text-slate-900">₹{Number(financials?.gross_gmv || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-600">
                        <span>Platform Commission ({financials?.commission_rate}%):</span>
                        <span className="font-bold">-₹{Number(financials?.platform_fee || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Payment Gateway Fee (2% Razorpay/UPI):</span>
                        <span className="font-bold">-₹{Number(financials?.payment_gateway_fee || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>GST TCS (1% Govt Deduction):</span>
                        <span className="font-bold">-₹{Number(financials?.tcs_gst || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                        <span className="font-black text-slate-900">Net Seller Payout (Payable):</span>
                        <span className="font-black text-emerald-600">₹{Number(financials?.net_payable || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settlement Account */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-3">
                      Automated Settlement Details
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Payout UPI ID:</span>
                        <span className="font-mono font-bold text-slate-900">{shop?.payout_upi_id || 'Not linked'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Settlement Frequency:</span>
                        <span className="font-bold text-slate-800">T+3 Rolling Settlement</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Next Scheduled Payout:</span>
                        <span className="font-bold text-indigo-600">{financials?.next_settlement_date || 'In 3 business days'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Settlement Verification:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Instant Bank VPA Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRODUCT CATALOG */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Showing {products.length} live catalog listings for this merchant
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
                      No active products listed under this boutique yet.
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Fabric / GSM</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80">
                              <td className="py-3 px-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                  {p.thumbnail ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                      👕
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-600 font-medium">{p.category}</td>
                              <td className="py-3 px-4 text-slate-600">
                                {p.fabric || 'Premium Cotton'} {p.gsm ? `(${p.gsm} GSM)` : ''}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.is_active
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {p.is_active ? 'Live on Feed' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: KYC & CONTROLS */}
              {activeTab === 'kyc' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Owner KYC Profile */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                      <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Owner & Business Verification</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Owner Full Name:</span>
                          <span className="font-bold text-slate-900">{shop?.owner_name || 'Boutique Partner'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Verified Phone:</span>
                          <span className="font-mono font-bold text-slate-900">{shop?.owner_phone || '+91 98765 43210'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Email Address:</span>
                          <span className="font-mono text-slate-700">{shop?.owner_email || 'partner@mitreno.in'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax & Banking */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                      <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>Tax & Banking Credentials</span>
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">PAN Card Status:</span>
                          <span className="font-mono font-bold text-emerald-600">VERIFIED ✓</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Aadhar KYC:</span>
                          <span className="font-mono font-bold text-emerald-600">VERIFIED ✓</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Payout UPI:</span>
                          <span className="font-mono font-bold text-slate-900">{shop?.payout_upi_id || 'zariweaves@sbi'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUSPEND REASON MODAL */}
      {suspendModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Suspend Boutique</span>
              </div>
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the compliance or operational reason for suspending this boutique from customer feeds:
            </p>

            <select
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="High Order Defect Rate or customer fulfillment delay">High Order Defect Rate or fulfillment delay</option>
              <option value="Excessive self-cancellations by merchant">Excessive self-cancellations by merchant</option>
              <option value="KYC document re-verification required">KYC document re-verification required</option>
              <option value="Customer dispute or counterfeit fabric report">Customer dispute or fabric quality audit</option>
              <option value="Temporary merchant requested closure">Temporary merchant requested closure</option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleSuspend}
                disabled={isProcessingAction}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isProcessingAction ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
