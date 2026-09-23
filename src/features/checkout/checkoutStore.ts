import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CheckoutAddress {
  id: string;
  state: string;
  gpsLocation: string;
  pincode: string;
  cityVillage: string;
  district?: string;
  houseNoName: string;
  flatHouseStreet?: string;
  nearbyArea: string;
  yourName: string;
  phone?: string;
  alternatePhone?: string;
  addressType?: 'HOME' | 'WORK' | 'OTHER';
  distance?: string;
}

export interface CheckoutState {
  addresses: CheckoutAddress[];
  draftAddress: CheckoutAddress;
  selectedAddressId: string | null;
  setDraftField: (field: keyof CheckoutAddress, value: any) => void;
  saveDraftAsNew: () => void;
  updateDraftAsExisting: (id: string) => void;
  deleteAddress: (id: string) => void;
  loadAddressIntoDraft: (id: string) => void;
  resetDraft: () => void;
  setSelectedAddressId: (id: string) => void;
}

export const initialAddresses: CheckoutAddress[] = [];

const defaultDraft: CheckoutAddress = {
  id: '',
  state: '',
  gpsLocation: '',
  pincode: '',
  cityVillage: '',
  houseNoName: '',
  nearbyArea: '',
  yourName: '',
  phone: '',
  alternatePhone: '',
  addressType: 'HOME',
  distance: '',
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      addresses: initialAddresses,
      draftAddress: defaultDraft,
      selectedAddressId: initialAddresses[0]?.id || null,
      
      setDraftField: (field, value) => 
        set((state) => ({
          draftAddress: { ...state.draftAddress, [field]: value }
        })),
        
      saveDraftAsNew: () => {
        const { draftAddress, addresses } = get();
        const newId = Date.now().toString();
        const newAddress = { ...draftAddress, id: newId };
        set({ 
          addresses: [newAddress, ...addresses],
          draftAddress: defaultDraft,
          selectedAddressId: newId,
        });
      },
      
      updateDraftAsExisting: (id) => {
        const { draftAddress, addresses } = get();
        set({
          addresses: addresses.map(addr => addr.id === id ? { ...draftAddress, id } : addr),
          draftAddress: defaultDraft,
        });
      },

      deleteAddress: (id) => {
        const { addresses, selectedAddressId } = get();
        const filtered = addresses.filter(a => a.id !== id);
        set({
          addresses: filtered,
          selectedAddressId: selectedAddressId === id ? (filtered[0]?.id || null) : selectedAddressId,
        });
      },
      
      loadAddressIntoDraft: (id) => {
        const { addresses } = get();
        const found = addresses.find(a => a.id === id);
        if (found) {
          set({ draftAddress: { ...found } });
        }
      },
      
      resetDraft: () => set({ draftAddress: defaultDraft }),
      
      setSelectedAddressId: (id) => set({ selectedAddressId: id }),
    }),
    {
      name: 'checkout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.addresses || state.addresses.length === 0)) {
          state.addresses = initialAddresses;
          state.selectedAddressId = initialAddresses[0]?.id || null;
        }
      },
    }
  )
);
