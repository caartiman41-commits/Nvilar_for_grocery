'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, ArrowRight, Loader2, Bot, User, ShoppingBag } from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products-data';
import Image from 'next/image';

interface MitrenoAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
  action?: {
    label: string;
    type: 'view_product' | 'discover' | 'open_wardrobe';
    targetId: string;
  };
}

export const MitrenoAIChat: React.FC<MitrenoAIChatProps> = ({
  isOpen,
  onClose,
  onOpenProduct,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Greetings. I am your MITRENO Private Stylist. How may I curate your wardrobe today? Whether you are attending a sunset dinner in Udaipur or refining your everyday architectural silhouettes, I am here to guide your fit.',
      recommendedProducts: [PRODUCTS[0], PRODUCTS[1]],
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Style the 240 GSM Linen Shirt for dinner',
    'What should I wear to a modern art gallery opening?',
    'Build me a tonal monochrome look',
    'Explain the drape benefits of Giza Cotton',
  ];

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const msgCounterRef = useRef(0);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    msgCounterRef.current += 1;
    const userMsgId = `usr-${msgCounterRef.current}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      const matchedProds = PRODUCTS.filter((p) =>
        data.recommendedProductIds?.includes(p.id)
      );

      msgCounterRef.current += 1;
      const botMsg: ChatMessage = {
        id: `bot-${msgCounterRef.current}`,
        role: 'assistant',
        content: data.replyText || 'I have curated these pieces for your frame.',
        recommendedProducts: matchedProds.length > 0 ? matchedProds : undefined,
        action: data.suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      msgCounterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${msgCounterRef.current}`,
          role: 'assistant',
          content:
            'Our 240 GSM European linen pairs magnificently with double-pleated trousers to create a timeless architectural silhouette.',
          recommendedProducts: [PRODUCTS[0], PRODUCTS[1]],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070B14]/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-over Dialog */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#0A0F1D] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1246B8] flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-editorial text-lg font-bold">MITRENO AI Stylist</h3>
                  <p className="text-[11px] text-blue-300 font-mono">Private Fashion Maison Concierge</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  } space-y-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#1246B8] text-white rounded-br-none shadow-md font-medium'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm font-light'
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* Recommended Products Card Strip */}
                  {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                    <div className="w-full grid grid-cols-2 gap-2 pt-1">
                      {m.recommendedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-[#1246B8] transition-all space-y-2 group shadow-sm"
                        >
                          <div
                            className="relative h-24 w-full rounded-lg overflow-hidden bg-slate-100 cursor-pointer"
                            onClick={() => onOpenProduct(p)}
                          >
                            <Image
                              src={p.thumbnail}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div>
                            <p className="text-[11px] font-bold text-slate-900 line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500">
                              ₹{p.price.toLocaleString('en-IN')}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => onAddToCart(p)}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-[#1246B8] hover:bg-[#0E3692] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                              title="Add to Bag"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Add To Bag</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Action Trigger */}
                  {m.action && (
                    <button
                      onClick={() => {
                        const targetProd = PRODUCTS.find((p) => p.id === m.action?.targetId) || PRODUCTS[0];
                        onOpenProduct(targetProd);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1246B8] text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{m.action.label}</span>
                    </button>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#1246B8] bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Curating maison recommendations…</span>
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>

            {/* Quick Inspiration Chips */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#1246B8] text-slate-600 text-[11px] whitespace-nowrap border border-slate-200 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask your private stylist anything..."
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:border-[#1246B8] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="p-3 rounded-xl bg-[#1246B8] hover:bg-[#0E3692] text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
