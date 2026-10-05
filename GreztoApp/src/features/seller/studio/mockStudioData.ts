import {
  StudioBanner,
  StudioKPIStats,
  StudioOrderItem,
  StudioProduct,
  StudioConversation,
  BoutiqueProfile,
} from './studioTypes';

export const INITIAL_STUDIO_BANNERS: StudioBanner[] = [
  {
    id: 'banner_diwali',
    tag: 'FESTIVE SALE DROPS',
    title: 'Diwali Mega Fashion Showcase',
    subtitle: 'List 5 new festive garments to unlock 0% platform commission & top city placement.',
    badgeText: 'BOOST 5X',
    gradientColors: ['#1E1B4B', '#4338CA'],
    iconName: 'firework',
    actionText: 'List Garments',
  },
  {
    id: 'banner_hyperlocal',
    tag: 'EXPRESS RADAR',
    title: 'Hyperlocal 30-Min Delivery Active',
    subtitle: 'Riders assigned within 3 mins for orders in your city (< 10 km). Fast dispatches boost repeat buyers.',
    badgeText: 'LIVE FLEET',
    gradientColors: ['#064E3B', '#059669'],
    iconName: 'lightning-bolt',
    actionText: 'View Radar',
  },
  {
    id: 'banner_reels',
    tag: 'RUNWAY REELS',
    title: 'Tag Garments in Video Reels',
    subtitle: 'Short fashion videos generate 300% more buyer inquiries & instant bargain purchases.',
    badgeText: 'TRENDING',
    gradientColors: ['#831843', '#DB2777'],
    iconName: 'video-vintage',
    actionText: 'Post Reel',
  },
  {
    id: 'banner_quality',
    tag: 'LUXURY BENCHMARK',
    title: 'Verified Merchant Compliance',
    subtitle: 'Ensure packaging includes official Mitreno tamper-proof seals & authentic care tags.',
    badgeText: 'GUIDELINE',
    gradientColors: ['#78350F', '#D97706'],
    iconName: 'shield-check',
    actionText: 'Check Rules',
  },
];

export const INITIAL_KPI_STATS: StudioKPIStats = {
  totalRevenue: 0,
  activeOrdersCount: 0,
  catalogCount: 0,
  storeRating: 5.0,
  reviewCount: 0,
};

export const INITIAL_STUDIO_PRODUCTS: StudioProduct[] = [];

export const INITIAL_STUDIO_ORDERS: StudioOrderItem[] = [];

export const INITIAL_CONVERSATIONS: StudioConversation[] = [];

export const INITIAL_BOUTIQUE_PROFILE: BoutiqueProfile = {
  name: 'Mitreno.com',
  handle: '@mitreno_official',
  storeId: '42723',
  category: 'Designer Streetwear & Ethnic Fusion',
  city: 'Guwahati',
  state: 'Assam',
  isLive: true,
  verifiedBadge: true,
  followersCount: 0,
  rating: 5.0,
  reviewsCount: 0,
  bio: 'Authentic Designer Streetwear & Handcrafted Ethnic Silks • Hyperlocal 30-Min City Delivery • 100% Genuine Certified Goods.',
  avatarUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&q=80',
  coverUri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
  instagramHandle: '@mitreno_official',
  leaveNote: '',
  stories: [],
  reels: [],
};
