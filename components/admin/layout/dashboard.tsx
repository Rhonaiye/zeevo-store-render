'use client';

import React, { useState, useEffect } from 'react';
import { Users, Store, DollarSign, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// Types
interface Store {
  _id: string;
  name: string;
  isPublished: boolean;
  products: string[];
  analytics: { totalViews: number };
  createdAt: string;
}

interface TopStore {
  _id: string;
  orders: number;
  revenue: number;
  store: Store;
}

interface ApiData {
  totals: {
    users: number;
    stores: number;
    orders: number;
    revenue: number;
  };
  usersByStatus: {
    active: number;
    trial: number;
    expired: number;
  };
  topStoresByOrders: TopStore[];
  recentOrders: {
    _id: string;
    storeId: any;
    customer: any;
    items: any[];
    totalAmount: number;
    createdAt: string;
  }[];
  recentStores: Store[];
  topStoresByRevenue: TopStore[];
}

// Shared Utility Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30',
    suspended: 'bg-rose-500/10 text-rose-600 ring-rose-500/30',
    pending: 'bg-amber-500/10 text-amber-600 ring-amber-500/30',
    paid: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30',
    failed: 'bg-rose-500/10 text-rose-600 ring-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset transition-all duration-300 hover:ring-2 ${colors[status] || 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trendData?: { date: string; value: number }[];
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color, trendData }) => (
  <div className={`rounded-xl p-4 shadow-lg border bg-gradient-to-br from-white to-gray-50 border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        <p className={`text-xs font-medium ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
          {change >= 0 ? '+' : ''}{change}% <span className="text-[10px] text-gray-400">vs last month</span>
        </p>
      </div>
      <div className={`p-2 rounded-full ${color} transform transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    {trendData && (
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={trendData}>
          <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={1.5} dot={false} strokeDasharray={change < 0 ? "3 3" : undefined} />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<'week' | 'month'>('week');

  // Fetch data from API
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

  // Transform recent orders into trend data for chart
  const chartData = data?.recentOrders?.map(order => ({
    date: new Date(order.createdAt).toLocaleDateString(),
    revenue: order.totalAmount,
    orders: 1,
  })) || [];

  // Aggregate trend data by date
  const aggregatedChartData = chartData.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      existing.revenue += curr.revenue;
      existing.orders += curr.orders;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, [] as { date: string; revenue: number; orders: number }[]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-rose-500 text-sm font-semibold bg-rose-50 p-4 rounded-xl shadow-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={data?.totals?.users || 0}
          change={12}
          icon={Users}
          color="bg-gradient-to-tr from-violet-600 to-indigo-500"
          trendData={data?.recentOrders?.map(order => ({
            date: new Date(order.createdAt).toLocaleDateString(),
            value: 1,
          }))}
        />
        <MetricCard
          title="Total Stores"
          value={data?.totals?.stores || 0}
          change={8}
          icon={Store}
          color="bg-gradient-to-tr from-gray-700 to-gray-900"
          trendData={data?.recentStores?.map(store => ({
            date: new Date(store.createdAt).toLocaleDateString(),
            value: 1,
          }))}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`₦${data?.totals?.revenue?.toLocaleString('en-NG') || 0}`}
          change={15}
          icon={DollarSign}
          color="bg-gradient-to-tr from-violet-600 to-indigo-500"
          trendData={aggregatedChartData.map(t => ({ date: t.date, value: t.revenue }))}
        />
        <MetricCard
          title="Total Orders"
          value={data?.totals?.orders || 0}
          change={-3}
          icon={ShoppingBag}
          color="bg-gradient-to-tr from-gray-700 to-gray-900"
          trendData={aggregatedChartData.map(t => ({ date: t.date, value: t.orders }))}
        />
      </div>

      {/* Chart Section */}
      <div className="rounded-xl p-6 shadow-lg border bg-gradient-to-br from-white to-gray-50 border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Revenue & Orders</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartRange('week')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${chartRange === 'week' ? 'bg-violet-600 text-white shadow-md hover:shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Week
            </button>
            <button
              onClick={() => setChartRange('month')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${chartRange === 'month' ? 'bg-violet-600 text-white shadow-md hover:shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Month
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={aggregatedChartData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" opacity={0.3} />
            <XAxis dataKey="date" stroke="#4B5563" tick={{ fontSize: 10, fontWeight: 500 }} />
            <YAxis stroke="#4B5563" tick={{ fontSize: 10, fontWeight: 500 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                padding: '8px',
              }}
            />
            <Bar dataKey="revenue" fill="#7C3AED" radius={[8, 8, 0, 0]} barSize={20} />
            <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Stores and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Stores */}
        <div className="rounded-xl p-6 shadow-lg border bg-gradient-to-br from-white to-gray-50 border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Top Stores</h3>
            <button className="text-violet-600 hover:text-violet-500 text-xs font-semibold transition-colors duration-300 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {data?.topStoresByOrders?.slice(0, 4).map(store => (
              <div
                key={store._id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/50 border border-gray-100/50 transition-all duration-300 hover:bg-violet-50/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{store.store.name}</span>
                    <StatusBadge status={store.store.isPublished ? 'active' : 'pending'} />
                  </div>
                  <p className="text-xs text-gray-500">{store.store.products.length} products</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{store.store.analytics.totalViews} views</p>
                  <p className="text-[10px] text-gray-500">{new Date(store.store.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl p-6 shadow-lg border bg-gradient-to-br from-white to-gray-50 border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Activity</h3>
            <button className="text-violet-600 hover:text-violet-500 text-xs font-semibold transition-colors duration-300 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {data?.recentOrders?.slice(0, 5).map(order => (
              <div
                key={order._id}
                className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 border border-gray-100/50 transition-all duration-300 hover:bg-violet-50/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <Clock className="h-5 w-5 text-violet-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">Order placed for ₦{order.totalAmount.toLocaleString('en-NG')}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {order.customer?.fullName || 'Customer'} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;