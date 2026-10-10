import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../theme/colors';

// Local Transparent Cutout Category Icons (Multi-Vertical Wholesale Super-App)
const CAT_ICON_ALL = require('../assets/category-icons/cat_all_summary.png');
const CAT_ICON_ELECTRONICS = require('../assets/categories/electronics/elec_fans_coolers.png');
const CAT_ICON_PHARMACY = require('../assets/categories/pharmacy/pharm_cough_cold_fever.png');
const CAT_ICON_RATION = require('../assets/categories/ration/ration_atta_maida_sooji.png');
const CAT_ICON_BEAUTY = require('../assets/categories/beauty/beauty_lip_cosmetics.png');
const CAT_ICON_KIDS = require('../assets/categories/kids/kids_diaper.png');
const CAT_ICON_COLD_DRINKS = require('../assets/categories/cold_drinks/drinks_cola_fizzy.png');
const CAT_ICON_FASHION = require('../assets/category-icons/cat_all.png');
const CAT_ICON_FOOTWEAR = require('../assets/category-icons/cat_footwear.png');
const CAT_ICON_DECOR = require('../assets/category-icons/cat_decor.png');
const CAT_ICON_IMPORTED = require('../assets/category-icons/cat_imported.png');
const CAT_ICON_OTHERS = require('../assets/category-icons/cat_others.png');

export interface VisualCategoryItem {
  id: string;
  label: string;
  image: string;
  localIcon: ImageSourcePropType;
}

export const VISUAL_CATEGORIES: VisualCategoryItem[] = [
  {
    id: 'all',
    label: 'All',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_ALL,
  },
  {
    id: 'electronics',
    label: 'Electronics',
    image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_ELECTRONICS,
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_PHARMACY,
  },
  {
    id: 'ration',
    label: 'Ration',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_RATION,
  },
  {
    id: 'beauty',
    label: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_BEAUTY,
  },
  {
    id: 'kids',
    label: 'Kids',
    image: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_KIDS,
  },
  {
    id: 'cold_drinks',
    label: 'Cold Drinks',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_COLD_DRINKS,
  },
  {
    id: 'fashion',
    label: 'Fashion',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_FASHION,
  },
  {
    id: 'footwear',
    label: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_FOOTWEAR,
  },
  {
    id: 'decor',
    label: 'Decor',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_DECOR,
  },
  {
    id: 'imported',
    label: 'Imported',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_IMPORTED,
  },
  {
    id: 'others',
    label: 'Others',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_OTHERS,
  },
];

export interface VisualCategoryBarProps {
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const VisualCategoryBar: React.FC<VisualCategoryBarProps> = ({
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {VISUAL_CATEGORIES.map((cat) => {
          const isActive = activeCategoryId === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.75}
            >
              {/* Borderless Transparent Cutout Image Container */}
              <View style={styles.iconContainer}>
                <Image
                  source={cat.localIcon}
                  style={[
                    styles.iconImage,
                    isActive && styles.iconImageActive,
                  ]}
                  resizeMode="contain"
                  resizeMethod="resize"
                  fadeDuration={0}
                />
              </View>

              {/* Bottom Category Label */}
              <Text
                style={[
                  styles.categoryLabel,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>

              {/* Sleek Active Indicator Underline Bar */}
              <View
                style={[
                  styles.underlineBar,
                  isActive ? styles.underlineActive : styles.underlineInactive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 1,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 10,
    width: 64,
  },
  iconContainer: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconImage: {
    width: 50,
    height: 50,
    opacity: 1,
  },
  iconImageActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  categoryLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '800',
    color: '#1E0B12',
  },
  labelInactive: {
    fontWeight: '600',
    color: '#64748B',
  },
  underlineBar: {
    width: 20,
    height: 2,
    borderRadius: 1,
    marginTop: 2,
  },
  underlineActive: {
    backgroundColor: '#1E0B12',
  },
  underlineInactive: {
    backgroundColor: 'transparent',
  },
});
