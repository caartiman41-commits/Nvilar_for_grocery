'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  CreditCard,
  Building2,
  Clock,
  ShieldCheck,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUpRight,
  FileText,
  BadgeCheck,
  TrendingUp,
  Package,
  Zap,
  Crown,
  QrCode,
  X,
  Check,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

interface AvailablePlan {
  id: string;
  name: string;
  tier_badge: string;
  tagline: string;
  monthly_cost: number;
  commission_rate: number;
  payout_schedule: string;
  is_active: boolean;
  features: string[];
}

interface PlanData {
  active_plan_id?: string;
  name: string;
  tier_badge: string;
  monthly_cost: number;
  currency: string;
  active_commission: number;
  billing_interval: string;
  plan_expires_at?: string | null;
  onboarding_promo: string;
  payout_schedule: string;
  payout_destination: string;
  return_policy_clause: string;
  available_plans?: AvailablePlan[];
}

interface SummaryData {
  total_gross_sales: number;
  total_commission_deducted: number;
  total_platform_gst: number;
  total_net_disbursed: number;
  pending_escrow_amount: number;
  settled_orders_count: number;
  in_escrow_orders_count: number;
  total_orders_processed: number;
}

interface OrderBillingItem {
  order_id: string;
  placed_at: string;
  date_formatted: string;
  time_formatted?: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  platform_gst: number;
  net_seller_share: number;
  payment_mode: string;
  order_status: string;
  settlement_status: 'settled' | 'in_escrow' | 'waived_return' | string;
  items_count: number;
  utr_reference?: string;
  expected_payout_date?: string;
}

interface DailyPayoutItem {
  date_key: string;
  day_label: string;
  date_formatted: string;
  short_date: string;
  orders_count: number;
  cancelled_count: number;
  gross_sales: number;
  commission_rate: number;
  commission_amount: number;
  net_payout_amount: number;
  payout_status: 'paid' | 'pending' | 'no_sales' | string;
  receipt_id?: string;
  utr_reference?: string;
  paid_at?: string;
  payout_upi_id?: string;
  orders: OrderBillingItem[];
}

interface PayoutTicketMessage {
  id: string;
  ticket_id: string;
  sender_role: 'seller' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
}

interface PayoutSupportTicket {
  id: string;
  shop_id: string;
  shop_name: string;
  seller_id: string;
  order_id: string;
  amount: number;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | string;
  utr_reference?: string;
  payout_upi_id?: string;
  created_at: string;
  updated_at: string;
  messages?: PayoutTicketMessage[];
}

