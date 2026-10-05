export interface ProductImage {
  id: string;
  url: string;
  angle: 'front' | 'side' | 'back' | 'details' | 'lifestyle';
  caption?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  collection: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories';
  price: number;
  originalPrice?: number;
  gsm: number;
  fabric: string;
  fit: 'Relaxed' | 'Oversized' | 'Structured' | 'Tailored';
  description: string;
  features: string[];
  stylingTips: string;
  inventory: Record<'S' | 'M' | 'L' | 'XL' | 'XXL', number>;
  images: ProductImage[];
  thumbnail: string;
  tryOnModelUrl: string;
  modelInfo: {
    height: string;
    wearingSize: string;
    fitNote: string;
  };
  completeLookIds: string[];
  fabricCloseUpUrl: string;
  color: string;
  colorHex: string;
  shop: {
    name: string;
    location: string;
    verified: boolean;
    rating: number;
    latitude?: number;
    longitude?: number;
  };
  isOutOfStock?: boolean;
  isActive?: boolean;
  is_sponsored?: boolean;
  boost_expires_at?: string | null;
}

export interface RunwayLook {
  id: string;
  lookNumber: string;
  season: string;
  title: string;
  subtitle: string;
  heroImage: string;
  secondaryImage: string;
  featuredProductId: string;
  price: number;
  badge: string;
  curationStory: string;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  coverImage: string;
  excerpt: string;
  content: string[];
  featuredProductIds: string[];
  publishedDate: string;
  author: string;
}

export interface UserAvatar {
  id: string;
  name: string;
  gender: string;
  fitProfile: string;
  imageUrl: string;
  height: string;
}

