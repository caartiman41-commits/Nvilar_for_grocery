import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.grezto.in';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg4MTgzMTA4LCJleHAiOjIxMDM1NDMxMDh9.8uRYURfFf02E7Ncz-rZ3cDw2UbDSY6H8K52q8TNxnyQ';

// Singleton Supabase Client with Realtime enabled
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

export interface RealtimeChatMessage {
  id: string;
  negotiation_id: string;
  sender_id: string;
  message_text: string;
  is_counter_offer: boolean;
  offered_price: number | null;
  seen_at?: string | null;
  created_at: string;
}

export interface RealtimeCustomerDeal {
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
  updated_at: string;
}

/**
 * Broadcasts a new message directly over Supabase Realtime WebSocket for sub-20ms instant delivery.
 */
export async function broadcastChatMessage(negotiationId: string, message: RealtimeChatMessage) {
  try {
    const channelName = `negotiation-${negotiationId}`;
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message,
    });
  } catch (err) {
    console.warn('[Realtime Broadcast Error]:', err);
  }
}

/**
 * Broadcasts a custom deal update directly over WebSocket.
 */
export async function broadcastCustomerDeal(negotiationId: string, deal: RealtimeCustomerDeal) {
  try {
    const channelName = `negotiation-${negotiationId}`;
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'deal_update',
      payload: deal,
    });
  } catch (err) {
    console.warn('[Realtime Broadcast Error]:', err);
  }
}

/**
 * Broadcasts a "typing" presence event to the other party in real time.
 * No DB write — pure ephemeral WebSocket broadcast (<20ms).
 */
export async function broadcastTyping(negotiationId: string, userId: string, isTyping: boolean) {
  try {
    const channelName = `negotiation-${negotiationId}`;
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, is_typing: isTyping },
    });
  } catch (err) {
    // Typing broadcast errors are non-critical — silent fail
  }
}

/**
 * Broadcasts a "seen" event over WebSocket so the sender instantly sees blue ticks
 * without waiting for a full poll cycle.
 */
export async function broadcastSeen(negotiationId: string, readerUserId: string) {
  try {
    const channelName = `negotiation-${negotiationId}`;
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'seen',
      payload: { reader_id: readerUserId, seen_at: new Date().toISOString() },
    });
  } catch (err) {
    // Non-critical
  }
}

/**
 * Subscribes to realtime updates for a specific negotiation thread.
 * Listens for new messages, counter-offers, custom deals, typing events, and seen receipts via BOTH:
 * 1. Supabase Postgres Changes (CDC)
 * 2. Supabase Realtime Broadcast (sub-20ms WebSocket)
 */
export function subscribeToNegotiationThread(
  negotiationId: string,
  callbacks: {
    onMessage?: (message: RealtimeChatMessage) => void;
    onDealUpdate?: (deal: RealtimeCustomerDeal) => void;
    onNegotiationUpdate?: (payload: any) => void;
    onTyping?: (userId: string, isTyping: boolean) => void;
    onSeen?: (readerUserId: string, seenAt: string) => void;
  }
) {
  const channelName = `negotiation-${negotiationId}`;
  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
    },
  });

  // Track received message IDs to prevent duplicate triggers from dual CDC + Broadcast
  const seenMsgIds = new Set<string>();

  // 1. WebSocket Direct Broadcast Listener (<20ms)
  if (callbacks.onMessage) {
    channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
      if (payload && payload.id && !seenMsgIds.has(payload.id)) {
        seenMsgIds.add(payload.id);
        callbacks.onMessage!(payload as RealtimeChatMessage);
      }
    });
  }

  if (callbacks.onDealUpdate) {
    channel.on('broadcast', { event: 'deal_update' }, ({ payload }) => {
      if (payload && callbacks.onDealUpdate) {
        callbacks.onDealUpdate(payload as RealtimeCustomerDeal);
      }
    });
  }

  // Typing indicator — ephemeral broadcast, no DB
  if (callbacks.onTyping) {
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload && callbacks.onTyping) {
        callbacks.onTyping(payload.user_id, payload.is_typing);
      }
    });
  }

  // Seen receipt — broadcast so sender flips to blue ticks instantly
  if (callbacks.onSeen) {
    channel.on('broadcast', { event: 'seen' }, ({ payload }) => {
      if (payload && callbacks.onSeen) {
        callbacks.onSeen(payload.reader_id, payload.seen_at);
      }
    });
  }

  // 2. Postgres CDC Change Listener (Database Level)
  if (callbacks.onMessage) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `negotiation_id=eq.${negotiationId}`,
      },
      (payload) => {
        if (payload.new && callbacks.onMessage) {
          const msg = payload.new as RealtimeChatMessage;
          if (!seenMsgIds.has(msg.id)) {
            seenMsgIds.add(msg.id);
            callbacks.onMessage(msg);
          }
        }
      }
    );
  }

  if (callbacks.onDealUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'customer_deals',
        filter: `conversation_id=eq.${negotiationId}`,
      },
      (payload) => {
        if (payload.new && callbacks.onDealUpdate) {
          callbacks.onDealUpdate(payload.new as RealtimeCustomerDeal);
        }
      }
    );
  }

  if (callbacks.onNegotiationUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'negotiations',
        filter: `id=eq.${negotiationId}`,
      },
      (payload) => {
        if (payload.new && callbacks.onNegotiationUpdate) {
          callbacks.onNegotiationUpdate(payload.new);
        }
      }
    );
  }

  channel.subscribe((status) => {
    // Channel is subscribed and active
  });

  return () => {
    supabase.removeChannel(channel);
  };
}

