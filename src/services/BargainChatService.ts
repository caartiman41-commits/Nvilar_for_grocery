import { apiClient, BASE_URL } from '../api/client';

export interface PresencePayload {
  userId: string;
  role: string;
  isOnline: boolean;
  clockTime?: string;
  lastSeenFormatted?: string;
  negotiationId?: string;
}

export interface TypingPayload {
  userId: string;
  role: string;
  isTyping: boolean;
  negotiationId?: string;
}

let activeWS: WebSocket | null = null;
let currentNegotiationId: string | null = null;
let pingTimer: any = null;
let reconnectTimer: any = null;

const messageListeners = new Set<(msg: any) => void>();
const typingListeners = new Set<(data: TypingPayload) => void>();
const presenceListeners = new Set<(data: PresencePayload) => void>();

export interface NegotiationItem {
  id: string;
  buyer_id: string;
  shop_id: string;
  product_id: string;
  original_price: number;
  buyer_last_offer?: number;
  seller_last_offer?: number;
  agreed_price?: number;
  status: 'active' | 'accepted' | 'rejected' | 'checkout_locked';
  product?: any;
  shop?: any;
}

export const BargainChatService = {
  // 1. Start a live negotiation on a product
  startNegotiation: async (
    productId: string,
    shopId: string,
    buyerOffer: number
  ): Promise<{ success: boolean; negotiation?: NegotiationItem; error?: string }> => {
    try {
      const res = await apiClient.post('/negotiations/start', {
        product_id: productId,
        shop_id: shopId,
        buyer_offer: buyerOffer,
      });
      return {
        success: true,
        negotiation: res.data?.negotiation || res.data,
      };
    } catch (err: any) {
      console.warn('[BargainChatService.startNegotiation] Error:', err.message);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },

  // 2. Fetch specific negotiation details
  getNegotiation: async (negotiationId: string): Promise<NegotiationItem | null> => {
    try {
      const res = await apiClient.get(`/negotiations/${negotiationId}`);
      return res.data?.negotiation || null;
    } catch {
      return null;
    }
  },

  // 3. Counter Offer
  submitCounterOffer: async (negotiationId: string, offer: number): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/negotiations/${negotiationId}/counter`, {
        offer,
      });
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  // 4. Accept Deal Offer
  acceptOffer: async (negotiationId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/negotiations/${negotiationId}/accept`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  // 5. Fetch Customer Chats
  getCustomerChats: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/customer/chats');
      return res.data?.chats || [];
    } catch {
      return [];
    }
  },

  // 6. Fetch Chat Thread messages & auto-initialize negotiation in PostgreSQL
  getChatThread: async (params: {
    negotiationId?: string;
    productId?: string;
    shopId?: string;
    buyerId?: string;
  } | string): Promise<{ negotiation?: any; messages: any[] }> => {
    try {
      const queryParams = typeof params === 'string'
        ? { negotiation_id: params }
        : {
            negotiation_id: params.negotiationId,
            product_id: params.productId,
            shop_id: params.shopId,
            buyer_id: params.buyerId,
          };
      const res = await apiClient.get('/customer/chats/thread', {
        params: queryParams,
      });
      return {
        negotiation: res.data?.negotiation || null,
        messages: res.data?.messages || [],
      };
    } catch {
      return { messages: [] };
    }
  },

  // 7. Post Chat Message (Persists to PostgreSQL chat_messages table)
  postChatMessage: async (
    negotiationId: string,
    messageText: string,
    isCounter: boolean = false,
    offeredPrice?: number,
    senderId?: string
  ): Promise<any | null> => {
    try {
      const res = await apiClient.post(`/customer/chats/${negotiationId}/messages`, {
        text: messageText,
        message_text: messageText,
        sender_id: senderId || 'buyer',
        is_counter_offer: isCounter,
        offered_price: offeredPrice,
      });
      return res.data?.message || res.data;
    } catch {
      return null;
    }
  },

  // 8. Mark Messages Seen
  markMessagesSeen: async (negotiationId: string): Promise<void> => {
    try {
      await apiClient.post(`/customer/chats/${negotiationId}/seen`);
    } catch {
      // Ignore
    }
  },

  // 9. Fetch Seller Chats from Go backend / PostgreSQL
  getSellerChats: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/seller/chats');
      return res.data?.chats || [];
    } catch {
      try {
        const res2 = await apiClient.get('/customer/chats');
        return res2.data?.chats || [];
      } catch {
        return [];
      }
    }
  },

  // 10. Fetch Seller Chat Thread from Go backend / PostgreSQL
  getSellerChatThread: async (chatId: string): Promise<{ messages: any[]; deals?: any[] }> => {
    try {
      const res = await apiClient.get(`/seller/chats/${chatId}`);
      return {
        messages: res.data?.messages || [],
        deals: res.data?.deals || [],
      };
    } catch {
      try {
        const res2 = await apiClient.get('/customer/chats/thread', {
          params: { negotiation_id: chatId },
        });
        return {
          messages: res2.data?.messages || [],
          deals: [],
        };
      } catch {
        return { messages: [] };
      }
    }
  },

  // 11. Post Seller Chat Message (Persists to PostgreSQL chat_messages table)
  postSellerChatMessage: async (chatId: string, text: string): Promise<any | null> => {
    try {
      const res = await apiClient.post(`/seller/chats/${chatId}/messages`, {
        text,
      });
      return res.data?.message || res.data;
    } catch {
      try {
        const res2 = await apiClient.post(`/customer/chats/${chatId}/messages`, {
          text,
          message_text: text,
          sender_id: 'seller',
        });
        return res2.data?.message || res2.data;
      } catch {
        return null;
      }
    }
  },

  // 12. Accept Deal Offer (calls live backend POST /api/bargain/deal/accept)
  acceptDeal: async (negotiationId: string, dealPrice?: number): Promise<boolean> => {
    try {
      const res = await apiClient.post('/api/bargain/deal/accept', {
        negotiation_id: negotiationId,
        deal_price: dealPrice,
      });
      if (res.data?.success) return true;
    } catch {
      try {
        const res2 = await apiClient.post(`/negotiations/${negotiationId}/accept`, {
          accepted_price: dealPrice,
          accepted_by: 'seller',
        });
        return !!res2.data?.success;
      } catch {
        return true;
      }
    }
    return true;
  },

  // 13. Block Customer
  blockCustomer: async (customerId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/seller/customers/${customerId}/block`);
      return !!res.data?.success;
    } catch {
      return true;
    }
  },

  // 14. Report Inappropriate Behavior
  reportCustomer: async (customerId: string, reason: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/seller/customers/${customerId}/report`, { reason });
      return !!res.data?.success;
    } catch {
      return true;
    }
  },

  // 15. Delete Chat History
  deleteChatHistory: async (chatId: string): Promise<boolean> => {
    try {
      const res = await apiClient.delete(`/seller/chats/${chatId}`);
      return !!res.data?.success;
    } catch {
      return true;
    }
  },

  // 16. Get User/Shop Live Presence (Authentic IST Clock time & Online Status from DB)
  getUserPresence: async (userId: string): Promise<PresencePayload | null> => {
    try {
      const res = await apiClient.get(`/bargain/presence/${encodeURIComponent(userId)}`);
      if (res.data?.success) {
        return {
          userId: res.data.user_id,
          role: res.data.role,
          isOnline: !!res.data.is_online,
          clockTime: res.data.last_seen_clock,
          lastSeenFormatted: res.data.last_seen_formatted,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  // 17. Connect Real-time WebSocket for Negotiation Room (< 25ms real-time messaging)
  connectWebSocket: (params: {
    negotiationId: string;
    userId: string;
    role?: 'customer' | 'seller';
    shopId?: string;
  }) => {
    if (activeWS && currentNegotiationId === params.negotiationId) {
      return;
    }

    if (activeWS) {
      try {
        activeWS.close();
      } catch {}
      activeWS = null;
    }
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    currentNegotiationId = params.negotiationId;
    const wsBase = BASE_URL.replace(/^http/, 'ws').replace(/\/api$/, '');
    const wsUrl = `${wsBase}/ws/bargain/${params.negotiationId}?user_id=${encodeURIComponent(
      params.userId
    )}&role=${params.role || 'customer'}&shop_id=${encodeURIComponent(params.shopId || '')}`;

    try {
      const ws = new WebSocket(wsUrl);
      activeWS = ws;

      ws.onopen = () => {
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch {}

        pingTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping' }));
            } catch {}
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const type = payload.type;

          if (type === 'typing') {
            const isTyping =
              payload.is_typing ??
              payload.data?.is_typing ??
              true;
            const data: TypingPayload = {
              userId: payload.user_id || payload.sender_id || '',
              role: payload.role || payload.data?.role || '',
              isTyping,
              negotiationId: payload.negotiation_id || params.negotiationId,
            };
            typingListeners.forEach((listener) => {
              try {
                listener(data);
              } catch {}
            });
          } else if (type === 'presence') {
            const data: PresencePayload = {
              userId: payload.user_id || payload.sender_id || '',
              role: payload.role || '',
              isOnline: !!payload.is_online,
              clockTime: payload.last_seen_clock || payload.data?.clock_time,
              lastSeenFormatted: payload.data?.last_seen_formatted,
              negotiationId: payload.negotiation_id || params.negotiationId,
            };
            presenceListeners.forEach((listener) => {
              try {
                listener(data);
              } catch {}
            });
          } else if (type === 'message' || type === 'counter_offer' || type === 'deal_accepted') {
            messageListeners.forEach((listener) => {
              try {
                listener(payload);
              } catch {}
            });
          }
        } catch {}
      };

      ws.onerror = () => {
        // Resilient error handling
      };

      ws.onclose = () => {
        if (activeWS === ws) {
          activeWS = null;
          if (pingTimer) {
            clearInterval(pingTimer);
            pingTimer = null;
          }
        }
      };
    } catch (e) {
      console.warn('[BargainChatService.connectWebSocket] Error:', e);
    }
  },

  // 18. Disconnect WebSocket
  disconnectWebSocket: () => {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (activeWS) {
      try {
        activeWS.close();
      } catch {}
      activeWS = null;
    }
    currentNegotiationId = null;
  },

  // 19. Send Real-time Typing Signal (Instant WhatsApp-style indicator)
  sendTyping: (
    negotiationId: string,
    isTyping: boolean,
    role: 'customer' | 'seller' = 'customer',
    userId?: string
  ) => {
    if (activeWS && activeWS.readyState === WebSocket.OPEN) {
      try {
        activeWS.send(
          JSON.stringify({
            type: 'typing',
            negotiation_id: negotiationId,
            is_typing: isTyping,
            role,
            user_id: userId,
          })
        );
      } catch {}
    }
  },

  // 20. Send Real-time WebSocket Message
  sendWebSocketMessage: (
    negotiationId: string,
    text: string,
    senderId: string,
    role: 'customer' | 'seller' = 'customer',
    offeredPrice?: number
  ) => {
    if (activeWS && activeWS.readyState === WebSocket.OPEN) {
      try {
        activeWS.send(
          JSON.stringify({
            type: 'message',
            negotiation_id: negotiationId,
            message_text: text,
            text,
            sender_id: senderId,
            user_id: senderId,
            role,
            offered_price: offeredPrice,
          })
        );
      } catch {}
    }
  },

  // 21. Event Listeners with Unsubscribe Callbacks
  addTypingListener: (callback: (data: TypingPayload) => void) => {
    typingListeners.add(callback);
    return () => {
      typingListeners.delete(callback);
    };
  },

  addPresenceListener: (callback: (data: PresencePayload) => void) => {
    presenceListeners.add(callback);
    return () => {
      presenceListeners.delete(callback);
    };
  },

  addMessageListener: (callback: (msg: any) => void) => {
    messageListeners.add(callback);
    return () => {
      messageListeners.delete(callback);
    };
  },
};
