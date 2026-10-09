'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  Send,
  Store,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { getBackendUrl } from '../../lib/config';
import { getAdminToken } from '../../lib/api';

const ADMIN_KEY = 'mitreno_super_secret_admin_key_2026';

export default function AdminPayoutTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [dailyPayouts, setDailyPayouts] = useState<any[]>([]);
  const [settlingDateKey, setSettlingDateKey] = useState<string | null>(null);
  const [dailyUtrInputs, setDailyUtrInputs] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<any>({
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const backendUrl = getBackendUrl();
      const [res, dailyRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/payout-tickets?status=${statusFilter}`, {
          headers: { 'X-Admin-Key': ADMIN_KEY },
        }),
        fetch(`${backendUrl}/api/admin/daily-payouts`, {
          headers: { 'X-Admin-Key': ADMIN_KEY },
        }),
      ]);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        setSummary(data.summary || {});
        if (!selectedTicketId && data.tickets?.length > 0) {
          setSelectedTicketId(data.tickets[0].id);
          setUtrInput(data.tickets[0].utr_reference || '');
        }
      }
      const dailyData = await dailyRes.json();
      if (dailyData.success && Array.isArray(dailyData.daily_payouts)) {
        setDailyPayouts(dailyData.daily_payouts);
      }
    } catch (e) {
      console.error('Failed to load payout tickets:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedTicketId]);

  const handleSettleDailyPayout = async (row: any) => {
    const key = `${row.shop_id}_${row.date_key}`;
    setSettlingDateKey(key);
    try {
      const backendUrl = getBackendUrl();
      const customUtr = (dailyUtrInputs[key] || row.utr_reference || '').trim();
      const res = await fetch(`${backendUrl}/api/admin/daily-payouts/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': ADMIN_KEY,
        },
        body: JSON.stringify({
          shop_id: row.shop_id,
          payout_date: row.date_key,
          utr_reference: customUtr,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTickets();
      }
    } catch (e) {
      console.error('Failed to settle daily payout:', e);
    } finally {
      setSettlingDateKey(null);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendAdminReply = async () => {
    if (!activeTicket || !replyText.trim()) return;
    setSending(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/payout-tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': ADMIN_KEY,
        },
        body: JSON.stringify({
          message: replyText.trim(),
          utr_reference: utrInput.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyText('');
        await fetchTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (!activeTicket) return;
    setSending(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/admin/payout-tickets/${activeTicket.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': ADMIN_KEY,
        },
        body: JSON.stringify({
          status: newStatus,
          utr_reference: utrInput.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(t.id || '').toLowerCase().includes(q) ||
      String(t.shop_name || '').toLowerCase().includes(q) ||
      String(t.order_id || '').toLowerCase().includes(q) ||
      String(t.subject || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Seller Payout Settlement & Support Desk
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Payouts & Seller Support Tickets
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Settle daily boutique payouts with official receipts, attach bank/UPI UTR references, and chat directly with boutique owners.
              </p>
            </div>

            <button
              onClick={fetchTickets}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Refresh Desk</span>
            </button>
          </div>

          {/* 4 Sharp Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Total Payout Tickets</span>
                <CreditCard className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-3xl font-semibold text-slate-950 tabular-nums">{summary.total_tickets || 0}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">All boutique settlement threads</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Open Action Needed</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-semibold text-amber-600 tabular-nums">{summary.open_tickets || 0}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Awaiting admin reply / UTR</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">In Progress</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-semibold text-blue-600 tabular-nums">{summary.in_progress_tickets || 0}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Under bank verification</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Settled & Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-semibold text-emerald-600 tabular-nums">{summary.resolved_tickets || 0}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Completed with UTR confirmation</div>
            </div>
          </div>

          {/* Day-wise Payout Cycle Settlement Console (Send Payment & Issue Official Receipt) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Day-wise Boutique Payouts & Official Receipt Issuer</span>
                </h2>
                <p className="text-xs text-slate-500">
                  When you settle any day&apos;s payout here, an official Receipt + UTR badge immediately appears on that day row in the Seller Website and Mobile App.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Boutique</th>
                    <th className="py-2.5 px-3">Day & Date</th>
                    <th className="py-2.5 px-3">Orders & Gross Sale</th>
                    <th className="py-2.5 px-3">Net Payout Due</th>
                    <th className="py-2.5 px-3">Status & Receipt</th>
                    <th className="py-2.5 px-3">Bank / UPI UTR Reference</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyPayouts
                    .filter((r) => r.orders_count > 0 || r.day_label === 'Today' || r.day_label === 'Yesterday')
                    .slice(0, 10)
                    .map((row) => {
                      const rowKey = `${row.shop_id}_${row.date_key}`;
                      const isPaid = row.payout_status === 'paid';
                      return (
                        <tr key={rowKey} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{row.shop_name}</div>
                            <div className="text-[11px] text-slate-500">{row.payout_upi_id}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-950">{row.day_label}</span>
                            <span className="text-slate-400 ml-1.5">{row.date_formatted}</span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700 tabular-nums">
                            {row.orders_count} Order{row.orders_count === 1 ? '' : 's'} • ₹{(row.gross_sales || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-semibold text-emerald-700 text-sm tabular-nums">
                            ₹{(row.net_payout_amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            {isPaid ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Receipt Issued ✓
                                </span>
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">{row.receipt_id}</div>
                              </div>
                            ) : row.orders_count > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                Pending Payout
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No Sales</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={
                                dailyUtrInputs[rowKey] !== undefined
                                  ? dailyUtrInputs[rowKey]
                                  : row.utr_reference || ''
                              }
                              onChange={(e) =>
                                setDailyUtrInputs((prev) => ({ ...prev, [rowKey]: e.target.value }))
                              }
                              placeholder="e.g. UTR-HDFC-883920"
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold text-slate-900 w-44"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleSettleDailyPayout(row)}
                              disabled={settlingDateKey === rowKey || row.orders_count === 0}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isPaid
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                              } disabled:opacity-40`}
                            >
                              {settlingDateKey === rowKey
                                ? 'Issuing...'
                                : isPaid
                                ? 'Update Receipt'
                                : 'Pay & Issue Receipt'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-1.5">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Ticket ID, Boutique, Order ID..."
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 w-64 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Main Split View: Ticket Queue + Live Chat & Resolution Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Ticket Queue */}
            <div className="lg:col-span-5 space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-900">No Payout Tickets Found</div>
                  <p className="text-xs text-slate-500">
                    When a seller raises a payout support ticket from the Website or Mobile App, it appears here immediately.
                  </p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = t.id === activeTicket?.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setUtrInput(t.utr_reference || '');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-amber-400' : 'text-indigo-600'}`}>
                          #{t.id} • {t.shop_name || 'Nvilar.com'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            t.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : t.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-sm font-semibold line-clamp-1">{t.subject}</div>

                      <div className={`mt-2 flex items-center justify-between text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        <span>
                          {t.order_id ? `Order #${t.order_id} • ` : ''}
                          <strong className="font-semibold tabular-nums">₹{(t.amount || 0).toLocaleString('en-IN')}</strong>
                        </span>
                        <span>{(t.messages || []).length} messages</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Live Chat & Payout Resolution Console */}
            <div className="lg:col-span-7">
              {activeTicket ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[580px]">
                  {/* Top Inspector Bar */}
                  <div className="p-5 border-b border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-600 uppercase">
                            {activeTicket.shop_name || 'Nvilar.com'} ({activeTicket.shop_id})
                          </span>
                        </div>
                        <h2 className="text-base font-semibold text-slate-950 mt-0.5">
                          #{activeTicket.id}: {activeTicket.subject}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus('in_progress')}
                          disabled={sending}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800"
                        >
                          Mark In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('resolved')}
                          disabled={sending}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          Mark Settled & Resolved
                        </button>
                      </div>
                    </div>

                    {/* Financial Context Strip */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block">Order & Amount</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {activeTicket.order_id ? `#${activeTicket.order_id}` : 'General Payout'} • ₹{(activeTicket.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Seller Registered UPI</span>
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          {activeTicket.payout_upi_id || 'mitreno.boutique@okhdfcbank'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Attach Bank UTR Ref</span>
                        <input
                          type="text"
                          value={utrInput}
                          onChange={(e) => setUtrInput(e.target.value)}
                          placeholder="e.g. UTR-HDFC-99281"
                          className="mt-0.5 w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
                    {(activeTicket.messages || []).map((m: any) => {
                      const isAdmin = m.sender_role === 'admin';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                            {isAdmin ? 'Nvilar Finance & Settlement Desk (You)' : `${m.sender_name} (Seller)`} •{' '}
                            {new Date(m.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-slate-900 text-white rounded-br-xs'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex items-center gap-2.5">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendAdminReply();
                      }}
                      placeholder="Type official settlement response or UTR update to seller..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      onClick={handleSendAdminReply}
                      disabled={sending || !replyText.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-semibold"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                  Select a seller payout ticket on the left to inspect and chat.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
