'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/config';
import { sellerAudio } from '@/lib/seller-audio';
import { useAuth } from '@/lib/auth-context';
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
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bike,
  User,
  Navigation,
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Copy,
  Check,
  Download,
  Eye,
  FileText,
  Package,
  Banknote,
  MoreVertical,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  thumbnail: string;
  quantity: number;
  size: string;
  price_per_unit: number;
  fabric?: string;
}

interface HyperlocalOrder {
  id: string;
  buyer_id: string;
  shop_id: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  payment_mode: string;
  payment_status: string;
  total_paid: number;
  order_status: string;
  seller_status: string;
  delivery_tier?: string;
  distance_km?: number;
  local_dispatch_partner?: 'platform_fleet' | 'store_fleet' | 'rapido' | 'borzo' | 'dunzo';
  local_dispatch_status?: 'pending' | 'rider_assigned' | 'rider_at_store' | 'on_route' | 'delivered';
  rider_name?: string;
  rider_phone?: string;
  rider_vehicle_no?: string;
  pickup_otp?: string;
  delivery_otp?: string;
  dispatch_elapsed_minutes?: number;
  delivery_elapsed_minutes?: number;
  delivery_target_time?: string;
  placed_at: string;
  shipped_at?: string;
  delivered_at?: string;
  items: OrderItem[];
}

interface SellerNearbyOrdersProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
}

