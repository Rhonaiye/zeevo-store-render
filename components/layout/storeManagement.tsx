'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Link, Trash2, Store, Palette, Mail, Package, ChevronDown, Instagram, Facebook, Twitter, Edit3, Eye, Globe, X, Layout, Type } from 'lucide-react';
import Cookies from 'js-cookie';
import DeleteStoreConfirmation from '../ui/deleteStore';
import StoreForm from './storeForm';
import ModernStoreTemplate from '../template/page';
import CustomDropdown from '../ui/dropDown';
import SleekStoreTemplate from '../template/template2';
import { useAppStore, UserProfile } from '@/store/useAppStore';

// Interfaces
interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currency: string;
  products?: Product[];
  template?: string;
  font?: string;
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string; tiktok?: string };
  contact?: { email?: string; phone?: string; address?: string };
  isPublished?: boolean;
  createdAt: string;
  domain?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable?: boolean;
}

interface RenderStoreManagementProps {
  addNotification: (message: string, type: 'success' | 'error') => void;
  fetchUserProfile: () => Promise<UserProfile | null>;
}

const ColorSelector = ({ color, label }: { color?: string; label: string }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-3">
      <div 
        className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200" 
        style={{ backgroundColor: color || '#6366F1' }}
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{color || '#6366F1'}</div>
        <div className="text-xs text-gray-500">Click to change</div>
      </div>
    </div>
  </div>
);

