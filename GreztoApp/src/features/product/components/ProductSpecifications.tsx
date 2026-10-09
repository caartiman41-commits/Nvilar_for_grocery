import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { ProductSpecificationItem } from '../types';

export interface ProductSpecificationsProps {
  specifications: ProductSpecificationItem[];
  productStory: string;
  sku?: string;
  minOrder?: number;
  setRatio?: string;
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = memo(({
  specifications,
  productStory,
  sku = 'AFZ-005',
  minOrder = 6,
  setRatio = 'S:1, M:2, L:2, XL:1',
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Header: WHOLESALE B2B SPECIFICATIONS + SKU */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Icon name="tag-multiple-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>WHOLESALE B2B SPECIFICATIONS</Text>
        </View>
        <Text style={styles.skuText}>SKU: {sku}</Text>
      </View>

      {/* 2. 2-Column Grid of Rounded Spec Boxes */}
      <View style={styles.grid}>
        {specifications.map((item, index) => (
          <View key={item.key || index.toString()} style={styles.specBoxWrapper}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>{item.label}</Text>
              <View style={styles.valueRow}>
                {item.colorSwatch && (
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: item.colorSwatch },
                    ]}
                  />
                )}
                <Text style={styles.specValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 3. WHOLESALE RESALE & PRODUCTION STORY Section */}
      {productStory ? (
        <View style={styles.storySection}>
          <Text style={styles.storyHeaderTitle}>WHOLESALE RESALE & PRODUCTION STORY</Text>
          <Text style={styles.storyParagraph}>{productStory}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  skuText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  specBoxWrapper: {
    width: '50%',
    padding: 4,
  },
  specBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 58,
    justifyContent: 'center',
  },
  specLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  storySection: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  storyHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  storyParagraph: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#475569',
  },
});
