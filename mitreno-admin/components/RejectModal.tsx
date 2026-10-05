'use client';

import React, { useState } from 'react';
import {
  XCircle,
  X,
  AlertTriangle,
  Mail,
  Bell,
  Loader2,
} from 'lucide-react';
import { SellerApplicationData } from '../lib/types';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: SellerApplicationData;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
}

const PRESET_REASONS = [
  'Government ID (Aadhar/PAN) photo is blurry or unreadable. Please re-upload high-resolution scans.',
  'PAN number does not match owner full name registered on application.',
  'GST certificate provided is invalid or inactive according to GST portal.',
  'Incomplete physical shop address or unsupported pin code area.',
  'UPI ID verification failed. Please supply an active UPI handle.',
  'Custom Reason...',
];

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  application,
  onConfirm,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const effectiveReason = selectedPreset === 'Custom Reason...' ? customReason : selectedPreset;

  const handleReject = async () => {
    if (!effectiveReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(effectiveReason, internalNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-neutral-900">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Reject Seller Application</h3>
              <p className="text-xs text-neutral-500">Application ID: {application.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              This rejection reason will be displayed directly on the seller&apos;s Profile screen and sent via Email and FCM Push notification with instructions to re-apply.
            </span>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Select Primary Reason
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs focus:outline-none focus:border-rose-500 transition-colors"
            >
              {PRESET_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason Textarea */}
          {selectedPreset === 'Custom Reason...' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Detailed Rejection Explanation (Visible to Seller)
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                placeholder="Explain what the applicant needs to correct..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Internal Admin Notes (Optional)
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              placeholder="Internal reviewer notes..."
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-700 text-xs focus:outline-none focus:border-neutral-400 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-3 border-t border-neutral-200 flex items-center justify-end gap-3 bg-neutral-50/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting || !effectiveReason.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Rejecting & Notifying...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
