'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Store,
  ShieldCheck,
  Mail,
  Bell,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { SellerApplicationData } from '../lib/types';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: SellerApplicationData;
  onConfirm: (notes: string) => Promise<void>;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  application,
  onConfirm,
}) => {
  const [notes, setNotes] = useState('All KYC documents verified successfully. Boutique approved for listing.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-neutral-900">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">Approve Seller Application</h3>
              <p className="text-xs text-neutral-500 font-mono font-medium">Application ID: {application.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Cascade info */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
              Automated Actions Triggered Upon Approval:
            </h4>
            <div className="space-y-2 text-xs text-neutral-700">
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Create live shop: <strong className="text-neutral-900 font-bold">{application.business_name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Promote user <strong className="text-neutral-900 font-bold">{application.owner_full_name}</strong> to <code className="text-indigo-700 font-bold bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">boutique_owner</code>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Send onboarding welcome email with store credentials</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Dispatch Firebase Cloud Messaging (FCM) push notification</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Approval Notes (Internal Audit Log)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add audit verification notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 text-xs focus:outline-none focus:border-emerald-500 transition-colors shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Approving &amp; Activating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Activate Boutique</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
