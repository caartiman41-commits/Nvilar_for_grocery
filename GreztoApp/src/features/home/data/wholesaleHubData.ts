import { ImageSourcePropType } from 'react-native';
import { BoutiqueProductItem } from '../HomeScreen';

// ============================================================================
// ELECTRONICS TRANSPARENT PNG ASSETS (PHASE 1)
// ============================================================================
export const ELEC_ICONS = {
  fans_coolers: require('../../../assets/categories/electronics/elec_fans_coolers.png'),
  kitchen_appliances: require('../../../assets/categories/electronics/elec_kitchen_appliances.png'),
  irons_heaters: require('../../../assets/categories/electronics/elec_irons_heaters.png'),
  audio_earbuds: require('../../../assets/categories/electronics/elec_audio_earbuds.png'),
  led_bulbs: require('../../../assets/categories/electronics/elec_led_bulbs.png'),
  extension_switches: require('../../../assets/categories/electronics/elec_extension_switches.png'),
  wires_tools: require('../../../assets/categories/electronics/elec_wires_tools.png'),
  torches_emergency: require('../../../assets/categories/electronics/elec_torches_emergency.png'),
  trimmers: require('../../../assets/categories/electronics/elec_trimmers.png'),
  hairstyling: require('../../../assets/categories/electronics/elec_hairstyling.png'),
  massagers_scales: require('../../../assets/categories/electronics/elec_massagers_scales.png'),
  toothbrushes: require('../../../assets/categories/electronics/elec_toothbrushes.png'),
  mobiles_chargers: require('../../../assets/categories/electronics/elec_mobiles_chargers.png'),
  storage_powerbanks: require('../../../assets/categories/electronics/elec_storage_powerbanks.png'),
  computer_tv: require('../../../assets/categories/electronics/elec_computer_tv.png'),
  content_tools: require('../../../assets/categories/electronics/elec_content_tools.png'),
};

// ============================================================================
// PHARMACY TRANSPARENT PNG ASSETS (PHASE 2)
// ============================================================================
export const PHARM_ICONS = {
  cough_cold_fever: require('../../../assets/categories/pharmacy/pharm_cough_cold_fever.png'),
  stomach_care: require('../../../assets/categories/pharmacy/pharm_stomach_care.png'),
  pain_first_aid: require('../../../assets/categories/pharmacy/pharm_pain_first_aid.png'),
  antibiotics: require('../../../assets/categories/pharmacy/pharm_antibiotics.png'),
  diabetes_care: require('../../../assets/categories/pharmacy/pharm_diabetes_care.png'),
  heart_bp_care: require('../../../assets/categories/pharmacy/pharm_heart_bp_care.png'),
  derma_skin: require('../../../assets/categories/pharmacy/pharm_derma_skin.png'),
  respiratory: require('../../../assets/categories/pharmacy/pharm_respiratory.png'),
  eye_ear_oral: require('../../../assets/categories/pharmacy/pharm_eye_ear_oral.png'),
  neuro_care: require('../../../assets/categories/pharmacy/pharm_neuro_care.png'),
  sexual_wellness: require('../../../assets/categories/pharmacy/pharm_sexual_wellness.png'),
  vitamins_supplements: require('../../../assets/categories/pharmacy/pharm_vitamins_supplements.png'),
  surgical_supplies: require('../../../assets/categories/pharmacy/pharm_surgical_supplies.png'),
  ors_glucose: require('../../../assets/categories/pharmacy/pharm_ors_glucose.png'),
  ayurvedic: require('../../../assets/categories/pharmacy/pharm_ayurvedic.png'),
  baby_sanitary: require('../../../assets/categories/pharmacy/pharm_baby_sanitary.png'),
  feat_headache: require('../../../assets/categories/pharmacy/feat_headache.png'),
  feat_fever: require('../../../assets/categories/pharmacy/feat_fever.png'),
  feat_pain_relief: require('../../../assets/categories/pharmacy/feat_pain_relief.png'),
  feat_acidity_ors: require('../../../assets/categories/pharmacy/feat_acidity_ors.png'),
};

// ============================================================================
// RATION / KIRANA MANDI TRANSPARENT PNG ASSETS (PHASE 3)
// ============================================================================
export const RATION_ICONS = {
  atta_maida_sooji: require('../../../assets/categories/ration/ration_atta_maida_sooji.png'),
  rice_basmati: require('../../../assets/categories/ration/ration_rice_basmati.png'),
  dal_pulses: require('../../../assets/categories/ration/ration_dal_pulses.png'),
  onion_garlic_potato: require('../../../assets/categories/ration/ration_onion_garlic_potato.png'),
  khada_masala: require('../../../assets/categories/ration/ration_khada_masala.png'),
  powder_packet_masala: require('../../../assets/categories/ration/ration_powder_packet_masala.png'),
  cooking_oil_ghee: require('../../../assets/categories/ration/ration_cooking_oil_ghee.png'),
  salt_sugar_jaggery: require('../../../assets/categories/ration/ration_salt_sugar_jaggery.png'),
  dry_fruits_makhana: require('../../../assets/categories/ration/ration_dry_fruits_makhana.png'),
  tea_coffee_milk: require('../../../assets/categories/ration/ration_tea_coffee_milk.png'),
  biscuits_namkeen_snacks: require('../../../assets/categories/ration/ration_biscuits_namkeen_snacks.png'),
  soaps_detergents_cleaning: require('../../../assets/categories/ration/ration_soaps_detergents_cleaning.png'),
};

// ============================================================================
// BEAUTY & COSMETICS TRANSPARENT PNG ASSETS (20 A-TO-Z SUB-CATEGORIES)
// ============================================================================
export const BEAUTY_ICONS = {
  lip_cosmetics: require('../../../assets/categories/beauty/beauty_lip_cosmetics.png'),
  face_cosmetics: require('../../../assets/categories/beauty/beauty_face_cosmetics.png'),
  eye_makeup: require('../../../assets/categories/beauty/beauty_eye_makeup.png'),
  nail_cosmetics: require('../../../assets/categories/beauty/beauty_nail_cosmetics.png'),
  serums_toners: require('../../../assets/categories/beauty/beauty_serums_toners.png'),
  sunscreens_cleansers: require('../../../assets/categories/beauty/beauty_sunscreens_cleansers.png'),
  lip_balms_masks: require('../../../assets/categories/beauty/beauty_lip_balms_masks.png'),
  facial_kits_masks: require('../../../assets/categories/beauty/beauty_facial_kits_masks.png'),
  hair_colour: require('../../../assets/categories/beauty/beauty_hair_colour.png'),
  hair_masks_serums: require('../../../assets/categories/beauty/beauty_hair_masks_serums.png'),
  hair_styling: require('../../../assets/categories/beauty/beauty_hair_styling.png'),
  shampoos_oils: require('../../../assets/categories/beauty/beauty_shampoos_oils.png'),
  bath_body_tools: require('../../../assets/categories/beauty/beauty_bath_body_tools.png'),
  accessories: require('../../../assets/categories/beauty/beauty_accessories.png'),
  hair_brushes_tools: require('../../../assets/categories/beauty/beauty_hair_brushes_tools.png'),
  extensions: require('../../../assets/categories/beauty/beauty_extensions.png'),
  luxury: require('../../../assets/categories/beauty/beauty_luxury.png'),
  perfumes_gifts: require('../../../assets/categories/beauty/beauty_perfumes_gifts.png'),
  womens_grooming: require('../../../assets/categories/beauty/beauty_womens_grooming.png'),
  mens_grooming: require('../../../assets/categories/beauty/beauty_mens_grooming.png'),
};

// ============================================================================
// KIDS, BABY CARE & TOYS TRANSPARENT PNG ASSETS (18 A-TO-Z SUB-CATEGORIES)
// ============================================================================
export const KIDS_ICONS = {
  diaper: require('../../../assets/categories/kids/kids_diaper.png'),
  wipes_drysheets: require('../../../assets/categories/kids/kids_wipes_drysheets.png'),
  rashcream_powder: require('../../../assets/categories/kids/kids_rashcream_powder.png'),
  baby_food: require('../../../assets/categories/kids/kids_baby_food.png'),
  feeding_bottles: require('../../../assets/categories/kids/kids_feeding_bottles.png'),
  feeding_accessories: require('../../../assets/categories/kids/kids_feeding_accessories.png'),
  lotions_creams: require('../../../assets/categories/kids/kids_lotions_creams.png'),
  soap_wash_shampoo: require('../../../assets/categories/kids/kids_soap_wash_shampoo.png'),
  powder_oils: require('../../../assets/categories/kids/kids_powder_oils.png'),
  oral_care: require('../../../assets/categories/kids/kids_oral_care.png'),
  liquid_detergents: require('../../../assets/categories/kids/kids_liquid_detergents.png'),
  grooming_essentials: require('../../../assets/categories/kids/kids_grooming_essentials.png'),
  gift_sets: require('../../../assets/categories/kids/kids_gift_sets.png'),
  apparel: require('../../../assets/categories/kids/kids_apparel.png'),
  accessories: require('../../../assets/categories/kids/kids_accessories.png'),
  stacking_toys: require('../../../assets/categories/kids/kids_stacking_toys.png'),
  musical_toys: require('../../../assets/categories/kids/kids_musical_toys.png'),
  rattles: require('../../../assets/categories/kids/kids_rattles.png'),
};

// ============================================================================
// COLD DRINKS, COFFEE, WATER & BEVERAGES TRANSPARENT PNG ASSETS (12 A-TO-Z)
// ============================================================================
export const COLD_DRINKS_ICONS = {
  cola_fizzy: require('../../../assets/categories/cold_drinks/drinks_cola_fizzy.png'),
  lemon_orange: require('../../../assets/categories/cold_drinks/drinks_lemon_orange.png'),
  energy: require('../../../assets/categories/cold_drinks/drinks_energy.png'),
  party_cans: require('../../../assets/categories/cold_drinks/drinks_party_cans.png'),
  cold_coffee: require('../../../assets/categories/cold_drinks/drinks_cold_coffee.png'),
  mango_juices: require('../../../assets/categories/cold_drinks/drinks_mango_juices.png'),
  milkshakes_lassi: require('../../../assets/categories/cold_drinks/drinks_milkshakes_lassi.png'),
  iced_tea_paperboat: require('../../../assets/categories/cold_drinks/drinks_iced_tea_paperboat.png'),
  mineral_water: require('../../../assets/categories/cold_drinks/drinks_mineral_water.png'),
  soda_mixers: require('../../../assets/categories/cold_drinks/drinks_soda_mixers.png'),
  sports_glucose: require('../../../assets/categories/cold_drinks/drinks_sports_glucose.png'),
  syrups_sharbat: require('../../../assets/categories/cold_drinks/drinks_syrups_sharbat.png'),
};

// ============================================================================
// FASHION & APPAREL TRANSPARENT PNG ASSETS (16 A-TO-Z SUB-CATEGORIES)
// ============================================================================
export const FASHION_ICONS = {
  mens_tshirts: require('../../../assets/categories/fashion/fash_mens_tshirts.png'),
  mens_shirts: require('../../../assets/categories/fashion/fash_mens_shirts.png'),
  mens_jeans: require('../../../assets/categories/fashion/fash_mens_jeans.png'),
  mens_ethnic: require('../../../assets/categories/fashion/fash_mens_ethnic.png'),
  womens_kurtis: require('../../../assets/categories/fashion/fash_womens_kurtis.png'),
  womens_sarees: require('../../../assets/categories/fashion/fash_womens_sarees.png'),
  womens_western: require('../../../assets/categories/fashion/fash_womens_western.png'),
  womens_bottoms: require('../../../assets/categories/fashion/fash_womens_bottoms.png'),
  boys_wear: require('../../../assets/categories/fashion/fash_boys_wear.png'),
  girls_wear: require('../../../assets/categories/fashion/fash_girls_wear.png'),
  activewear: require('../../../assets/categories/fashion/fash_activewear.png'),
  innerwear: require('../../../assets/categories/fashion/fash_innerwear.png'),
  nightwear: require('../../../assets/categories/fashion/fash_nightwear.png'),
  winterwear: require('../../../assets/categories/fashion/fash_winterwear.png'),
  fabrics: require('../../../assets/categories/fashion/fash_fabrics.png'),
  accessories: require('../../../assets/categories/fashion/fash_accessories.png'),
};

// ============================================================================
// FOOTWEAR — SHOES, CROCS & CHAPPALS TRANSPARENT PNG ASSETS (12 A-TO-Z)
// ============================================================================
export const FOOTWEAR_ICONS = {
  crocs_clogs: require('../../../assets/categories/footwear/foot_crocs_clogs.png'),
  mens_sports: require('../../../assets/categories/footwear/foot_mens_sports.png'),
  mens_sneakers: require('../../../assets/categories/footwear/foot_mens_sneakers.png'),
  mens_chappals: require('../../../assets/categories/footwear/foot_mens_chappals.png'),
  mens_formal: require('../../../assets/categories/footwear/foot_mens_formal.png'),
  womens_heels: require('../../../assets/categories/footwear/foot_womens_heels.png'),
  womens_flats: require('../../../assets/categories/footwear/foot_womens_flats.png'),
  womens_sneakers: require('../../../assets/categories/footwear/foot_womens_sneakers.png'),
  womens_chappals: require('../../../assets/categories/footwear/foot_womens_chappals.png'),
  kids_shoes: require('../../../assets/categories/footwear/foot_kids_shoes.png'),
  school_shoes: require('../../../assets/categories/footwear/foot_school_shoes.png'),
  socks_care: require('../../../assets/categories/footwear/foot_socks_care.png'),
};

// ============================================================================
// HOME DECOR & FURNISHINGS TRANSPARENT PNG ASSETS (12 A-TO-Z)
// ============================================================================
export const DECOR_ICONS = {
  bedsheets: require('../../../assets/categories/decor/decor_bedsheets.png'),
  curtains_cushions: require('../../../assets/categories/decor/decor_curtains_cushions.png'),
  plants_vases: require('../../../assets/categories/decor/decor_plants_vases.png'),
  lamps_lights: require('../../../assets/categories/decor/decor_lamps_lights.png'),
  wall_clocks: require('../../../assets/categories/decor/decor_wall_clocks.png'),
  idols_statues: require('../../../assets/categories/decor/decor_idols_statues.png'),
  pooja_items: require('../../../assets/categories/decor/decor_pooja_items.png'),
  carpets_mats: require('../../../assets/categories/decor/decor_carpets_mats.png'),
  candles_aroma: require('../../../assets/categories/decor/decor_candles_aroma.png'),
  storage_organizers: require('../../../assets/categories/decor/decor_storage_organizers.png'),
  dining_tableware: require('../../../assets/categories/decor/decor_dining_tableware.png'),
  bath_towels: require('../../../assets/categories/decor/decor_bath_towels.png'),
};

// ============================================================================
// IMPORTED GOURMET & GLOBAL GOODS TRANSPARENT PNG ASSETS (8 A-TO-Z)
// ============================================================================
export const IMPORTED_ICONS = {
  chocolates: require('../../../assets/categories/imported/imp_chocolates.png'),
  korean_ramen: require('../../../assets/categories/imported/imp_korean_ramen.png'),
  snacks_chips: require('../../../assets/categories/imported/imp_snacks_chips.png'),
  coffee_spreads: require('../../../assets/categories/imported/imp_coffee_spreads.png'),
  drinks_cans: require('../../../assets/categories/imported/imp_drinks_cans.png'),
  dates_dryfruits: require('../../../assets/categories/imported/imp_dates_dryfruits.png'),
  pasta_sauces: require('../../../assets/categories/imported/imp_pasta_sauces.png'),
  perfumes_care: require('../../../assets/categories/imported/imp_perfumes_care.png'),
};

export type WholesaleVerticalId =
  | 'electronics'
  | 'pharmacy'
  | 'ration'
  | 'beauty'
  | 'kids'
  | 'cold_drinks'
  | 'fashion'
  | 'footwear'
  | 'decor'
  | 'imported'
  | 'others';

export interface SubTypeOption {
  id: string;
  label: string;
  keywords: string[];
}

export interface SubcategoryTileItem {
  id: string;
  title: string;
  icon: ImageSourcePropType;
  badgeText?: string;
  subTypes?: SubTypeOption[];
}

export interface SubcategorySectionGroup {
  id: string;
  sectionTitle: string;
  cardBgColor: string;
  columns?: 3 | 4;
  items: SubcategoryTileItem[];
}

export interface FeaturedConditionCard {
  id: string;
  title: string;
  icon: ImageSourcePropType;
  bgColor: string;
  targetSubcategoryId: string;
}

