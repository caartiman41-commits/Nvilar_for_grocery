'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  MapPin,
  Phone,
  Copy,
  Printer,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Send,
  X,
  Eye,
  Check,
  Download,
  CheckSquare,
  Square,
  Navigation,
  ShieldCheck,
  Banknote,
  MoreVertical,
} from 'lucide-react';

export const formatOrderId = (id: string) => {
  if (!id) return 'MIT-00000';
  if (id.startsWith('MIT-')) return id;
  const digits = id.replace(/\D/g, '');
  if (digits.length >= 5) {
    return `MIT-${digits.slice(-5)}`;
  }
  return `MIT-${id.toUpperCase().slice(-5)}`;
};

export type OrderFilterTab = 'all' | 'new' | 'packaging' | 'shipped' | 'delivered' | 'cancelled' | 'returns';

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

interface OrderData {
  id: string;
  buyer_id: string;
  shop_id: string;
  customer_name?: string;
  customer_phone?: string;
  has_admin_warning?: boolean;
  shipping_address: {
    name?: string;
    phone?: string;
    alternate_phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: string;
    longitude?: string;
  };
  payment_mode: string;
  payment_status: string;
  total_mrp: number;
  total_savings: number;
  delivery_charge: number;
  total_paid: number;
  order_status: string;
  seller_status: string;
  tracking_provider?: string;
  tracking_number?: string;
  seller_notes?: string;
  placed_at: string;
  accepted_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: OrderItem[];
}

interface TrackingStage {
  id: string;
  stage: string;
  title: string;
  description: string;
  status: string;
  time_label?: string;
  created_at: string;
}

