import { apiClient } from '../api/client';
import { SellerApplicationData } from '../features/seller/sellerOnboardingTypes';

export const SellerService = {
  // 1. Submit 5-Step KYC Seller Onboarding Application
  registerSeller: async (data: SellerApplicationData): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
    try {
      const payload = {
        business_name: data.business?.shopName || 'Boutique',
        business_type: data.business?.businessType || 'individual',
        business_category: data.business?.businessCategory || 'Fashion',
        business_description: data.business?.description || `${data.business?.shopName || 'Boutique'} Store`,

        owner_full_name: data.identity?.legalName || '',
        owner_phone: data.identity?.phone || '',
        owner_email: data.identity?.email || null,

        aadhar_number: data.identity?.aadharNumber || '',
        aadhar_photo_url: data.identity?.aadharCardUri || 'https://via.placeholder.com/600x400.png?text=Aadhar',
        pan_number: data.identity?.panNumber || '',
        pan_photo_url: data.identity?.panCardUri || 'https://via.placeholder.com/600x400.png?text=PAN',
        voter_id_number: data.identity?.voterId || null,
        voter_id_photo_url: null,
        dl_number: data.identity?.drivingLicense || null,
        dl_photo_url: null,
        gst_number: data.identity?.gstNumber || null,

        shop_address: {
          street: data.address?.streetAddress || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          pincode: data.address?.pincode || '',
          landmark: data.address?.landmark || '',
        },

        payout_upi_id: data.payout?.upiId || 'seller@upi',
        bank_account_number: data.payout?.accountNumber || null,
        bank_ifsc: data.payout?.ifscCode || null,
      };

      const res = await apiClient.post('/seller/register', payload);
      return {
        success: true,
        applicationId: res.data?.application?.id || res.data?.id,
      };
    } catch (err: any) {
      console.warn('[SellerService.registerSeller] API error:', err.response?.data?.error || err.message);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  },

  // 2. Fetch Seller Application Status
  getSellerStatus: async (): Promise<{ status: string; application?: any } | null> => {
    try {
      const res = await apiClient.get('/seller/status');
      return {
        status: res.data?.status || 'none',
        application: res.data?.application || null,
      };
    } catch (err) {
      console.warn('[SellerService.getSellerStatus] Network fallback:', err);
      return null;
    }
  },

  // 3. Seller Studio Dashboard Metrics
  getSellerDashboard: async (): Promise<any | null> => {
    try {
      const res = await apiClient.get('/seller/dashboard');
      return res.data || null;
    } catch {
      return null;
    }
  },

  // 4. Seller Products List
  getSellerProducts: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/seller/products');
      return res.data?.products || [];
    } catch {
      return [];
    }
  },

  // 5. In-Stock / Out-of-Stock Stock Toggle
  toggleProductStock: async (productId: string, inStock?: boolean): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/products/${productId}/toggle-stock`, {
        is_active: inStock,
      });
      return !!res.data?.success;
    } catch (err) {
      console.warn(`[SellerService.toggleProductStock] Error for ${productId}:`, err);
      return false;
    }
  },

  // 6. Seller Orders Management
  getSellerOrders: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/seller/orders');
      return res.data?.orders || [];
    } catch {
      return [];
    }
  },

  acceptSellerOrder: async (orderId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/seller/orders/${orderId}/accept`);
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  rejectSellerOrder: async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/seller/orders/${orderId}/reject`, { reason });
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/seller/orders/${orderId}/status`, { status });
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  // 7. Boutique Story & Leave Notes
  createShopStory: async (mediaUrl: string, textContent?: string, taggedProductId?: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/seller/profile/story', {
        media_url: mediaUrl,
        text_content: textContent,
        tagged_product_id: taggedProductId,
      });
      return !!res.data?.success;
    } catch {
      return false;
    }
  },

  createShopNote: async (note: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/seller/profile/note', { note });
      return !!res.data?.success;
    } catch {
      return false;
    }
  },
};
