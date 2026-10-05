'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Store,
  ChevronRight,
  ShieldCheck,
  Ban,
  MapPin,
  Navigation,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { isAuthenticated, fetchApplications } from '../../lib/api';
import { SellerApplicationData } from '../../lib/types';

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || 'all';

  const [applications, setApplications] = useState<SellerApplicationData[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = React.useCallback(async (status: string) => {
    try {
      const data = await fetchApplications(status);
      setApplications(data.applications);
      setCounts(data.counts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData(activeTab);
  }, [activeTab, loadData, router]);


  // Categories list for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => {
      if (a.business_category) set.add(a.business_category);
    });
    return Array.from(set);
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        app.business_name?.toLowerCase().includes(q) ||
        app.owner_full_name?.toLowerCase().includes(q) ||
        app.owner_phone?.toLowerCase().includes(q) ||
        app.id?.toLowerCase().includes(q) ||
        (app.business_type && app.business_type.toLowerCase().includes(q)) ||
        (app.owner_email && app.owner_email.toLowerCase().includes(q));

      // Category
      const matchCat = selectedCategory === 'all' || app.business_category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [applications, searchQuery, selectedCategory]);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar pendingCount={counts.pending} />

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar pendingCount={counts.pending} />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Link href="/" className="hover:text-neutral-700 font-medium">
                  Dashboard
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-neutral-700 font-bold">Seller Applications</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-3">
                <span>Seller KYC Applications</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
                  {counts.total} Total
                </span>
              </h1>
            </div>

            <button
              onClick={() => loadData(activeTab)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-2 border border-neutral-200 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span>All Applications</span>
              <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-bold">
                {counts.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pending_review')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'pending_review'
                  ? 'border-amber-500 text-amber-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Pending Review</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-bold">
                {counts.pending}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'approved'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-bold">
                {counts.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'rejected'
                  ? 'border-rose-600 text-rose-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Rejected</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] text-rose-800 font-bold">
                {counts.rejected}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'border-slate-800 text-slate-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancelled</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-bold">
                {counts.cancelled}
              </span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by boutique name, applicant full name, phone number, ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            </div>

            <div className="sm:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-neutral-500 border-b border-neutral-200 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Boutique / Trade Name</th>
                    <th className="py-3.5 px-4">Owner Name &amp; Phone</th>
                    <th className="py-3.5 px-4">KYC Documents</th>
                    <th className="py-3.5 px-4">Submitted Address</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400 font-medium">
                        No applications matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const isPending = app.status === 'pending_review';
                      const isApproved = app.status === 'approved';
                      const isRejected = app.status === 'rejected';
                      const isCancelled = app.status === 'cancelled';

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-mono text-[11px] text-neutral-500">
                            <span className="font-bold text-neutral-800">{app.id}</span>
                            <div className="text-[10px] text-neutral-400 font-sans">
                              {new Date(app.created_at).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-neutral-900 text-xs">{app.business_name}</div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[11px] text-indigo-600 font-semibold">{app.business_category}</span>
                              {app.business_type === 'company' && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-200">
                                  Pvt Ltd / Co.
                                </span>
                              )}
                              {app.business_type === 'partnership' && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[10px] font-bold text-purple-700 border border-purple-200">
                                  Partnership / LLP
                                </span>
                              )}
                              {(app.business_type === 'individual' || (!['company', 'partnership'].includes(app.business_type))) && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                  Proprietorship
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-neutral-800">{app.owner_full_name}</div>
                            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                              {app.owner_phone}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {app.business_type === 'company' ? (
                                <>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    COI ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    Co. PAN ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    Director ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    GSTIN ✓
                                  </span>
                                </>
                              ) : app.business_type === 'partnership' ? (
                                <>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    Deed ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    Firm PAN ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    Partner ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    GSTIN ✓
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    Aadhar ✓
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                                    PAN ✓
                                  </span>
                                  {Boolean(app.voter_id_number) && (
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-mono text-neutral-600 border border-neutral-200">
                                      Voter
                                    </span>
                                  )}
                                  {Boolean(app.gst_number) && (
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-mono text-neutral-600 border border-neutral-200">
                                      GST
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-neutral-800 text-xs font-medium">
                              {app.shop_address?.city}, {app.shop_address?.state}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>PIN: {app.shop_address?.pincode}</span>
                              {app.shop_address?.latitude && app.shop_address?.longitude ? (
                                <a
                                  href={`https://www.google.com/maps?q=${app.shop_address.latitude},${app.shop_address.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[9.5px] border border-blue-200 transition-colors"
                                  title={`Open Live Pin: ${app.shop_address.latitude}, ${app.shop_address.longitude}`}
                                >
                                  <Navigation className="w-2.5 h-2.5 text-blue-600" />
                                  <span>Map ↗</span>
                                </a>
                              ) : (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${app.shop_address?.street || ''}, ${app.shop_address?.city || ''}, ${app.shop_address?.state || ''} ${app.shop_address?.pincode || ''}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-[9.5px] border border-slate-200 transition-colors"
                                  title="Search on Google Maps"
                                >
                                  <MapPin className="w-2.5 h-2.5 text-slate-500" />
                                  <span>Map ↗</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Under Review
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Rejected
                              </span>
                            )}
                            {isCancelled && (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-bold">
                                  <Ban className="w-3 h-3 text-slate-500" />
                                  Cancelled
                                </span>
                                {app.cancel_reason && (
                                  <div
                                    className="text-[10px] text-neutral-500 font-medium truncate max-w-[150px]"
                                    title={app.cancel_reason}
                                  >
                                    &quot;{app.cancel_reason}&quot;
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              href={`/applications/${app.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect KYC</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ApplicationsListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-neutral-900 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-neutral-500 font-semibold">Loading Applications Console...</span>
          </div>
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}

