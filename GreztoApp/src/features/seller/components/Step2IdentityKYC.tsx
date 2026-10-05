import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { IdentityKYCData } from '../sellerOnboardingTypes';
import { showToast } from '../../../components/MitrenoToast';

export interface Step2IdentityKYCProps {
  data: IdentityKYCData;
  onChange: (data: Partial<IdentityKYCData>) => void;
}

export const Step2IdentityKYC: React.FC<Step2IdentityKYCProps> = memo(({
  data,
  onChange,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeDocType, setActiveDocType] = useState<'aadhar' | 'pan' | null>(null);
  const [loadingType, setLoadingType] = useState<'aadhar' | 'pan' | null>(null);

  // Format Aadhar Number into 4 4 4 standard groups (e.g. 1234 5678 9012)
  const handleAadharChange = useCallback((text: string) => {
    const rawDigits = text.replace(/\D/g, '').slice(0, 12);
    const parts: string[] = [];
    for (let i = 0; i < rawDigits.length; i += 4) {
      parts.push(rawDigits.slice(i, i + 4));
    }
    const formatted = parts.join(' ');
    onChange({ aadharNumber: formatted });
  }, [onChange]);

  // Format PAN number into uppercase alphanumeric max 10 chars
  const handlePanChange = useCallback((text: string) => {
    const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    onChange({ panNumber: clean });
  }, [onChange]);

  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber);
  const isPanPartial = data.panNumber.length > 0 && data.panNumber.length < 10;
  const isPanInvalidFull = data.panNumber.length === 10 && !isPanValid;

  const handleOpenPicker = (type: 'aadhar' | 'pan') => {
    setActiveDocType(type);
    setPickerVisible(true);
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'Mitreno needs camera access to capture your official KYC document.',
            buttonPositive: 'Allow Access',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const handleSelectSource = async (source: 'gallery' | 'files' | 'camera') => {
    const targetType = activeDocType;
    setPickerVisible(false);
    if (!targetType) return;

    setLoadingType(targetType);

    try {
      let response: ImagePickerResponse | null = null;

      if (source === 'camera') {
        const hasPerm = await requestCameraPermission();
        if (!hasPerm) {
          Alert.alert('Camera Permission', 'Camera permission is required to photograph your ID document.');
          setLoadingType(null);
          return;
        }
        response = await launchCamera({
          mediaType: 'photo',
          cameraType: 'back',
          quality: 0.8,
          saveToPhotos: false,
        });
      } else {
        // Gallery or Browse Files
        response = await launchImageLibrary({
          mediaType: source === 'files' ? 'mixed' : 'photo',
          quality: 0.8,
          selectionLimit: 1,
        });
      }

      if (response && !response.didCancel && response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const pickedUri = asset.uri || '';
        const fallbackName = `${targetType === 'aadhar' ? 'Aadhaar_Doc' : 'PAN_Doc'}_${Date.now().toString().slice(-4)}.jpg`;
        const pickedName = asset.fileName || fallbackName;

        if (targetType === 'aadhar') {
          onChange({
            aadharCardUri: pickedUri,
            aadharFileName: pickedName,
          });
          showToast({
            type: 'success',
            title: 'Aadhaar Attached',
            message: 'Aadhaar Card uploaded successfully.',
          });
        } else {
          onChange({
            panCardUri: pickedUri,
            panFileName: pickedName,
          });
          showToast({
            type: 'success',
            title: 'PAN Attached',
            message: 'PAN Card uploaded successfully.',
          });
        }
      } else if (response && response.errorMessage) {
        Alert.alert('Upload Error', response.errorMessage);
      }
    } catch (err: any) {
      console.error('Picker error:', err);
      Alert.alert('Selection Error', 'Unable to pick document. Please try again.');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Proprietor Identity & Personal KYC</Text>
      <Text style={styles.subtitle}>
        Personal verification for your sole proprietorship boutique or brand
      </Text>

      {/* Field 1: Owner Legal Full Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          OWNER FULL NAME (LEGAL) <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="As per government ID"
          placeholderTextColor="#94A3B8"
          value={data.legalName}
          onChangeText={(text) => onChange({ legalName: text })}
          autoCapitalize="words"
        />
      </View>

      {/* Row: Phone Number & Email */}
      <View style={styles.twoColRow}>
        <View style={[styles.fieldGroup, { flex: 1.1 }]}>
          <Text style={styles.fieldLabel}>
            PHONE NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.phoneNumberInput]}
              placeholder="9864975438"
              placeholderTextColor="#94A3B8"
              value={data.phone}
              onChangeText={(text) => onChange({ phone: text.replace(/\D/g, '').slice(0, 10) })}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="you@email.com"
            placeholderTextColor="#94A3B8"
            value={data.email}
            onChangeText={(text) => onChange({ email: text.trim().toLowerCase() })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Aadhar Card Card */}
      <View style={styles.docCard}>
        <View style={styles.docCardHeader}>
          <View style={styles.docCardTitleRow}>
            <Icon name="shield-check-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.docCardTitle}>Aadhaar Card</Text>
          </View>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredBadgeText}>REQUIRED</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            AADHAAR NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#94A3B8"
            value={data.aadharNumber}
            onChangeText={handleAadharChange}
            keyboardType="numeric"
            maxLength={14} // 12 digits + 2 spaces
          />
        </View>

        {/* Aadhaar Card Upload Box */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            AADHAAR CARD (upload) <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              data.aadharCardUri ? styles.uploadBoxDone : null,
            ]}
            onPress={() => handleOpenPicker('aadhar')}
            activeOpacity={0.8}
            disabled={loadingType === 'aadhar'}
          >
            {loadingType === 'aadhar' ? (
              <View style={styles.uploadPlaceholderCol}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.uploadLoadingText}>Opening document picker...</Text>
              </View>
            ) : data.aadharCardUri ? (
              <View style={styles.uploadedContentRow}>
                {data.aadharCardUri.startsWith('http') || data.aadharCardUri.startsWith('file:') || data.aadharCardUri.startsWith('content:') ? (
                  <Image
                    source={{ uri: data.aadharCardUri }}
                    style={styles.thumbnailPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.docIconBox}>
                    <Icon name="file-document-check" size={24} color="#059669" />
                  </View>
                )}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.uploadedFileName} numberOfLines={1}>
                    {data.aadharFileName || 'Aadhaar_Document.jpg'}
                  </Text>
                  <View style={styles.verifiedTagRow}>
                    <Icon name="check-decagram" size={13} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.uploadedFileSub}>Ready for verification • Tap to replace</Text>
                  </View>
                </View>
                <Icon name="swap-horizontal" size={18} color="#059669" />
              </View>
            ) : (
              <View style={styles.uploadPlaceholderCol}>
                <View style={styles.uploadIconCircle}>
                  <Icon name="tray-arrow-up" size={22} color="#2563EB" />
                </View>
                <Text style={styles.uploadText}>Tap to upload Aadhaar Card</Text>
                <Text style={styles.uploadHelperText}>Gallery, Camera, or PDF/Doc file</Text>
              </View>
            )}
          </TouchableOpacity>
          {Boolean(data.aadharCardUri) && (
            <TouchableOpacity
              style={styles.removeFileBtn}
              onPress={() => onChange({ aadharCardUri: undefined, aadharFileName: undefined })}
              activeOpacity={0.7}
            >
              <Icon name="trash-can-outline" size={15} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.removeFileText}>Remove Aadhaar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* PAN Card Card */}
      <View style={styles.docCard}>
        <View style={styles.docCardHeader}>
          <View style={styles.docCardTitleRow}>
            <Icon name="file-document-outline" size={18} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.docCardTitle}>PAN Card</Text>
          </View>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredBadgeText}>REQUIRED</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            PAN NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textInput,
              isPanValid ? styles.textInputValid : null,
              isPanInvalidFull ? styles.textInputError : null,
            ]}
            placeholder="AAAAA9999A"
            placeholderTextColor="#94A3B8"
            value={data.panNumber}
            onChangeText={handlePanChange}
            autoCapitalize="characters"
            maxLength={10}
          />
          {isPanValid && (
            <View style={styles.panValidationRow}>
              <Icon name="check-circle" size={14} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.panValidText}>Valid PAN format (5 letters, 4 numbers, 1 letter)</Text>
            </View>
          )}
          {isPanInvalidFull && (
            <View style={styles.panValidationRow}>
              <Icon name="alert-circle" size={14} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.panInvalidText}>Invalid PAN format. Must be e.g. ABCDE1234F</Text>
            </View>
          )}
          {isPanPartial && (
            <View style={styles.panValidationRow}>
              <Icon name="information-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.panHintText}>Format: 5 letters, 4 numbers, 1 letter ({data.panNumber.length}/10)</Text>
            </View>
          )}
        </View>

        {/* PAN Card Upload Box */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            PAN CARD (upload) <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              data.panCardUri ? styles.uploadBoxDone : null,
            ]}
            onPress={() => handleOpenPicker('pan')}
            activeOpacity={0.8}
            disabled={loadingType === 'pan'}
          >
            {loadingType === 'pan' ? (
              <View style={styles.uploadPlaceholderCol}>
                <ActivityIndicator size="small" color="#EA580C" />
                <Text style={styles.uploadLoadingText}>Opening document picker...</Text>
              </View>
            ) : data.panCardUri ? (
              <View style={styles.uploadedContentRow}>
                {data.panCardUri.startsWith('http') || data.panCardUri.startsWith('file:') || data.panCardUri.startsWith('content:') ? (
                  <Image
                    source={{ uri: data.panCardUri }}
                    style={styles.thumbnailPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.docIconBox}>
                    <Icon name="file-document-check" size={24} color="#059669" />
                  </View>
                )}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.uploadedFileName} numberOfLines={1}>
                    {data.panFileName || 'PAN_Document.jpg'}
                  </Text>
                  <View style={styles.verifiedTagRow}>
                    <Icon name="check-decagram" size={13} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.uploadedFileSub}>Ready for verification • Tap to replace</Text>
                  </View>
                </View>
                <Icon name="swap-horizontal" size={18} color="#059669" />
              </View>
            ) : (
              <View style={styles.uploadPlaceholderCol}>
                <View style={[styles.uploadIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <Icon name="tray-arrow-up" size={22} color="#EA580C" />
                </View>
                <Text style={styles.uploadText}>Tap to upload PAN Card</Text>
                <Text style={styles.uploadHelperText}>Gallery, Camera, or PDF/Doc file</Text>
              </View>
            )}
          </TouchableOpacity>
          {Boolean(data.panCardUri) && (
            <TouchableOpacity
              style={styles.removeFileBtn}
              onPress={() => onChange({ panCardUri: undefined, panFileName: undefined })}
              activeOpacity={0.7}
            >
              <Icon name="trash-can-outline" size={15} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.removeFileText}>Remove PAN Card</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Optional Documents Section */}
      <View style={styles.optionalSection}>
        <Text style={styles.optionalSectionHeader}>OPTIONAL DOCUMENTS</Text>

        <View style={styles.twoColRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>VOTER ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              placeholderTextColor="#94A3B8"
              value={data.voterId}
              onChangeText={(text) => onChange({ voterId: text.toUpperCase() })}
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>DRIVING LICENSE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Optional"
              placeholderTextColor="#94A3B8"
              value={data.drivingLicense}
              onChangeText={(text) => onChange({ drivingLicense: text.toUpperCase() })}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>GST NUMBER</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Optional — 15 characters"
            placeholderTextColor="#94A3B8"
            value={data.gstNumber}
            onChangeText={(text) => onChange({ gstNumber: text.toUpperCase().slice(0, 15) })}
            autoCapitalize="characters"
            maxLength={15}
          />
        </View>
      </View>

      {/* Document Picker Bottom Sheet Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Upload {activeDocType === 'aadhar' ? 'Aadhaar Card' : 'PAN Card'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose upload source from your mobile device
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerOptionsContainer}>
              <TouchableOpacity
                style={styles.pickerOptionCard}
                onPress={() => handleSelectSource('gallery')}
                activeOpacity={0.7}
              >
                <View style={[styles.pickerIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Icon name="image-multiple" size={22} color="#2563EB" />
                </View>
                <View style={styles.pickerTextCol}>
                  <Text style={styles.pickerOptionTitle}>Choose from Photos / Gallery</Text>
                  <Text style={styles.pickerOptionSubtitle}>Select clear front/back photo of ID</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickerOptionCard}
                onPress={() => handleSelectSource('files')}
                activeOpacity={0.7}
              >
                <View style={[styles.pickerIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="folder-outline" size={22} color="#D97706" />
                </View>
                <View style={styles.pickerTextCol}>
                  <Text style={styles.pickerOptionTitle}>Browse Device Files</Text>
                  <Text style={styles.pickerOptionSubtitle}>Upload PDF, JPG, or PNG document</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickerOptionCard}
                onPress={() => handleSelectSource('camera')}
                activeOpacity={0.7}
              >
                <View style={[styles.pickerIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Icon name="camera-outline" size={22} color="#059669" />
                </View>
                <View style={styles.pickerTextCol}>
                  <Text style={styles.pickerOptionTitle}>Take Photo with Camera</Text>
                  <Text style={styles.pickerOptionSubtitle}>Snap physical card on flat surface</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryCodeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneNumberInput: {
    flex: 1,
  },
  docCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  docCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  docCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  requiredBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  requiredBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  uploadBoxDone: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
    paddingVertical: 10,
  },
  uploadPlaceholderCol: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  uploadHelperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  uploadLoadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  uploadedContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  thumbnailPreview: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  docIconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedFileName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  verifiedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  uploadedFileSub: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  optionalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    marginBottom: 18,
  },
  optionalSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  removeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  removeFileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  textInputValid: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  panValidationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  panValidText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  panInvalidText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  panHintText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  pickerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  pickerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickerTextCol: {
    flex: 1,
  },
  pickerOptionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerOptionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
});
