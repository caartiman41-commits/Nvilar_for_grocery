import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  BusinessDetailsData,
  BusinessType,
  SELLER_FASHION_CATEGORIES,
} from '../sellerOnboardingTypes';

export interface Step1BusinessDetailsProps {
  data: BusinessDetailsData;
  onChange: (data: Partial<BusinessDetailsData>) => void;
}

const BUSINESS_TYPES: { id: BusinessType; label: string }[] = [
  { id: 'individual', label: 'Individual' },
  { id: 'partnership', label: 'Partnership' },
  { id: 'company', label: 'Company' },
];

export const Step1BusinessDetails: React.FC<Step1BusinessDetailsProps> = memo(({
  data,
  onChange,
}) => {
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const selectedCategoryObj = SELLER_FASHION_CATEGORIES.find(
    (c) => c.name === data.businessCategory
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Business Details</Text>
      <Text style={styles.subtitle}>Tell us about your boutique or brand</Text>

      {/* Field 1: Business / Shop Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          BUSINESS / SHOP NAME <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. The Thrift Garage"
          placeholderTextColor="#94A3B8"
          value={data.shopName}
          onChangeText={(text) => onChange({ shopName: text })}
          autoCapitalize="words"
        />
      </View>

      {/* Field 2: Business Type Pills */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          BUSINESS TYPE <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View style={styles.pillRow}>
          {BUSINESS_TYPES.map((bt) => {
            const isSelected = data.businessType === bt.id;
            return (
              <TouchableOpacity
                key={bt.id}
                style={[
                  styles.typePill,
                  isSelected && styles.typePillActive,
                ]}
                onPress={() => onChange({ businessType: bt.id })}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typePillText,
                    isSelected && styles.typePillTextActive,
                  ]}
                >
                  {bt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Field 3: Business Category Dropdown with Icons */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          BUSINESS CATEGORY <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setCategoryModalVisible(true)}
          activeOpacity={0.8}
        >
          {selectedCategoryObj ? (
            <View style={styles.selectedCategoryRow}>
              <View style={[styles.selectedThumbnailCircle, { backgroundColor: selectedCategoryObj.bgPastel }]}>
                <Image
                  source={selectedCategoryObj.iconImage}
                  style={styles.selectedThumbnailImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.selectedCategoryText} numberOfLines={1}>
                {selectedCategoryObj.name}
              </Text>
            </View>
          ) : (
            <View style={styles.placeholderRow}>
              <Icon name="tag-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.dropdownPlaceholder}>Select fashion category</Text>
            </View>
          )}
          <Icon name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Field 4: Brief Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          BRIEF DESCRIPTION <Text style={styles.optionalText}>(OPTIONAL)</Text>
        </Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Tell buyers what makes your brand unique..."
          placeholderTextColor="#94A3B8"
          value={data.description}
          onChangeText={(text) => onChange({ description: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Fashion Category</Text>
                <Text style={styles.modalSubtitle}>What does your boutique specialize in?</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {SELLER_FASHION_CATEGORIES.map((cat) => {
                const isSelected = data.businessCategory === cat.name;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOptionCard,
                      isSelected && styles.categoryOptionCardActive,
                    ]}
                    onPress={() => {
                      onChange({ businessCategory: cat.name });
                      setCategoryModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.catIconCircle, { backgroundColor: cat.bgPastel }, isSelected && styles.catIconCircleActive]}>
                      <Image
                        source={cat.iconImage}
                        style={styles.catImageThumb}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.catTextCol}>
                      <View style={styles.catTitleRow}>
                        <Text style={[styles.catName, isSelected && styles.catNameActive]}>
                          {cat.name}
                        </Text>
                        {cat.badge && (
                          <View style={styles.catBadge}>
                            <Text style={styles.catBadgeText}>{cat.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.catSubtitle} numberOfLines={1}>
                        {cat.subtitle}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Icon name="check-circle" size={22} color="#2563EB" />
                    ) : (
                      <View style={styles.unselectedIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  optionalText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 74,
    paddingTop: 10,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typePillActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  typePillTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10.5,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  selectedCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedThumbnailCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  selectedThumbnailImage: {
    width: 22,
    height: 22,
  },
  selectedCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  catIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  catIconCircleActive: {
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  catImageThumb: {
    width: 44,
    height: 44,
  },
  catTextCol: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  catName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  catNameActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  catSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  catBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.4,
  },
  unselectedIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
  },
});
