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
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, inStock: !p.inStock } : p
          ),
        }));
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
