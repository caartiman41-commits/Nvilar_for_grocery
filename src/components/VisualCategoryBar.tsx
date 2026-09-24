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

// Local Transparent Cutout Category Icons (Real Human Fashion Models)
const CAT_ICON_ALL = require('../assets/category-icons/cat_all.png');
const CAT_ICON_MEN = require('../assets/category-icons/cat_men.png');
const CAT_ICON_WOMEN = require('../assets/category-icons/cat_women.png');
const CAT_ICON_KIDS = require('../assets/category-icons/cat_kids.png');
const CAT_ICON_ETHNIC = require('../assets/category-icons/cat_ethnic.png');
const CAT_ICON_STREETWEAR = require('../assets/category-icons/cat_streetwear.png');
const CAT_ICON_FOOTWEAR = require('../assets/category-icons/cat_footwear.png');

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
    id: 'men',
    label: 'Men',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_MEN,
  },
  {
    id: 'women',
    label: 'Women',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_WOMEN,
  },
  {
    id: 'kids',
    label: 'Kids',
    image: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_KIDS,
  },
  {
    id: 'ethnic',
    label: 'Ethnic',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_ETHNIC,
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_STREETWEAR,
  },
  {
    id: 'footwear',
    label: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
    localIcon: CAT_ICON_FOOTWEAR,
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
    backgroundColor: colors.warmBackground,
    paddingTop: 1,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 58,
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
