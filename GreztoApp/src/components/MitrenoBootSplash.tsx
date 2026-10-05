import React, { memo } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { typography } from '../theme/typography';

/**
 * MitrenoBootSplash: Luxury Brand Boot Splash Screen
 * Rendered during the first ~25ms cold boot while AsyncStorage rehydrates.
 * Prevents navigation race conditions and guarantees zero screen flickering.
 */
export const MitrenoBootSplash: React.FC = memo(() => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.brandBox}>
        <Text style={styles.brandTitle}>
          <Text style={styles.brandGoldM}>M</Text>ITRENO
        </Text>
        <Text style={styles.brandSubtitle}>THE PINNACLE OF BARGAINING</Text>
      </View>
      <View style={styles.loaderSlot}>
        <ActivityIndicator size="small" color="#C59A4E" />
      </View>
    </View>
  );
});

MitrenoBootSplash.displayName = 'MitrenoBootSplash';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 38,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandGoldM: {
    color: '#C59A4E', // Royal Mitreno Gold
    fontFamily: typography.fontFamily.serifBold,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 2.8,
    marginTop: 8,
    textAlign: 'center',
  },
  loaderSlot: {
    position: 'absolute',
    bottom: 56,
  },
});
