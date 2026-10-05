'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Image as ImageIcon,
  Check,
  ArrowRight,
  Eye,
  Tag,
  Scissors,
  Layers,
  Ruler,
} from 'lucide-react';

export interface ProductVariantInput {
  size: string;
  stock: number;
  color?: string;
  sku?: string;
  is_custom_size?: boolean;
  display_label?: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  original_price: number;
  thumbnail: string;
  gallery_images: string[];
  fabric: string;
  gsm: number;
  fit: string;
  is_active: boolean;
  tags: string[];
  variants: ProductVariantInput[];
}

interface SellerProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  initialData?: ProductFormData | null;
  shopId?: string;
  userId?: string;
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const CATEGORIES = [
  'Streetwear',
  'Traditional & Ethnic',
  'Luxury Couture',
  'Denim',
  'Casual Wear',
  'Formal Attire',
  'Resort & Summer',
  'Accessories',
];

const FABRICS = [
  'French Terry Cotton',
  'Japanese Selvedge Denim',
  'Pure Assam Khadi Linen',
  'Mulberry Silk',
  'Heavyweight Fleece',
  'Supima Organic Cotton',
  'Chanderi Silk Weave',
  'Wool Cashmere Blend',
];

const FITS = ['Oversized Boxy', 'Relaxed Resort', 'Slim Tailored', 'Classic Regular', 'Flared Wide'];

const SAMPLE_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
];

