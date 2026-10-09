'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/lib/products-data';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Search, 
  MoreHorizontal, 
  MessageCircle, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Play, 
  Heart, 
  Grid, 
  Video, 
  Store, 
  Flag, 
  AlertTriangle, 
  Share2, 
  X, 
  CheckCircle2,
  Check,
  Plus,
  Eye,
  ShoppingBag,
  Tag,
  ExternalLink
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

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

interface ShopProfileModalProps {
  shop: Product['shop'] | null;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductClick: (product: Product) => void;
  onOpenChat: (shop: Product['shop']) => void;
}

export const ShopProfileModal: React.FC<ShopProfileModalProps> = ({
  shop,
  isOpen,
  onClose,
  products,
  onProductClick,
  onOpenChat
}) => {
  const { user, requireAuth } = useAuth();
  const backendUrl = getBackendUrl();
  const [activeTab, setActiveTab] = useState<'shop' | 'drops'>('shop');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeReel, setActiveReel] = useState<number | null>(null);
  
  // Rating Modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Live Rating & Review Count State
  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [liveReviewCount, setLiveReviewCount] = useState<number | null>(null);

  // YouTube-Style Smart Sticky Tab Bar State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isPastProfile, setIsPastProfile] = useState(false);
  const [showStickyTabs, setShowStickyTabs] = useState(true);
  const lastScrollY = useRef(0);

  // Live Follow, Live Shop Profile & 24h Stories / Notes State
  const [liveShop, setLiveShop] = useState<any>(shop);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(() => {
    return parseInt((shop as any)?.followers || (shop as any)?.followers_count || 0, 10);
  });
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [storyLikes, setStoryLikes] = useState<Record<string, number>>({});

  // Record story view when viewer opens
  useEffect(() => {
    if (activeStoryIdx !== null && stories[activeStoryIdx]) {
      const storyId = stories[activeStoryIdx].id;
      const shopId = (shop as any)?.id;
      if (storyId && shopId) {
        fetch(`${backendUrl}/api/shops/${shopId}/stories/${storyId}/view`, {
          method: 'POST',
        }).catch(() => {});
      }
    }
  }, [activeStoryIdx, stories, shop, backendUrl]);

  // Handle like story
  const handleLikeStory = async (storyId: string) => {
    if (likedStories[storyId]) return;
    setLikedStories(prev => ({ ...prev, [storyId]: true }));
    setStoryLikes(prev => ({ ...prev, [storyId]: (prev[storyId] || 0) + 1 }));

    const shopId = (shop as any)?.id;
    if (shopId) {
      try {
        await fetch(`${backendUrl}/api/shops/${shopId}/stories/${storyId}/like`, {
          method: 'POST',
        });
      } catch (e) {
        console.warn('Could not record story like:', e);
      }
    }
  };

  // Sync initial shop prop
  useEffect(() => {
    if (shop) setLiveShop(shop);
  }, [shop]);

  // Reset scroll and state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsPastProfile(false);
      setShowStickyTabs(true);
      lastScrollY.current = 0;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      setLiveRating(null);
      setLiveReviewCount(null);
      setHasRated(false);
    }
  }, [isOpen, (shop as any)?.id]);

  useEffect(() => {
    if (!isOpen || !shop) return;
    const sId = (shop as any).id;
    if (!sId) return;

    // 0. Fetch Latest Live Shop Profile & Catalog Info
    apiClient.get(`/api/shops/${sId}`)
      .then(data => {
        if (data && data.success && data.shop) {
          setLiveShop(data.shop);
          if (data.active_note) setActiveNote(data.active_note);
          if (Array.isArray(data.stories)) setStories(data.stories);
          if (data.shop.rating) setLiveRating(data.shop.rating);
          if (data.shop.review_count !== undefined) setLiveReviewCount(data.shop.review_count);
          if (data.shop.followers_count !== undefined) setFollowersCount(data.shop.followers_count);
        }
      })
      .catch(() => {});

    // 1. Fetch Follow Status
    if (user?.uid) {
      apiClient.get(`/api/shops/${sId}/follow-status`, { user_id: user.uid })
        .then(data => {
          if (data.success) {
            setIsFollowing(data.is_following);
            if (data.followers_count !== undefined) {
              setFollowersCount(data.followers_count);
            }
          }
        })
        .catch(() => {});
    } else {
      setIsFollowing(false);
    }

    // 2. Fetch Active 24h Stories
    apiClient.get(`/api/shops/${sId}/stories`)
      .then(data => {
        if (data.success && Array.isArray(data.stories)) {
          setStories(data.stories);
        }
      })
      .catch(() => {});

    // 2.5 Fetch Active Status Note
    apiClient.get(`/api/shops/${sId}/note`)
      .then(data => {
        if (data && data.success && data.note) {
          setActiveNote(data.note);
        }
      })
      .catch(() => {});

    // 3. Fetch Live Reviews & Rating
    apiClient.get(`/api/shops/${sId}/reviews`)
      .then(data => {
        if (data && data.success) {
          if (data.average_rating !== undefined) {
            setLiveRating(data.average_rating);
          }
          if (data.review_count !== undefined) {
            setLiveReviewCount(data.review_count);
          }
          if (user?.uid && Array.isArray(data.reviews)) {
            const myReview = data.reviews.find((r: any) => r.user_id === user.uid);
            if (myReview) {
              setHasRated(true);
            }
          }
        }
      })
      .catch(() => {});
  }, [isOpen, shop, user]);

  // Real-time synchronization with Seller Dashboard edits
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleShopUpdated = (e: any) => {
      const updated = e.detail;
      if (!updated) return;
      const currentId = (shop as any)?.id || (liveShop as any)?.id;
      const ownerId = (shop as any)?.owner_id || (liveShop as any)?.owner_id;
      if (updated.id === currentId || (ownerId && updated.owner_id === ownerId)) {
        setLiveShop((prev: any) => ({ ...prev, ...updated }));
        if (updated.rating !== undefined) setLiveRating(updated.rating);
        if (updated.review_count !== undefined) setLiveReviewCount(updated.review_count);
        if (updated.followers_count !== undefined) setFollowersCount(updated.followers_count);
      }
    };

    const handleStoryUpdated = () => {
      const sId = (shop as any)?.id || (liveShop as any)?.id;
      if (!sId) return;
      apiClient.get(`/api/shops/${sId}/stories`).then(data => {
        if (data.success && Array.isArray(data.stories)) {
          setStories(data.stories);
        }
      }).catch(() => {});
    };

    const handleNoteUpdated = (e: any) => {
      setActiveNote(e.detail);
    };

    window.addEventListener('mitreno_shop_updated', handleShopUpdated);
    window.addEventListener('mitreno_story_updated', handleStoryUpdated);
    window.addEventListener('mitreno_note_updated', handleNoteUpdated);

    return () => {
      window.removeEventListener('mitreno_shop_updated', handleShopUpdated);
      window.removeEventListener('mitreno_story_updated', handleStoryUpdated);
      window.removeEventListener('mitreno_note_updated', handleNoteUpdated);
    };
  }, [shop, liveShop]);

  // YouTube-Style Scroll Direction Handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const currentScrollY = scrollContainerRef.current.scrollTop;
    const delta = currentScrollY - lastScrollY.current;

    const profileHeight = profileRef.current ? profileRef.current.offsetHeight : 280;
    const past = currentScrollY >= profileHeight - 15;
    setIsPastProfile(past);

    if (!past) {
      // User is at or near the top: tabs are in their standard inline place
      setShowStickyTabs(true);
    } else {
      // User is scrolled past profile browsing products
      if (delta > 6) {
        // Scrolling DOWN into products -> hide tabs so only top header remains
        setShowStickyTabs(false);
      } else if (delta < -6) {
        // Scrolling UP / pulling down -> smoothly slide tabs back out directly under top header
        setShowStickyTabs(true);
      }
    }

    lastScrollY.current = currentScrollY;
  }, []);

  const handleToggleFollow = async () => {
    if (!user) {
      requireAuth();
      return;
    }
    const sId = (shop as any)?.id;
    if (!sId || isFollowLoading) return;

    // Optimistic toggle
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount(prev => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));
    setIsFollowLoading(true);

    try {
      const data = await apiClient.post(`/api/shops/${sId}/follow`);
      if (data.success) {
        setIsFollowing(data.is_following);
        setFollowersCount(data.followers_count);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!isOpen || !shop) return null;

  const activeShopData = liveShop || shop;

  // Derive extra details
  const shopLogo = (activeShopData as any).logo_url || (activeShopData as any).logo || 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=150&h=150&fit=crop';
  const shopBio = (activeShopData as any).bio || 'Boutique shop profile.';
  const shopLocation = (activeShopData as any).city || (activeShopData as any).city_name || (activeShopData as any).locationName || (activeShopData as any).location || 'Assam, India';
  const shopName = activeShopData.name || shop.name;
  const isShopVerified = activeShopData.is_verified !== undefined ? activeShopData.is_verified : !!shop.verified;
  const marketName = (activeShopData as any).market_name || (activeShopData as any).market || '';
  const categoryName = (activeShopData as any).category || (activeShopData as any).business_category || '';

  // Derive Instagram link
  let instagramUrl = '';
  if (Array.isArray((activeShopData as any).social_links)) {
    const ig = (activeShopData as any).social_links.find((l: any) => l.platform === 'instagram' && l.url);
    if (ig) instagramUrl = ig.url;
  } else if (typeof (activeShopData as any).social_links === 'string') {
    try {
      const parsed = JSON.parse((activeShopData as any).social_links);
      if (Array.isArray(parsed)) {
        const ig = parsed.find((l: any) => l.platform === 'instagram' && l.url);
        if (ig) instagramUrl = ig.url;
      }
    } catch (_) {}
  }
  if (!instagramUrl && (activeShopData as any).instagram_url) {
    instagramUrl = (activeShopData as any).instagram_url;
  }

  // Derive live rating and review count
  const rawRating = liveRating !== null ? liveRating : (
    typeof activeShopData.rating === 'string' ? parseFloat(activeShopData.rating) : (activeShopData.rating || 0)
  );
  const rawReviewCount = liveReviewCount !== null ? liveReviewCount : (
    (activeShopData as any)?.review_count !== undefined ? parseInt((activeShopData as any).review_count, 10) :
    (activeShopData as any)?.reviews_count !== undefined ? parseInt((activeShopData as any).reviews_count, 10) : 0
  );
  const hasReviews = !isNaN(rawRating) && rawRating > 0 && !isNaN(rawReviewCount) && rawReviewCount > 0;

  // Filter products for this shop
  const shopProducts = products.filter(p => {
    const sName = (shopName || '').toLowerCase().trim();
    const sId = (activeShopData as any)?.id || (activeShopData as any)?.shop_id || '';
    
    const pShopName = (p.shop?.name || (p as any).shop_name || '').toLowerCase().trim();
    const pShopId = (p.shop as any)?.id || (p as any).shop_id || '';
    
    if (sId && pShopId && sId === pShopId) return true;
    if (sName && pShopName && sName === pShopName) return true;
    return false;
  });
  const displayProducts = shopProducts; 

  // Real drops/reels (empty until boutique uploads drops)
  const drops: any[] = [];

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating === 0) return;
    if (!user) {
      requireAuth();
      return;
    }
    const sId = (shop as any)?.id;
    if (!sId) return;

    try {
      const res = await apiClient.post(`/api/shops/${sId}/reviews`, {
        rating: selectedRating,
        review: reviewComment.trim(),
      });
      if (res && res.success) {
        if (res.shop_rating !== undefined) {
          setLiveRating(res.shop_rating);
        }
        if (res.review_count !== undefined) {
          setLiveReviewCount(res.review_count);
        }
      }
      setShowRatingSuccess(true);
      setTimeout(() => {
        setShowRatingSuccess(false);
        setIsRatingModalOpen(false);
        setHasRated(true);
        setSelectedRating(0);
        setHoveredRating(0);
        setReviewComment('');
      }, 1800);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const ratingLabels = ['Tap a star to rate', 'Poor Experience', 'Below Average', 'Good Experience', 'Very Good', 'Exceptional Service!'];

  return (
    <div className="fixed inset-0 z-[110] bg-neutral-100/95 backdrop-blur-xl flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white relative z-30 shadow-xs border-b border-neutral-100 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 px-4 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-neutral-900 truncate">{shopName}</h1>
            {isShopVerified && <VerifiedBadge className="w-4 h-4 shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Online
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-neutral-100 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      alert('Report submitted to moderation team.');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-4 h-4 text-neutral-500" /> Report Shop
                  </button>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      alert('Complaint registered. We will contact you shortly.');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" /> File a Complaint
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar pb-10 relative z-10"
      >
        {/* Profile Info Section - Attached directly to header */}
        <div 
          ref={profileRef}
          className={`bg-white px-4 pb-5 relative rounded-b-3xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] z-20 transition-all ${
            activeNote ? 'pt-8' : 'pt-4'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Shop Logo Avatar with Instagram-Style 24h Story Ring & Floating Status Note */}
            <div className="relative inline-block shrink-0">
              {/* Floating Instagram-Style Status Note Bubble */}
              {activeNote && (
                <div className="absolute -top-6.5 left-1 z-30 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                  <div className="max-w-[240px] px-3 py-1 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-[0_4px_14px_rgba(0,0,0,0.08)] text-[11px] font-bold text-neutral-900 whitespace-nowrap flex items-center gap-1.5">
                    {activeNote.emoji && !activeNote.content?.includes(activeNote.emoji) && (
                      <span className="text-xs shrink-0">{activeNote.emoji}</span>
                    )}
                    <span className="truncate">{activeNote.content || activeNote.note_text}</span>
                  </div>
                  {/* Speech bubble pointer pointing down to avatar */}
                  <div className="w-2 h-2 bg-white border-r border-b border-amber-300 transform rotate-45 ml-6 -mt-1 shadow-xs" />
                </div>
              )}

              <div
                onClick={() => {
                  if (stories.length > 0) setActiveStoryIdx(0);
                }}
                className={`relative shrink-0 w-16 h-16 rounded-full transition-transform ${
                  stories.length > 0
                    ? 'p-[2.5px] bg-gradient-to-tr from-[#FF1361] via-[#FF8A00] to-[#9900EF] shadow-md shadow-rose-500/25 cursor-pointer hover:scale-105'
                    : 'p-0.5 bg-transparent border-2 border-neutral-200'
                }`}
                title={stories.length > 0 ? 'Click to view Boutique Story' : undefined}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                  <img 
                    src={shopLogo} 
                    alt={shopName} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10 shadow-xs"></div>
              </div>
            </div>

            {/* Shop Name & Location */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-[19px] font-bold text-neutral-900 leading-tight">
                  {shopName}
                </h2>
                {isShopVerified && <VerifiedBadge className="w-5 h-5 drop-shadow-xs shrink-0" />}
              </div>
              {(activeShopData as any)?.username && (
                <span className="text-xs font-mono font-bold text-neutral-500">
                  @{(activeShopData as any).username}
                </span>
              )}
              <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {shopLocation}
              </p>
            </div>
          </div>

          <div className="pt-3">
            {/* Instagram Pill (If available) */}
            {instagramUrl && (
              <div className="pt-0.5 mb-2">
                <a
                  href={instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border border-purple-200/80 text-xs font-bold text-purple-900 hover:opacity-90 transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Instagram • {instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '@').replace(/\/$/, '')}</span>
                </a>
              </div>
            )}

            {/* Bio Section with Sharp High-Intensity Typography */}
            <p className="text-[13.5px] text-neutral-800 font-medium leading-relaxed tracking-tight whitespace-pre-wrap select-text">
              {shopBio}
            </p>

            {/* Location & Category Badges (Matching Seller Profile) */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100/90 px-2.5 py-1 rounded-lg border border-neutral-200/70 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{marketName ? `${marketName}, ` : ''}{shopLocation}</span>
              </span>

              {categoryName && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70 shadow-2xs">
                  <Tag className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{categoryName}</span>
                </span>
              )}

              {isShopVerified && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-bold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Nvilar Verified Store</span>
                </span>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between mt-4 py-3 border-y border-neutral-100 px-1 sm:px-4">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                  {hasReviews ? (
                    <>
                      {rawRating.toFixed(1)} <span className="text-neutral-500 text-xs font-semibold">({rawReviewCount})</span>
                    </>
                  ) : (
                    <span className="text-neutral-900 font-bold">New</span>
                  )}
                  <Star className={`w-3.5 h-3.5 ml-0.5 ${hasReviews ? 'text-[#FFC200] fill-[#FFC200]' : 'text-neutral-400'}`} />
                </span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Rating</span>
              </div>
              <div className="w-px h-8 bg-neutral-200"></div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                  {((shop as any).likes || (shop as any).likes_count || 0).toLocaleString('en-IN')} <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                </span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Likes</span>
              </div>
              <div className="w-px h-8 bg-neutral-200"></div>
              
              {/* REPLACED < 5 mins with Live Interactive Follow Button */}
              <div className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                  className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isFollowing
                      ? 'bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200'
                      : 'bg-[#1246B8] hover:bg-[#0d348a] text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                  {followersCount.toLocaleString('en-IN')} Followers
                </span>
              </div>
            </div>

            {/* Action Buttons - Perfectly matched style */}
            <div className="flex items-center gap-3 mt-4">
              {hasRated ? (
                <button 
                  disabled
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rated
                </button>
              ) : (
                <button 
                  onClick={() => setIsRatingModalOpen(true)}
                  className="flex-1 py-2.5 bg-[#1246B8] text-white border border-[#1246B8] rounded-xl font-bold text-sm shadow-sm hover:bg-[#0d348a] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-white" /> Rate Shop
                </button>
              )}
              <button 
                onClick={() => {
                  onClose();
                  onOpenChat(shop);
                }}
                className="flex-1 py-2.5 bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-xl font-bold text-sm shadow-sm hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Bar - YouTube-Style Auto-docking & Scroll Reveal */}
        <div 
          className={`bg-white sticky top-0 z-20 border-b border-neutral-200 transition-all duration-300 ease-out ${
            isPastProfile
              ? showStickyTabs
                ? 'translate-y-0 opacity-100 shadow-sm'
                : '-translate-y-full opacity-0 pointer-events-none'
              : 'translate-y-0 opacity-100 shadow-none'
          }`}
        >
          <div className="flex">
            <button 
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'shop' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Grid className="w-4 h-4" /> Shop
              {activeTab === 'shop' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-900 rounded-t-full"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('drops')}
              className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'drops' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Video className="w-4 h-4" /> Drops
              {activeTab === 'drops' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-900 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white min-h-[50vh]">
          {activeTab === 'shop' ? (
            <div className="p-3">
              {displayProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {displayProducts.map((p) => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onOpenProduct={() => {
                        onClose();
                        onProductClick(p);
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-800">No Garments Listed</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mt-1">This boutique has no active products listed in their catalog right now.</p>
                </div>
              )}
            </div>
          ) : (
            drops.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {drops.map((drop) => (
                  <div 
                    key={drop.id} 
                    onClick={() => setActiveReel(drop.id)}
                    className="relative aspect-[9/16] bg-neutral-200 group cursor-pointer overflow-hidden"
                  >
                    <Image 
                      src={drop.url}
                      alt="Drop reel"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Views count */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-bold z-10">
                      <Play className="w-3 h-3 fill-white" />
                      {drop.views}
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10">
                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                  <Play className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800">No Runway Drops Yet</h3>
                <p className="text-xs text-neutral-500 max-w-xs mt-1">This boutique has not published video reels or runway drops yet.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Reel Full Screen Viewer Modal */}
      {activeReel !== null && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col font-sans animate-in slide-in-from-bottom duration-300">
          {(() => {
            const reel = drops.find(d => d.id === activeReel);
            if (!reel) return null;
            return (
              <>
                {/* Top Bar */}
                <div className="absolute top-0 w-full z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent text-white pt-safe">
                  <button onClick={() => setActiveReel(null)} className="p-2 hover:bg-white/20 rounded-full transition-all backdrop-blur-md cursor-pointer">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <span className="font-bold text-sm tracking-wide">Drops</span>
                  <button className="p-2 hover:bg-white/20 rounded-full transition-all backdrop-blur-md cursor-pointer">
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>

                {/* Video/Image Container */}
                <div className="flex-1 relative w-full h-full bg-neutral-900">
                  <Image 
                    src={reel.url} 
                    alt="Reel" 
                    fill 
                    className="object-cover" 
                    priority
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                  
                  {/* Floating Actions Right */}
                  <div className="absolute right-3 bottom-44 flex flex-col gap-6 items-center z-10">
                    <button className="flex flex-col items-center gap-1 group cursor-pointer active:scale-95 transition-all">
                      <div className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-lg">
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className="text-white text-xs font-bold drop-shadow-md">24.5K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group cursor-pointer active:scale-95 transition-all">
                      <div className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-lg">
                        <MessageCircle className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className="text-white text-xs font-bold drop-shadow-md">1.2K</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group cursor-pointer active:scale-95 transition-all">
                      <div className="w-11 h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-lg">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                    </button>
                  </div>
                  
                  {/* Bottom Info & Buy Button */}
                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col gap-3 pb-safe">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-[1px] shadow-md">
                        <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Store className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="text-white font-bold text-[15px] drop-shadow-md">{shop.name}</span>
                    </div>
                    <p className="text-white/90 text-[13px] font-medium drop-shadow-md max-w-[85%] leading-snug">
                      New drop is live! 🌟 Check out our latest collection. Tap to buy 👇 #fashion #newarrivals
                    </p>
                    
                    {/* Embedded Product Card / Buy Now */}
                    <div 
                      onClick={() => {
                        setActiveReel(null);
                        onClose();
                        onProductClick(displayProducts[0]);
                      }}
                      className="mt-1 w-full bg-white/15 backdrop-blur-xl rounded-2xl p-2.5 flex items-center gap-3 border border-white/20 shadow-lg cursor-pointer hover:bg-white/20 active:scale-[0.98] transition-all"
                    >
                       <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 shadow-inner">
                         <Image src={displayProducts[0].thumbnail} alt="Product" fill className="object-cover" />
                       </div>
                       <div className="flex-1">
                          <h4 className="text-white text-sm font-bold line-clamp-1 drop-shadow-sm">{displayProducts[0].name}</h4>
                          <span className="text-emerald-400 font-bold text-sm drop-shadow-sm">₹{displayProducts[0].price.toLocaleString('en-IN')}</span>
                       </div>
                       <button className="px-5 py-2.5 bg-white text-neutral-900 font-bold text-[13px] rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors shadow-sm">
                         Buy Now
                       </button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Rate Shop Bottom Sheet Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-end justify-center font-sans animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => !showRatingSuccess && setIsRatingModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4"></div>

            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {showRatingSuccess ? (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Rating Submitted</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Thank you! Your {selectedRating}-star review for <span className="font-bold text-neutral-900">{shop.name}</span> has been published.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-neutral-900">Rate Seller</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Share your feedback to help shoppers & support this business</p>
                </div>

                {/* Star Selector */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeStar = hoveredRating || selectedRating;
                      const isFilled = star <= activeStar;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 text-neutral-300 hover:scale-110 transition-all cursor-pointer active:scale-95"
                        >
                          <Star 
                            className={`w-9 h-9 transition-colors ${
                              isFilled 
                                ? 'text-amber-500 fill-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]' 
                                : 'text-neutral-300 fill-neutral-100'
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className={`text-xs font-bold tracking-wide ${selectedRating > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                    {ratingLabels[hoveredRating || selectedRating]}
                  </span>
                </div>

                {/* Comment Box */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                    Write your review (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe product condition, response time, packaging, or overall experience..."
                    className="w-full px-3.5 py-2.5 text-sm text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-none resize-none transition-all placeholder:text-neutral-400"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={selectedRating === 0}
                  className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
                    selectedRating > 0
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-md active:scale-98'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {selectedRating === 0 ? 'Select Stars to Rate' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 24-HOUR BOUTIQUE STORY VIEWER MODAL */}
      {activeStoryIdx !== null && stories[activeStoryIdx] && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col justify-between p-4">
            {/* Background Story Image */}
            <img
              src={stories[activeStoryIdx].media_url}
              alt="Story"
              className="absolute inset-0 w-full h-full object-cover -z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 -z-10" />

            {/* Top Progress Bar & Header */}
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-1.5 w-full">
                {stories.map((s, idx) => (
                  <div key={s.id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all ${
                        idx < activeStoryIdx ? 'w-full' : idx === activeStoryIdx ? 'w-full animate-pulse' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white bg-neutral-200">
                    <img src={shopLogo} alt={shop.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">{shop.name}</span>
                    <span className="text-[10px] text-neutral-300 font-medium">
                      {formatRelativeTime(stories[activeStoryIdx].created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIdx(null)}
                  className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tap areas for next/prev */}
            <div className="absolute inset-y-16 inset-x-0 flex z-0">
              <div
                onClick={() => setActiveStoryIdx(prev => (prev && prev > 0 ? prev - 1 : 0))}
                className="w-1/2 h-full cursor-pointer"
              />
              <div
                onClick={() =>
                  setActiveStoryIdx(prev =>
                    prev !== null && prev < stories.length - 1 ? prev + 1 : null
                  )
                }
                className="w-1/2 h-full cursor-pointer"
              />
            </div>

            {/* Bottom Caption & Interactions */}
            <div className="space-y-2.5 z-10">
              {stories[activeStoryIdx].text_content && (
                <p className="text-xs text-white font-medium bg-black/60 p-2.5 rounded-xl backdrop-blur-md">
                  {stories[activeStoryIdx].text_content}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{stories[activeStoryIdx].views_count || 1} views</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeStory(stories[activeStoryIdx].id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    likedStories[stories[activeStoryIdx].id]
                      ? 'bg-rose-500/30 border-rose-400 text-rose-300 scale-105 shadow-md shadow-rose-500/20'
                      : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                  }`}
                  title="Like story"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      likedStories[stories[activeStoryIdx].id] ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span className="text-xs font-bold">
                    {storyLikes[stories[activeStoryIdx].id] || stories[activeStoryIdx].likes_count || 0}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
