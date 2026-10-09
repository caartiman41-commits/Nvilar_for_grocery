// lib/geolocation.ts
// Advanced Geolocation & Delivery ETA Engine for Nvilar

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  locality?: string;
}

export interface DeliveryPromise {
  tier: 'today' | 'tomorrow' | 'standard';
  headline: string;
  subline: string;
  etaDate: string;
  distanceKm: number;
  isNearby: boolean; // <= 9.0 km
  calculationMethod: 'google_maps_road' | 'geodesic_radius';
  badgeColor: 'emerald' | 'blue' | 'neutral';
}

// Default benchmark center: Guwahati Zoo Road (near JOIHH boutique in Fancy Bazaar / Central Guwahati)
export const DEFAULT_USER_COORDS: Coordinates = {
  latitude: 26.1722,
  longitude: 91.7761,
  city: 'Guwahati',
  locality: 'Zoo Road',
};

// Default store coordinates (JOIHH / Central Boutique)
export const DEFAULT_STORE_COORDS: Coordinates = {
  latitude: 26.1859,
  longitude: 91.7454,
  city: 'Guwahati',
  locality: 'Fancy Bazaar',
};

/**
 * Request high-accuracy user location using browser GPS/Network/Cell Tower/WiFi
 */
export async function getHighAccuracyUserLocation(): Promise<Coordinates> {
  if (typeof window === 'undefined') return DEFAULT_USER_COORDS;

  // 1. Check cached location from this session
  try {
    const cached = localStorage.getItem('mitreno_user_gps');
    if (cached) {
      const parsed = JSON.parse(cached);
      const timestamp = parsed._cachedAt || 0;
      // Valid for 30 minutes
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage errors
  }

  // 2. Request native HTML5 Geolocation with maximum accuracy
  if (!navigator.geolocation) {
    return DEFAULT_USER_COORDS;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          city: 'Guwahati',
          locality: 'Doorstep Location',
        };

        try {
          localStorage.setItem(
            'mitreno_user_gps',
            JSON.stringify({ ...coords, _cachedAt: Date.now() })
          );
        } catch (e) {}

        resolve(coords);
      },
      (error) => {
        console.warn('[Geolocation] High accuracy lookup fallback:', error.message);
        resolve(DEFAULT_USER_COORDS);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate distance between two coordinates
 * 1. Road distance via Google Maps Distance Matrix API (if API key available)
 * 2. Fallback to Haversine Geodesic Radius formula
 */
export async function calculateDistanceKm(
  origin: Coordinates,
  destination: Coordinates,
  googleMapsApiKey?: string
): Promise<{ distanceKm: number; method: 'google_maps_road' | 'geodesic_radius' }> {
  const apiKey =
    googleMapsApiKey ||
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : '');

  // 1. If Google Maps API key is configured, use Road Driving Distance
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${apiKey}&mode=driving`;
      const res = await fetch(url);
      const data = await res.json();
      if (
        data.status === 'OK' &&
        data.rows?.[0]?.elements?.[0]?.status === 'OK'
      ) {
        const meters = data.rows[0].elements[0].distance.value;
        const km = Number((meters / 1000).toFixed(1));
        return { distanceKm: km, method: 'google_maps_road' };
      }
    } catch (err) {
      console.warn('[Geolocation] Google Maps API error, falling back to Geodesic radius:', err);
    }
  }

  // 2. Haversine Aerial / Radius Calculation
  const haversineKm = calculateHaversineDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  // Apply urban road factor of 1.22x for road trajectory estimate
  const estimatedRoadKm = Number((haversineKm * 1.22).toFixed(1));
  return { distanceKm: estimatedRoadKm, method: 'geodesic_radius' };
}

/**
 * Standard Haversine formula (Great-circle distance)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Evaluate Flipkart-style Delivery Promise based on Distance from Shop
 */
export function getDeliveryPromise(
  distanceKm: number,
  method: 'google_maps_road' | 'geodesic_radius' = 'geodesic_radius'
): DeliveryPromise {
  if (distanceKm <= 9.0) {
    return {
      tier: 'today',
      headline: '⚡ Today Delivery',
      subline: 'Express doorstep delivery today • Verified Local Boutique',
      etaDate: 'Today (30–60 Min Express)',
      distanceKm,
      isNearby: true,
      calculationMethod: method,
      badgeColor: 'emerald',
    };
  } else if (distanceKm <= 30.0) {
    return {
      tier: 'tomorrow',
      headline: '⚡ Tomorrow Delivery',
      subline: 'Next-day intra-city priority delivery',
      etaDate: 'Tomorrow',
      distanceKm,
      isNearby: false,
      calculationMethod: method,
      badgeColor: 'blue',
    };
  } else {
    return {
      tier: 'standard',
      headline: 'Standard Delivery',
      subline: 'Surface / Air linehaul delivery within 2–4 days',
      etaDate: 'Within 2–4 Days',
      distanceKm,
      isNearby: false,
      calculationMethod: method,
      badgeColor: 'neutral',
    };
  }
}
