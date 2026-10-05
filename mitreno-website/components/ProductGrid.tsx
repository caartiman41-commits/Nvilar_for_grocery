'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/products-data';
import {
  Sparkles,
  RefreshCcw,
  ChevronRight,
  Star,
  X,
  ArrowLeft,
  ArrowRight,
  Store,
  MapPin,
  Zap,
  Flame,
  Shirt,
  Layers,
  Compass,
} from 'lucide-react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { getBackendUrl } from '@/lib/config';
import { TopSurgeDrops } from '@/components/TopSurgeDrops';
import { LiveBargainDealsSection } from '@/components/LiveBargainDealsSection';
import { EditorialCuratedRails } from '@/components/EditorialCuratedRails';
import { getCurrent3HourEpoch, getSpotlightBoutique, getSmartFeed } from '@/lib/feed-algorithm';

// Default authentic boutiques with real imagery
export const INITIAL_REGISTERED_SHOPS = [
  {
    id: 'shop_fdf',
    name: 'fdf',
    username: 'fdf_official',
    locationName: 'Guwahati, Assam',
    locationId: 'guwahati',
    logo: 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop',
    verified: true,
    rating: 4.8,
    dropsAlert: 'New Drop',
    hasActiveStory: true,
  },
  {
    id: 'shop_thrift_garage',
    name: 'The Thrift Garage',
    username: 'thriftgarage',
    locationName: 'Bandra West, Mumbai',
    locationId: 'mumbai',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop',
    verified: true,
    rating: 4.8,
    dropsAlert: '3 Stories',
    hasActiveStory: true,
  },
  {
    id: 'shop_street_drops',
    name: 'Street Drops',
    username: 'streetdrops',
    locationName: 'Hauz Khas, Delhi',
    locationId: 'delhi',
    logo: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop',
    verified: true,
    rating: 4.9,
    dropsAlert: 'Flash Drop',
    hasActiveStory: true,
  },
  {
    id: 'shop_vintage_vault',
    name: 'Vintage Vault',
    username: 'vintagevault',
    locationName: 'Colaba, Mumbai',
    locationId: 'mumbai',
    logo: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=400&auto=format&fit=crop',
    verified: true,
    rating: 4.7,
    dropsAlert: 'Archived',
    hasActiveStory: false,
  },
  {
    id: 'shop_koramangala',
    name: 'Koramangala Threads',
    username: 'k_threads',
    locationName: 'Koramangala, Bangalore',
    locationId: 'bangalore',
    logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop',
    verified: true,
    rating: 4.7,
    dropsAlert: 'Restocked',
    hasActiveStory: false,
  },
];

export const HERO_BANNERS = [
  {
    id: 'b1',
    title: 'Weekend Steals',
    subtitle: 'Up to 50% Off Jackets',
    bg: 'bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950',
    img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop',
    category: 'outerwear',
  },
  {
    id: 'b2',
    title: 'Fresh Drops: Streetwear',
    subtitle: 'Curated 280+ GSM Pieces',
    bg: 'bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950',
    img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    category: 'heavy-tee',
  },
  {
    id: 'b3',
    title: 'Linen Essentials',
    subtitle: 'Breathable summer fits',
    bg: 'bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950',
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop',
    category: 'linen',
  },
];

