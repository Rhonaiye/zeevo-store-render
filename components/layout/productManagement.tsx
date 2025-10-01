'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Package, Search, Star, TrendingUp, Filter, ChevronDown, X, XCircle } from 'lucide-react';
import { Store, ProductFormData, Product, useAppStore, UserProfile } from '@/store/useAppStore';
import ProductForm from './productForm';
import Cookies from 'js-cookie';

// Props interface for RenderProducts component
interface RenderProductsProps {
  addNotification: (message: string, type: 'success' | 'error', duration?: number) => void;
  fetchUserProfile: () => Promise<UserProfile | null>;
}

// Delete Confirmation Modal Props
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, productName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete Product</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{productName}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-2 sm:gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Product Form Modal Wrapper for better mobile handling
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isEdit: boolean;
  title: string;
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
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stockCount' | 'isAvailable'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'unavailable'>('all');
  // New state for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  // Responsive state for mobile
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync localProducts with userProfile.stores when it changes
  useEffect(() => {
    if (userProfile?.stores && userProfile.stores.length > 0) {
      setLocalProducts(userProfile.stores[0]?.products || []);
    } else {
      setLocalProducts([]);
    }
  }, [userProfile]);

  const store = userProfile?.stores?.[0];

  // Filtered and sorted products
  const getFilteredAndSortedProducts = () => {
    let products = [...localProducts].filter(product =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterAvailable !== 'all') {
      products = products.filter(product => 
        (filterAvailable === 'available' && product.isAvailable) ||
        (filterAvailable === 'unavailable' && !product.isAvailable)
      );
    }

    return products.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'isAvailable') {
        aVal = a.isAvailable ? 1 : 0;
        bVal = b.isAvailable ? 1 : 0;
      } else if (sortBy === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }
      // Ensure aVal and bVal are not undefined for comparison
      const aComp = aVal !== undefined && aVal !== null ? aVal : '';
      const bComp = bVal !== undefined && bVal !== null ? bVal : '';
      if (aComp < bComp) return sortDirection === 'asc' ? -1 : 1;
      if (aComp > bComp) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredProducts = getFilteredAndSortedProducts();

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
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/edit/${editingProductId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/create/${storeSlug}`;

      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Let the browser set the Content-Type for FormData to include the boundary
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/delete/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok){
        console.log(await response.json())
        throw new Error('Failed to delete product')
      };

      // Fetch updated user profile
      await fetchUserProfile();

      addNotification('Product deleted successfully', 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}`, 'error');
    }
  };

  // New function to open delete modal
  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // New function to confirm delete
  const confirmDelete = () => {
    if (productToDelete) {
      handleDeleteProduct(store?._id || '', productToDelete._id);
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
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

  const handleSort = (key: 'name' | 'price' | 'stockCount' | 'isAvailable') => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const modalTitle = editingProductId ? 'Edit Product' : 'Add Product';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-2 sm:p-4 bg-[#EFFBF0]"
    >
      {/* Top Bar - Compact header with stats and actions */}
      <div className="bg-[] rounded-lg shadow-sm p-3 sm:p-4 mb-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#03E525] rounded-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Products Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage and optimize your inventory</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-end w-full sm:w-auto">
            <div className="flex gap-2 text-xs sm:text-sm text-gray-600 w-full sm:w-auto justify-center sm:justify-start">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                {localProducts.length} Total
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                {localProducts.filter(p => p.isAvailable).length} Active
              </span>
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
                className="w-full sm:w-auto bg-gradient-to-r from-[#069F44] to-[#04DB2A] text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Add Product
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Product Form - Enhanced responsive modal wrapper - Render only when showProductForm is true */}
      {store && showProductForm && (
      
          <ProductForm
            storeId={store._id}
          
            isEdit={!!editingProductId}
            storeSlug={store.slug}
            productFormData={productFormData}
            setProductFormData={setProductFormData}
            setShowProductForm={setShowProductForm}
            setEditingProductId={setEditingProductId}
            handleAddProduct={handleAddProduct}
            isSubmitting={isSubmitting}
          />

      )}

      {/* Controls: Search and Filters - Stacked on mobile */}
      {!showProductForm && store && (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center md:justify-end">
              <button
                onClick={() => setFilterAvailable('all')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterAvailable === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterAvailable('available')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterAvailable === 'available' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterAvailable('unavailable')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterAvailable === 'unavailable' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Conditional Table or Card View based on mobile */}
      {!showProductForm && store && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              {isMobile ? (
                // Mobile: Stacked Card View
                <div className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images && product.images.length > 0 ? (
                              <img className="h-12 w-12 rounded-full object-cover" src={product.images[0]} alt="" />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            {product.tags && product.tags.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1 truncate">{product.tags.join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.isAvailable ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-medium text-gray-900">
                            {store.currency || 'USD'} {product.price.toFixed(2)}
                          </p>
                          {product.discountPrice && product.discountPrice > 0 && (
                            <p className="text-xs text-green-600">Disc: {product.discountPrice.toFixed(2)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Stock</p>
                          <p className="font-medium text-gray-900">{product.stockCount || 0}</p>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleProductAvailability(product._id, product.isAvailable)}
                          className={`p-1 rounded-md transition-colors text-sm ${
                            product.isAvailable
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {product.isAvailable ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleEditProduct(store._id, product)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => openDeleteModal(product)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Desktop: Table View
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-1 hover:text-gray-700"
                          >
                            Product
                            <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'name' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('price')}
                            className="flex items-center gap-1 hover:text-gray-700"
                          >
                            Price
                            <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'price' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('stockCount')}
                            className="flex items-center gap-1 hover:text-gray-700"
                          >
                            Stock
                            <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'stockCount' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('isAvailable')}
                            className="flex items-center gap-1 hover:text-gray-700"
                          >
                            Status
                            <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'isAvailable' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {product.images && product.images.length > 0 ? (
                                  <img className="h-10 w-10 rounded-full object-cover" src={product.images[0]} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.tags && product.tags.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {product.tags.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {store.currency || 'USD'} {product.price.toFixed(2)}
                            {product.discountPrice && product.discountPrice > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                Disc: {product.discountPrice.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.stockCount || 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.isAvailable ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                            <p className="line-clamp-2">{product.description}</p>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleProductAvailability(product._id, product.isAvailable)}
                                className={`p-1 rounded-md transition-colors ${
                                  product.isAvailable
                                    ? 'text-green-600 hover:bg-green-100'
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleEditProduct(store._id, product)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => openDeleteModal(product)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {(!isMobile || filteredProducts.length > 0) && (
                <div className="px-4 py-3 bg-gray-50 text-right text-xs sm:text-sm text-gray-500">
                  Showing {filteredProducts.length} of {localProducts.length} products
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{store ? 'No products' : 'Create a store first'}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {store ? 'Get started by creating a new product.' : 'You need to create a store before you can manage products.'}
              </p>
              {store && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
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
                  className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Add Product
                </motion.button>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal - Adjusted for mobile */}
      {store && productToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          productName={productToDelete.name}
        />
      )}
    </motion.div>
  );
};

export default RenderProductsManagement;