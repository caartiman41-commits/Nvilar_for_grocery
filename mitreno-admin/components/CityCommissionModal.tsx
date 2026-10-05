'use client';

import React, { useState } from 'react';
import { X, Percent, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { updateCityCommission } from '../lib/api';

interface CityCommissionModalProps {
  isOpen: boolean;
  cityId: string;
  cityName: string;
  initialRate: number;
  onClose: () => void;
  onSuccess: (newRate: number, updatedShopsCount: number) => void;
}

export const CityCommissionModal: React.FC<CityCommissionModalProps> = ({
  isOpen,
  cityId,
  cityName,
  initialRate,
  onClose,
  onSuccess,
}) => {
  const [rate, setRate] = useState<number>(initialRate || 10.0);
  const [cascadeToShops, setCascadeToShops] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Please provide a valid commission rate percentage between 0% and 100%.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await updateCityCommission(cityId, rate, cascadeToShops);
      if (res.success) {
        onSuccess(rate, res.updated_shops_count || 0);
        onClose();
      } else {
        setError(res.error || 'Failed to update city commission');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating city commission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Set City Commission Rate</h3>
              <p className="text-[11px] text-slate-500 font-medium">Territory: <span className="font-bold text-slate-700">{cityName}</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Platform Take Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                required
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="15.0"
              />
              <span className="absolute right-3 top-2.5 text-xs font-black text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Recommended: 10% - 15% for ethnic boutiques and fashion markets.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={cascadeToShops}
                onChange={(e) => setCascadeToShops(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  1-Click Instant Cascade to All Existing Shops
                </span>
                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                  When enabled, automatically updates every registered shop in {cityName} to {rate || 0}% in the database immediately.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Apply Commission'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
