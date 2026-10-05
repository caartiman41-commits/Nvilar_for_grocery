'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, X, Search, ChevronRight, Sparkles, Building2,
  Check, Globe, Store, Compass, ArrowRight
} from 'lucide-react';
import { getBackendUrl } from '@/lib/config';

export interface SelectedCity {
  id: string;
  name: string;
  state_id: string;
  state_name: string;
  state_code: string;
}

export interface ExploreCity {
  id: string;
  name: string;
  pincode_prefix?: string;
  is_featured: boolean;
  shop_count: number;
}

export interface ExploreState {
  id: string;
  name: string;
  code: string;
  icon_url?: string | null;
  sort_order: number;
  cities: ExploreCity[];
}

interface CityExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: SelectedCity | null;
  onSelectCity: (city: SelectedCity) => void;
}

const FALLBACK_STATES: ExploreState[] = [
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    code: 'MH',
    sort_order: 1,
    cities: [
      { id: 'mumbai', name: 'Mumbai', pincode_prefix: '400', is_featured: true, shop_count: 1 },
      { id: 'pune', name: 'Pune', pincode_prefix: '411', is_featured: false, shop_count: 1 },
      { id: 'nagpur', name: 'Nagpur', pincode_prefix: '440', is_featured: false, shop_count: 0 },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    code: 'KA',
    sort_order: 2,
    cities: [
      { id: 'bengaluru', name: 'Bengaluru', pincode_prefix: '560', is_featured: true, shop_count: 1 },
      { id: 'mysuru', name: 'Mysuru', pincode_prefix: '570', is_featured: false, shop_count: 0 },
    ],
  },
  {
    id: 'delhi_ncr',
    name: 'Delhi NCR',
    code: 'DL',
    sort_order: 3,
    cities: [
      { id: 'new_delhi', name: 'New Delhi', pincode_prefix: '110', is_featured: true, shop_count: 1 },
      { id: 'noida', name: 'Noida', pincode_prefix: '201', is_featured: false, shop_count: 0 },
      { id: 'gurugram', name: 'Gurugram', pincode_prefix: '122', is_featured: false, shop_count: 0 },
    ],
  },
  {
    id: 'assam',
    name: 'Assam',
    code: 'AS',
    sort_order: 4,
    cities: [
      { id: 'guwahati', name: 'Guwahati', pincode_prefix: '781', is_featured: true, shop_count: 1 },
    ],
  },
  {
    id: 'jammu_kashmir',
    name: 'Jammu & Kashmir',
    code: 'JK',
    sort_order: 5,
    cities: [
      { id: 'srinagar', name: 'Srinagar', pincode_prefix: '190', is_featured: true, shop_count: 1 },
    ],
  },
  {
    id: 'tamil_nadu',
    name: 'Tamil Nadu',
    code: 'TN',
    sort_order: 6,
    cities: [
      { id: 'chennai', name: 'Chennai', pincode_prefix: '600', is_featured: true, shop_count: 0 },
      { id: 'coimbatore', name: 'Coimbatore', pincode_prefix: '641', is_featured: false, shop_count: 0 },
    ],
  },
];

const STATE_ACCENTS: Record<string, { gradient: string; border: string; badge: string }> = {
  maharashtra: {
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  },
  karnataka: {
    gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-700 border-rose-500/30',
  },
  delhi_ncr: {
    gradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  },
  assam: {
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    border: 'border-teal-500/30',
    badge: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
  },
  jammu_kashmir: {
    gradient: 'from-cyan-500/10 via-sky-500/5 to-transparent',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
  },
  tamil_nadu: {
    gradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
  },
};

