import { apiClient } from '../api/client';

export interface BackendShop {
  id: string;
  name: string;
  logo_url?: string;
  cover_image?: string;
  bio?: string;
  rating?: number;
  review_count?: number;
  followers_count?: number;
  is_verified?: boolean;
  city?: string;
  category?: string;
}

export interface BackendProduct {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  category: string;
  base_price: number;
  original_price: number;
  discount_percent?: number;
  thumbnail: string;
  gallery_images?: string[];
  fabric?: string;
  gsm?: number;
  fit?: string;
  is_active: boolean;
  shop?: BackendShop;
  variants?: Array<{
    id: string;
    size: string;
    color?: string;
    stock: number;
  }>;
}

export interface PriceHistoryPoint {
  day: string;
  price: number;
  event: string;
}

export const ProductService = {
  // 1. Fetch Verified Boutiques / Shops
  getShops: async (params?: { verified_only?: boolean }): Promise<BackendShop[]> => {
    try {
      const res = await apiClient.get('/shops', { params });
      return res.data?.shops || [];
    } catch (err) {
      console.warn('[ProductService.getShops] Fallback to empty/cache:', err);
      return [];
    }
  },

  // 2. Fetch Single Shop Detail & Profile
  getShopById: async (shopId: string): Promise<BackendShop | null> => {
    try {
      const res = await apiClient.get(`/shops/${shopId}`);
      return res.data?.shop || null;
    } catch (err) {
      console.warn(`[ProductService.getShopById] Error for ${shopId}:`, err);
      return null;
    }
  },

  // 3. Fetch Shop Stories
  getShopStories: async (shopId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get(`/shops/${shopId}/stories`);
      return res.data?.stories || [];
    } catch (err) {
      return [];
    }
  },

  // 4. Fetch Shop Note
  getShopNote: async (shopId: string): Promise<any | null> => {
    try {
      const res = await apiClient.get(`/shops/${shopId}/note`);
      return res.data?.note || null;
    } catch (err) {
      return null;
    }
  },

  // 5. Follow / Unfollow Boutique
  followShop: async (shopId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/shops/${shopId}/follow`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  unfollowShop: async (shopId: string): Promise<boolean> => {
    try {
      const res = await apiClient.delete(`/shops/${shopId}/follow`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  getShopFollowStatus: async (shopId: string): Promise<boolean> => {
    try {
      const res = await apiClient.get(`/shops/${shopId}/follow`);
      return !!res.data?.is_following;
    } catch {
      return false;
    }
  },

  // 6. List Products with Category, Shop, or Search filtering
  getProducts: async (params?: {
    category?: string;
    shop_id?: string;
    q?: string;
    status?: 'active' | 'out_of_stock' | 'all';
  }): Promise<{ products: BackendProduct[]; total: number }> => {
    try {
      const res = await apiClient.get('/products', { params });
      return {
        products: res.data?.products || [],
        total: res.data?.count || 0,
      };
    } catch (err) {
      console.warn('[ProductService.getProducts] Fallback:', err);
      return { products: [], total: 0 };
    }
  },

  // 7. Get Product by ID
  getProductById: async (productId: string): Promise<BackendProduct | null> => {
    try {
      const res = await apiClient.get(`/products/${productId}`);
      return res.data?.product || null;
    } catch (err) {
      console.warn(`[ProductService.getProductById] Error for ${productId}:`, err);
      return null;
    }
  },

  // 8. Get Product Price History
  getProductPriceHistory: async (productId: string): Promise<PriceHistoryPoint[]> => {
    try {
      const res = await apiClient.get(`/products/${productId}/price-history`);
      return res.data?.history || [];
    } catch {
      return [];
    }
  },

  // 9. Active Flash Surge Drops
  getFlashDrops: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/flash-drops/active');
      return res.data?.drops || [];
    } catch {
      return [];
    }
  },

  // 10. Persistent Wishlist
  getWishlist: async (): Promise<BackendProduct[]> => {
    try {
      const res = await apiClient.get('/wishlist');
      return res.data?.items || [];
    } catch {
      return [];
    }
  },

  toggleWishlist: async (productId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/wishlist/${productId}/toggle`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  // 11. Customer Reviews for Shop
  getShopReviews: async (shopId: string): Promise<any[]> => {
    try {
      const res = await apiClient.get(`/shops/${shopId}/reviews`);
      return res.data?.reviews || [];
    } catch {
      return [];
    }
  },

  createShopReview: async (shopId: string, rating: number, review: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/shops/${shopId}/reviews`, { rating, review });
      return !!res.data?.success;
    } catch {
      return false;
    }
  },
};
