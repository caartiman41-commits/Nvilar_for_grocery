'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Store,
  MapPin,
  Sparkles,
  Camera,
  Edit2,
  Plus,
  ShoppingBag,
  Film,
  Info,
  Check,
  X,
  ExternalLink,
  Eye,
  Heart,
  Clock,
  Trash2,
  RefreshCw,
  Tag,
  ShieldCheck,
  MessageCircle,
  Play,
  Share2,
  Bell,
  Upload,
  Star,
  Users,
  CheckCircle2,
  Zap,
  Navigation,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { SellerNotificationsDrawer } from './SellerNotificationsDrawer';
import { ProductBoostModal } from './ProductBoostModal';

export const BOUTIQUE_CATEGORIES = [
  { label: 'Designer Streetwear & Ethnic Fusion', emoji: '✨', desc: 'Heavy Tees, Fusion Apparel & Contemporary Kurtas' },
  { label: "Women's Ethnic & Festive Wear", emoji: '👗', desc: 'Sarees, Anarkalis, Shararas & Occasion Wear' },
  { label: "Men's Designer Wear & Kurta", emoji: '👕', desc: 'Linen Shirts, Bandhgalas, Kurtas & Structured Jackets' },
  { label: 'Handcrafted Silk & Handloom Heritage', emoji: '🧵', desc: 'Assam Muga, Eri, Banarasi & Hand-woven Weaves' },
  { label: 'Bridal Couture & Royal Lehengas', emoji: '👑', desc: 'Hand-embroidered Zardozi Lehengas & Wedding Wear' },
  { label: 'Western Dresses & Co-ord Sets', emoji: '💃', desc: 'Evening Gowns, Chic Co-ords & Minimalist Dresses' },
  { label: 'Luxury Resort & Pure Linen Edit', emoji: '🌴', desc: 'Resort Wear, Breathable Linen Shirts & Trousers' },
  { label: 'Outerwear, Jackets & Overcoats', emoji: '🧥', desc: 'Bombers, Trench Coats & Woolen Blazers' },
  { label: 'Tailored Pleated Pants & Trousers', emoji: '👖', desc: 'Structured Bottoms & Italian-style Pleated Fits' },
  { label: 'French Terry Knits & Loungewear', emoji: '☁️', desc: 'Heavyweight Hoodies, Sweatpants & Casual Luxury' },
  { label: 'Bespoke Tailoring & Designer Atelier', emoji: '✂️', desc: 'Custom Made-to-Measure & Fitting Services' },
  { label: 'Artisanal Jewelry, Bags & Accessories', emoji: '💍', desc: 'Statement Jewelry, Handcrafted Bags & Footwear' },
];

const CURATED_STORE_LOGOS = [
  {
    id: 'craft_bag',
    name: 'Artisan Paper Bag',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'leather_tote',
    name: 'Minimal Leather Tote',
    url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'gold_luxury',
    name: 'Luxury Atelier Bag',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'canvas_shopper',
    name: 'Organic Cotton Bag',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'denim_stitch',
    name: 'Atelier Tailoring Emblem',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'boutique_facade',
    name: 'Boutique Storefront',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
  },
];

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

interface SocialLink {
  platform: string;
  url: string;
}

interface ShopProfileData {
  id: string;
  owner_id: string;
  name: string;
  username?: string;
  logo_url: string;
  cover_image: string;
  bio: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  city: string;
  market_name: string;
  category: string;
  latitude?: number;
  longitude?: number;
  payout_upi_id: string;
  followers_count: number;
  total_orders: number;
  total_revenue: number;
  social_links?: SocialLink[];
  policies?: {
    returns?: string;
    courier?: string;
    tailoring?: string;
    timings?: string;
  };
}

interface StoryItem {
  id: string;
  shop_id: string;
  type: string;
  media_url: string;
  text_content: string;
  tagged_product_id: string | null;
  product_name?: string;
  product_thumbnail?: string;
  views_count: number;
  expires_at: string;
  created_at: string;
}

interface StatusNote {
  id: string;
  shop_id: string;
  content: string;
  expires_at: string;
  created_at: string;
}

interface ProductItem {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  original_price: number;
  thumbnail: string;
  fabric: string;
  fit: string;
  is_active: boolean;
  total_stock: number;
  is_sponsored?: boolean;
  boost_expires_at?: string | null;
  target_audience?: any;
}

interface ReelItem {
  id: string;
  caption: string;
  thumbnail_url: string;
  video_url: string;
  likes_count: number;
  views_count: number;
  tagged_product_id: string | null;
  product_name?: string;
  product_thumbnail?: string;
  duration_seconds: number;
}

