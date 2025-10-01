'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Link, Trash2, Palette, ShoppingBag, Mail, Package, ChevronDown, Instagram, Facebook, Twitter, Edit3, Eye, Image, X, Layout, Type, FileText, Truck, Store as StoreIcon, Loader2, AlertTriangle, Camera } from 'lucide-react';
import Cookies from 'js-cookie';
import DeleteStoreConfirmation from '../ui/deleteStore';
import StoreForm from './storeForm';
import ModernStoreTemplate from '@/components/template/modernStore';
import CustomDropdown from '../ui/dropDown';
import SleekStoreTemplate from '../template/sleek';
import { useAppStore, UserProfile, Product, Store } from '@/store/useAppStore';
import { CreateStoreBody } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

// ============================================
// Interfaces and Types
// ============================================

interface ShippingLocation {
  area: string;
  fee: number;
  note?: string;
}

interface RenderStoreManagementProps {
  addNotification: (message: string, type: 'success' | 'error') => void;
  fetchUserProfile: () => Promise<UserProfile | null>;
}

interface ColorSelectorProps {
  color?: string;
  label: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

// ============================================
// Sub-Components
// ============================================
const ColorSelector: React.FC<ColorSelectorProps> = ({ color, label }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-900">{label}</label>
    <div className="flex items-center gap-3">
      <div 
        className="w-8 h-8

 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200" 
        style={{ backgroundColor: color || '#6366F1' }}
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{color || '#6366F1'}</div>
        <div className="text-xs text-gray-800">Click to change</div>
      </div>
    </div>
  </div>
);

// ============================================
// Main Component: RenderStoreManagement
// ============================================
const RenderStoreManagement: React.FC<RenderStoreManagementProps> = ({ addNotification, fetchUserProfile }) => {
  // ------------------------------------------
  // State Management
  // ------------------------------------------
  const { userProfile, setUserProfile } = useAppStore();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showVisibilityConfirmation, setShowVisibilityConfirmation] = useState<boolean>(false);
  const [pendingVisibilityState, setPendingVisibilityState] = useState<boolean | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<Store | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<{ template: string; font: string } | null>(null);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState<boolean>(false);
  const router = useRouter();

  // ------------------------------------------
  // Dropdown Options
  // ------------------------------------------
  const templateOptions: DropdownOption[] = [
    { value: 'modern', label: 'Modern' },
    { value: 'sleek', label: 'Sleek' },
  ];

  const fontOptions: DropdownOption[] = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Jost', label: 'Jost' },
    { value: 'Geist', label: 'Geist' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Saira', label: 'Saira' },
  ];

  // ------------------------------------------
  // Form Data State
  // ------------------------------------------
  const [formData, setFormData] = useState<CreateStoreBody>({
    name: '',
    slug: '',
    description: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    currency: 'NGN',
    domain: '',
    template: 'modern',
    font: 'Inter',
    socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
    contact: { email: '', phone: '', address: '' },
    shipping: { enabled: false, locations: [] },
    pickup: { enabled: false, note: '' },
    policies: { returns: '', terms: '' },
  });

  const store = userProfile?.stores?.[0] || null;

  // ------------------------------------------
  // Effects
  // ------------------------------------------
  useEffect(() => {
    if (store && !selectedStore) {
      setSelectedStore(store);
    }
  }, [store, selectedStore]);

