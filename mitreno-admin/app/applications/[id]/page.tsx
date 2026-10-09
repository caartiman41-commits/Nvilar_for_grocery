'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  User,
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  Building,
  Building2,
  Users,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Ban,
  Navigation,
  Compass,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { AdminSidebar } from '../../../components/AdminSidebar';
import { DocumentImageViewer } from '../../../components/DocumentImageViewer';
import { ApproveModal } from '../../../components/ApproveModal';
import { RejectModal } from '../../../components/RejectModal';
import {
  isAuthenticated,
  getApplicationById,
  approveApplication,
  rejectApplication,
} from '../../../lib/api';
import { SellerApplicationData } from '../../../lib/types';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<SellerApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadApp = React.useCallback(async () => {
    try {
      const data = await getApplicationById(id);
      setApplication(data);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadApp();
  }, [loadApp, router]);


  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApproveConfirm = async (notes: string) => {
    const res = await approveApplication(id, notes);
    if (res.success) {
      showToast(res.message || 'Application approved! Boutique is now live.');
      loadApp();
    }
  };

  const handleRejectConfirm = async (reason: string, notes?: string) => {
    const res = await rejectApplication(id, reason, notes);
    if (res.success) {
      showToast(res.message || 'Application rejected.');
      loadApp();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-neutral-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500 font-semibold">Loading Application KYC Dossier...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 text-neutral-900 flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <h2 className="text-lg font-bold text-neutral-800">Application Not Found</h2>
        <p className="text-xs text-neutral-500">The application ID does not exist or has been removed.</p>
        <Link
          href="/applications"
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
        >
          Back to Applications List
        </Link>
      </div>
    );
  }

  const isPending = application.status === 'pending_review';
  const isApproved = application.status === 'approved';
  const isRejected = application.status === 'rejected';
  const isCancelled = application.status === 'cancelled';

  const renderLegalEntityBadge = (type?: string, isCompact = false) => {
    switch (type?.toLowerCase()) {
      case 'company':
        return (
          <span
            className={`inline-flex items-center gap-1.5 ${
              isCompact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
            } rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-2xs tracking-tight`}
          >
            <Building2 className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-indigo-600 shrink-0`} />
            <span>Private Limited / Corporate Entity</span>
          </span>
        );
      case 'partnership':
        return (
          <span
            className={`inline-flex items-center gap-1.5 ${
              isCompact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
            } rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold shadow-2xs tracking-tight`}
          >
            <Users className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-purple-600 shrink-0`} />
            <span>Registered Partnership Firm / LLP</span>
          </span>
        );
      case 'individual':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 ${
              isCompact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
            } rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-2xs tracking-tight`}
          >
            <Store className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600 shrink-0`} />
            <span>Sole Proprietorship / Individual</span>
          </span>
        );
    }
  };

  const bDocs = application.business_documents || {};
  const businessType = (application.business_type || bDocs.entity_type || 'individual').toLowerCase();

  // Corporate & Entity Credentials
  const cinNumber = application.cin_number || bDocs.cin_number;
  const coiUrl = application.coi_photo_url || bDocs.coi_url || bDocs.coi_photo_url;
  const companyPanNumber = bDocs.company_pan_number || application.pan_number;
  const companyPanUrl = bDocs.company_pan_url || (bDocs.director_pan_url ? undefined : application.pan_photo_url);
  const directorName = bDocs.director_name || application.owner_full_name;
  const directorDin = bDocs.director_din;
  const directorPanNumber = bDocs.director_pan_number || application.pan_number;
  const directorPanUrl = bDocs.director_pan_url || application.pan_photo_url;
  const directorAadharNumber = bDocs.director_aadhar_number || application.aadhar_number;
  const directorAadharUrl = bDocs.director_aadhar_url || application.aadhar_photo_url;
  const boardResolutionUrl = bDocs.board_resolution_url;
  const gstNumber = application.gst_number || bDocs.gst_number;
  const gstCertificateUrl = bDocs.gst_certificate_url || bDocs.gst_doc_url;

  // Partnership Credentials
  const firmPanNumber = application.firm_pan_number || bDocs.firm_pan_number || application.pan_number;
  const firmPanUrl = bDocs.firm_pan_url || (bDocs.partner_pan_url ? undefined : application.pan_photo_url);
  const partnershipDeedUrl = application.partnership_deed_url || bDocs.partnership_deed_url;
  const managingPartnerName = bDocs.managing_partner_name || application.owner_full_name;
  const partnerPanNumber = bDocs.partner_pan_number || application.pan_number;
  const partnerPanUrl = bDocs.partner_pan_url || application.pan_photo_url;
  const partnerAadharNumber = bDocs.partner_aadhar_number || application.aadhar_number;
  const partnerAadharUrl = bDocs.partner_aadhar_url || application.aadhar_photo_url;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <AdminNavbar />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Back & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link
                href="/applications"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Seller Applications</span>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                  {application.business_name}
                </h1>
                {renderLegalEntityBadge(application.business_type)}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Pending Verification
                  </span>
                )}
                {isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Boutique Approved &amp; Active
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Application Rejected
                  </span>
                )}
                {isCancelled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold">
                    <Ban className="w-4 h-4 text-slate-600" />
                    Application Cancelled
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-mono font-medium">
                ID: {application.id} &bull; Submitted on{' '}
                {new Date(application.created_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            {/* Quick Action Buttons */}
            {isPending && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRejectOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-bold border border-rose-200 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject Application</span>
                </button>
                <button
                  onClick={() => setIsApproveOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Create Boutique</span>
                </button>
              </div>
            )}
          </div>

          {/* Audit Alert for Processed Applications */}
          {isApproved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Approved by <strong>{application.reviewed_by || 'Admin'}</strong> on{' '}
                  {application.reviewed_at ? new Date(application.reviewed_at).toLocaleString() : 'N/A'}.
                  {application.admin_notes && ` Note: "${application.admin_notes}"`}
                </span>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Rejected by <strong>{application.reviewed_by || 'Admin'}</strong>. Reason: &quot;
                  {application.rejection_reason || 'Incomplete details'}&quot;
                </span>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-between text-xs text-slate-900">
              <div className="flex items-center gap-2.5">
                <Ban className="w-4 h-4 text-slate-600 shrink-0" />
                <span>
                  Cancelled by applicant on{' '}
                  {application.cancelled_at
                    ? new Date(application.cancelled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'record'}
                  . Reason: &quot;<strong>{application.cancel_reason || 'Applicant requested cancellation'}</strong>&quot;
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                🔒 Privacy Retained
              </span>
            </div>
          )}

          {/* Grid Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Business & Owner Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Business Details Card */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span>Business Profile</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider">Boutique Trade Name</span>
                    <span className="font-extrabold text-slate-900 text-base">{application.business_name}</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider mb-1.5">Entity Type</span>
                      <div>
                        {renderLegalEntityBadge(application.business_type, true)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider mb-1">Category</span>
                      <span className="font-extrabold text-indigo-700 text-xs">
                        {application.business_category}
                      </span>
                    </div>
                  </div>

                  {application.business_description && (
                    <div>
                      <span className="text-neutral-400 block text-[11px] font-medium">Boutique Story</span>
                      <p className="text-neutral-600 leading-relaxed text-xs mt-0.5 font-medium">
                        {application.business_description}
                      </p>
                    </div>
                  )}

                  {application.gst_number && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                      <span className="text-neutral-400 block text-[10px] font-bold">Registered GSTIN</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono text-xs text-neutral-900 font-bold">
                          {application.gst_number}
                        </span>
                        <button
                          onClick={() => copyToClipboard(application.gst_number!, 'gst')}
                          className="text-neutral-400 hover:text-neutral-700 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === 'gst' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Contact Card */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Applicant Information</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider">Full Legal Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{application.owner_full_name}</span>
                  </div>

                  <div>
                    <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider">Primary Phone</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {application.owner_phone}
                      </span>
                      <a
                        href={`tel:${application.owner_phone}`}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 border border-indigo-200 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {application.owner_email && (
                    <div>
                      <span className="text-neutral-400 block text-[11px] font-medium">Email Address</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-neutral-700 font-medium">{application.owner_email}</span>
                        <a
                          href={`mailto:${application.owner_email}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 border border-indigo-200 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address & Live GPS Radar Card */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2.5 text-xs font-black text-neutral-900 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Store Address &amp; Territory</span>
                  </div>
                  {application.shop_address?.state && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      {application.shop_address.state}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {/* Street & Landmark */}
                  <div>
                    <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider">Street / Building</span>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {application.shop_address?.street || '—'}
                    </p>
                    {application.shop_address?.landmark && (
                      <p className="text-slate-500 text-[11px] font-medium mt-0.5 flex items-center gap-1">
                        <span className="text-slate-400">Landmark:</span> {application.shop_address.landmark}
                      </p>
                    )}
                  </div>

                  {/* City, State & Pincode */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-600 block text-[10px] font-bold uppercase tracking-wider">City / Hub</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                        {application.shop_address?.city || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] font-bold uppercase tracking-wider">Pincode</span>
                      <span className="font-mono font-black text-slate-900 text-xs mt-0.5 block">
                        {application.shop_address?.pincode || '—'}
                      </span>
                    </div>
                  </div>

                  {/* 5th Field: Live GPS Radar Pinning */}
                  {(() => {
                    const rawAddress = application.shop_address;
                    const parsedAddress = typeof rawAddress === 'string'
                      ? (() => { try { return JSON.parse(rawAddress); } catch { return {}; } })()
                      : (rawAddress || {});
                    const latVal = parsedAddress.latitude ?? (application as any).latitude;
                    const lngVal = parsedAddress.longitude ?? (application as any).longitude;
                    const latNum = latVal != null && latVal !== '' && !isNaN(Number(latVal)) ? Number(latVal) : null;
                    const lngNum = lngVal != null && lngVal !== '' && !isNaN(Number(lngVal)) ? Number(lngVal) : null;
                    const hasCoordinates = latNum !== null && lngNum !== null && (latNum !== 0 || lngNum !== 0);

                    return (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                              Live GPS Radar Location
                            </span>
                          </div>
                          {hasCoordinates ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              GPS Radar Locked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              Address Search Mode
                            </span>
                          )}
                        </div>

                        {hasCoordinates ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                              <div>
                                <div className="font-mono font-bold text-slate-800 text-[11px]">
                                  LAT: {latNum.toFixed(6)}, LNG: {lngNum.toFixed(6)}
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Auto-detected / Manually verified Coordinates
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(`${latNum},${lngNum}`, 'gps')}
                                className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Copy GPS Coordinates"
                              >
                                {copiedField === 'gps' ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-indigo-900">📡 Hyperlocal Radar Dispatch:</span>
                              <span className="font-bold text-emerald-700">Ready (&lt; 10km radius)</span>
                            </div>

                            <a
                              href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
                            >
                              <Compass className="w-4 h-4 text-blue-200 group-hover:rotate-45 transition-transform" />
                              <span>Open Live Pin in Google Maps ↗</span>
                            </a>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 leading-tight">
                              Precise GPS coordinates were not auto-detected or provided. You can search the physical address directly on Google Maps:
                            </p>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${parsedAddress?.street || ''}, ${parsedAddress?.city || ''}, ${parsedAddress?.state || ''} ${parsedAddress?.pincode || ''}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                              <span>Search Address in Google Maps ↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Payout Information */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Settlement &amp; Payout</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-600 block text-[11px] font-bold uppercase tracking-wider">Primary UPI ID</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-black text-emerald-800 text-xs">
                        {application.payout_upi_id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(application.payout_upi_id, 'upi')}
                        className="text-neutral-400 hover:text-neutral-700 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'upi' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {application.bank_account_number && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-neutral-400 block text-[10px] font-medium">Bank A/C</span>
                        <span className="font-mono text-neutral-800 text-xs font-bold">
                          {application.bank_account_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] font-medium">IFSC</span>
                        <span className="font-mono text-neutral-800 text-xs font-bold">
                          {application.bank_ifsc}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: High-Res KYC Document Inspection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-extrabold text-neutral-900">KYC Dossier &amp; Legal Documents</h3>
                        {renderLegalEntityBadge(application.business_type, true)}
                      </div>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {businessType === 'company' &&
                          'Corporate Entity Verification: CIN, Certificate of Incorporation (COI), Company PAN, Director ID & Resolution.'}
                        {businessType === 'partnership' &&
                          'Partnership Firm Verification: Firm PAN, Registered Partnership Deed / LLP Agreement, and Partner Credentials.'}
                        {businessType === 'individual' &&
                          'Sole Proprietorship & Individual KYC: Government ID proof, Personal PAN card, and optional credentials.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Credential Chips Bar */}
                <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Identification Chips:</span>
                  </span>

                  {businessType === 'company' && (
                    <>
                      {/* CIN Number Chip */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs shadow-2xs">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-slate-500 font-semibold text-[11px]">CIN:</span>
                        <span className="font-mono font-bold text-slate-900">{cinNumber || 'Not provided'}</span>
                        {cinNumber && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(cinNumber, 'cin_chip')}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Copy Corporate Identification Number"
                          >
                            {copiedField === 'cin_chip' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Company GSTIN Chip */}
                      {gstNumber && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-slate-500 font-semibold text-[11px]">GSTIN:</span>
                          <span className="font-mono font-bold text-slate-900">{gstNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(gstNumber, 'gst_chip')}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Copy GSTIN"
                          >
                            {copiedField === 'gst_chip' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Director DIN Chip */}
                      {directorDin && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                          <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="text-slate-500 font-semibold text-[11px]">Director DIN:</span>
                          <span className="font-mono font-bold text-slate-900">{directorDin}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(directorDin, 'din_chip')}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Copy DIN"
                          >
                            {copiedField === 'din_chip' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {businessType === 'partnership' && (
                    <>
                      {/* Firm PAN Chip */}
                      {firmPanNumber && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-xs shadow-2xs">
                          <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="text-slate-500 font-semibold text-[11px]">Firm PAN:</span>
                          <span className="font-mono font-bold text-slate-900">{firmPanNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(firmPanNumber, 'firm_pan_chip')}
                            className="text-slate-400 hover:text-purple-600 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Copy Firm PAN"
                          >
                            {copiedField === 'firm_pan_chip' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Firm GSTIN Chip */}
                      {gstNumber && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-slate-500 font-semibold text-[11px]">Firm GSTIN:</span>
                          <span className="font-mono font-bold text-slate-900">{gstNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(gstNumber, 'part_gst_chip')}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Copy Firm GSTIN"
                          >
                            {copiedField === 'part_gst_chip' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {businessType === 'individual' && (
                    <>
                      {/* Personal PAN Chip */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs shadow-2xs">
                        <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-500 font-semibold text-[11px]">PAN:</span>
                        <span className="font-mono font-bold text-slate-900">{application.pan_number}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(application.pan_number, 'ind_pan_chip')}
                          className="text-slate-400 hover:text-emerald-600 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                          title="Copy PAN"
                        >
                          {copiedField === 'ind_pan_chip' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* GSTIN Chip */}
                      {gstNumber && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-slate-500 font-semibold text-[11px]">GSTIN:</span>
                          <span className="font-mono font-bold text-slate-900">{gstNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(gstNumber, 'ind_gst_chip')}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                            title="Copy GSTIN"
                          >
                            {copiedField === 'ind_gst_chip' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Dynamic 2x2+ Photo Grid based on Business Entity Type */}
                {businessType === 'company' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Certificate of Incorporation (COI) */}
                    <DocumentImageViewer
                      title="Certificate of Incorporation (COI)"
                      docNumber={cinNumber ? `CIN: ${cinNumber}` : 'Incorporation Document'}
                      imageUrl={coiUrl}
                      canCopy={!!cinNumber}
                    />

                    {/* Company PAN Card */}
                    <DocumentImageViewer
                      title="Company PAN Card"
                      docNumber={companyPanNumber}
                      imageUrl={companyPanUrl}
                      canCopy={!!companyPanNumber}
                    />

                    {/* Authorized Director Personal PAN */}
                    <DocumentImageViewer
                      title={`Authorized Director PAN (${directorName})`}
                      docNumber={directorPanNumber}
                      imageUrl={directorPanUrl}
                      canCopy={!!directorPanNumber}
                    />

                    {/* Authorized Director Personal Aadhar */}
                    <DocumentImageViewer
                      title={`Authorized Director Aadhar (${directorName})`}
                      docNumber={directorAadharNumber}
                      imageUrl={directorAadharUrl}
                      canCopy={!!directorAadharNumber}
                    />

                    {/* Board Resolution (if present) */}
                    {boardResolutionUrl && (
                      <DocumentImageViewer
                        title="Board Resolution / Signatory Authorization"
                        docNumber={directorDin ? `DIN: ${directorDin}` : 'Resolution Attached'}
                        imageUrl={boardResolutionUrl}
                        canCopy={!!directorDin}
                      />
                    )}

                    {/* GST Registration Certificate (if present) */}
                    {gstCertificateUrl && (
                      <DocumentImageViewer
                        title="GST Registration Certificate"
                        docNumber={gstNumber ? `GSTIN: ${gstNumber}` : 'Tax Registration'}
                        imageUrl={gstCertificateUrl}
                        canCopy={!!gstNumber}
                      />
                    )}
                  </div>
                )}

                {businessType === 'partnership' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Firm PAN Card */}
                    <DocumentImageViewer
                      title="Firm PAN Card"
                      docNumber={firmPanNumber}
                      imageUrl={firmPanUrl}
                      canCopy={!!firmPanNumber}
                    />

                    {/* Partnership Deed / LLP Agreement */}
                    <DocumentImageViewer
                      title="Partnership Deed / LLP Agreement"
                      docNumber={application.business_name}
                      imageUrl={partnershipDeedUrl}
                      isOptional={!partnershipDeedUrl}
                    />

                    {/* Managing Partner Personal PAN */}
                    <DocumentImageViewer
                      title={`Managing Partner PAN (${managingPartnerName})`}
                      docNumber={partnerPanNumber}
                      imageUrl={partnerPanUrl}
                      canCopy={!!partnerPanNumber}
                    />

                    {/* Managing Partner Personal Aadhar */}
                    <DocumentImageViewer
                      title={`Managing Partner Aadhar (${managingPartnerName})`}
                      docNumber={partnerAadharNumber}
                      imageUrl={partnerAadharUrl}
                      canCopy={!!partnerAadharNumber}
                    />

                    {/* Firm GST Certificate (if present) */}
                    {gstCertificateUrl && (
                      <DocumentImageViewer
                        title="Firm GST Registration Certificate"
                        docNumber={gstNumber ? `GSTIN: ${gstNumber}` : null}
                        imageUrl={gstCertificateUrl}
                        canCopy={!!gstNumber}
                      />
                    )}
                  </div>
                )}

                {businessType === 'individual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Personal PAN Card */}
                    <DocumentImageViewer
                      title="Personal PAN Card"
                      docNumber={application.pan_number}
                      imageUrl={application.pan_photo_url}
                      canCopy={!!application.pan_number}
                    />

                    {/* Personal Aadhar Card */}
                    <DocumentImageViewer
                      title="Personal Aadhar Card"
                      docNumber={application.aadhar_number}
                      imageUrl={application.aadhar_photo_url}
                      canCopy={!!application.aadhar_number}
                    />

                    {/* Voter ID Card */}
                    <DocumentImageViewer
                      title="Voter ID Card"
                      docNumber={application.voter_id_number}
                      imageUrl={application.voter_id_photo_url}
                      isOptional
                    />

                    {/* Driving License */}
                    <DocumentImageViewer
                      title="Driving License"
                      docNumber={application.dl_number}
                      imageUrl={application.dl_photo_url}
                      isOptional
                    />

                    {/* GST Certificate (if provided) */}
                    {gstCertificateUrl && (
                      <DocumentImageViewer
                        title="GST Registration Certificate"
                        docNumber={gstNumber ? `GSTIN: ${gstNumber}` : null}
                        imageUrl={gstCertificateUrl}
                        canCopy={!!gstNumber}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Decision Actions */}
              {isPending && (
                <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-neutral-900">Ready to make a verification decision?</h4>
                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                      Approving instantly registers the boutique store on Nvilar and sends Email &amp; FCM notifications.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setIsRejectOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-bold border border-rose-200 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => setIsApproveOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Boutique</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {application && (
        <>
          <ApproveModal
            isOpen={isApproveOpen}
            onClose={() => setIsApproveOpen(false)}
            application={application}
            onConfirm={handleApproveConfirm}
          />
          <RejectModal
            isOpen={isRejectOpen}
            onClose={() => setIsRejectOpen(false)}
            application={application}
            onConfirm={handleRejectConfirm}
          />
        </>
      )}
    </div>
  );
}
