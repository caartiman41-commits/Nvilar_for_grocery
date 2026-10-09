import { ProductDetailItem } from './types';

export const SAMPLE_PRODUCTS: Record<string, ProductDetailItem> = {
  "p1": {
    "id": "p1",
    "name": "Oversized Poplin Studio Overshirt",
    "boutiqueTag": "SAROJINI EXCLUSIVE",
    "price": 2899,
    "originalPrice": 3899,
    "discountPercent": 26,
    "badgeText": "LOWEST PRICE SINCE LAUNCH",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 6
      },
      {
        "size": "M",
        "stock": 4
      },
      {
        "size": "L",
        "stock": 2
      },
      {
        "size": "XL",
        "stock": 5
      },
      {
        "size": "XXL",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Sarojini Exclusive",
      "handle": "@sarojini.studio",
      "rating": 4.6,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 3299
      },
      {
        "day": "4d ago",
        "price": 3199
      },
      {
        "day": "2d ago",
        "price": 3099
      },
      {
        "day": "Yest",
        "price": 2999
      },
      {
        "day": "Today",
        "price": 2859,
        "isLowest": true
      }
    ],
    "sku": "AFZ-001",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Pure Optical White",
        "colorSwatch": "#FFFFFF"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Long-Staple Egyptian Cotton"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Oversized Fit"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "180 GSM Heavyweight"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Solid / Textured Weave"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Machine Wash Cold"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Casual / Evening Resort"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in India IN"
      }
    ],
    "productStory": "Crafted with premium high-density poplin cotton, this studio overshirt pairs effortless architectural drape with artisanal finishings. Hand-finished mother-of-pearl buttons and relaxed drop shoulders deliver timeless luxury across all seasons.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p2": {
    "id": "p2",
    "name": "Handcrafted Chikankari Mulmul Kurta",
    "boutiqueTag": "NVILAR BOUTIQUE",
    "price": 3500,
    "originalPrice": 5000,
    "discountPercent": 30,
    "badgeText": "BOUTIQUE MASTER CRAFT",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 3
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 1
      },
      {
        "size": "XL",
        "stock": 4
      },
      {
        "size": "XXL",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Nvilar.com",
      "handle": "@nvilar.official",
      "rating": 5,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 12 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 4200
      },
      {
        "day": "4d ago",
        "price": 3900
      },
      {
        "day": "2d ago",
        "price": 3750
      },
      {
        "day": "Yest",
        "price": 3600
      },
      {
        "day": "Today",
        "price": 3500,
        "isLowest": true
      }
    ],
    "sku": "AFZ-002",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Ivory Cream",
        "colorSwatch": "#FFFFF0"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Pure Fine Mulmul Cotton"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Relaxed Traditional Fit"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "120 GSM Breathable Weave"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Handmade Lucknowi Chikankari Embroidery"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Gentle Hand Wash / Dry Clean"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Festive / Traditional Celebration"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in Lucknow, India"
      }
    ],
    "productStory": "Each motif on this heirloom Chikankari kurta is individually hand-embroidered by generational artisans in old Lucknow. Utilizing ethereal mulmul cotton, it flows with graceful lightness while providing breathable day-long comfort.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p3": {
    "id": "p3",
    "name": "Chiseled Sterling 925 Vintage Ring",
    "boutiqueTag": "VINTAGE VAULT",
    "price": 1999,
    "originalPrice": 2799,
    "discountPercent": 29,
    "badgeText": "HALLMARKED 925 SILVER",
    "deliveryFeeText": "Free Express Delivery",
    "images": [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "US 7",
        "stock": 2
      },
      {
        "size": "US 8",
        "stock": 4
      },
      {
        "size": "US 9",
        "stock": 1
      },
      {
        "size": "US 10",
        "stock": 3
      },
      {
        "size": "US 11",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Vintage Vault",
      "handle": "@vintagevault.jewels",
      "rating": 4.5,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2499
      },
      {
        "day": "4d ago",
        "price": 2299
      },
      {
        "day": "2d ago",
        "price": 2199
      },
      {
        "day": "Yest",
        "price": 2099
      },
      {
        "day": "Today",
        "price": 1999,
        "isLowest": true
      }
    ],
    "sku": "AFZ-003",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Antique Oxidized Silver",
        "colorSwatch": "#C0C0C0"
      },
      {
        "key": "fabric",
        "label": "MATERIAL",
        "value": "92.5% Solid Sterling Silver"
      },
      {
        "key": "fit",
        "label": "FINISH",
        "value": "Hand-Chiseled Brushed Patina"
      },
      {
        "key": "density",
        "label": "WEIGHT",
        "value": "14.2 Grams Solid Weight"
      },
      {
        "key": "pattern",
        "label": "DESIGN",
        "value": "Engraved Gothic Floral Filigree"
      },
      {
        "key": "wash",
        "label": "CARE",
        "value": "Wipe with Microfiber Silver Cloth"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Everyday Streetwear / Formal Statement"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Handcrafted in Jaipur, India"
      }
    ],
    "productStory": "Cast from heavy 925 sterling silver, this signet ring features intricate hand-chiseled detailing along the band. Oxidized shadowing accentuates the gothic relief, delivering timeless artisanal weight for everyday statement styling.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p4": {
    "id": "p4",
    "name": "HEAVYWEIGHT BOX-FIT STREETWEAR HOODIE",
    "boutiqueTag": "NVILAR BOUTIQUE",
    "price": 2499,
    "originalPrice": 3499,
    "discountPercent": 29,
    "badgeText": "420 GSM CUSTOM FRENCH TERRY",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 4
      },
      {
        "size": "M",
        "stock": 2
      },
      {
        "size": "L",
        "stock": 1
      },
      {
        "size": "XL",
        "stock": 3
      },
      {
        "size": "XXL",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Nvilar.com",
      "handle": "@nvilar.official",
      "rating": 5,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 12 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2999
      },
      {
        "day": "4d ago",
        "price": 2799
      },
      {
        "day": "2d ago",
        "price": 2699
      },
      {
        "day": "Yest",
        "price": 2599
      },
      {
        "day": "Today",
        "price": 2499,
        "isLowest": true
      }
    ],
    "sku": "AFZ-004",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Washed Charcoal Black",
        "colorSwatch": "#2D3748"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Combed Ringspun Cotton"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Boxy Drop-Shoulder Oversized"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "420 GSM Heavy Brushed Fleece"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Pigment Washed Vintage Aesthetic"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Cold Machine Wash Inside Out"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Streetwear / Winter Daily Layering"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in Tirupur, India"
      }
    ],
    "productStory": "Engineered for a commanding silhouette, this hoodie features ultra-heavy 420 GSM brushed fleece with seamless ribbed cuffs and double-layered crossover hood. The vintage pigment wash lends it subtle faded highlights that age gracefully.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p5": {
    "id": "p5",
    "name": "VINTAGE CHAMBRAY WORKWEAR DENIM SHIRT",
    "boutiqueTag": "THE THRIFT GARAGE",
    "price": 1799,
    "originalPrice": 3599,
    "discountPercent": 50,
    "badgeText": "50% FLAT ARCHIVE SALE",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 2
      },
      {
        "size": "L",
        "stock": 1
      },
      {
        "size": "XL",
        "stock": 4
      },
      {
        "size": "XXL",
        "stock": 0
      }
    ],
    "seller": {
      "name": "The Thrift Garage",
      "handle": "@thriftgarage.vintage",
      "rating": 4.8,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2199
      },
      {
        "day": "4d ago",
        "price": 1999
      },
      {
        "day": "2d ago",
        "price": 1899
      },
      {
        "day": "Yest",
        "price": 1849
      },
      {
        "day": "Today",
        "price": 1799,
        "isLowest": true
      }
    ],
    "sku": "AFZ-005",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Washed Chambray Indigo",
        "colorSwatch": "#4682B4"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Slub Cotton Denim"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Relaxed Workwear Fit"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "7.5 oz Medium Weight"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Faded Stonewash with Dual Flap Pockets"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Machine Wash Separate Cold"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Heritage Casual / Weekend Layering"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in India IN"
      }
    ],
    "productStory": "A timeless homage to 1970s American workwear, cut from authentic slub-textured denim. Triple-needle chainstitching and horn buttons provide indestructible construction, while the artisanal stonewash feels broken-in from day one.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p6": {
    "id": "p6",
    "name": "JAPANESE SELVEDGE DARK RAW DENIM JEANS",
    "boutiqueTag": "VINTAGE VAULT",
    "price": 1899,
    "originalPrice": 4200,
    "discountPercent": 55,
    "badgeText": "55% OFF • KURABO MILL WEAVE",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "30",
        "stock": 3
      },
      {
        "size": "32",
        "stock": 1
      },
      {
        "size": "34",
        "stock": 2
      },
      {
        "size": "36",
        "stock": 4
      },
      {
        "size": "38",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Vintage Vault",
      "handle": "@vintagevault.jewels",
      "rating": 4.9,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2399
      },
      {
        "day": "4d ago",
        "price": 2199
      },
      {
        "day": "2d ago",
        "price": 2049
      },
      {
        "day": "Yest",
        "price": 1950
      },
      {
        "day": "Today",
        "price": 1899,
        "isLowest": true
      }
    ],
    "sku": "AFZ-006",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Raw Midnight Indigo",
        "colorSwatch": "#1A237E"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "14.5 oz Kurabo Shuttle-Loomed Denim"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Straight-Leg Classic Taper"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "14.5 oz Rigid Unwashed"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Red-Line Selvedge ID"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Soak In Cold Water / Dry Flat"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Raw Denim Purist / Urban Everyday"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Woven in Okayama, Hand-Sewn in India"
      }
    ],
    "productStory": "Woven on vintage Toyoda shuttle looms using pure ring-spun rope-dyed cotton yarns. Finished with a clean red-line selvedge edge, custom copper hardware, and hidden back-pocket rivets that produce world-class personal fades over years of wear.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p7": {
    "id": "p7",
    "name": "TERRACOTTA WAFFLE-KNIT RESORT POLO",
    "boutiqueTag": "STUDIO KERALA",
    "price": 2199,
    "originalPrice": 3299,
    "discountPercent": 33,
    "badgeText": "SUMMER RESORT EDIT",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 3
      },
      {
        "size": "L",
        "stock": 1
      },
      {
        "size": "XL",
        "stock": 4
      },
      {
        "size": "XXL",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Studio Kerala",
      "handle": "@studiokerala.co",
      "rating": 4.8,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2699
      },
      {
        "day": "4d ago",
        "price": 2499
      },
      {
        "day": "2d ago",
        "price": 2350
      },
      {
        "day": "Yest",
        "price": 2249
      },
      {
        "day": "Today",
        "price": 2199,
        "isLowest": true
      }
    ],
    "sku": "AFZ-007",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Rustic Terracotta Clay",
        "colorSwatch": "#C85A32"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Breathable Combed Cotton"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Relaxed Retro Camp Collar"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "220 GSM Textured Waffle"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Honeycomb Micro-Waffle Weave"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Gentle Machine Wash Cold"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Resort Holiday / Evening Lounge"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in Kochi, India"
      }
    ],
    "productStory": "A breezy homage to 1960s Riviera leisurewear. Features a structured camp Johnny collar with deep open placket, tailored from airy honeycomb waffle knit that regulates temperature while remaining effortlessly elevated.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p8": {
    "id": "p8",
    "name": "ARTISANAL HAND-WOVEN IKAT CO-ORD SET",
    "boutiqueTag": "JAIPUR ARTISANS",
    "price": 3899,
    "originalPrice": 5499,
    "discountPercent": 29,
    "badgeText": "HERITAGE HANDLOOM",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 2
      },
      {
        "size": "M",
        "stock": 4
      },
      {
        "size": "L",
        "stock": 1
      },
      {
        "size": "XL",
        "stock": 2
      },
      {
        "size": "XXL",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Jaipur Artisans",
      "handle": "@jaipur.artisans",
      "rating": 4.9,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 4499
      },
      {
        "day": "4d ago",
        "price": 4199
      },
      {
        "day": "2d ago",
        "price": 3999
      },
      {
        "day": "Yest",
        "price": 3950
      },
      {
        "day": "Today",
        "price": 3899,
        "isLowest": true
      }
    ],
    "sku": "AFZ-008",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Indigo & Ecru Ikat",
        "colorSwatch": "#2E4057"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Handspun Organic Khadi"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Relaxed Kimono Top with Wide-Leg Pants"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "160 GSM Handloom Weave"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Resist-Dyed Pochampally Ikat"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Dry Clean Recommended"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Art Gallery / Destination Weekend"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Handcrafted in Jaipur, India"
      }
    ],
    "productStory": "This two-piece co-ord set features traditional resist-dyed Ikat motifs individually aligned by hand on wooden shuttle looms. The oversized kimono-inspired overshirt combines with pleated wide-leg trousers for poetic architectural movement.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p9": {
    "id": "p9",
    "name": "ACID-WASH HEAVYWEIGHT OVERSIZED HOODIE",
    "boutiqueTag": "BOMBAY THREADS",
    "price": 2699,
    "originalPrice": 3999,
    "discountPercent": 32,
    "badgeText": "450 GSM HEAVY BRUSHED",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 4
      },
      {
        "size": "M",
        "stock": 1
      },
      {
        "size": "L",
        "stock": 3
      },
      {
        "size": "XL",
        "stock": 5
      },
      {
        "size": "XXL",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Bombay Threads",
      "handle": "@bombaythreads.in",
      "rating": 4.7,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 3299
      },
      {
        "day": "4d ago",
        "price": 2999
      },
      {
        "day": "2d ago",
        "price": 2849
      },
      {
        "day": "Yest",
        "price": 2750
      },
      {
        "day": "Today",
        "price": 2699,
        "isLowest": true
      }
    ],
    "sku": "AFZ-009",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Acid Mineral Slate",
        "colorSwatch": "#4A5568"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Combed Heavy Cotton"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Oversized Streetwear Silhouette"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "450 GSM Heavy French Terry"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Hand Acid Wash Mineral Effect"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Machine Wash Cold Inverted"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "High Street / Underground Club"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in Mumbai, India"
      }
    ],
    "productStory": "Subjected to custom ozone acid washing, each piece displays unique stone-dusted marble veins across a heavyweight 450 GSM chassis. Designed without front pouch pockets for clean minimalist draping and structured drop shoulders.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p10": {
    "id": "p10",
    "name": "MONOCHROME PLEATED RELAXED TROUSERS",
    "boutiqueTag": "TOKYO MINIMAL",
    "price": 1699,
    "originalPrice": 3499,
    "discountPercent": 51,
    "badgeText": "51% OFF • ARCHITECTURAL DRAPE",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "28",
        "stock": 2
      },
      {
        "size": "30",
        "stock": 4
      },
      {
        "size": "32",
        "stock": 1
      },
      {
        "size": "34",
        "stock": 5
      },
      {
        "size": "36",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Tokyo Minimal",
      "handle": "@tokyo.minimal",
      "rating": 4.9,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2199
      },
      {
        "day": "4d ago",
        "price": 1999
      },
      {
        "day": "2d ago",
        "price": 1849
      },
      {
        "day": "Yest",
        "price": 1749
      },
      {
        "day": "Today",
        "price": 1699,
        "isLowest": true
      }
    ],
    "sku": "AFZ-010",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Jet Black Matte",
        "colorSwatch": "#111827"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "70% Viscose, 30% Fine Poly High-Twist"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Wide Straight Leg with Deep Double Pleats"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "260 GSM Fluid Suiting"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Solid Tailored Finish"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Machine Wash Delicate / Hang Dry"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Formal Streetwear / Gallery Opening"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in New Delhi, India"
      }
    ],
    "productStory": "Taking direct inspiration from Tokyo runway tailoring, these trousers boast double front forward pleats that cascade down to a wide, fluid hem. High-twist yarn construction prevents wrinkles and ensures an elegant swing with every step.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p11": {
    "id": "p11",
    "name": "VINTAGE DISTRESSED CARGO UTILITY PANTS",
    "boutiqueTag": "THE THRIFT GARAGE",
    "price": 1899,
    "originalPrice": 3799,
    "discountPercent": 50,
    "badgeText": "50% OFF • 8-POCKET UTILITY",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "30",
        "stock": 6
      },
      {
        "size": "32",
        "stock": 2
      },
      {
        "size": "34",
        "stock": 1
      },
      {
        "size": "36",
        "stock": 4
      },
      {
        "size": "38",
        "stock": 0
      }
    ],
    "seller": {
      "name": "The Thrift Garage",
      "handle": "@thriftgarage.vintage",
      "rating": 4.7,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2399
      },
      {
        "day": "4d ago",
        "price": 2199
      },
      {
        "day": "2d ago",
        "price": 1999
      },
      {
        "day": "Yest",
        "price": 1949
      },
      {
        "day": "Today",
        "price": 1899,
        "isLowest": true
      }
    ],
    "sku": "AFZ-011",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Olive Military Drab",
        "colorSwatch": "#556B2F"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Heavy Duty Cotton Ripstop"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Baggy Relaxed Cargo Silhouette"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "310 GSM Tear-Resistant Ripstop"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Enzyme Stonewash with Subtle Distressing"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Machine Wash Cold Normal"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Urban Outdoor / Tactical Casual"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in India IN"
      }
    ],
    "productStory": "Built from genuine military-grade cotton ripstop, these utility cargo pants feature 8 expandable bellows pockets with matte brass snap fasteners. Hand-distressed pocket edges and hem drawcords allow easy stacking over bulky sneakers.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p12": {
    "id": "p12",
    "name": "SILK-BLEND RESORT MANDARIN SHIRT",
    "boutiqueTag": "GOA HOLIDAY CO.",
    "price": 1599,
    "originalPrice": 2499,
    "discountPercent": 36,
    "badgeText": "UNDER ₹1,999 SPECIAL",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 4
      },
      {
        "size": "M",
        "stock": 6
      },
      {
        "size": "L",
        "stock": 2
      },
      {
        "size": "XL",
        "stock": 3
      },
      {
        "size": "XXL",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Goa Holiday Co.",
      "handle": "@goaholiday.resort",
      "rating": 4.6,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 1999
      },
      {
        "day": "4d ago",
        "price": 1849
      },
      {
        "day": "2d ago",
        "price": 1749
      },
      {
        "day": "Yest",
        "price": 1650
      },
      {
        "day": "Today",
        "price": 1599,
        "isLowest": true
      }
    ],
    "sku": "AFZ-012",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Sage Mint Mist",
        "colorSwatch": "#A2B9A1"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "60% Mulberry Silk, 40% Organic Linen"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Relaxed Mandarin Collar Cut"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "110 GSM Ultra-Lightweight"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Slub Lustrous Texture"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Hand Wash Cold / Line Dry"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Tropical Resort / Sunset Dinner"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in Goa, India"
      }
    ],
    "productStory": "An exceptionally lightweight silk-linen blend woven to catch sea breezes. The minimal banded mandarin collar and curved shirttail hem create a sleek profile suited for warm coastal evenings or upscale casual brunches.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p13": {
    "id": "p13",
    "name": "RAW SELVEDGE TRUCKER DENIM JACKET",
    "boutiqueTag": "DENIM CRAFT CO.",
    "price": 4299,
    "originalPrice": 6999,
    "discountPercent": 38,
    "badgeText": "15 OZ RIGID RED-LINE SELVEDGE",
    "deliveryFeeText": "Free Express Delivery",
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 2
      },
      {
        "size": "M",
        "stock": 3
      },
      {
        "size": "L",
        "stock": 1
      },
      {
        "size": "XL",
        "stock": 2
      },
      {
        "size": "XXL",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Denim Craft Co.",
      "handle": "@denimcraft.lab",
      "rating": 5,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 12 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 4999
      },
      {
        "day": "4d ago",
        "price": 4699
      },
      {
        "day": "2d ago",
        "price": 4499
      },
      {
        "day": "Yest",
        "price": 4350
      },
      {
        "day": "Today",
        "price": 4299,
        "isLowest": true
      }
    ],
    "sku": "AFZ-013",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Deep Raw Indigo",
        "colorSwatch": "#182944"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "15 oz Japanese Shuttle-Loomed Denim"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Type III Boxy Trucker Fit"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "15 oz Heavy Rigidity"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Solid Raw with Contrast Gold Thread"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Dry Clean Only / Spot Clean"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Heritage Workwear / Outerwear Collector"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Crafted in Ahmedabad, India"
      }
    ],
    "productStory": "A masterclass in denim engineering. Constructed from stiff 15 oz unwashed red-line selvedge with heavy antique copper buttons, twin chest pockets, and button waist tabs. Designed to mold like armour to your physique over years of heavy wear.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p14": {
    "id": "p14",
    "name": "INDIGO OMBRE BOUTIQUE LINEN SHIRT",
    "boutiqueTag": "JAIPUR ARTISANS",
    "price": 1499,
    "originalPrice": 2999,
    "discountPercent": 50,
    "badgeText": "50% FLAT DIP-DYE DEAL",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 2
      },
      {
        "size": "L",
        "stock": 3
      },
      {
        "size": "XL",
        "stock": 1
      },
      {
        "size": "XXL",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Jaipur Artisans",
      "handle": "@jaipur.artisans",
      "rating": 4.8,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 1899
      },
      {
        "day": "4d ago",
        "price": 1749
      },
      {
        "day": "2d ago",
        "price": 1599
      },
      {
        "day": "Yest",
        "price": 1549
      },
      {
        "day": "Today",
        "price": 1499,
        "isLowest": true
      }
    ],
    "sku": "AFZ-014",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Gradient Indigo Ombre",
        "colorSwatch": "#3B5998"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Pure Organic French Flax Linen"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Tailored Resort Fit"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "145 GSM Pre-Softened"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Natural Indigo Vat Gradient Dip-Dye"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Cold Hand Wash with Mild Detergent"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Casual Everyday / Weekend Resort"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Handcrafted in Jaipur, India"
      }
    ],
    "productStory": "Each shirt is hand-dipped in organic indigo vats multiple times to create a seamless gradient transition from crisp ecru at the collar to rich cerulean at the hem. Cut from pre-washed French flax linen that gets softer with every wash.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p15": {
    "id": "p15",
    "name": "SUEDE EMBROIDERED BOMBER JACKET",
    "boutiqueTag": "VINTAGE VAULT",
    "price": 4899,
    "originalPrice": 7999,
    "discountPercent": 39,
    "badgeText": "GOLD SATIN LINED LUXURY",
    "deliveryFeeText": "Free Express Delivery",
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 1
      },
      {
        "size": "M",
        "stock": 3
      },
      {
        "size": "L",
        "stock": 2
      },
      {
        "size": "XL",
        "stock": 1
      },
      {
        "size": "XXL",
        "stock": 0
      }
    ],
    "seller": {
      "name": "Vintage Vault",
      "handle": "@vintagevault.jewels",
      "rating": 4.9,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 5899
      },
      {
        "day": "4d ago",
        "price": 5499
      },
      {
        "day": "2d ago",
        "price": 5199
      },
      {
        "day": "Yest",
        "price": 4999
      },
      {
        "day": "Today",
        "price": 4899,
        "isLowest": true
      }
    ],
    "sku": "AFZ-015",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Warm Camel Tan",
        "colorSwatch": "#C19A6B"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "High-Grade Velvet Micro-Suede"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Sleek Fitted Bomber Silhouette"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "380 GSM Heavy Outerweight"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Tonal Dragon Back Embroidery"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Specialist Leather & Suede Clean"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Evening Red Carpet / Luxury Night Out"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in New Delhi, India"
      }
    ],
    "productStory": "A showstopper outerwear piece crafted with velvety camel faux suede and lined in quilted gold champagne satin. Features subtle tonal chain-stitch embroidery across the rear yoke, heavy silver YKK zippers, and dense elastic ribbed trim.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p16": {
    "id": "p16",
    "name": "MINIMALIST CASHMERE-BLEND CARDIGAN",
    "boutiqueTag": "NORDIC STUDIO",
    "price": 1799,
    "originalPrice": 3999,
    "discountPercent": 55,
    "badgeText": "55% OFF • ULTRA-SOFT KNIT",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 4
      },
      {
        "size": "M",
        "stock": 1
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 2
      },
      {
        "size": "XXL",
        "stock": 3
      }
    ],
    "seller": {
      "name": "Nordic Studio",
      "handle": "@nordicstudio.luxe",
      "rating": 4.7,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2399
      },
      {
        "day": "4d ago",
        "price": 2199
      },
      {
        "day": "2d ago",
        "price": 1999
      },
      {
        "day": "Yest",
        "price": 1850
      },
      {
        "day": "Today",
        "price": 1799,
        "isLowest": true
      }
    ],
    "sku": "AFZ-016",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Heather Oatmeal Cream",
        "colorSwatch": "#D7C9B1"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "25% Mongolian Cashmere, 75% Fine Merino Wool"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Slouchy Dropped-Shoulder V-Neck"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "7-Gauge Chunky Knit"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Ribbed Knit with Genuine Horn Buttons"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Hand Wash Cold / Flat Dry on Towel"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Autumn Coffee Date / Cozy Travel"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Spun in Kashmir, India"
      }
    ],
    "productStory": "Plush, featherweight warmth spun from authentic Mongolian cashmere and fine extra-merino fleece. With dropped shoulders and deep real horn buttons, it provides a relaxed, sophisticated cocoon whether worn over bare skin or crisp shirting.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p17": {
    "id": "p17",
    "name": "HAND-BLOCK PRINTED CHANDERI DRESS",
    "boutiqueTag": "DELHI6 CO-ORD",
    "price": 3299,
    "originalPrice": 4899,
    "discountPercent": 33,
    "badgeText": "HAND-CARVED WOODBLOCK PRINT",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "XS",
        "stock": 2
      },
      {
        "size": "S",
        "stock": 3
      },
      {
        "size": "M",
        "stock": 1
      },
      {
        "size": "L",
        "stock": 4
      },
      {
        "size": "XL",
        "stock": 2
      }
    ],
    "seller": {
      "name": "Delhi6 Co-ord",
      "handle": "@delhi6.coord",
      "rating": 4.8,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 3999
      },
      {
        "day": "4d ago",
        "price": 3699
      },
      {
        "day": "2d ago",
        "price": 3499
      },
      {
        "day": "Yest",
        "price": 3350
      },
      {
        "day": "Today",
        "price": 3299,
        "isLowest": true
      }
    ],
    "sku": "AFZ-017",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Crimson Rose Floral",
        "colorSwatch": "#9E2A2B"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "Chanderi Silk-Cotton with Cotton Voile Lining"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Flared Tiered Midi Dress"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "130 GSM Semi-Sheer Luster"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Bagh Handblock Botanical Motif"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Gentle Dry Clean Only"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Festive Brunch / Mehendi Sundowner"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Crafted in Chanderi, MP, India"
      }
    ],
    "productStory": "Celebrating centuries of Central Indian heritage, this dress is spun with gossamer Chanderi silk and stamped by hand using carved teakwood blocks. The gold zari selvedge border adds radiant gleam under sunlight or candlelight.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p18": {
    "id": "p18",
    "name": "MODULAR MULTI-POCKET TACTICAL VEST",
    "boutiqueTag": "TOKYO MINIMAL",
    "price": 1399,
    "originalPrice": 2999,
    "discountPercent": 53,
    "badgeText": "53% OFF • CYBER TECHWEAR",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 4
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 2
      },
      {
        "size": "XL",
        "stock": 3
      },
      {
        "size": "XXL",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Tokyo Minimal",
      "handle": "@tokyo.minimal",
      "rating": 4.6,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 1899
      },
      {
        "day": "4d ago",
        "price": 1699
      },
      {
        "day": "2d ago",
        "price": 1549
      },
      {
        "day": "Yest",
        "price": 1449
      },
      {
        "day": "Today",
        "price": 1399,
        "isLowest": true
      }
    ],
    "sku": "AFZ-018",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Matte Stealth Black",
        "colorSwatch": "#0D0D0D"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "500D Waterproof Cordura Nylon"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Adjustable Modular Harness Vest"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "320 GSM High-Tensile Ballistic"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "MOLLE Webbing with D-Ring Hardware"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Wipe with Damp Cloth"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Techwear / Music Festivals / Daily EDC"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in Bangalore, India"
      }
    ],
    "productStory": "A cutting-edge techwear accessory featuring 6 compartmentalized compartments, detachable utility pouches, and heavy Fidlock magnetic buckles. Layers seamlessly over plain tees or heavyweight hoodies for a utilitarian cyberpunk silhouette.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p19": {
    "id": "p19",
    "name": "VINTAGE CORDUROY RELAXED WORK JACKET",
    "boutiqueTag": "THE THRIFT GARAGE",
    "price": 1899,
    "originalPrice": 3199,
    "discountPercent": 41,
    "badgeText": "UNDER ₹1,999 • HEAVY 8-WALE",
    "deliveryFeeText": "+₹99 Delivery Fee",
    "images": [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "S",
        "stock": 3
      },
      {
        "size": "M",
        "stock": 1
      },
      {
        "size": "L",
        "stock": 4
      },
      {
        "size": "XL",
        "stock": 2
      },
      {
        "size": "XXL",
        "stock": 0
      }
    ],
    "seller": {
      "name": "The Thrift Garage",
      "handle": "@thriftgarage.vintage",
      "rating": 4.8,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 24 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 2399
      },
      {
        "day": "4d ago",
        "price": 2199
      },
      {
        "day": "2d ago",
        "price": 2049
      },
      {
        "day": "Yest",
        "price": 1949
      },
      {
        "day": "Today",
        "price": 1899,
        "isLowest": true
      }
    ],
    "sku": "AFZ-019",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Deep Forest Green",
        "colorSwatch": "#2D5A27"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Cotton Chunky 8-Wale Corduroy"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "French Chore Coat Boxy Fit"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "340 GSM Heavy Ribbed Velvet"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Chunky Vertical Cord Wale with Tortoise Buttons"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Dry Clean or Gentle Cold Cycle"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Vintage Heritage / Autumn Streetwear"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Made in India IN"
      }
    ],
    "productStory": "Rooted in 1950s French atelier workwear, this chore jacket is tailored from wide 8-wale ribbed cotton corduroy in a rich forest green tone. Features three open patch pockets and genuine faux-tortoise buttons that evoke timeless craft.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  },
  "p20": {
    "id": "p20",
    "name": "DOUBLE-BREASTED LINEN SUMMER BLAZER",
    "boutiqueTag": "NVILAR BOUTIQUE",
    "price": 4499,
    "originalPrice": 6499,
    "discountPercent": 31,
    "badgeText": "UNSTRUCTURED LUXURY LINEN",
    "deliveryFeeText": "Free Express Delivery",
    "images": [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&auto=format&fit=crop&q=80"
    ],
    "sizes": [
      {
        "size": "38R",
        "stock": 2
      },
      {
        "size": "40R",
        "stock": 4
      },
      {
        "size": "42R",
        "stock": 1
      },
      {
        "size": "44R",
        "stock": 3
      },
      {
        "size": "46R",
        "stock": 1
      }
    ],
    "seller": {
      "name": "Nvilar.com",
      "handle": "@nvilar.official",
      "rating": 5,
      "verified": true,
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      "dispatchesIn": "Dispatches in 12 Hours"
    },
    "delivery": {
      "pincode": "110001",
      "city": "Guwahati (Nearby)",
      "tag": "HYPERLOCAL",
      "timeframe": "Today Delivery (30–60 Min Express)",
      "isNearDistance": true,
      "fee": 99
    },
    "priceHistory": [
      {
        "day": "6d ago",
        "price": 5499
      },
      {
        "day": "4d ago",
        "price": 5099
      },
      {
        "day": "2d ago",
        "price": 4799
      },
      {
        "day": "Yest",
        "price": 4599
      },
      {
        "day": "Today",
        "price": 4499,
        "isLowest": true
      }
    ],
    "sku": "AFZ-020",
    "specifications": [
      {
        "key": "color",
        "label": "COLOR",
        "value": "Sandstone Warm Beige",
        "colorSwatch": "#D4C5B9"
      },
      {
        "key": "fabric",
        "label": "FABRIC & MATERIAL",
        "value": "100% Belgian Flax Organic Linen"
      },
      {
        "key": "fit",
        "label": "FIT SILHOUETTE",
        "value": "Double-Breasted Unstructured Soft Shoulder"
      },
      {
        "key": "density",
        "label": "FABRIC DENSITY",
        "value": "240 GSM Slub Weave"
      },
      {
        "key": "pattern",
        "label": "PATTERN",
        "value": "Natural Slub Texture with Peak Lapels"
      },
      {
        "key": "wash",
        "label": "WASH CARE",
        "value": "Dry Clean Only"
      },
      {
        "key": "occasion",
        "label": "OCCASION",
        "value": "Destination Wedding / Summer Formal"
      },
      {
        "key": "country",
        "label": "COUNTRY OF ORIGIN",
        "value": "Tailored in New Delhi, India"
      }
    ],
    "productStory": "An unstructured double-breasted jacket tailored from pure Belgian flax linen. Without stiff canvas padding, it drapes naturally around the torso, offering peak breathability and sprezzatura flair for summer destination events.",
    "policies": [
      {
        "id": "pol_1",
        "title": "24h Cancel",
        "subtitle": "Terms Apply",
        "iconName": "clock-time-four-outline"
      },
      {
        "id": "pol_2",
        "title": "7-Day Return",
        "subtitle": "Free Pick-up",
        "iconName": "restore"
      },
      {
        "id": "pol_3",
        "title": "Cash on Delivery",
        "subtitle": "Available",
        "iconName": "cash"
      }
    ]
  }
};

