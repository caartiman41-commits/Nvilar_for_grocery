import { apiClient } from '../api/client';

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

  // 6. Fetch Chat Thread messages
  getChatThread: async (negotiationId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get('/customer/chats/thread', {
        params: { negotiation_id: negotiationId },
      });
      return res.data?.messages || [];
    } catch {
      return [];
    }
  },

  // 7. Post Chat Message
  postChatMessage: async (
    negotiationId: string,
    messageText: string,
    isCounter: boolean = false,
    offeredPrice?: number
  ): Promise<any | null> => {
    try {
      const res = await apiClient.post(`/customer/chats/${negotiationId}/messages`, {
        message_text: messageText,
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
};