export const SellerProductForm: React.FC<SellerProductFormProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
  shopId,
  userId: propUserId,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Streetwear');
  const [basePrice, setBasePrice] = useState<number | ''>(1999);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(2999);
  const [thumbnail, setThumbnail] = useState(SAMPLE_IMAGE_PRESETS[0]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [fabric, setFabric] = useState('French Terry Cotton');
  const [gsm, setGsm] = useState<number | ''>(280);
  const [fit, setFit] = useState('Oversized Boxy');
  const [isActive, setIsActive] = useState(true);
  const [tagsInput, setTagsInput] = useState('oversized, streetwear, new-drop');

  // Custom sizing & variants
  const [variants, setVariants] = useState<ProductVariantInput[]>([
    { size: 'S', stock: 15, is_custom_size: false, display_label: 'S' },
    { size: 'M', stock: 20, is_custom_size: false, display_label: 'M' },
    { size: 'L', stock: 20, is_custom_size: false, display_label: 'L' },
    { size: 'XL', stock: 15, is_custom_size: false, display_label: 'XL' },
  ]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customStockInput, setCustomStockInput] = useState(10);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stepper states
  const [currentStep, setCurrentStep] = useState(0);
  const STEPS = [
    { id: 'identity', label: 'Basic Info', icon: Sparkles },
    { id: 'pricing', label: 'Pricing', icon: Tag },
    { id: 'specs', label: 'Tailoring', icon: Scissors },
    { id: 'sizing', label: 'Sizing', icon: Ruler },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Streetwear');
      setBasePrice(initialData.base_price || 1999);
      setOriginalPrice(initialData.original_price || 2999);
      setThumbnail(initialData.thumbnail || SAMPLE_IMAGE_PRESETS[0]);
      setGalleryImages(initialData.gallery_images || []);
      setFabric(initialData.fabric || 'French Terry Cotton');
      setGsm(initialData.gsm || 280);
      setFit(initialData.fit || 'Oversized Boxy');
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
      setTagsInput(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '');
      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(initialData.variants);
      }
    } else {
      // Reset defaults
      setName('');
      setDescription('');
      setCategory('Streetwear');
      setBasePrice(1999);
      setOriginalPrice(2999);
      setThumbnail(SAMPLE_IMAGE_PRESETS[0]);
      setGalleryImages([]);
      setFabric('French Terry Cotton');
      setGsm(280);
      setFit('Oversized Boxy');
      setIsActive(true);
      setTagsInput('oversized, streetwear, new-drop');
      setVariants([
        { size: 'S', stock: 15, is_custom_size: false, display_label: 'S' },
        { size: 'M', stock: 20, is_custom_size: false, display_label: 'M' },
        { size: 'L', stock: 20, is_custom_size: false, display_label: 'L' },
        { size: 'XL', stock: 15, is_custom_size: false, display_label: 'XL' },
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Discount calculation
  const bPrice = typeof basePrice === 'number' ? basePrice : 0;
  const oPrice = typeof originalPrice === 'number' ? originalPrice : 0;
  const discountPercent = oPrice > bPrice && oPrice > 0 ? Math.round(((oPrice - bPrice) / oPrice) * 100) : 0;

  // Add / Toggle preset size
  const handleTogglePresetSize = (sz: string) => {
    const exists = variants.find((v) => v.size === sz);
    if (exists) {
      setVariants(variants.filter((v) => v.size !== sz));
    } else {
      setVariants([...variants, { size: sz, stock: 15, is_custom_size: false, display_label: sz }]);
    }
  };

  // Add Custom Size variant
  const handleAddCustomSize = () => {
    const clean = customSizeInput.trim();
    if (!clean) return;
    if (variants.some((v) => v.size.toLowerCase() === clean.toLowerCase())) {
      setErrorMsg(`Size "${clean}" already added.`);
      return;
    }
    setVariants([
      ...variants,
      {
        size: clean,
        stock: customStockInput > 0 ? customStockInput : 10,
        is_custom_size: true,
        display_label: clean,
      },
    ]);
    setCustomSizeInput('');
    setCustomStockInput(10);
    setErrorMsg(null);
  };

  // Update variant stock count
  const handleUpdateStock = (index: number, newStock: number) => {
    const updated = [...variants];
    updated[index].stock = Math.max(0, newStock);
    setVariants(updated);
  };

  // Remove variant
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Add Gallery Image
  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a product name.');
      return;
    }
    if (!basePrice || basePrice <= 0) {
      setErrorMsg('Please enter a valid selling price.');
      return;
    }
    if (variants.length === 0) {
      setErrorMsg('Please add at least one size variant with stock.');
      return;
    }
    if (!thumbnail) {
      setErrorMsg('Please go to the Media step and provide a Main Display Thumbnail.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const backendUrl = getBackendUrl();
      const finalShopId = shopId || 'shp_demo_01';

      const payload = {
        shop_id: finalShopId,
        name: name.trim(),
        description: description.trim(),
        category,
        base_price: Number(basePrice),
        original_price: Number(originalPrice || basePrice),
        thumbnail,
        gallery_images: galleryImages,
        fabric,
        gsm: Number(gsm || 240),
        fit,
        is_active: isActive,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        variants,
      };

      let token = '';
      if (user) {
        try {
          token = await user.getIdToken();
        } catch (e) {}
      }

      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      };
      if (token) {
        reqHeaders['Authorization'] = `Bearer ${token}`;
      } else if (userId) {
        reqHeaders['Authorization'] = `Bearer ${userId}`;
      }

      let res;
      if (initialData?.id) {
        // Edit
        res = await fetch(`${backendUrl}/api/seller/products/${initialData.id}`, {
          method: 'PUT',
          headers: reqHeaders,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          res = await fetch(`${backendUrl}/api/products/${initialData.id}`, {
            method: 'PUT',
            headers: reqHeaders,
            body: JSON.stringify(payload),
          });
        }
      } else {
        // Create
        res = await fetch(`${backendUrl}/api/seller/products`, {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          res = await fetch(`${backendUrl}/api/products`, {
            method: 'POST',
            headers: reqHeaders,
            body: JSON.stringify(payload),
          });
        }
      }

      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno:products-updated'));
        }
        onSubmitSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to save product.');
      }
    } catch (err: any) {
      console.error("Product submission error:", err);
      if (err.message === 'Failed to fetch') {
        setErrorMsg('Network Error: Cannot connect to the Mitreno backend. Please ensure the backend server is running (go run cmd/api/main.go) and try again.');
      } else {
        setErrorMsg(err.message || 'Network error occurred while saving.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center sm:p-6 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-4xl bg-white sm:rounded-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col text-neutral-900 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-950 tracking-tight leading-tight">
                {initialData ? 'Edit Boutique Garment' : 'List New Garment'}
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Step-by-step cataloging process
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Horizontal Stepper (Scrollable on small screens) */}
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isActive = currentStep === idx;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center gap-2 shrink-0 transition-opacity duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-60'}`}
                  onClick={() => isCompleted && setCurrentStep(idx)}
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all font-bold ${
                      isActive
                        ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 scale-105'
                        : isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white border-neutral-300 text-neutral-400'
                    } ${isCompleted ? 'cursor-pointer hover:bg-emerald-600' : ''}`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold ${isActive ? 'text-neutral-900' : 'text-neutral-500'} ${isActive || isCompleted ? '' : 'hidden sm:block'}`}>
                    {step.label}
                  </span>
                </div>
                {/* Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div className="w-6 sm:w-10 h-[2px] bg-neutral-200 shrink-0 mx-1 sm:mx-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500 w-full' : 'w-0'}`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Body - Render Only Active Step */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin scrollbar-thumb-neutral-300">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
                <X className="w-4 h-4 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Step 1: Basic Garment Info */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-black text-neutral-900">Garment Identity</h4>
                  <p className="text-sm text-neutral-500 mt-1">What are you listing on Mitreno?</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-800 block">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Heavyweight Acid-Wash Boxy Tee"
                    className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-800 block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors cursor-pointer shadow-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-800 block">
                      Search Tags
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. streetwear, oversized"
                      className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-800 block">
                    Design Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tailoring details, seam construction, wash type..."
                    className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors shadow-xs leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-black text-neutral-900">Pricing Strategy</h4>
                  <p className="text-sm text-neutral-500 mt-1">Set your competitive selling price</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-800 block">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-bold">₹</span>
                      <input
                        type="number"
                        min={1}
                        required
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-lg font-mono font-black text-amber-900 focus:outline-none focus:border-amber-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-800 block">
                      Original MRP (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-base font-bold">₹</span>
                      <input
                        type="number"
                        min={1}
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-base font-mono font-bold text-neutral-500 focus:outline-none focus:border-neutral-400 shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#EEF4FF] border border-blue-200 flex items-center justify-between mt-4">
                  <div>
                    <h5 className="text-sm font-bold text-blue-900">Consumer Discount</h5>
                    <p className="text-xs text-blue-700 mt-0.5">Auto-calculated based on MRP</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-100 text-blue-700 font-black text-lg">
                    {discountPercent}% OFF
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Material & Specs */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 max-w-2xl mx-auto">
                 <div className="text-center mb-8">
                  <h4 className="text-xl font-black text-neutral-900">Material & Fit</h4>
                  <p className="text-sm text-neutral-500 mt-1">Provide tactile details to shoppers</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-800 block">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    list="fabrics-list"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Japanese Selvedge Denim"
                    className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                  />
                  <datalist id="fabrics-list">
                    {FABRICS.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-800 block">
                      Fabric GSM
                    </label>
                    <input
                      type="number"
                      value={gsm}
                      onChange={(e) => setGsm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 280"
                      className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-800 block">
                      Silhouette / Fit
                    </label>
                    <select
                      value={fit}
                      onChange={(e) => setFit(e.target.value)}
                      className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs cursor-pointer"
                    >
                      {FITS.map((ft) => (
                        <option key={ft} value={ft}>{ft}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Sizing */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-black text-neutral-900">Inventory Sizing</h4>
                  <p className="text-sm text-neutral-500 mt-1">Manage stock for {variants.length} active variants</p>
                </div>

                {/* Preset Sizes */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <span className="text-xs text-neutral-500 block mb-3 font-bold uppercase tracking-wider">
                    Quick Preset Toggles
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_SIZES.map((sz) => {
                      const isSelected = variants.some((v) => v.size === sz && !v.is_custom_size);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleTogglePresetSize(sz)}
                          className={`min-w-[3rem] px-3 py-2 rounded-xl text-sm font-black transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-1'
                              : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-300'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Size Adder */}
                <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Custom size (e.g. 32, Tailored)"
                    className="flex-1 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={customStockInput}
                    onChange={(e) => setCustomStockInput(Number(e.target.value))}
                    placeholder="Stock"
                    className="w-full sm:w-24 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-mono font-bold text-neutral-900 focus:outline-none text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="py-3.5 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-bold shadow-md transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* Active Variants List */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-neutral-200 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-900 font-mono font-black text-sm">
                          {v.size}
                        </span>
                        {v.is_custom_size && (
                          <span className="text-[10px] px-2 py-1 rounded-md bg-purple-100 text-purple-800 font-bold uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500 text-xs font-bold uppercase hidden sm:block">Stock</span>
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => handleUpdateStock(idx, Number(e.target.value))}
                          className="w-16 sm:w-20 p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-center font-mono font-bold text-base sm:text-lg text-neutral-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                          title="Remove Size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Imagery */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300 max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-black text-neutral-900">Photography</h4>
                  <p className="text-sm text-neutral-500 mt-1">High-quality imagery increases conversions</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-neutral-800 block">
                    Main Display Thumbnail URL
                  </label>
                  <input
                    type="url"
                    required
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                  
                  {/* Preset Selector */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-neutral-500 mb-2 block">Quick Studio Presets:</span>
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
                      {SAMPLE_IMAGE_PRESETS.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setThumbnail(img)}
                          className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            thumbnail === img ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-neutral-800">
                      Additional Gallery ({galleryImages.length}/8)
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Paste secondary image URL..."
                      className="flex-1 p-3.5 rounded-xl bg-neutral-50 border-2 border-neutral-200 text-sm font-mono text-neutral-900 focus:outline-none focus:border-neutral-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-bold shadow-md transition-colors whitespace-nowrap"
                    >
                      Add Image
                    </button>
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-3">
                      {galleryImages.map((img, i) => (
                        <div key={i} className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-neutral-200 group shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Preview */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 max-w-sm mx-auto">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-black text-emerald-600">Ready to Publish!</h4>
                  <p className="text-sm text-neutral-500 mt-1">Here is how customers will see it</p>
                </div>

                <div className="rounded-3xl overflow-hidden bg-white border border-neutral-200 shadow-xl shadow-neutral-200/50 group">
                  <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail || SAMPLE_IMAGE_PRESETS[0]}
                      alt={name || 'Garment'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 text-xs font-black tracking-wider shadow-lg border border-white/10">
                      {discountPercent}% OFF
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-1">
                      {galleryImages.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="gal" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {galleryImages.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-black/80 backdrop-blur-md border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                          +{galleryImages.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-2 bg-white relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block">
                      {category}
                    </span>
                    <h5 className="text-base font-black text-neutral-900 line-clamp-1">
                      {name || 'Untitled Designer Piece'}
                    </h5>
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-xl font-black text-neutral-900">₹{bPrice}</span>
                      {oPrice > bPrice && (
                        <span className="text-sm text-neutral-400 line-through font-mono font-bold">₹{oPrice}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-none">
                      {variants.map(v => (
                        <span key={v.size} className="w-7 h-7 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-600 shrink-0">
                          {v.size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 shrink-0 flex items-center justify-between gap-3 relative z-10">
            <button
              type="button"
              onClick={() => currentStep > 0 ? setCurrentStep(curr => curr - 1) : onClose()}
              className="py-3.5 px-6 sm:px-8 rounded-xl bg-white hover:bg-neutral-100 border-2 border-neutral-200 text-sm font-bold text-neutral-700 transition-colors"
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  // Basic validation before proceeding
                  if (currentStep === 0 && !name.trim()) {
                    setErrorMsg('Please enter a product title before continuing.');
                    return;
                  }
                  if (currentStep === 1 && (!basePrice || basePrice <= 0)) {
                    setErrorMsg('Please enter a valid selling price.');
                    return;
                  }
                  if (currentStep === 3 && variants.length === 0) {
                    setErrorMsg('Please add at least one size variant.');
                    return;
                  }
                  setErrorMsg(null);
                  setCurrentStep(curr => curr + 1);
                }}
                className="py-3.5 px-6 sm:px-10 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-bold shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 max-w-[200px] sm:max-w-xs py-3.5 px-6 sm:px-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Check className="w-5 h-5 stroke-[3]" />
                )}
                <span>
                  {isSubmitting
                    ? 'Publishing...'
                    : initialData
                    ? 'Save Changes'
                    : 'Publish Garment'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
