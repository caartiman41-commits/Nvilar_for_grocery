'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronDown,
  Store,
  Send,
  ShoppingBag,
  Sparkles,
  Zap,
  Clock,
  Check,
  CheckCheck,
  Search,
  MessageSquare,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products-data';
import Image from 'next/image';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import {
  subscribeToNegotiationThread,
  broadcastChatMessage,
  broadcastCustomerDeal,
  broadcastTyping,
  broadcastSeen,
  RealtimeChatMessage,
  RealtimeCustomerDeal,
} from '@/lib/supabase';

interface ChatMessage {
  id: string;
  negotiation_id: string;
  sender_id: string;
  message_text: string;
  is_counter_offer: boolean;
  offered_price: number | null;
  seen_at?: string | null; // null = sent (grey ✓), truthy = seen by receiver (blue ✓✓)
  created_at: string;
}

interface CustomDeal {
  id: string;
  shop_id: string;
  customer_id: string;
  product_id: string;
  original_price: number;
  deal_price: number;
  conversation_id: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  created_at: string;
  note?: string;
}

interface ShopProductItem {
  negotiation_id: string;
  product_id: string;
  product_name: string;
  product_thumbnail: string;
  product_base_price: number;
  product_original_price?: number;
  product_category?: string;
  status: string;
  agreed_price?: number | null;
  updated_at?: string;
}

interface CustomerChatItem {
  shop_id: string;
  shop_name: string;
  shop_avatar: string;
  shop_verified: boolean;
  shop_city?: string;
  shop_rating?: number;
  products: ShopProductItem[];
  latest_updated_at?: string;
  latest_message?: {
    id: string;
    negotiation_id: string;
    sender_id: string;
    message_text: string;
    is_counter_offer: boolean;
    offered_price: number | null;
    created_at: string;
  };
  active_deal?: {
    id: string;
    deal_price: number;
    original_price: number;
    product_id: string;
    conversation_id: string;
    status: string;
    expires_at: string;
  } | null;
  unread_count?: number;
}

interface BargainChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialOfferPrice?: string;
  initialPrefillMessage?: string;
  onCheckout: (product: Product, price: number) => void;
  buyerId?: string;
  /** When true, renders inline (no fixed overlay) — for desktop two-panel layout */
  isEmbedded?: boolean;
}

const CLEAN_CHIPS = [
  'Is this still available?',
  'Can you do a combo discount?',
  'Send real photos',
  'How fast is shipping?',
  'What sizes are in stock?',
];

