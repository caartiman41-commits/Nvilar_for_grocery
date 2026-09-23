import React from 'react';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthStore } from './authStore';

export const AuthScreen = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = React.useState('');
  const { setUser } = useAuthStore();

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setUser({
        uid: 'user-123',
        phoneNumber,
        displayName: 'Guest User',
      });
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Icon name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login or Signup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {step === 'phone' ? 'Enter your phone number' : 'Enter verification code'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'phone' 
            ? 'We will send you a 4-digit verification code.'
            : `Code sent to +91 ${phoneNumber}`
          }
        </Text>

        {step === 'phone' ? (
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="10 digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { textAlign: 'center' }]}
              placeholder="----"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
          </View>
        )}

        <PrimaryButton
          title={step === 'phone' ? 'Continue' : 'Verify & Proceed'}
          onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
          disabled={step === 'phone' ? phoneNumber.length < 10 : otp.length < 4}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 32, // to balance the close button width
  },
  content: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 56,
    marginBottom: spacing.xl,
  },
  prefix: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    marginTop: 40,
  },
});
