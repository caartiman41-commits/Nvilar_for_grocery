import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationSelectionModal } from './LocationSelectionModal';
import { useLocationStore } from '../store/locationStore';

export interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  showProfile?: boolean;
  title?: string;
  subtitle?: string;
  showLanguage?: boolean;
  showNotification?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = (props) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const location = useLocationStore((state) => state.currentLocation);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <LocationSelectionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.profileBtn}>
            <Icon name="account-outline" size={24} color="#004d40" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.locationContainer} 
            activeOpacity={0.7} 
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.locationTitleRow}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {location ? location.addressTitle : 'Add Your Location'}
              </Text>
              <Icon name="chevron-down" size={18} color="#fff" />
            </View>
            {location && (
              <Text style={styles.locationSubtitle} numberOfLines={1}>
                {location.addressSubtitle}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.langBtn}>
              <Icon name="web" size={14} color="#fff" style={{marginRight: 4}} />
              <Text style={styles.langText}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn}>
              <Icon name="bell-outline" size={24} color="#fff" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchBar}>
          <Icon name="magnify" size={22} color="rgba(255, 255, 255, 0.7)" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search 'Fish', 'Eggs' or 'Meat'"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            editable={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#004236',
  },
  container: {
    backgroundColor: '#004236',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f0ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
    maxWidth: '85%',
  },
  locationSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
    maxWidth: '90%',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  langText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bellBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffb800',
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 15,
  }
});
