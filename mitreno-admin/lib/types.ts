export interface SellerApplicationData {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'individual' | 'partnership' | 'company';
  business_category: string;
  business_description: string;

  // Owner KYC
  owner_full_name: string;
  owner_phone: string;
  owner_email?: string | null;

  // Documents
  aadhar_number: string;
  aadhar_photo_url: string;
  pan_number: string;
  pan_photo_url: string;
  voter_id_number?: string | null;
  voter_id_photo_url?: string | null;
  dl_number?: string | null;
  dl_photo_url?: string | null;
  gst_number?: string | null;

  // Dynamic KYC & Business Entity Documents
  business_documents?: {
    entity_type?: string;
    cin_number?: string;
    coi_url?: string;
    company_pan_number?: string;
    company_pan_url?: string;
    director_name?: string;
    director_din?: string;
    board_resolution_url?: string;
    firm_pan_number?: string;
    firm_pan_url?: string;
    partnership_deed_url?: string;
    managing_partner_name?: string;
    [key: string]: any;
  };
  cin_number?: string | null;
  coi_photo_url?: string | null;
  firm_pan_number?: string | null;
  partnership_deed_url?: string | null;

  // Address
  shop_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    latitude?: number | null;
    longitude?: number | null;
  };

  // Payout
  payout_upi_id: string;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;

  // Status
  status: 'pending_review' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string | null;
  rejection_reason?: string | null;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminMetrics {
  total_revenue_inr: number;
  total_orders: number;
  total_customers: number;
  total_shops: number;
  total_products: number;
  total_reels: number;
  total_banners?: number;
  active_ads?: number;
  total_cities?: number;
  total_markets?: number;
  active_bargains: number;
  pending_seller_apps: number;
  cancelled_seller_apps?: number;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  target_type: 'category' | 'shop' | 'product' | 'deal' | 'external';
  target_id?: string;
  target_url?: string;
  sort_order: number;
  is_active: boolean;
  click_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoutiqueAdItem {
  id: string;
  shop_id: string;
  shop_name?: string;
  shop_city?: string;
  shop_category?: string;
  payout_upi_id?: string;
  campaign_name: string;
  ad_type: 'banner' | 'feed_sponsored' | 'reel_boost' | 'search_top';
  banner_image_url?: string;
  target_url?: string;
  daily_budget_inr: number;
  total_spent_inr: number;
  status: 'active' | 'paused' | 'pending_approval' | 'rejected' | 'completed';
  impressions: number;
  clicks: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface ReelItem {
  id: string;
  shop_id: string;
  shop_name?: string;
  shop_city?: string;
  creator_id?: string;
  creator_name?: string;
  video_url: string;
  thumbnail_url?: string;
  caption: string;
  tagged_product_id?: string;
  likes_count: number;
  views_count: number;
  is_active: boolean;
  is_approved: boolean;
  is_flagged: boolean;
  flag_reason?: string | null;
  duration_seconds?: number;
  created_at?: string;
}

export interface MarketItem {
  id: string;
  city: string;
  market_name: string;
  state: string;
  pincode?: string;
  icon_emoji?: string;
  is_popular?: boolean;
  shops_count?: number;
  live_shops_count?: number;
  created_at?: string;
}

export interface AdminShopItem {
  id: string;
  owner_id: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  name: string;
  bio: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  payout_upi_id: string;
  city: string;
  market_name: string;
  category: string;
  total_revenue: number;
  total_orders: number;
  cancelled_orders_count: number;
  commission_rate: number;
  status: 'active' | 'suspended' | 'terminated';
  status_reason?: string | null;
  suspended_at?: string | null;
  terminated_at?: string | null;
  logo_url?: string;
  cover_image_url?: string;
  state_id?: string;
  city_id?: string;
  city_name?: string;
  state_name?: string;
  state_code?: string;
  city_commission_rate?: number;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
}

// Geographic Hierarchy Types
export interface StateItem {
  id: string;
  name: string;
  code: string;
  icon_url?: string;
  is_active: boolean;
  sort_order: number;
  city_count: number;
  shop_count: number;
  total_revenue: number;
  created_at?: string;
}

export interface CityItem {
  id: string;
  state_id: string;
  name: string;
  pincode_prefix?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  tier?: string;
  is_active: boolean;
  is_featured: boolean;
  shop_count: number;
  total_revenue: number;
  sort_order: number;
  default_commission_rate?: number;
  live_shop_count?: number;
  active_shops?: number;
  suspended_shops?: number;
  total_orders?: number;
  created_at?: string;
  state_name?: string;
  state_code?: string;
}

export interface CityShopDetail {
  id: string;
  owner_id: string;
  name: string;
  bio: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  payout_upi_id?: string;
  city_id?: string;
  state_id?: string;
  city?: string;
  market_name?: string;
  category?: string;
  logo_url?: string;
  cover_image?: string;
  status: 'active' | 'suspended' | 'terminated';
  status_reason?: string | null;
  suspended_at?: string | null;
  total_revenue: number;
  total_orders: number;
  cancelled_orders?: number;
  cancelled_orders_count?: number;
  commission_rate?: number;
  product_count?: number;
  created_at?: string;
  owner?: {
    full_name: string;
    phone: string;
    email?: string;
  };
}

export interface ShopKundliData {
  success: boolean;
  shop: {
    id: string;
    owner_id: string;
    name: string;
    logo_url?: string | null;
    cover_image?: string | null;
    bio: string;
    rating: number | string;
    review_count: number;
    is_verified: boolean;
    payout_upi_id?: string | null;
    city_id?: string | null;
    state_id?: string | null;
    city?: string | null;
    market_name?: string | null;
    category?: string | null;
    status: 'active' | 'suspended' | 'terminated';
    status_reason?: string | null;
    suspended_at?: string | null;
    commission_rate: number;
    total_revenue: number;
    total_orders: number;
    cancelled_orders_count: number;
    created_at?: string;
    owner_name?: string;
    owner_phone?: string;
    owner_email?: string;
    city_name?: string;
    state_name?: string;
    state_code?: string;
    city_default_commission?: number;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    original_price?: number;
    discount_percent?: number;
    thumbnail?: string;
    gallery_images?: string[];
    category: string;
    fabric?: string;
    gsm?: number;
    is_active: boolean;
  }>;
  metrics: {
    total_revenue: number;
    total_orders: number;
    cancelled_orders: number;
    order_defect_rate: number;
    on_time_dispatch_rate: number;
    late_shipment_rate: number;
    average_order_value: number;
    monthly_visitors: number;
    conversion_rate: string;
    customer_rating: number;
    review_count: number;
  };
  orders_breakdown: {
    delivered: number;
    shipped: number;
    in_transit: number;
    merchant_cancelled: number;
    buyer_cancelled: number;
  };
  financials: {
    gross_gmv: number;
    commission_rate: number;
    platform_fee: number;
    payment_gateway_fee: number;
    tcs_gst: number;
    net_payable: number;
    settlement_status: string;
    next_settlement_date: string;
  };
}

export interface MarketplaceAnalyticsData {
  success: boolean;
  period: string;
  financials: {
    total_sales: number;
    admin_commission: number;
    order_commission?: number;
    subscription_revenue?: number;
    total_platform_earnings?: number;
    pro_boutiques_count?: number;
    starter_boutiques_count?: number;
    average_order_value: number;
    total_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
  };
  logistics: {
    rto_rate_pct: number;
    delivery_success_score: number;
    payment_modes: Array<{
      mode: string;
      count: number;
      percentage: number;
    }>;
  };
  daily_trends: Array<{
    date: string;
    day_name: string;
    orders_count: number;
    total_sales: number;
  }>;
  stores_matrix: Array<{
    id: string;
    name: string;
    city_name: string;
    category: string;
    plan_type?: string;
    plan_name?: string;
    commission_rate: number;
    rating: number;
    review_count: number;
    today_orders: number;
    today_revenue: number;
    total_orders: number;
    total_revenue: number;
    cancelled_orders: number;
    return_rate_pct: number;
    order_commission?: number;
    subscription_revenue?: number;
    total_platform_revenue?: number;
    admin_commission: number;
    payout_speed?: string;
  }>;
  city_analytics: Array<{
    name: string;
    state_name: string;
    shop_count: number;
    order_count: number;
    total_sales: number;
  }>;
  customers: {
    total_customers: number;
    new_this_week: number;
    repeat_buyers: number;
    repeat_buyer_rate_pct: number;
  };
  mitreno_engines: {
    active_bargains: number;
    total_bargains: number;
    bargain_win_rate: number;
    reels_total_views: number;
    reels_total_likes: number;
    reels_count: number;
  };
}

export interface PincodeRiskItem {
  pincode: string;
  city: string;
  total_orders: number;
  cancelled_orders: number;
  cancel_rate_pct: number;
  risk_level: string;
}

export interface SerialCancellerItem {
  user_id: string;
  full_name: string;
  phone: string;
  total_orders: number;
  cancelled_orders: number;
  cancelled_volume: number;
  cancel_rate_pct: number;
  risk_action: string;
}

export interface OverdueDispatchItem {
  order_id: string;
  shop_name: string;
  customer_city: string;
  total_paid: number;
  order_status: string;
  placed_at: string;
  hours_elapsed: number;
}

export interface FraudRadarData {
  success: boolean;
  tab: 'fraud';
  period: string;
  summary: {
    total_orders: number;
    total_cancelled_orders: number;
    rto_rate_pct: number;
    overdue_dispatch_count: number;
  };
  pincode_risks: PincodeRiskItem[];
  serial_cancellers: SerialCancellerItem[];
  overdue_dispatches: OverdueDispatchItem[];
}

export interface EscrowSettlementItem {
  shop_id: string;
  shop_name: string;
  city_name?: string;
  payout_upi_id: string;
  plan_type?: string;
  plan_name?: string;
  commission_rate?: number;
  subscription_billed?: number;
  delivered_orders: number;
  gross_delivered_sales: number;
  platform_fee_deducted: number;
  net_payable: number;
  payout_status: string;
  payout_speed?: string;
}

export interface EscrowVaultData {
  success: boolean;
  tab: 'escrow';
  period: string;
  vault: {
    in_flight_escrow: number;
    ready_payouts: number;
    order_commissions?: number;
    pay_as_you_go_earnings?: number;
    subscription_vault?: number;
    net_platform_earnings: number;
    refunded_amount: number;
    pro_boutiques_count?: number;
    starter_boutiques_count?: number;
  };
  settlements: EscrowSettlementItem[];
}

export interface BargainStreamItem {
  negotiation_id: string;
  buyer_name: string;
  shop_name: string;
  product_name: string;
  original_price: number;
  buyer_last_offer: number;
  seller_last_offer: number;
  agreed_price: number | null;
  discount_asked_pct: number;
  status: string;
  created_at: string;
}

export interface BargainsFloorData {
  success: boolean;
  tab: 'bargains';
  period: string;
  intelligence: {
    avg_discount_asked: number;
    avg_discount_accepted: number;
    total_negotiations: number;
    accepted_count: number;
    conversion_rate_pct: number;
  };
  stream: BargainStreamItem[];
}

export interface RecoveryLeadItem {
  lead_id: string;
  customer_name: string;
  phone: string;
  shop_name: string;
  cart_value: number;
  payment_status: string;
  order_status: string;
  dropped_at: string;
  hours_ago: number;
}

export interface CartRecoveryData {
  success: boolean;
  tab: 'recovery';
  period: string;
  summary: {
    total_dropped_leads: number;
    recoverable_gmv: number;
  };
  leads: RecoveryLeadItem[];
}

export interface LiveActivityPulse {
  active_now: number;
  last_1h: number;
  dau_today: number;
  wau_7d: number;
  mau_30d: number;
  stickiness_pct: number;
  online_sellers_count: number;
  total_sellers_count: number;
}

export interface ScreenFunnelItem {
  zone_name: string;
  user_count: number;
  pct_share: number;
}

export interface SearchTrendItem {
  keyword: string;
  query_count: number;
  growth_tag: string;
}

export interface HourlyVelocityPoint {
  hour_label: string;
  sessions_count: number;
}

export interface BoutiqueLiveItem {
  shop_id: string;
  shop_name: string;
  city: string;
  is_online: boolean;
  last_seen_ago: string;
  current_action: string;
  pending_orders: number;
  plan_type: string;
}

export interface LiveActivityData {
  success: boolean;
  tab: 'activity';
  period: string;
  pulse: LiveActivityPulse;
  funnel: ScreenFunnelItem[];
  search_trends: SearchTrendItem[];
  hourly_velocity: HourlyVelocityPoint[];
  boutiques: BoutiqueLiveItem[];
}


