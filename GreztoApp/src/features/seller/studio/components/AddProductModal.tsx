import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { StudioProduct, GarmentSizeStock } from '../studioTypes';
import { useSellerStore } from '../../sellerStore';
import { showToast } from '../../../../components/MitrenoToast';
import {
  WHOLESALE_VERTICAL_DEFINITIONS,
  detectWholesaleTaxonomy,
  WholesaleVerticalId,
  DetectedTaxonomyResult,
} from '../../../home/data/wholesaleHubData';

export interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  productToEdit?: StudioProduct | null;
}

const FIT_PRESETS = [
  'Boxy Oversized',
  'Relaxed Retro',
  'Tailored Heritage',
  'Slim Fit',
  'Regular Classic',
];

const GSM_PRESETS = ['180 GSM', '240 GSM', '320 GSM', '400 GSM', '450 GSM'];

const CURATED_SAMPLE_IMAGES = [
  {
    name: 'Ceiling Fan',
    uri: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Atta / Grain Sack',
    uri: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pharma Box',
    uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Whole Masala',
    uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Streetwear Hoodie',
    uri: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Silk Kurta',
    uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
];

const DEFAULT_SIZES: GarmentSizeStock[] = [
  { size: 'S', stock: 10 },
  { size: 'M', stock: 15 },
  { size: 'L', stock: 12 },
  { size: 'XL', stock: 8 },
  { size: 'XXL', stock: 5 },
];

export const AddProductModal: React.FC<AddProductModalProps> = memo(({
  visible,
  onClose,
  productToEdit,
}) => {
  const addProduct = useSellerStore((state) => state.addProduct);
  const updateProduct = useSellerStore((state) => state.updateProduct);

  const [title, setTitle] = useState('');
  const [vertical, setVertical] = useState<WholesaleVerticalId>('electronics');
  const [subcategoryId, setSubcategoryId] = useState<string>('sub_fans_coolers');
  const [subTypeId, setSubTypeId] = useState<string>('ceiling_fans');
  const [category, setCategory] = useState<string>('Ceiling & Table Fans');
  const [autoDetectedInfo, setAutoDetectedInfo] = useState<DetectedTaxonomyResult | null>(null);

  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [fabric, setFabric] = useState('');
  const [gsm, setGsm] = useState('');
  const [fit, setFit] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [sizes, setSizes] = useState<GarmentSizeStock[]>(DEFAULT_SIZES);
  const [minOrder, setMinOrder] = useState('4');
  const [setRatio, setSetRatio] = useState('Master Carton (4 Pcs)');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(productToEdit);

  const activeVerticalDef =
    WHOLESALE_VERTICAL_DEFINITIONS.find((v) => v.id === vertical) ||
    WHOLESALE_VERTICAL_DEFINITIONS[0];

  const activeCategoryTile =
    activeVerticalDef.categories.find((c) => c.id === subcategoryId) ||
    activeVerticalDef.categories[0];

  const activeSubTypes = activeCategoryTile?.subTypes || [];

  // Smart Auto-Detect handler when Seller types Product Title
  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));

      const detected = detectWholesaleTaxonomy(val);
      if (detected) {
        setVertical(detected.vertical);
        setSubcategoryId(detected.subcategoryId);
        setSubTypeId(detected.subTypeId);
        setCategory(detected.subcategoryTitle);
        setSetRatio(detected.suggestedUnit);
        setAutoDetectedInfo(detected);
      } else if (val.trim().length < 3) {
        setAutoDetectedInfo(null);
      }
    },
    [errors.title]
  );

  // Sync form state when productToEdit changes or modal opens
  useEffect(() => {
    if (visible) {
      if (productToEdit) {
        setTitle(productToEdit.title);
        setCategory(productToEdit.category);
        const det = detectWholesaleTaxonomy(`${productToEdit.title} ${productToEdit.category}`);
        setVertical(productToEdit.vertical || det?.vertical || 'fashion');
        setSubcategoryId(productToEdit.subcategoryId || det?.subcategoryId || 'sub_fashion_streetwear');
        setSubTypeId(productToEdit.subTypeId || det?.subTypeId || 'oversized_tees');
        setAutoDetectedInfo(det);
        setPrice(productToEdit.price.toString());
        setOriginalPrice(productToEdit.originalPrice.toString());
        setFabric(productToEdit.fabric);
        setGsm(productToEdit.gsm);
        setFit(productToEdit.fit);
        setMinOrder(productToEdit.minOrder ? productToEdit.minOrder.toString() : '6');
        setSetRatio(productToEdit.unitSpec || productToEdit.setRatio || 'Master Pack');
        setImageUri(productToEdit.imageUri);
        setCustomUrl(productToEdit.imageUri);

        const allSizes: Array<'S' | 'M' | 'L' | 'XL' | 'XXL'> = ['S', 'M', 'L', 'XL', 'XXL'];
        const mappedSizes = allSizes.map((sz) => {
          const match = productToEdit.sizes.find((s) => s.size === sz);
          return { size: sz, stock: match ? match.stock : 0 };
        });
        setSizes(mappedSizes);
      } else {
        setTitle('');
        setVertical('electronics');
        setSubcategoryId('sub_fans_coolers');
        setSubTypeId('ceiling_fans');
        setCategory('Ceiling & Table Fans');
        setAutoDetectedInfo(null);
        setPrice('');
        setOriginalPrice('');
        setFabric('A-Grade Wholesale Certified');
        setGsm('Standard Wholesale');
        setFit('Master Pack');
        setMinOrder('4');
        setSetRatio('Master Carton (4 Pcs)');
        setImageUri(CURATED_SAMPLE_IMAGES[0].uri);
        setCustomUrl('');
        setShowUrlInput(false);
        setSizes([
          { size: 'S', stock: 12 },
          { size: 'M', stock: 18 },
          { size: 'L', stock: 15 },
          { size: 'XL', stock: 8 },
          { size: 'XXL', stock: 4 },
        ]);
      }
      setErrors({});
    }
  }, [visible, productToEdit]);

  // Image pickers
  const handlePickFromGallery = useCallback(async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const picked = response.assets[0].uri;
        if (picked) {
          setImageUri(picked);
          showToast({
            type: 'success',
            title: 'Photo Selected',
            message: 'Product cover image set from gallery.',
          });
        }
      }
    } catch {
      Alert.alert('Permission Error', 'Unable to access photo library.');
    }
  }, []);

  const handleCaptureCamera = useCallback(async () => {
    try {
      const response = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const picked = response.assets[0].uri;
        if (picked) {
          setImageUri(picked);
          showToast({
            type: 'success',
            title: 'Photo Captured',
            message: 'Camera capture attached as cover photo.',
          });
        }
      }
    } catch {
      Alert.alert('Camera Error', 'Unable to start camera.');
    }
  }, []);

  const handleStockChange = useCallback((size: 'S' | 'M' | 'L' | 'XL' | 'XXL', delta: number) => {
    setSizes((prev) =>
      prev.map((item) =>
        item.size === size
          ? { ...item, stock: Math.max(0, item.stock + delta) }
          : item
      )
    );
  }, []);

  const handleStockDirectInput = useCallback((size: 'S' | 'M' | 'L' | 'XL' | 'XXL', text: string) => {
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    const val = isNaN(parsed) ? 0 : parsed;
    setSizes((prev) =>
      prev.map((item) => (item.size === size ? { ...item, stock: val } : item))
    );
  }, []);

  // Compute discount percentage dynamically
  const priceNum = parseFloat(price) || 0;
  const originalPriceNum = parseFloat(originalPrice) || 0;
  const discountPercent =
    originalPriceNum > priceNum && originalPriceNum > 0
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : 0;

  const totalStockCount = sizes.reduce((acc, curr) => acc + curr.stock, 0);

  // Form submission validation
  const handlePublish = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter a product title.';
    }
    if (!priceNum || priceNum <= 0) {
      newErrors.price = 'Please enter a valid wholesale selling price.';
    }
    if (!originalPriceNum || originalPriceNum <= 0) {
      newErrors.originalPrice = 'Please enter a valid original MRP.';
    } else if (originalPriceNum < priceNum) {
      newErrors.originalPrice = 'MRP should be equal to or higher than selling price.';
    }
    if (!imageUri.trim()) {
      newErrors.imageUri = 'Please provide an image for the product.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast({
        type: 'error',
        title: 'Incomplete Details',
        message: 'Please resolve the highlighted fields before publishing.',
      });
      return;
    }

    const minOrderNum = parseInt(minOrder, 10) || 4;
    const resolvedSetRatio = setRatio.trim() || activeVerticalDef.unitOptions[0] || 'Wholesale Pack';
    const cleanCatName = (activeCategoryTile?.title || category).replace(/\n/g, ' ');

    if (isEditing && productToEdit) {
      const updatedProduct: StudioProduct = {
        ...productToEdit,
        title: title.trim(),
        category: cleanCatName,
        vertical,
        subcategoryId,
        subTypeId,
        unitSpec: resolvedSetRatio,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent,
        fabric: fabric.trim() || 'Wholesale Certified',
        gsm: gsm.trim() || 'Standard',
        fit: fit.trim() || 'Wholesale Lot',
        minOrder: minOrderNum,
        setRatio: resolvedSetRatio,
        imageUri,
        sizes,
        inStock: totalStockCount > 0,
      };

      updateProduct(updatedProduct);
      showToast({
        type: 'success',
        title: 'Wholesale Product Updated',
        message: `"${title.trim()}" synced to ${cleanCatName}!`,
      });
      onClose();
    } else {
      const newProduct: StudioProduct = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        category: cleanCatName,
        vertical,
        subcategoryId,
        subTypeId,
        unitSpec: resolvedSetRatio,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent,
        imageUri,
        inStock: totalStockCount > 0,
        totalSold: 0,
        fabric: fabric.trim() || 'Wholesale Certified',
        gsm: gsm.trim() || 'Standard',
        fit: fit.trim() || 'Wholesale Lot',
        minOrder: minOrderNum,
        setRatio: resolvedSetRatio,
        sizes,
        isBoosted: false,
        isFlashDrop: false,
      };

      addProduct(newProduct);
      showToast({
        type: 'success',
        title: 'Published to Buyer Category!',
        message: `"${title.trim()}" is now live under ${activeVerticalDef.label} › ${cleanCatName}!`,
      });
      onClose();
    }
  }, [
    title,
    priceNum,
    originalPriceNum,
    imageUri,
    minOrder,
    setRatio,
    activeVerticalDef,
    activeCategoryTile,
    category,
    isEditing,
    productToEdit,
    vertical,
    subcategoryId,
    subTypeId,
    discountPercent,
    fabric,
    gsm,
    fit,
    sizes,
    totalStockCount,
    updateProduct,
    onClose,
    addProduct,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconWrap}>
                <Icon
                  name={isEditing ? 'pencil-outline' : 'store-plus-outline'}
                  size={20}
                  color="#EA580C"
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isEditing ? 'Edit Wholesale Product' : 'List Wholesale Product'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  Smart Auto-Category • Multi-Vertical Mandi Catalog
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Form Scroll Area */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Product Title with Real-Time Smart Auto-Category Detection */}
            <View style={styles.fieldSection}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.fieldLabel}>PRODUCT TITLE (AUTO-DETECTS CATEGORY) *</Text>
                <Text style={styles.fieldHint}>Smart AI Tagging</Text>
              </View>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. Fortune Besan 50kg / Havells Ceiling Fan / Dolo 650"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={handleTitleChange}
              />
              {Boolean(errors.title) && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}

              {/* Auto-Detected Taxonomy Banner */}
              {autoDetectedInfo && (
                <View style={styles.autoDetectBanner}>
                  <Icon name="auto-fix" size={16} color="#0D9488" />
                  <Text style={styles.autoDetectText} numberOfLines={2}>
                    Auto-Mapped:{' '}
                    <Text style={styles.autoDetectBold}>
                      {autoDetectedInfo.verticalLabel} › {autoDetectedInfo.subcategoryTitle} ›{' '}
                      {autoDetectedInfo.subTypeLabel}
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {/* 2. 3-Level Wholesale Taxonomy Selector */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>
                1. SELECT WHOLESALE DEPARTMENT (VERTICAL) *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsScroll}
              >
                {WHOLESALE_VERTICAL_DEFINITIONS.map((v) => {
                  const isSelected = vertical === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.categoryPill,
                        isSelected && {
                          backgroundColor: v.accentColor,
                          borderColor: v.accentColor,
                        },
                      ]}
                      onPress={() => {
                        setVertical(v.id);
                        const firstCat = v.categories[0];
                        if (firstCat) {
                          setSubcategoryId(firstCat.id);
                          setCategory(firstCat.title.replace(/\n/g, ' '));
                          setSubTypeId(firstCat.subTypes?.[0]?.id || 'all');
                        }
                        if (v.unitOptions[0]) {
                          setSetRatio(v.unitOptions[0]);
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      {isSelected && (
                        <Icon
                          name="check-circle"
                          size={14}
                          color="#FFFFFF"
                          style={styles.iconMarginRightSmall}
                        />
                      )}
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextActive,
                        ]}
                      >
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Level 2: Category Tile Selector */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                2. SELECT CATEGORY TILE ({activeVerticalDef.label.toUpperCase()}) *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsScroll}
              >
                {activeVerticalDef.categories.map((cat) => {
                  const isSelected = subcategoryId === cat.id;
                  const cleanTitle = cat.title.replace(/\n/g, ' ');
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catTileChip,
                        isSelected && {
                          borderColor: activeVerticalDef.accentColor,
                          backgroundColor: '#F8FAFC',
                          borderWidth: 1.8,
                        },
                      ]}
                      onPress={() => {
                        setSubcategoryId(cat.id);
                        setCategory(cleanTitle);
                        setSubTypeId(cat.subTypes?.[0]?.id || 'all');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.catTileMiniIconWrap}>
                        <Image
                          source={cat.icon}
                          style={styles.catTileMiniIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <Text
                        style={[
                          styles.catTileChipText,
                          isSelected && {
                            color: activeVerticalDef.accentColor,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {cleanTitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Level 3: Sub-Category (Item Type) Selector */}
              {activeSubTypes.length > 0 && (
                <>
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                    3. SELECT SUB-CATEGORY / ITEM TYPE *
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryPillsScroll}
                  >
                    {activeSubTypes.map((st) => {
                      const isSelected = subTypeId === st.id;
                      return (
                        <TouchableOpacity
                          key={st.id}
                          style={[
                            styles.categoryPill,
                            isSelected && styles.categoryPillActive,
                          ]}
                          onPress={() => setSubTypeId(st.id)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.categoryPillText,
                              isSelected && styles.categoryPillTextActive,
                            ]}
                          >
                            {st.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}
            </View>

            {/* 3. Pricing & Margins */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>WHOLESALE PRICING (₹) *</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceHalfCol}>
                  <Text style={styles.inputSubLabel}>Wholesale Rate (₹)</Text>
                  <View
                    style={[
                      styles.inputWithSymbol,
                      errors.price && styles.inputError,
                    ]}
                  >
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="1350"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={(val) => {
                        setPrice(val);
                        if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                      }}
                    />
                  </View>
                  {Boolean(errors.price) && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                </View>

                <View style={styles.priceHalfCol}>
                  <Text style={styles.inputSubLabel}>Retail MRP (₹)</Text>
                  <View
                    style={[
                      styles.inputWithSymbol,
                      errors.originalPrice && styles.inputError,
                    ]}
                  >
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="1899"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={originalPrice}
                      onChangeText={(val) => {
                        setOriginalPrice(val);
                        if (errors.originalPrice)
                          setErrors((prev) => ({ ...prev, originalPrice: '' }));
                      }}
                    />
                  </View>
                  {Boolean(errors.originalPrice) && (
                    <Text style={styles.errorText}>{errors.originalPrice}</Text>
                  )}
                </View>
              </View>

              {/* Discount / Margin Badge */}
              {discountPercent > 0 && (
                <View style={styles.discountBadgeWrap}>
                  <Icon name="tag-outline" size={14} color="#EA580C" />
                  <Text style={styles.discountBadgeText}>
                    {discountPercent}% Retailer Margin • Saves ₹
                    {((originalPriceNum - priceNum) || 0).toLocaleString('en-IN')} per unit
                  </Text>
                </View>
              )}
            </View>

            {/* 3.1 Wholesale MOQ & Pack Unit Spec */}
            <View style={styles.fieldSection}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.fieldLabel}>WHOLESALE MOQ & PACK UNIT *</Text>
                <Text style={styles.fieldHint}>Bori / Carton / Strip</Text>
              </View>

              {/* Quick MOQ Preset Chips */}
              <View style={styles.moqPresetRow}>
                {['2', '4', '6', '12'].map((count) => {
                  const isSelected = minOrder === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[styles.moqChip, isSelected && styles.moqChipActive]}
                      onPress={() => setMinOrder(count)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.moqChipText, isSelected && styles.moqChipTextActive]}>
                        Min {count} Units
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputWithSymbol}>
                <Text style={styles.currencyPrefix}>MOQ</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="4"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={minOrder}
                  onChangeText={(val) => setMinOrder(val.replace(/[^0-9]/g, ''))}
                />
                <Text style={styles.pcsSuffix}>units / lot</Text>
              </View>

              {/* Unit Spec Presets */}
              <Text style={[styles.inputSubLabel, { marginTop: 12, marginBottom: 6 }]}>
                Wholesale Pack / Bori / Carton Specification
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickPresetRow}
              >
                {activeVerticalDef.unitOptions.map((uOpt) => (
                  <TouchableOpacity
                    key={uOpt}
                    style={[
                      styles.quickPresetPill,
                      setRatio === uOpt && styles.quickPresetPillActive,
                    ]}
                    onPress={() => setSetRatio(uOpt)}
                  >
                    <Text
                      style={[
                        styles.quickPresetText,
                        setRatio === uOpt && styles.quickPresetTextActive,
                      ]}
                    >
                      {uOpt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="e.g. 50 Kg Mandi Katta / Box of 20 Strips"
                placeholderTextColor="#94A3B8"
                value={setRatio}
                onChangeText={setSetRatio}
              />

              {/* Live Wholesale Calculation Summary Banner */}
              {priceNum > 0 && (
                <View style={styles.wholesaleSummaryCard}>
                  <Icon name="package-variant-closed" size={16} color="#1E40AF" style={{ marginRight: 6 }} />
                  <Text style={styles.wholesaleSummaryText}>
                    Min Order ({parseInt(minOrder, 10) || 4} x {setRatio}) ={' '}
                    <Text style={styles.wholesaleSummaryBold}>
                      ₹{((parseInt(minOrder, 10) || 4) * priceNum).toLocaleString('en-IN')} Lot Value
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Category-Adaptive Specifications & Details */}
            {vertical === 'fashion' ? (
              <>
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>FABRIC & MATERIAL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 100% French Terry Cotton, 240 GSM"
                    placeholderTextColor="#94A3B8"
                    value={fabric}
                    onChangeText={setFabric}
                  />
                </View>

                <View style={styles.fieldSection}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>GSM (FABRIC WEIGHT)</Text>
                    <Text style={styles.fieldHint}>Tap preset or type</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 320 GSM"
                    placeholderTextColor="#94A3B8"
                    value={gsm}
                    onChangeText={setGsm}
                  />
                  <View style={styles.quickPresetRow}>
                    {GSM_PRESETS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.quickPresetPill,
                          gsm === item && styles.quickPresetPillActive,
                        ]}
                        onPress={() => setGsm(item)}
                      >
                        <Text
                          style={[
                            styles.quickPresetText,
                            gsm === item && styles.quickPresetTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.fieldSection}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>GARMENT SILHOUETTE & FIT</Text>
                    <Text style={styles.fieldHint}>Tap preset or type</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Boxy Oversized Drop Shoulder"
                    placeholderTextColor="#94A3B8"
                    value={fit}
                    onChangeText={setFit}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickPresetRow}
                  >
                    {FIT_PRESETS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.quickPresetPill,
                          fit === item && styles.quickPresetPillActive,
                        ]}
                        onPress={() => setFit(item)}
                      >
                        <Text
                          style={[
                            styles.quickPresetText,
                            fit === item && styles.quickPresetTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            ) : (
              <>
                <View style={styles.fieldSection}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>
                      {vertical === 'ration'
                        ? 'QUALITY GRADE / MANDI SPECIFICATION'
                        : vertical === 'electronics'
                        ? 'TECHNICAL SPEC / POWER / MODEL'
                        : vertical === 'pharmacy'
                        ? 'COMPOSITION / SALT / MEDICAL STANDARD'
                        : 'BRAND / GRADE / SPECIFICATION'}
                    </Text>
                    <Text style={styles.fieldHint}>Tap preset or type</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      vertical === 'ration'
                        ? 'e.g. 1121 Extra Long Grain • Sortex Cleaned Grade-A'
                        : vertical === 'electronics'
                        ? 'e.g. 65W Type-C Fast Charge / 1500W Auto-Cut SS'
                        : vertical === 'pharmacy'
                        ? 'e.g. Paracetamol IP 650mg • WHO-GMP Certified'
                        : 'e.g. 100% Original Sealed Wholesale Lot'
                    }
                    placeholderTextColor="#94A3B8"
                    value={fabric}
                    onChangeText={setFabric}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickPresetRow}
                  >
                    {(vertical === 'ration'
                      ? [
                          'Sortex Cleaned Grade-A',
                          '1121 Extra Long Basmati',
                          'Sharbati 100% Pure Mill',
                          'Agmark & FSSAI Verified',
                          'A-Grade Whole Spice',
                        ]
                      : vertical === 'electronics'
                      ? [
                          '65W Type-C Fast Charge',
                          'Bluetooth 5.3 • 40H Backup',
                          '1500W Auto-Cut Stainless Steel',
                          '100% Copper Winding Motor',
                          'Cool Daylight 6500K LED',
                        ]
                      : vertical === 'pharmacy'
                      ? [
                          'WHO-GMP & IP Certified',
                          'Paracetamol IP 650mg',
                          'WHO ORS Formula',
                          'Sterile Clinical Grade',
                          'Ayurvedic Proprietary',
                        ]
                      : [
                          '100% Original Sealed Lot',
                          'Dermatologically Tested',
                          'Heavy Export Quality',
                          'Retail Counter Ready',
                        ]
                    ).map((preset) => (
                      <TouchableOpacity
                        key={preset}
                        style={[
                          styles.quickPresetPill,
                          fabric === preset && styles.quickPresetPillActive,
                        ]}
                        onPress={() => setFabric(preset)}
                      >
                        <Text
                          style={[
                            styles.quickPresetText,
                            fabric === preset && styles.quickPresetTextActive,
                          ]}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.fieldSection}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>
                      {vertical === 'electronics'
                        ? 'WARRANTY & CERTIFICATION'
                        : vertical === 'pharmacy'
                        ? 'EXPIRY & BATCH SHELF LIFE'
                        : 'SHELF LIFE & PACKAGING'}
                    </Text>
                    <Text style={styles.fieldHint}>Tap preset or type</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      vertical === 'electronics'
                        ? 'e.g. 1 Year Manufacturer Warranty • BIS/ISI Certified'
                        : vertical === 'pharmacy'
                        ? 'e.g. Long Expiry (24 Months) • Authorized Stockist'
                        : 'e.g. 12 Months Shelf Life • Moisture-Proof Pack'
                    }
                    placeholderTextColor="#94A3B8"
                    value={gsm}
                    onChangeText={setGsm}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickPresetRow}
                  >
                    {(vertical === 'electronics'
                      ? [
                          '1 Year Manufacturer Warranty',
                          '6 Months Counter Replacement',
                          '2 Years Motor Warranty',
                          'BIS & ISI Certified Lot',
                        ]
                      : vertical === 'pharmacy'
                      ? [
                          'Long Expiry (24 Months)',
                          '18 Months Shelf Life',
                          '36 Months Surgical Validity',
                        ]
                      : [
                          '12 Months • PP Woven Bori',
                          '6 Months • Fresh Mill Lot',
                          '18 Months • Tin / Jar Pack',
                          '24 Months • Master Carton',
                        ]
                    ).map((preset) => (
                      <TouchableOpacity
                        key={preset}
                        style={[
                          styles.quickPresetPill,
                          gsm === preset && styles.quickPresetPillActive,
                        ]}
                        onPress={() => setGsm(preset)}
                      >
                        <Text
                          style={[
                            styles.quickPresetText,
                            gsm === preset && styles.quickPresetTextActive,
                          ]}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}

            {/* 5. Inventory Allocation (Category-Adaptive: Size Matrix ONLY for Fashion, Single Clean Counter for All Others) */}
            <View style={styles.fieldSection}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.fieldLabel}>
                  {vertical === 'ration'
                    ? 'AVAILABLE WHOLESALE STOCK (BORIS / BAGS)'
                    : vertical === 'pharmacy'
                    ? 'AVAILABLE WHOLESALE STOCK (BOXES / CASES)'
                    : 'AVAILABLE WHOLESALE STOCK (UNITS)'}
                </Text>
                <View style={styles.totalUnitsBadge}>
                  <Text style={styles.totalUnitsBadgeText}>
                    Total Stock: {totalStockCount}{' '}
                    {vertical === 'ration'
                      ? 'packs'
                      : vertical === 'pharmacy'
                      ? 'boxes'
                      : 'units'}
                  </Text>
                </View>
              </View>

              {vertical === 'fashion' ? (
                <View style={styles.sizeStockCard}>
                  {sizes.map((s) => (
                    <View key={s.size} style={styles.sizeRowItem}>
                      <View style={styles.sizePillBadge}>
                        <Text style={styles.sizePillText}>{s.size}</Text>
                      </View>

                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => handleStockChange(s.size, -1)}
                          activeOpacity={0.7}
                        >
                          <Icon name="minus" size={16} color="#475569" />
                        </TouchableOpacity>

                        <TextInput
                          style={styles.stockNumericInput}
                          keyboardType="numeric"
                          value={s.stock.toString()}
                          onChangeText={(txt) => handleStockDirectInput(s.size, txt)}
                        />

                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => handleStockChange(s.size, 1)}
                          activeOpacity={0.7}
                        >
                          <Icon name="plus" size={16} color="#475569" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.sizeStockCard}>
                  <View style={[styles.sizeRowItem, { borderBottomWidth: 0 }]}>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                        {setRatio || 'Wholesale Pack Units'}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Ready stock for instant buyer orders
                      </Text>
                    </View>

                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => {
                          const next = Math.max(0, totalStockCount - 5);
                          setSizes([
                            { size: 'S', stock: next },
                            { size: 'M', stock: 0 },
                            { size: 'L', stock: 0 },
                            { size: 'XL', stock: 0 },
                            { size: 'XXL', stock: 0 },
                          ]);
                        }}
                        activeOpacity={0.7}
                      >
                        <Icon name="minus" size={16} color="#475569" />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.stockNumericInput}
                        keyboardType="numeric"
                        value={totalStockCount.toString()}
                        onChangeText={(txt) => {
                          const parsed = parseInt(txt.replace(/[^0-9]/g, ''), 10);
                          const val = isNaN(parsed) ? 0 : parsed;
                          setSizes([
                            { size: 'S', stock: val },
                            { size: 'M', stock: 0 },
                            { size: 'L', stock: 0 },
                            { size: 'XL', stock: 0 },
                            { size: 'XXL', stock: 0 },
                          ]);
                        }}
                      />

                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => {
                          const next = totalStockCount + 5;
                          setSizes([
                            { size: 'S', stock: next },
                            { size: 'M', stock: 0 },
                            { size: 'L', stock: 0 },
                            { size: 'XL', stock: 0 },
                            { size: 'XXL', stock: 0 },
                          ]);
                        }}
                        activeOpacity={0.7}
                      >
                        <Icon name="plus" size={16} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick Bulk Stock Preset Chips */}
                  <View style={[styles.quickPresetRow, { paddingHorizontal: 10, paddingBottom: 8 }]}>
                    {[20, 50, 100, 200].map((qty) => (
                      <TouchableOpacity
                        key={qty}
                        style={[
                          styles.quickPresetPill,
                          totalStockCount === qty && styles.quickPresetPillActive,
                        ]}
                        onPress={() =>
                          setSizes([
                            { size: 'S', stock: qty },
                            { size: 'M', stock: 0 },
                            { size: 'L', stock: 0 },
                            { size: 'XL', stock: 0 },
                            { size: 'XXL', stock: 0 },
                          ])
                        }
                      >
                        <Text
                          style={[
                            styles.quickPresetText,
                            totalStockCount === qty && styles.quickPresetTextActive,
                          ]}
                        >
                          {qty} In Stock
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* 6. Product Photo */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>PRODUCT PHOTO *</Text>

              {Boolean(imageUri) && (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <View style={styles.imagePreviewOverlay}>
                    <Text style={styles.imagePreviewTag}>COVER PHOTO</Text>
                  </View>
                </View>
              )}

              <View style={styles.mediaActionRow}>
                <TouchableOpacity
                  style={styles.mediaBtn}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.75}
                >
                  <Icon name="image-multiple-outline" size={18} color="#0F172A" />
                  <Text style={styles.mediaBtnText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaBtn}
                  onPress={handleCaptureCamera}
                  activeOpacity={0.75}
                >
                  <Icon name="camera-outline" size={18} color="#0F172A" />
                  <Text style={styles.mediaBtnText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mediaBtn,
                    showUrlInput && styles.mediaBtnActive,
                  ]}
                  onPress={() => setShowUrlInput(!showUrlInput)}
                  activeOpacity={0.75}
                >
                  <Icon
                    name="link-variant"
                    size={18}
                    color={showUrlInput ? '#EA580C' : '#0F172A'}
                  />
                  <Text
                    style={[
                      styles.mediaBtnText,
                      showUrlInput && styles.mediaBtnTextActive,
                    ]}
                  >
                    Image URL
                  </Text>
                </TouchableOpacity>
              </View>

              {showUrlInput && (
                <View style={styles.urlInputContainer}>
                  <TextInput
                    style={styles.urlTextInput}
                    placeholder="Paste direct https:// image link..."
                    placeholderTextColor="#94A3B8"
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.applyUrlBtn}
                    onPress={() => {
                      if (customUrl.trim()) {
                        setImageUri(customUrl.trim());
                        showToast({
                          type: 'success',
                          title: 'URL Applied',
                          message: 'Image preview loaded.',
                        });
                      }
                    }}
                  >
                    <Text style={styles.applyUrlBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.fieldSubheadPresets}>
                Or pick from wholesale studio presets:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsScroll}
              >
                {CURATED_SAMPLE_IMAGES.map((sample) => {
                  const isSelected = imageUri === sample.uri;
                  return (
                    <TouchableOpacity
                      key={sample.name}
                      style={[
                        styles.sampleCard,
                        isSelected && styles.sampleCardActive,
                      ]}
                      onPress={() => setImageUri(sample.uri)}
                      activeOpacity={0.75}
                    >
                      <Image
                        source={{ uri: sample.uri }}
                        style={styles.sampleThumb}
                      />
                      <Text
                        style={[
                          styles.sampleName,
                          isSelected && styles.sampleNameActive,
                        ]}
                        numberOfLines={1}
                      >
                        {sample.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handlePublish}
              activeOpacity={0.85}
            >
              <Icon
                name={isEditing ? 'content-save-outline' : 'lightning-bolt'}
                size={20}
                color="#FFFFFF"
                style={styles.publishBtnIcon}
              />
              <Text style={styles.publishBtnText}>
                {isEditing
                  ? 'Save Wholesale Product'
                  : `Publish to ${activeCategoryTile?.title.replace(/\n/g, ' ') || 'Category'}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 54 : 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  fieldSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  fieldSubheadPresets: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11.5,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  autoDetectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  autoDetectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
    marginLeft: 6,
    flex: 1,
  },
  autoDetectBold: {
    fontWeight: '800',
    color: '#115E59',
  },
  categoryPillsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  iconMarginRightSmall: {
    marginRight: 4,
  },
  categoryPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  catTileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catTileMiniIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 7,
  },
  catTileMiniIcon: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.15 }],
  },
  catTileChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceHalfCol: {
    flex: 1,
  },
  inputSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  inputWithSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginRight: 6,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  discountBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  discountBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  quickPresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  quickPresetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPresetPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  quickPresetText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickPresetTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  totalUnitsBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  totalUnitsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  sizeStockCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sizeRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sizePillBadge: {
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockNumericInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: 6,
  },
  imagePreviewWrap: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePreviewOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imagePreviewTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mediaActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
  },
  mediaBtnActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  mediaBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  mediaBtnTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  urlTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
  },
  applyUrlBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applyUrlBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  presetsScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  sampleCard: {
    width: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleCardActive: {
    borderColor: '#EA580C',
    borderWidth: 2,
  },
  sampleThumb: {
    width: '100%',
    height: 70,
    resizeMode: 'cover',
  },
  sampleName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  sampleNameActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 40,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnIcon: {
    marginRight: 8,
  },
  publishBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  moqPresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  moqChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moqChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  moqChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  moqChipTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  pcsSuffix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    paddingRight: 12,
  },
  wholesaleSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 10,
  },
  wholesaleSummaryText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
  },
  wholesaleSummaryBold: {
    fontWeight: '800',
    color: '#1E3A8A',
  },
});
