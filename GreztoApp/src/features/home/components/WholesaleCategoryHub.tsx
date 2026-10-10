import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  ELECTRONICS_SECTIONS,
  PHARMACY_FEATURED_PROBLEMS,
  PHARMACY_SECTIONS,
  RATION_SECTIONS,
  BEAUTY_SECTIONS,
  KIDS_SECTIONS,
  COLD_DRINKS_SECTIONS,
  FASHION_SECTIONS,
  FOOTWEAR_SECTIONS,
  DECOR_SECTIONS,
  IMPORTED_SECTIONS,
  ELEC_ICONS,
  PHARM_ICONS,
  RATION_ICONS,
  BEAUTY_ICONS,
  KIDS_ICONS,
  COLD_DRINKS_ICONS,
  FASHION_ICONS,
  FOOTWEAR_ICONS,
  DECOR_ICONS,
  IMPORTED_ICONS,
  SubcategorySectionGroup,
  WholesaleCatalogItem,
} from '../data/wholesaleHubData';
import { BoutiqueProductItem } from '../HomeScreen';

export interface WholesaleCategoryHubProps {
  activeCategory: string;
  activeSubcategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (subcategoryId: string | null) => void;
  showcaseProducts: WholesaleCatalogItem[];
  cartQuantities: Record<string, number>;
  onProductPress: (item: BoutiqueProductItem) => void;
  onAdd: (item: BoutiqueProductItem) => void;
  onIncrement: (item: BoutiqueProductItem) => void;
  onDecrement: (item: BoutiqueProductItem) => void;
}

