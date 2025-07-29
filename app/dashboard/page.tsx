'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Store, Settings, LogOut, Plus, Edit3, Eye, BarChart3,
  Instagram, Facebook, Twitter, Loader2, ChevronDown, Link, EyeOff, Package, Menu, X, Mail, Save,
  CheckCircle, Clock
} from 'lucide-react';
import Image from 'next/image';
import RenderDashboard from '@/components/layout/dashboard';
import RenderSettings from '@/components/layout/settings';
import RenderStoreManagement from '@/components/layout/storeManagement';
import RenderProductsManagement from '@/components/layout/productManagement';
import StoreAnalytics from '@/components/layout/storeAnalytics';
import { renderProductForm } from '@/components/layout/productForm';
import Notification from '@/components/ui/notification';
import StoreForm from '@/components/layout/storeForm';
import Sidebar from '@/components/ui/sideBar';
import { useAppStore, Analytics, Product, UserProfile, NavItem, ActionCard, QuickStat, FormData, ProductFormData, NotificationData, Store as IStore } from '@/store/useAppStore';

// Main Dashboard Component
interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { userProfile, setUserProfile } = useAppStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '', slug: '', description: '', primaryColor: '#3B82F6', secondaryColor: '#1F2937',
    currency: 'USD', domain: '', socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
    contact: { email: '', phone: '', address: '' },
  });

  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '', price: 0, description: '', imageUrl: '', isAvailable: true,
    discountPrice: 0, stockCount: 0, tags: [], 
  });

  const addNotification = (message: string, type: 'success' | 'error', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [
      ...prev,
      { id, message, type, isOpen: true, duration },
    ]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration + 300);
  };

  const closeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isOpen: false } : n
      ))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  const handleLogout = async () => {
    const token = Cookies.get('token');
    if (token) {
      router.push('/');
      Cookies.remove('token');
      setUserProfile(null);
    }
  };

  const fetchUserProfile = async () => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Auth error, no code to steer', 'error');
      return null;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/profile`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Profile fetch, no road clear');
      const { data } = await response.json();
      console.log(data)
      return data as UserProfile;
    } catch (error) {
      const err = error as Error;
      addNotification(`Error fetching profile: ${err.message}`, 'error');
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  const handleRetry = async () => {
    setIsLoading(true);
    const profile = await fetchUserProfile();
    if (profile) {
      setUserProfile(profile);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);
      const profile = await fetchUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
      setIsLoading(false);
    };
    initializeProfile();

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setUserProfile]);

  const navItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'store', name: 'My Store', icon: Store },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const actionCards: ActionCard[] = [
    {
      id: 'create', title: 'Create Store', description: 'Brand your shop, make it soar',
      buttonText: (userProfile?.stores?.length || 0) >= 1 ? 'Limit reached' : 'Start Setup', icon: Plus,
      status: (userProfile?.stores?.length || 0) >= 1 ? 'disabled' : 'available', primary: true,
    },
    {
      id: 'manage', title: 'Manage Store', description: 'Update details, do more',
      buttonText: 'Go to Settings', icon: Edit3, status: (userProfile?.stores?.length || 0) > 0 ? 'available' : 'disabled',
    },
    {
      id: 'preview', title: 'Preview Store', description: 'See your shop, explore',
      buttonText: 'View Live', icon: Eye, status: (userProfile?.stores?.length || 0) > 0 ? 'available' : 'disabled',
    },
    {
      id: 'analytics', title: 'Analytics', description: 'Track traffic, keep score',
      buttonText: 'Go to Analytics', icon: BarChart3, status: (userProfile?.stores?.length || 0) > 0 ? 'available' : 'disabled',
    },
  ];

  const quickStats: QuickStat[] = [
    { label: 'Total Stores', value: (userProfile?.stores?.length || 0).toString(), change: null },
    { label: 'Store Views', value: userProfile?.stores?.length ? userProfile.stores.map((s) => s.analytics?.totalViews || 0).reduce((a, b) => a + b, 0) : 0, change: userProfile?.stores?.length ? '+1%' : null },
    { label: 'Store Plan', value: userProfile?.subscription.plan || 'N/A', change: null },
  ];

  const handleCreateStore = () => {
    if ((userProfile?.stores?.length || 0) < 1) {
      setShowCreateForm(true);
      setActiveSection('store');
    }
  };

  const handleEditStore = (store: IStore) => {
    setEditingStoreId(store._id);
    setFormData({
      name: store.name || '', slug: store.slug || '', description: store.description || '',
      primaryColor: store.primaryColor || '#3B82F6', secondaryColor: store.secondaryColor || '#1F2937',
      currency: store.currency || 'USD', domain: store.domain || '',
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

  const handleFormSubmit = async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    if (!isEdit && (userProfile?.stores?.length || 0) >= 1) {
      addNotification('Store limit reached, no wave', 'error');
      return;
    }
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Auth error, can’t save', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(
        isEdit ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/update` : `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/create`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...formData, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'), isActive: true }),
        }
      );
      if (!response.ok) throw new Error('Store failed to save');
      const profile = await fetchUserProfile();
      if (!profile) {
        throw new Error('Failed to fetch updated user profile');
      }
      setUserProfile(profile);
      setFormData({
        name: '', slug: '', description: '', primaryColor: '#3B82F6', secondaryColor: '#1F2937',
        currency: 'USD', domain: '', socialLinks: { instagram: '', facebook: '', twitter: '', tiktok: '' },
        contact: { email: '', phone: '', address: '' },
      });
      setShowCreateForm(false);
      setShowEditForm(false);
      setEditingStoreId(null);
      addNotification(`Store ${isEdit ? 'updated' : 'created'}, all rave`, 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}, no save`, 'error');
      console.error('Error in handleFormSubmit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };




  const handleEditProduct = (storeId: string, product: Product) => {
    setEditingProductId(product._id);
    setProductFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      isAvailable: product.isAvailable,
      discountPrice: product.discountPrice || 0,
      stockCount: product.stockCount || 0,
      tags: product.tags || [],
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (storeId: string, productId: string) => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Auth error, no bend', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/${storeId}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Delete failed, no send');
      setUserProfile({
        ...userProfile!,
        stores: userProfile!.stores.map(store =>
          store._id === storeId
            ? { ...store, products: (store.products || []).filter(p => p._id !== productId) }
            : store
        ),
      });
      addNotification('Product deleted, to end', 'success');
    } catch (error: unknown) {
      const err = error as Error;
      addNotification(`Error: ${err.message}, no bend`, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
    addNotification('Copied using fallback', 'success');
  }
};


  const getStatusIcon = (status: string) => {
    return status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
           status === 'coming-soon' ? <Clock className="w-4 h-4 text-amber-500" /> : null;
  };

  const getButtonStyle = (card: ActionCard) => {
    return card.status === 'disabled' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
           card.status === 'coming-soon' ? 'bg-amber-100 text-amber-700 cursor-not-allowed' :
           card.primary ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
           'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          userProfile && (
            <RenderDashboard
              isLoading={false}
              quickStats={quickStats}
              stores={userProfile?.stores || []}
              handleCreateStore={handleCreateStore}
              actionCards={actionCards}
              setActiveSection={setActiveSection}
              getStatusIcon={getStatusIcon}
              getButtonStyle={getButtonStyle}
              userProfile={userProfile}
            />
          )
        );
      case 'products':
        return (
          <RenderProductsManagement
            stores={userProfile?.stores || []}
            showProductForm={showProductForm}
            editingProductId={editingProductId}
            productFormData={productFormData}
            isSubmitting={isSubmitting}
            setShowProductForm={setShowProductForm}
            setProductFormData={setProductFormData}
            setEditingProductId={setEditingProductId}
            setIsSubmitting={setIsSubmitting}
            addNotification={addNotification}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            renderProductForm={renderProductForm}
          />
        );
      case 'store':
        return (
          <RenderStoreManagement
            stores={userProfile?.stores || []}
            showCreateForm={showCreateForm}
            showEditForm={showEditForm}
            showProductForm={showProductForm}
            editingProductId={editingProductId}
            isSubmitting={isSubmitting}
            expandedSection={expandedSection}
            setShowCreateForm={setShowCreateForm}
            setShowEditForm={setShowEditForm}
            setShowProductForm={setShowProductForm}
            setExpandedSection={setExpandedSection}
            setEditingStoreId={setEditingStoreId}
            setFormData={setFormData}
            formData={formData}
            showCurrencyDropdown={showCurrencyDropdown}
            setShowCurrencyDropdown={setShowCurrencyDropdown}
            handleFormSubmit={handleFormSubmit}
            handleCopyStoreUrl={handleCopyStoreUrl}
            handleEditStore={handleEditStore}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            setIsSubmitting={setIsSubmitting}
            setStores={(stores) => setUserProfile({ ...userProfile!, stores })}
            addNotification={addNotification}
          />
        );
      case 'settings':
        return <RenderSettings isLoading={isLoading} userProfile={userProfile} />;
      case 'analytics': {
        const combinedAnalytics = (userProfile?.stores || []).reduce<Analytics>(
          (acc, store) => {
            const a: Partial<Analytics> = store.analytics ?? {};
            acc.totalViews += a.totalViews ?? 0;
            acc.viewsToday += a.viewsToday ?? 0;
            acc.viewsThisWeek += a.viewsThisWeek ?? 0;
            const productViews = a.productViews ?? {};
            Object.entries(productViews).forEach(([key, value]) => {
              acc.productViews[key] = (acc.productViews[key] || 0) + value;
            });
            return acc;
          },
          {
            totalViews: 0,
            viewsToday: 0,
            viewsThisWeek: 0,
            productViews: {},
            lastReset: new Date().toISOString(),
          }
        );
        return <StoreAnalytics analytics={combinedAnalytics} />;
      }
      default:
        return (
          <RenderDashboard
            isLoading={false}
            quickStats={quickStats}
            stores={userProfile?.stores || []}
            handleCreateStore={handleCreateStore}
            actionCards={actionCards}
            setActiveSection={setActiveSection}
            getStatusIcon={getStatusIcon}
            getButtonStyle={getButtonStyle}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center"
          aria-live="polite"
          aria-busy={isLoading}
        >
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="sr-only">Loading user profile...</span>
        </motion.div>
      ) : !userProfile ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center text-center p-6"
        >
          <h2 className="text-lg font-bold text-red-600">Error</h2>
          <p className="text-sm text-gray-700 mt-2">
            An error occurred while loading your profile. Please try again or contact support at{' '}
            <a href="mailto:support@storesaas.com" className="text-indigo-600 hover:underline">
              support@storesaas.com
            </a>.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </motion.button>
        </motion.div>
      ) : (
        <div className="flex w-full min-h-screen">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            userProfile={userProfile}
            handleLogout={handleLogout}
            navItems={navItems}
          />
          <main className="flex-1 p-3 max-w-6xl mx-auto lg:ml-64 relative">
            <header className="bg-white shadow border-b mb-4 rounded-xl sticky top-2 z-10">
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={toggleSidebar}
                    className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.button>
                  <Image
                    width={70}
                    height={70}
                    src="/zeevo.png"
                    alt="Platform Logo"
                    className="h-16 w-auto sm:h-10"
                  />
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-gray-900">
                      {activeSection === 'dashboard' ? `Welcome, ${userProfile?.name || 'User'}!` :
                       activeSection === 'store' ? 'Manage Store' :
                       activeSection === 'analytics' ? 'Manage Analytics' :
                       activeSection === 'products' ? 'Manage Products' :
                       'Settings'}
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      {activeSection === 'dashboard' ? 'Get your store online' :
                       activeSection === 'store' ? 'Manage settings, products' :
                       activeSection === 'analytics' ? 'View Store Analytics' :
                       activeSection === 'products' ? 'Manage your products' :
                       'Customize preferences'}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right text-xs sm:text-sm">
                  <p className="font-semibold text-gray-800 hidden sm:block">
                    {userProfile?.email || 'N/A'}
                  </p>
                 
                </div>
              </div>
            </header>
            {children || renderContent()}
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Notification
                  key={notification.id}
                  isOpen={notification.isOpen}
                  message={notification.message}
                  type={notification.type}
                  onClose={() => closeNotification(notification.id)}
                  duration={notification.duration}
                />
              ))}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;