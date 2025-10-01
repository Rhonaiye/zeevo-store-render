'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Link, Trash2, Palette, ShoppingBag, Mail, Package, ChevronDown, Instagram, Facebook, Twitter, Edit3, Eye, Image, X, Layout, Type, FileText, Truck, Store as StoreIcon, Loader2, AlertTriangle, Camera, Home, Settings, Users, Map, File } from 'lucide-react';
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

interface TabItem {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
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
        className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200" 
        style={{ backgroundColor: color || '#16A34A' }}
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{color || '#16A34A'}</div>
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
  const [activeTab, setActiveTab] = useState<string>('overview');
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
  // Tab Items
  // ------------------------------------------
  const tabItems: TabItem[] = [
    { key: 'overview', icon: Home, label: 'Overview' },
    { key: 'appearance', icon: Layout, label: 'Appearance' },
    { key: 'branding', icon: Palette, label: 'Branding' },
    { key: 'social', icon: Users, label: 'Social' },
    { key: 'contact', icon: Mail, label: 'Contact' },
    { key: 'shipping_pickup', icon: Map, label: 'Shipping' },
    { key: 'policies', icon: File, label: 'Policies' },
    { key: 'products', icon: Package, label: 'Products' },
  ];

  // ------------------------------------------
  // Form Data State
  // ------------------------------------------
  const [formData, setFormData] = useState<CreateStoreBody>({
    name: '',
    slug: '',
    description: '',
    primaryColor: '#16A34A',
    secondaryColor: '#15803D',
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
        primaryColor: '#16A34A',
        secondaryColor: '#15803D',
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
      primaryColor: store.primaryColor || '#16A34A',
      secondaryColor: store.secondaryColor || '#15803D',
      currency: store.currency || 'NGN',
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
        className="w-full max-w-md mx-auto text-center py-8 px-4 bg-[#F3FFF4] rounded-2xl shadow-lg"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Store</h3>
        <p className="text-sm text-gray-800 mb-6 leading-relaxed">Start selling online by creating your store today.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Create Store
        </motion.button>
      </motion.div>
    );
  }

