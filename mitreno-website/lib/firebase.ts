import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, Auth, PhoneAuthProvider, PhoneMultiFactorGenerator, multiFactor } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is valid to prevent crashes in dev before keys are added
let app;
let auth: Auth | null = null;

if (
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXX"
) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    auth.useDeviceLanguage(); // Important for OTP SMS localization
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
} else {
  console.warn("⚠️ Firebase configuration is missing or using placeholder values. Authentication will run in mock mode or fail.");
}

export { app, auth, RecaptchaVerifier, signInWithPhoneNumber };
