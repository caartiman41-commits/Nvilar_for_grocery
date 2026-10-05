import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SellerApplicationData } from './sellerOnboardingTypes';
import {
  StudioProduct,
  StudioOrderItem,
  StudioConversation,
  StudioChatMessage,
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
  setConversations: (conversations: StudioConversation[]) => void;
  deleteConversation: (convId: string) => void;
  toggleBlockCustomer: (convId: string) => void;
  sendChatMessage: (convId: string, text: string) => void;
  acceptDealOffer: (convId: string, msgId: string) => void;
  receiveCustomerMessage: (
    customerName: string,
    productTitle: string,
    text: string,
    productImage?: string,
    offerPrice?: number,
    negotiationId?: string,
    messageId?: string
  ) => void;
  clearStaleConversations: () => void;

  // Profile Actions
  updateProfile: (updated: Partial<BoutiqueProfile>) => void;

  // Backend Sync Actions
  syncSellerStatusFromBackend: () => Promise<void>;
  fetchSellerStudioDataFromBackend: () => Promise<void>;
}

/**
 * Normalizes backend status strings (e.g. accepted, processing, placed) to strict OrderStatus union.
 */
export const normalizeSellerStatus = (rawStatus?: string): OrderStatus => {
  if (!rawStatus) return 'new';
  const s = rawStatus.toLowerCase().trim();
  if (s === 'packaging' || s === 'accepted' || s === 'processing') return 'packaging';
  if (s === 'shipped' || s === 'dispatched' || s === 'out_for_delivery' || s === 'in_transit') return 'shipped';
  if (s === 'delivered' || s === 'completed') return 'delivered';
  if (s === 'returned' || s === 'rto' || s === 'return_requested' || s === 'return_rejected') return 'returned';
  if (s === 'cancelled' || s === 'rejected') return 'cancelled';
  return 'new';
};

/**
 * Formats order date/time into a deterministic exact format, e.g. "01 Oct 2026, 03:03 PM".
 * Completely replaces hardcoded "Today" or "Yesterday".
 */
