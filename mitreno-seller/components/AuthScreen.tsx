"use client";

import React, { useState, useEffect, useRef, FormEvent, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, ShieldCheck, User as UserIcon, Smartphone, Mail } from "lucide-react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function AuthScreen() {
  const { skipToGuest, syncWithBackend } = useAuth();
  
  // State for tabs and steps
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  
  // Form State
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // OTP / Firebase State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  // 60-second Timer State
  const [countdown, setCountdown] = useState(0);
  
  // Refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Unique ID for recaptcha container to prevent "removed element" errors
  const recaptchaContainerId = "recaptcha-container-" + useId().replace(/:/g, "");

  // Setup reCAPTCHA when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && auth) {
      // Clear existing verifier if it exists (e.g. after logout)
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = undefined;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
        callback: (response: any) => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please try again.");
        }
      });
    }

    return () => {
      if (typeof window !== "undefined" && window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (countdown > 0) {
      const timerId = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [countdown]);

  const handleSendOTP = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }

    if (!auth) {
      setError("Authentication is currently unavailable. Running in mock mode.");
      return;
    }

    setIsLoading(true);
    try {
      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      setCountdown(60); // Start 60-second timer!
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isLoading) return;
    await handleSendOTP();
  };

  const handleOTPChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPpaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6).split("");
    if (pastedData.some(c => isNaN(Number(c)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled input
    const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5;
    otpInputRefs.current[nextEmptyIndex]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!confirmationResult) {
      setError("Please request a new OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;
      
      // Successfully logged in via Firebase! Now sync with Go backend.
      await syncWithBackend(user, mode === "signup" ? name : undefined, mode === "signup" ? email : undefined); 
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setError("Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress bar percentage for OTP timer
  const timerProgress = countdown > 0 ? ((60 - countdown) / 60) * 100 : 100;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden font-sans">
      
      {/* Skip Button — top right */}
      <div className="flex justify-end px-5 pt-5">
        <button 
          onClick={skipToGuest}
          className="text-neutral-400 hover:text-neutral-700 flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors group cursor-pointer"
        >
          Skip
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-black tracking-tight text-neutral-900" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <span className="text-[#C5963A]">M</span>ITRENO
          </h1>
          <p className="text-neutral-400 text-xs font-medium tracking-widest uppercase mt-1.5">The pinnacle of bargaining</p>
        </motion.div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div 
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Tab Switcher */}
                <div className="flex bg-neutral-100 rounded-xl p-1 mb-7 relative">
                  <motion.div 
                    className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
                    animate={{ x: mode === "login" ? 4 : "calc(100% + 4px)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                  <button
                    onClick={() => { setMode("login"); setError(""); }}
                    className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-lg transition-colors cursor-pointer ${mode === "login" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode("signup"); setError(""); }}
                    className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-lg transition-colors cursor-pointer ${mode === "signup" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <AnimatePresence>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Full Name</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <UserIcon className="w-4.5 h-4.5 text-neutral-300 group-focus-within:text-[#1246B8] transition-colors" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3.5 pl-11 pr-4 text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-[#1246B8] focus:ring-2 focus:ring-[#1246B8]/10 focus:bg-white transition-all text-sm font-medium"
                          />
                        </div>

                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 mt-4 block">Email Address (Optional)</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-4.5 h-4.5 text-neutral-300 group-focus-within:text-[#1246B8] transition-colors" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3.5 pl-11 pr-4 text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-[#1246B8] focus:ring-2 focus:ring-[#1246B8]/10 focus:bg-white transition-all text-sm font-medium"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                    <div className="relative flex group">
                      <div className="flex-shrink-0 flex items-center justify-center w-16 bg-neutral-50 border border-r-0 border-neutral-200 rounded-l-xl text-neutral-600 font-bold text-sm select-none">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="flex-1 w-full bg-neutral-50 border border-l-0 border-neutral-200 rounded-r-xl py-3.5 pr-4 pl-3 text-neutral-900 placeholder-neutral-300 focus:outline-none focus:bg-white transition-all text-sm font-medium"
                        autoFocus
                      />
                      {/* Combined focus ring */}
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-focus-within:border-[#1246B8] pointer-events-none transition-colors" />
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 10}
                    className="w-full bg-[#1246B8] hover:bg-[#0E3A9C] active:scale-[0.98] text-white font-bold rounded-xl py-4 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1246B8]/20 cursor-pointer text-sm tracking-wide"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {mode === "login" ? "Send Verification Code" : "Create Account & Verify"}
                      </span>
                    )}
                  </button>
                </form>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 mt-7 pt-6 border-t border-neutral-100">
                  {[
                    { icon: <ShieldCheck className="w-4 h-4" />, label: "Secure OTP" },
                    { icon: <Smartphone className="w-4 h-4" />, label: "Phone Auth" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-1.5 text-neutral-300">
                      {badge.icon}
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center"
              >
                {/* Shield icon */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-[#1246B8]/10 flex items-center justify-center mb-5"
                >
                  <ShieldCheck className="w-8 h-8 text-[#1246B8]" />
                </motion.div>
                
                <h2 className="text-xl font-black text-neutral-900 mb-1.5 tracking-tight">Verify your number</h2>
                <p className="text-neutral-400 text-center text-sm mb-1">
                  We sent a 6-digit code to
                </p>
                <p className="text-center mb-6">
                  <span className="text-neutral-900 font-bold text-sm">+91 {phone}</span>
                  <button onClick={() => { setStep("phone"); setError(""); setOtp(["","","","","",""]); }} className="ml-2 text-[#1246B8] hover:underline text-xs font-semibold cursor-pointer">Change</button>
                </p>

                {/* OTP Input Boxes */}
                <div className="flex gap-2.5 justify-center mb-6 w-full" onPaste={handleOTPpaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpInputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      autoFocus={index === 0}
                      className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all outline-none ${
                        digit 
                          ? "bg-[#1246B8]/5 border-[#1246B8] text-[#1246B8]" 
                          : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-[#1246B8] focus:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-semibold mb-4 text-center bg-red-50 border border-red-100 rounded-lg px-3 py-2 w-full">
                    {error}
                  </motion.p>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.join("").length < 6}
                  className="w-full bg-[#1246B8] hover:bg-[#0E3A9C] active:scale-[0.98] text-white font-bold rounded-xl py-4 shadow-lg shadow-[#1246B8]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-5 cursor-pointer text-sm tracking-wide"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Continue"}
                </button>

                {/* Countdown Timer Capsule Design */}
                <div className="text-center w-full pt-2">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={countdown === 0 ? handleResendOTP : undefined}
                      disabled={countdown > 0 || isLoading}
                      className={`font-black text-[11px] px-8 py-3 rounded-[14px] uppercase tracking-[0.2em] transition-all ${
                        countdown > 0
                          ? "bg-[#9B9B9B] text-white cursor-not-allowed"
                          : "bg-[#1246B8] hover:bg-[#0E3A9C] text-white shadow-md shadow-[#1246B8]/20 cursor-pointer active:scale-95"
                      }`}
                    >
                      Resend
                    </button>
                    <div className={`font-black text-2xl px-8 py-3.5 rounded-2xl shadow-sm tracking-widest transition-colors ${
                      countdown > 0 
                        ? "bg-[#E8F8F2] text-black" 
                        : "bg-neutral-50 text-neutral-400"
                    }`}>
                      {countdown > 0 ? formatTime(countdown) : "00:00"}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Invisible reCAPTCHA container with unique ID */}
          <div id={recaptchaContainerId}></div>
        </motion.div>
      </div>
    </div>
  );
}
