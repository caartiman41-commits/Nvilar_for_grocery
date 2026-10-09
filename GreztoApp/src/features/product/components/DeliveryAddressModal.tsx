import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCheckoutStore, CheckoutAddress } from '../../checkout/checkoutStore';
import {
  requestLocationPermission,
  getCurrentLocation,
  reverseGeocode,
} from '../../../services/LocationService';
import { showToast } from '../../../components/MitrenoToast';

export interface DeliveryAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress?: (address: CheckoutAddress) => void;
}

interface FormAddressState {
  yourName: string;
  phone: string;
  houseNoName: string;
  nearbyArea: string;
  pincode: string;
  cityVillage: string;
  state: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
}

const defaultFormState: FormAddressState = {
  yourName: 'ASHAFUL ISLAM',
  phone: '9864975438',
  houseNoName: '',
  nearbyArea: '',
  pincode: '',
  cityVillage: '',
  state: 'Assam',
  addressType: 'HOME',
};

export const DeliveryAddressModal: React.FC<DeliveryAddressModalProps> = memo(({
  visible,
  onClose,
  onSelectAddress,
}) => {
  const addresses = useCheckoutStore((s) => s.addresses);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const setSelectedAddressId = useCheckoutStore((s) => s.setSelectedAddressId);
  const setDraftField = useCheckoutStore((s) => s.setDraftField);
  const saveDraftAsNew = useCheckoutStore((s) => s.saveDraftAsNew);
  const updateDraftAsExisting = useCheckoutStore((s) => s.updateDraftAsExisting);
  const deleteAddress = useCheckoutStore((s) => s.deleteAddress);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormAddressState>(defaultFormState);
  const [activeActionSheetAddress, setActiveActionSheetAddress] = useState<CheckoutAddress | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingGPSInForm, setIsFetchingGPSInForm] = useState(false);

  // Filter addresses based on search query
  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) {
      return addresses;
    }
    const q = searchQuery.toLowerCase().trim();
    return addresses.filter((addr) => {
      const fullText = [
        addr.houseNoName,
        addr.nearbyArea,
        addr.cityVillage,
        addr.state,
        addr.pincode,
        addr.yourName,
        addr.phone,
        addr.addressType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return fullText.includes(q);
    });
  }, [addresses, searchQuery]);

  const handleSelectAddress = useCallback((address: CheckoutAddress) => {
    setSelectedAddressId(address.id);
    onSelectAddress?.(address);
    onClose();
  }, [setSelectedAddressId, onSelectAddress, onClose]);

  const handleOpenAddForm = useCallback(() => {
    setEditingAddressId(null);
    setFormData(defaultFormState);
    setViewMode('form');
  }, []);

  const handleOpenEditForm = useCallback((addr: CheckoutAddress) => {
    setActiveActionSheetAddress(null);
    setEditingAddressId(addr.id);
    setFormData({
      yourName: addr.yourName || 'ASHAFUL ISLAM',
      phone: addr.phone || '9864975438',
      houseNoName: addr.houseNoName || '',
      nearbyArea: addr.nearbyArea || '',
      pincode: addr.pincode || '',
      cityVillage: addr.cityVillage || '',
      state: addr.state || 'Assam',
      addressType: addr.addressType || 'HOME',
    });
    setViewMode('form');
  }, []);

  const handleDeleteAddressConfirm = useCallback((addr: CheckoutAddress) => {
    setActiveActionSheetAddress(null);
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(addr.id);
          },
        },
      ]
    );
  }, [deleteAddress]);

  // Quick Action: Use Current Location
  const handleUseCurrentLocation = useCallback(async () => {
    try {
      setIsLocating(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast({
          type: 'warning',
          title: 'Location Error',
          message: 'Please enable location services so Nvilar can detect your delivery address.',
        });
        setIsLocating(false);
        return;
      }

      const position = await getCurrentLocation();
      const geo = await reverseGeocode(position.latitude, position.longitude);

      const titleParts = geo.title ? geo.title.split(',') : ['Current Location'];
      const houseNo = titleParts[0]?.trim() || 'Current Location';
      const area = titleParts.slice(1).join(', ')?.trim() || geo.subtitle || 'Nearby';
      const pincodeMatch = geo.subtitle.match(/\b\d{6}\b/);
      const pincode = pincodeMatch ? pincodeMatch[0] : '781022';
      const cityVillage = geo.subtitle.split(',')[0]?.trim() || 'Guwahati';

      // Set draft fields and save as new
      setDraftField('yourName', 'ASHAFUL ISLAM');
      setDraftField('phone', '9864975438');
      setDraftField('houseNoName', houseNo);
      setDraftField('nearbyArea', area);
      setDraftField('cityVillage', cityVillage);
      setDraftField('state', 'Assam');
      setDraftField('pincode', pincode);
      setDraftField('addressType', 'HOME');
      setDraftField('distance', '0m');
      setDraftField('gpsLocation', `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`);

      saveDraftAsNew();

      const created = useCheckoutStore.getState().addresses[0];
      if (created) {
        setSelectedAddressId(created.id);
        onSelectAddress?.(created);
      }

      setIsLocating(false);
      onClose();
    } catch (err: any) {
      setIsLocating(false);
      showToast({
        type: 'warning',
        title: 'Location Error',
        message: err?.message || 'Could not fetch current GPS location. Please choose a saved address or enter manually.',
      });
    }
  }, [setDraftField, saveDraftAsNew, setSelectedAddressId, onSelectAddress, onClose]);

  // In-form GPS autofill
  const handleFormGPSFetch = useCallback(async () => {
    try {
      setIsFetchingGPSInForm(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast({
          type: 'warning',
          title: 'Location Error',
          message: 'Please grant location permission to autofill your address.',
        });
        setIsFetchingGPSInForm(false);
        return;
      }
      const position = await getCurrentLocation();
      const geo = await reverseGeocode(position.latitude, position.longitude);

      const titleParts = geo.title ? geo.title.split(',') : ['Current Area'];
      const houseNo = titleParts[0]?.trim() || '';
      const area = titleParts.slice(1).join(', ')?.trim() || geo.subtitle;
      const pincodeMatch = geo.subtitle.match(/\b\d{6}\b/);
      const pincode = pincodeMatch ? pincodeMatch[0] : '';
      const cityVillage = geo.subtitle.split(',')[0]?.trim() || '';

      setFormData((prev) => ({
        ...prev,
        houseNoName: houseNo || prev.houseNoName,
        nearbyArea: area || prev.nearbyArea,
        cityVillage: cityVillage || prev.cityVillage,
        pincode: pincode || prev.pincode,
        state: 'Assam',
      }));
    } catch (error: any) {
      showToast({
        type: 'warning',
        title: 'Location Error',
        message: error?.message || 'Failed to retrieve GPS location.',
      });
    } finally {
      setIsFetchingGPSInForm(false);
    }
  }, []);

  // Save Add/Edit Address Form
  const handleSaveForm = useCallback(() => {
    if (!formData.yourName.trim()) {
      showToast({ type: 'error', title: 'Required Field', message: 'Please enter your contact name.' });
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      showToast({ type: 'error', title: 'Invalid Phone', message: 'Please enter a valid 10-digit phone number.' });
      return;
    }
    if (!formData.houseNoName.trim()) {
      showToast({ type: 'error', title: 'Required Field', message: 'Please enter flat, house no., or building name.' });
      return;
    }
    if (!formData.nearbyArea.trim()) {
      showToast({ type: 'error', title: 'Required Field', message: 'Please enter street, area, or colony.' });
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length !== 6) {
      showToast({ type: 'error', title: 'Invalid Pincode', message: 'Please enter a valid 6-digit postal pincode.' });
      return;
    }
    if (!formData.cityVillage.trim()) {
      showToast({ type: 'error', title: 'Required Field', message: 'Please enter city or village.' });
      return;
    }
    if (!formData.state.trim()) {
      showToast({ type: 'error', title: 'Required Field', message: 'Please enter state.' });
      return;
    }

    setDraftField('yourName', formData.yourName.trim());
    setDraftField('phone', formData.phone.trim());
    setDraftField('houseNoName', formData.houseNoName.trim());
    setDraftField('nearbyArea', formData.nearbyArea.trim());
    setDraftField('pincode', formData.pincode.trim());
    setDraftField('cityVillage', formData.cityVillage.trim());
    setDraftField('state', formData.state.trim());
    setDraftField('addressType', formData.addressType);

    if (editingAddressId) {
      updateDraftAsExisting(editingAddressId);
      setSelectedAddressId(editingAddressId);
      const updated = useCheckoutStore.getState().addresses.find((a) => a.id === editingAddressId);
      if (updated) {
        onSelectAddress?.(updated);
      }
    } else {
      setDraftField('distance', '0m');
      saveDraftAsNew();
      const created = useCheckoutStore.getState().addresses[0];
      if (created) {
        setSelectedAddressId(created.id);
        onSelectAddress?.(created);
      }
    }

    setViewMode('list');
    onClose();
  }, [
    formData,
    editingAddressId,
    setDraftField,
    updateDraftAsExisting,
    saveDraftAsNew,
    setSelectedAddressId,
    onSelectAddress,
    onClose,
  ]);

  const handleHeaderBack = useCallback(() => {
    if (viewMode === 'form') {
      setViewMode('list');
    } else {
      onClose();
    }
  }, [viewMode, onClose]);

  const renderCard = (address: CheckoutAddress) => {
    const isSelected = address.id === selectedAddressId;
    const addressTitle = address.addressType || (address.yourName ? address.yourName.toUpperCase() : 'HOME');

    const formattedAddress = [
      address.houseNoName,
      address.nearbyArea,
      address.cityVillage,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    const iconName =
      address.addressType === 'HOME'
        ? 'home-outline'
        : address.addressType === 'WORK'
        ? 'briefcase-outline'
        : 'map-marker-outline';

    const distanceLabel = address.distance || '35m';

    return (
      <TouchableOpacity
        key={address.id}
        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
        onPress={() => handleSelectAddress(address)}
        activeOpacity={0.85}
      >
        {/* Left Column: Icon container + Distance */}
        <View style={styles.cardLeftCol}>
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={22} color="#1E293B" />
          </View>
          <Text style={styles.distanceText}>{distanceLabel}</Text>
        </View>

        {/* Middle Column: Title + Pill + Full Address + Phone */}
        <View style={styles.cardMiddleCol}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.addressTitleText}>{addressTitle}</Text>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>Selected</Text>
              </View>
            )}
          </View>

          <Text style={styles.addressBodyText} numberOfLines={3}>
            {formattedAddress}
          </Text>

          <View style={styles.phoneRow}>
            <Icon name="phone-outline" size={13} color="#64748B" style={styles.phoneIcon} />
            <Text style={styles.phoneText}>{address.phone || '9864975438'}</Text>
          </View>
        </View>

        {/* Right Column: Three dots action menu */}
        <TouchableOpacity
          style={styles.moreActionBtn}
          onPress={() => setActiveActionSheetAddress(address)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icon name="dots-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          {/* Sheet Handle */}
          <View style={styles.dragHandle} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleHeaderBack}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={22} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {viewMode === 'form'
                ? editingAddressId
                  ? 'Edit address'
                  : 'Add new address'
                : 'Select delivery address'}
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Icon name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* VIEW MODE: LIST */}
          {viewMode === 'list' ? (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Icon name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search an area or address"
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Quick Action Buttons (2 Side-by-Side) */}
              <View style={styles.quickActionsRow}>
                {/* Button 1: Use current location */}
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                  activeOpacity={0.8}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <Icon name="crosshairs-gps" size={18} color="#2563EB" />
                  )}
                  <Text style={styles.quickActionText}>
                    {isLocating ? 'Locating...' : 'Use current location'}
                  </Text>
                </TouchableOpacity>

                {/* Button 2: Add new address */}
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={handleOpenAddForm}
                  activeOpacity={0.8}
                >
                  <Icon name="plus" size={18} color="#2563EB" />
                  <Text style={styles.quickActionText}>Add new address</Text>
                </TouchableOpacity>
              </View>

              {/* Section Header */}
              <Text style={styles.sectionHeader}>Saved addresses</Text>

              {/* Address Cards List */}
              {filteredAddresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="map-marker-question-outline" size={44} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>No address found</Text>
                  <Text style={styles.emptySub}>
                    Try searching for another keyword or add a new delivery address above.
                  </Text>
                </View>
              ) : (
                filteredAddresses.map(renderCard)
              )}
            </ScrollView>
          ) : (
            /* VIEW MODE: ADD / EDIT FORM */
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Type Selector (HOME / WORK / OTHER) */}
              <Text style={styles.formLabel}>Address Type</Text>
              <View style={styles.typeSelectorRow}>
                {(['HOME', 'WORK', 'OTHER'] as const).map((t) => {
                  const isCurrentType = formData.addressType === t;
                  const typeIcon =
                    t === 'HOME'
                      ? 'home-outline'
                      : t === 'WORK'
                      ? 'briefcase-outline'
                      : 'map-marker-outline';

                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typePill,
                        isCurrentType && styles.typePillActive,
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, addressType: t }))}
                      activeOpacity={0.8}
                    >
                      <Icon
                        name={typeIcon}
                        size={16}
                        color={isCurrentType ? '#FFFFFF' : '#475569'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.typePillText,
                          isCurrentType && styles.typePillTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* GPS Autofill Assistant */}
              <TouchableOpacity
                style={styles.gpsAssistBtn}
                onPress={handleFormGPSFetch}
                disabled={isFetchingGPSInForm}
                activeOpacity={0.8}
              >
                {isFetchingGPSInForm ? (
                  <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 8 }} />
                ) : (
                  <Icon name="crosshairs-gps" size={16} color="#2563EB" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.gpsAssistText}>
                  {isFetchingGPSInForm
                    ? 'Fetching GPS details...'
                    : 'Auto-fill current location from GPS'}
                </Text>
              </TouchableOpacity>

              {/* Contact Name */}
              <Text style={styles.formLabel}>Contact Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. ASHAFUL ISLAM"
                placeholderTextColor="#94A3B8"
                value={formData.yourName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, yourName: text }))}
              />

              {/* Phone Number */}
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={formData.phone}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
              />

              {/* Flat / House No / Building */}
              <Text style={styles.formLabel}>House / Flat / Building No *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 11, Bormotoria"
                placeholderTextColor="#94A3B8"
                value={formData.houseNoName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, houseNoName: text }))}
              />

              {/* Street / Nearby Area */}
              <Text style={styles.formLabel}>Street / Area / Landmark *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Kabarsthan Path, Six Mile"
                placeholderTextColor="#94A3B8"
                value={formData.nearbyArea}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, nearbyArea: text }))}
              />

              {/* Pincode & City 2-col row */}
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.formLabel}>Pincode *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="6-digit pincode"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.pincode}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, pincode: text }))}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.formLabel}>City / District *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Guwahati"
                    placeholderTextColor="#94A3B8"
                    value={formData.cityVillage}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, cityVillage: text }))}
                  />
                </View>
              </View>

              {/* State */}
              <Text style={styles.formLabel}>State *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Assam"
                placeholderTextColor="#94A3B8"
                value={formData.state}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, state: text }))}
              />

              {/* Save Address CTA Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveForm}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Action Sheet Popup for Three Dots (Edit / Delete) */}
          {activeActionSheetAddress && (
            <View style={styles.actionSheetBackdrop}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={() => setActiveActionSheetAddress(null)}
                activeOpacity={1}
              />
              <View style={styles.actionSheetContainer}>
                <View style={styles.actionSheetHandle} />
                <Text style={styles.actionSheetTitle}>Address Options</Text>
                <Text style={styles.actionSheetSub} numberOfLines={1}>
                  {[
                    activeActionSheetAddress.houseNoName,
                    activeActionSheetAddress.nearbyArea,
                    activeActionSheetAddress.cityVillage,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>

                <TouchableOpacity
                  style={styles.actionSheetBtn}
                  onPress={() => handleOpenEditForm(activeActionSheetAddress)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Icon name="pencil-outline" size={18} color="#2563EB" />
                  </View>
                  <Text style={styles.actionSheetBtnText}>Edit Address</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionSheetBtn}
                  onPress={() => handleDeleteAddressConfirm(activeActionSheetAddress)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <Icon name="trash-can-outline" size={18} color="#EF4444" />
                  </View>
                  <Text style={[styles.actionSheetBtnText, { color: '#EF4444' }]}>
                    Delete Address
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionSheetBtn, styles.actionCancelBtn]}
                  onPress={() => setActiveActionSheetAddress(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    minHeight: '65%',
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  formScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  addressCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#FAFDFB',
  },
  cardLeftCol: {
    alignItems: 'center',
    width: 48,
    marginRight: 6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  cardMiddleCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  addressTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  addressBodyText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#475569',
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  phoneIcon: {
    marginRight: 4,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  moreActionBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: '#0F172A',
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
  },
  typePillActive: {
    backgroundColor: '#0F172A',
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  gpsAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  gpsAssistText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 16,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  actionSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  actionSheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  actionSheetSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  actionSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionSheetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionCancelBtn: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: 6,
    paddingVertical: 10,
  },
  actionCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
});
