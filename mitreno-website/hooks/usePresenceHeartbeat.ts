'use client';

import { useEffect, useRef } from 'react';

interface PresenceConfig {
  role?: 'customer' | 'seller';
  userId?: string | null;
  shopId?: string | null;
  city?: string;
  intervalMs?: number;
}

const SESSION_KEY = 'mitreno_presence_session_id';

function getOrGenerateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * usePresenceHeartbeat sends an ultra-lightweight heartbeat ping to the backend
 * every 30-45 seconds while the user is actively viewing the marketplace.
 */
export function usePresenceHeartbeat(config: PresenceConfig = {}) {
  const {
    role = 'customer',
    userId = null,
    shopId = null,
    city = 'India',
    intervalMs = 35000,
  } = config;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = async () => {
    if (typeof window === 'undefined') return;
    try {
      const sessionId = getOrGenerateSessionId();
      const currentRoute = window.location.pathname || '/';
      const isMobile = window.innerWidth <= 768;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

      await fetch(`${backendUrl}/api/telemetry/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role,
          shop_id: shopId,
          current_route: currentRoute,
          device: isMobile ? 'mobile' : 'desktop',
          city,
        }),
      });
    } catch {
      // Background presence heartbeat silently catches network delays
    }
  };

  useEffect(() => {
    // Ping immediately on mount / route navigation
    sendHeartbeat();

    // Recurring pulse timer
    timerRef.current = setInterval(sendHeartbeat, intervalMs);

    // Also ping when window regains focus
    const handleFocus = () => sendHeartbeat();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('focus', handleFocus);
    };
  }, [role, userId, shopId, intervalMs]);
}
