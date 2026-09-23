import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export interface BoutiqueHeaderProps {
  onBack?: () => void;
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
}

export const BoutiqueHeader: React.FC<BoutiqueHeaderProps> = ({
  onBack,
  onRefresh,
  title = 'Brands to Bag: Curated Bou...',
  subtitle = '11 Curated Boutique Pieces • Direct Deals from Verifie...',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <View style={styles.contentRow}>
        {/* Left Back Circle Button */}
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={20} color={colors.burgundy} />
        </TouchableOpacity>

        {/* Center Title & Subtitle */}
        <View style={styles.centerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* Right Refresh Circle Button */}
        <TouchableOpacity 
          style={styles.circleBtn} 
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={20} color={colors.burgundy} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warmBackground,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.warmPillBg,
    borderWidth: 1,
    borderColor: colors.warmPillBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 17,
    color: colors.burgundy,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMutedWarm,
    marginTop: 2,
  },
});
