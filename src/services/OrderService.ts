import { apiClient } from '../api/client';
import { CheckoutAddress } from '../features/checkout/checkoutStore';
import { OrderItem } from '../features/orders/orderStore';

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
      const payload: CreateOrderPayload = {
        buyer_id: buyerId,
        customer: {
          fullName: address.yourName,
          phone: address.phone || '',
          street: `${address.houseNoName}, ${address.nearbyArea}`,
          city: address.cityVillage,
          state: address.state,
          pincode: address.pincode,
        },
        items: items.map((it) => ({
          product_id: it.id,
          name: it.name,
          thumbnail: it.image,
          quantity: it.quantity,
          size: it.size || 'M',
          price: it.price,
          shop_id: it.boutiqueName,
          shop_name: it.boutiqueName,
        })),
        paymentMethod,
        payment_mode: paymentMethod,
      };

      const res = await apiClient.post('/orders', payload);
      return res.data?.order || res.data;
    } catch (err: any) {
      console.warn('[OrderService.createOrder] Network fallback:', err.message || err);
      // Return synthetic success order for offline resilience
      return null;
    }
  },

  // 2. Fetch Customer Orders List
  listOrders: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/orders');
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
