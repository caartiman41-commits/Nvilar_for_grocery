import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocationStore } from '../store/locationStore';
import { requestLocationPermission, getCurrentLocation } from '../services/LocationService';

interface AddLocationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({ visible, onClose }) => {
  const setLocation = useLocationStore((state) => state.setLocation);
  const [name, setName] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [roadArea, setRoadArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);

  const handleFetchGPS = async () => {
    try {
      setIsFetchingGPS(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsFetchingGPS(false);
        return;
      }
      const position = await getCurrentLocation();
      setLatitude(position.latitude);
      setLongitude(position.longitude);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingGPS(false);
    }
  };

  const handleSave = () => {
    if (!houseNo || !roadArea || !pincode || !stateName) return;

    const title = `${houseNo}, ${roadArea}`;
    const subtitle = `${stateName}, ${pincode}`;

    // Update global store
    setLocation({
      latitude: latitude || 0,
      longitude: longitude || 0,
      addressTitle: title,
      addressSubtitle: subtitle,
    });

    // Reset form and close
    setHouseNo('');
    setRoadArea('');
    setPincode('');
    setStateName('');
    onClose();
  };

  const isFormValid = name.trim() !== '' && houseNo.trim() !== '' && roadArea.trim() !== '' && pincode.length === 6 && stateName.trim() !== '';

  const getPincodeBorderColor = () => {
    if (pincode.length === 0) return '#ddd';
    return pincode.length === 6 ? '#4CAF50' : '#F44336';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <KeyboardAvoidingView 
          style={styles.overlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Add Manual Location</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 250 : 40 }}
              >
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John Doe"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>House / Flat No.</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 101"
                      value={houseNo}
                      onChangeText={setHouseNo}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.label}>Area / Road</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. MG Road"
                      value={roadArea}
                      onChangeText={setRoadArea}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>High Accuracy Latitude & Longitude</Text>
                  <TouchableOpacity 
                    style={[styles.input, styles.gpsBox]} 
                    onPress={handleFetchGPS}
                    disabled={isFetchingGPS}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.gpsText}>
                      {latitude && longitude ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : (isFetchingGPS ? 'Fetching...' : 'Get Exact Coordinates')}
                    </Text>
                    <Icon name={isFetchingGPS ? "loading" : "crosshairs-gps"} size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>Pincode</Text>
                    <TextInput
                      style={[styles.input, { borderColor: getPincodeBorderColor(), borderWidth: pincode.length > 0 ? 2 : 1 }]}
                      placeholder="e.g. 110001"
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="numeric"
                      maxLength={6}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Delhi"
                      value={stateName}
                      onChangeText={setStateName}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]} 
                  onPress={handleSave}
                  disabled={!isFormValid}
                >
                  <Text style={styles.saveBtnText}>Save Location</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  gpsBox: {
    backgroundColor: '#004236',
    borderColor: '#004236',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gpsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#004236',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
