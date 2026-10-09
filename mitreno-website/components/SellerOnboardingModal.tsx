'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import {
  ArrowLeft,
  ArrowRight,
  Store,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  Upload,
  Camera,
  X,
  ChevronDown,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  FileText,
  Loader2,
  Check,
  ChevronRight,
  Shirt,
  Flame,
  Crown,
  Gem,
  Footprints,
  Zap,
  Heart,
  Tag,
  Scissors,
  Layers,
  Navigation,
  Building2,
  Compass,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import { getBackendUrl } from '@/lib/config';
import { SellerLegalReaderModal } from './SellerLegalReaderModal';


// --- Types ---
interface SellerFormData {
  // Step 1: Business Details
  businessName: string;
  businessType: 'individual' | 'partnership' | 'company';
  businessCategory: string;
  businessDescription: string;

  // Step 2: Owner KYC (Individual / Base)
  ownerFullName: string;
  ownerPhone: string;
  ownerEmail: string;
  aadharNumber: string;
  aadharPhoto: string | null; // R2 URL after upload
  aadharPhotoPreview: string | null; // Local preview
  panNumber: string;
  panPhoto: string | null;
  panPhotoPreview: string | null;
  voterIdNumber: string;
  voterIdPhoto: string | null;
  voterIdPhotoPreview: string | null;
  dlNumber: string;
  dlPhoto: string | null;
  dlPhotoPreview: string | null;
  gstNumber: string;

  // Step 2: Partnership KYC
  firmPanNumber: string;
  firmPanPhoto: string | null;
  firmPanPhotoPreview: string | null;
  partnershipDeedPhoto: string | null;
  partnershipDeedPhotoPreview: string | null;
  managingPartnerName: string;
  managingPartnerPhone: string;
  managingPartnerEmail: string;

  // Step 2: Company KYC
  cinNumber: string;
  coiPhoto: string | null;
  coiPhotoPreview: string | null;
  companyPanNumber: string;
  companyPanPhoto: string | null;
  companyPanPhotoPreview: string | null;
  directorName: string;
  directorDin: string;
  directorEmail: string;
  directorPhone: string;
  boardResolutionPhoto: string | null;
  boardResolutionPhotoPreview: string | null;

  // Step 3: Address
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;

  // Step 4: Bank & Payout
  upiId: string;
  bankAccountNumber: string;
  bankIfsc: string;

  // Step 5: Legal Agreements (all three mandatory)
  agreedToMerchantAgreement: boolean;
  agreedToTerms: boolean;
  agreedToPrivacyPolicy: boolean;
}

interface SellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (applicationId: string) => void;
  prefillPhone?: string;
  prefillName?: string;
  prefillEmail?: string;
}

const STEPS = [
  { id: 1, title: 'Business', icon: Store, label: 'Business Details' },
  { id: 2, title: 'Identity', icon: ShieldCheck, label: 'Owner Identity & KYC' },
  { id: 3, title: 'Address', icon: MapPin, label: 'Shop Address' },
  { id: 4, title: 'Payout', icon: CreditCard, label: 'Bank & Payout' },
  { id: 5, title: 'Review', icon: CheckCircle2, label: 'Review & Submit' },
];

const BUSINESS_CATEGORIES = [
  'Fashion & Apparel',
  'Streetwear',
  'Traditional & Ethnic',
  'Luxury & Designer',
  'Accessories & Jewellery',
  'Footwear',
  'Sportswear & Activewear',
  'Kids Fashion',
  'Thrift & Vintage',
  'Custom Tailoring',
  'Other',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const INDIAN_STATES_WITH_HUBS = [
  'Assam (Live Hub)',
  'Delhi NCR (Live Hub)',
  'Karnataka (Live Hub)',
  'Maharashtra (Live Hub)',
  'West Bengal (Live Hub)',
  '--- All Other States & UTs ---',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Kerala', 'Madhya Pradesh', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const STATE_CITIES_MAP: Record<string, string[]> = {
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
  'Delhi NCR': ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
};

const INITIAL_FORM: SellerFormData = {
  businessName: '',
  businessType: 'individual',
  businessCategory: '',
  businessDescription: '',
  ownerFullName: '',
  ownerPhone: '',
  ownerEmail: '',
  aadharNumber: '',
  aadharPhoto: null,
  aadharPhotoPreview: null,
  panNumber: '',
  panPhoto: null,
  panPhotoPreview: null,
  voterIdNumber: '',
  voterIdPhoto: null,
  voterIdPhotoPreview: null,
  dlNumber: '',
  dlPhoto: null,
  dlPhotoPreview: null,
  gstNumber: '',

  // Partnership fields
  firmPanNumber: '',
  firmPanPhoto: null,
  firmPanPhotoPreview: null,
  partnershipDeedPhoto: null,
  partnershipDeedPhotoPreview: null,
  managingPartnerName: '',
  managingPartnerPhone: '',
  managingPartnerEmail: '',

  // Company fields
  cinNumber: '',
  coiPhoto: null,
  coiPhotoPreview: null,
  companyPanNumber: '',
  companyPanPhoto: null,
  companyPanPhotoPreview: null,
  directorName: '',
  directorDin: '',
  directorEmail: '',
  directorPhone: '',
  boardResolutionPhoto: null,
  boardResolutionPhotoPreview: null,

  street: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  latitude: null,
  longitude: null,
  upiId: '',
  bankAccountNumber: '',
  bankIfsc: '',
  agreedToMerchantAgreement: false,
  agreedToTerms: false,
  agreedToPrivacyPolicy: false,
};

// --- Validation helpers ---
const isValidAadhar = (v: string) => /^\d{12}$/.test(v.replace(/\s/g, ''));
const isValidPAN = (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase().trim());
const isValidPincode = (v: string) => /^\d{6}$/.test(v.trim());
const isValidGST = (v: string) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase().trim());
const isValidCIN = (v: string) => v.trim().length >= 15 && v.trim().length <= 21;
const isValidDIN = (v: string) => /^\d{8}$/.test(v.trim());

