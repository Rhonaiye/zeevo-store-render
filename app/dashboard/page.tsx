'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import {
  Home, Store, Settings, Plus, Edit3, Eye, BarChart3, Loader2, Package, Menu,
  CheckCircle, Clock, ShoppingCart,
  Wallet, User, LogOut
} from 'lucide-react';
import Image from 'next/image';
import RenderDashboard from '@/components/layout/dashboard';
import RenderSettings from '@/components/layout/settings';
import RenderStoreManagement from '@/components/layout/storeManagement';
import RenderProductsManagement from '@/components/layout/productManagement';
import StoreAnalytics from '@/components/layout/storeAnalytics';
import Notification from '@/components/ui/notification';
import Sidebar from '@/components/ui/sideBar';
import { useAppStore, Analytics, Product, UserProfile, NavItem, ActionCard, QuickStat, FormData, ProductFormData, NotificationData, Store as IStore } from '@/store/useAppStore';
import OrdersManagement from '@/components/layout/ordersManagement';
import { DashboardSkeleton } from '@/components/loaders/skeletonLoader';
import PayoutsView from '@/components/layout/payoutsView';
import NotificationButton from '@/components/ui/notificatonButton';

// Define the Dashboard component without props
const Dashboard: React.FC = () => {
  const { userProfile, setUserProfile } = useAppStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

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
      prev.map((n) => (n.id === id ? { ...n, isOpen: false } : n))
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

  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    const token = Cookies.get('token');
    if (!token) {
      addNotification('Authentication error: No token found. Please log in.', 'error');
      setTimeout(() => router.push('/auth/login'), 2000);
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          addNotification('Session expired. Please log in again.', 'error');
          Cookies.remove('token');
          setTimeout(() => router.push('/auth/login'), 2000);
          return null;
        }
        throw new Error('Profile fetch failed');
      }

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
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'payouts', name: 'Payouts', icon: Wallet },
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


  const getStatusIcon = (status: string) => {
    return status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
           status === 'coming-soon' ? <Clock className="w-4 h-4 text-amber-500" /> : null;
  };

  const getButtonStyle = (card: ActionCard) => {
    return card.status === 'disabled' ? 'bg-gray-300 text-white cursor-not-allowed' :
           card.status === 'coming-soon' ? 'bg-amber-100 text-amber-700 cursor-not-allowed' :
           card.primary ? 'bg-transparent border border-[#41DD60] text-[#41DD60]' :
           'bg-transparent border border-[#41DD60] text-[#41DD60] hover:bg-[#F3FFF4]/5';
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
              actionCards={actionCards}
              setActiveSection={setActiveSection}
              getStatusIcon={getStatusIcon}
              addNotification={addNotification}
              getButtonStyle={getButtonStyle}
            />
          )
        );
      case 'products':
        return (
          <RenderProductsManagement addNotification={addNotification} fetchUserProfile={fetchUserProfile}/>
        );
      case 'orders':
        return (
          <OrdersManagement/>
        );
      case 'payouts':
        return (
          <PayoutsView/>
        )
      case 'store':
        return (
          <RenderStoreManagement
            fetchUserProfile={fetchUserProfile}
            addNotification={addNotification}
          />
        );
      case 'settings':
        return <RenderSettings isLoading={isLoading} addNotification={addNotification}/>;

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
        return <StoreAnalytics/>;
      }
      default:
        return (
          <RenderDashboard
            isLoading={false}
            addNotification={addNotification}
            quickStats={quickStats}
            stores={userProfile?.stores || []}
            actionCards={actionCards}
            setActiveSection={setActiveSection}
            getStatusIcon={getStatusIcon}
            getButtonStyle={getButtonStyle}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FFF4] flex items-center justify-center">
      {isLoading ? (
        <motion.div>
        <DashboardSkeleton/>
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
            Unable to load your profile. Please try again or log in again. Contact support at{' '}
            <a href="mailto:support@storesaas.com" className="text-indigo-600 hover:underline">
              support@storesaas.com
            </a> if the issue persists.
          </p>
          <div className="mt-4 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Login
            </motion.button>
          </div>
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
           
          <main className="flex-1 p-3 pb-14 max-w-6xl mx-auto lg:ml-64 relative">
        
            
            <header className="bg-[#C4FEC8]/20 border-b mb-4 rounded-xl w-full z-10">
              <div className="px-4 py-3 flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={toggleSidebar}
                    className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.button>
                  <User className="w-6 h-6 text-gray-600 hidden sm:block mr-3" />
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-[#585555]">
                      {activeSection === 'dashboard' ? `Welcome, ${userProfile?.name?.split(" ")[0] || 'User'}!` :
                       activeSection === 'store' ? 'Manage Store' :
                       activeSection === 'analytics' ? 'Manage Analytics' :
                       activeSection === 'products' ? 'Manage Products' :
                       activeSection === 'orders' ? 'Manage Orders' :
                       activeSection === 'zeevo_wallet' ? 'Zeevo Wallet' :
                       'Settings'}
                    </h1>
                    <p className="text-xs sm:text-sm font-light text-gray-600">
                      {activeSection === 'dashboard' ? 'Get your store online' :
                       activeSection === 'store' ? 'Manage settings, products' :
                       activeSection === 'analytics' ? 'View Store Analytics' :
                       activeSection === 'products' ? 'Manage your products' :
                       activeSection === 'orders' ? 'Manage your orders' :
                       activeSection === 'zeevo_wallet' ? 'Manage your earnings and withdrawals' :
                       'Customize preferences'}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right ml-auto">
                 <NotificationButton/>
                </div>
              </div>
            </header>
            {renderContent()}
           
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
