import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import type { ConfirmationResult } from '@react-native-firebase/auth';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuthStore } from './authStore';
import { TruecallerAuthService } from '../../services/TruecallerAuthService';
import { FirebaseAuthService } from '../../services/FirebaseAuthService';
import { showToast } from '../../components/MitrenoToast';
import { apiClient } from '../../api/client';

export const AuthScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const loginWithTruecaller = useAuthStore((s) => s.loginWithTruecaller);
  const loginWithFirebase = useAuthStore((s) => s.loginWithFirebase);

  // Mode & Step State
  // Per user instruction: 'create' account must be FIRST and active by default
  const [authMode, setAuthMode] = useState<'create' | 'login'>('create');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Input State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Focus state for active blue outline (matching Screenshot 3)
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Loading & Usability State
  const [isTruecallerUsable, setIsTruecallerUsable] = useState(false);
  const [isTruecallerLoading, setIsTruecallerLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Countdown timer for OTP resend
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);
  const [isSkipping, setIsSkipping] = useState(false);

  const navigateToMainApp = () => {
    if (isSkipping) return;
    setIsSkipping(true);
    requestAnimationFrame(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    });
  };

  useEffect(() => {
    let isMounted = true;

    const checkAndTrigger = async () => {
      if (Platform.OS !== 'android') return;

      // Small delay for React Native mount & Android window focus
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 450));
      if (!isMounted) return;

      let usable = await TruecallerAuthService.isUsable();
      if (!usable) {
        // Retry once after SDK completes async handshake
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 400));
        if (!isMounted) return;
        usable = await TruecallerAuthService.isUsable();
      }

      if (isMounted) {
        setIsTruecallerUsable(usable);
        if (usable) {
          handleTruecallerLogin(true);
        }
      }
    };

    checkAndTrigger();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Truecaller 1-Tap Login Handler (Triggers Native Bottom Sheet from Screenshot 2)
  const handleTruecallerLogin = async (isAutoTrigger = false) => {
    if (isTruecallerLoading) return;
    setIsTruecallerLoading(true);

    try {
      const res = await TruecallerAuthService.requestOneTapLogin();
      if (res.success && res.phoneNumber) {
        const verifiedName = res.name || fullName.trim() || 'Mitreno Member';
        await loginWithTruecaller({
          phoneNumber: res.phoneNumber,
          displayName: verifiedName,
          authCode: res.authCode,
          action: authMode,
        });

        showToast({
          type: 'success',
          title: `Welcome, ${verifiedName}! 🎉`,
          message: 'Signed in instantly with Truecaller',
        });
        navigateToMainApp();
      } else {
        const errLower = (res.error || '').toLowerCase();
        const isUserCancel =
          errLower.includes('cancel') ||
          errLower.includes('press') ||
          errLower.includes('closed') ||
          errLower.includes('denied');

        if (isUserCancel) {
          // User deliberately pressed "USE ANOTHER METHOD" or closed Truecaller dialog
          if (!isAutoTrigger) {
            showToast({
              type: 'info',
              title: 'Phone Authentication',
              message: 'Please enter your mobile number below to receive an OTP',
            });
          }
        } else if (res.errorCode === 3 || errLower.includes('partner') || errLower.includes('unauthorized')) {
          showToast({
            type: 'warning',
            title: 'Truecaller Console Notice',
            message: 'Package (com.greztoapp) or SHA-1 not yet active in Truecaller Console. Please use SMS OTP below.',
            duration: 5000,
          });
        } else if (res.errorCode === 5 || errLower.includes('not installed') || errLower.includes('not logged')) {
          if (!isAutoTrigger) {
            showToast({
              type: 'info',
              title: 'Truecaller Inactive',
              message: 'Please ensure Truecaller app is active and logged in on this phone, or use SMS OTP below.',
              duration: 4500,
            });
          }
        } else if (!isAutoTrigger && res.error) {
          showToast({
            type: 'warning',
            title: 'Truecaller Notice',
            message: res.error || 'Please enter mobile number below for SMS verification.',
            duration: 4500,
          });
        }
      }
    } catch (err: any) {
      console.warn('[Truecaller Trigger Error]:', err?.message);
      if (!isAutoTrigger) {
        showToast({
          type: 'warning',
          title: 'Authentication Notice',
          message: 'Please enter your phone number below for verification.',
        });
      }
    } finally {
      setIsTruecallerLoading(false);
    }
  };

  // 2. Firebase Phone Auth: Send OTP with Existence Validation
  const handleSendOtp = async () => {
    if (authMode === 'create' && fullName.trim().length < 2) {
      showToast({
        type: 'warning',
        title: 'Name Required',
        message: 'Please enter your full name (at least 2 characters) to create an account.',
      });
      return;
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 10) {
      showToast({
        type: 'error',
        title: 'Invalid Mobile Number',
        message: 'Please enter a valid 10-digit mobile number',
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      // Step A: Pre-check phone existence in Go backend database
      try {
        const checkRes = await apiClient.post('/auth/check-phone', { phone: cleanNumber });
        if (checkRes.data?.success) {
          const exists = !!checkRes.data.exists;

          if (authMode === 'create' && exists) {
            showToast({
              type: 'warning',
              title: 'Already Registered',
              message: 'This mobile number is already registered. Please Sign In.',
              duration: 4000,
            });
            setAuthMode('login');
            setIsSendingOtp(false);
            return;
          }

          if (authMode === 'login' && !exists) {
            showToast({
              type: 'warning',
              title: 'Account Not Found',
              message: 'No account found with this number. Please Create an Account first.',
              duration: 4000,
            });
            setAuthMode('create');
            setIsSendingOtp(false);
            return;
          }
        }
      } catch (checkErr: any) {
        // Log pre-check failure and proceed with Firebase
        console.warn('[handleSendOtp] check-phone pre-check notice:', checkErr?.message);
      }

      // Step B: Send real Firebase SMS OTP
      const res = await FirebaseAuthService.sendPhoneOtp(cleanNumber);
      if (res.success && res.confirmation) {
        setConfirmationResult(res.confirmation);
        setStep('otp');
        startCountdown();
        showToast({
          type: 'success',
          title: 'Code Sent! ✉️',
          message: `6-digit verification code sent to +91 ${cleanNumber}`,
        });
      } else {
        showToast({
          type: 'error',
          title: 'SMS Delivery Failed',
          message: res.error || 'Firebase could not send SMS OTP to this number. Please check connection and try again.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'SMS Delivery Failed',
        message: err.message || 'Please check your connection and try again.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 3. Firebase Phone Auth: Strict Real OTP Verification (Zero Backdoor)
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      showToast({
        type: 'error',
        title: 'Incomplete Code',
        message: 'Please enter the complete 6-digit verification code',
      });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      const userDisplayName = authMode === 'create' ? fullName.trim() : (fullName.trim() || 'Mitreno Member');

      if (!confirmationResult) {
        showToast({
          type: 'error',
          title: 'Session Expired',
          message: 'Verification session expired. Please request a new code.',
        });
        setStep('phone');
        return;
      }

      const res = await FirebaseAuthService.confirmOtp(confirmationResult, otp);
      if (res.success && res.user) {
        await loginWithFirebase({
          uid: res.user.uid,
          phoneNumber: `+91${cleanNumber}`,
          displayName: userDisplayName,
          action: authMode,
        });

        showToast({
          type: 'success',
          title: `Welcome, ${userDisplayName}! 🎉`,
          message: 'Phone number verified successfully.',
        });
        navigateToMainApp();
      } else {
        showToast({
          type: 'error',
          title: 'Invalid Code',
          message: res.error || 'The code you entered is incorrect. Please verify and try again.',
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Verification Failed',
        message: err.message || 'Unable to verify code.',
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* TOP HEADER: SKIP BUTTON ON RIGHT (WITH LUXURY SOFT PILL & GENEROUS HIT SLOP) */}
      <View style={styles.topHeaderRow}>
        <View style={{ width: 44 }} />
        <TouchableOpacity
          onPress={navigateToMainApp}
          style={styles.skipBtn}
          activeOpacity={0.4}
          hitSlop={{ top: 24, bottom: 24, left: 30, right: 30 }}
          accessibilityRole="button"
          accessibilityLabel="Skip to Main App"
          disabled={isSkipping}
        >
          {isSkipping ? (
            <ActivityIndicator size="small" color="#475569" />
          ) : (
            <Text style={styles.skipBtnText}>Skip  →</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND LOGO & MOTTO (MATCHING SCREENSHOT 3) */}
        <View style={styles.brandCenterCol}>
          <Text style={styles.brandTitle}>
            <Text style={styles.brandGoldM}>M</Text>ITRENO
          </Text>
          <Text style={styles.brandSubtitle}>THE PINNACLE OF BARGAINING</Text>
        </View>

        {step === 'phone' ? (
          <View style={styles.cardContainer}>
            {/* SEGMENTED TAB SWITCHER: CREATE ACCOUNT FIRST, SIGN IN SECOND */}
            <View style={styles.segmentedTabsBox}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  authMode === 'create' && styles.tabBtnActive,
                ]}
                onPress={() => setAuthMode('create')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    authMode === 'create' && styles.tabBtnTextActive,
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  authMode === 'login' && styles.tabBtnActive,
                ]}
                onPress={() => setAuthMode('login')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    authMode === 'login' && styles.tabBtnTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* FORM INPUTS */}
            <View style={styles.formBox}>
              {/* FULL NAME INPUT (WHEN CREATE ACCOUNT IS SELECTED) */}
              {authMode === 'create' && (
                <View style={styles.inputFieldBlock}>
                  <Text style={styles.fieldLabel}>YOUR FULL NAME</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      isNameFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <Icon
                      name="account-outline"
                      size={18}
                      color={isNameFocused ? '#2563EB' : '#94A3B8'}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94A3B8"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                    />
                  </View>
                </View>
              )}

              {/* PHONE NUMBER INPUT (MATCHING SCREENSHOT 3) */}
              <View style={styles.inputFieldBlock}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <View
                  style={[
                    styles.phoneInputWrapper,
                    isPhoneFocused && styles.phoneInputWrapperFocused,
                  ]}
                >
                  <View style={styles.countryCodeCol}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                  />
                  {phoneNumber.length === 10 && (
                    <Icon
                      name="check-circle"
                      size={18}
                      color="#10B981"
                      style={{ marginRight: 12 }}
                    />
                  )}
                </View>
              </View>

              {/* SEND VERIFICATION CODE BUTTON (MATCHING SCREENSHOT 3) */}
              <TouchableOpacity
                style={[
                  styles.sendCodeBtn,
                  (phoneNumber.length === 10 && (authMode === 'login' || fullName.trim().length >= 2)) &&
                    styles.sendCodeBtnEnabled,
                ]}
                onPress={handleSendOtp}
                disabled={
                  isSendingOtp ||
                  phoneNumber.length !== 10 ||
                  (authMode === 'create' && fullName.trim().length < 2)
                }
                activeOpacity={0.85}
              >
                {isSendingOtp ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Icon name="cellphone" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.sendCodeBtnText}>Send Verification Code</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* TRUECALLER 1-TAP QUICK RETRIGGER OPTION */}
              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={styles.truecallerSubBtn}
                  onPress={() => handleTruecallerLogin(false)}
                  activeOpacity={0.75}
                  disabled={isTruecallerLoading}
                >
                  {isTruecallerLoading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <Icon name="phone-check" size={16} color="#0087FF" style={{ marginRight: 6 }} />
                      <Text style={styles.truecallerSubText}>
                        Instant 1-Tap with <Text style={styles.tcBold}>Truecaller</Text>
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <View style={styles.cardContainer}>
            <View style={styles.otpHeaderBox}>
              <TouchableOpacity
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                }}
                style={styles.backRow}
              >
                <FeatherIcon name="arrow-left" size={16} color="#2563EB" />
                <Text style={styles.backText}>Edit phone number</Text>
              </TouchableOpacity>

              <Text style={styles.otpTitle}>Enter Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                Enter the 6-digit SMS code sent to{' '}
                <Text style={styles.otpNumberHighlight}>+91 {phoneNumber}</Text>
              </Text>
            </View>

            <View style={styles.otpInputBlock}>
              <TextInput
                style={styles.otpTextInput}
                placeholder="• • • • • •"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
            </View>

            {/* Countdown / Resend */}
            <View style={styles.resendRow}>
              {countdown > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend code in <Text style={styles.countdownBold}>{countdown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp} disabled={isSendingOtp}>
                  <Text style={styles.resendActiveLink}>
                    {isSendingOtp ? 'Sending...' : 'Didn’t receive code? Resend SMS'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.sendCodeBtn,
                otp.length >= 4 && styles.sendCodeBtnEnabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={otp.length < 4 || isVerifyingOtp}
              activeOpacity={0.85}
            >
              {isVerifyingOtp ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendCodeBtnText}>Verify & Continue →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TRUST BADGES FOOTER (EXACT MATCH SCREENSHOT 3) */}
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustItem}>
            <Icon name="shield-check-outline" size={15} color="#94A3B8" style={{ marginRight: 5 }} />
            <Text style={styles.trustText}>SECURE OTP</Text>
          </View>
          <View style={styles.trustDividerDot} />
          <View style={styles.trustItem}>
            <Icon name="cellphone" size={15} color="#94A3B8" style={{ marginRight: 5 }} />
            <Text style={styles.trustText}>PHONE AUTH</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipBtn: {
    minWidth: 86,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#F1F5F9', // Luxury soft neutral capsule
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'center',
  },

  // Brand Logo & Motto (Screenshot 3)
  brandCenterCol: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontFamily: typography.fontFamily.serifBold,
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandGoldM: {
    color: '#C59A4E', // Royal Gold
    fontFamily: typography.fontFamily.serifBold,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 2.2,
    marginTop: 6,
    textAlign: 'center',
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
  },

  // Segmented Tabs (Create Account First, Sign In Second)
  segmentedTabsBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabBtnTextActive: {
    color: '#111827',
    fontWeight: '800',
  },

  // Form Inputs
  formBox: {
    gap: 16,
  },
  inputFieldBlock: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#111827',
    padding: 0,
  },

  // Phone Input Box (Screenshot 3 Blue Border & +91 Divider)
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  phoneInputWrapperFocused: {
    borderColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  countryCodeCol: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingHorizontal: 14,
  },

  // Send Code Button (Screenshot 3)
  sendCodeBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#8FA4D6', // Soft purple/slate matching Screenshot 3 disabled
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendCodeBtnEnabled: {
    backgroundColor: '#2563EB', // Vibrant royal action blue
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendCodeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Truecaller Re-trigger Sub Option
  truecallerSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  truecallerSubText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  tcBold: {
    color: '#0087FF',
    fontWeight: '800',
  },

  // OTP Step
  otpHeaderBox: {
    marginBottom: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 6,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  otpSubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 19,
  },
  otpNumberHighlight: {
    color: '#111827',
    fontWeight: '800',
  },
  otpInputBlock: {
    marginBottom: 16,
  },
  otpTextInput: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 12,
    backgroundColor: '#F8FAFC',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendTimerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  countdownBold: {
    fontWeight: '700',
    color: '#2563EB',
  },
  resendActiveLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Trust Footer (Screenshot 3)
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  trustDividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 16,
  },
});