// --- Shared Input Components ---
const FormInput = ({
  label, value, onChange, placeholder, error, type = 'text', required, disabled, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  error?: string; type?: string; required?: boolean; disabled?: boolean; maxLength?: number;
}) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-neutral-900 bg-white placeholder-neutral-300 transition-all outline-none
        ${error ? 'border-rose-300 bg-rose-50/30 focus:ring-2 focus:ring-rose-200' : 'border-neutral-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}
        ${disabled ? 'opacity-60 cursor-not-allowed bg-neutral-50' : ''}`}
    />
    {error && (
      <p className="text-[10.5px] font-semibold text-rose-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const PhotoUploadTile = ({
  label, preview, error, onUpload, docType, required = true,
}: {
  label: string; preview: string | null; error?: string;
  onUpload: () => void; docType: string; required?: boolean;
}) => {
  const isPdf = preview?.startsWith('data:application/pdf') || preview?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
        {label} <span className="text-neutral-400 text-[10px] font-medium lowercase">(upload)</span>{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        onClick={onUpload}
        className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer overflow-hidden relative
          ${error ? 'border-rose-300 bg-rose-50/30' : preview ? 'border-emerald-300 bg-emerald-50/20' : 'border-neutral-200 hover:border-blue-300 hover:bg-blue-50/20 bg-neutral-50/50'}`}
      >
        {preview ? (
          isPdf ? (
            <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center">
              <FileText className="w-7 h-7 text-blue-600" />
              <span className="text-xs font-bold text-neutral-800 line-clamp-1">{label} Attached</span>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <Camera className="w-3 h-3" />
                Change Document
              </div>
            </div>
          ) : (
            <>
              <Image src={preview} alt={label} fill unoptimized className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">
                  <Camera className="w-3.5 h-3.5" />
                  Change Photo
                </div>
              </div>
            </>
          )
        ) : (
          <>
            <Upload className="w-5 h-5 text-neutral-400" />
            <span className="text-[11px] font-semibold text-neutral-400">
              Tap to upload {label}
            </span>
          </>
        )}
      </button>
      {error && (
        <p className="text-[10.5px] font-semibold text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Fashion & Apparel': Shirt,
  'Streetwear': Flame,
  'Traditional & Ethnic': Sparkles,
  'Luxury & Designer': Crown,
  'Accessories & Jewellery': Gem,
  'Footwear': Footprints,
  'Sportswear & Activewear': Zap,
  'Kids Fashion': Heart,
  'Thrift & Vintage': Tag,
  'Custom Tailoring': Scissors,
  'Other': Layers,
};

const FormSelect = ({
  label, value, onChange, options, error, required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; error?: string; required?: boolean; placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SelectedIcon = value ? (CATEGORY_ICONS[value] || Layers) : null;

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      
      {/* Trigger Button with Subtle 3D Elevation */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center justify-between select-none
          ${error 
            ? 'border-rose-300 bg-rose-50/30 text-rose-900 ring-2 ring-rose-100' 
            : isOpen 
              ? 'border-blue-500 bg-white shadow-[0_2px_10px_rgba(37,99,235,0.12)] ring-2 ring-blue-100' 
              : 'border-slate-200/90 bg-white text-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]'}`}
      >
        <span className={`truncate flex items-center gap-2.5 ${!value ? 'text-slate-400 font-medium' : 'text-slate-900 font-bold'}`}>
          {SelectedIcon && (
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <SelectedIcon className="w-3.5 h-3.5" />
            </div>
          )}
          <span>{value || placeholder || `Select ${label}`}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
      </button>

      {/* Floating 3D Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-[100] bg-white rounded-2xl border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.18)] p-1.5 max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar"
          >
            {options.map((opt) => {
              const isSelected = value === opt;
              const Icon = CATEGORY_ICONS[opt] || Layers;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer select-none text-left group
                    ${isSelected 
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700 active:scale-[0.99]'}`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{opt}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[2.5] flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-[10.5px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
};

// --- Component ---
export const SellerOnboardingModal: React.FC<SellerOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  prefillPhone = '',
  prefillName = '',
  prefillEmail = '',
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const actualPrefillName = prefillName === 'Nvilar Member' ? '' : prefillName;
  const rawPrefillPhone = prefillPhone ? prefillPhone.replace('+91', '').replace(/\s|-/g, '').trim() : '';

  const [form, setForm] = useState<SellerFormData>({
    ...INITIAL_FORM,
    ownerPhone: rawPrefillPhone,
    ownerFullName: actualPrefillName,
    ownerEmail: prefillEmail,
    managingPartnerName: actualPrefillName,
    managingPartnerPhone: rawPrefillPhone,
    managingPartnerEmail: prefillEmail,
    directorName: actualPrefillName,
    directorPhone: rawPrefillPhone,
    directorEmail: prefillEmail,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMode, setGpsMode] = useState<'auto' | 'manual'>('auto');
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [manualLatStr, setManualLatStr] = useState(form.latitude ? form.latitude.toString() : '');
  const [manualLngStr, setManualLngStr] = useState(form.longitude ? form.longitude.toString() : '');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalInitialDoc, setLegalModalInitialDoc] = useState<'agreement' | 'terms' | 'privacy'>('agreement');
  const [acceptedLegalDocs, setAcceptedLegalDocs] = useState<Set<'agreement' | 'terms' | 'privacy'>>(new Set());

  const handleDetectGpsLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrors(prev => ({ ...prev, gps: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setIsDetectingGps(true);
    setErrors(prev => {
      const next = { ...prev };
      delete next.gps;
      return next;
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy || 3);
        updateField('latitude', lat);
        updateField('longitude', lng);
        setManualLatStr(lat.toString());
        setManualLngStr(lng.toString());
        setGpsAccuracyMeters(acc);
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        // Fallback: If permission is denied or satellite times out, inform user to enter manually
        setIsDetectingGps(false);
        setErrors(prev => ({
          ...prev,
          gps: 'GPS satellite signal timeout or permission denied. Please switch to "Manual Coordinates" below to enter your store coordinates.',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleManualLatChange = (val: string) => {
    // Support pasted "lat, lng"
    if (val.includes(',')) {
      const [pLat, pLng] = val.split(',').map(s => s.trim());
      const numLat = Number(pLat);
      const numLng = Number(pLng);
      if (!isNaN(numLat) && numLat >= -90 && numLat <= 90) {
        setManualLatStr(pLat);
        updateField('latitude', Number(numLat.toFixed(6)));
      }
      if (!isNaN(numLng) && numLng >= -180 && numLng <= 180) {
        setManualLngStr(pLng);
        updateField('longitude', Number(numLng.toFixed(6)));
      }
      setErrors(prev => {
        const next = { ...prev };
        delete next.gps;
        return next;
      });
      return;
    }

    setManualLatStr(val);
    const cleaned = val.trim();
    if (cleaned === '') {
      updateField('latitude', null as any);
      return;
    }
    const num = Number(cleaned);
    if (!isNaN(num) && num >= -90 && num <= 90) {
      updateField('latitude', Number(num.toFixed(6)));
      setErrors(prev => {
        const next = { ...prev };
        delete next.gps;
        return next;
      });
    } else {
      updateField('latitude', null as any);
    }
  };

  const handleManualLngChange = (val: string) => {
    // Support pasted "lat, lng"
    if (val.includes(',')) {
      const [pLat, pLng] = val.split(',').map(s => s.trim());
      const numLat = Number(pLat);
      const numLng = Number(pLng);
      if (!isNaN(numLat) && numLat >= -90 && numLat <= 90) {
        setManualLatStr(pLat);
        updateField('latitude', Number(numLat.toFixed(6)));
      }
      if (!isNaN(numLng) && numLng >= -180 && numLng <= 180) {
        setManualLngStr(pLng);
        updateField('longitude', Number(numLng.toFixed(6)));
      }
      setErrors(prev => {
        const next = { ...prev };
        delete next.gps;
        return next;
      });
      return;
    }

    setManualLngStr(val);
    const cleaned = val.trim();
    if (cleaned === '') {
      updateField('longitude', null as any);
      return;
    }
    const num = Number(cleaned);
    if (!isNaN(num) && num >= -180 && num <= 180) {
      updateField('longitude', Number(num.toFixed(6)));
      setErrors(prev => {
        const next = { ...prev };
        delete next.gps;
        return next;
      });
    } else {
      updateField('longitude', null as any);
    }
  };

  const handleClearGps = () => {
    updateField('latitude', null as any);
    updateField('longitude', null as any);
    setManualLatStr('');
    setManualLngStr('');
    setGpsAccuracyMeters(null);
  };

  const updateField = useCallback(<K extends keyof SellerFormData>(key: K, value: SellerFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // --- Photo & Document Upload Handler ---
  type DocType = 'aadhar' | 'pan' | 'voterId' | 'dl' | 'firmPan' | 'partnershipDeed' | 'coi' | 'companyPan' | 'boardResolution';

  const handlePhotoUpload = useCallback((docType: DocType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [`${docType}Photo`]: 'File size must be under 5MB' }));
        return;
      }

      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewKey = `${docType}PhotoPreview` as keyof SellerFormData;
        updateField(previewKey, reader.result as string);
        setErrors(prev => {
          const next = { ...prev };
          delete next[`${docType}Photo`];
          delete next[previewKey];
          return next;
        });
      };
      reader.readAsDataURL(file);

      // In production: Upload to R2 via presigned URL
      // For now, simulate upload with a mock URL
      try {
        const mockUrl = `https://r2.nvilar.com/seller-docs/mock/${docType}_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
        const photoKey = `${docType}Photo` as keyof SellerFormData;
        updateField(photoKey, mockUrl);
      } catch {
        setErrors(prev => ({ ...prev, [`${docType}Photo`]: 'Upload failed. Please try again.' }));
      }
    };
    input.click();
  }, [updateField]);

  // --- Step Validation ---
  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!form.businessCategory) newErrors.businessCategory = 'Please select a category';
    }

    if (stepNum === 2) {
      if (form.businessType === 'individual') {
        // Proprietor Personal KYC
        if (!form.ownerFullName.trim()) newErrors.ownerFullName = 'Full legal name is required';
        if (!form.ownerPhone.trim()) newErrors.ownerPhone = 'Phone number is required';
        else if (form.ownerPhone.trim().length !== 10) newErrors.ownerPhone = 'Must be exactly 10 digits';

        if (!form.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhar number is required';
        else if (!isValidAadhar(form.aadharNumber)) newErrors.aadharNumber = 'Must be exactly 12 digits';
        if (!form.aadharPhotoPreview) newErrors.aadharPhoto = 'Aadhar card photo is required';

        if (!form.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
        else if (!isValidPAN(form.panNumber)) newErrors.panNumber = 'Format: AAAAA9999A';
        if (!form.panPhotoPreview) newErrors.panPhoto = 'PAN card photo is required';

        if (form.gstNumber && !isValidGST(form.gstNumber)) newErrors.gstNumber = 'Invalid GST format (15 characters)';
      } else if (form.businessType === 'partnership') {
        // Firm Tax & Legal
        if (!form.firmPanNumber.trim()) newErrors.firmPanNumber = 'Firm PAN number is required';
        else if (!isValidPAN(form.firmPanNumber)) newErrors.firmPanNumber = 'Format: AAAAA9999A';
        if (!form.firmPanPhotoPreview) newErrors.firmPanPhoto = 'Firm PAN photo is required';

        if (!form.partnershipDeedPhotoPreview) newErrors.partnershipDeedPhoto = 'Partnership Deed / LLP Agreement is required';

        if (!form.gstNumber.trim()) newErrors.gstNumber = 'Firm GSTIN is required';
        else if (!isValidGST(form.gstNumber)) newErrors.gstNumber = 'Invalid GST format (15 characters)';

        // Managing Partner KYC
        const partnerName = form.managingPartnerName.trim() || form.ownerFullName.trim();
        if (!partnerName) {
          newErrors.managingPartnerName = 'Managing partner name is required';
          newErrors.ownerFullName = 'Managing partner name is required';
        }

        const partnerPhone = form.managingPartnerPhone.trim() || form.ownerPhone.trim();
        if (!partnerPhone) {
          newErrors.managingPartnerPhone = 'Phone number is required';
          newErrors.ownerPhone = 'Phone number is required';
        } else if (partnerPhone.length !== 10) {
          newErrors.managingPartnerPhone = 'Must be exactly 10 digits';
          newErrors.ownerPhone = 'Must be exactly 10 digits';
        }

        if (!form.aadharNumber.trim()) newErrors.aadharNumber = 'Partner Aadhar number is required';
        else if (!isValidAadhar(form.aadharNumber)) newErrors.aadharNumber = 'Must be exactly 12 digits';
        if (!form.aadharPhotoPreview) newErrors.aadharPhoto = 'Partner Aadhar photo is required';

        if (!form.panNumber.trim()) newErrors.panNumber = 'Partner PAN number is required';
        else if (!isValidPAN(form.panNumber)) newErrors.panNumber = 'Format: AAAAA9999A';
        if (!form.panPhotoPreview) newErrors.panPhoto = 'Partner PAN photo is required';
      } else if (form.businessType === 'company') {
        // Corporate Incorporation & Tax
        if (!form.cinNumber.trim()) newErrors.cinNumber = 'CIN is required';
        else if (!isValidCIN(form.cinNumber)) newErrors.cinNumber = 'CIN must be between 15 and 21 characters';

        if (!form.coiPhotoPreview) newErrors.coiPhoto = 'Certificate of Incorporation (COI) is required';

        if (!form.companyPanNumber.trim()) newErrors.companyPanNumber = 'Company PAN number is required';
        else if (!isValidPAN(form.companyPanNumber)) newErrors.companyPanNumber = 'Format: AAAAA9999A';
        if (!form.companyPanPhotoPreview) newErrors.companyPanPhoto = 'Company PAN photo is required';

        if (!form.gstNumber.trim()) newErrors.gstNumber = 'Company GSTIN is required';
        else if (!isValidGST(form.gstNumber)) newErrors.gstNumber = 'Invalid GST format (15 characters)';

        // Director KYC
        const dirName = form.directorName.trim() || form.ownerFullName.trim();
        if (!dirName) {
          newErrors.directorName = 'Director name is required';
          newErrors.ownerFullName = 'Director name is required';
        }

        if (!form.directorDin.trim()) {
          newErrors.directorDin = 'Director DIN is required';
        } else if (!isValidDIN(form.directorDin)) {
          newErrors.directorDin = 'DIN must be exactly 8 digits';
        }

        const dirPhone = form.directorPhone.trim() || form.ownerPhone.trim();
        if (!dirPhone) {
          newErrors.directorPhone = 'Phone number is required';
          newErrors.ownerPhone = 'Phone number is required';
        } else if (dirPhone.length !== 10) {
          newErrors.directorPhone = 'Must be exactly 10 digits';
          newErrors.ownerPhone = 'Must be exactly 10 digits';
        }

        if (!form.aadharNumber.trim()) newErrors.aadharNumber = 'Director Aadhar number is required';
        else if (!isValidAadhar(form.aadharNumber)) newErrors.aadharNumber = 'Must be exactly 12 digits';
        if (!form.aadharPhotoPreview) newErrors.aadharPhoto = 'Director Aadhar photo is required';

        if (!form.panNumber.trim()) newErrors.panNumber = 'Director PAN number is required';
        else if (!isValidPAN(form.panNumber)) newErrors.panNumber = 'Format: AAAAA9999A';
        if (!form.panPhotoPreview) newErrors.panPhoto = 'Director PAN photo is required';
      }
    }

    if (stepNum === 3) {
      if (!form.street.trim()) newErrors.street = 'Street address is required';
      if (!form.city.trim()) newErrors.city = 'City is required';
      if (!form.state) newErrors.state = 'State is required';
      if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!isValidPincode(form.pincode)) newErrors.pincode = 'Must be exactly 6 digits';
      if (form.latitude === null || form.longitude === null || form.latitude === undefined || form.longitude === undefined || isNaN(form.latitude) || isNaN(form.longitude)) {
        newErrors.gps = 'Store GPS coordinates are mandatory to calculate customer delivery radius (< 9km).';
      }
    }

    if (stepNum === 4) {
      if (!form.upiId.trim()) newErrors.upiId = 'UPI ID is required';
      if (form.bankAccountNumber && !form.bankIfsc.trim()) {
        newErrors.bankIfsc = 'IFSC is required when account number is provided';
      }
    }

    if (stepNum === 5) {
      if (!form.agreedToMerchantAgreement) newErrors.agreedToMerchantAgreement = 'Required';
      if (!form.agreedToTerms) newErrors.agreedToTerms = 'Required';
      if (!form.agreedToPrivacyPolicy) newErrors.agreedToPrivacyPolicy = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setDirection(1);
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setDirection(-1);
      setStep(targetStep);
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    const backendUrl = getBackendUrl();
    let assignedAppId = `sa_${Date.now().toString(36)}`;

    const effectiveOwnerName = form.businessType === 'company'
      ? (form.directorName.trim() || form.ownerFullName.trim())
      : form.businessType === 'partnership'
      ? (form.managingPartnerName.trim() || form.ownerFullName.trim())
      : form.ownerFullName.trim();

    const effectiveOwnerPhone = form.businessType === 'company'
      ? (form.directorPhone.trim() || form.ownerPhone.trim())
      : form.businessType === 'partnership'
      ? (form.managingPartnerPhone.trim() || form.ownerPhone.trim())
      : form.ownerPhone.trim();

    const effectiveOwnerEmail = form.businessType === 'company'
      ? (form.directorEmail.trim() || form.ownerEmail.trim())
      : form.businessType === 'partnership'
      ? (form.managingPartnerEmail.trim() || form.ownerEmail.trim())
      : form.ownerEmail.trim();

    const businessDocuments = {
      business_type: form.businessType,
      ...(form.businessType === 'partnership' ? {
        firm_pan_number: form.firmPanNumber ? form.firmPanNumber.toUpperCase().trim() : null,
        firm_pan_photo_url: form.firmPanPhoto || form.firmPanPhotoPreview || null,
        partnership_deed_url: form.partnershipDeedPhoto || form.partnershipDeedPhotoPreview || null,
        firm_gstin: form.gstNumber ? form.gstNumber.toUpperCase().trim() : null,
        managing_partner_name: effectiveOwnerName,
        managing_partner_phone: effectiveOwnerPhone,
        managing_partner_email: effectiveOwnerEmail || null,
      } : {}),
      ...(form.businessType === 'company' ? {
        cin_number: form.cinNumber ? form.cinNumber.toUpperCase().trim() : null,
        coi_photo_url: form.coiPhoto || form.coiPhotoPreview || null,
        company_pan_number: form.companyPanNumber ? form.companyPanNumber.toUpperCase().trim() : null,
        company_pan_photo_url: form.companyPanPhoto || form.companyPanPhotoPreview || null,
        company_gstin: form.gstNumber ? form.gstNumber.toUpperCase().trim() : null,
        director_name: effectiveOwnerName,
        director_din: form.directorDin ? form.directorDin.trim() : null,
        director_phone: effectiveOwnerPhone,
        director_email: effectiveOwnerEmail || null,
        board_resolution_url: form.boardResolutionPhoto || form.boardResolutionPhotoPreview || null,
      } : {}),
    };

    const payload = {
      business_name: form.businessName,
      business_type: form.businessType,
      business_category: form.businessCategory,
      business_description: form.businessDescription,
      owner_full_name: effectiveOwnerName,
      owner_phone: effectiveOwnerPhone,
      owner_email: effectiveOwnerEmail || null,
      aadhar_number: form.aadharNumber.replace(/\s/g, ''),
      aadhar_photo_url: form.aadharPhoto || form.aadharPhotoPreview || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      pan_number: form.panNumber.toUpperCase().trim(),
      pan_photo_url: form.panPhoto || form.panPhotoPreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      voter_id_number: form.voterIdNumber || null,
      voter_id_photo_url: form.voterIdPhoto || form.voterIdPhotoPreview || null,
      dl_number: form.dlNumber || null,
      dl_photo_url: form.dlPhoto || form.dlPhotoPreview || null,
      gst_number: form.gstNumber ? form.gstNumber.toUpperCase().trim() : null,
      shop_address: {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        landmark: form.landmark,
        latitude: form.latitude,
        longitude: form.longitude,
      },
      payout_upi_id: form.upiId,
      bank_account_number: form.bankAccountNumber || null,
      bank_ifsc: form.bankIfsc || null,
      business_documents: businessDocuments,
    };

    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      // 1. Send to live Backend API (port 8080)
      let res = await fetch(`${backendUrl}/api/seller/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-ID': user.uid,
        },
        body: JSON.stringify(payload),
      }).catch(() => null);

      // Fallback to internal Next.js API route if port 8080 fails
      if (!res || !res.ok) {
        res = await fetch('/api/seller/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-User-ID': user.uid,
          },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        const errorData = res ? await res.json().catch(() => ({})) : {};
        throw new Error(errorData.error || 'Failed to submit application to the server. Please try again.');
      }

      const data = await res.json();
      if (data.application_id) {
        assignedAppId = data.application_id;
      }

      // Local UI sync for immediate feedback
      const newApp = {
        id: assignedAppId,
        user_id: user?.uid || '',
        ...payload,
        status: 'pending_review',
        created_at: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('mitreno_seller_applications') || '[]');
        const filtered = existing.filter((a: any) => a.id !== assignedAppId && (user?.uid ? a.user_id !== user.uid : true));
        localStorage.setItem('mitreno_seller_applications', JSON.stringify([newApp, ...filtered]));
        localStorage.setItem('mitreno_seller_status', 'pending_review');
        localStorage.setItem('mitreno_seller_app_id', assignedAppId);
      }

      setSubmittedAppId(assignedAppId);
      setSubmitSuccess(true);
      onSubmitSuccess?.(assignedAppId);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrors({ submit: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitSuccess) {
      // Reset everything
      setStep(1);
      setForm({
        ...INITIAL_FORM,
        ownerPhone: rawPrefillPhone,
        ownerFullName: actualPrefillName,
        ownerEmail: prefillEmail,
        managingPartnerName: actualPrefillName,
        managingPartnerPhone: rawPrefillPhone,
        managingPartnerEmail: prefillEmail,
        directorName: actualPrefillName,
        directorPhone: rawPrefillPhone,
        directorEmail: prefillEmail,
      });
      setErrors({});
      setSubmitSuccess(false);
      setSubmittedAppId('');
    }
    onClose();
  };

  if (!isOpen) return null;

  // --- Step Content Renderer ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 pb-28">
            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">Business Details</h2>
              <p className="text-xs text-neutral-400 font-medium">Tell us about your boutique or brand</p>
            </div>

            <FormInput
              label="Business / Shop Name"
              value={form.businessName}
              onChange={v => updateField('businessName', v)}
              placeholder="e.g. The Thrift Garage"
              error={errors.businessName}
              required
            />

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Business Type<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['individual', 'partnership', 'company'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('businessType', type)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer
                      ${form.businessType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <FormSelect
              label="Business Category"
              value={form.businessCategory}
              onChange={v => updateField('businessCategory', v)}
              options={BUSINESS_CATEGORIES}
              error={errors.businessCategory}
              required
              placeholder="Select your category"
            />

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Brief Description <span className="text-neutral-300">(Optional)</span>
              </label>
              <textarea
                value={form.businessDescription}
                onChange={(e) => updateField('businessDescription', e.target.value)}
                placeholder="Tell buyers what makes your brand unique..."
                rows={3}
                maxLength={500}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 bg-white placeholder-neutral-300 transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>
        );

      case 2: {
        if (form.businessType === 'partnership') {
          return (
            <div className="space-y-4 pb-20">
              <div className="space-y-1 mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-0.5">
                  <Store className="w-3 h-3 text-blue-600" />
                  <span>Partnership Entity Verification</span>
                </div>
                <h2 className="text-lg font-black text-neutral-900 tracking-tight">Partnership Firm &amp; Partner Verification</h2>
                <p className="text-xs text-neutral-400 font-medium">Upload registered partnership deed, firm tax identity, and managing partner KYC</p>
              </div>

              {/* Section 1: Firm Legal Identity */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Section 1: Firm Legal Identity
                    </span>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Firm Entity
                  </span>
                </div>

                {/* Firm PAN Card */}
                <div className="space-y-3 pt-1">
                  <FormInput
                    label="Firm PAN Card Number"
                    value={form.firmPanNumber}
                    onChange={v => updateField('firmPanNumber', v.toUpperCase().trim())}
                    placeholder="e.g. AABCP1234D"
                    error={errors.firmPanNumber}
                    required
                    maxLength={10}
                  />
                  <PhotoUploadTile
                    label="Firm PAN Card"
                    preview={form.firmPanPhotoPreview}
                    error={errors.firmPanPhoto}
                    onUpload={() => handlePhotoUpload('firmPan')}
                    docType="firmPan"
                    required
                  />
                </div>

                {/* Partnership Deed */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <PhotoUploadTile
                    label="Partnership Deed / LLP Agreement"
                    preview={form.partnershipDeedPhotoPreview}
                    error={errors.partnershipDeedPhoto}
                    onUpload={() => handlePhotoUpload('partnershipDeed')}
                    docType="partnershipDeed"
                    required
                  />
                </div>

                {/* Firm GSTIN */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <FormInput
                    label="Firm GSTIN (15 Characters)"
                    value={form.gstNumber}
                    onChange={v => updateField('gstNumber', v.toUpperCase().trim())}
                    placeholder="15-character GSTIN"
                    error={errors.gstNumber}
                    required
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Section 2: Managing Partner KYC */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Section 2: Managing Partner KYC
                    </span>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Partner Proofs
                  </span>
                </div>

                <FormInput
                  label="Managing Partner Full Name (Legal)"
                  value={form.managingPartnerName || form.ownerFullName}
                  onChange={v => {
                    updateField('managingPartnerName', v);
                    updateField('ownerFullName', v);
                  }}
                  placeholder="As per government ID"
                  error={errors.managingPartnerName || errors.ownerFullName}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Partner Phone<span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative flex group">
                      <div className="flex-shrink-0 flex items-center justify-center w-12 bg-neutral-100/50 border border-r-0 border-neutral-200 rounded-l-xl text-neutral-600 font-bold text-sm select-none">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={form.managingPartnerPhone || form.ownerPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          updateField('managingPartnerPhone', digits);
                          updateField('ownerPhone', digits);
                        }}
                        placeholder="Mobile number"
                        className={`flex-1 w-full bg-white border border-l-0 ${errors.managingPartnerPhone || errors.ownerPhone ? 'border-rose-300' : 'border-neutral-200 focus:border-[#1246B8]'} rounded-r-xl py-[8.5px] pr-3 pl-2 text-neutral-900 placeholder-neutral-300 focus:outline-none transition-all text-sm font-medium`}
                      />
                    </div>
                    {(errors.managingPartnerPhone || errors.ownerPhone) && (
                      <p className="text-[10px] font-semibold text-rose-500">{errors.managingPartnerPhone || errors.ownerPhone}</p>
                    )}
                  </div>
                  <FormInput
                    label="Partner Email"
                    value={form.managingPartnerEmail || form.ownerEmail}
                    onChange={v => {
                      updateField('managingPartnerEmail', v);
                      updateField('ownerEmail', v);
                    }}
                    placeholder="partner@firm.com"
                    type="email"
                  />
                </div>

                {/* Partner Aadhar Card */}
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-neutral-800">Managing Partner Personal Aadhar Card</span>
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIRED</span>
                  </div>
                  <FormInput
                    label="Partner Aadhar Number"
                    value={form.aadharNumber}
                    onChange={v => {
                      const digits = v.replace(/\D/g, '');
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 14);
                      updateField('aadharNumber', formatted);
                    }}
                    placeholder="XXXX XXXX XXXX"
                    error={errors.aadharNumber}
                    required
                    maxLength={14}
                  />
                  <PhotoUploadTile
                    label="Partner Aadhar Card"
                    preview={form.aadharPhotoPreview}
                    error={errors.aadharPhoto}
                    onUpload={() => handlePhotoUpload('aadhar')}
                    docType="aadhar"
                    required
                  />
                </div>

                {/* Partner PAN Card */}
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-neutral-800">Managing Partner Personal PAN</span>
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIRED</span>
                  </div>
                  <FormInput
                    label="Partner Personal PAN"
                    value={form.panNumber}
                    onChange={v => updateField('panNumber', v.toUpperCase().trim())}
                    placeholder="AAAAA9999A"
                    error={errors.panNumber}
                    required
                    maxLength={10}
                  />
                  <PhotoUploadTile
                    label="Partner Personal PAN"
                    preview={form.panPhotoPreview}
                    error={errors.panPhoto}
                    onUpload={() => handlePhotoUpload('pan')}
                    docType="pan"
                    required
                  />
                </div>
              </div>
            </div>
          );
        }

        if (form.businessType === 'company') {
          return (
            <div className="space-y-4 pb-20">
              <div className="space-y-1 mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black uppercase tracking-wider mb-0.5">
                  <Building2 className="w-3 h-3 text-purple-600" />
                  <span>Corporate Entity Verification</span>
                </div>
                <h2 className="text-lg font-black text-neutral-900 tracking-tight">Corporate Identity &amp; Director KYC</h2>
                <p className="text-xs text-neutral-400 font-medium">Verify your registered company (Pvt Ltd / OPC) and authorized director</p>
              </div>

              {/* Section 1: Corporate Incorporation & Tax */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Section 1: Corporate Incorporation &amp; Tax
                    </span>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    MCA &amp; Tax
                  </span>
                </div>

                {/* CIN */}
                <FormInput
                  label="Corporate Identification Number (CIN)"
                  value={form.cinNumber}
                  onChange={v => updateField('cinNumber', v.toUpperCase().trim())}
                  placeholder="21-character MCA CIN (e.g. U72900DL2023PTC123456)"
                  error={errors.cinNumber}
                  required
                  maxLength={21}
                />

                {/* COI */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <PhotoUploadTile
                    label="Certificate of Incorporation (COI)"
                    preview={form.coiPhotoPreview}
                    error={errors.coiPhoto}
                    onUpload={() => handlePhotoUpload('coi')}
                    docType="coi"
                    required
                  />
                </div>

                {/* Company PAN Card */}
                <div className="pt-2 border-t border-neutral-200/60 space-y-3">
                  <FormInput
                    label="Company PAN Card Number"
                    value={form.companyPanNumber}
                    onChange={v => updateField('companyPanNumber', v.toUpperCase().trim())}
                    placeholder="e.g. AABCC1234D"
                    error={errors.companyPanNumber}
                    required
                    maxLength={10}
                  />
                  <PhotoUploadTile
                    label="Company PAN Card"
                    preview={form.companyPanPhotoPreview}
                    error={errors.companyPanPhoto}
                    onUpload={() => handlePhotoUpload('companyPan')}
                    docType="companyPan"
                    required
                  />
                </div>

                {/* Company GSTIN */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <FormInput
                    label="Company GSTIN (15 Characters)"
                    value={form.gstNumber}
                    onChange={v => updateField('gstNumber', v.toUpperCase().trim())}
                    placeholder="15-character GSTIN"
                    error={errors.gstNumber}
                    required
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Section 2: Authorized Director / Signatory KYC */}
              <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Section 2: Authorized Director / Signatory KYC
                    </span>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Director KYC
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Director Full Legal Name"
                    value={form.directorName || form.ownerFullName}
                    onChange={v => {
                      updateField('directorName', v);
                      updateField('ownerFullName', v);
                    }}
                    placeholder="As registered with MCA"
                    error={errors.directorName || errors.ownerFullName}
                    required
                  />
                  <FormInput
                    label="Director DIN (8 Digits)"
                    value={form.directorDin}
                    onChange={v => updateField('directorDin', v.replace(/\D/g, '').slice(0, 8))}
                    placeholder="8-digit DIN (e.g. 01234567)"
                    error={errors.directorDin}
                    required
                    maxLength={8}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Director Phone<span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative flex group">
                      <div className="flex-shrink-0 flex items-center justify-center w-12 bg-neutral-100/50 border border-r-0 border-neutral-200 rounded-l-xl text-neutral-600 font-bold text-sm select-none">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={form.directorPhone || form.ownerPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          updateField('directorPhone', digits);
                          updateField('ownerPhone', digits);
                        }}
                        placeholder="Mobile number"
                        className={`flex-1 w-full bg-white border border-l-0 ${errors.directorPhone || errors.ownerPhone ? 'border-rose-300' : 'border-neutral-200 focus:border-[#1246B8]'} rounded-r-xl py-[8.5px] pr-3 pl-2 text-neutral-900 placeholder-neutral-300 focus:outline-none transition-all text-sm font-medium`}
                      />
                    </div>
                    {(errors.directorPhone || errors.ownerPhone) && (
                      <p className="text-[10px] font-semibold text-rose-500">{errors.directorPhone || errors.ownerPhone}</p>
                    )}
                  </div>
                  <FormInput
                    label="Director Email"
                    value={form.directorEmail || form.ownerEmail}
                    onChange={v => {
                      updateField('directorEmail', v);
                      updateField('ownerEmail', v);
                    }}
                    placeholder="director@company.com"
                    type="email"
                  />
                </div>

                {/* Director Personal PAN */}
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-neutral-800">Director Personal PAN Card</span>
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIRED</span>
                  </div>
                  <FormInput
                    label="Director PAN Number"
                    value={form.panNumber}
                    onChange={v => updateField('panNumber', v.toUpperCase().trim())}
                    placeholder="AAAAA9999A"
                    error={errors.panNumber}
                    required
                    maxLength={10}
                  />
                  <PhotoUploadTile
                    label="Director Personal PAN"
                    preview={form.panPhotoPreview}
                    error={errors.panPhoto}
                    onUpload={() => handlePhotoUpload('pan')}
                    docType="pan"
                    required
                  />
                </div>

                {/* Director Personal Aadhar */}
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-neutral-800">Director Personal Aadhar Card</span>
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIRED</span>
                  </div>
                  <FormInput
                    label="Director Aadhar Number"
                    value={form.aadharNumber}
                    onChange={v => {
                      const digits = v.replace(/\D/g, '');
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 14);
                      updateField('aadharNumber', formatted);
                    }}
                    placeholder="XXXX XXXX XXXX"
                    error={errors.aadharNumber}
                    required
                    maxLength={14}
                  />
                  <PhotoUploadTile
                    label="Director Personal Aadhar"
                    preview={form.aadharPhotoPreview}
                    error={errors.aadharPhoto}
                    onUpload={() => handlePhotoUpload('aadhar')}
                    docType="aadhar"
                    required
                  />
                </div>

                {/* Board Resolution (Optional) */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-2">
                  <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Board Resolution / Authorization Letter (Optional)
                  </span>
                  <PhotoUploadTile
                    label="Board Resolution"
                    preview={form.boardResolutionPhotoPreview}
                    error={errors.boardResolutionPhoto}
                    onUpload={() => handlePhotoUpload('boardResolution')}
                    docType="boardResolution"
                    required={false}
                  />
                </div>
              </div>
            </div>
          );
        }

        // Default: Individual (Sole Proprietorship / Boutique)
        return (
          <div className="space-y-4 pb-20">
            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">Proprietor Identity &amp; Personal KYC</h2>
              <p className="text-xs text-neutral-400 font-medium">Personal verification for your sole proprietorship boutique or brand</p>
            </div>

            <FormInput
              label="Owner Full Name (Legal)"
              value={form.ownerFullName}
              onChange={v => updateField('ownerFullName', v)}
              placeholder="As per government ID"
              error={errors.ownerFullName}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Phone Number<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="relative flex group">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 bg-neutral-100/50 border border-r-0 border-neutral-200 rounded-l-xl text-neutral-600 font-bold text-sm select-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={form.ownerPhone}
                    onChange={(e) => updateField('ownerPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Mobile number"
                    className={`flex-1 w-full bg-white border border-l-0 ${errors.ownerPhone ? 'border-rose-300' : 'border-neutral-200 focus:border-[#1246B8]'} rounded-r-xl py-[8.5px] pr-3 pl-2 text-neutral-900 placeholder-neutral-300 focus:outline-none transition-all text-sm font-medium`}
                  />
                </div>
                {errors.ownerPhone && <p className="text-[10px] font-semibold text-rose-500">{errors.ownerPhone}</p>}
              </div>
              <FormInput
                label="Email"
                value={form.ownerEmail}
                onChange={v => updateField('ownerEmail', v)}
                placeholder="you@email.com"
                type="email"
              />
            </div>

            {/* Aadhar Card */}
            <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-neutral-800">Aadhar Card</span>
                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIRED</span>
              </div>
              <FormInput
                label="Aadhar Number"
                value={form.aadharNumber}
                onChange={v => {
                  const digits = v.replace(/\D/g, '');
                  const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 14);
                  updateField('aadharNumber', formatted);
                }}
                placeholder="XXXX XXXX XXXX"
                error={errors.aadharNumber}
                required
                maxLength={14}
              />
              <PhotoUploadTile
                label="Aadhar Card"
                preview={form.aadharPhotoPreview}
                error={errors.aadharPhoto}
                onUpload={() => handlePhotoUpload('aadhar')}
                docType="aadhar"
                required
              />
            </div>

            {/* PAN Card */}
            <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-neutral-800">PAN Card</span>
                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIRED</span>
              </div>
              <FormInput
                label="PAN Number"
                value={form.panNumber}
                onChange={v => updateField('panNumber', v.toUpperCase())}
                placeholder="AAAAA9999A"
                error={errors.panNumber}
                required
                maxLength={10}
              />
              <PhotoUploadTile
                label="PAN Card"
                preview={form.panPhotoPreview}
                error={errors.panPhoto}
                onUpload={() => handlePhotoUpload('pan')}
                docType="pan"
                required
              />
            </div>

            {/* Optional Documents */}
            <div className="p-3.5 rounded-xl bg-neutral-50/40 border border-neutral-100/60 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Optional Documents</span>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Voter ID"
                  value={form.voterIdNumber}
                  onChange={v => updateField('voterIdNumber', v)}
                  placeholder="Optional"
                />
                <FormInput
                  label="Driving License"
                  value={form.dlNumber}
                  onChange={v => updateField('dlNumber', v)}
                  placeholder="Optional"
                />
              </div>

              {(form.voterIdNumber || form.dlNumber) && (
                <div className="grid grid-cols-2 gap-3">
                  {form.voterIdNumber && (
                    <PhotoUploadTile
                      label="Voter ID"
                      preview={form.voterIdPhotoPreview}
                      onUpload={() => handlePhotoUpload('voterId')}
                      docType="voterId"
                      required={false}
                    />
                  )}
                  {form.dlNumber && (
                    <PhotoUploadTile
                      label="DL"
                      preview={form.dlPhotoPreview}
                      onUpload={() => handlePhotoUpload('dl')}
                      docType="dl"
                      required={false}
                    />
                  )}
                </div>
              )}

              <FormInput
                label="GST Number"
                value={form.gstNumber}
                onChange={v => updateField('gstNumber', v.toUpperCase())}
                placeholder="Optional — 15 characters"
                error={errors.gstNumber}
                maxLength={15}
              />
            </div>
          </div>
        );
      }

      case 3: {
        const availableCities = form.state ? STATE_CITIES_MAP[form.state.replace(' (Live Hub)', '')] : undefined;

        return (
          <div className="space-y-4 pb-20">
            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">Shop Address</h2>
              <p className="text-xs text-neutral-400 font-medium font-sans">Where is your boutique or warehouse located?</p>
            </div>

            {/* 1st: State (Active Marketplace Territories + All States) */}
            <FormSelect
              label="1. State / Territory"
              value={form.state}
              onChange={v => {
                const cleanState = v.replace(' (Live Hub)', '');
                updateField('state', cleanState);
                // Reset city if state changes
                updateField('city', '');
              }}
              options={INDIAN_STATES_WITH_HUBS}
              error={errors.state}
              required
              placeholder="Select State / Territory"
            />

            {/* 2nd: City (Cascading based on State) */}
            {availableCities && availableCities.length > 0 ? (
              <FormSelect
                label="2. City / Market Hub"
                value={form.city}
                onChange={v => updateField('city', v)}
                options={availableCities}
                error={errors.city}
                required
                placeholder="Select City / Commercial Hub"
              />
            ) : (
              <FormInput
                label="2. City / Town"
                value={form.city}
                onChange={v => updateField('city', v)}
                placeholder="e.g. Guwahati, Mumbai, Bengaluru"
                error={errors.city}
                required
              />
            )}

            {/* 3rd: Street Address / Building / Landmark */}
            <FormInput
              label="3. Street Address / Building"
              value={form.street}
              onChange={v => updateField('street', v)}
              placeholder="Shop No., Building Name, Street"
              error={errors.street}
              required
            />

            {/* 4th: Pincode & Landmark */}
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="4. Pincode"
                value={form.pincode}
                onChange={v => updateField('pincode', v.replace(/\D/g, ''))}
                placeholder="6-digit code"
                error={errors.pincode}
                required
                maxLength={6}
                type="tel"
              />
              <FormInput
                label="Landmark (Optional)"
                value={form.landmark}
                onChange={v => updateField('landmark', v)}
                placeholder="Near market/metro"
              />
            </div>

            {/* 5th: GPS Location (Coordinates) */}
            <div className="space-y-3 pt-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                5. Store GPS Coordinates<span className="text-rose-500 ml-0.5">*</span>
              </label>

              {/* Segmented Mode Switcher - Compact, modern pill */}
              <div className="flex p-1 bg-neutral-100 rounded-xl max-w-sm">
                <button
                  type="button"
                  onClick={() => setGpsMode('auto')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    gpsMode === 'auto'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Auto-Detect GPS
                </button>
                <button
                  type="button"
                  onClick={() => setGpsMode('manual')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                    gpsMode === 'manual'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Manual Coordinates
                </button>
              </div>

              {/* Mode 1: Auto-Detect */}
              {gpsMode === 'auto' && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-neutral-400 font-normal">
                    High-accuracy device geolocation. Best when you are physically registering from your store.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDetectGpsLocation}
                      disabled={isDetectingGps}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-teal-400/30"
                    >
                      {isDetectingGps ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Detecting GPS Location...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5 text-neutral-300" />
                          <span>{form.latitude && form.longitude ? 'Re-detect Location' : 'Auto-Detect Store Location'}</span>
                        </>
                      )}
                    </button>

                    {form.latitude !== null && form.longitude !== null && !isNaN(form.latitude) && !isNaN(form.longitude) && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        Accuracy: ±{gpsAccuracyMeters ?? 3}m
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: Manual Coordinates */}
              {gpsMode === 'manual' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400 font-normal">
                      Enter your store coordinates from Google Maps:
                    </p>
                    <a
                      href="https://www.google.com/maps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Open Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      label="Latitude"
                      value={manualLatStr}
                      onChange={handleManualLatChange}
                      placeholder="e.g. 26.144500"
                      required
                    />
                    <FormInput
                      label="Longitude"
                      value={manualLngStr}
                      onChange={handleManualLngChange}
                      placeholder="e.g. 91.736200"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Status display when coordinates are pinned */}
              {form.latitude !== null && form.longitude !== null && !isNaN(form.latitude) && !isNaN(form.longitude) && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 text-xs mt-2">
                  <div className="flex items-center gap-2 text-neutral-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2.5]" />
                    <span>
                      Location Pinned: <span className="font-mono font-semibold text-neutral-900">{form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
                    >
                      Maps ↗
                    </a>
                    <button
                      type="button"
                      onClick={handleClearGps}
                      className="text-[11px] font-medium text-neutral-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Validation error message if present */}
              {errors.gps && (
                <p className="text-[10.5px] font-semibold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.gps}</span>
                </p>
              )}
            </div>
          </div>
        );
      }

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-black text-neutral-900 tracking-tight">Bank & Payout Details</h2>
              <p className="text-xs text-neutral-400 font-medium">How should we send your earnings?</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800">Primary Payout (UPI)</span>
              </div>
              <FormInput
                label="UPI ID"
                value={form.upiId}
                onChange={v => updateField('upiId', v)}
                placeholder="yourname@paytm / yourname@upi"
                error={errors.upiId}
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Alternative: Bank Transfer (Optional)
              </span>
              <FormInput
                label="Bank Account Number"
                value={form.bankAccountNumber}
                onChange={v => updateField('bankAccountNumber', v.replace(/\D/g, ''))}
                placeholder="Account number"
              />
              <FormInput
                label="IFSC Code"
                value={form.bankIfsc}
                onChange={v => updateField('bankIfsc', v.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                error={errors.bankIfsc}
                maxLength={11}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-xl mx-auto space-y-4">
            {/* Header */}
            <div className="text-center space-y-1 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Final Review &bull; Step 5</span>
              </div>
              <h2 className="text-xl font-black text-neutral-950 tracking-tight">Audit &amp; Confirm Boutique Details</h2>
              <p className="text-xs text-neutral-500 font-medium max-w-sm mx-auto">
                Please verify your boutique profile, identity proofs, and payout information before final submission.
              </p>
            </div>

            {/* 1. Business Details Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 shadow-2xs space-y-3.5 relative overflow-hidden transition-all hover:border-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block leading-tight">Boutique Brand</span>
                    <span className="text-xs font-extrabold text-neutral-900 leading-tight">Business Profile</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/60 transition-colors cursor-pointer"
                >
                  <span>Edit</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10.5px] font-semibold text-neutral-400 block">Boutique / Trade Name</span>
                  <span className="text-base font-black text-neutral-950 tracking-tight">{form.businessName || '—'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-[11px] font-bold capitalize border border-neutral-200">
                    {form.businessType}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                    {form.businessCategory || 'Fashion & Apparel'}
                  </span>
                </div>
                {form.businessDescription && (
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 font-medium italic">
                    &ldquo;{form.businessDescription}&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* 2. Identity & KYC Dossier Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 shadow-2xs space-y-3.5 relative overflow-hidden transition-all hover:border-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block leading-tight">Identity Records</span>
                    <span className="text-xs font-extrabold text-neutral-900 leading-tight">
                      {form.businessType === 'company'
                        ? 'Corporate & Director KYC Dossier'
                        : form.businessType === 'partnership'
                        ? 'Partnership & Partner KYC Dossier'
                        : 'Proprietor KYC Verification'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/60 transition-colors cursor-pointer"
                >
                  <span>Edit</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {form.businessType === 'company' ? (
                <div className="space-y-3">
                  {/* Corporate Legal & Tax Header */}
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                        Company Incorporation &amp; Tax
                      </span>
                      <span className="text-[9.5px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md">
                        MCA Verified
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">CIN Number</span>
                        <span className="font-mono font-bold text-neutral-900">{form.cinNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Company GSTIN</span>
                        <span className="font-mono font-bold text-neutral-900">{form.gstNumber || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Corporate Documents Previews */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Certificate of Incorporation (COI) */}
                    <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Certificate of Incorporation</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-neutral-900 block mt-0.5">COI Document</span>
                        <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          {form.coiPhotoPreview ? 'Attached' : 'Pending'}
                        </span>
                      </div>
                      {form.coiPhotoPreview && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 shadow-3xs shrink-0">
                          {form.coiPhotoPreview.startsWith('data:application/pdf') || form.coiPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <Image src={form.coiPhotoPreview} alt="COI" fill unoptimized className="object-cover" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Company PAN */}
                    <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Company PAN</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-neutral-900 block mt-0.5">
                          {form.companyPanNumber || '—'}
                        </span>
                        <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          Attached
                        </span>
                      </div>
                      {form.companyPanPhotoPreview && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 shadow-3xs shrink-0">
                          {form.companyPanPhotoPreview.startsWith('data:application/pdf') || form.companyPanPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <Image src={form.companyPanPhotoPreview} alt="Company PAN" fill unoptimized className="object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Authorized Director Details */}
                  <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">
                        Authorized Director KYC
                      </span>
                      <span className="text-[10px] font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                        DIN: {form.directorDin || '—'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Director Name</span>
                        <span className="font-bold text-neutral-900">{form.directorName || form.ownerFullName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Contact Phone</span>
                        <span className="font-mono font-bold text-neutral-800">{form.directorPhone || form.ownerPhone || '—'}</span>
                      </div>
                    </div>

                    {/* Director KYC Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Director PAN */}
                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9.5px] font-bold text-neutral-400 uppercase block">Director PAN</span>
                          <span className="font-mono text-xs font-bold text-neutral-900">{form.panNumber || '—'}</span>
                        </div>
                        {form.panPhotoPreview && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-neutral-200 shrink-0">
                            {form.panPhotoPreview.startsWith('data:application/pdf') || form.panPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-blue-600 m-auto" />
                            ) : (
                              <Image src={form.panPhotoPreview} alt="Director PAN" fill unoptimized className="object-cover" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Director Aadhar */}
                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9.5px] font-bold text-neutral-400 uppercase block">Director Aadhar</span>
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            •••• {form.aadharNumber.replace(/\s/g, '').slice(-4)}
                          </span>
                        </div>
                        {form.aadharPhotoPreview && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-neutral-200 shrink-0">
                            {form.aadharPhotoPreview.startsWith('data:application/pdf') || form.aadharPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-blue-600 m-auto" />
                            ) : (
                              <Image src={form.aadharPhotoPreview} alt="Director Aadhar" fill unoptimized className="object-cover" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {form.boardResolutionPhotoPreview && (
                      <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-medium">Board Resolution / Auth Letter:</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Attached</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : form.businessType === 'partnership' ? (
                <div className="space-y-3">
                  {/* Partnership Firm Entity Header */}
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                        Partnership Firm Tax &amp; Identity
                      </span>
                      <span className="text-[9.5px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                        Firm Entity
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Firm GSTIN</span>
                        <span className="font-mono font-bold text-neutral-900">{form.gstNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Firm PAN Card</span>
                        <span className="font-mono font-bold text-neutral-900">{form.firmPanNumber || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Firm Documents Previews */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Firm PAN Card */}
                    <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Firm PAN Card</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-neutral-900 block mt-0.5">
                          {form.firmPanNumber || '—'}
                        </span>
                        <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          Attached
                        </span>
                      </div>
                      {form.firmPanPhotoPreview && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 shadow-3xs shrink-0">
                          {form.firmPanPhotoPreview.startsWith('data:application/pdf') || form.firmPanPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <Image src={form.firmPanPhotoPreview} alt="Firm PAN" fill unoptimized className="object-cover" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Partnership Deed */}
                    <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Partnership Deed</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-neutral-900 block mt-0.5">Deed Agreement</span>
                        <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          {form.partnershipDeedPhotoPreview ? 'Attached' : 'Pending'}
                        </span>
                      </div>
                      {form.partnershipDeedPhotoPreview && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 shadow-3xs shrink-0">
                          {form.partnershipDeedPhotoPreview.startsWith('data:application/pdf') || form.partnershipDeedPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <Image src={form.partnershipDeedPhotoPreview} alt="Deed" fill unoptimized className="object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Managing Partner Details */}
                  <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-1.5">
                      <span className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">
                        Managing Partner KYC
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Partner KYC
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Managing Partner</span>
                        <span className="font-bold text-neutral-900">{form.managingPartnerName || form.ownerFullName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 block">Contact Phone</span>
                        <span className="font-mono font-bold text-neutral-800">{form.managingPartnerPhone || form.ownerPhone || '—'}</span>
                      </div>
                    </div>

                    {/* Partner KYC Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Partner PAN */}
                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9.5px] font-bold text-neutral-400 uppercase block">Partner PAN</span>
                          <span className="font-mono text-xs font-bold text-neutral-900">{form.panNumber || '—'}</span>
                        </div>
                        {form.panPhotoPreview && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-neutral-200 shrink-0">
                            {form.panPhotoPreview.startsWith('data:application/pdf') || form.panPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-blue-600 m-auto" />
                            ) : (
                              <Image src={form.panPhotoPreview} alt="Partner PAN" fill unoptimized className="object-cover" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Partner Aadhar */}
                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9.5px] font-bold text-neutral-400 uppercase block">Partner Aadhar</span>
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            •••• {form.aadharNumber.replace(/\s/g, '').slice(-4)}
                          </span>
                        </div>
                        {form.aadharPhotoPreview && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-neutral-200 shrink-0">
                            {form.aadharPhotoPreview.startsWith('data:application/pdf') || form.aadharPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-blue-600 m-auto" />
                            ) : (
                              <Image src={form.aadharPhotoPreview} alt="Partner Aadhar" fill unoptimized className="object-cover" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Individual Proprietor */
                <div className="space-y-3">
                  <div>
                    <span className="text-[10.5px] font-semibold text-neutral-400 block">Full Legal Name (Govt ID)</span>
                    <span className="text-sm font-black text-neutral-900">{form.ownerFullName || '—'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] font-bold text-neutral-400 block uppercase">Primary Phone</span>
                      <span className="font-mono font-bold text-neutral-800">{form.ownerPhone || '—'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] font-bold text-neutral-400 block uppercase">Email Address</span>
                      <span className="font-medium text-neutral-800 truncate block">{form.ownerEmail || '—'}</span>
                    </div>
                  </div>

                  {/* KYC Document Previews */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Aadhar Tile */}
                    <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Aadhar Card</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-neutral-900 block mt-0.5">
                          •••• •••• {form.aadharNumber.replace(/\s/g, '').slice(-4)}
                        </span>
                        <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          Attached
                        </span>
                      </div>
                      {form.aadharPhotoPreview && (
                        <div className="w-13 h-13 rounded-xl overflow-hidden relative border border-neutral-200 shadow-3xs shrink-0">
                          {form.aadharPhotoPreview.startsWith('data:application/pdf') || form.aadharPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <Image src={form.aadharPhotoPreview} alt="Aadhar" fill unoptimized className="object-cover" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* PAN Tile */}
                    <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">PAN Card</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-neutral-900 block mt-0.5">
                          {form.panNumber || '—'}
                        </span>
                        <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          Attached
                        </span>
                      </div>
                      {form.panPhotoPreview && (
                        <div className="w-13 h-13 rounded-xl overflow-hidden relative border border-neutral-200 shadow-3xs shrink-0">
                          {form.panPhotoPreview.startsWith('data:application/pdf') || form.panPhotoPreview.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <Image src={form.panPhotoPreview} alt="PAN" fill unoptimized className="object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {form.gstNumber && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">Registered GSTIN:</span>
                      <span className="font-mono font-bold text-neutral-900">{form.gstNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Shop Location Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 shadow-2xs space-y-3 relative overflow-hidden transition-all hover:border-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block leading-tight">Shop Location</span>
                    <span className="text-xs font-extrabold text-neutral-900 leading-tight">Dispatch &amp; Pick-up Address</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/60 transition-colors cursor-pointer"
                >
                  <span>Edit</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs space-y-1">
                <p className="font-bold text-neutral-900 text-sm">{form.street || '—'}</p>
                {form.landmark && <p className="text-neutral-500 font-medium text-[11px]">Landmark: {form.landmark}</p>}
                <p className="text-neutral-700 font-semibold">{form.city}, {form.state} — <span className="font-mono font-bold text-neutral-950">{form.pincode}</span></p>
                {form.latitude && form.longitude ? (
                  <div className="mt-2 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-emerald-700 font-mono text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>GPS Pin: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans">Verified</span>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-neutral-200/60 flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>GPS Auto-Detection Skipped (Pending Physical Audit)</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Settlement & Payout */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4.5 shadow-2xs space-y-3 relative overflow-hidden transition-all hover:border-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block leading-tight">Payout Account</span>
                    <span className="text-xs font-extrabold text-neutral-900 leading-tight">Settlements &amp; Earnings</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/60 transition-colors cursor-pointer"
                >
                  <span>Edit</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Primary Payout UPI</span>
                  <span className="font-mono font-bold text-emerald-950 text-sm">{form.upiId || '—'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                  Instant UPI
                </span>
              </div>

              {form.bankAccountNumber && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">Bank A/C</span>
                    <span className="font-mono font-bold text-neutral-800">••••{form.bankAccountNumber.slice(-4)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 block uppercase">IFSC</span>
                    <span className="font-mono font-bold text-neutral-800">{form.bankIfsc}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Legal Agreements - 3 Mandatory Checkboxes */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden">
              {/* Section header */}
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2.5 bg-neutral-50/60">
                <ShieldCheck className="w-4 h-4 text-neutral-600 shrink-0" />
                <span className="text-[11px] font-black text-neutral-800 uppercase tracking-wider flex-1">
                  Legal Agreements & Compliance
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  [form.agreedToMerchantAgreement, form.agreedToTerms, form.agreedToPrivacyPolicy].every(Boolean)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {[form.agreedToMerchantAgreement, form.agreedToTerms, form.agreedToPrivacyPolicy].filter(Boolean).length}/3 accepted
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {/* 1. Merchant Agreement */}
                <div className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check-merchant"
                    checked={form.agreedToMerchantAgreement}
                    onChange={(e) => updateField('agreedToMerchantAgreement', e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 cursor-pointer accent-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label htmlFor="check-merchant" className="text-xs font-semibold text-neutral-800 cursor-pointer block leading-snug">
                      Nvilar Seller Merchant Agreement
                    </label>
                    <p className="text-[11px] text-neutral-400 font-normal mt-0.5 leading-snug">
                      Commercial contract, SLA, commissions, T+2/T+3 payouts, TCS/TDS deductions & anti-counterfeiting policy.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setLegalModalInitialDoc('agreement'); setLegalModalOpen(true); }}
                      className="mt-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Read full agreement ↗
                    </button>
                  </div>
                  {form.agreedToMerchantAgreement && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    </span>
                  )}
                </div>

                {/* 2. Terms & Conditions */}
                <div className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check-terms"
                    checked={form.agreedToTerms}
                    onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 cursor-pointer accent-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label htmlFor="check-terms" className="text-xs font-semibold text-neutral-800 cursor-pointer block leading-snug">
                      Seller Terms & Conditions (Platform Rules)
                    </label>
                    <p className="text-[11px] text-neutral-400 font-normal mt-0.5 leading-snug">
                      Catalog accuracy, MRP compliance, real-time inventory, no circumvention & prohibited goods policy.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setLegalModalInitialDoc('terms'); setLegalModalOpen(true); }}
                      className="mt-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Read full terms ↗
                    </button>
                  </div>
                  {form.agreedToTerms && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    </span>
                  )}
                </div>

                {/* 3. Privacy Policy */}
                <div className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="check-privacy"
                    checked={form.agreedToPrivacyPolicy}
                    onChange={(e) => updateField('agreedToPrivacyPolicy', e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 cursor-pointer accent-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label htmlFor="check-privacy" className="text-xs font-semibold text-neutral-800 cursor-pointer block leading-snug">
                      Seller Privacy Policy (DPDP Act 2023)
                    </label>
                    <p className="text-[11px] text-neutral-400 font-normal mt-0.5 leading-snug">
                      Secure KYC, banking & GPS data processing under DPDP Act. No third-party data sale. Grievance officer on record.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setLegalModalInitialDoc('privacy'); setLegalModalOpen(true); }}
                      className="mt-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Read full privacy policy ↗
                    </button>
                  </div>
                  {form.agreedToPrivacyPolicy && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    </span>
                  )}
                </div>
              </div>

              {/* Validation error */}
              {(errors.agreedToMerchantAgreement || errors.agreedToTerms || errors.agreedToPrivacyPolicy) && (
                <div className="px-4 pb-3 pt-1">
                  <p className="text-[10.5px] font-semibold text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Please accept all three legal agreements before submitting your application.
                  </p>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // --- Success Screen ---
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-white flex flex-col"
      >
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-neutral-900 tracking-tight mb-2"
          >
            Application Submitted! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-neutral-500 font-medium max-w-xs leading-relaxed mb-2"
          >
            Our team will review your application within <strong className="text-neutral-800">24-48 hours</strong>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-neutral-400 font-mono"
          >
            Application ID: {submittedAppId}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 max-w-xs"
          >
            <p className="text-xs text-blue-700 font-semibold leading-relaxed">
              📬 You&apos;ll receive an email and push notification once your application is reviewed.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={handleClose}
            className="mt-8 px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            Back to Profile
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // --- Main Onboarding UI ---
  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col antialiased"
    >
      {/* Header - Clean Modern Stepper */}
      <div className="shrink-0 bg-white border-b border-neutral-200/80 px-4 pt-3.5 pb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] safe-top">
        {/* Top bar with Navigation, Branding & Step Counter */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={step === 1 ? handleClose : goBack}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xs"
            aria-label={step === 1 ? 'Close' : 'Go back'}
          >
            {step === 1 ? <X className="w-4.5 h-4.5" /> : <ArrowLeft className="w-4.5 h-4.5" />}
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-[15px] font-black text-neutral-900 tracking-tight">Nvilar Seller</h1>
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Partner
              </span>
            </div>
            <p className="text-[11px] font-semibold text-neutral-400 mt-0.5">
              Step {step} of 5 &bull;{' '}
              <span className="text-neutral-800 font-bold">
                {step === 2
                  ? form.businessType === 'company'
                    ? 'Corporate & Director KYC'
                    : form.businessType === 'partnership'
                    ? 'Partnership & Partner KYC'
                    : 'Proprietor Identity & KYC'
                  : STEPS[step - 1]?.label}
              </span>
            </p>
          </div>

          <div className="w-9 flex justify-end items-center">
            <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 font-mono">
              {Math.round((step / 5) * 100)}%
            </span>
          </div>
        </div>

        {/* Shipping-Tracker Style Horizontal Stepper */}
        <div className="relative max-w-md mx-auto px-2">
          {/* Tracker Nodes & Progress Line */}
          <div className="relative flex items-start justify-between">
            {/* Background Line */}
            <div className="absolute top-4 left-4 right-4 h-[3px] bg-neutral-200 rounded-full -translate-y-1/2 z-0" />

            {/* Filled Progress Line */}
            <div
              className="absolute top-4 left-4 h-[3px] bg-gradient-to-r from-blue-600 to-blue-500 rounded-full -translate-y-1/2 z-0 transition-all duration-500 ease-out"
              style={{
                width: `calc((100% - 32px) * ${(step - 1) / 4})`,
              }}
            />

            {STEPS.map((s) => {
              const isCompleted = s.id < step;
              const isCurrent = s.id === step;
              const isUpcoming = s.id > step;

              return (
                <div key={s.id} className="flex flex-col items-center">
                  <button
                    type="button"
                    disabled={isUpcoming}
                    onClick={() => goToStep(s.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 relative z-10 ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 cursor-pointer'
                        : isCurrent
                        ? 'bg-white text-blue-600 border-2 border-blue-600 ring-4 ring-blue-100 shadow-md shadow-blue-500/20 scale-110 font-black'
                        : 'bg-white text-neutral-400 border-2 border-neutral-200 cursor-default'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span>{s.id}</span>
                    )}
                  </button>

                  <span
                    className={`mt-1.5 text-[10.5px] tracking-tight text-center transition-colors ${
                      isCurrent
                        ? 'font-bold text-blue-600'
                        : isCompleted
                        ? 'font-bold text-neutral-800'
                        : 'font-medium text-neutral-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="shrink-0 border-t border-neutral-100 bg-white px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={goBack}
              className="px-5 py-3 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95 cursor-pointer"
            >
              Back
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={goNext}
              disabled={step === 3 && (form.latitude === null || form.longitude === null)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                step === 3 && (form.latitude === null || form.longitude === null)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 text-white cursor-pointer'
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.agreedToMerchantAgreement || !form.agreedToTerms || !form.agreedToPrivacyPolicy}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                !form.agreedToMerchantAgreement || !form.agreedToTerms || !form.agreedToPrivacyPolicy
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Legal Document Reader Modal */}
      <SellerLegalReaderModal
        isOpen={legalModalOpen}
        initialDoc={legalModalInitialDoc}
        acceptedDocs={acceptedLegalDocs}
        onAccept={(docId) => {
          setAcceptedLegalDocs(prev => new Set(prev).add(docId));
          if (docId === 'agreement') updateField('agreedToMerchantAgreement', true);
          if (docId === 'terms') updateField('agreedToTerms', true);
          if (docId === 'privacy') updateField('agreedToPrivacyPolicy', true);
        }}
        onClose={() => setLegalModalOpen(false)}
      />
    </motion.div>
  );
};