export const formatExactOrderDateTime = (dateVal?: string | number | Date | null): string => {
  if (!dateVal) {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    return String(dateVal);
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
};

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
      conversations: [],
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
            const mappedOrders: StudioOrderItem[] = backendOrders.map((bo: any) => {
              const normalizedStatus = normalizeSellerStatus(bo.seller_status || bo.order_status);
              const exactPlacedAt = formatExactOrderDateTime(bo.placed_at || bo.created_at);
              const cleanOrderNum = bo.order_number || (bo.id ? (bo.id.startsWith('#') ? bo.id : `#${bo.id}`) : '#ORD-8291');
              return {
                id: bo.id,
                orderNumber: cleanOrderNum,
                placedAt: exactPlacedAt,
                customerName: bo.customer_name || bo.customer?.name || bo.shipping_address?.fullName || bo.shipping_address?.name || 'Customer',
                customerCity: bo.shipping_address?.city || 'Local',
                fulfillmentType: (bo.delivery_tier === 'hyperlocal_same_day' || !bo.delivery_tier) ? 'hyperlocal' : 'standard',
                status: normalizedStatus,
                productTitle: bo.items?.[0]?.name || 'Fashion Garment',
                productImage: bo.items?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
                size: bo.items?.[0]?.size || 'M',
                qty: bo.items?.[0]?.quantity || 1,
                fabric: bo.items?.[0]?.fabric || 'Cotton Blend',
                price: bo.total_paid || bo.total_mrp || 0,
                totalSettlement: Math.round((bo.total_paid || bo.total_mrp || 0) * 0.95),
                discount: bo.total_savings || 0,
                riderAssigned: normalizedStatus === 'shipped' || normalizedStatus === 'delivered',
                riderName: (normalizedStatus === 'shipped' || normalizedStatus === 'delivered') ? 'Rahul (Express Fleet)' : undefined,
              };
            });

            set((state) => {
              const hierarchy: Record<OrderStatus, number> = {
                new: 0,
                packaging: 1,
                shipped: 2,
                delivered: 3,
                returned: 4,
                cancelled: 5,
              };

              const existingMap = new Map<string, StudioOrderItem>();
              state.orders.forEach((o) => existingMap.set(o.id, o));

              const merged = mappedOrders.map((fetched) => {
                const local = existingMap.get(fetched.id);
                if (local && hierarchy[local.status] > hierarchy[fetched.status] && fetched.status === 'new') {
                  return {
                    ...fetched,
                    status: local.status,
                    riderAssigned: local.riderAssigned ?? fetched.riderAssigned,
                    riderName: local.riderName ?? fetched.riderName,
                  };
                }
                return fetched;
              });

              return { orders: merged };
            });
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
        // 1. Immediate optimistic UI update
        set((state) => ({
          products: [newProduct, ...state.products.filter((p) => p.id !== newProduct.id)],
        }));

        // 2. Persist to PostgreSQL via Go Backend
        const payload = {
          name: newProduct.title,
          description: `${newProduct.fabric} | ${newProduct.gsm} | ${newProduct.fit}`,
          category: newProduct.category || 'Fashion',
          base_price: newProduct.price,
          original_price: newProduct.originalPrice || newProduct.price,
          thumbnail: newProduct.imageUri || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
          fabric: newProduct.fabric,
          gsm: parseInt(newProduct.gsm?.replace(/[^0-9]/g, '') || '240', 10),
          fit: newProduct.fit,
          is_active: newProduct.inStock,
          variants: (newProduct.sizes || []).map((s) => ({
            size: s.size,
            color: 'Standard',
            stock: s.stock,
          })),
        };

        SellerService.createProduct(payload).then((res) => {
          if (res.success && res.product?.id) {
            const backendId = res.product.id;
            set((state) => ({
              products: state.products.map((p) =>
                p.id === newProduct.id ? { ...p, id: backendId } : p
              ),
            }));
          }
        }).catch((err) => {
          console.warn('[sellerStore.addProduct] Backend sync error:', err);
        });
      },

      updateProduct: (updatedProduct: StudioProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));

        const payload = {
          name: updatedProduct.title,
          description: `${updatedProduct.fabric} | ${updatedProduct.gsm} | ${updatedProduct.fit}`,
          category: updatedProduct.category,
          base_price: updatedProduct.price,
          original_price: updatedProduct.originalPrice || updatedProduct.price,
          thumbnail: updatedProduct.imageUri,
          fabric: updatedProduct.fabric,
          gsm: parseInt(updatedProduct.gsm?.replace(/[^0-9]/g, '') || '240', 10),
          fit: updatedProduct.fit,
          is_active: updatedProduct.inStock,
          variants: (updatedProduct.sizes || []).map((s) => ({
            size: s.size,
            color: 'Standard',
            stock: s.stock,
          })),
        };
        SellerService.updateProduct(updatedProduct.id, payload).catch(() => {});
      },

      deleteProduct: (productId: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
        SellerService.deleteProduct(productId).catch(() => {});
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        // 1. Instant optimistic local state update
        set((state) => ({
          orders: state.orders.map((ord) =>
            ord.id === orderId ? { ...ord, status } : ord
          ),
        }));

        // 2. Persist directly to PostgreSQL database via Go backend API
        const cleanId = orderId.startsWith('#') ? orderId.substring(1) : orderId;
        SellerService.updateOrderStatus(cleanId, status).catch((err) => {
          console.warn('[sellerStore] Failed to sync order status to backend:', err);
        });
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

      setConversations: (conversations: StudioConversation[]) => {
        set({ conversations });
      },

      clearStaleConversations: () => {
        set({ conversations: [] });
      },

      deleteConversation: (convId: string) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== convId),
        }));
      },

      toggleBlockCustomer: (convId: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, isBlocked: !c.isBlocked } : c
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
              created_at: new Date().toISOString(),
            };
            return {
              ...c,
              lastMessage: text,
              lastMessageTime: 'Just now',
              messages: [newMsg, ...c.messages],
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

      receiveCustomerMessage: (
        customerName: string,
        productTitle: string,
        text: string,
        productImage?: string,
        offerPrice?: number,
        negotiationId?: string,
        messageId?: string
      ) => {
        set((state) => {
          // Match by negotiationId, or customerName fallback
          const existing = state.conversations.find((c) => {
            if (negotiationId && c.id === negotiationId) return true;
            if (customerName && c.customerName.toLowerCase() === customerName.toLowerCase()) return true;
            return false;
          });

          const msgId = messageId || `msg_${Date.now()}`;
          const newMsg: StudioChatMessage = {
            id: msgId,
            sender: 'customer',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: new Date().toISOString(),
            status: 'delivered',
            offer: offerPrice
              ? {
                  originalPrice: offerPrice + 300,
                  offeredPrice: offerPrice,
                  discountAmount: 300,
                  garmentTitle: productTitle || 'Designer Garment',
                  status: 'pending',
                }
              : undefined,
          };

          if (existing) {
            // Deduplication: Skip if message ID or identical text within 2 seconds
            if (existing.messages.some((m) => m.id === msgId)) {
              return state;
            }

            return {
              conversations: state.conversations.map((c) =>
                c.id === existing.id
                  ? {
                      ...c,
                      lastMessage: text,
                      lastMessageTime: 'Just now',
                      lastMessageSender: 'customer',
                      unreadCount: (c.unreadCount || 0) + 1,
                      hasBargainOffer: !!offerPrice || c.hasBargainOffer,
                      messages: [newMsg, ...c.messages],
                    }
                  : c
              ),
            };
          }

          const convId = negotiationId || `conv_${Date.now()}`;
          const newConv: StudioConversation = {
            id: convId,
            customerId: `cust_${Date.now()}`,
            customerName: customerName || 'Customer',
            customerAvatarBg: '#2563EB',
            isOnline: true,
            productInquiryTitle: productTitle || 'Inquired Garment',
            productInquiryImage:
              productImage ||
              'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=150&auto=format&fit=crop&q=80',
            lastMessage: text,
            lastMessageTime: 'Just now',
            lastMessageSender: 'customer',
            unreadCount: 1,
            hasBargainOffer: !!offerPrice,
            dealStatus: 'pending',
            messages: [newMsg],
          };
          return {
            conversations: [newConv, ...state.conversations],
          };
        });
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
      partialize: (state) => ({
        hasSubmittedApplication: state.hasSubmittedApplication,
        applicationId: state.applicationId,
        applicationStatus: state.applicationStatus,
        submittedAt: state.submittedAt,
        profile: state.profile,
        isStudioModeActive: state.isStudioModeActive,
      }),
    }
  )
);
