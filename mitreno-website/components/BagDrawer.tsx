'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '@/lib/products-data';
import Image from 'next/image';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onProceedToCheckout: () => void;
  isTabMode?: boolean;
}

const VIP_SHIPPING_THRESHOLD = 5000;

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  isTabMode = false,
}) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const amountToVIP = Math.max(0, VIP_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / VIP_SHIPPING_THRESHOLD) * 100);

  const packagingFee = 0; // Complimentary signature packaging
  const shippingFee = subtotal >= VIP_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 250;
  const total = subtotal + packagingFee + shippingFee;

  const drawerContent = (
    <>
              {/* Top Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#1246B8]" />
                  <h2 className="font-serif-editorial text-xl font-bold text-[#0A0F1D]">
                    Your Curated Bag ({items.reduce((a, b) => a + b.quantity, 0)})
                  </h2>
                </div>
                {!isTabMode && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Close Bag"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* VIP Delivery Progress Bar */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Truck className="w-3.5 h-3.5 text-[#1246B8]" />
                    {amountToVIP === 0 ? (
                      <span className="text-[#1246B8] font-bold">Unlocked VIP Express Delivery</span>
                    ) : (
                      <span>
                        <strong className="text-[#1246B8]">₹{amountToVIP.toLocaleString('en-IN')}</strong> away from VIP Express Delivery
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1246B8] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                    <ShoppingBag className="w-12 h-12 stroke-[1.2]" />
                    <p className="text-sm font-medium text-slate-600">Your bag is currently empty</p>
                    <p className="text-xs max-w-xs">
                      Explore our Runway drops and try on silhouettes before adding them to your wardrobe.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-[#1246B8] text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Explore Runway
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-4 p-3.5 rounded-2xl bg-[#FAFAFA] border border-slate-100 relative group"
                    >
                      {/* Product Thumbnail with AI badge */}
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono text-white flex items-center gap-0.5">
                          <Sparkles className="w-2 h-2 text-blue-300" />
                          <span>AI Fit</span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between pr-4">
                            <h3 className="text-xs font-bold text-[#0A0F1D] line-clamp-1">
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => onRemoveItem(item.product.id, item.size)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Size: <span className="font-bold text-slate-800">{item.size}</span> • {item.product.fabric.split(',')[0]}
                          </p>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1">
                            <button
                              onClick={() => onUpdateQty(item.product.id, item.size, -1)}
                              className="text-slate-500 hover:text-slate-900 p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-bold text-slate-800 px-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.product.id, item.size, 1)}
                              className="text-slate-500 hover:text-slate-900 p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono text-sm font-bold text-[#0A0F1D]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Price Breakdown & Checkout Button */}
              {items.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Premium Presentation Vault</span>
                      <span className="font-mono text-emerald-700 font-bold uppercase text-[10px]">Complimentary</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Express Shipping</span>
                      <span className="font-mono">
                        {shippingFee === 0 ? (
                          <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-[#0A0F1D] pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span className="font-mono text-base text-[#1246B8]">
                        ₹{total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    id="proceed-to-checkout-btn"
                    onClick={() => {
                      onClose();
                      onProceedToCheckout();
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-[#1246B8] hover:bg-[#0E3692] text-white text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Proceed to Checkout • ₹{total.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>256-bit Encrypted Checkout • Razorpay Verified</span>
                  </div>
                </div>
              )}
    </>
  );

  if (isTabMode) {
    if (!isOpen) return null;
    return (
      <div className="w-full max-w-2xl mx-auto bg-white flex flex-col h-full min-h-screen pb-32 pt-2 border-l border-r border-slate-100 shadow-xl">
        {drawerContent}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-over Drawer */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {drawerContent}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
