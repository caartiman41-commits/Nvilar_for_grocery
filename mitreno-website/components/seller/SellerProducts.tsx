'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Scissors,
  Layers,
  Eye,
  AlertTriangle,
  X,
  Check,
  Zap,
  Flame,
} from 'lucide-react';
import { SellerProductForm, ProductFormData } from './SellerProductForm';
import { ProductBoostModal } from './ProductBoostModal';
import { SellerFlashDropModal } from './SellerFlashDropModal';
import { getBackendUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

interface ProductItem {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  original_price: number;
  discount_percent: number;
  thumbnail: string;
  gallery_images: string[];
  fabric: string;
  gsm: number;
  fit: string;
  is_active: boolean;
  tags: string[];
  total_sold: number;
  total_stock: number;
  is_sponsored?: boolean;
  boost_expires_at?: string | null;
  target_audience?: any;
  variants: {
    id: string;
    size: string;
    stock: number;
    color?: string;
    sku?: string;
    is_custom_size?: boolean;
    display_label?: string;
  }[];
}

interface SellerProductsProps {
  userId?: string;
  shopId?: string;
  onRefreshMetrics?: () => void;
}

export const SellerProducts: React.FC<SellerProductsProps> = ({
  userId: propUserId,
  shopId,
  onRefreshMetrics,
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.uid || '';
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [counts, setCounts] = useState<{ total: number; active_count: number; out_of_stock_count: number }>({
    total: 0,
    active_count: 0,
    out_of_stock_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'active' | 'out_of_stock'>('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

  // Boost Modal state
  const [boostProduct, setBoostProduct] = useState<ProductItem | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  // Flash Drop Modal state
  const [flashDropProduct, setFlashDropProduct] = useState<ProductItem | null>(null);
  const [isFlashDropModalOpen, setIsFlashDropModalOpen] = useState(false);

  // Delete Dialog state
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!shopId && !userId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};
      if (shopId) {
        params.shop_id = shopId;
      } else if (userId) {
        params.user_id = userId;
      }
      
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStockFilter !== 'all') params.status = selectedStockFilter;
      if (searchQuery) params.q = searchQuery;

      // Try guarded seller endpoint first, fallback to public endpoint
      let data = await apiClient.get('/api/seller/products', params);
      if (!data.success) {
        data = await apiClient.get('/api/products', params);
      }

      if (data.success) {
        const loadedProducts = data.products || [];
        setProducts(loadedProducts);

        const totalCount = (data.counts?.total && parseInt(data.counts.total, 10) > 0)
          ? parseInt(data.counts.total, 10)
          : loadedProducts.length;

        const activeCount = (data.counts?.active_count && parseInt(data.counts.active_count, 10) > 0)
          ? parseInt(data.counts.active_count, 10)
          : loadedProducts.filter((p: any) => p.is_active !== false).length;

        const outCount = (data.counts?.out_of_stock_count && parseInt(data.counts.out_of_stock_count, 10) > 0)
          ? parseInt(data.counts.out_of_stock_count, 10)
          : loadedProducts.filter((p: any) => p.is_active === false).length;

        setCounts({
          total: totalCount,
          active_count: activeCount,
          out_of_stock_count: outCount,
        });
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedStockFilter, searchQuery, shopId, userId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle Stock Status
  const handleToggleStock = async (product: ProductItem) => {
    // Optimistically update local UI state immediately
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
    );
    try {
      let data = await apiClient.post(`/api/seller/products/${product.id}/toggle-stock`);
      if (!data.success) {
        data = await apiClient.post(`/api/products/${product.id}/toggle-stock`);
      }

      if (data.success) {
        triggerToast(data.message || 'Stock updated');
        fetchProducts();
        if (onRefreshMetrics) onRefreshMetrics();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno:products-updated'));
        }
      } else {
        // Rollback on API failure
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: product.is_active } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle stock:', err);
      // Rollback on network error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: product.is_active } : p))
      );
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      let data = await apiClient.delete(`/api/seller/products/${deletingProduct.id}`);
      if (!data.success) {
        data = await apiClient.delete(`/api/products/${deletingProduct.id}`);
      }

      if (data.success) {
        triggerToast('Garment deleted from catalog');
        setDeletingProduct(null);
        fetchProducts();
        if (onRefreshMetrics) onRefreshMetrics();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mitreno:products-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const categories = [
    'all',
    'Streetwear',
    'Traditional & Ethnic',
    'Luxury Couture',
    'Denim',
    'Casual Wear',
    'Formal Attire',
  ];

  return (
    <div className="w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-emerald-500/40 text-emerald-700 text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* STICKY HEADER SECTION (Attached flush to top:0) */}
      <div className="sticky top-0 z-20 bg-[#F8F9FA]/95 backdrop-blur-md pt-3 pb-3 px-4 sm:px-6 border-b border-neutral-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              Store Catalog & Inventory
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900">
              {counts.total} Garments
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 font-medium">
            Manage your fashion pieces, fabric specifications, custom sizing variants, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-800/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>List New Garment</span>
          </button>

          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search piece, fabric, tag..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-950 placeholder-neutral-500 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs transition-all"
          />
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer ${
              selectedStockFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setSelectedStockFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer ${
              selectedStockFilter === 'active'
                ? 'bg-emerald-800 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:text-emerald-700'
            }`}
          >
            In Stock ({counts.active_count})
          </button>
          <button
            onClick={() => setSelectedStockFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer ${
              selectedStockFilter === 'out_of_stock'
                ? 'bg-rose-700 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:text-rose-700'
            }`}
          >
            Out of Stock ({counts.out_of_stock_count})
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 capitalize cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-950 shadow-2xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-8 space-y-4">
        {/* Products Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 mx-auto text-amber-600 animate-spin mb-3" />
          <p className="text-xs text-neutral-500 font-medium">Loading catalog inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-neutral-200 p-8 shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto text-neutral-400 stroke-[1.2] mb-3" />
          <h3 className="text-sm font-bold text-neutral-950">No products found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No products matching "${searchQuery}".`
              : 'Your boutique catalog is empty. Start adding fashion pieces with custom sizes.'}
          </p>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>List Your First Piece</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => {
            const computedStock = product.variants && product.variants.length > 0
              ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
              : (product.total_stock !== undefined ? product.total_stock : 1);
            const isOutOfStock = !product.is_active || computedStock <= 0;

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-md overflow-hidden flex flex-col sm:flex-row items-stretch transition-all duration-200 shadow-xs"
              >
                {/* Left Side: Image Container */}
                <div className="relative w-full sm:w-56 shrink-0 bg-neutral-100 overflow-hidden sm:border-r border-neutral-100 flex items-center">
                  <div className="aspect-[4/3] sm:aspect-square w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        !isOutOfStock
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>{!isOutOfStock ? 'In Stock' : 'Out of Stock'}</span>
                    </span>

                    {product.is_sponsored && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        <span>Sponsored</span>
                      </span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {product.discount_percent > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-neutral-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-black shadow-xs">
                      {product.discount_percent}% OFF
                    </div>
                  )}
                </div>

                {/* Middle: Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-500 mb-2 gap-2">
                    <span className="font-bold uppercase tracking-wider text-amber-700">
                      {product.category}
                    </span>
                    <span className="whitespace-nowrap">Total Sold: <strong className="text-neutral-900">{product.total_sold || 0}</strong></span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-950 tracking-tight line-clamp-1 mb-2">
                    {product.name}
                  </h3>

                  {/* Fabric & Fit specs */}
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 flex-wrap mb-3">
                    {product.fabric && (
                      <span className="px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200 truncate max-w-[150px]">
                        {product.fabric}
                      </span>
                    )}
                    {product.gsm && (
                      <span className="px-1.5 py-0.5 rounded-md bg-neutral-50 border border-neutral-200">
                        {product.gsm} GSM
                      </span>
                    )}
                    {product.fit && (
                      <span className="px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium">
                        {product.fit}
                      </span>
                    )}
                  </div>

                  {/* Sizing Pills with Stock */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.variants?.map((v, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          v.stock > 0
                            ? 'bg-neutral-50 text-neutral-700 border border-neutral-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200 line-through'
                        }`}
                      >
                        <span className="text-amber-800">{v.display_label || v.size}</span>
                        <span className="text-neutral-400">({v.stock})</span>
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-auto">
                    <span className="text-lg font-black text-neutral-950">
                      ₹{product.base_price?.toLocaleString('en-IN')}
                    </span>
                    {product.original_price > product.base_price && (
                      <span className="text-xs text-neutral-400 line-through font-mono">
                        ₹{product.original_price?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="p-4 sm:p-5 flex items-center justify-end sm:justify-center gap-2 sm:border-l border-neutral-100 shrink-0 bg-neutral-50/30 sm:min-w-[240px] flex-wrap">
                  {/* ⚡ Boost Product (₹99 for 24h) */}
                  <button
                    type="button"
                    onClick={() => {
                      setBoostProduct(product);
                      setIsBoostModalOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      product.is_sponsored
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 hover:bg-amber-500/25'
                        : 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)] hover:-translate-y-0.5'
                    }`}
                    title={product.is_sponsored ? '⚡ Boost Active (Top Placement)' : '⚡ Boost Product for ₹99 (24h)'}
                  >
                    <Zap className={`w-3.5 h-3.5 ${product.is_sponsored ? 'text-amber-600 fill-amber-500' : 'text-amber-400 fill-amber-400'}`} />
                    <span>{product.is_sponsored ? 'Boosted' : '⚡ Boost'}</span>
                  </button>

                  {/* ⚡ 15-Min Flash Surge Drop (Free Top Rank) */}
                  <button
                    type="button"
                    onClick={() => {
                      setFlashDropProduct(product);
                      setIsFlashDropModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-neutral-950 font-black shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    title="Launch 15-Min Flash Surge Drop (Get Free Top Rank on Nvilar)"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current text-neutral-950 animate-pulse" />
                    <span>⚡ Flash Drop</span>
                  </button>

                  {/* Toggle Stock Status */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStock(product);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      product.is_active
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.15),0_2px_4px_rgba(16,185,129,0.1)] hover:shadow-[0_6px_16px_-2px_rgba(16,185,129,0.2)] hover:-translate-y-0.5'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-[0_4px_12px_-2px_rgba(244,63,94,0.15),0_2px_4px_rgba(244,63,94,0.1)] hover:shadow-[0_6px_16px_-2px_rgba(244,63,94,0.2)] hover:-translate-y-0.5'
                    }`}
                    title={product.is_active ? 'Mark Out of Stock' : 'Mark In Stock'}
                  >
                    {product.is_active ? 'In Stock' : 'Out of Stock'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditingProduct({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        base_price: product.base_price,
                        original_price: product.original_price,
                        thumbnail: product.thumbnail,
                        gallery_images: product.gallery_images || [],
                        fabric: product.fabric,
                        gsm: product.gsm,
                        fit: product.fit,
                        is_active: product.is_active,
                        tags: product.tags || [],
                        variants: product.variants || [],
                      });
                      setIsFormOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-neutral-50/90 border border-neutral-200/90 text-neutral-700 hover:text-neutral-950 hover:border-neutral-300 transition-all cursor-pointer shadow-[0_4px_12px_-2px_rgba(0,0,0,0.07),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.11)] hover:-translate-y-0.5"
                    title="Edit Garment"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-50/90 border border-neutral-200/90 text-neutral-500 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-[0_4px_12px_-2px_rgba(0,0,0,0.07),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_16px_-2px_rgba(244,63,94,0.11)] hover:-translate-y-0.5"
                    title="Delete Garment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Product Create / Edit Modal */}
      <SellerProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmitSuccess={() => {
          triggerToast(editingProduct ? 'Garment updated successfully!' : 'New garment published to store!');
          fetchProducts();
          if (onRefreshMetrics) onRefreshMetrics();
        }}
        initialData={editingProduct}
        shopId={shopId}
        userId={userId}
      />

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xl text-neutral-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950">Delete Garment?</h3>
                <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                  {deletingProduct.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to delete this product from your catalog? This will permanently remove its variants and photos.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ INSTAGRAM-STYLE PRODUCT BOOST MODAL */}
      <ProductBoostModal
        isOpen={isBoostModalOpen}
        onClose={() => {
          setIsBoostModalOpen(false);
          setBoostProduct(null);
        }}
        product={boostProduct}
        userId={userId}
        shopId={shopId}
        onBoostSuccess={() => {
          triggerToast('⚡ Product boost activated for 24 hours! Top placement active.');
          fetchProducts();
          if (onRefreshMetrics) onRefreshMetrics();
        }}
      />

      {/* ⚡ 15-MINUTE HIGH-INTENSITY FLASH SURGE DROP MODAL */}
      <SellerFlashDropModal
        isOpen={isFlashDropModalOpen}
        onClose={() => {
          setIsFlashDropModalOpen(false);
          setFlashDropProduct(null);
        }}
        product={flashDropProduct}
        onSuccess={() => {
          triggerToast('⚡ Flash Surge Drop launched! Product is now pinned to the Top of Nvilar.');
          fetchProducts();
          if (onRefreshMetrics) onRefreshMetrics();
        }}
      />
    </div>
  );
};
