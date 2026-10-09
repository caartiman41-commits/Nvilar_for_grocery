import { apiClient } from '../api/client';
import { CheckoutAddress } from '../features/checkout/checkoutStore';
import { OrderItem } from '../features/orders/orderStore';
import { useAuthStore } from '../features/auth/authStore';

export interface CreateOrderPayload {
  buyer_id?: string;
  customer: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  items: Array<{
    product_id: string;
    name: string;
    thumbnail?: string;
    quantity: number;
    size: string;
    price: number;
    shop_id?: string;
    shop_name?: string;
  }>;
  paymentMethod: string;
  payment_mode?: string;
  deliveryDate?: string;
}

export const OrderService = {
  // 1. Create / Place Order
  createOrder: async (
    items: OrderItem[],
    address: CheckoutAddress,
    totalAmount: number,
    paymentMethod: string = 'COD',
    buyerId?: string
  ): Promise<any> => {
    try {
      const authUser = useAuthStore.getState().user;
      const resolvedBuyerId = buyerId || authUser?.uid || '';

      const payload: CreateOrderPayload = {
        buyer_id: resolvedBuyerId,
        customer: {
          fullName: address.yourName || authUser?.displayName || (authUser as any)?.name || 'Customer',
          phone: address.phone || authUser?.phoneNumber || '9864975438',
          street: `${address.houseNoName || ''}, ${address.nearbyArea || ''}`.trim() || 'Six Mile',
          city: address.cityVillage || 'Guwahati',
          state: address.state || 'Assam',
          pincode: address.pincode || '781005',
        },
        items: items.map((it) => {
          const resolvedShopId = it.shop_id || it.shopId || undefined;
          return {
            product_id: (it as any).productId || it.id,
            name: it.name,
            thumbnail: it.image,
            quantity: it.quantity,
            size: it.size || 'M',
            price: it.price,
            shop_id: resolvedShopId,
            shop_name: it.boutiqueName || 'Nvilar.com',
          };
        }),
        paymentMethod,
        payment_mode: paymentMethod,
      };

      const res = await apiClient.post('/orders', payload);
      return res.data?.order || res.data;
    } catch (err: any) {
      console.warn('[OrderService.createOrder] Network fallback:', err.message || err);
      return null;
    }
  },

  // 2. Fetch Customer Orders List
  listOrders: async (buyerId?: string): Promise<any[]> => {
    try {
      const authUser = useAuthStore.getState().user;
      const resolvedBuyerId = buyerId || authUser?.uid || '';
      const res = await apiClient.get('/orders', {
        params: resolvedBuyerId ? { buyer_id: resolvedBuyerId } : {},
      });
      return res.data?.orders || [];
    } catch (err) {
      console.warn('[OrderService.listOrders] Network fallback:', err);
      return [];
    }
  },

  // 3. Fetch Single Order Details (with Live 5-Stage Tracking History)
  getOrderById: async (orderId: string): Promise<any | null> => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      return res.data?.order || null;
    } catch (err) {
      console.warn(`[OrderService.getOrderById] Error for ${orderId}:`, err);
      return null;
    }
  },

  // 4. Cancel Order Item within 24 Hours Free Window
  cancelOrderItem: async (orderId: string, itemId: string, reason: string): Promise<boolean> => {
    try {
      const res = await apiClient.post(`/orders/${orderId}/items/${itemId}/cancel`, {
        reason,
      });
      return !!res.data?.success;
    } catch (err) {
      console.warn('[OrderService.cancelOrderItem] Error:', err);
      return false;
    }
  },
};
