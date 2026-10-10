import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/AppHeader';
import { ProductService, BackendProduct } from '../../services/ProductService';
import { formatINR } from '../../utils/formatters';
import { SearchSkeleton } from './components/SearchSkeleton';
import {
  WHOLESALE_CATALOG_PRODUCTS,
  detectVerticalFromQuery,
  recordUserSearchInterest,
  recordProductViewInterest,
} from '../home/data/wholesaleHubData';
import { useSellerStore } from '../seller/sellerStore';

const QUICK_SEARCH_CHIPS = [
  { label: '⚡ Electronics', query: 'Electronics' },
  { label: '🌀 Ceiling Fan & Cooler', query: 'Fan' },
  { label: '👟 Crocs & Footwear', query: 'Crocs' },
  { label: '👗 Fashion & Sarees', query: 'Saree' },
  { label: '💄 Beauty & Lipsticks', query: 'Lipstick' },
  { label: '🥤 Cold Drinks & Coffee', query: 'Cold Drink' },
  { label: '🌾 Ration, Atta & Masala', query: 'Atta' },
  { label: '🧸 Kids, Diapers & Toys', query: 'Diaper' },
  { label: '💊 Pharmacy & Dolo', query: 'Dolo' },
  { label: '🛋️ Decor & Bedsheets', query: 'Bedsheet' },
  { label: '🍫 Imported & Ramen', query: 'Ferrero' },
];

export const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const sellerProducts = useSellerStore((s) => s.products);
  const sellerProfile = useSellerStore((s) => s.profile);

  // Debounced live search across All 12 Wholesale Categories + Backend + Auto-Interest Recording
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        // 1. Record user search interest so 'All' tab on Home auto-recommends this category at the top!
        recordUserSearchInterest(trimmed);

        const qLower = trimmed.toLowerCase();
        const detected = detectVerticalFromQuery(trimmed);

        // 2. Match from Seller Studio + Multi-Vertical Wholesale Catalog (165+ items across all 12 categories)
        const sellerAsCatalog = sellerProducts.map((sp) => ({
          id: sp.id,
          name: sp.title,
          base_price: sp.price,
          original_price: sp.originalPrice > sp.price ? sp.originalPrice : Math.round(sp.price * 1.35),
          thumbnail: sp.imageUri,
          vertical: sp.vertical || 'fashion',
          subcategoryId: sp.subcategoryId || '',
          shop: { name: sellerProfile?.name || 'Verified Wholesale Hub' },
        }));

        const catalogMapped = WHOLESALE_CATALOG_PRODUCTS.map((wp) => ({
          id: wp.id,
          name: wp.name,
          base_price: wp.price,
          original_price: wp.originalPrice,
          thumbnail: wp.image,
          vertical: wp.vertical,
          subcategoryId: wp.subcategoryId,
          shop: { name: wp.boutiqueName },
        }));

        const localPool = [...sellerAsCatalog, ...catalogMapped];
        const localMatches = localPool.filter((item) => {
          const nameMatch = item.name.toLowerCase().includes(qLower);
          const shopMatch = (item.shop?.name || '').toLowerCase().includes(qLower);
          const subMatch = detected.subcategoryId && item.subcategoryId === detected.subcategoryId;
          const vertMatch = detected.vertical && item.vertical === detected.vertical;
          return nameMatch || shopMatch || subMatch || vertMatch;
        });

        // Sort exact title matches ahead of category-wide matches
        localMatches.sort((a, b) => {
          const aExact = a.name.toLowerCase().includes(qLower) ? 1 : 0;
          const bExact = b.name.toLowerCase().includes(qLower) ? 1 : 0;
          return bExact - aExact;
        });

        // 3. Also fetch from Go backend if available and merge deduplicated
        let backendItems: BackendProduct[] = [];
        try {
          const res = await ProductService.getProducts({ q: trimmed });
          backendItems = res.products || [];
        } catch {
          backendItems = [];
        }

        const seenIds = new Set<string>();
        const combined: BackendProduct[] = [];
        for (const it of [...(localMatches as any[]), ...backendItems]) {
          if (!seenIds.has(it.id)) {
            seenIds.add(it.id);
            combined.push(it);
          }
        }

        setResults(combined);
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [query, sellerProducts, sellerProfile]);

  const renderProductItem = ({ item }: { item: BackendProduct & { vertical?: string; subcategoryId?: string } }) => (
    <TouchableOpacity
      style={styles.resultItem}
      activeOpacity={0.75}
      onPress={() => {
        recordProductViewInterest({
          name: item.name,
          vertical: item.vertical,
          subcategoryId: item.subcategoryId,
        });
        navigation.navigate('ProductDetails', {
          productId: item.id,
          product: {
            id: item.id,
            name: item.name,
            price: item.base_price,
            originalPrice: item.original_price,
            image: item.thumbnail,
            boutiqueName: item.shop?.name || 'Verified Boutique',
          },
        });
      }}
    >
      <FastImage
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail as any}
        resizeMode={FastImage.resizeMode.contain}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.boutiqueText} numberOfLines={1}>
          {item.shop?.name || 'Verified Boutique'}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatINR(item.base_price)}</Text>
          {item.original_price > item.base_price && (
            <Text style={styles.originalPrice}>{formatINR(item.original_price)}</Text>
          )}
        </View>
      </View>
      <MaterialIcon name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader showBack onBack={() => navigation.goBack()} title="SEARCH" />

      <View style={styles.searchBar}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search Electronics, Fan, Crocs, Saree, Drinks, Atta..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="x" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {query.trim().length < 2 && (
        <View style={{ paddingHorizontal: spacing.md, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>
            POPULAR CATEGORIES (AUTO-PERSONALIZES HOME FEED)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip.label}
                onPress={() => setQuery(chip.query)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <SearchSkeleton count={6} />
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcon name="magnify-close" size={44} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No matching items found</Text>
          <Text style={styles.emptySubtitle}>Try searching 'Electronics', 'Fan', 'Crocs', 'Kurti', 'Cold Drink' or 'Atta'</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    fontSize: typography.size.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: 58,
    height: 68,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  boutiqueText: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textMuted,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primaryDark,
  },
  originalPrice: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    marginTop: 10,
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