export const USER_AVATARS: UserAvatar[] = [
  {
    id: 'avatar-1',
    name: 'Ashraf (Me)',
    gender: 'Men',
    fitProfile: 'Relaxed Athletic',
    height: "6'1\"",
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'avatar-2',
    name: 'Maya',
    gender: 'Women',
    fitProfile: 'Slender Minimal',
    height: "5'9\"",
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'avatar-3',
    name: 'Siddharth',
    gender: 'Men',
    fitProfile: 'Oversized Drape',
    height: "5'11\"",
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'avatar-4',
    name: 'Elena',
    gender: 'Women',
    fitProfile: 'Tailored Chic',
    height: "5'8\"",
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'afz-001',
    slug: 'aero-fit-structured-linen-shirt',
    name: 'AERO-FIT STRUCTURED LINEN SHIRT',
    tagline: '240 GSM Pure European Flax with Dropped Shoulder Silhouette',
    collection: 'Summer 26 — The Linen Edit',
    category: 'tops',
    price: 2499,
    originalPrice: 3499,
    gsm: 240,
    fabric: '100% Normandy Flax Linen',
    fit: 'Relaxed',
    description: 'Sculpted for effortless resort presence. Woven with double-twisted 240 GSM long-staple linen that maintains architectural shape while yielding exceptional breathability under sunlit warmth.',
    features: [
      'Pre-washed Normandy French Flax',
      'Mother-of-Pearl laser-engraved buttons',
      'Reinforced Cuban camp collar with French seams',
      'Clean boxy drape with subtle side-slits',
    ],
    stylingTips: 'Pair with the Monochrome Pleated Trousers and Minimalist Leather Slides for an unfiltered coastal evening.',
    inventory: { S: 4, M: 7, L: 3, XL: 6, XXL: 2 },
    images: [
      {
        id: 'img-1-1',
        url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Studio Front Angle',
      },
      {
        id: 'img-1-2',
        url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Profile Silhouette',
      },
      {
        id: 'img-1-3',
        url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Fabric Weave & Stitching',
      },
      {
        id: 'img-1-4',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Runway Campaign Capture',
      },
      {
        id: 'img-1-5',
        url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Outdoor Natural Lighting',
      },
      {
        id: 'img-1-6',
        url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Model Wearing Profile',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "6'2\"",
      wearingSize: 'L',
      fitNote: 'True to relaxed fit. Size down for tailored profile.',
    },
    completeLookIds: ['afz-002', 'afz-006', 'afz-008'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop',
    color: 'Ivory Ecru',
    colorHex: '#F5F5F0',
    shop: {
      name: 'The Thrift Garage',
      location: 'Bandra West, Mumbai',
      verified: true,
      rating: 4.8
    },
  },
  {
    id: 'afz-002',
    slug: 'monochrome-pleated-resort-trousers',
    name: 'MONOCHROME PLEATED RESORT TROUSERS',
    tagline: 'Deep Double Pleats in High-Twist Wool-Linen Blend',
    collection: 'Summer 26 — The Linen Edit',
    category: 'bottoms',
    price: 3299,
    originalPrice: 4499,
    gsm: 280,
    fabric: '65% Belgian Linen, 35% High-Twist Wool',
    fit: 'Structured',
    description: 'An architectural wide-leg trouser featuring deep front reverse pleats, a continuous Hollywood waistband, and an internal curtain lining that guarantees a fluid, swaying drape with every stride.',
    features: [
      'Double reverse front pleats for voluminous mobility',
      'Extended tab waistband with horn fastening',
      'Clean 2-inch cuffed hem with hand-finished stitch',
      'Wrinkle-resistant high-twist blend',
    ],
    stylingTips: 'Harmonizes effortlessly with raw silk overshirts or untucked structured linen pieces.',
    inventory: { S: 5, M: 8, L: 4, XL: 5, XXL: 1 },
    images: [
      {
        id: 'img-2-1',
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Full Frontal Drape',
      },
      {
        id: 'img-2-2',
        url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Pleat Craftsmanship',
      },
      {
        id: 'img-2-3',
        url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Fabric Texture Detail',
      },
      {
        id: 'img-2-4',
        url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Side Profile Break',
      },
      {
        id: 'img-2-5',
        url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Street Runway Movement',
      },
      {
        id: 'img-2-6',
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Full Styled Ensemble',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "6'2\"",
      wearingSize: 'M (32)',
      fitNote: 'High-rise structured waist with generous thigh break.',
    },
    completeLookIds: ['afz-001', 'afz-006'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop',
    color: 'Midnight Obsidian',
    colorHex: '#111827',
    shop: {
      name: 'Street Drops',
      location: 'Hauz Khas, Delhi',
      verified: true,
      rating: 4.9
    },
  },
  {
    id: 'afz-003',
    slug: 'after-dark-sculpted-silk-blazer',
    name: 'AFTER-DARK SCULPTED SILK BLAZER',
    tagline: 'Deconstructed Shoulder Canvas in Heavy Silk-Wool Blend',
    collection: 'After Dark — Nocturne Drop',
    category: 'outerwear',
    price: 6999,
    originalPrice: 8999,
    gsm: 360,
    fabric: '40% Mulberry Silk, 60% Fine Worsted Wool',
    fit: 'Tailored',
    description: 'Engineered for night-time gravitas. A deconstructed single-breasted jacket with peak lapels, zero shoulder padding for natural anatomical drape, and subtle matte sheen that catches moody ambient illumination.',
    features: [
      'Unstructured Italian Neapolitan shoulder design',
      'Curved barchetta chest pocket',
      'Cupro half-lining for thermal comfort in balmy lounges',
      'Real horn buttons with crossed hand-stitching',
    ],
    stylingTips: 'Wear over bare skin with minimal chains, or layer atop our Supima Micro-Rib Tank.',
    inventory: { S: 2, M: 4, L: 5, XL: 2, XXL: 1 },
    images: [
      {
        id: 'img-3-1',
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Sculpted Profile',
      },
      {
        id: 'img-3-2',
        url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Nocturne Runway Look',
      },
      {
        id: 'img-3-3',
        url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Silk Blend Finish',
      },
      {
        id: 'img-3-4',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Shoulder Drape',
      },
      {
        id: 'img-3-5',
        url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Ambient Studio Lighting',
      },
      {
        id: 'img-3-6',
        url: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Tailored Lapel Stitch',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "6'1\"",
      wearingSize: 'L (40R)',
      fitNote: 'Tailored drape through chest with soft dropped shoulder line.',
    },
    completeLookIds: ['afz-002', 'afz-006', 'afz-007'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
    color: 'Midnight Eclipse',
    colorHex: '#090D16',
    shop: {
      name: 'Vintage Vault',
      location: 'Colaba, Mumbai',
      verified: false,
      rating: 4.5
    },
  },
  {
    id: 'afz-004',
    slug: 'heavyweight-minimal-terry-hoodie',
    name: 'HEAVYWEIGHT MINIMAL TERRY HOODIE',
    tagline: '520 GSM Loopback French Terry with Seamless Kangaroo Pocket',
    collection: 'Essentials — Pure Volume',
    category: 'tops',
    price: 3499,
    originalPrice: 4299,
    gsm: 520,
    fabric: '100% Combed Organic Cotton Loopback Terry',
    fit: 'Oversized',
    description: 'The definitive architectural hoodie. Dense, plush 520 GSM loopback cotton with a double-layered crossover hood that stands rigid without drawstrings, flanked by clean blind-stitched seams.',
    features: [
      'Double-ply crossover scuba hood (no dangling strings)',
      'Hidden internal seam pockets for minimalist facade',
      'Heavy 2x2 ribbing at cuff and hem that resists elongation',
      'Silicon-washed for ultra-soft brushed handfeel',
    ],
    stylingTips: 'Combine with wide-leg tailored wool trousers and chunkier minimalist derbies.',
    inventory: { S: 6, M: 10, L: 6, XL: 4, XXL: 3 },
    images: [
      {
        id: 'img-4-1',
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Volume Study Front',
      },
      {
        id: 'img-4-2',
        url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: '520 GSM Heavyweight Terry Weave',
      },
      {
        id: 'img-4-3',
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Oversized Scuba Hood',
      },
      {
        id: 'img-4-4',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Urban Campaign Shot',
      },
      {
        id: 'img-4-5',
        url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Brushed Cotton Interior',
      },
      {
        id: 'img-4-6',
        url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Full Streetwear Outfit',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "6'0\"",
      wearingSize: 'L',
      fitNote: 'Boxy drop-shoulder silhouette with cropped hem.',
    },
    completeLookIds: ['afz-002', 'afz-006'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
    color: 'Chalk White',
    colorHex: '#F8FAFC',
    shop: {
      name: 'Koramangala Threads',
      location: 'Koramangala, Blr',
      verified: true,
      rating: 4.7
    },
  },
  {
    id: 'afz-005',
    slug: 'oversized-poplin-studio-overshirt',
    name: 'OVERSIZED POPLIN STUDIO OVERSHIRT',
    tagline: 'Crisp 180 GSM Egyptian Giza Cotton with Angular Chest Flaps',
    collection: 'Monochrome — Studio Edition',
    category: 'tops',
    price: 2899,
    originalPrice: 3899,
    gsm: 180,
    fabric: '100% Long-Staple Egyptian Giza Poplin',
    fit: 'Oversized',
    description: 'Inspired by Japanese modernist studio workwear. Cut wide with an exaggerated back yoke pleat, dropped armholes, and dual geometric chest patch pockets that maintain sculptural sharpness.',
    features: [
      'High-thread count compact Giza weave with papery sheen',
      'Dual clean flap chest pockets with hidden snap closures',
      'Slight high-low hem with side slit gussets',
      'Double-stitched armscye for lasting structure',
    ],
    stylingTips: 'Wear open over a ribbed white tank with cropped pleated black trousers.',
    inventory: { S: 3, M: 5, L: 2, XL: 4, XXL: 1 },
    images: [
      {
        id: 'img-5-1',
        url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Studio Architectural Silhouette',
      },
      {
        id: 'img-5-2',
        url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Drape in Natural Light',
      },
      {
        id: 'img-5-3',
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Poplin Cotton Texture',
      },
      {
        id: 'img-5-4',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Dropped Armhole Detail',
      },
      {
        id: 'img-5-5',
        url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Layered Resort Look',
      },
      {
        id: 'img-5-6',
        url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Pure White Poplin Finish',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "6'2\"",
      wearingSize: 'L',
      fitNote: 'Exaggerated oversized cut. For standard fit, order one size down.',
    },
    completeLookIds: ['afz-002', 'afz-006', 'afz-007'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop',
    color: 'Pure Optical White',
    colorHex: '#FFFFFF',
    shop: {
      name: 'Sarojini Exclusive',
      location: 'Sarojini Nagar, Delhi',
      verified: true,
      rating: 4.6
    },
  },
  {
    id: 'afz-006',
    slug: 'minimalist-leather-chelsea-lug',
    name: 'MINIMALIST CALFSKIN CHELSEA BOOTS',
    tagline: 'Hand-Burnished Full-Grain Calfskin with Vibram Beveled Outsole',
    collection: 'Essentials — Footwear Drop',
    category: 'shoes',
    price: 5499,
    originalPrice: 7299,
    gsm: 0,
    fabric: '100% Full-Grain Italian Calfskin Leather',
    fit: 'Tailored',
    description: 'A seamless silhouette chiseled with clean rounded chisel toe, tonal elasticated side gussets, and Goodyear-welted construction designed to elevate both relaxed linens and razor-sharp tailoring.',
    features: [
      'Supple full-grain Italian calf leather that patinas beautifully',
      'Leather lining with ergonomic memory foam footbed',
      'Goodyear-welted resoleable construction',
      'Low-profile pull tab for effortless entry',
    ],
    stylingTips: 'The anchor for any high-fashion editorial ensemble.',
    inventory: { S: 2, M: 5, L: 4, XL: 3, XXL: 2 },
    images: [
      {
        id: 'img-6-1',
        url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Sculpted Chisel Toe',
      },
      {
        id: 'img-6-2',
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Leather Finish Profile',
      },
      {
        id: 'img-6-3',
        url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Gusset & Heel Detail',
      },
      {
        id: 'img-6-4',
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'On-Foot Look',
      },
      {
        id: 'img-6-5',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Full Pair View',
      },
      {
        id: 'img-6-6',
        url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Calfskin Texture Close-Up',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "N/A",
      wearingSize: '42 EU / 9 UK',
      fitNote: 'True to European luxury sizing.',
    },
    completeLookIds: ['afz-001', 'afz-002', 'afz-003'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1000&auto=format&fit=crop',
    color: 'Onyx Black',
    colorHex: '#18181B',
    shop: {
      name: 'The Thrift Garage',
      location: 'Bandra West, Mumbai',
      verified: true,
      rating: 4.8
    },
  },
  {
    id: 'afz-007',
    slug: 'sculpted-monochrome-wool-coat',
    name: 'SCULPTED MONOCHROME DOUBLE COAT',
    tagline: '680 GSM Double-Faced Virgin Wool with Raw Edge Finishing',
    collection: 'After Dark — Nocturne Drop',
    category: 'outerwear',
    price: 8999,
    originalPrice: 11999,
    gsm: 680,
    fabric: '90% Virgin Wool, 10% Cashmere',
    fit: 'Structured',
    description: 'An imposing, floor-sweeping statement piece. Double-faced virgin wool hand-stitched along edges, featuring broad notch lapels and an optional self-tie sash that accentuates waist geometry.',
    features: [
      'Unmatched thermal drape with zero bulk',
      'Dual deep welt waist pockets',
      'Center back vent for expansive motion',
      'Hidden horn button front closure',
    ],
    stylingTips: 'Drapes with aristocratic nonchalance over our silk shirts or linen trousers.',
    inventory: { S: 1, M: 3, L: 2, XL: 2, XXL: 0 },
    images: [
      {
        id: 'img-7-1',
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Full Runway Silhouette',
      },
      {
        id: 'img-7-2',
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Overcoat Profile Drape',
      },
      {
        id: 'img-7-3',
        url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Virgin Wool Weave Texture',
      },
      {
        id: 'img-7-4',
        url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Urban Winter Campaign',
      },
      {
        id: 'img-7-5',
        url: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Lapel & Button Stitch',
      },
      {
        id: 'img-7-6',
        url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Editorial Studio Pose',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "6'2\"",
      wearingSize: 'L',
      fitNote: 'Full-length cocoon silhouette designed for fluid layering.',
    },
    completeLookIds: ['afz-003', 'afz-002', 'afz-006'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
    color: 'Charcoal Slate',
    colorHex: '#1E293B',
    shop: {
      name: 'Street Drops',
      location: 'Hauz Khas, Delhi',
      verified: true,
      rating: 4.9
    },
  },
  {
    id: 'afz-008',
    slug: 'sterling-chiseled-cuff-bracelet',
    name: 'CHISELED STERLING 925 SILVER CUFF',
    tagline: 'Hand-Hammered Solid 925 Silver with Brushed Matte Patina',
    collection: 'Essentials — Artifacts',
    category: 'accessories',
    price: 1999,
    originalPrice: 2799,
    gsm: 0,
    fabric: 'Solid 925 Sterling Silver',
    fit: 'Tailored',
    description: 'A heavy, sculptural wrist cuff cast in solid sterling silver with an artisanal hand-beveled edge and discreet MITRENO monogram hallmark on the interior curvature.',
    features: [
      'Substantial 42g weight for tactile luxury weight',
      'Comfort-tapered edges that slide naturally against cuff fabric',
      'Anti-tarnish protective micro-coating',
      'Delivered in signature MITRENO suede presentation vault',
    ],
    stylingTips: 'The single subtle wrist accent every minimalist wardrobe demands.',
    inventory: { S: 8, M: 12, L: 9, XL: 5, XXL: 5 },
    images: [
      {
        id: 'img-8-1',
        url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Hand-Finished 925 Silver',
      },
      {
        id: 'img-8-2',
        url: 'https://images.unsplash.com/photo-1611591475178-5778a834e59c?q=80&w=1400&auto=format&fit=crop',
        angle: 'front',
        caption: 'Cuff Angle Reflection',
      },
      {
        id: 'img-8-3',
        url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1400&auto=format&fit=crop',
        angle: 'details',
        caption: 'Beveled Edge Detail',
      },
      {
        id: 'img-8-4',
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'On-Wrist Styled',
      },
      {
        id: 'img-8-5',
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1400&auto=format&fit=crop',
        angle: 'side',
        caption: 'Monogram Hallmark Close-Up',
      },
      {
        id: 'img-8-6',
        url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=1400&auto=format&fit=crop',
        angle: 'lifestyle',
        caption: 'Silver Artifact Vault View',
      },
    ],
    thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    tryOnModelUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop',
    modelInfo: {
      height: "N/A",
      wearingSize: 'Standard',
      fitNote: 'Adjustable tension open-cuff design.',
    },
    completeLookIds: ['afz-001', 'afz-003'],
    fabricCloseUpUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    color: 'Brushed Silver',
    colorHex: '#E2E8F0',
    shop: {
      name: 'Vintage Vault',
      location: 'Colaba, Mumbai',
      verified: false,
      rating: 4.5
    },
  },
];

export const RUNWAY_LOOKS: RunwayLook[] = [
  {
    id: 'runway-01',
    lookNumber: 'LOOK 01',
    season: 'SUMMER 26',
    title: 'THE LINEN EDIT',
    subtitle: 'Aero-Fit Structured Flax Shirt in Ivory Ecru',
    heroImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1600&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop',
    featuredProductId: 'afz-001',
    price: 2499,
    badge: 'DROP EXCLUSIVE',
    curationStory: 'Cut from double-ply Normandy flax, balancing Mediterranean ease with architectural rigor.',
  },
  {
    id: 'runway-02',
    lookNumber: 'LOOK 02',
    season: 'AFTER DARK',
    title: 'THE NOCTURNE SILK BLAZER',
    subtitle: 'Deconstructed Mulberry Silk-Wool Jacket in Midnight Eclipse',
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1600&auto=format&fit=crop',
    featuredProductId: 'afz-003',
    price: 6999,
    badge: 'EDITORIAL CAMPAIGN',
    curationStory: 'Weightless tailoring engineered with zero shoulder pads to respond organically to your frame.',
  },
  {
    id: 'runway-03',
    lookNumber: 'LOOK 03',
    season: 'MONOCHROME',
    title: 'PLEATED RESORT TROUSERS',
    subtitle: 'High-Twist Wool-Linen Blend with Double Deep Pleats',
    heroImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1600&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1600&auto=format&fit=crop',
    featuredProductId: 'afz-002',
    price: 3299,
    badge: 'BESTSELLER',
    curationStory: 'Fluid swaying volume with internal curtain waistband construction.',
  },
  {
    id: 'runway-04',
    lookNumber: 'LOOK 04',
    season: 'STUDIO EDITION',
    title: 'GIZA POPLIN OVERSHIRT',
    subtitle: '180 GSM Long-Staple Egyptian Cotton in Optical White',
    heroImage: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1600&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600&auto=format&fit=crop',
    featuredProductId: 'afz-005',
    price: 2899,
    badge: 'MODERNIST FIT',
    curationStory: 'Sculptural dropped armholes and geometric chest pockets inspired by Tokyo architects.',
  },
];

export const COLLECTIONS = [
  {
    id: 'new-season',
    name: 'New Season',
    subtitle: 'SS26 Editorial Runway Drops',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    itemsCount: 14,
  },
  {
    id: 'linen-edit',
    name: 'Linen Edit',
    subtitle: '240 GSM Pure European Flax',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop',
    itemsCount: 8,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    subtitle: 'Tonal Stark Contrast',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop',
    itemsCount: 11,
  },
  {
    id: 'after-dark',
    name: 'After Dark',
    subtitle: 'Mulberry Silk & Fine Wool',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    itemsCount: 7,
  },
  {
    id: 'oversized',
    name: 'Oversized',
    subtitle: 'Architectural Volumes & Drapes',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
    itemsCount: 9,
  },
  {
    id: 'essentials',
    name: 'Essentials',
    subtitle: 'Permanent Core Collection',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1200&auto=format&fit=crop',
    itemsCount: 12,
  },
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'journal-1',
    slug: 'the-art-of-linen',
    title: 'The Art of Linen: Why 240 GSM is the Golden Ratio for Men’s Drapes',
    category: 'FABRIC STORY',
    readTime: '4 MIN READ',
    publishedDate: 'AUGUST 2026',
    author: 'Editorial Studio',
    coverImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Linen has been celebrated for millennia, yet modern fast fashion reduced it to paper-thin, shapeless shirts. Here is how MITRENO engineered the architectural 240 GSM weave.',
    content: [
      'In traditional sartorial craftsmanship, weight defines stature. A shirt woven at 120 GSM will wrinkle uncontrollably within thirty minutes of wear, collapsing against the torso.',
      'MITRENO partnered with artisanal mills in Normandy to produce a custom double-twisted 240 GSM yarn. This precise density provides enough structural memory to hold sharp shoulder angles while the naturally hollow flax fibers facilitate continuous air convection.',
      'When paired with our AI Virtual Mirror, you can immediately preview how the dropped armhole falls against your natural posture without touching a single fitting room curtain.',
    ],
    featuredProductIds: ['afz-001', 'afz-002'],
  },
  {
    id: 'journal-2',
    slug: 'inside-the-oversized-movement',
    title: 'Inside the Oversized Movement: Proportions, Not Upsizing',
    category: 'STYLE ESSAY',
    readTime: '5 MIN READ',
    publishedDate: 'JULY 2026',
    author: 'Ashraf K., Creative Director',
    coverImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Buying two sizes up creates an ill-fitting garment. True oversized luxury requires redesigned neck openings, adjusted armhole depths, and calibrated hem drops.',
    content: [
      'The biggest misconception in menswear is that "oversized" simply means taking an XL pattern and labeling it as M. The result is always sloppy: collar gaps, sleeve cuffs drowning the hands, and an uncomplimentary silhouette.',
      'At MITRENO, every oversized piece begins with standard anatomical anchor points at the neck and wrist, then expands outward through the chest and torso in controlled geometric planes.',
      'Our Smart Fit Engine analyzes your uploaded avatar to ensure the shoulder seam lands at the intended 2.5-inch drop line.',
    ],
    featuredProductIds: ['afz-004', 'afz-005'],
  },
  {
    id: 'journal-3',
    slug: 'how-to-build-a-minimal-wardrobe',
    title: 'How to Build a 10-Piece Minimal Luxury Capsule',
    category: 'WARDROBE GUIDE',
    readTime: '6 MIN READ',
    publishedDate: 'JUNE 2026',
    author: 'MITRENO Styling Collective',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Ten deliberate garments capable of generating over 45 distinct luxury ensembles across daytime, travel, and gala evenings.',
    content: [
      'Curating a digital wardrobe is about mathematical modularity. Every top must pair harmoniously with at least three bottom silhouettes, anchored by unified neutral undertones.',
      'Start with two structured linen shirts, one sculpted silk-blend blazer, one heavy French terry piece, two pleated trousers, and our calfskin Chelsea boot.',
      'Use the MITRENO Digital Wardrobe Outfit Builder to auto-generate looks for unexpected calendar occasions in seconds.',
    ],
    featuredProductIds: ['afz-001', 'afz-002', 'afz-003', 'afz-006'],
  },
];
