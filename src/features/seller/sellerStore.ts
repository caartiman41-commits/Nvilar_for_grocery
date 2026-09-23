import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SellerApplicationData } from './sellerOnboardingTypes';
import {
  StudioProduct,
  StudioOrderItem,
  StudioConversation,
  BoutiqueProfile,
  OrderStatus,
} from './studio/studioTypes';
import {
  INITIAL_STUDIO_PRODUCTS,
  INITIAL_STUDIO_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_BOUTIQUE_PROFILE,
} from './studio/mockStudioData';
import { SellerService } from '../../services/SellerService';

export type SellerApplicationStatus = 'none' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

export interface SellerState {
  hasSubmittedApplication: boolean;
  applicationId: string;
  applicationStatus: SellerApplicationStatus;
  submittedAt: number | null;
  cancellationReason?: string;
  applicationData: SellerApplicationData | null;
  isStudioModeActive: boolean;

  // Studio Store Data
  products: StudioProduct[];
  orders: StudioOrderItem[];
  conversations: StudioConversation[];
  profile: BoutiqueProfile;

  // Actions
  submitApplication: (data: SellerApplicationData, customId?: string) => void;
  approveApplication: () => void;
  enterStudioMode: () => void;
  exitStudioMode: () => void;
  cancelApplication: (reason: string) => void;
  resetApplication: () => void;

  // Product Actions
  toggleStockStatus: (productId: string) => void;
  toggleBoostProduct: (productId: string) => void;
  toggleFlashDropProduct: (productId: string) => void;
  addProduct: (product: StudioProduct) => void;
  updateProduct: (product: StudioProduct) => void;
  deleteProduct: (productId: string) => void;

  // Order Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignRider: (orderId: string, riderName?: string) => void;

  // Chat Actions
  sendChatMessage: (convId: string, text: string) => void;
  acceptDealOffer: (convId: string, msgId: string) => void;

  // Profile Actions
  updateProfile: (updated: Partial<BoutiqueProfile>) => void;

  // Backend Sync Actions
  syncSellerStatusFromBackend: () => Promise<void>;
  fetchSellerStudioDataFromBackend: () => Promise<void>;
}

