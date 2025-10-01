import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { X, ChevronDown, Instagram, Facebook, Twitter, Mail, Save, Loader2, Store, Palette, Globe, Phone, MapPin, Truck, StoreIcon, Home, Layout, Users, File } from 'lucide-react';
import { CreateStoreBody } from '@/store/useAppStore';

interface StoreFormProps {
  isEdit: boolean;
  formData: CreateStoreBody;
  setFormData: (data: CreateStoreBody) => void;
  setShowCreateForm: (show: boolean) => void;
  setShowEditForm: (show: boolean) => void;
  setEditingStoreId: (id: string | null) => void;
  handleFormSubmit: (e: FormEvent<HTMLFormElement>, isEdit: boolean) => void;
  isSubmitting: boolean;
}

const currencies = [
  { value: 'NGN', label: 'NGN - Naira' },
];

const templateOptions = [
  { value: 'modern', label: 'Modern' },
  { value: 'sleek', label: 'Sleek' },
];

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Jost', label: 'Jost' },
  { value: 'Geist', label: 'Geist' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Saira', label: 'Saira' },
];

const StoreForm: React.FC<StoreFormProps> = ({
  isEdit,
  formData,
  setFormData,
  setShowCreateForm,
  setShowEditForm,
  setEditingStoreId,
  handleFormSubmit,
  isSubmitting,
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { key: 'details', icon: Home, label: 'Details' },
    { key: 'design', icon: Layout, label: 'Design' },
    { key: 'connections', icon: Users, label: 'Connections' },
    { key: 'delivery', icon: Truck, label: 'Delivery' },
    { key: 'policies', icon: File, label: 'Policies' },
  ];

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFormSubmit(e, isEdit);
  };

  const updateTemplate = (value: string) => {
    setFormData({ ...formData, template: value });
  };

  const updateFont = (value: string) => {
    setFormData({ ...formData, font: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full bg-[#F3FFF4] backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl overflow-hidden mb-6 sm:mb-8"
    >
      {/* Close Button */}
      <div className="absolute top-3 right-3 z-20">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowCreateForm(false);
            setShowEditForm(false);
            setEditingStoreId(null);
            setFormData({ ...formData, name: '', slug: '', description: '' });
          }}
          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </div>

      {/* Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-6 bg-[#F3FFF4] border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">{isEdit ? 'Edit Store' : 'Create Store'}</h2>
        <p className="text-gray-500 text-sm text-center mt-1">Manage your store settings below</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex flex-wrap justify-center">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#C4FEC8] text-[#16A34A] border-b-2 border-[#16A34A]'
                  : 'text-gray-600 hover:text-[#16A34A] hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Store Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 focus:bg-white"
                      placeholder="My Amazing Store"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Store URL <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base font-medium pointer-events-none z-10">
                        https://
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: (e.target.value || '').toLowerCase() })}
                        className="w-full py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 focus:bg-white pl-14 sm:pl-18 pr-16 sm:pr-24"
                        placeholder="my-store"
                      />
                      <span className="absolute right-2 sm:right-3 top-1/2  transform -translate-y-1/2 text-gray-400 text-sm sm:text-base font-medium pointer-events-none">
                        .zeevo.store
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-2">
                      Choose a unique URL for your store
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 resize-none text-gray-800 bg-white/50 focus:bg-white"
                      placeholder="Tell customers about your store..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Template</label>
                    <select
                      value={formData.template || 'modern'}
                      onChange={(e) => updateTemplate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 bg-white/50 focus:bg-white"
                    >
                      {templateOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Font</label>
                    <select
                      value={formData.font || 'Inter'}
                      onChange={(e) => updateFont(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 bg-white/50 focus:bg-white"
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Primary Color</label>
                    <div className="bg-white/50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-4 border-white shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: formData.primaryColor || '#16A34A' }}
                        >
                          <input
                            type="color"
                            value={formData.primaryColor || '#16A34A'}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.primaryColor || ''}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm sm:text-base font-mono text-gray-800 p-0"
                            placeholder="#16A34A"
                          />
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">Main brand color</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Secondary Color</label>
                    <div className="bg-white/50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-4 border-white shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: formData.secondaryColor || '#C4FEC8' }}
                        >
                          <input
                            type="color"
                            value={formData.secondaryColor || '#C4FEC8'}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.secondaryColor || ''}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm sm:text-base font-mono text-gray-800 p-0"
                            placeholder="#C4FEC8"
                          />
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">Accent color</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Currency</label>
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCurrencyDropdown(!showCurrencyDropdown);
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl text-left flex justify-between items-center hover:border-gray-300 transition-all duration-200 bg-white/50 hover:bg-white"
                    >
                      <span className="text-gray-800 font-medium">
                        {currencies.find((c) => c.value === formData.currency)?.label || 'Select Currency'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`}
                      />
                    </motion.button>
                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute z-10 top-full left-0 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2 sm:p-3 bg-white/50 border-b border-gray-200">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800">Select Currency</h4>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {currencies.map((currency) => (
                              <motion.button
                                key={currency.value}
                                type="button"
                                whileHover={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({ ...formData, currency: currency.value });
                                  setShowCurrencyDropdown(false);
                                }}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left hover:bg-[#16A34A]/10 transition-colors duration-150 text-gray-800 font-medium border-b border-gray-200 last:border-b-0"
                              >
                                {currency.label}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'connections' && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4 sm:space-y-5">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Social Media</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-500' },
                        { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
                        { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-blue-400' },
                        { key: 'tiktok', icon: Globe, label: 'TikTok', color: 'text-gray-700' },
                      ].map((platform) => (
                        <div key={platform.key} className="bg-white/50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <platform.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${platform.color}`} />
                            <input
                              type="text"
                              value={formData.socialLinks?.[platform.key as keyof CreateStoreBody['socialLinks']] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  socialLinks: { ...formData.socialLinks, [platform.key]: e.target.value },
                                })
                              }
                              className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base placeholder-gray-400 p-0 text-gray-800"
                              placeholder={`${platform.label} URL`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Contact Information</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { key: 'email', icon: Mail, label: 'Email Address', type: 'email', color: 'text-red-500' },
                        { key: 'phone', icon: Phone, label: 'Phone Number', type: 'tel', color: 'text-green-500' },
                        { key: 'address', icon: MapPin, label: 'Address', type: 'text', color: 'text-blue-500' },
                      ].map((field) => (
                        <div key={field.key} className="bg-white/50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <field.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${field.color}`} />
                            <input
                              type={field.type}
                              value={formData.contact?.[field.key as keyof CreateStoreBody['contact']] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  contact: { ...formData.contact, [field.key]: e.target.value },
                                })
                              }
                              className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base placeholder-gray-400 p-0 text-gray-800"
                              placeholder={field.label}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Shipping</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {formData.shipping?.locations?.map((location, index) => (
                        <div key={index} className="bg-white/50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3">
                          <div className="space-y-2">
                            <input
                              type="text"
                              required
                              value={location.area || ''}
                              onChange={(e) => {
                                const newLocations = [...(formData.shipping?.locations || [])];
                                newLocations[index] = { ...newLocations[index], area: e.target.value };
                                setFormData({
                                  ...formData,
                                  shipping: { ...formData.shipping, locations: newLocations },
                                });
                              }}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50"
                              placeholder="Shipping Area (e.g., Lagos Mainland)"
                            />
                            <input
                              type="number"
                              required
                              value={location.fee || 0}
                              onChange={(e) => {
                                const newLocations = [...(formData.shipping?.locations || [])];
                                newLocations[index] = { ...newLocations[index], fee: parseFloat(e.target.value) };
                                setFormData({
                                  ...formData,
                                  shipping: { ...formData.shipping, locations: newLocations },
                                });
                              }}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50"
                              placeholder="Shipping Fee"
                            />
                            <textarea
                              value={location.note || ''}
                              onChange={(e) => {
                                const newLocations = [...(formData.shipping?.locations || [])];
                                newLocations[index] = { ...newLocations[index], note: e.target.value };
                                setFormData({
                                  ...formData,
                                  shipping: { ...formData.shipping, locations: newLocations },
                                });
                              }}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50"
                              placeholder="Shipping Note (e.g., Delivers in 2 days)"
                            />
                          </div>
                        </div>
                      ))}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            shipping: {
                              ...formData.shipping,
                              locations: [...(formData.shipping?.locations || []), { area: '', fee: 0 }],
                            },
                          });
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-[#16A34A] hover:text-[#15803D]"
                      >
                        Add Shipping Location
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Pickup</h4>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <input
                        type="checkbox"
                        checked={formData.pickup?.enabled || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickup: { ...formData.pickup, enabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A] bg-white/50 border-gray-200 rounded focus:ring-[#16A34A]"
                      />
                      <label className="text-sm sm:text-base text-gray-800">Enable Pickup</label>
                    </div>
                    {formData.pickup?.enabled && (
                      <div>
                        <textarea
                          value={formData.pickup?.note || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pickup: { enabled: formData.pickup?.enabled ?? false, note: e.target.value },
                            })
                          }
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50"
                          placeholder="Pickup Instructions (e.g., Pickup at store address)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'policies' && (
              <motion.div
                key="policies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Return Policy</label>
                    <textarea
                      value={formData.policies?.returns ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: { ...formData.policies, returns: e.target.value },
                        })
                      }
                      rows={4}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50"
                      placeholder="Enter your return policy..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">Terms & Conditions</label>
                    <textarea
                      value={formData.policies?.terms || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: { ...formData.policies, terms: e.target.value },
                        })
                      }
                      rows={4}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50"
                      placeholder="Enter your terms and conditions..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="bg-white/50 px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center sm:items-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowCreateForm(false);
                setShowEditForm(false);
                setEditingStoreId(null);
              }}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-sm sm:text-base transition-all duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#16A34A] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm sm:text-base transition-all duration-200 shadow-lg"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5" />}
              {isEdit ? 'Update Store' : 'Create Store'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default StoreForm;