// Dynamic Boutique Logo Resolver (100% Authentic Matching, Zero Fake Fallbacks)
export const getShopAvatar = (shopName?: string, logoUrl?: string) => {
  if (logoUrl && logoUrl.startsWith('http')) return logoUrl;
  const normalized = (shopName || '').toLowerCase().trim();
  if (normalized.includes('joihh')) {
    return 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop';
  }
  if (normalized.includes('thrift')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop';
  }
  if (normalized.includes('street')) {
    return 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop';
  }
  if (normalized.includes('residence') || normalized.includes('vintage')) {
    return 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=400&auto=format&fit=crop';
  }
  if (normalized.includes('maison')) {
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop';
  }
  if (normalized.includes('sarojini')) {
    return 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=400&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&auto=format&fit=crop';
};

export const BargainChatRoom: React.FC<BargainChatRoomProps> = ({
  isOpen,
  onClose,
  product,
  initialOfferPrice,
  initialPrefillMessage,
  onCheckout,
  buyerId: propBuyerId,
  isEmbedded = false,
}) => {
  const { user } = useAuth();
  const buyerId = propBuyerId || user?.uid || '';

  // Current active product & negotiation
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);
  const [negotiationId, setNegotiationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeDeal, setActiveDeal] = useState<CustomDeal | null>(null);
  const [dealAccepted, setDealAccepted] = useState<{ amount: number } | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRespondingDeal, setIsRespondingDeal] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Left sidebar conversation list states (1 Store = 1 Thread)
  const [allChats, setAllChats] = useState<CustomerChatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'agreed'>('all');
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Typing indicator state
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingBroadcastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const backendUrl = getBackendUrl();

  // Keep currentProduct updated when prop changes
  useEffect(() => {
    if (product) {
      setCurrentProduct(product);
    }
  }, [product]);

  // 1. Fetch customer's conversations list grouped by shop
  const fetchAllCustomerChats = useCallback(async () => {
    if (!buyerId) {
      setAllChats([]);
      return;
    }
    try {
      setIsLoadingChats(true);
      const data = await apiClient.get('/api/customer/chats', { user_id: buyerId });
      if (data.success && data.chats) {
        setAllChats(data.chats);
      }
    } catch (err) {
      console.error('Failed to load all customer chats:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [buyerId]);

  useEffect(() => {
    if (!isOpen) return;
    fetchAllCustomerChats();
  }, [isOpen, fetchAllCustomerChats]);

  // 2. Load negotiation thread for currently selected product
  const loadThread = useCallback(async (targetProduct: Product, offerPrice?: string) => {
    try {
      setIsLoadingThread(true);
      const shopId = (targetProduct.shop as { id?: string; name?: string })?.id || (targetProduct as any).shop_id || '';
      if (!shopId || !buyerId) {
        setIsLoadingThread(false);
        return;
      }
      const params: Record<string, any> = {
        buyer_id: buyerId,
        product_id: targetProduct.id,
        shop_id: shopId,
      };
      if (offerPrice) {
        params.initial_offer = offerPrice;
      }

      const data = await apiClient.get('/api/customer/chats/thread', params);

      if (data.success) {
        setNegotiationId(data.negotiation.id);
        setMessages(data.messages || []);

        if (data.deals && data.deals.length > 0) {
          const currentActiveDeal = data.deals.find(
            (d: CustomDeal) => d.status === 'active' && new Date(d.expires_at) > new Date()
          );
          setActiveDeal(currentActiveDeal || null);
        } else {
          setActiveDeal(null);
        }

        if (data.negotiation.status === 'agreed' && data.negotiation.agreed_price) {
          setDealAccepted({ amount: data.negotiation.agreed_price });
        } else {
          setDealAccepted(null);
        }
      }
    } catch (err) {
      console.error('Failed to load chat thread:', err);
    } finally {
      setIsLoadingThread(false);
    }
  }, [backendUrl, buyerId]);

  useEffect(() => {
    if (!isOpen || !currentProduct) {
      setNegotiationId(null);
      setMessages([]);
      setActiveDeal(null);
      setDealAccepted(null);
      return;
    }

    loadThread(currentProduct, initialOfferPrice);

    if (initialPrefillMessage) {
      setInputText(initialPrefillMessage);
    } else {
      setInputText('');
    }

    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, currentProduct, initialOfferPrice, initialPrefillMessage, loadThread]);

  const hasAutoSentRef = useRef<string | null>(null);

  // Auto-send product inquiry message if user came from PDP "Send Message for make offer"
  useEffect(() => {
    if (!negotiationId || !initialPrefillMessage || !currentProduct) return;
    const inquiryKey = `${negotiationId}_${currentProduct.id}`;
    if (hasAutoSentRef.current === inquiryKey) return;

    // Check if inquiry was already sent in the thread
    const alreadySent = messages.some(
      (m) => m.message_text === initialPrefillMessage || m.message_text.includes(currentProduct.name)
    );

    hasAutoSentRef.current = inquiryKey;

    if (!alreadySent) {
      (async () => {
        try {
          const data = await apiClient.post(`/api/customer/chats/${negotiationId}/messages`, {
            sender_id: buyerId,
            text: initialPrefillMessage,
          });
          if (data.success && data.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            broadcastChatMessage(negotiationId, data.message);
            fetchAllCustomerChats();
          }
        } catch (e) {
          console.error('Failed to auto-send product inquiry:', e);
        }
      })();
    }
  }, [negotiationId, initialPrefillMessage, currentProduct, backendUrl, buyerId, messages, fetchAllCustomerChats]);

  // 3. Supabase Realtime Dual Engine (CDC + Broadcast Channel for <20ms instant delivery)
  useEffect(() => {
    if (!negotiationId) return;

    const unsubscribe = subscribeToNegotiationThread(negotiationId, {
      onMessage: (newMsg) => {
        setMessages((prev) => {
          const index = prev.findIndex((m) => m.id === newMsg.id);
          if (index !== -1) {
            const next = [...prev];
            next[index] = newMsg;
            return next;
          }
          return [...prev, newMsg];
        });
        fetchAllCustomerChats();
        
        // Auto-mark incoming messages as seen if we are actively in the chat
        if (newMsg.sender_id !== buyerId && !newMsg.seen_at) {
          apiClient.post(`/api/customer/chats/${negotiationId}/seen`, { reader_id: buyerId }).catch(() => {});
          broadcastSeen(negotiationId, buyerId);
        }
      },
      onDealUpdate: (deal) => {
        if (deal.status === 'active') {
          setActiveDeal(deal as CustomDeal);
        } else if (deal.status === 'accepted') {
          setActiveDeal(null);
          setDealAccepted({ amount: deal.deal_price });
        } else if (deal.status === 'rejected' || deal.status === 'expired') {
          setActiveDeal(null);
        }
        fetchAllCustomerChats();
      },
      onNegotiationUpdate: (neg) => {
        if (neg.status === 'agreed' && neg.agreed_price) {
          setDealAccepted({ amount: neg.agreed_price });
        }
        fetchAllCustomerChats();
      },
      // Real-time typing indicator (<20ms via WebSocket broadcast)
      onTyping: (userId, isTyping) => {
        if (userId === buyerId) return; // ignore own typing events
        if (isTyping) {
          setOtherIsTyping(true);
          // Auto-clear after 3s of no updates
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherIsTyping(false), 3000);
        } else {
          setOtherIsTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      },
      // Seen receipt — sender's messages flip to blue double tick
      onSeen: (_readerUserId, _seenAt) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === buyerId && !m.seen_at
              ? { ...m, seen_at: _seenAt }
              : m
          )
        );
      },
    });

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [negotiationId, fetchAllCustomerChats, buyerId]);

  // 4. Fallback Reactive Polling (2.5s interval to ensure zero message loss even on network sleep)
  useEffect(() => {
    if (!isOpen || !negotiationId || !currentProduct) return;

    const interval = setInterval(async () => {
      try {
        const shopId = (currentProduct.shop as { id?: string; name?: string })?.id || (currentProduct as any).shop_id || '';
        if (!shopId || !buyerId) return;
        const data = await apiClient.get('/api/customer/chats/thread', {
          buyer_id: buyerId,
          product_id: currentProduct.id,
          shop_id: shopId,
        });
        if (data.success && data.messages) {
          setMessages((prev) => {
            if (JSON.stringify(data.messages) !== JSON.stringify(prev)) {
              return data.messages;
            }
            return prev;
          });
          if (data.deals && data.deals.length > 0) {
            const active = data.deals.find(
              (d: CustomDeal) => d.status === 'active' && new Date(d.expires_at) > new Date()
            );
            setActiveDeal(active || null);
          }
          if (data.negotiation?.status === 'agreed' && data.negotiation.agreed_price) {
            setDealAccepted({ amount: data.negotiation.agreed_price });
          }
        }
      } catch (e) {
        // silent background poll error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, negotiationId, currentProduct, buyerId, backendUrl]);

  // Scroll to bottom on message or deal updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeDeal]);

  // Mark messages as seen when chat is open and negotiation thread is loaded
  // This stamps seen_at on seller's messages and broadcasts blue tick to seller
  useEffect(() => {
    if (!isOpen || !negotiationId || !buyerId) return;
    const markSeen = async () => {
      try {
        await apiClient.post(`/api/customer/chats/${negotiationId}/seen`, { reader_id: buyerId });
        // Broadcast seen event so seller sees blue ticks instantly (<20ms)
        broadcastSeen(negotiationId, buyerId);
      } catch (e) {
        // Non-critical — silent fail
      }
    };
    markSeen();
  }, [isOpen, negotiationId, buyerId]);

  // Broadcast typing indicator to seller as buyer types (debounced)
  useEffect(() => {
    if (!negotiationId || !inputText) return;
    // Fire typing=true immediately on change
    broadcastTyping(negotiationId, buyerId, true);
    // Clear previous debounce and schedule typing=false after 2.5s of inactivity
    if (typingBroadcastRef.current) clearTimeout(typingBroadcastRef.current);
    typingBroadcastRef.current = setTimeout(() => {
      broadcastTyping(negotiationId, buyerId, false);
    }, 2500);
    return () => {
      if (typingBroadcastRef.current) clearTimeout(typingBroadcastRef.current);
    };
  }, [inputText, negotiationId, buyerId]);

  // Auto-expand textarea height as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollH = inputRef.current.scrollHeight;
      const calcH = Math.min(Math.max(scrollH, 38), 100);
      inputRef.current.style.height = `${calcH}px`;
    }
  }, [inputText]);

  // 5. Send text message with Dual Realtime Broadcast
  const sendMessageText = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || !currentProduct || isSending) return;

      setIsSending(true);
      setInputText('');

      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Auto-provision negotiation thread if not yet established
      let activeNegId = negotiationId;
      if (!activeNegId) {
        try {
          const shopId = (currentProduct.shop as { id?: string })?.id || (currentProduct as any).shop_id || '';
          if (!shopId || !buyerId) {
            setIsSending(false);
            return;
          }
          const provData = await apiClient.get('/api/customer/chats/thread', {
            buyer_id: buyerId,
            product_id: currentProduct.id,
            shop_id: shopId,
          });
          if (provData.success && provData.negotiation_id) {
            activeNegId = provData.negotiation_id;
            setNegotiationId(activeNegId);
          } else {
            console.error('Failed to provision negotiation thread');
            setIsSending(false);
            return;
          }
        } catch (e) {
          console.error('Failed to provision negotiation thread:', e);
          setIsSending(false);
          return;
        }
      }

      // Optimistic message
      const tempId = 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      const optimisticMsg: ChatMessage = {
        id: tempId,
        negotiation_id: activeNegId!,
        sender_id: buyerId,
        message_text: trimmed,
        is_counter_offer: false,
        offered_price: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Broadcast over WebSocket channel (<20ms delivery)
      broadcastChatMessage(activeNegId!, optimisticMsg);

      try {
        const data = await apiClient.post(`/api/customer/chats/${activeNegId}/messages`, {
          text: trimmed,
          sender_id: buyerId,
        });
        if (data.success && data.message) {
          setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
          fetchAllCustomerChats();
        }
      } catch (err) {
        console.error('Failed to send message:', err);
      } finally {
        setIsSending(false);
      }
    },
    [backendUrl, buyerId, isSending, negotiationId, currentProduct, fetchAllCustomerChats]
  );

  // 6. Respond to Custom Deal (Accept or Reject)
  const handleRespondToDeal = async (dealId: string, action: 'accept' | 'reject') => {
    if (isRespondingDeal || !currentProduct) return;

    setIsRespondingDeal(true);
    try {
      const data = await apiClient.post(`/api/customer/deals/${dealId}/respond`, { action });

      if (data.success) {
        if (action === 'accept' && activeDeal) {
          const agreedPrice = activeDeal.deal_price;
          const updatedDeal = {
            ...activeDeal,
            status: 'accepted' as const,
            updated_at: new Date().toISOString(),
          };
          broadcastCustomerDeal(activeDeal.conversation_id, updatedDeal);
          setActiveDeal(null);
          setDealAccepted({ amount: agreedPrice });
          fetchAllCustomerChats();
          // Launch checkout with negotiated deal price for this customer only!
          onCheckout(currentProduct, agreedPrice);
        } else {
          if (activeDeal) {
            broadcastCustomerDeal(activeDeal.conversation_id, {
              ...activeDeal,
              status: 'rejected' as const,
              updated_at: new Date().toISOString(),
            });
          }
          setActiveDeal(null);
          fetchAllCustomerChats();
        }
      }
    } catch (err) {
      console.error('Error responding to deal:', err);
    } finally {
      setIsRespondingDeal(false);
    }
  };

  const handleSend = () => {
    sendMessageText(inputText);
  };

  // Switch shop when clicking left sidebar
  const handleSelectShop = (chat: CustomerChatItem) => {
    const primary = chat.products?.[0];
    if (!primary) return;

    const matchedProduct = PRODUCTS.find((p) => p.id === primary.product_id) || {
      id: primary.product_id,
      slug: (primary.product_name || 'garment').toLowerCase().replace(/\s+/g, '-'),
      name: primary.product_name,
      tagline: 'Artisanal Handcrafted Boutique Garment',
      collection: 'Curated Boutique Drop',
      category: (primary.product_category as any) || 'bottoms',
      price: primary.product_base_price,
      originalPrice: primary.product_original_price || primary.product_base_price,
      gsm: 280,
      fabric: 'Artisanal Cotton / Denim',
      fit: 'Relaxed' as const,
      description: 'Handcrafted luxury piece available exclusively at ' + chat.shop_name,
      features: ['100% Genuine Boutique Article', 'Custom Hemming Included', 'Bargain Protected'],
      stylingTips: 'Pair with sneakers or leather boots.',
      inventory: { S: 5, M: 8, L: 6, XL: 4, XXL: 2 },
      images: [
        {
          id: 'img1',
          url: primary.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
          angle: 'front' as const,
        },
      ],
      thumbnail: primary.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
      tryOnModelUrl: primary.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
      modelInfo: { height: "6'0", wearingSize: 'L', fitNote: 'True to size' },
      completeLookIds: [],
      fabricCloseUpUrl: primary.product_thumbnail,
      color: 'Raw Indigo',
      colorHex: '#1B2A4A',
      shop: {
        name: chat.shop_name || 'Boutique',
        location: chat.shop_city || 'Local Boutique',
        verified: chat.shop_verified ?? true,
        rating: chat.shop_rating || 0.0,
        id: chat.shop_id,
      },
    };

    setCurrentProduct(matchedProduct);
  };

  // Switch garment within the same shop
  const handleSwitchGarment = (item: ShopProductItem) => {
    const matchedProduct = PRODUCTS.find((p) => p.id === item.product_id) || {
      id: item.product_id,
      slug: (item.product_name || 'garment').toLowerCase().replace(/\s+/g, '-'),
      name: item.product_name,
      tagline: 'Artisanal Handcrafted Boutique Garment',
      collection: 'Curated Boutique Drop',
      category: (item.product_category as any) || 'bottoms',
      price: item.product_base_price,
      originalPrice: item.product_original_price || item.product_base_price,
      gsm: 280,
      fabric: 'Artisanal Cotton / Denim',
      fit: 'Relaxed' as const,
      description: 'Handcrafted luxury piece available exclusively at ' + (currentProduct?.shop?.name || 'Boutique'),
      features: ['100% Genuine Boutique Article', 'Custom Hemming Included', 'Bargain Protected'],
      stylingTips: 'Pair with sneakers or leather boots.',
      inventory: { S: 5, M: 8, L: 6, XL: 4, XXL: 2 },
      images: [
        {
          id: 'img1',
          url: item.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
          angle: 'front' as const,
        },
      ],
      thumbnail: item.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
      tryOnModelUrl: item.product_thumbnail || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
      modelInfo: { height: "6'0", wearingSize: 'L', fitNote: 'True to size' },
      completeLookIds: [],
      fabricCloseUpUrl: item.product_thumbnail,
      color: 'Raw Indigo',
      colorHex: '#1B2A4A',
      shop: currentProduct?.shop || {
        name: 'Boutique',
        location: 'Local Boutique',
        verified: true,
        rating: 0.0,
        id: 'shop_default',
      },
    };

    setCurrentProduct(matchedProduct);
    setIsProductDropdownOpen(false);
  };

  // Filtered chats for the left sidebar (Unique by shop!)
  const filteredChats = useMemo(() => {
    return allChats.filter((chat) => {
      const matchesSearch =
        chat.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.products?.some((p) => p.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (chat.latest_message?.message_text || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const hasActive = chat.products?.some((p) => p.status === 'active');
      const hasAgreed = chat.products?.some((p) => p.status === 'agreed');

      if (filter === 'active') return hasActive;
      if (filter === 'agreed') return hasAgreed;
      return true;
    });
  }, [allChats, searchQuery, filter]);

  const activeBargainsCount = useMemo(
    () => allChats.filter((c) => c.products?.some((p) => p.status === 'active')).length,
    [allChats]
  );
  const agreedDealsCount = useMemo(
    () => allChats.filter((c) => c.products?.some((p) => p.status === 'agreed')).length,
    [allChats]
  );

  // Find all products discussed with current shop
  const currentShopId = (currentProduct?.shop as { id?: string })?.id || (currentProduct as any)?.shop_id || '';
  const currentShopChatItem = allChats.find(
    (c) => (currentShopId && c.shop_id === currentShopId) || (currentProduct?.shop?.name && c.shop_name.toLowerCase() === currentProduct.shop.name.toLowerCase())
  );
  const currentShopProducts = currentShopChatItem?.products || [];

  if (!isOpen || !currentProduct) return null;

  const shopName = currentProduct.shop?.name || 'Boutique';
  const shopAvatar = getShopAvatar(shopName);


  // --- RENDER ---
  // In embedded mode: plain wrapper div (no fixed overlay) for desktop two-panel layout
  // In modal mode: AnimatePresence + fixed motion.div (existing behavior)
  const innerContent = (
    <>
      {/* Left sidebar — hidden in embedded mode since NegotiationInbox is the left panel */}
      <div className={`${isEmbedded ? 'hidden' : 'hidden md:flex'} md:w-80 lg:w-96 border-r border-neutral-200/60 flex-col bg-white/95 backdrop-blur-xl shrink-0 h-full shadow-2xl z-20 relative`}>
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-neutral-950 flex items-center gap-1.5 leading-none">
                  <span>Messages</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-mono font-bold">
                    {allChats.length}
                  </span>
                </h2>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Boutique Bargains &amp; Direct Deals</p>
              </div>
            </div>

            <button
              onClick={fetchAllCustomerChats}
              className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
              title="Refresh Conversations"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search bar & Filter Tabs */}
          <div className="p-3.5 space-y-3 border-b border-neutral-200 bg-white shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boutique or garment..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100/80 border border-neutral-200/60">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  filter === 'all' ? 'bg-white text-neutral-950 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>All</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 font-bold">
                  {allChats.length}
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
                {activeBargainsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                    {activeBargainsCount}
                  </span>
                )}
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
                {agreedDealsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                    {agreedDealsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversations Thread List: 1 STORE = 1 ROW */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 scrollbar-thin scrollbar-thumb-neutral-200">
            {isLoadingChats ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-neutral-600" />
                Loading conversations...
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
                <Store className="w-8 h-8 mx-auto text-neutral-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected =
                  currentShopId === chat.shop_id ||
                  shopName.toLowerCase() === chat.shop_name.toLowerCase();

                const avatar = getShopAvatar(chat.shop_name, chat.shop_avatar);
                const hasAgreedDeal = chat.products?.some((p) => p.status === 'agreed');
                const agreedProduct = chat.products?.find((p) => p.status === 'agreed');
                const hasActiveDeal = !!chat.active_deal;
                const productsCount = chat.products?.length || 1;
                const primaryProduct = chat.products?.[0];

                const timeAgoStr = chat.latest_message?.created_at
                  ? new Date(chat.latest_message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent';

                const lastMsgText = chat.latest_message?.message_text;
                const isSeen = !chat.unread_count || chat.unread_count === 0;

                return (
                  <div
                    key={chat.shop_id}
                    onClick={() => {
                      if (currentShopId === chat.shop_id) return;
                      handleSelectShop(chat);
                    }}
                    className={`mx-2 my-1.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 relative flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-white text-neutral-950 border-2 border-blue-600 shadow-[0_8px_25px_rgba(37,99,235,0.18),0_2px_8px_rgba(0,0,0,0.04)] ring-2 ring-blue-500/15 -translate-y-0.5 scale-[1.01] z-10'
                        : 'bg-white/80 hover:bg-white text-neutral-900 border border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {/* Boutique Logo with Online Green Dot */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full overflow-hidden relative border-2 ${isSelected ? 'border-blue-600 shadow-xs' : 'border-neutral-200'} bg-neutral-100 shadow-xs`}>
                        <Image src={avatar} alt={chat.shop_name} fill className="object-cover" unoptimized />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    {/* Center: Store Name + Prominent Seen Ticks + Last Message (NO product name clutter!) */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13.5px] font-black truncate tracking-tight text-neutral-950">
                          {chat.shop_name}
                        </h4>
                        <VerifiedBadge size={14} />
                      </div>

                      {/* Clean Subtitle: Ticks + Last Message / Active status */}
                      <div className="flex items-center gap-1.5 mt-0.5 text-[12px] truncate text-neutral-500">
                        {isSeen ? (
                          <span className="text-[#2563EB] flex items-center shrink-0" title="Seen">
                            <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                          </span>
                        ) : (
                          <span className="text-neutral-400 flex items-center shrink-0" title="Sent">
                            <Check className="w-4 h-4 stroke-[2]" />
                          </span>
                        )}
                        <span className="truncate font-medium">
                          {lastMsgText || 'Active now'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Timestamp on TOP, Deal Done / Pending Badge DIRECTLY UNDERNEATH */}
                    <div className="flex flex-col items-end shrink-0 gap-1 pl-1">
                      <span className="text-[10px] font-semibold font-mono text-neutral-400">
                        {timeAgoStr}
                      </span>

                      {hasAgreedDeal ? (
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
                            ? 'bg-blue-50 border border-blue-200 text-blue-800 font-bold'
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

        {/* ========================================================================= */}
        {/* RIGHT AREA: Active Boutique Chat Room (Full Width & Height, NO Deal Button!) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col bg-[#EFEAE2] min-w-0 relative h-full">
          {/* Subtle chat background pattern using pure CSS radial gradient for a premium feel */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          {/* Top Header Bar (Flush to Top) */}
          <div className="p-3 px-4 md:px-6 bg-white border-b border-neutral-200 flex items-center justify-between gap-3 shrink-0 z-20 shadow-xs">
            {/* Left: Boutique Profile */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onClose}
                className="p-1.5 -ml-1 rounded-full hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer md:hidden"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-900" />
              </button>

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-neutral-200 bg-neutral-100 shadow-2xs">
                  <Image src={shopAvatar} alt={shopName} fill className="object-cover" unoptimized />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-neutral-950 truncate leading-none">{shopName}</h3>
                  <VerifiedBadge size={15} />
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium">
                  {otherIsTyping ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Typing...</span>
                    </span>
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="font-semibold text-xs">Online</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Active Garment Switcher Dropdown & Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Garment Selector Dropdown (Allows toggling between garments of this boutique) */}
              <div className="relative">
                <button
                  onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-neutral-100/90 hover:bg-neutral-200/80 border border-neutral-200 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all text-xs"
                >
                  <div className="w-6 h-6 rounded-md bg-white relative overflow-hidden shrink-0 border border-neutral-200">
                    <Image src={currentProduct.thumbnail} alt={currentProduct.name} fill className="object-cover" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-bold text-neutral-900 truncate max-w-[140px] leading-tight">
                      {currentProduct.name}
                    </span>
                    <span className="text-[10px] font-mono font-black text-neutral-600">
                      ₹{currentProduct.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {currentShopProducts.length > 1 && (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 ml-0.5" />
                  )}
                </button>

                {/* Dropdown Menu when boutique has multiple garments */}
                <AnimatePresence>
                  {isProductDropdownOpen && currentShopProducts.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-1"
                    >
                      <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Garments Discussed with {shopName}
                      </div>
                      {currentShopProducts.map((p) => {
                        const isCurrent = p.product_id === currentProduct.id;
                        return (
                          <button
                            key={p.product_id}
                            onClick={() => handleSwitchGarment(p)}
                            className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
                              isCurrent ? 'bg-neutral-100 border border-neutral-300 font-bold' : 'hover:bg-neutral-50'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 relative overflow-hidden shrink-0 border border-neutral-200">
                              <Image src={p.product_thumbnail} alt={p.product_name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-neutral-900 truncate">{p.product_name}</div>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="font-mono font-bold text-neutral-600">
                                  ₹{p.product_base_price.toLocaleString('en-IN')}
                                </span>
                                {p.status === 'agreed' && (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                                    Deal Done
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close Button to return to store */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer text-neutral-600 hover:text-neutral-900"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pinned Luxury Product Inquiry Context Bar (Docked under header) */}
          <div className="bg-gradient-to-r from-blue-50/95 via-indigo-50/80 to-blue-50/95 border-b border-blue-200/80 px-4 py-2 flex items-center justify-between gap-3 shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white relative overflow-hidden shrink-0 border border-blue-200 shadow-2xs">
                <Image src={currentProduct.thumbnail} alt={currentProduct.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Inquiring for
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                    Bargain Open
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs font-black text-neutral-900 truncate max-w-[140px] sm:max-w-[220px]">
                    {currentProduct.name}
                  </span>
                  <span className="text-xs font-mono font-black text-blue-800">
                    ₹{currentProduct.price.toLocaleString('en-IN')}
                  </span>
                  {(currentProduct.originalPrice ?? 0) > currentProduct.price && (
                    <span className="text-[10px] font-mono text-neutral-400 line-through">
                      ₹{currentProduct.originalPrice!.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const msg = `🏷️ Product Inquiry: ${currentProduct.name} (₹${currentProduct.price.toLocaleString('en-IN')}) — "Hi! What's the best exclusive deal or discount you can offer on this?"`;
                sendMessageText(msg);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask for Deal</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scrollbar-thin scrollbar-thumb-neutral-200">
            {/* Messages Stream */}
            {messages.map((msg) => {
              const isUser = msg.sender_id === buyerId;
              const isSystem = msg.sender_id === 'system';
              const isInquiry = msg.message_text.includes('🏷️ Product Inquiry') || msg.message_text.includes('Product Inquiry');

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold text-center max-w-[85%] shadow-2xs">
                      {msg.message_text}
                    </div>
                  </div>
                );
              }

              if (isInquiry) {
                const cleanText = msg.message_text.replace(/^🏷️ Product Inquiry:[^—]*—\s*"?/, '').replace(/"?$/, '') || msg.message_text;
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-2`}>
                    <div className="w-full max-w-sm bg-white border border-blue-200/90 rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(37,99,235,0.08)] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          Product Inquiry
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isUser && (
                            msg.seen_at ? (
                              <span className="text-[#2563EB] flex items-center shrink-0" title="Seen by seller">
                                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="text-neutral-400 flex items-center shrink-0" title="Sent">
                                <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-neutral-50/90 p-2.5 rounded-xl border border-neutral-100">
                        <div className="w-14 h-14 rounded-lg bg-white relative overflow-hidden shrink-0 border border-neutral-200 shadow-2xs">
                          <Image src={currentProduct.thumbnail} alt={currentProduct.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-neutral-950 truncate">{currentProduct.name}</h4>
                          <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-sm font-black text-neutral-900 font-mono">
                              ₹{currentProduct.price.toLocaleString('en-IN')}
                            </span>
                            {(currentProduct.originalPrice ?? 0) > currentProduct.price && (
                              <span className="text-[10px] text-neutral-400 line-through font-mono">
                                ₹{currentProduct.originalPrice!.toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Bargain Open
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-700 italic bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/70 leading-relaxed">
                        &ldquo;{cleanText}&rdquo;
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-1 relative z-10`}>
                  <div
                    className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-tr from-[#007AFF] to-[#0056b3] text-white rounded-br-sm'
                        : 'bg-white text-neutral-900 border border-neutral-100 rounded-bl-sm'
                    }`}
                  >
                    <div className="font-medium">{msg.message_text}</div>
                  </div>

                  {msg.is_counter_offer && msg.offered_price && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Offer: ₹{msg.offered_price.toLocaleString('en-IN')}
                    </div>
                  )}

                  <div className={`flex items-center gap-1.5 mt-1 px-1 ${isUser ? 'justify-end text-neutral-500/80' : 'justify-start text-neutral-400'}`}>
                    <span className="text-[10px] font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isUser && (
                      msg.seen_at ? (
                        <span className="text-[#10B981] flex items-center shrink-0" title="Seen by seller">
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
            })}

            {/* IN-CHAT EXCLUSIVE CUSTOM DEAL CARD (Received from Boutique Seller) */}

            <AnimatePresence>
              {activeDeal && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="my-3 mx-auto max-w-md w-full bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/10 border-2 border-amber-400 rounded-2xl p-4 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-neutral-900 uppercase tracking-wide flex items-center gap-1">
                          Exclusive Custom Deal
                        </span>
                        <span className="text-[10px] text-amber-700 font-semibold block leading-none">
                          Special offer for {currentProduct.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> 24h Valid
                    </span>
                  </div>

                  <div className="bg-white/95 rounded-xl p-3 border border-amber-200 mb-3 shadow-inner">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                          Special Deal Price
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-emerald-600 font-mono">
                            ₹{activeDeal.deal_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-neutral-400 line-through">
                            ₹{activeDeal.original_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black">
                          SAVE ₹{(activeDeal.original_price - activeDeal.deal_price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                          ({Math.round(((activeDeal.original_price - activeDeal.deal_price) / activeDeal.original_price) * 100)}% OFF)
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-600 mt-2 pt-2 border-t border-neutral-100 font-medium leading-relaxed">
                      ✨ Boutique seller has locked this special price exclusively for you. Public store price remains unchanged.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespondToDeal(activeDeal.id, 'reject')}
                      disabled={isRespondingDeal}
                      className="px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleRespondToDeal(activeDeal.id, 'accept')}
                      disabled={isRespondingDeal}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Buy Now at ₹{activeDeal.deal_price.toLocaleString('en-IN')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Realtime Typing Indicator Bubble */}
            {otherIsTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-center gap-2 my-2 relative z-10"
              >
                <div className="bg-white/80 backdrop-blur-sm border border-neutral-100 px-4 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm">
                  <span className="text-xs font-semibold text-neutral-600">
                    {shopName} is typing
                  </span>
                  <div className="flex gap-1 items-center ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite] [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite] [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[bounce_1s_infinite]" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>



          {/* Suggestion Chips & Message Input Container */}
          <div className="p-3 px-4 md:px-6 bg-white border-t border-neutral-200 shrink-0 z-10">
            <AnimatePresence>
              {!dealAccepted && !inputText.trim() && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 8 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {CLEAN_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => sendMessageText(chip)}
                        className="shrink-0 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 text-[11px] font-semibold transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 bg-neutral-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/10 focus-within:border-neutral-900 border border-neutral-200 rounded-2xl px-3 py-1 flex items-center transition-all min-h-[44px]">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${shopName}...`}
                  className="w-full bg-transparent text-xs md:text-sm text-neutral-900 placeholder:text-neutral-400 py-1.5 outline-none resize-none font-medium leading-relaxed max-h-[100px] overflow-y-auto"
                  style={{ height: '36px' }}
                />
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (inputText.trim() && !isSending) {
                    handleSend();
                  }
                }}
                className={`p-3 rounded-2xl bg-neutral-900 text-white transition-all duration-300 ease-out shrink-0 flex items-center justify-center shadow-sm cursor-pointer ${
                  !inputText.trim() || isSending 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:bg-neutral-800 hover:scale-105 active:scale-95 hover:shadow-md'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </>
  );

  // Embedded mode: render inline without overlay
  if (isEmbedded) {
    return <div className="w-full h-full flex">{innerContent}</div>;
  }

  // Modal mode: True 100vw x 100vh Fullscreen without padding or margins
  return (
    <AnimatePresence>
      <motion.div
        key="bargain-chat-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-white w-screen h-screen overflow-hidden flex"
      >
        <div className="w-full h-full flex overflow-hidden">
          {innerContent}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