interface MonthlyInvoice {
  invoice_id: string;
  billing_month: string;
  gross_volume: number;
  platform_fee: number;
  gst_amount: number;
  net_seller_paid: number;
  invoice_status: string;
  available_formats: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface BillingPayload {
  success: boolean;
  shop?: {
    id: string;
    name: string;
    plan_type?: string;
    plan_expires_at?: string | null;
    commission_rate?: number;
    payout_upi_id?: string;
  };
  plan: PlanData;
  summary: SummaryData;
  daily_payouts?: DailyPayoutItem[];
  monthly_payouts?: DailyPayoutItem[];
  ledger: OrderBillingItem[];
  invoices: MonthlyInvoice[];
  faqs: FAQItem[];
}

interface SellerBillingProps {
  userId?: string;
  shopId?: string;
  activeView?: 'ledger' | 'upgrade_plans';
  onViewChange?: (view: 'ledger' | 'upgrade_plans') => void;
  onNavigateToTab?: (tab: string) => void;
  onPlanChanged?: () => void;
}

export const SellerBilling: React.FC<SellerBillingProps> = ({
  userId: propUserId,
  shopId,
  activeView: propActiveView,
  onViewChange,
  onNavigateToTab,
  onPlanChanged,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [data, setData] = useState<BillingPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'settled' | 'in_escrow'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // 2-Section Sub-Tab State inside Billing & Plans
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'payouts'>('ledger');
  const [payoutCycleMode, setPayoutCycleMode] = useState<'7d' | 'monthly'>('7d');
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

  // Payout Support Tickets & Live Chat State
  const [tickets, setTickets] = useState<PayoutSupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('payout_delay');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketChatInput, setTicketChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Payout UPI / Bank Account Modal State
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const [isSavingUpi, setIsSavingUpi] = useState(false);

  // View Switching State (Defaults to 'ledger', switches to 'upgrade_plans' when requested)
  const [internalView, setInternalView] = useState<'ledger' | 'upgrade_plans'>(propActiveView || 'ledger');
  const currentView = propActiveView !== undefined ? propActiveView : internalView;

  const setView = (v: 'ledger' | 'upgrade_plans') => {
    setInternalView(v);
    if (onViewChange) onViewChange(v);
  };

  // Plan Switcher Modal & ROI Calculator State
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [targetPlanToSwitch, setTargetPlanToSwitch] = useState<'pro_monthly' | 'pay_as_you_sell' | null>(null);
  const [switchPaymentMode, setSwitchPaymentMode] = useState<'upi' | 'balance'>('upi');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const [roiSalesVolume, setRoiSalesVolume] = useState<number>(75000);

  const fetchPayoutTickets = async (resolvedShopId?: string) => {
    try {
      const backendUrl = getBackendUrl();
      const targetShop = resolvedShopId || shopId || data?.shop?.id || '';
      const params = new URLSearchParams();
      if (targetShop) params.set('shop_id', targetShop);
      const res = await fetch(`${backendUrl}/api/seller/payout-tickets?${params.toString()}`, {
        headers: { 'x-user-id': userId },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.tickets)) {
        setTickets(json.tickets);
        if (!selectedTicketId && json.tickets.length > 0) {
          setSelectedTicketId(json.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch payout support tickets:', err);
    }
  };

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      const backendUrl = getBackendUrl();
      const params = new URLSearchParams();
      if (shopId) params.set('shop_id', shopId);
      if (userId) params.set('user_id', userId);

      const res = await fetch(`${backendUrl}/api/seller/billing?${params.toString()}`, {
        headers: { 'x-user-id': userId },
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
        setUpiInput(result.plan?.payout_destination || result.shop?.payout_upi_id || 'mitreno.boutique@okhdfcbank');
        const resolvedPlan = result.plan?.active_plan_id || result.shop?.plan_type;
        if (resolvedPlan && typeof window !== 'undefined') {
          localStorage.setItem('mitreno_seller_active_plan', resolvedPlan);
          window.dispatchEvent(new CustomEvent('mitreno:plan_changed', { detail: { plan_id: resolvedPlan } }));
        }
        await fetchPayoutTickets(result.shop?.id);
      }
    } catch (err) {
      console.error('Failed to load seller billing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [shopId, userId]);

  const handleUpdateUpiAccount = async () => {
    if (!upiInput.trim()) return;
    setIsSavingUpi(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/seller/billing/payout-account`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          shop_id: shopId || data?.shop?.id || '',
          payout_upi_id: upiInput.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        sellerAudio.playDealChime();
        setSwitchToast('Registered Payout UPI / Bank updated!');
        setIsUpiModalOpen(false);
        await fetchBillingData();
        setTimeout(() => setSwitchToast(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingUpi(false);
    }
  };

  const handleCreateSupportTicket = async () => {
    if (!ticketMessage.trim() && !ticketSubject.trim()) return;
    setIsCreatingTicket(true);
    try {
      const backendUrl = getBackendUrl();
      const matchedOrder = (data?.ledger || []).find(l => l.order_id === ticketOrderId);
      const amountToAttach = matchedOrder ? matchedOrder.net_seller_share : (data?.summary?.pending_escrow_amount || 0);
      const res = await fetch(`${backendUrl}/api/seller/payout-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          shop_id: shopId || data?.shop?.id || '',
          order_id: ticketOrderId,
          amount: amountToAttach,
          category: ticketCategory,
          subject: ticketSubject.trim() || (ticketOrderId ? `Payout Query for Order #${ticketOrderId}` : 'Payout Settlement Support'),
          message: ticketMessage.trim() || ticketSubject.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.ticket) {
        sellerAudio.playDealChime();
        setSwitchToast(`Payout Support Ticket #${json.ticket.id} created!`);
        setIsNewTicketModalOpen(false);
        setTicketSubject('');
        setTicketMessage('');
        setTicketOrderId('');
        await fetchPayoutTickets(data?.shop?.id);
        setSelectedTicketId(json.ticket.id);
        setTimeout(() => setSwitchToast(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleSendTicketMessage = async () => {
    if (!selectedTicketId || !ticketChatInput.trim()) return;
    setIsSendingChat(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/seller/payout-tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ message: ticketChatInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        sellerAudio.playMessageChime();
        setTicketChatInput('');
        await fetchPayoutTickets(data?.shop?.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Handle opening switch modal
  const handleInitiateSwitch = (planId: 'pro_monthly' | 'pay_as_you_sell') => {
    sellerAudio.playMessageChime();
    setTargetPlanToSwitch(planId);
    setIsSwitchModalOpen(true);
  };

  // Handle confirming plan switch
  const handleConfirmSwitch = async () => {
    if (!targetPlanToSwitch) return;
    setIsSwitching(true);

    try {
      const backendUrl = getBackendUrl();
      const targetShopId = shopId || data?.shop?.id || '';
      const res = await fetch(`${backendUrl}/api/seller/plan/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          shop_id: targetShopId,
          plan_id: targetPlanToSwitch,
          payment_method: switchPaymentMode,
        }),
      });

      const result = await res.json();
      if (result.success) {
        sellerAudio.playDealChime();
        setSwitchToast(result.message || 'Commercial plan updated successfully!');
        setIsSwitchModalOpen(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mitreno_seller_active_plan', targetPlanToSwitch);
          window.dispatchEvent(new CustomEvent('mitreno:plan_changed', { detail: { plan_id: targetPlanToSwitch } }));
        }
        await fetchBillingData();
        if (onPlanChanged) {
          onPlanChanged();
        }
        setTimeout(() => setSwitchToast(null), 5000);
      } else {
        alert(result.error || 'Failed to update plan. Please try again.');
      }
    } catch (err) {
      console.error('Failed to switch seller plan:', err);
      alert('Network error while updating plan.');
    } finally {
      setIsSwitching(false);
    }
  };

  // Export full billing ledger to CSV
  const handleExportCSV = () => {
    if (!data) return;
    setIsExporting(true);
    sellerAudio.playMessageChime();

    try {
      let csv = 'Nvilar Seller Billing & Commission Statement\n';
      csv += `Store Name:,"${data.shop?.name || 'Boutique'}"\n`;
      csv += `Active Plan:,"${data.plan.name} (${data.plan.tier_badge})"\n`;
      csv += `Commission Rate:,"${data.plan.active_commission}% per sale"\n`;
      csv += `Generated On:,"${new Date().toLocaleString('en-IN')}"\n\n`;

      csv += 'Summary Overview\n';
      csv += `Total Gross Sales (INR),${data.summary.total_gross_sales}\n`;
      csv += `Total Platform Commission (INR),${data.summary.total_commission_deducted}\n`;
      csv += `Total Platform GST 18% (INR),${data.summary.total_platform_gst}\n`;
      csv += `Net Seller Disbursed (INR),${data.summary.total_net_disbursed}\n`;
      csv += `Pending Escrow Balance (INR),${data.summary.pending_escrow_amount}\n\n`;

      csv += 'Order Commission Ledger\n';
      csv += 'Order ID,Date,Items Count,Gross Customer Paid (INR),Commission Rate (%),Platform Fee (INR),GST (INR),Net Seller Share (INR),Payment Mode,Settlement Status\n';
      (data.ledger || []).forEach(item => {
        csv += `"${item.order_id}","${item.date_formatted}",${item.items_count},${item.gross_amount},${item.commission_rate}%,${item.commission_amount},${item.platform_gst},${item.net_seller_share},"${item.payment_mode}","${item.settlement_status}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mitreno_billing_statement_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export billing CSV:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  const isProActive = data?.plan?.active_plan_id === 'pro_monthly' || data?.shop?.plan_type === 'pro_monthly';

  const plan: PlanData = data?.plan || {
    name: isProActive ? 'Nvilar Pro Boutique Pass' : 'Pay-As-You-Sell',
    tier_badge: isProActive ? 'VIP Partner' : 'Starter Boutique',
    monthly_cost: isProActive ? 1999 : 0,
    currency: 'INR',
    active_commission: isProActive ? 0.0 : 4.5,
    billing_interval: isProActive ? 'Monthly Fixed Subscription' : 'Per Successful Order',
    onboarding_promo: isProActive ? '0% Commission • 2x Hyperlocal Priority • 24h Payouts' : 'Free Onboarding • Zero Fixed Monthly Charges',
    payout_schedule: isProActive ? '24-Hour Express Settlements' : 'Weekly Automated Cycle (Every Monday)',
    payout_destination: 'seller@upi',
    return_policy_clause: 'Zero platform fee on returned or cancelled orders',
  };

  const summary: SummaryData = data?.summary || {
    total_gross_sales: 0,
    total_commission_deducted: 0,
    total_platform_gst: 0,
    total_net_disbursed: 0,
    pending_escrow_amount: 0,
    settled_orders_count: 0,
    in_escrow_orders_count: 0,
    total_orders_processed: 0,
  };

  const ledger: OrderBillingItem[] = data?.ledger || [];
  const invoices: MonthlyInvoice[] = data?.invoices || [];
  const faqs: FAQItem[] = data?.faqs || [];

  // Filtered Ledger
  const filteredLedger = ledger.filter(item => {
    const matchesSearch = item.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'settled') {
      return matchesSearch && item.settlement_status === 'settled';
    }
    if (statusFilter === 'in_escrow') {
      return matchesSearch && item.settlement_status === 'in_escrow';
    }
    return matchesSearch;
  });

  // ROI Calculations
  const calculatedPayAsYouSellFee = Math.round(roiSalesVolume * 0.045);
  const proMonthlyRent = 1999;
  const netMonthlySavings = Math.max(0, calculatedPayAsYouSellFee - proMonthlyRent);
  const isProCheaper = calculatedPayAsYouSellFee > proMonthlyRent;

  return (
    <div className="w-full bg-[#FAFAFB] text-neutral-900 min-h-screen antialiased animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {switchToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl bg-neutral-950 text-white shadow-xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium leading-relaxed">
            {switchToast}
          </div>
          <button
            onClick={() => setSwitchToast(null)}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. CLEAN STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pt-3.5 pb-3 px-4 sm:px-6 border-b border-neutral-200/90 shadow-2xs font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isProActive
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isProActive ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                {isProActive ? 'Nvilar Pro Boutique Pass (0% Fee)' : 'Pay-As-You-Sell Model (4.5% Fee)'}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {currentView === 'upgrade_plans'
                  ? 'Commercial Plans & Upgrades'
                  : activeSubTab === 'payouts'
                  ? 'Bank Settlements, UTR & Admin Support'
                  : 'Live Billing Ledger'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 tracking-tight flex items-center gap-2">
              <span>
                {currentView === 'upgrade_plans'
                  ? 'Boutique Commercial Plans'
                  : activeSubTab === 'payouts'
                  ? 'Payouts & Settlement Support'
                  : 'Billing & Commission Ledger'}
              </span>
              {data?.shop?.name && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 font-semibold text-neutral-700 border border-neutral-200">
                  {data.shop.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              {currentView === 'upgrade_plans'
                ? 'Compare Starter Pay-As-You-Sell vs Nvilar Pro, optimize your profit retention, and upgrade anytime.'
                : activeSubTab === 'payouts'
                ? 'Track settled bank transfers with UTR references, upcoming payout schedule, UPI account, and live Admin support.'
                : 'Transparent platform fee deductions, active commission terms, order-by-order ledger, and GST statements.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Main Action Button: Upgrade Plan / Manage Plan / Back to Ledger */}
            {currentView === 'ledger' && activeSubTab === 'ledger' ? (
              isProActive ? (
                <button
                  onClick={() => setView('upgrade_plans')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 shadow-2xs transition-all active:scale-95"
                  title="Manage Commercial Plan & Subscription"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Manage Plan</span>
                  <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    PRO
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setView('upgrade_plans')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs shadow-amber-500/20 transition-all active:scale-95"
                  title="View Commercial Plans & Upgrades"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Upgrade Plan</span>
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  setView('ledger');
                  setActiveSubTab('ledger');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 shadow-2xs transition-all active:scale-95"
                title="Back to Billing Ledger"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
                <span>Back to Billing</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchBillingData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-neutral-950 shadow-2xs transition-colors"
              title="Refresh Billing Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Export CSV Statement (Only on Ledger View) */}
            {currentView === 'ledger' && activeSubTab === 'ledger' && (
              <button
                onClick={handleExportCSV}
                disabled={isExporting || isLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors shadow-2xs active:scale-95"
                title="Download Statement CSV"
              >
                <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce text-amber-500' : ''}`} />
                <span className="hidden sm:inline">Export Statement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-14 space-y-6">

        {/* ========================================================================= */}
        {/* VIEW 1: DEDICATED UPGRADE PLANS VIEW                                      */}
        {/* ========================================================================= */}
        {currentView === 'upgrade_plans' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Back Nav Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setView('ledger')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Billing & Statements</span>
              </button>

              {data?.shop?.plan_expires_at && isProActive && (
                <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl font-semibold">
                  Pro Plan Valid Till: {new Date(data.shop.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Compact Side-by-Side Cards (Sleek height & VIP Highlight) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* CARD 1: PAY-AS-YOU-SELL (Subtle / Standard Card) */}
              <div className={`rounded-2xl p-4 sm:p-4.5 transition-all relative flex flex-col justify-between ${
                !isProActive
                  ? 'bg-white border-2 border-emerald-500/90 shadow-sm ring-2 ring-emerald-500/10'
                  : 'bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-2xs'
              }`}>
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                      Starter Boutique
                    </span>
                    {!isProActive && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" /> Active Plan
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-neutral-950 tracking-tight">
                    Pay-As-You-Sell
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Pay only when you sell. Zero monthly rent and zero charges during slow periods.
                  </p>

                  {/* Compact Pricing Strip */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                        Monthly Rent
                      </div>
                      <div className="text-lg font-semibold text-neutral-950 mt-0.5">
                        ₹0 <span className="text-[10px] font-normal text-neutral-500">/ mo</span>
                      </div>
                    </div>
                    <div className="h-6 w-px bg-neutral-200" />
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Platform Fee
                      </div>
                      <div className="text-lg font-semibold text-neutral-900 mt-0.5">
                        4.5% <span className="text-[10px] font-normal text-neutral-500">per sale</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Feature List (Single Checkmarks) */}
                  <div className="mt-3 space-y-1.5 text-[11px] text-neutral-600">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span><strong className="font-semibold text-neutral-800">₹0 Fixed Rent:</strong> Free forever. No upfront or recurring costs.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span><strong className="font-semibold text-neutral-800">4.5% Commission:</strong> Deducted only on successful deliveries.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span><strong className="font-semibold text-neutral-800">Zero Fee on Returns:</strong> 100% platform fee waived on returns.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span><strong className="font-semibold text-neutral-800">Weekly Payouts:</strong> Automated settlement every Monday to UPI.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-md bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span><strong className="font-semibold text-neutral-800">Standard Search:</strong> Regular hyperlocal discovery in your city.</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  {!isProActive ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Current Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInitiateSwitch('pay_as_you_sell')}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-xs border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      Switch to Pay-As-You-Sell
                    </button>
                  )}
                </div>
              </div>

              {/* CARD 2: NVILAR PRO BOUTIQUE PASS (VIP Highlight Winner Card) */}
              <div className={`rounded-2xl p-4 sm:p-4.5 transition-all relative flex flex-col justify-between ${
                isProActive
                  ? 'bg-gradient-to-b from-emerald-50/40 via-white to-white border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/15'
                  : 'bg-gradient-to-b from-amber-50/40 via-white to-white border-2 border-amber-400/90 shadow-md ring-4 ring-amber-400/15 hover:border-amber-500'
              }`}>
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white flex items-center gap-1 shadow-2xs">
                      <Crown className="w-3 h-3" /> VIP Partner • High Growth
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-emerald-600 px-2 py-0.5 rounded-md shadow-2xs">
                      0.0% Zero Fee
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-neutral-950 tracking-tight flex items-center gap-1.5">
                    <span>Nvilar Pro Boutique Pass</span>
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                    Keep 100% of your customer earnings. Zero commission cuts, gold badge, and 2x search boost.
                  </p>

                  {/* Compact Pricing Strip (Emerald Highlight) */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-[10px] text-emerald-900 font-semibold uppercase tracking-wider">
                        Fixed Monthly Rent
                      </div>
                      <div className="text-lg font-semibold text-neutral-950 mt-0.5">
                        ₹1,999 <span className="text-[10px] font-normal text-neutral-500">/ mo</span>
                      </div>
                    </div>
                    <div className="h-6 w-px bg-emerald-200" />
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider flex items-center gap-1 justify-end">
                        <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" /> Platform Fee
                      </div>
                      <div className="text-lg font-semibold text-emerald-700 mt-0.5">
                        0.0% <span className="text-[10px] font-semibold text-emerald-600">Zero Fee</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Feature List (Sharp Blue Double-Checkmarks ✓✓ with Invisible Background) */}
                  <div className="mt-3 space-y-2 text-[11px] text-neutral-800">
                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">0% Platform Commission:</strong> Keep 100% of your retail product sales revenue.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">Gold Verified Boutique Badge:</strong> Premium trust badge on storefront and cards.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">2x Hyperlocal Search Boost:</strong> Doubled ranking priority in customer discovery.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">24-Hour Express Settlements:</strong> Fast daily payouts directly sent to your UPI.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">100% Return Fee Waiver:</strong> Zero platform fee charged on returned or cancelled orders.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">Dedicated CA Tax Reports:</strong> Instant 1-click GST statements & tax ledger exports.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
                      <span><strong className="font-semibold">24/7 Priority Partner Support:</strong> Direct hotline & dedicated account manager assistance.</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  {isProActive ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-300 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5 text-emerald-600" />
                      Current Active VIP Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInitiateSwitch('pro_monthly')}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                      Upgrade to Pro (₹1,999/mo)
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Compact ROI & Savings Calculator */}
            <div className="rounded-2xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1">
                    <TrendingUp className="w-3 h-3" /> Profit Optimizer
                  </div>
                  <h3 className="text-base font-semibold text-neutral-950 tracking-tight">
                    See How Much You Save with Nvilar Pro (0% Commission)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Calculate your net profit retention by eliminating the 4.5% commission.
                  </p>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400 font-medium">Presets:</span>
                  {[30000, 50000, 75000, 100000, 200000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRoiSalesVolume(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        roiSalesVolume === val
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      ₹{(val / 1000).toLocaleString('en-IN')}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Slider */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">
                      Projected Monthly Boutique Sales:
                    </span>
                    <span className="text-lg font-semibold text-neutral-950 tabular-nums">
                      ₹{roiSalesVolume.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20000"
                    max="500000"
                    step="5000"
                    value={roiSalesVolume}
                    onChange={(e) => setRoiSalesVolume(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
                    <span>₹20,000 / mo</span>
                    <span>Break-Even: ₹44,422</span>
                    <span>₹5,00,000 / mo</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-600 leading-relaxed">
                    💡 <strong className="font-semibold">Break-Even:</strong> Beyond ₹44,422 in monthly sales, Nvilar Pro is cheaper than 4.5% commission. Every rupee above ₹44,422 is <strong className="font-semibold">100% commission-free profit</strong> for your store!
                  </div>
                </div>

                {/* Metrics Box */}
                <div className="lg:col-span-5 p-4 rounded-xl bg-neutral-50/80 border border-neutral-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Pay-As-You-Sell (4.5% fee):</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">₹{calculatedPayAsYouSellFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Nvilar Pro (Flat Subscription):</span>
                    <span className="font-semibold text-amber-700 tabular-nums">₹{proMonthlyRent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px bg-neutral-200" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                        {isProCheaper ? 'Your Monthly Savings' : 'Economical Choice'}
                      </div>
                      <div className="text-lg font-semibold text-emerald-600 mt-0.5 tabular-nums">
                        {isProCheaper ? `₹${netMonthlySavings.toLocaleString('en-IN')} saved` : 'Starter Plan Fits Best'}
                      </div>
                    </div>
                    {isProCheaper && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                        Pro Recommended 🎉
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: DEFAULT BILLING LEDGER VIEW                                       */
          /* ========================================================================= */
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Upgrade Banner - ONLY shown for Starter Plan so they can upgrade to Pro */}
            {!isProActive && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-700">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-950 flex items-center gap-2">
                      <span>Starter Boutique (4.5% Platform Fee)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Upgrade Available
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      Switch to Nvilar Pro to eliminate commissions, get 2x search boost and 24h settlements.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setView('upgrade_plans')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro</span>
                </button>
              </div>
            )}

            {activeSubTab === 'ledger' ? (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* 4 Vibrant Financial Metric Counters (Shown ONLY on Billing & Commission Ledger view) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Customer Sales (Rich Royal Indigo Revenue Theme) */}
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-white border border-indigo-200/90 p-5 shadow-xs hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-semibold text-indigo-950 tracking-tight">Total Customer Sales</span>
                      <div className="p-2 rounded-xl bg-indigo-100/80 text-indigo-700 border border-indigo-200">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-indigo-700 tracking-tight tabular-nums">
                      ₹{summary.total_gross_sales.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-medium text-indigo-700/90 mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span>{summary.settled_orders_count + summary.in_escrow_orders_count} valid orders ({summary.settled_orders_count} delivered)</span>
                    </div>
                  </div>

                  {/* Card 2: Platform Commission (Warm Luxury Amber Theme) */}
                  <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-white border border-amber-200/90 p-5 shadow-xs hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-semibold text-amber-950 tracking-tight">
                        {isProActive ? 'Nvilar Commission (0%)' : `Nvilar Commission (${plan.active_commission}%)`}
                      </span>
                      <div className="p-2 rounded-xl bg-amber-100/80 text-amber-700 border border-amber-200">
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-amber-600 tracking-tight tabular-nums">
                      ₹{summary.total_commission_deducted.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-medium text-amber-800 mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{isProActive ? '0% Fee • Pro Pass Active' : `+ ₹${summary.total_platform_gst.toLocaleString('en-IN')} GST (18%)`}</span>
                    </div>
                  </div>

                  {/* Card 3: Paid to Your Bank (Rich Emerald Green Theme) */}
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-white border border-emerald-200/90 p-5 shadow-xs hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-semibold text-emerald-950 tracking-tight">Paid to Your Bank</span>
                      <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 border border-emerald-200">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-emerald-700 tracking-tight tabular-nums">
                      ₹{summary.total_net_disbursed.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-medium text-emerald-700 mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{summary.settled_orders_count} delivered order{summary.settled_orders_count === 1 ? '' : 's'} settled</span>
                    </div>
                  </div>

                  {/* Card 4: Upcoming Payout (Vibrant Electric Blue Theme) */}
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-white border border-blue-200/90 p-5 shadow-xs hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-semibold text-blue-950 tracking-tight">Upcoming Payout</span>
                      <div className="p-2 rounded-xl bg-blue-100/80 text-blue-700 border border-blue-200">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold text-blue-700 tracking-tight tabular-nums">
                      ₹{summary.pending_escrow_amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-medium text-blue-700 mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{summary.in_escrow_orders_count} pending orders • {isProActive ? '24h post-delivery' : 'Monday cycle'}</span>
                    </div>
                  </div>
                </div>

                {/* CENTERED 2-SECTION SUB-TAB BAR (No Payout Account on right) */}
                <div className="flex items-center justify-center bg-white p-2 rounded-2xl border border-neutral-200/90 shadow-2xs">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setActiveSubTab('ledger')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all bg-indigo-600 text-white shadow-xs"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Billing & Commission Ledger</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('payouts')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all text-neutral-700 hover:text-indigo-700 hover:bg-indigo-50/60"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Payouts & Settlement Support</span>
                      {tickets.some(t => t.status !== 'resolved') && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          {tickets.filter(t => t.status !== 'resolved').length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Order-by-Order Commission Ledger */}
                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-neutral-950 flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span>Order-by-Order Commission Ledger</span>
                      </h3>
                      <p className="text-[11px] leading-5 text-neutral-500 mt-0.5 font-normal">
                        Itemized deduction ledger for every order received by your store.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search Order ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-[12px] font-medium bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-44 sm:w-56"
                        />
                      </div>

                      <div className="flex items-center rounded-xl bg-neutral-100 p-0.5 text-[11px] font-semibold text-neutral-600">
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`px-2.5 py-1 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-white text-neutral-950 shadow-2xs' : 'hover:text-neutral-950'}`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setStatusFilter('settled')}
                          className={`px-2.5 py-1 rounded-lg transition-colors ${statusFilter === 'settled' ? 'bg-white text-neutral-950 shadow-2xs' : 'hover:text-neutral-950'}`}
                        >
                          Settled
                        </button>
                        <button
                          onClick={() => setStatusFilter('in_escrow')}
                          className={`px-2.5 py-1 rounded-lg transition-colors ${statusFilter === 'in_escrow' ? 'bg-white text-neutral-950 shadow-2xs' : 'hover:text-neutral-950'}`}
                        >
                          Pending Payout
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] font-medium text-neutral-600">
                      <thead>
                        <tr className="border-b border-neutral-200/80 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Order Details</th>
                          <th className="py-2.5 px-3">Customer Paid</th>
                          <th className="py-2.5 px-3">Fee Rate</th>
                          <th className="py-2.5 px-3">Platform Fee</th>
                          <th className="py-2.5 px-3">GST (18%)</th>
                          <th className="py-2.5 px-3 text-right">Your Earning</th>
                          <th className="py-2.5 px-3 text-right">Payout Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredLedger.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                              No order billing records found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          filteredLedger.map((item) => (
                            <tr key={item.order_id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-semibold text-[13px] text-neutral-950">{item.order_id}</div>
                                <div className="text-[11px] font-normal text-neutral-400 mt-0.5">{item.date_formatted}</div>
                              </td>

                              <td className="py-3 px-3 font-semibold tabular-nums text-neutral-900">
                                ₹{item.gross_amount.toLocaleString('en-IN')}
                              </td>

                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  item.commission_rate === 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}>
                                  {item.commission_rate}%
                                </span>
                              </td>

                              <td className="py-3 px-3 font-semibold tabular-nums text-amber-700">
                                {item.commission_amount > 0 ? (
                                  `₹${item.commission_amount.toLocaleString('en-IN')}`
                                ) : (
                                  <span className="text-emerald-600 font-semibold">₹0 (Waived)</span>
                                )}
                              </td>

                              <td className="py-3 px-3 tabular-nums text-neutral-500">
                                ₹{item.platform_gst.toFixed(2)}
                              </td>

                              <td className="py-3 px-3 text-right font-semibold tabular-nums text-emerald-700">
                                ₹{item.net_seller_share.toLocaleString('en-IN')}
                              </td>

                              <td className="py-3 px-3 text-right">
                                {item.settlement_status === 'settled' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Paid to UPI
                                  </span>
                                )}
                                {item.settlement_status === 'in_escrow' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                                    <Clock className="w-3 h-3" /> Pending Payout
                                  </span>
                                )}
                                {item.settlement_status === 'waived_return' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold text-[11px] border border-neutral-200">
                                    Cancelled / Return
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monthly Invoices & Tax Statements */}
                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Monthly Invoices & Tax Statements</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Official tax statements and GST invoices for your boutique accounting and CA filing.
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      Tax Compliant
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {invoices.map((inv) => (
                      <div
                        key={inv.invoice_id}
                        className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-neutral-950">
                              {inv.billing_month} Statement
                            </h4>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span>Ref: {inv.invoice_id}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">{inv.invoice_status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                          <div className="text-left sm:text-right">
                            <div className="text-neutral-500 font-medium">Total Billed Volume:</div>
                            <div className="font-semibold text-neutral-950 mt-0.5 tabular-nums">
                              ₹{inv.gross_volume ? inv.gross_volume.toLocaleString('en-IN') : 0}
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <div className="text-neutral-500 font-medium">Platform Fee + GST:</div>
                            <div className="font-semibold text-amber-700 mt-0.5 tabular-nums">
                              ₹{inv.platform_fee ? inv.platform_fee.toLocaleString('en-IN') : 0}
                            </div>
                          </div>

                          <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs transition-colors shrink-0 active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Download CSV</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commercial Policies & FAQs Accordion */}
                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-semibold text-neutral-950">Commercial Policies & Seller FAQ</h3>
                    </div>
                    <span className="text-xs text-neutral-400">
                      Clear & Transparent Guidelines
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {faqs.map((faq, idx) => {
                      const isExpanded = expandedFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 overflow-hidden transition-all"
                        >
                          <button
                            onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                            className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-semibold text-neutral-900 hover:bg-neutral-100/50 transition-colors"
                          >
                            <span>{faq.question}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="p-3.5 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 bg-white">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* DEDICATED SECTION: PAYOUTS & SETTLEMENT SUPPORT (No Top 4 Billing Boxes)  */
              /* ========================================================================= */
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Dedicated Top Navigation Bar with Back to Billing Button + Centered Section Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                  <button
                    onClick={() => setActiveSubTab('ledger')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Billing & Commission</span>
                  </button>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setActiveSubTab('ledger')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all text-neutral-600 hover:text-indigo-700 hover:bg-indigo-50/60"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Billing & Commission Ledger</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('payouts')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all bg-emerald-600 text-white shadow-xs"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Payouts & Settlement Support</span>
                      {tickets.some(t => t.status !== 'resolved') && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-300 text-neutral-950">
                          {tickets.filter(t => t.status !== 'resolved').length}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="hidden sm:block w-[180px]" />
                </div>

                {/* Day-wise Payout Cycle Ledger (7-Day Cycle & Monthly Date-wise Cycle) */}
                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 space-y-5 shadow-xs">
                  {/* Header + Cycle Switcher (7-Day vs Monthly) + Subtle UPI Edit Pill */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-950 tracking-tight flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5 text-emerald-600" />
                        <span>Day-wise Sales & Payout Cycle</span>
                      </h3>
                      <p className="text-xs text-neutral-500 font-normal mt-0.5">
                        Click on any day (Today, Yesterday, or Date) to view that day&apos;s complete sales breakdown, net payout amount, and official Admin payment receipt.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* 7-Day Cycle vs Monthly Cycle Toggle */}
                      <div className="inline-flex items-center rounded-xl bg-neutral-100 p-1 border border-neutral-200/80">
                        <button
                          onClick={() => setPayoutCycleMode('7d')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            payoutCycleMode === '7d'
                              ? 'bg-neutral-950 text-white shadow-2xs'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          7-Day Cycle (Weekly)
                        </button>
                        <button
                          onClick={() => setPayoutCycleMode('monthly')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            payoutCycleMode === 'monthly'
                              ? 'bg-neutral-950 text-white shadow-2xs'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          Monthly Cycle (Date-wise)
                        </button>
                      </div>

                      {/* Compact UPI Pill */}
                      <button
                        onClick={() => setIsUpiModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all"
                        title="Click to update your Payout UPI / Bank ID"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>UPI: {plan.payout_destination}</span>
                        <span className="underline ml-0.5 text-[11px] font-semibold">Edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Clean Day-by-Day Rows (Left: Day + Subtle Date | Right: Sharp Green Net Payout + Receipt Badge) */}
                  <div className="space-y-2.5">
                    {(() => {
                      const activeCycleList: DailyPayoutItem[] =
                        payoutCycleMode === '7d'
                          ? data?.daily_payouts || []
                          : data?.monthly_payouts || [];

                      if (activeCycleList.length === 0) {
                        return (
                          <div className="py-10 text-center text-xs text-neutral-400">
                            No daily payout cycle records found.
                          </div>
                        );
                      }

                      return activeCycleList.map((dayItem) => {
                        const isExpanded = expandedDayKey === `${payoutCycleMode}_${dayItem.date_key}`;
                        const isPaid = dayItem.payout_status === 'paid';
                        const hasSales = dayItem.orders_count > 0 && dayItem.net_payout_amount > 0;

                        return (
                          <div
                            key={`${payoutCycleMode}_${dayItem.date_key}`}
                            className={`rounded-2xl border transition-all overflow-hidden ${
                              isExpanded
                                ? 'border-emerald-500 bg-emerald-50/15 shadow-sm'
                                : hasSales
                                ? 'border-neutral-200/90 bg-white hover:border-emerald-300 hover:bg-neutral-50/50'
                                : 'border-neutral-200/60 bg-neutral-50/40 hover:bg-neutral-50'
                            }`}
                          >
                            {/* Clickable Day Header Row */}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDayKey(
                                  isExpanded ? null : `${payoutCycleMode}_${dayItem.date_key}`
                                )
                              }
                              className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 text-left"
                            >
                              {/* LEFT SIDE: Day Name + Subtle Date */}
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 font-semibold text-xs border tabular-nums ${
                                    isPaid
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : hasSales
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-neutral-100 text-neutral-500 border-neutral-200/80'
                                  }`}
                                >
                                  <span className="leading-tight">{dayItem.short_date.split(' ')[0]}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-medium opacity-85 leading-tight">
                                    {dayItem.short_date.split(' ')[1]}
                                  </span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[15px] sm:text-base font-semibold text-neutral-950 tracking-tight">
                                      {dayItem.day_label}
                                    </span>
                                    <span className="text-xs font-normal text-neutral-400">
                                      {dayItem.date_formatted}
                                    </span>
                                  </div>
                                  <div className="text-xs font-normal text-neutral-500 mt-0.5 flex items-center gap-2">
                                    <span>
                                      {dayItem.orders_count > 0
                                        ? `${dayItem.orders_count} Order${dayItem.orders_count === 1 ? '' : 's'} • Total Sale: ₹${dayItem.gross_sales.toLocaleString('en-IN')}`
                                        : 'No sales recorded on this day'}
                                    </span>
                                    {dayItem.cancelled_count > 0 && (
                                      <span className="text-rose-500 font-medium">
                                        ({dayItem.cancelled_count} cancelled)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* RIGHT SIDE: Sharp Green Payout Amount + Receipt / Status Badge */}
                              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                <div className="text-right">
                                  <div
                                    className={`text-base sm:text-xl font-semibold tabular-nums tracking-tight ${
                                      hasSales ? 'text-emerald-700' : 'text-neutral-400'
                                    }`}
                                  >
                                    ₹{dayItem.net_payout_amount.toLocaleString('en-IN')}
                                  </div>
                                  <div className="mt-0.5 flex items-center justify-end">
                                    {isPaid ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Receipt • Paid</span>
                                      </span>
                                    ) : hasSales ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        <Clock className="w-3 h-3 text-blue-600" />
                                        <span>Pending Payout</span>
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-normal text-neutral-400">
                                        No Payout Due
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* EXPANDED DAY HISAAB & OFFICIAL RECEIPT BREAKDOWN */}
                            {isExpanded && (
                              <div className="px-4 sm:px-5 pb-5 pt-3 bg-white border-t border-neutral-100 space-y-4 animate-in fade-in duration-150">
                                {/* 1. Clean 4-Box Day Hisaab Summary */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                                      Total Sales ({dayItem.day_label})
                                    </div>
                                    <div className="text-base sm:text-lg font-semibold text-indigo-700 mt-0.5 tabular-nums">
                                      ₹{dayItem.gross_sales.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-[11px] text-indigo-600/80 font-medium">
                                      {dayItem.orders_count} valid order{dayItem.orders_count === 1 ? '' : 's'}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                                      Nvilar Fee ({dayItem.commission_rate}%)
                                    </div>
                                    <div className="text-base sm:text-lg font-semibold text-amber-600 mt-0.5 tabular-nums">
                                      - ₹{dayItem.commission_amount.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-[11px] text-amber-800/80 font-medium">
                                      {dayItem.commission_rate === 0 ? '0% Pro VIP Plan' : 'Platform fee deducted'}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-900">
                                      Total Net Payout Due
                                    </div>
                                    <div className="text-base sm:text-lg font-semibold text-emerald-700 mt-0.5 tabular-nums">
                                      ₹{dayItem.net_payout_amount.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-[11px] text-emerald-800 font-medium">
                                      100% payable to your UPI
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                    <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-900">
                                      Settlement Status
                                    </div>
                                    <div className="text-sm sm:text-base font-semibold text-blue-700 mt-0.5">
                                      {isPaid ? 'Paid & Settled ✓' : hasSales ? 'Upcoming Payout' : 'No Sales'}
                                    </div>
                                    <div className="text-[11px] text-blue-700/80 font-medium truncate">
                                      UPI: {dayItem.payout_upi_id || plan.payout_destination}
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Official Admin Payment Receipt Box (If Paid by Admin) */}
                                {isPaid && (
                                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-white border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <Receipt className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                                            Official Payout Receipt Issued
                                          </span>
                                          <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[11px] font-mono font-semibold text-emerald-800">
                                            {dayItem.receipt_id}
                                          </span>
                                        </div>
                                        <div className="text-xs text-emerald-950 font-medium mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                          <span>
                                            Amount Credited: <strong className="font-semibold text-emerald-700 tabular-nums">₹{dayItem.net_payout_amount.toLocaleString('en-IN')}</strong>
                                          </span>
                                          <span>
                                            Bank / UPI UTR: <strong className="font-mono font-semibold">{dayItem.utr_reference}</strong>
                                          </span>
                                          <span>
                                            UPI ID: <strong className="font-semibold">{dayItem.payout_upi_id || plan.payout_destination}</strong>
                                          </span>
                                          {dayItem.paid_at && (
                                            <span>
                                              Settled On: <strong className="font-semibold">{dayItem.paid_at}</strong>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* 3. Orders List for This Specific Day */}
                                {dayItem.orders && dayItem.orders.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold text-neutral-800">
                                        Orders Breakdown for {dayItem.day_label} ({dayItem.date_formatted})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTicketOrderId(dayItem.orders[0]?.order_id || '');
                                          setTicketSubject(
                                            `Payout Query for ${dayItem.day_label} (${dayItem.date_formatted}) — ₹${dayItem.net_payout_amount.toLocaleString('en-IN')}`
                                          );
                                          setIsNewTicketModalOpen(true);
                                        }}
                                        className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline"
                                      >
                                        Need help with {dayItem.day_label}&apos;s payout? Ask Admin
                                      </button>
                                    </div>

                                    <div className="rounded-xl border border-neutral-200 overflow-hidden">
                                      <table className="w-full text-left text-xs">
                                        <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-semibold uppercase text-neutral-500">
                                          <tr>
                                            <th className="py-2 px-3">Order ID & Time</th>
                                            <th className="py-2 px-3">Order Status</th>
                                            <th className="py-2 px-3">Customer Paid</th>
                                            <th className="py-2 px-3">Fee ({dayItem.commission_rate}%)</th>
                                            <th className="py-2 px-3 text-right">Net Payout</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                          {dayItem.orders.map((ord) => (
                                            <tr key={ord.order_id} className="hover:bg-neutral-50/70">
                                              <td className="py-2.5 px-3">
                                                <span className="font-semibold text-neutral-950">{ord.order_id}</span>
                                                <span className="text-[11px] text-neutral-400 ml-2">
                                                  {ord.time_formatted || ord.date_formatted}
                                                </span>
                                              </td>
                                              <td className="py-2.5 px-3">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-neutral-100 text-neutral-700">
                                                  {ord.order_status}
                                                </span>
                                              </td>
                                              <td className="py-2.5 px-3 font-semibold tabular-nums text-neutral-900">
                                                ₹{ord.gross_amount.toLocaleString('en-IN')}
                                              </td>
                                              <td className="py-2.5 px-3 font-semibold tabular-nums text-amber-700">
                                                ₹{ord.commission_amount.toLocaleString('en-IN')}
                                              </td>
                                              <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-emerald-700">
                                                ₹{ord.net_seller_share.toLocaleString('en-IN')}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-neutral-400 py-2">
                                    No customer orders were placed on {dayItem.date_formatted}.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>


                {/* Admin Payout Support Desk (Smart Ticket + Built-in Live Chat Thread) */}
                <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Direct Admin Settlement Desk
                      </div>
                      <h3 className="text-base font-semibold text-neutral-950">
                        Payout Support Tickets & Live Chat with Admin
                      </h3>
                      <p className="text-xs text-neutral-500 font-normal">
                        If a payout is delayed or you have a settlement question, raise a ticket and chat directly with the Nvilar Finance Team.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsNewTicketModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-all shrink-0"
                    >
                      + New Payout Ticket
                    </button>
                  </div>

                  {tickets.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-sm font-semibold text-neutral-900">No Open Payout Issues</div>
                      <p className="text-xs text-neutral-500 max-w-md mx-auto">
                        All your boutique settlements are on schedule. Need help with a specific order payout or bank transfer? Click below to start a ticket chat with Admin.
                      </p>
                      <button
                        onClick={() => setIsNewTicketModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-all"
                      >
                        Contact Admin Payout Support
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left Column: Ticket List */}
                      <div className="lg:col-span-5 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                        {tickets.map((t) => {
                          const isSelected = t.id === selectedTicketId;
                          return (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTicketId(t.id)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-neutral-900 bg-neutral-950 text-white shadow-sm'
                                  : 'border-neutral-200 bg-neutral-50/70 hover:bg-white text-neutral-900'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`text-[11px] font-semibold ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`}>
                                  #{t.id} {t.order_id ? `• Order #${t.order_id}` : ''}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                  t.status === 'resolved'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : t.status === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {t.status.replace('_', ' ')}
                                </span>
                              </div>
                              <div className={`text-xs font-semibold line-clamp-1 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                                {t.subject}
                              </div>
                              <div className={`flex items-center justify-between mt-2 text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                <span>Amount: <strong className="font-semibold tabular-nums">₹{(t.amount || 0).toLocaleString('en-IN')}</strong></span>
                                <span>{(t.messages || []).length} msg{(t.messages || []).length === 1 ? '' : 's'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Column: Active Ticket Live Chat Thread */}
                      <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col h-[420px]">
                        {(() => {
                          const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];
                          if (!activeTicket) return null;
                          return (
                            <>
                              {/* Chat Header */}
                              <div className="p-4 bg-white border-b border-neutral-200 rounded-t-2xl flex items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-neutral-950">#{activeTicket.id}: {activeTicket.subject}</span>
                                  </div>
                                  <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-3">
                                    {activeTicket.order_id && <span>Order: <strong className="font-semibold">#{activeTicket.order_id}</strong></span>}
                                    <span>Amount: <strong className="font-semibold tabular-nums">₹{(activeTicket.amount || 0).toLocaleString('en-IN')}</strong></span>
                                    {activeTicket.utr_reference && (
                                      <span className="text-emerald-700 font-semibold">UTR: {activeTicket.utr_reference}</span>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                  activeTicket.status === 'resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}>
                                  {activeTicket.status.replace('_', ' ')}
                                </span>
                              </div>

                              {/* Messages List */}
                              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                {(activeTicket.messages || []).map((m) => {
                                  const isSeller = m.sender_role === 'seller';
                                  return (
                                    <div key={m.id} className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}>
                                      <div className="text-[10px] font-semibold text-neutral-400 mb-1 px-1">
                                        {isSeller ? 'You (Boutique Seller)' : 'Nvilar Admin Finance Desk'} • {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                        isSeller
                                          ? 'bg-neutral-950 text-white rounded-br-xs'
                                          : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-xs shadow-2xs'
                                      }`}>
                                        {m.message}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Reply Box */}
                              <div className="p-3 bg-white border-t border-neutral-200 rounded-b-2xl flex items-center gap-2">
                                <input
                                  type="text"
                                  value={ticketChatInput}
                                  onChange={(e) => setTicketChatInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendTicketMessage();
                                  }}
                                  placeholder="Type a message to Nvilar Admin Finance Desk..."
                                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900"
                                />
                                <button
                                  onClick={handleSendTicketMessage}
                                  disabled={isSendingChat || !ticketChatInput.trim()}
                                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-black disabled:opacity-50 text-white text-xs font-semibold transition-all"
                                >
                                  {isSendingChat ? 'Sending...' : 'Send'}
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPDATE REGISTERED UPI / BANK ACCOUNT                               */}
      {/* ========================================================================= */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-950">Update Payout UPI / Bank ID</h3>
              <button onClick={() => setIsUpiModalOpen(false)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              Enter your verified UPI VPA or Bank Settlement handle where all delivered order payouts should be credited.
            </p>
            <div>
              <label className="text-xs font-semibold text-neutral-800 block mb-1.5">UPI ID / Bank Account Handle</label>
              <input
                type="text"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                placeholder="e.g. boutique@okhdfcbank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUpiAccount}
                disabled={isSavingUpi}
                className="flex-1 py-2.5 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-semibold"
              >
                {isSavingUpi ? 'Saving...' : 'Save Payout Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RAISE NEW PAYOUT SUPPORT TICKET                                    */}
      {/* ========================================================================= */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-950">Raise Payout Support Ticket</h3>
                <p className="text-xs text-neutral-500">Starts a direct live chat thread with Nvilar Admin Settlement Desk.</p>
              </div>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900 bg-white"
                >
                  <option value="payout_delay">Payout Delayed / Not Credited in Bank</option>
                  <option value="commission_query">Commission / GST Calculation Query</option>
                  <option value="bank_upi_issue">Bank Account / UPI Settlement Issue</option>
                  <option value="other">Other Billing / Plan Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">Select Related Order (Optional)</label>
                <select
                  value={ticketOrderId}
                  onChange={(e) => setTicketOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900 bg-white"
                >
                  <option value="">General Payout Inquiry (All Pending Orders)</option>
                  {ledger.map((l) => (
                    <option key={l.order_id} value={l.order_id}>
                      Order #{l.order_id} — ₹{l.net_seller_share.toLocaleString('en-IN')} ({l.order_status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Settlement pending for delivered order"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">Message for Admin</label>
                <textarea
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your payout issue so our Admin team can check and resolve it immediately..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSupportTicket}
                disabled={isCreatingTicket}
                className="flex-1 py-2.5 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-semibold"
              >
                {isCreatingTicket ? 'Creating Ticket...' : 'Submit & Open Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 7: PLAN SWITCH / UPGRADE CONFIRMATION MODAL                        */}
      {/* ========================================================================= */}
      {isSwitchModalOpen && targetPlanToSwitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-neutral-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsSwitchModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            {targetPlanToSwitch === 'pro_monthly' ? (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
                  <Crown className="w-3.5 h-3.5 text-amber-600" /> Upgrade to Pro Pass
                </div>
                <h3 className="text-xl font-semibold text-neutral-950 tracking-tight">
                  Activate Nvilar Pro Boutique Pass
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Enjoy 0% platform commission on every sale, 2x hyperlocal search priority, and 24-hour express payouts.
                </p>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-600" /> Switch Commercial Plan
                </div>
                <h3 className="text-xl font-semibold text-neutral-950 tracking-tight">
                  Switch to Pay-As-You-Sell
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Your monthly fixed rent drops to ₹0. A standard 4.5% commission will apply only on future successfully delivered sales.
                </p>
              </div>
            )}

            {/* Pricing & Fee Summary */}
            {targetPlanToSwitch === 'pro_monthly' ? (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Monthly Subscription:</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">₹1,694.07</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">GST (18%):</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">₹304.93</span>
                </div>
                <div className="h-px bg-amber-200/80" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-950">Total Net Amount:</span>
                  <span className="text-lg font-semibold text-amber-950 tabular-nums">₹1,999 / month</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Monthly Fixed Charges:</span>
                  <span className="font-semibold text-emerald-600">₹0 (Free Forever)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Commission on Delivered Orders:</span>
                  <span className="font-semibold text-neutral-900">4.5% per sale</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Fee on Returns & Cancellations:</span>
                  <span className="font-semibold text-emerald-600">₹0 (100% Waived)</span>
                </div>
              </div>
            )}

            {/* Payment Method Selector (For Pro Plan) */}
            {targetPlanToSwitch === 'pro_monthly' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-900">
                  Select Activation Payment Method:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Instant UPI */}
                  <div
                    onClick={() => setSwitchPaymentMode('upi')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      switchPaymentMode === 'upi'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <QrCode className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-neutral-950">Instant UPI</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Pay via GPay, PhonePe, Paytm, or scan QR code.
                    </p>
                  </div>

                  {/* Option 2: Escrow Auto-Deduct */}
                  <div
                    onClick={() => setSwitchPaymentMode('balance')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      switchPaymentMode === 'balance'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-neutral-950">Escrow Deduct</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      ₹0 today. Auto-deduct from your next delivered order payout.
                    </p>
                  </div>
                </div>

                {switchPaymentMode === 'upi' && (
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Boutique Merchant VPA:</span>
                    <span className="text-neutral-900 font-semibold bg-white px-2 py-0.5 rounded border border-neutral-200">
                      mitreno@icici
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(false)}
                disabled={isSwitching}
                className="flex-1 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSwitch}
                disabled={isSwitching}
                className={`flex-1 py-3 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                  targetPlanToSwitch === 'pro_monthly'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                    : 'bg-neutral-900 hover:bg-black shadow-neutral-900/20'
                }`}
              >
                {isSwitching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : targetPlanToSwitch === 'pro_monthly' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Confirm & Activate Pro</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Switch</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
