import { NativeModules, Platform } from 'react-native';

const { TruecallerAuth } = NativeModules;

export interface TruecallerLoginResult {
  success: boolean;
  authCode?: string;
  state?: string;
  phoneNumber?: string;
  name?: string;
  error?: string;
  errorCode?: number;
}

export interface TruecallerDiagnostics {
  packageName: string;
  appSha1: string;
  clientId: string;
  isInstalled: boolean;
  isOAuthUsable: boolean;
  isInitialized: boolean;
}

export const TruecallerAuthService = {
  /**
   * Checks whether Truecaller 1-Tap OAuth flow is usable on this device.
   * Checks both if Truecaller app is installed and if OAuth flow is active.
   */
  isUsable: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !TruecallerAuth) {
      return false;
    }
    try {
      const res = await TruecallerAuth.isUsable();
      if (typeof res === 'object' && res !== null) {
        return !!res.isUsable;
      }
      return !!res;
    } catch {
      return false;
    }
  },

  /**
   * Checks if Truecaller app is installed on the device.
   */
  isInstalled: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !TruecallerAuth) {
      return false;
    }
    try {
      const res = await TruecallerAuth.isUsable();
      if (typeof res === 'object' && res !== null) {
        return !!res.isInstalled;
      }
      return !!res;
    } catch {
      return false;
    }
  },

  /**
   * Returns live cryptographic & package configuration diagnostics.
   */
  getDiagnostics: async (): Promise<TruecallerDiagnostics | null> => {
    if (Platform.OS !== 'android' || !TruecallerAuth || !TruecallerAuth.getDiagnostics) {
      return null;
    }
    try {
      const diag = await TruecallerAuth.getDiagnostics();
      return diag;
    } catch (e: any) {
      console.warn('[Truecaller Diagnostics Error]:', e?.message);
      return null;
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
      const errorCode = err?.userInfo?.errorCode || (err?.code ? parseInt(err.code.replace(/\D/g, ''), 10) : undefined);
      return {
        success: false,
        error: err.message || 'Truecaller verification cancelled or failed',
        errorCode: Number.isNaN(errorCode) ? undefined : errorCode,
      };
    }
  },
};
