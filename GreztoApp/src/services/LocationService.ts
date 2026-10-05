import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export interface LocationData {
  latitude: number;
  longitude: number;
  addressTitle: string;
  addressSubtitle: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization('whenInUse');
    return auth === 'granted';
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Mitreno needs access to your location to show relevant products.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return false;
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    // Attempt 1: High Accuracy (GPS)
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('GPS High Accuracy failed. Falling back to Network location...', error.message);
        // Attempt 2: Fallback to Network (Low Accuracy)
        Geolocation.getCurrentPosition(
          (fallbackPosition) => {
            resolve({
              latitude: fallbackPosition.coords.latitude,
              longitude: fallbackPosition.coords.longitude,
            });
          },
          (fallbackError) => {
            reject(fallbackError);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  });
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<{ title: string; subtitle: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MitrenoApp/1.0',
        },
      }
    );
    const data = await response.json();

    if (data && data.address) {
      const { house_number, road, neighbourhood, suburb, city, town, postcode } = data.address;
      
      const titleParts = [house_number, road].filter(Boolean);
      const title = titleParts.length > 0 ? titleParts.join(' ') : (neighbourhood || suburb || city || 'Unknown Location');
      
      const subtitleParts = [suburb || neighbourhood || town || city, postcode].filter(Boolean);
      const subtitle = subtitleParts.join(', ');

      return {
        title,
        subtitle: subtitle || 'Location details unavailable',
      };
    }
    return { title: 'Unknown Location', subtitle: 'Could not fetch address details' };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { title: 'Location Error', subtitle: 'Could not connect to geocoding service' };
  }
};
