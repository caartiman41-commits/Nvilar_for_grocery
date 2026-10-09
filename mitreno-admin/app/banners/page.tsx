'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Plus,
  ChevronRight,
  ExternalLink,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MousePointerClick,
  Layers,
  Sparkles,
  X,
  Upload,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { isAuthenticated, fetchBanners, createBanner, updateBanner, deleteBanner, fetchApplications } from '../../lib/api';
import { BannerItem } from '../../lib/types';

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetType, setTargetType] = useState<'category' | 'shop' | 'product' | 'deal' | 'external'>('category');
  const [targetId, setTargetId] = useState('Traditional & Ethnic');
  const [sortOrder, setSortOrder] = useState(1);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bannerList, appRes] = await Promise.all([
        fetchBanners(),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setBanners(bannerList);
      setPendingCount(appRes.counts.pending);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const handleToggleActive = async (banner: BannerItem) => {
    const nextActive = !banner.is_active;
    const res = await updateBanner(banner.id, { is_active: nextActive });
    if (res.success) {
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: nextActive } : b));
      showToast('success', `Banner is now ${nextActive ? 'Active on app' : 'Hidden from app'}`);
    } else {
      showToast('error', res.error || 'Failed to update banner status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    const res = await deleteBanner(id);
    if (res.success) {
      setBanners(prev => prev.filter(b => b.id !== id));
      showToast('success', 'Banner deleted successfully.');
    } else {
      showToast('error', res.error || 'Failed to delete banner');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Please fill in title and image URL');
      return;
    }
    setSubmitting(true);
    const res = await createBanner({
      title,
      subtitle,
      image_url: imageUrl,
      target_type: targetType,
      target_id: targetId,
      sort_order: Number(sortOrder),
      is_active: true,
    });
    setSubmitting(false);

    if (res.success && res.banner) {
      setBanners(prev => [res.banner!, ...prev]);
      setIsModalOpen(false);
      resetForm();
      showToast('success', 'New banner published to Nvilar app hero carousel!');
    } else {
      showToast('error', res.error || 'Failed to create banner');
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setTargetType('category');
    setTargetId('Traditional & Ethnic');
    setSortOrder(banners.length + 1);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const activeCount = banners.filter(b => b.is_active).length;
  const totalClicks = banners.reduce((acc, b) => acc + (b.click_count || 0), 0);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={pendingCount} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={pendingCount} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Link href="/" className="hover:text-neutral-700 font-medium">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-neutral-700 font-bold">Banners Management</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2.5">
                <ImageIcon className="w-6 h-6 text-indigo-600" />
                <span>Consumer App Hero Banners</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeCount} Live on App
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Control the top promotional carousel slides, seasonal campaigns, and curated boutique spotlights in the Nvilar user app.
              </p>
            </div>

            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          </div>

          {/* Toast Notice */}
          {feedback && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  TOTAL BANNERS
                </span>
                <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>{banners.length}</span>
                <span className="text-xs font-semibold text-slate-500">Slides</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: banners.length > 0 ? `${Math.min(100, Math.round((activeCount / Math.max(banners.length, 1)) * 100))}%` : '0%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Configured in DB</span>
                <span className="text-indigo-600 font-bold">{banners.length} Total</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  ACTIVE IN CAROUSEL
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>{activeCount}</span>
                <span className="text-xs font-semibold text-slate-500">Live</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: banners.length > 0 ? `${Math.min(100, Math.round((activeCount / Math.max(banners.length, 1)) * 100))}%` : '0%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Streaming to clients</span>
                <span className="text-emerald-600 font-bold">{banners.length > 0 ? Math.round((activeCount / banners.length) * 100) : 0}% Active</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  CAROUSEL CLICKS
                </span>
                <MousePointerClick className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>{totalClicks.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Taps</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: totalClicks > 0 ? '78%' : '8%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>User tap engagements</span>
                <span className="text-amber-600 font-bold">High Intent</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />
                  CDN DISTRIBUTION
                </span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span className="text-xl sm:text-2xl">Cloudflare</span>
                <span className="text-xs font-semibold text-slate-500">Edge</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '99.4%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Optimized WebP Cache</span>
                <span className="text-emerald-600 font-bold">⚡ 99.4% Hit</span>
              </div>
            </div>
          </div>

          {/* Banners List */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">App Carousel Slides</h3>
                <p className="text-xs text-neutral-500">Ordered by display sequence</p>
              </div>
              <span className="text-xs text-neutral-400 font-medium">Direct live sync with PostgreSQL</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading banner slides...</div>
            ) : banners.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">No banners found. Click &apos;Add New Banner&apos; above.</div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {banners.map((b) => (
                  <div key={b.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative w-36 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.image_url}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                          #{b.sort_order}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-neutral-900 text-sm">{b.title}</h4>
                          {b.is_active ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-1">{b.subtitle || 'No subtitle'}</p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                          <span className="text-indigo-600 font-semibold uppercase text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            Target: {b.target_type}
                          </span>
                          <span>•</span>
                          <span>Value: <code className="text-neutral-700">{b.target_id || b.target_url || 'N/A'}</code></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-neutral-600 font-bold">
                            <MousePointerClick className="w-3 h-3 text-amber-500" />
                            {b.click_count || 0} taps
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleToggleActive(b)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          b.is_active
                            ? 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {b.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-neutral-400" />}
                        <span>{b.is_active ? 'Pause' : 'Activate'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Banner Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Publish New Banner</h3>
                      <p className="text-[11px] text-neutral-500">Add directly to consumer app home screen</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Banner Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diwali Silk Extravaganza"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Subtitle / Deal Hook</label>
                    <input
                      type="text"
                      placeholder="e.g. Hand-spun Kanjeevarams from Master Looms • Up to 40% Off"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Banner Image URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-indigo-500 text-xs font-mono"
                    />
                    {/* Quick Presets */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-neutral-400 font-bold">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80')}
                        className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-medium cursor-pointer"
                      >
                        Silk Saree
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80')}
                        className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-medium cursor-pointer"
                      >
                        Streetwear
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80')}
                        className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[10px] font-medium cursor-pointer"
                      >
                        Sneakers
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Target Action</label>
                      <select
                        value={targetType}
                        onChange={(e) => setTargetType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-indigo-500 text-xs bg-white"
                      >
                        <option value="category">Category Filter</option>
                        <option value="shop">Direct Boutique Store</option>
                        <option value="product">Specific Product</option>
                        <option value="external">External Link</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Target Value / ID</label>
                      <input
                        type="text"
                        placeholder="Traditional & Ethnic or shop_id"
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Carousel Order Sequence</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 -mx-5 -mb-5 mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Publishing...' : 'Publish Banner'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
