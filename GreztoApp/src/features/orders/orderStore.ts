import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckoutAddress } from '../checkout/checkoutStore';
import { OrderService } from '../../services/OrderService';

export type OrderStatus = 'Receipt' | 'Preparing' | 'Package' | 'Out for delivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  boutiqueName?: string;
  shop_id?: string;
  shopId?: string;
  originalPrice?: number;
  discountBadge?: string;
}

export interface Order {
  id: string;
  orderReference?: string;
  items: OrderItem[];
  address: CheckoutAddress;
  totalAmount: number;
  paymentMethod?: string;
  status: OrderStatus;
  createdAt: number;
  otp?: string;
  rider?: {
    name: string;
    phone: string;
  };
  cancellationReason?: string;
  mrp?: number;
  savings?: number;
  deliveryFee?: number;
}

export interface OrderState {
  orders: Order[];
  placeOrder: (
    items: OrderItem[],
    address: CheckoutAddress,
    totalAmount: number,
    paymentMethod?: string,
    orderReference?: string,
    pricing?: { mrp?: number; savings?: number; deliveryFee?: number }
  ) => string;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  updateAddress: (orderId: string, newAddress: CheckoutAddress) => void;
  simulateOrderProgress: (orderId: string) => void;
  fetchOrdersFromBackend: () => Promise<void>;
}

const statusFlow: OrderStatus[] = ['Receipt', 'Preparing', 'Package', 'Out for delivery', 'Delivered'];

export const INITIAL_ORDERS: Order[] = [];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      placeOrder: (items, address, totalAmount, paymentMethod = 'UPI', orderReference, pricing) => {
        const ref = orderReference || `MIT-${Math.floor(10000 + Math.random() * 90000)}`;
        const orderId = `ORD-${Date.now()}`;
        const calculatedMrp = items.reduce(
          (acc, item) => acc + (item.originalPrice || Math.round(item.price * 1.35)) * item.quantity,
          0
        );
        const mrp = pricing?.mrp || calculatedMrp;
        const savings = pricing?.savings || Math.max(0, mrp - totalAmount);
        const deliveryFee = pricing?.deliveryFee !== undefined ? pricing.deliveryFee : (totalAmount >= 1000 ? 0 : 59);

        const newOrder: Order = {
          id: orderId,
          orderReference: ref,
          items,
          address,
          totalAmount,
          paymentMethod,
          status: 'Receipt',
          createdAt: Date.now(),
          otp: Math.floor(1000 + Math.random() * 9000).toString(),
          rider: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
          mrp,
          savings,
          deliveryFee,
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        // Industrial Production: No fake client-side status auto-advance.
        // Status remains authentically stable until updated by the seller or courier partner.

        // Asynchronously sync with Go Backend
        OrderService.createOrder(items, address, totalAmount, paymentMethod)
          .then((backendOrder) => {
            if (backendOrder && backendOrder.id) {
              set((state) => ({
                orders: state.orders.map((o) =>
                  o.id === newOrder.id ? { ...o, id: backendOrder.id, orderReference: backendOrder.id } : o
                ),
              }));
            }
          })
          .catch(() => {});

        return ref;
      },
      updateOrderStatus: (orderId, newStatus) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          ),
        }));
      },
      cancelOrder: (orderId, reason) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: 'Cancelled',
                  cancellationReason: reason || 'Cancelled by customer',
                }
              : order
          ),
        }));

        // Sync cancellation with Go Backend
        const targetOrder = get().orders.find((o) => o.id === orderId);
        if (targetOrder?.items?.[0]) {
          OrderService.cancelOrderItem(orderId, targetOrder.items[0].id, reason || 'Cancelled by customer').catch(() => {});
        }
      },
      fetchOrdersFromBackend: async () => {
        try {
          const liveOrders = await OrderService.listOrders();
          if (liveOrders && liveOrders.length > 0) {
            const mapped: Order[] = liveOrders.map((lo: any) => ({
              id: lo.id,
              orderReference: lo.id,
              items: (lo.items || []).map((it: any) => ({
                id: it.id || it.product_id,
                name: it.name || it.product?.name || 'Item',
                price: it.price_per_unit || it.price || 0,
                quantity: it.quantity || 1,
                image: it.thumbnail || it.product?.thumbnail,
                size: it.size || 'M',
                boutiqueName: it.shop_name || it.product?.shop?.name || 'Boutique',
              })),
              address: {
                id: 'addr-backend',
                yourName: lo.shipping_address?.fullName || lo.customer?.name || 'Customer',
                houseNoName: lo.shipping_address?.street || '',
                nearbyArea: '',
                cityVillage: lo.shipping_address?.city || '',
                state: lo.shipping_address?.state || '',
                pincode: lo.shipping_address?.pincode || '',
                phone: lo.customer?.phone || '',
                gpsLocation: lo.shipping_address?.city || '',
                addressType: 'HOME',
              },
              totalAmount: lo.total_paid || lo.total_mrp || 0,
              paymentMethod: lo.payment_mode || 'UPI',
              status: lo.order_status === 'delivered' ? 'Delivered' : lo.order_status === 'cancelled' ? 'Cancelled' : lo.order_status === 'shipped' ? 'Out for delivery' : 'Preparing',
              createdAt: new Date(lo.placed_at || lo.created_at || Date.now()).getTime(),
              otp: '4829',
              mrp: lo.total_mrp,
              savings: lo.total_savings,
              deliveryFee: lo.delivery_charge,
            }));
            set({ orders: mapped });
          }
        } catch {
          // Keep existing orders
        }
      },
      updateAddress: (orderId, newAddress) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, address: newAddress } : order
          ),
        }));
      },
      simulateOrderProgress: (_orderId) => {
        // Disabled for production integrity: Status progression is strictly authoritative from seller actions & courier updates
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.orders) {
          state.orders = state.orders.filter(
            (o) => !['ORD-20260923-01', 'ORD-20260922-02', 'ORD-20260918-03', 'ORD-20260910-04'].includes(o.id)
          );
        }
      },
    }
  )
);