// ============================================================================
// 1. ELECTRONICS WHOLESALE SECTIONS (WITH LEVEL-3 SUB-CATEGORIES & KEYWORDS)
// ============================================================================
export const ELECTRONICS_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'elec_grooming',
    sectionTitle: 'Grooming and wellness essentials',
    cardBgColor: '#F3EFFE',
    items: [
      {
        id: 'sub_trimmers',
        title: 'Trimmers',
        icon: ELEC_ICONS.trimmers,
        subTypes: [
          { id: 'beard_trimmers', label: 'Beard Trimmers', keywords: ['trimmer', 'beard', 'philips', 'nova', 'shaver'] },
          { id: 'salon_clippers', label: 'Salon Hair Clippers', keywords: ['clipper', 'salon', 'wahl', 'zero gap'] },
          { id: 'razor_blades', label: 'Shavers & Foil', keywords: ['electric shaver', 'foil shaver', 'grooming kit'] },
        ],
      },
      {
        id: 'sub_hairstyling',
        title: 'Hairstyling',
        icon: ELEC_ICONS.hairstyling,
        subTypes: [
          { id: 'hair_dryers', label: 'Hair Dryers', keywords: ['hair dryer', 'blow dryer', 'dryer'] },
          { id: 'straighteners', label: 'Straighteners', keywords: ['straightener', 'hair straightener', 'keratin'] },
          { id: 'curlers_crimpers', label: 'Curlers & Crimpers', keywords: ['curler', 'crimper', 'stylers'] },
        ],
      },
      {
        id: 'sub_massagers',
        title: 'Massagers &\nScales',
        icon: ELEC_ICONS.massagers_scales,
        subTypes: [
          { id: 'body_massagers', label: 'Gun & Body Massagers', keywords: ['massager', 'massage gun', 'pain massager'] },
          { id: 'weighing_scales', label: 'Weighing Scales', keywords: ['weighing scale', 'weight machine', 'kitchen scale', 'digital scale'] },
          { id: 'heating_pads', label: 'Heating Pads', keywords: ['heating pad', 'hot water bag', 'electric bag'] },
        ],
      },
      {
        id: 'sub_toothbrushes',
        title: 'Electric\nToothbrushes',
        icon: ELEC_ICONS.toothbrushes,
        subTypes: [
          { id: 'sonic_brushes', label: 'Sonic Toothbrushes', keywords: ['electric toothbrush', 'sonic brush', 'oral-b'] },
          { id: 'brush_heads', label: 'Replacement Heads', keywords: ['brush head', 'refill head'] },
          { id: 'water_flossers', label: 'Water Flossers', keywords: ['water flosser', 'dental flosser'] },
        ],
      },
    ],
  },
  {
    id: 'elec_mobile_comp',
    sectionTitle: 'Mobile and computer accessories',
    cardBgColor: '#F3EFFE',
    items: [
      {
        id: 'sub_mobiles_chargers',
        title: 'Mobiles &\nChargers',
        icon: ELEC_ICONS.mobiles_chargers,
        subTypes: [
          { id: 'fast_chargers', label: 'Fast Chargers (20W-65W)', keywords: ['charger', 'adapter', 'supervooc', 'fast charger', 'pd charger'] },
          { id: 'data_cables', label: 'Type-C & Lightning Cables', keywords: ['cable', 'type-c', 'usb cable', 'data cable', 'lightning'] },
          { id: 'keypad_phones', label: 'Keypad Feature Phones', keywords: ['keypad phone', 'feature phone', 'nokia', 'itel', 'lava'] },
        ],
      },
      {
        id: 'sub_storage_powerbanks',
        title: 'Storage &\nPowerbanks',
        icon: ELEC_ICONS.storage_powerbanks,
        subTypes: [
          { id: 'powerbanks', label: 'Powerbanks (10k-20k mAh)', keywords: ['powerbank', 'power bank', '10000mah', '20000mah'] },
          { id: 'pendrives', label: 'USB Pendrives', keywords: ['pendrive', 'pen drive', 'sandisk', 'flash drive', 'otg'] },
          { id: 'memory_cards', label: 'MicroSD Memory Cards', keywords: ['memory card', 'sd card', 'microsd', '64gb', '128gb'] },
        ],
      },
      {
        id: 'sub_computer_tv',
        title: 'Computer &\nTV Remotes',
        icon: ELEC_ICONS.computer_tv,
        subTypes: [
          { id: 'mouse_keyboards', label: 'Mouse & Keyboards', keywords: ['mouse', 'keyboard', 'wireless mouse', 'gaming mouse'] },
          { id: 'tv_remotes', label: 'Universal TV & AC Remotes', keywords: ['remote', 'tv remote', 'ac remote', 'dth remote'] },
          { id: 'usb_hubs_wifi', label: 'USB Hubs & WiFi Dongles', keywords: ['usb hub', 'wifi adapter', 'hdmi cable', 'router'] },
        ],
      },
      {
        id: 'sub_content_tools',
        title: 'Ring Lights\n& Mics',
        icon: ELEC_ICONS.content_tools,
        subTypes: [
          { id: 'ring_lights', label: 'LED Ring Lights', keywords: ['ring light', 'studio light', '12 inch light'] },
          { id: 'wireless_mics', label: 'Collar & Wireless Mics', keywords: ['wireless mic', 'collar mic', 'boya', 'k8 mic', 'microphone'] },
          { id: 'tripods_stands', label: 'Tripods & Mobile Stands', keywords: ['tripod', 'selfie stick', 'mobile stand', 'gimbal'] },
        ],
      },
    ],
  },
  {
    id: 'elec_fans_appliances',
    sectionTitle: 'Fans, cooling and home appliances',
    cardBgColor: '#F3EFFE',
    items: [
      {
        id: 'sub_fans_coolers',
        title: 'Ceiling &\nTable Fans',
        icon: ELEC_ICONS.fans_coolers,
        subTypes: [
          { id: 'ceiling_fans', label: 'Ceiling Fans', keywords: ['ceiling fan', '1200mm fan', 'havells fan', 'crompton fan', 'bldc fan'] },
          { id: 'table_pedestal', label: 'Table & Pedestal Fans', keywords: ['table fan', 'pedestal fan', 'stand fan', 'wall fan', 'cabin fan'] },
          { id: 'coolers_exhaust', label: 'Air Coolers & Exhaust', keywords: ['air cooler', 'room cooler', 'exhaust fan', 'ventilation fan'] },
        ],
      },
      {
        id: 'sub_kitchen_appliances',
        title: 'Mixers &\nInduction',
        icon: ELEC_ICONS.kitchen_appliances,
        subTypes: [
          { id: 'mixer_grinders', label: 'Mixer Grinders', keywords: ['mixer', 'mixer grinder', 'juicer', 'sujata', 'bajaj mixer', '750w'] },
          { id: 'electric_kettles', label: 'Electric Kettles', keywords: ['electric kettle', 'kettle', 'water boiler', 'pigeon kettle'] },
          { id: 'induction_cooktops', label: 'Induction & Toasters', keywords: ['induction', 'cooktop', 'sandwich maker', 'toaster', 'blender'] },
        ],
      },
      {
        id: 'sub_irons_heaters',
        title: 'Steam Irons &\nHeater Rods',
        icon: ELEC_ICONS.irons_heaters,
        subTypes: [
          { id: 'dry_steam_irons', label: 'Dry & Steam Irons', keywords: ['steam iron', 'dry iron', 'heavy weight iron', 'press'] },
          { id: 'immersion_rods', label: 'Water Heater Rods', keywords: ['immersion rod', 'water heater rod', 'heating rod', '1500w rod'] },
          { id: 'room_heaters', label: 'Room Heaters & Geysers', keywords: ['room heater', 'blower heater', 'quartz heater', 'instant geyser'] },
        ],
      },
      {
        id: 'sub_audio_earbuds',
        title: 'Earbuds &\nSpeakers',
        icon: ELEC_ICONS.audio_earbuds,
        subTypes: [
          { id: 'tws_earbuds', label: 'TWS Earbuds', keywords: ['earbuds', 'airdopes', 'tws', 'wireless earbuds', 'bluetooth earphones'] },
          { id: 'neckbands', label: 'Bluetooth Neckbands', keywords: ['neckband', 'rockerz', 'collar earphone', 'wired earphone'] },
          { id: 'bt_speakers', label: 'Bluetooth Speakers', keywords: ['bluetooth speaker', 'soundbar', 'party speaker', 'mini speaker'] },
        ],
      },
    ],
  },
  {
    id: 'elec_electricals_hardware',
    sectionTitle: 'Electricals, LED bulbs and hardware',
    cardBgColor: '#F3EFFE',
    items: [
      {
        id: 'sub_led_bulbs',
        title: 'LED Bulbs &\nBattens',
        icon: ELEC_ICONS.led_bulbs,
        subTypes: [
          { id: 'led_bulbs_9w', label: 'LED Bulbs (9W - 18W)', keywords: ['led bulb', '9w bulb', '12w bulb', 'syska bulb', 'philips bulb'] },
          { id: 'inverter_bulbs', label: 'AC/DC Inverter Bulbs', keywords: ['inverter bulb', 'rechargeable bulb', 'ac dc bulb', 'emergency bulb'] },
          { id: 'tube_battens', label: 'LED Tubelights & Panels', keywords: ['tubelight', 'led batten', '20w batten', 'panel light', 'flood light'] },
        ],
      },
      {
        id: 'sub_extension_switches',
        title: 'Extensions &\nSwitches',
        icon: ELEC_ICONS.extension_switches,
        subTypes: [
          { id: 'extension_boards', label: 'Extension Boards', keywords: ['extension board', 'spike guard', 'power strip', 'multi plug'] },
          { id: 'modular_switches', label: 'Switches & Sockets', keywords: ['modular switch', 'socket', '6a switch', '16a power plug', 'anchor'] },
          { id: 'holders_plugs', label: 'Bulb Holders & Tops', keywords: ['bulb holder', 'batten holder', '3 pin top', 'multiplug'] },
        ],
      },
      {
        id: 'sub_wires_tools',
        title: 'Wires, Tape\n& Testers',
        icon: ELEC_ICONS.wires_tools,
        subTypes: [
          { id: 'house_wires', label: 'Copper Wire Coils (90m)', keywords: ['copper wire', 'finolex', 'polycab', 'house wire', '1.5 sqmm', '2.5 sqmm'] },
          { id: 'mcb_tape', label: 'MCB, PVC Tape & Conduit', keywords: ['mcb', 'pvc tape', 'insulation tape', 'steelgrip', 'distribution box'] },
          { id: 'testers_pliers', label: 'Testers, Pliers & Soldering', keywords: ['tester', 'plier', 'multimeter', 'soldering iron', 'screwdriver'] },
        ],
      },
      {
        id: 'sub_torches_emergency',
        title: 'Kisan Torch &\nLanterns',
        icon: ELEC_ICONS.torches_emergency,
        subTypes: [
          { id: 'kisan_torches', label: 'Long-Range Kisan Torches', keywords: ['kisan torch', 'rechargeable torch', 'flashlight', '50w torch'] },
          { id: 'solar_lanterns', label: 'Solar & Emergency Lanterns', keywords: ['emergency light', 'solar lantern', 'led lantern'] },
          { id: 'mosquito_rackets', label: 'Mosquito Bats & Batteries', keywords: ['mosquito bat', 'mosquito racket', 'aa battery', 'duracell', 'eveready'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 2. PHARMACY WHOLESALE SECTIONS (WITH LEVEL-3 SUB-CATEGORIES & KEYWORDS)
// ============================================================================
export const PHARMACY_FEATURED_PROBLEMS: FeaturedConditionCard[] = [
  {
    id: 'feat_headache',
    title: 'Headache',
    icon: PHARM_ICONS.feat_headache,
    bgColor: '#DCF2F2',
    targetSubcategoryId: 'sub_pain_first_aid',
  },
  {
    id: 'feat_fever',
    title: 'Fever',
    icon: PHARM_ICONS.feat_fever,
    bgColor: '#DCF2F2',
    targetSubcategoryId: 'sub_cough_cold_fever',
  },
  {
    id: 'feat_pain',
    title: 'Pain\nRelief',
    icon: PHARM_ICONS.feat_pain_relief,
    bgColor: '#DCF2F2',
    targetSubcategoryId: 'sub_pain_first_aid',
  },
  {
    id: 'feat_acidity',
    title: 'Gas &\nAcidity',
    icon: PHARM_ICONS.feat_acidity_ors,
    bgColor: '#DCF2F2',
    targetSubcategoryId: 'sub_stomach_care',
  },
  {
    id: 'feat_cough',
    title: 'Cough &\nCold',
    icon: PHARM_ICONS.cough_cold_fever,
    bgColor: '#DCF2F2',
    targetSubcategoryId: 'sub_cough_cold_fever',
  },
];

export const PHARMACY_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'pharm_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#E4F5F5',
    items: [
      {
        id: 'sub_cough_cold_fever',
        title: 'Cough, Cold\nand Fever',
        icon: PHARM_ICONS.cough_cold_fever,
        subTypes: [
          { id: 'fever_paracetamol', label: 'Fever & Paracetamol', keywords: ['paracetamol', 'dolo', 'crocin', 'calpol', 'fever', 'thermometer'] },
          { id: 'cough_syrups', label: 'Cough Syrups', keywords: ['cough syrup', 'benadryl', 'honitus', 'ascoril', 'corex', 'grilinctus'] },
          { id: 'cold_vaporub', label: 'Vaporub, Inhaler & Lozenges', keywords: ['vaporub', 'vicks', 'strepsils', 'otrivin', 'nasal drops', 'steam'] },
        ],
      },
      {
        id: 'sub_stomach_care',
        title: 'Stomach\nCare',
        icon: PHARM_ICONS.stomach_care,
        subTypes: [
          { id: 'antacid_gas', label: 'Antacids & Gas Relief', keywords: ['digene', 'eno', 'gelusil', 'pan-d', 'pantoprazole', 'acidity', 'gas'] },
          { id: 'digestion_laxatives', label: 'Constipation & Laxatives', keywords: ['isabgol', 'cremaffin', 'hajmola', 'pudinhara', 'constipation'] },
          { id: 'probiotics_motion', label: 'Probiotics & Loose Motion', keywords: ['sporlac', 'enterogermina', 'norflox', 'loperamide', 'diarrhea'] },
        ],
      },
      {
        id: 'sub_pain_first_aid',
        title: 'Pain\nRelief',
        icon: PHARM_ICONS.pain_first_aid,
        subTypes: [
          { id: 'pain_sprays_gels', label: 'Pain Sprays & Gels', keywords: ['volini', 'moov', 'iodex', 'omnigel', 'pain spray', 'ointment'] },
          { id: 'pain_tablets', label: 'Painkiller Strips', keywords: ['combiflam', 'zerodol', 'diclofenac', 'aceclofenac', 'saridon', 'disprin'] },
          { id: 'antiseptic_firstaid', label: 'Dettol, Savlon & Band-Aid', keywords: ['dettol', 'savlon', 'betadine', 'band-aid', 'burnol', 'first aid'] },
        ],
      },
      {
        id: 'sub_antibiotics',
        title: 'Antibiotics',
        icon: PHARM_ICONS.antibiotics,
        subTypes: [
          { id: 'azithro_amox', label: 'Azithromycin & Amoxicillin', keywords: ['azithromycin', 'azithral', 'amoxicillin', 'augmentin', 'mox'] },
          { id: 'cefixime_cipro', label: 'Cefixime & Ofloxacin', keywords: ['cefixime', 'taxim', 'zifi', 'ofloxacin', 'ciprofloxacin'] },
          { id: 'antibiotic_drops', label: 'Antibiotic Creams & Dry Syrup', keywords: ['neosporin', 'tbact', 'mupirocin', 'dry syrup'] },
        ],
      },
      {
        id: 'sub_diabetes_care',
        title: 'Diabetes\nCare',
        icon: PHARM_ICONS.diabetes_care,
        subTypes: [
          { id: 'glucometer_strips', label: 'Glucometers & Test Strips', keywords: ['glucometer', 'accu-chek', 'onetouch', 'test strips', 'lancets'] },
          { id: 'sugar_substitutes', label: 'Sugar Free & Stevia', keywords: ['sugar free', 'stevia', 'sweetener'] },
          { id: 'diabetic_nutrition', label: 'Diabetic Protein & Care', keywords: ['protinex diabetes', 'ensure diabetes', 'metformin', 'glimepiride'] },
        ],
      },
      {
        id: 'sub_heart_bp_care',
        title: 'Heart\nCare',
        icon: PHARM_ICONS.heart_bp_care,
        subTypes: [
          { id: 'bp_monitors', label: 'Digital BP Monitors', keywords: ['bp monitor', 'blood pressure', 'omron', 'dr morepen bp'] },
          { id: 'cardiac_aspirin', label: 'Cardiac & Lipid Care', keywords: ['ecosprin', 'atorvastatin', 'telmisartan', 'amlodipine'] },
          { id: 'omega_heart', label: 'Omega-3 & Heart Tonics', keywords: ['omega 3', 'fish oil', 'coq10', 'arjuna'] },
        ],
      },
      {
        id: 'sub_derma_skin',
        title: 'Derma',
        icon: PHARM_ICONS.derma_skin,
        subTypes: [
          { id: 'antifungal_ringworm', label: 'Antifungal & Itch Creams', keywords: ['ring guard', 'itch guard', 'luliconazole', 'clotrimazole', 'ketoconazole'] },
          { id: 'dusting_powders', label: 'Candid & Dusting Powders', keywords: ['candid powder', 'abzorb', 'clocip', 'prickly heat'] },
          { id: 'medicated_soaps', label: 'Medicated Lotions & Soaps', keywords: ['calamine', 'lacto calamine', 'tetmosol', 'permethrin', 'acne'] },
        ],
      },
      {
        id: 'sub_respiratory',
        title: 'Respiratory\nCare',
        icon: PHARM_ICONS.respiratory,
        subTypes: [
          { id: 'nebulizers_vaporizers', label: 'Nebulizers & Steamers', keywords: ['nebulizer', 'steam vaporizer', 'oximeter', 'pulse oximeter'] },
          { id: 'inhalers_rotacaps', label: 'Inhalers & Respules', keywords: ['asthalin', 'budecort', 'duolin', 'inhaler', 'rotacaps'] },
          { id: 'anti_allergic', label: 'Cetirizine & Montelukast', keywords: ['cetirizine', 'allegra', 'montair', 'levocetirizine', 'allergy'] },
        ],
      },
      {
        id: 'sub_eye_ear_oral',
        title: 'Eye, Ear &\nOral Care',
        icon: PHARM_ICONS.eye_ear_oral,
        subTypes: [
          { id: 'eye_ear_drops', label: 'Eye & Ear Drops', keywords: ['itone', 'refresh tears', 'cihflox', 'clearwax', 'eye drops', 'ear drops'] },
          { id: 'mouth_ulcer', label: 'Mouth Ulcer Gels', keywords: ['orasore', 'zytee', 'smyle', 'dologel', 'mouth ulcer'] },
          { id: 'medicated_dental', label: 'Sensodyne & Gum Care', keywords: ['sensodyne', 'thermoseal', 'listerine', 'betadine gargle'] },
        ],
      },
      {
        id: 'sub_neuro_care',
        title: 'Neuro Care',
        icon: PHARM_ICONS.neuro_care,
        subTypes: [
          { id: 'b12_nerve', label: 'Neurobion & Methylcobalamin', keywords: ['neurobion', 'mecobalamin', 'nerve', 'b12', 'pregabalin'] },
          { id: 'migraine_vertigo', label: 'Migraine & Vertigo Care', keywords: ['vertin', 'vasograin', 'flunarizine', 'migraine'] },
        ],
      },
      {
        id: 'sub_sexual_wellness',
        title: 'Sexual\nWellness',
        icon: PHARM_ICONS.sexual_wellness,
        subTypes: [
          { id: 'condoms_lubes', label: 'Condoms & Lubricants', keywords: ['durex', 'manforce', 'skore', 'kamasutra', 'condom'] },
          { id: 'pregnancy_kits', label: 'Pregnancy Kits & Contraceptives', keywords: ['prega news', 'i-pill', 'unwanted 72', 'pregnancy kit'] },
          { id: 'vitality_shilajit', label: 'Shilajit & Vitality Gold', keywords: ['shilajit', 'musli', 'tentex', 'vitality'] },
        ],
      },
      {
        id: 'sub_vitamins_supplements',
        title: 'Vitamins &\nSupplements',
        icon: PHARM_ICONS.vitamins_supplements,
        subTypes: [
          { id: 'multivitamins', label: 'Multivitamins & B-Complex', keywords: ['becosules', 'revital', 'supradyn', 'zincovit', 'multivitamin'] },
          { id: 'calcium_vitd', label: 'Calcium, Iron & Vitamin D3', keywords: ['shelcal', 'calcimax', 'uprise d3', 'dexorange', 'limcee', 'evion'] },
          { id: 'protein_tonics', label: 'Health Drinks & Tonics', keywords: ['protinex', 'horlicks', 'complan', 'ensure', 'liv 52', 'aristozyme'] },
        ],
      },
      {
        id: 'sub_surgical_supplies',
        title: 'Surgical &\nDressings',
        icon: PHARM_ICONS.surgical_supplies,
        subTypes: [
          { id: 'cotton_bandages', label: 'Cotton Rolls, Gauze & Crepe', keywords: ['cotton roll', 'surgical cotton', 'crepe bandage', 'gauze', 'micropore'] },
          { id: 'syringes_cannula', label: 'Syringes, IV Sets & Gloves', keywords: ['syringe', 'dispovan', 'iv set', 'cannula', 'latex gloves', 'mask'] },
        ],
      },
      {
        id: 'sub_ors_glucose',
        title: 'ORS &\nGlucose',
        icon: PHARM_ICONS.ors_glucose,
        subTypes: [
          { id: 'ors_sachets', label: 'WHO ORS Sachets & Tetrapacks', keywords: ['electral', 'ors', 'orlyte', 'orsl', 'rehydration'] },
          { id: 'glucond_energy', label: 'Glucon-D & Energy Drinks', keywords: ['glucon-d', 'glucon d', 'enerzal', 'glucose'] },
        ],
      },
      {
        id: 'sub_ayurvedic',
        title: 'Ayurvedic\nCare',
        icon: PHARM_ICONS.ayurvedic,
        subTypes: [
          { id: 'chyawanprash_honey', label: 'Chyawanprash, Honey & Kadha', keywords: ['chyawanprash', 'dabur honey', 'tulsi drops', 'giloy'] },
          { id: 'churna_tonics', label: 'Triphala, Ashwagandha & Balms', keywords: ['triphala', 'ashwagandha', 'zandu balm', 'amrutanjan', 'kailas jeevan'] },
        ],
      },
      {
        id: 'sub_baby_sanitary',
        title: 'Diapers &\nSanitary Pads',
        icon: PHARM_ICONS.baby_sanitary,
        subTypes: [
          { id: 'sanitary_pads', label: 'Sanitary Pads (Whisper/Stayfree)', keywords: ['whisper', 'stayfree', 'sofy', 'sanitary pad'] },
          { id: 'baby_adult_diapers', label: 'Baby & Adult Diapers', keywords: ['pampers', 'mamy poko', 'huggies', 'friends diaper', 'diaper', 'cerelac'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 3. RATION / KIRANA WHOLESALE MANDI SECTIONS (WITH LEVEL-3 SUB-CATEGORIES)
// Strictly NO perishable green vegetables (kachha sabzi) — Dry Mandi only!
// ============================================================================
export const RATION_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'ration_staples_mandi',
    sectionTitle: 'Atta, Rice, Dal & Dry Mandi Staples',
    cardBgColor: '#FEF6E4',
    items: [
      {
        id: 'sub_atta_maida',
        title: 'Atta, Maida\n& Besan',
        icon: RATION_ICONS.atta_maida_sooji,
        subTypes: [
          { id: 'chakki_atta', label: 'Chakki Atta (10kg/50kg)', keywords: ['atta', 'chakki atta', 'aashirvaad', 'pillsbury', 'wheat flour', 'sharbati'] },
          { id: 'besan_sattu', label: 'Pure Besan & Chana Sattu', keywords: ['besan', 'sattu', 'fortune besan', 'rajdhani besan', 'gram flour'] },
          { id: 'maida_sooji', label: 'Maida, Sooji & Dalia', keywords: ['maida', 'sooji', 'suji', 'rawa', 'dalia', 'cornflour'] },
        ],
      },
      {
        id: 'sub_rice_basmati',
        title: 'Loose & Pack\nBasmati Rice',
        icon: RATION_ICONS.rice_basmati,
        subTypes: [
          { id: 'basmati_bori', label: 'Basmati Rice (1121 / Sella)', keywords: ['basmati', 'india gate', 'daawat', 'sella rice', 'biryani rice'] },
          { id: 'sona_masoori', label: 'Sona Masoori & Kolam Bori', keywords: ['sona masoori', 'kolam rice', 'steam rice', 'parboiled rice', 'miniket'] },
          { id: 'tibar_dubar', label: 'Rozana, Tibar & Mogra Rice', keywords: ['tibar', 'dubar', 'mogra', 'rozana rice', 'broken rice'] },
        ],
      },
      {
        id: 'sub_dal_pulses',
        title: 'Dal, Chana\n& Pulses',
        icon: RATION_ICONS.dal_pulses,
        subTypes: [
          { id: 'toor_moong_masoor', label: 'Toor, Moong & Masoor Dal', keywords: ['toor dal', 'arhar dal', 'moong dal', 'masoor dal', 'urad dal'] },
          { id: 'chana_kabuli', label: 'Chana Dal, Kabuli & Kala Chana', keywords: ['chana dal', 'kabuli chana', 'kala chana', 'besan chana', 'matar'] },
          { id: 'rajma_soyabean', label: 'Rajma, Lobia & Soyabean Chunks', keywords: ['rajma', 'lobia', 'soyabean', 'nutrela', 'soya chunks'] },
        ],
      },
      {
        id: 'sub_onion_garlic_potato',
        title: 'Onion, Garlic\n& Aloo',
        icon: RATION_ICONS.onion_garlic_potato,
        subTypes: [
          { id: 'dry_red_onion', label: 'Dry Onion (50kg Pyaz Sack)', keywords: ['onion', 'pyaz', 'nashik onion', 'red onion'] },
          { id: 'garlic_ginger', label: 'Dry Garlic (Lahsun) & Adrak', keywords: ['garlic', 'lahsun', 'kota garlic', 'ginger', 'adrak'] },
          { id: 'dry_potato', label: 'Dry Mandi Potato (50kg Aloo)', keywords: ['potato', 'aloo', 'jyoti aloo', 'pahari aloo'] },
        ],
      },
    ],
  },
  {
    id: 'ration_masala_oil',
    sectionTitle: 'Wholesale Masalas, Oils, Ghee & Sugar',
    cardBgColor: '#FEF6E4',
    items: [
      {
        id: 'sub_khada_masala',
        title: 'Khada &\nWhole Masala',
        icon: RATION_ICONS.khada_masala,
        subTypes: [
          { id: 'jeera_rai_methi', label: 'Jeera, Rai, Ajwain & Methi', keywords: ['jeera', 'cumin', 'mustard seeds', 'rai', 'methi', 'ajwain', 'saunf'] },
          { id: 'garam_khada', label: 'Elaichi, Laung, Kali Mirch & Dalchini', keywords: ['elaichi', 'cardamom', 'laung', 'cloves', 'kali mirch', 'black pepper', 'dalchini', 'tej patta'] },
          { id: 'dry_chilli_coriander', label: 'Dry Red Chilli & Sabut Dhania', keywords: ['sabut mirch', 'dry red chilli', 'guntur chilli', 'sabut dhania', 'hing'] },
        ],
      },
      {
        id: 'sub_powder_masala',
        title: 'Powder & Ladi\nMasala',
        icon: RATION_ICONS.powder_packet_masala,
        subTypes: [
          { id: 'basic_powders', label: 'Haldi, Mirch & Dhania Powder', keywords: ['haldi', 'turmeric', 'mirch powder', 'dhania powder', 'kashmiri mirch'] },
          { id: 'blended_boxes', label: 'Chicken, Meat, Paneer & Garam Masala', keywords: ['mdh', 'everest', 'catch masala', 'garam masala', 'chicken masala', 'chat masala'] },
          { id: 'hanging_ladi', label: '₹5 / ₹10 Hanging Masala Ladi', keywords: ['masala ladi', '5 rs masala', 'sachet ladi', 'pouch ladi'] },
        ],
      },
      {
        id: 'sub_cooking_oil_ghee',
        title: 'Mustard Oil\n& Pure Ghee',
        icon: RATION_ICONS.cooking_oil_ghee,
        subTypes: [
          { id: 'mustard_oil', label: 'Kachi Ghani Mustard Oil (Tin/Pouch)', keywords: ['mustard oil', 'sarso tel', 'kachi ghani', 'fortune mustard', 'dhara'] },
          { id: 'refined_sunflower', label: 'Refined Soyabean & Sunflower Tin', keywords: ['refined oil', 'sunflower oil', 'soyabean oil', '15 litre tin', 'palm oil'] },
          { id: 'desi_ghee_vanaspati', label: 'Desi Ghee & Vanaspati', keywords: ['ghee', 'amul ghee', 'patanjali ghee', 'gowardhan', 'dalda', 'vanaspati'] },
        ],
      },
      {
        id: 'sub_salt_sugar',
        title: 'Salt, Sugar,\nGud & Poha',
        icon: RATION_ICONS.salt_sugar_jaggery,
        subTypes: [
          { id: 'sugar_gud', label: 'Crystal Sugar (50kg) & Jaggery Gud', keywords: ['sugar', 'chini', 'jaggery', 'gud', 'mishri', 'bura'] },
          { id: 'salt_black_rock', label: 'Iodized Salt, Sendha & Black Salt', keywords: ['tata salt', 'salt', 'namak', 'sendha namak', 'kala namak'] },
          { id: 'poha_murmura_sabudana', label: 'Poha, Murmura & Sabudana', keywords: ['poha', 'chura', 'murmura', 'sabudana', 'papad'] },
        ],
      },
    ],
  },
  {
    id: 'ration_fmcg_kirana',
    sectionTitle: 'Dry Fruits, Tea, Snacks & Cleaning',
    cardBgColor: '#FEF6E4',
    items: [
      {
        id: 'sub_dry_fruits',
        title: 'Dry Fruits &\nMakhana',
        icon: RATION_ICONS.dry_fruits_makhana,
        subTypes: [
          { id: 'badam_kaju', label: 'California Badam & W320 Kaju', keywords: ['badam', 'almonds', 'kaju', 'cashew', 'pista', 'akhrot'] },
          { id: 'makhana_kishmish', label: 'Phool Makhana, Kishmish & Dates', keywords: ['makhana', 'fox nuts', 'kishmish', 'raisins', 'khajoor', 'dates', 'chuhara'] },
        ],
      },
      {
        id: 'sub_tea_coffee',
        title: 'Tea, Coffee\n& Milk',
        icon: RATION_ICONS.tea_coffee_milk,
        subTypes: [
          { id: 'assam_tea', label: 'CTC Tea Leaf Packs & ₹10 Ladi', keywords: ['tea', 'chai patti', 'tata tea', 'red label', 'taaza', 'wagh bakri'] },
          { id: 'coffee_milk_powder', label: 'Instant Coffee & Milk Powder', keywords: ['nescafe', 'bru coffee', 'coffee', 'amulya', 'milk powder', 'bournvita'] },
        ],
      },
      {
        id: 'sub_biscuits_snacks',
        title: 'Biscuits, Maggi\n& Namkeen',
        icon: RATION_ICONS.biscuits_namkeen_snacks,
        subTypes: [
          { id: 'biscuits_rusk', label: 'Biscuit Cartons (Parle-G / Good Day)', keywords: ['biscuit', 'parle-g', 'good day', 'marie gold', 'oreo', 'rusk'] },
          { id: 'maggi_noodles', label: 'Maggi, Yippee, Pasta & Ketchup', keywords: ['maggi', 'noodles', 'yippee', 'pasta', 'kissan ketchup', 'jam'] },
          { id: 'namkeen_bhujia', label: 'Haldiram Namkeen & ₹5 Chips Ladi', keywords: ['namkeen', 'bhujia', 'haldiram', 'bikaji', 'kurkure', 'lays'] },
        ],
      },
      {
        id: 'sub_soaps_detergents',
        title: 'Soaps, Surf\n& Cleaners',
        icon: RATION_ICONS.soaps_detergents_cleaning,
        subTypes: [
          { id: 'detergent_surf', label: 'Detergent Powder & Cake (Surf/Ghadi)', keywords: ['surf excel', 'ghadi', 'tide', 'wheel', 'rin', 'detergent'] },
          { id: 'bath_soaps_shampoo', label: 'Bath Soaps & ₹1 Shampoo Ladi', keywords: ['lifebuoy', 'lux', 'dettol soap', 'santoor', 'clinic plus', 'shampoo ladi'] },
          { id: 'dishwash_phenyl', label: 'Vim Bar, Harpic, Phenyl & Agarbatti', keywords: ['vim', 'harpic', 'lizol', 'phenyl', 'agarbatti', 'matchbox', 'colgate'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 4. BEAUTY & COSMETICS WHOLESALE SECTIONS (20 A-TO-Z SUB-CATEGORIES)
// ============================================================================
export const BEAUTY_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'beauty_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#FDE8F1',
    columns: 4,
    items: [
      {
        id: 'sub_beauty_lips',
        title: 'Lip\nCosmetics',
        icon: BEAUTY_ICONS.lip_cosmetics,
        subTypes: [
          { id: 'liquid_lipsticks', label: 'Matte & Liquid Lipsticks', keywords: ['lipstick', 'liquid lipstick', 'matte lipstick', 'sugar', 'maybelline', 'lakme 9 to 5'] },
          { id: 'lip_gloss_liners', label: 'Lip Gloss, Tint & Liners', keywords: ['lip gloss', 'lip tint', 'lip liner', 'bullet lipstick'] },
        ],
      },
      {
        id: 'sub_beauty_face',
        title: 'Face\nCosmetics',
        icon: BEAUTY_ICONS.face_cosmetics,
        subTypes: [
          { id: 'foundation_concealer', label: 'Foundation & Concealers', keywords: ['foundation', 'fit me', 'concealer', 'mousse', 'bb cream', 'cc cream'] },
          { id: 'compact_blush', label: 'Compact, Blush & Highlighter', keywords: ['compact', 'blush', 'highlighter', 'loose powder', 'primer', 'fixer'] },
        ],
      },
      {
        id: 'sub_beauty_eyes',
        title: 'Eye Makeup',
        icon: BEAUTY_ICONS.eye_makeup,
        subTypes: [
          { id: 'kajal_eyeliner', label: 'Kajal & Waterproof Eyeliner', keywords: ['kajal', 'eyeconic', 'colossal kajal', 'eyeliner', 'sketch liner'] },
          { id: 'mascara_eyeshadow', label: 'Mascara & Eyeshadow Palettes', keywords: ['mascara', 'eyeshadow', 'brow pencil', 'eye makeup'] },
        ],
      },
      {
        id: 'sub_beauty_nails',
        title: 'Nail\nCosmetics',
        icon: BEAUTY_ICONS.nail_cosmetics,
        subTypes: [
          { id: 'nail_polish_gel', label: 'Nail Enamel & Gel Polish', keywords: ['nail polish', 'nail color', 'nail enamel', 'gel polish', 'lakme nail'] },
          { id: 'nail_remover_care', label: 'Nail Remover & Cuticle Care', keywords: ['nail remover', 'remover wipes', 'top coat'] },
        ],
      },
      {
        id: 'sub_beauty_serums',
        title: 'Serums &\nToners',
        icon: BEAUTY_ICONS.serums_toners,
        subTypes: [
          { id: 'vitc_niacinamide', label: 'Vitamin C & Niacinamide Serums', keywords: ['face serum', 'vitamin c serum', 'niacinamide', 'minimalist', 'plum serum', 'salicylic'] },
          { id: 'toners_mists', label: 'Pore Toners & Rose Water', keywords: ['toner', 'rose water', 'pha toner', 'face mist'] },
        ],
      },
      {
        id: 'sub_beauty_sunscreen',
        title: 'Sunscreens,\nCleansers &\nMoisturisers',
        icon: BEAUTY_ICONS.sunscreens_cleansers,
        subTypes: [
          { id: 'spf_sunscreens', label: 'SPF 50 PA++++ Sunscreens', keywords: ['sunscreen', 'spf 50', 'sun expert', 'uv lotion', 'deconstruct sunscreen'] },
          { id: 'cleansers_facewash', label: 'Cleansers, Face Wash & Creams', keywords: ['cetaphil', 'cleanser', 'face wash', 'moisturiser', 'nivea soft', 'ponds'] },
        ],
      },
      {
        id: 'sub_beauty_lipbalm',
        title: 'Lip Balms &\nMasks',
        icon: BEAUTY_ICONS.lip_balms_masks,
        subTypes: [
          { id: 'lip_balms', label: 'Tinted & SPF Lip Balms', keywords: ['lip balm', 'nivea lip', 'maybelline baby lips', 'vaseline lip'] },
          { id: 'lip_masks', label: 'Sleeping Lip Masks & Scrubs', keywords: ['lip mask', 'laneige', 'lip sleeping mask', 'lip scrub'] },
        ],
      },
      {
        id: 'sub_beauty_facialkits',
        title: 'Facial Kits &\nFace Masks',
        icon: BEAUTY_ICONS.facial_kits_masks,
        subTypes: [
          { id: 'salon_facial_kits', label: 'Bridal Gold & Diamond Facial Kits', keywords: ['facial kit', 'vlcc', 'o3+', 'lotus facial', 'gold facial', 'bleach'] },
          { id: 'sheet_clay_masks', label: 'Sheet Masks, Peel-Off & Ubtan', keywords: ['sheet mask', 'garnier mask', 'clay mask', 'peel off', 'multani mitti'] },
        ],
      },
      {
        id: 'sub_beauty_haircolour',
        title: 'Hair Colour\n& Touch-up',
        icon: BEAUTY_ICONS.hair_colour,
        subTypes: [
          { id: 'creme_hair_color', label: 'Ammonia-Free Crème Hair Colour', keywords: ['hair color', 'hair colour', 'garnier black naturals', 'loreal casting', 'streax color'] },
          { id: 'root_touchup_mehndi', label: 'Root Touch-Up Spray & Heena', keywords: ['root touch up', 'nupur henna', 'kali mehndi', 'developer'] },
        ],
      },
      {
        id: 'sub_beauty_hairmasks',
        title: 'Hair Masks\n& Serums',
        icon: BEAUTY_ICONS.hair_masks_serums,
        subTypes: [
          { id: 'hair_serums', label: 'Frizz-Control & Walnut Serums', keywords: ['hair serum', 'streax serum', 'livon', 'biolage serum', 'argan serum'] },
          { id: 'keratin_masks', label: 'Deep Conditioning & Spa Masks', keywords: ['hair mask', 'dove mask', 'hair spa', 'keratin mask'] },
        ],
      },
      {
        id: 'sub_beauty_hairstyling',
        title: 'Hair Styling',
        icon: BEAUTY_ICONS.hair_styling,
        subTypes: [
          { id: 'hair_sprays_mousse', label: 'Hair Holding Sprays & Mousse', keywords: ['hair spray', 'taft', 'tresemme spray', 'mousse', 'heat protectant'] },
          { id: 'styling_gels', label: 'Styling Gels & Edge Control', keywords: ['hair gel', 'gatsby gel', 'set wet', 'styling cream'] },
        ],
      },
      {
        id: 'sub_beauty_shampoos',
        title: 'Shampoos\n& Oils',
        icon: BEAUTY_ICONS.shampoos_oils,
        subTypes: [
          { id: 'shampoos_cond', label: 'Keratin & Anti-Hairfall Shampoos', keywords: ['shampoo', 'loreal shampoo', 'tresemme', 'dove shampoo', 'clinic plus', 'conditioner'] },
          { id: 'hair_oils', label: 'Almond, Onion & Coconut Hair Oils', keywords: ['hair oil', 'bajaj almond', 'parachute', 'indulekha', 'onion hair oil', 'navratna'] },
        ],
      },
      {
        id: 'sub_beauty_bathtools',
        title: 'Bath &\nBody Tools',
        icon: BEAUTY_ICONS.bath_body_tools,
        subTypes: [
          { id: 'loofah_scrubbers', label: 'Bath Loofahs & Silicone Scrubbers', keywords: ['loofah', 'bath sponge', 'body scrubber', 'pumice stone'] },
          { id: 'manicure_pedicure', label: 'Manicure & Pedicure Clipper Kits', keywords: ['manicure', 'pedicure', 'nail cutter set', 'foot scraper'] },
        ],
      },
      {
        id: 'sub_beauty_accessories',
        title: 'Beauty\nAccessories',
        icon: BEAUTY_ICONS.accessories,
        subTypes: [
          { id: 'brushes_blenders', label: 'Makeup Brushes & Beauty Blenders', keywords: ['makeup brush', 'beauty blender', 'makeup sponge', 'powder puff'] },
          { id: 'curlers_tweezers', label: 'Eyelash Curlers & Vanity Pouches', keywords: ['eyelash curler', 'tweezer', 'makeup pouch', 'mirror'] },
        ],
      },
      {
        id: 'sub_beauty_hairbrushes',
        title: 'Hair\nBrushes &\nTools',
        icon: BEAUTY_ICONS.hair_brushes_tools,
        subTypes: [
          { id: 'paddle_round_brushes', label: 'Paddle, Vent & Round Hair Brushes', keywords: ['hair brush', 'paddle brush', 'vega brush', 'comb set'] },
          { id: 'claw_clips_pins', label: 'Claw Clips, Scrunchies & Tic-Tacs', keywords: ['claw clip', 'hair clip', 'scrunchie', 'rubber band', 'bobby pins'] },
        ],
      },
      {
        id: 'sub_beauty_extensions',
        title: 'Hair & Nail\nExtensions',
        icon: BEAUTY_ICONS.extensions,
        subTypes: [
          { id: 'press_on_nails', label: 'Press-On Nail Kits & Nail Glue', keywords: ['press on nails', 'artificial nails', 'nail extension', 'nail glue'] },
          { id: 'false_lashes_hair', label: '3D False Eyelashes & Hair Streaks', keywords: ['false eyelashes', 'eyelash extension', 'hair extension', 'clip in hair'] },
        ],
      },
      {
        id: 'sub_beauty_luxury',
        title: 'Luxury\nBeauty',
        icon: BEAUTY_ICONS.luxury,
        subTypes: [
          { id: 'luxe_skincare', label: 'Gold Elixirs & Night Repair Serums', keywords: ['estee lauder', 'luxury serum', 'night repair', 'kiehls', 'clinique', 'korean glass skin'] },
          { id: 'luxe_cosmetics', label: 'High-End Bridal & Studio Makeup', keywords: ['mac lipstick', 'huda', 'forever52', 'kryolan', 'pac cosmetics'] },
        ],
      },
      {
        id: 'sub_beauty_perfumes',
        title: 'Perfumes &\nGift Sets',
        icon: BEAUTY_ICONS.perfumes_gifts,
        subTypes: [
          { id: 'edp_perfumes', label: 'Luxury Eau De Parfum (EDP) & Attar', keywords: ['perfume', 'bella vita', 'skinn', 'eau de parfum', 'attar', 'pocket perfume'] },
          { id: 'gift_sets_mists', label: 'Fragrance Gift Sets & Body Mists', keywords: ['perfume gift set', 'body mist', 'plum bodylovin', 'fogg', 'denver', 'engage'] },
        ],
      },
      {
        id: 'sub_beauty_womens_grooming',
        title: "Women's\nGrooming",
        icon: BEAUTY_ICONS.womens_grooming,
        subTypes: [
          { id: 'veet_wax_creams', label: 'Hair Removal Creams & Wax Strips', keywords: ['veet', 'wax strips', 'hair removal cream', 'rica wax', 'cold wax'] },
          { id: 'womens_razors', label: 'Venus Razors, Facial Razors & Care', keywords: ['venus razor', 'face razor', 'eyebrow razor', 'vwash'] },
        ],
      },
      {
        id: 'sub_beauty_mens_grooming',
        title: "Men's\nGrooming",
        icon: BEAUTY_ICONS.mens_grooming,
        subTypes: [
          { id: 'hair_wax_beard', label: 'Hair Wax, Clay & Beard Growth Oil', keywords: ['hair wax', 'beardo', 'ustraa', 'beard oil', 'pomade'] },
          { id: 'mens_facewash_shave', label: "Men's Charcoal Face Wash & Shaving", keywords: ['nivea men', 'garnier men', 'shaving foam', 'gillette', 'aftershave'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 5. KIDS, BABY CARE & TOYS WHOLESALE SECTIONS (18 A-TO-Z ACROSS 6 SECTIONS)
// ============================================================================
export const KIDS_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'kids_diapering',
    sectionTitle: 'Diapering made easy',
    cardBgColor: '#E2F3FB',
    columns: 3,
    items: [
      {
        id: 'sub_kids_diaper',
        title: 'Diaper',
        icon: KIDS_ICONS.diaper,
        subTypes: [
          { id: 'diaper_pants', label: 'Baby Diaper Pants (S / M / L / XL)', keywords: ['pampers', 'mamypoko', 'huggies', 'diaper', 'baby pants'] },
          { id: 'newborn_diapers', label: 'Newborn Taped & Swim Diapers', keywords: ['newborn diaper', 'taped diaper', 'cloth diaper'] },
        ],
      },
      {
        id: 'sub_kids_wipes',
        title: 'Wipes & Dry\nSheets',
        icon: KIDS_ICONS.wipes_drysheets,
        subTypes: [
          { id: 'baby_wet_wipes', label: '99% Water & Aloe Baby Wipes', keywords: ['baby wipes', 'wet wipes', 'himalaya wipes', 'littles wipes', 'water wipes'] },
          { id: 'dry_sheets_mats', label: 'Waterproof Baby Dry Sheets', keywords: ['dry sheet', 'bed protector', 'changing mat'] },
        ],
      },
      {
        id: 'sub_kids_rashcream',
        title: 'Rash Cream &\nPowder',
        icon: KIDS_ICONS.rashcream_powder,
        subTypes: [
          { id: 'diaper_rash_cream', label: 'Zinc Oxide Diaper Rash Creams', keywords: ['rash cream', 'diaper rash', 'sebamed rash', 'himalaya rash'] },
          { id: 'dusting_baby_powder', label: 'Soothing Prickly Heat & Baby Powder', keywords: ['baby powder', 'johnsons powder', 'talc free powder'] },
        ],
      },
    ],
  },
  {
    id: 'kids_feeding',
    sectionTitle: 'Feeding essentials',
    cardBgColor: '#E2F3FB',
    columns: 3,
    items: [
      {
        id: 'sub_kids_babyfood',
        title: 'Baby Food',
        icon: KIDS_ICONS.baby_food,
        subTypes: [
          { id: 'cerelac_cereals', label: 'Cerelac, Ceregrow & Ragi Cereals', keywords: ['cerelac', 'ceregrow', 'slurrp farm', 'baby cereal', 'baby food'] },
          { id: 'infant_formula', label: 'Lactogen, Nan Pro & Dexolac Tin', keywords: ['lactogen', 'nan pro', 'similac', 'dexolac', 'infant formula'] },
        ],
      },
      {
        id: 'sub_kids_feedingbottles',
        title: 'Feeding bottles\n& teats',
        icon: KIDS_ICONS.feeding_bottles,
        subTypes: [
          { id: 'feeding_bottles', label: 'Anti-Colic Steel & PP Feeding Bottles', keywords: ['feeding bottle', 'philips avent', 'pigeon bottle', 'chicco bottle', 'milk bottle'] },
          { id: 'silicone_teats', label: 'Peristaltic Silicone Nipples & Teats', keywords: ['silicone nipple', 'bottle teat', 'replacement nipple'] },
        ],
      },
      {
        id: 'sub_kids_feedingacc',
        title: 'Feeding\naccessories',
        icon: KIDS_ICONS.feeding_accessories,
        subTypes: [
          { id: 'sippy_cups_bowls', label: 'Sippy Cups, Bowls & Feeding Spoons', keywords: ['sippy cup', 'spout cup', 'feeding bowl', 'silicone spoon', 'fruit nibbler'] },
          { id: 'pacifiers_bibs', label: 'Soothers, Pacifiers & Waterproof Bibs', keywords: ['pacifier', 'soother', 'baby bib', 'breast pump'] },
        ],
      },
    ],
  },
  {
    id: 'kids_bodyskin',
    sectionTitle: 'Body, skin & face care',
    cardBgColor: '#E2F3FB',
    columns: 3,
    items: [
      {
        id: 'sub_kids_lotions',
        title: 'Lotions, Creams\n& More',
        icon: KIDS_ICONS.lotions_creams,
        subTypes: [
          { id: 'baby_lotions', label: 'Daily Moisturising Baby Lotions', keywords: ['baby lotion', 'cetaphil baby', 'himalaya lotion', 'aveeno baby'] },
          { id: 'baby_face_creams', label: 'Chapped Cheek & Face Creams', keywords: ['baby cream', 'sebamed cream', 'mamaearth baby cream', 'milk cream'] },
        ],
      },
      {
        id: 'sub_kids_soapwash',
        title: 'Soap, Wash &\nShampoo',
        icon: KIDS_ICONS.soap_wash_shampoo,
        subTypes: [
          { id: 'tearfree_shampoo', label: 'Tear-Free Baby Shampoos & Body Wash', keywords: ['baby shampoo', 'no more tears', 'baby wash', 'head to toe wash'] },
          { id: 'syndet_baby_soaps', label: 'Tedibar, Syndet & Moisturising Bars', keywords: ['baby soap', 'tedibar', 'himalaya baby soap', 'johnsons soap'] },
        ],
      },
      {
        id: 'sub_kids_powderoils',
        title: 'Powder & Oils',
        icon: KIDS_ICONS.powder_oils,
        subTypes: [
          { id: 'massage_oils', label: 'Lal Tail, Badam & Olive Massage Oils', keywords: ['baby oil', 'lal tail', 'figaro olive oil', 'massage oil', 'badam rogan'] },
          { id: 'calming_powders', label: 'Cornstarch & Lavender Baby Powders', keywords: ['cornstarch powder', 'baby talc', 'dusting powder'] },
        ],
      },
    ],
  },
  {
    id: 'kids_hygiene',
    sectionTitle: 'Hygiene & grooming',
    cardBgColor: '#E2F3FB',
    columns: 3,
    items: [
      {
        id: 'sub_kids_oralcare',
        title: 'Oral Care',
        icon: KIDS_ICONS.oral_care,
        subTypes: [
          { id: 'kids_toothpaste', label: 'Fluoride-Free Strawberry Toothpaste', keywords: ['kids toothpaste', 'colgate kids', 'mamaearth toothpaste', 'chicco toothpaste'] },
          { id: 'kids_toothbrushes', label: 'Silicone Finger & Kids Toothbrushes', keywords: ['kids toothbrush', 'finger brush', 'baby toothbrush'] },
        ],
      },
      {
        id: 'sub_kids_detergents',
        title: 'Liquid\nDetergents &\nCleansers',
        icon: KIDS_ICONS.liquid_detergents,
        subTypes: [
          { id: 'baby_laundry_wash', label: 'Bio-Enzyme Baby Laundry Detergents', keywords: ['baby detergent', 'mee mee detergent', 'baby laundry', 'fabric conditioner'] },
          { id: 'bottle_veg_cleansers', label: 'Feeding Bottle & Toy Liquid Cleansers', keywords: ['liquid cleanser', 'bottle cleanser', 'pigeon cleanser', ' bottle brush'] },
        ],
      },
      {
        id: 'sub_kids_grooming',
        title: 'Grooming\nessentials',
        icon: KIDS_ICONS.grooming_essentials,
        subTypes: [
          { id: 'nail_clipper_kits', label: 'Safety Nail Clippers & Scissors Kits', keywords: ['baby nail clipper', 'baby grooming kit', 'safety scissors', 'nasal aspirator'] },
          { id: 'soft_brushes_buds', label: 'Soft Bristle Hair Brushes & Ear Buds', keywords: ['baby hair brush', 'baby comb', 'safety cotton buds'] },
        ],
      },
    ],
  },
  {
    id: 'kids_gifts_apparel',
    sectionTitle: 'Gifts for little ones',
    cardBgColor: '#E2F3FB',
    columns: 3,
    items: [
      {
        id: 'sub_kids_giftsets',
        title: 'Gift Sets',
        icon: KIDS_ICONS.gift_sets,
        subTypes: [
          { id: 'newborn_gift_boxes', label: 'Newborn Baby Care Gift Hampers', keywords: ['baby gift set', 'himalaya gift pack', 'johnsons gift box', 'newborn hamper'] },
          { id: 'grooming_hampers', label: 'Luxury Shower & Welcome Baby Baskets', keywords: ['baby basket', 'shower gift'] },
        ],
      },
      {
        id: 'sub_kids_apparel',
        title: 'Apparel',
        icon: KIDS_ICONS.apparel,
        subTypes: [
          { id: 'rompers_onesies', label: '100% Cotton Rompers, Jablas & Onesies', keywords: ['romper', 'onesie', 'baby suit', 'jabla', 'newborn clothes', 'kids wear'] },
          { id: 'kids_frocks_sets', label: 'Kids Co-ord Sets, Frocks & Nightwear', keywords: ['frock', 'kids t-shirt', 'boys set', 'baby dress'] },
        ],
      },
      {
        id: 'sub_kids_accessories',
        title: 'Accessories',
        icon: KIDS_ICONS.accessories,
        subTypes: [
          { id: 'hooded_blankets', label: 'Hooded Blankets & Muslin Swaddles', keywords: ['baby blanket', 'hooded wrapper', 'swaddle', 'sleeping bag'] },
          { id: 'booties_mittens_caps', label: 'Caps, Mittens, Booties & Mosquito Nets', keywords: ['mittens', 'booties', 'baby cap', 'mosquito net', 'baby pillow'] },
        ],
      },
    ],
  },
  {
    id: 'kids_toys',
    sectionTitle: 'Baby & toddler toys',
    cardBgColor: '#E2F3FB',
    columns: 3,
    items: [
      {
        id: 'sub_kids_stackingtoys',
        title: 'Stacking &\nPull-Along Toys',
        icon: KIDS_ICONS.stacking_toys,
        subTypes: [
          { id: 'activity_walkers', label: 'Sit-to-Stand Activity Walkers & Ride-Ons', keywords: ['baby walker', 'push walker', 'pull along toy', 'tricycle'] },
          { id: 'stacking_rings_blocks', label: 'Stacking Rings, Sorters & Building Blocks', keywords: ['stacking rings', 'rock a stack', 'building blocks', 'shape sorter'] },
        ],
      },
      {
        id: 'sub_kids_musicaltoys',
        title: 'Light & Musical\nToys',
        icon: KIDS_ICONS.musical_toys,
        subTypes: [
          { id: 'dancing_cactus_talking', label: 'Dancing Cactus, Talking Cat & Plush', keywords: ['dancing cactus', 'talking tom', 'musical toy', 'plush toy'] },
          { id: 'xylophones_drums', label: 'Baby Xylophones, Pianos & Cot Mobiles', keywords: ['xylophone', 'baby piano', 'cot mobile', 'light toy'] },
        ],
      },
      {
        id: 'sub_kids_rattles',
        title: 'Rattles',
        icon: KIDS_ICONS.rattles,
        subTypes: [
          { id: 'rattle_sets', label: 'Non-Toxic Musical Rattle Gift Sets', keywords: ['rattle', 'baby rattle', 'shaker toy', 'jhumar'] },
          { id: 'silicone_teethers', label: 'BPA-Free Water & Silicone Teethers', keywords: ['teether', 'teething ring', 'soothing teether'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 6. COLD DRINKS, COFFEE, WATER & BEVERAGES WHOLESALE SECTIONS (12 A-TO-Z)
// ============================================================================
export const COLD_DRINKS_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'drinks_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#E0F7FA',
    columns: 4,
    items: [
      {
        id: 'sub_drinks_cola',
        title: 'Coca-Cola,\nPepsi & Campa',
        icon: COLD_DRINKS_ICONS.cola_fizzy,
        subTypes: [
          { id: 'coke_thumsup', label: 'Coca-Cola & Thums Up Crates', keywords: ['coca cola', 'coke', 'thums up', 'thumbs up'] },
          { id: 'pepsi_campa', label: 'Pepsi & Campa Cola Wholesale Peti', keywords: ['pepsi', 'campa', 'campa cola', 'cola'] },
        ],
      },
      {
        id: 'sub_drinks_lemon_orange',
        title: 'Sprite, Fanta\n& Mirinda',
        icon: COLD_DRINKS_ICONS.lemon_orange,
        subTypes: [
          { id: 'sprite_7up_limca', label: 'Sprite, 7Up, Limca & Mountain Dew', keywords: ['sprite', '7up', 'limca', 'mountain dew', 'lemon drink'] },
          { id: 'fanta_mirinda_fizz', label: 'Fanta, Mirinda & Appy Fizz', keywords: ['fanta', 'mirinda', 'appy fizz', 'frooti fizz'] },
        ],
      },
      {
        id: 'sub_drinks_energy',
        title: 'Sting, Red Bull\n& Monster',
        icon: COLD_DRINKS_ICONS.energy,
        subTypes: [
          { id: 'sting_predator', label: 'Sting Energy (₹20 Peti) & Charged', keywords: ['sting', 'charged', 'predator', 'hell energy'] },
          { id: 'redbull_monster', label: 'Red Bull & Monster Energy Trays', keywords: ['red bull', 'monster energy', 'energy drink'] },
        ],
      },
      {
        id: 'sub_drinks_cans',
        title: 'Diet Coke &\nParty Cans',
        icon: COLD_DRINKS_ICONS.party_cans,
        subTypes: [
          { id: 'sleek_cans_300ml', label: '300ml Sleek Cans (24-Can Tray)', keywords: ['can', 'coke can', 'pepsi can', 'thums up can', '300ml can'] },
          { id: 'diet_zero_sugar', label: 'Diet Coke, Coke Zero & Pepsi Black', keywords: ['diet coke', 'zero sugar', 'pepsi black', 'coke zero'] },
        ],
      },
      {
        id: 'sub_drinks_coldcoffee',
        title: 'Nescafé &\nCold Coffee',
        icon: COLD_DRINKS_ICONS.cold_coffee,
        subTypes: [
          { id: 'nescafe_cans', label: 'Nescafé Chilled Latte, Mocha & Hazelnut', keywords: ['nescafe', 'cold coffee', 'chilled latte', 'intense cafe', 'iced coffee'] },
          { id: 'starbucks_sleepyowl', label: "Starbucks, Sleepy Owl & Hershey's Coffee", keywords: ['starbucks', 'sleepy owl', 'kopiko', 'frappuccino'] },
        ],
      },
      {
        id: 'sub_drinks_mango_juices',
        title: 'Maaza, Frooti\n& Fruit Juices',
        icon: COLD_DRINKS_ICONS.mango_juices,
        subTypes: [
          { id: 'maaza_slice_frooti', label: 'Maaza, Slice & Frooti Mango Peti', keywords: ['maaza', 'frooti', 'slice', 'mango drink'] },
          { id: 'real_tropicana_1l', label: 'Real Fruit Power & Tropicana 1L Packs', keywords: ['real juice', 'tropicana', 'mixed fruit', 'cranberry juice', 'orange juice'] },
        ],
      },
      {
        id: 'sub_drinks_milkshakes',
        title: 'Amul Kool,\nLassi & Shakes',
        icon: COLD_DRINKS_ICONS.milkshakes_lassi,
        subTypes: [
          { id: 'amul_kool_lassi', label: 'Amul Kool, Rose Milk, Lassi & Chaas', keywords: ['amul kool', 'amul lassi', 'amul masti', 'buttermilk', 'chaas', 'badam milk'] },
          { id: 'cavins_hersheys_shake', label: "Cavin's, Hershey's & Winkin Cow Shakes", keywords: ['cavins', 'hersheys milkshake', 'milkshake', 'winkin cow', 'smoodh'] },
        ],
      },
      {
        id: 'sub_drinks_icedtea',
        title: 'Iced Tea &\nPaper Boat',
        icon: COLD_DRINKS_ICONS.iced_tea_paperboat,
        subTypes: [
          { id: 'lipton_iced_tea', label: 'Lipton Lemon & Peach Iced Tea', keywords: ['ice tea', 'iced tea', 'lipton', 'kombucha'] },
          { id: 'paperboat_ethnic', label: 'Paper Boat Aamras, Aam Panna & Jaljeera', keywords: ['paper boat', 'aamras', 'aam panna', 'jaljeera', 'coconut water'] },
        ],
      },
      {
        id: 'sub_drinks_water',
        title: 'Bisleri, Kinley\n& Water Bottles',
        icon: COLD_DRINKS_ICONS.mineral_water,
        subTypes: [
          { id: 'bisleri_1l_2l', label: 'Bisleri, Kinley & Aquafina (1L / 2L Case)', keywords: ['bisleri', 'kinley', 'aquafina', 'bailley', 'mineral water', 'water bottle'] },
          { id: 'event_water_250ml', label: '250ml & 500ml Event Water Cartons', keywords: ['250ml water', '500ml water', 'drinking water box'] },
        ],
      },
      {
        id: 'sub_drinks_soda_mixers',
        title: 'Club Soda,\nTonic & Mixers',
        icon: COLD_DRINKS_ICONS.soda_mixers,
        subTypes: [
          { id: 'club_soda', label: 'Kinley, Bisleri & Lehar Club Soda', keywords: ['club soda', 'kinley soda', 'bisleri soda', 'sparkling water'] },
          { id: 'tonic_ginger_malt', label: 'Schweppes Ginger Ale, Tonic & Coolberg', keywords: ['schweppes', 'ginger ale', 'tonic water', 'coolberg', 'non alcoholic beer', 'mojito'] },
        ],
      },
      {
        id: 'sub_drinks_sports_glucose',
        title: 'Gatorade, ORS\n& Glucose',
        icon: COLD_DRINKS_ICONS.sports_glucose,
        subTypes: [
          { id: 'gatorade_prime', label: 'Gatorade, Ocean Fruit Water & Sports', keywords: ['gatorade', 'sports drink', 'ocean water', 'electrolyte drink'] },
          { id: 'glucond_ors_tetra', label: 'Glucon-D & ORSL Ready-to-Drink Tetra', keywords: ['glucon-d', 'orsl', 'glucose drink'] },
        ],
      },
      {
        id: 'sub_drinks_syrups_squashes',
        title: 'Rooh Afza,\nTang & Sharbat',
        icon: COLD_DRINKS_ICONS.syrups_sharbat,
        subTypes: [
          { id: 'roohafza_squashes', label: 'Rooh Afza, Kissan Squash & Mapro Crush', keywords: ['rooh afza', 'sharbat', 'kissan squash', 'mapro', 'rose syrup'] },
          { id: 'tang_rasna_instant', label: 'Tang, Rasna & Nimbu Pani Pouches', keywords: ['tang', 'rasna', 'instant drink'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 7. FASHION & APPAREL WHOLESALE SECTIONS (16 A-TO-Z SUB-CATEGORIES)
// ============================================================================
export const FASHION_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'fashion_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#FDF2F0',
    columns: 4,
    items: [
      {
        id: 'sub_fash_mens_tshirts',
        title: "Men's T-Shirts\n& Polos",
        icon: FASHION_ICONS.mens_tshirts,
        subTypes: [
          { id: 'oversized_tees', label: 'Oversized & Drop-Shoulder Tees', keywords: ['oversized t-shirt', 'graphic tee', 'drop shoulder', 'round neck tee'] },
          { id: 'collar_polos', label: 'Matty & Cotton Collar Polos', keywords: ['polo t-shirt', 'collar tee', 'matty polo', 'uspa style'] },
        ],
      },
      {
        id: 'sub_fash_mens_shirts',
        title: "Men's Casual &\nFormal Shirts",
        icon: FASHION_ICONS.mens_shirts,
        subTypes: [
          { id: 'casual_checks_printed', label: 'Cotton Checks, Linen & Printed Shirts', keywords: ['casual shirt', 'check shirt', 'linen shirt', 'printed shirt'] },
          { id: 'formal_solid_shirts', label: 'Solid Office & Partywear Shirts', keywords: ['formal shirt', 'solid shirt', 'satin shirt', 'white shirt'] },
        ],
      },
      {
        id: 'sub_fash_mens_jeans',
        title: "Men's Jeans,\nCargos & Pants",
        icon: FASHION_ICONS.mens_jeans,
        subTypes: [
          { id: 'denim_jeans', label: 'Baggy, Slim & Stretchable Denim Jeans', keywords: ['mens jeans', 'denim jeans', 'baggy jeans', 'anky jeans'] },
          { id: 'cargos_trousers', label: '6-Pocket Cargos, Chinos & Formal Pants', keywords: ['cargo pant', 'chinos', 'cotton trouser', 'formal pant'] },
        ],
      },
      {
        id: 'sub_fash_mens_ethnic',
        title: "Men's Kurtas\n& Ethnic Wear",
        icon: FASHION_ICONS.mens_ethnic,
        subTypes: [
          { id: 'festive_kurtas', label: 'Chikankari, Silk & Cotton Kurta Pyjama', keywords: ['mens kurta', 'kurta pyjama', 'chikankari kurta', 'pathani'] },
          { id: 'nehru_sherwani', label: 'Modi Nehru Jackets & Indo-Western', keywords: ['nehru jacket', 'modi jacket', 'sherwani', 'bandhgala'] },
        ],
      },
      {
        id: 'sub_fash_womens_kurtis',
        title: "Women's Kurtis\n& Suit Sets",
        icon: FASHION_ICONS.womens_kurtis,
        subTypes: [
          { id: 'daily_rayon_kurtis', label: 'Jaipuri Cotton & Rayon Daily Kurtis', keywords: ['kurti', 'rayon kurti', 'cotton kurti', 'short kurti'] },
          { id: 'anarkali_pant_sets', label: '3-Pc Kurti-Pant-Dupatta & Anarkali Sets', keywords: ['kurta set', 'anarkali', 'suit set', 'nayra cut', 'sharara'] },
        ],
      },
      {
        id: 'sub_fash_womens_sarees',
        title: 'Sarees, Lehenga\n& Blouses',
        icon: FASHION_ICONS.womens_sarees,
        subTypes: [
          { id: 'silk_cotton_sarees', label: 'Banarasi Silk, Organza & Cotton Sarees', keywords: ['saree', 'banarasi saree', 'silk saree', 'organza saree', 'cotton saree'] },
          { id: 'lehenga_blouses', label: 'Bridal Lehenga Choli & Readymade Blouses', keywords: ['lehenga', 'chaniya choli', 'readymade blouse', 'stretchable blouse'] },
        ],
      },
      {
        id: 'sub_fash_womens_western',
        title: "Women's Tops,\nDresses & Co-ords",
        icon: FASHION_ICONS.womens_western,
        subTypes: [
          { id: 'crop_tops_tunics', label: 'Korean Tops, Ribbed Tees & Tunics', keywords: ['crop top', 'womens top', 'tunic', 'womens t-shirt'] },
          { id: 'midi_dresses_coords', label: 'Floral Midi Dresses, Gowns & Co-ord Sets', keywords: ['midi dress', 'western dress', 'co-ord set', 'bodycon'] },
        ],
      },
      {
        id: 'sub_fash_womens_bottoms',
        title: "Women's Jeans,\nPalazzo & Leggings",
        icon: FASHION_ICONS.womens_bottoms,
        subTypes: [
          { id: 'womens_jeans_jeggings', label: 'High-Waist Wide-Leg Jeans & Jeggings', keywords: ['womens jeans', 'wide leg jeans', 'jegging', 'mom jeans'] },
          { id: 'palazzos_leggings', label: 'Cotton Palazzos, Lycra Leggings & Skirts', keywords: ['palazzo', 'leggings', 'ankle leggings', 'plazo', 'skirt'] },
        ],
      },
      {
        id: 'sub_fash_boys_wear',
        title: "Boys' T-Shirts,\nShirts & Sets",
        icon: FASHION_ICONS.boys_wear,
        subTypes: [
          { id: 'boys_baba_suits', label: "Boys' T-Shirt & Denim Shorts Baba Suits", keywords: ['boys set', 'baba suit', 'boys t-shirt', 'boys shorts'] },
          { id: 'boys_party_ethnic', label: "Boys' Party Shirts, Jeans & Kurta Sets", keywords: ['boys shirt', 'boys jeans', 'boys kurta', 'kids coat suit'] },
        ],
      },
      {
        id: 'sub_fash_girls_wear',
        title: "Girls' Frocks,\nDresses & Ethnic",
        icon: FASHION_ICONS.girls_wear,
        subTypes: [
          { id: 'girls_party_frocks', label: "Girls' Net Princess Frocks & Midi Dresses", keywords: ['girls frock', 'party frock', 'kids dress', 'princess dress'] },
          { id: 'girls_lehenga_sets', label: "Girls' Lehenga Choli, Top-Skirt & Jumpsuits", keywords: ['girls lehenga', 'kids ethnic', 'girls top', 'jumpsuit'] },
        ],
      },
      {
        id: 'sub_fash_activewear',
        title: 'Trackpants, Shorts\n& Activewear',
        icon: FASHION_ICONS.activewear,
        subTypes: [
          { id: 'trackpants_joggers', label: 'NS Lycra Trackpants & Sports Joggers', keywords: ['trackpant', 'lower', 'jogger', 'sports lower'] },
          { id: 'gym_shorts_tights', label: 'Dry-Fit Shorts, Bermudas & Gym Tights', keywords: ['gym shorts', 'bermuda', 'boxer shorts', 'activewear'] },
        ],
      },
      {
        id: 'sub_fash_innerwear',
        title: "Men's & Women's\nInnerwear",
        icon: FASHION_ICONS.innerwear,
        subTypes: [
          { id: 'mens_vests_briefs', label: 'Cotton Baniyan Vests, Briefs & Trunks', keywords: ['vest', 'baniyan', 'brief', 'trunks', 'jockey', 'rupa', 'lux cozi'] },
          { id: 'womens_lingerie_slips', label: 'Everyday Bras, Panties, Camisoles & Slips', keywords: ['bra', 'panty', 'camisole', 'innerwear', 'shapewear'] },
        ],
      },
      {
        id: 'sub_fash_nightwear',
        title: 'Nightwear &\nLoungewear',
        icon: FASHION_ICONS.nightwear,
        subTypes: [
          { id: 'cotton_night_suits', label: 'Printed Cotton Night Suits & Pyjama Sets', keywords: ['night suit', 'pyjama set', 'loungewear', 'sleepwear'] },
          { id: 'maxi_nighties', label: 'Soft Cotton Maxi Nighties & Robes', keywords: ['nighty', 'maxi gown', 'housecoat'] },
        ],
      },
      {
        id: 'sub_fash_winterwear',
        title: 'Hoodies, Jackets\n& Winterwear',
        icon: FASHION_ICONS.winterwear,
        subTypes: [
          { id: 'hoodies_sweatshirts', label: 'Fleece Hoodies, Sweatshirts & Pullovers', keywords: ['hoodie', 'sweatshirt', 'pullover', 'sweater', 'cardigan'] },
          { id: 'jackets_thermals', label: 'Puffer, Denim, Bomber Jackets & Thermals', keywords: ['jacket', 'puffer jacket', 'denim jacket', 'bomber', 'thermal wear'] },
        ],
      },
      {
        id: 'sub_fash_fabrics',
        title: 'Unstitched Suits\n& Fabrics',
        icon: FASHION_ICONS.fabrics,
        subTypes: [
          { id: 'unstitched_salwar', label: 'Unstitched Cotton & Embroidered Suit Cuts', keywords: ['dress material', 'unstitched suit', 'salwar piece', 'than fabric'] },
          { id: 'shirting_suiting', label: "Men's Shirting & Suiting Combo Gift Boxes", keywords: ['shirting', 'suiting', 'raymond', 'sambalpuri', 'fabric roll'] },
        ],
      },
      {
        id: 'sub_fash_accessories',
        title: 'Dupattas, Belts,\nCaps & Hankies',
        icon: FASHION_ICONS.accessories,
        subTypes: [
          { id: 'dupattas_stoles', label: 'Phulkari, Chiffon, Cotton Dupattas & Stoles', keywords: ['dupatta', 'stole', 'scarf', 'chunni', 'gamcha'] },
          { id: 'belts_caps_hankies', label: 'Leather Belts, Wallets, Caps & Handkerchiefs', keywords: ['belt', 'wallet', 'baseball cap', 'handkerchief', 'rumal'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 8. FOOTWEAR — SHOES, CROCS & CHAPPALS WHOLESALE SECTIONS (12 A-TO-Z)
// ============================================================================
export const FOOTWEAR_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'footwear_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#EEF2FF',
    columns: 4,
    items: [
      {
        id: 'sub_foot_crocs',
        title: 'Crocs, Clogs &\nGarden Shoes',
        icon: FOOTWEAR_ICONS.crocs_clogs,
        subTypes: [
          { id: 'eva_crocs_clogs', label: 'Classic EVA Crocs Clogs & Jibbitz Clogs', keywords: ['crocs', 'clog', 'eva clog', 'garden shoe'] },
          { id: 'monsoon_sandals', label: 'Waterproof Monsoon Clogs & Floaters', keywords: ['waterproof shoe', 'rain sandal', 'literide'] },
        ],
      },
      {
        id: 'sub_foot_mens_sports',
        title: "Men's Sports &\nRunning Shoes",
        icon: FOOTWEAR_ICONS.mens_sports,
        subTypes: [
          { id: 'running_gym_shoes', label: 'Mesh Running, Walking & Gym Trainers', keywords: ['sports shoe', 'running shoe', 'campus', 'sparx', 'action shoe'] },
          { id: 'cricket_football_studs', label: 'Turf, Cricket & Marathon Sports Shoes', keywords: ['turf shoe', 'studs', 'badminton shoe'] },
        ],
      },
      {
        id: 'sub_foot_mens_sneakers',
        title: "Men's Sneakers\n& Loafers",
        icon: FOOTWEAR_ICONS.mens_sneakers,
        subTypes: [
          { id: 'chunky_sneakers', label: 'White Chunky Sneakers & High-Tops', keywords: ['sneaker', 'white shoe', 'casual shoe', 'canvas shoe'] },
          { id: 'driving_loafers', label: 'Slip-On Loafers, Moccasins & Party Shoes', keywords: ['loafer', 'moccasin', 'slip on shoe'] },
        ],
      },
      {
        id: 'sub_foot_mens_chappals',
        title: "Men's Chappals,\nSliders & Flip-Flops",
        icon: FOOTWEAR_ICONS.mens_chappals,
        subTypes: [
          { id: 'hawaii_flipflops', label: 'Hawaii Chappals & Printed Flip-Flops', keywords: ['chappal', 'flip flop', 'hawaii', 'relaxo', 'bahamas', 'paragon'] },
          { id: 'pool_sliders', label: 'EVA Pool Sliders & Cork Slippers', keywords: ['slider', 'slides', 'slipper'] },
        ],
      },
      {
        id: 'sub_foot_mens_formal',
        title: "Men's Formal &\nLeather Sandals",
        icon: FOOTWEAR_ICONS.mens_formal,
        subTypes: [
          { id: 'formal_derby_oxford', label: 'Office Derby, Oxford & Safety Boots', keywords: ['formal shoe', 'leather shoe', 'boot', 'safety shoe'] },
          { id: 'leather_sandals', label: 'Leather Sandals, Kolhapuris & Floaters', keywords: ['mens sandal', 'floater', 'leather chappal', 'kolhapuri'] },
        ],
      },
      {
        id: 'sub_foot_womens_heels',
        title: "Women's Heels,\nWedges & Bridal",
        icon: FOOTWEAR_ICONS.womens_heels,
        subTypes: [
          { id: 'block_heels_pumps', label: 'Party Block Heels, Stilettos & Pumps', keywords: ['heels', 'block heel', 'pencil heel', 'party sandal'] },
          { id: 'bridal_wedges', label: 'Embellished Bridal & Ethnic Wedges', keywords: ['wedge heel', 'bridal sandal', 'fancy heel'] },
        ],
      },
      {
        id: 'sub_foot_womens_flats',
        title: "Women's Flats,\nJuttis & Bellies",
        icon: FOOTWEAR_ICONS.womens_flats,
        subTypes: [
          { id: 'punjabi_juttis', label: 'Embroidered Punjabi Juttis & Mojris', keywords: ['jutti', 'mojri', 'ethnic flat', 'kolhapuri women'] },
          { id: 'ballerina_bellies', label: 'Soft Ballerina Bellies & Office Flats', keywords: ['bellies', 'belly shoe', 'womens flat', 'flat sandal'] },
        ],
      },
      {
        id: 'sub_foot_womens_sneakers',
        title: "Women's Sneakers\n& Sports Shoes",
        icon: FOOTWEAR_ICONS.womens_sneakers,
        subTypes: [
          { id: 'womens_pastel_sneakers', label: 'Pastel Lace-Up & Platform Sneakers', keywords: ['womens sneaker', 'girls sneaker', 'platform shoe'] },
          { id: 'womens_walking_shoes', label: 'Slip-On Walking & Fitness Shoes', keywords: ['womens sports shoe', 'walking shoe'] },
        ],
      },
      {
        id: 'sub_foot_womens_chappals',
        title: "Women's Daily\nChappals & Sliders",
        icon: FOOTWEAR_ICONS.womens_chappals,
        subTypes: [
          { id: 'eva_cloud_slippers', label: 'Soft Cloud Pillow Sliders & Home Slippers', keywords: ['pillow slider', 'womens slipper', 'bathroom slipper'] },
          { id: 'ortho_daily_chappals', label: 'Doctor Ortho & Daily PU Chappals', keywords: ['doctor chappal', 'ortho slipper', 'womens chappal'] },
        ],
      },
      {
        id: 'sub_foot_kids_shoes',
        title: "Boys' & Girls'\nKids Footwear",
        icon: FOOTWEAR_ICONS.kids_shoes,
        subTypes: [
          { id: 'kids_led_sneakers', label: 'LED Light-Up Shoes & Musical Chu-Chu', keywords: ['kids shoe', 'led shoe', 'chu chu shoe', 'baby shoe'] },
          { id: 'kids_crocs_sandals', label: 'Cartoon Kids Crocs Clogs & Sandals', keywords: ['kids crocs', 'kids sandal', 'boys sandal'] },
        ],
      },
      {
        id: 'sub_foot_school_shoes',
        title: 'School Shoes\n(Black & White)',
        icon: FOOTWEAR_ICONS.school_shoes,
        subTypes: [
          { id: 'black_school_shoes', label: 'Black Velcro & Lace School Shoes', keywords: ['school shoe', 'black school shoe', 'gola shoe', 'bata school'] },
          { id: 'white_pt_canvas', label: 'White PT Canvas & House Uniform Shoes', keywords: ['white school shoe', 'pt shoe', 'canvas school'] },
        ],
      },
      {
        id: 'sub_foot_socks_care',
        title: 'Socks, Polish\n& Shoe Care',
        icon: FOOTWEAR_ICONS.socks_care,
        subTypes: [
          { id: 'cotton_socks_dozen', label: 'Ankle, Sports & School Socks (Dozen Pack)', keywords: ['socks', 'ankle socks', 'school socks', 'loafer socks'] },
          { id: 'polish_insoles', label: 'Shoe Polish, Shiner Sponges & Gel Insoles', keywords: ['shoe polish', 'cherry blossom', 'shoe brush', 'insole'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 9. HOME DECOR & FURNISHINGS WHOLESALE SECTIONS (12 A-TO-Z SUB-CATEGORIES)
// ============================================================================
export const DECOR_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'decor_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#F5F0FF',
    columns: 4,
    items: [
      {
        id: 'sub_decor_bedsheets',
        title: 'Bedsheets, Dohars\n& Blankets',
        icon: DECOR_ICONS.bedsheets,
        subTypes: [
          { id: 'cotton_bedsheets', label: 'Jaipuri & Glace Cotton Double Bedsheets', keywords: ['bedsheet', 'double bedsheet', 'fitted bedsheet', 'pillow cover'] },
          { id: 'blankets_comforters', label: 'Mink Blankets, AC Comforters & Dohars', keywords: ['blanket', 'mink blanket', 'comforter', 'dohar', 'quilt'] },
        ],
      },
      {
        id: 'sub_decor_curtains',
        title: 'Curtains, Cushions\n& Sofa Covers',
        icon: DECOR_ICONS.curtains_cushions,
        subTypes: [
          { id: 'door_window_curtains', label: '7ft Door & 5ft Window Eyelet Curtains', keywords: ['curtain', 'door curtain', 'window curtain', 'blackout curtain'] },
          { id: 'cushions_sofa_covers', label: 'Velvet Cushion Covers, Bolsters & Sofa Throws', keywords: ['cushion cover', 'cushion', 'sofa cover', 'diwan set'] },
        ],
      },
      {
        id: 'sub_decor_plants_vases',
        title: 'Artificial Plants,\nFlowers & Vases',
        icon: DECOR_ICONS.plants_vases,
        subTypes: [
          { id: 'artificial_bonsai', label: 'Potted Bonsai, Money Plants & Creepers', keywords: ['artificial plant', 'bonsai', 'flower bunch', 'garland'] },
          { id: 'ceramic_metal_vases', label: 'Ceramic, Metal & Glass Flower Vases', keywords: ['flower vase', 'vase', 'planter pot'] },
        ],
      },
      {
        id: 'sub_decor_lamps_lights',
        title: 'Table Lamps &\nFairy Lights',
        icon: DECOR_ICONS.lamps_lights,
        subTypes: [
          { id: 'bedside_table_lamps', label: 'Crystal Touch Lamps, Shade & Study Lamps', keywords: ['table lamp', 'crystal lamp', 'night lamp', 'jhumar'] },
          { id: 'led_string_curtain', label: 'LED Rice Lights, Curtain & Neon Signs', keywords: ['fairy light', 'string light', 'diwali light', 'neon sign'] },
        ],
      },
      {
        id: 'sub_decor_wall_clocks',
        title: 'Wall Clocks, Art\n& Mirrors',
        icon: DECOR_ICONS.wall_clocks,
        subTypes: [
          { id: 'designer_wall_clocks', label: 'Ajanta, Pendulum & Metal Wall Clocks', keywords: ['wall clock', 'clock', 'ajanta clock'] },
          { id: 'paintings_mirrors', label: '5-Panel MDF Wall Paintings & Photo Frames', keywords: ['wall painting', 'photo frame', 'wallpaper', 'wall mirror'] },
        ],
      },
      {
        id: 'sub_decor_idols',
        title: 'Showpieces, Idols\n& Figurines',
        icon: DECOR_ICONS.idols_statues,
        subTypes: [
          { id: 'ganesha_buddha_idols', label: 'Brass & Marble Finish Ganesha, Radha-Krishna', keywords: ['ganesha idol', 'buddha statue', 'murti', 'radha krishna'] },
          { id: 'vastu_showpieces', label: 'Running Horses, Couple Statues &Fountains', keywords: ['showpiece', 'figurine', 'water fountain', 'wind chime'] },
        ],
      },
      {
        id: 'sub_decor_pooja',
        title: 'Pooja Mandir,\nDiyas & Urlis',
        icon: DECOR_ICONS.pooja_items,
        subTypes: [
          { id: 'brass_diyas_urlis', label: 'Brass Akhand Diyas, Urli Bowls & Thalis', keywords: ['diya', 'urli', 'pooja thali', 'kalash', 'bell'] },
          { id: 'mandir_camphor', label: 'Wooden Pooja Mandirs & Kapur Dani Diffusers', keywords: ['pooja mandir', 'kapur dani', 'incense holder', 'dhoop stand'] },
        ],
      },
      {
        id: 'sub_decor_carpets_mats',
        title: 'Carpets, Doormats\n& Runners',
        icon: DECOR_ICONS.carpets_mats,
        subTypes: [
          { id: 'antiskid_doormats', label: 'Microfiber Anti-Skid Bath & Door Mats', keywords: ['doormat', 'bath mat', 'foot mat'] },
          { id: 'persian_carpets', label: 'Living Room Carpets, Dari & Floor Runners', keywords: ['carpet', 'rug', 'floor runner', 'chatai'] },
        ],
      },
      {
        id: 'sub_decor_candles',
        title: 'Scented Candles\n& Diffusers',
        icon: DECOR_ICONS.candles_aroma,
        subTypes: [
          { id: 'scented_jar_candles', label: 'Soy Wax Glass Jar & Pillar Candles', keywords: ['scented candle', 'jar candle', 'tea light'] },
          { id: 'reed_aroma_diffusers', label: 'Reed Diffusers, Essential Oils & Smoke Fountains', keywords: ['aroma diffuser', 'reed diffuser', 'essential oil', 'backflow'] },
        ],
      },
      {
        id: 'sub_decor_storage',
        title: 'Plastic Racks,\nBoxes & Hangers',
        icon: DECOR_ICONS.storage_organizers,
        subTypes: [
          { id: 'modular_drawers_racks', label: 'Modular Drawer Racks, Shoe Racks & Baskets', keywords: ['storage rack', 'modular drawer', 'shoe rack', 'laundry basket'] },
          { id: 'hangers_wardrobe', label: 'Steel/Plastic Cloth Hangers & Saree Covers', keywords: ['hanger', 'cloth hanger', 'wardrobe organizer', 'saree cover'] },
        ],
      },
      {
        id: 'sub_decor_dining',
        title: 'Serving Trays,\nMats & Glass Jars',
        icon: DECOR_ICONS.dining_tableware,
        subTypes: [
          { id: 'trays_table_mats', label: 'Enamel Serving Trays, Coasters & Table Covers', keywords: ['serving tray', 'table mat', 'table cover', 'coaster'] },
          { id: 'airtight_glass_jars', label: 'Airtight Kitchen Storage Jars & Tissue Boxes', keywords: ['glass jar', 'kitchen container', 'tissue box'] },
        ],
      },
      {
        id: 'sub_decor_bath_towels',
        title: 'Bath Towels,\nBuckets & Sets',
        icon: DECOR_ICONS.bath_towels,
        subTypes: [
          { id: 'cotton_bath_towels', label: '500 GSM Cotton Bath & Hand Towels', keywords: ['bath towel', 'towel', 'hand towel', 'gamcha'] },
          { id: 'buckets_mugs_stools', label: 'Printed Bathroom Bucket, Mug & Stool Sets', keywords: ['bucket', 'bathroom set', 'soap dispenser', 'patla'] },
        ],
      },
    ],
  },
];

// ============================================================================
// 10. IMPORTED GOURMET & GLOBAL GOODS WHOLESALE SECTIONS (8 A-TO-Z)
// ============================================================================
export const IMPORTED_SECTIONS: SubcategorySectionGroup[] = [
  {
    id: 'imported_shop_by_category',
    sectionTitle: 'Shop by category',
    cardBgColor: '#FEF9E7',
    columns: 4,
    items: [
      {
        id: 'sub_imp_chocolates',
        title: 'Imported Chocolates\n& Truffles',
        icon: IMPORTED_ICONS.chocolates,
        subTypes: [
          { id: 'ferrero_lindt', label: 'Ferrero Rocher, Lindt Lindor & Raffaello', keywords: ['ferrero', 'lindt', 'raffaello', 'kunafa chocolate'] },
          { id: 'toblerone_hersheys', label: "Toblerone, Hershey's Kisses & Mars Bars", keywords: ['toblerone', 'hersheys', 'kitkat imported', 'milka'] },
        ],
      },
      {
        id: 'sub_imp_ramen',
        title: 'Korean Ramen &\nBuldak Noodles',
        icon: IMPORTED_ICONS.korean_ramen,
        subTypes: [
          { id: 'samyang_buldak', label: 'Samyang Buldak 2x Spicy, Carbonara & Cheese', keywords: ['buldak', 'samyang', 'korean ramen', 'hot chicken ramen'] },
          { id: 'shin_ramyun_cups', label: 'Nongshim Shin Ramyun, Kimchi & Topokki', keywords: ['shin ramyun', 'nongshim', 'geki', 'ramen cup'] },
        ],
      },
      {
        id: 'sub_imp_snacks',
        title: 'Pringles, Biscoff\n& Wafer Rolls',
        icon: IMPORTED_ICONS.snacks_chips,
        subTypes: [
          { id: 'pringles_doritos', label: 'Imported Pringles Cans, Takis & Doritos', keywords: ['pringles', 'takis', 'cheetos imported', 'doritos'] },
          { id: 'biscoff_loacker', label: 'Lotus Biscoff, Loacker Wafers & Royal Dansk', keywords: ['biscoff', 'lotus biscoff', 'loacker', 'danish cookies'] },
        ],
      },
      {
        id: 'sub_imp_coffee_spreads',
        title: 'Davidoff Coffee\n& Nutella Spread',
        icon: IMPORTED_ICONS.coffee_spreads,
        subTypes: [
          { id: 'davidoff_nescafe_gold', label: 'Davidoff Rich Aroma, Fine Aroma & Espresso', keywords: ['davidoff', 'nescafe gold', 'imported coffee'] },
          { id: 'nutella_biscoff_spread', label: 'Nutella Hazelnut & Lotus Biscoff Spreads', keywords: ['nutella', 'biscoff spread', 'hazelnut spread'] },
        ],
      },
      {
        id: 'sub_imp_drinks',
        title: 'Monster, Prime\n& Mogu Mogu',
        icon: IMPORTED_ICONS.drinks_cans,
        subTypes: [
          { id: 'monster_prime_cans', label: 'Imported Monster Ultra, Prime & Red Bull Editions', keywords: ['monster ultra', 'prime hydration', 'imported energy'] },
          { id: 'mogumogu_chupachups', label: 'Mogu Mogu Nata De Coco & Chupa Chups Soda', keywords: ['mogu mogu', 'chupa chups', 'boba drink', 'aloe vera drink'] },
        ],
      },
      {
        id: 'sub_imp_dates_dryfruits',
        title: 'Medjool Dates,\nBerries & Baklava',
        icon: IMPORTED_ICONS.dates_dryfruits,
        subTypes: [
          { id: 'kimia_medjool_dates', label: 'Saudi Ajwa, Medjool & Kimia Dates Boxes', keywords: ['medjool', 'ajwa dates', 'kimia dates', 'safawi'] },
          { id: 'cranberries_baklava', label: 'Ocean Spray Cranberries, Blueberries & Baklava', keywords: ['cranberries', 'blueberries', 'baklava', 'macadamia'] },
        ],
      },
      {
        id: 'sub_imp_pasta_sauces',
        title: 'Olive Oil, Pasta\n& Global Sauces',
        icon: IMPORTED_ICONS.pasta_sauces,
        subTypes: [
          { id: 'extra_virgin_olive', label: 'Borges & Figaro Extra Virgin Olive Oil Tins', keywords: ['olive oil', 'borges', 'extra virgin', 'pomace'] },
          { id: 'sriracha_pasta_olives', label: 'Sriracha Hot Sauce, Barilla Pasta & Jalapenos', keywords: ['sriracha', 'barilla', 'olives', 'jalapeno', 'peri peri'] },
        ],
      },
      {
        id: 'sub_imp_perfumes_care',
        title: 'Dubai Oud, Deos\n& Korean Care',
        icon: IMPORTED_ICONS.perfumes_care,
        subTypes: [
          { id: 'lattafa_rasasi_oud', label: 'Lattafa, Rasasi & Ajmal Dubai Oud Perfumes', keywords: ['lattafa', 'rasasi', 'dubai perfume', 'oud', 'ajmal'] },
          { id: 'dove_scrub_kbeauty', label: 'Imported Dove Body Scrubs & Korean Skincare', keywords: ['dove body scrub', 'cosrx', 'korean skincare', 'old spice'] },
        ],
      },
    ],
  },
];

export interface WholesaleCatalogItem extends BoutiqueProductItem {
  vertical: WholesaleVerticalId;
  subcategoryId: string;
  subTypeId?: string;
  unitSpec: string;
}

// ============================================================================
// CURATED MULTI-VERTICAL WHOLESALE B2B PRODUCT CATALOG (RICH COVERAGE)
// ============================================================================
export const WHOLESALE_CATALOG_PRODUCTS: WholesaleCatalogItem[] = [
  // ---------------- ELECTRONICS ----------------
  {
    id: 'el_1',
    vertical: 'electronics',
    subcategoryId: 'sub_fans_coolers',
    subTypeId: 'ceiling_fans',
    name: 'Havells 1200mm High-Speed Ceiling Fan (Brown/White)',
    price: 1349,
    originalPrice: 2199,
    image: 'https://tse1.mm.bing.net/th/id/OIP.R_gTi2YIhLqacbaYAFJVbgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Bhagirath Palace Electricals',
    rating: 4.9,
    discountBadge: '39% OFF',
    minOrder: 4,
    unitSpec: 'Master Carton (4 Fans)',
  },
  {
    id: 'el_1b',
    vertical: 'electronics',
    subcategoryId: 'sub_fans_coolers',
    subTypeId: 'table_pedestal',
    name: 'Usha Mist Air Icy 400mm High-Speed Pedestal & Table Fan',
    price: 1490,
    originalPrice: 2450,
    image: 'https://tse3.mm.bing.net/th/id/OIP.iB87MEmChGCazu-fLApD9QHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Bhagirath Palace Electricals',
    rating: 4.8,
    discountBadge: '39% OFF',
    minOrder: 2,
    unitSpec: 'Copper Motor (2 Yr Warranty)',
  },
  {
    id: 'el_1c',
    vertical: 'electronics',
    subcategoryId: 'sub_fans_coolers',
    subTypeId: 'coolers_exhaust',
    name: 'Symphony 35L Honeycomb Personal Room Air Cooler + 9" Exhaust Fan',
    price: 4250,
    originalPrice: 6499,
    image: 'https://tse1.mm.bing.net/th/id/OIP.mCz3KUsD4CPVoB0oQh6X_AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Appliance Hub',
    rating: 4.9,
    discountBadge: '35% OFF',
    minOrder: 2,
    unitSpec: 'Summer Dealer Lot',
  },
  {
    id: 'el_2',
    vertical: 'electronics',
    subcategoryId: 'sub_kitchen_appliances',
    subTypeId: 'mixer_grinders',
    name: 'Bajaj Rex 750W Heavy Duty Mixer Grinder with 3 SS Jars',
    price: 2150,
    originalPrice: 3699,
    image: 'https://tse2.mm.bing.net/th/id/OIP.G-Gv5P81USms0hfe6GSRHAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Appliance Hub',
    rating: 4.8,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: 'Wholesale Box',
  },
  {
    id: 'el_2b',
    vertical: 'electronics',
    subcategoryId: 'sub_kitchen_appliances',
    subTypeId: 'electric_kettles',
    name: 'Pigeon 1.5 Litre Stainless Steel Electric Kettle (1500W Auto Cut)',
    price: 440,
    originalPrice: 995,
    image: 'https://tse3.mm.bing.net/th/id/OIP.gL46pXbLPt-B7K3-pa75HQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Appliance Hub',
    rating: 4.9,
    discountBadge: '56% OFF',
    minOrder: 6,
    unitSpec: 'Carton of 6 Kettles',
  },
  {
    id: 'el_2c',
    vertical: 'electronics',
    subcategoryId: 'sub_kitchen_appliances',
    subTypeId: 'induction_cooktops',
    name: 'Prestige PIC 20.0 1600W Push-Button Induction Cooktop',
    price: 1580,
    originalPrice: 2895,
    image: 'https://tse3.mm.bing.net/th/id/OIP.gq6b3nMJ-vOYJbZPVKSWEwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Appliance Hub',
    rating: 4.8,
    discountBadge: '45% OFF',
    minOrder: 3,
    unitSpec: '1 Year Warranty',
  },
  {
    id: 'el_3',
    vertical: 'electronics',
    subcategoryId: 'sub_led_bulbs',
    subTypeId: 'led_bulbs_9w',
    name: 'Syska 9W B22 Cool Day Light LED Bulb (Wholesale Box of 10)',
    price: 580,
    originalPrice: 1100,
    image: 'https://tse4.mm.bing.net/th/id/OIP.P5Wtg7TiL__Icm2zysxDbQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surya Lighting Wholesale',
    rating: 4.9,
    discountBadge: '47% OFF',
    minOrder: 2,
    unitSpec: 'Pack of 10 Bulbs',
  },
  {
    id: 'el_3b',
    vertical: 'electronics',
    subcategoryId: 'sub_led_bulbs',
    subTypeId: 'inverter_bulbs',
    name: 'Halonix 12W Rechargeable AC/DC Emergency Inverter LED Bulb (4Hr Backup)',
    price: 235,
    originalPrice: 499,
    image: 'https://tse1.mm.bing.net/th/id/OIP.YeKI-VFfAW3XjJAOyb1cVQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surya Lighting Wholesale',
    rating: 4.8,
    discountBadge: '53% OFF',
    minOrder: 6,
    unitSpec: '2200mAh Li-Ion Battery',
  },
  {
    id: 'el_4',
    vertical: 'electronics',
    subcategoryId: 'sub_trimmers',
    subTypeId: 'beard_trimmers',
    name: 'Philips Cordless Beard Trimmer BT3101 (Salon Pack)',
    price: 899,
    originalPrice: 1495,
    image: 'https://tse1.mm.bing.net/th/id/OIP.Oz3AJqFD2kKyzAoPUc6LdwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'GroomTech Distributors',
    rating: 4.8,
    discountBadge: '40% OFF',
    minOrder: 3,
    unitSpec: '1 Year Warranty',
  },
  {
    id: 'el_4b',
    vertical: 'electronics',
    subcategoryId: 'sub_hairstyling',
    subTypeId: 'hair_dryers',
    name: 'Havells 1200W Foldable Ionic Hair Dryer + Ceramic Straightener Combo',
    price: 1120,
    originalPrice: 1995,
    image: 'https://tse1.mm.bing.net/th/id/OIP.Xt9MEKbsqHcs8yS2yo7EEwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'GroomTech Distributors',
    rating: 4.8,
    discountBadge: '44% OFF',
    minOrder: 3,
    unitSpec: 'Salon Gift Box',
  },
  {
    id: 'el_4c',
    vertical: 'electronics',
    subcategoryId: 'sub_massagers',
    subTypeId: 'body_massagers',
    name: 'Deep Tissue Percussion Massage Gun + Tempered Glass Digital Weight Scale',
    price: 1180,
    originalPrice: 2299,
    image: 'https://tse3.mm.bing.net/th/id/OIP.QqnJWE1zqL_uYudllfVTQgHaHi?w=600&h=600&c=7&p=0',
    boutiqueName: 'GroomTech Distributors',
    rating: 4.7,
    discountBadge: '49% OFF',
    minOrder: 2,
    unitSpec: '4 Massage Heads',
  },
  {
    id: 'el_4d',
    vertical: 'electronics',
    subcategoryId: 'sub_toothbrushes',
    subTypeId: 'sonic_brushes',
    name: 'Oral-B Vitality Rechargeable Electric Toothbrush + 4 Extra Heads',
    price: 940,
    originalPrice: 1699,
    image: 'https://tse1.mm.bing.net/th/id/OIP.SGiTkN080X8fBlq5gc4hIAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'GroomTech Distributors',
    rating: 4.9,
    discountBadge: '45% OFF',
    minOrder: 3,
    unitSpec: 'Waterproof IPX7',
  },
  {
    id: 'el_5',
    vertical: 'electronics',
    subcategoryId: 'sub_audio_earbuds',
    subTypeId: 'tws_earbuds',
    name: 'boAt Airdopes 141 ANC TWS Earbuds (42H Playtime)',
    price: 999,
    originalPrice: 2990,
    image: 'https://tse1.mm.bing.net/th/id/OIP.8tHc_y7PFvqHgvpJpo3p-AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gaffar Sound Wholesale',
    rating: 4.9,
    discountBadge: '67% OFF',
    minOrder: 4,
    unitSpec: 'Fast Charging Type-C',
  },
  {
    id: 'el_5b',
    vertical: 'electronics',
    subcategoryId: 'sub_audio_earbuds',
    subTypeId: 'bt_speakers',
    name: 'JBL Go 3 / Stone 10W RGB Portable Bluetooth Soundbar Speaker',
    price: 680,
    originalPrice: 1499,
    image: 'https://tse4.mm.bing.net/th/id/OIP.ugabJNF4GclIOfAP0LKdaAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gaffar Sound Wholesale',
    rating: 4.8,
    discountBadge: '55% OFF',
    minOrder: 4,
    unitSpec: 'Deep Bass TWS Mode',
  },
  {
    id: 'el_6',
    vertical: 'electronics',
    subcategoryId: 'sub_extension_switches',
    subTypeId: 'extension_boards',
    name: 'Anchor 4-Socket Heavy Duty Extension Board (4m Copper Cord)',
    price: 295,
    originalPrice: 550,
    image: 'https://tse3.mm.bing.net/th/id/OIP.DwUdpyzA2RV9Tyl5I1Ag4QHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Bhagirath Palace Electricals',
    rating: 4.7,
    discountBadge: '46% OFF',
    minOrder: 6,
    unitSpec: 'ISI Marked',
  },
  {
    id: 'el_7',
    vertical: 'electronics',
    subcategoryId: 'sub_mobiles_chargers',
    subTypeId: 'fast_chargers',
    name: '65W SuperVOOC / Type-C Fast Charger Adapter with 6A Data Cable',
    price: 240,
    originalPrice: 699,
    image: 'https://tse4.mm.bing.net/th/id/OIP.bRtEqB82d61cgzU8eBXzoQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Karol Bagh Mobile Mart',
    rating: 4.8,
    discountBadge: '66% OFF',
    minOrder: 10,
    unitSpec: 'Box of 10 Chargers',
  },
  {
    id: 'el_8',
    vertical: 'electronics',
    subcategoryId: 'sub_storage_powerbanks',
    subTypeId: 'powerbanks',
    name: 'Mi 20000mAh 18W Fast Charge Power Bank 3i + SanDisk 64GB USB',
    price: 1399,
    originalPrice: 2199,
    image: 'https://tse3.mm.bing.net/th/id/OIP.68i0XcrIrY_mkpMy7sZppgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Karol Bagh Mobile Mart',
    rating: 4.9,
    discountBadge: '36% OFF',
    minOrder: 3,
    unitSpec: 'Dual Input/Output',
  },
  {
    id: 'el_8b',
    vertical: 'electronics',
    subcategoryId: 'sub_computer_tv',
    subTypeId: 'mouse_keyboards',
    name: 'Logitech Wireless Mouse + Universal Smart LED TV & AC Remote Lot',
    price: 540,
    originalPrice: 999,
    image: 'https://tse1.mm.bing.net/th/id/OIP.YVsx6VIRNkhQmDuCDtUBHgHaGX?w=600&h=600&c=7&p=0',
    boutiqueName: 'Karol Bagh Mobile Mart',
    rating: 4.8,
    discountBadge: '46% OFF',
    minOrder: 5,
    unitSpec: 'Plug & Play 2.4GHz',
  },
  {
    id: 'el_9',
    vertical: 'electronics',
    subcategoryId: 'sub_irons_heaters',
    subTypeId: 'dry_steam_irons',
    name: 'Crompton 1000W Heavy Dry & Steam Iron + 1500W Waterproof Immersion Rod',
    price: 780,
    originalPrice: 1390,
    image: 'https://tse1.mm.bing.net/th/id/OIP.JzlyJITeRVVCtdrqpNpdjAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Appliance Hub',
    rating: 4.7,
    discountBadge: '44% OFF',
    minOrder: 4,
    unitSpec: 'Copper Heating Element',
  },
  {
    id: 'el_10',
    vertical: 'electronics',
    subcategoryId: 'sub_wires_tools',
    subTypeId: 'house_wires',
    name: 'Finolex 1.5 sq.mm FR PVC Insulated Copper Wire (90m Coil)',
    price: 1420,
    originalPrice: 2150,
    image: 'https://tse4.mm.bing.net/th/id/OIP.KmbBH7yj9gUI0ji0PbHRSwHaGx?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surya Lighting Wholesale',
    rating: 4.9,
    discountBadge: '34% OFF',
    minOrder: 2,
    unitSpec: '90 Meter Pure Copper',
  },
  {
    id: 'el_11',
    vertical: 'electronics',
    subcategoryId: 'sub_torches_emergency',
    subTypeId: 'kisan_torches',
    name: '50W Long-Range Rechargeable Kisan LED Torch + Solar Lantern',
    price: 360,
    originalPrice: 699,
    image: 'https://tse2.mm.bing.net/th/id/OIP.kUYap1mAeCoNyOPPm4jzNwHaIE?w=600&h=600&c=7&p=0',
    boutiqueName: 'Bhagirath Palace Electricals',
    rating: 4.8,
    discountBadge: '48% OFF',
    minOrder: 6,
    unitSpec: '12 Hours Backup',
  },
  {
    id: 'el_12',
    vertical: 'electronics',
    subcategoryId: 'sub_content_tools',
    subTypeId: 'ring_lights',
    name: '12-Inch LED Studio Ring Light with 7ft Tripod & Dual Wireless Mic',
    price: 749,
    originalPrice: 1599,
    image: 'https://tse3.mm.bing.net/th/id/OIP.zScsrDtfwtAgdRO93I-rxwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gaffar Sound Wholesale',
    rating: 4.8,
    discountBadge: '53% OFF',
    minOrder: 3,
    unitSpec: 'Creator Combo Kit',
  },

  // ---------------- PHARMACY ----------------
  {
    id: 'ph_1',
    vertical: 'pharmacy',
    subcategoryId: 'sub_cough_cold_fever',
    subTypeId: 'fever_paracetamol',
    name: 'Dolo 650mg Paracetamol Tablets (Wholesale Box of 20 Strips)',
    price: 480,
    originalPrice: 680,
    image: 'https://tse2.mm.bing.net/th/id/OIP.VWd0BRhl1zEmd4S4cnMOdgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 5.0,
    discountBadge: '29% OFF',
    minOrder: 2,
    unitSpec: '20 Strips x 15 Tabs',
  },
  {
    id: 'ph_2',
    vertical: 'pharmacy',
    subcategoryId: 'sub_cough_cold_fever',
    subTypeId: 'cough_syrups',
    name: 'Vicks VapoRub 50g + Dabur Honitus Cough Syrup (Chemist Pack of 6)',
    price: 410,
    originalPrice: 595,
    image: 'https://tse2.mm.bing.net/th/id/OIP.vcZf7OkICa0qefH0-uDgTAAAAA?w=600&h=600&c=7&p=0',
    boutiqueName: 'Apollo Wholesale Medico',
    rating: 4.9,
    discountBadge: '31% OFF',
    minOrder: 3,
    unitSpec: 'Pack of 6 Units',
  },
  {
    id: 'ph_3',
    vertical: 'pharmacy',
    subcategoryId: 'sub_stomach_care',
    subTypeId: 'antacid_gas',
    name: 'Digene Antacid Gel Mint 200ml + ENO Regular Sachet Box (30s)',
    price: 385,
    originalPrice: 520,
    image: 'https://tse3.mm.bing.net/th/id/OIP.4Ibq6bJj4PtK9KU5abDfAQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 4.8,
    discountBadge: '26% OFF',
    minOrder: 4,
    unitSpec: 'Chemist Display Box',
  },
  {
    id: 'ph_4',
    vertical: 'pharmacy',
    subcategoryId: 'sub_pain_first_aid',
    subTypeId: 'pain_sprays_gels',
    name: 'Volini Pain Relief Spray 100g + Moov Fast Pain Ointment',
    price: 320,
    originalPrice: 460,
    image: 'https://tse2.mm.bing.net/th/id/OIP.B8px5MAVW3UbSd4PHtFzowHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'LifeCare Surgical & Pharma',
    rating: 4.9,
    discountBadge: '30% OFF',
    minOrder: 4,
    unitSpec: 'Instant Pain Relief',
  },
  {
    id: 'ph_4b',
    vertical: 'pharmacy',
    subcategoryId: 'sub_pain_first_aid',
    subTypeId: 'antiseptic_firstaid',
    name: 'Dettol Antiseptic Liquid 550ml + Band-Aid Washproof 100-Strips Box',
    price: 365,
    originalPrice: 490,
    image: 'https://tse3.mm.bing.net/th/id/OIP.oM-lc-mZb069kktsiLlQ-AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'LifeCare Surgical & Pharma',
    rating: 4.9,
    discountBadge: '26% OFF',
    minOrder: 3,
    unitSpec: 'First Aid Counter Pack',
  },
  {
    id: 'ph_4c',
    vertical: 'pharmacy',
    subcategoryId: 'sub_antibiotics',
    subTypeId: 'azithro_amox',
    name: 'Azithral 500mg & Amoxycillin Clavulanate 625mg (Box of 10 Strips)',
    price: 780,
    originalPrice: 1190,
    image: 'https://tse2.mm.bing.net/th/id/OIP._OQxU__KSN6QwXMPWhq2wAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 4.9,
    discountBadge: '34% OFF',
    minOrder: 2,
    unitSpec: '10x6 Alu-Alu Box',
  },
  {
    id: 'ph_5',
    vertical: 'pharmacy',
    subcategoryId: 'sub_diabetes_care',
    subTypeId: 'glucometer_strips',
    name: 'Accu-Chek Active Blood Glucose Test Strips (Box of 50 Strips)',
    price: 890,
    originalPrice: 1149,
    image: 'https://tse1.mm.bing.net/th/id/OIP.4m1UPlNFRp4mySHtxQ-rqwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Apollo Wholesale Medico',
    rating: 4.9,
    discountBadge: '23% OFF',
    minOrder: 2,
    unitSpec: '50 Strips Pack',
  },
  {
    id: 'ph_6',
    vertical: 'pharmacy',
    subcategoryId: 'sub_heart_bp_care',
    subTypeId: 'bp_monitors',
    name: 'Omron HEM-7120 Fully Automatic Digital Blood Pressure Monitor',
    price: 1650,
    originalPrice: 2380,
    image: 'https://tse4.mm.bing.net/th/id/OIP.zBKoRCljd93K5rnpqAeGaAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'LifeCare Surgical & Pharma',
    rating: 4.9,
    discountBadge: '31% OFF',
    minOrder: 2,
    unitSpec: '3 Years Warranty',
  },
  {
    id: 'ph_6b',
    vertical: 'pharmacy',
    subcategoryId: 'sub_derma_skin',
    subTypeId: 'dusting_powders',
    name: 'Candid Antidandruff & Antifungal Dusting Powder (120g x 6 Bottles)',
    price: 580,
    originalPrice: 870,
    image: 'https://tse4.mm.bing.net/th/id/OIP.HE5We_8bUSGnIXFC2OUGgwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Apollo Wholesale Medico',
    rating: 4.8,
    discountBadge: '33% OFF',
    minOrder: 2,
    unitSpec: 'Pack of 6 Bottles',
  },
  {
    id: 'ph_6c',
    vertical: 'pharmacy',
    subcategoryId: 'sub_respiratory',
    subTypeId: 'nebulizers_vaporizers',
    name: 'Dr Trust Compressor Nebulizer Machine + 3-in-1 Steam Vaporizer',
    price: 1290,
    originalPrice: 2150,
    image: 'https://tse2.mm.bing.net/th/id/OIP.69N_XC92J-B_VBrHjgccOwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'LifeCare Surgical & Pharma',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Complete Mask Kit',
  },
  {
    id: 'ph_6d',
    vertical: 'pharmacy',
    subcategoryId: 'sub_eye_ear_oral',
    subTypeId: 'eye_ear_drops',
    name: 'Refresh Tears Lubricant Eye Drops (10ml x 6) + Sensodyne Repair Pack',
    price: 640,
    originalPrice: 920,
    image: 'https://tse1.mm.bing.net/th/id/OIP.gFiNQ5jYlbRCwizukqUT3AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 4.8,
    discountBadge: '30% OFF',
    minOrder: 2,
    unitSpec: 'Chemist Pack of 6',
  },
  {
    id: 'ph_6e',
    vertical: 'pharmacy',
    subcategoryId: 'sub_neuro_care',
    subTypeId: 'b12_nerve',
    name: 'Neurobion Forte Vitamin B12 Nerve Care Tablets (Box of 20 Strips)',
    price: 590,
    originalPrice: 840,
    image: 'https://tse1.mm.bing.net/th/id/OIP.Wt1C_MtuJ2ZcWnQvTpZGAQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 4.9,
    discountBadge: '30% OFF',
    minOrder: 2,
    unitSpec: '20 Strips x 30 Tabs',
  },
  {
    id: 'ph_6f',
    vertical: 'pharmacy',
    subcategoryId: 'sub_sexual_wellness',
    subTypeId: 'condoms_lubes',
    name: 'Durex Extra Thin & Air Condoms Counter Display Box + Prega News (10s)',
    price: 720,
    originalPrice: 1150,
    image: 'https://tse2.mm.bing.net/th/id/OIP.KM40cQXTfHWDk-LoFr67WAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Apollo Wholesale Medico',
    rating: 4.9,
    discountBadge: '37% OFF',
    minOrder: 2,
    unitSpec: 'Discreet Chemist Box',
  },
  {
    id: 'ph_6g',
    vertical: 'pharmacy',
    subcategoryId: 'sub_surgical_supplies',
    subTypeId: 'cotton_bandages',
    name: 'Absorbent Surgical Cotton Roll 500g + Nitrile Gloves (100 Pcs Box)',
    price: 490,
    originalPrice: 780,
    image: 'https://tse4.mm.bing.net/th/id/OIP.TSiCqCj8rxp_Ze4GTT1A0gHaIF?w=600&h=600&c=7&p=0',
    boutiqueName: 'LifeCare Surgical & Pharma',
    rating: 4.8,
    discountBadge: '37% OFF',
    minOrder: 3,
    unitSpec: 'Hospital Grade',
  },
  {
    id: 'ph_7',
    vertical: 'pharmacy',
    subcategoryId: 'sub_ors_glucose',
    subTypeId: 'ors_sachets',
    name: 'Electral WHO ORS Powder (Master Box of 25 Sachets) + Glucon-D 1kg',
    price: 440,
    originalPrice: 575,
    image: 'https://tse1.mm.bing.net/th/id/OIP.pi84BkbV1gLb4_SBmAC42gHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 4.9,
    discountBadge: '23% OFF',
    minOrder: 3,
    unitSpec: 'Box of 25 Sachets',
  },
  {
    id: 'ph_8',
    vertical: 'pharmacy',
    subcategoryId: 'sub_vitamins_supplements',
    subTypeId: 'multivitamins',
    name: 'Revital H Daily Health Capsules + Limcee Vitamin C Chewable (15 Strips)',
    price: 390,
    originalPrice: 550,
    image: 'https://tse3.mm.bing.net/th/id/OIP.rp2sYM1mCTaobC9GbY4GzwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Apollo Wholesale Medico',
    rating: 4.8,
    discountBadge: '29% OFF',
    minOrder: 4,
    unitSpec: 'Immunity Booster Pack',
  },
  {
    id: 'ph_8b',
    vertical: 'pharmacy',
    subcategoryId: 'sub_ayurvedic',
    subTypeId: 'chyawanprash_honey',
    name: 'Dabur Chyawanprash 1kg + Zandu Balm 8ml (Chemist Hanger of 12)',
    price: 560,
    originalPrice: 790,
    image: 'https://tse4.mm.bing.net/th/id/OIP.zT5ZcQlujaAUWA---BCCjgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Apollo Wholesale Medico',
    rating: 4.9,
    discountBadge: '29% OFF',
    minOrder: 2,
    unitSpec: 'Ayurveda Combo Lot',
  },
  {
    id: 'ph_8c',
    vertical: 'pharmacy',
    subcategoryId: 'sub_baby_sanitary',
    subTypeId: 'sanitary_pads',
    name: 'Whisper Ultra Clean XL+ Sanitary Pads (12 Packs) + Pampers Pants L',
    price: 980,
    originalPrice: 1390,
    image: 'https://tse4.mm.bing.net/th/id/OIP.o7ybnkHp0vjFW2UeT4W4JAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'MedPlus Pharma Distributors',
    rating: 4.9,
    discountBadge: '29% OFF',
    minOrder: 2,
    unitSpec: 'Wholesale Master Bag',
  },

  // ---------------- RATION (KIRANA WHOLESALE MANDI) ----------------
  {
    id: 'rt_1',
    vertical: 'ration',
    subcategoryId: 'sub_atta_maida',
    subTypeId: 'chakki_atta',
    name: 'Aashirvaad Shudh Chakki Whole Wheat Atta (10kg Wholesale Pack)',
    price: 415,
    originalPrice: 495,
    image: 'https://tse2.mm.bing.net/th/id/OIP.c8IvInEX68ygYMr--dyRWQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Naya Bazar Grain Mandi',
    rating: 4.9,
    discountBadge: '16% OFF',
    minOrder: 5,
    unitSpec: '10 Kg Bag (Min 5 Bags)',
  },
  {
    id: 'rt_2',
    vertical: 'ration',
    subcategoryId: 'sub_atta_maida',
    subTypeId: 'besan_sattu',
    name: 'Fortune Pure Chana Besan & Rajdhani Sattu (35kg Wholesale Katta)',
    price: 2450,
    originalPrice: 3100,
    image: 'https://tse4.mm.bing.net/th/id/OIP.Jfax9pH4EN9h5l1rqiCjwQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Naya Bazar Grain Mandi',
    rating: 4.8,
    discountBadge: '21% OFF',
    minOrder: 1,
    unitSpec: '35 Kg Wholesale Sack',
  },
  {
    id: 'rt_2b',
    vertical: 'ration',
    subcategoryId: 'sub_atta_maida',
    subTypeId: 'maida_sooji',
    name: 'Superfine Bakery Maida & Roasted Rawa Sooji (50kg Mill Katta)',
    price: 1850,
    originalPrice: 2300,
    image: 'https://tse4.mm.bing.net/th/id/OIP.ai0Ikbmd3gVyeUKRj1VbHgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Naya Bazar Grain Mandi',
    rating: 4.8,
    discountBadge: '20% OFF',
    minOrder: 2,
    unitSpec: '50 Kg Mill Katta',
  },
  {
    id: 'rt_3',
    vertical: 'ration',
    subcategoryId: 'sub_rice_basmati',
    subTypeId: 'basmati_bori',
    name: 'India Gate Feast Rozana 1121 Basmati Rice (25kg Wholesale Bori)',
    price: 1890,
    originalPrice: 2450,
    image: 'https://tse2.mm.bing.net/th/id/OIP.Js_yFNVZIOGI-Is01-8qgQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Karnal Basmati Rice Mill',
    rating: 5.0,
    discountBadge: '23% OFF',
    minOrder: 2,
    unitSpec: '25 Kg Mandi Bori',
  },
  {
    id: 'rt_3b',
    vertical: 'ration',
    subcategoryId: 'sub_rice_basmati',
    subTypeId: 'sona_masoori',
    name: 'Aged Sona Masoori & Golden Sella Steam Rice (26kg Kirana Sack)',
    price: 1380,
    originalPrice: 1750,
    image: 'https://tse2.mm.bing.net/th/id/OIP.92dJGGpkxBECY6Bit__JlgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Karnal Basmati Rice Mill',
    rating: 4.9,
    discountBadge: '21% OFF',
    minOrder: 2,
    unitSpec: '26 Kg PP Sack',
  },
  {
    id: 'rt_4',
    vertical: 'ration',
    subcategoryId: 'sub_dal_pulses',
    subTypeId: 'toor_moong_masoor',
    name: 'Unpolished Yellow Toor / Arhar Dal & Moong Dal (30kg Katta)',
    price: 3450,
    originalPrice: 4200,
    image: 'https://tse4.mm.bing.net/th/id/OIP.Q70zoaWhzVpKHDDOwTuM4AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Indore Dal & Pulses Mandi',
    rating: 4.9,
    discountBadge: '18% OFF',
    minOrder: 1,
    unitSpec: '30 Kg Wholesale Katta',
  },
  {
    id: 'rt_4b',
    vertical: 'ration',
    subcategoryId: 'sub_dal_pulses',
    subTypeId: 'chana_kabuli',
    name: 'Dollar Kabuli Chana, Kala Chana & Chitra Rajma (30kg Mandi Sack)',
    price: 2890,
    originalPrice: 3550,
    image: 'https://tse3.mm.bing.net/th/id/OIP.jQ7pMqgNOHOUZ2LSZzhObQHaHn?w=600&h=600&c=7&p=0',
    boutiqueName: 'Indore Dal & Pulses Mandi',
    rating: 4.8,
    discountBadge: '19% OFF',
    minOrder: 1,
    unitSpec: '30 Kg Jute Bori',
  },
  {
    id: 'rt_5',
    vertical: 'ration',
    subcategoryId: 'sub_onion_garlic_potato',
    subTypeId: 'dry_red_onion',
    name: 'Nashik A-Grade Dry Red Onion (Pyaz) — 50kg Wholesale Mesh Sack',
    price: 1350,
    originalPrice: 1800,
    image: 'https://tse1.mm.bing.net/th/id/OIP.1gLZfQmc0WHFEh6lx9reswHaGm?w=600&h=600&c=7&p=0',
    boutiqueName: 'Azadpur Dry Mandi Wholesale',
    rating: 4.9,
    discountBadge: '25% OFF',
    minOrder: 2,
    unitSpec: '50 Kg Dry Sack (Rs 27/kg)',
  },
  {
    id: 'rt_6',
    vertical: 'ration',
    subcategoryId: 'sub_onion_garlic_potato',
    subTypeId: 'garlic_ginger',
    name: 'Kota Bold White Garlic (Lahsun) & Dry Jyoti Aloo (25kg Mandi Bag)',
    price: 1690,
    originalPrice: 2250,
    image: 'https://tse3.mm.bing.net/th/id/OIP.ejYtPoMh61XhzpO5g6WKXQHaHH?w=600&h=600&c=7&p=0',
    boutiqueName: 'Azadpur Dry Mandi Wholesale',
    rating: 4.8,
    discountBadge: '25% OFF',
    minOrder: 2,
    unitSpec: '25 Kg Net Mesh Bag',
  },
  {
    id: 'rt_7',
    vertical: 'ration',
    subcategoryId: 'sub_khada_masala',
    subTypeId: 'jeera_rai_methi',
    name: 'Khari Baoli Whole Spices: Unjha Jeera, Kali Mirch, Laung & Elaichi (5kg)',
    price: 2290,
    originalPrice: 3100,
    image: 'https://tse2.mm.bing.net/th/id/OIP.QhnwXz2swQqLkuPchBeFdQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Khari Baoli Spice Traders',
    rating: 5.0,
    discountBadge: '26% OFF',
    minOrder: 2,
    unitSpec: '5 Kg Vacuum Pack',
  },
  {
    id: 'rt_8',
    vertical: 'ration',
    subcategoryId: 'sub_powder_masala',
    subTypeId: 'blended_boxes',
    name: 'MDH & Everest Haldi, Lal Mirch, Dhania & Garam Masala + ₹5 Ladi',
    price: 780,
    originalPrice: 1050,
    image: 'https://tse3.mm.bing.net/th/id/OIP.enSGTACFY-IWLXxQAoErRgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Khari Baoli Spice Traders',
    rating: 4.9,
    discountBadge: '26% OFF',
    minOrder: 3,
    unitSpec: 'Master Carton + Hanging Ladi',
  },
  {
    id: 'rt_9',
    vertical: 'ration',
    subcategoryId: 'sub_cooking_oil_ghee',
    subTypeId: 'mustard_oil',
    name: 'Fortune Kachi Ghani Pure Mustard Oil (15 Litre Wholesale Tin)',
    price: 2180,
    originalPrice: 2650,
    image: 'https://tse3.mm.bing.net/th/id/OIP.GrREFwKc-8CKupr0Kx8yvgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Naya Bazar Grain Mandi',
    rating: 4.9,
    discountBadge: '18% OFF',
    minOrder: 2,
    unitSpec: '15 Litre Metal Tin',
  },
  {
    id: 'rt_9b',
    vertical: 'ration',
    subcategoryId: 'sub_cooking_oil_ghee',
    subTypeId: 'desi_ghee_vanaspati',
    name: 'Amul Pure Cow Ghee 1L Tin (Carton of 6) + Fortune Sunflower Pouch',
    price: 3390,
    originalPrice: 4100,
    image: 'https://tse2.mm.bing.net/th/id/OIP.CUjim93cf46wVc9pWZeVnQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Naya Bazar Grain Mandi',
    rating: 5.0,
    discountBadge: '17% OFF',
    minOrder: 1,
    unitSpec: '6 x 1 Litre Tin Box',
  },
  {
    id: 'rt_10',
    vertical: 'ration',
    subcategoryId: 'sub_dry_fruits',
    subTypeId: 'badam_kaju',
    name: 'California Badam, W320 Kaju & Darbhanga Phool Makhana (5kg Pack)',
    price: 2850,
    originalPrice: 3800,
    image: 'https://tse1.mm.bing.net/th/id/OIP.zAJDwoQJfo0ebAfVDbSsbgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Khari Baoli Dry Fruit House',
    rating: 4.9,
    discountBadge: '25% OFF',
    minOrder: 1,
    unitSpec: '5 Kg Wholesale Box',
  },
  {
    id: 'rt_11',
    vertical: 'ration',
    subcategoryId: 'sub_salt_sugar',
    subTypeId: 'sugar_gud',
    name: 'Tata Iodized Salt (25x1kg Master Bag) + M-30 Crystal Sugar Katta',
    price: 1120,
    originalPrice: 1380,
    image: 'https://tse3.mm.bing.net/th/id/OIP.7Aj7aO6wpsqH3M8EPmPqdgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Indore Dal & Pulses Mandi',
    rating: 4.8,
    discountBadge: '19% OFF',
    minOrder: 2,
    unitSpec: '25 Kg Master Bag',
  },
  {
    id: 'rt_11b',
    vertical: 'ration',
    subcategoryId: 'sub_tea_coffee',
    subTypeId: 'assam_tea',
    name: 'Tata Tea Gold & Agni Strong CTC Assam Tea (5kg Wholesale Sack + ₹10 Ladi)',
    price: 1290,
    originalPrice: 1680,
    image: 'https://tse1.mm.bing.net/th/id/OIP.gMU-vMWRQ7Z0u-KoKb_tZgHaG_?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar FMCG Super Stockist',
    rating: 4.9,
    discountBadge: '23% OFF',
    minOrder: 2,
    unitSpec: '5 Kg Wholesale Bag',
  },
  {
    id: 'rt_12',
    vertical: 'ration',
    subcategoryId: 'sub_biscuits_snacks',
    subTypeId: 'maggi_noodles',
    name: 'Maggi 2-Minute Noodles (72-Pack Carton) + Haldiram Bhujia Ladi',
    price: 890,
    originalPrice: 1120,
    image: 'https://tse1.mm.bing.net/th/id/OIP.CNLgzQhBdMlkQfhLfyEkjgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar FMCG Super Stockist',
    rating: 4.9,
    discountBadge: '21% OFF',
    minOrder: 2,
    unitSpec: '72 Packs Carton',
  },
  {
    id: 'rt_12b',
    vertical: 'ration',
    subcategoryId: 'sub_soaps_detergents',
    subTypeId: 'detergent_surf',
    name: 'Surf Excel Easy Wash & Ghadi Detergent (25x1kg Bale) + Dettol Soap Box',
    price: 1680,
    originalPrice: 2150,
    image: 'https://tse3.mm.bing.net/th/id/OIP.Ulc9f71Gl-vxVhx4N3vKBwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar FMCG Super Stockist',
    rating: 4.9,
    discountBadge: '22% OFF',
    minOrder: 1,
    unitSpec: '25 Kg Master Bale',
  },

  // ---------------- BEAUTY & COSMETICS (20 A-TO-Z SUB-CATEGORIES) ----------------
  {
    id: 'bt_1',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_lips',
    subTypeId: 'liquid_lipsticks',
    name: 'Maybelline SuperStay Matte Ink & Lakme 9to5 Liquid Lipstick (12-Shade Salon Box)',
    price: 1680,
    originalPrice: 2890,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.9,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: '12 Shades Counter Box',
  },
  {
    id: 'bt_2',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_face',
    subTypeId: 'foundation_concealer',
    name: 'Maybelline Fit Me Matte+Poreless Foundation & Compact Powder Combo (Pack of 6)',
    price: 1420,
    originalPrice: 2394,
    image: 'https://tse4.mm.bing.net/th/id/OIP.H-j5URZMuJjBB04v-hq-bQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.9,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: 'Pack of 6 Bottles',
  },
  {
    id: 'bt_3',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_eyes',
    subTypeId: 'kajal_eyeliner',
    name: 'Lakme Eyeconic Kajal Twin Pack + Colossal Waterproof Mascara (Box of 12)',
    price: 1290,
    originalPrice: 2160,
    image: 'https://tse4.mm.bing.net/th/id/OIP.jcDitVekigqzT4NPbxt4kwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.8,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: '12 Pcs Counter Hanger',
  },
  {
    id: 'bt_4',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_nails',
    subTypeId: 'nail_polish_gel',
    name: 'Lakme True Wear Gloss & Gel Nail Enamel 24-Color Salon Display Tray',
    price: 1140,
    originalPrice: 1920,
    image: 'https://tse2.mm.bing.net/th/id/OIP.RTgad8OHgbkjzxIdSVSGeQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.8,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: '24 Shades Display Box',
  },
  {
    id: 'bt_5',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_serums',
    subTypeId: 'vitc_niacinamide',
    name: 'Minimalist 10% Vitamin C & 10% Niacinamide Face Serum + Plum Rose Toner (6 Pcs)',
    price: 1790,
    originalPrice: 2994,
    image: 'https://tse2.mm.bing.net/th/id/OIP.5CHlk56kt46KdT-V07V0RgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'DermaGlow Beauty Distributors',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: '6x30ml Dropper Box',
  },
  {
    id: 'bt_6',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_sunscreen',
    subTypeId: 'spf_sunscreens',
    name: 'Lakme Sun Expert SPF 50 PA+++ Sunscreen & Cetaphil Gentle Skin Cleanser (Pack of 6)',
    price: 1560,
    originalPrice: 2490,
    image: 'https://tse1.mm.bing.net/th/id/OIP.hyzRgviRQO-x3rn-OpqWLQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'DermaGlow Beauty Distributors',
    rating: 4.9,
    discountBadge: '37% OFF',
    minOrder: 2,
    unitSpec: 'Pack of 6 Units',
  },
  {
    id: 'bt_7',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_lipbalm',
    subTypeId: 'lip_masks',
    name: 'Laneige Berry Lip Sleeping Mask Jar & Nivea Cherry Shine Lip Balm (12 Pcs Card)',
    price: 980,
    originalPrice: 1650,
    image: 'https://tse1.mm.bing.net/th/id/OIP.CUu5KwMvG6CHe9ksTFgV7wHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.8,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: '12 Pcs Counter Card',
  },
  {
    id: 'bt_8',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_facialkits',
    subTypeId: 'salon_facial_kits',
    name: 'VLCC 24K Gold Bridal Glow Facial Kit + Garnier Hydra Bomb Sheet Masks (Salon Lot)',
    price: 1380,
    originalPrice: 2400,
    image: 'https://tse1.mm.bing.net/th/id/OIP.iGbzHyUX5V7SAs2EbGpHugHaEu?w=600&h=600&c=7&p=0',
    boutiqueName: 'Parlour Pro Supply Hub',
    rating: 4.9,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '4 Facial Kits + 10 Masks',
  },
  {
    id: 'bt_9',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_haircolour',
    subTypeId: 'creme_hair_color',
    name: "L'Oreal Casting Crème Gloss & Garnier Black Naturals Hair Colour (24-Pack Carton)",
    price: 1240,
    originalPrice: 1920,
    image: 'https://tse4.mm.bing.net/th/id/OIP.rkI4iAft_qNYbX7e9ambbgHaF9?w=600&h=600&c=7&p=0',
    boutiqueName: 'Parlour Pro Supply Hub',
    rating: 4.8,
    discountBadge: '35% OFF',
    minOrder: 2,
    unitSpec: 'Box of 24 Packs',
  },
  {
    id: 'bt_10',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_hairmasks',
    subTypeId: 'hair_serums',
    name: 'Dove Intense Repair Hair Mask 300ml + Streax Walnut Gloss Hair Serum (6 Pcs)',
    price: 1190,
    originalPrice: 1890,
    image: 'https://tse2.mm.bing.net/th/id/OIP.GrkxCrYjT2-5JJAsXFrV2QHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Parlour Pro Supply Hub',
    rating: 4.9,
    discountBadge: '37% OFF',
    minOrder: 2,
    unitSpec: 'Salon Pack of 6',
  },
  {
    id: 'bt_11',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_hairstyling',
    subTypeId: 'hair_sprays_mousse',
    name: 'TRESemmé Keratin Smooth Hold Hair Spray & Taft Power Styling Mousse (6 Cans)',
    price: 1450,
    originalPrice: 2340,
    image: 'https://tse1.mm.bing.net/th/id/OIP._qycO3aPFkpVwO_wBPDP-wHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Parlour Pro Supply Hub',
    rating: 4.8,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: '6 Aerosol Cans',
  },
  {
    id: 'bt_12',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_shampoos',
    subTypeId: 'shampoos_cond',
    name: "Bajaj Almond Drops Hair Oil 300ml & L'Oreal Total Repair 5 Shampoo (12 Bottles)",
    price: 1840,
    originalPrice: 2760,
    image: 'https://tse3.mm.bing.net/th/id/OIP.JeAvPHclvqJnBJuYMXYMTQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar FMCG Super Stockist',
    rating: 4.9,
    discountBadge: '33% OFF',
    minOrder: 2,
    unitSpec: '12 Bottles Master Case',
  },
  {
    id: 'bt_13',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_bathtools',
    subTypeId: 'loofah_scrubbers',
    name: 'Vega Exfoliating Bath Loofah & 12-In-1 Stainless Steel Manicure Pedicure Kit (12 Sets)',
    price: 920,
    originalPrice: 1680,
    image: 'https://tse3.mm.bing.net/th/id/OIP.2dmppu0fA1ZTeiTor5CljAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.7,
    discountBadge: '45% OFF',
    minOrder: 3,
    unitSpec: 'Dozen Combo Pack',
  },
  {
    id: 'bt_14',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_accessories',
    subTypeId: 'brushes_blenders',
    name: 'Pro Kabuki Makeup Brush Set (10 Brushes) + Hydrophilic Beauty Blender Sponges (12 Pcs)',
    price: 890,
    originalPrice: 1799,
    image: 'https://tse3.mm.bing.net/th/id/OIP.wRlb_Q0nUMikAQPzJeSrdwHaFW?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.9,
    discountBadge: '51% OFF',
    minOrder: 3,
    unitSpec: '12 Sets Wholesale Box',
  },
  {
    id: 'bt_15',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_hairbrushes',
    subTypeId: 'paddle_round_brushes',
    name: 'Salon Cushion Paddle Detangling Hair Brush + Matte Korean Claw Clips (24 Pcs Lot)',
    price: 780,
    originalPrice: 1490,
    image: 'https://tse4.mm.bing.net/th/id/OIP.5IUYcJC01Yy3RM0ZNoUZWQAAAA?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Cosmetics Wholesale',
    rating: 4.8,
    discountBadge: '48% OFF',
    minOrder: 3,
    unitSpec: '24 Pcs Salon Card',
  },
  {
    id: 'bt_16',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_extensions',
    subTypeId: 'press_on_nails',
    name: '24-Pc French Press-On Nail Art Kits with Glue + 3D Mink False Eyelashes (12 Boxes)',
    price: 1050,
    originalPrice: 1999,
    image: 'https://tse3.mm.bing.net/th/id/OIP.GePSaulq3rKntbeC5YFJwgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Parlour Pro Supply Hub',
    rating: 4.9,
    discountBadge: '47% OFF',
    minOrder: 2,
    unitSpec: '12 Bridal Kits Box',
  },
  {
    id: 'bt_17',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_luxury',
    subTypeId: 'luxe_skincare',
    name: '24K Gold Advanced Night Repair Face Elixir & Hyaluronic Glass Skin Cream (Luxe Set of 4)',
    price: 2490,
    originalPrice: 4200,
    image: 'https://tse4.mm.bing.net/th/id/OIP.LvLm5xnl2MA2T4B1ppa4xgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'DermaGlow Beauty Distributors',
    rating: 5.0,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: 'Luxury Boutique Pack',
  },
  {
    id: 'bt_18',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_perfumes',
    subTypeId: 'edp_perfumes',
    name: 'Bella Vita Luxury 4x20ml Eau De Parfum Gift Box + Long-Lasting Oud EDP 100ml (6 Sets)',
    price: 1650,
    originalPrice: 2994,
    image: 'https://tse1.mm.bing.net/th/id/OIP.BNsYPl1aG0d8gLVsNbj5sQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Fragrance Mandi House',
    rating: 4.9,
    discountBadge: '45% OFF',
    minOrder: 2,
    unitSpec: '6 Gift Boxes Carton',
  },
  {
    id: 'bt_19',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_womens_grooming',
    subTypeId: 'veet_wax_creams',
    name: 'Veet Sensitive Skin Hair Removal Cream & Gillette Venus Breeze Women Razors (12 Packs)',
    price: 1320,
    originalPrice: 2040,
    image: 'https://tse1.mm.bing.net/th/id/OIP.HsKvWBxWDYi-pVXgz9uWPQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar FMCG Super Stockist',
    rating: 4.9,
    discountBadge: '35% OFF',
    minOrder: 2,
    unitSpec: '12 Units Counter Box',
  },
  {
    id: 'bt_20',
    vertical: 'beauty',
    subcategoryId: 'sub_beauty_mens_grooming',
    subTypeId: 'hair_wax_beard',
    name: 'Beardo Strong Hold Matte Hair Wax 100g & Nivea Men Dark Spot Face Wash (12 Units)',
    price: 1390,
    originalPrice: 2280,
    image: 'https://tse3.mm.bing.net/th/id/OIP.PHufY6Ow49alv0Xaay7BAQHaGb?w=600&h=600&c=7&p=0',
    boutiqueName: 'GroomTech Distributors',
    rating: 4.8,
    discountBadge: '39% OFF',
    minOrder: 2,
    unitSpec: 'Salon Pack of 12',
  },

  // ---------------- KIDS, BABY CARE & TOYS (18 A-TO-Z SUB-CATEGORIES) ----------------
  {
    id: 'kd_1',
    vertical: 'kids',
    subcategoryId: 'sub_kids_diaper',
    subTypeId: 'diaper_pants',
    name: 'Pampers All-Round Protection & MamyPoko Extra Absorb Diaper Pants (M/L Jumbo Bale of 6)',
    price: 2640,
    originalPrice: 3894,
    image: 'https://tse2.mm.bing.net/th/id/OIP.mtIR99Q2ijtcibfU4vNV1AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.9,
    discountBadge: '32% OFF',
    minOrder: 1,
    unitSpec: '6 Jumbo Packs Bale',
  },
  {
    id: 'kd_2',
    vertical: 'kids',
    subcategoryId: 'sub_kids_wipes',
    subTypeId: 'baby_wet_wipes',
    name: "Himalaya Gentle Baby Wipes (72 Pulls x 12 Packs) + Waterproof Reusable Baby Dry Sheets",
    price: 980,
    originalPrice: 1680,
    image: 'https://tse2.mm.bing.net/th/id/OIP.Rvk5Z4CmaP_sDrwbwus1rAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.9,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: '12 Wipes Packs Carton',
  },
  {
    id: 'kd_3',
    vertical: 'kids',
    subcategoryId: 'sub_kids_rashcream',
    subTypeId: 'diaper_rash_cream',
    name: "Himalaya Diaper Rash Cream 50g & Johnson's Blossoms Baby Powder 400g (Pack of 12)",
    price: 1280,
    originalPrice: 1920,
    image: 'https://tse4.mm.bing.net/th/id/OIP.H_jPSnLg-d7c76ud4cYdvwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.8,
    discountBadge: '33% OFF',
    minOrder: 2,
    unitSpec: '12 Units Chemist Box',
  },
  {
    id: 'kd_4',
    vertical: 'kids',
    subcategoryId: 'sub_kids_babyfood',
    subTypeId: 'cerelac_cereals',
    name: 'Nestlé Cerelac Wheat Apple Cereal & Lactogen Stage-1 Infant Formula Refill (Case of 12)',
    price: 2790,
    originalPrice: 3480,
    image: 'https://tse1.mm.bing.net/th/id/OIP.qtmD-8iG_eLWzvQr2vnOmgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 5.0,
    discountBadge: '20% OFF',
    minOrder: 1,
    unitSpec: '12 Boxes Master Case',
  },
  {
    id: 'kd_5',
    vertical: 'kids',
    subcategoryId: 'sub_kids_feedingbottles',
    subTypeId: 'feeding_bottles',
    name: 'Philips Avent Anti-Colic 260ml Feeding Bottle & Pigeon Peristaltic Silicone Nipples (6 Sets)',
    price: 1540,
    originalPrice: 2490,
    image: 'https://tse3.mm.bing.net/th/id/OIP.Lr-P30SX7K8zt0Wf_xh3iAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.9,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: 'Box of 6 Bottles + Teats',
  },
  {
    id: 'kd_6',
    vertical: 'kids',
    subcategoryId: 'sub_kids_feedingacc',
    subTypeId: 'sippy_cups_bowls',
    name: 'BPA-Free Spill-Proof Baby Sippy Cup with Handles + Orthodontic Silicone Pacifiers (12 Pcs)',
    price: 1120,
    originalPrice: 1980,
    image: 'https://tse1.mm.bing.net/th/id/OIP.-bFQXreLCKKJVvkrKikyCgHaH6?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.8,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '12 Pcs Display Pack',
  },
  {
    id: 'kd_7',
    vertical: 'kids',
    subcategoryId: 'sub_kids_lotions',
    subTypeId: 'baby_lotions',
    name: 'Cetaphil Baby Daily Lotion 400ml & Sebamed Protective Facial Cream (Pack of 6)',
    price: 1890,
    originalPrice: 2850,
    image: 'https://tse4.mm.bing.net/th/id/OIP.brI8shJQG9NkNdEAUfDTAQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'DermaGlow Beauty Distributors',
    rating: 4.9,
    discountBadge: '34% OFF',
    minOrder: 2,
    unitSpec: '6 Units Pediatric Pack',
  },
  {
    id: 'kd_8',
    vertical: 'kids',
    subcategoryId: 'sub_kids_soapwash',
    subTypeId: 'tearfree_shampoo',
    name: "Johnson's No More Tears Baby Shampoo 500ml & Himalaya Gentle Baby Soap (12 Pack)",
    price: 1460,
    originalPrice: 2240,
    image: 'https://tse1.mm.bing.net/th/id/OIP.ymDFOmHl669MvuIyghYpdQHaMB?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.9,
    discountBadge: '35% OFF',
    minOrder: 2,
    unitSpec: '12 Units Wholesale Case',
  },
  {
    id: 'kd_9',
    vertical: 'kids',
    subcategoryId: 'sub_kids_powderoils',
    subTypeId: 'massage_oils',
    name: 'Dabur Lal Tail Ayurvedic Baby Massage Oil 500ml & Figaro Pure Olive Oil (12 Bottles)',
    price: 1690,
    originalPrice: 2580,
    image: 'https://tse1.mm.bing.net/th/id/OIP.KFJTN0bNivB5YH3FCdmI7wHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.9,
    discountBadge: '34% OFF',
    minOrder: 2,
    unitSpec: '12 Bottles Carton',
  },
  {
    id: 'kd_10',
    vertical: 'kids',
    subcategoryId: 'sub_kids_oralcare',
    subTypeId: 'kids_toothpaste',
    name: 'Mamaearth Strawberry Fluoride-Free Kids Toothpaste & Colgate Batman Toothbrush (12 Sets)',
    price: 1080,
    originalPrice: 1740,
    image: 'https://tse2.mm.bing.net/th/id/OIP.q_5vuAtWle-RR2nFwYnkZQHaGA?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.8,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: '12 Combo Packs',
  },
  {
    id: 'kd_11',
    vertical: 'kids',
    subcategoryId: 'sub_kids_detergents',
    subTypeId: 'baby_laundry_wash',
    name: 'Mee Mee Antibacterial Baby Laundry Detergent 1.5L & Pigeon Liquid Bottle Cleanser (6 Cans)',
    price: 1490,
    originalPrice: 2390,
    image: 'https://tse4.mm.bing.net/th/id/OIP.oDlpRFH3NOe-rKls2AugVgHaHE?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.9,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: '6x1.5L Master Carton',
  },
  {
    id: 'kd_12',
    vertical: 'kids',
    subcategoryId: 'sub_kids_grooming',
    subTypeId: 'nail_clipper_kits',
    name: '6-In-1 Newborn Baby Nail Clipper, Safety Scissors, Soft Hair Brush & Comb Kit (12 Cases)',
    price: 1180,
    originalPrice: 2160,
    image: 'https://tse4.mm.bing.net/th/id/OIP.Zyi6B5GyBnRDKO-R5aOtowHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'FirstStep Baby Wholesale',
    rating: 4.8,
    discountBadge: '45% OFF',
    minOrder: 2,
    unitSpec: '12 Zipper Kits Box',
  },
  {
    id: 'kd_13',
    vertical: 'kids',
    subcategoryId: 'sub_kids_giftsets',
    subTypeId: 'newborn_gift_boxes',
    name: "Himalaya 7-In-1 Newborn Baby Gift Basket & Johnson's Baby Care Collection Box (6 Hampers)",
    price: 1950,
    originalPrice: 3120,
    image: 'https://tse1.mm.bing.net/th/id/OIP.n_RD0GY6MV0IMgQrFboQQAHaEX?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gandhi Nagar Kids Hub',
    rating: 5.0,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: '6 Gift Hampers Carton',
  },
  {
    id: 'kd_14',
    vertical: 'kids',
    subcategoryId: 'sub_kids_apparel',
    subTypeId: 'rompers_onesies',
    name: '100% Organic Cotton Newborn Baby Rompers, Onesies & Jabla Set (0-24M Size Gaddi of 12)',
    price: 1380,
    originalPrice: 2400,
    image: 'https://tse2.mm.bing.net/th/id/OIP.OWoLhm17UoyLTsdjto78jAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gandhi Nagar Kids Hub',
    rating: 4.9,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '12 Pcs Size Set',
  },
  {
    id: 'kd_15',
    vertical: 'kids',
    subcategoryId: 'sub_kids_accessories',
    subTypeId: 'hooded_blankets',
    name: 'Ultra-Soft Plush Hooded Baby Wrapper Blanket + Muslin Swaddle & Mittens Set (6 Pcs)',
    price: 1240,
    originalPrice: 2190,
    image: 'https://tse4.mm.bing.net/th/id/OIP.PSyY64aWkQuqiVe_Oi88-wHaI_?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gandhi Nagar Kids Hub',
    rating: 4.9,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: 'Pack of 6 Blankets',
  },
  {
    id: 'kd_16',
    vertical: 'kids',
    subcategoryId: 'sub_kids_stackingtoys',
    subTypeId: 'activity_walkers',
    name: 'Musical Sit-to-Stand Baby Activity Push Walker & Fisher-Price Stacking Rings (4 Sets)',
    price: 1880,
    originalPrice: 3299,
    image: 'https://tse4.mm.bing.net/th/id/OIP.0fC932qZWW9WXCRYfAXRXQHaKY?w=600&h=600&c=7&p=0',
    boutiqueName: 'Jhandewalan Toy Mart',
    rating: 4.9,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '4 Walkers Master Box',
  },
  {
    id: 'kd_17',
    vertical: 'kids',
    subcategoryId: 'sub_kids_musicaltoys',
    subTypeId: 'dancing_cactus_talking',
    name: 'Rechargeable Dancing & Talking Musical Cactus Plush Toy + LED Xylophone (Box of 6)',
    price: 1140,
    originalPrice: 2190,
    image: 'https://tse2.mm.bing.net/th/id/OIP.yRfmdGiP_Hq77Gkknps0bwHaHG?w=600&h=600&c=7&p=0',
    boutiqueName: 'Jhandewalan Toy Mart',
    rating: 4.9,
    discountBadge: '48% OFF',
    minOrder: 2,
    unitSpec: '6 Musical Toys Box',
  },
  {
    id: 'kd_18',
    vertical: 'kids',
    subcategoryId: 'sub_kids_rattles',
    subTypeId: 'rattle_sets',
    name: 'Non-Toxic BPA-Free Colorful Baby Rattles & Soothing Silicone Teether Gift Box (12 Sets)',
    price: 960,
    originalPrice: 1799,
    image: 'https://tse3.mm.bing.net/th/id/OIP.1bK_n1O_zQuJWL2zOX6CvAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Jhandewalan Toy Mart',
    rating: 4.8,
    discountBadge: '47% OFF',
    minOrder: 2,
    unitSpec: '12 Gift Boxes Carton',
  },

  // ---------------- COLD DRINKS, COFFEE, WATER & BEVERAGES (12 A-TO-Z) ----------------
  {
    id: 'cd_1',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_cola',
    subTypeId: 'coke_thumsup',
    name: 'Coca-Cola & Thums Up 750ml Party PET Bottles (Wholesale Shrink Peti of 24 Bottles)',
    price: 820,
    originalPrice: 960,
    image: 'https://tse1.mm.bing.net/th/id/OIP.LM9TfUG4oXlKh57FTM8ocwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 5.0,
    discountBadge: '15% OFF',
    minOrder: 2,
    unitSpec: '24 x 750ml Shrink Crate',
  },
  {
    id: 'cd_1b',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_cola',
    subTypeId: 'pepsi_campa',
    name: 'Campa Cola & Pepsi 200ml / 500ml High-Margin Retailer Crate (30 Bottles Peti)',
    price: 490,
    originalPrice: 600,
    image: 'https://tse4.mm.bing.net/th/id/OIP.an729LzSoU500hFxPvxkZgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.9,
    discountBadge: '18% OFF',
    minOrder: 3,
    unitSpec: '30 Bottles Wholesale Peti',
  },
  {
    id: 'cd_2',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_lemon_orange',
    subTypeId: 'sprite_7up_limca',
    name: 'Sprite, Fanta Orange & Mirinda 750ml Chilled Party Pack (24 Bottles Wholesale Case)',
    price: 810,
    originalPrice: 960,
    image: 'https://tse1.mm.bing.net/th/id/OIP.HT8UJ5jExFfUal_o0OzRmAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.9,
    discountBadge: '16% OFF',
    minOrder: 2,
    unitSpec: '24 x 750ml Case',
  },
  {
    id: 'cd_3',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_energy',
    subTypeId: 'sting_predator',
    name: 'Sting Red Energy Drink 250ml (30-Bottle Retailer Peti) + Red Bull 250ml (24-Can Tray)',
    price: 520,
    originalPrice: 600,
    image: 'https://tse1.mm.bing.net/th/id/OIP.u7Y5z7shRxUdV_oV-yugfAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 5.0,
    discountBadge: '13% OFF',
    minOrder: 3,
    unitSpec: '30 x 250ml Sting Peti',
  },
  {
    id: 'cd_4',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_cans',
    subTypeId: 'sleek_cans_300ml',
    name: 'Coca-Cola, Diet Coke, Thums Up & Pepsi 300ml Sleek Aluminum Cans (Tray of 24 Cans)',
    price: 780,
    originalPrice: 960,
    image: 'https://tse2.mm.bing.net/th/id/OIP.uaqVL4O_Zrcjf5L472IeJwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.9,
    discountBadge: '19% OFF',
    minOrder: 2,
    unitSpec: '24 x 300ml Can Tray',
  },
  {
    id: 'cd_5',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_coldcoffee',
    subTypeId: 'nescafe_cans',
    name: "Nescafé Chilled Latte, Intense Café & Hershey's Cold Coffee Cans (24-Can Chiller Tray)",
    price: 1180,
    originalPrice: 1680,
    image: 'https://tse3.mm.bing.net/th/id/OIP.84XUhjhm7lkgi0qYXFrP1AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 5.0,
    discountBadge: '30% OFF',
    minOrder: 2,
    unitSpec: '24 Chilled Coffee Cans',
  },
  {
    id: 'cd_6',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_mango_juices',
    subTypeId: 'maaza_slice_frooti',
    name: 'Maaza Mango Drink 600ml (24 Bottles) & Real Fruit Power Mixed Fruit 1L (12 Tetra Case)',
    price: 990,
    originalPrice: 1320,
    image: 'https://tse2.mm.bing.net/th/id/OIP.kJvYAIYJqvi-DIedkOqtswHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.9,
    discountBadge: '25% OFF',
    minOrder: 2,
    unitSpec: '12 x 1L Tetra Case',
  },
  {
    id: 'cd_7',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_milkshakes',
    subTypeId: 'amul_kool_lassi',
    name: "Amul Kool Kesar Badam Milk & Cavin's Belgian Chocolate Milkshake (24 Bottles Crate)",
    price: 680,
    originalPrice: 840,
    image: 'https://tse3.mm.bing.net/th/id/OIP.ay6PQ13vK4ZtsiY8T6XrzAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Amul Dairy Wholesale Point',
    rating: 4.9,
    discountBadge: '19% OFF',
    minOrder: 2,
    unitSpec: '24 x 200ml Bottles',
  },
  {
    id: 'cd_8',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_icedtea',
    subTypeId: 'lipton_iced_tea',
    name: 'Lipton Lemon Iced Tea 350ml & Paper Boat Aamras / Aam Panna Spout Pouches (24 Pack)',
    price: 640,
    originalPrice: 840,
    image: 'https://tse3.mm.bing.net/th/id/OIP.yTvewMyV_1MS8F15cBWhFgHaLy?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.8,
    discountBadge: '24% OFF',
    minOrder: 2,
    unitSpec: 'Box of 24 Pouches',
  },
  {
    id: 'cd_9',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_water',
    subTypeId: 'bisleri_1l_2l',
    name: 'Bisleri & Kinley 1 Litre Packaged Mineral Water Bottles (Wholesale Box of 12 + 24x250ml)',
    price: 165,
    originalPrice: 240,
    image: 'https://tse1.mm.bing.net/th/id/OIP.B9P7mipSFJSLWVarHGv8NQHaGt?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 5.0,
    discountBadge: '31% OFF',
    minOrder: 5,
    unitSpec: '12 x 1 Litre Peti',
  },
  {
    id: 'cd_10',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_soda_mixers',
    subTypeId: 'club_soda',
    name: 'Kinley Extra Punch Club Soda 750ml & Schweppes Ginger Ale / Tonic Water (24 Case)',
    price: 540,
    originalPrice: 720,
    image: 'https://tse2.mm.bing.net/th/id/OIP.0co5PDJIQTYON4GhsZgK-gHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.8,
    discountBadge: '25% OFF',
    minOrder: 2,
    unitSpec: '24 x 750ml Soda Case',
  },
  {
    id: 'cd_11',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_sports_glucose',
    subTypeId: 'gatorade_prime',
    name: 'Gatorade Blue Bolt 500ml Sports Drink & Glucon-D Tangy Orange Refill (12 Bottle Case)',
    price: 480,
    originalPrice: 600,
    image: 'https://tse3.mm.bing.net/th/id/OIP.dId3L6Cyw18pGeofljtEggHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Beverage Super Depot',
    rating: 4.9,
    discountBadge: '20% OFF',
    minOrder: 2,
    unitSpec: '12 x 500ml Sports Case',
  },
  {
    id: 'cd_12',
    vertical: 'cold_drinks',
    subcategoryId: 'sub_drinks_syrups_squashes',
    subTypeId: 'roohafza_squashes',
    name: 'Hamdard Rooh Afza Sharbat 750ml & Tang Orange Instant Drink 500g (12 Bottles Carton)',
    price: 1580,
    originalPrice: 2040,
    image: 'https://tse4.mm.bing.net/th/id/OIP.Jyz-3MSSR7g-eDQLLramqwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Khari Baoli Dry Fruit House',
    rating: 4.9,
    discountBadge: '23% OFF',
    minOrder: 2,
    unitSpec: '12 x 750ml Syrup Case',
  },

  // ---------------- FASHION & APPAREL (16 A-TO-Z WHOLESALE LOTS) ----------------
  {
    id: 'fs_1',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_mens_tshirts',
    subTypeId: 'oversized_tees',
    name: "Men's 240 GSM Heavyweight Oversized Drop-Shoulder Tees & Matty Collar Polos (Set of 6)",
    price: 1190,
    originalPrice: 1980,
    image: 'https://tse2.mm.bing.net/th/id/OIP.c2JIk4_0mPEN7PKQ43dEmQHaJ3?w=600&h=600&c=7&p=0',
    boutiqueName: 'Tirupur Knitwear Factory Hub',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Set of 6 Pcs (M, L, XL, XXL)',
  },
  {
    id: 'fs_2',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_mens_shirts',
    subTypeId: 'casual_checks_printed',
    name: "Men's Pure Cotton Checks, Linen & Formal Solid Office Shirts (Master Gaddi of 6)",
    price: 1450,
    originalPrice: 2400,
    image: 'https://tse2.mm.bing.net/th/id/OIP.QdzapufxVWnYv-6_e3luBwHaFc?w=600&h=600&c=7&p=0',
    boutiqueName: 'Tank Road Garment Hub',
    rating: 4.8,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Box Pack of 6 Shirts',
  },
  {
    id: 'fs_3',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_mens_jeans',
    subTypeId: 'denim_jeans',
    name: "Men's Stretchable Ankle-Fit Denim Jeans & 6-Pocket Cotton Cargo Trousers (Set of 5)",
    price: 1890,
    originalPrice: 2999,
    image: 'https://tse4.mm.bing.net/th/id/OIP.bkfS3JyYlR3nFKpn-6B5uAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Tank Road Garment Hub',
    rating: 4.9,
    discountBadge: '37% OFF',
    minOrder: 2,
    unitSpec: 'Size Set 28-36 (5 Pcs)',
  },
  {
    id: 'fs_4',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_mens_ethnic',
    subTypeId: 'festive_kurtas',
    name: "Men's Lucknowi Chikankari Cotton Silk Kurta Pyjama & Modi Nehru Jacket Combo",
    price: 1380,
    originalPrice: 2299,
    image: 'https://tse3.mm.bing.net/th/id/OIP.BexJXQ__N_yBRDsAeBEMPQHaJ3?w=600&h=600&c=7&p=0',
    boutiqueName: 'Chandni Chowk Ethnic Couture',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Festive Set of 4 Pcs',
  },
  {
    id: 'fs_5',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_womens_kurtis',
    subTypeId: 'anarkali_pant_sets',
    name: "Women's Jaipuri Foil-Printed Rayon Anarkali 3-Pc Kurti-Pant-Dupatta Catalog Set",
    price: 1560,
    originalPrice: 2599,
    image: 'https://tse3.mm.bing.net/th/id/OIP.dowzJ7kxp14T1abnVJ5aAwHaKw?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surat Textile Mandi',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Catalog Bag of 4 Suits',
  },
  {
    id: 'fs_6',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_womens_sarees',
    subTypeId: 'silk_cotton_sarees',
    name: 'Royal Banarasi Zari Woven Silk Saree with Unstitched Brocade Blouse & Box Packing',
    price: 1750,
    originalPrice: 3199,
    image: 'https://tse3.mm.bing.net/th/id/OIP.uIRIog-olHbCuOZTFBXTWwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surat Textile Mandi',
    rating: 5.0,
    discountBadge: '45% OFF',
    minOrder: 2,
    unitSpec: 'Box of 4 Sarees',
  },
  {
    id: 'fs_7',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_womens_western',
    subTypeId: 'midi_dresses_coords',
    name: "Women's Floral Georgette Midi Dresses, Korean Ribbed Crop Tops & Co-ord Sets (6 Pcs)",
    price: 1320,
    originalPrice: 2199,
    image: 'https://tse4.mm.bing.net/th/id/OIP.h17kCukxMef4YXNmOLmH7wHaLH?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sarojini Export Surplus Hub',
    rating: 4.8,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Assorted Pack of 6 Pcs',
  },
  {
    id: 'fs_8',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_womens_bottoms',
    subTypeId: 'palazzos_leggings',
    name: "Women's High-Waist Wide-Leg Denim Jeans, Cotton Palazzos & 4-Way Lycra Leggings (10 Pcs)",
    price: 1490,
    originalPrice: 2490,
    image: 'https://tse3.mm.bing.net/th/id/OIP.vaIzeLYPkqsupwQBHuQKzAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Tirupur Knitwear Factory Hub',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: '10 Colors Master Bundle',
  },
  {
    id: 'fs_9',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_boys_wear',
    subTypeId: 'boys_baba_suits',
    name: "Boys' Cotton Graphic T-Shirt & Denim Shorts Baba Suit Sets (Age 2-10 Yrs, 6 Sets)",
    price: 990,
    originalPrice: 1650,
    image: 'https://tse4.mm.bing.net/th/id/OIP.RKL42CCWQPD4M3k1I0fGygHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gandhi Nagar Kids Garments',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Box of 6 Size Sets',
  },
  {
    id: 'fs_10',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_girls_wear',
    subTypeId: 'girls_party_frocks',
    name: "Girls' Birthday Net Princess Frocks, Sequined Midi Dresses & Lehenga Choli (6 Pcs)",
    price: 1280,
    originalPrice: 2199,
    image: 'https://tse1.mm.bing.net/th/id/OIP.TeYQDvIhhCed9XwfaiXb1AHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Gandhi Nagar Kids Garments',
    rating: 4.9,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: '6 Pcs Hanger Pack',
  },
  {
    id: 'fs_11',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_activewear',
    subTypeId: 'trackpants_joggers',
    name: '4-Way Stretch NS Lycra Sports Trackpants, Gym Joggers & Dry-Fit Shorts (6 Pcs)',
    price: 1080,
    originalPrice: 1800,
    image: 'https://tse2.mm.bing.net/th/id/OIP.w1kxO35ptoOoaXgpcJgpawHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Ludhiana Hosiery Mill',
    rating: 4.8,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: '6 Pcs Zip-Pocket Bundle',
  },
  {
    id: 'fs_12',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_innerwear',
    subTypeId: 'mens_vests_briefs',
    name: "Jockey / Lux Cozi Men's Combed Cotton Gym Vests (Baniyan), Trunks & Everyday Lingerie Box",
    price: 890,
    originalPrice: 1320,
    image: 'https://tse4.mm.bing.net/th/id/OIP.gDwvOkKl2MD-PaD20qwZ3wHaJD?w=600&h=600&c=7&p=0',
    boutiqueName: 'Tirupur Knitwear Factory Hub',
    rating: 4.9,
    discountBadge: '33% OFF',
    minOrder: 2,
    unitSpec: '12 Pcs Master Box',
  },
  {
    id: 'fs_13',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_nightwear',
    subTypeId: 'cotton_night_suits',
    name: "Women's Soft Printed Cotton Collar Night Suit Pyjama Set & Alpine Maxi Nighties (4 Pcs)",
    price: 1120,
    originalPrice: 1899,
    image: 'https://tse2.mm.bing.net/th/id/OIP.dwgQ9F2dJXLpaOd7WycBHwHaLI?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surat Textile Mandi',
    rating: 4.8,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: 'Set of 4 Night Suits',
  },
  {
    id: 'fs_14',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_winterwear',
    subTypeId: 'hoodies_sweatshirts',
    name: '320 GSM Brushed Fleece Kangaroo Hoodies, Quilted Puffer Jackets & Thermal Innerwear Lot',
    price: 1950,
    originalPrice: 3299,
    image: 'https://tse1.mm.bing.net/th/id/OIP.RRjIoQGFPeafG_e2tBOqVwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Ludhiana Hosiery Mill',
    rating: 4.9,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: 'Winter Bale of 4 Pcs',
  },
  {
    id: 'fs_15',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_fabrics',
    subTypeId: 'unstitched_salwar',
    name: "Unstitched Pure Cambric Cotton Salwar Suit Dress Material & Men's Raymond Shirting Cut",
    price: 1340,
    originalPrice: 2200,
    image: 'https://tse1.mm.bing.net/th/id/OIP.26c-s68bO7ieIxws3GMP1AHaJ4?w=600&h=600&c=7&p=0',
    boutiqueName: 'Surat Textile Mandi',
    rating: 4.9,
    discountBadge: '39% OFF',
    minOrder: 2,
    unitSpec: 'Bag of 4 Dress Materials',
  },
  {
    id: 'fs_16',
    vertical: 'fashion',
    subcategoryId: 'sub_fash_accessories',
    subTypeId: 'dupattas_stoles',
    name: 'Phulkari Chiffon Dupattas, Reversible Leather Belts, Wallets & Cotton Hankies Combo',
    price: 780,
    originalPrice: 1350,
    image: 'https://tse3.mm.bing.net/th/id/OIP.XsPYN3K1brD1CDMZ9rgkCQHaJ4?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Bazar Fashion Accessories',
    rating: 4.8,
    discountBadge: '42% OFF',
    minOrder: 3,
    unitSpec: '12 Pcs Counter Display',
  },

  // ---------------- FOOTWEAR — SHOES, CROCS & CHAPPALS (12 A-TO-Z LOTS) ----------------
  {
    id: 'fw_1',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_crocs',
    subTypeId: 'eva_crocs_clogs',
    name: 'Waterproof EVA Crocs Style Classic Clogs with 3D Jibbitz Charms (Men/Women 6-Pair Carton)',
    price: 1140,
    originalPrice: 2100,
    image: 'https://tse4.mm.bing.net/th/id/OIP.9Ld1NC2QHvp6JjSMk5HhHAHaGJ?w=600&h=600&c=7&p=0',
    boutiqueName: 'Inderlok Footwear Mandi',
    rating: 4.9,
    discountBadge: '46% OFF',
    minOrder: 2,
    unitSpec: '6 Pairs Size Set (6-10)',
  },
  {
    id: 'fw_2',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_mens_sports',
    subTypeId: 'running_gym_shoes',
    name: "Campus / Sparx Style Men's Breathable Mesh Air-Cushion Running & Gym Sports Shoes (4 Pairs)",
    price: 1680,
    originalPrice: 2999,
    image: 'https://tse2.mm.bing.net/th/id/OIP.Ag66n4V5R-Acrgf4iPq6xwHaE7?w=600&h=600&c=7&p=0',
    boutiqueName: 'Agra Shoe Factory Outlet',
    rating: 4.9,
    discountBadge: '44% OFF',
    minOrder: 2,
    unitSpec: '4 Pairs Master Box',
  },
  {
    id: 'fw_3',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_mens_sneakers',
    subTypeId: 'chunky_sneakers',
    name: "Men's Trendy Colorblock White Chunky Streetwear Sneakers & Driving Loafers (4 Pairs)",
    price: 1590,
    originalPrice: 2799,
    image: 'https://tse4.mm.bing.net/th/id/OIP.1PwHxPJMnXDgVxtxoFzU4QHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Agra Shoe Factory Outlet',
    rating: 4.8,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '4 Pairs Boxed Set',
  },
  {
    id: 'fw_4',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_mens_chappals',
    subTypeId: 'hawaii_flipflops',
    name: "Relaxo Bahamas / Flite Style Men's Printed Flip-Flops, Hawaii Chappals & Pool Sliders (12 Pairs)",
    price: 1080,
    originalPrice: 1800,
    image: 'https://tse1.mm.bing.net/th/id/OIP.fkrQIUuG3UsGIlkOXU-i6wHaEK?w=600&h=600&c=7&p=0',
    boutiqueName: 'Inderlok Footwear Mandi',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: 'Dozen Bag (12 Pairs)',
  },
  {
    id: 'fw_5',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_mens_formal',
    subTypeId: 'formal_derby_oxford',
    name: "Men's Pure Leather Derby Office Formal Shoes & Roman Comfort Velcro Floaters (4 Pairs)",
    price: 1840,
    originalPrice: 3199,
    image: 'https://tse2.mm.bing.net/th/id/OIP._LuRIORniVlxXDwcGYNGFAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Agra Shoe Factory Outlet',
    rating: 4.9,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: '4 Pairs Individual Boxes',
  },
  {
    id: 'fw_6',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_womens_heels',
    subTypeId: 'block_heels_pumps',
    name: "Women's Rose-Gold Party Block Heels, Crystal Bridal Sandals & Ethnic Wedges (6 Pairs)",
    price: 1790,
    originalPrice: 3299,
    image: 'https://tse1.mm.bing.net/th/id/OIP.KMTEMJF_GFeggIxI5PzZEgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Karol Bagh Bridal Footwear',
    rating: 4.9,
    discountBadge: '46% OFF',
    minOrder: 2,
    unitSpec: '6 Pairs Size Set (36-41)',
  },
  {
    id: 'fw_7',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_womens_flats',
    subTypeId: 'punjabi_juttis',
    name: "Women's Handcrafted Mirror-Work Punjabi Juttis, Mojris & Cushioned Office Bellies (6 Pairs)",
    price: 1320,
    originalPrice: 2399,
    image: 'https://tse2.mm.bing.net/th/id/OIP.APqBSOZIlFhqJx-7wK9pOwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Jaipur Heritage Jutti House',
    rating: 4.9,
    discountBadge: '45% OFF',
    minOrder: 2,
    unitSpec: '6 Pairs Festive Box',
  },
  {
    id: 'fw_8',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_womens_sneakers',
    subTypeId: 'womens_pastel_sneakers',
    name: "Women's Pastel Pink Lace-Up Platform Sneakers & Memory-Foam Walking Shoes (4 Pairs)",
    price: 1480,
    originalPrice: 2599,
    image: 'https://tse1.mm.bing.net/th/id/OIP.k5TITEn7_GrTj1BLip1M7QHaE7?w=600&h=600&c=7&p=0',
    boutiqueName: 'Inderlok Footwear Mandi',
    rating: 4.8,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '4 Pairs Shoe Carton',
  },
  {
    id: 'fw_9',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_womens_chappals',
    subTypeId: 'eva_cloud_slippers',
    name: "Women's Thick-Sole EVA Cloud Pillow Sliders & Doctor Ortho Daily PU Chappals (12 Pairs)",
    price: 1180,
    originalPrice: 1980,
    image: 'https://tse4.mm.bing.net/th/id/OIP.SXEJjzU4LeegUYQy0C3-wQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Inderlok Footwear Mandi',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: '12 Pairs Assorted Colors',
  },
  {
    id: 'fw_10',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_kids_shoes',
    subTypeId: 'kids_led_sneakers',
    name: "Kids' LED Light-Up Velcro Sneakers, Musical Chu-Chu Sandals & Cartoon Crocs Clogs (6 Pairs)",
    price: 1150,
    originalPrice: 1999,
    image: 'https://tse2.mm.bing.net/th/id/OIP.OV77flhMTBZtvwVGCnNNZgHaGW?w=600&h=600&c=7&p=0',
    boutiqueName: 'Inderlok Footwear Mandi',
    rating: 5.0,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: '6 Pairs Kids Size Lot',
  },
  {
    id: 'fw_11',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_school_shoes',
    subTypeId: 'black_school_shoes',
    name: 'Heavy-Duty Black Velcro School Shoes & White PT Canvas Uniform Shoes (6 Pairs Carton)',
    price: 1290,
    originalPrice: 2100,
    image: 'https://tse4.mm.bing.net/th/id/OIP.AgKbd_dAGFQ8u8HWjTTnmAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Agra Shoe Factory Outlet',
    rating: 4.9,
    discountBadge: '39% OFF',
    minOrder: 2,
    unitSpec: '6 Pairs School Lot',
  },
  {
    id: 'fw_12',
    vertical: 'footwear',
    subcategoryId: 'sub_foot_socks_care',
    subTypeId: 'cotton_socks_dozen',
    name: 'Combed Cotton Sports Ankle Socks (24 Pairs) + Cherry Blossom Shoe Polish & Shiner Sponges',
    price: 680,
    originalPrice: 1200,
    image: 'https://tse3.mm.bing.net/th/id/OIP.qVzmAh4vAzm4P6lCv5jGNAHaJ4?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Hosiery & Footwear Care',
    rating: 4.8,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '2 Dozen Socks + Polish',
  },

  // ---------------- DECOR & HOME FURNISHINGS (12 A-TO-Z LOTS) ----------------
  {
    id: 'dc_1',
    vertical: 'decor',
    subcategoryId: 'sub_decor_bedsheets',
    subTypeId: 'cotton_bedsheets',
    name: 'Jaipuri 300 TC Glace Cotton King-Size Double Bedsheets with 2 Pillow Covers + Mink Blanket',
    price: 1350,
    originalPrice: 2299,
    image: 'https://tse3.mm.bing.net/th/id/OIP.9LHt7MwbXh02IwOE3bkANwHaGz?w=600&h=600&c=7&p=0',
    boutiqueName: 'Panipat Handloom Mill',
    rating: 4.9,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: 'Pack of 4 Bedsheet Sets',
  },
  {
    id: 'dc_2',
    vertical: 'decor',
    subcategoryId: 'sub_decor_curtains',
    subTypeId: 'door_window_curtains',
    name: '7ft Blackout Eyelet Door Curtains (4 Pcs) + 5-Pc Quilted Velvet Cushion Cover Set',
    price: 1180,
    originalPrice: 1999,
    image: 'https://tse2.mm.bing.net/th/id/OIP.wocKX3Sm9Lbzuhv7J4GpOwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Panipat Handloom Mill',
    rating: 4.8,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: '4 Curtains + 5 Covers',
  },
  {
    id: 'dc_3',
    vertical: 'decor',
    subcategoryId: 'sub_decor_plants_vases',
    subTypeId: 'artificial_bonsai',
    name: 'Artificial Potted Bonsai Tree, Money Plant Creepers & Gold-Rimmed Ceramic Flower Vase Set',
    price: 890,
    originalPrice: 1599,
    image: 'https://tse3.mm.bing.net/th/id/OIP.Ft4Zis70_698bI37xDASkwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Moradabad Craft Exports',
    rating: 4.9,
    discountBadge: '44% OFF',
    minOrder: 3,
    unitSpec: 'Set of 6 Decor Pieces',
  },
  {
    id: 'dc_4',
    vertical: 'decor',
    subcategoryId: 'sub_decor_lamps_lights',
    subTypeId: 'bedside_table_lamps',
    name: '3-Color Crystal Touch Bedside Table Lamp + 10m Warm White LED Fairy Curtain String Lights',
    price: 960,
    originalPrice: 1799,
    image: 'https://tse3.mm.bing.net/th/id/OIP.UZeiArIVg7Su4bGqMzyNvgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Bhagirath Decor Lighting',
    rating: 4.9,
    discountBadge: '47% OFF',
    minOrder: 3,
    unitSpec: '4 Lamps + 6 String Lights',
  },
  {
    id: 'dc_5',
    vertical: 'decor',
    subcategoryId: 'sub_decor_wall_clocks',
    subTypeId: 'designer_wall_clocks',
    name: 'Ajanta Sweep-Movement Designer Wall Clock + 5-Panel Framed Radhakrishna Wall Art Set',
    price: 1120,
    originalPrice: 1950,
    image: 'https://tse3.mm.bing.net/th/id/OIP.qbr7Khp52Zh8ZDipMvQEsAHaIr?w=600&h=600&c=7&p=0',
    boutiqueName: 'Moradabad Craft Exports',
    rating: 4.8,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: '3 Clocks + 2 Wall Frames',
  },
  {
    id: 'dc_6',
    vertical: 'decor',
    subcategoryId: 'sub_decor_idols',
    subTypeId: 'ganesha_buddha_idols',
    name: 'Antique Brass Finish Lord Ganesha Idol, Meditating Buddha Statue & Vastu Running Horses',
    price: 1290,
    originalPrice: 2299,
    image: 'https://tse1.mm.bing.net/th/id/OIP.VY1FV88_ncQ0Iiu0dkV4HAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Moradabad Craft Exports',
    rating: 5.0,
    discountBadge: '44% OFF',
    minOrder: 2,
    unitSpec: 'Gift Carton of 4 Idols',
  },
  {
    id: 'dc_7',
    vertical: 'decor',
    subcategoryId: 'sub_decor_pooja',
    subTypeId: 'brass_diyas_urlis',
    name: 'Pure Brass Hammered Urli Floating Bowl, Akhand Crystal Diya & Meenakari Pooja Thali Set',
    price: 1420,
    originalPrice: 2499,
    image: 'https://tse3.mm.bing.net/th/id/OIP._okn6wOXOGFR0ipkFg4IpgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Moradabad Craft Exports',
    rating: 4.9,
    discountBadge: '43% OFF',
    minOrder: 2,
    unitSpec: 'Festive Brass Combo',
  },
  {
    id: 'dc_8',
    vertical: 'decor',
    subcategoryId: 'sub_decor_carpets_mats',
    subTypeId: 'antiskid_doormats',
    name: '5x7 Ft Persian Velvet Living Room Carpet + 6 Anti-Skid Microfiber Bath & Door Mats',
    price: 1380,
    originalPrice: 2399,
    image: 'https://tse2.mm.bing.net/th/id/OIP.2ortvv67YzmZQZnXi7uLxgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Panipat Handloom Mill',
    rating: 4.8,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: '1 Carpet + 6 Doormats',
  },
  {
    id: 'dc_9',
    vertical: 'decor',
    subcategoryId: 'sub_decor_candles',
    subTypeId: 'scented_jar_candles',
    name: 'Luxury Soy Wax Scented Glass Jar Candles, Lavender Reed Diffuser & Backflow Smoke Fountain',
    price: 840,
    originalPrice: 1499,
    image: 'https://tse1.mm.bing.net/th/id/OIP.P8gGHe0qgLAVkBnyM9rDyAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Gift & Aroma Mart',
    rating: 4.9,
    discountBadge: '44% OFF',
    minOrder: 3,
    unitSpec: 'Box of 6 Aroma Sets',
  },
  {
    id: 'dc_10',
    vertical: 'decor',
    subcategoryId: 'sub_decor_storage',
    subTypeId: 'modular_drawers_racks',
    name: '4-Tier Modular Plastic Drawer Storage Rack, Collapsible Laundry Basket & 24 Steel Hangers',
    price: 1150,
    originalPrice: 1990,
    image: 'https://tse1.mm.bing.net/th/id/OIP.VZlqTosSxaguGYqwknwM_wHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Plastic Houseware',
    rating: 4.8,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: 'Complete Organizer Kit',
  },
  {
    id: 'dc_11',
    vertical: 'decor',
    subcategoryId: 'sub_decor_dining',
    subTypeId: 'trays_table_mats',
    name: 'Enamel Printed Serving Trays (Set of 3), 6-Seater PVC Table Cover & 6 Airtight Glass Jars',
    price: 980,
    originalPrice: 1699,
    image: 'https://tse2.mm.bing.net/th/id/OIP.nlO18NcNgZi1zXi7sMP4qgHaGq?w=600&h=600&c=7&p=0',
    boutiqueName: 'Moradabad Craft Exports',
    rating: 4.9,
    discountBadge: '42% OFF',
    minOrder: 2,
    unitSpec: 'Dining & Kitchen Set',
  },
  {
    id: 'dc_12',
    vertical: 'decor',
    subcategoryId: 'sub_decor_bath_towels',
    subTypeId: 'cotton_bath_towels',
    name: '500 GSM Pure Combed Cotton Bath Towels (4 Pcs) + Printed 20L Bathroom Bucket, Mug & Stool',
    price: 1240,
    originalPrice: 2099,
    image: 'https://tse3.mm.bing.net/th/id/OIP.J27OS_5o5Dfkf371h30XSwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Panipat Handloom Mill',
    rating: 4.9,
    discountBadge: '41% OFF',
    minOrder: 2,
    unitSpec: '4 Towels + Bath Set',
  },

  // ---------------- IMPORTED GOURMET & GLOBAL GOODS (8 A-TO-Z LOTS) ----------------
  {
    id: 'im_1',
    vertical: 'imported',
    subcategoryId: 'sub_imp_chocolates',
    subTypeId: 'ferrero_lindt',
    name: 'Imported Ferrero Rocher 24-Pc Golden Box, Lindt Lindor Truffles & Toblerone Swiss Pack',
    price: 1590,
    originalPrice: 2199,
    image: 'https://tse3.mm.bing.net/th/id/OIP.LbBi0y6Gp_JIhphaGcGIwwHaHg?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 5.0,
    discountBadge: '28% OFF',
    minOrder: 2,
    unitSpec: 'Imported Confectionery Case',
  },
  {
    id: 'im_2',
    vertical: 'imported',
    subcategoryId: 'sub_imp_ramen',
    subTypeId: 'samyang_buldak',
    name: 'Samyang Buldak Carbonara & 2x Spicy Korean Ramen (5-Pack x 4) + Nongshim Shin Ramyun Cups',
    price: 1680,
    originalPrice: 2350,
    image: 'https://tse3.mm.bing.net/th/id/OIP.9BDvtQbO621sHSu1TkEfsgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 4.9,
    discountBadge: '29% OFF',
    minOrder: 2,
    unitSpec: '20 Ramen Packs + 6 Cups',
  },
  {
    id: 'im_3',
    vertical: 'imported',
    subcategoryId: 'sub_imp_snacks',
    subTypeId: 'pringles_doritos',
    name: 'Imported Pringles Sour Cream & Original Cans (12x165g) + Lotus Biscoff Caramelized Biscuits',
    price: 1490,
    originalPrice: 2040,
    image: 'https://tse2.mm.bing.net/th/id/OIP.gN-vlC3YmGofQiV79NEKDAHaFc?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 4.9,
    discountBadge: '27% OFF',
    minOrder: 2,
    unitSpec: '12 Cans + Biscoff Pack',
  },
  {
    id: 'im_4',
    vertical: 'imported',
    subcategoryId: 'sub_imp_coffee_spreads',
    subTypeId: 'davidoff_nescafe_gold',
    name: 'Davidoff Rich Aroma & Espresso 57 Instant Coffee 100g (3 Jars) + Nutella Hazelnut Spread 750g',
    price: 1850,
    originalPrice: 2599,
    image: 'https://tse2.mm.bing.net/th/id/OIP.7lA3L3NYdnYfUPqxTutHgwHaTQ?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 5.0,
    discountBadge: '29% OFF',
    minOrder: 2,
    unitSpec: '3 Coffee Jars + Nutella',
  },
  {
    id: 'im_5',
    vertical: 'imported',
    subcategoryId: 'sub_imp_drinks',
    subTypeId: 'monster_prime_cans',
    name: 'Imported Monster White Ultra 500ml, Prime Hydration & Mogu Mogu Lychee Nata De Coco (24 Case)',
    price: 1920,
    originalPrice: 2640,
    image: 'https://tse1.mm.bing.net/th/id/OIP.wCJA0YkxTPvWlamLn4vXOAHaLG?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 4.9,
    discountBadge: '27% OFF',
    minOrder: 2,
    unitSpec: '24 Imported Bottles/Cans',
  },
  {
    id: 'im_6',
    vertical: 'imported',
    subcategoryId: 'sub_imp_dates_dryfruits',
    subTypeId: 'kimia_medjool_dates',
    name: 'Saudi King Medjool & Kimia Gold Dates (6x500g Boxes) + Ocean Spray Dried Cranberries 1Kg',
    price: 1640,
    originalPrice: 2299,
    image: 'https://tse1.mm.bing.net/th/id/OIP.wpVHyVIBprxW8oZA7moWEgHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Khari Baoli Dry Fruit House',
    rating: 5.0,
    discountBadge: '29% OFF',
    minOrder: 2,
    unitSpec: '6 Dates Boxes + 1Kg Berries',
  },
  {
    id: 'im_7',
    vertical: 'imported',
    subcategoryId: 'sub_imp_pasta_sauces',
    subTypeId: 'extra_virgin_olive',
    name: 'Borges Extra Virgin Olive Oil 2L Tin, Huy Fong Sriracha Hot Chilli Sauce & Barilla Penne Pasta',
    price: 2150,
    originalPrice: 2999,
    image: 'https://tse4.mm.bing.net/th/id/OIP.hLRtNrEkbEYMIBo7iojJlwHaM0?w=600&h=600&c=7&p=0',
    boutiqueName: 'Crawford Imported Mart',
    rating: 4.9,
    discountBadge: '28% OFF',
    minOrder: 2,
    unitSpec: 'Cafe & Gourmet Pantry Kit',
  },
  {
    id: 'im_8',
    vertical: 'imported',
    subcategoryId: 'sub_imp_perfumes_care',
    subTypeId: 'lattafa_rasasi_oud',
    name: 'Lattafa Khamrah & Asad Dubai Oud EDP 100ml + Imported USA Dove Crushed Macadamia Body Scrub',
    price: 2290,
    originalPrice: 3499,
    image: 'https://tse1.mm.bing.net/th/id/OIP.vQXyFKg_inInqhry_A-zAQHaJQ?w=600&h=600&c=7&p=0',
    boutiqueName: 'Al-Haramain Fragrance Mart',
    rating: 5.0,
    discountBadge: '35% OFF',
    minOrder: 2,
    unitSpec: '2 Dubai Perfumes + Scrub',
  },

  // ---------------- OTHERS — GENERAL WHOLESALE MERCHANDISE (DIRECT FEED, NO SUB-CATEGORY GRID) ----------------
  {
    id: 'ot_1',
    vertical: 'others',
    subcategoryId: 'sub_others_packaging',
    name: '3-Ply Corrugated E-Commerce Courier Boxes (100 Pcs) + 6 Brown BOPP Packing Tape Rolls',
    price: 780,
    originalPrice: 1299,
    image: 'https://tse1.mm.bing.net/th/id/OIP.px9moFHGVwl-a8uWCHhj9QHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Packaging & Supplies',
    rating: 4.9,
    discountBadge: '40% OFF',
    minOrder: 2,
    unitSpec: '100 Boxes + 6 Tapes',
  },
  {
    id: 'ot_2',
    vertical: 'others',
    subcategoryId: 'sub_others_bottles_tiffin',
    name: 'Milton Thermosteel 1000ml Hot & Cold Vacuum Flask + 3-Container Insulated Steel Lunch Box',
    price: 1190,
    originalPrice: 1899,
    image: 'https://tse3.mm.bing.net/th/id/OIP.carAFzrQB_mTRUs4tyBzHwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Plastic Houseware',
    rating: 4.9,
    discountBadge: '37% OFF',
    minOrder: 3,
    unitSpec: 'Combo Gift Set',
  },
  {
    id: 'ot_3',
    vertical: 'others',
    subcategoryId: 'sub_others_rainwear',
    name: '3-Fold Automatic Windproof Rainbow Umbrella & Heavy Reversible Waterproof Raincoat Suit (6 Pcs)',
    price: 1340,
    originalPrice: 2200,
    image: 'https://tse1.mm.bing.net/th/id/OIP.kSlQGgG3yzUWXOE_FLy4-gHaEZ?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Bazar General Hub',
    rating: 4.8,
    discountBadge: '39% OFF',
    minOrder: 2,
    unitSpec: '6 Pcs Monsoon Lot',
  },
  {
    id: 'ot_4',
    vertical: 'others',
    subcategoryId: 'sub_others_auto_care',
    name: '800 GSM Dual-Sided Car Cleaning Microfiber Cloths (12 Pcs) + Dashboard Shiner & Tyre Foam Spray',
    price: 690,
    originalPrice: 1199,
    image: 'https://tse1.mm.bing.net/th/id/OIP.0z3WYSVIpsptYSHQaGHZMAHaFj?w=600&h=600&c=7&p=0',
    boutiqueName: 'Kashmere Gate Auto Accessories',
    rating: 4.8,
    discountBadge: '42% OFF',
    minOrder: 3,
    unitSpec: '12 Cloths + 2 Sprays',
  },
  {
    id: 'ot_5',
    vertical: 'others',
    subcategoryId: 'sub_others_fresheners',
    name: 'Godrej Aer Pocket Bathroom Fragrances (24 Pcs Hanger) & Odonil Room Air Freshener Spray (6 Cans)',
    price: 940,
    originalPrice: 1380,
    image: 'https://tse3.mm.bing.net/th/id/OIP.7EKZxYssUBCf5f54T2u8NAHaHQ?w=600&h=600&c=7&p=0',
    boutiqueName: 'Hindustan FMCG Wholesale',
    rating: 4.9,
    discountBadge: '32% OFF',
    minOrder: 2,
    unitSpec: '24 Pockets + 6 Sprays',
  },
  {
    id: 'ot_6',
    vertical: 'others',
    subcategoryId: 'sub_others_hardware',
    name: 'Harrison / Link Heavy-Duty Brass & Hardened Steel Padlocks 65mm with 4 Computer Keys (6 Locks)',
    price: 1120,
    originalPrice: 1799,
    image: 'https://tse3.mm.bing.net/th/id/OIP.tIdK9rEypXTkaBoww1duiAHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Chawri Bazar Hardware Mart',
    rating: 4.9,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: 'Box of 6 Shutter Locks',
  },
  {
    id: 'ot_7',
    vertical: 'others',
    subcategoryId: 'sub_others_pos_billing',
    name: '79mm POS Thermal Billing Paper Rolls (50 Rolls Box) + Handheld Price Tag Labeller Gun',
    price: 890,
    originalPrice: 1450,
    image: 'https://tse3.mm.bing.net/th/id/OIP.Y47KjCy9i2U3LgpwSykWhwHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Nehru Place Retail Supplies',
    rating: 4.8,
    discountBadge: '39% OFF',
    minOrder: 2,
    unitSpec: '50 Rolls + Price Gun',
  },
  {
    id: 'ot_8',
    vertical: 'others',
    subcategoryId: 'sub_others_pet_care',
    name: 'Pedigree Adult Chicken & Vegetables Dry Dog Food 10kg Bag + Whiskas Cat Food Pouches (12s)',
    price: 1890,
    originalPrice: 2450,
    image: 'https://tse3.mm.bing.net/th/id/OIP.lst-nnOcZU7B_c3ry9c0egHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Metro Pet Care Distributors',
    rating: 4.9,
    discountBadge: '23% OFF',
    minOrder: 2,
    unitSpec: '10Kg Bag + 12 Pouches',
  },
  {
    id: 'ot_9',
    vertical: 'others',
    subcategoryId: 'sub_others_pest_control',
    name: 'Kala Hit & Lal Hit Mosquito/Cockroach Spray 400ml (6 Cans) + Good Knight Gold Flash Refills (12s)',
    price: 1260,
    originalPrice: 1740,
    image: 'https://tse3.mm.bing.net/th/id/OIP.zCWkZBKWaWkr8NFk4Z6fngHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Hindustan FMCG Wholesale',
    rating: 4.9,
    discountBadge: '28% OFF',
    minOrder: 2,
    unitSpec: '6 Sprays + 12 Refills',
  },
  {
    id: 'ot_10',
    vertical: 'others',
    subcategoryId: 'sub_others_plastic_furniture',
    name: 'Heavy-Duty Virgin Plastic Armchairs (Set of 4) + 2 Multipurpose Folding Step Stools',
    price: 1990,
    originalPrice: 3200,
    image: 'https://tse3.mm.bing.net/th/id/OIP.mqvO0-AgS9TjknwNjJLUJQHaHa?w=600&h=600&c=7&p=0',
    boutiqueName: 'Sadar Plastic Houseware',
    rating: 4.8,
    discountBadge: '38% OFF',
    minOrder: 2,
    unitSpec: 'Stack of 4 Chairs + 2 Stools',
  },
];

// ============================================================================
// 4. UNIFIED 3-LEVEL WHOLESALE TAXONOMY & SMART AUTO-CATEGORY ENGINE
// ============================================================================
export interface WholesaleVerticalDefinition {
  id: WholesaleVerticalId;
  label: string;
  accentColor: string;
  unitOptions: string[];
  categories: SubcategoryTileItem[];
}

export const WHOLESALE_VERTICAL_DEFINITIONS: WholesaleVerticalDefinition[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    accentColor: '#6D28D9',
    unitOptions: ['Master Carton (4 Pcs)', 'Box of 10 Pcs', 'Wholesale Box (6 Pcs)', '90m Coil Roll', '12 Pcs Carton'],
    categories: ELECTRONICS_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    accentColor: '#0D9488',
    unitOptions: ['20 Strips Box', '10x10 Blister Box', 'Pack of 6 Bottles', 'Box of 25 Sachets', '50 Strips Pack'],
    categories: PHARMACY_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'ration',
    label: 'Ration & Kirana',
    accentColor: '#B45309',
    unitOptions: ['50 Kg Mandi Katta', '25 Kg Bori', '10 Kg Wholesale Bag', '15 Litre Metal Tin', 'Master Carton + Ladi'],
    categories: RATION_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'beauty',
    label: 'Beauty & Cosmetics',
    accentColor: '#DB2777',
    unitOptions: ['Counter Box of 12', 'Salon Pack of 6', '24 Pcs Display Tray', '12 Pcs Hanger Card'],
    categories: BEAUTY_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'kids',
    label: 'Kids, Baby & Toys',
    accentColor: '#0284C7',
    unitOptions: ['6 Jumbo Packs Bale', '12 Units Carton', 'Size Set of 6 Pcs', 'Box of 12 Toys'],
    categories: KIDS_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'cold_drinks',
    label: 'Cold Drinks & Beverages',
    accentColor: '#0891B2',
    unitOptions: ['24 Bottles Shrink Peti', '30 Bottles Crate', '24 Cans Chiller Tray', '12 x 1L Master Case'],
    categories: COLD_DRINKS_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'fashion',
    label: 'Fashion & Apparel',
    accentColor: '#E11D48',
    unitOptions: ['Set of 6 Pcs (S-XXL)', 'Set of 4 Pcs', '12 Pcs Master Gaddi', 'Single Catalog Lot'],
    categories: FASHION_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'footwear',
    label: 'Footwear, Crocs & Shoes',
    accentColor: '#2563EB',
    unitOptions: ['6 Pairs Size Set', '4 Pairs Master Box', 'Dozen Bag (12 Pairs)', '8 Pairs Carton'],
    categories: FOOTWEAR_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'decor',
    label: 'Home Decor & Furnishings',
    accentColor: '#4F46E5',
    unitOptions: ['Set of 4 Pieces', 'Master Carton (6 Pcs)', '2 Pcs Gift Box'],
    categories: DECOR_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'imported',
    label: 'Imported Gourmet',
    accentColor: '#D97706',
    unitOptions: ['Imported Master Case', 'Box of 24 Pcs', 'Tray of 12 Cans'],
    categories: IMPORTED_SECTIONS.flatMap((s) => s.items),
  },
  {
    id: 'others',
    label: 'Others & General Supplies',
    accentColor: '#475569',
    unitOptions: ['Wholesale Master Pack', '100 Pcs Bundle', 'Box of 12 Units'],
    categories: [],
  },
];

export function findCategoryTileById(subcategoryId: string): {
  vertical: WholesaleVerticalId;
  sectionTitle: string;
  tile: SubcategoryTileItem;
} | null {
  for (const sec of ELECTRONICS_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'electronics', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of PHARMACY_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'pharmacy', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of RATION_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'ration', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of BEAUTY_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'beauty', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of KIDS_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'kids', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of COLD_DRINKS_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'cold_drinks', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of FASHION_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'fashion', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of FOOTWEAR_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'footwear', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of DECOR_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'decor', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const sec of IMPORTED_SECTIONS) {
    const found = sec.items.find((i) => i.id === subcategoryId);
    if (found) return { vertical: 'imported', sectionTitle: sec.sectionTitle, tile: found };
  }
  for (const v of WHOLESALE_VERTICAL_DEFINITIONS) {
    const found = v.categories.find((i) => i.id === subcategoryId);
    if (found) return { vertical: v.id, sectionTitle: v.label, tile: found };
  }
  return null;
}

export interface DetectedTaxonomyResult {
  vertical: WholesaleVerticalId;
  verticalLabel: string;
  subcategoryId: string;
  subcategoryTitle: string;
  subTypeId: string;
  subTypeLabel: string;
  suggestedUnit: string;
}

/**
 * Smart Real-Time Auto-Category Engine for Seller Studio:
 * Scans product title/description and automatically maps to Level 1 (Vertical) -> Level 2 (Category) -> Level 3 (Sub-Category)
 */
export function detectWholesaleTaxonomy(rawText: string): DetectedTaxonomyResult | null {
  const text = (rawText || '').toLowerCase().trim();
  if (text.length < 2) return null;

  let bestMatch: {
    score: number;
    result: DetectedTaxonomyResult;
  } | null = null;

  for (const vert of WHOLESALE_VERTICAL_DEFINITIONS) {
    for (const cat of vert.categories) {
      const cleanCatTitle = cat.title.replace(/\n/g, ' ');
      const subTypes = cat.subTypes || [];

      for (const st of subTypes) {
        let score = 0;
        for (const kw of st.keywords) {
          const kwLower = kw.toLowerCase();
          if (text.includes(kwLower)) {
            // Longer multi-word keyword matches get higher weight
            score += kwLower.includes(' ') ? 30 : 15;
          }
        }
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = {
            score,
            result: {
              vertical: vert.id,
              verticalLabel: vert.label,
              subcategoryId: cat.id,
              subcategoryTitle: cleanCatTitle,
              subTypeId: st.id,
              subTypeLabel: st.label,
              suggestedUnit: vert.unitOptions[0] || 'Wholesale Pack',
            },
          };
        }
      }

      // Also check category title tokens if no subtype keyword matched yet
      const catWords = cleanCatTitle
        .toLowerCase()
        .split(/[\s,&]+/)
        .filter((w) => w.length >= 3 && w !== 'and');
      let catScore = 0;
      for (const w of catWords) {
        if (text.includes(w)) catScore += 10;
      }
      if (catScore > 0 && (!bestMatch || catScore > bestMatch.score)) {
        const firstSt = subTypes[0];
        bestMatch = {
          score: catScore,
          result: {
            vertical: vert.id,
            verticalLabel: vert.label,
            subcategoryId: cat.id,
            subcategoryTitle: cleanCatTitle,
            subTypeId: firstSt ? firstSt.id : 'all',
            subTypeLabel: firstSt ? firstSt.label : 'General',
            suggestedUnit: vert.unitOptions[0] || 'Wholesale Pack',
          },
        };
      }
    }
  }

  return bestMatch ? bestMatch.result : null;
}

// ============================================================================
// 5. ADVANCED USER INTEREST AUTO-DETECTION & SMART MIXED RECOMMENDATION ENGINE
// ============================================================================
const VERTICAL_DIRECT_ALIASES: Record<WholesaleVerticalId, string[]> = {
  electronics: [
    'electronics', 'electronic', 'electrical', 'electricals', 'appliance', 'appliances',
    'gadget', 'gadgets', 'fan', 'cooler', 'mixer', 'kettle', 'induction', 'bulb', 'led',
    'trimmer', 'dryer', 'straightener', 'earbud', 'speaker', 'charger', 'cable', 'powerbank',
    'iron', 'heater', 'wire', 'torch', 'ring light', 'switch', 'extension',
  ],
  pharmacy: [
    'pharmacy', 'medical', 'medicine', 'medicines', 'chemist', 'health', 'dolo', 'paracetamol',
    'fever', 'cough', 'cold', 'vicks', 'digene', 'eno', 'volini', 'moov', 'dettol', 'bandage',
    'antibiotic', 'sugar', 'diabetes', 'bp', 'omron', 'nebulizer', 'ors', 'electral', 'vitamin',
    'condom', 'durex', 'whisper', 'pad', 'chyawanprash',
  ],
  ration: [
    'ration', 'kirana', 'grocery', 'groceries', 'mandi', 'grain', 'atta', 'maida', 'sooji',
    'besan', 'rice', 'basmati', 'chawal', 'dal', 'pulses', 'rajma', 'chana', 'onion', 'pyaz',
    'garlic', 'lahsun', 'potato', 'aloo', 'masala', 'spices', 'haldi', 'mirch', 'jeera',
    'oil', 'mustard', 'ghee', 'sugar', 'cheeni', 'jaggery', 'gud', 'salt', 'namak', 'poha',
    'dry fruit', 'kaju', 'badam', 'makhana', 'tea', 'chai', 'biscuit', 'maggi', 'soap', 'detergent',
  ],
  beauty: [
    'beauty', 'cosmetic', 'cosmetics', 'makeup', 'salon', 'parlour', 'lipstick', 'lip gloss',
    'lip balm', 'foundation', 'compact', 'concealer', 'primer', 'blush', 'kajal', 'eyeliner',
    'mascara', 'eyeshadow', 'nail polish', 'serum', 'toner', 'face wash', 'sunscreen', 'cream',
    'facial kit', 'bleach', 'sheet mask', 'shampoo', 'conditioner', 'hair oil', 'hair mask',
    'hair colour', 'mehendi', 'perfume', 'deodorant', 'attar', 'wax', 'razor', 'beardo',
  ],
  kids: [
    'kids', 'kid', 'baby', 'babies', 'infant', 'newborn', 'child', 'children', 'toy', 'toys',
    'diaper', 'pampers', 'mamypoko', 'wipes', 'rash cream', 'baby soap', 'baby shampoo',
    'baby oil', 'baby lotion', 'baby powder', 'cerelac', 'lactogen', 'feeding bottle', 'sipper',
    'teether', 'rattle', 'romper', 'stroller', 'walker', 'cradle', 'school bag',
  ],
  cold_drinks: [
    'cold drink', 'cold drinks', 'drink', 'drinks', 'beverage', 'beverages', 'pepsi', 'coca cola',
    'coke', 'thums up', 'campa', 'sprite', 'fanta', 'mirinda', 'limca', '7up', 'sting', 'red bull',
    'monster', 'energy drink', 'cold coffee', 'nescafe', 'maaza', 'slice', 'frooti', 'real juice',
    'tropicana', 'amul kool', 'lassi', 'milkshake', 'iced tea', 'paper boat', 'water', 'bisleri',
    'kinley', 'soda', 'gatorade', 'glucon d', 'rooh afza', 'tang', 'sharbat',
  ],
  fashion: [
    'fashion', 'clothes', 'clothing', 'garment', 'garments', 'apparel', 'kapda', 'dress',
    't-shirt', 'tshirt', 'tee', 'polo', 'shirt', 'jeans', 'cargo', 'trouser', 'pant', 'kurta',
    'sherwani', 'nehru jacket', 'kurti', 'suit set', 'anarkali', 'saree', 'banarasi', 'lehenga',
    'blouse', 'top', 'midi', 'co-ord', 'palazzo', 'leggings', 'boys', 'baba suit', 'girls',
    'frock', 'trackpant', 'jogger', 'shorts', 'innerwear', 'vest', 'baniyan', 'bra', 'night suit',
    'nighty', 'hoodie', 'sweatshirt', 'jacket', 'sweater', 'unstitched', 'dupatta', 'belt', 'wallet',
  ],
  footwear: [
    'footwear', 'shoe', 'shoes', 'joota', 'chappal', 'chappals', 'slipper', 'slippers', 'sandal',
    'sandals', 'crocs', 'clog', 'clogs', 'sneaker', 'sneakers', 'loafer', 'loafers', 'sports shoe',
    'running shoe', 'campus', 'sparx', 'relaxo', 'flite', 'slider', 'sliders', 'flip flop',
    'heels', 'wedges', 'jutti', 'mojri', 'bellies', 'flats', 'school shoe', 'socks', 'shoe polish',
  ],
  decor: [
    'decor', 'home decor', 'furnishing', 'bedsheet', 'blanket', 'comforter', 'dohar', 'curtain',
    'cushion', 'sofa cover', 'plant', 'bonsai', 'flower', 'vase', 'lamp', 'table lamp', 'fairy light',
    'string light', 'wall clock', 'clock', 'painting', 'wall art', 'mirror', 'idol', 'statue',
    'ganesha', 'buddha', 'showpiece', 'pooja', 'mandir', 'diya', 'urli', 'carpet', 'doormat',
    'mat', 'candle', 'diffuser', 'storage rack', 'hanger', 'tray', 'glass jar', 'towel', 'bucket',
  ],
  imported: [
    'imported', 'gourmet', 'global', 'foreign', 'ferrero', 'lindt', 'toblerone', 'chocolate',
    'korean', 'ramen', 'buldak', 'samyang', 'shin ramyun', 'noodles', 'pringles', 'biscoff',
    'loacker', 'davidoff', 'nutella', 'prime', 'mogu mogu', 'medjool', 'dates', 'ajwa',
    'cranberries', 'baklava', 'olive oil', 'borges', 'sriracha', 'pasta', 'lattafa', 'oud', 'dubai',
  ],
  others: [
    'others', 'general', 'packaging', 'corrugated box', 'tape', 'milton', 'flask', 'tiffin',
    'lunch box', 'umbrella', 'raincoat', 'car care', 'microfiber', 'air freshener', 'odonil',
    'godrej aer', 'padlock', 'lock', 'thermal roll', 'pos', 'dog food', 'pedigree', 'cat food',
    'hit spray', 'good knight', 'mosquito', 'plastic chair', 'stool',
  ],
};

interface UserInterestState {
  verticalScores: Record<WholesaleVerticalId, number>;
  subcategoryScores: Record<string, number>;
  recentKeywords: string[];
  lastActiveVertical: WholesaleVerticalId | null;
  version: number;
}

const userInterestState: UserInterestState = {
  verticalScores: {
    electronics: 0,
    pharmacy: 0,
    ration: 0,
    beauty: 0,
    kids: 0,
    cold_drinks: 0,
    fashion: 0,
    footwear: 0,
    decor: 0,
    imported: 0,
    others: 0,
  },
  subcategoryScores: {},
  recentKeywords: [],
  lastActiveVertical: null,
  version: 0,
};

const interestListeners = new Set<() => void>();

function notifyInterestListeners() {
  userInterestState.version += 1;
  interestListeners.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
}

export function subscribeUserInterest(listener: () => void): () => void {
  interestListeners.add(listener);
  return () => {
    interestListeners.delete(listener);
  };
}

export function getUserInterestSnapshot(): UserInterestState {
  return userInterestState;
}

/**
 * Detects which vertical(s) a search query belongs to and boosts user interest scores.
 */
export function detectVerticalFromQuery(rawQuery: string): {
  vertical: WholesaleVerticalId | null;
  subcategoryId: string | null;
} {
  const q = (rawQuery || '').toLowerCase().trim();
  if (q.length < 2) return { vertical: null, subcategoryId: null };

  // 1. Check 3-level taxonomy first for exact subcategory + vertical match
  const tax = detectWholesaleTaxonomy(q);
  if (tax) {
    return { vertical: tax.vertical, subcategoryId: tax.subcategoryId };
  }

  // 2. Check direct vertical aliases (e.g. "electronics", "footwear", "cold drinks")
  let bestVert: WholesaleVerticalId | null = null;
  let bestScore = 0;

  (Object.keys(VERTICAL_DIRECT_ALIASES) as WholesaleVerticalId[]).forEach((vert) => {
    const kws = VERTICAL_DIRECT_ALIASES[vert];
    let score = 0;
    for (const kw of kws) {
      if (q === kw) score += 50;
      else if (q.includes(kw) || (kw.length >= 4 && kw.includes(q))) score += 20;
    }
    if (score > bestScore) {
      bestScore = score;
      bestVert = vert;
    }
  });

  return { vertical: bestVert, subcategoryId: null };
}

/**
 * Called when the user searches any keyword in SearchScreen or CategoryProductsScreen.
 */
export function recordUserSearchInterest(rawQuery: string): void {
  const q = (rawQuery || '').toLowerCase().trim();
  if (q.length < 2) return;

  const { vertical, subcategoryId } = detectVerticalFromQuery(q);

  // Save in recent keywords (deduplicated, max 8)
  userInterestState.recentKeywords = [
    q,
    ...userInterestState.recentKeywords.filter((k) => k !== q),
  ].slice(0, 8);

  if (vertical) {
    userInterestState.verticalScores[vertical] =
      (userInterestState.verticalScores[vertical] || 0) + 60;
    userInterestState.lastActiveVertical = vertical;
  }

  if (subcategoryId) {
    userInterestState.subcategoryScores[subcategoryId] =
      (userInterestState.subcategoryScores[subcategoryId] || 0) + 90;
  }

  notifyInterestListeners();
}

/**
 * Called when the user spends time browsing a specific category tab or subcategory screen.
 */
export function recordCategoryDwellInterest(verticalId: string, secondsSpent: number = 3): void {
  if (!verticalId || verticalId === 'all') return;
  const vert = verticalId as WholesaleVerticalId;
  if (!(vert in userInterestState.verticalScores)) return;

  const points = Math.max(5, Math.round(secondsSpent * 4));
  userInterestState.verticalScores[vert] =
    (userInterestState.verticalScores[vert] || 0) + points;
  userInterestState.lastActiveVertical = vert;

  notifyInterestListeners();
}

/**
 * Called when the user opens a product card or adds a product to cart.
 */
export function recordProductViewInterest(product: {
  name?: string;
  vertical?: string;
  subcategoryId?: string;
}): void {
  if (!product) return;

  let vert = product.vertical as WholesaleVerticalId | undefined;
  let subId = product.subcategoryId;

  if (!vert && product.name) {
    const detected = detectVerticalFromQuery(product.name);
    if (detected.vertical) vert = detected.vertical;
    if (detected.subcategoryId) subId = detected.subcategoryId;
  } else if (!vert) {
    vert = 'fashion';
  }

  if (vert && vert in userInterestState.verticalScores) {
    userInterestState.verticalScores[vert] =
      (userInterestState.verticalScores[vert] || 0) + 25;
    userInterestState.lastActiveVertical = vert;
  }

  if (subId) {
    userInterestState.subcategoryScores[subId] =
      (userInterestState.subcategoryScores[subId] || 0) + 40;
  }

  notifyInterestListeners();
}

/**
 * Returns the user's top-interest vertical (if any interest has been recorded).
 */
export function getTopUserInterestVertical(): {
  vertical: WholesaleVerticalId | null;
  label: string | null;
  score: number;
} {
  let topVert: WholesaleVerticalId | null = userInterestState.lastActiveVertical;
  let topScore = topVert ? userInterestState.verticalScores[topVert] || 0 : 0;

  (Object.keys(userInterestState.verticalScores) as WholesaleVerticalId[]).forEach((v) => {
    const s = userInterestState.verticalScores[v] || 0;
    if (s > topScore) {
      topScore = s;
      topVert = v;
    }
  });

  if (!topVert || topScore <= 0) {
    return { vertical: null, label: null, score: 0 };
  }

  const def = WHOLESALE_VERTICAL_DEFINITIONS.find((d) => d.id === topVert);
  return {
    vertical: topVert,
    label: def ? def.label : topVert.toUpperCase(),
    score: topScore,
  };
}

/**
 * Builds the 'All' Super-Mandi Product Feed:
 * 1. Mixes ALL 11 categories (Electronics, Fashion, Beauty, Ration, Footwear, Cold Drinks, Kids, Pharmacy, Decor, Imported, Others)
 *    so it NEVER shows only Electronics in a block.
 * 2. If the user searched for a category/product or spent time in a category,
 *    auto-promotes their Top Interest Products to the TOP of 'All', followed by a smart personalized interleaved mix!
 */
export function buildSmartAllMixedFeed<T extends BoutiqueProductItem>(
  wholesaleItems: WholesaleCatalogItem[],
  boutiqueFashionItems: T[]
): BoutiqueProductItem[] {
  // Tag boutique items as 'fashion' so they participate cleanly in multi-vertical mixing
  const taggedBoutique: WholesaleCatalogItem[] = boutiqueFashionItems.map((b) => ({
    ...b,
    vertical: ((b as any).vertical || 'fashion') as WholesaleVerticalId,
    subcategoryId: (b as any).subcategoryId || 'sub_fash_mens_tshirts',
    unitSpec: (b as any).unitSpec || `MOQ: ${b.minOrder || 6} Pcs`,
  }));

  const allPool: WholesaleCatalogItem[] = [...wholesaleItems, ...taggedBoutique];

  // Score each product by user's recent search keywords + subcategory interest
  const recentKws = userInterestState.recentKeywords;
  const subScores = userInterestState.subcategoryScores;
  const vertScores = userInterestState.verticalScores;
  const topInterest = getTopUserInterestVertical();

  const getProductPersonalScore = (item: WholesaleCatalogItem): number => {
    let score = 0;
    const titleLower = item.name.toLowerCase();
    for (let i = 0; i < recentKws.length; i++) {
      const kw = recentKws[i];
      const recencyWeight = Math.max(1, 8 - i);
      if (titleLower.includes(kw)) {
        score += 120 * recencyWeight;
      }
    }
    if (item.subcategoryId && subScores[item.subcategoryId]) {
      score += subScores[item.subcategoryId] * 2;
    }
    if (item.vertical && vertScores[item.vertical]) {
      score += vertScores[item.vertical];
    }
    return score;
  };

  // Group items by vertical
  const defaultVerticalOrder: WholesaleVerticalId[] = [
    'electronics',
    'fashion',
    'beauty',
    'footwear',
    'cold_drinks',
    'ration',
    'kids',
    'pharmacy',
    'decor',
    'imported',
    'others',
  ];

  // Sort verticals by user interest score (if any), keeping lastActiveVertical first
  const orderedVerticals = [...defaultVerticalOrder].sort((a, b) => {
    if (topInterest.vertical === a && topInterest.score > 0) return -1;
    if (topInterest.vertical === b && topInterest.score > 0) return 1;
    const diff = (vertScores[b] || 0) - (vertScores[a] || 0);
    if (diff !== 0) return diff;
    return defaultVerticalOrder.indexOf(a) - defaultVerticalOrder.indexOf(b);
  });

  const buckets: Record<WholesaleVerticalId, WholesaleCatalogItem[]> = {
    electronics: [],
    pharmacy: [],
    ration: [],
    beauty: [],
    kids: [],
    cold_drinks: [],
    fashion: [],
    footwear: [],
    decor: [],
    imported: [],
    others: [],
  };

  for (const item of allPool) {
    const v = item.vertical || 'fashion';
    if (buckets[v]) {
      buckets[v].push(item);
    } else {
      buckets.fashion.push(item);
    }
  }

  // Within each vertical bucket, sort items so highest personal-score items come first
  (Object.keys(buckets) as WholesaleVerticalId[]).forEach((v) => {
    buckets[v].sort((a, b) => getProductPersonalScore(b) - getProductPersonalScore(a));
  });

  const result: BoutiqueProductItem[] = [];
  const usedIds = new Set<string>();

  const pushUnique = (item: WholesaleCatalogItem | undefined) => {
    if (item && !usedIds.has(item.id)) {
      usedIds.add(item.id);
      result.push(item);
    }
  };

  // STEP 1: If user has active search/dwell interest, place top 6 recommended items from their #1 interest right at the TOP!
  if (topInterest.vertical && topInterest.score > 0) {
    // First, any exact keyword matches across all verticals
    if (recentKws.length > 0) {
      const latestKw = recentKws[0];
      const exactMatches = allPool
        .filter((it) => it.name.toLowerCase().includes(latestKw))
        .slice(0, 6);
      for (const m of exactMatches) {
        pushUnique(m);
      }
    }

    // Next, top 6 items from the #1 interest vertical (e.g. 'electronics')
    const primaryBucket = buckets[topInterest.vertical] || [];
    for (let i = 0; i < Math.min(6, primaryBucket.length); i++) {
      pushUnique(primaryBucket[i]);
    }
  }

  // STEP 2: Smart Multi-Category Interleaved Mix (Weighted Round-Robin across ALL 11 categories)
  // In each round:
  // - Pick 2 items from the user's top interest vertical (if active)
  // - Pick 1 item from every other vertical in rotation so All is ALWAYS a rich mix of everything!
  let addedInRound = true;
  const cursors: Record<WholesaleVerticalId, number> = {
    electronics: 0,
    pharmacy: 0,
    ration: 0,
    beauty: 0,
    kids: 0,
    cold_drinks: 0,
    fashion: 0,
    footwear: 0,
    decor: 0,
    imported: 0,
    others: 0,
  };

  const popNextFromBucket = (v: WholesaleVerticalId): WholesaleCatalogItem | undefined => {
    const arr = buckets[v];
    while (cursors[v] < arr.length) {
      const candidate = arr[cursors[v]];
      cursors[v] += 1;
      if (!usedIds.has(candidate.id)) {
        return candidate;
      }
    }
    return undefined;
  };

  while (addedInRound) {
    addedInRound = false;
    for (let i = 0; i < orderedVerticals.length; i++) {
      const v = orderedVerticals[i];
      const nextItem = popNextFromBucket(v);
      if (nextItem) {
        pushUnique(nextItem);
        addedInRound = true;
      }
      // Give #1 interest vertical an extra slot per round so it stays prominent while scrolling
      if (i === 0 && topInterest.vertical === v && topInterest.score > 0) {
        const bonusItem = popNextFromBucket(v);
        if (bonusItem) {
          pushUnique(bonusItem);
          addedInRound = true;
        }
      }
    }
  }

  return result;
}

