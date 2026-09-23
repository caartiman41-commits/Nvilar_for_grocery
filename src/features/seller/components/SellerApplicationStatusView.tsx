import React, { useState, memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSellerStore } from '../sellerStore';
import { showToast } from '../../../components/MitrenoToast';

export interface SellerApplicationStatusViewProps {
  onBack?: () => void;
  onClose?: () => void;
  onReapply?: () => void;
}

const CANCELLATION_REASONS = [
  'Submitted incorrect shop or KYC details',
  'Want to change boutique category or type',
  'Not ready to launch boutique right now',
  'Need to update bank / payout account',
  'Other reason',
];

export const SellerApplicationStatusView: React.FC<SellerApplicationStatusViewProps> = memo(({
  onBack,
  onClose,
  onReapply,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { applicationId, cancelApplication } = useSellerStore();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fallback authentic ID if empty
  const displayAppId = applicationId || 'sa_KD56AHEq_97491';

  const handleBackPress = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  }, [onBack, navigation]);

  const handleClosePress = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigation.navigate('MainTabs');
    }
  }, [onClose, navigation]);

  // Hardware Back Button listener on Android - gracefully handle back navigation
  useEffect(() => {
    const onBackPress = () => {
      handleBackPress();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [handleBackPress]);

  const handleConfirmCancel = useCallback(() => {
    setIsCancelling(true);
    setTimeout(() => {
      cancelApplication(selectedReason);
      setIsCancelling(false);
      setCancelModalVisible(false);

      showToast({
        type: 'info',
        title: 'Application Cancelled',
        message: 'Your application has been withdrawn. You can re-apply anytime.',
      });

      if (onReapply) {
        onReapply();
      }
    }, 400);
  }, [cancelApplication, selectedReason, onReapply]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={handleBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Application Status</Text>
          <Text style={styles.headerAppId}>Ref: {displayAppId}</Text>
        </View>

        <TouchableOpacity
          style={styles.headerCloseBtn}
          onPress={handleClosePress}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="close" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}
      >
        {/* 1. TOP STATUS CARD: Application Under Review */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardHeader}>
            <View style={styles.clockCircle}>
              <Icon name="clock-outline" size={22} color="#D97706" />
            </View>
            <View style={styles.statusHeaderTextCol}>
              <Text style={styles.statusCardTitle}>Application Under Review</Text>
              <Text style={styles.statusCardSub}>Boutique Onboarding Verification</Text>
            </View>
            <View style={styles.underAuditBadge}>
              <Text style={styles.underAuditBadgeText}>Under Audit</Text>
            </View>
          </View>

          <Text style={styles.statusCardDescription}>
            Your seller application has been submitted and is currently being audited by the Mitreno compliance team.
          </Text>

          <View style={styles.reviewTimePill}>
            <Icon name="timer-sand" size={14} color="#92400E" style={{ marginRight: 6 }} />
            <Text style={styles.reviewTimeText}>Estimated Review: 24 – 48 Hours</Text>
          </View>

          <TouchableOpacity
            style={styles.openStudioBtn}
            onPress={() => {
              useSellerStore.getState().approveApplication();
              navigation.navigate('SellerStudio');
            }}
            activeOpacity={0.85}
          >
            <Icon name="storefront" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.openStudioBtnText}>Enter Seller Studio</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* 2. SECOND CARD: LIVE VERIFICATION TRACKER */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerHeading}>LIVE VERIFICATION TRACKER</Text>

          <View style={styles.timelineList}>
            {/* Stage 1: Application Submitted (Done) */}
            <View style={styles.stageItem}>
              <View style={styles.stageLeftCol}>
                <View style={[styles.stageNodeCircle, styles.stageDoneCircle]}>
                  <Icon name="check" size={15} color="#FFFFFF" />
                </View>
                {/* Connecting Line from Stage 1 to Stage 2 */}
                <View style={[styles.timelineConnector, styles.connectorDone]} />
              </View>
              <View style={styles.stageContentCol}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageTitle}>Application Submitted</Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                </View>
                <Text style={styles.stageSubtitle}>KYC documents & shop profile received</Text>
              </View>
            </View>

            {/* Stage 2: KYC & Identity Verification (Active Now) */}
            <View style={styles.stageItem}>
              <View style={styles.stageLeftCol}>
                <View style={[styles.stageNodeCircle, styles.stageActiveCircle]}>
                  <Icon name="clock-outline" size={15} color="#FFFFFF" />
                </View>
                {/* Connecting Line from Stage 2 to Stage 3 */}
                <View style={[styles.timelineConnector, styles.connectorInactive]} />
              </View>
              <View style={styles.stageContentCol}>
                <View style={styles.stageTitleRow}>
                  <Text style={styles.stageTitle}>KYC & Identity Verification</Text>
                  <View style={styles.inProgressBadge}>
                    <Text style={styles.inProgressBadgeText}>In Progress</Text>
                  </View>
                </View>
                <Text style={styles.stageSubtitle}>
                  Auditing Aadhaar, PAN card & address legitimacy
                </Text>
              </View>
            </View>

            {/* Stage 3: Admin Approval & Clearance (Pending) */}
            <View style={styles.stageItem}>
              <View style={styles.stageLeftCol}>
                <View style={[styles.stageNodeCircle, styles.stagePendingCircle]}>
                  <Text style={styles.stagePendingNum}>3</Text>
                </View>
                {/* Connecting Line from Stage 3 to Stage 4 */}
                <View style={[styles.timelineConnector, styles.connectorInactive]} />
              </View>
              <View style={styles.stageContentCol}>
                <View style={styles.stageTitleRow}>
                  <Text style={[styles.stageTitle, styles.stageTitlePending]}>
                    Admin Approval & Clearance
                  </Text>
                </View>
                <Text style={styles.stageSubtitle}>
                  Boutique curation & catalog compliance sign-off
                </Text>
              </View>
            </View>

            {/* Stage 4: Boutique Activation (Pending) */}
            <View style={styles.stageItemLast}>
              <View style={styles.stageLeftCol}>
                <View style={[styles.stageNodeCircle, styles.stagePendingCircle]}>
                  <Icon name="storefront-outline" size={14} color="#94A3B8" />
                </View>
              </View>
              <View style={styles.stageContentCol}>
                <View style={styles.stageTitleRow}>
                  <Text style={[styles.stageTitle, styles.stageTitlePending]}>
                    Boutique Activation
                  </Text>
                </View>
                <Text style={styles.stageSubtitle}>
                  Seller Studio access & live customer orders
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. CANCEL APPLICATION ACTION SECTION */}
        <View style={styles.cancelSection}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setCancelModalVisible(true)}
            activeOpacity={0.8}
          >
            <Icon name="close-circle-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.cancelBtnText}>Cancel Application</Text>
          </TouchableOpacity>
          <Text style={styles.cancelNoticeText}>
            You can withdraw and re-apply at any time.
          </Text>
        </View>
      </ScrollView>

      {/* CANCELLATION REASON MODAL */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Icon name="alert-circle-outline" size={28} color="#DC2626" />
            </View>

            <Text style={styles.modalTitle}>Cancel Seller Application?</Text>
            <Text style={styles.modalSubtitle}>
              Please select a reason for withdrawing your application. You can re-apply anytime.
            </Text>

            {/* Reasons List */}
            <View style={styles.reasonsList}>
              {CANCELLATION_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                    <Text
                      style={[styles.reasonText, isSelected && styles.reasonTextSelected]}
                      numberOfLines={2}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.keepBtn}
                onPress={() => setCancelModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.keepBtnText}>Keep Application</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmCancelBtn, isCancelling && styles.confirmCancelBtnDisabled]}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmCancelBtnText}>
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerAppId: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '600',
  },
  headerCloseBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  /* Top Card: Application Under Review */
  statusCard: {
    width: '100%',
    backgroundColor: '#FFFDF7',
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusHeaderTextCol: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  statusCardSub: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    marginTop: 1,
  },
  underAuditBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  underAuditBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  statusCardDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  reviewTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reviewTimeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  openStudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 12,
  },
  openStudioBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  /* Tracker Card */
  trackerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  trackerHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  timelineList: {
    paddingLeft: 2,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stageItemLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stageLeftCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stageNodeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageDoneCircle: {
    backgroundColor: '#059669',
  },
  stageActiveCircle: {
    backgroundColor: '#D97706',
  },
  stagePendingCircle: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  stagePendingNum: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
  },
  timelineConnector: {
    width: 2,
    height: 28,
    marginVertical: 2,
  },
  connectorDone: {
    backgroundColor: '#059669',
  },
  connectorInactive: {
    backgroundColor: '#E2E8F0',
  },
  stageContentCol: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 16,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  stageTitlePending: {
    color: '#64748B',
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  inProgressBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inProgressBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  stageSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 1,
  },
  /* Cancel Section */
  cancelSection: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    marginBottom: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  cancelNoticeText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  /* Cancellation Reason Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  reasonsList: {
    width: '100%',
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonRowSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#DC2626',
  },
  radioInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
  },
  reasonText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#DC2626',
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