const RenderStoreManagement: React.FC<RenderStoreManagementProps> = ({ addNotification, fetchUserProfile }) => {
  const { userProfile, setUserProfile } = useAppStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showVisibilityConfirmation, setShowVisibilityConfirmation] = useState(false);
  const [pendingVisibilityState, setPendingVisibilityState] = useState<boolean | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState<Store | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<{ template: string; font: string } | null>(null);

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

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    currency: 'USD',
    domain: '',
    template: 'modern',
    font: 'Inter',
    socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
    contact: { email: '', phone: '', address: '' },
  });

  // Initialize store and ensure store ID is available
  const store = userProfile?.stores?.[0] || null;

  useEffect(() => {
    if (store && !selectedStore) {
      setSelectedStore(store); // Set selectedStore to the first store on mount
    }
  }, [store, selectedStore]);

  const handleFormSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Authentication error. Please log in again.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/update`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/create`;
      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(isEdit ? 'Failed to update store' : 'Failed to create store');
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(updatedProfile.stores?.[0] || null); // Update selectedStore after creation/update
      }
      setShowCreateForm(false);
      setShowEditForm(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        currency: 'USD',
        domain: '',
        template: 'modern',
        font: 'Inter',
        socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
        contact: { email: '', phone: '', address: '' },
      });
      addNotification(`Store ${isEdit ? 'updated' : 'created'} successfully`, 'success');
    } catch (error) {
      addNotification(`Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setSelectedStore(store);
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

    const handleCopyFallback = (text: string) => {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  addNotification('Copied using fallback', 'success');
};


const handleCopyStoreUrl = (slug: string) => {
  const url = `http://${slug}.172.20.10.14.nip.io:3001/`;

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => addNotification('Store URL copied', 'success'))
      .catch(() => addNotification('Copy failed', 'error'));
  } else {
    // fallback method for HTTP or unsupported browsers
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    addNotification('Store url copied', 'success');
  }
};


  const handleDeleteStore = async () => {
    const token = Cookies.get('token');
    if (!token || !selectedStore?._id) {
      addNotification('Authentication error or no store selected. Please try again.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/delete/${selectedStore._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete store');
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(null); // Clear selected store after deletion
      }
      addNotification('Store deleted successfully', 'success');
    } catch (error) {
      addNotification(`Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirmation(false);
    }
  };



  const retryFetch = async (url: string, options: RequestInit, retries: number = 3, delay: number = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 429) {
          const waitTime = (i + 1) * delay;
          addNotification(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`, 'error');
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

  const handleCustomDomainSubmit = async () => {
    const token = Cookies.get('token');
    if (!token || !selectedStore?._id) {
      addNotification('Authentication error or no store selected. Please try again.', 'error');
      return;
    }
    if (!customDomain || !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(customDomain)) {
      addNotification('Please enter a valid domain (e.g., example.com)', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await retryFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/update/${selectedStore._id}`,
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
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(updatedProfile.stores?.[0] || null);
      }
      addNotification('Custom domain added successfully', 'success');
      setCustomDomain('');
    } catch (error) {
      addNotification(`Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAppearance = async (template: string, font: string) => {
    const token = Cookies.get('token');
    if (!token || !selectedStore?._id) {
      addNotification('Authentication error or no store selected. Please try again.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await retryFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/update/appearance/${selectedStore._id}`,
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
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(updatedProfile.stores?.[0] || null);
      }
      addNotification('Appearance settings updated successfully', 'success');
      setAppearanceSettings(null);
    } catch (error) {
      addNotification(`Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStoreVisibility = async (currentStatus: boolean) => {
    const token = Cookies.get('token');
    if (!token || !selectedStore?._id) {
      addNotification('Authentication error or no store selected. Please try again.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await retryFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/toggle/visibility/${selectedStore._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 450 || (response.status === 403 && (await response.json()).code === 'UPGRADE_REQUIRED')) {
        addNotification('Upgrade to Pro to toggle store visibility.', 'error');
        return;
      }
      if (!response.ok) throw new Error('Failed to toggle visibility');
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(updatedProfile.stores?.[0] || null);
      }
      addNotification(`Store has been ${!currentStatus ? 'published' : 'hidden'} successfully.`, 'success');
    } catch (error) {
      addNotification(`Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSubmitting(false);
      setShowVisibilityConfirmation(false);
      setPendingVisibilityState(null);
    }
  };

  const handleToggleWithConfirmation = (currentStatus: boolean) => {
    if (!selectedStore?._id) {
      addNotification('No store selected. Please try again.', 'error');
      return;
    }
    setShowVisibilityConfirmation(true);
    setPendingVisibilityState(!currentStatus);
  };

  const confirmVisibilityToggle = () => {
    if (pendingVisibilityState !== null && selectedStore?._id) {
      handleToggleStoreVisibility(store?.isPublished || false);
    }
  };

  if (showCreateForm || showEditForm) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className=""
        >
          <StoreForm
            isEdit={showEditForm}
            formData={formData}
            setFormData={setFormData}
            setShowCreateForm={setShowCreateForm}
            setShowEditForm={setShowEditForm}
            setEditingStoreId={() => setSelectedStore(null)}
            handleFormSubmit={handleFormSubmit}
            showCurrencyDropdown={false}
            setShowCurrencyDropdown={() => {}}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!store) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl shadow-lg"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Store</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">Start selling online by creating your store today.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Create Store
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto p-6 bg-white rounded-2xl shadow-xl"
    >
      {/* Store Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
            style={{ background: `linear-gradient(135deg, ${store.primaryColor || '#6366F1'}, ${store.secondaryColor || '#8B5CF6'})` }}
          >
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
            <p className="text-sm text-gray-500 font-mono">/{store.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopyStoreUrl(store.slug)}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
            title="Copy URL"
          >
            <Link className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedStore(store);
              setShowDeleteConfirmation(true);
            }}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Created</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Currency</p>
          <p className="text-sm font-semibold text-gray-900">{store.currency}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Products</p>
          <p className="text-sm font-semibold text-gray-900">{store.products?.length || 0}</p>
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="relative mb-6">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={store.isPublished}
            onChange={() => handleToggleWithConfirmation(store.isPublished)}
            disabled={isSubmitting}
            className="sr-only peer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">{store.isPublished ? 'Public' : 'Private'}</span>
        </label>
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 top-10 left-0 bg-gray-800 text-white text-xs rounded-lg p-2 w-64 shadow-lg"
            >
              {store.isPublished ? 'Your store is public and visible to everyone.' : 'Your store is private and not visible to others.'}
            </motion.div>
          )}
        </AnimatePresence>
        {!store.isPublished && (
          <p className="text-sm text-gray-600 mt-2">No one can see your store while it is private.</p>
        )}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {[
          { key: 'appearance', icon: Layout, label: 'Appearance' },
          { key: 'branding', icon: Palette, label: 'Branding' },
          { key: 'social', icon: Link, label: 'Social Links' },
          { key: 'contact', icon: Mail, label: 'Contact Info' },
          { key: 'domain', icon: Globe, label: 'Custom Domain', hidden: !!store.domain },
          { key: 'products', icon: Package, label: 'Products' },
        ].map(({ key, icon: Icon, label, hidden }) => (
          !hidden && (
            <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
              <motion.button
                whileHover={{ backgroundColor: '#F9FAFB' }}
                onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSection === key ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {expandedSection === key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50 p-4"
                  >
                    {key === 'appearance' && (
                      <div className="space-y-4">
                        <CustomDropdown
                          label="Template"
                          value={appearanceSettings?.template || store.template || 'modern'}
                          options={templateOptions}
                          onChange={(value) => setAppearanceSettings({ template: value, font: appearanceSettings?.font || store.font || 'Inter' })}
                          disabled={isSubmitting}
                        />
                        <CustomDropdown
                          label="Font"
                          value={appearanceSettings?.font || store.font || 'Inter'}
                          options={fontOptions}
                          onChange={(value) => setAppearanceSettings({ template: appearanceSettings?.template || store.template || 'modern', font: value })}
                          disabled={isSubmitting}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => appearanceSettings && handleUpdateAppearance(appearanceSettings.template, appearanceSettings.font)}
                          className="w-full bg-indigo-600 text-white py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                          disabled={isSubmitting || !appearanceSettings}
                        >
                          <Type className="w-4 h-4" />
                          Save Appearance
                        </motion.button>
                      </div>
                    )}
                    {key === 'branding' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ColorSelector color={store.primaryColor} label="Primary Color" />
                        <ColorSelector color={store.secondaryColor} label="Secondary Color" />
                      </div>
                    )}
                    {key === 'social' && (
                      <div className="space-y-3">
                        {store.socialLinks && Object.entries(store.socialLinks).map(([platform, url]) => url && (
                          <div key={platform} className="flex items-center gap-3">
                            {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                            {platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                            {platform === 'twitter' && <Twitter className="w-5 h-5 text-sky-600" />}
                            <a href={url} className="text-sm text-indigo-600 hover:underline truncate" target="_blank" rel="noopener noreferrer">{url}</a>
                          </div>
                        )) || <p className="text-sm text-gray-600">No social links configured</p>}
                      </div>
                    )}
                    {key === 'contact' && (
                      <div className="space-y-3">
                        {store.contact && Object.entries(store.contact).map(([type, value]) => value && (
                          <div key={type} className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-900 truncate">{value}</span>
                          </div>
                        )) || <p className="text-sm text-gray-600">No contact information</p>}
                      </div>
                    )}
                    {key === 'domain' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Add a Custom Domain</p>
                          <p className="text-xs text-gray-600">Use your own domain for a professional look (e.g., example.com).</p>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            placeholder="example.com"
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isSubmitting}
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={handleCustomDomainSubmit}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            <Globe className="w-4 h-4" />
                            Save Domain
                          </motion.button>
                        </div>
                        <p className="text-xs text-gray-500">Configure DNS with an A record and CNAME for www after adding.</p>
                      </div>
                    )}
                    {key === 'products' && (
                      <div className="space-y-4">
                        {store.products && store.products.length > 0 ? (
                          store.products.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                              <div className="flex gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
                                  <p className="text-sm font-medium text-indigo-600">{store.currency} {product.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                                  <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-6 bg-white rounded-xl border border-gray-200"
                          >
                            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-900 mb-2">No products added</p>
                            <p className="text-xs text-gray-600 mb-4">Add your first product to start selling.</p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              onClick={() => console.log('Add product clicked')} // Placeholder for product form
                              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto"
                            >
                              <Plus className="w-4 h-4" />
                              Add Product
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => handleEditStore(store)}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
        >
          <Edit3 className="w-4 h-4" />
          Edit Store
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowPreviewModal(store)}
          className="flex-1 bg-white text-gray-700 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 shadow-md"
        >
          <Eye className="w-4 h-4" />
          Preview
        </motion.button>
      </div>

      {/* Visibility Confirmation Modal */}
      <AnimatePresence>
        {showVisibilityConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{pendingVisibilityState ? 'Make Store Public?' : 'Make Store Private?'}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {pendingVisibilityState
                  ? 'Your store will be visible to everyone.'
                  : 'Your store will be hidden from public view and no one will be able to see it.'}
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={confirmVisibilityToggle}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowVisibilityConfirmation(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Preview: {showPreviewModal.name}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowPreviewModal(null)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ fontFamily: `${showPreviewModal.font || 'Inter'}, sans-serif` }}>
                {showPreviewModal.template === 'modern' ? (
                  <ModernStoreTemplate store={showPreviewModal} isPreview={true} />
                ) : (
                  <SleekStoreTemplate store={showPreviewModal} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteStoreConfirmation
        isOpen={showDeleteConfirmation}
        storeName={selectedStore?.name || ''}
        onConfirm={handleDeleteStore}
        onCancel={() => {
          setShowDeleteConfirmation(false);
          setSelectedStore(null);
        }}
      />
    </motion.div>
  );
};

export default RenderStoreManagement;