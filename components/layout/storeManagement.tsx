import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, Link, Trash2, Palette, Mail, Package, ChevronDown, Instagram, Facebook, Twitter, Edit3, BarChart3, Eye, Globe, X, Layout, Type } from 'lucide-react';
import { FC, JSX, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import DeleteStoreConfirmation from '../ui/deleteStore';
import { Store as IStore, Product } from '@/store/useAppStore';
import StoreForm from './storeForm';
import ModernStoreTemplate from '../template/page';
import CustomDropdown from '../ui/dropDown';
import SleekStoreTemplate from '../template/template2';


interface RenderStoreManagementProps {
  stores: IStore[];
  showCreateForm: boolean;
  showEditForm: boolean;
  showProductForm: boolean;
  editingProductId?: string;
  isSubmitting: boolean;
  expandedSection: string | null;
  setShowCreateForm: (value: boolean) => void;
  setShowEditForm: (value: boolean) => void;
  setShowProductForm: (value: boolean) => void;
  setExpandedSection: (section: string | null) => void;
  handleCopyStoreUrl: (slug: string) => void;
  handleDeleteStore: (storeId: string) => void;
  handleEditStore: (store: IStore) => void;
  handleEditProduct: (storeId: string, product: Product) => void;
  handleDeleteProduct: (storeId: string, productId: string) => void;
  setIsSubmitting: (value: any) => any;
  setStores: (value: any) => any;
  addNotification: (value: any, value2: any) => any;
  setEditingStoreId: (value: string) => any;
  setFormData: (value: any) => any;
  formData: any;
  handleFormSubmit: any;
  showCurrencyDropdown: any;
  setShowCurrencyDropdown: (value: boolean)=> any
}

const ColorSelector = ({ color, label }: { color?: string; label: string }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded-md shadow-sm border-2 border-white ring-1 ring-gray-200 flex-shrink-0" 
        style={{ backgroundColor: color || '#6366F1' }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-900 truncate">{color || '#6366F1'}</div>
        <div className="text-xs text-gray-500">Tap to change</div>
      </div>
    </div>
  </div>
);

// Custom debounce function
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
};

const RenderStoreManagement: FC<RenderStoreManagementProps> = ({
  stores,
  showCreateForm,
  showEditForm,
  showProductForm,
  editingProductId,
  isSubmitting,
  expandedSection,
  setShowCreateForm,
  setStores,
  setIsSubmitting,
  setShowProductForm,
  setExpandedSection,
  handleCopyStoreUrl,
  setEditingStoreId,
  setFormData,
  formData,
  setShowEditForm,
  addNotification,
  handleFormSubmit,
  showCurrencyDropdown,
  setShowCurrencyDropdown
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showVisibilityConfirmation, setShowVisibilityConfirmation] = useState<string | null>(null);
  const [pendingVisibilityState, setPendingVisibilityState] = useState<boolean | null>(null);
  const [customDomain, setCustomDomain] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState<IStore | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<{ storeId: string; template: string; font: string } | null>(null);

  const templateOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'sleek', label: 'sleek' },
  ];

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Jost', label: 'Jost' },
    { value: 'Geist', label: 'Geist' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Saira', label: 'Saira'}
  ];

  // Load Google Font for preview modal
  useEffect(() => {
    if (showPreviewModal?.font) {
      const fontName = showPreviewModal.font.replace(/\s+/g, '+'); // Replace spaces with '+' for Google Fonts URL
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Cleanup on unmount or when modal closes
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [showPreviewModal?.font]);

  const handleOpenDeleteConfirmation = (store: IStore) => {
    setSelectedStore(store);
    setShowDeleteConfirmation(true);
  };

  const handleEditStore = (store: IStore) => {
    setEditingStoreId(store._id);
    setFormData({
      name: store.name || '',
      slug: store.slug || '',
      description: store.description || '',
      primaryColor: store.primaryColor || '#3B82F6',
      secondaryColor: store.secondaryColor || '#1F2937',
      currency: store.currency || 'USD',
      domain: store.domain || '',
      template: store.template || 'modern',
      font: store.font || 'Inter',
      socialLinks: {
        instagram: store.socialLinks?.instagram || '',
        facebook: store.socialLinks?.facebook || '',
        twitter: store.socialLinks?.twitter || '',
        tiktok: store.socialLinks?.tiktok || '',
      },
      contact: {
        email: store.contact?.email || '',
        phone: store.contact?.phone || '',
        address: store.contact?.address || '',
      },
    });
    setShowEditForm(true);
  };

  const handleDeleteStore = async (storeId: string) => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Authentication error. Please log in again.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/delete/${storeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Delete failed');
      setStores(stores.filter((store) => store._id !== storeId));
      addNotification(`Store deleted successfully`, 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedStore) {
      handleDeleteStore(selectedStore._id);
      setShowDeleteConfirmation(false);
      setSelectedStore(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedStore(null);
  };

  // Retry logic for failed requests
  const retryFetch = async (url: string, options: RequestInit, retries: number = 3, delay: number = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 429) {
          const waitTime = (i + 1) * delay;
          addNotification(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`, 'warning');
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === retries - 1) throw error;
      }
    }
    throw new Error('Max retries reached');
  };

  // Handle custom domain submission
  const handleCustomDomainSubmit = async (storeId: string) => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Authentication error. Please log in again.', 'error');
      return;
    }

    if (!customDomain || !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(customDomain)) {
      addNotification('Please enter a valid domain (e.g., example.com)', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await retryFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/update/${storeId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ domain: customDomain }),
        }
      );

      if (!response.ok) throw new Error('Failed to update domain');

      const updatedStore: IStore = await response.json();
      setStores(
        stores.map((store) =>
          store._id === storeId ? { ...updatedStore, products: store.products || [] } : store
        )
      );
      addNotification('Custom domain added successfully', 'success');
      setCustomDomain('');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle appearance settings (template and font) update
  const handleUpdateAppearance = async (storeId: string, template: string, font: string) => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Authentication error. Please log in again.', 'error');
      return;
    }

    const previousStores = [...stores];
    setStores(
      stores.map((store) =>
        store._id === storeId ? { ...store, template, font } : store
      )
    );

    try {
      setIsSubmitting(true);
      const response = await retryFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/update/appearance/${storeId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ template, font }),
        }
      );

      if (!response.ok) throw new Error('Failed to update appearance');

      const updatedStore: IStore = await response.json();
      setStores(
        stores.map((store) =>
          store._id === storeId ? { ...updatedStore, products: store.products || [] } : store
        )
      );
      addNotification('Appearance settings updated successfully', 'success');
      setAppearanceSettings(null);
    } catch (error: unknown) {
      const err = error as Error;
      setStores(previousStores);
      addNotification(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debounced toggle visibility function
  const handleToggleStoreVisibility = useCallback(
    debounce(async (storeId: string, currentStatus: boolean) => {
      const token = Cookies.get('token');
      if (!token) {
        addNotification('Authentication error. Please log in again.', 'error');
        return;
      }

      // Optimistic update
      const previousStores = [...stores];
      setStores(
        stores.map((store) =>
          store._id === storeId ? { ...store, isPublished: !currentStatus } : store
        )
      );

      try {
        setIsSubmitting(true);
        const response = await retryFetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/toggle/visibility/${storeId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 450 || (response.status === 403 && (await response.json()).code === 'UPGRADE_REQUIRED')) {
          setStores(previousStores); // Rollback on failure
          addNotification('Upgrade to Pro to toggle store visibility.', 'error');
          return;
        }

        if (!response.ok) throw new Error('Toggle failed');

        const updatedStore: IStore = await response.json();
        setStores(
          stores.map((store) =>
            store._id === storeId ? { ...updatedStore, products: store.products || [] } : store
          )
        );

        addNotification(
          `Store has been ${!currentStatus ? 'published' : 'hidden'} successfully.`,
          'success'
        );
      } catch (error: unknown) {
        const err = error as Error;
        setStores(previousStores); // Rollback on failure
        addNotification(`Error: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
        setShowVisibilityConfirmation(null);
        setPendingVisibilityState(null);
      }
    }, 500), // 500ms debounce delay
    [stores, setStores, addNotification, setIsSubmitting]
  );

  // Handle visibility toggle with confirmation
  const handleToggleWithConfirmation = (storeId: string, currentStatus: boolean) => {
    setShowVisibilityConfirmation(storeId);
    setPendingVisibilityState(!currentStatus);
  };

  const confirmVisibilityToggle = () => {
    if (showVisibilityConfirmation && pendingVisibilityState !== null) {
      handleToggleStoreVisibility(showVisibilityConfirmation, !pendingVisibilityState);
    }
  };

  const cancelVisibilityToggle = () => {
    setShowVisibilityConfirmation(null);
    setPendingVisibilityState(null);
  };

  // Handle preview button click
  const handlePreviewStore = (store: IStore) => {
    setShowPreviewModal(store);
  };

  if (showCreateForm || showEditForm) {
    return (
      <AnimatePresence>
        {showCreateForm && <StoreForm
          isEdit={false}
          formData={formData}
          setFormData={setFormData}
          setShowCreateForm={setShowCreateForm}
          setShowEditForm={setShowEditForm}
          setEditingStoreId={setEditingStoreId}
          handleFormSubmit={handleFormSubmit}
          showCurrencyDropdown={showCurrencyDropdown}
          setShowCurrencyDropdown={setShowCurrencyDropdown}
          isSubmitting={isSubmitting}
        />}
        {showEditForm && <StoreForm
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          setShowCreateForm={setShowCreateForm}
          setShowEditForm={setShowEditForm}
          setEditingStoreId={setEditingStoreId}
          handleFormSubmit={handleFormSubmit}
          showCurrencyDropdown={showCurrencyDropdown}
          setShowCurrencyDropdown={setShowCurrencyDropdown}
          isSubmitting={isSubmitting}
        />}
     
      </AnimatePresence>
    );
  }

  if (stores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Create your first store</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto leading-relaxed">Get started by creating your online store and start selling your products.</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          Create Store
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:px-0">
      {stores.length < 1 && (
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden xs:inline">Create Store</span>
            <span className="xs:hidden">Create</span>
          </motion.button>
        </div>
      )}

      {stores.map((store) => {
        // Define sections inside the map to access store
        const sections = [
          { key: 'appearance', icon: Layout, label: 'Appearance' },
          { key: 'branding', icon: Palette, label: 'Branding' },
          { key: 'social', icon: Link, label: 'Social Links' },
          { key: 'contact', icon: Mail, label: 'Contact Info' },
          { key: 'domain', icon: Globe, label: 'Custom Domain', hidden: !!store.domain },
          { key: 'products', icon: Package, label: 'Products' }
        ];

        return (
          <motion.div
            key={store._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Store Header */}
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${store.primaryColor || '#6366F1'}, ${store.secondaryColor || '#8B5CF6'})` 
                    }}
                  >
                    <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{store.name}</h3>
                    <p className="text-xs text-gray-500 font-mono truncate">/{store.slug}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="relative">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={store.isPublished}
                            onChange={() => handleToggleWithConfirmation(store._id, store.isPublished)}
                            disabled={isSubmitting}
                            className="sr-only peer"
                            onMouseEnter={() => setShowTooltip(store._id)}
                            onMouseLeave={() => setShowTooltip(null)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                          <span className="ml-2 text-xs font-medium text-gray-700">
                            {store.isPublished ? 'Public' : 'Private'}
                          </span>
                        </label>
                        <AnimatePresence>
                          {showTooltip === store._id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 top-8 left-0 bg-gray-800 text-white text-xs rounded-md p-2 w-48 shadow-lg"
                            >
                              {store.isPublished 
                                ? 'Your store is public and visible to everyone.' 
                                : 'Your store is private and not visible to others.'}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyStoreUrl(store.slug)}
                    className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Copy URL"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenDeleteConfirmation(store)}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    disabled={isSubmitting}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5 truncate">
                    {new Date(store.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Currency</p>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">{store.currency}</p>
                </div>
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">
                    {store.products?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="divide-y divide-gray-100">
              {sections.map(({ key, icon: Icon, label, hidden }) => (
                (!hidden || !store.domain) && (
                  <div key={key}>
                    <motion.button
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                      onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{label}</span>
                      </div>
                      <ChevronDown 
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          expandedSection === key ? 'rotate-180' : ''
                        }`} 
                      />
                    </motion.button>
                    
                    <AnimatePresence>
                      {expandedSection === key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 pt-0 bg-gray-50">
                            {key === 'appearance' && (
                              <div className="space-y-4">
                                <CustomDropdown
                                  label="Template"
                                  value={appearanceSettings?.storeId === store._id ? appearanceSettings.template : store.template || 'modern'}
                                  options={templateOptions}
                                  onChange={(value) =>
                                    setAppearanceSettings({
                                      storeId: store._id,
                                      template: value,
                                      font: appearanceSettings?.font || store.font || 'Inter',
                                    })
                                  }
                                  disabled={isSubmitting}
                                />
                                <CustomDropdown
                                  label="Font"
                                  value={appearanceSettings?.storeId === store._id ? appearanceSettings.font : store.font || 'Inter'}
                                  options={fontOptions}
                                  onChange={(value) =>
                                    setAppearanceSettings({
                                      storeId: store._id,
                                      template: appearanceSettings?.template || store.template || 'modern',
                                      font: value,
                                    })
                                  }
                                  disabled={isSubmitting}
                                />
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() =>
                                    appearanceSettings &&
                                    handleUpdateAppearance(
                                      store._id,
                                      appearanceSettings.template,
                                      appearanceSettings.font
                                    )
                                  }
                                  className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 text-xs font-medium flex items-center justify-center gap-1.5"
                                  disabled={isSubmitting || !appearanceSettings}
                                >
                                  <Type className="w-3 h-3" />
                                  Save Appearance
                                </motion.button>
                              </div>
                            )}
                            {key === 'branding' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <ColorSelector color={store.primaryColor} label="Primary Color" />
                                <ColorSelector color={store.secondaryColor} label="Secondary Color" />
                              </div>
                            )}
                            
                            {key == 'social' && (
                              <div className="space-y-2">
                                {store.socialLinks && Object.entries(store.socialLinks).map(([platform, url]) => url && (
                                  <div key={platform} className="flex items-center gap-2">
                                    {platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />}
                                    {platform === 'facebook' && <Facebook className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                                    {platform === 'twitter' && <Twitter className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />}
                                    <a 
                                      href={url} 
                                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline truncate min-w-0"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {url}
                                    </a>
                                  </div>
                                )) || <p className="text-xs text-gray-600">No social links configured</p>}
                              </div>
                            )}
                            
                            {key === 'contact' && (
                              <div className="space-y-2">
                                {store.contact && Object.entries(store.contact).map(([type, value]) => value && (
                                  <div key={type} className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-900 truncate">{value}</span>
                                  </div>
                                )) || <p className="text-xs text-gray-600">No contact information</p>}
                              </div>
                            )}
                            
                            {key === 'domain' && !store.domain && (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 mb-1">Add a Custom Domain</p>
                                  <p className="text-xs text-gray-600 mb-3">Connect your own domain to your store for a professional look (e.g., example.com).</p>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value)}
                                    placeholder="example.com"
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={isSubmitting}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleCustomDomainSubmit(store._id)}
                                    className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-xs font-medium flex items-center gap-1.5"
                                    disabled={isSubmitting}
                                  >
                                    <Globe className="w-3 h-3" />
                                    Save Domain
                                  </motion.button>
                                </div>
                                <p className="text-xs text-gray-500">Note: After adding, configure your DNS settings with an A record pointing to our server IP and a CNAME for www.</p>
                              </div>
                            )}
                            
                            {key === 'products' && (
                              <div className="space-y-3">
                                {store.products && store.products.length > 0 ? (
                                  <div className="space-y-2">
                                    {store.products.map((product) => (
                                      <div key={product._id} className="bg-white rounded-md p-2.5 shadow-sm border border-gray-200">
                                        <div className="flex gap-2.5">
                                          {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded-md flex-shrink-0" />
                                          ) : (
                                            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                              <Package className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="min-w-0 flex-1">
                                                <h4 className="text-xs font-medium text-gray-900 truncate">{product.name}</h4>
                                                <p className="text-xs font-semibold text-indigo-600">{store.currency} {product.price.toFixed(2)}</p>
                                              </div>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
                                            <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full mt-1 ${
                                              product.isAvailable 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                              {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-4 bg-white rounded-md border border-gray-200"
                                  >
                                    <Package className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900 mb-1">No products added yet</p>
                                    <p className="text-xs text-gray-600 mb-3">Get started by adding your first product to your store.</p>
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      onClick={() => setShowProductForm(true)}
                                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-xs font-medium flex items-center gap-1.5 mx-auto"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Add Your First Product
                                    </motion.button>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              ))}
            </div>

            {/* Action Buttons */}
            <div className="p-3 bg-gray-50 flex flex-col sm:flex-row gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEditStore(store)}
                className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3 h-3" />
                Edit Store
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => handlePreviewStore(store)}
                className="flex-1 bg-white text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50 text-xs font-medium flex items-center justify-center gap-1.5 border border-gray-200"
              >
                <Eye className="w-3 h-3" />
                Preview
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-white text-gray-400 py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 border border-gray-200 cursor-not-allowed"
                disabled
              >
                <BarChart3 className="w-3 h-3" />
                Analytics
              </motion.button>
            </div>

            {/* Visibility Confirmation Modal */}
            <AnimatePresence>
              {showVisibilityConfirmation === store._id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50"
                >
                  <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {pendingVisibilityState ? 'Make Store Public?' : 'Make Store Private?'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {pendingVisibilityState
                        ? 'This will make your store visible to everyone. Are you sure?'
                        : 'This will hide your store from public view. Are you sure?'}
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={confirmVisibilityToggle}
                        className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 text-xs font-medium"
                      >
                        Confirm
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={cancelVisibilityToggle}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-300 text-xs font-medium"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Preview: {showPreviewModal.name}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowPreviewModal(null)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ fontFamily: `${showPreviewModal.font || 'Inter'}, sans-serif` }}>
                {showPreviewModal.template == 'modern' ? (
                  <ModernStoreTemplate
                  store={{
                    _id: showPreviewModal._id,
                    name: showPreviewModal.name,
                    slug: showPreviewModal.slug,
                    description: showPreviewModal.description,
                    logo: showPreviewModal.logo,
                    primaryColor: showPreviewModal.primaryColor,
                    secondaryColor: showPreviewModal.secondaryColor,
                    currency: showPreviewModal.currency,
                    products: showPreviewModal.products,
                    template: showPreviewModal.template,
                    font: showPreviewModal.font,
                  }}
                  isPreview={true}
                />
                ): (<SleekStoreTemplate store={{
                    _id: showPreviewModal._id,
                    name: showPreviewModal.name,
                    slug: showPreviewModal.slug,
                    description: showPreviewModal.description,
                    logo: showPreviewModal.logo,
                    primaryColor: showPreviewModal.primaryColor,
                    secondaryColor: showPreviewModal.secondaryColor,
                    currency: showPreviewModal.currency,
                    products: showPreviewModal.products,
                    template: showPreviewModal.template,
                    font: showPreviewModal.font,
                  }}/>)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteStoreConfirmation
        isOpen={showDeleteConfirmation}
        storeName={selectedStore?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default RenderStoreManagement;