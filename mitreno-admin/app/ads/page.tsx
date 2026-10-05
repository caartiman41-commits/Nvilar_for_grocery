'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Megaphone,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  Store,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { isAuthenticated, fetchBoutiqueAds, updateAdStatus, fetchApplications } from '../../lib/api';
import { BoutiqueAdItem } from '../../lib/types';

export default function AdsManagementPage() {
  const router = useRouter();
  const [ads, setAds] = useState<BoutiqueAdItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adList, appRes] = await Promise.all([
        fetchBoutiqueAds(),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setAds(adList);
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await updateAdStatus(id, newStatus);
    if (res.success) {
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
      showToast('success', `Campaign status changed to ${newStatus.toUpperCase()}`);
    } else {
      showToast('error', res.error || 'Failed to update campaign status');
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredAds = ads.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const totalSpent = ads.reduce((acc, a) => acc + (a.total_spent_inr || 0), 0);
  const totalImpressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const activeAdsCount = ads.filter(a => a.status === 'active').length;
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

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
                <span className="text-neutral-700 font-bold">Sponsored Ads</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2.5">
                <Megaphone className="w-6 h-6 text-indigo-600" />
                <span>Boutique Advertising Campaigns</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeAdsCount} Active Campaigns
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Review, moderate, and monitor paid promotions run by verified merchant boutiques across search, reels, and feeds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 focus:outline-hidden"
              >
                <option value="all">All Campaigns ({ads.length})</option>
                <option value="active">Active ({ads.filter(a => a.status === 'active').length})</option>
                <option value="pending_approval">Pending Approval ({ads.filter(a => a.status === 'pending_approval').length})</option>
                <option value="paused">Paused ({ads.filter(a => a.status === 'paused').length})</option>
              </select>
            </div>
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

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  AD SPEND REVENUE
                </span>
                <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>₹{totalSpent.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Gross</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: totalSpent > 0 ? '82%' : '10%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Paid by merchants</span>
                <span className="text-emerald-600 font-bold">{activeAdsCount} Active Ads</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  TOTAL IMPRESSIONS
                </span>
                <Eye className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>{totalImpressions.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Views</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: totalImpressions > 0 ? '75%' : '8%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Delivered on client app</span>
                <span className="text-indigo-600 font-bold">100% Reach</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  TOTAL AD TAPS / CLICKS
                </span>
                <MousePointerClick className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>{totalClicks.toLocaleString('en-IN')}</span>
                <span className="text-xs font-semibold text-slate-500">Clicks</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: totalImpressions > 0 ? `${Math.min(100, Math.round((totalClicks / totalImpressions) * 100))}%` : (totalClicks > 0 ? '60%' : '5%') }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>Direct store traffic</span>
                <span className="text-amber-600 font-bold">Intent Taps</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between gap-1.5 -mt-0.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  AVERAGE CTR
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600 flex items-baseline gap-1.5 whitespace-nowrap mt-2">
                <span>{avgCtr}%</span>
                <span className="text-xs font-semibold text-slate-500">Rate</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round(Number(avgCtr) * 10))}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 whitespace-nowrap">
                <span>High user conversion rate</span>
                <span className="text-emerald-600 font-bold">⚡ Optimal</span>
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Sponsored Campaigns List</h3>
                <p className="text-xs text-neutral-500">Live store ad campaigns and approvals</p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading ad campaigns...</div>
            ) : filteredAds.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">No campaigns matching filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <th className="px-5 py-3.5">Boutique Store</th>
                      <th className="px-5 py-3.5">Campaign Name & Type</th>
                      <th className="px-5 py-3.5">Creative Preview</th>
                      <th className="px-5 py-3.5">Daily Budget / Spent</th>
                      <th className="px-5 py-3.5">Performance</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredAds.map((ad) => {
                      const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={ad.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-neutral-900">{ad.shop_name || ad.shop_id}</p>
                            <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-neutral-400" />
                              {ad.shop_city || 'Guwahati'} • {ad.shop_category || 'Fashion'}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-neutral-900">{ad.campaign_name}</p>
                            <span className="inline-block mt-1 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {ad.ad_type.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ad.banner_image_url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'}
                                alt="ad"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-neutral-900">₹{ad.daily_budget_inr}/day</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Spent: <span className="text-emerald-700 font-bold">₹{ad.total_spent_inr.toLocaleString('en-IN')}</span>
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-neutral-900">{ad.impressions.toLocaleString('en-IN')} views</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {ad.clicks.toLocaleString('en-IN')} taps ({ctr}% CTR)
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {ad.status === 'active' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            )}
                            {ad.status === 'pending_approval' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <Sparkles className="w-3 h-3" />
                                Needs Approval
                              </span>
                            )}
                            {ad.status === 'paused' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                                <PauseCircle className="w-3 h-3" />
                                Paused
                              </span>
                            )}
                            {ad.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ad.status === 'pending_approval' && (
                                <button
                                  onClick={() => handleStatusChange(ad.id, 'active')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {ad.status === 'active' && (
                                <button
                                  onClick={() => handleStatusChange(ad.id, 'paused')}
                                  className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition-colors cursor-pointer"
                                >
                                  Pause
                                </button>
                              )}
                              {ad.status === 'paused' && (
                                <button
                                  onClick={() => handleStatusChange(ad.id, 'active')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition-colors cursor-pointer"
                                >
                                  Resume
                                </button>
                              )}
                              {ad.status !== 'rejected' && (
                                <button
                                  onClick={() => handleStatusChange(ad.id, 'rejected')}
                                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
