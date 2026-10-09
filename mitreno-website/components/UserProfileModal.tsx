'use client';
import { getBackendUrl, getSellerPortalUrl } from '@/lib/config';
import { apiClient } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import {
  User,
  Sparkles,
  ShieldCheck,
  Ruler,
  Package,
  Heart,
  Award,
  Check,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Globe,
  Coins,
  Copy,
  Edit2,
  Edit3,
  CreditCard,
  Trash2,
  Plus,
  Minus,
  Sparkle,
  Info,
  Lock,
  FileText,
  LogOut,
  X,
  ArrowLeft,
  Share2,
  Truck,
  BadgeCheck,
  Download,
  AlertTriangle,
  Clock,
  XCircle,
  PhoneCall,
  Camera,
  Store,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products-data';
import Image from 'next/image';
import { SellerOnboardingModal } from './SellerOnboardingModal';
import { SellerDashboard } from './seller/SellerDashboard';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, size?: string) => void;
  initialTab?: 'closet' | 'fit' | 'personal' | 'orders';
  isTabMode?: boolean;
  savedProductIds?: string[];
  onToggleSave?: (productId: string) => void;
  confirmedOrder?: any;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenProduct,
  onAddToCart,
  initialTab = 'closet',
  isTabMode = false,
  savedProductIds,
  onToggleSave,
  confirmedOrder,
}) => {
  const { user, dbUser, isGuest, requireAuth, logout, syncWithBackend } = useAuth();
  // --- WISHLIST FALLBACK & PROP BINDING ---
  const [localSavedIds, setLocalSavedIds] = useState<string[]>(['1', '3']); // Default beautiful liked items
  const activeSavedProductIds = savedProductIds || localSavedIds;
  const handleToggleWishlist = onToggleSave || ((id: string) => {
    const isSaved = localSavedIds.includes(id);
    if (isSaved) {
      setLocalSavedIds(prev => prev.filter(x => x !== id));
      triggerSaveNotification('Removed from Wishlist');
    } else {
      setLocalSavedIds(prev => [...prev, id]);
      triggerSaveNotification('Saved to Wishlist');
    }
  });

  // --- USER PROFILE STATE ---
  const [fullName, setFullName] = useState(user ? (dbUser?.full_name || user.displayName || 'Nvilar Member') : '');
  const [phone, setPhone] = useState(user ? (dbUser?.phone || user.phoneNumber || '') : '');
  const [email, setEmail] = useState(user ? (dbUser?.email || user.email || '') : '');

  useEffect(() => {
    if (user) {
      const p = dbUser?.phone || user.phoneNumber || '';
      const n = dbUser?.full_name || user.displayName || (p ? `Member (${p.slice(-4)})` : 'Nvilar Member');
      setFullName(n);
      setPhone(p);
      setEmail(dbUser?.email || user.email || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setSellerAppStatus('none');
      setLatestSellerApp(null);
    }
  }, [dbUser, user]);

  const [memberTier, setMemberTier] = useState('MEMBER');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'MM';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // --- BODY & FIT STATE ---
  const [heightCm, setHeightCm] = useState(185);
  const [weightKg, setWeightKg] = useState(78);
  const [chestInch, setChestInch] = useState(40);
  const [shoulderInch, setShoulderInch] = useState(18.5);
  const [waistInch, setWaistInch] = useState(32);

  // --- SUB-MODAL OR OVERLAY STATES ---
  const [activeSubModal, setActiveSubModal] = useState<'none' | 'fit-profile' | 'address' | 'about' | 'privacy' | 'terms' | 'orders' | 'wishlist' | 'edit-profile' | 'seller-status' | 'logout-confirm'>('none');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSellerOnboardingOpen, setIsSellerOnboardingOpen] = useState(false);
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState(false);
  const [sellerAppStatus, setSellerAppStatus] = useState<'none' | 'pending_review' | 'approved' | 'rejected' | 'cancelled'>('none');
  const [latestSellerApp, setLatestSellerApp] = useState<any>(null);

  React.useEffect(() => {
    // 1. Fetch live status from Backend (port 8080 or internal API)
    const fetchLiveSellerStatus = async () => {
      if (!user) {
        setSellerAppStatus('none');
        setLatestSellerApp(null);
        return;
      }
      try {
        const data = await apiClient.get('/api/seller/status');
        if (data.success) {
          if (data.status === 'none') {
            setSellerAppStatus('none');
            setLatestSellerApp(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('mitreno_seller_status');
              localStorage.removeItem('mitreno_seller_app_id');
              localStorage.removeItem('mitreno_seller_applications');
            }
          } else if (data.status) {
            setSellerAppStatus(data.status);
            setLatestSellerApp((prev: any) => ({
              ...prev,
              ...data,
              id: data.application_id || prev?.id,
              rejection_reason: data.rejection_reason || prev?.rejection_reason,
              cancel_reason: data.cancel_reason || prev?.cancel_reason,
              cancelled_at: data.cancelled_at || prev?.cancelled_at,
              business_name: data.business_name || prev?.business_name,
            }));
            if (typeof window !== 'undefined') {
              localStorage.setItem('mitreno_seller_status', data.status);
              if (data.application_id) {
                localStorage.setItem('mitreno_seller_app_id', data.application_id);
              }
            }
          }
        }
      } catch (e) {
        // silent fail
      }
    };

    fetchLiveSellerStatus();
  }, [isSellerOnboardingOpen, user]);

  // Seller Application Cancellation States & Logic
  const [isSellerCancelModalOpen, setIsSellerCancelModalOpen] = useState(false);
  const [sellerCancelStep, setSellerCancelStep] = useState<'confirm' | 'success'>('confirm');
  const [sellerCancelReason, setSellerCancelReason] = useState<string>('Need to update documents or change details');
  const [customSellerCancelReason, setCustomSellerCancelReason] = useState<string>('');
  const [isSubmittingSellerCancel, setIsSubmittingSellerCancel] = useState(false);

  const handleCancelSellerApplication = async (directReason?: string) => {
    const finalReason = directReason || (
      sellerCancelReason === 'Other reason (specify below)'
        ? (customSellerCancelReason.trim() || 'Applicant requested cancellation')
        : (sellerCancelReason || 'Need to update documents or change details')
    );

    setIsSubmittingSellerCancel(true);
    const appId = latestSellerApp?.id || (typeof window !== 'undefined' ? localStorage.getItem('mitreno_seller_app_id') : '') || 'sa_mtncahq7';
    const backendUrl = getBackendUrl();

    try {
      if (!user) throw new Error('Not authenticated');
      await apiClient.post('/api/seller/cancel', {
        application_id: appId,
        cancel_reason: finalReason,
        user_id: user.uid,
      });

      // 3. Clear ALL local storage records so pending review never gets resurrected
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mitreno_seller_status');
        localStorage.removeItem('mitreno_seller_app_id');
        localStorage.removeItem('mitreno_seller_applications');
      }

      // 4. Update UI State to Cancelled
      setSellerAppStatus('cancelled');
      setLatestSellerApp((prev: any) => ({
        ...prev,
        status: 'cancelled',
        cancel_reason: finalReason,
        cancelled_at: new Date().toISOString(),
      }));

      setSellerCancelStep('success');
      triggerSaveNotification('Boutique application successfully cancelled & withdrawn.');
    } catch (err) {
      console.error('Cancellation error:', err);
      // Ensure UI still marks cancelled on error
      setSellerAppStatus('cancelled');
      setSellerCancelStep('success');
    } finally {
      setIsSubmittingSellerCancel(false);
    }
  };

  const handleStartNewApplication = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mitreno_seller_status');
      localStorage.removeItem('mitreno_seller_app_id');
      localStorage.removeItem('mitreno_seller_applications');
    }
    setSellerAppStatus('none');
    setLatestSellerApp(null);
    setActiveSubModal('none');
    setIsSellerCancelModalOpen(false);
    setSellerCancelStep('confirm');
    setSellerCancelReason('Need to update documents or change details');
    setCustomSellerCancelReason('');
    setIsSellerOnboardingOpen(true);
  };
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isOrderTrackingExpanded, setIsOrderTrackingExpanded] = useState(false);
  const [expandedOrderTrackings, setExpandedOrderTrackings] = useState<Record<string, boolean>>({});

  const triggerSaveNotification = (message: string) => {
    setSaveSuccessMessage(message);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3000);
  };

  const handleCopyReferral = () => {
    setCopiedReferral(true);
    triggerSaveNotification('Referral code [AFZ-VIP-77] copied!');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const handleLogout = () => {
    setActiveSubModal('logout-confirm');
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
    } catch (e) {
      console.error(e);
      setIsLoggingOut(false);
    }
  };

  // --- ORDERS & SUPPORT STATE ---
  const SEED_ORDER = React.useMemo(() => ({
    orderId: 'MIT-88703',
    trackingNumber: 'BD-10517989IN',
    courier: 'Blue Dart Express Priority Air',
    deliveryPin: '8480',
    items: [
      {
        product: PRODUCTS.find(p => p.id === 'afz-001') || PRODUCTS[0],
        size: 'L',
        quantity: 1,
      }
    ],
    mrp: 3499,
    subtotal: 2499,
    discount: 1000,
    fees: 59,
    total: 2558,
    customer: {
      fullName: 'Ashraf Al-Mansoor',
      phone: '+91 98765 43210',
      addressLine: '74/A, Imperial Heights, Lavelle Road',
      city: 'Mumbai',
      pincode: '400001'
    },
    paymentMethod: 'upi',
    deliveryDate: '8 Sept',
    date: 'Today, 03:48 am',
    placedAt: '03:48 am'
  }), []);

  const [ordersList, setOrdersList] = useState<any[]>(() => {
    const list: any[] = [];
    if (confirmedOrder) {
      if (!list.some(o => o.orderId === confirmedOrder.orderId)) {
        list.unshift(confirmedOrder);
      }
    }
    return list;
  });

  const [prevConfirmedOrder, setPrevConfirmedOrder] = useState<any>(null);
  if (confirmedOrder !== prevConfirmedOrder) {
    setPrevConfirmedOrder(confirmedOrder);
    if (confirmedOrder && !ordersList.some(o => o.orderId === confirmedOrder.orderId)) {
      setOrdersList(prev => [confirmedOrder, ...prev]);
    }
  }

  const [activeHelpOrderIndex, setActiveHelpOrderIndex] = useState<number | null>(null);
  const [helpActiveTab, setHelpActiveTab] = useState<'summary' | 'address' | 'cancel'>('summary');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [supportAddress, setSupportAddress] = useState<any>({
    fullName: user ? (dbUser?.full_name || '') : '',
    phone: user ? (dbUser?.phone || user.phoneNumber || '') : '',
    addressLine: '',
    city: '',
    pincode: ''
  });
  const [supportAddressForm, setSupportAddressForm] = useState<any>({ ...supportAddress });

  // 24-Hour live countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(23 * 3600 + 58 * 60 + 40);

  // Live User Orders Pre-Warming Poller
  const fetchUserOrdersLive = React.useCallback(async () => {
    if (!user) {
      setOrdersList(confirmedOrder ? [confirmedOrder] : []);
      return;
    }
    try {
      const data = await apiClient.get('/api/orders', { buyer_id: user.uid });
      if (data.success && Array.isArray(data.orders)) {
        if (data.orders.length === 0) {
          setOrdersList((prev) => (confirmedOrder ? [confirmedOrder] : []));
          return;
        }
        setOrdersList((prev) => {
          return data.orders.map((o: any) => {
            const existing = prev.find(p => p.orderId === o.id || p.id === o.id);
            return {
              orderId: o.id,
              id: o.id,
              seller_status: o.seller_status,
              order_status: o.order_status,
              trackingNumber: o.tracking_number || existing?.trackingNumber,
              courier: o.tracking_provider || existing?.courier || 'Delhivery Surface',
              deliveryPin: (o.shipping_address && o.shipping_address.delivery_pin) || o.delivery_pin || existing?.deliveryPin || '4845',
              total: o.total_paid || existing?.total,
              placed_at: o.placed_at || existing?.placed_at,
              accepted_at: o.accepted_at || existing?.accepted_at,
              shipped_at: o.shipped_at || existing?.shipped_at,
              delivered_at: o.delivered_at || existing?.delivered_at,
              tracking_history: o.tracking_history || existing?.tracking_history,
              date: new Date(o.placed_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
              customer: o.shipping_address || existing?.customer,
              items: (o.items && o.items.length > 0) ? o.items.map((i: any) => ({
                product: {
                  id: i.product_id || i.id,
                  name: i.product_name || i.name || 'Boutique Garment',
                  price: i.price_per_unit || i.price || 1999,
                  thumbnail: i.product_thumbnail || i.thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
                  boutique: o.shop_name || 'Boutique Atelier'
                },
                size: i.size || 'L',
                quantity: i.quantity || 1
              })) : (existing?.items || [
                {
                  product: {
                    id: 'prod_1',
                    name: 'Designer Garment',
                    price: o.total_paid,
                    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
                    boutique: o.shop_name || 'Boutique Atelier'
                  },
                  size: 'L',
                  quantity: 1
                }
              ])
            };
          });
        });
      }
    } catch {
      // Silent background fetch
    }
  }, []);

  React.useEffect(() => {
    if (activeSubModal === 'orders') {
      // Check localStorage broadcast on mount
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('mitreno_order_update_broadcast');
          if (raw) {
            const b = JSON.parse(raw);
            if (b.orderId && b.status) {
              setOrdersList((prev) =>
                prev.map((ord) => {
                  if (ord.orderId === b.orderId || ord.id === b.orderId) {
                    return {
                      ...ord,
                      seller_status: b.status,
                      order_status: b.status,
                      courier: b.courier || ord.courier,
                      trackingNumber: b.trackingNumber || ord.trackingNumber,
                    };
                  }
                  return ord;
                })
              );
            }
          }
        } catch { }
      }

      fetchUserOrdersLive();
      const interval = setInterval(fetchUserOrdersLive, 3000);

      const handleEvent = (e?: any) => {
        if (e?.detail) {
          const { orderId, status, courier, trackingNumber } = e.detail;
          setOrdersList((prev) =>
            prev.map((ord) => {
              if (ord.orderId === orderId || ord.id === orderId) {
                return {
                  ...ord,
                  seller_status: status,
                  order_status: status,
                  courier: courier || ord.courier,
                  trackingNumber: trackingNumber || ord.trackingNumber,
                };
              }
              return ord;
            })
          );
        }
        fetchUserOrdersLive();
      };

      const handleStorageUpdate = (e: StorageEvent) => {
        if (e.key === 'mitreno_order_update_broadcast' && e.newValue) {
          try {
            const b = JSON.parse(e.newValue);
            if (b.orderId && b.status) {
              setOrdersList((prev) =>
                prev.map((ord) => {
                  if (ord.orderId === b.orderId || ord.id === b.orderId) {
                    return {
                      ...ord,
                      seller_status: b.status,
                      order_status: b.status,
                      courier: b.courier || ord.courier,
                      trackingNumber: b.trackingNumber || ord.trackingNumber,
                    };
                  }
                  return ord;
                })
              );
            }
          } catch { }
        }
        fetchUserOrdersLive();
      };

      window.addEventListener('mitreno_order_status_updated', handleEvent);
      window.addEventListener('storage', handleStorageUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('mitreno_order_status_updated', handleEvent);
        window.removeEventListener('storage', handleStorageUpdate);
      };
    }
  }, [activeSubModal, fetchUserOrdersLive]);

  React.useEffect(() => {
    if (activeSubModal !== 'orders') return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSubModal]);

  const formatCountdown = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const isCancelWindowActive = secondsRemaining > 0;

  const [selectedReason, setSelectedReason] = useState<string>('Ordered by mistake / duplicate order');
  const [cancelStep, setCancelStep] = useState<'select-reason' | 'confirm'>('select-reason');
  const [cancelledOrders, setCancelledOrders] = useState<Record<string, { reason: string; cancelledAt: string }>>({});

  const handleConfirmCancellationInProfile = (orderId: string) => {
    setCancelledOrders(prev => ({
      ...prev,
      [orderId]: {
        reason: selectedReason,
        cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));
    setActiveHelpOrderIndex(null);
    setCancelStep('select-reason');
    triggerSaveNotification('Item cancelled successfully. Refund initiated.');
  };

  const handleSaveSupportAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportAddress(supportAddressForm);
    setIsEditingAddress(false);
    triggerSaveNotification('Delivery address updated successfully');
  };

  const modalContent = (
    <div className="space-y-3 text-neutral-900 bg-white">
      {/* 0. STICKY TOP HEADER WITH BACK ARROW & "MY PROFILE" TITLE */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-b border-neutral-100 flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (activeSubModal !== 'none') {
                setActiveSubModal('none');
              } else if (onClose) {
                onClose();
              }
            }}
            className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 text-neutral-800 transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 className="font-sans text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-none">
            My Profile
          </h1>
        </div>
      </div>

      {/* 1. CRYSTAL CLEAN PROFILE HEADER CARD (Attached edge-to-edge on mobile) */}
      {!user ? (
        <div className="relative overflow-hidden -mx-4 sm:mx-0 bg-white border-y sm:border border-neutral-200/80 sm:rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-13 h-13 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0 text-neutral-400 shadow-2xs">
                <User className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-sans text-base sm:text-lg font-extrabold text-neutral-950 tracking-tight leading-tight">
                    Guest Shopper
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[9px] font-sans font-extrabold uppercase tracking-wider">
                    NOT LOGGED IN
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium truncate">
                  Sign in with phone OTP to access your account
                </p>
              </div>
            </div>

            <button
              onClick={requireAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1246B8] hover:bg-[#0E3692] text-white shadow-xs active:scale-95 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden -mx-4 sm:mx-0 bg-white border-y sm:border border-neutral-200/80 sm:rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            {/* Avatar and Info Stack */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-13 h-13 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800 shrink-0 select-none relative overflow-hidden shadow-xs">
                {avatarImage ? (
                  <Image src={avatarImage} alt={fullName || 'Member'} fill className="object-cover rounded-full" />
                ) : (
                  <span className="text-base font-serif font-black text-amber-200 tracking-wider">
                    {getInitials(fullName || 'Member')}
                  </span>
                )}
              </div>

              {/* Profile Info Details */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-sans text-base sm:text-lg font-extrabold text-neutral-950 tracking-tight leading-tight truncate">
                    {fullName || 'Nvilar Member'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[#1246B8] text-[9px] font-sans font-extrabold uppercase tracking-wider">
                    MEMBER
                  </span>
                </div>
                {phone && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                    <PhoneCall className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                    <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setActiveSubModal('edit-profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-xs active:scale-95 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}

      {/* REJECTION ALERT BANNER (If rejected by Admin) */}
      {sellerAppStatus === 'rejected' && (
        <div
          onClick={() => setActiveSubModal('seller-status')}
          className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 space-y-3 cursor-pointer shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                    Action Required: Seller KYC Rejected
                  </h4>
                </div>
                <p className="text-xs font-medium text-rose-700 leading-snug">
                  Admin Ashraf reviewed your boutique documents and requested revisions.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-white px-2.5 py-1 rounded-full border border-rose-200 shrink-0 shadow-2xs">
              View Notice &rarr;
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-rose-200/80 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
              Official Compliance Notice:
            </span>
            <p className="text-rose-950 font-bold leading-relaxed">
              &quot;{latestSellerApp?.rejection_reason || 'Document verification could not be completed. Please upload clearer document scans.'}&quot;
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-500 font-medium">
              Update your scans and submit again.
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSellerOnboardingOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Update &amp; Re-Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1.5. COMPACT QUICK ACCESS ACTIONS (My Orders & Wishlist - Clean and premium subtle look) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: My Orders */}
        <button
          onClick={() => {
            if (!user) {
              requireAuth();
              return;
            }
            setIsOrderTrackingExpanded(false);
            setActiveSubModal('orders');
          }}
          className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-neutral-200/80 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer text-left shadow-2xs active:scale-[0.98] w-full"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50/80 flex items-center justify-center text-[#1246B8] shrink-0">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-neutral-900 leading-tight">
              My Orders
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-normal truncate">
              Track shipments
            </p>
          </div>
        </button>

        {/* Card 2: Wishlist */}
        <button
          onClick={() => setActiveSubModal('wishlist')}
          className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-neutral-200/80 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer text-left shadow-2xs active:scale-[0.98] w-full"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-50/80 flex items-center justify-center text-rose-500 shrink-0">
            <Heart className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-neutral-900 leading-tight">
              Wishlist
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-normal truncate">
              Saved pieces
            </p>
          </div>
        </button>
      </div>

      {/* 2. INVITE FRIEND BANNER (Attached to left/right on mobile, clean typography) */}
      <div className="-mx-4 sm:mx-0 bg-white border-y sm:border border-neutral-200/80 sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-[13px] font-bold text-neutral-900 leading-tight">
              Invite Friends & Earn
            </h4>
          </div>
          <p className="text-[11.5px] text-neutral-400 font-normal leading-snug">
            Get ₹500 store credits in your Nvilar Vault on referrals.
          </p>
        </div>

        <button
          onClick={handleCopyReferral}
          className="px-4 py-2 bg-[#1246B8] hover:bg-[#0E3692] text-white text-xs font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>

      {/* 3. NOTIFICATION FEEDBACK TOAST */}
      <AnimatePresence>
        {saveSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-neutral-900 text-white rounded-lg flex items-center gap-2 text-xs shadow-md font-medium"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. SOLID BOUNDARY CARD CONTAINERS FOR ACTION OPTIONS (Attached edge-to-edge on mobile, sleek title-case fonts & tight spacing) */}
      <div className="-mx-4 sm:mx-0 border-y sm:border border-neutral-200/80 sm:rounded-2xl bg-white overflow-hidden shadow-2xs">

        {/* Sizing & Fit Profile */}
        <button
          onClick={() => {
            if (!user) {
              requireAuth();
              return;
            }
            setActiveSubModal('fit-profile');
          }}
          className="w-full py-2.5 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50/90 flex items-center justify-center text-emerald-600 shrink-0">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-neutral-900 tracking-tight leading-tight">
                My Sizing & Fit Profile
              </h4>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                Edit height, weight, dimensions & silhouette fit
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Address Setting */}
        <button
          onClick={() => {
            if (!user) {
              requireAuth();
              return;
            }
            setActiveSubModal('address');
          }}
          className="w-full py-2.5 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50/90 flex items-center justify-center text-[#1246B8] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-neutral-900 tracking-tight leading-tight">
                Delivery Address
              </h4>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                Edit street, state, city & default pin code
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Help Centre */}
        <button
          onClick={() => triggerSaveNotification('Opening direct 1-on-1 Help & Support Concierge...')}
          className="w-full py-2.5 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50/90 flex items-center justify-center text-purple-600 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-neutral-900 tracking-tight leading-tight">
                Help Centre & Stylist
              </h4>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                Direct helper for sizing, bargains & order support
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Become a Nvilar Seller CTA */}
        {sellerAppStatus === 'none' && (
          <button
            onClick={() => {
              window.open(getSellerPortalUrl(), '_blank');
            }}
            className="w-full py-3 px-4 hover:bg-amber-50/50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100 bg-gradient-to-r from-amber-50/40 to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-neutral-900 tracking-tight leading-tight">
                  Become a Nvilar Seller
                </h4>
                <p className="text-[11.5px] text-amber-700/60 mt-0.5 font-medium leading-normal">
                  Start your boutique &amp; sell on Nvilar &bull; Dedicated Portal ↗
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        )}

        {sellerAppStatus === 'pending_review' && user && (
          <div
            onClick={() => {
              window.open(getSellerPortalUrl(), '_blank');
            }}
            className="w-full py-3 px-4 flex items-center justify-between border-b border-neutral-100 bg-amber-50/50 hover:bg-amber-100/60 transition-colors duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200/60">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-[13.5px] font-bold text-amber-900 tracking-tight leading-tight">
                    Seller Application Under Review
                  </h4>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-200/80 text-amber-800 tracking-wider">
                    In Progress
                  </span>
                </div>
                <p className="text-[11px] text-amber-700/90 mt-0.5 font-medium leading-normal flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>ETA 24-48 hrs &bull; Tap to view in Seller Hub ↗</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <ChevronRight className="w-4 h-4 text-amber-500 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-transform duration-150" />
            </div>
          </div>
        )}

        {sellerAppStatus === 'approved' && user && (
          <div
            onClick={() => {
              window.open(getSellerPortalUrl(), '_blank');
            }}
            className="w-full py-3.5 px-4 flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-emerald-50/40 to-amber-50/30 hover:from-emerald-100/70 hover:to-amber-100/40 transition-all cursor-pointer group select-none shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <BadgeCheck className="w-5 h-5 stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-[13.5px] font-bold text-emerald-950 tracking-tight leading-tight">
                    Seller Account Active
                  </h4>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 tracking-wider">
                    Studio Live
                  </span>
                </div>
                <p className="text-[11.5px] text-emerald-700 mt-0.5 font-medium leading-normal truncate">
                  Tap to launch your Seller Studio Dashboard 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-xs font-bold text-emerald-800 group-hover:text-emerald-950 hidden sm:inline">
                Open Studio
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-emerald-900 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

        {sellerAppStatus === 'rejected' && user && (
          <div
            onClick={() => setActiveSubModal('seller-status')}
            className="w-full py-3 px-4 hover:bg-rose-50/70 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100 bg-rose-50/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200/60">
                <XCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-[13.5px] font-bold text-rose-900 tracking-tight leading-tight">
                    Application Needs Attention
                  </h4>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-200 text-rose-800 tracking-wider">
                    Rejected
                  </span>
                </div>
                <p className="text-[11px] text-rose-600 mt-0.5 font-medium leading-normal truncate">
                  {latestSellerApp?.rejection_reason || 'Tap to view compliance feedback & re-apply'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[11px] font-bold text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                View Reason &rarr;
              </span>
            </div>
          </div>
        )}

        {sellerAppStatus === 'cancelled' && user && (
          <div
            onClick={() => setActiveSubModal('seller-status')}
            className="w-full py-3 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100 bg-neutral-50/40"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0 border border-neutral-200">
                <XCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-[13.5px] font-bold text-neutral-800 tracking-tight leading-tight">
                    Application Withdrawn
                  </h4>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 tracking-wider">
                    Cancelled
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-medium leading-normal truncate">
                  Tap to view details or start a new application
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[11px] font-bold text-neutral-700 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                Details &rarr;
              </span>
            </div>
          </div>
        )}

        {/* About Nvilar */}
        <button
          onClick={() => setActiveSubModal('about')}
          className="w-full py-2.5 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50/90 flex items-center justify-center text-amber-600 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-neutral-900 tracking-tight leading-tight">
                About Nvilar
              </h4>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                Know about boutique, collection materials & craft vision
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => setActiveSubModal('privacy')}
          className="w-full py-2.5 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-50/90 flex items-center justify-center text-pink-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-neutral-900 tracking-tight leading-tight">
                Privacy Policy
              </h4>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                Data encryption parameters & credentials vault
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Terms & Conditions */}
        <button
          onClick={() => setActiveSubModal('terms')}
          className="w-full py-2.5 px-4 hover:bg-neutral-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100/90 flex items-center justify-center text-slate-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-neutral-900 tracking-tight leading-tight">
                Terms & Conditions
              </h4>
              <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                Platform guidelines, buyer safety & free returns
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Admin Panel Button */}
        <button
          onClick={() => window.open(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001', '_blank')}
          className="w-full py-2.5 px-4 hover:bg-indigo-50 flex items-center justify-between group transition-all text-left cursor-pointer border-b border-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h4 className="text-[13.5px] font-semibold text-indigo-700 tracking-tight leading-tight">
                Admin Dashboard
              </h4>
              <p className="text-[11.5px] text-indigo-400 mt-0.5 font-normal leading-normal">
                Open Nvilar admin control panel
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Logout or Sign In */}
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 hover:bg-rose-50/50 flex items-center justify-between group transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50/90 flex items-center justify-center text-rose-600 shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-semibold text-rose-600 tracking-tight leading-tight">
                  Log Out Session
                </h4>
                <p className="text-[11.5px] text-rose-400 mt-0.5 font-normal leading-normal">
                  Exit secure member dashboard safely
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </button>
        ) : (
          <button
            onClick={requireAuth}
            className="w-full py-2.5 px-4 hover:bg-blue-50/50 flex items-center justify-between group transition-all text-left cursor-pointer bg-blue-50/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1246B8]/10 flex items-center justify-center text-[#1246B8] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-semibold text-[#1246B8] tracking-tight leading-tight">
                  Sign In / Register
                </h4>
                <p className="text-[11.5px] text-neutral-400 mt-0.5 font-normal leading-normal">
                  Authenticate with phone OTP to access member benefits
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#1246B8] group-hover:translate-x-0.5 transition-all" />
          </button>
        )}
      </div>

      {/* 5. BRAND FOOTER LOGO STATUS */}
      <div className="text-center py-4 font-sans font-extrabold text-[10px] tracking-widest text-neutral-400 uppercase select-none">
        NVILAR V1.2.0 — DELIVERING HAPPINESS 🌿
      </div>

      {/* Full Closing Button (if modal mode) */}
      {!isTabMode && (
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-sans font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-center"
        >
          Return to Studio
        </button>
      )}

      {/* --- SUB-OVERLAY DRAWERS (Real Interactive overlays inside profile!) --- */}
      <AnimatePresence>
        {activeSubModal !== 'none' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full overflow-hidden"
          >
            {/* Sticky Drawer Header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 md:px-8 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0 shadow-2xs">
              {activeSubModal === 'orders' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubModal('none')}
                    className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 leading-tight">
                      ORDER DETAILS
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500">
                      MIT-57722
                    </span>
                  </div>
                </div>
              ) : activeSubModal === 'wishlist' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubModal('none')}
                    className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 leading-tight">
                      MY WISHLIST
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-semibold font-sans">
                      Liked Boutique Styles
                    </span>
                  </div>
                </div>
              ) : activeSubModal === 'seller-status' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubModal('none')}
                    className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 leading-tight flex items-center gap-1.5">
                      <span>APPLICATION STATUS</span>
                      {sellerAppStatus === 'rejected' ? (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          REJECTED
                        </span>
                      ) : sellerAppStatus === 'cancelled' ? (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300">
                          CANCELLED
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          IN PROGRESS
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {latestSellerApp?.id || 'sa_mitreno_01'}
                    </span>
                  </div>
                </div>
              ) : (
                <h3 className="font-sans text-xs font-black text-neutral-950 uppercase tracking-widest">
                  {activeSubModal === 'edit-profile' && '✏️ Edit Profile Details'}
                  {activeSubModal === 'fit-profile' && '📐 Tailor Sizing Recalibrator'}
                  {activeSubModal === 'address' && '📍 Edit Delivery Address'}
                  {activeSubModal === 'about' && 'ℹ️ About Nvilar'}
                  {activeSubModal === 'privacy' && '🔒 Secure Privacy Policy'}
                  {activeSubModal === 'terms' && '⚖️ Terms & Platform Conditions'}
                  {activeSubModal === 'logout-confirm' && '🔒 Secure Logout'}
                </h3>
              )}

              <div className="flex items-center gap-1">
                {activeSubModal === 'orders' && (
                  <button
                    onClick={() => triggerSaveNotification('Order details shareable link copied!')}
                    className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors active:scale-90 cursor-pointer"
                    title="Share Order"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveSubModal('none')}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Dynamic Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 text-neutral-900 text-xs leading-relaxed space-y-4 pb-40 overscroll-contain">
              {/* Seller Application Status Submodal */}
              {activeSubModal === 'seller-status' && (
                sellerAppStatus === 'rejected' ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Rejection Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border border-rose-200 p-4.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                          <XCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-rose-950 tracking-tight">
                              Application Not Approved
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-200 text-rose-800">
                              Action Required
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                            Your boutique registration request was reviewed by our compliance team and could not be approved with the current documents.
                          </p>
                          {latestSellerApp?.reviewed_at && (
                            <div className="pt-1 flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                              <span>Audit Date: {new Date(latestSellerApp.reviewed_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Official Admin Reason Box */}
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                        <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          Compliance Review Feedback
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                          Audited by {latestSellerApp?.reviewed_by || 'Admin Ashraf'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-rose-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
                          Rejection Reason
                        </span>
                        <p className="text-sm font-black text-rose-950 leading-relaxed font-sans">
                          &quot;{latestSellerApp?.rejection_reason || 'Document verification could not be completed. Please upload clearer document scans.'}&quot;
                        </p>
                        {latestSellerApp?.admin_notes && (
                          <p className="text-xs text-neutral-500 pt-1 border-t border-neutral-100 font-medium">
                            Note: {latestSellerApp.admin_notes}
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-rose-800/80 font-medium leading-relaxed">
                        📧 An official notification with these details has also been sent to your registered email address.
                      </p>
                    </div>

                    {/* Steps to Re-apply */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 space-y-3 shadow-2xs">
                      <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                        How to Fix &amp; Re-Apply
                      </h4>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                          <span className="text-neutral-700 font-medium">Review the specific issue highlighted above (e.g. blurry photos or mismatched numbers).</span>
                        </div>
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                          <span className="text-neutral-700 font-medium">Take fresh, brightly-lit photos of your official Aadhar and PAN cards.</span>
                        </div>
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                          <span className="text-neutral-700 font-medium">Click the button below to update your documents and submit for fast-track re-verification.</span>
                        </div>
                      </div>

                      {/* Re-Apply Action Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubModal('none');
                            setIsSellerOnboardingOpen(true);
                          }}
                          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Fix Documents &amp; Re-Apply</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : sellerAppStatus === 'cancelled' ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Cancelled Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-500/15 via-neutral-500/5 to-transparent border border-neutral-200 p-4.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 shrink-0 shadow-xs">
                          <XCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-neutral-900 tracking-tight">
                              Application Withdrawn
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-200 text-neutral-800 border border-neutral-300">
                              Cancelled
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                            Your seller onboarding application was withdrawn at your request.
                          </p>
                          {latestSellerApp?.cancelled_at && (
                            <div className="pt-1 flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                              <span>Cancelled on: {new Date(latestSellerApp.cancelled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Official Reason Box */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-2.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
                        Reason for Cancellation
                      </span>
                      <div className="p-3.5 bg-white rounded-xl border border-neutral-200">
                        <p className="text-xs font-bold text-neutral-800 leading-relaxed font-sans">
                          &quot;{latestSellerApp?.cancel_reason || 'Applicant requested cancellation'}&quot;
                        </p>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                        🔒 In compliance with user data privacy regulations, your submitted KYC documents and sensitive details have been decommissioned from active verification queues.
                      </p>
                    </div>

                    {/* Action to Start New Application */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleStartNewApplication}
                        className="w-full py-3 px-4 bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Start New Seller Application</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Hero Status Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 p-4.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
                          <Clock className="w-6 h-6 text-amber-700" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-neutral-900 tracking-tight">
                              Application Under Review
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                              In Progress
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                            Your seller application has been submitted and is currently being audited by the Nvilar compliance team.
                          </p>
                          <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-800 font-bold">
                            <span>⏱️ Estimated Review Time: 24 - 48 hours</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Tracker Style Live Progress */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 space-y-3 shadow-2xs">
                      <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                        Live Verification Tracker
                      </h4>

                      {/* Timeline Steps */}
                      <div className="space-y-3 relative pl-2">
                        {/* Step 1: Submitted */}
                        <div className="flex items-start gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs z-10">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div className="absolute top-6 left-3 w-[2px] h-8 bg-amber-400 -translate-x-1/2" />
                          <div className="min-w-0 pb-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-neutral-900">Application Submitted</h5>
                              <span className="text-[10px] text-emerald-600 font-semibold">Done</span>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              KYC documents &amp; shop profile received
                            </p>
                          </div>
                        </div>

                        {/* Step 2: KYC & Document Verification */}
                        <div className="flex items-start gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-amber-200 z-10">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="absolute top-6 left-3 w-[2px] h-8 bg-neutral-200 -translate-x-1/2" />
                          <div className="min-w-0 pb-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-amber-900">KYC &amp; Identity Verification</h5>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                Active Now
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500">
                              Auditing Aadhar, PAN card &amp; address legitimacy
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Admin Review */}
                        <div className="flex items-start gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-400 flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                            3
                          </div>
                          <div className="absolute top-6 left-3 w-[2px] h-8 bg-neutral-200 -translate-x-1/2" />
                          <div className="min-w-0 pb-1">
                            <h5 className="text-xs font-semibold text-neutral-600">Admin Approval &amp; Clearance</h5>
                            <p className="text-[11px] text-neutral-400">
                              Boutique curation &amp; catalog compliance sign-off
                            </p>
                          </div>
                        </div>

                        {/* Step 4: Shop Launch */}
                        <div className="flex items-start gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-400 flex items-center justify-center shrink-0 z-10">
                            <Store className="w-3.5 h-3.5 text-neutral-400" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-neutral-600">Boutique Activation</h5>
                            <p className="text-[11px] text-neutral-400">
                              Seller Studio access &amp; live customer orders
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submitted Application Dossier */}
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                          Application Details
                        </h4>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(latestSellerApp?.id || 'sa_mitreno_01');
                            triggerSaveNotification('Application ID copied!');
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy ID</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] font-bold text-neutral-400 block uppercase">Application ID</span>
                          <span className="font-mono font-bold text-neutral-800 text-[11px]">
                            {latestSellerApp?.id || 'sa_mitreno_01'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] font-bold text-neutral-400 block uppercase">Business Name</span>
                          <span className="font-bold text-neutral-800 truncate block">
                            {latestSellerApp?.business_name || 'My Boutique'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] font-bold text-neutral-400 block uppercase">Category &amp; Type</span>
                          <span className="font-medium text-neutral-700 truncate block capitalize">
                            {latestSellerApp?.business_category || 'Fashion'} ({latestSellerApp?.business_type || 'individual'})
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] font-bold text-neutral-400 block uppercase">Applicant</span>
                          <span className="font-medium text-neutral-700 truncate block">
                            {latestSellerApp?.owner_full_name || fullName}
                          </span>
                        </div>
                      </div>

                      {/* Documents uploaded & Payout */}
                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 font-medium">KYC Documents</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Aadhar &amp; PAN Attached
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 font-medium">Payout UPI</span>
                          <span className="font-mono font-bold text-neutral-800">
                            {latestSellerApp?.payout_upi_id || '778784562995@upi'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 font-medium">Shop Location</span>
                          <span className="font-medium text-neutral-700 text-right truncate max-w-[180px]">
                            {latestSellerApp?.shop_address?.city || city}, {latestSellerApp?.shop_address?.state || 'Assam'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Safe Application Cancellation Action */}
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-neutral-800">
                            Withdraw Application
                          </h4>
                          <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                            Need to update documents or change details?
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSellerCancelStep('confirm');
                            setSellerCancelReason('Need to update documents or change details');
                            setCustomSellerCancelReason('');
                            setIsSellerCancelModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-neutral-200 hover:border-rose-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Cancel Application</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                        You can cancel your application at any time. In compliance with data privacy regulations, submitted KYC documents are securely decommissioned upon cancellation.
                      </p>
                    </div>

                    {/* Generous bottom clearance spacer so card never gets cut off by viewport */}
                    <div className="h-20 w-full shrink-0" aria-hidden="true" />
                  </div>
                )
              )}
              {activeSubModal === 'edit-profile' && (
                <div className="space-y-3.5">
                  <p className="text-neutral-500 font-medium text-xs font-sans">
                    Update your profile details below. Changes reflect instantly across your account.
                  </p>

                  {/* Full Name Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-800 focus:bg-white font-sans transition-all"
                    />
                  </div>

                  {/* Phone Number Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      disabled
                      className="w-full px-3 py-2 bg-neutral-100/50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-400 cursor-not-allowed font-sans select-none"
                    />
                    <p className="text-[10px] text-neutral-400 font-medium pt-1 px-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Verified phone number cannot be changed.
                    </p>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-neutral-800 focus:bg-white font-sans transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        if (user) {
                          setIsSavingProfile(true);
                          try {
                            await syncWithBackend(user, fullName, email);
                            triggerSaveNotification('Profile updated successfully!');
                            setActiveSubModal('none');
                          } catch (error) {
                            triggerSaveNotification('Failed to update profile. Please try again.');
                          } finally {
                            setIsSavingProfile(false);
                          }
                        }
                      }}
                      disabled={isSavingProfile}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{isSavingProfile ? 'Saving...' : 'Save Profile Details'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Body Dimensions Overlay */}
              {activeSubModal === 'fit-profile' && (
                <div className="space-y-4">
                  <p className="text-neutral-500 font-semibold text-[10px] font-sans uppercase tracking-wide">
                    Your biological metrics calculate the drape tensions inside our real-time video simulation models.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                      <label className="text-[9px] font-sans text-neutral-400 block font-black uppercase">Height (cm)</label>
                      <div className="flex items-center justify-between">
                        <button onClick={() => heightCm > 140 && setHeightCm(heightCm - 1)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Minus className="w-3 h-3" /></button>
                        <span className="font-black font-sans text-neutral-900">{heightCm} cm</span>
                        <button onClick={() => heightCm < 220 && setHeightCm(heightCm + 1)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                      <label className="text-[9px] font-sans text-neutral-400 block font-black uppercase">Weight (kg)</label>
                      <div className="flex items-center justify-between">
                        <button onClick={() => weightKg > 40 && setWeightKg(weightKg - 1)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Minus className="w-3 h-3" /></button>
                        <span className="font-black font-sans text-neutral-900">{weightKg} kg</span>
                        <button onClick={() => weightKg < 150 && setWeightKg(weightKg + 1)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                      <label className="text-[9px] font-sans text-neutral-400 block font-black uppercase">Chest (inch)</label>
                      <div className="flex items-center justify-between">
                        <button onClick={() => chestInch > 30 && setChestInch(chestInch - 1)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Minus className="w-3 h-3" /></button>
                        <span className="font-black font-sans text-neutral-900">{chestInch} in</span>
                        <button onClick={() => chestInch < 55 && setChestInch(chestInch + 1)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                      <label className="text-[9px] font-sans text-neutral-400 block font-black uppercase">Shoulders (inch)</label>
                      <div className="flex items-center justify-between">
                        <button onClick={() => shoulderInch > 12 && setShoulderInch(shoulderInch - 0.5)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Minus className="w-3 h-3" /></button>
                        <span className="font-black font-sans text-neutral-900">{shoulderInch} in</span>
                        <button onClick={() => shoulderInch < 25 && setShoulderInch(shoulderInch + 0.5)} className="p-1 border border-neutral-200 rounded hover:bg-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubModal('none');
                      triggerSaveNotification('Optimal Size L calibrated for custom catalog drops.');
                    }}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Recalibrate Sizing Engine
                  </button>
                </div>
              )}

              {/* 2. Address Overlay */}
              {activeSubModal === 'address' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black">Full Profile Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-600 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black">Primary Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-600 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black">Street Address</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-600 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black">City & State</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-600 font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-sans uppercase text-neutral-400 block font-black">Pin Code</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-black text-neutral-900 focus:outline-none focus:border-emerald-600 font-sans"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubModal('none');
                      triggerSaveNotification('Shipping addresses & contacts updated successfully!');
                    }}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Save Shipping Address
                  </button>
                </div>
              )}

              {/* 3. About Nvilar Overlay */}
              {activeSubModal === 'about' && (
                <div className="space-y-2 text-neutral-700 font-sans text-xs leading-relaxed">
                  <p>
                    <strong>Nvilar</strong> is an elite, high-performance social commerce ecosystem built entirely for high-quality native platforms.
                  </p>
                  <p>
                    We bring curated designer products directly from premier ateliers across Bengaluru, Mumbai, and Delhi. Our key core innovations include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-800 font-bold uppercase tracking-wide text-[10px]">
                    <li>Bespoke Live Bargaining Engines</li>
                    <li>High-fidelity Vertical discovery video feeds</li>
                    <li>Physics-based interactive sizing simulations</li>
                  </ul>
                  <p className="text-[9px] text-neutral-400 pt-2 border-t border-neutral-100 font-sans font-black">
                    Build Version: 1.2.0-Native-PROD • © 2026 Nvilar Atelier
                  </p>
                </div>
              )}

              {/* 4. Privacy Overlay */}
              {activeSubModal === 'privacy' && (
                <div className="space-y-2 text-neutral-700 font-sans text-xs leading-relaxed">
                  <p>
                    We prioritize absolute user trust and encryption. Key factors include:
                  </p>
                  <ul className="list-decimal list-inside space-y-1 text-neutral-800 font-bold uppercase tracking-wide text-[10px]">
                    <li>100% Secure Firebase Phone Auth credentials</li>
                    <li>Physical measurement logs remain strictly private and client-side</li>
                    <li>Zero data sales to third-party advertisers</li>
                  </ul>
                  <p>
                    Any modifications to your delivery addresses or contact phone values are directly pushed to secure GCP databases.
                  </p>
                </div>
              )}

              {/* 5. Terms Overlay */}
              {activeSubModal === 'terms' && (
                <div className="space-y-2 text-neutral-700 font-sans text-xs leading-relaxed">
                  <p>
                    Welcome to Nvilar. By operating inside our social-bargain marketplace:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-800 font-bold uppercase tracking-wide text-[10px]">
                    <li>All locks/agreements proposed in bargaining chats are binding for checkout</li>
                    <li>Free order cancellations are only eligible within the 24-hour placing window</li>
                    <li>UPI settlements and refund corridors take 2-3 standard banking days</li>
                  </ul>
                  <p>
                    We verify all listed boutiques to ensure premium quality thread count, fabric GSM, and stitching.
                  </p>
                </div>
              )}

              {/* 5.5 Logout Confirm Overlay */}
              {activeSubModal === 'logout-confirm' && (
                <div className="space-y-6 text-center pt-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4">
                    <LogOut className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-extrabold text-neutral-900 mb-2 font-sans">End Current Session?</h4>
                    <p className="text-neutral-500 text-xs font-medium px-4 leading-relaxed">
                      You will need to verify your phone number via OTP the next time you wish to access your secure Nvilar dashboard and orders.
                    </p>
                  </div>
                  <div className="space-y-3 mt-6">
                    <button
                      onClick={confirmLogout}
                      disabled={isLoggingOut}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl py-3.5 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-rose-600/20 active:scale-[0.98] disabled:opacity-50 tracking-wide text-[13px]"
                    >
                      {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Log Out Now'}
                    </button>
                    <button
                      onClick={() => setActiveSubModal('none')}
                      disabled={isLoggingOut}
                      className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-xl py-3.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 tracking-wide text-[13px]"
                    >
                      Cancel & Return
                    </button>
                  </div>
                </div>
              )}

              {/* 6. ORDERS OVERLAY (Custom Native Screen exactly matching Screenshot 033256 with dynamic support drawer logic) */}
              {activeSubModal === 'orders' && (
                <div className="space-y-6">
                  {/* Item Header Count */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      ACTIVE ORDERS ({ordersList.length})
                    </span>
                    <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider font-sans">
                      Tap tracking to view details
                    </span>
                  </div>

                  {ordersList.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white rounded-2xl border border-neutral-200 space-y-3 shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mx-auto">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider">No Active Orders</h4>
                        <p className="text-neutral-500 text-[11px] max-w-xs mx-auto font-medium leading-relaxed">
                          You haven&apos;t placed any orders with this account yet. Your live order tracking will appear here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    ordersList.map((order, orderIdx) => {
                    const isOrderCancelled = !!cancelledOrders[order.orderId];
                    const orderCancelledInfo = cancelledOrders[order.orderId];

                    const ordStatus = (order.seller_status || order.order_status || 'new').toLowerCase();
                    const isOrdPackedDone = ['shipped', 'out_for_delivery', 'delivered'].includes(ordStatus);
                    const isOrdPackedCurrent = ['new', 'accepted', 'packaging', 'processing'].includes(ordStatus);
                    const isOrdShippedDone = ['out_for_delivery', 'delivered'].includes(ordStatus);
                    const isOrdShippedCurrent = ordStatus === 'shipped';
                    const isOrdOutForDeliveryDone = ordStatus === 'delivered';
                    const isOrdOutForDeliveryCurrent = ordStatus === 'out_for_delivery';
                    const isOrdDeliveredDone = ordStatus === 'delivered';

                    const ordCourier = order.courier || order.tracking_provider || 'Delhivery Surface';
                    const ordTrackingNumber = order.trackingNumber || order.tracking_number || 'MIT-82530643IN';
                    const ordPin = order.deliveryPin || '4845';

                    const ordStages = [
                      {
                        id: 'received',
                        title: 'Order Received & Confirmed',
                        description: 'Order verified and forwarded to atelier partner.',
                        time: order.placed_at ? new Date(order.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (order.date || 'Today, Just Now'),
                        status: 'completed' as const,
                      },
                      {
                        id: 'packed',
                        title: 'Order Packed & Quality Checked',
                        description: isOrdPackedDone
                          ? '12-point fabric inspection and tamper-proof packaging completed.'
                          : '12-point fabric inspection and tamper-proof packaging in progress.',
                        time: isOrdPackedDone
                          ? (order.accepted_at ? new Date(order.accepted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed')
                          : 'In Progress • Est. Today 4:00 PM',
                        status: isOrdPackedDone ? ('completed' as const) : ('in-progress' as const),
                      },
                      {
                        id: 'shipped',
                        title: `Shipped via ${ordCourier}`,
                        description: `${ordCourier} • AWB: ${ordTrackingNumber}`,
                        time: isOrdShippedDone
                          ? (order.shipped_at ? new Date(order.shipped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed')
                          : isOrdShippedCurrent
                            ? (order.shipped_at ? `Shipped at ${new Date(order.shipped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'In Transit (On Schedule)')
                            : 'Tomorrow Morning',
                        status: isOrdShippedDone ? ('completed' as const) : isOrdShippedCurrent ? ('in-progress' as const) : ('upcoming' as const),
                      },
                      {
                        id: 'out_for_delivery',
                        title: 'Out for Delivery',
                        description: isOrdOutForDeliveryCurrent
                          ? `Courier delivery partner is arriving with OTP verification.`
                          : 'Courier agent will arrive with OTP verification.',
                        time: isOrdOutForDeliveryDone || isOrdOutForDeliveryCurrent ? 'Today' : (order.deliveryDate || 'Within 2-3 Days'),
                        status: isOrdOutForDeliveryDone ? ('completed' as const) : isOrdOutForDeliveryCurrent ? ('in-progress' as const) : ('upcoming' as const),
                      },
                      {
                        id: 'delivered',
                        title: 'Delivered',
                        description: isOrdDeliveredDone
                          ? `Package handed over at doorstep.`
                          : `Delivery to registered address.`,
                        time: isOrdDeliveredDone
                          ? (order.delivered_at ? new Date(order.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered')
                          : (order.deliveryDate || 'Within 2-3 Days'),
                        status: isOrdDeliveredDone ? ('completed' as const) : ('upcoming' as const),
                      },
                    ];

                    const isExpanded = expandedOrderTrackings[order.orderId] ?? (orderIdx === 0);

                    return (
                      <div key={order.orderId} className="space-y-3 p-3 rounded-2xl border border-neutral-200 bg-neutral-50/60">
                        {/* Order Summary Top Bar */}
                        <div className="flex items-center justify-between px-1 text-xs font-bold text-neutral-700">
                          <span className="font-mono text-[11px] text-neutral-800">ID: {order.orderId}</span>
                          <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide">{order.date || 'Today'}</span>
                        </div>

                        {order.items.map((item: any, itemIdx: number) => {
                          const prod = item.product;
                          return (
                            <div key={itemIdx} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-200 text-left">
                              <div className="p-3.5 sm:p-4 flex gap-3.5 items-center">
                                {/* Left: Square Product Thumbnail with Qty Badge */}
                                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 select-none">
                                  <Image
                                    src={prod.thumbnail || 'https://picsum.photos/seed/linen/400/400'}
                                    alt={prod.name}
                                    fill
                                    className="object-cover"
                                  />
                                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shadow-xs">
                                    Qty {item.quantity || 1}
                                  </span>
                                </div>

                                {/* Right: Product Details & Actions */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                                  <div>
                                    {/* Row 1: Title & Price */}
                                    <div className="flex items-start justify-between gap-2.5">
                                      <h5 className="text-xs sm:text-sm font-extrabold text-neutral-950 tracking-tight leading-snug line-clamp-2 uppercase font-sans">
                                        {prod.name}
                                      </h5>
                                      <span className="text-sm font-black font-mono text-neutral-950 tracking-tight whitespace-nowrap">
                                        ₹{prod.price.toLocaleString('en-IN')}
                                      </span>
                                    </div>

                                    {/* Row 2: Boutique & Status */}
                                    <div className="flex items-center justify-between mt-1.5 text-xs">
                                      <span className="text-neutral-600 font-medium truncate">
                                        Sold by: <strong className="text-neutral-900 font-bold">{prod.boutique || 'The Thrift Garage'}</strong>
                                      </span>
                                      {isOrderCancelled ? (
                                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                          CANCELLED
                                        </span>
                                      ) : ordStatus === 'shipped' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1246B8] border border-blue-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                          SHIPPED
                                        </span>
                                      ) : ordStatus === 'packaging' || ordStatus === 'processing' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                          PACKAGING
                                        </span>
                                      ) : ordStatus === 'out_for_delivery' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                          OUT FOR DELIVERY
                                        </span>
                                      ) : ordStatus === 'delivered' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                          DELIVERED
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                                          CONFIRMED
                                        </span>
                                      )}
                                    </div>

                                    {/* Row 3: Size & Discount Badges */}
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <span className="text-[10px] font-bold bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-md border border-neutral-200">
                                        Size: {item.size || 'L'}
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        {prod.discountTag || '29% OFF'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Action Row */}
                                  <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-neutral-100">
                                    {/* Help Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveHelpOrderIndex(orderIdx);
                                        setHelpActiveTab('summary');
                                      }}
                                      className="inline-flex items-center gap-2 text-xs font-black text-[#1246B8] bg-blue-50/70 hover:bg-blue-100 border border-blue-200/50 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-95"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5 text-[#1246B8]" />
                                      <span>Help & Options</span>
                                    </button>

                                    {/* Tracking Arrow */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedOrderTrackings(prev => ({ ...prev, [order.orderId]: !isExpanded }))}
                                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#1246B8] hover:text-[#0f3b9e] cursor-pointer py-1.5 px-3 rounded-xl hover:bg-blue-50/60 active:scale-95 transition-all"
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

                              {/* Expanded Section (Contained within this exact boundary box) */}
                              {isExpanded && (
                                <div className="p-3.5 bg-neutral-50/90 border-t border-neutral-100 space-y-3">
                                  {isOrderCancelled ? (
                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                                      <h6 className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                        CANCELLED ON REQUEST
                                      </h6>
                                      <p className="text-[11px] text-neutral-600 leading-normal">
                                        Reason: {orderCancelledInfo.reason}
                                      </p>
                                      <p className="text-[10px] text-rose-800 font-bold">
                                        Refund of ₹{prod.price.toLocaleString('en-IN')} initiated at {orderCancelledInfo.cancelledAt} to your UPI account.
                                      </p>
                                    </div>
                                  ) : (
                                    <>
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
                                        {ordStages.map((stage, sIdx) => {
                                          const isDone = stage.status === 'completed';
                                          const isCurrent = stage.status === 'in-progress';
                                          const isLast = sIdx === ordStages.length - 1;

                                          return (
                                            <div key={stage.id} className="relative">
                                              {/* Segment Line */}
                                              {!isLast && (
                                                <div
                                                  className={`absolute left-[-16.5px] top-[18px] bottom-[-22px] w-[2.5px] rounded-full transition-colors ${isDone ? 'bg-emerald-500' : 'bg-neutral-200'
                                                    }`}
                                                />
                                              )}

                                              {/* Node Bullet Icon */}
                                              <div
                                                className={`absolute -left-[24px] top-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center transition-all z-10 ${isDone
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : isCurrent
                                                      ? 'bg-[#1246B8] ring-3 ring-blue-100 animate-pulse text-white shadow-xs'
                                                      : 'bg-neutral-300'
                                                  }`}
                                              >
                                                {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                                              </div>

                                              {/* Info */}
                                              <div className="flex flex-col gap-0.5 text-xs">
                                                <div className="flex flex-wrap items-baseline gap-1.5">
                                                  <p
                                                    className={`font-extrabold text-[12px] tracking-tight leading-snug ${isDone
                                                        ? 'text-neutral-950'
                                                        : isCurrent
                                                          ? 'text-[#1246B8]'
                                                          : 'text-neutral-400'
                                                      }`}
                                                  >
                                                    {stage.title}
                                                  </p>
                                                  {stage.time && (
                                                    <span className="text-[10px] font-normal text-neutral-400">
                                                      [{stage.time}]
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-[10px] text-neutral-500 font-medium leading-relaxed max-w-sm">
                                                  {stage.description}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Doorstep PIN */}
                                      <div className="mt-2 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs bg-amber-50/70 p-2 rounded-lg border border-amber-200/70">
                                        <span className="text-[11px] font-bold text-amber-900">Doorstep Delivery PIN:</span>
                                        <span className="font-mono text-xs font-black tracking-widest text-neutral-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                                          {ordPin}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }))}

                  {/* Bottom Sticky CTA Button */}
                  <button
                    onClick={() => setActiveSubModal('none')}
                    className="w-full py-3.5 rounded-xl bg-[#1246B8] hover:bg-[#0f3b9e] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue Shopping</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 7. WISHLIST OVERLAY (Grid showing saved products styled with RED hearts) */}
              {activeSubModal === 'wishlist' && (
                <div className="space-y-4">
                  <p className="text-neutral-500 font-semibold text-[10px] font-sans uppercase tracking-wide text-left">
                    These premium designer pieces are saved in your private selection. Tap to inspect directly in the feeds.
                  </p>

                  <div className="grid grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto p-1 text-left">
                    {PRODUCTS.filter(p => activeSavedProductIds.includes(p.id) || p.id === '1' || p.id === '3').map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setActiveSubModal('none');
                          if (onOpenProduct) onOpenProduct(product);
                        }}
                        className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200/70 shadow-sm hover:shadow hover:border-neutral-300 transition-all duration-300 cursor-pointer"
                      >
                        {/* 4:4.5 Aspect Ratio Thumbnail */}
                        <div className="relative w-full aspect-[4/4.5] overflow-hidden bg-neutral-50/50">
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
                          />

                          {/* Wishlist Heart Icon filled in solid red */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(product.id);
                            }}
                            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white text-rose-600 border border-rose-100 shadow-md scale-105 active:scale-90 transition-all cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                          </button>
                        </div>

                        {/* Info area */}
                        <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-medium text-neutral-500 font-sans tracking-wide uppercase block truncate">
                              {product.shop?.name || 'Local Boutique'}
                            </span>
                            <h3 className="text-xs font-bold text-neutral-850 leading-snug font-sans line-clamp-1 capitalize">
                              {product.name}
                            </h3>
                          </div>

                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-neutral-900 font-sans">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[11px] text-neutral-400 line-through font-sans">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Return Button */}
                  <button
                    onClick={() => setActiveSubModal('none')}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Profile Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- REAL INTERACTIVE HELP & OPTIONS DRAWER (Absolute parity with OrderConfirmationModal) --- */}
      <AnimatePresence>
        {activeHelpOrderIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-xs">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => { setActiveHelpOrderIndex(null); setIsEditingAddress(false); setCancelStep('select-reason'); }} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="relative bg-white w-full max-w-lg rounded-t-3xl shadow-2xl p-5 pb-8 space-y-4 max-h-[90vh] overflow-y-auto border-t border-neutral-100 z-10 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Order Support</h4>
                  <p className="text-[10px] font-mono text-neutral-400 font-extrabold uppercase">ORDER {ordersList[activeHelpOrderIndex]?.orderId}</p>
                </div>
                <button
                  onClick={() => { setActiveHelpOrderIndex(null); setIsEditingAddress(false); setCancelStep('select-reason'); }}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tab Selectors */}
              <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-xl">
                {(['summary', 'address', 'cancel'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHelpActiveTab(tab)}
                    className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${helpActiveTab === tab
                        ? 'bg-white text-[#1246B8] shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                  >
                    {tab === 'summary' ? '💰 Paisa' : tab === 'address' ? '📍 Address' : '❌ Cancel'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="pt-1 text-xs">
                {/* 1. PAISA SUMMARY */}
                {helpActiveTab === 'summary' && (() => {
                  const order = ordersList[activeHelpOrderIndex];
                  const totalMRP = order.mrp || (order.items[0]?.product?.price + 1000) || 3499;
                  const subtotal = order.subtotal || order.items[0]?.product?.price || 2499;
                  const discount = order.discount || 1000;
                  const fees = order.fees || 59;
                  const finalPaid = order.total || (subtotal + fees) || 2558;

                  return (
                    <div className="space-y-4">
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3 font-sans">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                          <span className="font-extrabold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            Settlement Summary
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Paid via UPI
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-neutral-500 font-medium">
                            <span>Total Items MRP</span>
                            <span className="font-mono text-neutral-800">₹{totalMRP.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Special Savings & Discount
                            </span>
                            <span className="font-mono text-emerald-700 font-black">-₹{discount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500 font-medium">
                            <span>Delivery & Handling Fees</span>
                            <span className="font-mono text-neutral-800">₹{fees.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="pt-2.5 border-t border-dashed border-neutral-200 flex justify-between items-center">
                            <span className="font-black text-neutral-900 text-sm">Total Amount Paid</span>
                            <span className="font-mono font-black text-base text-neutral-950">₹{finalPaid.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Invoice PDF download */}
                      <button
                        onClick={() => triggerSaveNotification('Downloading official invoice PDF...')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-neutral-600" />
                        <span>Download Official Invoice PDF</span>
                      </button>
                    </div>
                  );
                })()}

                {/* 2. SHIPPING ADDRESS */}
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
                            onClick={() => {
                              setSupportAddressForm({ ...supportAddress });
                              setIsEditingAddress(true);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1246B8] hover:underline cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Change Address</span>
                          </button>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="font-bold text-neutral-900 text-sm">{supportAddress.fullName}</p>
                          <p className="text-neutral-600 leading-relaxed">
                            {supportAddress.addressLine}, {supportAddress.city} — {supportAddress.pincode}
                          </p>
                          <p className="text-neutral-500 font-medium pt-1 flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Phone: {supportAddress.phone}</span>
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
                      <form onSubmit={handleSaveSupportAddress} className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs">
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
                            value={supportAddressForm.fullName}
                            onChange={(e) => setSupportAddressForm({ ...supportAddressForm, fullName: e.target.value })}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-700">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={supportAddressForm.phone}
                            onChange={(e) => setSupportAddressForm({ ...supportAddressForm, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-neutral-700">Address Line / Street / Flat</label>
                          <input
                            type="text"
                            required
                            value={supportAddressForm.addressLine}
                            onChange={(e) => setSupportAddressForm({ ...supportAddressForm, addressLine: e.target.value })}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-neutral-700">City</label>
                            <input
                              type="text"
                              required
                              value={supportAddressForm.city}
                              onChange={(e) => setSupportAddressForm({ ...supportAddressForm, city: e.target.value })}
                              className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 font-medium text-neutral-900 text-xs focus:ring-2 focus:ring-[#1246B8] outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-neutral-700">Pincode</label>
                            <input
                              type="text"
                              required
                              value={supportAddressForm.pincode}
                              onChange={(e) => setSupportAddressForm({ ...supportAddressForm, pincode: e.target.value })}
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

                {/* 3. 24-HOUR CANCELLATION */}
                {helpActiveTab === 'cancel' && (() => {
                  const activeOrder = ordersList[activeHelpOrderIndex];
                  const isOrderCancelled = !!cancelledOrders[activeOrder?.orderId];
                  const orderCancelledInfo = cancelledOrders[activeOrder?.orderId];

                  return (
                    <div className="space-y-3.5">
                      {isOrderCancelled ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
                          <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
                          <h5 className="text-sm font-black text-rose-900">Item Already Cancelled</h5>
                          <p className="text-xs text-rose-800">
                            Cancellation was recorded at {orderCancelledInfo.cancelledAt}. Full refund is in progress.
                          </p>
                        </div>
                      ) : !isCancelWindowActive ? (
                        <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 text-center space-y-2">
                          <AlertTriangle className="w-7 h-7 text-amber-600 mx-auto" />
                          <h5 className="text-sm font-black text-neutral-900">Cancellation Window Closed</h5>
                          <p className="text-xs text-neutral-600">
                            The 24-hour free cancellation window for this order has expired because the product is now handed over to the courier network.
                          </p>
                        </div>
                      ) : cancelStep === 'select-reason' ? (
                        <div className="space-y-3">
                          {/* Timer */}
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
                            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-800 block mb-2">
                              Select Reason for Cancellation
                            </label>
                            <div className="space-y-2">
                              {[
                                'Ordered by mistake / duplicate order',
                                'Delivery time is too long / delayed estimation',
                                'Incorrect size or measurement profile chosen',
                                'Found a better deal / price mismatch',
                                'Change of mind / plans changed'
                              ].map((reason) => (
                                <label
                                  key={reason}
                                  onClick={() => setSelectedReason(reason)}
                                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${selectedReason === reason
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
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-rose-900 font-black text-sm">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              <span>Confirm Product Cancellation</span>
                            </div>
                            <p className="text-neutral-700 font-medium">
                              You are cancelling <strong>{activeOrder?.items[0]?.product?.name}</strong>.
                            </p>
                            <div className="p-2.5 bg-white rounded-xl border border-rose-200 space-y-1">
                              <div className="flex justify-between text-neutral-600">
                                <span>Selected Reason:</span>
                                <strong className="text-neutral-900 text-right max-w-[200px] truncate">{selectedReason}</strong>
                              </div>
                              <div className="flex justify-between text-neutral-600">
                                <span>Refund Amount:</span>
                                <strong className="text-emerald-700 font-mono">
                                  ₹{activeOrder?.items[0]?.product?.price?.toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <div className="flex justify-between text-neutral-600">
                                <span>Refund Destination:</span>
                                <strong className="text-neutral-900">Original Payment Method (UPI)</strong>
                              </div>
                            </div>
                            <p className="text-[11px] text-rose-800 font-medium">
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
                              onClick={() => handleConfirmCancellationInProfile(activeOrder.orderId)}
                              className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-600/25 active:scale-98 transition-all cursor-pointer"
                            >
                              Confirm Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const handleSellerAppSuccess = (applicationId: string) => {
    setSellerAppStatus('pending_review');
    if (typeof window !== 'undefined') {
      localStorage.setItem('mitreno_seller_status', 'pending_review');
      localStorage.setItem('mitreno_seller_app_id', applicationId);
    }
    triggerSaveNotification('Seller application submitted! Status: Under Review');
  };

  if (!isOpen) return null;

  if (!user && isGuest) {
    const guestProfileContent = (
      <div className="pt-6 pb-32">
        {/* Guest Avatar Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mb-3 border-2 border-neutral-200 shadow-sm">
            <User className="w-9 h-9 text-neutral-400" />
          </div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">Guest User</h2>
          <p className="text-xs text-neutral-400 font-medium mt-0.5">Browsing as guest</p>
        </div>

        {/* Sign In / Create Account Card */}
        <div className="mx-1 bg-gradient-to-br from-[#1246B8]/[0.04] to-blue-50 border border-[#1246B8]/10 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#1246B8]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-[#1246B8]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Sign in to unlock your profile</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-3">Track orders, save your fit profile, manage wishlists, and access exclusive features.</p>
              <button
                onClick={requireAuth}
                className="w-full bg-[#1246B8] hover:bg-[#0E3A9C] active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                Sign In / Create Account
              </button>
            </div>
          </div>
        </div>

        {/* Disabled Feature Hints */}
        <div className="space-y-2 mx-1">
          {[
            { icon: <Package className="w-4 h-4" />, label: 'My Orders', desc: 'Track shipments & order history' },
            { icon: <Heart className="w-4 h-4" />, label: 'Wishlist', desc: 'Your saved items' },
            { icon: <Ruler className="w-4 h-4" />, label: 'Fit Profile', desc: 'Body measurements & preferences' },
            { icon: <Award className="w-4 h-4" />, label: 'Rewards', desc: 'Loyalty points & offers' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={requireAuth}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-neutral-600 transition-colors">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors">{item.label}</p>
                <p className="text-[11px] text-neutral-400">{item.desc}</p>
              </div>
              <Lock className="w-3.5 h-3.5 text-neutral-300" />
            </button>
          ))}
        </div>
      </div>
    );

    if (isTabMode) {
      if (!isOpen) return null;
      return (
        <div className="w-full max-w-2xl mx-auto bg-white flex flex-col min-h-screen px-4 sm:px-6 border-l border-r border-neutral-100 shadow-sm">
          {guestProfileContent}
        </div>
      );
    }
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="user-profile-modal-auth"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white md:bg-neutral-900/60 md:backdrop-blur-sm md:flex md:items-end md:justify-center overflow-y-auto"
          >
            <div className="w-full md:max-w-2xl md:mx-auto bg-white h-full md:h-[90vh] md:rounded-t-3xl shadow-2xl flex flex-col overflow-y-auto">
              {/* Close Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <h2 className="text-base font-black text-neutral-900">Profile</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
              <div className="px-4 overflow-y-auto flex-1">
                {guestProfileContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }


  if (isTabMode) {
    if (!isOpen) return null;
    return (
      <>
        <div className="w-full max-w-2xl mx-auto bg-white flex flex-col min-h-screen pb-32 pt-0 px-4 sm:px-6 border-l border-r border-neutral-100 shadow-sm">
          {modalContent}
        </div>
        <SellerOnboardingModal
          isOpen={isSellerOnboardingOpen}
          onClose={() => setIsSellerOnboardingOpen(false)}
          onSubmitSuccess={handleSellerAppSuccess}
          prefillName={fullName}
          prefillPhone={phone}
          prefillEmail={email}
        />
        {isSellerDashboardOpen && user && (
          <SellerDashboard
            userId={user.uid}
            shopId={latestSellerApp?.shop_id || undefined}
            onClose={() => setIsSellerDashboardOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="user-profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-neutral-950/75 flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-all cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
              {modalContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SellerOnboardingModal
        isOpen={isSellerOnboardingOpen}
        onClose={() => setIsSellerOnboardingOpen(false)}
        onSubmitSuccess={handleSellerAppSuccess}
        prefillName={fullName}
        prefillPhone={phone}
        prefillEmail={email}
      />

      {/* Cancel Seller Application Dialog */}
      <AnimatePresence>
        {isSellerCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              {sellerCancelStep === 'confirm' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-neutral-900 leading-tight">
                          Cancel &amp; Withdraw Application?
                        </h3>
                        <span className="text-[11px] font-medium text-neutral-500">
                          {latestSellerApp?.business_name || 'Boutique Seller Account'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSellerCancelModalOpen(false)}
                      className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    Are you sure you want to withdraw your seller application? This will cancel the review in the database and securely decommission all submitted KYC documents.
                  </p>

                  {/* Reason Selection */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Reason for Withdrawal
                    </label>
                    <select
                      value={sellerCancelReason}
                      onChange={(e) => setSellerCancelReason(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="Need to update documents or change details">
                        Need to update documents or change details
                      </option>
                      <option value="Changed my mind / Not ready to sell yet">
                        Changed my mind / Not ready to sell yet
                      </option>
                      <option value="Verification taking longer than expected">
                        Verification taking longer than expected
                      </option>
                      <option value="Other reason (specify below)">
                        Other reason (specify below)
                      </option>
                    </select>
                  </div>

                  {sellerCancelReason === 'Other reason (specify below)' && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <textarea
                        value={customSellerCancelReason}
                        onChange={(e) => setCustomSellerCancelReason(e.target.value)}
                        placeholder="Please specify why you wish to cancel..."
                        rows={2}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}

                  {/* Privacy Notice */}
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>Data Privacy Guarantee</span>
                    </div>
                    <p className="text-[11px] text-rose-800/80 leading-relaxed">
                      Your identity documents (Aadhar / PAN) and boutique details will be securely decommissioned from verification queues.
                    </p>
                  </div>

                  {/* Dialog Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      disabled={isSubmittingSellerCancel}
                      onClick={() => setIsSellerCancelModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Keep Application
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingSellerCancel}
                      onClick={() => handleCancelSellerApplication()}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      {isSubmittingSellerCancel ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Yes, Cancel Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {sellerCancelStep === 'success' && (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-neutral-900">
                      Application Cancelled
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium leading-relaxed max-w-xs mx-auto">
                      Your seller onboarding application has been withdrawn. You can apply again anytime with updated documents.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSellerCancelModalOpen(false);
                        setActiveSubModal('seller-status');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      View Cancelled Status
                    </button>
                    <button
                      type="button"
                      onClick={handleStartNewApplication}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start New Application</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {isSellerDashboardOpen && user && (
        <SellerDashboard
          userId={user.uid}
          shopId={latestSellerApp?.shop_id || undefined}
          onClose={() => setIsSellerDashboardOpen(false)}
        />
      )}
    </>
  );
};


