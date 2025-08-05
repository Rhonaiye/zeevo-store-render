import { motion } from 'framer-motion';
import { Save, Loader2, X, Upload, Image as ImageIcon, Plus, Info } from 'lucide-react';
import React from 'react';
import { ProductFormData } from '@/store/useAppStore';

// Props interface for ProductForm component
interface ProductFormProps {
  storeId: string;
  isEdit: boolean;
  storeSlug: string;
  productFormData: ProductFormData;
  setProductFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  setShowProductForm: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingProductId: React.Dispatch<React.SetStateAction<string | null>>;
  handleAddProduct: (e: React.FormEvent, storeId: string, isEdit: boolean, storeSlug: string) => Promise<void>;
  isSubmitting: boolean;
}

// Price formatting utility
const formatPrice = (price: number): string => {
  if (isNaN(price) || price === 0) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Parse price from formatted string
const parsePrice = (value: string): number => {
  const numericValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
};

const ProductForm: React.FC<ProductFormProps> = ({
  storeId,
  isEdit,
  storeSlug,
  productFormData,
  setProductFormData,
  setShowProductForm,
  setEditingProductId,
  handleAddProduct,
  isSubmitting,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setProductFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageFiles],
      }));
    }
    
    e.target.value = '';
  };

  const addTag = () => {
    setProductFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), ''],
    }));
  };

  const updateTag = (index: number, value: string) => {
    setProductFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const removeTag = (index: number) => {
    setProductFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index),
    }));
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting && Array.isArray(productFormData.existingImages)) {
      setProductFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages?.filter((_, i) => i !== index) || [],
      }));
    } else if (Array.isArray(productFormData.images)) {
      setProductFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const resetForm = () => {
    setShowProductForm(false);
    setEditingProductId(null);
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
  };

  const handlePriceChange = (value: string, field: 'price' | 'discountPrice') => {
    const numericValue = parsePrice(value);
    setProductFormData(prev => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const currentPrice = productFormData.price || 0;
  const discountPrice = productFormData.discountPrice || 0;
  const savings = currentPrice > discountPrice && discountPrice > 0 ? currentPrice - discountPrice : 0;
  const savingsPercentage = savings > 0 ? Math.round((savings / currentPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 sm:p-4"
    >
      <div className="flex justify-between items-center mb-6 sm:mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 sm:text-lg">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your product details</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={resetForm}
          className="p-3 sm:p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
        >
          <X className="w-5 h-5 sm:w-4 sm:h-4" />
        </motion.button>
      </div>

      <form onSubmit={(e) => handleAddProduct(e, storeId, isEdit, storeSlug)} className="space-y-6 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-3">
          <div className="group">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Product Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              required
              value={productFormData.name || ''}
              onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
              className="w-full px-4 py-3 sm:px-3 sm:py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-base sm:text-base placeholder-gray-400 text-gray-900"
              placeholder="e.g. Wireless Bluetooth Headphones"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Give your product a clear, descriptive name that customers will search for
            </p>
          </div>
          <div className="group">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Price
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={productFormData.price || ''}
              onChange={(e) => handlePriceChange(e.target.value, 'price')}
              className="w-full px-4 py-3 sm:px-3 sm:py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-base sm:text-base placeholder-gray-400 text-gray-900"
              placeholder="29.99"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Regular selling price
              {currentPrice > 0 && (
                <span className="ml-2 text-gray-700 font-medium">({formatPrice(currentPrice)})</span>
              )}
            </p>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={productFormData.description || ''}
            onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 sm:px-3 sm:py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-base sm:text-base placeholder-gray-400 resize-none text-gray-900"
            placeholder="Describe your product's features, benefits, and what makes it special..."
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Help customers understand what they're buying with detailed product information
          </p>
        </div>

        <div className="group">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Product Images</label>
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <motion.label
              htmlFor="image-upload"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-6 sm:p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200 flex flex-col items-center gap-2 text-gray-500 hover:text-gray-600 cursor-pointer"
            >
              <Upload className="w-8 h-8 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-base font-medium">Click to upload images</span>
              <span className="text-sm sm:text-base">PNG, JPG, JPEG up to 3MB each</span>
            </motion.label>
          </div>
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Upload multiple high-quality images showing different angles and details of your product
          </p>
          {((Array.isArray(productFormData.existingImages) && productFormData.existingImages.length > 0) ||
            (Array.isArray(productFormData.images) && productFormData.images.length > 0)) && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-3">
              {Array.isArray(productFormData.existingImages) &&
                productFormData.existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={imageUrl} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="absolute -top-2 -right-2 p-2 sm:p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4 sm:w-3 sm:h-3" />
                    </motion.button>
                  </div>
                ))}
              {Array.isArray(productFormData.images) &&
                productFormData.images.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeImage(index, false)}
                      className="absolute -top-2 -right-2 p-2 sm:p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4 sm:w-3 sm:h-3" />
                    </motion.button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm sm:text-xs px-2 py-1 rounded">
                      New
                    </div>
                  </div>
                ))}
            </div>
          )}
          {(!Array.isArray(productFormData.images) || productFormData.images.length === 0) &&
            (!Array.isArray(productFormData.existingImages) || productFormData.existingImages.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon className="w-14 h-14 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
              <p className="text-base sm:text-base">No images uploaded yet</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-3">
          <div className="group">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Sale Price (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={productFormData.discountPrice || ''}
              onChange={(e) => handlePriceChange(e.target.value, 'discountPrice')}
              className="w-full px-4 py-3 sm:px-3 sm:py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-base sm:text-base placeholder-gray-400 text-gray-900"
              placeholder="19.99"
            />
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                Set a lower price to offer a discount
              </div>
              {currentPrice > 0 && (
                <div className="bg-blue-50 p-2 rounded text-blue-700 border border-blue-200">
                  <div className="font-medium">Regular Price: {formatPrice(currentPrice)}</div>
                  {discountPrice > 0 && discountPrice < currentPrice && (
                    <div className="text-green-600 font-medium">
                      Customer save's: {formatPrice(savings)} ({savingsPercentage}% off)
                    </div>
                  )}
                  {discountPrice > 0 && discountPrice >= currentPrice && (
                    <div className="text-red-600 font-medium">Sale price should be lower than regular price</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="group">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={productFormData.stockCount || ''}
              onChange={(e) => setProductFormData({ ...productFormData, stockCount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 sm:px-3 sm:py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-base sm:text-base placeholder-gray-400 text-gray-900"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              How many units do you have available? Set to 0 for unlimited stock
            </p>
          </div>
        </div>

        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">Tags</label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={addTag}
              className="flex items-center gap-1 text-sm sm:text-base text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 sm:px-2 sm:py-1 rounded-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
              Add Tag
            </motion.button>
          </div>
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Add tags to help customers find your product (e.g., "wireless", "portable", "gift")
          </p>
          {(!Array.isArray(productFormData.tags) || productFormData.tags.length === 0) ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={addTag}
              className="w-full p-4 sm:p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-600"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-base sm:text-base">Add your first tag</span>
            </motion.button>
          ) : (
            <div className="space-y-2">
              {productFormData.tags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={tag || ''}
                    onChange={(e) => updateTag(index, e.target.value)}
                    className="flex-1 px-4 py-3 sm:px-3 sm:py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-base sm:text-base placeholder-gray-400 text-gray-900"
                    placeholder={`Tag ${index + 1} (e.g., electronics, gift)`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => removeTag(index)}
                    className="p-3 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 sm:w-4 sm:h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="group">
          <label className="flex items-center gap-3 text-sm sm:text-base font-medium text-gray-700 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={productFormData.isAvailable ?? true}
              onChange={(e) => setProductFormData({ ...productFormData, isAvailable: e.target.checked })}
              className="h-5 w-5 sm:h-4 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <div className="font-medium">Available for Sale</div>
              <div className="text-xs text-gray-500 mt-1">Customers can purchase this product when enabled</div>
            </div>
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-900 text-white px-6 py-3 sm:px-4 sm:py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-base sm:text-base transition-all duration-200"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-3 sm:h-3 animate-spin" /> : <Save className="w-4 h-4 sm:w-3 sm:h-3" />}
            {isEdit ? 'Update Product' : 'Add Product'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={resetForm}
            className="px-6 py-3 sm:px-4 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-base sm:text-base transition-all duration-200"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;