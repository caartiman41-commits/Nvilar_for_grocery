import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatINR } from '../../utils/formatters';
import { showToast } from '../../components/MitrenoToast';

// -----------------------------------------------------------------------------
// MAIN ORDER SUCCESS SCREEN COMPONENT
// -----------------------------------------------------------------------------
export const OrderSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderReference = route.params?.orderReference || 'MIT-75605';
  const totalAmount = route.params?.totalAmount || 3559;
  const deliveryTimeframe = route.params?.deliveryTimeframe || 'Standard Delivery (2-3 Business Days)';

  const iconScale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Success circular badge pop with elastic spring
    iconScale.value = withDelay(150, withSpring(1, { damping: 12, stiffness: 140 }));
    // 2. White checkmark pops in
    checkScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 160 }));
    // 3. Card and actions rise smoothly
    cardOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    cardScale.value = withDelay(500, withSpring(1, { damping: 14, stiffness: 120 }));

    try {
      AccessibilityInfo.announceForAccessibility('Order placed successfully! Mitreno boutique is packing your order.');
    } catch (e) {
      console.log('Accessibility announcement error:', e);
    }
  }, [cardOpacity, cardScale, checkScale, iconScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const handleCopyReference = () => {
    try {
      Clipboard.setString(orderReference);
      showToast({
        type: 'success',
        title: 'Copied! 📋',
        message: `Order reference #${orderReference} copied to clipboard.`,
      });
    } catch {
      Alert.alert('Order Reference', `#${orderReference}`);
    }
  };

  const handleViewOrderDetails = () => {
    // Navigate straight to Orders screen
    navigation.replace('Orders');
  };

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'ExploreTab' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Close Button ('X') */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleContinueShopping}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        {/* Animated Celebration Icon with Emerald Glow */}
        <Animated.View style={[styles.badgeContainer, iconStyle]}>
          <View style={styles.outerGlow}>
            <View style={styles.innerCheckCircle}>
              <Animated.View style={checkStyle}>
                <Icon name="check" size={38} color="#FFFFFF" />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Verification Status Pill */}
        <View style={styles.verifiedPill}>
          <Icon name="check-circle-outline" size={15} color="#059669" style={{ marginRight: 6 }} />
          <Text style={styles.verifiedPillText}>VERIFIED & PAYMENT CONFIRMED</Text>
        </View>

        {/* Big Bold Headline */}
        <Text style={styles.headline}>Order Placed Successfully!</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your payment is verified. The boutique has received your order and started packing.
        </Text>

        {/* Order Summary Info Card matching Screenshot */}
        <Animated.View style={[styles.infoCard, cardAnimStyle]}>
          <View style={styles.infoCardRow}>
            <Text style={styles.infoLabel}>Order Reference</Text>
            <TouchableOpacity
              style={styles.orderRefPill}
              onPress={handleCopyReference}
              activeOpacity={0.8}
            >
              <Text style={styles.orderRefText}>{orderReference}</Text>
              <Icon name="content-copy" size={13} color="#2563EB" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.infoCardBottomRow}>
            <View style={styles.infoColLeft}>
              <Text style={styles.subInfoLabel}>Expected Arrival</Text>
              <Text style={styles.subInfoValue} numberOfLines={2}>
                {deliveryTimeframe}
              </Text>
            </View>

            <View style={styles.infoColRight}>
              <Text style={styles.subInfoLabelRight}>Total Amount</Text>
              <Text style={styles.subInfoPrice}>{formatINR(totalAmount)}</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons at the Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={handleViewOrderDetails}
          activeOpacity={0.85}
        >
          <Text style={styles.viewDetailsText}>VIEW ORDER DETAILS</Text>
          <Icon name="arrow-right" size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueShoppingBtn}
          onPress={handleContinueShopping}
          activeOpacity={0.85}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // UI Structure
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginTop: -20,
  },
  badgeContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#DCFCE7', // Soft mint glow
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCheckCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#059669', // Emerald green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  verifiedPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  infoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  orderRefPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  orderRefText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  infoCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoColLeft: {
    flex: 1.2,
    paddingRight: 8,
  },
  subInfoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  subInfoValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  infoColRight: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  subInfoLabelRight: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  subInfoPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1D4ED8',
    letterSpacing: -0.2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 10,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155DFC',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#155DFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  continueShoppingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
  },
  continueShoppingText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
});
