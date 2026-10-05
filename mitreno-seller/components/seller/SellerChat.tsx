'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Zap,
  Clock,
  Check,
  CheckCheck,
  ChevronLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Tag,
  AlertCircle,
  X,
  Flame,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Phone,
  User,
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import {
  subscribeToNegotiationThread,
  broadcastChatMessage,
  broadcastCustomerDeal,
  broadcastTyping,
  broadcastSeen,
} from '@/lib/supabase';

interface ChatItem {
  id: string;
  buyer_id: string;
  shop_id: string;
  product_id: string;
  original_price: number;
  buyer_last_offer: number | null;
  seller_last_offer: number | null;
  agreed_price: number | null;
  status: 'active' | 'agreed' | 'rejected' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  product_thumbnail: string;
  product_base_price: number;
  product_original_price: number;
  product_fabric: string;
  last_message: {
    id: string;
    sender_id: string;
    message_text: string;
    is_counter_offer: boolean;
    offered_price: number | null;
    seen_at?: string | null;
    created_at: string;
  } | null;
  active_deal: {
    id: string;
    deal_price: number;
    original_price: number;
    status: string;
    expires_at: string;
  } | null;
  customer_message_count: number;
}

interface MessageItem {
  id: string;
  negotiation_id: string;
  sender_id: string;
  message_text: string;
  is_counter_offer: boolean;
  offered_price: number | null;
  seen_at?: string | null;
  created_at: string;
}

interface DealItem {
  id: string;
  shop_id: string;
  customer_id: string;
  product_id: string;
  original_price: number;
  deal_price: number;
  conversation_id: string;
  status: string;
  expires_at: string;
  created_at: string;
  product_name?: string;
  product_thumbnail?: string;
}

interface SellerChatProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
}

const QUICK_REPLIES = [
  'Bhai 100% pure fabric hai, color fade guarantee hai.',
  'Agar abhi order karoge to aaj hi express dispatch ho jayega! 🚀',
  'Last ₹100 aur kam kar sakta hoon, deal final karein?',
  'Custom fitting & hemming free of cost karke bhej denge.',
  'Size M aur L dono ready stock mein available hai.',
];

