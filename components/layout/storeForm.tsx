import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent } from 'react';
import { X, ChevronDown, Instagram, Facebook, Twitter, Mail, Save, Loader2 } from 'lucide-react';
import { FormData } from '@/store/useAppStore';

interface Currency {
  value: string;
  label: string;
}

interface StoreFormProps {
  isEdit: boolean;
  formData: FormData;
  setFormData: (data: FormData) => void;
  setShowCreateForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
  setEditingStoreId: (id: string | null) => void;
  handleFormSubmit: (e: FormEvent, isEdit: boolean) => void;
  showCurrencyDropdown: boolean;
  setShowCurrencyDropdown: (show: boolean) => void;
  isSubmitting: boolean;
}

const currencies = [
  { value: 'USD', label: 'USD - Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - Pound' },
  { value: 'NGN', label: 'NGN - Naira' },
];

const StoreForm: React.FC<StoreFormProps> = ({
  isEdit,
  formData,
  setFormData,
  setShowCreateForm,
  setShowEditForm,
  setEditingStoreId,
  handleFormSubmit,
  showCurrencyDropdown,
  setShowCurrencyDropdown,
  isSubmitting,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Store' : 'Create Store'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Set shop details, to explore</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowCreateForm(false);
            setShowEditForm(false);
            setEditingStoreId(null);
            setFormData({ ...formData, name: '', slug: '', description: '' });
          }}
          className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      <form onSubmit={(e) => handleFormSubmit(e, isEdit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-xs font-medium text-gray-700 mb-2">Store Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-sm placeholder-gray-400 text-gray-900"
              placeholder="My Store"
            />
          </div>
          <div className="group">
            <label className="block text-xs font-medium text-gray-700 mb-2">Store Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-sm placeholder-gray-400 text-gray-900"
              placeholder="my-store"
            />
            <p className="text-xs text-gray-400 mt-1">
              yoursite.com/{formData.slug || 'store-slug'}
            </p>
          </div>
        </div>

        <div className="group">
          <label className="block text-xs font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200 text-sm placeholder-gray-400 resize-none text-gray-900"
            placeholder="Store description"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Brand Colors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-xs font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="relative">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs font-mono text-gray-900 p-0"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="relative">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 text-xs font-mono text-gray-900 p-0"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-medium text-gray-700 mb-2">Currency</label>
          <motion.button
            type="button"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-left flex justify-between items-center text-sm hover:border-gray-300 transition-all duration-200 bg-white"
          >
            <span className="text-gray-900">
              {currencies.find((c) => c.value === formData.currency)?.label || 'Select Currency'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {showCurrencyDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="max-h-48 overflow-y-auto">
                  {currencies.map((currency) => (
                    <motion.button
                      key={currency.value}
                      type="button"
                      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                      onClick={() => {
                        setFormData({ ...formData, currency: currency.value });
                        setShowCurrencyDropdown(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors duration-150 text-gray-900"
                    >
                      {currency.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-medium text-gray-700">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['instagram', 'facebook', 'twitter', 'tiktok'].map((platform) => (
              <div key={platform} className="group">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 min-h-[48px]">
                  <div className="flex-shrink-0">
                    {platform === 'instagram' && <Instagram className="w-5 h-5 text-gray-500" />}
                    {platform === 'facebook' && <Facebook className="w-5 h-5 text-gray-500" />}
                    {platform === 'twitter' && <Twitter className="w-5 h-5 text-gray-500" />}
                  </div>
                  <input
                    type="text"
                    value={formData.socialLinks[platform as keyof FormData['socialLinks']]}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, [platform]: e.target.value },
                    })}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 p-0 text-gray-900"
                    placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-medium text-gray-700">Contact Information</label>
          <div className="space-y-3">
            {['email', 'phone', 'address'].map((field) => (
              <div key={field} className="group">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 min-h-[48px]">
                  <div className="flex-shrink-0">
                    {field === 'email' && <Mail className="w-5 h-5 text-gray-500" />}
                    {field === 'phone' && (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    {field === 'address' && (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    value={formData.contact[field as keyof FormData['contact']]}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, [field]: e.target.value },
                    })}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 p-0 text-gray-900"
                    placeholder={`Contact ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-200"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {isEdit ? 'Update' : 'Create'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              setShowCreateForm(false);
              setShowEditForm(false);
              setEditingStoreId(null);
            }}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default StoreForm;