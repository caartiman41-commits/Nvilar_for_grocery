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

export interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  productToEdit?: StudioProduct | null;
}

const CATEGORY_OPTIONS = [
  'Streetwear',
  'Traditional & Ethnic',
  'Luxury Couture',
  'Denim',
  'Casual Wear',
  'Formal Attire',
  'Footwear',
] as const;

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
    name: 'Streetwear Hoodie',
    uri: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Silk Kurta',
    uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Vintage Denim',
    uri: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Designer Blazer',
    uri: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cargo Pants',
    uri: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Graphic Tee',
    uri: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
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
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [fabric, setFabric] = useState('');
  const [gsm, setGsm] = useState('');
  const [fit, setFit] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [sizes, setSizes] = useState<GarmentSizeStock[]>(DEFAULT_SIZES);
  const [minOrder, setMinOrder] = useState('6');
  const [setRatio, setSetRatio] = useState('S:1, M:2, L:2, XL:1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(productToEdit);

  // Sync form state when productToEdit changes or modal opens
  useEffect(() => {
    if (visible) {
      if (productToEdit) {
        setTitle(productToEdit.title);
        setCategory(productToEdit.category);
        setPrice(productToEdit.price.toString());
        setOriginalPrice(productToEdit.originalPrice.toString());
        setFabric(productToEdit.fabric);
        setGsm(productToEdit.gsm);
        setFit(productToEdit.fit);
        setMinOrder(productToEdit.minOrder ? productToEdit.minOrder.toString() : '6');
        setSetRatio(productToEdit.setRatio || 'S:1, M:2, L:2, XL:1');
        setImageUri(productToEdit.imageUri);
        setCustomUrl(productToEdit.imageUri);

        // Ensure all 5 sizes are represented
        const allSizes: Array<'S' | 'M' | 'L' | 'XL' | 'XXL'> = ['S', 'M', 'L', 'XL', 'XXL'];
        const mappedSizes = allSizes.map((sz) => {
          const match = productToEdit.sizes.find((s) => s.size === sz);
          return { size: sz, stock: match ? match.stock : 0 };
        });
        setSizes(mappedSizes);
      } else {
        // Reset defaults
        setTitle('');
        setCategory(CATEGORY_OPTIONS[0]);
        setPrice('');
        setOriginalPrice('');
        setFabric('');
        setGsm('240 GSM');
        setFit('Boxy Oversized');
        setMinOrder('6');
        setSetRatio('S:1, M:2, L:2, XL:1');
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
            message: 'Garment cover image set from gallery.',
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
      newErrors.price = 'Please enter a valid selling price.';
    }
    if (!originalPriceNum || originalPriceNum <= 0) {
      newErrors.originalPrice = 'Please enter a valid original MRP.';
    } else if (originalPriceNum < priceNum) {
      newErrors.originalPrice = 'MRP should be equal to or higher than selling price.';
    }
    if (!fabric.trim()) {
      newErrors.fabric = 'Please specify fabric & material composition.';
    }
    if (!imageUri.trim()) {
      newErrors.imageUri = 'Please provide an image for the garment.';
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

    const minOrderNum = parseInt(minOrder, 10) || 6;
    const resolvedSetRatio = setRatio.trim() || 'S:1, M:2, L:2, XL:1';

    if (isEditing && productToEdit) {
      const updatedProduct: StudioProduct = {
        ...productToEdit,
        title: title.trim(),
        category,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent,
        fabric: fabric.trim(),
        gsm: gsm.trim() || '240 GSM',
        fit: fit.trim() || 'Boxy Oversized',
        minOrder: minOrderNum,
        setRatio: resolvedSetRatio,
        imageUri,
        sizes,
        inStock: totalStockCount > 0,
      };

      updateProduct(updatedProduct);
      showToast({
        type: 'success',
        title: 'Garment Updated',
        message: `"${title.trim()}" changes saved successfully.`,
      });
      onClose();
    } else {
      const newProduct: StudioProduct = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        category,
        price: priceNum,
        originalPrice: originalPriceNum,
        discountPercent,
        imageUri,
        inStock: totalStockCount > 0,
        totalSold: 0,
        fabric: fabric.trim(),
        gsm: gsm.trim() || '240 GSM',
        fit: fit.trim() || 'Boxy Oversized',
        minOrder: minOrderNum,
        setRatio: resolvedSetRatio,
        sizes,
        isBoosted: false,
        isFlashDrop: false,
      };

      addProduct(newProduct);
      showToast({
        type: 'success',
        title: 'Garment Published',
        message: `"${title.trim()}" is now live on your boutique storefront!`,
      });
      onClose();
    }
  }, [
    title,
    priceNum,
    originalPriceNum,
    fabric,
    imageUri,
    isEditing,
    productToEdit,
    category,
    discountPercent,
    gsm,
    fit,
    minOrder,
    setRatio,
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
                  name={isEditing ? 'pencil-outline' : 'hanger'}
                  size={20}
                  color="#EA580C"
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isEditing ? 'Edit Garment Piece' : 'List New Garment'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  Nvilar Atelier • Studio Catalog Dispatch
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
            {/* 1. Garment Title */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>GARMENT TITLE *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. Oversized Acid Wash Heavyweight Tee"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
              />
              {Boolean(errors.title) && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* 2. Category Selector */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>CATEGORY *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsScroll}
              >
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.75}
                    >
                      {isSelected && (
                        <Icon
                          name="check"
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
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 3. Pricing & Margins */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>PRICING (₹) *</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceHalfCol}>
                  <Text style={styles.inputSubLabel}>Selling Price (₹)</Text>
                  <View
                    style={[
                      styles.inputWithSymbol,
                      errors.price && styles.inputError,
                    ]}
                  >
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="2499"
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
                  <Text style={styles.inputSubLabel}>Original MRP (₹)</Text>
                  <View
                    style={[
                      styles.inputWithSymbol,
                      errors.originalPrice && styles.inputError,
                    ]}
                  >
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="3499"
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
                    {discountPercent}% OFF • Buyer saves ₹
                    {((originalPriceNum - priceNum) || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
            </View>

            {/* 3.1 Wholesale MOQ & Lot Size Ratio */}
            <View style={styles.fieldSection}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.fieldLabel}>WHOLESALE MINIMUM ORDER QUANTITY (MOQ) *</Text>
                <Text style={styles.fieldHint}>Pieces per Set</Text>
              </View>

              {/* Quick MOQ Preset Chips */}
              <View style={styles.moqPresetRow}>
                {['4', '6', '12', '24'].map((count) => {
                  const isSelected = minOrder === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[styles.moqChip, isSelected && styles.moqChipActive]}
                      onPress={() => {
                        setMinOrder(count);
                        if (count === '4') setSetRatio('S:1, M:1, L:1, XL:1');
                        else if (count === '6') setSetRatio('S:1, M:2, L:2, XL:1');
                        else if (count === '12') setSetRatio('S:2, M:4, L:4, XL:2');
                        else if (count === '24') setSetRatio('S:4, M:8, L:8, XL:4');
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.moqChipText, isSelected && styles.moqChipTextActive]}>
                        {count} pcs Lot
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputWithSymbol}>
                <Text style={styles.currencyPrefix}>MOQ</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="6"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={minOrder}
                  onChangeText={(val) => setMinOrder(val.replace(/[^0-9]/g, ''))}
                />
                <Text style={styles.pcsSuffix}>pcs / set</Text>
              </View>

              {/* Set Ratio Input */}
              <Text style={[styles.inputSubLabel, { marginTop: 10, marginBottom: 4 }]}>
                Pre-packed Size Ratio Breakdown
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. S:1, M:2, L:2, XL:1"
                placeholderTextColor="#94A3B8"
                value={setRatio}
                onChangeText={setSetRatio}
              />

              {/* Live Wholesale Calculation Summary Banner */}
              {priceNum > 0 && (
                <View style={styles.wholesaleSummaryCard}>
                  <Icon name="package-variant-closed" size={16} color="#1E40AF" style={{ marginRight: 6 }} />
                  <Text style={styles.wholesaleSummaryText}>
                    1 Set = {parseInt(minOrder, 10) || 6} pcs @ ₹{priceNum.toLocaleString('en-IN')}/pc ={' '}
                    <Text style={styles.wholesaleSummaryBold}>
                      ₹{((parseInt(minOrder, 10) || 6) * priceNum).toLocaleString('en-IN')} Total Set Value
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {/* 4. Fabric, GSM, and Fit Specs */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>FABRIC & MATERIAL *</Text>
              <TextInput
                style={[styles.input, errors.fabric && styles.inputError]}
                placeholder="e.g. 100% French Terry Cotton, 2-Ply"
                placeholderTextColor="#94A3B8"
                value={fabric}
                onChangeText={(val) => {
                  setFabric(val);
                  if (errors.fabric) setErrors((prev) => ({ ...prev, fabric: '' }));
                }}
              />
              {Boolean(errors.fabric) && (
                <Text style={styles.errorText}>{errors.fabric}</Text>
              )}
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

            {/* 5. Size Inventory Allocation */}
            <View style={styles.fieldSection}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.fieldLabel}>STOCK PER SIZE</Text>
                <View style={styles.totalUnitsBadge}>
                  <Text style={styles.totalUnitsBadgeText}>
                    Total Stock: {totalStockCount} pcs
                  </Text>
                </View>
              </View>

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
            </View>

            {/* 6. Garment Photo */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>GARMENT PHOTO *</Text>

              {/* Photo Preview */}
              {Boolean(imageUri) && (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <View style={styles.imagePreviewOverlay}>
                    <Text style={styles.imagePreviewTag}>COVER PHOTO</Text>
                  </View>
                </View>
              )}

              {/* Picker Options */}
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

              {/* URL Input */}
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

              {/* Quick Presets Carousel */}
              <Text style={styles.fieldSubheadPresets}>
                Or pick from curated studio presets:
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
                {isEditing ? 'Save Garment Changes' : 'Publish Garment to Store'}
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
    marginTop: 8,
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
