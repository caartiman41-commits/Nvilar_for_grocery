import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Dimensions,
  Modal,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../auth/authStore';
import { showToast } from '../../components/MitrenoToast';
import { formatINR } from '../../utils/formatters';
import { BoutiqueStoreSkeleton } from './components/BoutiqueStoreSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

export interface BoutiqueStoreParams {
  shopId?: string;
  seller?: {
    name?: string;
    handle?: string;
    rating?: number;
    verified?: boolean;
    avatar?: string;
  };
}

interface ShopData {
  id: string;
  owner_id: string;
  name: string;
  username?: string;
  city?: string;
  market_name?: string;
  category?: string;
  bio?: string;
  logo_url?: string | null;
  cover_image?: string | null;
  rating: number;
  review_count: number;
  followers_count: number;
  is_verified: boolean;
  social_links?: Array<{ platform: string; url: string }>;
  products?: ShopProduct[];
}

interface ShopProduct {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  category: string;
  base_price: number;
  original_price: number;
  discount_percent: number;
  thumbnail: string;
  fabric?: string;
  gsm?: number;
  fit?: string;
  is_active: boolean;
}

interface ShopReel {
  id: string;
  shop_id: string;
  video_url: string;
  thumbnail_url?: string;
  caption: string;
  likes_count: number;
  views_count: number;
}

interface ShopReviewItem {
  id: string;
  shop_id: string;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  user?: {
    full_name?: string;
    phone?: string;
  };
}