interface SellerOrdersProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [activeFilter, setActiveFilter] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingStage[]>([]);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);

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

  const formatOrderId = (id?: string) => {
    if (!id) return 'MIT-0000';
    const target = id.trim();
    const cleanDigits = target.replace(/\D/g, '');
    if (cleanDigits.length >= 4) {
      return `MIT-${cleanDigits.slice(-4)}`;
    }
    return `MIT-${target.slice(-4).toUpperCase().padStart(4, '0')}`;
  };

  // Modals for Actions
  const [shippingModalOrder, setShippingModalOrder] = useState<OrderData | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('Delhivery Surface');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [rejectModalOrder, setRejectModalOrder] = useState<OrderData | null>(null);
  const [rejectReason, setRejectReason] = useState('Out of stock in requested size');
  const [returnModalOrder, setReturnModalOrder] = useState<OrderData | null>(null);
  const [returnResponseNote, setReturnResponseNote] = useState('Return accepted. Reverse pickup initiated.');

  const [notesInput, setNotesInput] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchOrders = async (isBackground = false) => {
    if (!shopId && !userId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    try {
      if (!isBackground && orders.length === 0) {
        setIsLoading(true);
      }
      const params: Record<string, any> = {
        status: activeFilter,
        tier: 'standard',
      };
      if (shopId) params.shop_id = shopId;
      if (userId) params.user_id = userId;

      const data = await apiClient.get('/api/seller/orders', params);
      if (data.success) {
        setOrders(data.orders || []);
        if (data.counts) {
          setCounts({
            all: parseInt(data.counts.total || 0, 10),
            new: parseInt(data.counts.new_count || 0, 10),
            packaging: parseInt(data.counts.packaging_count || 0, 10),
            shipped: parseInt(data.counts.shipped_count || 0, 10),
            delivered: parseInt(data.counts.delivered_count || 0, 10),
            cancelled: parseInt(data.counts.cancelled_count || 0, 10),
            returns: parseInt(data.counts.returns_count || 0, 10),
          });
        }
      }
    } catch (err) {
      console.error('Failed to load seller orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => {
      fetchOrders(true); // background silent poll - ZERO flicker
    }, 4000);
    return () => clearInterval(interval);
  }, [activeFilter, searchQuery, shopId, userId]);

  // Open Order Detail Drawer
  const handleOpenOrderDetail = async (order: OrderData) => {
    setSelectedOrder(order);
    setNotesInput(order.seller_notes || '');
    setIsDetailDrawerOpen(true);

    try {
      const data = await apiClient.get(`/api/seller/orders/${order.id}`);
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        if (data.order.tracking_history) {
          setTrackingHistory(data.order.tracking_history);
        }
      }
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
    }
  };

  const triggerToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Shared Packing Slip Card HTML Generator (High-Contrast Typography & Clear Logistics Display)
  const renderSlipCardHTML = (order: OrderData, index?: number, totalCount?: number) => {
    const address = order.shipping_address || {};
    const isCOD = (order.payment_mode || '').toLowerCase().includes('cod');
    const itemsHtml = (order.items || []).map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 6px 10px; font-weight: 800; font-size: 13px; color: #0f172a;">${item.name}</td>
        <td style="padding: 6px 10px; text-align: center; font-size: 13px; font-weight: 700; color: #334155;">${item.size || 'Free Size'}</td>
        <td style="padding: 6px 10px; text-align: center; font-size: 14px; font-weight: 900; color: #0f172a;">${item.quantity}</td>
        <td style="padding: 6px 10px; text-align: right; font-weight: 900; font-size: 13px; color: #0f172a;">₹${(item.price_per_unit * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    return `
      <div class="slip-card" style="box-sizing: border-box; border: 2.5px solid #0f172a; border-radius: 12px; padding: 14px 18px; background: #ffffff; margin-bottom: 16px; max-width: 800px; margin-left: auto; margin-right: auto; page-break-inside: avoid;">
        <!-- Top Brand & Dispatch Info Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #000; text-transform: uppercase;">MITRENO LUXURY BOUTIQUE</div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-top: 1px;">Official Dispatch Manifest & Tax Invoice ${totalCount ? `(${index! + 1} of ${totalCount})` : ''}</div>
          </div>
          <div style="text-align: right;">
            <span style="background: #000; color: #fff; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">DISPATCH READY</span>
            <div style="font-family: monospace; font-weight: 900; font-size: 15px; margin-top: 4px; color: #000;">#${order.id.toUpperCase()}</div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b;">Date: ${new Date(order.placed_at).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <!-- Recipient & Logistics Boxes (High-Contrast Large Text for Courier Delivery Drivers) -->
        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <!-- Recipient Box -->
          <div style="flex: 1.1; border: 2px solid #94a3b8; border-radius: 10px; padding: 10px 12px; background: #f8fafc;">
            <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 3px;">DELIVERY RECIPIENT</div>
            <div style="font-size: 16px; font-weight: 900; color: #000; margin-bottom: 3px; text-transform: uppercase;">${order.customer_name || address.name || 'Shopper Name'}</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.4;">
              ${address.street ? address.street + '<br/>' : ''}
              ${address.city || 'Mumbai'}, ${address.state || 'Maharashtra'} - <strong style="font-size: 14px; color: #000;">${address.pincode || ''}</strong>
            </div>
            <div style="margin-top: 5px; display: flex; flex-direction: column; gap: 3px;">
              <span style="font-size: 13px; font-weight: 900; background: #fef08a; color: #854d0e; border: 1.5px solid #eab308; padding: 2px 8px; border-radius: 5px; display: inline-block;">
                📞 PHONE: ${order.customer_phone || address.phone || '+91 Contact on Delivery'} ${address.alternate_phone ? `(Alt: ${address.alternate_phone})` : ''}
              </span>
              ${address.latitude && address.longitude && address.latitude !== 'Detecting...' ? `
                <span style="font-size: 11px; font-weight: 800; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                  📍 GPS: ${address.latitude}, ${address.longitude}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Logistics Box -->
          <div style="flex: 0.9; border: 2px solid #94a3b8; border-radius: 10px; padding: 10px 12px; background: #f8fafc;">
            <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 3px;">LOGISTICS & FULFILLMENT</div>
            <div style="font-size: 15px; font-weight: 900; color: #000; margin-bottom: 3px;">🚚 ${order.tracking_provider || 'Delhivery Surface'}</div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.5;">
              <strong>AWB Tracking:</strong> <span style="font-family: monospace; font-size: 13px; font-weight: 900; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a;">${order.tracking_number || 'PENDING_AWB'}</span><br/>
              <div style="margin-top: 4px;">
                ${
                  isCOD
                    ? `<span style="background: #ffe4e6; color: #9f1239; border: 1.5px solid #f43f5e; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 5px; display: inline-block;">💵 COLLECT COD: ₹${order.total_paid.toLocaleString('en-IN')}</span>`
                    : `<span style="background: #dcfce7; color: #14532d; border: 1.5px solid #22c55e; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 5px; display: inline-block;">✅ PREPAID UPI (PAID)</span>`
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
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

        <!-- Footer & Settlement -->
        <div style="border-top: 2px solid #0f172a; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; font-weight: 900; color: #0f172a;">Mitreno Direct Delivery Guarantee</div>
            <div style="font-size: 9px; font-weight: 600; color: #64748b;">Verified boutique merchandise • Official Tax Invoice & Packing Slip</div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10px; color: #475569; font-weight: 800; text-transform: uppercase;">Total Settlement: </span>
            <span style="font-size: 17px; font-weight: 900; color: #000;">₹${order.total_paid.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Instant Printable Shipping Label & Packing Slip Generator
  const handlePrintPackingSlip = (order: OrderData) => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip - #${order.id.toUpperCase()}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.4; background: #f8fafc; }
            @media print {
              body { padding: 0; background: #fff; }
              .no-print { display: none !important; }
              .slip-card { border: 2.5px solid #000 !important; margin-bottom: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 22px; background: #f59e0b; color: #000; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">🖨️ Print Label / Save PDF</button>
          </div>
          ${renderSlipCardHTML(order)}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 350);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Bulk Print Manifest Generator (FORMATTED FOR EXACTLY 2 SLIPS PER A4 PAGE)
  const handleBulkPrintSlips = (ordersToPrint: OrderData[]) => {
    if (!ordersToPrint || ordersToPrint.length === 0) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;

    const labelsHtml = ordersToPrint.map((order, idx) => renderSlipCardHTML(order, idx, ordersToPrint.length)).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk Shipping Manifest (${ordersToPrint.length} Orders - 2 per A4 Page)</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #111; max-width: 850px; margin: 0 auto; background: #f1f5f9; }
            .slip-card {
              height: 132mm;
              max-height: 134mm;
              margin-bottom: 6mm !important;
            }
            .slip-card:nth-child(2n) {
              page-break-after: always;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 8mm;
              }
              body { padding: 0; background: #fff; }
              .no-print { display: none !important; }
              .slip-card {
                height: 134mm !important;
                max-height: 135mm !important;
                margin-bottom: 6mm !important;
                border: 2.5px solid #000 !important;
                page-break-inside: avoid !important;
              }
              .slip-card:nth-child(2n) {
                page-break-after: always !important;
                margin-bottom: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right; background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 900; font-size: 15px; color: #0f172a;">📦 Bulk Printing ${ordersToPrint.length} Shipping Manifest Labels</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 2px;">Optimized: Exactly 2 packing slips fit per A4 sheet!</div>
            </div>
            <button onclick="window.print()" style="padding: 10px 24px; background: #f59e0b; color: #000; border: none; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">🖨️ Print All (${ordersToPrint.length} Slips)</button>
          </div>

          <div class="label-container">
            ${labelsHtml}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 450);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Direct Browser File Download Generator (Downloads .html manifest straight to Chrome Downloads folder)
  const handleDirectDownloadPackingSlip = (order: OrderData) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Mitreno Shipping Manifest - #${order.id.toUpperCase()}</title>
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
    link.download = `Mitreno_Packing_Slip_${order.id.toUpperCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded slip #${order.id.toUpperCase()} to Chrome Downloads!`);
  };

  // 1. Accept Order
  const handleAcceptOrder = async (orderId: string) => {
    try {
      // Optimistic update for 0ms latency UI response
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, seller_status: 'accepted', order_status: 'accepted' } : o));
      const data = await apiClient.post(`/api/seller/orders/${orderId}/accept`);
      if (data.success) {
        triggerToast('Order accepted! Moved to packaging status.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_order_status_updated', { detail: { orderId, status: 'accepted' } }));
          localStorage.setItem('mitreno_order_update_broadcast', JSON.stringify({ orderId, status: 'accepted', timestamp: Date.now() }));
        }
        fetchOrders(true);
        if (onRefreshMetrics) onRefreshMetrics();
        if (selectedOrder && selectedOrder.id === orderId) {
          handleOpenOrderDetail({ ...selectedOrder, seller_status: 'accepted', order_status: 'accepted' });
        }
      }
    } catch (err) {
      console.error('Failed to accept order:', err);
    }
  };

  // 2. Reject Order
  const handleRejectOrder = async () => {
    if (!rejectModalOrder) return;
    try {
      const data = await apiClient.post(`/api/seller/orders/${rejectModalOrder.id}/reject`, { reason: rejectReason });
      if (data.success) {
        triggerToast('Order rejected and customer notified.');
        setRejectModalOrder(null);
        fetchOrders();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Failed to reject order:', err);
    }
  };

  // 3. Mark As Packaging
  const handleMarkPackaging = async (orderId: string) => {
    try {
      const data = await apiClient.post(`/api/seller/orders/${orderId}/status`, { status: 'packaging' });
      if (data.success) {
        triggerToast('Order marked as packaging in boutique studio.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_order_status_updated', { detail: { orderId, status: 'packaging' } }));
          localStorage.setItem('mitreno_order_update_broadcast', JSON.stringify({ orderId, status: 'packaging', timestamp: Date.now() }));
        }
        fetchOrders();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // 4. Confirm Dispatch / Mark Shipped
  const handleConfirmShipping = async () => {
    if (!shippingModalOrder) return;
    const awb = trackingNumberInput.trim() || `MIT-${Date.now().toString().slice(-8)}`;

    try {
      const data = await apiClient.post(`/api/seller/orders/${shippingModalOrder.id}/status`, {
        status: 'shipped',
        tracking_provider: selectedCourier,
        tracking_number: awb,
      });
      if (data.success) {
        triggerToast(`Order dispatched via ${selectedCourier} (AWB: ${awb})`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_order_status_updated', { 
            detail: { 
              orderId: shippingModalOrder.id, 
              status: 'shipped',
              courier: selectedCourier,
              awb: awb,
              timestamp: Date.now() 
            } 
          }));
          localStorage.setItem('mitreno_order_update_broadcast', JSON.stringify({
            orderId: shippingModalOrder.id,
            status: 'shipped',
            courier: selectedCourier,
            awb: awb,
            timestamp: Date.now()
          }));
        }
        setShippingModalOrder(null);
        setTrackingNumberInput('');
        fetchOrders();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Failed to ship order:', err);
    }
  };

  // 5. Update Status (Out for Delivery / Delivered)
  const handleUpdateStatus = async (orderId: string, status: 'out_for_delivery' | 'delivered') => {
    try {
      const data = await apiClient.post(`/api/seller/orders/${orderId}/status`, { status });
      if (data.success) {
        triggerToast(status === 'delivered' ? 'Order delivered successfully! Settlement queued.' : 'Status set to Out for Delivery.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_order_status_updated', { detail: { orderId, status } }));
          localStorage.setItem('mitreno_order_update_broadcast', JSON.stringify({ orderId, status, timestamp: Date.now() }));
        }
        fetchOrders();
        if (onRefreshMetrics) onRefreshMetrics();
        if (selectedOrder && selectedOrder.id === orderId) {
          handleOpenOrderDetail({ ...selectedOrder, seller_status: status });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // 6. Handle Return Action
  const handleReturnAction = async (action: 'accept' | 'reject') => {
    if (!returnModalOrder) return;
    try {
      const data = await apiClient.post(`/api/seller/orders/${returnModalOrder.id}/return-response`, {
        action,
        response_note: returnResponseNote,
      });
      if (data.success) {
        triggerToast(action === 'accept' ? 'Return request approved. Reverse pickup scheduled.' : 'Return request declined.');
        setReturnModalOrder(null);
        fetchOrders();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Failed to process return response:', err);
    }
  };

  // 7. Save Notes
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      await apiClient.post(`/api/seller/orders/${selectedOrder.id}/notes`, { notes: notesInput });
      triggerToast('Internal seller notes saved.');
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const getStatusBadge = (sellerStatus: string, orderStatus: string) => {
    const s = (sellerStatus || '').toLowerCase();
    const o = (orderStatus || '').toLowerCase();

    if (s === 'accepted') {
      return {
        label: 'Accepted',
        subLabel: 'Ready for Packaging',
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-500',
      };
    }
    if (s === 'packaging' || s === 'processing') {
      return {
        label: 'Packaging',
        subLabel: 'Ready to Pack',
        bg: 'bg-blue-50 border-blue-200 text-blue-800',
        dot: 'bg-blue-500',
      };
    }
    if (s === 'shipped') {
      return {
        label: 'Shipped',
        subLabel: 'In Transit',
        bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        dot: 'bg-indigo-500',
      };
    }
    if (s === 'out_for_delivery') {
      return {
        label: 'Out for Delivery',
        subLabel: 'Arriving Today',
        bg: 'bg-purple-50 border-purple-200 text-purple-800',
        dot: 'bg-purple-500',
      };
    }
    if (s === 'delivered' || o === 'delivered') {
      return {
        label: 'Delivered',
        subLabel: 'Completed',
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-500',
      };
    }
    if (s === 'cancelled' || o === 'cancelled') {
      return {
        label: 'Cancelled',
        subLabel: 'Refunded',
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        dot: 'bg-rose-500',
      };
    }
    if (s === 'return_requested') {
      return {
        label: 'Return Requested',
        subLabel: 'Review Required',
        bg: 'bg-orange-50 border-orange-200 text-orange-800',
        dot: 'bg-orange-500',
      };
    }
    if (s === 'returned') {
      return {
        label: 'Returned',
        subLabel: 'Restocked',
        bg: 'bg-neutral-100 border-neutral-200 text-neutral-700',
        dot: 'bg-neutral-400',
      };
    }

    return {
      label: 'Needs Action',
      subLabel: 'New Order',
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      dot: 'bg-amber-500',
    };
  };

  const tabs: { id: OrderFilterTab; label: string; countKey: string; color?: string }[] = [
    { id: 'all', label: 'All Orders', countKey: 'all' },
    { id: 'new', label: 'New Orders', countKey: 'new', color: 'text-amber-400' },
    { id: 'packaging', label: 'Packaging', countKey: 'packaging' },
    { id: 'shipped', label: 'Shipped', countKey: 'shipped' },
    { id: 'delivered', label: 'Delivered', countKey: 'delivered' },
    { id: 'returns', label: 'Returns', countKey: 'returns', color: 'text-rose-400' },
    { id: 'cancelled', label: 'Cancelled', countKey: 'cancelled' },
  ];

  return (
    <div className="w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-emerald-500/40 text-emerald-700 text-xs font-semibold shadow-xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* STICKY HEADER SECTION (Attached flush to top:0) */}
      <div className="sticky top-0 z-20 bg-[#F8F9FA]/95 backdrop-blur-md pt-3 pb-3 px-4 sm:px-6 border-b border-neutral-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
            <span>Order Fulfillment Engine</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
              Live Flow
            </span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Accept customer orders, pack with quality assurance, dispatch with AWB tracking, and handle return requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order, customer, SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 shadow-xs transition-colors"
            />
          </div>

          {/* Bulk Print All Slips Button (Dark Crimson Red) */}
          <button
            onClick={() => handleBulkPrintSlips(orders)}
            disabled={orders.length === 0}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-800 hover:to-red-900 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-700/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            title="Bulk Print Shipping Manifest for All Orders"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Bulk Print ({orders.length})</span>
          </button>

          <button
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors shadow-xs shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* NEW ORDERS ALERT BANNER */}
      {(counts.new || 0) > 0 && (
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/40 shadow-sm flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚨</span>
            <div>
              <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
                New Customer Order{(counts.new || 0) > 1 ? 's' : ''} Received!
              </p>
              <p className="text-[11px] font-semibold text-amber-800">
                You have <span className="font-black text-amber-950 underline">{counts.new}</span> order{(counts.new || 0) > 1 ? 's' : ''} awaiting boutique confirmation and packaging.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFilter('new')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Review New Orders ({counts.new}) &rarr;
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pt-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          const count = counts[tab.countKey] || 0;

          // Sleek pill badges for count indicators
          let countStyle = 'bg-neutral-100 text-neutral-500 font-semibold';
          if (isActive) {
            countStyle = 'bg-white/20 text-white font-bold';
          } else if (count > 0) {
            if (tab.id === 'returns') {
              countStyle = 'bg-rose-100 text-rose-700 font-bold';
            } else {
              countStyle = 'bg-emerald-100 text-emerald-700 font-bold';
            }
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white border border-emerald-900 shadow-[0_4px_14px_-2px_rgba(6,95,70,0.38),0_2px_4px_rgba(6,95,70,0.2)] hover:-translate-y-0.5'
                  : 'bg-white hover:bg-neutral-50/90 border border-neutral-200/90 text-neutral-700 hover:text-neutral-950 hover:border-neutral-300 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.11)] hover:-translate-y-0.5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ml-0.5 ${countStyle}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      </div>
      </div>

      {/* Orders List / Cards Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-8 space-y-4">
        {/* Orders List / Cards */}
      {isLoading && orders.length === 0 ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 mx-auto text-amber-500 animate-spin mb-3" />
          <p className="text-xs text-neutral-500 font-medium">Fetching orders from PostgreSQL database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-neutral-200/90 shadow-xs p-8">
          <Package className="w-12 h-12 mx-auto text-neutral-300 stroke-[1.2] mb-3" />
          <h3 className="text-sm font-bold text-neutral-900">No orders found in &quot;{activeFilter}&quot;</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No matching orders for "${searchQuery}". Try clearing search.`
              : 'Incoming customer orders matching this stage will show here for instant fulfillment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.seller_status, order.order_status);
            const address = order.shipping_address || {};
            const sStatus = (order.seller_status || '').toLowerCase();
            const oStatus = (order.order_status || '').toLowerCase();

            // Order is NEW only if seller_status is 'new' OR (seller_status is empty and order_status is 'placed')
            const isNew = sStatus === 'new' || (!sStatus && (oStatus === 'placed' || !oStatus));
            const isAccepted = sStatus === 'accepted';
            const isPackaging = ['packaging', 'processing'].includes(sStatus);
            const isShipped = sStatus === 'shipped';
            const isOutForDelivery = sStatus === 'out_for_delivery';
            const isDelivered = sStatus === 'delivered' || oStatus === 'delivered';
            const isReturnReq = sStatus === 'return_requested';

            return (
              <div
                key={order.id}
                className={`relative overflow-hidden rounded-3xl bg-white border transition-all p-3.5 sm:p-4 space-y-3 shadow-xs hover:shadow-sm text-neutral-900 ${
                  order.has_admin_warning ? 'border-rose-400 ring-2 ring-rose-200' : 'border-neutral-200/90 hover:border-neutral-300'
                }`}
              >
                {/* Urgent Admin Warning Banner if Overdue */}
                {order.has_admin_warning && (
                  <div className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15 border-2 border-rose-500/50 flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🚨</span>
                      <div>
                        <p className="text-xs font-black text-rose-950 uppercase tracking-wider">
                          Admin SLA Warning: Confirmation Overdue!
                        </p>
                        <p className="text-[11px] font-semibold text-rose-800">
                          Platform Admin has flagged this order. Please accept and dispatch packaging immediately.
                        </p>
                      </div>
                    </div>
                    {isNew && (
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm shrink-0 cursor-pointer"
                      >
                        Accept Now &rarr;
                      </button>
                    )}
                  </div>
                )}

                {/* Top Row: Genuine MIT- Order ID, Date, High-Contrast Payment & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs sm:text-sm text-neutral-950 flex items-center gap-1">
                      <span>#{formatOrderId(order.id)}</span>
                      <button
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(formatOrderId(order.id));
                            setActionSuccessMsg(`Order ID #${formatOrderId(order.id)} copied!`);
                            setTimeout(() => setActionSuccessMsg(null), 2500);
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
                      {new Date(order.placed_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>

                    {/* 3-Dots Action Menu Popover (Opens Dropdown containing Order Details, Download Slip, Copy ID) */}
                    <div className="relative">
                      <button
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
                                handleOpenOrderDetail(order);
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
                                  setActionSuccessMsg(`Order ID #${formatOrderId(order.id)} copied!`);
                                  setTimeout(() => setActionSuccessMsg(null), 2500);
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

                {/* Middle Section: Clean Garments List (No Bulky Box) */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-950 truncate">
                          {item.name}
                        </h4>
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

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-neutral-950">
                          ₹{(item.price_per_unit * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-neutral-400">₹{item.price_per_unit} / piece</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-neutral-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-neutral-500 font-medium">Total Settlement:</span>
                    <span className="text-base font-black text-neutral-950">
                      ₹{order.total_paid.toLocaleString('en-IN')}
                    </span>
                    {order.total_savings > 0 && (
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        (Discount ₹{order.total_savings})
                      </span>
                    )}
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

                    {/* SINGLE STAGE ACTION BUTTON (Never shows Move to Packaging + Handover to Courier together) */}
                    {/* 1. New -> Accept / Reject */}
                    {isNew && (
                      <>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="w-full sm:w-auto py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_14px_-2px_rgba(5,150,105,0.4)] hover:shadow-[0_6px_18px_-2px_rgba(5,150,105,0.5)] active:scale-95 transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Accept Order</span>
                        </button>
                      </>
                    )}

                    {/* 2. Accepted -> Move to Packaging (ONLY when status is 'accepted') */}
                    {isAccepted && (
                      <button
                        onClick={() => handleMarkPackaging(order.id)}
                        className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-amber-50/70 text-amber-900 border border-amber-300 shadow-[0_2px_8px_-1px_rgba(245,158,11,0.25),0_1px_2px_rgba(0,0,0,0.05)] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Mark Garment Packaging Completed"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                        <span>Move to Packaging</span>
                      </button>
                    )}

                    {/* 3. Packaging -> Handover to Courier (ONLY when status is 'packaging' or 'processing') */}
                    {isPackaging && (
                      <button
                        onClick={() => setShippingModalOrder(order)}
                        className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-emerald-50/70 text-emerald-900 border border-emerald-300 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.25),0_1px_2px_rgba(0,0,0,0.05)] text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Handover parcel to DTDC / Bluedart Courier Fleet"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>Handover for Shifting &rarr;</span>
                      </button>
                    )}

                    {/* 4. Shipped to Courier Status Badge (Seller scope ends at handover) */}
                    {(isShipped || isOutForDelivery) && (
                      <span className="py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>Shipped to Courier</span>
                      </span>
                    )}

                    {/* 5. Delivered Badge */}
                    {isDelivered && (
                      <span className="py-1.5 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Delivered</span>
                      </span>
                    )}

                    {/* 6. Return Requested -> Review Return */}
                    {isReturnReq && (
                      <button
                        onClick={() => setReturnModalOrder(order)}
                        className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Respond to Return</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* DISPATCH & SHIPPING MODAL (Redesigned & Luxury Visual Selection) */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-neutral-200/90 p-6 sm:p-7 space-y-5 shadow-2xl text-neutral-900 overflow-hidden">
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-950 tracking-tight">Dispatch Order Manifest</h3>
                  <span className="text-xs font-bold text-amber-600 font-mono">#{shippingModalOrder.id.toUpperCase()}</span>
                </div>
              </div>
              <button
                onClick={() => setShippingModalOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Select your preferred partner logistics courier and assign Airway Bill (AWB) tracking for live customer notifications.
            </p>

            {/* Courier Selection Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block">
                Select Logistics Courier Partner
              </label>
              <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300">
                {[
                  { name: 'Delhivery Surface', tag: 'Standard Ground Cargo', speed: '3-5 Days', icon: '🚚' },
                  { name: 'Delhivery Air Express', tag: 'Priority Air Express', speed: '24-48 Hours', icon: '✈️' },
                  { name: 'Blue Dart Air', tag: 'Premium Express Cargo', speed: '24 Hours', icon: '⚡' },
                  { name: 'DTDC Express', tag: 'Fast Surface & Air', speed: '2-3 Days', icon: '📦' },
                  { name: 'XpressBees', tag: 'Fashion E-Commerce', speed: '2-4 Days', icon: '🛍️' },
                  { name: 'Ecom Express', tag: 'Direct Doorstep Deliveries', speed: '2-4 Days', icon: '🏬' },
                  { name: 'India Post Speed Post', tag: 'Government Speed Post', speed: '3-5 Days', icon: '📮' },
                  { name: 'Boutique Local Delivery', tag: 'Same-Day City Rider', speed: 'Today', icon: '🛵' },
                ].map((cr) => {
                  const isSelected = selectedCourier === cr.name;
                  return (
                    <div
                      key={cr.name}
                      onClick={() => setSelectedCourier(cr.name)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-neutral-950 shadow-sm ring-2 ring-amber-500/30'
                          : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{cr.icon}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-white text-neutral-600 border border-neutral-200'}`}>
                          {cr.speed}
                        </span>
                      </div>
                      <div className="text-xs font-black mt-1.5 truncate">{cr.name}</div>
                      <div className="text-[10px] text-neutral-500 font-semibold mt-0.5 truncate">{cr.tag}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block">
                  Airway Bill (AWB) / Tracking #
                </label>
                <button
                  type="button"
                  onClick={() => setTrackingNumberInput(`${selectedCourier.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-8)}IN`)}
                  className="text-[11px] font-extrabold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Generate AWB</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. DEL109823472IN"
                  className="w-full p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 shadow-2xs"
                />
                {trackingNumberInput && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(trackingNumberInput)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs flex items-center gap-1 font-sans"
                    title="Copy AWB"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-xs text-neutral-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Destination:</span>
                <span className="font-bold text-neutral-950">{shippingModalOrder.shipping_address?.city || 'India'}, {shippingModalOrder.shipping_address?.state || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer Recipient:</span>
                <span className="font-bold text-neutral-950">{shippingModalOrder.customer_name || 'Customer'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                className="w-1/3 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShipping}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm & Dispatch Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT ORDER MODAL */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xl text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-neutral-950">Reject Order</h3>
              </div>
              <button
                onClick={() => setRejectModalOrder(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to reject Order #{rejectModalOrder.id.toUpperCase()}? Customer payment will be refunded immediately to their original UPI source.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Select Reason for Rejection
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-rose-500"
              >
                <option value="Out of stock in requested size">Out of stock in requested size</option>
                <option value="Fabric quality issue during pre-shipment inspection">Fabric quality issue during pre-shipment inspection</option>
                <option value="Delivery address pincode unserviceable by courier">Delivery address pincode unserviceable by courier</option>
                <option value="Boutique closing for annual maintenance">Boutique closing for annual maintenance</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="w-1/3 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleRejectOrder}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all"
              >
                Confirm Rejection & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESPOND TO RETURN MODAL */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xl text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-neutral-950">Customer Return Request</h3>
              </div>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block text-amber-950">Customer Feedback:</span>
              <p className="mt-1 text-amber-900/90 leading-relaxed">
                {returnModalOrder.seller_notes || 'Customer requested return due to fit/sizing issues.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Boutique Response Note
              </label>
              <textarea
                rows={2}
                value={returnResponseNote}
                onChange={(e) => setReturnResponseNote(e.target.value)}
                placeholder="e.g. Return approved. Please keep garment in original polybag."
                className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleReturnAction('reject')}
                className="py-3 rounded-xl bg-neutral-100 hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 text-rose-600 text-xs font-bold transition-colors"
              >
                Decline Return
              </button>
              <button
                onClick={() => handleReturnAction('accept')}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all"
              >
                Accept & Pick Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-IN ORDER DETAIL DRAWER */}
      {isDetailDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border-l border-neutral-200 h-full flex flex-col animate-in slide-in-from-right duration-200 text-neutral-900 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-black text-neutral-950 tracking-wide">
                    Order Details &amp; Receipt #{formatOrderId(selectedOrder.id)}
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Placed on {new Date(selectedOrder.placed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
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
                  Ordered Products ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                      <div className="w-12 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.thumbnail} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-neutral-950 truncate">{it.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-black">Size: {it.size}</span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-950 font-bold">Qty: {it.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-neutral-950">₹{(it.price_per_unit * it.quantity).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-neutral-400 font-medium">₹{it.price_per_unit} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  Customer &amp; Delivery Address
                </h4>
                <div className="text-xs space-y-1.5">
                  <div className="font-black text-neutral-950 text-sm">{selectedOrder.customer_name || selectedOrder.shipping_address?.name}</div>
                  <div className="text-neutral-700 leading-relaxed font-medium">
                    {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.city} - {selectedOrder.shipping_address?.pincode}
                  </div>
                  <div className="text-neutral-900 flex items-center gap-2 pt-1 font-mono font-black">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>{maskPhoneNumber(selectedOrder.customer_phone || selectedOrder.shipping_address?.phone)}</span>
                    <span className="text-[10px] text-neutral-400 font-sans font-normal">(Protected for Privacy)</span>
                  </div>
                </div>
              </div>

              {/* Payment & Settlement Summary */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Payment Protection</span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span>UPI Escrow Protected</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 font-medium">
                  <span>Items MRP</span>
                  <span className="font-mono text-neutral-900 font-bold">₹{selectedOrder.total_mrp?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-800 font-semibold">
                  <span>Special Boutique Discount</span>
                  <span className="font-mono">-₹{selectedOrder.total_savings?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 font-medium">
                  <span>Shipping &amp; Delivery Fee</span>
                  <span className="font-mono text-neutral-900 font-bold">₹{selectedOrder.delivery_charge || 0}</span>
                </div>
                <div className="pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between text-sm font-black text-neutral-950">
                  <span>Total Settlement Paid</span>
                  <span className="font-mono font-black text-emerald-700 text-base">₹{selectedOrder.total_paid?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Seller Internal Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Internal Seller Notes
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Private note for this order..."
                    className="flex-1 p-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
