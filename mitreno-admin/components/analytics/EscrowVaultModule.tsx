'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Lock,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Copy,
  DollarSign,
  Search,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { fetchEscrowVault } from '../../lib/api';
import { EscrowVaultData } from '../../lib/types';

interface EscrowVaultModuleProps {
  period: string;
  isDark: boolean;
  formatINR: (amount: number) => string;
  card3DClass: string;
}

export function EscrowVaultModule({
  period,
  isDark,
  formatINR,
  card3DClass,
}: EscrowVaultModuleProps) {
  const [data, setData] = useState<EscrowVaultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchEscrowVault(period);
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load escrow vault:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const copyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const vault = data?.vault || {
    in_flight_escrow: 0,
    ready_payouts: 0,
    order_commissions: 0,
    pay_as_you_go_earnings: 0,
    subscription_vault: 0,
    net_platform_earnings: 0,
    refunded_amount: 0,
    pro_boutiques_count: 0,
    starter_boutiques_count: 0,
  };

  const filteredSettlements = (data?.settlements || []).filter(
    (s) =>
      s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.payout_upi_id && s.payout_upi_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 4 ESCROW METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Customer Escrow */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Customer Escrow
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              <Lock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatINR(vault.in_flight_escrow ?? 0)}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">Held until delivery confirmed</span>
            </div>
          </div>
        </div>

        {/* 2. Pro Subscriptions */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              Pro Subscriptions
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {formatINR(vault.subscription_vault ?? 0)}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="truncate">{vault.pro_boutiques_count ?? 0} Active Pro Sellers (₹1,999/mo)</span>
            </div>
          </div>
        </div>

        {/* 3. Pay-As-You-Go */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Pay-As-You-Go
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
              <Wallet className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {formatINR(vault.pay_as_you_go_earnings ?? vault.order_commissions ?? 0)}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="truncate">{vault.starter_boutiques_count ?? 0} Active Starter Sellers (4.5% Cut)</span>
            </div>
          </div>
        </div>

        {/* 4. Total Platform Net */}
        <div className={`${card3DClass} p-5 relative overflow-hidden group`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              Total Platform Net
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-600'}`}>
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              {formatINR(vault.net_platform_earnings ?? 0)}
            </div>
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Subscriptions + Pay-As Commission</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOUTIQUE SETTLEMENT LEDGER */}
      <div className={`${card3DClass} p-5 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Per-Boutique Escrow Settlement Ledger
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Verified payouts calculated based on commercial plan (0% Pro VIP vs 4.5% Starter)
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search boutique, plan or UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2 text-xs font-bold rounded-xl border outline-hidden transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 shadow-2xs'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-300 bg-slate-800/60' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                <th className="py-3 px-3.5 rounded-l-lg">Boutique Name</th>
                <th className="py-3 px-3.5">Commercial Plan</th>
                <th className="py-3 px-3.5">Payout UPI ID</th>
                <th className="py-3 px-3.5 text-right">Delivered Orders</th>
                <th className="py-3 px-3.5 text-right">Gross Sales</th>
                <th className="py-3 px-3.5 text-right">Platform Fee</th>
                <th className="py-3 px-3.5 text-right">Net Payable</th>
                <th className="py-3 px-3.5 text-center">Settlement Status</th>
                <th className="py-3 px-3.5 text-center rounded-r-lg">Payout Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs font-bold text-slate-400">
                    No settlements found matching query.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((shop, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {shop.shop_name}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ID: {shop.shop_id}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {shop.plan_type === 'pro_monthly' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          👑 PRO VIP (0% Fee)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          ⚡ STARTER (4.5%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      {shop.payout_upi_id ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {shop.payout_upi_id}
                          </span>
                          <button
                            onClick={() => copyUpi(shop.payout_upi_id)}
                            title="Copy UPI ID"
                            className="text-slate-400 hover:text-emerald-600 cursor-pointer p-0.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedUpi === shop.payout_upi_id && (
                            <span className="text-[10px] text-emerald-500 font-black">Copied!</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No UPI linked</span>
                      )}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {shop.delivered_orders}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {formatINR(shop.gross_delivered_sales)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-amber-500">
                      {shop.plan_type === 'pro_monthly' ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ₹0 (Waived)
                        </span>
                      ) : (
                        formatINR(shop.platform_fee_deducted)
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-xs text-emerald-600 dark:text-emerald-400">
                      {formatINR(shop.net_payable)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                          shop.net_payable > 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {shop.payout_status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        shop.plan_type === 'pro_monthly'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-300'
                          : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400'
                      }`}>
                        {shop.payout_speed || (shop.plan_type === 'pro_monthly' ? '⚡ 24h Express' : '📅 Weekly')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`pt-3 border-t text-xs font-semibold flex items-center justify-between ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          <span>Escrow auto-releases upon customer receipt + 7 day return window</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">● Zero Manual Calculator Errors</span>
        </div>
      </div>
    </div>
  );
}
