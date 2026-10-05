import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { requestLocationPermission, getCurrentLocation, reverseGeocode } from '../services/LocationService';
import { useLocationStore } from '../store/locationStore';
import { AddLocationModal } from './AddLocationModal';

interface LocationSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const setLocation = useLocationStore((state) => state.setLocation);

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Location permission denied.');
        setLoading(false);
        return;
      }

      const position = await getCurrentLocation();
      const address = await reverseGeocode(position.latitude, position.longitude);

      setLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        addressTitle: address.title,
        addressSubtitle: address.subtitle,
      });
      
      setLoading(false);
      onClose(); // Close the modal after getting location
    } catch (error: any) {
      console.error(error);
      Alert.alert(`Location Error: ${error.message || 'Failed to get location'}`);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible && !showAddForm} transparent animationType="slide" onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                <View style={styles.dragHandle} />
                <Text style={styles.title}>Select a Location</Text>

                <TouchableOpacity 
                  style={styles.optionItem} 
                  onPress={handleCurrentLocation}
                  disabled={loading}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="crosshairs-gps" size={24} color="#004236" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Current Location</Text>
                    <Text style={styles.optionSubtitle}>Using GPS, WiFi or Cell Network</Text>
                  </View>
                  {loading && <ActivityIndicator color="#004236" />}
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.optionItem} onPress={() => {
                  setShowAddForm(true);
                }}>
                  <View style={styles.iconContainer}>
                    <Icon name="plus" size={24} color="#004236" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Add Location</Text>
                    <Text style={styles.optionSubtitle}>Search or pick on map</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AddLocationModal 
        visible={showAddForm} 
        onClose={() => {
          setShowAddForm(false);
          onClose(); // Close entirely when manual form is saved/closed
        }} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f0ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004236',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
    marginLeft: 64,
  },
});