export const getProductDetailById = (
  id: string,
  fallbackName?: string,
  fallbackPrice?: number,
  fallbackImage?: string,
  fallbackBoutique?: string
): ProductDetailItem => {
  if (id && SAMPLE_PRODUCTS[id]) {
    return SAMPLE_PRODUCTS[id];
  }

  // Intelligent keyword matching for fashion catalogue items
  const query = `${id || ''} ${fallbackName || ''}`.toLowerCase();
  if (query.includes('poplin') || query.includes('overshirt') || query.includes('sarojini')) {
    return SAMPLE_PRODUCTS['p1'];
  }
  if (query.includes('chikankari') || query.includes('kurta')) {
    return SAMPLE_PRODUCTS['p2'];
  }
  if (query.includes('silver') || query.includes('ring')) {
    return SAMPLE_PRODUCTS['p3'];
  }
  if (query.includes('hoodie') || query.includes('streetwear')) {
    return SAMPLE_PRODUCTS['p4'];
  }
  if (query.includes('chambray') || query.includes('denim')) {
    return SAMPLE_PRODUCTS['p5'];
  }
  if (query.includes('linen')) {
    return SAMPLE_PRODUCTS['p6'] || SAMPLE_PRODUCTS['p1'];
  }

  // Check if fallbackName matches any sample product name
  if (fallbackName) {
    const fnLower = fallbackName.toLowerCase();
    for (const key of Object.keys(SAMPLE_PRODUCTS)) {
      if (
        SAMPLE_PRODUCTS[key].name.toLowerCase().includes(fnLower) ||
        fnLower.includes(SAMPLE_PRODUCTS[key].name.toLowerCase())
      ) {
        return SAMPLE_PRODUCTS[key];
      }
    }
  }

  // Dynamic fallback generator preserving whatever user tapped from HomeScreen
  return {
    id: id || 'p1',
    name: fallbackName || 'OVERSIZED POPLIN STUDIO OVERSHIRT',
    boutiqueTag: (fallbackBoutique || 'SAROJINI EXCLUSIVE').toUpperCase(),
    price: fallbackPrice || 2899,
    originalPrice: fallbackPrice ? Math.round(fallbackPrice * 1.35) : 3899,
    discountPercent: 26,
    badgeText: 'LOWEST PRICE SINCE LAUNCH',
    deliveryFeeText: '+₹99 Delivery Fee',
    images: [
      fallbackImage || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80',
    ],
    sizes: [
      { size: 'S', stock: 6 },
      { size: 'M', stock: 4 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 5 },
      { size: 'XXL', stock: 1 },
    ],
    seller: {
      name: fallbackBoutique || 'Sarojini Exclusive',
      handle: `@${(fallbackBoutique || 'sarojini').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      rating: 4.6,
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      dispatchesIn: 'Dispatches in 24 Hours',
    },
    delivery: {
      pincode: '110001',
      city: 'Guwahati (Nearby)',
      tag: 'HYPERLOCAL',
      timeframe: 'Today Delivery (30–60 Min Express)',
      isNearDistance: true,
      fee: 99,
    },
    priceHistory: [
      { day: '6d ago', price: fallbackPrice ? Math.round(fallbackPrice * 1.15) : 3299 },
      { day: '4d ago', price: fallbackPrice ? Math.round(fallbackPrice * 1.1) : 3199 },
      { day: '2d ago', price: fallbackPrice ? Math.round(fallbackPrice * 1.05) : 3099 },
      { day: 'Yest', price: fallbackPrice ? fallbackPrice : 2999 },
      { day: 'Today', price: fallbackPrice ? Math.round(fallbackPrice * 0.98) : 2859, isLowest: true },
    ],
    sku: `AFZ-${id.replace('p', '00')}`,
    specifications: [
      { key: 'color', label: 'COLOR', value: 'Pure Optical White', colorSwatch: '#FFFFFF' },
      { key: 'fabric', label: 'FABRIC & MATERIAL', value: '100% Long-Staple Egyptian Cotton' },
      { key: 'fit', label: 'FIT SILHOUETTE', value: 'Oversized Fit' },
      { key: 'density', label: 'FABRIC DENSITY', value: '180 GSM Heavyweight' },
      { key: 'pattern', label: 'PATTERN', value: 'Solid / Textured Weave' },
      { key: 'wash', label: 'WASH CARE', value: 'Machine Wash Cold' },
      { key: 'occasion', label: 'OCCASION', value: 'Casual / Evening Resort' },
      { key: 'country', label: 'COUNTRY OF ORIGIN', value: 'Made in India IN' },
    ],
    productStory: 'Crafted with premium high-density poplin cotton, this studio overshirt pairs effortless architectural drape with artisanal finishings. Hand-finished mother-of-pearl buttons and relaxed drop shoulders deliver timeless luxury across all seasons.',
    policies: [
      { id: 'pol_1', title: '24h Cancel', subtitle: 'Terms Apply', iconName: 'clock-time-four-outline' },
      { id: 'pol_2', title: '7-Day Return', subtitle: 'Free Pick-up', iconName: 'restore' },
      { id: 'pol_3', title: 'Cash on Delivery', subtitle: 'Available', iconName: 'cash' },
    ],
  };
};
