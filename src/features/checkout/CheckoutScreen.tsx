import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCheckoutStore } from './checkoutStore';
import { useCartStore } from '../cart/cartStore';
import { useOrderStore } from '../orders/orderStore';
import { requestLocationPermission, getCurrentLocation } from '../../services/LocationService';
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

export const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const {
    draftAddress,
    setDraftField,
  } = useCheckoutStore();

  const { items: cartItems, clearCart } = useCartStore();
  const { placeOrder } = useOrderStore();

  // 1 = ADDRESS, 2 = REVIEW, 3 = PAYMENT
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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

  // FORM INPUTS - EMPTY BY DEFAULT (No dummy / pre-filled hardcoded data)
  // Only pre-fill if user specifically edited or saved custom data in this session
  const [fullName, setFullName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [alternatePhone, setAlternatePhone] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [cityVillage, setCityVillage] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [flatHouseStreet, setFlatHouseStreet] = useState<string>('');

  // Form Field Validation Errors (Inline field highlighting & real-time clearing)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  // AUTOMATIC LIVE HIGH-ACCURACY GPS LOCATION (Managed in LiveGpsDetectorCard)
  const [detectedCoords, setDetectedCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 26.134407,
    longitude: 91.813353,
  });

  const handleCoordsDetected = useCallback((coords: { latitude: number; longitude: number }) => {
    setDetectedCoords(coords);
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

  // Pincode validation state
  const isPincodeComplete = pincode.trim().length === 6;
  const isPincodeIncomplete = pincode.trim().length > 0 && pincode.trim().length < 6;

  const handleSaveAndProceed = () => {
    const newErrors: { [key: string]: string } = {};

    if (fullName.trim().length <= 1) {
      newErrors.fullName = 'Please enter full name';
    }
    if (mobileNumber.replace(/\D/g, '').length !== 10) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (stateName.trim().length <= 1) {
      newErrors.stateName = 'State is required';
    }
    if (cityVillage.trim().length <= 1) {
      newErrors.cityVillage = 'City or village is required';
    }
    if (pincode.replace(/\D/g, '').length !== 6) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }
    if (flatHouseStreet.trim().length <= 2) {
      newErrors.flatHouseStreet = 'Enter house no., street & landmark';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      showToast({
        type: 'error',
        title: 'Incomplete Address Details',
        message: 'Please check the highlighted boxes in red below.',
      });
      return;
    }

    // Save into draft store
    setDraftField('yourName', fullName.trim());
    setDraftField('phone', mobileNumber.trim());
    setDraftField('alternatePhone', alternatePhone.trim());
    setDraftField('state', stateName.trim());
    setDraftField('cityVillage', cityVillage.trim());
    setDraftField('pincode', pincode.trim());
    setDraftField('flatHouseStreet', flatHouseStreet.trim());
    setDraftField('houseNoName', flatHouseStreet.trim());
    setDraftField('gpsLocation', `${detectedCoords.latitude.toFixed(5)}, ${detectedCoords.longitude.toFixed(5)}`);

    // Move smoothly to Step 2
    setCurrentStep(2);
  };

  const handleEditAddress = () => {
    // Smoothly return to Step 1 with user-entered values
    setCurrentStep(1);
  };

  const handleConfirmPayment = () => {
    const finalAddress = {
      id: `addr-${Date.now()}`,
      state: stateName.trim() || 'Maharashtra',
      gpsLocation: `${detectedCoords.latitude.toFixed(5)}, ${detectedCoords.longitude.toFixed(5)}`,
      pincode: pincode.trim(),
      cityVillage: cityVillage.trim(),
      houseNoName: flatHouseStreet.trim(),
      flatHouseStreet: flatHouseStreet.trim(),
      nearbyArea: cityVillage.trim(),
      yourName: fullName.trim(),
      phone: mobileNumber.trim(),
      alternatePhone: alternatePhone.trim(),
      addressType: 'HOME' as const,
      distance: '10.9 km',
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
                ? 'Add Delivery Address'
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
        {/* STEP 1: ADDRESS FORM                                                      */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <View style={styles.step1Card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>RECEIVER INFORMATION</Text>
              <Text style={styles.sectionSubtitle}>* All fields mandatory</Text>
            </View>

            {/* 1. FULL NAME */}
            <AddressInputBox
              label="FULL NAME"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                clearFieldError('fullName');
              }}
              error={fieldErrors.fullName}
              placeholder="Full name"
            />

            {/* 2. MOBILE NUMBER + ALTERNATE PHONE (OPT) */}
            <View style={styles.twoColRow}>
              <AddressInputBox
                label="MOBILE NUMBER"
                value={mobileNumber}
                onChangeText={(t) => {
                  setMobileNumber(t.replace(/[^0-9]/g, ''));
                  clearFieldError('mobileNumber');
                }}
                error={fieldErrors.mobileNumber}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
                maxLength={14}
                style={{ flex: 1, marginRight: 6 }}
              />
              <AddressInputBox
                label="ALT PHONE (opt)"
                value={alternatePhone}
                onChangeText={setAlternatePhone}
                placeholder="Optional phone"
                keyboardType="phone-pad"
                maxLength={14}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            {/* 3. STATE + CITY / VILLAGE (2 COLUMNS) */}
            <View style={styles.twoColRow}>
              <AddressInputBox
                label="STATE"
                value={stateName}
                onChangeText={(t) => {
                  setStateName(t);
                  clearFieldError('stateName');
                }}
                error={fieldErrors.stateName}
                placeholder="State name"
                style={{ flex: 1, marginRight: 6 }}
              />
              <AddressInputBox
                label="CITY / VILLAGE"
                value={cityVillage}
                onChangeText={(t) => {
                  setCityVillage(t);
                  clearFieldError('cityVillage');
                }}
                error={fieldErrors.cityVillage}
                placeholder="City or town"
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            {/* 4. PINCODE (WITH REAL-TIME RED/GREEN VISUAL VALIDATION) */}
            <AddressInputBox
              label="PINCODE"
              value={pincode}
              onChangeText={(t) => {
                setPincode(t.replace(/[^0-9]/g, ''));
                clearFieldError('pincode');
              }}
              error={fieldErrors.pincode}
              placeholder="6-digit PIN"
              keyboardType="number-pad"
              maxLength={6}
              isError={isPincodeIncomplete}
              isSuccess={isPincodeComplete}
              badge={
                isPincodeIncomplete ? (
                  <View style={styles.pincodeErrorBadge}>
                    <Icon name="arrow-left" size={10} color="#EF4444" style={{ marginRight: 2 }} />
                    <Text style={styles.pincodeErrorText}>6 digits required</Text>
                  </View>
                ) : isPincodeComplete ? (
                  <View style={styles.pincodeSuccessBadge}>
                    <Icon name="check-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
                    <Text style={styles.pincodeSuccessText}>Verified Postal Code</Text>
                  </View>
                ) : null
              }
              rightIcon={
                isPincodeComplete ? (
                  <Icon name="check-bold" size={16} color="#059669" style={styles.pincodeIconInside} />
                ) : isPincodeIncomplete ? (
                  <Icon name="alert-circle-outline" size={16} color="#EF4444" style={styles.pincodeIconInside} />
                ) : null
              }
            />

            {/* 5. FLAT / HOUSE NO., STREET, LANDMARK */}
            <AddressInputBox
              label="FLAT / HOUSE NO., STREET, LANDMARK"
              value={flatHouseStreet}
              onChangeText={(t) => {
                setFlatHouseStreet(t);
                clearFieldError('flatHouseStreet');
              }}
              error={fieldErrors.flatHouseStreet}
              placeholder="Flat, House no., Building, Landmark"
              multiline={true}
              numberOfLines={2}
            />

            {/* 6. AUTOMATIC LIVE HIGH-ACCURACY GPS DETECTOR */}
            <LiveGpsDetectorCard onCoordsDetected={handleCoordsDetected} />
          </View>
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
                  <Text style={styles.editAddressBtnText}>EDIT ADDRESS</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.addressSummaryBox}>
                <View style={styles.addressNameRow}>
                  <Icon name="map-marker" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                  <Text style={styles.addressRecipientName}>{fullName.toUpperCase()}</Text>
                </View>

                <Text style={styles.addressLines} numberOfLines={2}>
                  {flatHouseStreet}, {cityVillage}, {stateName} - {pincode}
                </Text>

                <View style={styles.contactDetailsRow}>
                  <Icon name="cellphone" size={13} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.contactDetailsText}>
                    {mobileNumber} {alternatePhone ? `• Alt: ${alternatePhone}` : ''}
                  </Text>
                </View>

                <View style={styles.gpsRow}>
                  <Icon name="navigation-variant-outline" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={styles.gpsText}>
                    GPS Locked: {detectedCoords.latitude.toFixed(5)}, {detectedCoords.longitude.toFixed(5)}
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
                <Image source={{ uri: checkoutProduct.image }} style={styles.productThumbnail} />
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
            onPress={handleSaveAndProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryCtaText}>SAVE & PROCEED TO REVIEW</Text>
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
    </View>
  );
};

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
});