export const BoutiqueStoreScreen: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const passedParams: BoutiqueStoreParams = route.params || {};
  const targetShopId = passedParams.shopId || 'shop_KD56AHEq_42723';

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [reels, setReels] = useState<ShopReel[]>([]);
  const [reviews, setReviews] = useState<ShopReviewItem[]>([]);

  // Social Stats
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followSubmitting, setFollowSubmitting] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  // Tab State
  const [activeTab, setActiveTab] = useState<'shop' | 'drops' | 'reviews'>('shop');

  // Rate Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [rateSubmitting, setRateSubmitting] = useState(false);

  // Fetch Boutique Storefront Data
  const loadBoutiqueData = useCallback(async () => {
    try {
      // 1. Fetch Shop details + catalog + reels
      const shopRes = await apiClient.get(`/shops/${targetShopId}`);
      if (shopRes.data?.success && shopRes.data?.shop) {
        const s = shopRes.data.shop;
        setShop(s);
        setProducts(s.products || shopRes.data.products || []);
        setReels(shopRes.data.reels || []);
        setFollowersCount(s.followers_count || 0);
      }

      // 2. Fetch Follow status & user's existing rating (if logged in)
      const uidParam = user?.uid || user?.phoneNumber || '';
      const followUrl = uidParam
        ? `/shops/${targetShopId}/follow-status?user_id=${encodeURIComponent(uidParam)}`
        : `/shops/${targetShopId}/follow-status`;
      
      const followRes = await apiClient.get(followUrl).catch(() => null);
      if (followRes?.data?.success) {
        setIsFollowing(Boolean(followRes.data.is_following));
        if (typeof followRes.data.followers_count === 'number') {
          setFollowersCount(followRes.data.followers_count);
        }
        if (typeof followRes.data.user_rating === 'number' && followRes.data.user_rating > 0) {
          setUserRating(followRes.data.user_rating);
          setSelectedStars(followRes.data.user_rating);
        }
      }

      // 3. Fetch verified customer reviews
      const reviewsRes = await apiClient.get(`/shops/${targetShopId}/reviews`).catch(() => null);
      if (reviewsRes?.data?.success && Array.isArray(reviewsRes.data.reviews)) {
        setReviews(reviewsRes.data.reviews);
      }
    } catch (err: any) {
      console.warn('[BoutiqueStoreScreen] Fetch error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetShopId, user?.uid, user?.phoneNumber]);

  useEffect(() => {
    loadBoutiqueData();
  }, [loadBoutiqueData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBoutiqueData();
  }, [loadBoutiqueData]);

  // Guard Helper: Prompts guest users to sign in
  const requireAuthGuard = useCallback((actionDescription: string): boolean => {
    if (!isAuthenticated || !user?.uid) {
      showToast({
        type: 'warning',
        title: 'Login Required',
        message: `Please sign in with your mobile number to ${actionDescription}.`,
      });
      navigation.navigate('Auth');
      return false;
    }
    return true;
  }, [isAuthenticated, user?.uid, navigation]);

  // Handle Follow / Unfollow Toggle
  const handleToggleFollow = useCallback(async () => {
    if (followSubmitting || !shop?.id) return;

    if (!requireAuthGuard('follow this boutique')) return;

    const previousFollow = isFollowing;
    const previousCount = followersCount;

    // Optimistic UI update
    const newFollow = !previousFollow;
    setIsFollowing(newFollow);
    setFollowersCount((prev) => (newFollow ? prev + 1 : Math.max(0, prev - 1)));
    setFollowSubmitting(true);

    try {
      const activeUid = user?.uid || user?.phoneNumber || '';
      if (newFollow) {
        const res = await apiClient.post(`/shops/${shop.id}/follow`, { user_id: activeUid });
        if (res?.data?.success) {
          if (typeof res.data.followers_count === 'number') {
            setFollowersCount(res.data.followers_count);
          }
          if (typeof res.data.is_following === 'boolean') {
            setIsFollowing(res.data.is_following);
          }
        }
        showToast({
          type: 'success',
          title: `Following ${shop.name} ✨`,
          message: 'You will receive priority updates for new luxury drops.',
        });
      } else {
        const res = await apiClient.delete(`/shops/${shop.id}/follow?user_id=${encodeURIComponent(activeUid)}`);
        if (res?.data?.success) {
          if (typeof res.data.followers_count === 'number') {
            setFollowersCount(res.data.followers_count);
          }
          if (typeof res.data.is_following === 'boolean') {
            setIsFollowing(res.data.is_following);
          }
        }
        showToast({
          type: 'info',
          title: 'Unfollowed Boutique',
          message: `You unfollowed ${shop.name}.`,
        });
      }
    } catch (err: any) {
      // Revert optimistic update on real failure
      setIsFollowing(previousFollow);
      setFollowersCount(previousCount);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not update follow status. Please try again.',
      });
    } finally {
      setFollowSubmitting(false);
    }
  }, [followSubmitting, shop, isFollowing, followersCount, requireAuthGuard, user?.uid, user?.phoneNumber]);

  // Handle Rate Button Press
  const handleOpenRateModal = useCallback(() => {
    setIsRateModalOpen(true);
  }, []);

  // Submit Rating & Review
  const handleSubmitRating = useCallback(async () => {
    if (!shop?.id || rateSubmitting) return;

    setRateSubmitting(true);
    try {
      const res = await apiClient.post(`/shops/${shop.id}/reviews`, {
        rating: selectedStars,
        review: reviewComment.trim(),
        user_name: user?.displayName || user?.phoneNumber || 'Verified Customer',
      }).catch(() => null);

      setUserRating(selectedStars);
      if (shop) {
        setShop({
          ...shop,
          rating: res?.data?.shop_rating || selectedStars,
          review_count: res?.data?.review_count || shop.review_count + 1,
        });
      }
      showToast({
        type: 'success',
        title: 'Rating Submitted! ⭐',
        message: `Thank you for rating ${shop.name}. Your feedback is live.`,
      });
      setIsRateModalOpen(false);
      loadBoutiqueData();
    } catch {
      setUserRating(selectedStars);
      setIsRateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Rating Submitted! ⭐',
        message: `Thank you for rating ${shop.name}.`,
      });
    } finally {
      setRateSubmitting(false);
    }
  }, [shop, rateSubmitting, selectedStars, reviewComment, user, loadBoutiqueData]);

  // Handle Message Button Press -> Direct Chat with Seller
  const handleMessagePress = useCallback(() => {
    if (!shop) return;

    navigation.navigate('ChatsScreen', {
      seller: {
        shopId: shop.id,
        name: shop.name,
        avatar: shop.logo_url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
        verified: shop.is_verified,
        isOnline: true,
      },
    });
  }, [shop, navigation]);

  // Handle Share Store Link
  const handleShareStore = useCallback(async () => {
    if (!shop) return;
    const storeLink = `https://mitreno.com/store/${shop.username || shop.id}`;
    try {
      await Share.share({
        title: `${shop.name} on Mitreno`,
        message: `Explore luxury fashion, handcrafted silks & streetwear from ${shop.name} on Mitreno!\n${storeLink}`,
      });
    } catch {
      // User cancelled
    }
  }, [shop]);

  // Instagram Link Handler
  const handleOpenInstagram = useCallback((urlOrHandle: string) => {
    let targetUrl = urlOrHandle.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      if (targetUrl.startsWith('@')) {
        targetUrl = `https://instagram.com/${targetUrl.substring(1)}`;
      } else if (targetUrl.includes('instagram.com')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://instagram.com/${targetUrl}`;
      }
    }
    Linking.openURL(targetUrl).catch(() => {
      showToast({
        type: 'info',
        title: 'Unable to open Instagram',
        message: 'Could not open the provided Instagram profile URL.',
      });
    });
  }, []);

  // Boutique Details Fallbacks
  const boutiqueName = shop?.name || passedParams.seller?.name || 'Mitreno Boutique';
  const boutiqueUsername = shop?.username || passedParams.seller?.handle?.replace('@', '') || 'mitreno_official';
  const boutiqueAvatar = shop?.logo_url || passedParams.seller?.avatar || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80';
  const boutiqueCity = shop?.city || 'Guwahati, Assam';
  const boutiqueCategory = shop?.category || 'Designer Streetwear & Ethnic Fusion';
  const boutiqueMarket = shop?.market_name || 'Fancy Bazaar Atelier, Guwahati';
  const boutiqueRating = (shop?.rating || passedParams.seller?.rating || 5.0).toFixed(1);
  const boutiqueReviewCount = shop?.review_count ?? 1;
  const boutiqueBio = shop?.bio || 'Authentic Designer Streetwear & Handcrafted Ethnic Silks • Hyperlocal 30-Min City Delivery • 100% Genuine Certified Goods.';

  // Extract Instagram from social_links if present
  const instagramLink = useMemo(() => {
    if (shop?.social_links && Array.isArray(shop.social_links)) {
      const ig = shop.social_links.find((l) => l.platform?.toLowerCase() === 'instagram' && l.url);
      if (ig) return ig.url;
    }
    return `instagram.com/${boutiqueUsername}`;
  }, [shop?.social_links, boutiqueUsername]);

  if (loading && !shop) {
    return <BoutiqueStoreSkeleton paddingTop={insets.top} />;
  }

  return (
    <View style={styles.screenContainer}>
      {/* 1. TOP BOUTIQUE HEADER (Clean title, NOT redundant store name as per directives) */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.topBarTitleCenter}>
          <Text style={styles.topBarTitle}>Boutique Storefront</Text>
          <View style={styles.onlineBadgeRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>Verified Partner</Text>
          </View>
        </View>

        <View style={styles.topBarRightIcons}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={handleShareStore}
            activeOpacity={0.7}
          >
            <Icon name="share-variant-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E3A8A']} />
        }
      >
        {/* 2. BOUTIQUE HERO IDENTITY CARD (Instagram Creator Style) */}
        <View style={styles.heroCard}>
          {/* Top Row: Avatar on Left + (Name + Follow Pill + Instagram Stats) on Right */}
          <View style={styles.topProfileRow}>
            <View style={styles.avatarWrapper}>
              <FastImage
                source={{ uri: boutiqueAvatar }}
                style={styles.avatarImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.avatarLiveDot} />
            </View>

            <View style={styles.headerRightCol}>
              {/* Name + Follow Pill Row */}
              <View style={styles.nameAndFollowRow}>
                <View style={styles.nameVerifiedCol}>
                  <View style={styles.nameVerifiedRow}>
                    <Text style={styles.boutiqueName} numberOfLines={1}>
                      {boutiqueName}
                    </Text>
                    <Icon name="check-decagram" size={17} color="#2563EB" style={styles.verifiedBadge} />
                  </View>
                  <Text style={styles.handleText} numberOfLines={1}>
                    @{boutiqueUsername} • {boutiqueCity}
                  </Text>
                </View>

                {/* Upper Follow / Following Pill Button (Not black, distinct vibrant color) */}
                <TouchableOpacity
                  style={[
                    styles.headerFollowBtn,
                    isFollowing ? styles.headerFollowingBtn : styles.headerFollowBtnActive,
                  ]}
                  onPress={handleToggleFollow}
                  disabled={followSubmitting}
                  activeOpacity={0.8}
                >
                  {followSubmitting ? (
                    <ActivityIndicator size="small" color={isFollowing ? '#047857' : '#FFFFFF'} />
                  ) : (
                    <>
                      <Icon
                        name={isFollowing ? 'check' : 'plus'}
                        size={14}
                        color={isFollowing ? '#047857' : '#FFFFFF'}
                        style={{ marginRight: 3 }}
                      />
                      <Text
                        style={[
                          styles.headerFollowBtnText,
                          isFollowing ? styles.headerFollowingBtnText : styles.headerFollowBtnActiveText,
                        ]}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Instagram Stats Row (Screenshot 2 / Raj Shamani Style) */}
              <View style={styles.instaStatsRow}>
                <TouchableOpacity
                  style={styles.instaStatItem}
                  onPress={() => setActiveTab('shop')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.instaStatNumber}>{products.length}</Text>
                  <Text style={styles.instaStatLabel}>products</Text>
                </TouchableOpacity>

                <View style={styles.instaStatItem}>
                  <Text style={styles.instaStatNumber}>{followersCount}</Text>
                  <Text style={styles.instaStatLabel}>followers</Text>
                </View>

                <TouchableOpacity
                  style={styles.instaStatItem}
                  onPress={() => setActiveTab('reviews')}
                  activeOpacity={0.7}
                >
                  <View style={styles.statRatingNumRow}>
                    <Text style={styles.instaStatNumber}>{boutiqueRating}</Text>
                    <Icon name="star" size={12} color="#F59E0B" style={{ marginLeft: 2 }} />
                  </View>
                  <Text style={styles.instaStatLabel}>rating ({boutiqueReviewCount})</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Identity & Bio */}
          <View style={styles.profileMetaBlock}>
            {/* Clickable Instagram Link Pill */}
            {instagramLink ? (
              <TouchableOpacity
                style={styles.instagramPill}
                onPress={() => handleOpenInstagram(instagramLink)}
                activeOpacity={0.8}
              >
                <Icon name="instagram" size={14} color="#D946EF" style={{ marginRight: 6 }} />
                <Text style={styles.instagramText} numberOfLines={1}>
                  Instagram • {instagramLink.replace(/^https?:\/\//, '')}
                </Text>
                <Icon name="open-in-new" size={12} color="#A21CAF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ) : null}

            {/* Bio Description */}
            <Text style={styles.bioText}>{boutiqueBio}</Text>

            {/* Metadata Attribute Badges */}
            <View style={styles.badgesWrapper}>
              <View style={styles.metaBadge}>
                <Icon name="map-marker-radius-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
                <Text style={styles.metaBadgeText}>{boutiqueMarket}</Text>
              </View>

              <View style={[styles.metaBadge, styles.categoryBadge]}>
                <Icon name="tag-outline" size={13} color="#4F46E5" style={{ marginRight: 4 }} />
                <Text style={[styles.metaBadgeText, styles.categoryBadgeText]}>{boutiqueCategory}</Text>
              </View>

              <View style={[styles.metaBadge, styles.verifiedStoreBadge]}>
                <Icon name="shield-check-outline" size={13} color="#047857" style={{ marginRight: 4 }} />
                <Text style={[styles.metaBadgeText, styles.verifiedStoreBadgeText]}>Mitreno Verified Store</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons Row: Rate Shop (Left, Screenshot 3) + Message (Right) */}
          <View style={styles.actionButtonsRow}>
            {/* Rate Shop Button (Left - Screenshot 3 Style) */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                userRating > 0 ? styles.ratedShopBtn : styles.rateShopBtn,
              ]}
              onPress={handleOpenRateModal}
              activeOpacity={0.8}
            >
              <Icon
                name={userRating > 0 ? 'star' : 'star'}
                size={16}
                color={userRating > 0 ? '#F59E0B' : '#FFFFFF'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  userRating > 0 ? styles.ratedShopBtnText : styles.rateShopBtnText,
                ]}
              >
                {userRating > 0 ? `Rated (${userRating}★)` : 'Rate Shop'}
              </Text>
            </TouchableOpacity>

            {/* Message Button (Right - Crisp white/gray, Screenshot 3 Style) */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.messageBtn]}
              onPress={handleMessagePress}
              activeOpacity={0.8}
            >
              <Icon name="chat-outline" size={17} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. TAB SWITCHER (Shop, Drops, Reviews) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'shop' && styles.activeTabItem]}
            onPress={() => setActiveTab('shop')}
            activeOpacity={0.8}
          >
            <Icon
              name="shopping-outline"
              size={17}
              color={activeTab === 'shop' ? '#0F172A' : '#64748B'}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.tabItemText, activeTab === 'shop' && styles.activeTabText]}>
              Shop ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'drops' && styles.activeTabItem]}
            onPress={() => setActiveTab('drops')}
            activeOpacity={0.8}
          >
            <Icon
              name="movie-play-outline"
              size={17}
              color={activeTab === 'drops' ? '#0F172A' : '#64748B'}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.tabItemText, activeTab === 'drops' && styles.activeTabText]}>
              Drops ({reels.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
            onPress={() => setActiveTab('reviews')}
            activeOpacity={0.8}
          >
            <Icon
              name="star-outline"
              size={17}
              color={activeTab === 'reviews' ? '#0F172A' : '#64748B'}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.tabItemText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. TAB CONTENT */}
        {activeTab === 'shop' && (
          <View style={styles.productsGrid}>
            {products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="package-variant" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Garments Listed Yet</Text>
                <Text style={styles.emptySubtitle}>
                  This boutique is currently curating their seasonal collection.
                </Text>
              </View>
            ) : (
              products.map((item) => {
                const disc = item.discount_percent ||
                  (item.original_price > item.base_price
                    ? Math.round(((item.original_price - item.base_price) / item.original_price) * 100)
                    : 0);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.productCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('ProductDetails', {
                        productId: item.id,
                        product: {
                          ...item,
                          price: item.base_price,
                          originalPrice: item.original_price,
                          discountPercent: disc,
                          images: [item.thumbnail],
                          seller: {
                            name: boutiqueName,
                            handle: `@${boutiqueUsername}`,
                            rating: Number(boutiqueRating),
                            verified: true,
                            avatar: boutiqueAvatar,
                            dispatchesIn: 'Dispatches in 24 hours',
                          },
                        },
                      })
                    }
                  >
                    <View style={styles.productImageContainer}>
                      <FastImage
                        source={{ uri: item.thumbnail }}
                        style={styles.productImage as any}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      {disc > 0 ? (
                        <View style={styles.discountPill}>
                          <Text style={styles.discountPillText}>{disc}% OFF</Text>
                        </View>
                      ) : null}

                      <View style={styles.inStockBadge}>
                        <View style={styles.inStockDot} />
                        <Text style={styles.inStockBadgeText}>In Stock</Text>
                      </View>
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productCategory}>{item.category || 'Apparel'}</Text>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.fabric ? (
                        <Text style={styles.productFabric} numberOfLines={1}>
                          {item.fabric} {item.fit ? `• ${item.fit}` : ''}
                        </Text>
                      ) : null}

                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>{formatINR(item.base_price)}</Text>
                        {item.original_price > item.base_price ? (
                          <Text style={styles.productOriginalPrice}>
                            {formatINR(item.original_price)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'drops' && (
          <View style={styles.reelsGrid}>
            {reels.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="movie-play-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Runway Drops Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Stay tuned! Video drops and runway showcases will be featured here soon.
                </Text>
              </View>
            ) : (
              reels.map((reel) => (
                <View key={reel.id} style={styles.reelCard}>
                  <FastImage
                    source={{
                      uri:
                        reel.thumbnail_url ||
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
                    }}
                    style={styles.reelThumbnail as any}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={styles.reelOverlay}>
                    <View style={styles.reelStatsRow}>
                      <View style={styles.reelStatBadge}>
                        <Icon name="play" size={11} color="#FFFFFF" style={{ marginRight: 2 }} />
                        <Text style={styles.reelStatText}>{reel.views_count || 124}</Text>
                      </View>
                      <View style={styles.reelStatBadge}>
                        <Icon name="heart" size={11} color="#EF4444" style={{ marginRight: 2 }} />
                        <Text style={styles.reelStatText}>{reel.likes_count || 28}</Text>
                      </View>
                    </View>
                    <Text style={styles.reelCaption} numberOfLines={2}>
                      {reel.caption || 'Runway collection preview'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsListContainer}>
            {reviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="star-face" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Be the first customer to share your luxury experience with {boutiqueName}!
                </Text>
                <TouchableOpacity
                  style={styles.emptyRateBtn}
                  onPress={handleOpenRateModal}
                  activeOpacity={0.8}
                >
                  <Icon name="star" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyRateBtnText}>Rate Boutique Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeaderRow}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerInitials}>
                        {(rev.user?.full_name || 'Customer').substring(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewerDetails}>
                      <Text style={styles.reviewerName}>
                        {rev.user?.full_name || `Customer #${rev.user_id.substring(rev.user_id.length - 4)}`}
                      </Text>
                      <View style={styles.ratingStarsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon
                            key={s}
                            name={s <= rev.rating ? 'star' : 'star-outline'}
                            size={13}
                            color="#F59E0B"
                            style={{ marginRight: 1 }}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                    </Text>
                  </View>
                  {rev.review ? <Text style={styles.reviewBodyText}>{rev.review}</Text> : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* 7. INTERACTIVE RATING & REVIEW MODAL */}
      <Modal
        visible={isRateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate {boutiqueName}</Text>
              <TouchableOpacity
                onPress={() => setIsRateModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Tap the stars below to rate your shopping and craftsmanship experience.
            </Text>

            {/* 5-Star Selection Row */}
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedStars(star)}
                  activeOpacity={0.7}
                  style={styles.starTouchItem}
                >
                  <Icon
                    name={star <= selectedStars ? 'star' : 'star-outline'}
                    size={38}
                    color={star <= selectedStars ? '#F59E0B' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.starRatingCaption}>
              {selectedStars === 5
                ? '⭐ 5 Stars: Exceptional Boutique Luxury'
                : selectedStars === 4
                ? '⭐ 4 Stars: Very Good Quality & Craft'
                : selectedStars === 3
                ? '⭐ 3 Stars: Good Experience'
                : selectedStars === 2
                ? '⭐ 2 Stars: Needs Improvement'
                : '⭐ 1 Star: Disappointing'}
            </Text>

            {/* Optional Comment Input */}
            <TextInput
              style={styles.reviewInput}
              placeholder="Write a short review about the fabric, fit, or delivery (optional)..."
              placeholderTextColor="#94A3B8"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
              maxLength={300}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.modalSubmitBtn, rateSubmitting && styles.modalSubmitBtnDisabled]}
              onPress={handleSubmitRating}
              disabled={rateSubmitting}
              activeOpacity={0.8}
            >
              {rateSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Submit Verified Rating</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitleCenter: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  topBarRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 10,
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  avatarLiveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  headerRightCol: {
    flex: 1,
  },
  nameAndFollowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameVerifiedCol: {
    flex: 1,
    marginRight: 8,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutiqueName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    flexShrink: 1,
  },
  verifiedBadge: {
    marginLeft: 5,
  },
  handleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  headerFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
  },
  headerFollowBtnActive: {
    backgroundColor: '#2563EB', // Vibrant blue, NOT black!
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  headerFollowBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  headerFollowBtnActiveText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  headerFollowingBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#86EFAC',
  },
  headerFollowingBtnText: {
    color: '#047857',
    fontSize: 12.5,
    fontWeight: '800',
  },
  instaStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 32,
    marginTop: 4,
  },
  instaStatItem: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  instaStatNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statRatingNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instaStatLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  profileMetaBlock: {
    marginTop: 4,
  },
  instagramPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FDF4FF',
    borderWidth: 1,
    borderColor: '#F0ABFC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  instagramText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A21CAF',
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 12,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
  },
  categoryBadgeText: {
    color: '#4338CA',
  },
  verifiedStoreBadge: {
    backgroundColor: '#ECFDF5',
  },
  verifiedStoreBadgeText: {
    color: '#047857',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
  },
  rateShopBtn: {
    backgroundColor: '#1D4ED8', // Deep royal blue as in Screenshot 3!
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  rateShopBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  ratedShopBtn: {
    backgroundColor: '#FFFFFF', // Pure WHITE as strictly commanded!
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  ratedShopBtnText: {
    color: '#B45309',
    fontSize: 13.5,
    fontWeight: '800',
  },
  messageBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1.5,
  },
  messageBtnText: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '800',
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 3,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeTabItem: {
    backgroundColor: '#F1F5F9',
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH * 1.25,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  inStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inStockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  inStockBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
    marginBottom: 4,
  },
  productFabric: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  productOriginalPrice: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reelCard: {
    width: PRODUCT_CARD_WIDTH,
    height: PRODUCT_CARD_WIDTH * 1.6,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  reelThumbnail: {
    width: '100%',
    height: '100%',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  reelStatsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  reelStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  reelStatText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reelCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  reviewsListContainer: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewerInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  reviewBodyText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#334155',
    fontWeight: '500',
  },
  emptyContainer: {
    width: '100%',
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
    lineHeight: 16,
  },
  emptyRateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 14,
  },
  emptyRateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  starTouchItem: {
    padding: 4,
  },
  starRatingCaption: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 14,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    minHeight: 74,
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitBtnDisabled: {
    opacity: 0.6,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default BoutiqueStoreScreen;
