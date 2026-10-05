'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Flag,
  Trash2,
  Heart,
  Eye,
  Store,
  Play,
  X,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { isAuthenticated, fetchReels, moderateReel, deleteReel, fetchApplications } from '../../lib/api';
import { ReelItem } from '../../lib/types';

export default function ReelsModerationPage() {
  const router = useRouter();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Flag Modal State
  const [flaggingReelId, setFlaggingReelId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  // Video Preview Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reelList, appRes] = await Promise.all([
        fetchReels(),
        fetchApplications('pending_review').catch(() => ({ counts: { pending: 0 } })),
      ]);
      setReels(reelList);
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

  const handleModerate = async (id: string, action: string, reason?: string) => {
    const res = await moderateReel(id, action, reason);
    if (res.success && res.reel) {
      setReels(prev => prev.map(r => r.id === id ? res.reel! : r));
      setFlaggingReelId(null);
      setFlagReason('');
      showToast('success', `Reel moderation updated: ${action.toUpperCase()}`);
    } else {
      showToast('error', res.error || 'Failed to moderate reel');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this reel video?')) return;
    const res = await deleteReel(id);
    if (res.success) {
      setReels(prev => prev.filter(r => r.id !== id));
      showToast('success', 'Reel video removed from platform.');
    } else {
      showToast('error', res.error || 'Failed to delete reel');
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredReels = reels.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'flagged') return r.is_flagged;
    if (statusFilter === 'active') return r.is_active && !r.is_flagged;
    return true;
  });

  const totalViews = reels.reduce((acc, r) => acc + (r.views_count || 0), 0);
  const totalLikes = reels.reduce((acc, r) => acc + (r.likes_count || 0), 0);
  const flaggedCount = reels.filter(r => r.is_flagged).length;

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
                <span className="text-neutral-700 font-bold">Reels Moderation</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2.5">
                <Film className="w-6 h-6 text-indigo-600" />
                <span>Short Video Reels Hub</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {reels.length} Uploaded Reels
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Monitor boutique creator video uploads, review viral reach & engagement, and enforce community content safety.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 focus:outline-hidden"
              >
                <option value="all">All Reels ({reels.length})</option>
                <option value="active">Active & Safe ({reels.filter(r => r.is_active && !r.is_flagged).length})</option>
                <option value="flagged">Flagged ({flaggedCount})</option>
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-xs font-bold uppercase">Total Reels</span>
                <Film className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-neutral-900">{reels.length}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Catalog video showcase</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-xs font-bold uppercase">Total Video Plays</span>
                <Eye className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600">{totalViews.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">High consumer reach</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-xs font-bold uppercase">Total Likes</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600">{totalLikes.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Boutique engagement</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="text-xs font-bold uppercase">Flagged Content</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{flaggedCount}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{flaggedCount === 0 ? 'All clean' : 'Requires admin action'}</p>
            </div>
          </div>

          {/* Reels Grid */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">Active Boutique Reels Stream</h3>
                <p className="text-xs text-neutral-500">Live feeds displayed on consumer app Reels tab</p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading reels stream...</div>
            ) : filteredReels.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">No reels found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {filteredReels.map((reel) => (
                  <div key={reel.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/50 overflow-hidden shadow-2xs flex flex-col justify-between">
                    {/* Thumbnail & Video Preview */}
                    <div className="relative aspect-[9/14] bg-neutral-900 overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reel.thumbnail_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                        alt={reel.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        {reel.is_flagged ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
                            <Flag className="w-3 h-3" /> Flagged
                          </span>
                        ) : reel.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Safe
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-700 text-white font-bold text-[10px] shadow-sm">
                            Hidden
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {reel.duration_seconds || 30}s
                        </span>
                      </div>

                      {/* Play Action */}
                      <button
                        onClick={() => setPreviewVideoUrl(reel.video_url)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 text-neutral-900 shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                        title="Preview Video"
                      >
                        <Play className="w-5 h-5 fill-neutral-900 ml-0.5" />
                      </button>

                      {/* Floating Bottom Stats Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1 font-bold">
                          <Eye className="w-3.5 h-3.5 text-neutral-300" />
                          {reel.views_count?.toLocaleString('en-IN') || 0}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-rose-300">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          {reel.likes_count?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                          <Store className="w-3.5 h-3.5" />
                          <span>{reel.shop_name || reel.shop_id}</span>
                        </div>
                        <p className="text-xs text-neutral-700 font-medium line-clamp-2 leading-relaxed">
                          {reel.caption}
                        </p>
                        {reel.flag_reason && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium">
                            <strong>Flag Note:</strong> {reel.flag_reason}
                          </div>
                        )}
                      </div>

                      {/* Moderation Buttons */}
                      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-2">
                        {reel.is_flagged ? (
                          <button
                            onClick={() => handleModerate(reel.id, 'unflag')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Approve Safe
                          </button>
                        ) : (
                          <button
                            onClick={() => setFlaggingReelId(reel.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Flag</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleModerate(reel.id, 'toggle_active')}
                            className="px-2 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-200 text-neutral-700 text-xs font-medium cursor-pointer"
                          >
                            {reel.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => handleDelete(reel.id)}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-neutral-400 cursor-pointer"
                            title="Delete Reel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flag Reason Modal */}
          {flaggingReelId && (
            <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4 text-rose-600" />
                    <span>Flag Short Video Reel</span>
                  </h3>
                  <button onClick={() => setFlaggingReelId(null)} className="text-neutral-400 hover:text-neutral-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-neutral-500">
                  Specify compliance or policy violation reason. This will hide the reel from the consumer feed until reviewed.
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. Counterfeit merchandise displayed, copyright infringement, or misleading claims..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setFlaggingReelId(null)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleModerate(flaggingReelId, 'flag', flagReason)}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                  >
                    Confirm Flag
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Preview Modal */}
          {previewVideoUrl && (
            <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="relative max-w-sm w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
                <button
                  onClick={() => setPreviewVideoUrl(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <video
                  src={previewVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-[520px] object-cover"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
