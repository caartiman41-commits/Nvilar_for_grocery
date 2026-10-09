'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Film,
  Plus,
  Play,
  Eye,
  Heart,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  ShoppingBag,
  Trash2,
  X,
  Check,
  RefreshCw,
  ExternalLink,
  Flame,
  Target,
  Sliders,
  Radio,
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

interface ReelItem {
  id: string;
  shop_id: string;
  creator_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  tagged_product_id: string | null;
  product_name?: string;
  product_thumbnail?: string;
  product_base_price?: number;
  likes_count: number;
  views_count: number;
  is_active: boolean;
  is_boosted?: boolean;
  boost_budget?: number;
  boost_target_city?: string;
  boost_expires_at?: string;
  duration_seconds: number;
  created_at: string;
}

interface ProductItem {
  id: string;
  name: string;
  thumbnail: string;
  base_price: number;
}

interface SellerReelsProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

const SAMPLE_REEL_PRESETS = [
  {
    title: 'Streetwear Runway Walk',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-down-the-street-in-fashionable-clothes-40898-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
    duration: 18,
  },
  {
    title: 'Minimalist Boxy Hoodie Fit',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-gray-hoodie-41484-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    duration: 22,
  },
  {
    title: 'Artisanal Silk Kimono Drape',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-traditional-japanese-outfit-walking-through-a-garden-42617-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    duration: 15,
  },
];

