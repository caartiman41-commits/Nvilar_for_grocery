import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

export interface DealFilterOption {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
}

export interface SortOption {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
}

export const DEAL_FILTER_OPTIONS: DealFilterOption[] = [
  {
    id: 'all',
    label: 'All Deals & Curations',
    sublabel: 'Showcase all boutique drops without price restriction',
    icon: 'tag-multiple-outline',
  },
  {
    id: 'under_1999',
    label: 'Under ₹1,999',
    sublabel: 'Budget-friendly designer and street fashion steals',
    icon: 'currency-inr',
  },
  {
    id: 'min_50',
    label: 'Min 50% Off',
    sublabel: 'Major boutique clearances & half-price markdowns',
    icon: 'percent-outline',
  },
  {
    id: 'biggest_discount',
    label: 'Biggest Discount (45%+)',
    sublabel: 'Maximum value price drops across top ateliers',
    icon: 'fire',
  },
];

export const SORT_OPTIONS: SortOption[] = [
  {
    id: 'recommended',
    label: 'Curated & Recommended',
    sublabel: 'Editorial handpicked order & trending styles',
    icon: 'star-shooting-outline',
  },
  {
    id: 'price_asc',
    label: 'Price: Low to High',
    sublabel: 'Discover affordable finds first',
    icon: 'sort-ascending',
  },
  {
    id: 'price_desc',
    label: 'Price: High to Low',
    sublabel: 'Premium luxury and haute couture pieces first',
    icon: 'sort-descending',
  },
  {
    id: 'rating',
    label: 'Customer Rating (4.8+★)',
    sublabel: 'Highest certified buyer satisfaction first',
    icon: 'shield-star-outline',
  },
];

export interface DealFilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeFilter: string;
  activeSort: string;
  onApply: (filter: string, sort: string) => void;
  onReset: () => void;
}

export const DealFilterModal: React.FC<DealFilterModalProps> = ({
  visible,
  onClose,
  activeFilter,
  activeSort,
  onApply,
  onReset,
}) => {
  const [tempFilter, setTempFilter] = useState(activeFilter);
  const [tempSort, setTempSort] = useState(activeSort);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (visible) {
      setTempFilter(activeFilter);
      setTempSort(activeSort);
    }
  }, [visible, activeFilter, activeSort]);

  const handleApply = () => {
    onApply(tempFilter, tempSort);
    onClose();
  };

  const handleReset = () => {
    setTempFilter('all');
    setTempSort('recommended');
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdropOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.sheetContainer}>
              {/* Top Drag Handle */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.headerTitle}>Refine & Filter</Text>
                  <Text style={styles.headerSubtitle}>
                    Curate your boutique fashion feed
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollBody}
              >
                {/* SECTION 1: DEALS & DISCOUNTS */}
                <View style={styles.sectionHeaderRow}>
                  <Icon name="tag-outline" size={15} color="#8B5E3C" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>DEALS & SPECIAL PRICING</Text>
                </View>

                <View style={styles.optionsList}>
                  {DEAL_FILTER_OPTIONS.map((item) => {
                    const isSelected = tempFilter === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                        onPress={() => setTempFilter(item.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.iconBox,
                            isSelected && styles.iconBoxSelected,
                          ]}
                        >
                          <Icon
                            name={item.icon}
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#64748B'}
                          />
                        </View>
                        <View style={styles.optionTextCol}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Text style={styles.optionSublabel}>{item.sublabel}</Text>
                        </View>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* SECTION 2: SORTING */}
                <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
                  <Icon name="sort-variant" size={15} color="#8B5E3C" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>SORT COLLECTION BY</Text>
                </View>

                <View style={styles.optionsList}>
                  {SORT_OPTIONS.map((item) => {
                    const isSelected = tempSort === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                        onPress={() => setTempSort(item.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.iconBox,
                            isSelected && styles.iconBoxSelected,
                          ]}
                        >
                          <Icon
                            name={item.icon}
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#64748B'}
                          />
                        </View>
                        <View style={styles.optionTextCol}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Text style={styles.optionSublabel}>{item.sublabel}</Text>
                        </View>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* FOOTER ACTIONS */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetBtnText}>Reset All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={handleApply}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                  <Icon name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FAF6F0',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '84%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    backgroundColor: '#D1C7BA',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E0B12',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#786960',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFE8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5E3C',
    letterSpacing: 0.8,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  optionCardSelected: {
    borderColor: colors.burgundy,
    backgroundColor: '#FDFBF9',
    shadowColor: colors.burgundy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3EDE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: colors.burgundy,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionLabelSelected: {
    color: colors.burgundy,
    fontWeight: '800',
  },
  optionSublabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: colors.burgundy,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.burgundy,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DE',
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFE8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#5C4E46',
  },
  applyBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.burgundy,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.burgundy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
