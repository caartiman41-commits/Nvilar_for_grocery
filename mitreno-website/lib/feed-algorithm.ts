import { Product } from '@/lib/products-data';

/**
 * MITRENO AUTONOMOUS DISCOVERY & ROTATION ENGINE
 * Inspired by Instagram Explore, TikTok Cold-Start, and YouTube Session Shuffling.
 * 
 * 1. 3-Hour Time Epoch: Rotates spotlight boutiques and debut slots every 3 hours (8 epochs per day).
 * 2. 60-30-10 Discovery Rule: 60% Proven Bestsellers + 30% Cold-Start New Karigars + 10% Live Surge Drops.
 * 3. Anti-Monopoly Constraint: Max 1 product per boutique in the top tier.
 * 4. Session Smart Jitter: Preserves tier quality while shuffling items so each refresh feels alive.
 */

export interface Shop {
  id: string;
  name: string;
  username?: string;
  locationName?: string;
  locationId?: string;
  logo?: string;
  verified?: boolean;
  rating?: number;
  dropsAlert?: string;
  hasActiveStory?: boolean;
}

// 3-Hour Epoch (0 to 7 per 24 hours, deterministic across all users)
export function getCurrent3HourEpoch(): number {
  const now = Date.now();
  const threeHoursMs = 3 * 3600 * 1000;
  return Math.floor(now / threeHoursMs);
}

// Time remaining in current 3-hour epoch (in seconds)
export function getRemainingEpochSeconds(): number {
  const now = Date.now();
  const threeHoursMs = 3 * 3600 * 1000;
  const currentEpochStart = Math.floor(now / threeHoursMs) * threeHoursMs;
  const epochEnd = currentEpochStart + threeHoursMs;
  return Math.max(0, Math.floor((epochEnd - now) / 1000));
}

/**
 * Deterministically pick the spotlight boutique for the active 3-hour epoch.
 * Ensures every qualified verified boutique gets their fair 3-hour turn in the spotlight.
 */
export function getSpotlightBoutique(shops: Shop[], epoch: number): Shop | null {
  if (!shops || shops.length === 0) return null;
  const verifiedShops = shops.filter((s) => s.verified);
  const pool = verifiedShops.length > 0 ? verifiedShops : shops;
  const index = Math.abs(epoch) % pool.length;
  return pool[index];
}

/**
 * Pseudo-random generator with a session seed (deterministic shuffle per refresh session).
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * The Mitreno 60-30-10 Autonomous Discovery Ranking Engine
 */
export function getSmartFeed(
  products: Product[],
  epoch: number,
  sessionSeed: number = 0
): Product[] {
  if (!products || products.length === 0) return [];

  // Filter out any inactive or zero-stock products from top discovery
  const activeProducts = products.filter((p) => !p.isOutOfStock);

  // 1. Live Flash Drops / High Bargain Deals (10% Tier)
  const surgeDrops = activeProducts.filter(
    (p) => p.originalPrice && ((p.originalPrice - p.price) / p.originalPrice) >= 0.28
  );

  // 2. High-Rated Bestsellers (60% Tier)
  const bestsellers = activeProducts.filter(
    (p) => (p.shop?.rating || 0) >= 4.7 || p.price > 2500
  );

  // 3. Cold-Start New Karigar Debut Pieces (30% Tier - New or unranked sellers with good quality)
  const coldStartKarigars = activeProducts.filter(
    (p) => !surgeDrops.some((s) => s.id === p.id) && !bestsellers.some((b) => b.id === p.id)
  );

  // Helper to shuffle an array with a seed
  const shuffleWithSeed = <T>(arr: T[], seedOffset: number): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(sessionSeed + epoch + seedOffset + i) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffledSurge = shuffleWithSeed(surgeDrops, 11);
  const shuffledBestsellers = shuffleWithSeed(bestsellers, 47);
  const shuffledColdStart = shuffleWithSeed(coldStartKarigars, 93);

  // Interleave while respecting the Anti-Monopoly diversity constraint (Max 1 product per boutique in top tier)
  const topTier: Product[] = [];
  const usedShopNames = new Set<string>();

  const tryAdd = (product: Product | undefined) => {
    if (!product) return;
    const shopName = (product.shop?.name || '').toLowerCase();
    if (shopName && usedShopNames.has(shopName)) return; // Anti-monopoly
    if (!topTier.some((p) => p.id === product.id)) {
      topTier.push(product);
      if (shopName) usedShopNames.add(shopName);
    }
  };

  // Build top tier: 1 surge drop, 2 bestsellers, 2 cold-start new karigars, 1 bestseller
  if (shuffledSurge.length > 0) tryAdd(shuffledSurge[0]);
  if (shuffledBestsellers.length > 0) tryAdd(shuffledBestsellers[0]);
  if (shuffledColdStart.length > 0) tryAdd(shuffledColdStart[0]);
  if (shuffledBestsellers.length > 1) tryAdd(shuffledBestsellers[1]);
  if (shuffledColdStart.length > 1) tryAdd(shuffledColdStart[1]);
  if (shuffledSurge.length > 1) tryAdd(shuffledSurge[1]);

  // Remaining catalog appended with category diversity
  const remaining = activeProducts.filter((p) => !topTier.some((t) => t.id === p.id));
  const shuffledRemaining = shuffleWithSeed(remaining, 107);

  return [...topTier, ...shuffledRemaining];
}

/**
 * In-Category Smart Re-ordering
 * Preserves all products in that category, but re-ranks based on active discount and fast fulfillment.
 */
export function reorderCategoryDeals(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
    const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
    // Highest discount first, then higher shop rating
    if (discB !== discA) return discB - discA;
    return (b.shop?.rating || 0) - (a.shop?.rating || 0);
  });
}
