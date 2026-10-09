'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  Search,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  User,
  Store,
  Eye,
  X,
  Radio,
  Send,
  Zap,
  LayoutGrid,
  Calendar,
  Crown,
  Upload,
  RefreshCw,
  Sliders,
  Check,
  Power,
  Layers,
  ArrowRight,
  Flame,
  MousePointerClick,
  Users,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import {
  isAuthenticated,
  fetchApplications,
  fetchBargainCampaignConfig,
  updateBargainCampaignConfig,
  updateBargainSlotConfig,
  inviteTopBrandToCampaign,
  fetchBargainMetrics,
  BargainCampaignConfig,
  BargainSlotConfig,
  TopBrandInviteConfig,
  BargainDropMetrics,
} from '../../lib/api';

interface BargainRoom {
  id: string;
  roomCode: string;
  productName: string;
  productCategory: string;
  mrp: number;
  buyerOffer: number;
  boutiqueCounter?: number;
  agreedPrice?: number;
  buyerName: string;
  buyerCity: string;
  boutiqueName: string;
  status: 'active' | 'accepted' | 'countered' | 'expired';
  timeLeft: string;
  roundsCount: number;
  lastMessage: string;
  history: { sender: 'buyer' | 'boutique' | 'ai'; text: string; time: string }[];
}

const INITIAL_ROOMS: BargainRoom[] = [
  {
    id: 'brg_1',
    roomCode: 'BRG-8821',
    productName: 'Oversized Silk-Blend Embroidered Bomber',
    productCategory: 'Luxury Streetwear',
    mrp: 14500,
    buyerOffer: 11200,
    boutiqueCounter: 12500,
    buyerName: 'Aarav Malhotra',
    buyerCity: 'Mumbai',
    boutiqueName: 'UrbanThreadz Streetwear Hub',
    status: 'active',
    timeLeft: '02:45 remaining',
    roundsCount: 3,
    lastMessage: 'Boutique countered at ₹12,500 with complimentary garment bag.',
    history: [
      { sender: 'buyer', text: 'Hi! Can I get this bomber for ₹10,500? Ready to pay immediately.', time: '14:20' },
      { sender: 'ai', text: 'AI Mediator: Buyer offer ₹10,500 (27.5% off). Seller minimum margin check: Suggest counter.', time: '14:21' },
      { sender: 'boutique', text: 'Thank you for your interest! Hand-embroidery takes 18 hours. Best I can do is ₹12,800.', time: '14:23' },
      { sender: 'buyer', text: 'Meet me in the middle at ₹11,200?', time: '14:24' },
      { sender: 'boutique', text: 'Let’s do ₹12,500 and I will include a custom canvas dust bag.', time: '14:26' },
    ],
  },
  {
    id: 'brg_2',
    roomCode: 'BRG-8819',
    productName: 'Pure Kanchipuram Gold Tissue Brocade',
    productCategory: 'Traditional & Ethnic',
    mrp: 32000,
    buyerOffer: 28500,
    agreedPrice: 28500,
    buyerName: 'Pavitra Iyer',
    buyerCity: 'Bengaluru',
    boutiqueName: 'Zari Heritage Weaves',
    status: 'accepted',
    timeLeft: 'Deal Closed',
    roundsCount: 2,
    lastMessage: 'Deal locked at ₹28,500. Buyer redirected to checkout.',
    history: [
      { sender: 'buyer', text: 'Inquiring for upcoming family wedding. Can we do ₹28,000 for this piece?', time: '13:50' },
      { sender: 'boutique', text: 'Happy wedding season! We can do ₹28,500 as an auspicious discount.', time: '13:52' },
      { sender: 'buyer', text: 'Accepted! Paying now.', time: '13:53' },
      { sender: 'ai', text: 'Deal finalized at ₹28,500 (10.9% off). Cart locked for 15 mins.', time: '13:53' },
    ],
  },
  {
    id: 'brg_3',
    roomCode: 'BRG-8814',
    productName: 'Raw Selvedge Indigo Work Jacket',
    productCategory: 'Streetwear',
    mrp: 9800,
    buyerOffer: 7000,
    boutiqueCounter: 8500,
    buyerName: 'Nikhil Kashyap',
    buyerCity: 'Delhi',
    boutiqueName: 'Selvedge & Rivet Works',
    status: 'countered',
    timeLeft: '06:18 remaining',
    roundsCount: 2,
    lastMessage: 'Waiting on buyer to accept boutique counter ₹8,500.',
    history: [
      { sender: 'buyer', text: 'Offering ₹7,000 flat.', time: '14:10' },
      { sender: 'boutique', text: 'Selvedge shuttle denim is imported from Okayama. Final counter ₹8,500.', time: '14:14' },
    ],
  },
  {
    id: 'brg_4',
    roomCode: 'BRG-8809',
    productName: 'Air Jordan 1 Retro Low OG Neutral Grey',
    productCategory: 'Sneakers & Footwear',
    mrp: 24000,
    buyerOffer: 16000,
    buyerName: 'Sameer Sen',
    buyerCity: 'Pune',
    boutiqueName: 'Kicks & Crown Vault',
    status: 'expired',
    timeLeft: 'Room Expired',
    roundsCount: 1,
    lastMessage: 'Offer ₹16,000 declined by boutique as below cost threshold.',
    history: [
      { sender: 'buyer', text: 'Offer ₹16,000 for UK 9.', time: '12:00' },
      { sender: 'boutique', text: 'Declined. Lowball offer below vault floor price.', time: '12:05' },
    ],
  },
];

