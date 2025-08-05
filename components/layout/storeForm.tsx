import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { X, ChevronDown, Instagram, Facebook, Twitter, Mail, Save, Loader2, Store, Palette, Globe, Phone, MapPin, Truck, StoreIcon } from 'lucide-react';
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
  isSubmitting,
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 0, title: 'Store Details', icon: Store },
    { id: 1, title: 'Brand & Style', icon: Palette },
    { id: 2, title: 'Social & Contact', icon: Globe },
    { id: 3, title: 'Shipping & Pickup', icon: Truck },
    { id: 4, title: 'Policies', icon: StoreIcon },
  ];

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFormSubmit(e, isEdit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full mx-auto bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-200 shadow-2xl overflow-hidden mb-8"
    >
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-20">
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
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-3 bg-white/50 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-100/50 text-blue-800'
                    : 'text-gray-600 hover:text-blue-800'
                }`}
              >
                <section.icon className="w-4 h-4 mb-1" />
                <span className="text-sm font-medium hidden sm:block sm:text-xs lg:text-[0.65rem]">{section.title}</span>
              </motion.button>
              {index < sections.length - 1 && (
                <div className="w-6 h-0.5 bg-gray-200 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div
                key="store-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 sm:text-lg lg:text-base">Store Information</h3>
                  <p className="text-gray-500 text-sm sm:text-xs lg:text-[0.65rem]">Tell us about your store</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Store Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 focus:bg-white sm:text-sm lg:text-[0.75rem]"
                      placeholder="My Amazing Store"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Store URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base font-medium pointer-events-none z-10 sm:text-sm lg:text-[0.75rem]">
                        https://
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 focus:bg-white pl-16 pr-24 sm:text-sm lg:text-[0.75rem]"
                        placeholder="my-store"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base font-medium pointer-events-none sm:text-sm lg:text-[0.75rem]">
                        .zeevo.store
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-2 sm:text-xs lg:text-[0.65rem]">
                      Choose a unique URL for your store
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 resize-none text-gray-800 bg-white/50 focus:bg-white sm:text-sm lg:text-[0.75rem]"
                      placeholder="Tell customers about your store..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 1 && (
              <motion.div
                key="brand-style"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 sm:text-lg lg:text-base">Brand & Style</h3>
                  <p className="text-gray-500 text-sm sm:text-xs lg:text-[0.65rem]">Customize your store's appearance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Primary Color</label>
                    <div className="bg-white/50 border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg border-4 border-white shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: formData.primaryColor || '#ffffff' }}
                        >
                          <input
                            type="color"
                            value={formData.primaryColor || '#ffffff'}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.primaryColor || ''}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-lg font-mono text-gray-800 p-0 sm:text-base lg:text-[0.75rem]"
                            placeholder="#ffffff"
                          />
                          <p className="text-sm text-gray-500 mt-1 sm:text-xs lg:text-[0.65rem]">Main brand color</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Secondary Color</label>
                    <div className="bg-white/50 border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg border-4 border-white shadow-lg cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: formData.secondaryColor || '#ffffff' }}
                        >
                          <input
                            type="color"
                            value={formData.secondaryColor || '#ffffff'}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.secondaryColor || ''}
                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-lg font-mono text-gray-800 p-0 sm:text-base lg:text-[0.75rem]"
                            placeholder="#ffffff"
                          />
                          <p className="text-sm text-gray-500 mt-1 sm:text-xs lg:text-[0.65rem]">Accent color</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Currency</label>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCurrencyDropdown(!showCurrencyDropdown);
                    }}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl text-left flex justify-between items-center hover:border-gray-300 transition-all duration-200 bg-white/50 hover:bg-white sm:text-base lg:text-[0.75rem]"
                  >
                    <span className="text-gray-800 font-medium">
                      {currencies.find((c) => c.value === formData.currency)?.label || 'Select Currency'}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`}
                    />
                  </motion.button>
                  <AnimatePresence>
                    {showCurrencyDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCurrencyDropdown(false)}
                      >
                        <div
                          className="bg-white/90 border-2 border-gray-200 rounded-lg shadow-2xl w-full max-w-xs overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-3 bg-white/50 border-b border-gray-200">
                            <h4 className="text-base font-semibold text-gray-800 sm:text-sm lg:text-[0.75rem]">Select Currency</h4>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {currencies.map((currency) => (
                              <motion.button
                                key={currency.value}
                                type="button"
                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({ ...formData, currency: currency.value });
                                  setShowCurrencyDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left text-base hover:bg-blue-500/10 transition-colors duration-150 text-gray-800 font-medium border-b border-gray-200 last:border-b-0 sm:text-sm lg:text-[0.75rem]"
                              >
                                {currency.label}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeSection === 2 && (
              <motion.div
                key="social-contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 sm:text-lg lg:text-base">Connect With Customers</h3>
                  <p className="text-gray-500 text-sm sm:text-xs lg:text-[0.65rem]">Add your social media and contact information</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 sm:text-base lg:text-sm">Social Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-500' },
                        { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
                        { key: 'twitter', icon: Twitter, label: 'Twitter', color: 'text-blue-400' },
                        { key: 'tiktok', icon: Globe, label: 'TikTok', color: 'text-gray-700' },
                      ].map((platform) => (
                        <div key={platform.key} className="bg-white/50 border-2 border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <platform.icon className={`w-6 h-6 ${platform.color}`} />
                            <input
                              type="text"
                              value={formData.socialLinks?.[platform.key as keyof CreateStoreBody['socialLinks']] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  socialLinks: { ...formData.socialLinks, [platform.key]: e.target.value },
                                })
                              }
                              className="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400 p-0 text-gray-800 sm:text-base lg:text-[0.75rem]"
                              placeholder={`${platform.label} URL`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 sm:text-base lg:text-sm">Contact Information</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'email', icon: Mail, label: 'Email Address', type: 'email', color: 'text-red-500' },
                        { key: 'phone', icon: Phone, label: 'Phone Number', type: 'tel', color: 'text-green-500' },
                        { key: 'address', icon: MapPin, label: 'Address', type: 'text', color: 'text-blue-500' },
                      ].map((field) => (
                        <div key={field.key} className="bg-white/50 border-2 border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <field.icon className={`w-6 h-6 ${field.color}`} />
                            <input
                              type={field.type}
                              value={formData.contact?.[field.key as keyof CreateStoreBody['contact']] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  contact: { ...formData.contact, [field.key]: e.target.value },
                                })
                              }
                              className="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400 p-0 text-gray-800 sm:text-base lg:text-[0.75rem]"
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

            {activeSection === 3 && (
              <motion.div
                key="shipping-pickup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 sm:text-lg lg:text-base">Shipping & Pickup</h3>
                  <p className="text-gray-500 text-sm sm:text-xs lg:text-[0.65rem]">Configure shipping and pickup options</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 sm:text-base lg:text-sm">Shipping</h4>
                    <div className="space-y-3">
                      {formData.shipping?.locations?.map((location, index) => (
                        <div key={index} className="bg-white/50 border-2 border-gray-200 rounded-xl p-3">
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
                              className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 sm:text-sm lg:text-[0.75rem]"
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
                              className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 sm:text-sm lg:text-[0.75rem]"
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
                              className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 sm:text-sm lg:text-[0.75rem]"
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
                        className="px-4 py-2 text-base text-blue-500 hover:text-blue-600 sm:text-sm lg:text-[0.75rem]"
                      >
                        Add Shipping Location
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 sm:text-base lg:text-sm">Pickup</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.pickup?.enabled || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickup: { ...formData.pickup, enabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-blue-500 bg-white/50 border-gray-200 rounded focus:ring-blue-500"
                      />
                      <label className="text-base text-gray-800 sm:text-sm lg:text-[0.75rem]">Enable Pickup</label>
                    </div>
                    {formData.pickup?.enabled && (
                      <div>
                        <textarea
                          value={formData.pickup?.note || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              // @ts-ignore
                              pickup: { ...formData.pickup, note: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 sm:text-sm lg:text-[0.75rem]"
                          placeholder="Pickup Instructions (e.g., Pickup at store address)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 4 && (
              <motion.div
                key="policies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 sm:text-lg lg:text-base">Store Policies</h3>
                  <p className="text-gray-500 text-sm sm:text-xs lg:text-[0.65rem]">Define your store's policies</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Return Policy</label>
                    <textarea
                      value={formData.policies?.returns ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: { ...formData.policies, returns: e.target.value },
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 sm:text-sm lg:text-[0.75rem]"
                      placeholder="Enter your return policy..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 sm:text-xs lg:text-[0.65rem]">Terms & Conditions</label>
                    <textarea
                      value={formData.policies?.terms || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: { ...formData.policies, terms: e.target.value },
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-gray-800 bg-white/50 sm:text-sm lg:text-[0.75rem]"
                      placeholder="Enter your terms and conditions..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="bg-white/50 px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="flex gap-2">
              {activeSection > 0 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(activeSection - 1)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-lg sm:text-base lg:text-[0.75rem] transition-all duration-200"
                >
                  Previous
                </motion.button>
              )}
              {activeSection < sections.length - 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(activeSection + 1)}
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-lg sm:text-base lg:text-[0.75rem] transition-all duration-200"
                >
                  Next
                </motion.button>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setEditingStoreId(null);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-lg sm:text-base lg:text-[0.75rem] transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-lg sm:text-base lg:text-[0.75rem] transition-all duration-200 shadow-lg"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEdit ? 'Update Store' : 'Create Store'}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default StoreForm;