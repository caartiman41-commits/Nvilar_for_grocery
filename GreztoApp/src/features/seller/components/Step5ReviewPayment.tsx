import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SellerApplicationData, LegalAgreementsState } from '../sellerOnboardingTypes';
import { SELLER_LEGAL_DOCUMENTS, LegalDocument } from '../data/sellerLegalDocuments';
import { showToast } from '../../../components/MitrenoToast';
import { useSellerStore } from '../sellerStore';

export interface Step5ReviewPaymentProps {
  data: SellerApplicationData;
  onChange: (data: Partial<SellerApplicationData>) => void;
  onSuccessDone: () => void;
  submitTrigger?: number;
}

export const Step5ReviewPayment: React.FC<Step5ReviewPaymentProps> = memo(({
  data,
  onChange,
  onSuccessDone,
  submitTrigger,
}) => {
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [partnerRef, setPartnerRef] = useState('');
  const paymentTimerRef = useRef<any>(null);

  // Full Legal Reader Modal State
  const [readerModalVisible, setReaderModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  const legalAgreements: LegalAgreementsState = data.legalAgreements || {
    merchantAgreement: false,
    termsConditions: false,
    privacyPolicy: false,
  };

  const acceptedCount =
    (legalAgreements.merchantAgreement ? 1 : 0) +
    (legalAgreements.termsConditions ? 1 : 0) +
    (legalAgreements.privacyPolicy ? 1 : 0);

  const isAllAccepted = acceptedCount === 3;

  const handleToggleAgreement = useCallback(
    (key: keyof LegalAgreementsState) => {
      const updated = {
        ...legalAgreements,
        [key]: !legalAgreements[key],
      };
      const allDone =
        updated.merchantAgreement && updated.termsConditions && updated.privacyPolicy;
      onChange({
        legalAgreements: updated,
        termsAccepted: allDone,
      });
    },
    [legalAgreements, onChange]
  );

  const handleOpenReader = useCallback(
    (docId: 'merchant_agreement' | 'terms_conditions' | 'privacy_policy') => {
      setSelectedDoc(SELLER_LEGAL_DOCUMENTS[docId]);
      setReaderModalVisible(true);
    },
    []
  );

  const handleAcceptFromReader = useCallback(() => {
    if (!selectedDoc) return;
    const docTitle = selectedDoc.title;
    let key: keyof LegalAgreementsState = 'merchantAgreement';
    if (selectedDoc.id === 'merchant_agreement') key = 'merchantAgreement';
    else if (selectedDoc.id === 'terms_conditions') key = 'termsConditions';
    else if (selectedDoc.id === 'privacy_policy') key = 'privacyPolicy';

    const updated = {
      ...legalAgreements,
      [key]: true,
    };
    const allDone = Boolean(
      updated.merchantAgreement && updated.termsConditions && updated.privacyPolicy
    );

    // Immediately dismiss modal
    setReaderModalVisible(false);
    setSelectedDoc(null);

    // Propagate state update
    onChange({
      legalAgreements: updated,
      termsAccepted: allDone,
    });

    showToast({
      type: 'success',
      title: 'Agreement Accepted',
      message: `${docTitle} accepted.`,
    });
  }, [selectedDoc, legalAgreements, onChange]);

  // Smooth Native Driver animation values for rewarding triumph feel
  const cardScaleAnim = useRef(new Animated.Value(0.85)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  const ringScaleAnim = useRef(new Animated.Value(0.6)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(18)).current;

  const checkmarkRotate = checkmarkScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '0deg'],
  });

  useEffect(() => {
    return () => {
      if (paymentTimerRef.current) {
        clearTimeout(paymentTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (successModalVisible) {
      // Reset values for a crisp sequence
      cardScaleAnim.setValue(0.85);
      cardOpacityAnim.setValue(0);
      iconScaleAnim.setValue(0);
      checkmarkScaleAnim.setValue(0);
      ringScaleAnim.setValue(0.6);
      ringOpacityAnim.setValue(0.85);
      pulseAnim.setValue(1);
      contentFadeAnim.setValue(0);
      contentSlideAnim.setValue(18);

      // Orchestrated triumph animation (60/120 FPS pure native driver)
      Animated.parallel([
        // 1. Modal card entrance spring
        Animated.parallel([
          Animated.timing(cardOpacityAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(cardScaleAnim, {
            toValue: 1,
            friction: 6.5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),

        // 2. Victory shockwave halo expansion
        Animated.parallel([
          Animated.timing(ringScaleAnim, {
            toValue: 1.5,
            duration: 950,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 0,
            duration: 950,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),

        // 3. Green Circle badge pop
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(iconScaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),

        // 4. White Checkmark elastic bounce
        Animated.sequence([
          Animated.delay(230),
          Animated.spring(checkmarkScaleAnim, {
            toValue: 1,
            friction: 3.5,
            tension: 130,
            useNativeDriver: true,
          }),
        ]),

        // 5. Content slide & fade in
        Animated.sequence([
          Animated.delay(290),
          Animated.parallel([
            Animated.timing(contentFadeAnim, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.spring(contentSlideAnim, {
              toValue: 0,
              friction: 7,
              tension: 70,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        // Continuous soft victorious heartbeat pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.04,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [successModalVisible]);

  const handleSuccessClose = useCallback(() => {
    setSuccessModalVisible(false);
    // Persist to Seller Store when user taps "Review Application"
    useSellerStore.getState().submitApplication(data, partnerRef);
    onSuccessDone();
  }, [data, partnerRef, onSuccessDone]);

  const handlePayAndSubmit = useCallback(() => {
    if (!isAllAccepted) {
      showToast({
        type: 'warning',
        title: 'Agreements Required',
        message: 'Please review and accept all 3 legal agreements to submit your application.',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate backend verification & registration
    paymentTimerRef.current = setTimeout(() => {
      setIsProcessing(false);
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
      const numPart = Math.floor(10000 + Math.random() * 90000);
      const generatedRef = `sa_${randomPart}_${numPart}`;
      setPartnerRef(generatedRef);
      onChange({ registrationFeePaid: true, paymentId: `pay_${Date.now()}` });

      // Open celebration modal with animated checkmark
      setSuccessModalVisible(true);
    }, 1200);
  }, [isAllAccepted, onChange]);

  // Handle external submit trigger from parent sticky navigation bar
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (submitTrigger && submitTrigger > 0) {
      handlePayAndSubmit();
    }
  }, [submitTrigger, handlePayAndSubmit]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Review & Complete Onboarding</Text>
      <Text style={styles.subtitle}>
        Verify your boutique application before activation
      </Text>

      {/* 1. BUSINESS SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <Icon name="storefront-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Business Profile</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 1</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Shop Name</Text>
            <Text style={styles.summaryValue}>{data.business.shopName || 'The Thrift Garage'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={[styles.summaryValue, { textTransform: 'capitalize' }]}>
              {data.business.businessType || 'Individual'}
            </Text>
          </View>
          <View style={[styles.summaryItem, { width: '100%' }]}>
            <Text style={styles.summaryLabel}>Category</Text>
            <Text style={styles.summaryValue}>
              {data.business.businessCategory || 'Not specified'}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. IDENTITY & KYC SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <Icon name="shield-account-outline" size={18} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Identity & Verification</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 2</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Legal Owner</Text>
            <Text style={styles.summaryValue}>{data.identity.legalName || 'Verified Merchant'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Phone</Text>
            <Text style={styles.summaryValue}>+91 {data.identity.phone || '9864975438'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Aadhar Card</Text>
            <Text style={styles.summaryValue}>
              {data.identity.aadharNumber ? `•••• ${data.identity.aadharNumber.slice(-4)}` : 'Verified Doc'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>PAN Card</Text>
            <Text style={styles.summaryValue}>{data.identity.panNumber || 'ABCDE1234F'}</Text>
          </View>
        </View>
      </View>

      {/* 3. SHOP ADDRESS SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <Icon name="map-marker-radius-outline" size={18} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Warehouse & Location</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 3</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>State / Territory</Text>
            <Text style={styles.summaryValue}>{data.address.state || 'Assam'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>City / Hub</Text>
            <Text style={styles.summaryValue}>{data.address.city || 'Guwahati'}</Text>
          </View>
          <View style={[styles.summaryItem, { width: '100%' }]}>
            <Text style={styles.summaryLabel}>Address & Pincode</Text>
            <Text style={styles.summaryValue}>
              {data.address.streetAddress || 'Shop 12, Fashion Street'}, {data.address.pincode || '781001'}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. PAYOUT SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <Icon name="bank-check" size={18} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Payout Settlement</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 4</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Method</Text>
            <Text style={[styles.summaryValue, { textTransform: 'uppercase' }]}>
              {data.payout.payoutMethod === 'upi' ? 'Instant UPI' : 'Bank Account'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Destination</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {data.payout.payoutMethod === 'upi'
                ? data.payout.upiId || 'shop@upi'
                : `A/C •••• ${data.payout.accountNumber.slice(-4) || '8492'}`}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. LEGAL AGREEMENTS & COMPLIANCE CARD */}
      <View style={styles.legalCard}>
        {/* Header Row */}
        <View style={styles.legalHeaderRow}>
          <View style={styles.legalHeaderLeft}>
            <Icon name="shield-check-outline" size={20} color="#0F172A" />
            <View>
              <Text style={styles.legalHeaderTitle}>LEGAL AGREEMENTS &</Text>
              <Text style={styles.legalHeaderTitle}>COMPLIANCE</Text>
            </View>
          </View>
          <View style={[styles.acceptedPill, isAllAccepted && styles.acceptedPillComplete]}>
            <Text style={[styles.acceptedPillText, isAllAccepted && styles.acceptedPillTextComplete]}>
              {`${acceptedCount}/3 accepted`}
            </Text>
          </View>
        </View>

        {/* Row 1: Nvilar Seller Merchant Agreement */}
        <View style={styles.agreementRow}>
          <TouchableOpacity
            style={[
              styles.legalCheckbox,
              legalAgreements.merchantAgreement && styles.legalCheckboxChecked,
            ]}
            onPress={() => handleToggleAgreement('merchantAgreement')}
            activeOpacity={0.7}
          >
            {legalAgreements.merchantAgreement && <Icon name="check" size={14} color="#FFFFFF" />}
          </TouchableOpacity>
          <View style={styles.agreementInfoCol}>
            <Text style={styles.agreementTitle}>Nvilar Seller Merchant Agreement</Text>
            <Text style={styles.agreementSubtitle}>
              Commercial contract, SLA, commissions, T+2/T+3 payouts, TCS/TDS deductions & anti-counterfeiting policy.
            </Text>
            <TouchableOpacity
              style={styles.readLinkRow}
              onPress={() => handleOpenReader('merchant_agreement')}
              activeOpacity={0.7}
            >
              <Text style={styles.readLinkText}>Read full agreement</Text>
              <Icon name="open-in-new" size={14} color="#2563EB" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.verifiedBadgeCol}>
            {legalAgreements.merchantAgreement ? (
              <View style={styles.verifiedCircle}>
                <Icon name="check" size={15} color="#059669" />
              </View>
            ) : (
              <View style={styles.verifiedPlaceholder} />
            )}
          </View>
        </View>

        {/* Row 2: Seller Terms & Conditions (Platform Rules) */}
        <View style={styles.agreementRow}>
          <TouchableOpacity
            style={[
              styles.legalCheckbox,
              legalAgreements.termsConditions && styles.legalCheckboxChecked,
            ]}
            onPress={() => handleToggleAgreement('termsConditions')}
            activeOpacity={0.7}
          >
            {legalAgreements.termsConditions && <Icon name="check" size={14} color="#FFFFFF" />}
          </TouchableOpacity>
          <View style={styles.agreementInfoCol}>
            <Text style={styles.agreementTitle}>Seller Terms & Conditions (Platform Rules)</Text>
            <Text style={styles.agreementSubtitle}>
              Catalog accuracy, MRP compliance, real-time inventory, no circumvention & prohibited goods policy.
            </Text>
            <TouchableOpacity
              style={styles.readLinkRow}
              onPress={() => handleOpenReader('terms_conditions')}
              activeOpacity={0.7}
            >
              <Text style={styles.readLinkText}>Read full terms</Text>
              <Icon name="open-in-new" size={14} color="#2563EB" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.verifiedBadgeCol}>
            {legalAgreements.termsConditions ? (
              <View style={styles.verifiedCircle}>
                <Icon name="check" size={15} color="#059669" />
              </View>
            ) : (
              <View style={styles.verifiedPlaceholder} />
            )}
          </View>
        </View>

        {/* Row 3: Seller Privacy Policy (DPDP Act 2023) */}
        <View style={styles.agreementRow}>
          <TouchableOpacity
            style={[
              styles.legalCheckbox,
              legalAgreements.privacyPolicy && styles.legalCheckboxChecked,
            ]}
            onPress={() => handleToggleAgreement('privacyPolicy')}
            activeOpacity={0.7}
          >
            {legalAgreements.privacyPolicy && <Icon name="check" size={14} color="#FFFFFF" />}
          </TouchableOpacity>
          <View style={styles.agreementInfoCol}>
            <Text style={styles.agreementTitle}>Seller Privacy Policy (DPDP Act 2023)</Text>
            <Text style={styles.agreementSubtitle}>
              Secure KYC, banking & GPS data processing under DPDP Act. No third-party data sale. Grievance officer on record.
            </Text>
            <TouchableOpacity
              style={styles.readLinkRow}
              onPress={() => handleOpenReader('privacy_policy')}
              activeOpacity={0.7}
            >
              <Text style={styles.readLinkText}>Read full privacy policy</Text>
              <Icon name="open-in-new" size={14} color="#2563EB" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.verifiedBadgeCol}>
            {legalAgreements.privacyPolicy ? (
              <View style={styles.verifiedCircle}>
                <Icon name="check" size={15} color="#059669" />
              </View>
            ) : (
              <View style={styles.verifiedPlaceholder} />
            )}
          </View>
        </View>
      </View>

      {/* 6. ONBOARDING & VERIFICATION FEE INFO CARD */}
      <View style={styles.feeCard}>
        <View style={styles.feeHeaderRow}>
          <View style={styles.feeTitleCol}>
            <View style={styles.feeTitleTagRow}>
              <Icon name="shield-check" size={17} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.feeCardTitle}>Partner Verification Fee</Text>
            </View>
            <Text style={styles.feeCardSubtitle}>
              One-time merchant KYC & background verification
            </Text>
          </View>

          <View style={styles.feeAmountBox}>
            <Text style={styles.feeAmountText}>₹199</Text>
            <Text style={styles.feeGstNotice}>INCL. GST</Text>
          </View>
        </View>

        <View style={styles.feeDivider} />

        <View style={styles.paymentGatewaysRow}>
          <View style={styles.gatewayPill}>
            <Icon name="shield-check" size={13} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.gatewayText}>Razorpay Secured</Text>
          </View>
          <View style={styles.gatewayPill}>
            <Icon name="qrcode-scan" size={13} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.gatewayText}>UPI / Cards / NetBanking</Text>
          </View>
        </View>
      </View>

      {/* Full Legal Document Reader Modal */}
      <Modal
        visible={Boolean(readerModalVisible && selectedDoc)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setReaderModalVisible(false);
          setSelectedDoc(null);
        }}
      >
        <View style={[styles.readerContainer, { paddingTop: Platform.OS === 'ios' ? 20 : insets.top }]}>
          {/* Reader Top Header Bar */}
          <View style={styles.readerHeader}>
            <View style={styles.readerHeaderTitleCol}>
              <View style={styles.readerBadgeRow}>
                <View style={styles.readerDocIconWrap}>
                  <Icon name="file-document-outline" size={16} color="#2563EB" />
                </View>
                <View style={styles.readerVersionBadge}>
                  <Text style={styles.readerVersionText}>
                    {selectedDoc?.version || 'v2.4 - September 2026'}
                  </Text>
                </View>
              </View>
              <Text style={styles.readerDocTitle} numberOfLines={2}>
                {selectedDoc?.title || 'Legal Document'}
              </Text>
              <Text style={styles.readerUpdatedDate}>
                Effective Date: {selectedDoc?.lastUpdated || 'September 2026'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.readerCloseBtn}
              onPress={() => {
                setReaderModalVisible(false);
                setSelectedDoc(null);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Icon name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Document Content */}
          <ScrollView
            style={styles.readerScrollView}
            contentContainerStyle={styles.readerScrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Preamble / Notice Banner */}
            <View style={styles.readerPreambleBox}>
              <Icon name="shield-check" size={20} color="#2563EB" style={{ marginRight: 10, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.readerPreambleTitle}>Statutory & Binding Contract</Text>
                <Text style={styles.readerPreambleText}>
                  {selectedDoc?.preambleSubtitle ||
                    'This document constitutes an electronic record in accordance with the Information Technology Act, 2000 and rules thereunder.'}
                </Text>
              </View>
            </View>

            {/* Document Sections */}
            {selectedDoc?.sections.map((section) => (
              <View key={section.number} style={styles.readerSectionBlock}>
                <View style={styles.readerSectionHeaderRow}>
                  <View style={styles.readerSectionNumBadge}>
                    <Text style={styles.readerSectionNumText}>{section.number}</Text>
                  </View>
                  <Text style={styles.readerSectionTitle}>{section.title}</Text>
                </View>
                {section.paragraphs.map((p, pIdx) => (
                  <Text key={pIdx} style={styles.readerParagraphText}>
                    {p}
                  </Text>
                ))}
              </View>
            ))}

            {/* End of Document Seal */}
            <View style={styles.readerFooterSeal}>
              <Icon name="seal" size={28} color="#059669" />
              <Text style={styles.readerSealText}>Official Legal Document • Nvilar Marketplace</Text>
              <Text style={styles.readerSealSub}>Nvilar Technologies Private Limited</Text>
            </View>
          </ScrollView>

          {/* Sticky Bottom Acceptance Bar */}
          <View style={[styles.readerBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {selectedDoc &&
            ((selectedDoc.id === 'merchant_agreement' && legalAgreements.merchantAgreement) ||
              (selectedDoc.id === 'terms_conditions' && legalAgreements.termsConditions) ||
              (selectedDoc.id === 'privacy_policy' && legalAgreements.privacyPolicy)) ? (
              <TouchableOpacity
                style={styles.readerAcceptedFullBtn}
                onPress={() => {
                  setReaderModalVisible(false);
                  setSelectedDoc(null);
                }}
                activeOpacity={0.85}
              >
                <Icon name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.readerAcceptedFullText}>Document Accepted ✓ Tap to Close</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.readerAcceptBtn}
                onPress={handleAcceptFromReader}
                activeOpacity={0.85}
              >
                <Icon name="check-bold" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.readerAcceptBtnText}>
                  {selectedDoc?.acceptButtonText || 'I have read and accept this document'} ✓
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal with Rewarding Triumph Animation */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successModalCard,
              {
                opacity: cardOpacityAnim,
                transform: [{ scale: cardScaleAnim }],
              },
            ]}
          >
            {/* Triumph Icon Wrapper with Halo Effect */}
            <View style={styles.iconWrapperContainer}>
              {/* Expanding Shockwave Halo */}
              <Animated.View
                style={[
                  styles.haloRing,
                  {
                    opacity: ringOpacityAnim,
                    transform: [{ scale: ringScaleAnim }],
                  },
                ]}
              />
              {/* Secondary Soft Emerald Glow Ring */}
              <View style={styles.haloRingStatic} />

              {/* Main Emerald Circle with Pulse and Spring */}
              <Animated.View
                style={[
                  styles.successIconCircle,
                  {
                    transform: [
                      { scale: iconScaleAnim },
                      { scale: pulseAnim },
                    ],
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [
                      { scale: checkmarkScaleAnim },
                      { rotate: checkmarkRotate },
                    ],
                  }}
                >
                  <Icon name="check-bold" size={38} color="#FFFFFF" />
                </Animated.View>
              </Animated.View>
            </View>

            {/* Staggered Content Slide & Fade */}
            <Animated.View
              style={{
                width: '100%',
                alignItems: 'center',
                opacity: contentFadeAnim,
                transform: [{ translateY: contentSlideAnim }],
              }}
            >
              <Text style={styles.successTitle}>Application Submitted! 🎉</Text>
              <Text style={styles.successSubtitle}>
                Welcome to the Nvilar Boutique Partner Network. Your boutique profile is currently under review.
              </Text>

              <View style={styles.refBox}>
                <View style={styles.refHeaderRow}>
                  <Icon name="shield-check" size={14} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={styles.refLabel}>PARTNER APPLICATION ID</Text>
                </View>
                <Text style={styles.refValue}>{partnerRef}</Text>
              </View>

              <View style={styles.timelineRow}>
                <Icon name="clock-time-four-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={styles.timelineText}>
                  Our onboarding team will review your boutique within 24 hours.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={handleSuccessClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>Review Application</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
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
    marginBottom: 18,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryItem: {
    width: '48%',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 1,
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  /* Legal Agreements & Compliance Card Styles */
  legalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  legalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  legalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legalHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  acceptedPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  acceptedPillComplete: {
    backgroundColor: '#ECFDF5',
  },
  acceptedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  acceptedPillTextComplete: {
    color: '#059669',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  legalCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  legalCheckboxChecked: {
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  agreementInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  agreementTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  agreementSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  readLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  verifiedBadgeCol: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  verifiedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedPlaceholder: {
    width: 24,
    height: 24,
  },
  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 2,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  feeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  feeTitleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  feeCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  feeAmountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  feeAmountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  feeGstNotice: {
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  feeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  paymentGatewaysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gatewayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  gatewayText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  /* Full Legal Reader Modal Styles */
  readerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  readerHeaderTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  readerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  readerDocIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerVersionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readerVersionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  readerDocTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  readerUpdatedDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  readerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerScrollView: {
    flex: 1,
  },
  readerScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  readerPreambleBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  readerPreambleTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 2,
  },
  readerPreambleText: {
    fontSize: 11.5,
    color: '#3B82F6',
    lineHeight: 16,
    fontWeight: '500',
  },
  readerSectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  readerSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  readerSectionNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  readerSectionNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  readerSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  readerParagraphText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 8,
  },
  readerFooterSeal: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  readerSealText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    marginTop: 8,
  },
  readerSealSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  readerBottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 6,
  },
  readerAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  readerAcceptBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1,
  },
  readerAcceptedFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  readerAcceptedFullText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapperContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  haloRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#10B981',
  },
  haloRingStatic: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  refBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  refHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  refLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  refValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2563EB',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timelineText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
