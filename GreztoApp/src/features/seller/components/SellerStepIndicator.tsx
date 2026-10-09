import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface SellerStepIndicatorProps {
  currentStep: number;
  onStepPress?: (step: number) => void;
  onClose: () => void;
  onBack?: () => void;
}

const STEPS = [
  { step: 1, label: 'Business', title: 'Business Details', progress: '20%' },
  { step: 2, label: 'Identity', title: 'Proprietor Identity & KYC', progress: '40%' },
  { step: 3, label: 'Address', title: 'Shop Address', progress: '60%' },
  { step: 4, label: 'Payout', title: 'Payout & Bank Verification', progress: '80%' },
  { step: 5, label: 'Review', title: 'Review & Submit', progress: '100%' },
];

export const SellerStepIndicator: React.FC<SellerStepIndicatorProps> = memo(({
  currentStep,
  onStepPress,
  onClose,
  onBack,
}) => {
  const currentStepObj = STEPS.find((s) => s.step === currentStep) || STEPS[0];

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            if (currentStep > 1 && onBack) {
              onBack();
            } else {
              onClose();
            }
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Close onboarding"
        >
          <Icon name={currentStep === 1 ? 'close' : 'arrow-left'} size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.brandTitleCol}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Nvilar Seller</Text>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>PARTNER</Text>
            </View>
          </View>
          <Text style={styles.stepSubtitle}>
            Step {currentStep} of 5 • {currentStepObj.title}
          </Text>
        </View>

        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{currentStepObj.progress}</Text>
        </View>
      </View>

      {/* 5-Step Horizontal Stepper */}
      <View style={styles.stepperRow}>
        {STEPS.map((s, index) => {
          const isCompleted = s.step < currentStep;
          const isActive = s.step === currentStep;

          return (
            <React.Fragment key={s.step}>
              {/* Stepper Node */}
              <TouchableOpacity
                style={styles.stepNode}
                onPress={() => isCompleted && onStepPress && onStepPress(s.step)}
                disabled={!isCompleted}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                  ]}
                >
                  {isCompleted ? (
                    <Icon name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.circleText,
                        isActive && styles.circleTextActive,
                      ]}
                    >
                      {s.step}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isActive && styles.stepLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>

              {/* Connecting Bar */}
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connectingLine,
                    s.step < currentStep && styles.connectingLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitleCol: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  partnerBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  partnerBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  progressPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepNode: {
    alignItems: 'center',
    width: 52,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleCompleted: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  circleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
    borderWidth: 2.5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  circleTextActive: {
    color: '#2563EB',
    fontWeight: '900',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#0F172A',
    fontWeight: '700',
  },
  stepLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  connectingLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  connectingLineCompleted: {
    backgroundColor: '#2563EB',
  },
});
