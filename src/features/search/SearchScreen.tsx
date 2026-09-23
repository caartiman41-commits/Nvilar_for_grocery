import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
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

export const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced live search query to Go backend
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
        const res = await ProductService.getProducts({ q: trimmed });
        setResults(res.products || []);
        setHasSearched(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const renderProductItem = ({ item }: { item: BackendProduct }) => (
    <TouchableOpacity
      style={styles.resultItem}
      activeOpacity={0.75}
      onPress={() =>
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
        })
      }
    >
      <FastImage
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail as any}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.productName} numberOfLines={1}>
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
          placeholder="Search 'Kurta', 'Denim', 'Hoodie' or boutique..."
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

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primaryDark} />
          <Text style={styles.loadingText}>Searching catalog...</Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcon name="magnify-close" size={44} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No matching styles found</Text>
          <Text style={styles.emptySubtitle}>Try searching with different keywords like 'Oversized' or 'Chikankari'</Text>
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
