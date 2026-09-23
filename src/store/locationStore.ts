import { create } from 'zustand';
import { LocationData } from '../services/LocationService';

interface LocationState {
  currentLocation: LocationData | null;
  setLocation: (location: LocationData) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  setLocation: (location) => set({ currentLocation: location }),
  clearLocation: () => set({ currentLocation: null }),
}));
