'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Package,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight,
  Volume2,
  VolumeX,
  ExternalLink,
  ShoppingBag,
  UserCheck
} from 'lucide-react';
import { sellerAudio } from '@/lib/seller-audio';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';

export interface SellerNotification {
  id: string;
  shop_id: string;
  user_id?: string;
  type: string; // 'new_order', 'deal_accepted', 'boost_active', 'payout_credited', 'system'
  title: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

interface SellerNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  shopId?: string;
  onNavigateToTab: (tab: string, referenceId?: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const SellerNotificationsDrawer: React.FC<SellerNotificationsDrawerProps> = ({
  isOpen,
  onClose,
  userId: propUserId,
  shopId,
  onNavigateToTab,
  onUnreadCountChange,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isFirstLoadRef = useRef(true);
  const prevUnreadRef = useRef(0);

  const fetchNotifications = async (silent = false) => {
    if (!shopId && !userId) {
      if (!silent) setIsLoading(false);
      return;
    }
    try {
      if (!silent && notifications.length === 0) setIsLoading(true);
      const backendUrl = getBackendUrl();
      const queryParam = shopId ? `shop_id=${encodeURIComponent(shopId)}` : `user_id=${encodeURIComponent(userId)}`;
      const res = await fetch(`${backendUrl}/api/seller/notifications?${queryParam}`, {
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n: SellerNotification) => !n.is_read).length;
        onUnreadCountChange?.(unread);

        // Sound alert if new notification arrives in background
        if (!isFirstLoadRef.current && unread > prevUnreadRef.current && soundEnabled) {
          sellerAudio.playMessageChime();
        }
        prevUnreadRef.current = unread;
        isFirstLoadRef.current = false;
      }
    } catch (err) {
      console.error('Failed to fetch seller notifications:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Immediate fetch on mount + periodic background poll every 4s
  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [shopId, userId]);

  // When drawer opens, refresh immediately
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(false);
    }
  }, [isOpen]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const backendUrl = getBackendUrl();
      await fetch(`${backendUrl}/api/seller/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({}),
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onUnreadCountChange?.(0);
      if (soundEnabled) sellerAudio.playMessageChime();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  // Mark single as read & navigate
  const handleNotificationClick = async (notif: SellerNotification) => {
    try {
      if (!notif.is_read) {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/seller/notifications/mark-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ id: notif.id }),
        });

        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        const remainingUnread = notifications.filter(n => !n.is_read && n.id !== notif.id).length;
        onUnreadCountChange?.(remainingUnread);
      }

      if (soundEnabled) sellerAudio.playMessageChime();

      // Navigation routing based on notification type
      onClose();
      if (notif.type.includes('follower')) {
        onNavigateToTab('profile', notif.reference_id);
      } else if (notif.type.includes('order')) {
        onNavigateToTab('orders', notif.reference_id);
      } else if (notif.type.includes('deal') || notif.type.includes('chat')) {
        onNavigateToTab('chat', notif.reference_id);
      } else if (notif.type.includes('boost') || notif.type.includes('reel')) {
        onNavigateToTab('reels', notif.reference_id);
      } else if (notif.type.includes('ad')) {
        onNavigateToTab('ads', notif.reference_id);
      } else {
        onNavigateToTab('dashboard');
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const getIconForType = (type: string) => {
    if (type.includes('follower')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-200 shadow-xs">
          <UserCheck className="w-4 h-4" />
        </div>
      );
    }
    if (type.includes('order')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
          <Package className="w-4 h-4" />
        </div>
      );
    }
    if (type.includes('deal') || type.includes('chat')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
          <Zap className="w-4 h-4" />
        </div>
      );
    }
    if (type.includes('boost') || type.includes('reel')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
          <Sparkles className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
        <Bell className="w-4 h-4" />
      </div>
    );
  };

  if (!isOpen) return null;

  const unreadTotal = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-md h-full bg-white border-l border-neutral-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-neutral-900">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-500" />
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-950">Notifications</h3>
              <p className="text-[11px] text-neutral-500">
                {unreadTotal > 0 ? `${unreadTotal} new updates` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                soundEnabled
                  ? 'bg-neutral-100 border-neutral-200 text-amber-600 hover:text-neutral-950'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-400'
              }`}
              title={soundEnabled ? 'Mute Sound Cues' : 'Unmute Sound Cues'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Drawer */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Actions */}
        {notifications.length > 0 && unreadTotal > 0 && (
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">
              Unread boutique alerts
            </span>
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-neutral-200">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-neutral-400">
              Loading boutique alerts...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
                <Bell className="w-6 h-6 stroke-[1.2]" />
              </div>
              <p className="text-xs font-bold text-neutral-700">No notifications yet</p>
              <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                Orders, customer deal acceptances and campaign updates will appear here in real-time.
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                  notif.is_read
                    ? 'bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/70 text-neutral-600'
                    : 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs text-neutral-900'
                }`}
              >
                {getIconForType(notif.type)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold truncate ${
                        notif.is_read ? 'text-neutral-700' : 'text-neutral-950'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <span className="text-amber-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>View details</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-white/95 backdrop-blur-md shrink-0 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Mitreno Seller Alert Engine</span>
          <span className="text-emerald-600 font-medium">● Connected live</span>
        </div>
      </div>
    </div>
  );
};
