import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { formatINR } from '../../../utils/formatters';
import { PricePoint } from '../types';

export interface PriceHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  productTitle: string;
  originalPrice: number;
  priceHistory: PricePoint[];
  onBuyAtLowestPrice?: (price: number) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = memo(({
  visible,
  onClose,
  productTitle,
  originalPrice,
  priceHistory,
  onBuyAtLowestPrice,
}) => {
  const currentLowest = priceHistory.find((p) => p.isLowest) || priceHistory[priceHistory.length - 1];
  const lowestPrice = currentLowest?.price || 2859;

  // Calculate coordinates for graph nodes
  const graphWidth = Dimensions.get('window').width - 72; // Padding compensation
  const graphHeight = 90;
  
  const minPrice = Math.min(...priceHistory.map((p) => p.price)) - 100;
  const maxPrice = Math.max(...priceHistory.map((p) => p.price)) + 100;
  const priceRange = maxPrice - minPrice || 1;

  const points = priceHistory.map((p, index) => {
    const x = (index / (priceHistory.length - 1)) * graphWidth;
    // Normalized y where lowest price is near bottom of graph
    const normalizedY = 1 - (p.price - minPrice) / priceRange;
    const y = 14 + normalizedY * (graphHeight - 28);
    return { ...p, x, y };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header with Sparkle Icons & Close Button */}
          <View style={styles.headerRow}>
            <View style={styles.sparkleTitleRow}>
              <Text style={styles.sparkle}>✦</Text>
              <Text style={styles.headerTitle}> 7-DAY PRICE TREND </Text>
              <Text style={styles.sparkle}>✦</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Icon name="close" size={18} color="#4A3B32" />
            </TouchableOpacity>
          </View>

          {/* Product Title in Luxury Serif */}
          <Text style={styles.title} numberOfLines={2}>
            {productTitle}
          </Text>

          {/* Price & Lowest Badge Row */}
          <View style={styles.priceRow}>
            <View style={styles.priceLeft}>
              <Text style={styles.lowestPriceText}>{formatINR(lowestPrice)}</Text>
              <Text style={styles.strikethroughText}>{formatINR(originalPrice)}</Text>
              <View style={styles.lowestBadge}>
                <Text style={styles.lowestBadgeText}>LOWEST</Text>
              </View>
            </View>

            <View style={styles.todayPill}>
              <Text style={styles.todayPillText}>Today</Text>
            </View>
          </View>

          {/* Trend Graph Container */}
          <View style={styles.graphContainer}>
            {/* Shaded Gradient Area Under Curve */}
            <LinearGradient
              colors={['rgba(214, 185, 150, 0.45)', 'rgba(250, 245, 237, 0.05)']}
              style={styles.gradientFill}
            />

            {/* Dotted Horizontal Reference Guideline */}
            <View style={styles.dashedGuideline} />

            {/* Plotted Line Segments connecting points */}
            {points.map((pt, i) => {
              if (i === 0) return null;
              const prev = points[i - 1];
              const dx = pt.x - prev.x;
              const dy = pt.y - prev.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);

              return (
                <View
                  key={`line_${i}`}
                  style={[
                    styles.lineSegment,
                    {
                      width: length,
                      left: prev.x + 8,
                      top: prev.y + 8,
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateY: -1.5 },
                      ],
                    },
                  ]}
                />
              );
            })}

            {/* Point Nodes */}
            {points.map((pt, i) => {
              const isToday = i === points.length - 1;
              return (
                <View
                  key={`node_${i}`}
                  style={[
                    styles.nodeDot,
                    { left: pt.x + 3, top: pt.y + 3 },
                    isToday ? styles.nodeToday : styles.nodeRegular,
                  ]}
                />
              );
            })}

            {/* Days Horizontal Labels */}
            <View style={styles.labelsRow}>
              {priceHistory.map((p, i) => {
                const isToday = i === priceHistory.length - 1;
                return (
                  <Text
                    key={`lbl_${i}`}
                    style={[styles.dayLabel, isToday && styles.dayLabelToday]}
                  >
                    {p.day}
                  </Text>
                );
              })}
            </View>
          </View>

          {/* Direct Buy CTA Button */}
          <TouchableOpacity
            style={styles.buyCTA}
            onPress={() => {
              onClose();
              if (onBuyAtLowestPrice) {
                onBuyAtLowestPrice(lowestPrice);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.buyCTAText}>BUY AT {formatINR(lowestPrice)}</Text>
            <Icon name="arrow-top-right" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 16, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sparkleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 13,
    color: '#8C5338',
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6F4E37',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 16,
    color: colors.burgundy,
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lowestPriceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B18',
  },
  strikethroughText: {
    fontSize: 14,
    color: '#8F827A',
    textDecorationLine: 'line-through',
  },
  lowestBadge: {
    backgroundColor: colors.verifiedGreen,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowestBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  todayPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
  },
  graphContainer: {
    height: 120,
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  gradientFill: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 20,
    bottom: 24,
    borderRadius: 8,
  },
  dashedGuideline: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 36,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140, 83, 56, 0.25)',
  },
  lineSegment: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: '#7A5230',
    transformOrigin: 'left center',
  },
  nodeDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  nodeRegular: {
    backgroundColor: '#FAF5ED',
    borderWidth: 2.5,
    borderColor: '#7A5230',
  },
  nodeToday: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  dayLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8F827A',
  },
  dayLabelToday: {
    fontWeight: '900',
    color: '#1E1B18',
  },
  buyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.burgundy,
    borderRadius: 16,
    paddingVertical: 13,
  },
  buyCTAText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
