import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SellerStepIndicator } from './components/SellerStepIndicator';
import { Step1BusinessDetails } from './components/Step1BusinessDetails';
import { Step2IdentityKYC } from './components/Step2IdentityKYC';
import { Step3ShopAddress } from './components/Step3ShopAddress';
import { Step4PayoutDetails } from './components/Step4PayoutDetails';
import { Step5ReviewPayment } from './components/Step5ReviewPayment';
import { SellerApplicationStatusView } from './components/SellerApplicationStatusView';
import { useSellerStore } from './sellerStore';
import { useAuthStore } from '../auth/authStore';
import {
  SellerApplicationData,
  BusinessDetailsData,
  IdentityKYCData,
  ShopAddressData,
  PayoutDetailsData,
} from './sellerOnboardingTypes';
import { showToast } from '../../components/MitrenoToast';

const INITIAL_FORM_DATA: SellerApplicationData = {
  business: {
    shopName: '',
    businessType: 'individual',
    businessCategory: '',
    description: '',
  },
  identity: {
    legalName: '',
    phone: '',
    email: '',
    aadharNumber: '',
    aadharCardUri: '',
    panNumber: '',
    panCardUri: '',
    voterId: '',
    drivingLicense: '',
    gstNumber: '',
  },
  address: {
    state: 'Assam',
    city: 'Guwahati',
    streetAddress: '',
    pincode: '',
    landmark: '',
    latitude: 26.1445,
    longitude: 91.7362,
    gpsAccuracy: '±4m (High Precision Live Fix)',
  },
  payout: {
    payoutMethod: 'bank',
    accountType: 'current',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: '',
  },
  legalAgreements: {
    merchantAgreement: false,
    termsConditions: false,
    privacyPolicy: false,
  },
  termsAccepted: false,
  registrationFeePaid: false,
};