  // ------------------------------------------
  // Tab Content Components
  // ------------------------------------------
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-900 uppercase">Created</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(store.createdAt ?? new Date()).toLocaleDateString('en-US', {month: 'short',day: 'numeric',year: 'numeric'})}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-900 uppercase">Currency</p>
          <p className="text-sm font-semibold text-gray-900">{store.currency}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-900 uppercase">Products</p>
          <p className="text-sm font-semibold text-gray-900">{store.products?.length ?? 0}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="relative">
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#16A34A] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-b from-[#069A46] to-[#04DB2A]"></div>
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
      </div>
      {store.description && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-900">{store.description}</p>
        </div>
      )}
    </div>
  );

  const AppearanceTab = () => (
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
        className="w-full bg-[#16A34A] text-white py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        disabled={isSubmitting || !appearanceSettings}
      >
        <Type className="w-4 h-4" />
        Save Appearance
      </motion.button>
    </div>
  );

  const BrandingTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <ColorSelector color={store.primaryColor} label="Primary Color" />
        <ColorSelector color={store.secondaryColor} label="Secondary Color" />
      </div>
    </div>
  );

  const SocialTab = () => (
    <div className="space-y-3">
      {store.socialLinks && Object.entries(store.socialLinks).some(([_, url]) => url) ? (
        Object.entries(store.socialLinks).map(([platform, url]) => url && (
          <div key={platform} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-600" />}
            {platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
            {platform === 'twitter' && <Twitter className="w-5 h-5 text-sky-600" />}
            {platform === 'tiktok' && <StoreIcon className="w-5 h-5 text-gray-900" />}
            <a href={url} className="text-sm text-[#16A34A] hover:underline truncate" target="_blank" rel="noopener noreferrer">{url}</a>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">No social links configured</p>
      )}
    </div>
  );

  const ContactTab = () => (
    <div className="space-y-3">
      {store.contact && Object.entries(store.contact).some(([_, value]) => value) ? (
        Object.entries(store.contact).map(([type, value]) => value && (
          <div key={type} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <Mail className="w-5 h-5 text-gray-900" />
            <span className="text-sm text-gray-900 truncate">{value}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">No contact information</p>
      )}
    </div>
  );

  const ShippingTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Shipping</h4>
        {store.shipping?.enabled ? (
          store.shipping.locations.length > 0 ? (
            <div className="space-y-3">
              {store.shipping.locations.map((location, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
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
            <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">Shipping enabled but no locations configured</p>
          )
        ) : (
          <div className="p-3 bg-red-100 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600">
              Shipping is not enabled. Customers cannot buy from your store until shipping is enabled.
            </p>
          </div>
        )}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Pickup</h4>
        {store.pickup?.enabled ? (
          store.pickup.note ? (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
              <StoreIcon className="w-5 h-5 text-gray-900" />
              <p className="text-sm text-gray-900">{store.pickup.note}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">Pickup enabled but no note provided</p>
          )
        ) : (
          <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">Pickup not enabled</p>
        )}
      </div>
    </div>
  );

  const PoliciesTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Return Policy</h4>
        {store.policies?.returns ? (
          <p className="text-sm text-gray-900 p-3 bg-white rounded-lg shadow-sm border border-gray-200">{store.policies.returns}</p>
        ) : (
          <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">No return policy provided</p>
        )}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms of Service</h4>
        {store.policies?.terms ? (
          <p className="text-sm text-gray-900 p-3 bg-white rounded-lg shadow-sm border border-gray-200">{store.policies.terms}</p>
        ) : (
          <p className="text-sm text-gray-800 p-3 bg-white rounded-lg shadow-sm border border-gray-200">No terms of service provided</p>
        )}
      </div>
    </div>
  );

  const ProductsTab = () => (
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
                <p className="text-sm font-medium text-[#16A34A]">{store.currency} {product.price.toFixed(2)}</p>
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
            className="bg-[#16A34A] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'branding':
        return <BrandingTab />;
      case 'social':
        return <SocialTab />;
      case 'contact':
        return <ContactTab />;
      case 'shipping_pickup':
        return <ShippingTab />;
      case 'policies':
        return <PoliciesTab />;
      case 'products':
        return <ProductsTab />;
      default:
        return <OverviewTab />;
    }
  };

  // ------------------------------------------
  // Main Rendering: Tabbed Layout
  // ------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#F3FFF4] rounded-2xl shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
            style={{ background: `linear-gradient(135deg, ${store.primaryColor ?? '#16A34A'}, ${store.secondaryColor ?? '#15803D'})` }}
          >
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-sm text-gray-600">/{store.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => handleCopyStoreUrl(store.slug)}
            className="p-2 text-gray-900 hover:text-[#16A34A] hover:bg-[#C4FEC8]/50 rounded-full"
            title="Copy URL"
          >
            <Link className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setSelectedStore(store);
              setShowDeleteConfirmation(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoFile(e.target.files?.[0] || null)}
              className="hidden"
              id="logo-upload"
              disabled={isSubmitting}
            />
            <label
              htmlFor="logo-upload"
              className="flex items-center gap-2 text-sm text-[#16A34A] hover:text-[#15803D] cursor-pointer bg-[#C4FEC8]/50 px-3 py-2 rounded-full"
            >
              <Image className="w-4 h-4" />
              Logo
            </label>
            {logoFile && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleLogoUpload}
                className="bg-[#16A34A] text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <nav className="flex flex-wrap gap-0">
          {tabItems.map((item) => (
            <motion.button
              key={item.key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-[#C4FEC8] text-[#16A34A] border-b-2 border-[#16A34A]'
                  : 'text-gray-600 hover:text-[#16A34A] hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => handleEditStore(store)}
          className="flex-1 bg-[#16A34A] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md"
        >
          <Edit3 className="w-4 h-4" />
          Edit Store
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowPreviewModal(store)}
          className="flex-1 bg-white text-gray-900 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 shadow-md"
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
                  className="flex-1 bg-[#16A34A] text-white py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 bg-[#16A34A] text-white py-2.5 rounded-full text-sm font-semibold text-center"
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