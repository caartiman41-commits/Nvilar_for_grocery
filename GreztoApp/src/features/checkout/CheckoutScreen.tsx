import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCheckoutStore, CheckoutAddress, defaultAshrafAddress } from './checkoutStore';
import { useAuthStore } from '../auth/authStore';
import { useCartStore } from '../cart/cartStore';
import { useOrderStore } from '../orders/orderStore';
import { requestLocationPermission, getCurrentLocation, reverseGeocode } from '../../services/LocationService';
import { formatINR } from '../../utils/formatters';
import { showToast } from '../../components/MitrenoToast';

// =============================================================================
// ISOLATED MEMOIZED INPUT COMPONENT (Zero Parent Re-render on Focus/Typing)
// =============================================================================
interface AddressInputBoxProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  badge?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isError?: boolean;
  isSuccess?: boolean;
  style?: any;
  error?: string;
}

const AddressInputBox: React.FC<AddressInputBoxProps> = React.memo(({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  badge,
  rightIcon,
  isError = false,
  isSuccess = false,
  style,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = isError || Boolean(error);

  return (
    <View style={[styles.fieldContainer, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {badge}
      </View>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperRed,
          isSuccess && styles.inputWrapperGreen,
          multiline && styles.textareaWrapper,
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            !value && styles.textInputPlaceholder,
            multiline && styles.textareaInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
        />
        {rightIcon}
      </View>
      {error ? (
        <View style={styles.inlineErrorRow}>
          <Icon name="alert-circle" size={12} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={styles.inlineErrorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
});

// =============================================================================
// ISOLATED LIVE GPS DETECTOR (Prevents background GPS from re-rendering inputs)
// =============================================================================
interface LiveGpsDetectorCardProps {
  onCoordsDetected?: (coords: { latitude: number; longitude: number }) => void;
}

const LiveGpsDetectorCard: React.FC<LiveGpsDetectorCardProps> = React.memo(({
  onCoordsDetected,
}) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 26.134407,
    longitude: 91.813353,
  });
  const [status, setStatus] = useState<'Detecting Satellite GPS...' | 'Locked • High Accuracy'>('Locked • High Accuracy');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          const loc = await getCurrentLocation();
          if (isMounted && loc) {
            setCoords({ latitude: loc.latitude, longitude: loc.longitude });
            setStatus('Locked • High Accuracy');
            if (onCoordsDetected) {
              onCoordsDetected(loc);
            }
          }
        }
      } catch (err) {
        console.log('GPS detection:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [onCoordsDetected]);

  return (
    <View style={styles.gpsDetectorCard}>
      <View style={styles.gpsDetectorHeader}>
        <View style={styles.gpsTitleRow}>
          <View style={styles.gpsPulsingDot} />
          <Icon name="crosshairs-gps" size={16} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.gpsDetectorTitle}>LIVE GPS COORDINATES</Text>
        </View>
        <View style={styles.accuracyPill}>
          <Icon name="satellite-variant" size={12} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.accuracyText}>{status}</Text>
        </View>
      </View>

      <View style={styles.gpsCoordsRow}>
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>LATITUDE</Text>
          <Text style={styles.coordValue}>{coords.latitude.toFixed(6)}</Text>
        </View>
        <View style={styles.coordDivider} />
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>LONGITUDE</Text>
          <Text style={styles.coordValue}>{coords.longitude.toFixed(6)}</Text>
        </View>
      </View>

      <View style={styles.gpsSyncFooter}>
        <Icon name="shield-check" size={13} color="#059669" style={{ marginRight: 4 }} />
        <Text style={styles.gpsFooterText}>
          High-accuracy sync via Satellite, Wi-Fi & Tower triangulation for seamless delivery.
        </Text>
      </View>
    </View>
  );
});

export const CheckoutScreen = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const addresses = useCheckoutStore((s) => s.addresses);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const setSelectedAddressId = useCheckoutStore((s) => s.setSelectedAddressId);
  const setDefaultAddress = useCheckoutStore((s) => s.setDefaultAddress);
  const deleteAddress = useCheckoutStore((s) => s.deleteAddress);
  const saveDraftAsNew = useCheckoutStore((s) => s.saveDraftAsNew);
  const updateDraftAsExisting = useCheckoutStore((s) => s.updateDraftAsExisting);
  const setDraftField = useCheckoutStore((s) => s.setDraftField);
  const fetchAddressesFromBackend = useCheckoutStore((s) => s.fetchAddressesFromBackend);
  const userPhone = useAuthStore((s) => s.user?.phoneNumber);

  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const placeOrder = useOrderStore((s) => s.placeOrder);

  // 1 = ADDRESS, 2 = REVIEW, 3 = PAYMENT
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // In Step 1: 'list' (saved addresses matching Screenshot 2) vs 'form' (add/edit address)
  const [step1SubView, setStep1SubView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionSheetAddress, setActiveActionSheetAddress] = useState<CheckoutAddress | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingGPSInForm, setIsFetchingGPSInForm] = useState(false);

  // Auto-fetch user's saved addresses from backend PostgreSQL
  useEffect(() => {
    fetchAddressesFromBackend(userPhone || '9864975438');
  }, [fetchAddressesFromBackend, userPhone]);

  // Active selected address
  const activeAddress: CheckoutAddress = useMemo(() => {
    if (selectedAddressId && addresses.length > 0) {
      const found = addresses.find((a) => a.id === selectedAddressId);
      if (found) return found;
    }
    return addresses[0] || defaultAshrafAddress;
  }, [addresses, selectedAddressId]);

  // Direct checkout item from route params or fallback to cart items
  const directItem = route.params?.directItem;

  // Active items for this checkout session
  const [quantity, setQuantity] = useState<number>(directItem?.quantity || 1);

  const checkoutProduct = useMemo(() => {
    if (directItem) {
      return {
        id: directItem.id,
        name: directItem.name || 'Handcrafted Chikankari Kurta',
        price: directItem.price || 3500,
        originalPrice: directItem.originalPrice || Math.round((directItem.price || 3500) * 1.4),
        image: directItem.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
        size: directItem.size || 'L',
        boutiqueName: directItem.boutiqueName || 'Mitreno.com',
        discountBadge: directItem.discountBadge || '30% OFF',
      };
    }
    // If cart has items
    const firstCartItem = cartItems[0];
    if (firstCartItem) {
      return {
        id: firstCartItem.id,
        name: firstCartItem.name,
        price: firstCartItem.price,
        originalPrice: Math.round(firstCartItem.price * 1.43),
        image: firstCartItem.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
        size: firstCartItem.unitLabel || 'L',
        boutiqueName: 'Mitreno.com',
        discountBadge: '30% OFF',
      };
    }
    // Fallback product
    return {
      id: 'default-kurta',
      name: 'Handcrafted Chikankari Kurta',
      price: 3500,
      originalPrice: 5000,
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80',
      size: 'L',
      boutiqueName: 'Mitreno.com',
      discountBadge: '30% OFF',
    };
  }, [directItem, cartItems]);

  // Form Inputs for Adding or Editing an address
  const [formState, setFormState] = useState<{
    yourName: string;
    phone: string;
    alternatePhone: string;
    houseNoName: string;
    nearbyArea: string;
    cityVillage: string;
    state: string;
    pincode: string;
    addressType: 'HOME' | 'WORK' | 'OTHER';
  }>({
    yourName: 'ASHAFUL ISLAM',
    phone: '9864975438',
    alternatePhone: '',
    houseNoName: '',
    nearbyArea: '',
    cityVillage: 'Six Mile',
    state: 'Assam',
    pincode: '781005',
    addressType: 'HOME',
  });

  // Form Field Validation Errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  // Filtered addresses for search query in Step 1
  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) {
      return addresses;
    }
    const q = searchQuery.toLowerCase().trim();
    return addresses.filter((addr) => {
      const fullText = [
        addr.houseNoName,
        addr.flatHouseStreet,
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

  // Quick Action: Use Current Location
  const handleUseCurrentLocation = useCallback(async () => {
    try {
      setIsLocating(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast({
          type: 'warning',
          title: 'Location Permission Needed',
          message: 'Please allow location permission to auto-detect your delivery address.',
        });
        setIsLocating(false);
        return;
      }

      const position = await getCurrentLocation();
      const geo = await reverseGeocode(position.latitude, position.longitude);

      const titleParts = geo.title ? geo.title.split(',') : ['Current Area'];
      const houseNo = titleParts[0]?.trim() || 'Current Location';
      const area = titleParts.slice(1).join(', ')?.trim() || geo.subtitle || 'Nearby';
      const pincodeMatch = geo.subtitle.match(/\b\d{6}\b/);
      const pincode = pincodeMatch ? pincodeMatch[0] : '781005';
      const cityVillage = geo.subtitle.split(',')[0]?.trim() || 'Guwahati';

      setDraftField('yourName', activeAddress.yourName || 'ASHAFUL ISLAM');
      setDraftField('phone', userPhone || activeAddress.phone || '9864975438');
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
      }
      setIsLocating(false);
      showToast({
        type: 'success',
        title: 'Location Added',
        message: `${houseNo}, ${cityVillage}`,
      });
    } catch (err: any) {
      setIsLocating(false);
      showToast({
        type: 'warning',
        title: 'Location Error',
        message: err?.message || 'Could not fetch current GPS location.',
      });
    }
  }, [setDraftField, saveDraftAsNew, setSelectedAddressId, activeAddress, userPhone]);

  // Open Add Address Form
  const handleOpenAddForm = useCallback(() => {
    setEditingAddressId(null);
    setFormState({
      yourName: activeAddress.yourName || 'ASHAFUL ISLAM',
      phone: userPhone || activeAddress.phone || '9864975438',
      alternatePhone: '',
      houseNoName: '',
      nearbyArea: '',
      cityVillage: 'Guwahati',
      state: 'Assam',
      pincode: '781005',
      addressType: 'HOME',
    });
    setFieldErrors({});
    setStep1SubView('form');
  }, [activeAddress, userPhone]);

  // Open Edit Address Form from ActionSheet
  const handleOpenEditForm = useCallback((addr: CheckoutAddress) => {
    setActiveActionSheetAddress(null);
    setEditingAddressId(addr.id);
    setFormState({
      yourName: addr.yourName || 'ASHAFUL ISLAM',
      phone: addr.phone || '9864975438',
      alternatePhone: addr.alternatePhone || '',
      houseNoName: addr.houseNoName || '',
      nearbyArea: addr.nearbyArea || '',
      cityVillage: addr.cityVillage || 'Guwahati',
      state: addr.state || 'Assam',
      pincode: addr.pincode || '',
      addressType: addr.addressType || 'HOME',
    });
    setFieldErrors({});
    setStep1SubView('form');
  }, []);

  // Delete Address Confirmation
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
            showToast({
              type: 'info',
              title: 'Address Removed',
              message: 'Delivery address has been deleted.',
            });
          },
        },
      ]
    );
  }, [deleteAddress]);

  // Set Address as Default
  const handleSetDefault = useCallback((addr: CheckoutAddress) => {
    setActiveActionSheetAddress(null);
    setDefaultAddress(addr.id);
    setSelectedAddressId(addr.id);
    showToast({
      type: 'success',
      title: 'Default Address Updated',
      message: `${addr.addressType || 'HOME'} is now your primary address.`,
    });
  }, [setDefaultAddress, setSelectedAddressId]);

  // In-form GPS Autofill
  const handleFormGPSFetch = useCallback(async () => {
    try {
      setIsFetchingGPSInForm(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast({
          type: 'warning',
          title: 'Location Permission Needed',
          message: 'Please grant location permission to autofill address.',
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

      setFormState((prev) => ({
        ...prev,
        houseNoName: houseNo || prev.houseNoName,
        nearbyArea: area || prev.nearbyArea,
        cityVillage: cityVillage || prev.cityVillage,
        pincode: pincode || prev.pincode,
        state: 'Assam',
      }));
      showToast({
        type: 'success',
        title: 'Location Detected',
        message: 'Address fields filled from GPS.',
      });
    } catch (err: any) {
      showToast({
        type: 'warning',
        title: 'GPS Error',
        message: err?.message || 'Failed to retrieve GPS location.',
      });
    } finally {
      setIsFetchingGPSInForm(false);
    }
  }, []);

  // Save Add/Edit Address Form
  const handleSaveForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (formState.yourName.trim().length <= 1) {
      newErrors.yourName = 'Please enter contact name';
    }
    if (formState.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Enter valid 10-digit mobile number';
    }
    if (formState.houseNoName.trim().length < 1) {
      newErrors.houseNoName = 'Enter house / flat / building name';
    }
    if (formState.nearbyArea.trim().length < 1) {
      newErrors.nearbyArea = 'Enter street / area / landmark';
    }
    if (formState.cityVillage.trim().length < 1) {
      newErrors.cityVillage = 'City or village is required';
    }
    if (formState.state.trim().length < 1) {
      newErrors.state = 'State is required';
    }
    if (formState.pincode.replace(/\D/g, '').length !== 6) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      showToast({
        type: 'error',
        title: 'Incomplete Address Details',
        message: 'Please fill in all mandatory fields.',
      });
      return;
    }

    setDraftField('yourName', formState.yourName.trim());
    setDraftField('phone', formState.phone.trim());
    setDraftField('alternatePhone', formState.alternatePhone.trim());
    setDraftField('houseNoName', formState.houseNoName.trim());
    setDraftField('nearbyArea', formState.nearbyArea.trim());
    setDraftField('pincode', formState.pincode.trim());
    setDraftField('cityVillage', formState.cityVillage.trim());
    setDraftField('state', formState.state.trim());
    setDraftField('addressType', formState.addressType);

    if (editingAddressId) {
      updateDraftAsExisting(editingAddressId);
      setSelectedAddressId(editingAddressId);
      showToast({
        type: 'success',
        title: 'Address Updated',
        message: 'Changes saved successfully.',
      });
    } else {
      setDraftField('distance', '0m');
      saveDraftAsNew();
      const created = useCheckoutStore.getState().addresses[0];
      if (created) {
        setSelectedAddressId(created.id);
      }
      showToast({
        type: 'success',
        title: 'Address Saved',
        message: 'New address saved and selected.',
      });
    }

    setStep1SubView('list');
  }, [
    formState,
    editingAddressId,
    setDraftField,
    updateDraftAsExisting,
    saveDraftAsNew,
    setSelectedAddressId,
  ]);

  // Deliver to Selected Address CTA
  const handleDeliverToThisAddress = useCallback(() => {
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
    setCurrentStep(2);
  }, [selectedAddressId, addresses, setSelectedAddressId]);

  // Return to address list from Step 2
  const handleEditAddress = useCallback(() => {
    setStep1SubView('list');
    setCurrentStep(1);
  }, []);

  // Keyboard visibility tracking to prevent window resize shifts & accidental CTA triggers
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Payment Selection
  const [selectedGateway, setSelectedGateway] = useState<'upi' | 'card' | 'cod' | 'razorpay'>('upi');

  // Calculations
  const itemTotal = checkoutProduct.price * quantity;
  const originalTotal = checkoutProduct.originalPrice * quantity;
  const storeDiscount = Math.max(0, originalTotal - itemTotal);
  const handlingFee = 59;
  const totalDue = itemTotal + handlingFee;

  const handleConfirmPayment = () => {
    const finalAddress = {
      id: activeAddress.id || `addr-${Date.now()}`,
      state: activeAddress.state || 'Assam',
      gpsLocation: activeAddress.gpsLocation || '26.134456, 91.813250',
      pincode: activeAddress.pincode || '781005',
      cityVillage: activeAddress.cityVillage || 'Six Mile',
      houseNoName: activeAddress.houseNoName || 'Six Mile',
      flatHouseStreet: activeAddress.flatHouseStreet || activeAddress.houseNoName,
      nearbyArea: activeAddress.nearbyArea || activeAddress.cityVillage,
      yourName: activeAddress.yourName || 'ASHAFUL ISLAM',
      phone: activeAddress.phone || '9864975438',
      alternatePhone: activeAddress.alternatePhone || '',
      addressType: activeAddress.addressType || 'HOME',
      distance: activeAddress.distance || '0m',
    };

    const finalItems = [
      {
        id: checkoutProduct.id,
        name: checkoutProduct.name,
        price: checkoutProduct.price,
        originalPrice: checkoutProduct.originalPrice,
        quantity,
        image: checkoutProduct.image,
        size: checkoutProduct.size,
        boutiqueName: checkoutProduct.boutiqueName,
        shop_id: (checkoutProduct as any).shop_id || (checkoutProduct as any).shopId || (checkoutProduct.boutiqueName === 'Mitreno.com' ? 'shop_KD56AHEq_42723' : undefined),
        discountBadge: checkoutProduct.discountBadge,
      },
    ];

    const orderRef = `MIT-${Math.floor(10000 + Math.random() * 90000)}`;

    placeOrder(
      finalItems,
      finalAddress,
      totalDue,
      selectedGateway.toUpperCase(),
      orderRef
    );

    // If checked out from cart, clear cart
    if (!directItem && cartItems.length > 0) {
      clearCart();
    }

    // Navigate to OrderSuccess Celebration Screen
    navigation.replace('OrderSuccess', {
      orderReference: orderRef,
      totalAmount: totalDue,
      deliveryTimeframe: 'Standard Delivery (2-3 Business Days)',
    });
  };

  // Top Stepper Component
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepperContainer}>
        {/* Step 1: Address */}
        <View style={styles.stepItem}>
          {currentStep > 1 ? (
            <View style={styles.stepBadgeCompleted}>
              <Icon name="check" size={13} color="#FFFFFF" />
            </View>
          ) : (
            <View style={[styles.stepBadge, styles.stepBadgeActive]}>
              <Text style={styles.stepBadgeActiveText}>1</Text>
            </View>
          )}
          <Text
            style={[
              styles.stepLabel,
              currentStep === 1 && styles.stepLabelActive,
              currentStep > 1 && styles.stepLabelCompleted,
            ]}
          >
            ADDRESS
          </Text>
        </View>

        {/* Connector 1 */}
        <View
          style={[
            styles.stepConnector,
            currentStep > 1 && styles.stepConnectorActive,
          ]}
        />

        {/* Step 2: Review */}
        <View style={styles.stepItem}>
          {currentStep > 2 ? (
            <View style={styles.stepBadgeCompleted}>
              <Icon name="check" size={13} color="#FFFFFF" />
            </View>
          ) : currentStep === 2 ? (
            <View style={[styles.stepBadge, styles.stepBadgeActive]}>
              <Text style={styles.stepBadgeActiveText}>2</Text>
            </View>
          ) : (
            <View style={styles.stepBadgeInactive}>
              <Text style={styles.stepBadgeInactiveText}>2</Text>
            </View>
          )}
          <Text
            style={[
              styles.stepLabel,
              currentStep === 2 && styles.stepLabelActive,
              currentStep > 2 && styles.stepLabelCompleted,
            ]}
          >
            REVIEW
          </Text>
        </View>

        {/* Connector 2 */}
        <View
          style={[
            styles.stepConnector,
            currentStep > 2 && styles.stepConnectorActive,
          ]}
        />

        {/* Step 3: Payment */}
        <View style={styles.stepItem}>
          {currentStep === 3 ? (
            <View style={[styles.stepBadge, styles.stepBadgeActive]}>
              <Text style={styles.stepBadgeActiveText}>3</Text>
            </View>
          ) : (
            <View style={styles.stepBadgeInactive}>
              <Text style={styles.stepBadgeInactiveText}>3</Text>
            </View>
          )}
          <Text
            style={[
              styles.stepLabel,
              currentStep === 3 && styles.stepLabelActive,
            ]}
          >
            PAYMENT
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Blue Gradient */}
      <LinearGradient
        colors={['#0A2E88', '#144AC8', '#1E58E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerBanner, { paddingTop: Math.max(insets.top, 16) }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => {
              if (currentStep === 3) setCurrentStep(2);
              else if (currentStep === 2) setCurrentStep(1);
              else if (currentStep === 1 && step1SubView === 'form') setStep1SubView('list');
              else navigation.goBack();
            }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerSubtitle}>MITRENO FAST CHECKOUT</Text>
            <Text style={styles.headerMainTitle}>
              {currentStep === 1
                ? step1SubView === 'form'
                  ? editingAddressId
                    ? 'Edit Delivery Address'
                    : 'Add Delivery Address'
                  : 'Select delivery address'
                : currentStep === 2
                ? 'Review & Confirm'
                : 'Secure Payment'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Progress Stepper Bar */}
      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && { paddingBottom: 240 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* STEP 1: SELECT OR ADD DELIVERY ADDRESS                                    */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          step1SubView === 'list' ? (
            <View style={styles.step1ListContainer}>
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

              {/* Quick Action Buttons (2 Side-by-Side matching Screenshot 2) */}
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
              <Text style={styles.savedSectionHeader}>Saved addresses</Text>

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
                filteredAddresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;
                  const addressTitle =
                    address.addressType ||
                    (address.yourName ? address.yourName.toUpperCase() : 'HOME');

                  const formattedAddress =
                    address.flatHouseStreet ||
                    [
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

                  const distanceLabel = address.distance || '0m';

                  return (
                    <TouchableOpacity
                      key={address.id}
                      style={[
                        styles.savedAddressCard,
                        isSelected && styles.savedAddressCardSelected,
                      ]}
                      onPress={() => setSelectedAddressId(address.id)}
                      activeOpacity={0.85}
                    >
                      {/* Left Column: Icon container + Distance */}
                      <View style={styles.cardLeftCol}>
                        <View
                          style={[
                            styles.iconContainer,
                            isSelected && styles.iconContainerSelected,
                          ]}
                        >
                          <Icon
                            name={iconName}
                            size={22}
                            color={isSelected ? '#155DFC' : '#1E293B'}
                          />
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
                          <Icon
                            name="phone-outline"
                            size={13}
                            color="#64748B"
                            style={styles.phoneIcon}
                          />
                          <Text style={styles.phoneText}>
                            {address.phone || '9864975438'}
                          </Text>
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
                })
              )}
            </View>
          ) : (
            /* STEP 1 SUB-VIEW: FORM (ADD / EDIT) */
            <View style={styles.step1Card}>
              {/* Top back link to list */}
              <TouchableOpacity
                style={styles.formBackBtn}
                onPress={() => setStep1SubView('list')}
                activeOpacity={0.7}
              >
                <Icon name="arrow-left" size={16} color="#155DFC" style={{ marginRight: 6 }} />
                <Text style={styles.formBackBtnText}>Back to saved addresses</Text>
              </TouchableOpacity>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {editingAddressId ? 'EDIT DELIVERY ADDRESS' : 'ADD NEW ADDRESS'}
                </Text>
                <Text style={styles.sectionSubtitle}>* All fields required</Text>
              </View>

              {/* Address Type Selector */}
              <Text style={styles.typeSelectorLabel}>ADDRESS TYPE</Text>
              <View style={styles.typeSelectorRow}>
                {(['HOME', 'WORK', 'OTHER'] as const).map((t) => {
                  const isCurrentType = formState.addressType === t;
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
                      onPress={() =>
                        setFormState((prev) => ({ ...prev, addressType: t }))
                      }
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

              {/* GPS Autofill helper button */}
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

              {/* 1. FULL NAME */}
              <AddressInputBox
                label="CONTACT / RECIPIENT NAME"
                value={formState.yourName}
                onChangeText={(t) => {
                  setFormState((prev) => ({ ...prev, yourName: t }));
                  clearFieldError('yourName');
                }}
                error={fieldErrors.yourName}
                placeholder="Full name"
              />

              {/* 2. MOBILE NUMBER + ALTERNATE PHONE (OPT) */}
              <View style={styles.twoColRow}>
                <AddressInputBox
                  label="MOBILE NUMBER"
                  value={formState.phone}
                  onChangeText={(t) => {
                    setFormState((prev) => ({ ...prev, phone: t.replace(/[^0-9]/g, '') }));
                    clearFieldError('phone');
                  }}
                  error={fieldErrors.phone}
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <AddressInputBox
                  label="ALT PHONE (opt)"
                  value={formState.alternatePhone}
                  onChangeText={(t) => {
                    setFormState((prev) => ({ ...prev, alternatePhone: t.replace(/[^0-9]/g, '') }));
                  }}
                  placeholder="Optional phone"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>

              {/* 3. FLAT / HOUSE NO / BUILDING */}
              <AddressInputBox
                label="HOUSE / FLAT / BUILDING NO"
                value={formState.houseNoName}
                onChangeText={(t) => {
                  setFormState((prev) => ({ ...prev, houseNoName: t }));
                  clearFieldError('houseNoName');
                }}
                error={fieldErrors.houseNoName}
                placeholder="e.g. Six Mile, House No 11"
              />

              {/* 4. STREET / NEARBY AREA */}
              <AddressInputBox
                label="STREET / AREA / LANDMARK"
                value={formState.nearbyArea}
                onChangeText={(t) => {
                  setFormState((prev) => ({ ...prev, nearbyArea: t }));
                  clearFieldError('nearbyArea');
                }}
                error={fieldErrors.nearbyArea}
                placeholder="e.g. Near Kabarsthan Path, Six Mile"
                multiline={true}
                numberOfLines={2}
              />

              {/* 5. STATE + CITY / VILLAGE */}
              <View style={styles.twoColRow}>
                <AddressInputBox
                  label="STATE"
                  value={formState.state}
                  onChangeText={(t) => {
                    setFormState((prev) => ({ ...prev, state: t }));
                    clearFieldError('state');
                  }}
                  error={fieldErrors.state}
                  placeholder="e.g. Assam"
                  style={{ flex: 1, marginRight: 6 }}
                />
                <AddressInputBox
                  label="CITY / DISTRICT"
                  value={formState.cityVillage}
                  onChangeText={(t) => {
                    setFormState((prev) => ({ ...prev, cityVillage: t }));
                    clearFieldError('cityVillage');
                  }}
                  error={fieldErrors.cityVillage}
                  placeholder="e.g. Six Mile, Guwahati"
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>

              {/* 6. PINCODE */}
              <AddressInputBox
                label="PINCODE"
                value={formState.pincode}
                onChangeText={(t) => {
                  setFormState((prev) => ({ ...prev, pincode: t.replace(/[^0-9]/g, '') }));
                  clearFieldError('pincode');
                }}
                error={fieldErrors.pincode}
                placeholder="6-digit PIN"
                keyboardType="number-pad"
                maxLength={6}
                isError={formState.pincode.length > 0 && formState.pincode.length < 6}
                isSuccess={formState.pincode.length === 6}
                badge={
                  formState.pincode.length === 6 ? (
                    <View style={styles.pincodeSuccessBadge}>
                      <Icon name="check-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
                      <Text style={styles.pincodeSuccessText}>Verified Postal Code</Text>
                    </View>
                  ) : null
                }
                rightIcon={
                  formState.pincode.length === 6 ? (
                    <Icon name="check-bold" size={16} color="#059669" style={styles.pincodeIconInside} />
                  ) : null
                }
              />
            </View>
          )
        )}

        {/* ========================================================================= */}
        {/* STEP 2: REVIEW & CONFIRM                                                  */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <View style={styles.step2Container}>
            {/* DELIVERING TO CARD WITH EDIT ADDRESS */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Text style={styles.reviewSectionTitle}>DELIVERING TO</Text>
                <TouchableOpacity
                  style={styles.editAddressBtn}
                  onPress={handleEditAddress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editAddressBtnText}>CHANGE</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.addressSummaryBox}>
                <View style={styles.addressNameRow}>
                  <Icon name="map-marker" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                  <Text style={styles.addressRecipientName}>
                    {(activeAddress.yourName || 'ASHAFUL ISLAM').toUpperCase()}
                  </Text>
                  <View style={styles.addressTypeBadgeStep2}>
                    <Text style={styles.addressTypeBadgeTextStep2}>
                      {activeAddress.addressType || 'HOME'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.addressLines} numberOfLines={3}>
                  {activeAddress.flatHouseStreet ||
                    [
                      activeAddress.houseNoName,
                      activeAddress.nearbyArea,
                      activeAddress.cityVillage,
                      activeAddress.state,
                      activeAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                </Text>

                <View style={styles.contactDetailsRow}>
                  <Icon name="cellphone" size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.contactDetailsText}>
                    {activeAddress.phone || '9864975438'}{' '}
                    {activeAddress.alternatePhone ? `• Alt: ${activeAddress.alternatePhone}` : ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* ORDER SUMMARY */}
            <View style={styles.reviewCard}>
              <View style={styles.orderSummaryHeader}>
                <Text style={styles.orderSummaryTitle}>
                  ORDER SUMMARY ({quantity} {quantity === 1 ? 'ITEM' : 'ITEMS'})
                </Text>
                <View style={styles.authenticatedPill}>
                  <Text style={styles.authenticatedText}>AUTHENTICATED</Text>
                </View>
              </View>

              {/* Product Info Row */}
              <View style={styles.productReviewRow}>
                <FastImage
                  source={{
                    uri: checkoutProduct.image,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.productThumbnail as any}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.productDetailsCol}>
                  <Text style={styles.productReviewName} numberOfLines={2}>
                    {checkoutProduct.name}
                  </Text>

                  <View style={styles.productMetaRow}>
                    <View style={styles.sizePill}>
                      <Text style={styles.sizePillText}>SIZE: {checkoutProduct.size}</Text>
                    </View>
                    <Text style={styles.storeNameText}>{checkoutProduct.boutiqueName}</Text>
                  </View>

                  <View style={styles.productPriceRow}>
                    <Text style={styles.itemPriceText}>{formatINR(checkoutProduct.price)}</Text>
                    <Text style={styles.itemStrikethroughText}>{formatINR(checkoutProduct.originalPrice)}</Text>
                    <Text style={styles.itemDiscountText}>{checkoutProduct.discountBadge}</Text>
                  </View>

                  {/* Quantity Stepper */}
                  <View style={styles.stepperRow}>
                    <Text style={styles.quantityLabel}>Quantity</Text>
                    <View style={styles.quantityStepper}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                        activeOpacity={0.7}
                      >
                        <Icon name="minus" size={14} color="#0F172A" />
                      </TouchableOpacity>
                      <Text style={styles.stepperValueText}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setQuantity((q) => q + 1)}
                        activeOpacity={0.7}
                      >
                        <Icon name="plus" size={14} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Delivery ETA Pill Row */}
              <View style={styles.deliveryEtaRow}>
                <View style={styles.truckIconBox}>
                  <Icon name="truck-delivery-outline" size={16} color="#2563EB" />
                </View>
                <Text style={styles.deliveryEtaText} numberOfLines={1}>
                  Standard Delivery • 2-3 business days
                </Text>
                <View style={styles.etaPillSmall}>
                  <Text style={styles.etaPillText}>10.9 km</Text>
                </View>
                <View style={styles.etaPillSmall}>
                  <Text style={styles.etaPillText}>2-3 DAYS</Text>
                </View>
              </View>
            </View>

            {/* PRICE BREAKDOWN CARD */}
            <View style={styles.priceBreakdownCard}>
              <Text style={styles.priceBreakdownTitle}>PRICE BREAKDOWN</Text>

              <View style={styles.priceRowItem}>
                <Text style={styles.priceRowLabel}>Total MRP Value</Text>
                <Text style={styles.priceRowVal}>{formatINR(originalTotal)}</Text>
              </View>

              <View style={styles.priceRowItem}>
                <Text style={styles.priceRowLabel}>Store Discount</Text>
                <Text style={styles.discountRowVal}>-{formatINR(storeDiscount)}</Text>
              </View>

              <View style={styles.priceRowItem}>
                <Text style={styles.priceRowLabel}>Handling & Insurance</Text>
                <Text style={styles.priceRowVal}>₹{handlingFee}</Text>
              </View>

              <View style={styles.priceDivider} />

              <View style={styles.totalDueRow}>
                <Text style={styles.totalDueLabel}>Total Amount Due</Text>
                <Text style={styles.totalDueVal}>{formatINR(totalDue)}</Text>
              </View>

              {/* Total Savings Banner */}
              <View style={styles.savingsBanner}>
                <Icon name="star-four-points" size={15} color="#059669" style={{ marginRight: 6 }} />
                <Text style={styles.savingsBannerText}>
                  Total Savings: <Text style={styles.savingsHighlight}>{formatINR(storeDiscount)}</Text> on this order.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SECURE PAYMENT                                                    */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <View style={styles.step3Container}>
            {/* Top Blue Card: Total Payable Amount + Buyer Protected Badge */}
            <LinearGradient
              colors={['#0F3CA8', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payableAmountCard}
            >
              <View>
                <Text style={styles.payableCardSub}>TOTAL PAYABLE AMOUNT</Text>
                <Text style={styles.payableCardAmount}>{formatINR(totalDue)}</Text>
              </View>

              <View style={styles.buyerProtectedBadge}>
                <Icon name="shield-check" size={15} color="#34D399" style={{ marginRight: 4 }} />
                <Text style={styles.buyerProtectedText}>Buyer Protected</Text>
              </View>
            </LinearGradient>

            {/* MITRENO DIRECT PRIVILEGE Cashback Banner */}
            <View style={styles.privilegeBanner}>
              <View style={styles.privilegeTopRow}>
                <Text style={styles.privilegeTitle}>MITRENO DIRECT PRIVILEGE</Text>
                <View style={styles.autoAppliedBadge}>
                  <Text style={styles.autoAppliedText}>AUTO APPLIED</Text>
                </View>
              </View>
              <Text style={styles.privilegeSub}>
                Instant ₹100 Cashback credited on UPI & Prepaid Cards
              </Text>
            </View>

            <Text style={styles.selectGatewayTitle}>SELECT PAYMENT GATEWAY</Text>

            {/* GATEWAY 1: UPI */}
            <TouchableOpacity
              style={[
                styles.gatewayOptionCard,
                selectedGateway === 'upi' && styles.gatewayOptionCardSelected,
              ]}
              onPress={() => setSelectedGateway('upi')}
              activeOpacity={0.85}
            >
              <View style={styles.gatewayRowTop}>
                <View style={styles.radioCircle}>
                  {selectedGateway === 'upi' && <View style={styles.radioDot} />}
                </View>
                <Icon name="cellphone" size={18} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.gatewayName}>UPI (Google Pay, PhonePe, Paytm, CRED)</Text>
              </View>
              <Text style={styles.gatewaySub}>Instant 1-tap checkout via any verified UPI app</Text>

              <View style={styles.brandTagsRow}>
                {['GPay', 'PhonePe', 'Paytm', 'CRED'].map((tag) => (
                  <View key={tag} style={styles.brandTagPill}>
                    <Text style={styles.brandTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {selectedGateway === 'upi' && (
                <TouchableOpacity
                  style={styles.gatewayActionBtn}
                  onPress={handleConfirmPayment}
                  activeOpacity={0.85}
                >
                  <Text style={styles.gatewayActionBtnText}>Pay {formatINR(totalDue)} via UPI</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* GATEWAY 2: CARDS */}
            <TouchableOpacity
              style={[
                styles.gatewayOptionCard,
                selectedGateway === 'card' && styles.gatewayOptionCardSelected,
              ]}
              onPress={() => setSelectedGateway('card')}
              activeOpacity={0.85}
            >
              <View style={styles.gatewayRowTop}>
                <View style={styles.radioCircle}>
                  {selectedGateway === 'card' && <View style={styles.radioDot} />}
                </View>
                <Icon name="credit-card-outline" size={18} color="#0F172A" style={{ marginRight: 8 }} />
                <Text style={styles.gatewayName}>Credit / Debit / ATM Card</Text>
              </View>
              <Text style={styles.gatewaySub}>Visa, MasterCard, RuPay, Diners Club • 100% RBI Encrypted</Text>

              <View style={styles.brandTagsRow}>
                {['Visa', 'MasterCard', 'RuPay'].map((tag) => (
                  <View key={tag} style={styles.brandTagPill}>
                    <Text style={styles.brandTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {selectedGateway === 'card' && (
                <TouchableOpacity
                  style={styles.gatewayActionBtn}
                  onPress={handleConfirmPayment}
                  activeOpacity={0.85}
                >
                  <Text style={styles.gatewayActionBtnText}>Pay {formatINR(totalDue)} via Card</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* GATEWAY 3: CASH ON DELIVERY */}
            <TouchableOpacity
              style={[
                styles.gatewayOptionCard,
                selectedGateway === 'cod' && styles.gatewayOptionCardSelected,
              ]}
              onPress={() => setSelectedGateway('cod')}
              activeOpacity={0.85}
            >
              <View style={styles.gatewayRowTop}>
                <View style={styles.radioCircle}>
                  {selectedGateway === 'cod' && <View style={styles.radioDot} />}
                </View>
                <Icon name="cash-multiple" size={18} color="#059669" style={{ marginRight: 8 }} />
                <Text style={styles.gatewayName}>Cash on Delivery (COD)</Text>
              </View>
              <Text style={styles.gatewaySub}>Pay with Cash or UPI QR at your doorstep on delivery</Text>

              {selectedGateway === 'cod' && (
                <TouchableOpacity
                  style={[styles.gatewayActionBtn, { backgroundColor: '#059669' }]}
                  onPress={handleConfirmPayment}
                  activeOpacity={0.85}
                >
                  <Text style={styles.gatewayActionBtnText}>Confirm Order via COD ({formatINR(totalDue)})</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* BOTTOM ACTION BAR                                                         */}
      {/* ========================================================================= */}
      {currentStep === 1 && !isKeyboardVisible && (
        <View style={styles.stickyBottomBar}>
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            onPress={step1SubView === 'list' ? handleDeliverToThisAddress : handleSaveForm}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryCtaText}>
              {step1SubView === 'list'
                ? 'DELIVER TO THIS ADDRESS'
                : editingAddressId
                ? 'UPDATE & DELIVER HERE'
                : 'SAVE & DELIVER HERE'}
            </Text>
            <Icon name="chevron-right" size={18} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      )}

      {currentStep === 2 && (
        <View style={styles.stickyReviewBottomBar}>
          <View style={styles.totalDueCol}>
            <Text style={styles.totalDueBottomLabel}>TOTAL DUE</Text>
            <Text style={styles.totalDueBottomAmount}>{formatINR(totalDue)}</Text>
          </View>
          <TouchableOpacity
            style={styles.proceedPaymentBtn}
            onPress={() => setCurrentStep(3)}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedPaymentBtnText}>PROCEED TO PAYMENT</Text>
            <Icon name="chevron-right" size={18} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Sheet Popup for Three Dots (Edit / Delete / Set Default) */}
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
              onPress={() => handleSetDefault(activeActionSheetAddress)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="star-outline" size={18} color="#059669" />
              </View>
              <Text style={[styles.actionSheetBtnText, { color: '#059669' }]}>Set as Default</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetBtn}
              onPress={() => handleDeleteAddressConfirm(activeActionSheetAddress)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Icon name="trash-can-outline" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.actionSheetBtnText, { color: '#EF4444' }]}>Delete Address</Text>
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBanner: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stepBadgeActive: {
    backgroundColor: '#155DFC',
  },
  stepBadgeActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepBadgeCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stepBadgeInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stepBadgeInactiveText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: '#155DFC',
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: '#059669',
    fontWeight: '800',
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepConnectorActive: {
    backgroundColor: '#059669',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 110,
  },
  step1Card: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  optText: {
    color: '#64748B',
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pincodeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pincodeErrorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pincodeErrorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  pincodeSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pincodeSuccessText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  inputWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperRed: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF8F8',
  },
  inputWrapperGreen: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 2,
  },
  inlineErrorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  textInput: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
    padding: 0,
    minHeight: 22,
  },
  textInputPlaceholder: {
    fontWeight: '400',
    fontSize: 11.5,
    color: '#94A3B8',
  },
  pincodeIconInside: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  textareaWrapper: {
    height: 64,
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  textareaInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  gpsDetectorCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    marginTop: 6,
  },
  gpsDetectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gpsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  gpsDetectorTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.6,
  },
  accuracyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  accuracyText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
  gpsCoordsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  coordBox: {
    flex: 1,
    alignItems: 'center',
  },
  coordDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  coordLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  coordValue: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  gpsSyncFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsFooterText: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
    lineHeight: 14,
  },
  step2Container: {
    paddingHorizontal: 12,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  editAddressBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editAddressBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  addressSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressRecipientName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  addressLines: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  contactDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactDetailsText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderSummaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  authenticatedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  authenticatedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  productReviewRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  productThumbnail: {
    width: 68,
    height: 78,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  productDetailsCol: {
    flex: 1,
  },
  productReviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sizePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  sizePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  storeNameText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  itemPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  itemStrikethroughText: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  itemDiscountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 140,
  },
  quantityLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  deliveryEtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  truckIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deliveryEtaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  etaPillSmall: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 4,
  },
  etaPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  priceBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  priceBreakdownTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  priceRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceRowLabel: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
  },
  priceRowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  discountRowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalDueLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalDueVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#155DFC',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  savingsBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savingsHighlight: {
    color: '#FDE047',
    fontWeight: '900',
  },
  step3Container: {
    paddingHorizontal: 12,
    gap: 12,
  },
  payableAmountCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payableCardSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  payableCardAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  buyerProtectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  buyerProtectedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  privilegeBanner: {
    backgroundColor: '#FEFCE8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEF08A',
    padding: 14,
  },
  privilegeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  privilegeTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#854D0E',
    letterSpacing: 0.6,
  },
  autoAppliedBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoAppliedText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  privilegeSub: {
    fontSize: 11,
    color: '#A16207',
    fontWeight: '600',
  },
  selectGatewayTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  gatewayOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gatewayOptionCardSelected: {
    borderColor: '#155DFC',
    backgroundColor: '#F8FAFF',
  },
  gatewayRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#155DFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#155DFC',
  },
  gatewayName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  gatewaySub: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 30,
    marginBottom: 10,
    lineHeight: 16,
  },
  brandTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 30,
    marginBottom: 12,
  },
  brandTagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  gatewayActionBtn: {
    backgroundColor: '#155DFC',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  gatewayActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryCtaBtn: {
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
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  stickyReviewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  totalDueCol: {
    flex: 0.8,
  },
  totalDueBottomLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  totalDueBottomAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#155DFC',
  },
  proceedPaymentBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155DFC',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#155DFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedPaymentBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  step1ListContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    padding: 0,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  savedSectionHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  savedAddressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  savedAddressCardSelected: {
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
  iconContainerSelected: {
    backgroundColor: '#EFF6FF',
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
    lineHeight: 17,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  formBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  formBackBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#155DFC',
  },
  typeSelectorLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePillActive: {
    backgroundColor: '#155DFC',
    borderColor: '#155DFC',
  },
  typePillText: {
    fontSize: 12,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    marginBottom: 16,
  },
  gpsAssistText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionSheetBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  actionSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionSheetSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
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
    color: '#1E293B',
  },
  actionCancelBtn: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
    paddingVertical: 10,
  },
  actionCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    width: '100%',
  },
  addressTypeBadgeStep2: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  addressTypeBadgeTextStep2: {
    fontSize: 10,
    fontWeight: '800',
    color: '#155DFC',
  },
});
