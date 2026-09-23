import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { ProductSizeOption } from '../types';

export interface ProductSizeSelectorProps {
  sizes: ProductSizeOption[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = memo(({
  sizes,
  selectedSize,
  onSelectSize,
}) => {
  const [sizeChartVisible, setSizeChartVisible] = useState(false);

  const currentOption = sizes.find((s) => s.size === selectedSize) || sizes[0];
  const stockCount = currentOption?.stock || 0;

  return (
    <View style={styles.cardContainer}>
      {/* Header: SELECT SIZE • Standard Fit & SIZE CHART */}
      <View style={styles.headerRow}>
        <View style={styles.leftTitleRow}>
          <Text style={styles.mainTitle}>SELECT SIZE</Text>
          <Text style={styles.fitSubtitle}> • Standard Fit</Text>
        </View>

        <TouchableOpacity
          style={styles.sizeChartBtn}
          onPress={() => setSizeChartVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="ruler" size={14} color="#334155" style={{ marginRight: 4 }} />
          <Text style={styles.sizeChartText}>SIZE CHART</Text>
        </TouchableOpacity>
      </View>

      {/* Size Pills Row */}
      <View style={styles.pillsRow}>
        {sizes.map((option) => {
          const isSelected = selectedSize === option.size;
          return (
            <TouchableOpacity
              key={option.size}
              style={[
                styles.sizePill,
                isSelected ? styles.sizePillActive : styles.sizePillInactive,
              ]}
              onPress={() => onSelectSize(option.size)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.sizeText,
                  isSelected ? styles.sizeTextActive : styles.sizeTextInactive,
                ]}
              >
                {option.size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stock Urgency Banner (Alert capsule matching Screenshot 2) */}
      {stockCount <= 5 && stockCount > 0 && (
        <View style={styles.urgencyCapsule}>
          <View style={styles.redDot} />
          <Text style={styles.urgencyText}>
            HURRY, ONLY {stockCount} LEFT IN SIZE {selectedSize}!
          </Text>
        </View>
      )}

      {/* Size Chart Modal - Lazy Mount on Demand */}
      {sizeChartVisible && (
        <Modal
          visible={sizeChartVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSizeChartVisible(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Standard Fit Measurements</Text>
              <TouchableOpacity onPress={() => setSizeChartVisible(false)}>
                <Icon name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.cell, styles.headerCell]}>Size</Text>
                  <Text style={[styles.cell, styles.headerCell]}>Chest (in)</Text>
                  <Text style={[styles.cell, styles.headerCell]}>Length (in)</Text>
                  <Text style={[styles.cell, styles.headerCell]}>Shoulder (in)</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.cell}>S</Text>
                  <Text style={styles.cell}>38 - 40</Text>
                  <Text style={styles.cell}>28.5</Text>
                  <Text style={styles.cell}>18.0</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.cell}>M</Text>
                  <Text style={styles.cell}>40 - 42</Text>
                  <Text style={styles.cell}>29.5</Text>
                  <Text style={styles.cell}>19.0</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.cell}>L</Text>
                  <Text style={styles.cell}>42 - 44</Text>
                  <Text style={styles.cell}>30.5</Text>
                  <Text style={styles.cell}>20.0</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.cell}>XL</Text>
                  <Text style={styles.cell}>44 - 46</Text>
                  <Text style={styles.cell}>31.5</Text>
                  <Text style={styles.cell}>21.0</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.cell}>XXL</Text>
                  <Text style={styles.cell}>46 - 48</Text>
                  <Text style={styles.cell}>32.5</Text>
                  <Text style={styles.cell}>22.0</Text>
                </View>
              </View>
              <Text style={styles.chartFootnote}>
                * All measurements are in inches. Designed for an effortless relaxed/oversized drape.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  fitSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  sizeChartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeChartText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.3,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sizePill: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizePillInactive: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  sizePillActive: {
    backgroundColor: '#3B111A',
    borderWidth: 1.2,
    borderColor: '#3B111A',
    shadowColor: '#3B111A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  sizeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sizeTextInactive: {
    color: '#334155',
  },
  sizeTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  urgencyCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  urgencyText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  headerCell: {
    fontWeight: '800',
    color: '#0F172A',
  },
  chartFootnote: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
