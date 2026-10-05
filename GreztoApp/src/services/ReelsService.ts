import { apiClient } from '../api/client';

export interface BackendReel {
  id: string;
  shop_id: string;
  video_url: string;
  thumbnail_url?: string;
  caption: string;
  likes_count: number;
  views_count: number;
  is_liked?: boolean;
  shop?: {
    name: string;
    logo_url?: string;
  };
  tagged_product?: {
    id: string;
    name: string;
    base_price: number;
    thumbnail: string;
  };
}

export const ReelsService = {
  // 1. Fetch Discovery Reels Feed
  getReelsFeed: async (): Promise<BackendReel[]> => {
    try {
      const res = await apiClient.get('/reels');
      return res.data?.reels || [];
    } catch (err) {
      console.warn('[ReelsService.getReelsFeed] Network fallback:', err);
      return [];
    }
  },

  // 2. Like a Reel
  likeReel: async (reelId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/reels/${reelId}/like`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  // 3. Increment Reel Views
  recordReelView: async (reelId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/reels/${reelId}/view`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },
};
