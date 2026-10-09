'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getBackendUrl } from '@/lib/config';
import { TopHeader, CATEGORY_FILTERS } from '@/components/TopHeader';
import { CityExplorer, SelectedCity } from '@/components/CityExplorer';
import { ProductGrid, INITIAL_REGISTERED_SHOPS } from '@/components/ProductGrid';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CategoryDealsResultsView } from '@/components/CategoryDealsResultsView';
import { BagDrawer, CartItem } from '@/components/BagDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderConfirmationModal } from '@/components/OrderConfirmationModal';
import { MitrenoAIChat } from '@/components/MitrenoAIChat';
import { UserProfileModal } from '@/components/UserProfileModal';
import { NegotiationInbox } from '@/components/NegotiationInbox';
import { BargainChatRoom } from '@/components/BargainChatRoom';
import { LocalVideoFeed } from '@/components/LocalVideoFeed';
import { ReserveInStoreModal } from '@/components/ReserveInStoreModal';
import { ShopProfileModal } from '@/components/ShopProfileModal';
import { ToastContainer, ToastMessage } from '@/components/ToastNotification';
import { BottomNav, BottomNavTab } from '@/components/BottomNav';
import { Product, PRODUCTS } from '@/lib/products-data';
import {
  Sparkles,
  Layers,
  Heart,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Package,
  RotateCcw,
  Sparkle,
  MessageSquare,
  Lock,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import AuthScreen from '@/components/AuthScreen';
import { apiClient } from '@/lib/api-client';

export default function HomePage() {
  const { user, isGuest, isLoading, requireAuth } = useAuth();

  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<'feed' | 'wardrobe' | 'my-edit' | 'journal'>('feed');
  const [currentBottomNavTab, setCurrentBottomNavTab] = useState<BottomNavTab>('home');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeBanner, setActiveBanner] = useState<any | null>(null);
  const [activeLookbookCategory, setActiveLookbookCategory] = useState<any | null>(null);
  const [activeCategoryDealsView, setActiveCategoryDealsView] = useState<{
    categoryKey: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'gsm-desc'>('featured');

  // Live Database Products
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Geographic City Discovery State
  const [isCityExplorerOpen, setIsCityExplorerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<SelectedCity>({
    id: 'mumbai',
    name: 'Mumbai',
    state_id: 'maharashtra',
    state_name: 'Maharashtra',
    state_code: 'MH',
  });

  // Hydrate saved city selection
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mitreno_selected_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setSelectedCity(parsed);
        }
      }
    } catch {}
  }, []);

  const fetchLiveProducts = async () => {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/products`);
      const data = await res.json();
      
      if (data.success && data.products) {
        const mapped: Product[] = data.products.map((p: any) => {
          const totalStock = Array.isArray(p.variants) && p.variants.length > 0
            ? p.variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0)
            : 10;
          const isOutOfStock = p.is_active === false || totalStock <= 0;

          return {
            id: p.id,
            slug: p.id,
            name: p.title || p.name,
            tagline: p.subtitle || p.description || p.category,
            collection: 'Live Drop',
            category: (p.category || 'tops').toLowerCase(),
            price: p.price ?? p.base_price,
            originalPrice: p.original_price || (p.price ?? p.base_price) * 1.2,
            gsm: p.gsm || 220,
            fabric: p.fabric || 'Premium Blend',
            fit: p.fit || 'Relaxed',
            description: p.description || 'Premium streetwear piece.',
            features: p.tags || ['Quality construction', 'Durable fabric'],
            stylingTips: 'Style it your way.',
            inventory: { S: totalStock, M: totalStock, L: totalStock, XL: totalStock, XXL: totalStock },
            images: [
              { id: `img-${p.id}-1`, url: p.thumbnail, angle: 'front', caption: 'Front' }
            ],
            thumbnail: p.thumbnail,
            tryOnModelUrl: p.thumbnail,
            modelInfo: { height: "6'0\"", wearingSize: 'L', fitNote: 'True to size' },
            completeLookIds: [],
            fabricCloseUpUrl: p.thumbnail,
            color: 'Black',
            colorHex: '#000000',
            shop: {
              id: p.shop_id,
              name: p.shop?.name || p.shop_name || 'Unknown Shop',
              location: p.shop?.city_id || p.shop_location || 'India',
              rating: p.shop?.rating !== undefined && p.shop?.rating !== null ? Number(p.shop.rating) : (p.shop_rating !== undefined && p.shop_rating !== null ? Number(p.shop_rating) : 0),
            },
            isOutOfStock,
            isActive: p.is_active !== false,
            is_sponsored: p.is_sponsored || false,
          };
        });
        
        setLiveProducts(mapped);
      } else {
        setLiveProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch public products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchLiveProducts();

    const handleProductsUpdated = () => {
      fetchLiveProducts();
    };
    window.addEventListener('mitreno:products-updated', handleProductsUpdated);

    const handleWindowFocus = () => {
      fetchLiveProducts();
    };
    window.addEventListener('focus', handleWindowFocus);

    const pollInterval = setInterval(() => {
      fetchLiveProducts();
    }, 15000);

    return () => {
      window.removeEventListener('mitreno:products-updated', handleProductsUpdated);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(pollInterval);
    };
  }, []);

  // Shopping Bag Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Saved Items in My Edit (Hydrated from PostgreSQL database)
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);

  // Hydrate User Wishlist from PostgreSQL database
  useEffect(() => {
    if (!user) {
      setSavedProductIds([]);
      return;
    }
    apiClient.get('/api/wishlist/ids').then((data) => {
      if (data.success && Array.isArray(data.product_ids)) {
        setSavedProductIds(data.product_ids);
      }
    }).catch(() => {});
  }, [user]);

  // Modal Triggers
  const [selectedProductForPdp, setSelectedProductForPdp] = useState<Product | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  // Bargain Engine State
  const [activeChatProduct, setActiveChatProduct] = useState<Product | null>(null);
  const [desktopChatProduct, setDesktopChatProduct] = useState<Product | null>(null);
  const [initialOfferForChat, setInitialOfferForChat] = useState<string | undefined>(undefined);
  const [initialPrefillMessage, setInitialPrefillMessage] = useState<string | undefined>(undefined);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [selectedProductForReserve, setSelectedProductForReserve] = useState<Product | null>(null);
  const [selectedShopForProfile, setSelectedShopForProfile] = useState<Product['shop'] | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'ai' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Bulletproof Safe Category Matcher (Prevents TypeError on undefined fields)
  const matchProductCategory = (product: Product, catId: string): boolean => {
    if (!catId || catId === 'all') return true;
    const pName = (product.name || '').toLowerCase();
    const pFabric = (product.fabric || '').toLowerCase();
    const pCollection = (product.collection || '').toLowerCase();
    const pColor = (product.color || '').toLowerCase();
    const pFit = (product.fit || '').toLowerCase();
    const pCat = ((product.category as string) || '').toLowerCase();
    const pGsm = Number(product.gsm) || 0;

    if (catId === 'mens') {
      return pCat === 'tops' || pCat === 'bottoms' || pCat === 'outerwear' || pName.includes('shirt') || pName.includes('hoodie') || pName.includes('trouser') || pName.includes('tee');
    }
    if (catId === 'womens') {
      return pCat === 'dresses' || pName.includes('chikankari') || pName.includes('kurta') || pName.includes('silk') || pName.includes('women') || pName.includes('dress');
    }
    if (catId === 'tshirts') {
      return pCat === 'tops' || pGsm >= 200 || pName.includes('tee') || pName.includes('shirt') || pName.includes('hoodie');
    }
    if (catId === 'shoes') {
      return pCat === 'footwear' || pCat === 'shoes' || pName.includes('boot') || pName.includes('sneaker') || pName.includes('shoe');
    }
    if (catId === 'accessories') {
      return pCat === 'accessories' || pName.includes('cuff') || pName.includes('silver') || pName.includes('belt');
    }

    // Visual Lookbooks
    if (catId === 'linen') {
      return pFabric.includes('linen') || pCollection.includes('linen') || pName.includes('linen');
    }
    if (catId === 'heavy-tee') {
      return pGsm >= 240 || pCat === 'tops' || pName.includes('shirt') || pName.includes('hoodie') || pName.includes('tee');
    }
    if (catId === 'tailored') {
      return pFit === 'tailored' || pFit === 'structured' || pName.includes('trouser') || pName.includes('pant');
    }
    if (catId === 'oversized') {
      return pFit === 'oversized' || pName.includes('oversized');
    }
    if (catId === 'outerwear') {
      return pCat === 'outerwear' || pName.includes('blazer') || pName.includes('jacket') || pName.includes('coat') || pName.includes('hoodie');
    }
    if (catId === 'knitwear') {
      return pFabric.includes('terry') || pFabric.includes('wool') || pFabric.includes('knit') || pGsm >= 280;
    }
    if (catId === 'monochrome') {
      return pColor.includes('black') || pColor.includes('white') || pColor.includes('obsidian') || pName.includes('monochrome') || pCollection.includes('nocturne');
    }

    return true;
  };

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((product) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
        const matchesName = (product.name || '').toLowerCase().includes(q);
        const matchesTagline = (product.tagline || '').toLowerCase().includes(q);
        const matchesFabric = (product.fabric || '').toLowerCase().includes(q);
        const matchesCategory = ((product.category as string) || '').toLowerCase().includes(q);
        const matchesFit = (product.fit || '').toLowerCase().includes(q);
        const matchesDesc = (product.description || '').toLowerCase().includes(q);
        const matchesShop = (product.shop?.name || '').toLowerCase().includes(q) || ((product.shop as any)?.username || '').toLowerCase().includes(q);
        if (!matchesName && !matchesTagline && !matchesFabric && !matchesCategory && !matchesFit && !matchesDesc && !matchesShop) {
          return false;
        }
      }

      // 2. Category Filter Pill & Lookbook IDs
      return matchProductCategory(product, selectedCategory);
    }).sort((a, b) => {
      const aSpon = a.is_sponsored ? 1 : 0;
      const bSpon = b.is_sponsored ? 1 : 0;
      return bSpon - aSpon;
    });
  }, [searchQuery, selectedCategory, liveProducts]);

  // Filtered products for active lookbook category full-screen showcase
  const lookbookProducts = useMemo(() => {
    if (!activeLookbookCategory) return [];
    const catId = activeLookbookCategory.id;
    return liveProducts.filter((product) => matchProductCategory(product, catId)).sort((a, b) => {
      const aSpon = a.is_sponsored ? 1 : 0;
      const bSpon = b.is_sponsored ? 1 : 0;
      return bSpon - aSpon;
    });
  }, [activeLookbookCategory, liveProducts]);

  // Cart Handlers
  const handleAddToCart = (product: Product, size: string = 'L') => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    addToast(
      `Added to Bag: ${product.name}`,
      `Size ${size} in signature presentation vault.`,
      'success'
    );
  };

  const handleUpdateCartQty = (productId: string, size: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId && i.size === size) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.size === size))
    );
    addToast('Item removed from Bag', undefined, 'info');
  };

  // Save / Bookmark Toggle with PostgreSQL persistence & Guest Guard
  const handleToggleSave = async (productId: string) => {
    if (!user) {
      addToast('Sign in required', 'Please sign in to save items to your permanent wishlist.', 'info');
      requireAuth();
      return;
    }
    const prod = liveProducts.find((p) => p.id === productId);
    const isCurrentlySaved = savedProductIds.includes(productId);

    // Optimistic UI update
    setSavedProductIds((prev) => {
      if (isCurrentlySaved) {
        addToast(`Removed from My Edit`, prod?.name, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast(`Saved to My Edit`, prod?.name, 'ai');
        return [...prev, productId];
      }
    });

    try {
      const data = await apiClient.post('/api/wishlist/toggle', { product_id: productId });
      if (!data.success) {
        // Rollback on failure
        setSavedProductIds((prev) =>
          isCurrentlySaved ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
      }
    } catch {
      // Rollback on error
      setSavedProductIds((prev) =>
        isCurrentlySaved ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
    }
  };

  // Handle Order Placed
  const handleOrderSuccess = (orderData: any) => {
    setIsCheckoutOpen(false);
    
    // Check if the checked out items match the cart items to determine if we should clear the cart.
    const isFullCartCheckout = checkoutItems.length === cartItems.length && 
      checkoutItems.every((item, idx) => item.product.id === cartItems[idx].product.id && item.size === cartItems[idx].size);
    
    if (isFullCartCheckout) {
      setCartItems([]);
    }
    
    setConfirmedOrder(orderData);
    addToast('Order Confirmed', `Order ${orderData.orderId} locked for delivery.`, 'ai');
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const activeCategoryObj = CATEGORY_FILTERS.find((c) => c.id === selectedCategory);

  const handleBottomNavChange = (tab: BottomNavTab) => {
    setCurrentBottomNavTab(tab);
    setIsProfileOpen(false);
  };

  const openBargainChat = (product: Product, offerAmount?: string, prefillMessage?: string) => {
    if (!user) {
      addToast('Sign in required', 'Please sign in with your phone number to negotiate deals.', 'info');
      requireAuth();
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && currentBottomNavTab === 'chats') {
      setDesktopChatProduct(product);
    } else {
      setActiveChatProduct(product);
    }
    setInitialOfferForChat(offerAmount);
    setInitialPrefillMessage(prefillMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-2 animate-pulse" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          <span className="text-[#C5963A]">N</span>VILAR
        </h1>
        <p className="text-neutral-300 text-xs font-medium tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  return (
    <main className={`min-h-screen bg-[#FAFBFD] text-neutral-950 flex flex-col justify-between selection:bg-neutral-950 selection:text-white relative ${currentBottomNavTab === 'chats' ? 'pb-0' : 'pb-24'}`}>
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* STICKY TOP HEADER (Row 1: Logo & Actions, Row 2: Search, Row 3: Filter Strip) */}
      {!activeBanner && !activeLookbookCategory && currentBottomNavTab === 'home' && (
        <TopHeader
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentView !== 'feed') setCurrentView('feed');
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            if (currentView !== 'feed') setCurrentView('feed');
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenProfile={() => handleBottomNavChange('profile')}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          selectedCity={selectedCity}
          onOpenCityExplorer={() => setIsCityExplorerOpen(true)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {/* DEDICATED FULL-SCREEN LOOKBOOK CATEGORY SHOWCASE OVERLAY */}
          {activeLookbookCategory && (
            <motion.div
              key="lookbook-category-overlay"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0 bg-[#FAFBFD] z-50 min-h-screen pb-24 space-y-4"
            >
              {/* 1. Dedicated Top Navigation Header (No TopHeader, No Clutter!) */}
              <div className="sticky top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 flex items-center justify-between px-4 md:px-8 z-50 shadow-2xs">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveLookbookCategory(null)}
                    className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-neutral-900 bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer border border-neutral-200/80"
                    title="Back to Explore"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-serif-editorial text-xl md:text-2xl font-black text-neutral-950 leading-tight">
                        {activeLookbookCategory.title}
                      </h1>
                      {activeLookbookCategory.badge && (
                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${activeLookbookCategory.badgeStyle} shadow-2xs`}>
                          {activeLookbookCategory.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider mt-0.5">
                      {activeLookbookCategory.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveLookbookCategory(null)}
                  className="px-3.5 py-1.5 rounded-full bg-neutral-950 text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  Explore All
                </button>
              </div>

              {/* 2. Hero Image Banner Cover */}
              <div className="w-full h-[180px] md:h-[230px] relative overflow-hidden bg-neutral-950">
                <Image src={activeLookbookCategory.image} alt={activeLookbookCategory.title} fill className="object-cover opacity-75" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 md:left-8 right-4 space-y-1">
                  <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-widest">
                    {activeLookbookCategory.subtitle}
                  </span>
                  <h2 className="text-white font-serif-editorial text-3xl md:text-5xl font-black drop-shadow-md">{activeLookbookCategory.title}</h2>
                </div>
              </div>

              {/* 3. Filtered Showcase Content */}
              <div className="max-w-7xl mx-auto px-3.5 md:px-8 space-y-6 pt-2">
                {/* ROW 1: Horizontal Spotlight Runway Carousel (Scroll Right-to-Left) */}
                {lookbookProducts.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-neutral-900">
                          Spotlight Runway Pieces
                        </h3>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Swipe right to left</span>
                    </div>

                    <div className="w-full overflow-x-auto snap-x flex gap-3.5 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {lookbookProducts.slice(0, 4).map((prod) => (
                        <motion.div
                          key={`lookbook-spotlight-${prod.id}`}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedProductForPdp(prod)}
                          className="relative w-[220px] md:w-[260px] h-[280px] md:h-[320px] rounded-3xl overflow-hidden shrink-0 snap-start cursor-pointer group shadow-xs hover:shadow-md border border-neutral-200/80 bg-neutral-900 transition-all duration-300"
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

                {/* ROW 2: Full Collection Grid Catalog (Scroll Down-to-Up) */}
                {lookbookProducts.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-neutral-900">
                        Full Collection Catalog ({lookbookProducts.length} Pieces)
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Scroll down to explore</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                      {lookbookProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpenProduct={(prod) => setSelectedProductForPdp(prod)}
                          isSaved={savedProductIds.includes(product.id)}
                          onToggleSave={handleToggleSave}
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
                      We couldn&apos;t find any active pieces matching &ldquo;{activeLookbookCategory.title}&rdquo;.
                    </p>
                    <button
                      onClick={() => setActiveLookbookCategory(null)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-black tracking-wider uppercase hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>Explore All Collections</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeBanner && (
            <motion.div
              key="offer-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#F4F6F8] z-40 min-h-screen pb-24"
            >
              {/* Offer Page Custom Header */}
              <div className="sticky top-0 left-0 right-0 h-14 bg-white border-b border-neutral-100 flex items-center px-4 z-50">
                <button 
                  onClick={() => setActiveBanner(null)}
                  className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-900 active:bg-neutral-100 transition-colors"
                >
                  <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <div className="ml-2">
                  <h1 className="font-serif-editorial text-lg font-black text-neutral-900 leading-none">{activeBanner.title}</h1>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{activeBanner.subtitle}</p>
                </div>
              </div>

              {/* Offer Page Cover Image */}
              <div className="w-full h-[180px] relative">
                <Image src={activeBanner.img} alt={activeBanner.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white font-serif-editorial text-3xl font-black">{activeBanner.title}</h2>
                  <p className="text-amber-400 text-xs font-black uppercase tracking-wider mt-1">{activeBanner.subtitle}</p>
                </div>
              </div>

              {/* Offer Products Grid */}
              <div className="p-3 md:p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {liveProducts.filter(p => activeBanner.category ? p.category === activeBanner.category || p.fabric.toLowerCase().includes(activeBanner.category) || p.name.toLowerCase().includes(activeBanner.category) : true).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenProduct={(product) => setSelectedProductForPdp(product)}
                    isSaved={savedProductIds.includes(product.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeCategoryDealsView && (
            <CategoryDealsResultsView
              categoryKey={activeCategoryDealsView.categoryKey}
              categoryTitle={activeCategoryDealsView.title}
              categorySubtitle={activeCategoryDealsView.subtitle}
              initialProducts={liveProducts.length > 0 ? liveProducts : PRODUCTS}
              onBack={() => setActiveCategoryDealsView(null)}
              onOpenProduct={(product) => setSelectedProductForPdp(product)}
              onOpenBargainChat={(product) => openBargainChat(product)}
              savedProductIds={savedProductIds}
              onToggleSave={handleToggleSave}
              allShops={INITIAL_REGISTERED_SHOPS}
            />
          )}

          {!activeBanner && !activeLookbookCategory && !activeCategoryDealsView && currentBottomNavTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'feed' && (
                <ProductGrid
                  products={filteredProducts}
                  onOpenProduct={(product) => setSelectedProductForPdp(product)}
                  savedProductIds={savedProductIds}
                  onToggleSave={handleToggleSave}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => setSelectedCategory(catId)}
                  onOpenLookbookCategory={(lookbook) => setActiveLookbookCategory(lookbook)}
                  onBannerClick={(banner) => setActiveBanner(banner)}
                  onOpenStoreProfile={(shop) => setSelectedShopForProfile(shop)}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  activeCategoryLabel={activeCategoryObj?.label || 'All Markets'}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onOpenCategoryDeals={(catKey, title, subtitle) => {
                    setActiveCategoryDealsView({ categoryKey: catKey, title, subtitle });
                  }}
                />
              )}
            </motion.div>
          )}

          {currentBottomNavTab === 'feed' && (
            <motion.div
              key="video-feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LocalVideoFeed
                products={liveProducts}
                onOpenProduct={(product) => setSelectedProductForPdp(product)}
                onMakeOffer={(product) => openBargainChat(product)}
                onAddToCart={handleAddToCart}
                onBack={() => setCurrentBottomNavTab('home')}
              />
            </motion.div>
          )}

          {currentBottomNavTab === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <BagDrawer
                isTabMode={true}
                isOpen={true}
                onClose={() => {}}
                items={cartItems}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveFromCart}
                onProceedToCheckout={() => {
                  if (!user) {
                    requireAuth();
                    addToast('Please sign in to proceed to checkout', undefined, 'info');
                    return;
                  }
                  setCheckoutItems(cartItems);
                  setIsCheckoutOpen(true);
                }}
              />
            </motion.div>
          )}

          {currentBottomNavTab === 'chats' && (
            <motion.div
              key="chats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="h-full md:flex md:h-[calc(100vh-64px)] pb-20 md:pb-0"
            >
              {!user ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-800 shadow-sm border border-neutral-200">
                    <Lock className="w-7 h-7 text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Live Chats & Bargains Locked</h3>
                  <p className="text-sm text-neutral-500 max-w-sm mb-6">
                    Sign in with your phone number to access your negotiations, chat directly with verified boutique sellers, and track live offers.
                  </p>
                  <button
                    onClick={requireAuth}
                    className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    Sign In with Phone
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-full md:w-80 lg:w-96 md:border-r md:border-neutral-200 shrink-0 h-full overflow-y-auto">
                    <NegotiationInbox onOpenChat={openBargainChat} />
                  </div>
                  <div className="hidden md:flex flex-1 relative bg-neutral-50/50 h-full">
                    {desktopChatProduct ? (
                      <BargainChatRoom
                        isEmbedded
                        isOpen={true}
                        onClose={() => setDesktopChatProduct(null)}
                        product={desktopChatProduct}
                        initialOfferPrice={initialOfferForChat}
                        initialPrefillMessage={initialPrefillMessage}
                        onCheckout={(product, price) => {
                          setDesktopChatProduct(null);
                          setInitialOfferForChat(undefined);
                          setInitialPrefillMessage(undefined);
                          const customPricedProduct = { ...product, price: price };
                          setCheckoutItems([{ product: customPricedProduct, size: 'L', quantity: 1 }]);
                          setIsCheckoutOpen(true);
                        }}
                      />
                    ) : (
                      <div className="m-auto flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
                        <MessageSquare className="w-12 h-12 mb-4 text-neutral-300" />
                        <p className="text-sm font-medium text-neutral-500">Select a conversation to start chatting</p>
                        <p className="text-xs mt-1">Your active bargains and accepted deals will appear here.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {(currentBottomNavTab === 'profile') && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <UserProfileModal
                isTabMode={true}
                isOpen={true}
                onClose={() => {}}
                initialTab={'closet'}
                savedProductIds={savedProductIds}
                onToggleSave={handleToggleSave}
                onOpenProduct={setSelectedProductForPdp}
                onAddToCart={handleAddToCart}
                confirmedOrder={confirmedOrder}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav
        activeTab={currentBottomNavTab}
        onTabChange={handleBottomNavChange}
        cartCount={totalCartCount}
      />

      {/* MODAL LAYERS */}
      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForPdp}
        isOpen={!!selectedProductForPdp}
        onClose={() => setSelectedProductForPdp(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={(product, size) => {
          if (!user) {
            requireAuth();
            addToast('Please sign in to proceed to checkout', undefined, 'info');
            return;
          }
          setCheckoutItems([{ product, size, quantity: 1 }]);
          setIsCheckoutOpen(true);
        }}
        onMakeOffer={(product, offer) => openBargainChat(product, offer)}
        onOpenChat={(product, prefillMsg) => openBargainChat(product, undefined, prefillMsg)}
        onOpenReserve={(product) => setSelectedProductForReserve(product)}
        onOpenShopProfile={(shop) => setSelectedShopForProfile(shop)}
      />

      {/* 2. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 3. Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        orderData={confirmedOrder}
        onProductClick={(product) => {
          setSelectedProductForPdp(product);
        }}
      />

      {/* 5. NVILAR AI Concierge Chat */}
      <MitrenoAIChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onOpenProduct={(prod) => setSelectedProductForPdp(prod)}
        onAddToCart={handleAddToCart}
      />

      {/* 6. Bargain Chat Room */}
      <BargainChatRoom
        isOpen={!!activeChatProduct}
        onClose={() => {
          setActiveChatProduct(null);
          setInitialOfferForChat(undefined);
          setInitialPrefillMessage(undefined);
        }}
        product={activeChatProduct}
        initialOfferPrice={initialOfferForChat}
        initialPrefillMessage={initialPrefillMessage}
        onCheckout={(product, price) => {
          setActiveChatProduct(null);
          setInitialOfferForChat(undefined);
          setInitialPrefillMessage(undefined);
          
          // Override the price for checkout
          const customPricedProduct = { ...product, price: price };
          setCheckoutItems([{ product: customPricedProduct, size: 'L', quantity: 1 }]);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 7. Reserve In-Store Modal */}
      <ReserveInStoreModal
        isOpen={!!selectedProductForReserve}
        onClose={() => setSelectedProductForReserve(null)}
        product={selectedProductForReserve}
      />

      {/* 9. Shop Profile Modal */}
      <ShopProfileModal
        isOpen={!!selectedShopForProfile}
        shop={selectedShopForProfile}
        onClose={() => setSelectedShopForProfile(null)}
        products={liveProducts}
        onProductClick={(p) => setSelectedProductForPdp(p)}
        onOpenChat={(shop) => {
          // Find a product for this shop to open chat with
          const productForShop = liveProducts.find(p => p.shop.name === shop.name);
          if (productForShop) {
            openBargainChat(productForShop);
            
          }
        }}
      />

      {/* 10. Geographic Discovery City Explorer Overlay */}
      <CityExplorer
        isOpen={isCityExplorerOpen}
        onClose={() => setIsCityExplorerOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          addToast(
            `Destination: ${city.name}`,
            `Browsing verified boutiques and live collections in ${city.name}, ${city.state_code}.`,
            'info'
          );
        }}
      />
    </main>
  );
}
