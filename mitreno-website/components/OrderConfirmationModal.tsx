'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Download,
  Share2,
  ShieldCheck,
  Copy,
  Check,
  PhoneCall,
  BadgeCheck,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Edit3,
  RotateCcw,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { CartItem } from './BagDrawer';
import { getBackendUrl } from '@/lib/config';

interface CustomerInfo {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    trackingNumber?: string;
    tracking_number?: string;
    courier?: string;
    tracking_provider?: string;
    deliveryPin?: string;
    seller_status?: string;
    order_status?: string;
    shipped_at?: string;
    accepted_at?: string;
    delivered_at?: string;
    items: CartItem[];
    mrp?: number;
    subtotal?: number;
    discount?: number;
    fees?: number;
    total: number;
    customer: CustomerInfo;
    paymentMethod: string;
    deliveryDate?: string;
    date: string;
    placedAt?: string;
  };
  onProductClick?: (product: any) => void;
}

const CANCELLATION_REASONS = [
  'Ordered by mistake / duplicate order',
  'Found a lower price or better discount elsewhere',
  'Need to change size, color, or product variant',
  'Delivery time is longer than expected',
  'Need to update shipping address or phone number',
  'Changed my mind / item no longer needed',
];

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onProductClick,
}) => {
  // Views:
  // 'celebration': Clean single card with celebratory fireworks, order ID, amount, and 'View Order Details' CTA
  // 'details': Clean horizontal product cards in unified boundary boxes with arrow expand
  const [viewMode, setViewMode] = useState<'celebration' | 'details'>('celebration');

  // Live order state dynamically synchronized with backend PostgreSQL
  const [liveOrder, setLiveOrder] = useState<any>(orderData);

  useEffect(() => {
    if (orderData) {
      setLiveOrder(orderData);
    }
  }, [orderData]);

  // Silent Background Pre-Warming Poller (Zero layout jumps, zero screen flicker)
  const fetchLiveOrderStatus = React.useCallback(async () => {
    const orderId = orderData?.orderId || liveOrder?.orderId || liveOrder?.id;
    if (!orderId) return;
    try {
      const backendUrl = getBackendUrl();
      let res = await fetch(`${backendUrl}/api/orders/${orderId}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`/api/orders/${orderId}`).catch(() => null);
      }
      if (!res || !res.ok) return;
      const data = await res.json();
      if (data.success && data.order) {
        setLiveOrder((prev: any) => ({
          ...prev,
          ...data.order,
          orderId: data.order.id || prev?.orderId,
          seller_status: data.order.seller_status,
          order_status: data.order.order_status,
          tracking_number: data.order.tracking_number || prev?.trackingNumber,
          trackingNumber: data.order.tracking_number || prev?.trackingNumber,
          tracking_provider: data.order.tracking_provider || prev?.courier,
          courier: data.order.tracking_provider || prev?.courier,
          deliveryPin: (data.order.shipping_address && data.order.shipping_address.delivery_pin) || data.order.delivery_pin || prev?.deliveryPin || '4845',
          shipped_at: data.order.shipped_at,
          accepted_at: data.order.accepted_at,
          delivered_at: data.order.delivered_at,
          tracking_history: data.order.tracking_history || prev?.tracking_history,
        }));
      }
    } catch {
      // Silent catch - seamless background refresh
    }
  }, [orderData?.orderId, liveOrder?.orderId, liveOrder?.id]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Check if recent broadcast is in localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mitreno_order_update_broadcast');
        if (raw) {
          const b = JSON.parse(raw);
          const currentId = orderData?.orderId || liveOrder?.orderId || liveOrder?.id;
          if (b.orderId && (!currentId || b.orderId === currentId)) {
            setLiveOrder((prev: any) => ({
              ...prev,
              seller_status: b.status,
              order_status: b.status,
              courier: b.courier || prev?.courier,
              tracking_provider: b.courier || prev?.tracking_provider,
              trackingNumber: b.trackingNumber || prev?.trackingNumber,
              tracking_number: b.trackingNumber || prev?.tracking_number,
            }));
          }
        }
      } catch {}
    }

    fetchLiveOrderStatus();
    const interval = setInterval(fetchLiveOrderStatus, 2500);

    const handleStatusUpdate = (e?: any) => {
      if (e?.detail) {
        const { orderId: evtOrderId, status, courier, trackingNumber } = e.detail;
        const currentId = orderData?.orderId || liveOrder?.orderId || liveOrder?.id;
        if (!evtOrderId || evtOrderId === currentId) {
          setLiveOrder((prev: any) => ({
            ...prev,
            seller_status: status,
            order_status: status,
            tracking_provider: courier || prev?.tracking_provider,
            courier: courier || prev?.courier,
            tracking_number: trackingNumber || prev?.tracking_number,
            trackingNumber: trackingNumber || prev?.trackingNumber,
          }));
        }
      }
      fetchLiveOrderStatus();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'mitreno_order_update_broadcast' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          const currentId = orderData?.orderId || liveOrder?.orderId || liveOrder?.id;
          if (data.orderId && (!currentId || data.orderId === currentId)) {
            setLiveOrder((prev: any) => ({
              ...prev,
              seller_status: data.status,
              order_status: data.status,
              tracking_provider: data.courier || prev?.tracking_provider,
              courier: data.courier || prev?.courier,
              tracking_number: data.trackingNumber || prev?.tracking_number,
              trackingNumber: data.trackingNumber || prev?.trackingNumber,
            }));
          }
        } catch {}
      }
      fetchLiveOrderStatus();
    };

    window.addEventListener('mitreno_order_status_updated', handleStatusUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mitreno_order_status_updated', handleStatusUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [isOpen, fetchLiveOrderStatus, orderData?.orderId, liveOrder?.orderId, liveOrder?.id]);

  // Track which product card is expanded inside its single boundary box
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Help & Options Modal state
  const [activeHelpItemIndex, setActiveHelpItemIndex] = useState<number | null>(null);
  const [helpActiveTab, setHelpActiveTab] = useState<'summary' | 'address' | 'cancel'>('summary');

  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<CustomerInfo>(() => ({
    fullName: orderData?.customer?.fullName || 'Customer',
    phone: orderData?.customer?.phone || '',
    addressLine: orderData?.customer?.addressLine || '',
    city: orderData?.customer?.city || '',
    pincode: orderData?.customer?.pincode || '',
  }));
  const [addressForm, setAddressForm] = useState<CustomerInfo>(currentAddress);

  // Cancellation state: map of cancelled item indices
  const [cancelledItems, setCancelledItems] = useState<Record<number, { reason: string; cancelledAt: string }>>({});
  const [cancelStep, setCancelStep] = useState<'select-reason' | 'confirm'>('select-reason');
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);

  // 24-Hour countdown timer
  // Total 24 hours in seconds (86,400s), initialized to ~23h 58m
  const [secondsRemaining, setSecondsRemaining] = useState<number>(23 * 3600 + 58 * 60 + 40);

  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Synchronize state when modal opens or orderData updates
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setViewMode('celebration');
      setExpandedItemId(null);
      setActiveHelpItemIndex(null);
      setHelpActiveTab('summary');
      setIsEditingAddress(false);
      setCancelledItems({});
      if (orderData?.customer) {
        setCurrentAddress(orderData.customer);
        setAddressForm(orderData.customer);
      }
    }
  }

  // 24-Hour live countdown interval
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Format seconds into HH:MM:SS
  const formatCountdown = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const isCancelWindowActive = secondsRemaining > 0;

  // Fireworks celebration trigger on modal open
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1246B8', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'],
          disableForReducedMotion: true,
        });

        setTimeout(() => {
          confetti({
            particleCount: 45,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.65 },
            colors: ['#10B981', '#F59E0B', '#1246B8', '#EC4899'],
            disableForReducedMotion: true,
          });
        }, 200);

        setTimeout(() => {
          confetti({
            particleCount: 45,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.65 },
            colors: ['#1246B8', '#F59E0B', '#10B981', '#8B5CF6'],
            disableForReducedMotion: true,
          });
        }, 400);
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCopyOrderId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(orderData.orderId).catch(() => {});
    }
    setCopiedOrderId(true);
    triggerToast('Order ID copied to clipboard');
    setTimeout(() => setCopiedOrderId(false), 2500);
  };

  const handleCopyDeliveryPin = () => {
    const pin = orderData.deliveryPin || '6833';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin).catch(() => {});
    }
    setCopiedPin(true);
    triggerToast('Delivery PIN copied to clipboard');
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleShareOrder = () => {
    const shareText = `🛍️ Ordered from Nvilar!\nOrder ID: ${orderData.orderId}\nTotal: ₹${orderData.total.toLocaleString('en-IN')}\nExpected Delivery: ${orderData.deliveryDate || 'Within 2-3 business days'}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Nvilar Order ${orderData.orderId}`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
      triggerToast('Order details copied to clipboard!');
    }
  };

  const handleDownloadInvoice = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentAddress(addressForm);
    setIsEditingAddress(false);
    triggerToast('Delivery address updated successfully');
  };

  const handleConfirmCancellation = (itemIndex: number) => {
    setCancelledItems((prev) => ({
      ...prev,
      [itemIndex]: {
        reason: selectedReason,
        cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    }));
    setActiveHelpItemIndex(null);
    setCancelStep('select-reason');
    triggerToast('Item cancelled successfully. Refund initiated.');
  };

  const items = liveOrder?.items || orderData.items || [];
  const totalMRP = liveOrder?.total_mrp || liveOrder?.mrp || orderData.mrp || items.reduce((acc: number, i: any) => acc + ((i.product?.originalPrice || (i.price_per_unit ? i.price_per_unit * 1.4 : (i.price ? i.price * 1.4 : 2000)))) * (i.quantity || 1), 0);
  const subtotal = liveOrder?.total_paid || liveOrder?.subtotal || orderData.subtotal || items.reduce((acc: number, i: any) => acc + (i.product?.price || i.price_per_unit || i.price || 1999) * (i.quantity || 1), 0);
  const totalDiscount = liveOrder?.total_savings || liveOrder?.discount || orderData.discount || Math.max(0, totalMRP - subtotal);
  const fees = liveOrder?.fees ?? orderData.fees ?? 59;
  const deliveryPin = (liveOrder?.shipping_address && liveOrder.shipping_address.delivery_pin) || liveOrder?.deliveryPin || orderData.deliveryPin || '4845';
  const courier = liveOrder?.tracking_provider || liveOrder?.courier || orderData.courier || 'Blue Dart Express Priority Air';
  const trackingNumber = liveOrder?.tracking_number || liveOrder?.trackingNumber || orderData.trackingNumber || 'BD-82530643IN';
  const deliveryDate = liveOrder?.deliveryDate || orderData.deliveryDate || 'Within 2-3 Business Days';

  // Live Seller Status Resolution (Dynamically updated when seller marks shipped)
  const sellerStatus = (liveOrder?.seller_status || liveOrder?.order_status || orderData.seller_status || 'new').toLowerCase();

  const isPackedDone = ['shipped', 'out_for_delivery', 'delivered'].includes(sellerStatus);
  const isPackedCurrent = ['new', 'accepted', 'packaging', 'processing'].includes(sellerStatus);

  const isShippedDone = ['out_for_delivery', 'delivered'].includes(sellerStatus);
  const isShippedCurrent = sellerStatus === 'shipped';

  const isOutForDeliveryDone = sellerStatus === 'delivered';
  const isOutForDeliveryCurrent = sellerStatus === 'out_for_delivery';

  const isDeliveredDone = sellerStatus === 'delivered';

  // Logistics Tracking Stages (Live Dynamic Sync)
  const trackingStages = [
    {
      id: 'received',
      title: 'Order Received & Confirmed',
      description: 'Order verified and forwarded to atelier partner.',
      time: liveOrder?.placed_at
        ? new Date(liveOrder.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : orderData.placedAt
        ? `Today, ${orderData.placedAt}`
        : 'Today, Just Now',
      status: 'completed' as const,
    },
    {
      id: 'packed',
      title: isPackedDone ? 'Order Packed & Quality Checked' : 'Order Packed & Quality Checked',
      description: isPackedDone
        ? '12-point fabric inspection and tamper-proof packaging completed.'
        : '12-point fabric inspection and tamper-proof packaging in progress.',
      time: isPackedDone
        ? (liveOrder?.accepted_at ? new Date(liveOrder.accepted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed')
        : 'In Progress • Est. Today 4:00 PM',
      status: isPackedDone ? ('completed' as const) : ('in-progress' as const),
    },
    {
      id: 'shipped',
      title: `Shipped via ${courier}`,
      description: `${courier} • AWB: ${trackingNumber}`,
      time: isShippedDone
        ? (liveOrder?.shipped_at ? new Date(liveOrder.shipped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed')
        : isShippedCurrent
        ? (liveOrder?.shipped_at ? `Shipped at ${new Date(liveOrder.shipped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'In Transit (On Schedule)')
        : 'Tomorrow Morning',
      status: isShippedDone ? ('completed' as const) : isShippedCurrent ? ('in-progress' as const) : ('upcoming' as const),
    },
    {
      id: 'out_for_delivery',
      title: 'Out for Delivery',
      description: isOutForDeliveryCurrent
        ? `Courier delivery partner is arriving with OTP verification in ${currentAddress.city || 'your area'}.`
        : 'Courier agent will arrive with OTP verification.',
      time: isOutForDeliveryDone || isOutForDeliveryCurrent ? 'Today' : deliveryDate,
      status: isOutForDeliveryDone ? ('completed' as const) : isOutForDeliveryCurrent ? ('in-progress' as const) : ('upcoming' as const),
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: isDeliveredDone
        ? `Package handed over at doorstep to ${currentAddress.fullName} in ${currentAddress.city || 'your address'}.`
        : `Delivery to ${currentAddress.city || 'your registered address'}.`,
      time: isDeliveredDone
        ? (liveOrder?.delivered_at ? new Date(liveOrder.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered')
        : deliveryDate,
      status: isDeliveredDone ? ('completed' as const) : ('upcoming' as const),
    },
  ];

  return (
    <div
      id="order-confirmation-modal"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW 1: CLEAN COMPACT CELEBRATION CARD (ZERO SCROLL NEEDED)
          ========================================================================= */}
      {viewMode === 'celebration' && (
        <motion.div
          key="celebration-view"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/90 my-0 sm:my-6 p-5 sm:p-7 flex flex-col items-center text-center"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Glowing Success Checkmark with Rings */}
          <div className="relative mt-2 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10"
            >
              <Check className="w-10 h-10 sm:w-11 sm:h-11 stroke-[3.2]" />
            </motion.div>
            <div className="absolute inset-0 -m-3 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
            <div className="absolute inset-0 -m-1.5 rounded-full bg-emerald-400/30 pointer-events-none" />
          </div>

          {/* Verification Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2.5">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified & Payment Confirmed
          </span>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight leading-tight">
            Order Placed Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Your payment is verified. The boutique has received your order and started packing.
          </p>

          {/* Compact Order Snapshot Card */}
          <div className="w-full mt-5 bg-neutral-50/90 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2.5 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-medium">Order Reference</span>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="font-mono font-black text-[#1246B8]">{orderData.orderId}</span>
                <button
                  onClick={handleCopyOrderId}
                  className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200/60">
              <div>
                <span className="text-neutral-500 text-[11px] block">Expected Arrival</span>
                <span className="font-bold text-neutral-900">{deliveryDate}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 text-[11px] block">Total Amount</span>
                <span className="font-black text-[#1246B8] font-mono text-sm">
                  ₹{orderData.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full mt-6 space-y-2.5">
            <button
              onClick={() => setViewMode('details')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1246B8] hover:bg-[#0f3b9e] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Order Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          VIEW 2: DEDICATED ORDER DETAILS (EACH PRODUCT IN ONE SINGLE BOUNDARY BOX)
          ========================================================================= */}
      {viewMode === 'details' && (
        <motion.div
          key="details-view"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full h-full sm:h-[90vh] sm:max-w-xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden sm:border border-neutral-200/80 flex flex-col"
        >
          {/* Top Header Bar */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('celebration')}
                className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 leading-tight">
                  Order Details
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">
                  {orderData.orderId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShareOrder}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer"
                title="Share Order"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Product Items List - Each Product is Self-Contained in a Single Boundary Box */}
          <div className="overflow-y-auto px-0 sm:px-5 py-4 space-y-4 flex-1">
            <div className="flex items-center justify-between px-4 sm:px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Items in this order ({items.length})
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                Tap arrow to view tracking
              </span>
            </div>

            {items.map((item: any, idx: number) => {
              const prod = item.product || {
                id: item.product_id || item.id || `item-${idx}`,
                name: item.name || item.product_name || 'Boutique Garment',
                price: item.price_per_unit || item.price || 1999,
                originalPrice: item.originalPrice || Math.round((item.price_per_unit || item.price || 1999) * 1.4),
                thumbnail: item.thumbnail || item.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
                brand: item.brand || item.shop_name || 'Boutique'
              };
              const itemId = `${prod.id || idx}-${idx}`;
              const isExpanded = expandedItemId === itemId || expandedItemId === null || expandedItemId === undefined || idx === 0;
              const isCancelled = !!cancelledItems[idx];
              const originalPrice = prod.originalPrice || Math.round(prod.price * 1.4);
              const discountPercent = Math.round(((originalPrice - prod.price) / originalPrice) * 100);

              return (
                <div
                  key={itemId}
                  className={`bg-white rounded-none sm:rounded-2xl border-y border-x-0 sm:border transition-all duration-200 overflow-hidden ${
                    isCancelled
                      ? 'border-rose-200 bg-rose-50/20'
                      : isExpanded
                      ? 'border-[#1246B8]/40 sm:ring-1 sm:ring-[#1246B8]/20'
                      : 'border-neutral-200/90 sm:hover:border-neutral-300'
                  }`}
                >
                  {/* Single Horizontal Boundary Card */}
                  <div className="p-3.5 sm:p-4">
                    <div className="flex items-center gap-3.5">
                      {/* Left: Square Product Thumbnail */}
                      <div
                        onClick={() => !isCancelled && onProductClick && onProductClick(prod)}
                        className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0 shadow-2xs cursor-pointer hover:scale-102 hover:opacity-95 transition-all duration-150`}
                        title="View full product details"
                      >
                        <Image
                          src={prod.thumbnail}
                          alt={prod.name}
                          fill
                          className={`object-cover object-center ${isCancelled ? 'grayscale opacity-75' : ''}`}
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shadow-xs">
                          Qty {item.quantity}
                        </span>
                      </div>

                      {/* Right: Product Details & Actions */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                        <div>
                          {/* Row 1: Title & Price */}
                          <div className="flex items-start justify-between gap-2.5">
                            <h5
                              onClick={() => !isCancelled && onProductClick && onProductClick(prod)}
                              className="text-sm sm:text-base font-extrabold text-neutral-950 tracking-tight leading-snug line-clamp-2 cursor-pointer hover:text-[#1246B8] transition-colors"
                              title="View full product details"
                            >
                              {prod.name}
                            </h5>
                            <span
                              className={`text-sm sm:text-base font-black font-mono tracking-tight whitespace-nowrap ${
                                isCancelled ? 'line-through text-neutral-400' : 'text-neutral-950'
                              }`}
                            >
                              ₹{(prod.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Row 2: Boutique & Status */}
                          <div className="flex items-center justify-between mt-1.5 text-xs">
                            {prod.shop ? (
                              <span className="text-neutral-600 font-medium truncate flex items-center gap-1">
                                Sold by: <strong className="text-neutral-900 font-bold">{prod.shop.name}</strong>
                              </span>
                            ) : (
                              <span className="text-neutral-500">Standard Delivery</span>
                            )}

                            {isCancelled ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Cancelled
                              </span>
                            ) : sellerStatus === 'shipped' ? (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1246B8] border border-blue-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Shipped
                              </span>
                            ) : sellerStatus === 'packaging' || sellerStatus === 'processing' ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Packaging
                              </span>
                            ) : sellerStatus === 'out_for_delivery' ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Out for Delivery
                              </span>
                            ) : sellerStatus === 'delivered' ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Delivered
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                Confirmed
                              </span>
                            )}
                          </div>

                          {/* Row 3: Size & Discount Badges */}
                          <div className="flex items-center gap-1.5 mt-2">
                            {item.size && (
                              <span className="text-[10px] font-bold bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-md border border-neutral-250">
                                Size: {item.size}
                              </span>
                            )}
                            {discountPercent > 0 && !isCancelled && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Row: Small Help Button & Arrow Expansion Button */}
                        <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-neutral-100">
                          {/* Small Help & Actions Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHelpItemIndex(idx);
                              setHelpActiveTab('summary');
                              setCancelStep('select-reason');
                            }}
                            className="inline-flex items-center gap-2 text-xs font-black text-[#1246B8] bg-blue-50/70 hover:bg-blue-100 border border-blue-200/50 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-95"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-[#1246B8]" />
                            <span>Help & Options</span>
                          </button>

                          {/* Arrow Sign Button to Expand Details */}
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : itemId)}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#1246B8] hover:text-[#0f3b9e] cursor-pointer py-1.5 px-3 rounded-xl hover:bg-blue-50/60 active:scale-95 transition-all"
                            title={isExpanded ? 'Collapse' : 'Expand tracking'}
                          >
                            <span>{isExpanded ? 'Hide' : 'Tracking'}</span>
                            <div className="w-5 h-5 rounded-full bg-blue-50 text-[#1246B8] flex items-center justify-center">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED SECTION (CONTAINED WITHIN THIS EXACT SAME BOUNDARY BOX) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="pt-3.5 mt-3 border-t border-neutral-150 space-y-3"
                        >
                          {isCancelled ? (
                            /* Cancelled State Card inside the Box */
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1.5 text-xs text-rose-900">
                              <div className="flex items-center gap-1.5 font-bold">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>Order Cancelled upon Request</span>
                              </div>
                              <p className="text-[11px] text-rose-800">
                                Reason: <strong>{cancelledItems[idx].reason}</strong>
                              </p>
                              <div className="text-[10px] text-rose-700 font-mono pt-1 border-t border-rose-200/80">
                                Refund of ₹{(prod.price * item.quantity).toLocaleString('en-IN')} initiated to original payment source (Est. 2-4 hrs).
                              </div>
                            </div>
                          ) : (
                            /* 5-Stage Live Timeline contained in the card */
                            <div className="bg-neutral-50/90 rounded-xl p-3.5 border border-neutral-200/80 space-y-2.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/60 text-[11px]">
                                <span className="font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-[#1246B8]" />
                                  Logistics Journey
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                                  On Schedule
                                </span>
                              </div>

                              <div className="relative pl-6 space-y-5 my-2">
                                {trackingStages.map((stage, sIdx) => {
                                  const isDone = stage.status === 'completed';
                                  const isCurrent = stage.status === 'in-progress';
                                  const isLast = sIdx === trackingStages.length - 1;

                                  return (
                                    <div key={stage.id} className="relative">
                                      {/* Premium Segment-Based Vertical Line */}
                                      {!isLast && (
                                        <div
                                          className={`absolute left-[-16.5px] top-[18px] bottom-[-22px] w-[2.5px] rounded-full transition-colors ${
                                            isDone ? 'bg-emerald-500' : 'bg-neutral-200'
                                          }`}
                                        />
                                      )}

                                      {/* Node Bullet Icon */}
                                      <div
                                        className={`absolute -left-[24px] top-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center transition-all z-10 ${
                                          isDone
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : isCurrent
                                            ? 'bg-[#1246B8] ring-3 ring-blue-100 animate-pulse text-white shadow-xs'
                                            : 'bg-neutral-300'
                                        }`}
                                      >
                                        {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                                      </div>

                                      {/* Stacked Vertical Info with Bracketed Lighter Date/Time */}
                                      <div className="flex flex-col gap-0.5 text-xs">
                                        <div className="flex flex-wrap items-baseline gap-1.5">
                                          <p
                                            className={`font-extrabold text-[13px] tracking-tight leading-snug ${
                                              isDone
                                                ? 'text-neutral-950'
                                                : isCurrent
                                                ? 'text-[#1246B8]'
                                                : 'text-neutral-400'
                                            }`}
                                          >
                                            {stage.title}
                                          </p>
                                          {stage.time && (
                                            <span className="text-[11px] font-normal text-neutral-400">
                                              [{stage.time}]
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed max-w-sm">
                                          {stage.description}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Compact Delivery PIN inside the Box */}
                              <div className="mt-2 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs bg-amber-50/70 p-2 rounded-lg border border-amber-200/70">
                                <div className="flex items-center gap-1.5 text-amber-900">
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                                  <span className="text-[11px] font-bold">Doorstep Delivery PIN:</span>
                                </div>
                                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-amber-300">
                                  <span className="font-mono text-xs font-black tracking-widest text-neutral-900">
                                    {deliveryPin}
                                  </span>
                                  <button
                                    onClick={handleCopyDeliveryPin}
                                    className="p-0.5 text-neutral-500 hover:text-neutral-800 cursor-pointer"
                                    title="Copy PIN"
                                  >
                                    {copiedPin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-t border-neutral-200/80 shadow-lg flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-[#1246B8] hover:bg-[#0f3b9e] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          INTERACTIVE HELP & OPTIONS MODAL (SUMMARY + ADDRESS + 24H CANCELLATION)
          ========================================================================= */}
      <AnimatePresence>
        {activeHelpItemIndex !== null && (
          <div
            id="order-help-modal"
            className="fixed inset-0 z-[100] bg-neutral-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[88vh] flex flex-col"
            >
              {/* Top Bar of Help Modal */}
              <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#1246B8] flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 leading-tight">
                      Order Support & Options
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Item: {items[activeHelpItemIndex]?.product?.name?.slice(0, 26)}...
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveHelpItemIndex(null);
                    setIsEditingAddress(false);
                    setCancelStep('select-reason');
                  }}
                  className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs inside Help Modal */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-100 border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setHelpActiveTab('summary')}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border text-xs font-black ${
                    helpActiveTab === 'summary'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/15'
                      : 'bg-white text-neutral-800 hover:text-neutral-900 border-neutral-200 shadow-3xs hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-xl mb-0.5">💰</span>
                  <span className="text-[11px] font-black tracking-tight block">Paisa Summary</span>
                  <span className={`text-[9px] font-medium block opacity-90 ${helpActiveTab === 'summary' ? 'text-emerald-100' : 'text-neutral-500'}`}>
                    Bill Details
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHelpActiveTab('address')}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border text-xs font-black ${
                    helpActiveTab === 'address'
                      ? 'bg-[#1246B8] text-white border-[#1246B8] shadow-md shadow-blue-600/15'
                      : 'bg-white text-neutral-800 hover:text-neutral-900 border-neutral-200 shadow-3xs hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-xl mb-0.5">📍</span>
                  <span className="text-[11px] font-black tracking-tight block">Address</span>
                  <span className={`text-[9px] font-medium block opacity-90 ${helpActiveTab === 'address' ? 'text-blue-100' : 'text-neutral-500'}`}>
                    Where to Deliver
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHelpActiveTab('cancel')}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center border relative text-xs font-black ${
                    helpActiveTab === 'cancel'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/15'
                      : 'bg-white text-rose-600 hover:text-rose-700 border-rose-200 shadow-3xs hover:bg-rose-50'
                  }`}
                >
                  <span className="text-xl mb-0.5">❌</span>
                  <span className="text-[11px] font-black tracking-tight block">Cancel Item</span>
                  <span className={`text-[9px] font-medium block opacity-90 ${helpActiveTab === 'cancel' ? 'text-rose-100' : 'text-neutral-500'}`}>
                    Stop Order
                  </span>
                  {isCancelWindowActive && !cancelledItems[activeHelpItemIndex] && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white animate-pulse" />
                  )}
                </button>
              </div>

              {/* TAB CONTENT AREA */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* 1. PAYMENT SUMMARY TAB */}
                {helpActiveTab === 'summary' && (
                  <div className="space-y-3.5">
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 text-xs font-black uppercase tracking-wider text-neutral-700">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-neutral-800" />
                          <span>Paisa Summary</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Paid via {orderData.paymentMethod.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-neutral-600 font-medium">
                          <span>Total MRP</span>
                          <span className="font-bold text-neutral-800 font-mono">₹{totalMRP.toLocaleString('en-IN')}</span>
                        </div>

                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span>Special Savings & Discount</span>
                            <span className="font-mono">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-neutral-600 font-medium">
                          <span>Delivery & Handling</span>
                          <span className="font-bold text-neutral-800 font-mono">₹{fees}</span>
                        </div>

                        <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-black text-neutral-950">
                          <span>Total Amount Paid</span>
                          <span className="text-base text-[#1246B8] font-mono">
                            ₹{orderData.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadInvoice}
                      className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-neutral-600" />
                      <span>Download Official Invoice PDF</span>
                    </button>
                  </div>
                )}

                {/* 2. DELIVERY ADDRESS TAB (WITH CHANGE ADDRESS ACTION) */}
                {helpActiveTab === 'address' && (
                  <div className="space-y-3.5">
                    {!isEditingAddress ? (
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                            <MapPin className="w-4 h-4 text-[#1246B8]" />
                            <span>Current Shipping Address</span>
                          </div>

                          <button
                            onClick={() => setIsEditingAddress(true)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1246B8] hover:underline cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Change Address</span>
                          </button>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="font-bold text-neutral-900 text-sm">{currentAddress.fullName}</p>
                          <p className="text-neutral-600 leading-relaxed">
                            {currentAddress.addressLine}, {currentAddress.city} — {currentAddress.pincode}
                          </p>
                          <p className="text-neutral-500 font-medium pt-1 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Phone: {currentAddress.phone}</span>
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                          <Truck className="w-3.5 h-3.5 text-[#1246B8] shrink-0 mt-0.5" />
                          <span>
                            You can modify your delivery address free of charge before the courier partner picks up your parcel.
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Address Editing Form */
                      <form onSubmit={handleSaveAddress} className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs">
                        <div className="font-black uppercase tracking-wider text-neutral-900 pb-1 border-b border-neutral-200 flex items-center justify-between">
                          <span>Update Shipping Address</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="text-neutral-400 hover:text-neutral-700 text-[11px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-700">Full Name</label>
                          <input
                            type="text"
                            required
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-700">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-700">Address Line / Street / Flat</label>
                          <input
                            type="text"
                            required
                            value={addressForm.addressLine}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-neutral-700">City</label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-neutral-700">Pincode</label>
                            <input
                              type="text"
                              required
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-[#1246B8] hover:bg-[#0f3b9e] text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                          >
                            Save New Address
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* 3. 24-HOUR CANCELLATION TAB */}
                {helpActiveTab === 'cancel' && (
                  <div className="space-y-3.5">
                    {cancelledItems[activeHelpItemIndex] ? (
                      /* Already Cancelled */
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
                        <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
                        <h5 className="text-sm font-black text-rose-900">Item Already Cancelled</h5>
                        <p className="text-xs text-rose-800">
                          Cancellation was recorded at {cancelledItems[activeHelpItemIndex].cancelledAt}. Full refund is in progress.
                        </p>
                      </div>
                    ) : !isCancelWindowActive ? (
                      /* 24-hour window elapsed */
                      <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 text-center space-y-2">
                        <AlertTriangle className="w-7 h-7 text-amber-600 mx-auto" />
                        <h5 className="text-sm font-black text-neutral-900">Cancellation Window Closed</h5>
                        <p className="text-xs text-neutral-600">
                          The 24-hour free cancellation window for this order has expired because the product is now handed over to the courier network.
                        </p>
                      </div>
                    ) : cancelStep === 'select-reason' ? (
                      /* Step 1: 5-6 Recommended Reasons */
                      <div className="space-y-3">
                        {/* 24h Live Timer Badge */}
                        <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>24-Hour Free Cancellation:</span>
                          </div>
                          <span className="font-mono font-black text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                            {formatCountdown(secondsRemaining)} left
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-neutral-800 block mb-2">
                            Select Reason for Cancellation
                          </label>
                          <div className="space-y-2">
                            {CANCELLATION_REASONS.map((reason) => (
                              <label
                                key={reason}
                                onClick={() => setSelectedReason(reason)}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                  selectedReason === reason
                                    ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-bold ring-1 ring-rose-200'
                                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="cancellation-reason"
                                  checked={selectedReason === reason}
                                  onChange={() => setSelectedReason(reason)}
                                  className="mt-0.5 accent-rose-600 cursor-pointer"
                                />
                                <span>{reason}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCancelStep('confirm')}
                          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Proceed to Cancel</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Step 2: Confirmation & Refund Details */
                      <div className="space-y-3.5">
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 text-rose-900 font-black text-sm">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Confirm Product Cancellation</span>
                          </div>
                          <p className="text-neutral-700">
                            You are cancelling <strong>{items[activeHelpItemIndex]?.product?.name}</strong>.
                          </p>
                          <div className="p-2.5 bg-white rounded-xl border border-rose-200 space-y-1">
                            <div className="flex justify-between text-neutral-600">
                              <span>Selected Reason:</span>
                              <strong className="text-neutral-900 text-right max-w-[200px] truncate">{selectedReason}</strong>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                              <span>Refund Amount:</span>
                              <strong className="text-emerald-700 font-mono">
                                ₹{(items[activeHelpItemIndex]?.product?.price * items[activeHelpItemIndex]?.quantity).toLocaleString('en-IN')}
                              </strong>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                              <span>Refund Destination:</span>
                              <strong className="text-neutral-900">Original Payment Method ({orderData.paymentMethod.toUpperCase()})</strong>
                            </div>
                          </div>
                          <p className="text-[11px] text-rose-800">
                            Once confirmed, this cannot be undone. Refund will be credited within 2-4 business hours.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setCancelStep('select-reason')}
                            className="py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            Back
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmCancellation(activeHelpItemIndex)}
                            className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-600/25 active:scale-98 transition-all cursor-pointer"
                          >
                            Confirm Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