// Interactive Visual Lookbook Categories (Horizontal Swipe Rail)
export const VISUAL_LOOKBOOKS = [
  {
    id: 'heavy-tee',
    title: 'Heavy Tees',
    subtitle: '240–320 GSM Streetwear',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    badge: 'Trending 🔥',
    badgeStyle: 'bg-amber-500 text-black font-extrabold shadow-sm border border-amber-300/80',
  },
  {
    id: 'linen',
    title: 'Pure Linen',
    subtitle: 'European Resort Edit',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
    badge: 'Bestseller ⭐',
    badgeStyle: 'bg-emerald-500 text-black font-extrabold shadow-sm border border-emerald-300/80',
  },
  {
    id: 'outerwear',
    title: 'Outerwear',
    subtitle: 'Blazers & Jackets',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80',
    badge: 'Exclusive ✦',
    badgeStyle: 'bg-blue-600 text-white font-extrabold shadow-sm border border-blue-400/80',
  },
  {
    id: 'tailored',
    title: 'Pleated Pants',
    subtitle: 'Structured Fit',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80',
    badge: 'Luxury 💎',
    badgeStyle: 'bg-purple-600 text-white font-extrabold shadow-sm border border-purple-400/80',
  },
  {
    id: 'knitwear',
    title: 'French Terry',
    subtitle: 'Luxury Knits',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
    badge: 'Comfort ☁️',
    badgeStyle: 'bg-rose-500 text-white font-extrabold shadow-sm border border-rose-300/80',
  },
  {
    id: 'monochrome',
    title: 'Monochrome',
    subtitle: 'Black & Obsidian',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=80',
    badge: 'Minimal ⬛',
    badgeStyle: 'bg-neutral-900 text-white font-extrabold shadow-sm border border-neutral-700/90',
  },
];