  // Logo Preview Effect
  useEffect(() => {
    if (logoFile) {
      const objectUrl = URL.createObjectURL(logoFile);
      setLogoPreviewUrl(objectUrl);
      // Cleanup the object URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [logoFile]);

  // ------------------------------------------
  // Handler Functions
  // ------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
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
        setSelectedStore(updatedProfile.stores?.[0] || null);
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
        shipping: { enabled: false, locations: [] },
        pickup: { enabled: false, note: '' },
        policies: { returns: '', terms: '' },
      });
      addNotification(`Store ${isEdit ? 'updated' : 'created'} successfully`, 'success');
    } catch (error: unknown) {
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
      shipping: store.shipping || { enabled: false, locations: [] },
      pickup: store.pickup || { enabled: false, note: '' },
      policies: store.policies || { returns: '', terms: '' },
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
    const url = `http://${slug}.zeevo.shop/`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => addNotification('Store URL copied', 'success'))
        .catch(() => addNotification('Copy failed', 'error'));
    } else {
      handleCopyFallback(url);
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
        setSelectedStore(null);
      }
      addNotification('Store deleted successfully', 'success');
    } catch (error: unknown) {
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
      } catch (error: unknown) {
        if (i === retries - 1) throw error;
      }
    }
    throw new Error('Max retries reached');
  };

  const handleLogoUpload = async () => {
    const token = Cookies.get('token');
    if (!token || !selectedStore?._id || !logoFile) {
      addNotification('Authentication error, no store selected, or no logo file selected. Please try again.', 'error');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(logoFile.type)) {
      addNotification('Please upload a valid image (PNG, JPEG, or JPG)', 'error');
      return;
    }

    if (logoFile.size > 5 * 1024 * 1024) { // 5MB limit
      addNotification('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await retryFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/upload-logo/${selectedStore._id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to upload logo');
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(updatedProfile.stores?.[0] || null);
      }
      addNotification('Store logo uploaded successfully', 'success');
      setLogoFile(null);
      setLogoPreviewUrl(null);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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

      if (!response.ok) throw new Error('Failed to toggle visibility');
      const updatedProfile = await fetchUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setSelectedStore(updatedProfile.stores?.[0] || null);
      }

      addNotification(
        `Store has been ${!currentStatus ? 'published' : 'hidden'} successfully.`,
        'success'
      );
    } catch (error: unknown) {
      setShowUpgradeOverlay(true);
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
      handleToggleStoreVisibility(store?.isPublished ?? false);
    }
  };

  // ------------------------------------------
  // Conditional Rendering: Forms
  // ------------------------------------------
  if (showCreateForm || showEditForm) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full"
        >
          <StoreForm
            isEdit={showEditForm}
            formData={formData}
            setFormData={setFormData}
            setShowCreateForm={setShowCreateForm}
            setShowEditForm={setShowEditForm}
            setEditingStoreId={(id: string | null) => setSelectedStore(null)}
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // ------------------------------------------
  // Conditional Rendering: No Store
  // ------------------------------------------
  if (!store) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto text-center py-8 px-4 bg-white rounded-2xl shadow-lg"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Store</h3>
        <p className="text-sm text-gray-800 mb-6 leading-relaxed">Start selling online by creating your store today.</p>
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

  // ------------------------------------------
  // Main Rendering: Store Management UI
  // ------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto p-4 bg-white rounded-2xl shadow-xl"
    >
      {/* Logo Management */}
      <div className="mb-4 border border-[#C5FEC9] rounded-lg p-3 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Image className="w-4 h-4 text-gray-900" />
          <span className="text-xs font-semibold text-gray-900">Store Logo</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs border border-[#41FB4E] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#9CFBA3] file:text-[#3EBE69] hover:file:bg-[#9CFBA3]/80 cursor-pointer"
              disabled={isSubmitting}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogoUpload}
              className="w-full sm:w-auto bg-gradient-to-b from-[#069A46] to-[#04DB2A]  text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 touch-manipulation"
              disabled={isSubmitting || !logoFile}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  Upload Logo
                </>
              )}
            </motion.button>
          </div>
          {logoPreviewUrl && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-900 mb-1">Logo Preview</p>
              <img
                src={logoPreviewUrl}
                alt="Logo preview"
                className="w-12 h-12 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}
          {store.logo && !logoPreviewUrl && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-900 mb-1">Current Logo</p>
              <img
                src={store.logo}
                alt={`${store.name} logo`}
                className="w-12 h-12 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Store Header */}
      <div className="flex flex-col items-start gap-4 mb-6">
        <div className="flex items-center gap-4 w-full">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ background: `linear-gradient(135deg, ${store.primaryColor ?? '#6366F1'}, ${store.secondaryColor ?? '#8B5CF6'})` }}
          >
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
            <p className="text-xs text-gray-800 font-mono">/{store.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCopyStoreUrl(store.slug)}
              className="p-2 text-gray-900 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
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
              className="p-2 text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-full"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-900 uppercase">Created</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(store.createdAt ?? new Date()).toLocaleDateString('en-US', {month: 'short',day: 'numeric',year: 'numeric'})}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-900 uppercase">Currency</p>
          <p className="text-sm font-semibold text-gray-900">{store.currency}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-900 uppercase">Products</p>
          <p className="text-sm font-semibold text-gray-900">{store.products?.length ?? 0}</p>
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="relative mb-6">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={store.isPublished ?? false}
            onChange={() => handleToggleWithConfirmation(store.isPublished ?? false)}
            disabled={isSubmitting}
            className="sr-only peer "
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-b from-[#069A46] to-[#04DB2A]"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">{store.isPublished ? 'Public' : 'Private'}</span>
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
          <p className="text-xs text-gray-800 mt-2">No one can see your store while it is private.</p>
        )}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {[
          { key: 'appearance', icon: Layout, label: 'Appearance' },
          { key: 'description', icon: FileText, label: 'Description' },
          { key: 'branding', icon: Palette, label: 'Branding' },
          { key: 'social', icon: Link, label: 'Social Links' },
          { key: 'contact', icon: Mail, label: 'Contact Info' },
          { key: 'shipping_pickup', icon: Truck, label: 'Shipping & Pickup' },
          { key: 'policies', icon: FileText, label: 'Policies' },
          { key: 'products', icon: Package, label: 'Products' },
        ].map(({ key, icon: Icon, label }) => (
          <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
            <motion.button
              whileHover={{ backgroundColor: '#F9FAFB' }}
              onClick={() => setExpandedSection(expandedSection === key ? null : key)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-900" />
                <span className="text-sm font-semibold text-gray-900">{label}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-900 transition-transform duration-200 ${expandedSection === key ? 'rotate-180' : ''}`} />
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
                        value={appearanceSettings?.template ?? store.template ?? 'modern'}
                        options={templateOptions}
                        onChange={(value: string) => setAppearanceSettings({ template: value, font: appearanceSettings?.font ?? store.font ?? 'Inter' })}
                        disabled={isSubmitting}
                      />
                      <CustomDropdown
                        label="Font"
                        value={appearanceSettings?.font ?? store.font ?? 'Inter'}
                        options={fontOptions}
                        onChange={(value: string) => setAppearanceSettings({ template: appearanceSettings?.template ?? store.template ?? 'modern', font: value })}
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
                  {key === 'description' && (
                    <div className="space-y-3">
                      {store.description ? (
                        <p className="text-sm text-gray-900">{store.description}</p>
                      ) : (
                        <p className="text-sm text-gray-800">No description provided</p>
                      )}
                    </div>
                  )}
                  {key === 'branding' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <ColorSelector color={store.primaryColor} label="Primary Color" />
                        <ColorSelector color={store.secondaryColor} label="Secondary Color" />
                      </div>
                    </div>
                  )}
                  {key === 'social' && (
                    <div className="space-y-3">
                      {store.socialLinks && Object.entries(store.socialLinks).some(([_, url]) => url) ? (
                        Object.entries(store.socialLinks).map(([platform, url]) => url && (
                          <div key={platform} className="flex items-center gap-3">
                            {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
                            {platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                            {platform === 'twitter' && <Twitter className="w-5 h-5 text-sky-600" />}
                            {platform === 'tiktok' && <StoreIcon className="w-5 h-5 text-gray-900" />}
                            <a href={url} className="text-sm text-indigo-600 hover:underline truncate" target="_blank" rel="noopener noreferrer">{url}</a>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-800">No social links configured</p>
                      )}
                    </div>
                  )}
                  {key === 'contact' && (
                    <div className="space-y-3">
                      {store.contact && Object.entries(store.contact).some(([_, value]) => value) ? (
                        Object.entries(store.contact).map(([type, value]) => value && (
                          <div key={type} className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-900" />
                            <span className="text-sm text-gray-900 truncate">{value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-800">No contact information</p>
                      )}
                    </div>
                  )}
                  {key === 'shipping_pickup' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Shipping</h4>
                        {store.shipping?.enabled ? (
                          store.shipping.locations.length > 0 ? (
                            <div className="space-y-3 mt-2">
                              {store.shipping.locations.map((location, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <Truck className="w-5 h-5 text-gray-900" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{location.area}</p>
                                    <p className="text-sm text-gray-900">Fee: {store.currency} {location.fee.toFixed(2)}</p>
                                    {location.note && <p className="text-xs text-gray-800">{location.note}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-800 mt-2">Shipping enabled but no locations configured</p>
                          )
                        ) : (
                          <div className="mt-2 p-3 bg-red-100 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-600">
                              Shipping is not enabled. Customers cannot buy from your store until shipping is enabled.
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Pickup</h4>
                        {store.pickup?.enabled ? (
                          store.pickup.note ? (
                            <div className="flex items-center gap-3 mt-2">
                              <StoreIcon className="w-5 h-5 text-gray-900" />
                              <p className="text-sm text-gray-900">{store.pickup.note}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-800 mt-2">Pickup enabled but no note provided</p>
                          )
                        ) : (
                          <p className="text-sm text-gray-800 mt-2">Pickup not enabled</p>
                        )}
                      </div>
                    </div>
                  )}
                  {key === 'policies' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Return Policy</h4>
                        {store.policies?.returns ? (
                          <p className="text-sm text-gray-900 mt-2">{store.policies.returns}</p>
                        ) : (
                          <p className="text-sm text-gray-800 mt-2">No return policy provided</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Terms of Service</h4>
                        {store.policies?.terms ? (
                          <p className="text-sm text-gray-900 mt-2">{store.policies.terms}</p>
                        ) : (
                          <p className="text-sm text-gray-800 mt-2">No terms of service provided</p>
                        )}
                      </div>
                    </div>
                  )}
                  {key === 'products' && (
                    <div className="space-y-4">
                      {store.products && store.products.length > 0 ? (
                        store.products.map((product) => (
                          <div key={product._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-900" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
                                <p className="text-sm font-medium text-indigo-600">{store.currency} {product.price.toFixed(2)}</p>
                                <p className="text-xs text-gray-900 line-clamp-2">{product.description}</p>
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
                          <Package className="w-8 h-8 text-gray-900 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-gray-900 mb-2">No products added</p>
                          <p className="text-xs text-gray-800 mb-4">Add your first product to start selling.</p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => console.log('Add product clicked')}
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
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => handleEditStore(store)}
          className="w-full bg-indigo-600 text-white py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
        >
          <Edit3 className="w-4 h-4" />
          Edit Store
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowPreviewModal(store)}
          className="w-full bg-white text-gray-900 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 shadow-md"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{pendingVisibilityState ? 'Make Store Public?' : 'Make Store Private?'}</h3>
              <p className="text-sm text-gray-800 mb-4">
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
                  className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-full text-sm font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Plan Overlay */}
      <AnimatePresence>
        {showUpgradeOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Upgrade Your Plan</h3>
              <p className="text-sm text-gray-800 mb-4">
                To make your store public or private, please upgrade to a Pro plan. This will unlock store visibility toggling and other premium features.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => router.push('/dashboard')}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-full text-sm font-semibold text-center"
                >
                  Upgrade to Pro
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowUpgradeOverlay(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2.5 rounded-full text-sm font-semibold"
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
              className="bg-white rounded-2xl w-full max-w-[95vw] sm:max-w-4xl h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Preview: {showPreviewModal.name}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowPreviewModal(null)}
                  className="p-2 text-gray-900 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ fontFamily: `${showPreviewModal.font ?? 'Inter'}, sans-serif` }}>
                {showPreviewModal.template === 'modern' ? (
                  <ModernStoreTemplate store={showPreviewModal} isPreview={true} />
                ) : (
                  // @ts-ignore
                  <SleekStoreTemplate store={showPreviewModal} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <DeleteStoreConfirmation
        isOpen={showDeleteConfirmation}
        storeName={selectedStore?.name ?? ''}
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