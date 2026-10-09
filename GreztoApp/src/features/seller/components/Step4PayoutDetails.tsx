import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  PayoutDetailsData,
  PayoutMethod,
  BankAccountType,
} from '../sellerOnboardingTypes';

export interface Step4PayoutDetailsProps {
  data: PayoutDetailsData;
  onChange: (data: Partial<PayoutDetailsData>) => void;
}

export const Step4PayoutDetails: React.FC<Step4PayoutDetailsProps> = memo(({
  data,
  onChange,
}) => {
  const isMatch =
    data.accountNumber &&
    data.confirmAccountNumber &&
    data.accountNumber === data.confirmAccountNumber;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payout & Bank Verification</Text>
      <Text style={styles.subtitle}>
        Direct automated settlements for your daily boutique sales
      </Text>

      {/* 1. BANK ACCOUNT SETTLEMENT FORM */}
      <View style={styles.bankFormCard}>
        {/* Account Type Selector (Savings vs Current with Warm Styling) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            ACCOUNT TYPE <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.typeRow}>
            {(['savings', 'current'] as BankAccountType[]).map((type) => {
              const isSelected = data.accountType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.accountTypePill,
                    isSelected && styles.accountTypePillActive,
                  ]}
                  onPress={() => onChange({ accountType: type })}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={type === 'savings' ? 'piggy-bank-outline' : 'briefcase-check-outline'}
                    size={17}
                    color={isSelected ? '#B45309' : '#64748B'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.accountTypeText,
                      isSelected && styles.accountTypeTextActive,
                    ]}
                  >
                    {type === 'savings' ? 'Savings Account' : 'Current Account'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account Holder Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            ACCOUNT HOLDER NAME <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Full name as registered with bank"
            placeholderTextColor="#94A3B8"
            value={data.accountHolderName}
            onChangeText={(text) => onChange({ accountHolderName: text })}
            autoCapitalize="words"
          />
        </View>

        {/* Bank Account Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            BANK ACCOUNT NUMBER <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 50100234567890"
            placeholderTextColor="#94A3B8"
            value={data.accountNumber}
            onChangeText={(text) => onChange({ accountNumber: text.replace(/\D/g, '') })}
            keyboardType="numeric"
            secureTextEntry={false}
          />
        </View>

        {/* Confirm Bank Account Number */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelWithBadgeRow}>
            <Text style={styles.fieldLabel}>
              RE-ENTER ACCOUNT NUMBER <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            {isMatch && (
              <View style={styles.matchBadge}>
                <Icon name="check" size={12} color="#059669" />
                <Text style={styles.matchBadgeText}>MATCHED</Text>
              </View>
            )}
          </View>
          <TextInput
            style={[
              styles.textInput,
              isMatch ? styles.inputValid : null,
            ]}
            placeholder="Re-enter to verify"
            placeholderTextColor="#94A3B8"
            value={data.confirmAccountNumber}
            onChangeText={(text) => onChange({ confirmAccountNumber: text.replace(/\D/g, '') })}
            keyboardType="numeric"
          />
        </View>

        {/* IFSC Code */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            IFSC CODE <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. HDFC0000240"
            placeholderTextColor="#94A3B8"
            value={data.ifscCode}
            onChangeText={(text) => onChange({ ifscCode: text.toUpperCase().slice(0, 11) })}
            autoCapitalize="characters"
            maxLength={11}
          />
        </View>
      </View>

      {/* 2. INLINE INSTANT UPI SETTLEMENT (OPTIONAL) ON SAME PAGE */}
      <View style={styles.upiCard}>
        <View style={styles.upiCardHeader}>
          <View style={styles.upiHeaderTitleRow}>
            <Icon name="qrcode-scan" size={18} color="#D97706" style={{ marginRight: 6 }} />
            <Text style={styles.upiCardTitle}>Instant UPI Settlement</Text>
          </View>
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalBadgeText}>OPTIONAL</Text>
          </View>
        </View>
        <Text style={styles.upiCardSubtitle}>
          Add your merchant UPI ID for automated daily settlements
        </Text>

        <View style={[styles.fieldGroup, { marginTop: 12, marginBottom: 10 }]}>
          <Text style={styles.fieldLabel}>MERCHANT UPI VPA / ID</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. yourboutique@okhdfcbank"
            placeholderTextColor="#94A3B8"
            value={data.upiId}
            onChangeText={(text) => onChange({ upiId: text.trim().toLowerCase() })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.upiTrustNotice}>
          <Icon name="lightning-bolt" size={16} color="#D97706" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.upiTrustTitle}>Daily 24-Hour Settlement</Text>
            <Text style={styles.upiTrustSub}>
              Nvilar deposits verified order proceeds directly to your account daily at 11:00 PM.
            </Text>
          </View>
        </View>
      </View>

      {/* Security & RBI Compliance Note */}
      <View style={styles.securityRow}>
        <Icon name="lock-check-outline" size={16} color="#059669" style={{ marginRight: 6 }} />
        <Text style={styles.securityText}>
          256-Bit Bank-Grade Encryption • RBI Compliant Escrow Payouts
        </Text>
      </View>
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
  bankFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
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
  inputValid: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accountTypePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFDF7',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  accountTypePillActive: {
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
    shadowOpacity: 0.1,
  },
  accountTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  accountTypeTextActive: {
    color: '#92400E',
    fontWeight: '800',
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  matchBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  upiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  upiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  upiHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  upiCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  optionalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  upiTrustNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
  },
  upiTrustTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  upiTrustSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
});