// Presets for quick photo updates
const PHOTO_PRESETS: Record<string, { label: string; url: string }[]> = {
  boys: [
    { label: 'Oversized Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop' },
    { label: 'Streetwear Tee', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
    { label: 'Vintage Denim', url: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop' },
  ],
  girls: [
    { label: 'Y2K Crop Co-ord', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
    { label: 'Pastel Blazer', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop' },
    { label: 'Resort Dress', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop' },
  ],
  mens: [
    { label: 'French Linen Shirt', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop' },
    { label: 'Tailored Blazer', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
    { label: 'Structured Polo', url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop' },
  ],
  shoes: [
    { label: 'Retro Kicks', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop' },
    { label: 'Calfskin Loafers', url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop' },
    { label: 'Luxury Chelsea Boots', url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop' },
  ],
  womens: [
    { label: 'Kanchipuram Silk', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop' },
    { label: 'Chikankari Kurta', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop' },
    { label: 'Banarasi Brocade', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop' },
  ],
  brands: [
    { label: 'Luxury Boutique Store', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop' },
    { label: 'Designer Atelier', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop' },
  ],
};

export default function LiveBargainsPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<'scheduler' | 'bento' | 'brands' | 'rooms'>('scheduler');
  const [pendingCount, setPendingCount] = useState(0);

  // Campaign State
  const [campaign, setCampaign] = useState<BargainCampaignConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Form States
  const [campaignTitle, setCampaignTitle] = useState('Nvilar High-Volume Live Bargain Drop');
  const [isActive, setIsActive] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(240);
  const [hideWhenExpired, setHideWhenExpired] = useState(true);
  const [slots, setSlots] = useState<BargainSlotConfig[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrandInviteConfig[]>([]);

  // Top Brand Invite Form
  const [selectedShop, setSelectedShop] = useState('shp_calicutlinen');
  const [shopNameInput, setShopNameInput] = useState('Calicut Linen House');
  const [brandTierInput, setBrandTierInput] = useState('Verified Boutique');
  const [commissionInput, setCommissionInput] = useState(6.0);

  // Live Chat Rooms State
  const [rooms, setRooms] = useState<BargainRoom[]>(INITIAL_ROOMS);
  const [roomTab, setRoomTab] = useState<'all' | 'active' | 'countered' | 'accepted' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<BargainRoom | null>(null);

  // Live Drop 4 Executive KPI Metrics State
  const [metrics, setMetrics] = useState<BargainDropMetrics>({
    active_viewers: 1280,
    total_bento_clicks: 742,
    ctr_percent: 58.0,
    slot_breakdown: { boys: 284, girls: 192, mens: 124, shoes: 82, womens: 45, brands: 15 },
    top_category: "Boys' Streetwear",
    active_negotiations: 142,
    counter_offers_count: 58,
    total_rooms: 278,
    avg_rounds: 3.8,
    negotiation_heat: 'HIGH FIRE',
    deals_closed: 78,
    gross_gmv: 248500,
    win_rate: 68.2,
    avg_order_val: 3185.89,
    demand_surge_percent: 32.6,
    platform_commission: 14910,
    margin_lift: '+14.2%',
    is_profitable: true,
  });

  // Second-by-second Live Ticking Chronometer
  const [tickingSeconds, setTickingSeconds] = useState(240 * 60);

  useEffect(() => {
    setTickingSeconds(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic metrics refresh from backend database
  useEffect(() => {
    const syncMetrics = async () => {
      try {
        const m = await fetchBargainMetrics();
        if (m) setMetrics(m);
      } catch (e) {}
    };
    syncMetrics();
    const interval = setInterval(syncMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadCampaign = async () => {
    const res = await fetchBargainCampaignConfig();
    if (res && res.campaign) {
      setCampaign(res.campaign);
      setCampaignTitle(res.campaign.title);
      setIsActive(res.campaign.is_active);
      setDurationMinutes(res.campaign.countdown_duration_minutes || 240);
      setHideWhenExpired(res.campaign.hide_when_expired);
      setSlots(res.campaign.slots || []);
      setTopBrands(res.campaign.top_brands || []);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchApplications('pending_review')
      .then((res) => {
        setPendingCount(res.counts.pending);
      })
      .catch(() => {});

    loadCampaign();
  }, [router]);

  // Handle Slot Change
  const handleSlotChange = (slotKey: string, field: keyof BargainSlotConfig, value: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.slot_key === slotKey ? { ...s, [field]: value } : s))
    );
  };

  // Handle Image Upload Simulation (converts file to data URL)
  const handleImageFileUpload = (slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (url) {
        handleSlotChange(slotKey, 'image_url', url);
        setToastMessage(`Image uploaded for ${slotKey} slot`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save All Campaign & Bento Config
  const handleSaveCampaign = async () => {
    setIsSaving(true);
    try {
      const updated = await updateBargainCampaignConfig({
        is_active: isActive,
        title: campaignTitle,
        countdown_duration_minutes: durationMinutes,
        hide_when_expired: hideWhenExpired,
        slots: slots,
      });
      if (updated) {
        setCampaign(updated);
        setToastMessage('✅ Campaign & 6-Bento Deal Engine published live!');
      } else {
        setToastMessage('⚠️ Changes saved locally.');
      }
    } catch (err) {
      console.error(err);
      setToastMessage('❌ Error updating campaign configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Top Brand Invite
  const handleInviteBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invite = await inviteTopBrandToCampaign({
        shop_id: selectedShop,
        shop_name: shopNameInput,
        brand_tier: brandTierInput,
        commission_percent: Number(commissionInput),
      });
      if (invite) {
        setTopBrands((prev) => [invite, ...prev]);
        setToastMessage(`✦ Official Drop Invitation sent to ${shopNameInput}!`);
      } else {
        // Fallback local addition
        const localInvite: TopBrandInviteConfig = {
          id: 'inv_' + Math.random().toString(36).substr(2, 6),
          shop_id: selectedShop,
          shop_name: shopNameInput,
          brand_tier: brandTierInput,
          commission_percent: Number(commissionInput),
          status: 'pending',
          products_count: 0,
          invited_at: new Date().toISOString(),
        };
        setTopBrands((prev) => [localInvite, ...prev]);
        setToastMessage(`✦ Invitation queued for ${shopNameInput}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.roomCode.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.buyerName.toLowerCase().includes(q) ||
        r.boutiqueName.toLowerCase().includes(q);

      const matchTab = roomTab === 'all' || r.status === roomTab;
      return matchSearch && matchTab;
    });
  }, [rooms, searchQuery, roomTab]);

  // Formatted Live Chronometer Digits
  const hrs = Math.floor(tickingSeconds / 3600);
  const mins = Math.floor((tickingSeconds % 3600) / 60);
  const secs = tickingSeconds % 60;
  const formattedHrs = String(hrs).padStart(2, '0');
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={pendingCount} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#C5963A]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Link href="/" className="hover:text-neutral-700 font-medium">
                  Dashboard
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-neutral-900 font-semibold">Live Bargain Engine & 6-Bento Manager</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
                <span>Live Bargain Campaign Hub</span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE ON BUYER APP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                    <Power className="w-3 h-3" /> OFFLINE / AUTO-HIDDEN
                  </span>
                )}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Configure daily category photos, discount tags, live countdown timers, and top brand invitations without redeploying.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={loadCampaign}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sync Engine</span>
              </button>
              <button
                onClick={handleSaveCampaign}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A1521] text-white text-xs font-black uppercase tracking-wider hover:bg-[#380e18] transition shadow-md disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : <Sparkles className="w-3.5 h-3.5 text-[#C5963A] flex-shrink-0" />}
                <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
              </button>
            </div>
          </div>

          {/* 4 Executive Real-Time Live Drop KPI Cards (Clean Header Typography, Shifted Up) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* BOX 1: Live Footfall & Bento Click Stream */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  LIVE TRAFFIC &amp; CLICKS
                </span>
                <MousePointerClick className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap">
                  <span>{metrics.active_viewers.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-slate-500">Live Buyers</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs whitespace-nowrap">
                  <span className="text-slate-500 font-medium">Bento Clicks:</span>
                  <span className="font-bold text-slate-900">{metrics.total_bento_clicks.toLocaleString()} ({metrics.ctr_percent}% CTR)</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, metrics.ctr_percent)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                  <span className="truncate">Top: <b className="text-blue-700 font-semibold">{metrics.top_category}</b></span>
                  <span className="text-emerald-600 font-bold ml-1 flex-shrink-0">+18% Surge</span>
                </div>
              </div>
            </div>

            {/* BOX 2: Negotiation Pipeline & Active Heat */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  BARGAIN ROOMS
                </span>
                <Flame className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap">
                  <span>{metrics.active_negotiations}</span>
                  <span className="text-xs font-semibold text-slate-500">Active Bids</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs whitespace-nowrap">
                  <span className="text-slate-500 font-medium">Counter-Offers:</span>
                  <span className="font-bold text-amber-700">{metrics.counter_offers_count} In-flight</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (metrics.active_negotiations / Math.max(metrics.total_rooms, 1)) * 100)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                  <span>Total: <b className="text-slate-800">{metrics.total_rooms} Rooms</b></span>
                  <span className="text-amber-700 font-bold">⚡ {metrics.avg_rounds} Rounds</span>
                </div>
              </div>
            </div>

            {/* BOX 3: Deals Converted & Revenue Velocity */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  DEALS &amp; GMV
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-emerald-800 flex items-baseline gap-1.5 whitespace-nowrap">
                  <span>₹{metrics.gross_gmv.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-semibold text-slate-500">Gross Drop</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs whitespace-nowrap">
                  <span className="text-slate-500 font-medium">Deals Won:</span>
                  <span className="font-bold text-emerald-700">{metrics.deals_closed} Orders ({metrics.win_rate}% Win)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, metrics.win_rate)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                  <span>Avg: <b className="text-slate-800">₹{Math.round(metrics.avg_order_val).toLocaleString('en-IN')}</b></span>
                  <span className="text-emerald-700 font-bold">🔥 68% Win</span>
                </div>
              </div>
            </div>

            {/* BOX 4: Demand Surge & Platform Profitability */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse flex-shrink-0" />
                  SURGE &amp; PROFIT
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black tracking-tight text-purple-900 flex items-baseline gap-1.5 whitespace-nowrap">
                  <span>+{metrics.demand_surge_percent}%</span>
                  <span className="text-xs font-semibold text-slate-500">Demand Surge</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs whitespace-nowrap">
                  <span className="text-slate-500 font-medium">Platform Cut (6%):</span>
                  <span className="font-bold text-purple-800">₹{Math.round(metrics.platform_commission).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '84%' }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                  <span>Margin: <b className="text-emerald-600 font-bold">{metrics.margin_lift}</b></span>
                  <span className="text-purple-700 font-bold">🟢 Profitable</span>
                </div>
              </div>
            </div>

          </div>

          {/* 4 Main Operational Tabs */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMainTab('scheduler')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                mainTab === 'scheduler'
                  ? 'border-[#4A1521] text-[#4A1521] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              1. Live Scheduler &amp; Timer Master Switch
            </button>

            <button
              onClick={() => setMainTab('bento')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                mainTab === 'bento'
                  ? 'border-[#4A1521] text-[#4A1521] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              2. 6-Category Bento Daily Photos &amp; Offers
            </button>

            <button
              onClick={() => setMainTab('brands')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                mainTab === 'brands'
                  ? 'border-[#4A1521] text-[#4A1521] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Crown className="w-4 h-4" />
              3. Top Brands Bargain Hub &amp; Invites
            </button>

            <button
              onClick={() => setMainTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                mainTab === 'rooms'
                  ? 'border-[#4A1521] text-[#4A1521] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              4. Live Negotiation Rooms ({rooms.length})
            </button>
          </div>

          {/* TAB 1: SCHEDULER & TIMER MASTER SWITCH */}
          {mainTab === 'scheduler' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Schedule Settings */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Campaign Master Switch</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Controls whether the Live Bargain Bento section is visible on the Buyer Mobile Homepage.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                        isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Campaign Title (Internal Reference)
                      </label>
                      <input
                        type="text"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A1521]"
                      />
                    </div>

                    {/* Timer Duration Picker */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Active Drop Duration (Urgency Countdown)
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {[
                          { label: '1 Hour', mins: 60 },
                          { label: '2 Hours', mins: 120 },
                          { label: '4 Hours', mins: 240 },
                          { label: '8 Hours', mins: 480 },
                        ].map((d) => (
                          <button
                            key={d.mins}
                            type="button"
                            onClick={() => setDurationMinutes(d.mins)}
                            className={`py-2 text-xs font-bold rounded-xl border transition ${
                              durationMinutes === d.mins
                                ? 'bg-[#4A1521] text-white border-[#4A1521]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                          className="w-32 px-3 py-2 text-sm rounded-xl border border-slate-200"
                        />
                        <span className="text-xs text-slate-500 font-medium">Minutes total countdown</span>
                      </div>
                    </div>

                    {/* Auto-Hide Checkbox */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="checkbox"
                        id="autoHide"
                        checked={hideWhenExpired}
                        onChange={(e) => setHideWhenExpired(e.target.checked)}
                        className="mt-0.5 rounded text-[#4A1521] focus:ring-[#4A1521]"
                      />
                      <label htmlFor="autoHide" className="text-xs text-slate-700">
                        <span className="font-bold block text-slate-900">
                          Auto-Hide from Buyer Homepage when Expired
                        </span>
                        When enabled, if countdown reaches 00:00:00 or Admin turns it off, the deal bento cleanly collapses from the buyer app with zero layout breakage.
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Status & Simulation */}
              <div className="space-y-4">
                <div className="bg-[#FAF5EC] p-6 rounded-2xl border border-[#E8DEC9] shadow-sm space-y-4 text-center">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#5C3A21] block">
                    ✦ REAL-TIME BUYER BROADCAST ✦
                  </span>
                  {/* Luxury Digital Chronometer Clock */}
                  <div className="p-4 rounded-2xl bg-[#EFE3D3] border border-[#DECDB8] shadow-sm text-center space-y-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      <span className="text-[10px] uppercase font-extrabold text-[#6B4B35] tracking-[0.18em]">
                        Live Urgency Chronometer
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 select-none">
                      {/* HOURS */}
                      <div className="flex flex-col items-center">
                        <div className="min-w-[54px] px-2 py-2 rounded-xl bg-white border border-[#DECDB8] shadow-sm">
                          <span className="font-mono text-2xl sm:text-3xl font-black text-[#4A1521] tracking-wider tabular-nums block">
                            {formattedHrs}
                          </span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6B4B35] mt-1">
                          Hours
                        </span>
                      </div>

                      <span className="font-mono text-xl sm:text-2xl font-black text-[#4A1521] -mt-5 animate-pulse">:</span>

                      {/* MINUTES */}
                      <div className="flex flex-col items-center">
                        <div className="min-w-[54px] px-2 py-2 rounded-xl bg-white border border-[#DECDB8] shadow-sm">
                          <span className="font-mono text-2xl sm:text-3xl font-black text-[#4A1521] tracking-wider tabular-nums block">
                            {formattedMins}
                          </span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6B4B35] mt-1">
                          Minutes
                        </span>
                      </div>

                      <span className="font-mono text-xl sm:text-2xl font-black text-[#4A1521] -mt-5 animate-pulse">:</span>

                      {/* SECONDS (Live Ticking!) */}
                      <div className="flex flex-col items-center">
                        <div className="min-w-[54px] px-2 py-2 rounded-xl bg-[#4A1521] border border-[#4A1521] shadow-sm">
                          <span className="font-mono text-2xl sm:text-3xl font-black text-[#FFF2DC] tracking-wider tabular-nums block">
                            {formattedSecs}
                          </span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#4A1521] mt-1">
                          Seconds
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DECDB8] text-[10px] font-bold text-[#5C3A21]">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      <span>Synchronized Live to Buyer Mobile Apps</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 text-left space-y-2 border-t border-[#DECDB8] pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5C3A21]">Status:</span>
                      <span className={`font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {isActive ? '● Actively Streaming' : '○ Standby / Hidden'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5C3A21]">Total Categories:</span>
                      <span className="font-bold text-[#4A1521]">{slots.length || 6} Bento Slots</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#5C3A21]">Top Brands Joined:</span>
                      <span className="font-bold text-[#4A1521]">{topBrands.filter((b) => b.status === 'accepted').length} Verified</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveCampaign}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl bg-[#4A1521] text-white text-xs font-black uppercase tracking-wider hover:bg-[#380e18] transition shadow"
                  >
                    Broadcast Schedule Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6-CATEGORY BENTO DAILY PHOTOS & BADGES */}
          {mainTab === 'bento' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left 2 Cols: The 6 Editable Category Cards */}
              <div className="xl:col-span-2 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">6-Bento Category Deal Slots</h2>
                    <p className="text-xs text-slate-500">
                      Update daily photos, luxury badges, and subheadings for all 6 tiles.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCampaign}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A1521] text-white text-xs font-black uppercase tracking-wider hover:bg-[#380e18] transition shadow"
                  >
                    <Check className="w-3.5 h-3.5" /> Save All Photos
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.map((slot) => {
                    const presets = PHOTO_PRESETS[slot.slot_key] || [];
                    return (
                      <div
                        key={slot.slot_key}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition"
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-[#2E1C12] text-white text-[9px] font-black uppercase tracking-wider">
                            Slot: {slot.slot_key.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Order: #{slot.sort_order}</span>
                        </div>

                        {/* Title & Badge Row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Title</label>
                            <input
                              type="text"
                              value={slot.title}
                              onChange={(e) => handleSlotChange(slot.slot_key, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Offer Badge</label>
                            <input
                              type="text"
                              value={slot.badge}
                              onChange={(e) => handleSlotChange(slot.slot_key, 'badge', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-[#4A1521]"
                            />
                          </div>
                        </div>

                        {/* Subtitle */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Subtitle / Fabrics</label>
                          <input
                            type="text"
                            value={slot.subtitle}
                            onChange={(e) => handleSlotChange(slot.slot_key, 'subtitle', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                          />
                        </div>

                        {/* Image Preview & URL */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Daily Photo URL / Upload</label>
                          <div className="flex items-center gap-2">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                              {slot.image_url ? (
                                <Image
                                  src={slot.image_url}
                                  alt={slot.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-[10px] text-slate-400">No Image</div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={slot.image_url}
                                placeholder="Paste image URL..."
                                onChange={(e) => handleSlotChange(slot.slot_key, 'image_url', e.target.value)}
                                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-mono text-[11px]"
                              />
                              <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-semibold text-slate-700 cursor-pointer transition">
                                <Upload className="w-3 h-3" />
                                <span>Upload Local Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileUpload(slot.slot_key, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        {presets.length > 0 && (
                          <div>
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                              Quick Luxury Presets:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {presets.map((p) => (
                                <button
                                  key={p.label}
                                  type="button"
                                  onClick={() => handleSlotChange(slot.slot_key, 'image_url', p.url)}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-[#4A1521] hover:text-white transition"
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Col: Live 3x2 Bento Preview (Warm Champagne Mirror) */}
              <div className="space-y-4">
                <div className="sticky top-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5963A]" />
                    Live Buyer Mobile Preview
                  </h3>
                  
                  {/* Container matching Buyer App LiveBargainDealsSection */}
                  <div className="rounded-[26px] bg-[#FAF5EC] border border-[#E8DEC9] p-3 shadow-md space-y-2 select-none">
                    <div className="text-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5C3A21]">
                        ✦ THE LIVE BARGAIN DEALS ✦
                      </span>
                    </div>

                    {/* 3x2 Bento Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {/* Col 1 */}
                      <div className="flex flex-col gap-1.5">
                        {/* Boys */}
                        <div className="rounded-xl bg-[#EFE3D3] border border-[#DFD1BF] p-1.5 flex flex-col justify-between">
                          <div>
                            <span className="px-1 py-0.2 rounded bg-[#2E1C12] text-white text-[7px] font-black uppercase">
                              {slots.find((s) => s.slot_key === 'boys')?.badge || 'UP TO 60% OFF'}
                            </span>
                            <h5 className="text-[8px] font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                              {slots.find((s) => s.slot_key === 'boys')?.title || "Boys' Collection"}
                            </h5>
                          </div>
                          <div className="relative w-full aspect-[4/2.7] mt-1 rounded overflow-hidden bg-slate-200">
                            <Image
                              src={slots.find((s) => s.slot_key === 'boys')?.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'}
                              alt="Boys"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Girls */}
                        <div className="rounded-xl bg-[#EFE3D3] border border-[#DFD1BF] p-1.5 flex flex-col justify-between">
                          <div>
                            <span className="px-1 py-0.2 rounded bg-[#2E1C12] text-white text-[7px] font-black uppercase">
                              {slots.find((s) => s.slot_key === 'girls')?.badge || 'UP TO 70% OFF'}
                            </span>
                            <h5 className="text-[8px] font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                              {slots.find((s) => s.slot_key === 'girls')?.title || "Girls' Fashion"}
                            </h5>
                          </div>
                          <div className="relative w-full aspect-[4/2.7] mt-1 rounded overflow-hidden bg-slate-200">
                            <Image
                              src={slots.find((s) => s.slot_key === 'girls')?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'}
                              alt="Girls"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Col 2 */}
                      <div className="flex flex-col gap-1.5">
                        {/* Mens */}
                        <div className="rounded-xl bg-[#EFE3D3] border border-[#DFD1BF] p-1.5 flex flex-col justify-between">
                          <div>
                            <span className="px-1 py-0.2 rounded bg-[#2E1C12] text-white text-[7px] font-black uppercase">
                              {slots.find((s) => s.slot_key === 'mens')?.badge || 'UP TO 65% OFF'}
                            </span>
                            <h5 className="text-[8px] font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                              {slots.find((s) => s.slot_key === 'mens')?.title || "Men's Wear"}
                            </h5>
                          </div>
                          <div className="relative w-full aspect-[4/2.7] mt-1 rounded overflow-hidden bg-slate-200">
                            <Image
                              src={slots.find((s) => s.slot_key === 'mens')?.image_url || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'}
                              alt="Mens"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Shoes */}
                        <div className="rounded-xl bg-[#EFE3D3] border border-[#DFD1BF] p-1.5 flex flex-col justify-between">
                          <div>
                            <span className="px-1 py-0.2 rounded bg-[#2E1C12] text-white text-[7px] font-black uppercase">
                              {slots.find((s) => s.slot_key === 'shoes')?.badge || 'UP TO 75% OFF'}
                            </span>
                            <h5 className="text-[8px] font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                              {slots.find((s) => s.slot_key === 'shoes')?.title || "Shoes & Sneakers"}
                            </h5>
                          </div>
                          <div className="relative w-full aspect-[4/2.7] mt-1 rounded overflow-hidden bg-slate-200">
                            <Image
                              src={slots.find((s) => s.slot_key === 'shoes')?.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'}
                              alt="Shoes"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Col 3 */}
                      <div className="flex flex-col gap-1.5">
                        {/* Womens */}
                        <div className="rounded-xl bg-[#EFE3D3] border border-[#DFD1BF] p-1.5 flex flex-col justify-between">
                          <div>
                            <span className="px-1 py-0.2 rounded bg-[#2E1C12] text-white text-[7px] font-black uppercase">
                              {slots.find((s) => s.slot_key === 'womens')?.badge || 'UP TO 80% OFF'}
                            </span>
                            <h5 className="text-[8px] font-bold text-[#2E1C12] mt-0.5 line-clamp-1">
                              {slots.find((s) => s.slot_key === 'womens')?.title || "Women's & Sarees"}
                            </h5>
                          </div>
                          <div className="relative w-full aspect-[4/2.7] mt-1 rounded overflow-hidden bg-slate-200">
                            <Image
                              src={slots.find((s) => s.slot_key === 'womens')?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'}
                              alt="Womens"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Best Brand Offers */}
                        <div className="rounded-xl bg-[#EFE3D3] border border-[#DFD1BF] p-1.5 flex flex-col items-center justify-center text-center">
                          <span className="font-serif font-black text-[8px] text-[#4A1521] uppercase">BEST BRAND</span>
                          <span className="font-serif italic text-[11px] text-[#4A1521] leading-none">OFFERS</span>
                          <span className="text-[#C5963A] text-[9px] mt-0.5">✦</span>
                          <span className="text-[7px] font-bold text-[#7A5B44]">100% Direct Karigar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TOP BRANDS BARGAIN HUB & INVITES */}
          {mainTab === 'brands' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Invite Verified Brand Form */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#C5963A]" />
                    <h2 className="text-base font-bold text-slate-900">Invite Boutique to Top Brand Slot</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Invite verified marquee boutiques to participate in Tile 6 with lower marketplace commission fee incentives.
                  </p>

                  <form onSubmit={handleInviteBrand} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Boutique</label>
                      <select
                        value={selectedShop}
                        onChange={(e) => {
                          setSelectedShop(e.target.value);
                          if (e.target.value === 'shp_urbanthreadz') setShopNameInput('UrbanThreadz Streetwear Hub');
                          if (e.target.value === 'shp_zariheritage') setShopNameInput('Zari Heritage Weaves');
                          if (e.target.value === 'shp_calicutlinen') setShopNameInput('Calicut Linen House');
                          if (e.target.value === 'shp_auraethnic') setShopNameInput('Aura Ethnic Couture');
                        }}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="shp_urbanthreadz">UrbanThreadz Streetwear Hub (Mumbai)</option>
                        <option value="shp_zariheritage">Zari Heritage Weaves (Bengaluru)</option>
                        <option value="shp_calicutlinen">Calicut Linen House (Kozhikode)</option>
                        <option value="shp_auraethnic">Aura Ethnic Couture (Delhi)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand Tier Tag</label>
                      <input
                        type="text"
                        value={brandTierInput}
                        onChange={(e) => setBrandTierInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                        placeholder="e.g. Marquee Streetwear / Direct Karigar"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Commission Rate Incentive (%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          step="0.5"
                          value={commissionInput}
                          onChange={(e) => setCommissionInput(Number(e.target.value))}
                          className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold"
                        />
                        <span className="text-xs text-emerald-700 font-semibold">
                          (Standard rate 12% reduced to {commissionInput}%)
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#4A1521] text-white text-xs font-black uppercase tracking-wider hover:bg-[#380e18] transition shadow"
                    >
                      Send Official Drop Invitation
                    </button>
                  </form>
                </div>

                {/* Right Col: Current Featured & Invited Brands */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Active &amp; Invited Brands</h3>
                      <p className="text-xs text-slate-500">Boutiques featured in the &quot;BEST BRAND OFFERS&quot; slot.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {topBrands.length} Total Records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Boutique</th>
                          <th className="py-2.5 px-3">Tier</th>
                          <th className="py-2.5 px-3">Commission</th>
                          <th className="py-2.5 px-3">Products</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topBrands.map((brand) => (
                          <tr key={brand.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-[#4A1521]" />
                                <span>{brand.shop_name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{brand.shop_id}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium">{brand.brand_tier}</td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-emerald-700">{brand.commission_percent}%</span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">{brand.products_count} drops</td>
                            <td className="py-3 px-3">
                              {brand.status === 'accepted' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" /> Live Featured
                                </span>
                              )}
                              {brand.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  <Clock className="w-3 h-3" /> Invite Pending
                                </span>
                              )}
                              {brand.status === 'declined' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  <XCircle className="w-3 h-3" /> Declined
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE NEGOTIATION ROOMS */}
          {mainTab === 'rooms' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Rooms</span>
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">17</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Live negotiating now</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deals Closed Today</span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">₹1,24,000</div>
                  <span className="text-[11px] text-indigo-600 font-medium">34 locked checkouts</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Negotiated Cut</span>
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">14.2%</div>
                  <span className="text-[11px] text-amber-600 font-medium">Within boutique threshold</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Guardrail</span>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">100% Safe</div>
                  <span className="text-[11px] text-purple-600 font-medium">Zero margin violations</span>
                </div>
              </div>

              {/* Filters & Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {(['all', 'active', 'countered', 'accepted', 'expired'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setRoomTab(tab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                          roomTab === tab
                            ? 'bg-[#4A1521] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab === 'all' ? 'All Rooms' : tab === 'active' ? 'Live Active' : tab === 'countered' ? 'Counter Offered' : tab === 'accepted' ? 'Deals Accepted' : 'Declined/Expired'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search room #, product, or merchant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#4A1521]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3 px-4">Room &amp; Product</th>
                        <th className="py-3 px-4">Parties Involved</th>
                        <th className="py-3 px-4">Price &amp; Negotiation</th>
                        <th className="py-3 px-4">Live Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRooms.map((room) => (
                        <tr key={room.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono font-bold text-slate-900">{room.roomCode}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                                {room.productCategory}
                              </span>
                            </div>
                            <div className="font-bold text-slate-800 line-clamp-1">{room.productName}</div>
                            <span className="text-[11px] text-slate-400">Listed MRP: ₹{room.mrp.toLocaleString()}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 text-slate-900 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{room.buyerName}</span>
                              <span className="text-slate-400 text-[11px]">({room.buyerCity})</span>
                            </div>
                            <div className="flex items-center gap-1 text-indigo-600 font-medium mt-1">
                              <Store className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[180px]">{room.boutiqueName}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-slate-400 line-through text-[11px]">₹{room.mrp.toLocaleString()}</span>
                              <span className="font-bold text-amber-700 text-sm">
                                Offer: ₹{room.buyerOffer.toLocaleString()}
                              </span>
                            </div>
                            {room.boutiqueCounter && (
                              <div className="text-indigo-600 font-bold text-[11px] mt-0.5">
                                Counter: ₹{room.boutiqueCounter.toLocaleString()}
                              </div>
                            )}
                            {room.agreedPrice && (
                              <div className="text-emerald-600 font-bold text-[11px] mt-0.5">
                                Locked: ₹{room.agreedPrice.toLocaleString()}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {room.status === 'active' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                                <span>Negotiating</span>
                                <span className="text-[10px] text-emerald-600 font-normal">({room.timeLeft})</span>
                              </div>
                            )}
                            {room.status === 'accepted' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Deal Accepted</span>
                              </div>
                            )}
                            {room.status === 'countered' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Counter Waiting</span>
                              </div>
                            )}
                            {room.status === 'expired' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Expired</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedRoom(room)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect Room
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inspect Room Modal */}
          {selectedRoom && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400">ROOM {selectedRoom.roomCode}</span>
                    <h3 className="font-bold text-slate-900 text-base">{selectedRoom.productName}</h3>
                  </div>
                  <button onClick={() => setSelectedRoom(null)} className="p-1 rounded-full hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Chat History */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {selectedRoom.history.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.sender === 'buyer'
                          ? 'bg-white border border-slate-200 text-slate-800'
                          : msg.sender === 'boutique'
                          ? 'bg-indigo-50 border border-indigo-100 text-indigo-900'
                          : 'bg-purple-50 border border-purple-100 text-purple-900 italic font-mono text-[11px]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 font-bold text-[10px]">
                        <span>{msg.sender === 'buyer' ? selectedRoom.buyerName : msg.sender === 'boutique' ? selectedRoom.boutiqueName : '🤖 AI Mediator'}</span>
                        <span className="text-slate-400">{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
