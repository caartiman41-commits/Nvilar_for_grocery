export interface StudioBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  gradientColors: [string, string];
  iconName: string;
  actionText: string;
}

export interface StudioKPIStats {
  totalRevenue: number;
  activeOrdersCount: number;
  catalogCount: number;
  storeRating: number;
  reviewCount: number;
}

export type OrderFulfillmentType = 'standard' | 'hyperlocal';
export type OrderStatus = 'new' | 'packaging' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface StudioOrderItem {
  id: string;
  orderNumber: string;
  placedAt: string;
  customerName: string;
  customerCity: string;
  distanceKm?: number;
  fulfillmentType: OrderFulfillmentType;
  status: OrderStatus;
  productTitle: string;
  productImage: string;
  size: string;
  qty: number;
  fabric: string;
  price: number;
  totalSettlement: number;
  discount: number;
  riderAssigned?: boolean;
  riderName?: string;
}

export interface GarmentSizeStock {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  stock: number;
}

export interface StudioProduct {
  id: string;
  title: string;
  category: string;
  vertical?: 'electronics' | 'pharmacy' | 'ration' | 'beauty' | 'decor' | 'kids' | 'cold_drinks' | 'footwear' | 'imported' | 'fashion' | 'others';
  subcategoryId?: string;
  subTypeId?: string;
  unitSpec?: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUri: string;
  inStock: boolean;
  totalSold: number;
  fabric: string;
  gsm: string;
  fit: string;
  sizes: GarmentSizeStock[];
  minOrder?: number;
  setRatio?: string;
  isBoosted?: boolean;
  isFlashDrop?: boolean;
}

export interface DealOffer {
  originalPrice: number;
  offeredPrice: number;
  discountAmount: number;
  garmentTitle: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface StudioChatMessage {
  id: string;
  client_message_id?: string;
  sender: 'customer' | 'seller';
  text: string;
  timestamp: string;
  created_at?: string;
  status?: 'sent' | 'delivered' | 'read';
  offer?: DealOffer;
}

export interface StudioConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatarBg: string;
  customerPhone?: string;
  isOnline: boolean;
  lastSeenTime?: string;
  isBlocked?: boolean;
  orderRef?: string;
  productInquiryTitle: string;
  productInquiryImage: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSender?: 'customer' | 'seller';
  lastMessageStatus?: 'sent' | 'delivered' | 'read';
  isCustomerTyping?: boolean;
  unreadCount: number;
  hasBargainOffer: boolean;
  dealStatus?: 'pending' | 'accepted' | 'negotiating';
  messages: StudioChatMessage[];
}

export interface RunwayReel {
  id: string;
  title: string;
  views: string;
  likes: string;
  thumbnail: string;
  taggedGarmentTitle: string;
  taggedPrice: number;
}

export interface BoutiqueProfile {
  name: string;
  handle: string;
  storeId: string;
  category: string;
  city: string;
  state: string;
  isLive: boolean;
  verifiedBadge: boolean;
  followersCount: number;
  rating: number;
  reviewsCount: number;
  bio: string;
  avatarUri?: string;
  coverUri?: string;
  instagramHandle?: string;
  leaveNote?: string;
  stories?: string[];
  reels: RunwayReel[];
}
