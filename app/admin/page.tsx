'use client';


import React, { useState, useEffect } from 'react';
import { Store } from 'lucide-react';

import UserManagement from '@/components/admin/layout/userManagement';
import StoresManagement from '@/components/admin/layout/storeManagement';
import Sidebar from '@/components/admin/ui/sideBar';
import Dashboard from '@/components/admin/layout/dashboard';
import SubscriptionManagement from '@/components/admin/layout/subscriptionManagement';
import AdminManagement from '@/components/admin/layout/settingsManagement';
import SettingsManagement from '@/components/admin/layout/settingsManagement';
import ProductManagement from '@/components/admin/layout/productManagement';
import CustomerCareChat from '@/components/ui/customerCareChat';
import AdminCustomerCare from '@/components/admin/layout/customerCare';

// Types
interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

interface Order {
  _id: string;
  storeId: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentReference?: string;
  paidAt?: string;
  paymentMethod?: string;
}

interface Store {
  _id: string;
  name: string;
  slug: string;
  description: string;
  owner: string;
  isPublished: boolean;
  products: string[];
  orders: string[];
  analytics: {
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  user?: { fullName: string };
  store?: { name: string };
}

interface ApiData {
  totals: {
    users: number;
    stores: number;
    orders: number;
    revenue: number;
    arpu: string;
  };
  users: {
    active: number;
    trial: number;
    expired: number;
    growth: { date: string; value: number }[];
  };
  stores: {
    growth: { date: string; value: number }[];
    topStoresByOrders: Store[];
  };
  orders: {
    trend: { date: string; revenue: number; orders: number }[];
  };
  subscriptions: {
    trend: { date: string; value: number }[];
  };
  activityFeed: Activity[];
}



// Main Component
const ZeevoAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/summary`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result: ApiData = await response.json();
        console.log('Fetched data:', result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard/>;
      case 'users':
        return <UserManagement />;
      case 'stores':
        return <StoresManagement />;

      case 'subscriptions':
        return <SubscriptionManagement />;

      case 'settings':
        return <SettingsManagement/>;

      case 'products':
        return <ProductManagement/>; 

      case 'customer_care':
        return <AdminCustomerCare/>; 

      default:
        return <div className="text-center py-12 text-gray-600">{activeTab} management coming soon...</div>;
    }
  };

  return (
    <div className={`flex min-h-screen  bg-gradient-to-b from-gray-50 to-gray-100`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {renderContent()}
      </Sidebar>
    </div>
  );
};

export default ZeevoAdminDashboard;