export const SellerChat: React.FC<SellerChatProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [counts, setCounts] = useState<{ total: number; active_count: number; agreed_count: number }>({
    total: 0,
    active_count: 0,
    agreed_count: 0,
  });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<{
    negotiation: ChatItem;
    messages: MessageItem[];
    deals: DealItem[];
  } | null>(null);

  const [filter, setFilter] = useState<'all' | 'active' | 'agreed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Message input state
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Typing indicator state
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingBroadcastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom Deal Modal
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealPriceInput, setDealPriceInput] = useState('');
  const [dealValidityHours, setDealValidityHours] = useState('24');
  const [dealNote, setDealNote] = useState('');
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  // Mobile navigation: view list vs view chatroom
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const backendUrl = getBackendUrl();

  // 1. Fetch conversations list
  const fetchChats = useCallback(async () => {
    try {
      const params: Record<string, any> = {};
      if (shopId) params.shop_id = shopId;
      if (userId) params.user_id = userId;
      if (filter !== 'all') params.filter = filter;
      if (searchQuery) params.search = searchQuery;

      const data = await apiClient.get('/api/seller/chats', params);
      if (data.success) {
        setChats(data.chats || []);
        if (data.counts) {
          setCounts({
            total: parseInt(data.counts.total || 0, 10),
            active_count: parseInt(data.counts.active_count || 0, 10),
            agreed_count: parseInt(data.counts.agreed_count || 0, 10),
          });
        }
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [filter, searchQuery, shopId, userId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Auto-select first chat on initial desktop load
  useEffect(() => {
    if (!selectedChatId && chats.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  // 2. Fetch messages for selected conversation
  const fetchMessages = useCallback(async (chatId: string, options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setActiveChat(prev => {
          if (!prev || prev.negotiation?.id !== chatId) {
            setIsLoadingMessages(true);
          }
          return prev;
        });
      }
      const data = await apiClient.get(`/api/seller/chats/${chatId}`);
      if (data.success) {
        setActiveChat(prev => {
          // If we already have this chat and message count and status are identical, skip state update to prevent re-render
          if (
            prev &&
            prev.negotiation?.id === chatId &&
            JSON.stringify(prev.messages) === JSON.stringify(data.messages || []) &&
            prev.negotiation.status === data.negotiation.status &&
            (prev.deals || []).length === (data.deals || []).length
          ) {
            return prev;
          }
          return {
            negotiation: data.negotiation,
            messages: data.messages || [],
            deals: data.deals || [],
          };
        });
        // Pre-fill deal price suggestion (5-10% below base price)
        if (data.negotiation?.product_base_price) {
          const suggested = Math.round(data.negotiation.product_base_price * 0.9);
          setDealPriceInput(suggested.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId, fetchMessages]);

  // Mark messages seen when seller opens a chat thread
  useEffect(() => {
    if (!selectedChatId || !userId) return;
    const markSeen = async () => {
      try {
        await apiClient.post(`/api/customer/chats/${selectedChatId}/seen`, { reader_id: userId });
        broadcastSeen(selectedChatId, userId);
      } catch (err) {
        // Non-critical
      }
    };
    markSeen();
  }, [selectedChatId, userId]);

  // Broadcast typing indicator as seller types (debounced)
  useEffect(() => {
    if (!selectedChatId || !inputText) return;
    broadcastTyping(selectedChatId, userId, true);
    if (typingBroadcastRef.current) clearTimeout(typingBroadcastRef.current);
    typingBroadcastRef.current = setTimeout(() => {
      broadcastTyping(selectedChatId, userId, false);
    }, 2500);
    return () => {
      if (typingBroadcastRef.current) clearTimeout(typingBroadcastRef.current);
    };
  }, [inputText, selectedChatId, userId]);

  // Realtime Supabase Subscription for instantaneous updates (sub-50ms)
  useEffect(() => {
    if (!selectedChatId) return;

    const unsubscribe = subscribeToNegotiationThread(selectedChatId, {
      onMessage: (newMsg) => {
        setActiveChat((prev) => {
          if (!prev) return null;
          // Replace if exists to catch updates (like seen_at changes)
          const index = prev.messages.findIndex((m) => m.id === newMsg.id);
          if (index !== -1) {
            const nextMessages = [...prev.messages];
            nextMessages[index] = newMsg;
            return {
              ...prev,
              messages: nextMessages,
            };
          }
          if (userId && newMsg.sender_id !== userId) {
            sellerAudio.playMessageChime();
          }
          return {
            ...prev,
            messages: [...prev.messages, newMsg],
          };
        });
        fetchChats();
        if (onRefreshMetrics) onRefreshMetrics();

        // Auto-mark incoming messages as seen if we are actively in the chat
        if (userId && newMsg.sender_id !== userId && !newMsg.seen_at) {
          fetch(`${backendUrl}/api/customer/chats/${selectedChatId}/seen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reader_id: userId }),
          }).catch(() => {});
          broadcastSeen(selectedChatId, userId);
        }
      },
      onDealUpdate: (deal) => {
        if (deal.status === 'accepted') {
          sellerAudio.playDealChime();
        }
        fetchMessages(selectedChatId, { silent: true });
        fetchChats();
        if (onRefreshMetrics) onRefreshMetrics();
      },
      onNegotiationUpdate: (neg) => {
        setActiveChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            negotiation: {
              ...prev.negotiation,
              ...neg,
            },
          };
        });
        fetchChats();
      },
      onTyping: (senderId, isTyping) => {
        if (senderId === userId) return;
        if (isTyping) {
          setOtherIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherIsTyping(false), 3000);
        } else {
          setOtherIsTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      },
      onSeen: (_readerUserId, seenAt) => {
        setActiveChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              Boolean(userId && m.sender_id === userId) && !m.seen_at
                ? { ...m, seen_at: seenAt }
                : m
            ),
          };
        });
      },
    });

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedChatId, userId, fetchChats, fetchMessages, onRefreshMetrics, backendUrl]);

  // Silent Background Polling (3s interval, never wipes UI with loading spinner)
  useEffect(() => {
    if (!selectedChatId) return;
    const pollInterval = setInterval(() => {
      fetchMessages(selectedChatId, { silent: true });
      fetchChats();
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [selectedChatId, fetchMessages, fetchChats]);

  // Scroll to bottom smoothly only when new message count increases
  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    const currentCount = activeChat?.messages?.length || 0;
    if (currentCount > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMsgCountRef.current = currentCount;
  }, [activeChat?.messages?.length]);

  // 3. Send text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatId || !inputText.trim() || isSending) return;

    const text = inputText.trim();
    setIsSending(true);

    try {
      const data = await apiClient.post(`/api/seller/chats/${selectedChatId}/messages`, { text });
      if (data.success) {
        setInputText('');
        sellerAudio.playMessageChime();
        // Broadcast over WebSocket directly (<20ms instant delivery to customer!)
        broadcastChatMessage(selectedChatId, data.message);
        // Optimistically add message
        setActiveChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, data.message],
          };
        });
        fetchChats();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // 4. Create custom in-chat deal
  const handleCreateDeal = async () => {
    if (!selectedChatId || !activeChat) return;
    const price = parseInt(dealPriceInput, 10);
    if (!price || price <= 0) {
      alert('Please enter a valid deal price');
      return;
    }

    setIsCreatingDeal(true);
    try {
      const data = await apiClient.post(`/api/seller/chats/${selectedChatId}/deals`, {
        deal_price: price,
        validity_hours: parseInt(dealValidityHours, 10),
        note: dealNote.trim() || undefined,
      });
      if (data.success) {
        setIsDealModalOpen(false);
        setDealNote('');
        sellerAudio.playDealChime();
        // Broadcast deal over WebSocket (<20ms instant delivery to customer!)
        if (data.deal) {
          broadcastCustomerDeal(selectedChatId, data.deal);
        }
        // Refresh active chat to show the new deal card and counter-offer message
        fetchMessages(selectedChatId);
        fetchChats();
        if (onRefreshMetrics) onRefreshMetrics();
      } else {
        alert(data.error || 'Failed to create deal');
      }
    } catch (err) {
      console.error('Error creating deal:', err);
      alert('Server error creating deal');
    } finally {
      setIsCreatingDeal(false);
    }
  };

  // Deduplicate conversations so each customer appears ONCE (1 Customer = 1 Master Thread)
  const uniqueCustomerChats = useMemo(() => {
    const map = new Map<string, ChatItem>();
    chats.forEach((chat: ChatItem) => {
      const key = chat.buyer_id || chat.id;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, chat);
      } else {
        const existingTime = new Date(existing.updated_at || existing.created_at).getTime();
        const chatTime = new Date(chat.updated_at || chat.created_at).getTime();
        if (chatTime > existingTime || (chat.status === 'agreed' && existing.status !== 'agreed')) {
          map.set(key, chat);
        }
      }
    });
    return Array.from(map.values());
  }, [chats]);

  const filteredCustomerChats = useMemo(() => {
    return uniqueCustomerChats.filter((chat: ChatItem) => {
      if (filter === 'active' && chat.status !== 'active') return false;
      if (filter === 'agreed' && chat.status !== 'agreed') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (chat.customer_name || '').toLowerCase().includes(q);
        const matchMsg = (chat.last_message?.message_text || '').toLowerCase().includes(q);
        if (!matchName && !matchMsg) return false;
      }
      return true;
    });
  }, [uniqueCustomerChats, filter, searchQuery]);

  const selectedNegotiation = activeChat?.negotiation || chats.find(c => c.id === selectedChatId);

  return (
    <div className="w-full h-full flex bg-white overflow-hidden animate-in fade-in duration-200 relative">
      {/* LEFT COLUMN: INBOX CONVERSATIONS LIST */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col bg-white shrink-0 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header Bar */}
        <div className="h-16 px-4 py-3 border-b border-neutral-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-950 flex items-center gap-1.5 leading-none">
                <span>Messages</span>
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-mono font-bold">
                  {uniqueCustomerChats.length}
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Bargains &amp; Direct Deals</p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchChats();
              if (selectedChatId) fetchMessages(selectedChatId, { silent: true });
            }}
            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search bar & Filter Tabs */}
        <div className="p-3.5 space-y-3 border-b border-neutral-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search customer or message..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100/80 border border-neutral-200/60">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>All</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                  {uniqueCustomerChats.length}
                </span>
              </button>

              <button
                onClick={() => setFilter('active')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  filter === 'active'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-600" />
                <span>Bargains</span>
              </button>

              <button
                onClick={() => setFilter('agreed')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  filter === 'agreed'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>Deals</span>
              </button>
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 scrollbar-thin scrollbar-thumb-neutral-200">
            {isLoadingChats ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-amber-600" />
                Loading conversations...
              </div>
            ) : filteredCustomerChats.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-neutral-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredCustomerChats.map((chat: ChatItem) => {
                const isSelected = selectedNegotiation?.buyer_id === chat.buyer_id || selectedChatId === chat.id;
                const isAgreed = chat.status === 'agreed';
                const hasActiveDeal = chat.active_deal && chat.active_deal.status === 'active';

                const timeAgoStr = chat.last_message?.created_at
                  ? new Date(chat.last_message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent';

                const lastMsgText = chat.last_message?.message_text;
                const unreadCount = chat.customer_message_count || 0;
                const isSellerLastMsg = chat.last_message && chat.last_message.sender_id !== chat.buyer_id;
                const isLastMsgSeenByCustomer = chat.last_message?.seen_at != null;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (selectedChatId === chat.id) return;
                      setSelectedChatId(chat.id);
                      setShowMobileChat(true);
                    }}
                    className={`mx-2 my-1.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 relative flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-white text-neutral-950 border-2 border-amber-500 shadow-[0_8px_25px_rgba(245,158,11,0.18),0_2px_8px_rgba(0,0,0,0.04)] ring-2 ring-amber-400/15 -translate-y-0.5 scale-[1.01] z-10'
                        : 'bg-white/80 hover:bg-white text-neutral-900 border border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {/* Customer Avatar with Online Indicator */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full bg-neutral-900 text-white flex items-center justify-center font-black text-xs border-2 shadow-xs ${isSelected ? 'border-amber-400' : 'border-neutral-200'}`}>
                        {chat.customer_name ? chat.customer_name.slice(0, 2).toUpperCase() : 'CU'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-3xs" />
                    </div>

                    {/* Center: Customer Name + Prominent Seen Ticks + Last Message (NO product name clutter!) */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13.5px] font-black truncate tracking-tight text-neutral-950">
                          {chat.customer_name || 'Customer'}
                        </h4>
                      </div>

                      {/* Clean Subtitle: Ticks + Last message or Active status */}
                      <div className="flex items-center gap-1.5 mt-0.5 text-[12px] truncate">
                        {chat.last_message ? (
                          <>
                            {isSellerLastMsg && (
                              isLastMsgSeenByCustomer ? (
                                <span className="text-[#10B981] flex items-center shrink-0" title="Seen">
                                  <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                                </span>
                              ) : (
                                <span className="text-neutral-400 flex items-center shrink-0" title="Sent">
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                </span>
                              )
                            )}
                            <span className={`truncate ${!isSellerLastMsg && unreadCount > 0 ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}>
                              {lastMsgText}
                            </span>
                          </>
                        ) : (
                          <span className="truncate text-neutral-500">Active now</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Timestamp on TOP, Deal Done / Pending Badge DIRECTLY UNDERNEATH */}
                    <div className="flex flex-col items-end shrink-0 gap-1 pl-1">
                      <span className="text-[10px] font-semibold font-mono text-neutral-400">
                        {timeAgoStr}
                      </span>

                      {isAgreed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[#065F46] text-[10px] font-bold flex items-center gap-1 shadow-3xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          Deal Done
                        </span>
                      ) : hasActiveDeal ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-[#92400E] text-[10px] font-bold flex items-center gap-1 shadow-3xs">
                          <Zap className="w-2.5 h-2.5 fill-current text-amber-600" />
                          Deal ⚡
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-50 border border-amber-300 text-amber-800 font-bold'
                            : 'bg-neutral-100 border border-neutral-200 text-neutral-600'
                        }`}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHATROOM & DEAL MAKER */}
        <div
          className={`flex-1 flex flex-col bg-[#EFEAE2] min-w-0 relative ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Subtle chat background pattern */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          {selectedNegotiation ? (
            <>
              {/* Chatroom Top Bar: Customer Info + Send Custom Deal Button (Retained as requested!) */}
              <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-neutral-200/80 shadow-xs z-30 sticky top-0">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 -ml-1 rounded-full hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 text-neutral-900" />
                  </button>

                  <div className="flex items-center gap-2.5">
                    <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 shrink-0 shadow-3xs">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-white bg-neutral-900 text-white flex items-center justify-center font-black text-xs">
                        {selectedNegotiation.customer_name ? selectedNegotiation.customer_name.slice(0, 2).toUpperCase() : 'CU'}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 leading-none">
                        <span>{selectedNegotiation.customer_name || 'Customer'}</span>
                      </h3>
                      {otherIsTyping ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>Typing...</span>
                        </span>
                      ) : (
                        <span className="text-[12px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span>Online</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Action: Send Custom Deal Button (RETAINED AS REQUESTED) */}
                <button
                  onClick={() => setIsDealModalOpen(true)}
                  className="py-2 px-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Send Custom Deal</span>
                </button>
              </div>

              {/* Scrollable Chat Area (With Item Inquiry Card at top inside scroll flow matching Screenshot 2) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-200">
                
                {/* Attached Product Card (Inside scroll flow matching Screenshot 2) */}
                <div className="mx-auto max-w-sm w-full bg-white border border-neutral-200/80 rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-neutral-100 relative overflow-hidden shrink-0 border border-neutral-100 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedNegotiation.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80'}
                        alt={selectedNegotiation.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> Item Inquiry
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                        {selectedNegotiation.product_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-extrabold text-neutral-900">
                          ₹{selectedNegotiation.product_base_price?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Bargain Allowed
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedNegotiation.buyer_last_offer && (
                    <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">Buyer Counter Offer:</span>
                      <span className="font-mono font-black text-amber-700">₹{selectedNegotiation.buyer_last_offer.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Date Divider */}
                <div className="text-center my-2">
                  <span className="px-3 py-1 rounded-full bg-neutral-200/70 text-[10px] font-bold text-neutral-500 uppercase tracking-wider shadow-2xs">
                    TODAY
                  </span>
                </div>

                {/* Message Stream */}
                {isLoadingMessages ? (
                  <div className="py-12 text-center text-neutral-400 text-xs">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-amber-600" />
                    Loading conversation...
                  </div>
                ) : activeChat?.messages.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-neutral-300" />
                    <p>Start the conversation with your shopper!</p>
                  </div>
                ) : (
                  activeChat?.messages.map(msg => {
                    const isSeller = Boolean(userId && msg.sender_id === userId);
                    const isSystem = msg.sender_id === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold text-center max-w-md shadow-xs">
                            {msg.message_text}
                          </span>
                        </div>
                      );
                    }

                    // Special counter offer deal message (Clean Boutique Privilege Deal Card)
                    if (msg.is_counter_offer && msg.offered_price) {
                      return (
                        <div key={msg.id} className="flex flex-col items-end w-full">
                          <div className="max-w-sm w-full bg-white border border-amber-300/80 rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(245,158,11,0.12)] relative overflow-hidden space-y-2.5">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                                <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
                                Boutique Privilege Deal
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedNegotiation.product_thumbnail}
                                alt={selectedNegotiation.product_name}
                                className="w-14 h-14 rounded-xl object-cover border border-neutral-100 shadow-inner shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-neutral-950 truncate leading-snug">
                                  {selectedNegotiation.product_name}
                                </h4>
                                <div className="mt-1 flex items-baseline gap-2">
                                  <span className="text-base font-black text-amber-700 font-mono">
                                    ₹{msg.offered_price.toLocaleString('en-IN')}
                                  </span>
                                  {selectedNegotiation.product_original_price > msg.offered_price && (
                                    <span className="text-xs text-neutral-400 line-through font-mono">
                                      ₹{selectedNegotiation.product_original_price.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-neutral-700 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                              &ldquo;{msg.message_text}&rdquo;
                            </p>

                            <div className="pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between text-[10px]">
                              <span className="text-neutral-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-neutral-400" /> Valid for customer checkout
                              </span>
                              <span className="text-amber-700 font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Deal Active ⚡
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'} my-1 relative z-10`}
                      >
                        <div
                          className={`max-w-[82%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                            isSeller
                              ? 'bg-gradient-to-tr from-[#007AFF] to-[#0056b3] text-white rounded-br-sm'
                              : 'bg-white text-neutral-900 border border-neutral-100 rounded-bl-sm'
                          }`}
                        >
                          <div className="font-medium">{msg.message_text}</div>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isSeller ? 'justify-end text-neutral-500/80' : 'justify-start text-neutral-400'}`}>
                          <span className="text-[10px] font-mono">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isSeller && (
                            msg.seen_at ? (
                              <span className="text-[#10B981] flex items-center shrink-0" title="Seen by customer">
                                <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="text-neutral-400 flex items-center shrink-0" title="Sent">
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Realtime Customer Typing Indicator Bubble */}
                {otherIsTyping && (
                  <div className="flex items-center gap-2 my-2 relative z-10">
                    <div className="bg-white/80 backdrop-blur-sm border border-neutral-100 px-4 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm">
                      <span className="text-xs font-semibold text-neutral-600">
                        {selectedNegotiation?.customer_name || 'Customer'} is typing
                      </span>
                      <div className="flex gap-1 items-center ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite] [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite] [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Smart Chips & Input Container (Matching Screenshot 2) */}
              <div className="bg-white border-t border-neutral-200/90 p-2.5 md:p-3 shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
                {/* Smart Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-1 mb-2">
                  {QUICK_REPLIES.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(chip)}
                      className="shrink-0 px-3.5 py-1.5 rounded-full bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[11px] font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 px-0.5"
                >
                  <div className="flex-1 bg-neutral-100/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border border-neutral-200 rounded-2xl px-3 py-1.5 flex items-center transition-all shadow-inner min-h-[44px]">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message or offer..."
                      className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 py-1 outline-none resize-none font-medium leading-relaxed max-h-[120px] overflow-y-auto"
                      style={{ height: '36px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white transition-all duration-300 ease-out shrink-0 flex items-center justify-center shadow-[0_4px_14px_rgba(79,70,229,0.35)] cursor-pointer mb-0.5 ${
                      !inputText.trim() || isSending 
                        ? 'opacity-40 cursor-not-allowed' 
                        : 'hover:scale-105 active:scale-95 hover:shadow-lg hover:opacity-100'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
              <MessageSquare className="w-12 h-12 text-neutral-300 mb-3 stroke-[1.2]" />
              <h3 className="text-sm font-bold text-neutral-700">Select a Conversation</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Choose a customer chat from the list to view bargaining history and send exclusive deals.
              </p>
            </div>
          )}
        </div>

      {/* CREATE CUSTOM IN-CHAT DEAL MODAL */}
      {isDealModalOpen && selectedNegotiation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 space-y-5 shadow-2xl text-neutral-900 relative">
            {/* Close button */}
            <button
              onClick={() => setIsDealModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                <Zap className="w-3 h-3 fill-current text-amber-600" />
                Custom In-Chat Deal Card
              </div>
              <h3 className="text-lg font-extrabold text-neutral-950">
                Send Exclusive Bargain Offer
              </h3>
              <p className="text-xs text-neutral-600">
                Send a private, limited-time price to {selectedNegotiation.customer_name}.
              </p>
            </div>

            {/* Target Product Summary */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
              <img
                src={selectedNegotiation.product_thumbnail}
                alt={selectedNegotiation.product_name}
                className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-neutral-950 truncate">
                  {selectedNegotiation.product_name}
                </h4>
                <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                  <span>Selling Price: ₹{selectedNegotiation.product_base_price?.toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>MRP: ₹{selectedNegotiation.product_original_price?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Price Input with Live Discount Calculation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700">
                Special Offer Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">
                  ₹
                </span>
                <input
                  type="number"
                  value={dealPriceInput}
                  onChange={e => setDealPriceInput(e.target.value)}
                  placeholder="e.g. 1599"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {dealPriceInput && parseInt(dealPriceInput, 10) > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <span>Customer Savings:</span>
                  <span className="font-extrabold">
                    ₹{(selectedNegotiation.product_original_price - parseInt(dealPriceInput, 10)).toLocaleString('en-IN')} (
                    {Math.round(
                      ((selectedNegotiation.product_original_price - parseInt(dealPriceInput, 10)) /
                        selectedNegotiation.product_original_price) *
                        100
                    )}
                    % OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Validity Hours */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700">
                Deal Validity Expiry *
              </label>
              <select
                value={dealValidityHours}
                onChange={e => setDealValidityHours(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-500"
              >
                <option value="2">2 Hours (Flash Deal ⚡)</option>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours</option>
              </select>
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700">
                Personal Message (Optional)
              </label>
              <input
                type="text"
                value={dealNote}
                onChange={e => setDealNote(e.target.value)}
                placeholder="e.g. Bhai this is my absolute best closing price for you!"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDealModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-semibold text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDeal}
                disabled={isCreatingDeal || !dealPriceInput}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-neutral-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isCreatingDeal ? 'Sending Deal...' : 'Lock & Send Deal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
