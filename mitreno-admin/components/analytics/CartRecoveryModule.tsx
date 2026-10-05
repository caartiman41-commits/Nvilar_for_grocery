'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  PhoneForwarded,
  MessageCircle,
  ExternalLink,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { fetchCartRecovery } from '../../lib/api';
import { CartRecoveryData } from '../../lib/types';

interface CartRecoveryModuleProps {
  period: string;
  isDark: boolean;
  formatINR: (amount: number) => string;
  card3DClass: string;
}

export function CartRecoveryModule({
  period,
  isDark,
  formatINR,
  card3DClass,
}: CartRecoveryModuleProps) {
  const [data, setData] = useState<CartRecoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchCartRecovery(period);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load cart recovery data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const summary = data?.summary || {
    total_dropped_leads: 0,
    recoverable_gmv: 0,
  };

  const avgValue =
    summary.total_dropped_leads > 0
      ? summary.recoverable_gmv / summary.total_dropped_leads
      : 0;

  const filteredLeads = (data?.leads || []).filter(
    (l) =>
      l.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.shop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getWhatsAppLink = (lead: { phone: string; customer_name: string; cart_value: number; order_id?: string }) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const message = `Namaste ${lead.customer_name}! We noticed you left an item worth ${formatINR(lead.cart_value)} in your Mitreno cart. Use code SAVE5 for an instant discount to complete your checkout today! Order here: https://mitreno.com/cart`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 3 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Abandoned Leads */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Abandoned Checkouts
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <ShoppingCart className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {summary.total_dropped_leads}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Customers who dropped before payment</span>
            </div>
          </div>
        </div>

        {/* Recoverable GMV */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Recoverable GMV
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
              <Sparkles className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {formatINR(summary.recoverable_gmv)}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Total potential revenue sitting in carts</span>
            </div>
          </div>
        </div>

        {/* Average Abandoned Ticket */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
              Avg Cart Size
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400' : 'bg-teal-50 border border-teal-200 text-teal-600'}`}>
              <PhoneForwarded className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatINR(avgValue)}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Average abandoned checkout value</span>
            </div>
          </div>
        </div>
      </div>

      {/* ABANDONED LEADS TABLE */}
      <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
              <MessageCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                1-Click WhatsApp Cart Recovery Stream
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Send personalized WhatsApp recovery messages directly with pre-filled discount vouchers
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search customer, phone, shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-xs font-bold rounded-xl border outline-hidden transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-teal-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500 shadow-2xs'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-300 bg-slate-800/60' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                <th className="py-3 px-3.5 rounded-l-lg">Customer</th>
                <th className="py-3 px-3.5">Contact</th>
                <th className="py-3 px-3.5">Target Boutique</th>
                <th className="py-3 px-3.5 text-right">Cart Value</th>
                <th className="py-3 px-3.5 text-right">Dropped Since</th>
                <th className="py-3 px-3.5 text-center rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400">
                    <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                    No dropped checkouts detected for this period. 100% conversion!
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lead.customer_name || 'Guest Shopper'}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ID: {lead.lead_id}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {lead.phone}
                        </span>
                        <button
                          onClick={() => copyPhone(lead.phone)}
                          title="Copy Phone Number"
                          className="text-slate-400 hover:text-teal-600 cursor-pointer p-0.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedPhone === lead.phone && (
                          <span className="text-[10px] text-emerald-500 font-black">Copied!</span>
                        )}
                      </div>
                    </td>
                    <td className={`py-3 px-3.5 font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                      {lead.shop_name}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-xs text-emerald-600 dark:text-emerald-400">
                      {formatINR(lead.cart_value)}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {Math.round(lead.hours_ago)} hrs ago
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <a
                        href={getWhatsAppLink(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Nudge</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          <span>Pre-filled with customer name and cart total for fast response rate</span>
          <span className="font-black text-teal-600 dark:text-teal-400">● Direct WhatsApp Deep Link</span>
        </div>
      </div>
    </div>
  );
}
