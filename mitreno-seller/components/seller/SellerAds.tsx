'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  TrendingUp,
  Plus,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Target,
  BarChart3,
  Eye,
  MousePointer,
  ShoppingBag,
  DollarSign,
  Calendar,
  X,
  Check,
  RefreshCw,
  Zap,
  Tag,
  Layers,
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

interface AdCampaign {
  id: string;
  shop_id: string;
  campaign_name: string;
  ad_type: string;
  banner_image_url: string;
  target_url: string;
  daily_budget_inr: number;
  total_spent_inr: number;
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  orders_generated: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface SellerAdsProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

const SAMPLE_BANNERS = [
  {
    name: 'Luxury Dark Streetwear Drop',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisanal Tailoring & Raw Silk',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Acid-Wash French Terry Lookbook',
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1600&auto=format&fit=crop&q=80',
  },
];

export const SellerAds: React.FC<SellerAdsProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [summary, setSummary] = useState<{
    total_campaigns: number;
    active_campaigns: number;
    total_impressions: number;
    total_clicks: number;
    total_spent: number;
    total_orders_generated: number;
  }>({
    total_campaigns: 0,
    active_campaigns: 0,
    total_impressions: 0,
    total_clicks: 0,
    total_spent: 0,
    total_orders_generated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'home_banner' | 'sponsored_product'>('all');

  // Create Ad Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [adType, setAdType] = useState<'home_banner' | 'sponsored_product'>('home_banner');
  const [bannerUrl, setBannerUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [dailyBudget, setDailyBudget] = useState(500);
  const [durationDays, setDurationDays] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = getBackendUrl();

  const fetchAdsData = useCallback(async () => {
    if (!shopId && !userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (shopId) params.append('shop_id', shopId);
      if (userId) params.append('user_id', userId);

      const res = await fetch(`${backendUrl}/api/seller/ads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAds(data.ads || []);
        if (data.summary) {
          setSummary({
            total_campaigns: parseInt(data.summary.total_campaigns || 0, 10),
            active_campaigns: parseInt(data.summary.active_campaigns || 0, 10),
            total_impressions: parseInt(data.summary.total_impressions || 0, 10),
            total_clicks: parseInt(data.summary.total_clicks || 0, 10),
            total_spent: parseInt(data.summary.total_spent || 0, 10),
            total_orders_generated: parseInt(data.summary.total_orders_generated || 0, 10),
          });
        }
      }
    } catch (err) {
      console.error('Failed to load ads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, shopId, userId]);

  useEffect(() => {
    fetchAdsData();
  }, [fetchAdsData]);

  // Handle Create Ad
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !bannerUrl) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shopId,
          campaign_name: campaignName,
          ad_type: adType,
          banner_image_url: bannerUrl,
          target_url: targetUrl || `/shops/${shopId}`,
          daily_budget_inr: dailyBudget,
          duration_days: durationDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setCampaignName('');
        setBannerUrl('');
        setTargetUrl('');
        sellerAudio.playDealChime();
        fetchAdsData();
        if (onRefreshMetrics) onRefreshMetrics();
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Error creating ad:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Pause / Active
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/seller/ads/${id}/toggle`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchAdsData();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Delete Ad
  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to end and delete this campaign?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/seller/ads/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchAdsData();
      }
    } catch (err) {
      console.error('Error deleting ad:', err);
    }
  };

  const filteredAds = ads.filter(a => {
    if (filterType === 'all') return true;
    return a.ad_type === filterType;
  });

  const overallCTR = summary.total_impressions > 0 
    ? ((summary.total_clicks / summary.total_impressions) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & PROMOTIONS HERO BANNER */}
      <div className="rounded-3xl bg-white border border-neutral-200/90 p-6 space-y-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mitreno Ad Engine & Sponsored Placements</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight">
              Ads, Billboards & Sponsored Slots 🚀
            </h2>
            <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
              Showcase high-impact carousel banners on the customer home screen and rank #1 in category searches for city shoppers.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Ad Campaign</span>
          </button>
        </div>

        {/* Ad Performance KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Impressions</div>
            <div className="text-xl font-black text-neutral-950 mt-1">{summary.total_impressions.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Shopper Clicks</div>
            <div className="text-xl font-black text-purple-600 mt-1">{summary.total_clicks.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Click Rate (CTR)</div>
            <div className="text-xl font-black text-emerald-600 mt-1">{overallCTR}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Orders Generated</div>
            <div className="text-xl font-black text-amber-600 mt-1">{summary.total_orders_generated} Orders</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Ad Spend</div>
            <div className="text-xl font-black text-rose-600 mt-1">₹{summary.total_spent.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* 2. AD CAMPAIGNS LIST & FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-neutral-200/90 shadow-xs w-fit">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'all'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              All Campaigns ({ads.length})
            </button>

            <button
              onClick={() => setFilterType('home_banner')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'home_banner'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Home Billboards
            </button>

            <button
              onClick={() => setFilterType('sponsored_product')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-colors ${
                filterType === 'sponsored_product'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Sponsored Slots
            </button>
          </div>

          <button
            onClick={fetchAdsData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors shadow-xs self-end sm:self-auto"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-neutral-500 text-xs">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-purple-600" />
            Loading campaigns...
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white border border-neutral-200/90 p-8 space-y-3 shadow-xs">
            <Target className="w-12 h-12 mx-auto text-neutral-300 stroke-[1.2]" />
            <h4 className="text-sm font-bold text-neutral-950">No active ad campaigns</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Launch your first home carousel billboard banner to get 10,000+ local views in your city.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
            >
              + Launch Billboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map(ad => {
              const isActive = ad.status === 'active';

              return (
                <div
                  key={ad.id}
                  className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-neutral-300 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Banner Image Preview */}
                    <img
                      src={ad.banner_image_url}
                      alt={ad.campaign_name}
                      className="w-28 sm:w-36 h-20 rounded-2xl object-cover border border-neutral-200 shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            ad.ad_type === 'home_banner'
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
                          {ad.ad_type === 'home_banner' ? 'Home Billboard' : 'Sponsored Placement'}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                          {isActive ? 'Running' : 'Paused'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-neutral-950 truncate">{ad.campaign_name}</h4>
                      <p className="text-[11px] text-neutral-500 truncate">Target: {ad.target_url}</p>

                      <div className="flex items-center gap-3 text-xs text-neutral-600 pt-0.5">
                        <span>Daily Budget: <strong>₹{ad.daily_budget_inr}</strong></span>
                        <span>•</span>
                        <span>Total Spent: <strong className="text-rose-600">₹{ad.total_spent_inr}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <div className="text-xs font-bold text-neutral-950">{ad.impressions.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-neutral-500">Impressions</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-600">{ad.clicks.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-neutral-500">Clicks</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-600">{ad.orders_generated}</div>
                        <div className="text-[10px] text-neutral-500">Orders</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(ad.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title={isActive ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-2.5 rounded-xl bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODAL: LAUNCH AD CAMPAIGN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-neutral-200 p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-neutral-900">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                New Promotion Campaign
              </span>
              <h3 className="text-lg font-extrabold text-neutral-950">Promote Your Boutique</h3>
              <p className="text-xs text-neutral-500">
                Choose format, upload visual billboard banner, and set daily campaign budget.
              </p>
            </div>

            {/* Quick Sample Billboard Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-600 block">Sample Banner Presets:</label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_BANNERS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBannerUrl(sample.url);
                      setCampaignName(sample.name);
                    }}
                    className="p-2 rounded-xl bg-neutral-50 hover:bg-purple-50/50 border border-neutral-200 text-left group transition-colors"
                  >
                    <img src={sample.url} alt="" className="w-full h-10 object-cover rounded-lg mb-1" />
                    <span className="text-[9px] font-bold text-neutral-700 block truncate group-hover:text-purple-700">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  placeholder="e.g. Summer Streetwear Billboard"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Placement Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdType('home_banner')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                      adType === 'home_banner'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Home Carousel Billboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdType('sponsored_product')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                      adType === 'sponsored_product'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>Sponsored Product Slot</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                  required
                />
              </div>

              {bannerUrl && (
                <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Daily Budget (₹)</label>
                  <select
                    value={dailyBudget}
                    onChange={e => setDailyBudget(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value={200}>₹200 / day (~2,500 views)</option>
                    <option value={500}>₹500 / day (~8,000 views)</option>
                    <option value={1000}>₹1,000 / day (~18,000 views)</option>
                    <option value={2500}>₹2,500 / day (~50,000 views)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Campaign Duration</label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days (Recommended)</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !bannerUrl || !campaignName}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all"
                >
                  {isSubmitting ? 'Launching...' : 'Launch Campaign 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