interface SellerProfileProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

const NOTE_PRESETS = [
  'Store Open 🟢 Express Dispatch',
  'Midnight Drop Live ⚡ Flat 30% OFF',
  'Artisanal Tailoring & Custom Fits 🧵',
  'Limited Run: Only 5 Pieces Left 🔥',
  'Weekend Boutique Special Deals 🎁',
];

export const SellerProfile: React.FC<SellerProfileProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || (typeof window !== 'undefined' ? (localStorage.getItem('mitreno_user_id') || localStorage.getItem('mitreno_seller_user_id') || 'KD56AHEqvOWX322JKlVB4jkMoju2') : 'KD56AHEqvOWX322JKlVB4jkMoju2');
  const [shop, setShop] = useState<ShopProfileData | null>(null);
  const [activeNote, setActiveNote] = useState<StatusNote | null>(null);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthBannerDismissed, setIsHealthBannerDismissed] = useState(false);

  // Tab State: 'products' | 'reels' | 'about'
  const [activeTab, setActiveTab] = useState<'products' | 'reels' | 'about'>('products');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [activeViewingStoryIndex, setActiveViewingStoryIndex] = useState<number | null>(null);
  const [isStoryOptionsMenuOpen, setIsStoryOptionsMenuOpen] = useState(false);

  // Edit Profile Form state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editMarket, setEditMarket] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [editUpiId, setEditUpiId] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editLatitude, setEditLatitude] = useState<string>('26.1859');
  const [editLongitude, setEditLongitude] = useState<string>('91.7454');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Boost Modal state
  const [boostProduct, setBoostProduct] = useState<ProductItem | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  // Store Policies Modal state
  const [isEditPoliciesOpen, setIsEditPoliciesOpen] = useState(false);
  const [policyReturns, setPolicyReturns] = useState('7-Day Returns: Sizing and quality exchange guarantee.');
  const [policyCourier, setPolicyCourier] = useState('Delhivery Air, Blue Dart & DTDC express.');
  const [policyTailoring, setPolicyTailoring] = useState('Free hemming and custom fitting adjustments.');
  const [policyTimings, setPolicyTimings] = useState('10:00 AM - 8:30 PM | Same-day local dispatch');
  const [isSavingPolicies, setIsSavingPolicies] = useState(false);

  // Story Form state & Gallery File Input Ref
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyTaggedProduct, setStoryTaggedProduct] = useState('');
  const [isPostingStory, setIsPostingStory] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Note Form state
  const [noteContentInput, setNoteContentInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const backendUrl = getBackendUrl();

  // 1. Fetch complete profile data & pre-fetch notifications
  const fetchProfile = useCallback(async () => {
    if (!shopId && !userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (shopId) params.append('shop_id', shopId);
      if (userId) params.append('user_id', userId);

      const res = await fetch(`${backendUrl}/api/seller/profile?${params.toString()}`, {
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setActiveNote(data.active_note);
        setStories(data.stories || []);
        setProducts(data.products || []);
        setReels(data.reels || []);

        // Pre-fill edit inputs
        if (data.shop) {
          setEditName(data.shop.name || '');
          setEditUsername(data.shop.username || '');
          setEditBio(data.shop.bio || '');
          setEditLogoUrl(data.shop.logo_url || '');
          setEditCoverImage(data.shop.cover_image || '');
          setEditCity(data.shop.city || 'Guwahati');
          setEditMarket(data.shop.market_name || 'Fancy Bazaar Guild');
          setEditCategory(data.shop.category || 'Streetwear & Traditional Fusion');
          setEditUpiId(data.shop.payout_upi_id || '');
          setEditLatitude(data.shop.latitude !== undefined && data.shop.latitude !== null ? String(data.shop.latitude) : '26.1859');
          setEditLongitude(data.shop.longitude !== undefined && data.shop.longitude !== null ? String(data.shop.longitude) : '91.7454');

          // Extract social links (only Instagram)
          const links = Array.isArray(data.shop.social_links) ? data.shop.social_links : [];
          const insta = links.find((l: any) => l.platform === 'instagram')?.url || '';
          setEditInstagram(insta);

          // Populate policies if set
          if (data.shop.policies) {
            if (data.shop.policies.returns) setPolicyReturns(data.shop.policies.returns);
            if (data.shop.policies.courier) setPolicyCourier(data.shop.policies.courier);
            if (data.shop.policies.tailoring) setPolicyTailoring(data.shop.policies.tailoring);
            if (data.shop.policies.timings) setPolicyTimings(data.shop.policies.timings);
          }
        }
        if (data.active_note) {
          setNoteContentInput(data.active_note.content);
        }
      }

      // Immediately pre-fetch notification count so bell badge renders at 0ms
      try {
        const notifQueryParam = shopId ? `shop_id=${encodeURIComponent(shopId)}` : `user_id=${encodeURIComponent(userId)}`;
        const notifRes = await fetch(`${backendUrl}/api/seller/notifications?${notifQueryParam}`, {
          headers: { 'x-user-id': userId },
        });
        const notifData = await notifRes.json();
        if (notifData.success && notifData.notifications) {
          const unread = notifData.notifications.filter((n: any) => !n.is_read).length;
          setUnreadNotifsCount(unread);
        }
      } catch {}
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, shopId, userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getLocalApp = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('mitreno_seller_applications');
      if (raw) {
        const apps = JSON.parse(raw);
        return Array.isArray(apps) && apps.length > 0 ? apps[0] : null;
      }
    } catch {}
    return null;
  }, []);

  const localApp = getLocalApp();
  const displayName = shop?.name || localApp?.business_name || localApp?.businessName || 'fdf';
  const displayBio = shop?.bio || localApp?.business_description || 'AASSDTSRT, DDGSRT, Assam - 655255';
  const displayCity = shop?.city || localApp?.shop_address?.city || localApp?.city || 'Guwahati, Assam';
  const displayCategory = shop?.category || localApp?.business_category || 'Streetwear & Traditional Fusion';

  const hasActiveStories = Array.isArray(stories) && stories.length > 0;
  const hasCustomBio = displayBio && displayBio !== 'Local fashion artisan store on Nvilar.';
  const hasCustomLogo = !!shop?.logo_url;
  let healthScore = 50;
  if (hasCustomBio) healthScore += 25;
  if (hasCustomLogo) healthScore += 25;

  // Gallery Story File Selected
  const handleStoryFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoryMediaUrl(reader.result);
        setIsAddStoryOpen(true);
        sellerAudio.playMessageChime();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Logo File Selected
  const handleLogoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cover File Selected
  const handleCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 2. Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);

    const socialLinks: SocialLink[] = [];
    if (editInstagram.trim()) {
      socialLinks.push({ platform: 'instagram', url: editInstagram.trim() });
    }

    try {
      const res = await fetch(`${backendUrl}/api/seller/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shop?.id,
          name: editName,
          username: editUsername,
          bio: editBio,
          logo_url: editLogoUrl,
          city: editCity,
          market_name: editMarket,
          category: editCategory,
          payout_upi_id: editUpiId,
          latitude: Number(editLatitude) || 26.1859,
          longitude: Number(editLongitude) || 91.7454,
          social_links: socialLinks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setIsEditProfileOpen(false);
        sellerAudio.playDealChime();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_shop_updated', { detail: data.shop }));
          try {
            localStorage.setItem('mitreno_seller_shop', JSON.stringify(data.shop));
          } catch {}
        }
        if (onRefreshMetrics) onRefreshMetrics();
      } else {
        setProfileError(data.error || 'Failed to update store profile');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setProfileError(err.message || 'Connection error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save store customer policies
  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicies(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shop?.id,
          policies: {
            returns: policyReturns,
            courier: policyCourier,
            tailoring: policyTailoring,
            timings: policyTimings,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setIsEditPoliciesOpen(false);
        sellerAudio.playDealChime();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_shop_updated', { detail: data.shop }));
        }
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Failed to save policies:', err);
    } finally {
      setIsSavingPolicies(false);
    }
  };

  // Auto-detect Shop GPS Location with High Accuracy
  const handleDetectShopGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditLatitude(pos.coords.latitude.toFixed(6));
        setEditLongitude(pos.coords.longitude.toFixed(6));
        setIsDetectingGps(false);
        sellerAudio.playMessageChime();
      },
      (err) => {
        console.warn('GPS detection fallback:', err.message);
        setIsDetectingGps(false);
        alert('Could not detect location. Please check browser GPS permissions or enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 3. Post 24-hour story
  const handlePostStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMediaUrl.trim()) return;

    setIsPostingStory(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/profile/story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shop?.id,
          type: 'image',
          media_url: storyMediaUrl.trim(),
          text_content: storyCaption.trim(),
          tagged_product_id: storyTaggedProduct || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddStoryOpen(false);
        setStoryMediaUrl('');
        setStoryCaption('');
        setStoryTaggedProduct('');
        sellerAudio.playMessageChime();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_story_updated', { detail: data.story }));
        }
        fetchProfile();
      }
    } catch (err) {
      console.error('Error posting story:', err);
    } finally {
      setIsPostingStory(false);
    }
  };

  // 4. Delete story
  const handleDeleteStory = async (storyId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/seller/profile/story/${storyId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await res.json();
      if (data.success) {
        setActiveViewingStoryIndex(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_story_updated', { detail: { action: 'delete', id: storyId } }));
        }
        fetchProfile();
      }
    } catch (err) {
      console.error('Error deleting story:', err);
    }
  };

  // 5. Save Status Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContentInput.trim()) return;

    setIsSavingNote(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/profile/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shop?.id,
          content: noteContentInput.trim().slice(0, 60),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveNote(data.note);
        setIsEditNoteOpen(false);
        sellerAudio.playMessageChime();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno_note_updated', { detail: data.note }));
        }
      }
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // 6. Clear Note
  const handleClearNote = async () => {
    try {
      await fetch(`${backendUrl}/api/seller/profile/note?shop_id=${encodeURIComponent(shop?.id || '')}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });
      setActiveNote(null);
      setNoteContentInput('');
      setIsEditNoteOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mitreno_note_updated', { detail: null }));
      }
    } catch (err) {
      console.error('Error clearing note:', err);
    }
  };

  if (isLoading && !shop) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center py-24 text-center text-neutral-500 text-sm">
        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-amber-400" />
        Loading boutique showcase profile...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] pb-20 text-neutral-900 animate-in fade-in duration-200">
      {/* 1. PROFILE HEALTH ALERT BANNER (Only shown if profile needs attention < 100%) */}
      {!isHealthBannerDismissed && healthScore < 100 && (
        <div className="w-full border-b px-4 sm:px-8 py-3 transition-all duration-300 bg-amber-50/90 border-amber-200 text-amber-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 bg-amber-100 text-amber-700 border border-amber-300 animate-pulse">
                {healthScore}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️ STORE PROFILE NEEDS ATTENTION (NOT 100% COMPLETE)</span>
                  </h4>
                </div>
                <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                  Complete your profile bio & boutique logo to boost customer trust & store health rating.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Complete Profile Now →
              </button>
              <button
                onClick={() => setIsHealthBannerDismissed(true)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-200/60 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors"
                title="Dismiss Notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN STORE PROFILE CONTAINER (Attached flush to top & sides, Pure White layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 pt-4 sm:pt-6 relative z-10">
        {/* STORE PROFILE HEADER CARD */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          {/* Top Left: Avatar with Fixed Steady Glow Ring & Floating Note */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative inline-block self-start">
              {/* Floating Instagram-Style Note Bubble */}
              {activeNote ? (
                <div
                  onClick={() => setIsEditNoteOpen(true)}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 cursor-pointer z-20 group"
                  title="Click to update status note"
                >
                  <div className="px-3 py-1 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-400 shadow-md text-[11px] font-bold text-neutral-950 whitespace-nowrap flex items-center gap-1.5 group-hover:border-amber-500 transition-all">
                    <span>{activeNote.content}</span>
                    <Edit2 className="w-2.5 h-2.5 text-amber-600 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="w-2 h-2 bg-white border-r border-b border-amber-400 transform rotate-45 mx-auto -mt-1" />
                </div>
              ) : (
                <button
                  onClick={() => setIsEditNoteOpen(true)}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/95 border border-neutral-200 text-[10px] text-neutral-600 hover:text-neutral-950 whitespace-nowrap z-20 shadow-xs"
                >
                  + Leave note
                </button>
              )}

              {/* Hidden Gallery / File Input for 24h Story */}
              <input
                type="file"
                ref={storyFileInputRef}
                accept="image/*,video/*"
                className="hidden"
                onChange={handleStoryFileSelected}
              />

              {/* Instagram-Style Story Avatar (Fixed Steady Glow Ring - No Pulsing/Flashing) */}
              <div className="relative group/avatar">
                <div
                  onClick={() => {
                    if (hasActiveStories) setActiveViewingStoryIndex(0);
                    else storyFileInputRef.current?.click();
                  }}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full cursor-pointer transition-all ${
                    hasActiveStories
                      ? 'p-1 bg-gradient-to-tr from-[#FF1361] via-[#FF8A00] to-[#9900EF] shadow-md shadow-rose-500/20 hover:scale-105'
                      : 'p-0.5 bg-transparent border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                  title={hasActiveStories ? 'View Active Story' : 'Upload Story'}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100 border-2 border-white flex items-center justify-center font-black text-2xl text-amber-700 shadow-inner">
                    {shop?.logo_url ? (
                      <img src={shop.logo_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    storyFileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1246B8] hover:bg-[#0d348a] text-white border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-90 z-20"
                  title="Upload 24h Story from Gallery"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Shop Title, Badges & Bio */}
            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                  {displayName}
                </h2>
                {shop?.username && (
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                    @{shop.username}
                  </span>
                )}
                {/* Nvilar Verified Store Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nvilar Verified Store</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                  Store Live
                </span>
              </div>

              {/* Instagram link pill if available */}
              {Array.isArray(shop?.social_links) &&
                shop.social_links
                  .filter(l => l.platform === 'instagram' && l.url)
                  .map((link, idx) => (
                    <div key={idx} className="pt-0.5">
                      <a
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-xs font-bold text-purple-900 hover:opacity-90 transition-all shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-pink-600" />
                        <span>Instagram • {link.url.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '@')}</span>
                      </a>
                    </div>
                  ))}

              <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap font-medium">
                {displayBio}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 pt-1">
                <span className="flex items-center gap-1 font-medium text-neutral-800">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {shop?.market_name || 'Market'}, {displayCity}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-neutral-800">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  {displayCategory}
                </span>
                <span>•</span>
                <span className="text-neutral-500 font-mono text-[11px] font-semibold">
                  UPI: {shop?.payout_upi_id || 'Configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Actions: Edit Profile, Notifications Bell, Note */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-neutral-600" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative py-2 px-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              title="Store Notifications"
            >
              <Bell className="w-4 h-4 text-neutral-800" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsEditNoteOpen(true)}
              className="py-2 px-3 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              title="Update Status Note"
            >
              <MessageCircle className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>

        {/* 4 HIGH-CONTRAST STAT BOXES (Compact, Luxury Atelier Styling) */}
        <div className="pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Products Box */}
          <div className="py-2.5 px-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-none">
                {products.length}
              </div>
              <div className="text-[11px] font-semibold text-neutral-500 mt-1">Products</div>
            </div>
          </div>

          {/* Followers Box */}
          <div className="py-2.5 px-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-none">
                {shop?.followers_count !== undefined && shop?.followers_count !== null ? shop.followers_count.toLocaleString('en-IN') : '1'}
              </div>
              <div className="text-[11px] font-semibold text-neutral-500 mt-1">Followers</div>
            </div>
          </div>

          {/* Rating Box */}
          <div className="py-2.5 px-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 stroke-0" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-none flex items-center gap-1">
                <span>{shop?.rating !== undefined && shop?.rating !== null ? Number(shop.rating).toFixed(1) : '5.0'}</span>
                <span className="text-xs text-amber-500">★</span>
              </div>
              <div className="text-[11px] font-semibold text-neutral-500 mt-1">
                {shop?.review_count !== undefined && shop?.review_count !== null ? shop.review_count : 1} Reviews
              </div>
            </div>
          </div>

          {/* Likes Box (Replaced Fulfilled) */}
          <div className="py-2.5 px-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-rose-500 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 stroke-0" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-none">
                {reels.reduce((acc, r) => acc + (r.likes_count || 0), 0) || 12}
              </div>
              <div className="text-[11px] font-semibold text-neutral-500 mt-1">Likes</div>
            </div>
          </div>
        </div>
      </div>

      {/* SHOWCASE TABS NAVIGATION */}
      <div className="border-b border-neutral-200 flex items-center justify-center gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'border-neutral-950 text-neutral-950 font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>PRODUCTS ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reels'
              ? 'border-neutral-950 text-neutral-950 font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>REELS ({reels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'about'
              ? 'border-neutral-950 text-neutral-950 font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>POLICY</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB 1: PRODUCTS GRID WITH ⚡ BOOST */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Store Collection
            </h4>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('products')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in Catalog Studio →</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(prod => (
              <div
                key={prod.id}
                className="group rounded-2xl bg-white border border-neutral-200/90 overflow-hidden hover:border-neutral-300 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <img
                      src={prod.thumbnail}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.is_sponsored && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        <span>Sponsored</span>
                      </span>
                    )}
                    {!prod.is_active && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[9px] font-black uppercase">
                        Out of stock
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <h5 className="text-xs font-bold text-neutral-900 truncate">{prod.name}</h5>
                      <p className="text-[10px] text-neutral-500 truncate">{prod.fabric} • {prod.fit}</p>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-neutral-100">
                      <span className="text-sm font-black text-amber-600">
                        ₹{prod.base_price?.toLocaleString('en-IN')}
                      </span>
                      {prod.original_price > prod.base_price && (
                        <span className="text-[11px] text-neutral-400 line-through">
                          ₹{prod.original_price?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ⚡ BOOST PRODUCT BUTTON */}
                <div className="p-3 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setBoostProduct(prod);
                      setIsBoostModalOpen(true);
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      prod.is_sponsored
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 hover:bg-amber-500/25'
                        : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${prod.is_sponsored ? 'text-amber-600 fill-amber-500' : 'text-amber-400 fill-amber-400'}`} />
                    <span>{prod.is_sponsored ? '⚡ Boost Active' : '⚡ Boost (₹99)'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REELS GRID */}
      {activeTab === 'reels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Fashion Drops & Runway Shorts
            </h4>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('reels')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Upload New Reel →</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {reels.map(reel => (
              <div
                key={reel.id}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200/90 shadow-xs"
              >
                <img
                  src={reel.thumbnail_url}
                  alt={reel.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-end">
                    <span className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-white font-medium line-clamp-2 drop-shadow">
                      {reel.caption}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-neutral-300 font-semibold">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {reel.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400 fill-current" />
                        {reel.likes_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STORE POLICIES & INFO (Fully Editable) */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Verification Card */}
            <div className="p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Store Verification & Guild Status</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                  Verified Tier 1
                </span>
              </div>
              <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
                <p>• <strong>Store Name:</strong> {shop?.name}</p>
                <p>• <strong>Hub / Guild:</strong> {shop?.market_name}, {shop?.city}</p>
                <p>• <strong>Status:</strong> Approved & Verified Merchant</p>
                <p>• <strong>Platform Commission:</strong> 5% on completed orders</p>
                <p>• <strong>Settlement Cycle:</strong> T+1 Automated UPI payout ({shop?.payout_upi_id})</p>
              </div>
            </div>

            {/* Customer Policies Card (Interactive & Editable) */}
            <div className="p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>Customer Policies</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditPoliciesOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-amber-700" />
                  <span>Edit Policies</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
                <p>• <strong>Return Policy:</strong> {policyReturns}</p>
                <p>• <strong>Courier Partners:</strong> {policyCourier}</p>
                <p>• <strong>Custom Tailoring:</strong> {policyTailoring}</p>
                <p>• <strong>Store Timings:</strong> {policyTimings}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* MODAL 1: EDIT STORE PROFILE MODAL (Avatar at Top, Instagram Only, No Banner) */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-neutral-200 p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-neutral-900">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-neutral-950">Edit Store Profile</h3>
              <p className="text-xs text-neutral-500">
                Update how your store appears on Nvilar search, city maps, and storefront feed.
              </p>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* TOP CENTER: AVATAR PICKER (Logo Bags, Emblems - No Human Faces) */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
                <div className="relative inline-block mx-auto">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 bg-white shadow-md mx-auto flex items-center justify-center">
                    {editLogoUrl ? (
                      <img src={editLogoUrl} alt="Store Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-xl text-amber-700">{editName.slice(0, 2).toUpperCase() || 'ST'}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white shadow-md border-2 border-white transition-transform hover:scale-110"
                    title="Upload Custom Image"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-neutral-900">Store Avatar / Logo</div>
                  <p className="text-[11px] text-neutral-500">
                    Upload your store emblem or select an artisan shopping bag preset below
                  </p>
                </div>

                {/* Curated AI Logo Bag Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {CURATED_STORE_LOGOS.map(logo => (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => setEditLogoUrl(logo.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        editLogoUrl === logo.url
                          ? 'border-amber-500 ring-2 ring-amber-400/50 scale-105 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 opacity-80 hover:opacity-100'
                      }`}
                      title={logo.name}
                    >
                      <img src={logo.url} alt={logo.name} className="w-full h-full object-cover" />
                      {editLogoUrl === logo.url && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-amber-900 bg-white rounded-full p-0.5 shadow-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileSelected}
                />
              </div>

              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Store Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Username (@handle) *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-neutral-400">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="store_handle"
                      className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 font-mono placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Used by shoppers to find your store</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Bio / Craft Description *</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* ONLY INSTAGRAM LINK (Website and WhatsApp removed) */}
              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Instagram / Reels Link
                </label>
                <input
                  type="text"
                  value={editInstagram}
                  onChange={e => setEditInstagram(e.target.value)}
                  placeholder="https://instagram.com/storename or @storename"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
                <p className="text-[10px] text-neutral-400 mt-0.5">Displays on your store profile for shoppers to follow your drops</p>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Market / Hub</label>
                  <input
                    type="text"
                    value={editMarket}
                    onChange={e => setEditMarket(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category Dropdown Selector */}
              <div className="relative">
                <label className="text-xs font-bold text-neutral-800 block mb-1 flex items-center justify-between">
                  <span>Store Fashion Category *</span>
                  <span className="text-[10px] font-normal text-neutral-500">Tap to choose</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 flex items-center justify-between hover:bg-neutral-100/70 hover:border-neutral-300 transition-all cursor-pointer text-left shadow-2xs"
                  >
                    <span className="font-semibold text-neutral-900 truncate">
                      {editCategory || 'Select Fashion Category...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-neutral-900 transition-transform shrink-0 ml-2 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Interactive Dropdown Menu with Fashion Categories */}
                {isCategoryDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-neutral-200 py-1.5 z-50 divide-y divide-neutral-100 animate-in fade-in zoom-in-95 duration-150">
                      {BOUTIQUE_CATEGORIES.map((cat, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEditCategory(cat.label);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                            editCategory === cat.label ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <span className="text-base shrink-0 mt-0.5">{cat.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                              <span className="truncate">{cat.label}</span>
                              {editCategory === cat.label && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1.5" />}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate mt-0.5">{cat.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Custom Category Input Fallback */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400 shrink-0">Or custom:</span>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    placeholder="Type custom boutique category..."
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-neutral-100/80 border border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 flex-1"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STORE POLICIES MODAL */}
      {isEditPoliciesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xl relative text-neutral-900">
            <button
              onClick={() => setIsEditPoliciesOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-black text-neutral-950">Edit Customer Policies</h3>
              <p className="text-xs text-neutral-500">
                Configure your store return period, courier partners, alterations and timings.
              </p>
            </div>

            <form onSubmit={handleSavePolicies} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Return & Exchange Policy</label>
                <input
                  type="text"
                  value={policyReturns}
                  onChange={e => setPolicyReturns(e.target.value)}
                  placeholder="e.g. 7-Day Returns: Sizing and quality exchange guarantee."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Courier Partners</label>
                <input
                  type="text"
                  value={policyCourier}
                  onChange={e => setPolicyCourier(e.target.value)}
                  placeholder="e.g. Delhivery Air, Blue Dart & DTDC express."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Custom Tailoring / Alterations</label>
                <input
                  type="text"
                  value={policyTailoring}
                  onChange={e => setPolicyTailoring(e.target.value)}
                  placeholder="e.g. Free hemming and custom fitting adjustments."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Store Timings & Dispatch</label>
                <input
                  type="text"
                  value={policyTimings}
                  onChange={e => setPolicyTimings(e.target.value)}
                  placeholder="e.g. 10:00 AM - 8:30 PM | Same-day local dispatch"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditPoliciesOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPolicies}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingPolicies ? 'Saving...' : 'Save Policies'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCT BOOST MODAL (₹99 for 24h) */}
      {boostProduct && (
        <ProductBoostModal
          isOpen={isBoostModalOpen}
          onClose={() => {
            setIsBoostModalOpen(false);
            setBoostProduct(null);
          }}
          product={boostProduct}
          shopId={shop?.id}
          onBoostSuccess={(updatedProd) => {
            setProducts(prev => prev.map(p => p.id === updatedProd.id ? { ...p, ...updatedProd } : p));
          }}
        />
      )}

      {/* MODAL 2: ADD 24H STORY MODAL */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xl relative text-neutral-900">
            <button
              onClick={() => setIsAddStoryOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase">
                <Clock className="w-3 h-3" />
                Expires in 24 Hours
              </span>
              <h3 className="text-lg font-bold text-neutral-950">Post Boutique Story</h3>
              <p className="text-xs text-neutral-500">
                Share behind-the-scenes, runway fits, or flash announcements.
              </p>
            </div>

            <form onSubmit={handlePostStory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Story Image URL *</label>
                <input
                  type="url"
                  value={storyMediaUrl}
                  onChange={e => setStoryMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              {storyMediaUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img src={storyMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Caption / Overlay Text</label>
                <input
                  type="text"
                  value={storyCaption}
                  onChange={e => setStoryCaption(e.target.value)}
                  placeholder="e.g. Fresh stock arrived! Tap product to bargain ⚡"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Tag a Product</label>
                <select
                  value={storyTaggedProduct}
                  onChange={e => setStoryTaggedProduct(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="">-- No Tagged Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.base_price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStoryOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingStory || !storyMediaUrl}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isPostingStory ? 'Publishing...' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STATUS NOTE MODAL */}
      {isEditNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-amber-300 p-6 space-y-4 shadow-2xl relative text-neutral-900">
            <button
              onClick={() => setIsEditNoteOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                Instagram-Style Status Note
              </span>
              <h3 className="text-base font-bold text-neutral-950">Share what&apos;s on your mind</h3>
              <p className="text-xs text-neutral-500">
                Visible as a thought bubble on your boutique avatar for 24 hours.
              </p>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  maxLength={60}
                  value={noteContentInput}
                  onChange={e => setNoteContentInput(e.target.value)}
                  placeholder="e.g. Store Open 🟢 Express Dispatch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500">
                  {noteContentInput.length}/60
                </span>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-neutral-500">Quick suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoteContentInput(preset)}
                      className="text-[10px] py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 border border-neutral-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {activeNote && (
                  <button
                    type="button"
                    onClick={handleClearNote}
                    className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-100"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditNoteOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNote || !noteContentInput.trim()}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
                >
                  {isSavingNote ? 'Saving...' : 'Set Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FULLSCREEN 24H STORY VIEWER */}
      {activeViewingStoryIndex !== null && stories[activeViewingStoryIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col justify-between p-4">
            {/* Background Story Image */}
            <img
              src={stories[activeViewingStoryIndex].media_url}
              alt="Story"
              className="absolute inset-0 w-full h-full object-cover -z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 -z-10" />

            {/* Top Bar: Progress + Shop Info + Close */}
            <div className="space-y-3 z-10">
              {/* Progress bars */}
              <div className="flex items-center gap-1.5">
                {stories.map((_, idx) => (
                  <div key={idx} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all ${
                        idx === activeViewingStoryIndex ? 'w-full' : idx < activeViewingStoryIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-white/20">
                    <img src={shop?.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-none">{shop?.name}</h4>
                    <span className="text-[10px] text-neutral-300 font-medium mt-0.5 block">
                      {formatRelativeTime(stories[activeViewingStoryIndex]?.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 relative">
                  {/* Instagram-style 3-dots More Menu */}
                  <button
                    type="button"
                    onClick={() => setIsStoryOptionsMenuOpen(!isStoryOptionsMenuOpen)}
                    className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                    title="Story options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isStoryOptionsMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsStoryOptionsMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-neutral-900/95 border border-neutral-700/80 p-1.5 shadow-2xl z-40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setIsStoryOptionsMenuOpen(false);
                            handleDeleteStory(stories[activeViewingStoryIndex].id);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-500/20 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Delete Story</span>
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsStoryOptionsMenuOpen(false);
                      setActiveViewingStoryIndex(null);
                    }}
                    className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Click Zones */}
            <div className="absolute inset-y-16 inset-x-0 flex z-0">
              <div
                onClick={() => setActiveViewingStoryIndex(prev => (prev && prev > 0 ? prev - 1 : 0))}
                className="w-1/2 h-full cursor-pointer"
              />
              <div
                onClick={() =>
                  setActiveViewingStoryIndex(prev =>
                    prev !== null && prev < stories.length - 1 ? prev + 1 : null
                  )
                }
                className="w-1/2 h-full cursor-pointer"
              />
            </div>

            {/* Bottom: Caption & Tagged Product Chip */}
            <div className="space-y-3 z-10">
              {stories[activeViewingStoryIndex].tagged_product_id && (
                <div className="p-2.5 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-amber-500/40 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold truncate">
                      {stories[activeViewingStoryIndex].product_name || 'Featured Garment'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950">
                    Shop
                  </span>
                </div>
              )}

              {stories[activeViewingStoryIndex].text_content && (
                <p className="text-xs text-white font-medium bg-black/60 p-2.5 rounded-xl backdrop-blur-md">
                  {stories[activeViewingStoryIndex].text_content}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {stories[activeViewingStoryIndex].views_count} views
                </span>
                <span>Tap right for next story</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELLER NOTIFICATIONS DRAWER */}
      <SellerNotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        userId={userId}
        shopId={shop?.id}
        onNavigateToTab={(tab) => {
          setIsNotificationsOpen(false);
          if (onNavigateToTab) onNavigateToTab(tab);
        }}
        onUnreadCountChange={setUnreadNotifsCount}
      />

      {/* ⚡ INSTAGRAM-STYLE PRODUCT BOOST MODAL */}
      <ProductBoostModal
        isOpen={isBoostModalOpen}
        onClose={() => {
          setIsBoostModalOpen(false);
          setBoostProduct(null);
        }}
        product={boostProduct}
        userId={userId}
        shopId={shop?.id}
        onBoostSuccess={() => {
          fetchProfile();
          if (onRefreshMetrics) onRefreshMetrics();
        }}
      />
    </div>
  );
};
