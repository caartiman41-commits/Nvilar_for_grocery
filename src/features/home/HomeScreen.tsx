import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  useWindowDimensions,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MitrenoHeader } from '../../components/MitrenoHeader';
import { VisualCategoryBar, VISUAL_CATEGORIES } from '../../components/VisualCategoryBar';
import { DealFilterModal } from '../../components/DealFilterModal';
import { ProductCard } from '../../components/ProductCard';
import { FloatingCartSummary } from '../../components/FloatingCartSummary';
import { BannerCarousel } from '../../components/BannerCarousel';
import { useCartStore } from '../cart/cartStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ProductService } from '../../services/ProductService';

export interface BoutiqueProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  boutiqueName: string;
  rating: number;
  discountBadge: string;
  filterGroup?: 'all' | 'under_1999' | 'min_50' | 'biggest_discount';
}

const BOUTIQUE_PRODUCTS: BoutiqueProductItem[] = [
  {
    id: 'p1',
    name: 'Oversized Poplin Overshirt',
    price: 2899,
    originalPrice: 3899,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Sarojini Exclusive',
    rating: 4.6,
    discountBadge: '26% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p2',
    name: 'Handcrafted Chikankari Kurta',
    price: 3500,
    originalPrice: 5000,
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Mitreno.com',
    rating: 5.0,
    discountBadge: '30% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p3',
    name: 'Chiseled Sterling 925 Ring',
    price: 1999,
    originalPrice: 2799,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Vintage Vault',
    rating: 4.5,
    discountBadge: '29% OFF',
    filterGroup: 'under_1999',
  },
  {
    id: 'p4',
    name: 'Oversized Streetwear Hoodie',
    price: 2499,
    originalPrice: 3499,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Mitreno.com',
    rating: 5.0,
    discountBadge: '29% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p5',
    name: 'Vintage Chambray Denim Shirt',
    price: 1799,
    originalPrice: 3599,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'The Thrift Garage',
    rating: 4.8,
    discountBadge: '50% OFF',
    filterGroup: 'min_50',
  },
  {
    id: 'p6',
    name: 'Japanese Selvedge Dark Denim',
    price: 1899,
    originalPrice: 4200,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Vintage Vault',
    rating: 4.9,
    discountBadge: '55% OFF',
    filterGroup: 'biggest_discount',
  },
  {
    id: 'p7',
    name: 'Waffle-Knit Resort Polo',
    price: 2199,
    originalPrice: 3299,
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Studio Kerala',
    rating: 4.8,
    discountBadge: '33% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p8',
    name: 'Hand-Woven Ikat Co-ord Set',
    price: 3899,
    originalPrice: 5499,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Jaipur Artisans',
    rating: 4.9,
    discountBadge: '29% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p9',
    name: 'Acid-Wash Heavyweight Hoodie',
    price: 2699,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Bombay Threads',
    rating: 4.7,
    discountBadge: '32% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p10',
    name: 'Monochrome Pleated Trousers',
    price: 1699,
    originalPrice: 3499,
    image: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Tokyo Minimal',
    rating: 4.9,
    discountBadge: '51% OFF',
    filterGroup: 'min_50',
  },
  {
    id: 'p11',
    name: 'Distressed Cargo Utility Pants',
    price: 1899,
    originalPrice: 3799,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'The Thrift Garage',
    rating: 4.7,
    discountBadge: '50% OFF',
    filterGroup: 'min_50',
  },
  {
    id: 'p12',
    name: 'Silk-Blend Mandarin Shirt',
    price: 1599,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Goa Holiday Co.',
    rating: 4.6,
    discountBadge: '36% OFF',
    filterGroup: 'under_1999',
  },
  {
    id: 'p13',
    name: 'Raw Selvedge Trucker Jacket',
    price: 4299,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Denim Craft Co.',
    rating: 5.0,
    discountBadge: '38% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p14',
    name: 'Indigo Ombre Linen Shirt',
    price: 1499,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Jaipur Artisans',
    rating: 4.8,
    discountBadge: '50% OFF',
    filterGroup: 'under_1999',
  },
  {
    id: 'p15',
    name: 'Suede Embroidered Bomber',
    price: 4899,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Vintage Vault',
    rating: 4.9,
    discountBadge: '39% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p16',
    name: 'Cashmere-Blend Knit Cardigan',
    price: 1799,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Nordic Studio',
    rating: 4.7,
    discountBadge: '55% OFF',
    filterGroup: 'biggest_discount',
  },
  {
    id: 'p17',
    name: 'Block-Printed Chanderi Dress',
    price: 3299,
    originalPrice: 4899,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Delhi6 Co-ord',
    rating: 4.8,
    discountBadge: '33% OFF',
    filterGroup: 'all',
  },
  {
    id: 'p18',
    name: 'Modular Multi-Pocket Vest',
    price: 1399,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Tokyo Minimal',
    rating: 4.6,
    discountBadge: '53% OFF',
    filterGroup: 'biggest_discount',
  },
  {
    id: 'p19',
    name: 'Corduroy Relaxed Work Jacket',
    price: 1899,
    originalPrice: 3199,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'The Thrift Garage',
    rating: 4.8,
    discountBadge: '41% OFF',
    filterGroup: 'under_1999',
  },
  {
    id: 'p20',
    name: 'Double-Breasted Linen Blazer',
    price: 4499,
    originalPrice: 6499,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80',
    boutiqueName: 'Mitreno.com',
    rating: 5.0,
    discountBadge: '31% OFF',
    filterGroup: 'all',
  },
];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { addItem, items } = useCartStore();

  const SIDE_PADDING = 12;
  const GAP = 10;
  const cardWidth = Math.floor((width - (SIDE_PADDING * 2) - GAP) / 2);

  // Preload top featured boutique product images + visual category avatars into cache
  useEffect(() => {
    const topImages = BOUTIQUE_PRODUCTS.slice(0, 10).map((p) => ({
      uri: p.image,
      priority: FastImage.priority.high,
    }));
    const categoryImages = VISUAL_CATEGORIES.map((c) => ({
      uri: c.image,
      priority: FastImage.priority.high,
    }));
    FastImage.preload([...categoryImages, ...topImages]);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // ==========================================================================
  // SMART SHUFFLE: Rating-weighted Fisher-Yates (high-rated products bubble up)
  // ==========================================================================
  const smartShuffle = useCallback((arr: BoutiqueProductItem[]): BoutiqueProductItem[] => {
    const copy = [...arr];
    // Fisher-Yates shuffle
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    // Bias: 60% chance top-rated products (rating >= 4.8) float to top half
    const topRated = copy.filter(p => p.rating >= 4.8);
    const rest = copy.filter(p => p.rating < 4.8);
    if (Math.random() < 0.6 && topRated.length > 0) {
      for (let i = topRated.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topRated[i], topRated[j]] = [topRated[j], topRated[i]];
      }
      return [...topRated, ...rest];
    }
    return copy;
  }, []);

  const [shuffledProducts, setShuffledProducts] = useState<BoutiqueProductItem[]>(BOUTIQUE_PRODUCTS);
  const [shuffleKey, setShuffleKey] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Live products fetch from Go backend (resilient fallback to BOUTIQUE_PRODUCTS)
  const fetchLiveProducts = useCallback(async () => {
    try {
      const res = await ProductService.getProducts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      if (res.products && res.products.length > 0) {
        const mapped: BoutiqueProductItem[] = res.products.map((p) => {
          const orig = p.original_price || p.base_price;
          const disc = p.discount_percent || (orig > p.base_price ? Math.round(((orig - p.base_price) / orig) * 100) : 0);
          return {
            id: p.id,
            name: p.name,
            price: p.base_price,
            originalPrice: orig,
            image: p.thumbnail,
            boutiqueName: p.shop?.name || 'Verified Boutique',
            rating: p.shop?.rating ? Number(p.shop.rating) : 4.8,
            discountBadge: disc > 0 ? `${disc}% OFF` : 'DEAL',
            filterGroup: p.base_price <= 1999 ? 'under_1999' : disc >= 50 ? 'min_50' : 'all',
          };
        });
        setShuffledProducts(smartShuffle(mapped));
      }
    } catch {
      // Offline fallback
    }
  }, [selectedCategory, smartShuffle]);

  useEffect(() => {
    fetchLiveProducts();
  }, [fetchLiveProducts]);

  const filteredProducts = useMemo(() => {
    const list = shuffledProducts.filter((item) => {
      // 1. Filter by Visual Category (if specific category selected)
      if (selectedCategory === 'men' && (item.id === 'p17' || item.id === 'p8')) return false;
      if (selectedCategory === 'women' && (item.id === 'p1' || item.id === 'p2' || item.id === 'p4' || item.id === 'p6' || item.id === 'p7')) return false;
      if (selectedCategory === 'kids' && (item.id === 'p2' || item.id === 'p6' || item.id === 'p13' || item.id === 'p20')) return false;
      if (selectedCategory === 'ethnic' && item.id !== 'p2' && item.id !== 'p8' && item.id !== 'p14') return false;
      if (selectedCategory === 'streetwear' && item.id !== 'p4' && item.id !== 'p9' && item.id !== 'p13' && item.id !== 'p18') return false;
      if (selectedCategory === 'footwear' && item.id !== 'p3') return false;

      // 2. Filter by Deal options
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'under_1999') return item.price <= 1999;
      if (selectedFilter === 'min_50') {
        const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        return discount >= 50;
      }
      if (selectedFilter === 'biggest_discount') {
        const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        return discount >= 45;
      }
      return item.filterGroup === selectedFilter;
    });

    // 3. Sorting
    if (selectedSort === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (selectedSort === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (selectedSort === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [shuffledProducts, selectedCategory, selectedFilter, selectedSort]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    // 1. Fade out product grid
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(async () => {
      // 2. Fetch live products & shuffle
      await fetchLiveProducts();
      setShuffleKey(prev => prev + 1);

      // 3. Fade in with fresh products
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setIsRefreshing(false);
      });
    });
  }, [fadeAnim, fetchLiveProducts]);

  const handleBargain = (product: BoutiqueProductItem) => {
    Alert.alert(
      'Live Bargain Window Open',
      `Submit your counter-offer for ${product.name} to ${product.boutiqueName}. Current price: ₹${product.price}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Chat', 
          onPress: () => navigation.navigate('ChatsTab') 
        },
      ]
    );
  };

  const handleBuy = (product: BoutiqueProductItem) => {
    navigation.navigate('Checkout', {
      directItem: {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: 1,
        size: 'M',
        boutiqueName: product.boutiqueName,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Mitreno Luxury Top Header matching Screenshot 2 */}
      <MitrenoHeader
        locationName="Kolkata, WB"
        onSearchPress={() => navigation.navigate('Search')}
        onFilterPress={() => setIsFilterModalVisible(true)}
        hasActiveFilter={selectedFilter !== 'all' || selectedSort !== 'recommended'}
      />

      {/* Visual Category Capsule Bar matching Screenshot 3 */}
      <VisualCategoryBar
        activeCategoryId={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        overScrollMode="never"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3B111A', '#8B5E3C', '#155DFC']}
            progressBackgroundColor="#FFFFFF"
            tintColor="#3B111A"
          />
        }
      >
        {/* Curated Drops Carousel */}
        <BannerCarousel />

        {/* Curated Feed Section Header */}
        <View style={styles.feedHeaderRow}>
          <View style={styles.feedHeaderTitleRow}>
            <Icon name="star-four-points" size={15} color="#0F172A" style={styles.headerIcon} />
            <Text style={styles.feedHeaderSub}>EXPLORE COLLECTIONS</Text>
          </View>
        </View>

        {/* 2-Column Product Grid with Shuffle Fade Animation */}
        <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
          {filteredProducts.map((item) => (
            <View
              key={item.id}
              style={[styles.cardWrapper, { width: cardWidth }]}
            >
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                image={item.image}
                boutiqueName={item.boutiqueName}
                rating={item.rating}
                onPress={() => {
                  FastImage.preload([{ uri: item.image, priority: FastImage.priority.high }]);
                  navigation.navigate('ProductDetails', { product: item, productId: item.id });
                }}
                onBargain={() => handleBargain(item)}
                onBuy={() => handleBuy(item)}
                onAdd={() => handleBuy(item)}
              />
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Floating Bag Summary */}
      {totalItems > 0 && (
        <FloatingCartSummary onPress={() => navigation.navigate('BagTab')} />
      )}

      {/* Deal & Sort Filter Bottom Sheet Modal */}
      <DealFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        activeFilter={selectedFilter}
        activeSort={selectedSort}
        onApply={(filter, sort) => {
          setSelectedFilter(filter);
          setSelectedSort(sort);
        }}
        onReset={() => {
          setSelectedFilter('all');
          setSelectedSort('recommended');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmBackground,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  feedHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 6,
  },
  feedHeaderSub: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  cardWrapper: {
    marginBottom: 12,
  },
});
