import {
  getAuth,
  signInWithPhoneNumber,
  signOut as fbSignOut,
  ConfirmationResult,
  User,
} from '@react-native-firebase/auth';

export interface FirebasePhoneAuthResult {
  success: boolean;
  confirmation?: ConfirmationResult;
  user?: User;
  error?: string;
}

export const FirebaseAuthService = {
  /**
   * Sends 6-digit SMS OTP via Firebase Phone Auth
   * @param phoneNumber Full international format, e.g. "+919876543210"
   */
  sendPhoneOtp: async (phoneNumber: string): Promise<FirebasePhoneAuthResult> => {
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone);
      return {
        success: true,
        confirmation,
      };
    } catch (err: any) {
      console.warn('[FirebaseAuthService.sendPhoneOtp] Error:', err.message);
      return {
        success: false,
        error: err.message || 'Failed to send SMS OTP. Please check the number.',
      };
    }
  },

  /**
   * Confirms the 6-digit SMS OTP received by the user
   */
  confirmOtp: async (
    confirmation: ConfirmationResult,
    otpCode: string
  ): Promise<FirebasePhoneAuthResult> => {
    try {
      const credential = await confirmation.confirm(otpCode);
      return {
        success: true,
        user: credential?.user,
      };
    } catch (err: any) {
      console.warn('[FirebaseAuthService.confirmOtp] Error:', err.message);
      return {
        success: false,
        error: err.message || 'Invalid or expired OTP code.',
      };
    }
  },

  /**
   * Sign out current Firebase user
   */
  signOut: async () => {
    try {
      const auth = getAuth();
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
  },
};