export const SellerReels: React.FC<SellerReelsProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [metrics, setMetrics] = useState<{ total_reels: number; total_views: number; total_likes: number; boosted_count: number }>({
    total_reels: 0,
    total_views: 0,
    total_likes: 0,
    boosted_count: 0,
  });
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [boostingReel, setBoostingReel] = useState<ReelItem | null>(null);
  const [previewingVideoReel, setPreviewingVideoReel] = useState<ReelItem | null>(null);

  // Upload Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [taggedProductId, setTaggedProductId] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(15);
  const [isUploading, setIsUploading] = useState(false);

  // Boost Form state
  const [boostBudget, setBoostBudget] = useState(500);
  const [boostDurationDays, setBoostDurationDays] = useState(7);
  const [boostCity, setBoostCity] = useState('Local City Feed');
  const [isLaunchingBoost, setIsLaunchingBoost] = useState(false);

  const backendUrl = getBackendUrl();

  const fetchReelsData = useCallback(async () => {
    if (!shopId && !userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (shopId) params.append('shop_id', shopId);
      if (userId) params.append('user_id', userId);

      const [reelsRes, prodsRes] = await Promise.all([
        fetch(`${backendUrl}/api/seller/reels?${params.toString()}`).then(r => r.json()),
        fetch(`${backendUrl}/api/seller/products?${params.toString()}`).then(r => r.json()),
      ]);

      if (reelsRes.success) {
        setReels(reelsRes.reels || []);
        if (reelsRes.metrics) {
          setMetrics({
            total_reels: parseInt(reelsRes.metrics.total_reels || 0, 10),
            total_views: parseInt(reelsRes.metrics.total_views || 0, 10),
            total_likes: parseInt(reelsRes.metrics.total_likes || 0, 10),
            boosted_count: parseInt(reelsRes.metrics.boosted_count || 0, 10),
          });
        }
      }

      if (prodsRes.success) {
        setProducts(prodsRes.products || []);
      }
    } catch (err) {
      console.error('Failed to load reels data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, shopId, userId]);

  useEffect(() => {
    fetchReelsData();
  }, [fetchReelsData]);

  // Handle Upload
  const handleUploadReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setIsUploading(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/reels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: shopId,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          caption,
          tagged_product_id: taggedProductId || null,
          duration_seconds: durationSeconds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsUploadModalOpen(false);
        setVideoUrl('');
        setThumbnailUrl('');
        setCaption('');
        setTaggedProductId('');
        sellerAudio.playMessageChime();
        fetchReelsData();
        if (onRefreshMetrics) onRefreshMetrics();
      } else {
        alert(data.error || 'Failed to upload reel');
      }
    } catch (err) {
      console.error('Error uploading reel:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Boost
  const handleLaunchBoost = async () => {
    if (!boostingReel) return;

    setIsLaunchingBoost(true);
    try {
      const res = await fetch(`${backendUrl}/api/seller/reels/${boostingReel.id}/boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          budget: boostBudget,
          duration_days: boostDurationDays,
          target_city: boostCity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBoostingReel(null);
        sellerAudio.playDealChime();
        fetchReelsData();
        if (onRefreshMetrics) onRefreshMetrics();
      } else {
        alert(data.error || 'Failed to boost reel');
      }
    } catch (err) {
      console.error('Error boosting reel:', err);
    } finally {
      setIsLaunchingBoost(false);
    }
  };

  // Handle Delete
  const handleDeleteReel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reel permanently?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/seller/reels/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchReelsData();
      }
    } catch (err) {
      console.error('Error deleting reel:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & METRICS BANNER */}
      <div className="rounded-3xl bg-white border border-neutral-200/90 p-6 space-y-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <Film className="w-3.5 h-3.5" />
              <span>Nvilar Fashion Reels Studio</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight">
              Reels, Runway Shorts & Drops 🎬
            </h2>
            <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
              Showcase runway styling, fabric texture close-ups, and backstage looks. Tag your catalog garments for 1-tap buyer discovery.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Reel</span>
          </button>
        </div>

        {/* Studio Performance KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Reels</div>
            <div className="text-xl font-black text-neutral-950 mt-1">{metrics.total_reels}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Views</div>
            <div className="text-xl font-black text-rose-600 mt-1">{metrics.total_views.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Likes</div>
            <div className="text-xl font-black text-amber-600 mt-1">{metrics.total_likes.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Active Boosts</div>
            <div className="text-xl font-black text-purple-600 mt-1">{metrics.boosted_count} Drops Boosted</div>
          </div>
        </div>
      </div>

      {/* 2. REELS GALLERY GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
            <span>Published Drops</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-700">
              {reels.length}
            </span>
          </h3>

          <button
            onClick={fetchReelsData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-600' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-neutral-500 text-xs">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-rose-600" />
            Loading reels gallery...
          </div>
        ) : reels.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white border border-neutral-200/90 p-8 space-y-3 shadow-xs">
            <Film className="w-12 h-12 mx-auto text-neutral-300 stroke-[1.2]" />
            <h4 className="text-sm font-bold text-neutral-950">No fashion reels uploaded yet</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Post your first 15-second runway video to showcase garments on models and boost city-wide traffic.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
            >
              + Upload Lookbook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {reels.map(reel => (
              <div
                key={reel.id}
                className="group rounded-3xl bg-white border border-neutral-200/90 overflow-hidden flex flex-col shadow-xs hover:border-neutral-300 transition-all relative"
              >
                {/* 9:16 Video Thumbnail Container */}
                <div className="relative aspect-[9/16] overflow-hidden bg-neutral-900">
                  <img
                    src={reel.thumbnail_url}
                    alt={reel.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/40" />

                  {/* Top Badges: Duration & Boost Status */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[10px] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      0:{reel.duration_seconds < 10 ? '0' : ''}{reel.duration_seconds}
                    </span>

                    {reel.is_boosted && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white font-black text-[9px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        Boosted
                      </span>
                    )}
                  </div>

                  {/* Play Trigger Center */}
                  <button
                    onClick={() => setPreviewingVideoReel(reel)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 hover:bg-rose-500 text-white hover:text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110"
                    title="Play Preview"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>

                  {/* Bottom Stats Overlay on Thumbnail */}
                  <div className="absolute bottom-3 inset-x-3 space-y-2">
                    {/* Tagged Product Pill */}
                    {reel.tagged_product_id && (
                      <div className="p-2 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold truncate text-[11px]">{reel.product_name || 'Tagged Garment'}</span>
                        </div>
                        {reel.product_base_price && (
                          <span className="font-black text-amber-400 text-[11px] shrink-0">
                            ₹{reel.product_base_price}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-neutral-300 text-xs font-semibold px-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                        {reel.views_count?.toLocaleString('en-IN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                        {reel.likes_count?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Caption & Action Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-neutral-800 line-clamp-2 leading-relaxed font-medium">
                    {reel.caption}
                  </p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                    <button
                      onClick={() => setBoostingReel(reel)}
                      className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-600 fill-current" />
                      <span>Boost Reel</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReel(reel.id)}
                      className="p-2 rounded-xl bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 transition-colors"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. MODAL: UPLOAD NEW REEL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-neutral-200 p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto text-neutral-900">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                <Film className="w-3 h-3" />
                Upload Runway Reel
              </span>
              <h3 className="text-lg font-extrabold text-neutral-950">Publish Fashion Drop Video</h3>
              <p className="text-xs text-neutral-500">
                Videos should be vertical (9:16 format) and showcase garment movement & fabric quality.
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-600 block">Quick Demo Lookbook Presets:</label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_REEL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVideoUrl(preset.video_url);
                      setThumbnailUrl(preset.thumbnail);
                      setDurationSeconds(preset.duration);
                    }}
                    className="p-2 rounded-xl bg-neutral-50 hover:bg-rose-50/50 border border-neutral-200 text-left space-y-1 group transition-colors"
                  >
                    <div className="text-[10px] font-bold text-neutral-900 truncate group-hover:text-rose-600">
                      {preset.title}
                    </div>
                    <span className="text-[9px] text-neutral-500 block">0:{preset.duration}s</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleUploadReel} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Video URL (MP4) *</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://...mp4"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-rose-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Cover Thumbnail Image URL</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Caption & Hashtags</label>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="e.g. Acid-wash street fit drop. 240 GSM pure French Terry cotton #NvilarDrops #BoutiqueFit"
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-rose-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Tag a Catalog Garment</label>
                <select
                  value={taggedProductId}
                  onChange={e => setTaggedProductId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-rose-500 focus:bg-white"
                >
                  <option value="">-- No Garment Tagged --</option>
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
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !videoUrl}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all"
                >
                  {isUploading ? 'Publishing...' : 'Publish Reel to Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: BOOST REEL CAMPAIGN */}
      {boostingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-purple-200 p-6 space-y-5 shadow-2xl relative text-neutral-900">
            <button
              onClick={() => setBoostingReel(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-current" />
                Nvilar Reel Boost Engine
              </span>
              <h3 className="text-lg font-extrabold text-neutral-950">Boost Video Discovery</h3>
              <p className="text-xs text-neutral-500">
                Prioritize this lookbook in shoppers&apos; Explore & City Feeds for 5x more clicks.
              </p>
            </div>

            {/* Target Reel Summary */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
              <img
                src={boostingReel.thumbnail_url}
                alt=""
                className="w-12 h-16 rounded-xl object-cover border border-neutral-300 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-neutral-950 truncate">{boostingReel.caption}</h4>
                <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-2">
                  <span>{boostingReel.views_count} organic views</span>
                  <span>•</span>
                  <span>0:{boostingReel.duration_seconds}s</span>
                </div>
              </div>
            </div>

            {/* Audience Targeting Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBoostCity('Local City Feed')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    boostCity === 'Local City Feed'
                      ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>Local City Shoppers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBoostCity('Pan-India Explore Feed')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                    boostCity === 'Pan-India Explore Feed'
                      ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>Pan-India Explore</span>
                </button>
              </div>
            </div>

            {/* Daily Budget Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-700">Total Campaign Budget:</span>
                <span className="text-amber-600 text-sm font-black">₹{boostBudget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={boostBudget}
                onChange={e => setBoostBudget(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Estimated Reach Widget */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1">
              <div className="text-[11px] font-bold text-purple-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Estimated Shopper Reach</span>
              </div>
              <div className="text-base font-black text-neutral-950">
                {(boostBudget * 28).toLocaleString('en-IN')} - {(boostBudget * 52).toLocaleString('en-IN')} Views
              </div>
              <p className="text-[10px] text-neutral-500">
                Campaign duration: {boostDurationDays} days across mobile & tablet feeds.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBoostingReel(null)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchBoost}
                disabled={isLaunchingBoost}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isLaunchingBoost ? 'Launching...' : `Pay ₹${boostBudget} & Boost`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: VIDEO PREVIEW PLAYER */}
      {previewingVideoReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-2xl flex flex-col justify-between">
            <video
              src={previewingVideoReel.video_url}
              controls
              autoPlay
              playsInline
              loop
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setPreviewingVideoReel(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
