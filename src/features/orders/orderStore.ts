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

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-20260923-01',
    orderReference: 'MIT-98421',
    status: 'Preparing',
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    totalAmount: 3559,
    paymentMethod: 'UPI (PhonePe)',
    mrp: 4500,
    savings: 1000,
    deliveryFee: 59,
    otp: '4829',
    rider: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
    address: {
      id: 'addr-default-1',
      yourName: 'Rahul Verma',
      houseNoName: 'Apartment 4B, Silver Oak Residency',
      nearbyArea: 'Indiranagar 100ft Road',
      cityVillage: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
      gpsLocation: '12.9784° N, 77.6408° E',
      addressType: 'HOME',
      distance: '3.2 km',
    },
    items: [
      {
        id: 'item-chikankari-1',
        name: 'Handcrafted Chikankari Kurta',
        price: 3500,
        originalPrice: 4500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
        size: 'L',
        boutiqueName: 'Mitreno.com',
        discountBadge: '29% OFF',
      },
    ],
  },
  {
    id: 'ORD-20260922-02',
    orderReference: 'MIT-76192',
    status: 'Out for delivery',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    totalAmount: 2899,
    paymentMethod: 'Credit Card (Visa)',
    mrp: 4299,
    savings: 1400,
    deliveryFee: 0,
    otp: '7315',
    rider: { name: 'Vikram Singh', phone: '+91 98123 45678' },
    address: {
      id: 'addr-default-1',
      yourName: 'Rahul Verma',
      houseNoName: 'Apartment 4B, Silver Oak Residency',
      nearbyArea: 'Indiranagar 100ft Road',
      cityVillage: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
      gpsLocation: '12.9784° N, 77.6408° E',
      addressType: 'HOME',
      distance: '3.2 km',
    },
    items: [
      {
        id: 'item-hoodie-2',
        name: 'Oversized Streetwear Hoodie',
        price: 2899,
        originalPrice: 4299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
        size: 'XL',
        boutiqueName: 'UrbanVogue Studio',
        discountBadge: '33% OFF',
      },
    ],
  },
  {
    id: 'ORD-20260918-03',
    orderReference: 'MIT-55104',
    status: 'Delivered',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    totalAmount: 4999,
    paymentMethod: 'UPI (Google Pay)',
    mrp: 7999,
    savings: 3000,
    deliveryFee: 0,
    otp: '9941',
    rider: { name: 'Amit Roy', phone: '+91 98765 01234' },
    address: {
      id: 'addr-default-1',
      yourName: 'Rahul Verma',
      houseNoName: 'Apartment 4B, Silver Oak Residency',
      nearbyArea: 'Indiranagar 100ft Road',
      cityVillage: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
      gpsLocation: '12.9784° N, 77.6408° E',
      addressType: 'HOME',
      distance: '3.2 km',
    },
    items: [
      {
        id: 'item-bandhgala-3',
        name: 'Raw Silk Bandhgala Jacket',
        price: 4999,
        originalPrice: 7999,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80',
        size: 'M',
        boutiqueName: 'Royal Weaves Jaipur',
        discountBadge: '38% OFF',
      },
    ],
  },
  {
    id: 'ORD-20260910-04',
    orderReference: 'MIT-41098',
    status: 'Delivered',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13, // 13 days ago
    totalAmount: 1899,
    paymentMethod: 'Net Banking (HDFC)',
    mrp: 2799,
    savings: 900,
    deliveryFee: 0,
    otp: '2180',
    rider: { name: 'Sanjay Patel', phone: '+91 98765 09876' },
    address: {
      id: 'addr-default-1',
      yourName: 'Rahul Verma',
      houseNoName: 'Apartment 4B, Silver Oak Residency',
      nearbyArea: 'Indiranagar 100ft Road',
      cityVillage: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
      gpsLocation: '12.9784° N, 77.6408° E',
      addressType: 'HOME',
      distance: '3.2 km',
    },
    items: [
      {
        id: 'item-linen-4',
        name: 'Pure Linen Relaxed Resort Shirt',
        price: 1899,
        originalPrice: 2799,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80',
        size: 'L',
        boutiqueName: 'Mitreno.com',
        discountBadge: '32% OFF',
      },
    ],
  },
];

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
        get().simulateOrderProgress(newOrder.id);

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
            set((state) => {
              const existingIds = new Set(mapped.map((m) => m.id));
              const remaining = state.orders.filter((o) => !existingIds.has(o.id));
              return { orders: [...mapped, ...remaining] };
            });
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
      simulateOrderProgress: (orderId) => {
        // Auto progress every 15 seconds for realistic simulation
        let currentIdx = 0;
        const interval = setInterval(() => {
          const currentOrder = get().orders.find((o) => o.id === orderId);
          if (!currentOrder || currentOrder.status === 'Cancelled') {
            clearInterval(interval);
            return;
          }
          currentIdx++;
          if (currentIdx >= statusFlow.length) {
            clearInterval(interval);
            return;
          }
          get().updateOrderStatus(orderId, statusFlow[currentIdx]);
        }, 15000);
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.orders || state.orders.length === 0)) {
          state.orders = INITIAL_ORDERS;
        }
      },
    }
  )
);
