'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Store,
  MessageCircle,
  ArrowLeft,
  Search,
  Share2,
  ChevronRight,
  ChevronLeft,
  Star,
  Ruler,
  MapPin,
  Truck,
  RotateCcw,
  Clock,
  Banknote,
  CheckCircle2,
  PackageCheck,
  Layers,
  Shirt,
  Sparkles,
  Info,
  Zap,
  Navigation,
  TrendingUp,
} from 'lucide-react';
import { Product, PRODUCTS } from '@/lib/products-data';
import { ProductCard } from '@/components/ProductCard';
import { PriceHistoryModal } from '@/components/PriceHistoryModal';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import {
  getHighAccuracyUserLocation,
  calculateDistanceKm,
  getDeliveryPromise,
  Coordinates,
  DeliveryPromise,
  DEFAULT_USER_COORDS,
  DEFAULT_STORE_COORDS,
} from '@/lib/geolocation';

/**
 * Prominent Flipkart / Prime Style Delivery Promise Card
 * Renders luxury tier card based on store coordinates and user location
 * (Tier 'today' = Emerald, Tier 'tomorrow' = Royal Blue, Tier 'standard' = Clean Slate)
 * Note: Raw distance is intentionally hidden for a clean consumer experience.
 */
const DeliveryPromiseCard: React.FC<{ promise: DeliveryPromise | null }> = ({ promise }) => {
  if (!promise) return null;

  if (promise.tier === 'today') {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            ⚡
          </div>
          <div>
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wide block">
              Today Delivery
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Order within 2 hrs • 30–60 Min Express Delivery
            </span>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
          Hyperlocal
        </span>
      </div>
    );
  }

  if (promise.tier === 'tomorrow') {
    return (
      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            ⚡
          </div>
          <div>
            <span className="text-xs font-black text-blue-950 uppercase tracking-wide block">
              Tomorrow Delivery
            </span>
            <span className="text-[11px] font-semibold text-blue-700 block">
              Order within 4 hrs • Priority Express Delivery
            </span>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
          Priority Prime
        </span>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-sm shrink-0">
          📦
        </div>
        <div>
          <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
            Standard Delivery
          </span>
          <span className="text-[11px] font-semibold text-slate-600 block">
            Delivered in 2–4 Days • Free Tracked Courier
          </span>
        </div>
      </div>
      <span className="text-[10px] font-extrabold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded-full shrink-0">
        2–4 Days
      </span>
    </div>
  );
};

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onBuyNow?: (product: Product, size: string) => void;
  onMakeOffer?: (product: Product, offerAmount: string) => void;
  onOpenChat?: (product: Product, prefillMessage?: string) => void;
  onOpenReserve?: (product: Product) => void;
  onOpenShopProfile?: (shop: Product["shop"]) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  onBuyNow,
  product: initialProduct,
  isOpen,
  onClose,
  onAddToCart,
  onOpenChat,
  onOpenShopProfile,
}) => {
  const [cachedProduct, setCachedProduct] = useState<Product | null>(initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  // Pincode Delivery Estimator State
  const [pincode, setPincode] = useState('110001');
  const [pincodeCity, setPincodeCity] = useState('New Delhi');
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [tempPincode, setTempPincode] = useState('110001');

  // Policy & Terms Conditions Modal State
  const [activePolicyModal, setActivePolicyModal] = useState<'cancel' | 'return' | 'cod' | null>(null);
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);

  // High-Accuracy Live Location & Delivery Promise State
  const [userCoords, setUserCoords] = useState<Coordinates>(DEFAULT_USER_COORDS);
  const [deliveryPromise, setDeliveryPromise] = useState<DeliveryPromise | null>(() => getDeliveryPromise(3.8));
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [prevInitialProduct, setPrevInitialProduct] = useState<Product | null>(initialProduct);
  if (initialProduct !== prevInitialProduct) {
    setPrevInitialProduct(initialProduct);
    if (initialProduct) {
      setCachedProduct(initialProduct);
      setSelectedImageIndex(0);
    }
  }

  const activeProduct = initialProduct || cachedProduct;

  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
      const timer = setTimeout(() => {
        const scrollContainer = document.getElementById('product-modal-scroll');
        if (scrollContainer) scrollContainer.scrollTop = 0;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeProduct?.id]);

  // Dynamically compute live delivery promise based on high accuracy GPS distance
  useEffect(() => {
    if (!isOpen || !activeProduct) return;

    const storeCoords: Coordinates = {
      latitude: activeProduct.shop?.latitude ?? DEFAULT_STORE_COORDS.latitude,
      longitude: activeProduct.shop?.longitude ?? DEFAULT_STORE_COORDS.longitude,
      city: activeProduct.shop?.location || 'Guwahati',
    };

    calculateDistanceKm(userCoords, storeCoords).then(({ distanceKm, method }) => {
      const promise = getDeliveryPromise(distanceKm, method);
      setDeliveryPromise(promise);
      if (promise.isNearby) {
        setPincodeCity('Guwahati (Nearby)');
      }
    });
  }, [isOpen, activeProduct?.id, activeProduct?.shop?.latitude, activeProduct?.shop?.longitude, userCoords]);

  // Request High-Accuracy Geolocation via GPS / WiFi / Towers
  const handleDetectLiveLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const coords = await getHighAccuracyUserLocation();
      setUserCoords(coords);
      if (coords.city) setPincodeCity(coords.city);
    } catch (e) {
      console.warn('[ProductModal] Geolocation detection error:', e);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  if (!activeProduct) return null;

  const currentStock = activeProduct.inventory[selectedSize] ?? 4;
  const discountPercent = activeProduct.originalPrice
    ? Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100)
    : 0;

  const currentImage = activeProduct.images[selectedImageIndex]?.url || activeProduct.thumbnail;

  // Filter similar products (exclude activeProduct)
  const similarProducts = PRODUCTS.filter(p => p.id !== activeProduct.id).slice(0, 6);
  const exploreMoreProducts = PRODUCTS.filter(p => p.id !== activeProduct.id);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 30;

    if (distance > minSwipeDistance) {
      if (selectedImageIndex < activeProduct.images.length - 1) {
        setSelectedImageIndex((prev) => prev + 1);
      }
    } else if (distance < -minSwipeDistance) {
      if (selectedImageIndex > 0) {
        setSelectedImageIndex((prev) => prev - 1);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex < activeProduct.images.length - 1) {
      setSelectedImageIndex((prev) => prev + 1);
    } else {
      setSelectedImageIndex(0);
    }
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex > 0) {
      setSelectedImageIndex((prev) => prev - 1);
    } else {
      setSelectedImageIndex(activeProduct.images.length - 1);
    }
  };

  const handleApplyPincode = () => {
    if (tempPincode.trim().length >= 5) {
      const code = tempPincode.trim();
      setPincode(code);
      if (code.startsWith('781')) {
        setPincodeCity('Guwahati');
        setUserCoords({ latitude: 26.1722, longitude: 91.7761, city: 'Guwahati' });
      } else if (code.startsWith('400')) {
        setPincodeCity('Mumbai');
        setUserCoords({ latitude: 19.076, longitude: 72.8777, city: 'Mumbai' });
      } else if (code.startsWith('560')) {
        setPincodeCity('Bengaluru');
        setUserCoords({ latitude: 12.9716, longitude: 77.5946, city: 'Bengaluru' });
      } else if (code.startsWith('700')) {
        setPincodeCity('Kolkata');
        setUserCoords({ latitude: 22.5726, longitude: 88.3639, city: 'Kolkata' });
      } else if (code.startsWith('600')) {
        setPincodeCity('Chennai');
        setUserCoords({ latitude: 13.0827, longitude: 80.2707, city: 'Chennai' });
      } else {
        setPincodeCity('New Delhi');
        setUserCoords({ latitude: 28.6139, longitude: 77.209, city: 'New Delhi' });
      }
      setIsEditingPincode(false);
    }
  };

  const handleSwitchProduct = (newProd: Product) => {
    setCachedProduct(newProd);
    setSelectedImageIndex(0);
    const scrollContainer = document.getElementById('product-modal-scroll');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  };

  const handleShareProduct = () => {
    if (!activeProduct) return;
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: activeProduct.name,
        text: `Check out ${activeProduct.name} on Nvilar!`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="product-detail-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col overflow-hidden font-sans select-none"
        >
        {/* Persistent Top Out of Stock Alert Strip */}
        {activeProduct.isOutOfStock && (
          <div className="w-full bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between shadow-md shrink-0 z-50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">Currently Out of Stock</span>
            </div>
            <span className="text-[11px] font-bold text-rose-100 bg-rose-700/70 px-2.5 py-0.5 rounded-full">
              Restock in Progress
            </span>
          </div>
        )}

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[250] bg-neutral-950/95 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Product link copied to clipboard!</span>
        </div>
      )}
      {/* Search Bar Fullscreen Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] bg-white flex flex-col p-4"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-neutral-100 rounded-full border border-neutral-200">
                <Search className="w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search products, brands & categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-neutral-900 w-full placeholder:text-neutral-400"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-0.5 text-neutral-400 hover:text-neutral-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 px-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Trousers', 'Linen Shirt', 'Black Jacket', 'Sneakers', 'Silk Kurta', 'Denim'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                    }}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-full transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scrollable Content */}
      <div id="product-modal-scroll" className="flex-1 overflow-y-auto pb-28 bg-neutral-100">
        {/* White Section: Gallery & Basic Info */}
        <div className="bg-white pb-4">
          {/* Hero Image Container with Touch Swipe & Ultra-Smooth Transition */}
          <div
            className="relative w-full aspect-[4/5] bg-neutral-900 overflow-hidden touch-pan-y group cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Overlay Buttons Directly over Image */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 p-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-800 transition-all active:scale-90 cursor-pointer z-30 border border-white/60"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Action Buttons (Top Right) */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-800 transition-all active:scale-90 cursor-pointer border border-white/60"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>
              <button
                onClick={handleShareProduct}
                className="p-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-800 transition-all active:scale-90 cursor-pointer border border-white/60"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5 stroke-[2.2]" />
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-md transition-all active:scale-90 cursor-pointer border border-white/60 ${
                  isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-800'
                }`}
                aria-label="Like"
              >
                <Heart className={`w-5 h-5 stroke-[2.2] ${isLiked ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Silky-Smooth Cross-Fade Image View */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.3 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentImage}
                  alt={activeProduct.name}
                  fill
                  priority
                  className="object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>

            {/* Out of Stock Hero Overlay & Badges */}
            {activeProduct.isOutOfStock && (
              <>
                <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] z-20 pointer-events-none" />
                <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
                  <div className="px-6 py-2.5 rounded-2xl bg-neutral-950/90 text-white border border-rose-500/60 shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-black tracking-widest uppercase text-rose-400">Out of Stock</span>
                  </div>
                </div>
                <div className="absolute top-3 left-14 z-25 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg border border-rose-400/40 flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Out of Stock
                  </span>
                </div>
              </>
            )}

            {/* Left & Right Chevron Overlay Buttons */}
            {activeProduct.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </>
            )}

            {/* Pagination Dots INSIDE Image Overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 shadow-sm z-20">
              {activeProduct.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'w-4 h-1.5 bg-white shadow-xs'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Select Size Section */}
          <div className="px-3.5 mt-2.5">
            <div className="bg-gradient-to-br from-neutral-50/90 to-blue-50/20 rounded-2xl p-3 border border-neutral-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Select Size</h3>
                  {activeProduct.isOutOfStock ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      Sold Out
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-400">• Standard Fit</span>
                  )}
                </div>
                <button className="flex items-center gap-1 text-[11px] text-[#2874F0] font-bold uppercase tracking-wider hover:underline cursor-pointer">
                  <Ruler className="w-3.5 h-3.5" />
                  Size Chart
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => {
                  const isSelected = selectedSize === size;
                  const qty = activeProduct.isOutOfStock ? 0 : (activeProduct.inventory[size] || 0);
                  const isAvailable = !activeProduct.isOutOfStock && qty > 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !activeProduct.isOutOfStock && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`relative py-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                        !isAvailable
                          ? 'border-neutral-200 bg-neutral-100/70 text-neutral-400 border-dashed cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-[#2874F0] bg-blue-50/90 text-[#2874F0] shadow-xs font-black ring-2 ring-[#2874F0]/20 active:scale-95 cursor-pointer'
                          : 'border-neutral-200 bg-white text-neutral-800 font-bold hover:border-neutral-300 hover:bg-neutral-50 active:scale-95 cursor-pointer'
                      }`}
                    >
                      <span className="text-xs">{size}</span>
                      {!isAvailable && (
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[1.5px] bg-rose-300 -rotate-12"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeProduct.isOutOfStock ? (
                <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-pulse" />
                  <span>All sizes are currently out of stock for this garment.</span>
                </div>
              ) : currentStock <= 3 && currentStock > 0 ? (
                <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg border border-red-100/80">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <p className="text-[10px] uppercase tracking-wider text-red-600 font-bold leading-tight">
                    Hurry, only {currentStock} left in size {selectedSize}!
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Product Title & Brand */}
          <div className="px-4 mt-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 tracking-widest uppercase">
                {activeProduct.shop?.name || 'Local Boutique'}
              </span>
              {activeProduct.isOutOfStock && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Out of Stock
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-neutral-900 leading-snug">
              {activeProduct.name}
            </h1>
          </div>

          {/* Pricing Section */}
          <div className="px-4 mt-2.5">
            {activeProduct.isOutOfStock ? (
              <div className="inline-block px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded shadow-2xs mb-1.5 uppercase tracking-wide">
                Out of Stock • Restock Soon
              </div>
            ) : (
              <div className="inline-block px-2 py-0.5 bg-gradient-to-r from-[#388E3C] to-[#4caf50] text-white text-[10px] font-bold rounded shadow-2xs mb-1.5 uppercase tracking-wide">
                Lowest Price since Launch
              </div>
            )}
            <div className="flex items-end gap-2.5">
              {discountPercent > 0 && !activeProduct.isOutOfStock && (
                <span className="text-2xl font-bold text-[#388E3C]">
                  ↓{discountPercent}%
                </span>
              )}
              {activeProduct.originalPrice && !activeProduct.isOutOfStock && (
                <span className="text-xl text-neutral-400 line-through font-medium mb-0.5">
                  ₹{activeProduct.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className={`text-3xl font-extrabold drop-shadow-2xs ${activeProduct.isOutOfStock ? 'text-neutral-400' : 'text-neutral-900'}`}>
                ₹{activeProduct.price.toLocaleString('en-IN')}
              </span>
              {activeProduct.isOutOfStock && (
                <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wide border border-rose-200 ml-1 mb-0.5">
                  Sold Out
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1 font-medium">
              +₹99 Delivery Fee <ChevronRight className="w-3 h-3" />
            </p>

            {/* 7-Day Verified Price History & Stock-Market Surge Trigger */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="view-price-history-btn"
                onClick={() => setIsPriceHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>7-Day Price History & Trend</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              </button>
              <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero Artificial Markup
              </span>
            </div>

            {/* Flipkart-Style Delivery ETA Promise Card */}
            {deliveryPromise && (
              <div className="mt-3">
                <DeliveryPromiseCard promise={deliveryPromise} />
              </div>
            )}

            {/* Swapped Side-by-Side Action Cards */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {/* Box 1 (Left Side): Seller Store */}
              <button
                onClick={() => {
                  if (onOpenShopProfile) {
                    onClose();
                    onOpenShopProfile(activeProduct.shop);
                  }
                }}
                className="py-2 px-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 rounded-xl flex items-center gap-2 shadow-[0_2px_10px_rgba(16,185,129,0.12)] transition-all cursor-pointer active:scale-95 text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs border border-emerald-400">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-neutral-900 truncate leading-tight flex items-center gap-1 group-hover:text-emerald-700">
                    <span className="truncate">Seller Store</span>
                    {activeProduct.shop?.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[10px] font-medium text-neutral-600 truncate mt-0.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded flex items-center gap-0.5 shadow-2xs shrink-0 leading-none">
                      {activeProduct.shop?.rating ? Number(activeProduct.shop.rating).toFixed(1) : 'New'}
                      <Star className="w-2.5 h-2.5 fill-white text-white shrink-0" />
                    </span>
                    <span className="truncate font-bold text-neutral-800">{activeProduct.shop?.name || 'Local Shop'}</span>
                  </div>
                </div>
              </button>

              {/* Box 2 (Right Side): Send Message */}
              <button
                onClick={() => {
                  onClose();
                  const inquiryMsg = `🏷️ Product Inquiry: ${activeProduct.name} (₹${activeProduct.price?.toLocaleString('en-IN')}) — "Hi! I'm interested in this piece. What's the best exclusive deal or discount you can offer?"`;
                  if (onOpenChat) onOpenChat(activeProduct, inquiryMsg);
                }}
                className="py-2 px-2.5 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200 rounded-xl flex items-center gap-2 shadow-[0_2px_10px_rgba(40,116,240,0.12)] transition-all cursor-pointer active:scale-95 text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs border border-blue-400">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-neutral-900 truncate leading-tight group-hover:text-blue-700">Send Message</div>
                  <div className="text-[10px] font-semibold text-blue-600 truncate mt-0.5">for make offer 🎉</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Details & Trust Perks Section (Nvilar Flagship Standard) */}
        <div className="bg-white mt-2 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2874F0]" />
              Delivery & Service Details
            </h3>
            {activeProduct.isOutOfStock ? (
              <span className="text-[10px] font-black px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-300 uppercase tracking-wide flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                Out of Stock
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                In Stock
              </span>
            )}
          </div>

          {/* Delivery Location & Pincode Box */}
          <div className="bg-gradient-to-r from-blue-50/70 to-slate-50/80 rounded-xl p-3 border border-blue-100/80 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${deliveryPromise?.tier === 'today' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {deliveryPromise?.tier === 'today' ? <Zap className="w-4 h-4 fill-current" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                    <span>Deliver to</span>
                    <span className="text-[#2874F0] font-mono">{pincode}</span>
                    <span className="text-neutral-500">({pincodeCity})</span>
                  </p>
                  <p className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                    {deliveryPromise?.tier === 'today' ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <span>⚡ Today Delivery (30–60 Min Express)</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                          Hyperlocal
                        </span>
                      </span>
                    ) : deliveryPromise?.tier === 'tomorrow' ? (
                      <span className="text-blue-700 font-bold flex items-center gap-1">
                        <span>⚡ Tomorrow Delivery</span>
                        <span className="text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                          Priority Prime
                        </span>
                      </span>
                    ) : (
                      <span className="text-neutral-700 font-medium">
                        Standard Delivery by <span className="font-bold text-neutral-950">{deliveryPromise?.etaDate || '2–4 Days'}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleDetectLiveLocation}
                  disabled={isDetectingLocation}
                  className="px-2 py-1 bg-white border border-neutral-300 hover:border-blue-400 text-neutral-700 font-bold text-[10px] rounded-lg active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  title="Detect GPS with High Accuracy"
                >
                  <Navigation className={`w-3 h-3 text-blue-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isDetectingLocation ? 'GPS...' : 'Live GPS'}</span>
                </button>
                <button
                  onClick={() => setIsEditingPincode(!isEditingPincode)}
                  className="px-2.5 py-1 bg-white border border-blue-200 text-[#2874F0] font-bold text-xs rounded-lg hover:bg-blue-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  {isEditingPincode ? 'Cancel' : 'Change'}
                </button>
              </div>
            </div>

            {/* Pincode Input Box (When Change is Clicked) */}
            <AnimatePresence>
              {isEditingPincode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2.5 pt-2.5 border-t border-blue-100/80 flex gap-2"
                >
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={tempPincode}
                    onChange={(e) => setTempPincode(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs outline-none focus:border-[#2874F0] font-bold"
                  />
                  <button
                    onClick={handleApplyPincode}
                    className="px-4 py-1.5 bg-[#2874F0] text-white font-bold text-xs rounded-lg shadow-2xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                  >
                    Check
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Prominent Flipkart-Style Delivery Promise Card near Pincode Selector */}
          {deliveryPromise && (
            <div className="mb-3">
              <DeliveryPromiseCard promise={deliveryPromise} />
            </div>
          )}

          {/* Seller Fulfillment Banner */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200/70 mb-3 text-xs text-neutral-700">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex items-center gap-1.5 flex-wrap">
              Fulfilled by <strong className="text-neutral-900 font-bold">{activeProduct.shop?.name || 'Seller Store'}</strong>
              {activeProduct.shop?.verified && <VerifiedBadge size={14} className="-mt-0.5" />}
              • Dispatches in 24 Hours
            </span>
          </div>

          {/* 3 Premium Service Trust Perks Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setActivePolicyModal('cancel')}
              className="p-2.5 bg-neutral-50/80 hover:bg-blue-50/60 active:scale-95 rounded-xl border border-neutral-200/60 hover:border-blue-200 flex flex-col items-center text-center transition-all cursor-pointer group relative"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-all">
                <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-neutral-900 leading-tight flex items-center gap-0.5">
                24h Cancel
                <Info className="w-2.5 h-2.5 text-blue-500" />
              </span>
              <span className="text-[9px] font-medium text-neutral-500 mt-0.5">Terms Apply</span>
            </button>

            <button
              onClick={() => setActivePolicyModal('return')}
              className="p-2.5 bg-neutral-50/80 hover:bg-emerald-50/60 active:scale-95 rounded-xl border border-neutral-200/60 hover:border-emerald-200 flex flex-col items-center text-center transition-all cursor-pointer group relative"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-all">
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-neutral-900 leading-tight flex items-center gap-0.5">
                7-Day Return
                <Info className="w-2.5 h-2.5 text-emerald-500" />
              </span>
              <span className="text-[9px] font-medium text-neutral-500 mt-0.5">Free Pick-up</span>
            </button>

            <button
              onClick={() => setActivePolicyModal('cod')}
              className="p-2.5 bg-neutral-50/80 hover:bg-amber-50/60 active:scale-95 rounded-xl border border-neutral-200/60 hover:border-amber-200 flex flex-col items-center text-center transition-all cursor-pointer group relative"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-all">
                <Banknote className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-neutral-900 leading-tight flex items-center gap-0.5">
                Cash on Delivery
                <Info className="w-2.5 h-2.5 text-amber-500" />
              </span>
              <span className="text-[9px] font-medium text-neutral-500 mt-0.5">Available</span>
            </button>
          </div>
        </div>

        {/* Clean & Crystal Product Specifications (Merchant Listing Style) */}
        <div className="bg-white mt-2 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#2874F0]" />
              Product Specifications
            </h3>
            <span className="text-[10px] text-neutral-400 font-semibold">SKU: {activeProduct.id.toUpperCase()}</span>
          </div>

          {/* Clean 2-Column Merchant Attributes Table */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Color */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Color</span>
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0" 
                  style={{ backgroundColor: activeProduct.colorHex || '#1e293b' }} 
                />
                <span className="truncate">{activeProduct.color || 'Monochrome Black'}</span>
              </div>
            </div>

            {/* Fabric */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Fabric & Material</span>
              <span className="font-bold text-neutral-900 block truncate">{activeProduct.fabric}</span>
            </div>

            {/* Fit */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Fit Silhouette</span>
              <span className="font-bold text-neutral-900 block truncate">{activeProduct.fit} Fit</span>
            </div>

            {/* GSM */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Fabric Density</span>
              <span className="font-bold text-neutral-900 block truncate">{activeProduct.gsm} GSM Heavyweight</span>
            </div>

            {/* Pattern */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Pattern</span>
              <span className="font-bold text-neutral-900 block truncate">Solid / Textured Weave</span>
            </div>

            {/* Care */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Wash Care</span>
              <span className="font-bold text-neutral-900 block truncate">Machine Wash Cold</span>
            </div>

            {/* Occasion */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Occasion</span>
              <span className="font-bold text-neutral-900 block truncate">Casual / Evening Resort</span>
            </div>

            {/* Origin */}
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Country of Origin</span>
              <span className="font-bold text-neutral-900 block truncate">Made in India 🇮🇳</span>
            </div>
          </div>

          {/* Product Description & Highlights */}
          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Product Story</h4>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              {activeProduct.description}
            </p>

            <div className="pt-2 space-y-1.5">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Key Highlights</h4>
              {activeProduct.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-neutral-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2874F0] shrink-0" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Outfits / Products Carousel */}
        <div className="bg-white mt-2 pt-3 pb-3 shadow-2xs mb-2">
          <div className="flex items-center justify-between mb-2.5 px-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Similar Outfits</h3>
              <p className="text-[10px] text-neutral-400 font-medium">Curated recommendations for you</p>
            </div>
            <span className="text-xs text-[#2874F0] font-bold cursor-pointer hover:underline">
              View All
            </span>
          </div>

          {/* Horizontal Scrollable Product List */}
          <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-none px-1.5">
            {similarProducts.map((simProd) => {
              const simDiscount = simProd.originalPrice
                ? Math.round(((simProd.originalPrice - simProd.price) / simProd.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={simProd.id}
                  onClick={() => handleSwitchProduct(simProd)}
                  className="w-36 shrink-0 bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs hover:shadow-md cursor-pointer active:scale-95 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Full-bleed Image Box */}
                    <div className="relative w-full aspect-[3/4] bg-neutral-100">
                      <Image
                        src={simProd.thumbnail}
                        alt={simProd.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-all duration-300"
                      />
                      {simDiscount > 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#388E3C] text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                          ↓{simDiscount}%
                        </span>
                      )}
                    </div>

                    <div className="p-2">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block truncate">
                        {simProd.shop?.name || 'Local Boutique'}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 truncate leading-snug mt-0.5">
                        {simProd.name}
                      </h4>
                    </div>
                  </div>

                  <div className="px-2 pb-2 flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-neutral-900">
                      ₹{simProd.price.toLocaleString('en-IN')}
                    </span>
                    {simProd.originalPrice && (
                      <span className="text-[10px] text-neutral-400 line-through">
                        ₹{simProd.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nvilar Curated 2-Column Edge-to-Edge Feed: "More Products You May Like" */}
        <div className="bg-white mt-2 pt-3 pb-4 shadow-2xs mb-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2874F0]" />
                More Products You May Like
              </h3>
              <p className="text-[10px] text-neutral-400 font-medium">Explore all trending outfits in collection</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#2874F0] rounded border border-blue-200">
              {exploreMoreProducts.length} Items
            </span>
          </div>

          {/* 2-Column Grid matching Home Page ProductCard styling - Edge to Edge */}
          <div className="grid grid-cols-2 gap-1.5 px-1 sm:px-2">
            {exploreMoreProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenProduct={handleSwitchProduct}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions - Clean Native E-commerce Layout */}
      <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-2xl border-t border-neutral-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] p-3 pb-safe z-40 flex gap-2.5 items-stretch">
        {/* Share Icon Button */}
        <button
          onClick={handleShareProduct}
          className="w-12 py-3 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-xl shadow-2xs active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Share Product"
        >
          <Share2 className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Action Buttons: Out of Stock vs In Stock */}
        {activeProduct.isOutOfStock ? (
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenChat) onOpenChat(activeProduct);
              }}
              className="flex-1 py-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#2874F0] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask For Restock</span>
            </button>
            <button
              disabled
              className="flex-1 py-3.5 bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Out of Stock</span>
            </button>
          </div>
        ) : (
          <>
            {/* Add to Cart */}
            <button
              onClick={() => {
                onAddToCart(activeProduct, selectedSize);
                onClose();
              }}
              className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-2xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              Add to Cart
            </button>

            {/* Buy Now */}
            <button
              onClick={() => {
                if (onBuyNow) {
                  onBuyNow(activeProduct, selectedSize);
                } else {
                  onAddToCart(activeProduct, selectedSize);
                }
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[#0C1E4A] via-[#102E6E] to-[#1246B8] hover:from-[#102E6E] hover:to-[#1a55d4] border border-blue-900/40 text-white rounded-xl shadow-xl shadow-blue-950/20 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-[0.98]"
            >
              <span className="font-black text-xs uppercase tracking-wider leading-tight">Buy Now</span>
              <span className="text-[11px] font-extrabold text-blue-200 leading-tight">₹{activeProduct.price.toLocaleString('en-IN')}</span>
            </button>
          </>
        )}
      </div>

      {/* Service Policy & Terms Conditions Modal Sheet */}
      <AnimatePresence>
        {activePolicyModal && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePolicyModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4" />

              {activePolicyModal === 'cancel' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">24-Hour Cancellation Policy</h3>
                        <p className="text-xs text-neutral-500 font-medium">Free & hassle-free order cancellation</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePolicyModal(null)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Cancellation Window</span>
                        <p className="text-neutral-600">You can cancel your order free of charge within 24 hours of placing the order or before dispatch.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">100% Instant Refund</span>
                        <p className="text-neutral-600">Refunds are initiated instantly to your original payment mode (UPI / Bank Account) within 24 hours.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Post-Dispatch Cancellation</span>
                        <p className="text-neutral-600">If dispatched after 24h, simply decline delivery at your doorstep or initiate a 7-day return after delivery.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePolicyModal(null)}
                    className="w-full py-3 bg-[#2874F0] text-white font-bold text-sm rounded-xl hover:bg-blue-700 active:scale-98 transition-all cursor-pointer shadow-md"
                  >
                    Understood
                  </button>
                </div>
              )}

              {activePolicyModal === 'return' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">7-Day Easy Return & Replacement</h3>
                        <p className="text-xs text-neutral-500 font-medium">Free doorstep pickup guaranteed</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePolicyModal(null)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">7-Day Return Window</span>
                        <p className="text-neutral-600">You can request a return or size/color replacement within 7 days from the delivery date.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Condition Requirements</span>
                        <p className="text-neutral-600">Item must be unused, unwashed, and in original condition with brand tags & packaging intact.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Zero Cost Pickup</span>
                        <p className="text-neutral-600">Our courier agent will pick up the package directly from your home address at no additional cost.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePolicyModal(null)}
                    className="w-full py-3 bg-[#388E3C] text-white font-bold text-sm rounded-xl hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer shadow-md"
                  >
                    Got It
                  </button>
                </div>
              )}

              {activePolicyModal === 'cod' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">Cash on Delivery Conditions</h3>
                        <p className="text-xs text-neutral-500 font-medium">Pay cash or UPI on delivery</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePolicyModal(null)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Payment at Doorstep</span>
                        <p className="text-neutral-600">Pay cash or scan the courier partner&apos;s UPI QR code using PhonePe, Paytm, or Google Pay.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Order Verification</span>
                        <p className="text-neutral-600">A quick 1-click SMS/WhatsApp OTP verification may be required to confirm your COD order.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-900 block mb-0.5">Package Verification</span>
                        <p className="text-neutral-600">Check the sealed box before accepting delivery. Do not accept tampered or open packages.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePolicyModal(null)}
                    className="w-full py-3 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 active:scale-98 transition-all cursor-pointer shadow-md"
                  >
                    I Understand
                  </button>
                </div>
              )}
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7-Day Verified Price History Modal */}
      {activeProduct && (
        <PriceHistoryModal
          isOpen={isPriceHistoryOpen}
          onClose={() => setIsPriceHistoryOpen(false)}
          productId={activeProduct.id}
          productName={activeProduct.name}
          currentPrice={activeProduct.price}
          originalPrice={activeProduct.originalPrice}
          onSelectBuy={() => {
            setIsPriceHistoryOpen(false);
            const size = selectedSize || 'M';
            if (onBuyNow) onBuyNow(activeProduct, size);
          }}
        />
      )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