export const useSellerStore = create<SellerState>()(
  persist(
    (set) => ({
      hasSubmittedApplication: false,
      applicationId: '',
      applicationStatus: 'none',
      submittedAt: null,
      cancellationReason: undefined,
      applicationData: null,
      isStudioModeActive: false,

      products: INITIAL_STUDIO_PRODUCTS,
      orders: INITIAL_STUDIO_ORDERS,
      conversations: INITIAL_CONVERSATIONS,
      profile: INITIAL_BOUTIQUE_PROFILE,

      submitApplication: (data: SellerApplicationData, customId?: string) => {
        const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
        const numPart = Math.floor(10000 + Math.random() * 90000);
        const appId = customId || `sa_${randomPart}_${numPart}`;

        set({
          hasSubmittedApplication: true,
          applicationId: appId,
          applicationStatus: 'under_review',
          submittedAt: Date.now(),
          cancellationReason: undefined,
          applicationData: data,
        });

        // Asynchronously sync application submission to Go Backend
        SellerService.registerSeller(data)
          .then((res) => {
            if (res.success && res.applicationId) {
              set({ applicationId: res.applicationId });
            }
          })
          .catch(() => {});
      },

      approveApplication: () => {
        set({
          applicationStatus: 'approved',
          isStudioModeActive: true,
        });
      },

      enterStudioMode: () => {
        set({ isStudioModeActive: true });
      },

      exitStudioMode: () => {
        set({ isStudioModeActive: false });
      },

      cancelApplication: (reason: string) => {
        set({
          hasSubmittedApplication: false,
          applicationId: '',
          applicationStatus: 'cancelled',
          submittedAt: null,
          cancellationReason: reason,
          applicationData: null,
          isStudioModeActive: false,
        });
      },

      resetApplication: () => {
        set({
          hasSubmittedApplication: false,
          applicationId: '',
          applicationStatus: 'none',
          submittedAt: null,
          cancellationReason: undefined,
          applicationData: null,
          isStudioModeActive: false,
        });
      },

      toggleStockStatus: (productId: string) => {
        let nextInStock = false;
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              nextInStock = !p.inStock;
              return { ...p, inStock: nextInStock };
            }
            return p;
          }),
        }));
        // Sync with Go Backend
        SellerService.toggleProductStock(productId, nextInStock).catch(() => {});
      },

      syncSellerStatusFromBackend: async () => {
        try {
          const res = await SellerService.getSellerStatus();
          if (res) {
            if (res.status === 'approved') {
              set({ applicationStatus: 'approved', isStudioModeActive: true });
            } else if (res.status === 'rejected') {
              set({ applicationStatus: 'rejected' });
            } else if (res.status === 'pending_review' || res.status === 'under_review') {
              set({ applicationStatus: 'under_review', hasSubmittedApplication: true });
            }
          }
        } catch {
          // Keep offline state
        }
      },

      fetchSellerStudioDataFromBackend: async () => {
        try {
          const [backendProducts, backendOrders] = await Promise.all([
            SellerService.getSellerProducts(),
            SellerService.getSellerOrders(),
          ]);
          if (backendProducts && backendProducts.length > 0) {
            const mappedProds: StudioProduct[] = backendProducts.map((bp: any) => ({
              id: bp.id,
              title: bp.name || 'Garment',
              category: bp.category || 'Fashion',
              price: bp.base_price || 0,
              originalPrice: bp.original_price || bp.base_price || 0,
              discountPercent: bp.discount_percent || 0,
              imageUri: bp.thumbnail || 'https://via.placeholder.com/300',
              inStock: bp.is_active ?? true,
              totalSold: 12,
              fabric: bp.fabric || 'Cotton Blend',
              gsm: bp.gsm ? `${bp.gsm} GSM` : '220 GSM',
              fit: bp.fit || 'Regular Fit',
              sizes: (bp.variants || []).map((v: any) => ({
                size: (v.size || 'M') as 'S' | 'M' | 'L' | 'XL' | 'XXL',
                stock: v.stock || 5,
              })),
              isBoosted: false,
              isFlashDrop: false,
            }));
            set({ products: mappedProds });
          }
          if (backendOrders && backendOrders.length > 0) {
            const mappedOrders: StudioOrderItem[] = backendOrders.map((bo: any) => ({
              id: bo.id,
              orderNumber: bo.order_number || `#ORD-${bo.id?.substring(0, 6) || '8291'}`,
              placedAt: 'Today',
              customerName: bo.customer?.name || bo.shipping_address?.fullName || 'Customer',
              customerCity: bo.shipping_address?.city || 'Local',
              fulfillmentType: 'hyperlocal',
              status: (bo.seller_status || bo.order_status || 'new') as OrderStatus,
              productTitle: bo.items?.[0]?.name || 'Fashion Garment',
              productImage: bo.items?.[0]?.thumbnail || 'https://via.placeholder.com/150',
              size: bo.items?.[0]?.size || 'M',
              qty: bo.items?.[0]?.quantity || 1,
              fabric: 'Cotton Blend',
              price: bo.total_paid || bo.total_mrp || 0,
              totalSettlement: Math.round((bo.total_paid || bo.total_mrp || 0) * 0.95),
              discount: bo.total_savings || 0,
            }));
            set({ orders: mappedOrders });
          }
        } catch {
          // Keep offline mock data
        }
      },

      toggleBoostProduct: (productId: string) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, isBoosted: !p.isBoosted } : p
          ),
        }));
      },

      toggleFlashDropProduct: (productId: string) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, isFlashDrop: !p.isFlashDrop } : p
          ),
        }));
      },

      addProduct: (newProduct: StudioProduct) => {
        set((state) => ({
          products: [newProduct, ...state.products],
        }));
      },

      updateProduct: (updatedProduct: StudioProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
      },

      deleteProduct: (productId: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        set((state) => ({
          orders: state.orders.map((ord) =>
            ord.id === orderId ? { ...ord, status } : ord
          ),
        }));
      },

      assignRider: (orderId: string, riderName = 'Rahul (Express Fleet)') => {
        set((state) => ({
          orders: state.orders.map((ord) =>
            ord.id === orderId
              ? { ...ord, riderAssigned: true, riderName }
              : ord
          ),
        }));
      },

      sendChatMessage: (convId: string, text: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== convId) return c;
            const newMsg = {
              id: `msg_${Date.now()}`,
              sender: 'seller' as const,
              text,
              timestamp: 'Just now',
            };
            return {
              ...c,
              lastMessage: text,
              lastMessageTime: 'Just now',
              messages: [...c.messages, newMsg],
            };
          }),
        }));
      },

      acceptDealOffer: (convId: string, msgId: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              dealStatus: 'accepted' as const,
              messages: c.messages.map((m) =>
                m.id === msgId && m.offer
                  ? { ...m, offer: { ...m.offer, status: 'accepted' as const } }
                  : m
              ),
            };
          }),
        }));
      },

      updateProfile: (updated: Partial<BoutiqueProfile>) => {
        set((state) => ({
          profile: { ...state.profile, ...updated },
        }));
      },
    }),
    {
      name: 'mitreno-seller-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
