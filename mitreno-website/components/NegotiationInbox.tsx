'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Store,
  ChevronDown,
  SquarePen,
  Check,
  CheckCheck,
  X,
  Star,
  Send,
  Clock,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import { PRODUCTS, Product } from '@/lib/products-data';
import { motion, AnimatePresence } from 'motion/react';
import { getBackendUrl } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

interface NegotiationInboxProps {
  onOpenChat: (product: Product, offerAmount?: string, prefillMessage?: string) => void;
}

interface RatedStoreStory {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  verified: boolean;
  storeStatusNote: string;
  fullNote: string;
  noteTimeAgo: string;
  suggestedReplyMessage: string;
  has24hStory: boolean;
  storyImage?: string;
  storyTimeAgo?: string;
  storyCaption?: string;
  product: Product;
}

// Custom Signature Mitreno Verified Badge (100% Mathematically Symmetrical Luxury Seal)
const MitrenoVerifiedBadge: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <span 
    className={`inline-flex items-center justify-center shrink-0 relative ${className}`} 
    title="Mitreno Certified Luxury Boutique"
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_1px_3px_rgba(18,70,184,0.35)]">
      <defs>
        <linearGradient id="mitrenoBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E56D8" />
          <stop offset="50%" stopColor="#1246B8" />
          <stop offset="100%" stopColor="#0B2F84" />
        </linearGradient>
      </defs>
      {/* Mathematically Symmetrical 8-Petal Scalloped Luxury Rosette */}
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
        fill="url(#mitrenoBadgeGrad)"
        stroke="#93C5FD"
        strokeWidth="0.75"
      />
      {/* Perfectly Centered White Certification Checkmark */}
      <path
        d="M7.5 12.3L10.4 15.2L16.5 9.1"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export const NegotiationInbox: React.FC<NegotiationInboxProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'done' | 'pending'>('all');
  const [activeStory, setActiveStory] = useState<RatedStoreStory | null>(null);
  const [activeNoteStore, setActiveNoteStore] = useState<RatedStoreStory | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);
  const [realChats, setRealChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const backendUrl = getBackendUrl();
  const buyerId = user?.uid || '';

  const fetchCustomerChats = React.useCallback(async () => {
    if (!buyerId) {
      setRealChats([]);
      return;
    }
    try {
      setIsLoadingChats(true);
      const data = await apiClient.get('/api/customer/chats', { user_id: buyerId });
      if (data.success && data.chats) {
        setRealChats(data.chats);
      }
    } catch (err) {
      console.error('Failed to load customer chats:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [buyerId]);

  useEffect(() => {
    if (!buyerId) {
      setRealChats([]);
      return;
    }
    fetchCustomerChats();

    // Supabase Realtime channel subscription for customer inbox
    const channel = supabase.channel('customer-inbox-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        fetchCustomerChats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'negotiations' }, () => {
        fetchCustomerChats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_deals' }, () => {
        fetchCustomerChats();
      })
      .on('broadcast', { event: 'new_message' }, () => {
        fetchCustomerChats();
      })
      .on('broadcast', { event: 'deal_update' }, () => {
        fetchCustomerChats();
      })
      .subscribe();

    // Background interval poll (2.5s) to guarantee zero delay
    const interval = setInterval(fetchCustomerChats, 2500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchCustomerChats]);

  // Dynamic Stores derived from real customer chats
  const ratedStores: RatedStoreStory[] = useMemo(() => {
    if (realChats && realChats.length > 0) {
      return realChats.map((chat) => ({
        id: chat.shop_id,
        name: chat.shop_name || 'Boutique',
        avatar: chat.shop_avatar || 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop',
        rating: chat.shop_rating || 0,
        reviewCount: 0,
        isOnline: true,
        verified: chat.shop_verified ?? true,
        storeStatusNote: 'Active 🟢',
        fullNote: `${chat.shop_name || 'Boutique'} is live. Send a message to bargain! 🟢`,
        noteTimeAgo: 'Live',
        suggestedReplyMessage: "Hi! Is this item ready for dispatch?",
        has24hStory: false,
        product: (chat.products?.[0] ? {
          id: chat.products[0].product_id,
          name: chat.products[0].product_name,
          price: chat.products[0].product_base_price,
          originalPrice: chat.products[0].product_original_price || chat.products[0].product_base_price,
          images: [chat.products[0].product_thumbnail],
          shop: { name: chat.shop_name, location: chat.shop_city || 'Local' }
        } as any : PRODUCTS[0])
      }));
    }
    return [];
  }, [realChats]);

  // Conversation Items: Live DB Chats Merged At The Very Top!
  const activeChats = useMemo(() => {
    const list: any[] = [];

    // 1. Process Live Real Chats from Database (Grouped 1 Store = 1 Master Thread)
    realChats.forEach((rc) => {
      const primaryProduct = (rc.products && rc.products.length > 0) ? rc.products[0] : null;
      const targetProductId = primaryProduct?.product_id || rc.product_id;
      const targetProductName = primaryProduct?.product_name || rc.product_name || 'Boutique Collection';
      const targetProductPrice = primaryProduct?.product_base_price || rc.product_base_price || 1999;
      const targetOriginalPrice = primaryProduct?.product_original_price || rc.product_original_price || 2999;
      const targetThumbnail = primaryProduct?.product_thumbnail || rc.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80';

      const matchedProduct = PRODUCTS.find((p) => p.id === targetProductId) || {
        id: targetProductId || 'prod_mtq21g02_xapz',
        slug: targetProductName.toLowerCase().replace(/\s+/g, '-'),
        name: targetProductName,
        tagline: 'Artisanal Handcrafted Boutique Garment',
        collection: 'Curated Boutique Drop',
        category: (primaryProduct?.product_category as any) || 'bottoms',
        price: targetProductPrice,
        originalPrice: targetOriginalPrice,
        gsm: 280,
        fabric: 'Artisanal Denim / French Terry',
        fit: 'Relaxed' as const,
        description: 'Handcrafted luxury piece available exclusively at ' + (rc.shop_name || 'Boutique'),
        features: ['100% Genuine Boutique Article', 'Custom Hemming Included', 'Bargain Protected'],
        stylingTips: 'Pair with sneakers or leather boots.',
        inventory: { S: 5, M: 8, L: 6, XL: 4, XXL: 2 },
        images: [
          {
            id: 'img1',
            url: targetThumbnail,
            angle: 'front' as const,
          },
        ],
        thumbnail: targetThumbnail,
        tryOnModelUrl: targetThumbnail,
        modelInfo: { height: "6'0", wearingSize: 'L', fitNote: 'True to size' },
        completeLookIds: [],
        fabricCloseUpUrl: targetThumbnail,
        color: 'Raw Indigo',
        colorHex: '#1B2A4A',
        shop: {
          name: rc.shop_name || 'Boutique',
          location: rc.shop_city || 'Local Boutique',
          verified: rc.shop_verified ?? true,
          rating: rc.shop_rating || 0.0,
          id: rc.shop_id,
        },
      };

      const timeAgoStr = rc.latest_message?.created_at
        ? new Date(rc.latest_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : rc.last_message?.created_at
        ? new Date(rc.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : rc.latest_updated_at || rc.updated_at
        ? new Date(rc.latest_updated_at || rc.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      const hasAgreed = rc.products?.some((p: any) => p.status === 'agreed') || rc.status === 'agreed';

      const lastMsgSenderId = rc.latest_message?.sender_id || rc.last_message?.sender_id;
      const isCustomerLastMsg = lastMsgSenderId === buyerId;
      const lastMsgSeen = rc.latest_message?.seen_at || rc.last_message?.seen_at;
      
      let readStatus: 'seen' | 'delivered' | 'sent' | 'none' = 'none';
      if (isCustomerLastMsg) {
        readStatus = lastMsgSeen ? 'seen' : 'sent';
      }

      list.push({
        id: rc.shop_id || primaryProduct?.negotiation_id || rc.id,
        storeId: rc.shop_id || 'store-boutique',
        product: matchedProduct,
        shopName: rc.shop_name || 'Boutique',
        shopAvatar: rc.shop_avatar || 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop',
        hasStory: true,
        isOnline: true,
        verified: rc.shop_verified ?? true,
        statusLine: rc.latest_message?.message_text || rc.last_message?.message_text || 'Active in bargaining',
        timeAgo: timeAgoStr,
        readStatus: readStatus as any,
        unread: (rc.unread_count || 0) > 0,
        dealState: hasAgreed ? 'Deal Done' : rc.active_deal ? 'Deal Locked ⚡' : 'Deal Pending',
        dealType: (hasAgreed ? 'done' : 'pending') as 'done' | 'pending',
      });
    });

    // 2. Curated Registered Boutiques (if real chats are few)
    const mockChats = [
      {
        id: 'chat-1',
        storeId: 'store-1',
        product: PRODUCTS[0],
        shopName: 'The Thrift Garage',
        shopAvatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop',
        hasStory: true,
        isOnline: true,
        verified: true,
        statusLine: 'Active now',
        timeAgo: '10:24 AM',
        readStatus: 'seen' as const,
        unread: false,
        dealState: 'Deal Done' as const,
        dealType: 'done' as const,
      },
      {
        id: 'chat-2',
        storeId: 'store-2',
        product: PRODUCTS[1],
        shopName: 'Street Drops',
        shopAvatar: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop',
        hasStory: true,
        isOnline: false,
        verified: true,
        statusLine: 'Active 43m ago',
        timeAgo: 'Yesterday',
        readStatus: 'delivered' as const,
        unread: false,
        dealState: 'Deal Pending' as const,
        dealType: 'pending' as const,
      },
      {
        id: 'chat-3',
        storeId: 'store-3',
        product: PRODUCTS[2] || PRODUCTS[0],
        shopName: 'Boutique Residence',
        shopAvatar: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=400&auto=format&fit=crop',
        hasStory: true,
        isOnline: true,
        verified: false,
        statusLine: 'Sent 38m ago',
        timeAgo: 'Wed',
        readStatus: 'sent' as const,
        unread: false,
        dealState: 'Deal Pending' as const,
        dealType: 'pending' as const,
      },
    ];

    mockChats.forEach((mc) => {
      if (!list.some((item) => item.shopName === mc.shopName)) {
        list.push(mc);
      }
    });

    return list;
  }, [realChats]);

  const dealDoneCount = useMemo(() => activeChats.filter(c => c.dealType === 'done').length, [activeChats]);
  const dealPendingCount = useMemo(() => activeChats.filter(c => c.dealType === 'pending').length, [activeChats]);

  const filteredChats = useMemo(() => {
    return activeChats.filter(chat => {
      const matchesSearch = chat.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            chat.statusLine.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'done') return chat.dealType === 'done';
      if (activeFilter === 'pending') return chat.dealType === 'pending';
      return true;
    });
  }, [activeChats, searchQuery, activeFilter]);

  // Open a store's 24h story and mark it as viewed/seen
  const handleOpenStory = (store: RatedStoreStory) => {
    if (!viewedStoryIds.includes(store.id)) {
      setViewedStoryIds(prev => [...prev, store.id]);
    }
    setActiveStory(store);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] pb-28 font-sans text-neutral-900 selection:bg-blue-100 max-w-4xl mx-auto md:my-6 md:rounded-3xl md:shadow-lg md:border md:border-neutral-200/80 bg-white overflow-hidden">
      
      {/* 1. Instagram Exact Top Navigation Bar with subtle luxury 3D shadow */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 pt-3.5 pb-2.5 border-b border-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-3">
          {/* User Account Handle */}
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <h1 className="text-[20px] font-extrabold tracking-tight text-neutral-950 font-sans group-hover:text-[#1246B8] transition-colors">
              mitreno.chats
            </h1>
            <ChevronDown className="w-4 h-4 text-neutral-800 stroke-[2.5]" />
          </div>

          {/* New Chat / Edit Compose Action */}
          <button 
            onClick={() => onOpenChat(PRODUCTS[0])}
            className="p-1.5 rounded-full hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer text-neutral-900"
            title="Start New Negotiation"
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Instagram-Style Search Bar */}
        <div className="relative mb-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or ask AI"
            className="w-full bg-[#F0F2F5] hover:bg-[#EAECEF] text-neutral-900 placeholder-neutral-500 text-[14px] font-medium py-2 pl-9 pr-4 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1246B8]/30 transition-all border border-transparent shadow-inner"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills: All Messages · Deal Done · Deal Pending */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          {/* All Messages */}
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-neutral-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
                : 'bg-white text-neutral-700 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs'
            }`}
          >
            <span>All Messages</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {activeChats.length}
            </span>
          </button>

          {/* Deal Done Filter */}
          <button
            onClick={() => setActiveFilter('done')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'done'
                ? 'bg-[#047857] text-white shadow-[0_2px_8px_rgba(4,120,87,0.3)]'
                : 'bg-white text-[#065F46] border border-emerald-200 hover:bg-emerald-50/60 shadow-2xs'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'done' ? 'bg-white' : 'bg-[#10B981]'}`}></span>
            <span>Deal Done</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'done' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {dealDoneCount}
            </span>
          </button>

          {/* Deal Pending Filter */}
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-[#B45309] text-white shadow-[0_2px_8px_rgba(180,83,9,0.3)]'
                : 'bg-white text-[#92400E] border border-amber-200 hover:bg-amber-50/60 shadow-2xs'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'pending' ? 'bg-white' : 'bg-[#F59E0B]'}`}></span>
            <span>Deal Pending</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
            }`}>
              {dealPendingCount}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Rated Stores Notes & 24h Shining Stories Tray */}
      {/* Note bubble is attached directly above each store avatar with 3D shadow & click-to-view popup */}
      <div className="pt-2 pb-3.5 border-b border-neutral-100 bg-white">
        <div className="flex gap-4 overflow-x-auto px-4 pt-3 pb-1 no-scrollbar">
          {/* Rated Stores with Attached Status Notes & Shining/Viewed Story Boundary */}
          {ratedStores.map((store) => {
            const isStoryViewed = viewedStoryIds.includes(store.id);

            return (
              <div
                key={store.id}
                className="flex flex-col items-center shrink-0 w-[74px] relative group"
              >
                {/* 1. Clickable Store Status Note Bubble Attached Directly Above */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNoteStore(store);
                  }}
                  title="Tap to read full store note"
                  className="relative z-20 -mb-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="bg-white hover:bg-neutral-50 text-neutral-900 rounded-2xl py-1 px-2.5 text-[10.5px] font-extrabold shadow-[0_4px_12px_rgba(0,0,0,0.12)] text-center max-w-[82px] truncate border border-neutral-200/90 relative tracking-tight">
                    {store.storeStatusNote}
                    {/* Bubble Tail */}
                    <div className="w-2 h-2 bg-white rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-neutral-200/90"></div>
                  </div>
                </div>

                {/* 2. Avatar with Shining Ring (Unseen) OR Muted Instagram Grey Ring (Seen/Viewed) */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => {
                    if (store.has24hStory) {
                      handleOpenStory(store);
                    } else {
                      onOpenChat(store.product);
                    }
                  }}
                >
                  {/* Story Border Logic:
                      - has24hStory & NOT viewed: Radiant Shining Gradient Ring with Glow
                      - has24hStory & VIEWED: Authentic Instagram Seen Story Ring (Refined Muted Neutral Double Ring)
                      - No story: Clean ring */}
                  <div className={`transition-all duration-300 ${
                    store.has24hStory
                      ? isStoryViewed
                        ? 'p-[2px] rounded-full border-2 border-neutral-300 bg-white shadow-2xs group-hover:border-neutral-400' 
                        : 'p-[2.5px] rounded-full bg-gradient-to-tr from-[#FF1361] via-[#FF8A00] to-[#9900EF] shadow-[0_0_10px_rgba(255,19,97,0.35)] group-hover:shadow-[0_0_14px_rgba(255,19,97,0.5)]'
                      : 'p-[2px] bg-transparent'
                  }`}>
                    <div className="w-15 h-15 rounded-full overflow-hidden relative border-2 border-white bg-neutral-100 shadow-xs">
                      <Image 
                        src={store.avatar} 
                        alt={store.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Online Indicator Green Dot */}
                  {store.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white shadow-2xs"></span>
                  )}
                </div>

                {/* Store Name with Verified Badge & Star Rating */}
                <div className="flex items-center justify-center gap-1 mt-1.5 w-full px-0.5">
                  <span className="text-[12px] font-bold text-neutral-900 truncate leading-tight">
                    {store.name.split(' ')[0]}
                  </span>
                  {store.verified && (
                    <MitrenoVerifiedBadge size={13} className="shrink-0 -mt-0.5" />
                  )}
                </div>
                <div className="flex items-center gap-0.5 mt-0.5 text-[10px] text-neutral-500 font-bold">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{store.rating}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Messages & Requests Header Bar */}
      <div className="px-4 pt-3.5 pb-1.5 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-neutral-950 tracking-tight">
          Messages
        </h2>
        <button 
          onClick={() => onOpenChat(PRODUCTS[1])}
          className="text-[14px] font-semibold text-[#1246B8] hover:underline cursor-pointer"
        >
          Requests
        </button>
      </div>

      {/* 4. Instagram Clean DM List with Signature Mitreno Badge & Subtle Classy Deal Tags */}
      <div className="divide-y divide-neutral-100 bg-white shadow-2xs">
        {filteredChats.map((chat) => {
          const isStoryViewed = viewedStoryIds.includes(chat.storeId);
          const matchedStore = ratedStores.find(s => s.id === chat.storeId);

          return (
            <div
              key={chat.id}
              onClick={() => onOpenChat(chat.product)}
              className="px-4 py-3.5 flex items-center gap-3.5 cursor-pointer transition-colors active:bg-neutral-100 hover:bg-neutral-50/90 group"
            >
              {/* Left: Avatar with Shining Story Ring OR Seen Story Ring + Online Dot */}
              <div 
                className="relative shrink-0"
                onClick={(e) => {
                  if (chat.hasStory && matchedStore) {
                    e.stopPropagation();
                    handleOpenStory(matchedStore);
                  }
                }}
              >
                <div className={`transition-all duration-300 ${
                  chat.hasStory 
                    ? isStoryViewed
                      ? 'p-[2px] rounded-full border-2 border-neutral-300 bg-white shadow-2xs group-hover:border-neutral-400'
                      : 'p-[2px] rounded-full bg-gradient-to-tr from-[#FF1361] via-[#FF8A00] to-[#9900EF] shadow-[0_0_8px_rgba(255,19,97,0.25)]' 
                    : 'p-[2px] bg-transparent'
                }`}>
                  <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-white bg-neutral-100 shadow-2xs">
                    <Image 
                      src={chat.shopAvatar} 
                      alt={chat.shopName} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Online Green Dot */}
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white shadow-2xs"></span>
                )}
              </div>

              {/* Center: Store Name + Signature Mitreno Badge + Exact Instagram Status Line */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-[15.5px] font-bold text-neutral-950 truncate tracking-tight font-sans">
                    {chat.shopName}
                  </h3>
                  {/* Mitreno Unique Luxury Certified Rosette Badge */}
                  {chat.verified && (
                    <MitrenoVerifiedBadge size={16} />
                  )}
                </div>

                {/* Status Line: (Active 43m ago / Sent 38m ago / Seen) */}
                <div className="flex items-center gap-1.5 text-[13.5px] text-neutral-500 font-normal">
                  {chat.readStatus === 'seen' && (
                    <span className="text-[#10B981] flex items-center shrink-0" title="Seen">
                      <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  )}
                  {chat.readStatus === 'delivered' && (
                    <span className="text-neutral-400 flex items-center shrink-0" title="Delivered">
                      <CheckCheck className="w-4 h-4" />
                    </span>
                  )}
                  {chat.readStatus === 'sent' && (
                    <span className="text-neutral-400 flex items-center shrink-0" title="Sent">
                      <Check className="w-4 h-4" />
                    </span>
                  )}

                  <span className="truncate font-medium">
                    {chat.statusLine}
                  </span>

                  <span className="text-neutral-300">·</span>

                  <span className="shrink-0 text-neutral-400 text-xs font-normal">
                    {chat.timeAgo}
                  </span>
                </div>
              </div>

              {/* Right: Classy & Subtle Deal Tag (No Loud Rangoli Colors, Refined Luxury Feel) */}
              <div className="flex flex-col items-end shrink-0 pl-1 gap-1">
                {chat.dealType === 'done' ? (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-[#065F46] bg-emerald-50 border border-emerald-200/80 shadow-[0_1px_3px_rgba(4,120,87,0.08)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    Deal Done
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-[#92400E] bg-amber-50/90 border border-amber-200/70 shadow-[0_1px_3px_rgba(180,83,9,0.08)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                    Deal Pending
                  </span>
                )}

                {chat.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#1246B8] shadow-xs"></span>
                )}
              </div>
            </div>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="text-center py-16 px-4">
            <Store className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-500">No conversations in this filter.</p>
          </div>
        )}
      </div>

      {/* 5. Smooth Store Note Detail Popup (Opens when clicking store note bubble, closes when tapping ANYWHERE) */}
      <AnimatePresence>
        {activeNoteStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveNoteStore(null)}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 relative text-left"
            >
              {/* Top Header with Store Avatar, Name & Rating */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-neutral-200">
                      <Image 
                        src={activeNoteStore.avatar} 
                        alt={activeNoteStore.name} 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {activeNoteStore.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white"></span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-base font-extrabold text-neutral-950 font-sans">
                        {activeNoteStore.name}
                      </h4>
                      {activeNoteStore.verified && <MitrenoVerifiedBadge size={15} />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{activeNoteStore.rating}</span>
                      </div>
                      <span>·</span>
                      <span>{activeNoteStore.reviewCount} reviews</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveNoteStore(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Note Speech Bubble Container */}
              <div className="my-5">
                <div className="bg-[#F4F6F9] rounded-2xl p-4 border border-neutral-200/80 relative shadow-inner">
                  {/* Speech Bubble Icon & Status Tag */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[11px] font-extrabold text-neutral-800 shadow-2xs border border-neutral-200/60">
                      <Sparkles className="w-3 h-3 text-[#1246B8]" />
                      Store Announcement
                    </span>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {activeNoteStore.noteTimeAgo}
                    </span>
                  </div>

                  {/* Full Note Text */}
                  <p className="text-[14.5px] text-neutral-900 font-semibold leading-relaxed">
                    &ldquo;{activeNoteStore.fullNote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => {
                    const prod = activeNoteStore.product;
                    const prefill = activeNoteStore.suggestedReplyMessage || `Hi! Saw your note: "${activeNoteStore.storeStatusNote}". Can I get more details?`;
                    setActiveNoteStore(null);
                    onOpenChat(prod, undefined, prefill);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1E56D8] via-[#1246B8] to-[#0E3A9E] hover:from-[#184AC0] hover:to-[#0B2F84] active:scale-[0.98] text-white font-semibold text-[13.5px] shadow-[0_4px_14px_rgba(18,70,184,0.32)] hover:shadow-[0_6px_18px_rgba(18,70,184,0.42)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Fullscreen 24-Hour Ephemeral Store Story Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[160] bg-black flex flex-col justify-between p-4"
          >
            {/* Top Story Progress Bar & Header */}
            <div>
              {/* Progress Line */}
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mb-3">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  onAnimationComplete={() => setActiveStory(null)}
                  className="h-full bg-white rounded-full"
                />
              </div>

              {/* Store Header in Story */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden relative border border-white/80">
                    <Image src={activeStory.avatar} alt={activeStory.name} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-xs font-bold">{activeStory.name}</span>
                      {activeStory.verified && <MitrenoVerifiedBadge size={13} />}
                      <span className="text-white/60 text-[10px]">{activeStory.storyTimeAgo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span>{activeStory.storeStatusNote}</span>
                      <span className="text-white/40">· 24h Story</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Visual Content */}
            <div className="my-auto relative w-full h-[62vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {activeStory.storyImage && (
                <Image 
                  src={activeStory.storyImage} 
                  alt={activeStory.name} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
              )}
              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-white">
                <p className="text-xs font-medium leading-relaxed">
                  {activeStory.storyCaption}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-semibold backdrop-blur-md">
                    ⭐ {activeStory.rating} rated boutique
                  </span>
                  <span className="text-[10px] text-white/70">Expires in 24 hours</span>
                </div>
              </div>
            </div>

            {/* Bottom Direct Quick Action */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder={`Message ${activeStory.name}...`}
                className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:bg-white/25"
              />
              <button 
                onClick={() => {
                  const prod = activeStory.product;
                  setActiveStory(null);
                  onOpenChat(prod);
                }}
                className="p-2.5 rounded-full bg-white text-black hover:bg-white/90 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
