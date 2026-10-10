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
import { WholesaleVerticalId } from '../../home/data/wholesaleHubData';
import { formatINR } from '../../../utils/formatters';

export interface ProductSizeSelectorProps {
  sizes?: ProductSizeOption[];
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
  minOrder?: number;
  sizeQuantities?: Record<string, number>;
  unitPrice?: number;
  onViewCart?: () => void;
  vertical?: WholesaleVerticalId;
  unitSpec?: string;
  cartQuantityForProduct?: number;
  onSelectLotQuantity?: (qty: number) => void;
}

export const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = memo(({
  sizes = [],
  selectedSize = 'M',
  onSelectSize,
  minOrder = 6,
  sizeQuantities = {},
  unitPrice,
  onViewCart,
  vertical = 'fashion',
  unitSpec = 'Master Wholesale Pack',
  cartQuantityForProduct = 0,
  onSelectLotQuantity,
}) => {
  const [sizeChartVisible, setSizeChartVisible] = useState(false);
  const [selectedLotMultiplier, setSelectedLotMultiplier] = useState<number>(1);

  const isFashion = vertical === 'fashion';

  // Normalize available sizes for fashion
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
    if (!isFashion) return cartQuantityForProduct;
    return Object.values(sizeQuantities).reduce((acc, qty) => acc + (qty || 0), 0);
  }, [isFashion, cartQuantityForProduct, sizeQuantities]);

  // Non-Fashion Wholesale Pack & Lot Selector (Electronics, Ration, Pharmacy, Beauty, Home, Kids, Imported)
  if (!isFashion) {
    const unitNoun =
      vertical === 'ration'
        ? 'Packs / Boris'
        : vertical === 'pharmacy'
        ? 'Boxes / Strips'
        : 'Units';

    const headerTitle =
      vertical === 'ration'
        ? 'SELECT WHOLESALE PACK / BORI'
        : vertical === 'pharmacy'
        ? 'SELECT PHARMA WHOLESALE PACK'
        : vertical === 'electronics'
        ? 'SELECT WHOLESALE LOT / CARTON'
        : 'SELECT WHOLESALE PACK / LOT';

    const headerIcon =
      vertical === 'ration'
        ? 'sack'
        : vertical === 'pharmacy'
        ? 'medical-bag'
        : vertical === 'electronics'
        ? 'lightning-bolt-circle'
        : 'package-variant-closed';

    const lotOptions = [
      { mult: 1, label: `1 Lot (${minOrder} Pcs)`, qty: minOrder },
      { mult: 2, label: `2 Lots (${minOrder * 2} Pcs)`, qty: minOrder * 2 },
      { mult: 5, label: `Bulk (${minOrder * 5} Pcs)`, qty: minOrder * 5 },
    ];

    return (
      <View style={styles.cardContainer}>
        {/* 1. Header: Category-Specific Wholesale Pack Title & Verified Badge */}
        <View style={styles.headerRow}>
          <View style={styles.leftTitleRow}>
            <Icon name={headerIcon} size={16} color="#0F172A" style={{ marginRight: 6 }} />
            <Text style={styles.mainTitle}>{headerTitle}</Text>
          </View>

          <View style={styles.verifiedPackBadge}>
            <Icon name="check-decagram" size={12} color="#059669" style={{ marginRight: 3 }} />
            <Text style={styles.verifiedPackBadgeText}>B2B LOT</Text>
          </View>
        </View>

        {/* 2. Prominent Pack / Bori / Carton Specification Strip */}
        <View style={styles.packSpecBanner}>
          <View style={styles.packSpecLeft}>
            <Text style={styles.packSpecSubLabel}>PACK / UNIT SPECIFICATION</Text>
            <Text style={styles.packSpecValueText} numberOfLines={1}>
              {unitSpec}
            </Text>
          </View>
          {typeof unitPrice === 'number' && unitPrice > 0 && (
            <View style={styles.packSpecRight}>
              <Text style={styles.packSpecSubLabel}>LOT VALUE ({minOrder} PCS)</Text>
              <Text style={styles.packSpecLotPrice}>
                {formatINR(unitPrice * minOrder)}
              </Text>
            </View>
          )}
        </View>

        {/* 3. Quick Wholesale Lot Selector Buttons */}
        <View style={styles.pillsRow}>
          {lotOptions.map((opt) => {
            const isSelected =
              cartQuantityForProduct > 0
                ? cartQuantityForProduct === opt.qty
                : selectedLotMultiplier === opt.mult;
            return (
              <TouchableOpacity
                key={opt.mult}
                style={[styles.lotPill, isSelected && styles.sizePillSelected]}
                onPress={() => {
                  setSelectedLotMultiplier(opt.mult);
                  onSelectLotQuantity?.(opt.qty);
                }}
                activeOpacity={0.78}
              >
                <Text
                  style={[
                    styles.lotPillText,
                    isSelected && styles.sizePillTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Prominent Single-Line MOQ Notice */}
        <View style={styles.moqNoticeRow}>
          <Icon name="package-variant-closed" size={15} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.moqNoticeText} numberOfLines={1}>
            Minimum Order:{' '}
            <Text style={styles.moqNoticeBold}>
              {minOrder} {unitNoun} ({unitSpec})
            </Text>
          </Text>
        </View>

        {/* 5. Live Wholesale Bag Selection Breakdown */}
        {totalSelectedPieces > 0 && (
          <View style={styles.bagSelectionCard}>
            <View style={styles.bagSelectionHeader}>
              <View style={styles.bagSelectionTitleRow}>
                <Icon name="clipboard-check-outline" size={14} color="#059669" style={{ marginRight: 5 }} />
                <Text style={styles.bagSelectionTitle}>Your Bag Selection:</Text>
              </View>

              {onViewCart && (
                <TouchableOpacity
                  style={styles.viewCartHeaderBtn}
                  onPress={onViewCart}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.viewCartHeaderText}>View Cart</Text>
                  <Icon name="arrow-right" size={12} color="#15803D" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bagSelectionItemsRow}>
              <View style={styles.bagSelectionChip}>
                <Text style={styles.bagSelectionChipText}>
                  {unitSpec}: <Text style={styles.bagSelectionChipBold}>QNT = {totalSelectedPieces}</Text>
                </Text>
              </View>
            </View>

            {typeof unitPrice === 'number' && unitPrice > 0 && (
              <View style={styles.bagSelectionTotalRow}>
                <Text style={styles.bagSelectionTotalText}>
                  Total: <Text style={styles.bagSelectionTotalBold}>{totalSelectedPieces} Units</Text> •{' '}
                  <Text style={styles.bagSelectionTotalBold}>{formatINR(totalSelectedPieces * unitPrice)}</Text>
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* 1. Header: SELECT SIZE & SIZE GUIDE (Fashion / Garments Only) */}
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
            <View style={styles.bagSelectionTitleRow}>
              <Icon name="clipboard-check-outline" size={14} color="#059669" style={{ marginRight: 5 }} />
              <Text style={styles.bagSelectionTitle}>Your Bag Selection:</Text>
            </View>

            {onViewCart && (
              <TouchableOpacity
                style={styles.viewCartHeaderBtn}
                onPress={onViewCart}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.viewCartHeaderText}>View Cart</Text>
                <Icon name="arrow-right" size={12} color="#15803D" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            )}
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
  verifiedPackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedPackBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.3,
  },
  packSpecBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 10,
  },
  packSpecLeft: {
    flex: 1,
    paddingRight: 8,
  },
  packSpecRight: {
    alignItems: 'flex-end',
  },
  packSpecSubLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  packSpecValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  packSpecLotPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#059669',
  },
  lotPill: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  lotPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bagSelectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bagSelectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.2,
  },
  viewCartHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  viewCartHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.1,
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
