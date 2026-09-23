export type BusinessType = 'individual' | 'partnership' | 'company';
export type PayoutMethod = 'upi' | 'bank';
export type BankAccountType = 'savings' | 'current';

export interface BusinessDetailsData {
  shopName: string;
  businessType: BusinessType;
  businessCategory: string;
  description: string;
}

export interface IdentityKYCData {
  legalName: string;
  phone: string;
  email: string;
  aadharNumber: string;
  aadharCardUri?: string;
  aadharFileName?: string;
  panNumber: string;
  panCardUri?: string;
  panFileName?: string;
  voterId?: string;
  drivingLicense?: string;
  gstNumber?: string;
  additionalDocUri?: string;
}

export interface ShopAddressData {
  state: string;
  city: string;
  streetAddress: string;
  pincode: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy?: string;
}

export interface PayoutDetailsData {
  payoutMethod: PayoutMethod;
  accountType: BankAccountType;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface LegalAgreementsState {
  merchantAgreement: boolean;
  termsConditions: boolean;
  privacyPolicy: boolean;
}

export interface SellerApplicationData {
  business: BusinessDetailsData;
  identity: IdentityKYCData;
  address: ShopAddressData;
  payout: PayoutDetailsData;
  legalAgreements: LegalAgreementsState;
  termsAccepted: boolean;
  registrationFeePaid: boolean;
  paymentId?: string;
}

export interface StateItem {
  id: string;
  name: string;
}

export const ALL_INDIAN_STATES: StateItem[] = [
  { id: 'andaman_nicobar', name: 'Andaman and Nicobar Islands' },
  { id: 'andhra_pradesh', name: 'Andhra Pradesh' },
  { id: 'arunachal_pradesh', name: 'Arunachal Pradesh' },
  { id: 'assam', name: 'Assam' },
  { id: 'bihar', name: 'Bihar' },
  { id: 'chandigarh', name: 'Chandigarh' },
  { id: 'chhattisgarh', name: 'Chhattisgarh' },
  { id: 'dadra_nagar_haveli', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'goa', name: 'Goa' },
  { id: 'gujarat', name: 'Gujarat' },
  { id: 'haryana', name: 'Haryana' },
  { id: 'himachal_pradesh', name: 'Himachal Pradesh' },
  { id: 'jammu_kashmir', name: 'Jammu and Kashmir' },
  { id: 'jharkhand', name: 'Jharkhand' },
  { id: 'karnataka', name: 'Karnataka' },
  { id: 'kerala', name: 'Kerala' },
  { id: 'ladakh', name: 'Ladakh' },
  { id: 'lakshadweep', name: 'Lakshadweep' },
  { id: 'madhya_pradesh', name: 'Madhya Pradesh' },
  { id: 'maharashtra', name: 'Maharashtra' },
  { id: 'manipur', name: 'Manipur' },
  { id: 'meghalaya', name: 'Meghalaya' },
  { id: 'mizoram', name: 'Mizoram' },
  { id: 'nagaland', name: 'Nagaland' },
  { id: 'odisha', name: 'Odisha' },
  { id: 'puducherry', name: 'Puducherry' },
  { id: 'punjab', name: 'Punjab' },
  { id: 'rajasthan', name: 'Rajasthan' },
  { id: 'sikkim', name: 'Sikkim' },
  { id: 'tamil_nadu', name: 'Tamil Nadu' },
  { id: 'telangana', name: 'Telangana' },
  { id: 'tripura', name: 'Tripura' },
  { id: 'uttar_pradesh', name: 'Uttar Pradesh' },
  { id: 'uttarakhand', name: 'Uttarakhand' },
  { id: 'west_bengal', name: 'West Bengal' },
];

export const TOP_LIVE_HUBS = ALL_INDIAN_STATES.slice(0, 5); // Fallback reference if imported

export const STATE_CITY_HUBS: Record<string, string[]> = {
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
  'Delhi NCR': ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Noida', 'Agra', 'Prayagraj', 'Ghaziabad', 'Meerut', 'Bareilly', 'Aligarh'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'],
};

// Real cutout PNG icons for luxury visual presentation
const CAT_ICON_ALL = require('../../assets/category-icons/cat_all.png');
const CAT_ICON_MEN = require('../../assets/category-icons/cat_men.png');
const CAT_ICON_WOMEN = require('../../assets/category-icons/cat_women.png');
const CAT_ICON_ETHNIC = require('../../assets/category-icons/cat_ethnic.png');
const CAT_ICON_KIDS = require('../../assets/category-icons/cat_kids.png');
const CAT_ICON_STREETWEAR = require('../../assets/category-icons/cat_streetwear.png');
const CAT_ICON_FOOTWEAR = require('../../assets/category-icons/cat_footwear.png');

export interface FashionCategoryOption {
  id: string;
  name: string;
  subtitle: string;
  iconImage: any;
  bgPastel: string;
  badge?: string;
}

export const SELLER_FASHION_CATEGORIES: FashionCategoryOption[] = [
  {
    id: 'all_fashion',
    name: 'Multi-Category Boutique / Store',
    subtitle: 'All clothing, apparel & multi-niche collections',
    iconImage: CAT_ICON_ALL,
    bgPastel: '#F1F5F9',
    badge: 'POPULAR',
  },
  {
    id: 'menswear',
    name: "Men's Apparel & Streetwear",
    subtitle: 'Shirts, tees, trousers, denim & formalwear',
    iconImage: CAT_ICON_MEN,
    bgPastel: '#EFF6FF',
  },
  {
    id: 'womenswear',
    name: "Women's Western & Contemporary",
    subtitle: 'Dresses, tops, skirts, modern luxury & fits',
    iconImage: CAT_ICON_WOMEN,
    bgPastel: '#FDF2F8',
  },
  {
    id: 'ethnic_handloom',
    name: 'Ethnic Wear & Handloom Heritage',
    subtitle: 'Kurtas, sarees, lehengas & traditional craft',
    iconImage: CAT_ICON_ETHNIC,
    bgPastel: '#FEF3C7',
  },
  {
    id: 'kidswear',
    name: 'Kids & Teens Collection',
    subtitle: 'Infant, toddler, boys & girls daily fashion',
    iconImage: CAT_ICON_KIDS,
    bgPastel: '#F0FDF4',
  },
  {
    id: 'streetwear_vintage',
    name: 'Streetwear, Thrift & Vintage',
    subtitle: 'Oversized, retro drops, hoodies & thrift finds',
    iconImage: CAT_ICON_STREETWEAR,
    bgPastel: '#F5F3FF',
  },
  {
    id: 'footwear_sneakers',
    name: 'Footwear & Designer Sneakers',
    subtitle: 'Sneakers, boots, loafers, heels & flats',
    iconImage: CAT_ICON_FOOTWEAR,
    bgPastel: '#FFF7ED',
  },
];