export const WholesaleCategoryHub: React.FC<WholesaleCategoryHubProps> = memo(({
  activeCategory,
  activeSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
  showcaseProducts,
  cartQuantities,
  onProductPress,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  const { width } = useWindowDimensions();

  // 4-column & 3-column grid tile width calculations: 12px horizontal padding on each side, 10px gap
  const H_PADDING = 12;
  const COL_GAP = 10;
  const tileWidth4Col = Math.floor((width - H_PADDING * 2 - COL_GAP * 3) / 4);
  const tileWidth3Col = Math.floor((width - H_PADDING * 2 - COL_GAP * 2) / 3);
  const tileHeight3Col = Math.floor(tileWidth3Col * 0.86);

  // Render a 4-column or 3-column section group
  const renderSectionGroup = (
    section: SubcategorySectionGroup,
    activeBorderColor: string,
    activeCardBg: string
  ) => {
    const isThreeCol = section.columns === 3;
    const cardW = isThreeCol ? tileWidth3Col : tileWidth4Col;
    const cardH = isThreeCol ? tileHeight3Col : tileWidth4Col;

    return (
      <View key={section.id} style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>{section.sectionTitle}</Text>
        <View style={styles.fourColGrid}>
          {section.items.map((item) => {
            const isSelected = activeSubcategoryId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.gridTileWrapper, { width: cardW }]}
                activeOpacity={0.78}
                onPress={() => onSelectSubcategory(item.id)}
              >
                <View
                  style={[
                    styles.gridTileCard,
                    {
                      width: cardW,
                      height: cardH,
                      borderRadius: isThreeCol ? 18 : 16,
                      backgroundColor: isSelected ? activeCardBg : section.cardBgColor,
                    },
                    isSelected && {
                      borderWidth: 2,
                      borderColor: activeBorderColor,
                    },
                  ]}
                >
                  <Image
                    source={item.icon}
                    style={styles.gridTileImage}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                </View>
                <Text
                  style={[
                    styles.gridTileLabel,
                    isThreeCol && { fontSize: 11.8, lineHeight: 15, marginTop: 6 },
                    isSelected && { color: activeBorderColor, fontWeight: '800' },
                  ]}
                  numberOfLines={3}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render Horizontal Product Showcase Carousel ("Upgrade to Smarter Tech" / Wholesale Deals)
  const renderHorizontalProductCarousel = (
    heading: string,
    subtitle: string,
    accentBg: string
  ) => {
    if (!showcaseProducts || showcaseProducts.length === 0) return null;

    return (
      <View style={[styles.carouselContainer, { backgroundColor: accentBg }]}>
        <View style={styles.carouselHeaderRow}>
          <View>
            <Text style={styles.carouselTitle}>{heading}</Text>
            <Text style={styles.carouselSubtitle}>{subtitle}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScrollContent}
        >
          {showcaseProducts.slice(0, 8).map((prod) => {
            const qty = cartQuantities[prod.id] || 0;
            return (
              <TouchableOpacity
                key={prod.id}
                style={styles.miniProductCard}
                activeOpacity={0.88}
                onPress={() => onProductPress(prod)}
              >
                {/* Product Image Box */}
                <View style={styles.miniImageContainer}>
                  <FastImage
                    source={{ uri: prod.image, priority: FastImage.priority.high }}
                    style={styles.miniProductImage as any}
                    resizeMode={FastImage.resizeMode.contain}
                  />

                  {/* ADD Button or Active Green Stepper */}
                  <View style={styles.miniActionOverlay}>
                    {qty > 0 ? (
                      <View style={styles.miniGreenStepper}>
                        <TouchableOpacity
                          style={styles.miniStepperHit}
                          onPress={() => onDecrement(prod)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 4 }}
                        >
                          <Icon name="minus" size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.miniStepperText}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.miniStepperHit}
                          onPress={() => onIncrement(prod)}
                          hitSlop={{ top: 6, bottom: 6, left: 4, right: 6 }}
                        >
                          <Icon name="plus" size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.miniRedAddBtn}
                        activeOpacity={0.85}
                        onPress={() => onAdd(prod)}
                      >
                        <Text style={styles.miniRedAddText}>ADD</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Unit Spec Tag */}
                <View style={styles.unitTagPill}>
                  <Text style={styles.unitTagText} numberOfLines={1}>
                    {prod.unitSpec || `MOQ: ${prod.minOrder || 4} Pcs`}
                  </Text>
                </View>

                {/* Product Title */}
                <Text style={styles.miniProductName} numberOfLines={2}>
                  {prod.name}
                </Text>

                {/* Rating Row */}
                <View style={styles.miniRatingRow}>
                  <Icon name="star" size={12} color="#F59E0B" />
                  <Text style={styles.miniRatingText}>{prod.rating.toFixed(1)}</Text>
                  <Text style={styles.miniMoqText}> • Min {prod.minOrder || 4}</Text>
                </View>

                {/* Discount + Wholesale Price */}
                <Text style={styles.miniDiscountText}>{prod.discountBadge}</Text>
                <View style={styles.miniPriceRow}>
                  <Text style={styles.miniPrice}>₹{prod.price.toLocaleString('en-IN')}</Text>
                  {prod.originalPrice > prod.price && (
                    <Text style={styles.miniMrp}>₹{prod.originalPrice.toLocaleString('en-IN')}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Active Subcategory Filter Chip Bar
  const renderActiveSubcategoryFilterBar = (accentColor: string) => {
    if (!activeSubcategoryId) return null;
    const allItems = [
      ...ELECTRONICS_SECTIONS.flatMap((s) => s.items),
      ...PHARMACY_SECTIONS.flatMap((s) => s.items),
      ...RATION_SECTIONS.flatMap((s) => s.items),
      ...BEAUTY_SECTIONS.flatMap((s) => s.items),
      ...KIDS_SECTIONS.flatMap((s) => s.items),
      ...COLD_DRINKS_SECTIONS.flatMap((s) => s.items),
      ...FASHION_SECTIONS.flatMap((s) => s.items),
      ...FOOTWEAR_SECTIONS.flatMap((s) => s.items),
      ...DECOR_SECTIONS.flatMap((s) => s.items),
      ...IMPORTED_SECTIONS.flatMap((s) => s.items),
    ];
    const match = allItems.find((i) => i.id === activeSubcategoryId);
    const cleanName = match ? match.title.replace(/\n/g, ' ') : 'Selected Category';

    return (
      <View style={styles.activeFilterPillRow}>
        <View style={[styles.activeFilterPill, { borderColor: accentColor }]}>
          <Icon name="filter-check-outline" size={15} color={accentColor} />
          <Text style={[styles.activeFilterText, { color: accentColor }]}>
            Showing: {cleanName}
          </Text>
          <TouchableOpacity
            onPress={() => onSelectSubcategory(null)}
            style={styles.clearFilterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close-circle" size={17} color={accentColor} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================================
  // CASE 1: ALL VERTICALS OVERVIEW BANNER STRIP
  // ============================================================================
  if (activeCategory === 'all') {
    return (
      <View style={styles.allVerticalsOverview}>
        <View style={styles.overviewHeaderRow}>
          <Icon name="storefront-outline" size={17} color="#0F172A" />
          <Text style={styles.overviewHeaderTitle}>WHOLESALE SUPER-MANDI VERTICALS</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.overviewCardsScroll}
        >
          {/* 1. Electronics Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#F3EFFE', borderColor: '#DDD6FE' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('electronics')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#6D28D9' }]}>
                <Text style={styles.overviewBadgeText}>PHASE 1 • LIVE</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Electronics & Electricals</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Fans, Coolers, Mixers, LED Bulbs, Wires, Trimmers & Mobile Acc.
              </Text>
            </View>
            <Image
              source={ELEC_ICONS.fans_coolers}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 2. Pharmacy Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#E4F5F5', borderColor: '#99F6E4' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('pharmacy')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#0D9488' }]}>
                <Text style={styles.overviewBadgeText}>CHEMIST MANDI</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Pharmacy & Wellness</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Fever, Cough, Pain Relief, Diabetes, ORS, Surgical & Derma
              </Text>
            </View>
            <Image
              source={PHARM_ICONS.cough_cold_fever}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 3. Ration Kirana Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#FEF6E4', borderColor: '#FDE68A' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('ration')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#B45309' }]}>
                <Text style={styles.overviewBadgeText}>KIRANA MANDI</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Ration, Grain & Masala</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Atta, Rice, Dal, Dry Onion-Garlic-Aloo, Khada & Packet Masala
              </Text>
            </View>
            <Image
              source={RATION_ICONS.atta_maida_sooji}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 4. Beauty & Cosmetics Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#FDE8F1', borderColor: '#FBCFE8' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('beauty')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#DB2777' }]}>
                <Text style={styles.overviewBadgeText}>COSMETIC HUB</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Beauty & Salon Care</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Lipsticks, Foundations, Serums, Facial Kits, Shampoos & Perfumes
              </Text>
            </View>
            <Image
              source={BEAUTY_ICONS.lip_cosmetics}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 5. Kids, Baby & Toys Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#E2F3FB', borderColor: '#BAE6FD' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('kids')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#0284C7' }]}>
                <Text style={styles.overviewBadgeText}>BABY & TOYS</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Kids, Baby Care & Toys</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Diapers, Wipes, Cerelac, Feeding Bottles, Baby Lotions & Toys
              </Text>
            </View>
            <Image
              source={KIDS_ICONS.diaper}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 6. Cold Drinks & Beverages Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#E0F7FA', borderColor: '#A5F3FC' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('cold_drinks')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#0891B2' }]}>
                <Text style={styles.overviewBadgeText}>CHILLED PETI</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Cold Drinks, Coffee & Water</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Coca-Cola, Campa, Sting, Red Bull, Nescafé Cold Coffee & Bisleri
              </Text>
            </View>
            <Image
              source={COLD_DRINKS_ICONS.cola_fizzy}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 7. Fashion & Apparel Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#FDF2F0', borderColor: '#FECDD3' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('fashion')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#E11D48' }]}>
                <Text style={styles.overviewBadgeText}>GARMENT HUB</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Fashion, Sarees & Kids Wear</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Men's Tees, Shirts, Jeans, Kurtis, Sarees, Boys/Girls & Winterwear
              </Text>
            </View>
            <Image
              source={FASHION_ICONS.mens_tshirts}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 8. Footwear, Crocs & Shoes Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('footwear')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#2563EB' }]}>
                <Text style={styles.overviewBadgeText}>SHOE MANDI</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Footwear, Crocs & Chappals</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Crocs Clogs, Sports Shoes, Sneakers, Chappals, Heels, Juttis & School Shoes
              </Text>
            </View>
            <Image
              source={FOOTWEAR_ICONS.crocs_clogs}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 9. Home Decor & Furnishings Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#F5F0FF', borderColor: '#DDD6FE' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('decor')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.overviewBadgeText}>HOME & DECOR</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Decor, Bedsheets & Pooja</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Bedsheets, Curtains, Vases, Lamps, Wall Clocks, Idols & Storage
              </Text>
            </View>
            <Image
              source={DECOR_ICONS.bedsheets}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 10. Imported Gourmet Wholesale Card */}
          <TouchableOpacity
            style={[styles.overviewVerticalCard, { backgroundColor: '#FEF9E7', borderColor: '#FDE68A' }]}
            activeOpacity={0.82}
            onPress={() => onSelectCategory('imported')}
          >
            <View style={styles.overviewCardTextCol}>
              <View style={[styles.overviewBadge, { backgroundColor: '#D97706' }]}>
                <Text style={styles.overviewBadgeText}>GLOBAL MART</Text>
              </View>
              <Text style={styles.overviewCardTitle}>Imported Chocolates & Ramen</Text>
              <Text style={styles.overviewCardSub} numberOfLines={2}>
                Ferrero, Buldak Ramen, Pringles, Davidoff, Monster & Dubai Oud
              </Text>
            </View>
            <Image
              source={IMPORTED_ICONS.chocolates}
              style={styles.overviewCardImg}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ============================================================================
  // CASE 2: ELECTRONICS WHOLESALE HUB (SCREENSHOTS 1 & 2)
  // ============================================================================
  if (activeCategory === 'electronics') {
    return (
      <View style={styles.hubContainer}>
        {/* All 4 Electronics Category Grids at the top */}
        {renderSectionGroup(ELECTRONICS_SECTIONS[0], '#6D28D9', '#EDE9FE')}
        {renderSectionGroup(ELECTRONICS_SECTIONS[1], '#6D28D9', '#EDE9FE')}
        {renderSectionGroup(ELECTRONICS_SECTIONS[2], '#6D28D9', '#EDE9FE')}
        {renderSectionGroup(ELECTRONICS_SECTIONS[3], '#6D28D9', '#EDE9FE')}

        {/* Upgrade to Smarter Tech Horizontal Showcase at the bottom of categories */}
        {renderHorizontalProductCarousel(
          'Upgrade to Smarter Tech',
          'Wholesale Master Cartons • Direct Factory Margins',
          '#F5F3FF'
        )}

        {renderActiveSubcategoryFilterBar('#6D28D9')}
      </View>
    );
  }

  // ============================================================================
  // CASE 3: PHARMACY & MEDICAL WHOLESALE HUB (SCREENSHOT 3)
  // ============================================================================
  if (activeCategory === 'pharmacy') {
    return (
      <View style={styles.hubContainer}>
        {/* Top "Featured" Health Problem Cards matching Screenshot 3 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredProblemsScroll}
          >
            {PHARMACY_FEATURED_PROBLEMS.map((feat) => {
              const isSelected = activeSubcategoryId === feat.targetSubcategoryId;
              return (
                <TouchableOpacity
                  key={feat.id}
                  style={[
                    styles.featuredProblemCard,
                    { backgroundColor: feat.bgColor },
                    isSelected && { borderWidth: 2, borderColor: '#0D9488' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => onSelectSubcategory(feat.targetSubcategoryId)}
                >
                  <Text style={styles.featuredProblemTitle} numberOfLines={2}>
                    {feat.title}
                  </Text>
                  <Image
                    source={feat.icon}
                    style={styles.featuredProblemImage}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main 4-Column "Shop by category" Grid matching Screenshot 3 */}
        {PHARMACY_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#0D9488', '#CCFBF1')
        )}

        {/* Fast-Moving Chemist Wholesale Counter Showcase */}
        {renderHorizontalProductCarousel(
          'Fast-Moving Chemist Counter Stock',
          'High-Margin OTC Strips, Syrups, Sprays & Surgical Boxes',
          '#F0FDFA'
        )}

        {renderActiveSubcategoryFilterBar('#0D9488')}
      </View>
    );
  }

  // ============================================================================
  // CASE 4: RATION / KIRANA WHOLESALE MANDI HUB
  // ============================================================================
  if (activeCategory === 'ration') {
    return (
      <View style={styles.hubContainer}>
        {/* Wholesale Mandi Banner Note */}
        <View style={styles.mandiAssuranceBanner}>
          <Icon name="truck-check-outline" size={18} color="#92400E" />
          <Text style={styles.mandiAssuranceText}>
            Direct Grain & Spice Mandi • 25kg/50kg Bori, Katta & Hanging Ladi Rates
          </Text>
        </View>

        {/* Ration 4-Column Grids: Atta/Rice/Dal/Dry Onion-Garlic + Masalas/Oils + Dry Fruits/FMCG */}
        {RATION_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#B45309', '#FEF3C7')
        )}

        {/* Mandi Bori & Carton Deals Carousel */}
        {renderHorizontalProductCarousel(
          'Mandi Bori, Katta & Ladi Best-Sellers',
          'Atta, Basmati Rice, Dry Pyaz-Lahsun-Aloo, Khada & Packet Masala',
          '#FFFBEB'
        )}

        {renderActiveSubcategoryFilterBar('#B45309')}
      </View>
    );
  }

  // ============================================================================
  // CASE 5: BEAUTY & COSMETICS WHOLESALE HUB (20 A-TO-Z SUB-CATEGORIES)
  // ============================================================================
  if (activeCategory === 'beauty') {
    return (
      <View style={styles.hubContainer}>
        {/* 20 A-to-Z Beauty Subcategories in 4-Column Grid on Blush Pink Cards */}
        {BEAUTY_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#DB2777', '#FCE7F3')
        )}

        {/* Salon & Cosmetics Counter Best-Sellers Horizontal Showcase */}
        {renderHorizontalProductCarousel(
          'Salon & Cosmetic Counter Best-Sellers',
          'Lipsticks, Foundations, Serums, Facial Kits, Shampoos & Perfumes',
          '#FDF2F8'
        )}

        {renderActiveSubcategoryFilterBar('#DB2777')}
      </View>
    );
  }

  // ============================================================================
  // CASE 6: KIDS, BABY CARE & TOYS WHOLESALE HUB (18 SUB-CATEGORIES IN 6 SECTIONS)
  // ============================================================================
  if (activeCategory === 'kids') {
    return (
      <View style={styles.hubContainer}>
        {/* 6 Curated Kids Sections in 3-Column Grid on Sky Blue Cards */}
        {KIDS_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#0284C7', '#E0F2FE')
        )}

        {/* Baby Care, Diapers & Toys Horizontal Showcase */}
        {renderHorizontalProductCarousel(
          'Fast-Moving Baby Care, Diapers & Toys',
          'Pampers, Cerelac, Himalaya Baby, Feeding Bottles, Rompers & Musical Toys',
          '#F0F9FF'
        )}

        {renderActiveSubcategoryFilterBar('#0284C7')}
      </View>
    );
  }

  // ============================================================================
  // CASE 7: COLD DRINKS, COFFEE, WATER & BEVERAGES WHOLESALE HUB (12 A-TO-Z)
  // ============================================================================
  if (activeCategory === 'cold_drinks') {
    return (
      <View style={styles.hubContainer}>
        {/* 12 A-to-Z Cold Drinks & Beverages Subcategories in 4-Column Grid */}
        {COLD_DRINKS_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#0891B2', '#CFFAFE')
        )}

        {/* Chilled Beverage Peti & Can Trays Horizontal Showcase */}
        {renderHorizontalProductCarousel(
          'Chilled Beverage Crates & Party Peti Deals',
          'Coca-Cola, Campa, Sting, Red Bull, Nescafé Cold Coffee, Maaza & Bisleri Cases',
          '#ECFEFF'
        )}

        {renderActiveSubcategoryFilterBar('#0891B2')}
      </View>
    );
  }

  // ============================================================================
  // CASE 8: FASHION & APPAREL WHOLESALE HUB (16 A-TO-Z SUB-CATEGORIES)
  // ============================================================================
  if (activeCategory === 'fashion') {
    return (
      <View style={styles.hubContainer}>
        {/* 16 A-to-Z Fashion Subcategories (Men, Women, Boys, Girls, Ethnic, Winter, Innerwear) */}
        {FASHION_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#E11D48', '#FFE4E6')
        )}

        {/* Garment Mandi Size-Set Deals Horizontal Showcase */}
        {renderHorizontalProductCarousel(
          'Garment Mandi Size-Set & Gaddi Deals',
          'Men Tees, Shirts, Jeans, Kurtis, Banarasi Sarees, Boys/Girls Sets & Hoodies',
          '#FFF1F2'
        )}

        {renderActiveSubcategoryFilterBar('#E11D48')}
      </View>
    );
  }

  // ============================================================================
  // CASE 9: FOOTWEAR — SHOES, CROCS & CHAPPALS WHOLESALE HUB (12 A-TO-Z)
  // ============================================================================
  if (activeCategory === 'footwear') {
    return (
      <View style={styles.hubContainer}>
        {/* 12 A-to-Z Footwear Subcategories (Crocs, Sports, Sneakers, Chappals, Heels, Juttis, Kids, School) */}
        {FOOTWEAR_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#2563EB', '#DBEAFE')
        )}

        {/* Footwear Carton & Dozen Deals Horizontal Showcase */}
        {renderHorizontalProductCarousel(
          'Footwear Mandi Carton & Dozen Deals',
          'Crocs Clogs, Sports Shoes, Sneakers, Chappals, Bridal Heels, Juttis & School Shoes',
          '#EFF6FF'
        )}

        {renderActiveSubcategoryFilterBar('#2563EB')}
      </View>
    );
  }

  // ============================================================================
  // CASE 10: HOME DECOR & FURNISHINGS WHOLESALE HUB (12 A-TO-Z)
  // ============================================================================
  if (activeCategory === 'decor') {
    return (
      <View style={styles.hubContainer}>
        {/* 12 A-to-Z Home Decor Subcategories */}
        {DECOR_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#4F46E5', '#EDE9FE')
        )}

        {/* Handloom & Decor Wholesale Showcase */}
        {renderHorizontalProductCarousel(
          'Panipat Handloom & Moradabad Decor Deals',
          'Bedsheets, Curtains, Vases, Table Lamps, Wall Clocks, Brass Idols & Storage',
          '#F5F3FF'
        )}

        {renderActiveSubcategoryFilterBar('#4F46E5')}
      </View>
    );
  }

  // ============================================================================
  // CASE 11: IMPORTED GOURMET & GLOBAL GOODS WHOLESALE HUB (8 A-TO-Z)
  // ============================================================================
  if (activeCategory === 'imported') {
    return (
      <View style={styles.hubContainer}>
        {/* 8 A-to-Z Imported Gourmet Subcategories */}
        {IMPORTED_SECTIONS.map((sec) =>
          renderSectionGroup(sec, '#D97706', '#FEF3C7')
        )}

        {/* Imported Master Cases Horizontal Showcase */}
        {renderHorizontalProductCarousel(
          'Imported Confectionery, Ramen & Oud Deals',
          'Ferrero Rocher, Samyang Buldak, Pringles, Davidoff, Monster & Lattafa Oud',
          '#FFFBEB'
        )}

        {renderActiveSubcategoryFilterBar('#D97706')}
      </View>
    );
  }

  // NOTE: For 'others', user explicitly requested NO "Shop by category" grid — only direct products below!
  return null;
});

const styles = StyleSheet.create({
  hubContainer: {
    backgroundColor: '#FAF8F6',
    paddingTop: 6,
    paddingBottom: 4,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 12,
    marginHorizontal: 0,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  fourColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  gridTileWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTileCard: {
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridTileImage: {
    width: '100%',
    height: '100%',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTileLabel: {
    fontSize: 11.2,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14.5,
    letterSpacing: -0.15,
  },
  // Pharmacy Featured Horizontal Cards (Screenshot 3)
  featuredProblemsScroll: {
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  featuredProblemCard: {
    width: 106,
    height: 118,
    borderRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 8,
    marginRight: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  featuredProblemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
    paddingHorizontal: 2,
  },
  featuredProblemImage: {
    width: 90,
    height: 74,
    alignSelf: 'center',
    marginBottom: 2,
  },
  // Horizontal Showcase Carousel ("Upgrade to Smarter Tech")
  carouselContainer: {
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  carouselHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  carouselTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.3,
  },
  carouselSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  carouselScrollContent: {
    paddingHorizontal: 12,
  },
  miniProductCard: {
    width: 138,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  miniImageContainer: {
    width: '100%',
    height: 108,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  miniProductImage: {
    flex: 1,
  },
  miniActionOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  miniRedAddBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E50914',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  miniRedAddText: {
    color: '#E50914',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  miniGreenStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D7B48',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    elevation: 3,
  },
  miniStepperHit: {
    paddingHorizontal: 3,
  },
  miniStepperText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    marginHorizontal: 5,
  },
  unitTagPill: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  unitTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#334155',
  },
  miniProductName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 15.5,
    height: 31,
    marginBottom: 3,
  },
  miniRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  miniRatingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 2,
  },
  miniMoqText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  miniDiscountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  miniPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  miniPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 5,
  },
  miniMrp: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  // Active Filter Chip
  activeFilterPillRow: {
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    marginRight: 6,
  },
  clearFilterBtn: {
    marginLeft: 2,
  },
  // Ration Mandi Assurance Strip
  mandiAssuranceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  mandiAssuranceText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 7,
    flex: 1,
  },
  // All Verticals Overview Strip
  allVerticalsOverview: {
    marginTop: 10,
    marginBottom: 4,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  overviewHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
    marginLeft: 6,
  },
  overviewCardsScroll: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  overviewVerticalCard: {
    width: 248,
    height: 104,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  overviewCardTextCol: {
    flex: 1,
    paddingRight: 6,
  },
  overviewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  overviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  overviewCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  overviewCardSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 13.5,
  },
  overviewCardImg: {
    width: 74,
    height: 74,
  },
});
