import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export interface MitrenoHeaderProps {
  locationName?: string;
  onLocationPress?: () => void;
  onFilterPress?: () => void;
  onSearchPress?: () => void;
  hasActiveFilter?: boolean;
}

export const MitrenoHeader: React.FC<MitrenoHeaderProps> = ({
  locationName = 'Kolkata, WB',
  onLocationPress,
  onFilterPress,
  onSearchPress,
  hasActiveFilter = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleLocationPress = () => {
    if (onLocationPress) {
      onLocationPress();
    } else {
      Alert.alert(
        'Delivery Location',
        `Current selected location: ${locationName}.\nAutomatic satellite GPS sync is active.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      Alert.alert('Filter Boutiques', 'Sort by: Price, Rating, Discounts & Hyperlocal distance.');
    }
  };

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
      {/* ROW 1: EXPLORING LOCATION | NVILAR BRAND LOGO | COMPACT 3-LINE FILTER BUTTON */}
      <View style={styles.topRow}>
        {/* Left: Exploring + Location */}
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={handleLocationPress}
          activeOpacity={0.7}
        >
          <Text style={styles.exploringLabel}>EXPLORING</Text>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={15} color="#2563EB" style={styles.markerIcon} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
            <Icon name="chevron-down" size={15} color="#64748B" style={styles.chevronIcon} />
          </View>
        </TouchableOpacity>

        {/* Center: NVILAR Royal Electric Violet-Indigo Brand Logo */}
        <View style={styles.logoCenterCol}>
          <Image
            source={require('../assets/nvilar_logo_header.png')}
            style={{ width: 132, height: 27 }}
            resizeMode="contain"
          />
        </View>

        {/* Right: Compact 3-Line Filter Button */}
        <View style={styles.rightActionCol}>
          <TouchableOpacity
            style={[styles.filterThreeLineBtn, hasActiveFilter && styles.filterThreeLineBtnActive]}
            onPress={handleFilterPress}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              name="menu"
              size={21}
              color={hasActiveFilter ? '#FFFFFF' : '#0F172A'}
            />
            {hasActiveFilter && <View style={styles.activeFilterDotCorner} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ROW 2: SEARCH BAR */}
      <TouchableOpacity
        style={styles.searchBarRow}
        onPress={handleSearchPress}
        activeOpacity={0.85}
      >
        <Icon name="magnify" size={19} color="#64748B" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          Search local stores, streetwear, jackets...
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  exploringLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.1,
    marginBottom: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerIcon: {
    marginRight: 3,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  chevronIcon: {
    marginLeft: 2,
  },
  logoCenterCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 23,
    fontWeight: '900',
    color: '#1E0B12',
    letterSpacing: -0.5,
  },
  rightActionCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  filterThreeLineBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterThreeLineBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  activeFilterDotCorner: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    height: 42,
    paddingHorizontal: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 9,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
