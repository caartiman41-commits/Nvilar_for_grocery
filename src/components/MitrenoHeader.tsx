import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
}

export const MitrenoHeader: React.FC<MitrenoHeaderProps> = ({
  locationName = 'Kolkata, WB',
  onLocationPress,
  onFilterPress,
  onSearchPress,
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
      {/* ROW 1: EXPLORING LOCATION | MITRENO BRAND LOGO | FILTER BUTTON */}
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

        {/* Center: Mitreno Luxury Serif Brand Name */}
        <View style={styles.logoCenterCol}>
          <Text style={styles.brandTitle}>Mitreno</Text>
        </View>

        {/* Right: Filter Pill Button */}
        <TouchableOpacity
          style={styles.filterPillBtn}
          onPress={handleFilterPress}
          activeOpacity={0.75}
        >
          <Icon name="tune-variant" size={14} color="#0F172A" style={{ marginRight: 4 }} />
          <Text style={styles.filterBtnText}>Filter</Text>
          <Icon name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>

      {/* ROW 2: SEARCH BAR */}
      <TouchableOpacity
        style={styles.searchBarRow}
        onPress={handleSearchPress}
        activeOpacity={0.85}
      >
        <Icon name="magnify" size={19} color="#8F827A" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          Search local stores, streetwear, jackets...
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.warmBackground,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1.1,
    justifyContent: 'center',
  },
  exploringLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8F827A',
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
    flex: 1,
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
  filterPillBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    backgroundColor: '#F3EDE2',
    borderWidth: 1,
    borderColor: '#E6DCCF',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 16,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    borderRadius: 22,
    height: 42,
    paddingHorizontal: 14,
    shadowColor: '#000',
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