export const SellerOnboardingScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const hasSubmittedApplication = useSellerStore((s) => s.hasSubmittedApplication);
  const applicationStatus = useSellerStore((s) => s.applicationStatus);
  const resetApplication = useSellerStore((s) => s.resetApplication);

  const isSeller = Boolean(user?.isSeller || user?.role === 'seller' || applicationStatus === 'approved');

  const [currentStep, setCurrentStep] = useState(1);
  const [submitTrigger, setSubmitTrigger] = useState(0);

  // Application State - dynamically pre-fill phone and name from verified auth
  const [formData, setFormData] = useState<SellerApplicationData>(() => ({
    ...INITIAL_FORM_DATA,
    identity: {
      ...INITIAL_FORM_DATA.identity,
      phone: user?.phoneNumber ? user.phoneNumber.replace(/\D/g, '').slice(-10) : '',
      legalName: user?.displayName && user.displayName !== 'Privilege Guest' ? user.displayName : '',
    },
  }));

  const updateBusiness = useCallback((update: Partial<BusinessDetailsData>) => {
    setFormData((prev) => ({ ...prev, business: { ...prev.business, ...update } }));
  }, []);

  const updateIdentity = useCallback((update: Partial<IdentityKYCData>) => {
    setFormData((prev) => ({ ...prev, identity: { ...prev.identity, ...update } }));
  }, []);

  const updateAddress = useCallback((update: Partial<ShopAddressData>) => {
    setFormData((prev) => ({ ...prev, address: { ...prev.address, ...update } }));
  }, []);

  const updatePayout = useCallback((update: Partial<PayoutDetailsData>) => {
    setFormData((prev) => ({ ...prev, payout: { ...prev.payout, ...update } }));
  }, []);

  const updateApplication = useCallback((update: Partial<SellerApplicationData>) => {
    setFormData((prev) => ({ ...prev, ...update }));
  }, []);

  // Compute step-by-step validity to enforce mandatory inputs before advancing
  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        formData.business.shopName.trim().length >= 2 &&
        Boolean(formData.business.businessCategory)
      );
    }
    if (currentStep === 2) {
      const aadharDigits = formData.identity.aadharNumber.replace(/\D/g, '');
      const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.identity.panNumber.trim());
      return (
        formData.identity.legalName.trim().length >= 3 &&
        formData.identity.phone.replace(/\D/g, '').length === 10 &&
        aadharDigits.length === 12 &&
        Boolean(formData.identity.aadharCardUri) &&
        isPanValid &&
        Boolean(formData.identity.panCardUri)
      );
    }
    if (currentStep === 3) {
      return (
        Boolean(formData.address.state.trim()) &&
        Boolean(formData.address.city.trim()) &&
        formData.address.streetAddress.trim().length >= 3 &&
        formData.address.pincode.replace(/\D/g, '').length === 6 &&
        formData.address.latitude !== null
      );
    }
    if (currentStep === 4) {
      const acc = formData.payout.accountNumber.trim();
      const conf = formData.payout.confirmAccountNumber.trim();
      const ifsc = formData.payout.ifscCode.trim();
      const name = formData.payout.accountHolderName.trim();
      return name.length >= 2 && acc.length >= 8 && acc === conf && ifsc.length === 11;
    }
    if (currentStep === 5) {
      return Boolean(
        formData.legalAgreements?.merchantAgreement &&
        formData.legalAgreements?.termsConditions &&
        formData.legalAgreements?.privacyPolicy
      );
    }
    return true;
  }, [currentStep, formData]);

  // Validation before advancing step
  const handleContinue = () => {
    if (currentStep === 1) {
      if (!formData.business.shopName.trim()) {
        showToast({
          type: 'warning',
          title: 'Shop Name Required',
          message: 'Please enter your boutique or shop name to continue.',
        });
        return;
      }
      if (!formData.business.businessCategory.trim()) {
        showToast({
          type: 'warning',
          title: 'Category Required',
          message: 'Please select a fashion category for your boutique.',
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.identity.legalName.trim().length < 3) {
        showToast({
          type: 'warning',
          title: 'Owner Name Required',
          message: 'Please enter owner full legal name (at least 3 characters).',
        });
        return;
      }
      if (formData.identity.phone.replace(/\D/g, '').length < 10) {
        showToast({
          type: 'warning',
          title: 'Valid Phone Required',
          message: 'Please enter a valid 10-digit mobile number.',
        });
        return;
      }
      const aadharDigits = formData.identity.aadharNumber.replace(/\D/g, '');
      if (aadharDigits.length > 0 && aadharDigits.length !== 12) {
        showToast({
          type: 'warning',
          title: 'Invalid Aadhaar Number',
          message: 'Aadhaar number must be exactly 12 digits.',
        });
        return;
      }
      const panTrimmed = formData.identity.panNumber.trim();
      if (panTrimmed.length > 0 && panTrimmed.length !== 10) {
        showToast({
          type: 'warning',
          title: 'Invalid PAN Number',
          message: 'PAN number must be exactly 10 characters (e.g. ABCDE1234F).',
        });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.address.state.trim() || !formData.address.city.trim()) {
        showToast({
          type: 'warning',
          title: 'Location Required',
          message: 'Please select your state and city commercial hub.',
        });
        return;
      }
      if (formData.address.pincode && formData.address.pincode.trim().length > 0) {
        if (formData.address.pincode.replace(/\D/g, '').length !== 6) {
          showToast({
            type: 'warning',
            title: 'Invalid Pincode',
            message: 'Pincode must be exactly 6 digits.',
          });
          return;
        }
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (formData.payout.payoutMethod === 'bank') {
        const accountNumber = formData.payout.accountNumber.trim();
        const confirmAccountNumber = formData.payout.confirmAccountNumber.trim();
        const ifscCode = formData.payout.ifscCode.trim();

        if (!accountNumber) {
          showToast({
            type: 'warning',
            title: 'Bank Account Required',
            message: 'Please enter your bank account number for payouts.',
          });
          return;
        }
        if (accountNumber !== confirmAccountNumber) {
          showToast({
            type: 'warning',
            title: "Account Numbers Don't Match",
            message: 'Bank account number and confirmation do not match. Please verify.',
          });
          return;
        }
        if (ifscCode.length !== 11) {
          showToast({
            type: 'warning',
            title: 'Invalid IFSC Code',
            message: 'IFSC code must be exactly 11 characters (e.g. HDFC0001234).',
          });
          return;
        }
      } else {
        const upiId = formData.payout.upiId.trim();
        if (!upiId || !upiId.includes('@')) {
          showToast({
            type: 'warning',
            title: 'Invalid UPI ID',
            message: 'Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank).',
          });
          return;
        }
      }
      setCurrentStep(5);
    }
  };

  const handleClose = useCallback(() => {
    Alert.alert(
      'Exit Onboarding?',
      'Your progress is saved locally. You can resume anytime from your profile.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          },
        },
      ]
    );
  }, [navigation]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  // Hardware Back Button listener on Android - navigate step-by-step backwards
  useEffect(() => {
    if (hasSubmittedApplication && applicationStatus === 'under_review') {
      return;
    }
    const onBackPress = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
        return true; // Handled: step backwards, do not exit screen/app
      } else {
        handleClose();
        return true; // Handled: show exit confirmation
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [currentStep, handleClose, hasSubmittedApplication, applicationStatus]);

  const handleSubmit = () => {
    if (!isCurrentStepValid) {
      showToast({
        type: 'warning',
        title: 'Agreements Required',
        message: 'Please review and accept all 3 legal agreements to submit your application.',
      });
      return;
    }
    setSubmitTrigger((prev) => prev + 1);
  };

  // If user is already registered as an active seller or approved
  if (isSeller) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={styles.alreadyRegisteredCard}>
          <View style={styles.alreadyRegisteredIcon}>
            <Icon name="check-decagram" size={48} color="#059669" />
          </View>
          <Text style={styles.alreadyRegisteredTitle}>Already Registered!</Text>
          <Text style={styles.alreadyRegisteredSubtitle}>
            Your mobile number is already registered as an active Mitreno Boutique Seller. You have full access to your Boutique Studio dashboard.
          </Text>
          <TouchableOpacity
            style={styles.openStudioButton}
            onPress={() => navigation.replace('SellerStudio')}
            activeOpacity={0.88}
          >
            <Icon name="storefront-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.openStudioButtonText}>Open Seller Studio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
            }
          >
            <Text style={styles.backToHomeText}>← Return to Marketplace</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If application is submitted and under review, show the Live Verification Tracker screen
  if (hasSubmittedApplication && applicationStatus === 'under_review') {
    return (
      <SellerApplicationStatusView
        onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs'))}
        onClose={() => navigation.navigate('MainTabs')}
        onReapply={() => {
          resetApplication();
          setCurrentStep(1);
          setFormData(INITIAL_FORM_DATA);
        }}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Stepper Indicator */}
      <SellerStepIndicator
        currentStep={currentStep}
        onStepPress={(step) => setCurrentStep(step)}
        onClose={handleClose}
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {currentStep === 1 && (
            <Step1BusinessDetails data={formData.business} onChange={updateBusiness} />
          )}

          {currentStep === 2 && (
            <Step2IdentityKYC data={formData.identity} onChange={updateIdentity} />
          )}

          {currentStep === 3 && (
            <Step3ShopAddress data={formData.address} onChange={updateAddress} />
          )}

          {currentStep === 4 && (
            <Step4PayoutDetails data={formData.payout} onChange={updatePayout} />
          )}

          {currentStep === 5 && (
            <Step5ReviewPayment
              data={formData}
              onChange={updateApplication}
              onSuccessDone={() => {
                // Keep the seller on the Application Status screen smoothly!
                // SellerOnboardingScreen auto-switches to SellerApplicationStatusView
                // because applicationStatus is set to 'under_review' in useSellerStore
              }}
              submitTrigger={submitTrigger}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Navigation Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        {currentStep === 5 ? (
          <TouchableOpacity
            style={[
              styles.continueBtn,
              styles.submitBtn,
              !isCurrentStepValid && styles.continueBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isCurrentStepValid}
            activeOpacity={0.85}
          >
            <Icon
              name="creation-outline"
              size={18}
              color={isCurrentStepValid ? '#FFFFFF' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.continueBtnText,
                !isCurrentStepValid && styles.continueBtnTextDisabled,
              ]}
            >
              Submit Application
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !isCurrentStepValid && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isCurrentStepValid}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.continueBtnText,
                !isCurrentStepValid && styles.continueBtnTextDisabled,
              ]}
            >
              Continue →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  continueBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  continueBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  continueBtnTextDisabled: {
    color: '#94A3B8',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyRegisteredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  alreadyRegisteredIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alreadyRegisteredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  alreadyRegisteredSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  openStudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  openStudioButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  backToHomeButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backToHomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
