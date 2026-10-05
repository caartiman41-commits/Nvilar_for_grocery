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
  setDefaultAddress: (id: string) => void;
  fetchAddressesFromBackend: (phone?: string) => Promise<void>;
}

export const defaultAshrafAddress: CheckoutAddress = {
  id: 'addr_ashraf_sixmile',
  state: 'Assam',
  gpsLocation: '26.134456, 91.813250',
  pincode: '781005',
  cityVillage: 'Six Mile',
  houseNoName: 'Six Mile',
  flatHouseStreet: 'Six Mile, Six Mile, 781005, Six Mile, Assam, 781005',
  nearbyArea: 'Six Mile, 781005',
  yourName: 'ASHAFUL ISLAM',
  phone: '9864975438',
  alternatePhone: '',
  addressType: 'HOME',
  distance: '0m',
};

export const initialAddresses: CheckoutAddress[] = [defaultAshrafAddress];

const defaultDraft: CheckoutAddress = {
  id: '',
  state: 'Assam',
  gpsLocation: '26.134456, 91.813250',
  pincode: '781005',
  cityVillage: 'Six Mile',
  houseNoName: '',
  nearbyArea: '',
  yourName: 'ASHAFUL ISLAM',
  phone: '9864975438',
  alternatePhone: '',
  addressType: 'HOME',
  distance: '0m',
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      addresses: initialAddresses,
      draftAddress: defaultDraft,
      selectedAddressId: initialAddresses[0]?.id || null,

      setDraftField: (field, value) =>
        set((state) => ({
          draftAddress: { ...state.draftAddress, [field]: value },
        })),

      saveDraftAsNew: () => {
        const { draftAddress, addresses } = get();
        const newId = `addr_${Date.now()}`;
        const formattedFull = [
          draftAddress.houseNoName,
          draftAddress.nearbyArea,
          draftAddress.cityVillage,
          draftAddress.state,
          draftAddress.pincode,
        ]
          .filter(Boolean)
          .join(', ');

        const newAddress: CheckoutAddress = {
          ...draftAddress,
          id: newId,
          flatHouseStreet: formattedFull || draftAddress.flatHouseStreet,
          distance: draftAddress.distance || '0m',
        };

        set({
          addresses: [newAddress, ...addresses],
          draftAddress: defaultDraft,
          selectedAddressId: newId,
        });

        // Background sync to Go Backend PostgreSQL
        try {
          const { apiClient } = require('../../api/client');
          apiClient
            .post('/user/addresses', {
              id: newAddress.id,
              phone: newAddress.phone || '9864975438',
              recipient_name: newAddress.yourName || 'ASHAFUL ISLAM',
              house_no_street: newAddress.houseNoName,
              nearby_area: newAddress.nearbyArea,
              city_village: newAddress.cityVillage,
              state: newAddress.state,
              pincode: newAddress.pincode,
              alternate_phone: newAddress.alternatePhone,
              address_type: newAddress.addressType || 'HOME',
              gps_location: newAddress.gpsLocation || '26.134456, 91.813250',
              distance: newAddress.distance || '0m',
              is_default: true,
            })
            .catch(() => {});
        } catch {}
      },

      updateDraftAsExisting: (id) => {
        const { draftAddress, addresses } = get();
        const formattedFull = [
          draftAddress.houseNoName,
          draftAddress.nearbyArea,
          draftAddress.cityVillage,
          draftAddress.state,
          draftAddress.pincode,
        ]
          .filter(Boolean)
          .join(', ');

        const updated = addresses.map((addr) =>
          addr.id === id
            ? {
                ...draftAddress,
                id,
                flatHouseStreet: formattedFull || draftAddress.flatHouseStreet,
              }
            : addr
        );

        set({
          addresses: updated,
          draftAddress: defaultDraft,
          selectedAddressId: id,
        });

        // Background sync to backend
        try {
          const { apiClient } = require('../../api/client');
          apiClient
            .put(`/user/addresses/${id}`, {
              recipient_name: draftAddress.yourName,
              phone: draftAddress.phone,
              house_no_street: draftAddress.houseNoName,
              nearby_area: draftAddress.nearbyArea,
              city_village: draftAddress.cityVillage,
              state: draftAddress.state,
              pincode: draftAddress.pincode,
              alternate_phone: draftAddress.alternatePhone,
              address_type: draftAddress.addressType || 'HOME',
              gps_location: draftAddress.gpsLocation,
            })
            .catch(() => {});
        } catch {}
      },

      deleteAddress: (id) => {
        const { addresses, selectedAddressId } = get();
        const filtered = addresses.filter((a) => a.id !== id);
        set({
          addresses: filtered,
          selectedAddressId:
            selectedAddressId === id
              ? filtered[0]?.id || null
              : selectedAddressId,
        });

        try {
          const { apiClient } = require('../../api/client');
          apiClient.delete(`/user/addresses/${id}`).catch(() => {});
        } catch {}
      },

      loadAddressIntoDraft: (id) => {
        const { addresses } = get();
        const found = addresses.find((a) => a.id === id);
        if (found) {
          set({ draftAddress: { ...found } });
        }
      },

      resetDraft: () => set({ draftAddress: defaultDraft }),

      setSelectedAddressId: (id) => set({ selectedAddressId: id }),

      setDefaultAddress: (id) => {
        set({ selectedAddressId: id });
        try {
          const { apiClient } = require('../../api/client');
          apiClient.post(`/user/addresses/${id}/default`).catch(() => {});
        } catch {}
      },

      fetchAddressesFromBackend: async (phone?: string) => {
        try {
          const { apiClient } = require('../../api/client');
          const targetPhone = phone || '9864975438';
          const res = await apiClient.get(
            `/user/addresses?phone=${encodeURIComponent(targetPhone)}`
          );
          if (
            res.data?.success &&
            Array.isArray(res.data?.addresses) &&
            res.data.addresses.length > 0
          ) {
            const mapped: CheckoutAddress[] = res.data.addresses.map((a: any) => ({
              id: a.id,
              state: a.state || 'Assam',
              gpsLocation: a.gps_location || '26.134456, 91.813250',
              pincode: a.pincode || '781005',
              cityVillage: a.city_village || 'Six Mile',
              houseNoName: a.house_no_street || 'Six Mile',
              flatHouseStreet: [
                a.house_no_street,
                a.nearby_area,
                a.city_village,
                a.state,
                a.pincode,
              ]
                .filter(Boolean)
                .join(', '),
              nearbyArea: a.nearby_area || '',
              yourName: a.recipient_name || 'ASHAFUL ISLAM',
              phone: a.phone || targetPhone,
              alternatePhone: a.alternate_phone || '',
              addressType: (a.address_type as any) || 'HOME',
              distance: a.distance || '0m',
            }));

            const curSelected = get().selectedAddressId;
            const validSelected = mapped.some((m) => m.id === curSelected)
              ? curSelected
              : mapped[0]?.id || null;

            set({
              addresses: mapped,
              selectedAddressId: validSelected,
            });
          }
        } catch (e: any) {
          console.log('[useCheckoutStore] fetchAddressesFromBackend fallback:', e?.message);
        }
      },
    }),
    {
      name: 'checkout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.addresses || state.addresses.length === 0)) {
          state.addresses = initialAddresses;
          state.selectedAddressId = initialAddresses[0]?.id || null;
        }
      },
    }
  )
);
