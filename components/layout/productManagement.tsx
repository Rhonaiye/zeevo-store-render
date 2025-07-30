'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Package, Search, Star, TrendingUp } from 'lucide-react';
import { Store, ProductFormData, Product, useAppStore, UserProfile } from '@/store/useAppStore';
import { renderProductForm } from './productForm';
import Cookies from 'js-cookie';

// Props interface for RenderProducts component
interface RenderProductsProps {
  addNotification: (message: string, type: 'success' | 'error', duration?: number) => void;
  fetchUserProfile: () => Promise<UserProfile | null>;
}

const RenderProductsManagement: React.FC<RenderProductsProps> = ({ addNotification, fetchUserProfile }) => {
  const { userProfile } = useAppStore();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    description: '',
    images: [],
    existingImages: [],
    isAvailable: true,
    discountPrice: 0,
    stockCount: 0,
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  // Sync localProducts with userProfile.stores when it changes
  useEffect(() => {
    if (userProfile?.stores && userProfile.stores.length > 0) {
      setLocalProducts(userProfile.stores[0]?.products || []);
    } else {
      setLocalProducts([]);
    }
  }, [userProfile]);

  const store = userProfile?.stores?.[0];

  const filteredProducts = localProducts.filter(product =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Function to handle adding or updating a product
  const handleAddProduct = async (
    e: React.FormEvent,
    storeId: string,
    isEdit = false,
    storeSlug: string
  ) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Auth error, can’t enlist', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Construct FormData
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('price', productFormData.price.toString());
      formData.append('description', productFormData.description);
      formData.append('isAvailable', String(productFormData.isAvailable));
      formData.append('discountPrice', productFormData.discountPrice?.toString() || '0');
      formData.append('stockCount', productFormData.stockCount?.toString() || '0');

      if (productFormData.tags && productFormData.tags.length > 0) {
        formData.append('tags', JSON.stringify(productFormData.tags));
      }

      // Append multiple images
      if (Array.isArray(productFormData.images) && productFormData.images.length > 0) {
        productFormData.images.forEach((file, index) => {
          formData.append(`images`, file);
        });
      }

      // Append existing images (for edit mode)
      if (isEdit && Array.isArray(productFormData.existingImages)) {
        formData.append('existingImages', JSON.stringify(productFormData.existingImages));
      }

      const endpoint = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/${storeId}/products/${editingProductId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/create/${storeSlug}`;

      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Product failed to enlist');
      await response.json(); // Process response but no need to store it since we fetch userProfile

      // Fetch updated user profile
      await fetchUserProfile();

      // Reset form
      setProductFormData({
        name: '',
        price: 0,
        description: '',
        images: [],
        existingImages: [],
        isAvailable: true,
        discountPrice: 0,
        stockCount: 0,
        tags: [],
      });

      setShowProductForm(false);
      setEditingProductId(null);
      addNotification(`Product ${isEdit ? 'updated' : 'added'}, assist`, 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}, resist`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle editing a product
  const handleEditProduct = (storeId: string, product: Product) => {
    setProductFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      images: [],
      existingImages: product.images || [],
      isAvailable: product.isAvailable,
      discountPrice: product.discountPrice || 0,
      stockCount: product.stockCount || 0,
      tags: product.tags || [],
    });
    setEditingProductId(product._id);
    setShowProductForm(true);
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async (storeId: string, productId: string) => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Auth error, can’t delete', 'error');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/${storeId}/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete product');

      // Fetch updated user profile
      await fetchUserProfile();

      addNotification('Product deleted successfully', 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}`, 'error');
    }
  };

  // Function to toggle product availability
  const toggleProductAvailability = async (productId: string, currentStatus: boolean) => {
    const previousProducts = [...localProducts];
    setLocalProducts(prevProducts =>
      prevProducts.map(product =>
        product._id === productId ? { ...product, isAvailable: !currentStatus } : product
      )
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/toggle/availability/${productId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
          body: JSON.stringify({ available: !currentStatus }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to toggle product availability');
      }

      await res.json();
      // Fetch updated user profile
      await fetchUserProfile();
    } catch (error) {
      console.error('Error toggling availability:', error);
      setLocalProducts(previousProducts);
      addNotification('Failed to toggle availability', 'error');
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-2 sm:p-3"
    >
      {/* Header */}
      <motion.div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-indigo-500 rounded-md">
                <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-gray-800">Product Management</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Manage your store's inventory</p>
              </div>
            </div>
            {store && (
              <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                <div className="bg-white border border-gray-200 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-700">{localProducts.length} Products</span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {localProducts.filter(p => p.isAvailable).length} Available
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {store && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setProductFormData({
                  name: '',
                  price: 0,
                  description: '',
                  images: [],
                  existingImages: [],
                  isAvailable: true,
                  discountPrice: 0,
                  stockCount: 0,
                  tags: [],
                });
                setEditingProductId(null);
                setShowProductForm(true);
              }}
              className="bg-indigo-500 text-white px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium hover:bg-indigo-600 transition-colors w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Add Product</span>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Product Form */}
      <AnimatePresence>
        {showProductForm && store && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="mb-4"
          >
            <div className="overflow-hidden">
              {renderProductForm(
                store._id,
                !!editingProductId,
                store.slug,
                productFormData,
                setProductFormData,
                setShowProductForm,
                setEditingProductId,
                handleAddProduct,
                isSubmitting
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar - Centered */}
      {!showProductForm && store && localProducts.length > 0 && (
        <motion.div className="flex justify-center mb-3 sm:mb-4">
          <div className="relative w-full max-w-xs sm:max-w-md">
            <Search className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-8 pr-3 py-2.5 text-black sm:py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all text-md md:text-xs shadow-sm"
            />
          </div>
        </motion.div>
      )}

      {/* Products List - Only show when form is not visible */}
      {!showProductForm && store && filteredProducts.length > 0 ? (
        <motion.div>
          <div className="rounded-lg">
            <div className="space-y-2 sm:space-y-3">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 bg-white border border-gray-200 rounded-md hover:shadow-md transition-all group gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-0.5 sm:space-y-1">
                      <h4 className="font-medium text-gray-800 text-xs sm:text-sm group-hover:text-indigo-500 transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-600">
                        <span className="font-medium text-gray-800">
                          {store.currency || 'USD'} {product.price.toFixed(2)}
                        </span>
                        {product.discountPrice && product.discountPrice > 0 && (
                          <span className="text-indigo-500 font-medium">
                            Discount: {store.currency || 'USD'} {product.discountPrice.toFixed(2)}
                          </span>
                        )}
                        <span>Stock: <span className="font-medium">{product.stockCount || 0}</span></span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 hidden sm:block">{product.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="text-xs text-gray-600 hidden sm:inline">Available</span>
                      <button
                        onClick={() => toggleProductAvailability(product._id, product.isAvailable)}
                        className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 items-center rounded-full transition-colors ${
                          product.isAvailable ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 transform rounded-full bg-white transition-transform ${
                            product.isAvailable ? 'translate-x-3.5 sm:translate-x-5' : 'translate-x-0.5 sm:translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditProduct(store._id, product)}
                        className="p-1 sm:p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                            handleDeleteProduct(store._id, product._id);
                          }
                        }}
                        className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : !showProductForm && (
        <motion.div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center shadow-sm">
          <div className="max-w-xs mx-auto space-y-1.5 sm:space-y-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              {store ? 'No products yet' : 'Create a store first'}
            </h3>
            <p className="text-xs text-gray-600">
              {store ? 'Start building your inventory by adding your first product.' : 'You need to create a store before you can manage products.'}
            </p>
            {store && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setProductFormData({
                    name: '',
                    price: 0,
                    description: '',
                    images: [],
                    existingImages: [],
                    isAvailable: true,
                    discountPrice: 0,
                    stockCount: 0,
                    tags: [],
                  });
                  setEditingProductId(null);
                  setShowProductForm(true);
                }}
                className="bg-indigo-500 text-white px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                Add Your First Product
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RenderProductsManagement;