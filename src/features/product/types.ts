export interface ProductSizeOption {
  size: string;
  stock: number; // e.g. 2 -> "HURRY, ONLY 2 LEFT IN SIZE L!"
}

export interface PricePoint {
  day: string; // e.g. "6d ago", "4d ago", "2d ago", "Yest", "Today"
  price: number;
  isLowest?: boolean;
}

export interface ProductSpecificationItem {
  key: string;
  label: string;
  value: string;
  colorSwatch?: string;
}

export interface SellerInfo {
  name: string;
  handle: string;
  rating: number;
  verified: boolean;
  avatar: string;
  dispatchesIn: string;
}

export interface DeliveryDetails {
  pincode: string;
  city: string;
  tag: string; // e.g. "HYPERLOCAL"
  timeframe: string; // e.g. "Today Delivery (30–60 Min Express)"
  isNearDistance: boolean; // <= 10 km -> Same day / Express
  fee: number;
}

export interface PolicyItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
}

export interface ProductDetailItem {
  id: string;
  name: string;
  boutiqueTag: string; // e.g. "SAROJINI EXCLUSIVE"
  price: number;
  originalPrice: number;
  discountPercent: number;
  badgeText?: string; // e.g. "LOWEST PRICE SINCE LAUNCH"
  deliveryFeeText?: string; // e.g. "+₹99 Delivery Fee"
  images: string[]; // 4 to 5 images
  sizes: ProductSizeOption[];
  seller: SellerInfo;
  delivery: DeliveryDetails;
  priceHistory: PricePoint[];
  sku: string;
  specifications: ProductSpecificationItem[];
  productStory: string;
  policies: PolicyItem[];
}
