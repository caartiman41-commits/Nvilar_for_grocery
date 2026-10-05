'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  X,
  Sparkles,
  TrendingUp,
  MapPin,
  Users,
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Eye,
  MousePointerClick,
  Share2,
  Check,
  ChevronRight,
  Flame
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

export interface ProductItemForBoost {
  id: string;
  name: string;
  category: string;
  base_price: number;
  original_price: number;
  thumbnail: string;
  fabric?: string;
  fit?: string;
  is_sponsored?: boolean;
  boost_expires_at?: string | null;
  target_audience?: any;
}

interface ProductBoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItemForBoost | null;
  userId?: string;
  shopId?: string;
  onBoostSuccess?: (updatedProduct: ProductItemForBoost) => void;
}

export const ProductBoostModal: React.FC<ProductBoostModalProps> = ({
  isOpen,
  onClose,
  product,
  userId: propUserId,
  shopId,
  onBoostSuccess,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedDemographic, setSelectedDemographic] = useState<'gen_z' | 'young_adults' | 'all'>('gen_z');
  const [selectedRegion, setSelectedRegion] = useState<'ne_assam' | 'metro' | 'pan_india'>('ne_assam');
  const [selectedVibe, setSelectedVibe] = useState<string>('Streetwear & Fusion');
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessState, setIsSuccessState] = useState(false);

  // Live timer state
  const [remainingTime, setRemainingTime] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
  });

  const isAlreadyBoosted = Boolean(
    product?.is_sponsored &&
    product?.boost_expires_at &&
    new Date(product.boost_expires_at).getTime() > Date.now()
  );

  // Live countdown timer calculation
  useEffect(() => {
    if (!product?.boost_expires_at) {
      setRemainingTime({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(product.boost_expires_at!).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setRemainingTime({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setRemainingTime({ hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product?.boost_expires_at]);

  // Handle Boost Activation
  const handleLaunchBoost = async () => {
    if (!product) return;
    try {
      setIsActivating(true);
      setErrorMessage(null);
      const backendUrl = getBackendUrl();

      const audiencePayload = {
        demographic: selectedDemographic,
        region: selectedRegion,
        vibe: selectedVibe,
        labels: {
          demographic: selectedDemographic === 'gen_z' ? 'Gen-Z (18-24)' : selectedDemographic === 'young_adults' ? 'Young Adults (25-35)' : 'All Fashion Lovers',
          region: selectedRegion === 'ne_assam' ? 'Assam & North-East' : selectedRegion === 'metro' ? 'Top Metros' : 'Pan-India Wide',
        }
      };

      const res = await fetch(`${backendUrl}/api/seller/products/${encodeURIComponent(product.id)}/boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shopId,
          target_audience: audiencePayload,
          duration_hours: 24,
          budget_inr: 99,
          campaign_name: `Sponsored Boost (₹99) - ${product.name}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to activate boost');
      }

      // Play success chime
      sellerAudio.playDealChime();
      setIsSuccessState(true);

      const updated: ProductItemForBoost = {
        id: product.id,
        name: product.name,
        category: product.category,
        base_price: product.base_price,
        original_price: product.original_price,
        thumbnail: product.thumbnail,
        fabric: product.fabric,
        fit: product.fit,
        is_sponsored: true,
        boost_expires_at: data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        target_audience: audiencePayload,
      };

      onBoostSuccess?.(updated);

      // Notify window of product update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mitreno:products-updated'));
      }
    } catch (err: any) {
      console.error('Boost activation error:', err);
      setErrorMessage(err.message || 'Something went wrong activating your boost');
    } finally {
      setIsActivating(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-2xl relative text-neutral-900 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-950 tracking-tight flex items-center gap-1.5">
                <span>Boost Product Ad</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                  ₹99 for 24h
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">Instagram-Style Top Placements & Reach Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Snapshot Bar */}
        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200/70 flex items-center gap-3">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="font-bold text-neutral-900">₹{product.base_price?.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span className="truncate">{product.fabric || product.category}</span>
            </div>
          </div>
          {isAlreadyBoosted && !remainingTime.isExpired ? (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-xl bg-neutral-200 text-neutral-600 text-[10px] font-bold">
              Ready to Boost
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* A. If Already Boosted - Live Countdown & Re-Boost Section */}
          {isAlreadyBoosted && !remainingTime.isExpired && !isSuccessState ? (
            <div className="space-y-4">
              {/* Live Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-purple-500/10 border border-amber-500/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600 animate-bounce" />
                    <span>Active Boost Running</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200">
                    Auto-pauses when timer ends
                  </span>
                </div>

                {/* Big Countdown Timer */}
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="p-2.5 rounded-xl bg-white/90 shadow-xs border border-amber-200/80">
                    <div className="text-2xl font-black text-neutral-950 font-mono">
                      {String(remainingTime.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Hours</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 shadow-xs border border-amber-200/80">
                    <div className="text-2xl font-black text-neutral-950 font-mono">
                      {String(remainingTime.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Mins</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/90 shadow-xs border border-amber-200/80">
                    <div className="text-2xl font-black text-rose-600 font-mono animate-pulse">
                      {String(remainingTime.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Secs</div>
                  </div>
                </div>

                {/* Guaranteed Live Placements */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="text-[11px] font-bold text-neutral-700">Guaranteed Placements Active Now:</div>
                  <div className="flex items-center gap-2 text-neutral-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>#1 Top of Customer Search with <strong>Sponsored • Ad</strong> Badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Shopping Cart Recommended Carousel for Local Shoppers</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Targeting: {product.target_audience?.labels?.demographic || 'Gen-Z'} in {product.target_audience?.labels?.region || 'Assam & North-East'}</span>
                  </div>
                </div>
              </div>

              {/* Extend / Re-Boost CTA */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-900">Extend Boost (+24 Hours)</h5>
                    <p className="text-[11px] text-neutral-500">Add 24 more hours without losing ad momentum</p>
                  </div>
                  <span className="text-sm font-black text-amber-700">₹99</span>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchBoost}
                  disabled={isActivating}
                  className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isActivating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extending Boost...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400 fill-current" />
                      <span>Extend for +24 Hours (₹99)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : isSuccessState ? (
            /* B. Success State Celebration Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-neutral-950">Boost Launched Successfully!</h4>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                  Your product is now actively featured at the top of search results and explore feed for the next 24 hours.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left max-w-sm mx-auto space-y-1.5 text-xs text-amber-950">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Campaign Active: 24-26 Hours</span>
                </div>
                <div className="text-[11px] text-amber-800">
                  Fixed Package: ₹99 • Placements: Search #1, Cart Recommendations, Explore Feed
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Close & View Active Ad
              </button>
            </div>
          ) : (
            /* C. Instagram-Style 3-Step Boost Setup */
            <div className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* Step Navigation Indicator */}
              <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-neutral-100">
                <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-amber-600' : 'text-neutral-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">1</span>
                  <span>Audience</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-amber-600' : 'text-neutral-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center text-[10px]">2</span>
                  <span>Package (₹99)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-amber-600' : 'text-neutral-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center text-[10px]">3</span>
                  <span>Pay & Launch</span>
                </div>
              </div>

              {/* STEP 1: AUDIENCE SELECTION */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-900 uppercase tracking-wider block">
                      1. Who should see this garment? (Age & Demographics)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDemographic('gen_z')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedDemographic === 'gen_z'
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                          <span>Gen-Z (18-24)</span>
                          {selectedDemographic === 'gen_z' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Trendy, reels, oversized & streetwear</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDemographic('young_adults')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedDemographic === 'young_adults'
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                          <span>Young Adults (25-35)</span>
                          {selectedDemographic === 'young_adults' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Quality fabrics, office & weekend luxury</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDemographic('all')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedDemographic === 'all'
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                          <span>All Fashion Lovers</span>
                          {selectedDemographic === 'all' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Broadest reach across all customer groups</p>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-900 uppercase tracking-wider block">
                      2. Target Region & Delivery Hub
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRegion('ne_assam')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedRegion === 'ne_assam'
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                          <span>Assam & North-East</span>
                          {selectedRegion === 'ne_assam' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Guwahati, Shillong, Jorhat & Dibrugarh</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRegion('metro')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedRegion === 'metro'
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                          <span>Top Metro Cities</span>
                          {selectedRegion === 'metro' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">Delhi NCR, Mumbai, Bengaluru, Kolkata</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRegion('pan_india')}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedRegion === 'pan_india'
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                          <span>Pan-India Wide</span>
                          {selectedRegion === 'pan_india' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">All 28 Indian States & Delhivery Express</p>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-2.5 px-5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Continue to Package</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PACKAGE & PLACEMENTS */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Fixed ₹99 Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-500 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                          Official Merchant Boost
                        </span>
                        <h4 className="text-lg font-black text-neutral-950 mt-1">₹99 for 24 Hours</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-neutral-500">Estimated Reach</div>
                        <div className="text-base font-black text-emerald-600">2,400 – 3,800</div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Your product will be pinned to the top of customer search queries and featured with a gold <strong>Sponsored • Ad</strong> badge across the marketplace for 24-26 hours.
                    </p>

                    <div className="p-3 rounded-xl bg-white/90 border border-amber-200/80 space-y-2 text-xs">
                      <div className="font-bold text-neutral-900">What’s Included in this ₹99 Boost:</div>
                      <div className="flex items-start gap-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>#1 Top of Search Results:</strong> Automatically displayed above normal products when shoppers search for shirts, jackets, or fashion in your category.</span>
                      </div>
                      <div className="flex items-start gap-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Cart Add-on Placement:</strong> Featured in cart recommendations when customers checkout items from other stores.</span>
                      </div>
                      <div className="flex items-start gap-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Auto-Pause Protection:</strong> Boost safely pauses after 24 hours. No hidden charges or recurring deduction.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="py-2.5 px-5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Proceed to Payment (₹99)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & ACTIVATION */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200/80">
                      <span className="font-bold text-neutral-700">Boost Duration:</span>
                      <span className="font-bold text-neutral-950">24 Hours (Guaranteed)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200/80">
                      <span className="font-bold text-neutral-700">Targeting:</span>
                      <span className="font-bold text-neutral-950">
                        {selectedDemographic === 'gen_z' ? 'Gen-Z (18-24)' : 'Young Adults'} • {selectedRegion === 'ne_assam' ? 'Assam & NE' : 'Pan-India'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200/80">
                      <span className="font-bold text-neutral-700">Payment Gateway:</span>
                      <span className="font-bold text-neutral-950 flex items-center gap-1 text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Instant UPI Auto-Verify</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="font-black text-neutral-900">Total Payable:</span>
                      <span className="font-black text-lg text-amber-600">₹99</span>
                    </div>
                  </div>

                  {/* 1-Click Pay and Launch Button */}
                  <button
                    type="button"
                    onClick={handleLaunchBoost}
                    disabled={isActivating}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isActivating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Activating ₹99 Boost...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Pay ₹99 & Launch Boost (24h)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
                    >
                      ← Back to Details
                    </button>
                    <span className="text-[11px] text-neutral-400">T+1 Automated Accounting</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
