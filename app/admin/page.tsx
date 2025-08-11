'use client';
import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, User, ChevronDown, LayoutDashboard, Users, Store, Package, ShoppingCart, 
  CreditCard, BarChart3, Settings, DollarSign, ShoppingBag, Eye, Edit, Trash2, Filter, Plus, Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

interface ApiData {
  users: {
    active: number;
    trial: number;
    expired: number;
  };
  orders: number;
  stores: number;
  revenue: number;
  recentOrders: Order[];
  recentStores: Store[];
}

const ZeevoAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/summary`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result: ApiData = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const revenueData = data?.recentOrders?.map(order => ({
    name: new Date(order.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    revenue: order.totalAmount
  })) || [];

  const subscriptionData = [
    { name: 'Active', value: data?.users?.active || 0, color: '#4F46E5' },
    { name: 'Trial', value: data?.users?.trial || 0, color: '#10B981' },
    { name: 'Expired', value: data?.users?.expired || 0, color: '#F59E0B' },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100/80 text-green-800 backdrop-blur-sm',
      suspended: 'bg-red-100/80 text-red-800 backdrop-blur-sm',
      pending: 'bg-yellow-100/80 text-yellow-800 backdrop-blur-sm',
      paid: 'bg-green-100/80 text-green-800 backdrop-blur-sm',
      failed: 'bg-red-100/80 text-red-800 backdrop-blur-sm',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100/80 text-gray-800 backdrop-blur-sm'}`}>
        {status}
      </span>
    );
  };

  const MetricCard: React.FC<{ title: string; value: string | number; change: number; icon: React.ComponentType<any>; color: string }> = 
    ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Active Users" value={data?.users?.active || 0} change={12} icon={Users} color="bg-gradient-to-br from-indigo-600 to-indigo-800" />
            <MetricCard title="Total Stores" value={data?.stores || 0} change={8} icon={Store} color="bg-gradient-to-br from-gray-800 to-black" />
            <MetricCard 
              title="Monthly Revenue" 
              value={`₦${data?.revenue.toLocaleString('en-NG') || 0}`} 
              change={15} 
              icon={DollarSign} 
              color="bg-gradient-to-br from-indigo-600 to-indigo-800" 
            />
            <MetricCard title="Total Orders" value={data?.orders || 0} change={-3} icon={ShoppingBag} color="bg-gradient-to-br from-gray-800 to-black" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip formatter={(value: number) => [`₦${value.toLocaleString('en-NG')}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">User Types</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">View all</button>
              </div>
              <div className="space-y-3">
                {data?.recentOrders?.slice(0, 4).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg hover:bg-gray-100/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">#{order._id.slice(-6)}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{order.customer.fullName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₦{order.totalAmount.toLocaleString('en-NG')}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Stores</h3>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">View all</button>
              </div>
              <div className="space-y-3">
                {data?.recentStores?.slice(0, 4).map((store) => (
                  <div key={store._id} className="flex items-center justify-between p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg hover:bg-gray-100/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{store.name}</span>
                        <StatusBadge status={store.isPublished ? 'active' : 'pending'} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{store.products.length} products</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{store.analytics.totalViews} views</p>
                      <p className="text-xs text-gray-500">{new Date(store.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <button className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-900 flex items-center space-x-2 transition-all duration-300">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100/50">
            <thead className="bg-gray-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Store Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {data?.recentStores?.map((store) => (
                <tr key={store._id} className="hover:bg-gray-100/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{store.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.contact.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.products.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.analytics.totalViews}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={store.isPublished ? 'active' : 'pending'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 transition-colors"><Eye className="h-4 w-4" /></button>
                      <button className="text-yellow-600 hover:text-yellow-800 transition-colors"><Edit className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-800 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      default: return <div className="text-center py-12 text-gray-600">{activeTab} management coming soon...</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white/80 backdrop-blur-md shadow-xl transition-all duration-300 flex flex-col border-r border-gray-100/50`}>
        <div className="p-4 border-b border-gray-100/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            {sidebarOpen && <span className="font-bold text-xl text-gray-900">Zeevo Admin</span>}
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === item.id ? 'bg-indigo-100/80 text-indigo-700 backdrop-blur-sm' : 'text-gray-600 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100/80 transition-colors">
                <LayoutDashboard className="h-5 w-5 text-gray-600" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-96 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100/80 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">Admin</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ZeevoAdminDashboard;