interface ProductGridProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  savedProductIds?: string[];
  onToggleSave?: (productId: string) => void;
  onResetFilters?: () => void;
  selectedCategory?: string;
  onSelectCategory?: (catId: string) => void;
  onOpenLookbookCategory?: (lookbook: any) => void;
  onBannerClick?: (banner: any) => void;
  onOpenStoreProfile?: (shop: any) => void;
  activeCategoryLabel?: string;
  searchQuery?: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'gsm-desc';
  onSortChange?: (val: 'featured' | 'price-asc' | 'price-desc' | 'gsm-desc') => void;
  onOpenCategoryDeals?: (categoryKey: string, title: string, subtitle?: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onOpenProduct,
  savedProductIds = [],
  onToggleSave,
  onResetFilters,
  selectedCategory = 'all',
  onSelectCategory,
  onOpenLookbookCategory,
  onBannerClick,
  onOpenStoreProfile,
  activeCategoryLabel = 'All Markets',
  searchQuery = '',
  sortBy,
  onOpenCategoryDeals,
}) => {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [dismissedShops, setDismissedShops] = useState<string[]>([]);
  const [showAllStoresModal, setShowAllStoresModal] = useState(false);
  const isAutoPlayingRef = useRef(true);

  // Dynamic 3-Hour Time Epoch & Session Seed for YouTube/Instagram Smart Refresh
  const currentEpoch = useMemo(() => getCurrent3HourEpoch(), []);
  const [sessionSeed, setSessionSeed] = useState(0);

  // Auto-playing banner logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (isAutoPlayingRef.current) {
        setTransitionEnabled(true);
        setActiveBannerIndex((prev) => prev + 1);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handle seamless infinite reset
  useEffect(() => {
    if (activeBannerIndex === HERO_BANNERS.length) {
      const timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setActiveBannerIndex(0);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [activeBannerIndex]);

  const handleIndicatorClick = (idx: number) => {
    setTransitionEnabled(true);
    setActiveBannerIndex(idx);
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'gsm-desc':
        return list.sort((a, b) => (b.gsm || 0) - (a.gsm || 0));
      case 'featured':
      default:
        // Autonomous 60-30-10 Discovery Ranking with Anti-Monopoly balance & Session Jitter
        return getSmartFeed(list, currentEpoch, sessionSeed);
    }
  }, [products, sortBy, currentEpoch, sessionSeed]);

  const isDefaultView =
    !searchQuery &&
    (selectedCategory === 'all' ||
      !selectedCategory ||
      activeCategoryLabel === 'All Markets' ||
      activeCategoryLabel === 'All Drops');

  // Live database shops merged with initial boutiques
  const [liveShops, setLiveShops] = useState<any[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/shops`);
        const data = await res.json();
        if (data.success && Array.isArray(data.shops)) {
          setLiveShops(data.shops);
        }
      } catch (err) {
        // Silent fallback
      }
    };
    fetchShops();
  }, []);

  const allShops = useMemo(() => {
    const map = new Map<string, any>();
    INITIAL_REGISTERED_SHOPS.forEach((s) => map.set(s.name.toLowerCase(), s));
    liveShops.forEach((s) => {
      const key = s.name.toLowerCase();
      const existing = map.get(key) || {};
      map.set(key, {
        ...existing,
        ...s,
        id: s.id || existing.id,
        name: s.name || existing.name,
        username: s.username || existing.username || s.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        locationName: s.market_name ? `${s.market_name}, ${s.city}` : (s.city || existing.locationName || 'Guwahati, Assam'),
        locationId: (s.city || '').toLowerCase(),
        logo: s.logo_url || existing.logo || 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop',
        verified: s.is_verified ?? existing.verified ?? true,
        rating: s.rating !== undefined && s.rating !== null ? Number(s.rating) : (existing.rating ?? 0),
        dropsAlert: Number(s.active_stories_count) > 0 ? `${s.active_stories_count} Stories` : (existing.dropsAlert || 'New Drop'),
        hasActiveStory: Number(s.active_stories_count) > 0 || existing.hasActiveStory,
      });
    });
    return Array.from(map.values());
  }, [liveShops]);

  const filteredShops = useMemo(() => {
    return allShops.filter((shop) => !dismissedShops.includes(shop.id));
  }, [allShops, dismissedShops]);

  // Spotlight Boutique: Rotates automatically every 3 hours among verified boutiques
  const spotlightBoutique = useMemo(() => {
    return getSpotlightBoutique(allShops, currentEpoch) || allShops[0] || null;
  }, [allShops, currentEpoch]);

  const spotlightProducts = useMemo(() => {
    if (!spotlightBoutique) return sortedProducts.slice(0, 4);
    const boutiqueName = spotlightBoutique.name.toLowerCase();
    const matches = sortedProducts.filter(
      (p) => p.shop?.name?.toLowerCase() === boutiqueName || (p.shop as any)?.id === spotlightBoutique.id
    );
    return matches.length > 0 ? matches : sortedProducts.slice(0, 4);
  }, [spotlightBoutique, sortedProducts]);

  // Specific experience segments
  const liveDeals = useMemo(() => {
    return sortedProducts
      .filter((p) => p.originalPrice && ((p.originalPrice - p.price) / p.originalPrice) >= 0.2)
      .slice(0, 6);
  }, [sortedProducts]);

  const heavyweightTees = useMemo(() => {
    return sortedProducts
      .filter((p) => p.category === 'tops' || (p.fabric && p.fabric.toLowerCase().includes('cotton')) || p.gsm >= 240)
      .slice(0, 6);
  }, [sortedProducts]);

  const resortBottoms = useMemo(() => {
    return sortedProducts
      .filter((p) => p.category === 'bottoms' || p.fit === 'Structured' || (p.name && p.name.toLowerCase().includes('trouser')))
      .slice(0, 6);
  }, [sortedProducts]);

  const luxuryOuterwear = useMemo(() => {
    return sortedProducts
      .filter((p) => p.category === 'outerwear' || (p.name && (p.name.toLowerCase().includes('blazer') || p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('hoodie'))))
      .slice(0, 6);
  }, [sortedProducts]);

  // Editorial featured piece + 2 side drops
  const editorialFeatured = sortedProducts[0] || null;
  const editorialSideItems = sortedProducts.slice(1, 3);

  // Bottom infinite discoveries (clean, balanced cards)
  const justForYou = sortedProducts.slice(3);

  // Search view handling
  const matchingShops = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    return allShops.filter((shop) => {
      const nameMatch = shop.name?.toLowerCase().includes(q);
      const userMatch = shop.username?.toLowerCase().includes(q);
      const locMatch = (shop.locationName || shop.city || '').toLowerCase().includes(q);
      return nameMatch || userMatch || locMatch;
    });
  }, [searchQuery, allShops]);

  const recommendedShop = matchingShops.length > 0 ? matchingShops[0] : null;

  // Search Results / Filtered Dedicated Collection Active View
  if (!isDefaultView) {
    const activeLookbook = VISUAL_LOOKBOOKS.find((l) => l.id === selectedCategory);
    const heroSpotlightItems = sortedProducts.slice(0, 4);

    return (
      <section id="product-feed-section" className="w-full bg-transparent pb-24 space-y-6">
        {/* Dedicated Editorial Collection Header */}
        <div className="max-w-7xl mx-auto px-3.5 md:px-6 pt-3">
          <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/80 rounded-3xl p-4 md:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <button
                  onClick={onResetFilters || (() => onSelectCategory?.('all'))}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#1246B8] hover:underline uppercase tracking-wider mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Collections</span>
                </button>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-serif-editorial text-2xl md:text-4xl font-black text-neutral-950 tracking-tight">
                    {activeLookbook?.title || (searchQuery ? `Search: "${searchQuery}"` : activeCategoryLabel || selectedCategory)}
                  </h2>
                  {activeLookbook?.badge && (
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${activeLookbook.badgeStyle} shadow-xs`}>
                      {activeLookbook.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-sm text-neutral-500 font-medium max-w-xl">
                  {activeLookbook?.subtitle || (searchQuery ? `Real-time search results matching "${searchQuery}"` : `Curated high-density pieces in ${activeCategoryLabel}`)}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-black border border-neutral-200">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'Piece' : 'Pieces'}
                </span>
                {onResetFilters && (
                  <button
                    onClick={onResetFilters}
                    className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 1. HORIZONTAL SPOTLIGHT RAIL (Scroll Right-to-Left) */}
        {sortedProducts.length > 0 && heroSpotlightItems.length > 0 && (
          <div className="max-w-7xl mx-auto space-y-2">
            <div className="flex items-center justify-between px-3.5 md:px-6">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-neutral-900">
                  Spotlight Runway Pieces
                </h3>
              </div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Swipe right to left</span>
            </div>

            <div className="w-full overflow-x-auto snap-x flex gap-3 px-3.5 md:px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {heroSpotlightItems.map((prod) => (
                <motion.div
                  key={`hero-${prod.id}`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onOpenProduct(prod)}
                  className="relative w-[220px] md:w-[260px] h-[280px] md:h-[320px] rounded-3xl overflow-hidden shrink-0 snap-start cursor-pointer group shadow-sm border border-neutral-200/80 bg-neutral-900"
                >
                  <Image src={prod.thumbnail || prod.images[0]?.url} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  
                  {prod.gsm && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-md border border-amber-300/30">
                        {prod.gsm} GSM
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white space-y-1">
                    <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                      {prod.shop?.name || 'Local Boutique'}
                    </span>
                    <h4 className="text-sm md:text-base font-black tracking-tight leading-tight line-clamp-1">{prod.name}</h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm md:text-base font-extrabold text-white">₹{prod.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 transition-colors">
                        View Piece
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 2. FULL CATALOG GRID (Scroll Down-to-Up) */}
        {sortedProducts.length > 0 ? (
          <div className="max-w-7xl mx-auto space-y-3 px-2 sm:px-3 md:px-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-neutral-900">
                Full Collection Catalog
              </h3>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Scroll down to explore</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 pb-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenProduct={onOpenProduct}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 border border-neutral-200">
              <Sparkles className="w-7 h-7 text-[#1246B8]" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold text-neutral-900">
              No Pieces Found
            </h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              We couldn&apos;t find any active pieces matching &ldquo;{activeLookbook?.title || searchQuery || selectedCategory}&rdquo;.
            </p>
            {onResetFilters && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-black tracking-wider uppercase hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Explore All Collections</span>
              </button>
            )}
          </div>
        )}
      </section>
    );
  }

  // ==== MULTI-EXPERIENCE DISCOVERY FEED ====
  return (
    <section id="multi-experience-feed" className="w-full bg-transparent pb-24 overflow-hidden space-y-6">

      {/* 1. Edge-to-Edge Hero Banners Carousel (Smooth Sliding) */}
      <div
        className="relative w-full px-2 md:px-4 pt-2 pb-1"
        onTouchStart={() => { isAutoPlayingRef.current = false; }}
        onTouchEnd={() => { isAutoPlayingRef.current = true; }}
        onMouseEnter={() => { isAutoPlayingRef.current = false; }}
        onMouseLeave={() => { isAutoPlayingRef.current = true; }}
      >
        <div className="relative w-full h-[148px] md:h-[210px] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.10)] bg-neutral-900">
          <div
            className="flex w-full h-full"
            style={{
              transform: `translate3d(-${activeBannerIndex * 100}%, 0, 0)`,
              transition: transitionEnabled ? 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
            }}
          >
            {[...HERO_BANNERS, HERO_BANNERS[0]].map((banner, index) => (
              <div
                key={`${banner.id}-${index}`}
                onClick={() => {
                  if (onBannerClick) onBannerClick(banner);
                }}
                className="w-full h-full flex-shrink-0 relative cursor-pointer select-none active:scale-[0.99] transition-transform duration-150"
              >
                <img
                  src={banner.img}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-65 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 z-10">
                  <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1.5">
                    {banner.subtitle}
                  </span>
                  <h2 className="text-white font-serif text-2xl md:text-3.5xl font-black leading-tight drop-shadow-md">
                    {banner.title}
                  </h2>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-xs">
            {HERO_BANNERS.map((_, idx) => {
              const isActive = (activeBannerIndex % HERO_BANNERS.length) === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleIndicatorClick(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ⚡ 1.1 LIVE SURGE DROPS (Expiring Soon - All-Time Lows) */}
      <div className="px-2 md:px-4 pt-2">
        <TopSurgeDrops onOpenProduct={onOpenProduct} />
      </div>

      {/* 2. Visual Lookbook Mood Categories (Swipeable Category Visual Cards) */}
      <div className="pt-2">
        <div className="flex items-center justify-between px-3.5 md:px-6 mb-3">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-neutral-900" />
            <h3 className="text-[13px] md:text-sm font-black uppercase tracking-wider text-neutral-900">
              Curated Moods & Fits
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Swipe to explore</span>
        </div>

        <div className="w-full overflow-x-auto snap-x flex gap-3 px-3.5 md:px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] after:content-[''] after:w-1 after:shrink-0">
          {VISUAL_LOOKBOOKS.map((look) => (
            <motion.div
              key={look.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (onOpenLookbookCategory) {
                  onOpenLookbookCategory(look);
                } else if (onSelectCategory) {
                  onSelectCategory(look.id);
                }
              }}
              className="relative w-[138px] md:w-[165px] h-[118px] md:h-[132px] rounded-2xl overflow-hidden shrink-0 snap-start cursor-pointer shadow-xs hover:shadow-md group border border-neutral-200/80 transition-all duration-300 bg-neutral-900"
            >
              {/* High-Definition Clear Photography */}
              <Image 
                src={look.image} 
                alt={look.title} 
                fill 
                className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
                unoptimized 
              />

              {/* Natural Dark Vignette for Text Readability (No Artificial Color Tint) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:opacity-90 transition-opacity" />
              
              {/* Sleek High-Contrast Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className={`text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full ${look.badgeStyle || 'bg-black/40 text-white backdrop-blur-md border border-white/20'} shadow-xs`}>
                  {look.badge}
                </span>
              </div>

              {/* Clean Luxury Typography */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white">
                <h4 className="text-xs md:text-sm font-black tracking-tight leading-snug drop-shadow-xs">{look.title}</h4>
                <p className="text-[9.5px] text-neutral-300 font-semibold truncate mt-0.5 drop-shadow-xs">{look.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Registered Store Avatars with Stories */}
      {filteredShops.length > 0 && (
        <div className="bg-white py-3 border-y border-neutral-100 shadow-2xs">
          <div className="flex items-center justify-between px-3.5 md:px-6 mb-2">
            <div>
              <h3 className="text-[13px] md:text-[14px] font-extrabold text-neutral-900 tracking-tight flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#1246B8]" />
                <span>Verified Local Boutiques</span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Direct chat & live boutique bargains</p>
            </div>
            <button
              onClick={() => setShowAllStoresModal(true)}
              className="text-[11px] font-bold text-[#1246B8] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              All Stores <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="w-full overflow-x-auto snap-x flex gap-3.5 px-3.5 md:px-6 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <AnimatePresence mode="popLayout">
              {filteredShops.map((shop) => (
                <motion.div
                  key={shop.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  className="flex flex-col items-center shrink-0 w-[74px] relative group"
                >
                  <div className="relative cursor-pointer" onClick={() => onOpenStoreProfile?.(shop)}>
                    <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#FF1361] via-[#FF8A00] to-[#9900EF] shadow-2xs">
                      <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-white bg-neutral-100">
                        <Image src={shop.logo} alt={shop.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" unoptimized />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDismissedShops((prev) => [...prev, shop.id]);
                        if (selectedShopId === shop.id) setSelectedShopId(null);
                      }}
                      className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-white text-neutral-400 hover:text-neutral-900 border border-neutral-200 shadow-xs flex items-center justify-center cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.8]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1 mt-1.5 w-full px-0.5">
                    <span className="text-[11px] font-bold text-neutral-900 truncate text-center">
                      {shop.name.split(' ')[0]}
                    </span>
                    {shop.verified && <VerifiedBadge className="w-3.5 h-3.5 shrink-0 -mt-0.5" />}
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5 text-[9.5px] text-neutral-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{shop.rating}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 4. Luxury Blinkit-Inspired Editorial Bargain Deals Bento Grid */}
      {liveDeals.length > 0 && (
        <LiveBargainDealsSection
          products={liveDeals}
          onOpenProduct={onOpenProduct}
          onSelectCategory={onSelectCategory}
          onOpenCategoryDeals={onOpenCategoryDeals}
        />
      )}

      {/* 5. Hyperlocal Boutique Spotlight Card (with 3-Product Mini Rail) */}
      {spotlightBoutique && (
        <div className="px-2 md:px-4">
          <div className="bg-white rounded-3xl p-4 md:p-5 border border-neutral-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 gap-3">
              <div
                className="flex items-center gap-3 cursor-pointer group min-w-0"
                onClick={() => onOpenStoreProfile?.(spotlightBoutique)}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-blue-600 bg-neutral-100 shadow-sm">
                    <Image src={spotlightBoutique.logo} alt={spotlightBoutique.name} fill className="object-cover" unoptimized />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm md:text-base font-black text-neutral-950 truncate group-hover:text-blue-600 transition-colors">
                      {spotlightBoutique.name}
                    </h4>
                    <VerifiedBadge size={15} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-medium">
                    <span className="flex items-center gap-0.5 text-neutral-800 font-bold bg-neutral-100 px-1.5 py-0.2 rounded">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {spotlightBoutique.rating}
                    </span>
                    <span>•</span>
                    <span className="truncate">{spotlightBoutique.locationName}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenStoreProfile?.(spotlightBoutique)}
                className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Visit Store</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Nested Mini Snap Rail */}
            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-neutral-700 uppercase tracking-wider">
                  Top Drops from this Boutique
                </span>
                <span className="text-[10px] text-neutral-400 font-bold">Swipe Right</span>
              </div>
              <div className="w-full overflow-x-auto snap-x flex gap-3 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {spotlightProducts.map((p) => (
                  <div key={p.id} className="w-[145px] md:w-[190px] flex-none snap-start">
                    <ProductCard
                      product={p}
                      onOpenProduct={onOpenProduct}
                      isSaved={savedProductIds.includes(p.id)}
                      onToggleSave={onToggleSave}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.5 Grand Editorial Curated Themed Rails: For Him, For Her, Footwear, Brands to Bag */}
      <EditorialCuratedRails
        products={sortedProducts}
        allShops={allShops}
        onOpenCategoryDeals={onOpenCategoryDeals || ((catKey, title) => onSelectCategory?.(catKey))}
        onOpenProduct={onOpenProduct}
        onOpenStoreProfile={onOpenStoreProfile}
      />

      {/* 6. Asymmetric Editorial Split-Hero (1 Large Showcase + 2 Side Drops) */}
      {editorialFeatured && editorialSideItems.length > 0 && (
        <div className="px-2 md:px-4">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h3 className="text-[13px] md:text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1246B8]" />
              <span>Editorial Lookbook Drop</span>
            </h3>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Autumn Edition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            {/* Left Large Hero Card (7 Cols on Desktop) */}
            <div
              onClick={() => onOpenProduct(editorialFeatured)}
              className="md:col-span-7 bg-neutral-950 text-white rounded-3xl overflow-hidden relative cursor-pointer group shadow-sm flex flex-col justify-end min-h-[260px] md:min-h-[340px]"
            >
              <Image
                src={editorialFeatured.thumbnail}
                alt={editorialFeatured.name}
                fill
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black tracking-widest uppercase border border-white/20">
                  Featured Silhouette
                </span>
              </div>

              <div className="relative z-10 p-5 md:p-6 space-y-1.5">
                <span className="text-amber-400 text-xs font-black uppercase tracking-widest">
                  {editorialFeatured.shop?.name || 'Local Boutique'}
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-black leading-tight text-white capitalize">
                  {editorialFeatured.name}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2 font-medium">
                  {editorialFeatured.description || 'Crafted with premium structured cotton and boxy drop-shoulder aesthetic.'}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white font-mono">
                      ₹{editorialFeatured.price.toLocaleString('en-IN')}
                    </span>
                    {editorialFeatured.originalPrice && (
                      <span className="text-xs text-neutral-400 line-through font-mono">
                        ₹{editorialFeatured.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-white text-neutral-950 text-xs font-bold flex items-center gap-1 group-hover:bg-neutral-100 shadow-xs">
                    <span>View Piece</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Stacked 2 Items (5 Cols on Desktop) */}
            <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-3">
              {editorialSideItems.map((p) => (
                <div key={p.id} className="h-full">
                  <ProductCard
                    product={p}
                    onOpenProduct={onOpenProduct}
                    isSaved={savedProductIds.includes(p.id)}
                    onToggleSave={onToggleSave}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Category Horizontal Swimlanes */}

      {/* 7A: Heavyweight Tops & Tees */}
      {heavyweightTees.length > 0 && (
        <div className="bg-white py-3.5 border-y border-neutral-100 shadow-2xs">
          <div className="flex items-center justify-between px-3.5 md:px-6 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Shirt className="w-3.5 h-3.5 text-neutral-900" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-neutral-900 tracking-tight">
                  Heavyweight Tees &amp; Tops
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold">240–320 GSM French Terry &amp; Structured Fits</p>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory?.('heavy-tee')}
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Explore</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="w-full overflow-x-auto snap-x flex gap-3 px-3.5 md:px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {heavyweightTees.map((product) => (
              <div key={product.id} className="w-[155px] md:w-[205px] flex-none snap-start">
                <ProductCard
                  product={product}
                  onOpenProduct={onOpenProduct}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7B: Structured Trousers & Bottoms */}
      {resortBottoms.length > 0 && (
        <div className="bg-white py-3.5 border-y border-neutral-100 shadow-2xs">
          <div className="flex items-center justify-between px-3.5 md:px-6 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-neutral-900 tracking-tight">
                  Pleated &amp; Resort Bottoms
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold">Relaxed drapes &amp; tailored silhouettes</p>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory?.('tailored')}
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Explore</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="w-full overflow-x-auto snap-x flex gap-3 px-3.5 md:px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {resortBottoms.map((product) => (
              <div key={product.id} className="w-[155px] md:w-[205px] flex-none snap-start">
                <ProductCard
                  product={product}
                  onOpenProduct={onOpenProduct}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7C: Outerwear & Jackets */}
      {luxuryOuterwear.length > 0 && (
        <div className="bg-white py-3.5 border-y border-neutral-100 shadow-2xs">
          <div className="flex items-center justify-between px-3.5 md:px-6 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-neutral-900 tracking-tight">
                  Blazers, Coats &amp; Jackets
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold">High-contrast luxury layering</p>
              </div>
            </div>
            <button
              onClick={() => onSelectCategory?.('outerwear')}
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Explore</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="w-full overflow-x-auto snap-x flex gap-3 px-3.5 md:px-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {luxuryOuterwear.map((product) => (
              <div key={product.id} className="w-[155px] md:w-[205px] flex-none snap-start">
                <ProductCard
                  product={product}
                  onOpenProduct={onOpenProduct}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Curated Discoveries ("Just For You" - Clean Balanced Grid at Bottom) */}
      <div className="mt-8 px-2 md:px-4 pt-4 border-t border-neutral-200/80">
        <div className="flex flex-col items-center justify-center mb-5 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1246B8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 mb-1">
            Personalized Discoveries
          </span>
          <h3 className="font-serif text-xl md:text-2xl font-black text-neutral-950 uppercase tracking-wider">
            Curated Just For You
          </h3>
          <p className="text-[11px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wider">
            Endless Local Boutique Archive
          </p>
        </div>

        {justForYou.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {justForYou.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProduct={onOpenProduct}
                isSaved={savedProductIds.includes(product.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-neutral-400 font-bold uppercase tracking-wider">
            You&apos;ve reached the end of the collection
          </div>
        )}
      </div>

      {/* All Stores Modal */}
      {showAllStoresModal && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAllStoresModal(false)}
                className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 text-neutral-900 transition-colors cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">All Registered Boutiques</h2>
            </div>
            {dismissedShops.length > 0 && (
              <button
                onClick={() => setDismissedShops([])}
                className="text-[11px] font-bold text-[#1246B8] hover:text-[#0d348a] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto bg-neutral-50/60 p-3">
            <div className="flex flex-col gap-2.5 max-w-xl mx-auto">
              <AnimatePresence mode="popLayout">
                {allShops
                  .filter((shop) => !dismissedShops.includes(shop.id))
                  .map((shop) => (
                    <motion.div
                      key={shop.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, overflow: 'hidden' }}
                      onClick={() => {
                        setShowAllStoresModal(false);
                        onOpenStoreProfile?.(shop);
                      }}
                      className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-sm active:bg-neutral-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#FF1361] via-[#FF8A00] to-[#9900EF] shadow-2xs">
                            <div className="w-13 h-13 rounded-full overflow-hidden relative border-2 border-white bg-neutral-100">
                              <Image src={shop.logo} alt={shop.name} fill className="object-cover" unoptimized />
                            </div>
                          </div>
                          {shop.verified && <VerifiedBadge className="absolute -bottom-0.5 -right-0.5 w-[16px] h-[16px]" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-extrabold text-neutral-900 truncate">{shop.name}</span>
                          <span className="text-[11px] text-neutral-500 truncate">{shop.locationName}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10.5px] font-bold text-neutral-700">{shop.rating}</span>
                            <span className="text-[10.5px] text-neutral-300">•</span>
                            <span className="text-[10px] font-semibold text-[#1246B8] bg-blue-50 px-1.5 py-0.2 rounded-full">
                              {shop.dropsAlert}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAllStoresModal(false);
                            onOpenStoreProfile?.(shop);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#1246B8] hover:bg-[#0d348a] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs cursor-pointer"
                        >
                          <span>Visit</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDismissedShops((prev) => [...prev, shop.id]);
                            if (selectedShopId === shop.id) setSelectedShopId(null);
                          }}
                          className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors active:scale-85 cursor-pointer"
                          title="Dismiss store"
                        >
                          <X className="w-4 h-4 stroke-[2.4]" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
