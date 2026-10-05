'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  CreditCard,
  Clock,
  Truck,
  ShieldCheck,
  Check,
  Save,
  AlertCircle,
  RefreshCw,
  Power,
  Sparkles,
  MapPin,
  Layers,
  ArrowRight
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

interface SellerSettingsProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
}

export const SellerSettings: React.FC<SellerSettingsProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [marketName, setMarketName] = useState('');
  const [category, setCategory] = useState('');
  const [payoutUpiId, setPayoutUpiId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Operational toggles
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [openingTime, setOpeningTime] = useState('10:00 AM');
  const [closingTime, setClosingTime] = useState('09:30 PM');
  const [dispatchTime, setDispatchTime] = useState('24 Hours');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1999');
  const [shippingFlatRate, setShippingFlatRate] = useState('99');

  const fetchShopSettings = async () => {
    if (!shopId && !userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const backendUrl = getBackendUrl();
      const queryParam = shopId ? `shop_id=${encodeURIComponent(shopId)}` : `user_id=${encodeURIComponent(userId)}`;
      const res = await fetch(`${backendUrl}/api/seller/profile?${queryParam}`, {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      if (data.success && data.shop) {
        const s = data.shop;
        setName(s.name || '');
        setBio(s.bio || '');
        setCity(s.city || 'Delhi');
        setMarketName(s.market_name || 'Khan Market');
        setCategory(s.category || 'Apparel');
        setPayoutUpiId(s.payout_upi_id || 'ashraf@okaxis');
        setLogoUrl(s.logo_url || '');
        setCoverImage(s.cover_image || '');
      }
    } catch (err) {
      console.error('Failed to load shop settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopSettings();
  }, [shopId, userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/seller/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shopId,
          name,
          bio,
          city,
          market_name: marketName,
          category,
          payout_upi_id: payoutUpiId,
          logo_url: logoUrl,
          cover_image: coverImage,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSaveSuccess(true);
        sellerAudio.playDealChime();
        onRefreshMetrics?.();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-neutral-500 max-w-4xl mx-auto">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
        <span>Loading boutique settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
            Boutique Settings & Payouts
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your brand details, payout UPI address, vacation mode and fulfillment rules.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings Saved Live!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Brand Identity */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Store className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-neutral-950">Boutique Brand Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Boutique Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Primary Category *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Market / Hub Name *
              </label>
              <input
                type="text"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Boutique Bio / Tagline
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Logo Image URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Cover Photo URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Direct UPI Payouts */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-neutral-950">Direct UPI Payout Settings</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              Instant T+1 Settlement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Payout UPI VPA ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={payoutUpiId}
                  onChange={(e) => setPayoutUpiId(e.target.value)}
                  required
                  placeholder="name@okaxis / mobile@upi"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 font-mono placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Customer payments are credited straight to this UPI handle minus platform fee.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-700 space-y-1">
                <div className="font-bold text-neutral-950">Bank Verification Active</div>
                <div className="text-[11px] text-neutral-500">
                  NPCI UPI Gateway is connected. Daily payouts trigger automatically at 2:00 AM IST.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operations & Vacation Mode */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Clock className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-neutral-950">Operations & Store Timings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Boutique Opens
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Boutique Closes
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Expected Dispatch SLA
              </label>
              <select
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-purple-500 focus:bg-white"
              >
                <option value="Same Day">Same Day Dispatch</option>
                <option value="24 Hours">Within 24 Hours</option>
                <option value="48 Hours">Within 48 Hours</option>
              </select>
            </div>
          </div>

          {/* Vacation Mode Toggle */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-neutral-950 flex items-center gap-2">
                <span>Vacation Mode / Away Status</span>
                {isVacationMode && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                    Pause Orders
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500">
                Temporarily pause new checkout orders while you are away or replenishing inventory.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsVacationMode(!isVacationMode)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isVacationMode ? 'bg-amber-500' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  isVacationMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 4: Shipping Rules */}
        <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Truck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-neutral-950">Shipping & Delivery Policies</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Free Shipping Order Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Orders above this amount qualify for 100% complimentary doorstep delivery.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Standard Shipping Flat Rate (₹)
              </label>
              <input
                type="number"
                value={shippingFlatRate}
                onChange={(e) => setShippingFlatRate(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Applied on orders below the complimentary free shipping threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-end gap-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-neutral-200 shadow-xl">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/10 active:scale-95 transition-all"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving Changes...' : 'Save Boutique Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
