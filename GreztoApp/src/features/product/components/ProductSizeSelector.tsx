import React, { useState, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProductSizeOption } from '../types';
import { formatINR } from '../../../utils/formatters';

export interface ProductSizeSelectorProps {
  sizes?: ProductSizeOption[];
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
  minOrder?: number;
  sizeQuantities?: Record<string, number>;
  unitPrice?: number;
}

export const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = memo(({
  sizes = [],
  selectedSize = 'M',
  onSelectSize,
  minOrder = 6,
  sizeQuantities = {},
  unitPrice,
}) => {
  const [sizeChartVisible, setSizeChartVisible] = useState(false);

  // Normalize available sizes
  const availableSizes = useMemo(() => {
    if (sizes && sizes.length > 0) {
      return sizes;
    }
    return [
      { size: 'S', stock: 20 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 20 },
    ];
  }, [sizes]);

  // Compute total selected pieces across all sizes
  const totalSelectedPieces = useMemo(() => {
    return Object.values(sizeQuantities).reduce((acc, qty) => acc + (qty || 0), 0);
  }, [sizeQuantities]);

  return (
    <View style={styles.cardContainer}>
      {/* 1. Header: SELECT SIZE & SIZE GUIDE */}
      <View style={styles.headerRow}>
        <View style={styles.leftTitleRow}>
          <Icon name="tag-outline" size={15} color="#0F172A" style={{ marginRight: 5 }} />
          <Text style={styles.mainTitle}>SELECT SIZE</Text>
          <Text style={styles.activeSizeLabel}> • Size {selectedSize}</Text>
        </View>

        <TouchableOpacity
          style={styles.sizeChartBtn}
          onPress={() => setSizeChartVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="ruler" size={13} color="#334155" style={{ marginRight: 4 }} />
          <Text style={styles.sizeChartText}>SIZE GUIDE</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Compact Sleek Size Buttons Row (Height 42px, No "1 pc" sub-labels) */}
      <View style={styles.pillsRow}>
        {availableSizes.map((item) => {
          const sz = item.size;
          const isSelected = selectedSize === sz;
          const inCartCount = sizeQuantities[sz] || 0;

          return (
            <TouchableOpacity
              key={sz}
              style={[
                styles.sizePill,
                isSelected && styles.sizePillSelected,
              ]}
              onPress={() => onSelectSize?.(sz)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.sizePillText,
                  isSelected && styles.sizePillTextSelected,
                ]}
              >
                {sz}
              </Text>

              {inCartCount > 0 && (
                <View
                  style={[
                    styles.inCartBadge,
                    isSelected && styles.inCartBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.inCartBadgeText,
                      isSelected && styles.inCartBadgeTextSelected,
                    ]}
                  >
                    {inCartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Prominent Single-Line MOQ Notice */}
      <View style={styles.moqNoticeRow}>
        <Icon name="package-variant-closed" size={15} color="#2563EB" style={{ marginRight: 6 }} />
        <Text style={styles.moqNoticeText}>
          Minimum Order: <Text style={styles.moqNoticeBold}>{minOrder} pieces per size</Text>
        </Text>
      </View>

      {/* 4. Live Multi-Size Order Breakdown Card (Zero Confusion for Dukandar) */}
      {totalSelectedPieces > 0 && (
        <View style={styles.bagSelectionCard}>
          <View style={styles.bagSelectionHeader}>
            <Icon name="clipboard-check-outline" size={14} color="#059669" style={{ marginRight: 5 }} />
            <Text style={styles.bagSelectionTitle}>Your Bag Selection:</Text>
          </View>

          <View style={styles.bagSelectionItemsRow}>
            {Object.entries(sizeQuantities).map(([sz, qty]) => {
              if (!qty || qty <= 0) return null;
              return (
                <View key={sz} style={styles.bagSelectionChip}>
                  <Text style={styles.bagSelectionChipText}>
                    Size {sz}: <Text style={styles.bagSelectionChipBold}>{qty} pcs</Text>
                  </Text>
                </View>
              );
            })}
          </View>

          {typeof unitPrice === 'number' && unitPrice > 0 && (
            <View style={styles.bagSelectionTotalRow}>
              <Text style={styles.bagSelectionTotalText}>
                Total: <Text style={styles.bagSelectionTotalBold}>{totalSelectedPieces} Pieces</Text> •{' '}
                <Text style={styles.bagSelectionTotalBold}>{formatINR(totalSelectedPieces * unitPrice)}</Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 5. Size Chart Modal - Lazy Mount on Demand */}
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
                  * All measurements are in inches. Designed for relaxed garment fitting.
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
    borderColor: '#E2E8F0',
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
  activeSizeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
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
    marginBottom: 10,
  },
  sizePill: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sizePillSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    borderWidth: 1.5,
  },
  sizePillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  sizePillTextSelected: {
    color: '#FFFFFF',
  },
  inCartBadge: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
  },
  inCartBadgeSelected: {
    backgroundColor: '#10B981',
  },
  inCartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inCartBadgeTextSelected: {
    color: '#FFFFFF',
  },
  moqNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  moqNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
  },
  moqNoticeBold: {
    fontWeight: '900',
    color: '#1D4ED8',
  },
  bagSelectionCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  bagSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bagSelectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.2,
  },
  bagSelectionItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  bagSelectionChip: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bagSelectionChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#14532D',
  },
  bagSelectionChipBold: {
    fontWeight: '800',
    color: '#166534',
  },
  bagSelectionTotalRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  bagSelectionTotalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  bagSelectionTotalBold: {
    fontWeight: '800',
    color: '#0F172A',
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