export const SellerNearbyOrders: React.FC<SellerNearbyOrdersProps> = ({
  userId: propUserId,
  shopId: propShopId,
  onRefreshMetrics,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const shopId = propShopId || '';
  const [orders, setOrders] = useState<HyperlocalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'rider_assigned' | 'on_route' | 'delivered'>('all');

  // Dispatch Modal State
  const [dispatchOrder, setDispatchOrder] = useState<HyperlocalOrder | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<'platform_fleet' | 'store_fleet'>('platform_fleet');
  const [customRiderName, setCustomRiderName] = useState('');
  const [customRiderPhone, setCustomRiderPhone] = useState('');
  const [customVehicleNo, setCustomVehicleNo] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<HyperlocalOrder | null>(null);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const backendUrl = getBackendUrl();

  const formatOrderId = (id: string) => {
    if (!id) return 'MIT-0000';
    const target = (id || '').trim();
    const cleanDigits = target.replace(/\D/g, '');
    if (cleanDigits.length >= 4) {
      return `MIT-${cleanDigits.slice(-4)}`;
    }
    return `MIT-${target.slice(-4).toUpperCase().padStart(4, '0')}`;
  };

  const maskPhoneNumber = (phone?: string) => {
    if (!phone) return '+91 ***** *****';
    const clean = phone.trim();
    if (clean.length < 5) return '+91 ***** *****';
    const digits = clean.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `+91 ${digits.slice(2, 7)} *****`;
    }
    return `${clean.slice(0, 5)} *****`;
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedOtp(id);
      setTimeout(() => setCopiedOtp(null), 2000);
    }
  };

  const renderSlipCardHTML = (order: HyperlocalOrder) => {
    const isCOD = (order.payment_mode || '').toUpperCase().includes('COD');
    const itemsHtml = (order.items || []).map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; font-weight: 800; font-size: 13px; color: #0f172a;">${item.name}</td>
        <td style="padding: 8px 10px; font-weight: 700; font-size: 12px; text-align: center;">${item.size || 'Free'}</td>
        <td style="padding: 8px 10px; font-weight: 700; font-size: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 10px; font-weight: 900; font-size: 13px; text-align: right;">₹${((item.price_per_unit || 0) * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const address = order.shipping_address || {};

    return `
      <div class="slip-card" style="border: 2px solid #0f172a; border-radius: 12px; padding: 18px; margin-bottom: 16px; background: #ffffff; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #000;">MITRENO</div>
            <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Direct Hyperlocal Same-Day Dispatch</div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: monospace; font-size: 18px; font-weight: 900; color: #0f172a; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; display: inline-block;">#${formatOrderId(order.id)}</div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 3px;">Date: ${new Date(order.placed_at).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div style="display: flex; gap: 14px; margin-bottom: 14px;">
          <div style="flex: 1.1; border: 2px solid #94a3b8; border-radius: 10px; padding: 10px 12px; background: #f8fafc;">
            <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 3px;">CUSTOMER RECIPIENT</div>
            <div style="font-size: 16px; font-weight: 900; color: #000; margin-bottom: 3px; text-transform: uppercase;">${address.name || order.customer_name || 'Customer'}</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.4;">
              ${address.street ? address.street + '<br/>' : ''}
              ${address.city || 'Local City'}, ${address.state || 'Assam'} - <strong style="font-size: 14px; color: #000;">${address.pincode || ''}</strong>
            </div>
            <div style="margin-top: 5px;">
              <span style="font-size: 13px; font-weight: 900; background: #fef08a; color: #854d0e; border: 1.5px solid #eab308; padding: 2px 8px; border-radius: 5px; display: inline-block;">
                📞 PHONE: ${address.phone || order.customer_phone || '+91 Contact on Delivery'}
              </span>
            </div>
          </div>

          <div style="flex: 0.9; border: 2px solid #94a3b8; border-radius: 10px; padding: 10px 12px; background: #f8fafc;">
            <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 3px;">SAME-DAY RIDER DISPATCH</div>
            <div style="font-size: 15px; font-weight: 900; color: #000; margin-bottom: 3px;">⚡ ${order.rider_name || 'Mitreno Express Rider'}</div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.5;">
              <strong>Pickup OTP:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: 900; background: #fef08a; padding: 2px 6px; border-radius: 4px; color: #0f172a;">${order.pickup_otp || 'VERIFIED'}</span><br/>
              <div style="margin-top: 4px;">
                ${
                  isCOD
                    ? `<span style="background: #ffe4e6; color: #9f1239; border: 1.5px solid #f43f5e; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 5px; display: inline-block;">💵 COLLECT COD: ₹${order.total_paid?.toLocaleString('en-IN')}</span>`
                    : `<span style="background: #dcfce7; color: #14532d; border: 1.5px solid #22c55e; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 5px; display: inline-block;">✅ PREPAID UPI (ESCROW)</span>`
                }
              </div>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="text-align: left; padding: 6px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Item Description</th>
              <th style="text-align: center; padding: 6px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Size</th>
              <th style="text-align: center; padding: 6px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Qty</th>
              <th style="text-align: right; padding: 6px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top: 2px solid #0f172a; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; font-weight: 900; color: #0f172a;">Mitreno Hyperlocal Direct Delivery</div>
            <div style="font-size: 9px; font-weight: 600; color: #64748b;">Verified boutique merchandise • Official Tax Invoice & Packing Slip</div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10px; color: #475569; font-weight: 800; text-transform: uppercase;">Total Settlement: </span>
            <span style="font-size: 17px; font-weight: 900; color: #000;">₹${order.total_paid?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    `;
  };

  const handleDirectDownloadPackingSlip = (order: HyperlocalOrder) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Mitreno Hyperlocal Packing Slip - #${formatOrderId(order.id)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.4; background: #fff; }
  </style>
</head>
<body>
  ${renderSlipCardHTML(order)}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mitreno_Slip_${formatOrderId(order.id)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`Downloaded slip #${formatOrderId(order.id)} to Chrome Downloads!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Nearby / Hyperlocal Orders
  const fetchNearbyOrders = async (silent = false) => {
    if (!userId && !shopId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/orders?tier=hyperlocal`, {
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch nearby orders:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyOrders();
  }, [backendUrl, userId]);

  // Handle Dispatch / Assign Rider
  const handleConfirmDispatch = async () => {
    if (!dispatchOrder) return;
    setIsDispatching(true);

    try {
      const payload: any = {
        partner: selectedPartner,
      };

      if (selectedPartner === 'platform_fleet') {
        payload.rider_name = 'Bikram Sarma (Mitreno Fleet Rider)';
        payload.rider_phone = '+91 98640 12845';
        payload.rider_vehicle_no = 'Hero Splendor (AS-01-EF-4821)';
      } else {
        payload.rider_name = customRiderName.trim() || 'Raju Das (Store Staff)';
        payload.rider_phone = customRiderPhone.trim() || '+91 91012 88472';
        payload.rider_vehicle_no = customVehicleNo.trim() || 'Honda Activa (AS-01-DJ-9034)';
      }

      const res = await fetch(`${backendUrl}/api/seller/orders/${dispatchOrder.id}/dispatch-local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        sellerAudio.playDealChime();
        setDispatchOrder(null);
        fetchNearbyOrders(false);
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.shipping_address?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.shipping_address?.street || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.shipping_address?.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return o.local_dispatch_status === 'pending' || !o.local_dispatch_status;
    if (statusFilter === 'rider_assigned') return o.local_dispatch_status === 'rider_assigned' || o.local_dispatch_status === 'rider_at_store';
    if (statusFilter === 'on_route') return o.local_dispatch_status === 'on_route';
    if (statusFilter === 'delivered') return o.local_dispatch_status === 'delivered';
    return true;
  });

  // Calculate Metrics
  const activeCount = orders.filter((o) => o.local_dispatch_status !== 'delivered').length;
  const awaitingRiderCount = orders.filter((o) => o.local_dispatch_status === 'pending' || !o.local_dispatch_status).length;
  const onRouteCount = orders.filter((o) => o.local_dispatch_status === 'on_route' || o.local_dispatch_status === 'rider_assigned').length;
  const deliveredTodayCount = orders.filter((o) => o.local_dispatch_status === 'delivered').length;

  return (
    <div className="w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-emerald-500/40 text-emerald-700 text-xs font-semibold shadow-xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. FIXED / STICKY CONTROL SECTION (Attached flush to top:0, Pure White 3D Theme) */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/95 backdrop-blur-md pt-3 pb-3 px-4 sm:px-6 border-b border-neutral-200/80 shadow-2xs space-y-2.5">
        {/* Compact 3D Header Banner in White */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] text-neutral-900 relative overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-neutral-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 border border-amber-300/60">
              <Zap className="w-4.5 h-4.5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-neutral-950 truncate">⚡ Nearby Orders Dispatch</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                  Same-Day (&lt; 10 km)
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate font-medium">
                Direct intra-city fulfillment via In-House &amp; Platform Express Delivery Fleet.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchNearbyOrders(false)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>

        {/* 4 KPI Cards (Attached with tight spacing, White 3D Depth) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Nearby Orders */}
          <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-4.5 h-4.5 fill-amber-500" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider leading-none">Nearby Orders</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-neutral-950">{orders.length}</span>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">&lt; 10 km</span>
              </div>
            </div>
          </div>

          {/* 2. Awaiting Rider */}
          <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider leading-none">Awaiting Rider</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-rose-600">{awaitingRiderCount}</span>
                <span className="text-[10px] text-neutral-400 font-medium">Pending</span>
              </div>
            </div>
          </div>

          {/* 3. Riders on Route */}
          <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Bike className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider leading-none">Riders on Route</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-blue-600">{onRouteCount}</span>
                <span className="text-[10px] text-neutral-400 font-medium">In Transit</span>
              </div>
            </div>
          </div>

          {/* 4. Delivered Today */}
          <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-500 block uppercase tracking-wider leading-none">Delivered Today</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-emerald-600">{deliveredTodayCount}</span>
                <span className="text-[10px] text-neutral-400 font-medium">Same-Day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Tabs (Directly attached below KPIs) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer, address..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 shadow-2xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'pending', label: `Awaiting Rider (${awaitingRiderCount})` },
              { id: 'rider_assigned', label: `Rider Assigned` },
              { id: 'on_route', label: `On The Way (${onRouteCount})` },
              { id: 'delivered', label: `Delivered (${deliveredTodayCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                  statusFilter === tab.id
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ORDERS LIST (Scrolls smoothly underneath the fixed white control bar) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-neutral-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 fill-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">No Nearby Orders Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No orders match your search keyword.'
                : 'Any customer placing an order within 10 km will appear here for instant same-day local rider dispatch.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const distance = Number(order.distance_km || 3.5);
              const status = order.local_dispatch_status || 'pending';
              const isDelivered = status === 'delivered' || order.seller_status === 'delivered';
              const isAssigned = status === 'rider_assigned' || status === 'rider_at_store';
              const isOnRoute = status === 'on_route';
              const isDispatched = isAssigned || isOnRoute;

              const isNew = !isDelivered && !isDispatched && (order.seller_status === 'pending_acceptance' || order.seller_status === 'new' || order.seller_status === 'unaccepted');
              const isAccepted = !isDelivered && !isDispatched && !isNew && order.seller_status === 'accepted';
              const isPackaging = !isDelivered && !isDispatched && !isNew && !isAccepted && (order.seller_status === 'packaging' || order.seller_status === 'processing');
              const isAwaitingRider = !isDelivered && !isDispatched && !isNew && !isAccepted && !isPackaging && status === 'pending';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-3.5 sm:p-4 shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all space-y-3"
                >
                  {/* Top Row: Genuine MIT- Order ID, Time, Distance & High-Contrast Payment Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs sm:text-sm text-neutral-950 flex items-center gap-1">
                        <span>#{formatOrderId(order.id)}</span>
                        <button
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(formatOrderId(order.id));
                              setToastMessage(`Order ID #${formatOrderId(order.id)} copied!`);
                              setTimeout(() => setToastMessage(null), 2500);
                            }
                          }}
                          className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Copy Order ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {new Date(order.placed_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">

                      {isDelivered && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </span>
                      )}
                      {isAwaitingRider && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Rider</span>
                        </span>
                      )}
                      {isAssigned && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5" />
                          <span>Rider Assigned</span>
                        </span>
                      )}
                      {isOnRoute && (
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 text-xs font-black flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Out for Delivery</span>
                        </span>
                      )}

                      {/* 3-Dots Action Menu Popover */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                          title="More Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuOrderId === order.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuOrderId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white rounded-2xl border border-neutral-200 shadow-xl p-1.5 text-xs font-semibold space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  setOpenMenuOrderId(null);
                                  setSelectedOrderDetail(order);
                                }}
                                className="w-full px-3 py-2 rounded-xl hover:bg-amber-50 text-neutral-800 hover:text-amber-950 text-left flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Order Details &amp; Customer Info</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuOrderId(null);
                                  handleDirectDownloadPackingSlip(order);
                                }}
                                className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-neutral-800 hover:text-emerald-950 text-left flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Download Slip</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuOrderId(null);
                                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard.writeText(formatOrderId(order.id));
                                    setToastMessage(`Order ID #${formatOrderId(order.id)} copied!`);
                                    setTimeout(() => setToastMessage(null), 2500);
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-800 text-left flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Copy className="w-4 h-4 text-neutral-500 shrink-0" />
                                <span>Copy Order ID</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Content: Clean Garments List (No Bulky Box) */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                        />
                        <div className="min-w-0 flex-1">
                          <h6 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h6>
                          <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-black shadow-2xs">
                              Size: {item.size}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-200/90 text-neutral-950 font-extrabold border border-neutral-300">
                              Qty: {item.quantity}
                            </span>
                            {item.fabric && (
                              <span className="text-neutral-800 font-extrabold text-[11px] truncate">• {item.fabric}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-black text-neutral-900 shrink-0">
                          ₹{(item.price_per_unit * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-neutral-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-neutral-500 font-medium">Total Settlement:</span>
                      <span className="text-base font-black text-neutral-950">
                        ₹{(order.total_paid || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Download Slip Button */}
                      <button
                        onClick={() => handleDirectDownloadPackingSlip(order)}
                        className="py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-50/70 text-emerald-700 border border-emerald-300 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.18),0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Directly Download HTML/PDF Packing Slip to Downloads"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>Download Slip</span>
                      </button>

                      {/* Full Action Pipeline Parity for Nearby Orders (Mutually Exclusive) */}
                      {/* 1. New -> Accept Order / Reject */}
                      {isNew && (
                        <>
                          <button
                            type="button"
                            onClick={() => setToastMessage('Order Rejected')}
                            className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOrders(prev => prev.map(o => o.id === order.id ? { ...o, seller_status: 'accepted' } : o));
                              setToastMessage(`Order #${formatOrderId(order.id)} Accepted!`);
                              setTimeout(() => setToastMessage(null), 2500);
                            }}
                            className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Accept Order</span>
                          </button>
                        </>
                      )}

                      {/* 2. Accepted -> Move to Packaging */}
                      {isAccepted && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, seller_status: 'packaging' } : o));
                            setToastMessage(`Order #${formatOrderId(order.id)} Moved to Packaging!`);
                            setTimeout(() => setToastMessage(null), 2500);
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-amber-50/70 text-amber-900 border border-amber-300 shadow-[0_2px_8px_-1px_rgba(245,158,11,0.25),0_1px_2px_rgba(0,0,0,0.05)] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          title="Mark Garment Packaging Completed"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                          <span>Move to Packaging</span>
                        </button>
                      )}

                      {/* 3. Packaging -> Handover for Shifting */}
                      {isPackaging && (
                        <button
                          type="button"
                          onClick={() => {
                            setDispatchOrder(order);
                            setSelectedPartner('platform_fleet');
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-emerald-50/70 text-emerald-900 border border-emerald-300 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.25),0_1px_2px_rgba(0,0,0,0.05)] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                          title="Handover parcel for local shifting"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Handover for Shifting &rarr;</span>
                        </button>
                      )}

                      {/* 4. Rider Assignment Button if pending */}
                      {isAwaitingRider && (
                        <button
                          type="button"
                          onClick={() => {
                            setDispatchOrder(order);
                            setSelectedPartner('platform_fleet');
                            setCustomRiderName('');
                            setCustomRiderPhone('');
                            setCustomVehicleNo('');
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                          <span>⚡ Assign Delivery Rider</span>
                        </button>
                      )}

                      {/* 5. Delivered -> Delivered Badge */}
                      {isDelivered && (
                        <span className="py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DISPATCH RIDER MODAL (Internal Fleet / Store Runner, Clean White Theme) */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-2xl relative text-neutral-900 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-amber-500/15 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950">Assign Delivery Rider</h3>
                  <p className="text-[11px] text-neutral-500">Order #{dispatchOrder.id} • {dispatchOrder.distance_km || 3.8} km away</p>
                </div>
              </div>

              <button
                onClick={() => setDispatchOrder(null)}
                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Destination Pill */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-neutral-900 block">{dispatchOrder.shipping_address?.name || dispatchOrder.customer_name}</span>
                  <span className="text-neutral-500 leading-relaxed block">
                    {dispatchOrder.shipping_address?.street}, {dispatchOrder.shipping_address?.city}
                  </span>
                </div>
              </div>

              {/* Select Fulfillment Method (Platform Fleet vs Store Staff) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  Select Delivery Rider Network:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPartner('platform_fleet')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPartner === 'platform_fleet'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Bike className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-neutral-950">Mitreno Fleet</span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">Dedicated Rider</div>
                    <div className="text-[11px] text-neutral-500 mt-1 font-semibold">12–15 min pickup</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPartner('store_fleet')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPartner === 'store_fleet'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-neutral-950">Store Staff</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Dukan Ka Staff</div>
                    <div className="text-[11px] text-neutral-500 mt-1 font-semibold">In-house delivery</div>
                  </button>
                </div>
              </div>

              {/* Custom Store In-House Fields */}
              {selectedPartner === 'store_fleet' && (
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5 animate-in fade-in">
                  <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                    Store Delivery Boy Details:
                  </div>
                  <input
                    type="text"
                    value={customRiderName}
                    onChange={(e) => setCustomRiderName(e.target.value)}
                    placeholder="Staff / Boy Name (e.g. Raju Das)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customRiderPhone}
                      onChange={(e) => setCustomRiderPhone(e.target.value)}
                      placeholder="Phone (+91...)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={customVehicleNo}
                      onChange={(e) => setCustomVehicleNo(e.target.value)}
                      placeholder="Bike / Scooter No."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Automatic OTP Handshake Notice */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Package Pickup Handshake</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  System will generate a 4-digit <strong>Pickup OTP</strong>. Verify this code when handing over the garment parcel to the assigned delivery rider.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-neutral-100 flex items-center justify-end gap-2.5 bg-neutral-50">
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isDispatching}
                className="py-2.5 px-5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning Rider...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Confirm &amp; Assign Rider</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SLIDE-IN ORDER DETAIL DRAWER */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border-l border-neutral-200 h-full flex flex-col animate-in slide-in-from-right duration-200 text-neutral-900 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-sm shadow-xs">
                  <Zap className="w-4.5 h-4.5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-950 tracking-wide">
                    Order Details &amp; Receipt #{formatOrderId(selectedOrderDetail.id)}
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Same-Day Local Order • Placed on {new Date(selectedOrderDetail.placed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F8F9FA] scrollbar-thin scrollbar-thumb-neutral-300">
              {/* Items Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  Ordered Garments ({selectedOrderDetail.items?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedOrderDetail.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                      <div className="w-12 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.thumbnail} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-neutral-900 truncate">{it.name}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Size: <strong className="text-amber-700">{it.size}</strong> • Qty: {it.quantity}
                          {it.fabric && <span> • {it.fabric}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-neutral-950">₹{((it.price_per_unit || 0) * it.quantity).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-neutral-400">₹{it.price_per_unit} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Delivery Address */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  Customer &amp; Delivery Address
                </h4>
                <div className="text-xs space-y-1.5">
                  <div className="font-black text-neutral-950 text-sm">
                    {selectedOrderDetail.customer_name || selectedOrderDetail.shipping_address?.name || 'Customer'}
                  </div>
                  <div className="text-neutral-700 leading-relaxed font-medium">
                    {selectedOrderDetail.shipping_address?.street ? `${selectedOrderDetail.shipping_address.street}, ` : ''}
                    {selectedOrderDetail.shipping_address?.city || 'Guwahati'} - {selectedOrderDetail.shipping_address?.pincode || '781024'}
                  </div>
                  <div className="text-neutral-900 flex items-center gap-2 pt-1 font-mono font-black">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>{maskPhoneNumber(selectedOrderDetail.shipping_address?.phone || selectedOrderDetail.customer_phone)}</span>
                    <span className="text-[10px] text-neutral-400 font-sans font-normal">(Protected for Privacy)</span>
                  </div>
                </div>
              </div>

              {/* Payment & Settlement Summary */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Payment Protection</span>
                  {selectedOrderDetail.payment_mode?.toUpperCase() === 'COD' ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                      <Banknote className="w-3.5 h-3.5 text-amber-700" />
                      <span>COD • Collect ₹{selectedOrderDetail.total_paid?.toLocaleString('en-IN')} on Delivery</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>UPI Escrow Protected</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-neutral-600 font-medium">
                  <span>Garments Total</span>
                  <span className="font-mono text-neutral-900 font-bold">₹{selectedOrderDetail.total_paid?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 font-medium">
                  <span>Same-Day Local Express Delivery</span>
                  <span className="font-mono text-emerald-700 font-bold">FREE (Boutique Special)</span>
                </div>
                <div className="pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between text-sm font-black text-neutral-950">
                  <span>Total Order Settlement</span>
                  <span className="font-mono font-black text-emerald-700 text-base">₹{selectedOrderDetail.total_paid?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
