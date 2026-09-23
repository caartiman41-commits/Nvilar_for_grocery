import { NativeModules, Platform } from 'react-native';

const { TruecallerAuth } = NativeModules;

export interface TruecallerLoginResult {
  success: boolean;
  authCode?: string;
  state?: string;
  phoneNumber?: string;
  name?: string;
  error?: string;
}

export const TruecallerAuthService = {
  /**
   * Checks whether Truecaller 1-Tap OAuth flow is usable on this device.
   * Truecaller app must be installed, active, and user logged in.
   */
  isUsable: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !TruecallerAuth) {
      return false;
    }
    try {
      const usable = await TruecallerAuth.isUsable();
      return !!usable;
    } catch {
      return false;
    }
  },

  /**
   * Prompts the native Truecaller 1-Tap BottomSheet dialog.
   * Resolves with authorization code and verification state.
   */
  requestOneTapLogin: async (): Promise<TruecallerLoginResult> => {
    if (Platform.OS !== 'android' || !TruecallerAuth) {
      return { success: false, error: 'Truecaller is only supported on Android devices' };
    }

    try {
      const res = await TruecallerAuth.requestOneTapLogin();
      return {
        success: true,
        authCode: res.authCode,
        state: res.state,
        phoneNumber: res.phoneNumber,
        name: res.name,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Truecaller verification cancelled or failed',
      };
    }
  },
};
