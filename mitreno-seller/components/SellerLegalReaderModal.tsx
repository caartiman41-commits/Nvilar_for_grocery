'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, FileText, ShieldCheck, Lock } from 'lucide-react';
import {
  LegalDocument,
  SELLER_MERCHANT_AGREEMENT,
  SELLER_TERMS_AND_CONDITIONS,
  SELLER_PRIVACY_POLICY,
} from '@/lib/seller-legal-docs';

type DocId = 'agreement' | 'terms' | 'privacy';

interface SellerLegalReaderModalProps {
  isOpen: boolean;
  initialDoc?: DocId;
  acceptedDocs: Set<DocId>;
  onAccept: (docId: DocId) => void;
  onClose: () => void;
}

const DOC_META: Record<DocId, { label: string; icon: React.ReactNode; doc: LegalDocument; shortSummary: string }> = {
  agreement: {
    label: 'Merchant Agreement',
    icon: <FileText className="w-4 h-4" />,
    doc: SELLER_MERCHANT_AGREEMENT,
    shortSummary: 'Commercial contract, SLA, commissions, payouts & anti-counterfeiting pledge.',
  },
  terms: {
    label: 'Terms & Conditions',
    icon: <ShieldCheck className="w-4 h-4" />,
    doc: SELLER_TERMS_AND_CONDITIONS,
    shortSummary: 'Catalog accuracy, MRP compliance, zero circumvention & platform code of conduct.',
  },
  privacy: {
    label: 'Privacy Policy',
    icon: <Lock className="w-4 h-4" />,
    doc: SELLER_PRIVACY_POLICY,
    shortSummary: 'KYC data protection, DPDP Act 2023 compliance, no data selling & grievance officer.',
  },
};

export const SellerLegalReaderModal: React.FC<SellerLegalReaderModalProps> = ({
  isOpen,
  initialDoc = 'agreement',
  acceptedDocs,
  onAccept,
  onClose,
}) => {
  const [activeDoc, setActiveDoc] = useState<DocId>(initialDoc);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when doc changes
  useEffect(() => {
    setHasScrolledToBottom(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeDoc]);

  // Reset to initialDoc when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveDoc(initialDoc);
      setHasScrolledToBottom(false);
    }
  }, [isOpen, initialDoc]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (isNearBottom) setHasScrolledToBottom(true);
  };

  const currentMeta = DOC_META[activeDoc];
  const currentDoc = currentMeta.doc;
  const isAlreadyAccepted = acceptedDocs.has(activeDoc);
  const canAccept = hasScrolledToBottom || isAlreadyAccepted;

  const handleAccept = () => {
    if (!canAccept) return;
    onAccept(activeDoc);
    // Auto-advance to next unaccepted doc
    const allDocs: DocId[] = ['agreement', 'terms', 'privacy'];
    const newAccepted = new Set(acceptedDocs).add(activeDoc);
    const nextUnaccepted = allDocs.find((d) => !newAccepted.has(d));
    if (nextUnaccepted) {
      setActiveDoc(nextUnaccepted);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl flex flex-col overflow-hidden"
            style={{ height: '92dvh' }}
          >
            {/* Header */}
            <div className="shrink-0 border-b border-neutral-100 px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-black text-neutral-900 leading-tight">Legal Documents</h2>
                    <p className="text-[10px] text-neutral-400 font-medium">Read each document before accepting</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="flex p-0.5 bg-neutral-100 rounded-xl gap-0.5">
                {(Object.keys(DOC_META) as DocId[]).map((docId) => {
                  const accepted = acceptedDocs.has(docId);
                  return (
                    <button
                      key={docId}
                      type="button"
                      onClick={() => setActiveDoc(docId)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1.5 rounded-[10px] text-[10px] font-semibold transition-all cursor-pointer ${
                        activeDoc === docId
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      {accepted ? (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 text-white stroke-[3]" />
                        </span>
                      ) : null}
                      <span className="truncate">{DOC_META[docId].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Content - Scrollable */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
            >
              {/* Doc Header */}
              <div className="pb-4 border-b border-neutral-100">
                <h1 className="text-base font-black text-neutral-900 leading-tight mb-1">
                  {currentDoc.title}
                </h1>
                <p className="text-xs text-neutral-500 font-medium mb-3 leading-snug">{currentDoc.subtitle}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">
                    {currentDoc.version}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Last updated: {currentDoc.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Sections */}
              {currentDoc.sections.map((section, idx) => (
                <div key={idx} className="space-y-2.5">
                  <h3 className="text-[11px] font-black text-neutral-800 uppercase tracking-wider leading-snug">
                    {section.heading}
                  </h3>
                  {section.content.map((para, pIdx) => (
                    <p key={pIdx} className="text-xs text-neutral-600 leading-relaxed font-normal">
                      {para}
                    </p>
                  ))}
                </div>
              ))}

              {/* Scroll nudge */}
              {!hasScrolledToBottom && !isAlreadyAccepted && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="h-px flex-1 bg-neutral-100" />
                  <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">↓ Scroll to end</span>
                  <div className="h-px flex-1 bg-neutral-100" />
                </div>
              )}

              <div className="h-6" />
            </div>

            {/* Footer - Accept Button */}
            <div className="shrink-0 border-t border-neutral-100 px-4 py-3.5 bg-white">
              {!hasScrolledToBottom && !isAlreadyAccepted && (
                <p className="text-[10.5px] text-neutral-400 font-medium text-center mb-2.5">
                  Scroll to the bottom to enable acceptance
                </p>
              )}
              <button
                type="button"
                onClick={handleAccept}
                disabled={!canAccept}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isAlreadyAccepted
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                    : canAccept
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer active:scale-[0.98] shadow-md shadow-blue-500/25'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {isAlreadyAccepted ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Accepted ✓</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>I have read and accept this {currentMeta.label}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
