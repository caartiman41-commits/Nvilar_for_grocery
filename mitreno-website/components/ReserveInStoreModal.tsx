'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Calendar, Clock, CheckCircle2, QrCode, Navigation, ShieldCheck } from 'lucide-react';
import { Product } from '@/lib/products-data';
import Image from 'next/image';

interface ReserveInStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ReserveInStoreModal: React.FC<ReserveInStoreModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedTime, setSelectedTime] = useState<string>('17:00');

  if (!isOpen || !product) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleConfirm = () => {
    // Move to processing/payment
    setStep(2);
    setTimeout(() => {
      setStep(3); // Move to Success QR
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-widest">
              {step === 3 ? 'Reservation Pass' : 'Reserve & Try In-Store'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>
          </div>

          <div className="overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {step === 1 && (
              <div className="p-6 space-y-6">
                {/* Product Info */}
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden relative shrink-0">
                    <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{product.name}</h3>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">₹{product.price.toLocaleString('en-IN')}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md w-max border border-emerald-100">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span className="text-[9px] font-bold text-emerald-700 uppercase">Available in Store</span>
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#1246B8]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{product.shop?.name || 'Local Store'}</h4>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                        {product.shop?.location || 'Mumbai Market'}<br/>
                        Open today until 9:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-3 block">Select Size to Hold</label>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === size
                            ? 'bg-neutral-900 border-neutral-900 text-white shadow-md'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-3 block">When will you visit?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedDate('today')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                        selectedDate === 'today'
                          ? 'bg-blue-50 border-[#1246B8] text-[#1246B8]'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="text-xs font-bold">Today</span>
                    </button>
                    <button
                      onClick={() => setSelectedDate('tomorrow')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                        selectedDate === 'tomorrow'
                          ? 'bg-blue-50 border-[#1246B8] text-[#1246B8]'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span className="text-xs font-bold">Tomorrow</span>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-2.5">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <p className="text-[10px] text-amber-900 font-medium leading-relaxed">
                    A refundable token of ₹99 is required to hold this item. It will be adjusted against your purchase or refunded if you decide not to buy.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-neutral-200 border-t-[#1246B8] rounded-full animate-spin"></div>
                <h3 className="text-sm font-bold text-neutral-900">Processing ₹99 Token...</h3>
                <p className="text-xs text-neutral-500">Securing your item at {product.shop?.name}</p>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 space-y-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900">Item Reserved!</h3>
                  <p className="text-xs text-neutral-500 mt-1">Show this pass at the store counter.</p>
                </div>

                <div className="w-full bg-neutral-50 border border-neutral-200 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full -translate-y-1/2"></div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <QrCode className="w-32 h-32 text-neutral-900" />
                    <div className="w-full border-t border-dashed border-neutral-300 my-2"></div>
                    <div className="w-full flex justify-between items-center text-left">
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Store</p>
                        <p className="text-xs font-bold text-neutral-900">{product.shop?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Time</p>
                        <p className="text-xs font-bold text-neutral-900">
                          {selectedDate === 'today' ? 'Today' : 'Tomorrow'}, 5 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            )}
          </div>

          {/* Footer CTA for Step 1 */}
          {step === 1 && (
            <div className="p-4 bg-white border-t border-neutral-100 shrink-0">
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-2xl bg-[#1246B8] hover:bg-[#0E3692] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                Pay ₹99 Token & Reserve
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