export const CityExplorer: React.FC<CityExplorerProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
}) => {
  const [states, setStates] = useState<ExploreState[]>(FALLBACK_STATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStateTab, setActiveStateTab] = useState<string>('all');
  const [expandedStateId, setExpandedStateId] = useState<string | null>(null);

  // Load states from explore endpoint
  useEffect(() => {
    async function loadExploreData() {
      try {
        const res = await fetch(`${getBackendUrl()}/api/explore/states`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.states) && data.states.length > 0) {
            setStates(data.states);
          }
        }
      } catch (err) {
        // Fallback to FALLBACK_STATES on network error
      }
    }
    if (isOpen) {
      loadExploreData();
    }
  }, [isOpen]);

  // Expand the currently selected city's state by default
  useEffect(() => {
    if (selectedCity && !expandedStateId) {
      setExpandedStateId(selectedCity.state_id);
    }
  }, [selectedCity]);

  // Featured cities list for quick access bar
  const featuredCities = useMemo(() => {
    const list: { city: ExploreCity; state: ExploreState }[] = [];
    states.forEach((st) => {
      st.cities.forEach((ct) => {
        if (ct.is_featured || ct.shop_count > 0) {
          list.push({ city: ct, state: st });
        }
      });
    });
    return list.slice(0, 8);
  }, [states]);

  // Filtered list based on search and state tab
  const filteredStates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return states
      .map((st) => {
        const matchesStateName = st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q);
        const matchingCities = st.cities.filter((ct) =>
          matchesStateName ||
          ct.name.toLowerCase().includes(q) ||
          (ct.pincode_prefix && ct.pincode_prefix.includes(q))
        );

        return {
          ...st,
          matchingCities,
          hasMatch: matchesStateName || matchingCities.length > 0,
        };
      })
      .filter((st) => {
        if (activeStateTab !== 'all' && st.id !== activeStateTab) return false;
        if (!searchQuery) return true;
        return st.hasMatch;
      });
  }, [states, searchQuery, activeStateTab]);

  const handleCityClick = (city: ExploreCity, state: ExploreState) => {
    const chosen: SelectedCity = {
      id: city.id,
      name: city.name,
      state_id: state.id,
      state_name: state.name,
      state_code: state.code,
    };
    try {
      localStorage.setItem('mitreno_selected_city', JSON.stringify(chosen));
    } catch {}
    onSelectCity(chosen);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#FCFBF7] rounded-3xl shadow-2xl border border-[#C57C35]/30 flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-5 md:p-6 bg-gradient-to-r from-[#DF9D5B]/30 via-[#FCFBF7] to-[#DF9D5B]/20 border-b border-[#E8DCCB] relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 transition-colors shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-1 text-xs font-bold text-[#8C531B] uppercase tracking-wider">
                <Compass className="w-4 h-4 text-[#C57C35]" />
                <span>Geographic Discovery</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#1B0F03] tracking-tight">
                Explore India's Fashion & Lifestyle Hubs
              </h2>
              <p className="text-xs md:text-sm text-neutral-600 mt-1">
                Select your city to browse hyper-local verified boutiques, real-time runway drops, and local artisan markets.
              </p>

              {/* Search Bar */}
              <div className="relative mt-4">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search city, state or PIN (e.g. Mumbai, Bengaluru, 400)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#D9C7B2] text-sm text-[#1B0F03] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C57C35]/40 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick-Pick Featured Cities Ribbon */}
            <div className="px-5 py-3 bg-white/90 border-b border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#DF9D5B]" /> Top Hubs:
              </span>
              {featuredCities.map(({ city, state }) => {
                const isSelected = selectedCity?.id === city.id;
                return (
                  <button
                    key={`${state.id}-${city.id}`}
                    onClick={() => handleCityClick(city, state)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1246B8] text-white shadow-sm'
                        : 'bg-[#F4EDE2] hover:bg-[#EAE0D1] text-[#3D250E] border border-[#D9C7B2]/60'
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">({state.code})</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Main Content: States & Cities Accordion / Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {filteredStates.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="font-semibold text-neutral-700">No destinations found matching "{searchQuery}"</p>
                  <p className="text-xs text-neutral-400 mt-1">Try searching for a different city or state.</p>
                </div>
              ) : (
                filteredStates.map((state) => {
                  const accent = STATE_ACCENTS[state.id] || {
                    gradient: 'from-amber-500/5 to-transparent',
                    border: 'border-neutral-200',
                    badge: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                  };
                  const isExpanded = expandedStateId === state.id || !!searchQuery;
                  const totalShopsInState = state.cities.reduce((acc, c) => acc + (c.shop_count || 0), 0);

                  return (
                    <div
                      key={state.id}
                      className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-xs ${
                        isExpanded ? `${accent.border} ring-1 ring-black/5` : 'border-neutral-200/80 hover:border-neutral-300'
                      }`}
                    >
                      {/* State Header Card */}
                      <button
                        type="button"
                        onClick={() => setExpandedStateId(isExpanded && !searchQuery ? null : state.id)}
                        className={`w-full p-4 flex items-center justify-between text-left transition-colors bg-gradient-to-r ${accent.gradient}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center font-black text-[#5C3A15] shadow-xs shrink-0">
                            {state.code}
                          </div>
                          <div>
                            <div className="font-bold text-base text-[#1B0F03] flex items-center gap-2">
                              <span>{state.name}</span>
                              {selectedCity?.state_id === state.id && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1246B8]/10 text-[#1246B8] border border-[#1246B8]/20">
                                  Current State
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                              <span>{state.cities.length} {state.cities.length === 1 ? 'City' : 'Cities'}</span>
                              {totalShopsInState > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">{totalShopsInState} Active {totalShopsInState === 1 ? 'Boutique' : 'Boutiques'}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Cities Grid Inside State */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-neutral-100 bg-[#FAF7F2]/50 p-3 sm:p-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {state.matchingCities.map((city) => {
                                const isCurrent = selectedCity?.id === city.id;

                                return (
                                  <button
                                    key={city.id}
                                    type="button"
                                    onClick={() => handleCityClick(city, state)}
                                    className={`p-3 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
                                      isCurrent
                                        ? 'bg-[#1246B8] border-[#1246B8] text-white shadow-md'
                                        : 'bg-white hover:bg-[#F4EDE2] border-neutral-200/90 text-[#1B0F03] hover:border-[#D9C7B2]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className={`font-bold text-sm flex items-center gap-1.5 ${isCurrent ? 'text-white' : 'text-[#1B0F03]'}`}>
                                          <span>{city.name}</span>
                                          {city.is_featured && !isCurrent && (
                                            <span title="Featured Hub">
                                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            </span>
                                          )}
                                        </div>
                                        {city.pincode_prefix && (
                                          <div className={`text-[11px] font-mono mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-neutral-400'}`}>
                                            PIN: {city.pincode_prefix}xxx
                                          </div>
                                        )}
                                      </div>

                                      {isCurrent ? (
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                          <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                      ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ArrowRight className="w-4 h-4 text-[#C57C35]" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                                      <span className={isCurrent ? 'text-blue-100' : 'text-neutral-500'}>
                                        {city.shop_count > 0 ? `${city.shop_count} verified stores` : 'Local boutiques'}
                                      </span>
                                      {city.is_featured && (
                                        <span className={`text-[10px] font-semibold uppercase ${isCurrent ? 'text-white/80' : 'text-[#8C531B]'}`}>
                                          Major Market
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#C57C35]" />
                <span>Currently shopping in: <strong className="text-[#1B0F03]">{selectedCity?.name || 'Mumbai'}, {selectedCity?.state_code || 'MH'}</strong></span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-full bg-[#F4EDE2] hover:bg-[#EAE0D1] text-[#3D250E] font-bold transition-colors"
              >
                Close Explorer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
