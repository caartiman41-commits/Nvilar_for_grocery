import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

import { ProductService } from '../services/ProductService';

export interface BoutiqueItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

const BOUTIQUES: BoutiqueItem[] = [
  {
    id: 'b1',
    name: 'fdf',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 4.8,
  },
  {
    id: 'b2',
    name: 'The Thrift Gara...',
    avatar: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=120&auto=format&fit=crop&q=80',
    rating: 4.8,
  },
  {
    id: 'b3',
    name: 'Mitreno.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5.0,
  },
  {
    id: 'b4',
    name: 'Vintage Vault',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    rating: 4.5,
  },
  {
    id: 'b5',
    name: 'StreetCulture',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    rating: 4.9,
  },
];

export interface VerifiedBoutiquesBarProps {
  boutiques?: BoutiqueItem[];
  onSelectBoutique?: (id: string) => void;
  selectedBoutiqueId?: string | null;
}

export const VerifiedBoutiquesBar: React.FC<VerifiedBoutiquesBarProps> = memo(({
  boutiques: propBoutiques,
  onSelectBoutique,
  selectedBoutiqueId,
}) => {
  const [liveBoutiques, setLiveBoutiques] = React.useState<BoutiqueItem[]>(BOUTIQUES);

  React.useEffect(() => {
    if (propBoutiques && propBoutiques.length > 0) {
      setLiveBoutiques(propBoutiques);
      return;
    }
    let isMounted = true;
    ProductService.getShops({ verified_only: true }).then((shops) => {
      if (isMounted && shops && shops.length > 0) {
        const mapped: BoutiqueItem[] = shops.map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.logo_url || s.cover_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          rating: s.rating ? Number(s.rating) : 4.8,
        }));
        setLiveBoutiques(mapped);
      }
    }).catch(() => {
      // Keep fallback
    });
    return () => {
      isMounted = false;
    };
  }, [propBoutiques]);

  const displayBoutiques = liveBoutiques.length > 0 ? liveBoutiques : BOUTIQUES;
  return (
    <View style={styles.container}>
      {/* Title Header with Shield Icon */}
      <View style={styles.titleRow}>
        <Icon name="shield-check" size={16} color={colors.verifiedBlue} style={{ marginRight: 6 }} />
        <Text style={styles.titleText}>VERIFIED BOUTIQUES PARTICIPATING</Text>
      </View>

      {/* Horizontal List of Boutiques */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {displayBoutiques.map((boutique) => {
          const isSelected = selectedBoutiqueId === boutique.id;
          return (
            <TouchableOpacity
              key={boutique.id}
              style={[styles.boutiqueChip, isSelected && styles.boutiqueChipSelected]}
              onPress={() => onSelectBoutique && onSelectBoutique(boutique.id)}
              activeOpacity={0.75}
            >
              <FastImage
                source={{ uri: boutique.avatar }}
                style={styles.avatar as any}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.boutiqueName} numberOfLines={1}>
                {boutique.name}
              </Text>
              <Icon 
                name="check-decagram" 
                size={14} 
                color={colors.verifiedBlue} 
                style={styles.verifiedIcon} 
              />
              <Text style={styles.ratingText}>★{boutique.rating}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#4A2A22',
  },
  scrollList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  boutiqueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#EAE0D4',
    borderRadius: 22,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
  },
  boutiqueChipSelected: {
    borderColor: colors.burgundy,
    backgroundColor: '#F3EAE0',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8DED2',
    marginRight: 6,
  },
  boutiqueName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B1D1D',
    maxWidth: 110,
  },
  verifiedIcon: {
    marginHorizontal: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B1D1D',
    marginLeft: 2,
  },
});
