'use client';

import React, { useState, useEffect } from 'react';
import { Users, Store, DollarSign, ShoppingBag, Clock, Loader2, Zap, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';

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
  const colors: Record<string, { bg: string; text: string; ring: string }> = {
    active: { bg: 'bg-black/10', text: 'text-black', ring: 'ring-black/20' },
    suspended: { bg: 'bg-black/10', text: 'text-black', ring: 'ring-black/20' },
    pending: { bg: 'bg-black/5', text: 'text-black/60', ring: 'ring-black/10' },
    paid: { bg: 'bg-black/10', text: 'text-black', ring: 'ring-black/20' },
    failed: { bg: 'bg-black/10', text: 'text-black', ring: 'ring-black/20' },
  };
  const color = colors[status] || { bg: 'bg-black/5', text: 'text-black/60', ring: 'ring-black/10' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${color.bg} ${color.text} ${color.ring}`}>
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
  <div className={`relative rounded-2xl p-4 shadow-lg border bg-white border-black/10 overflow-hidden`}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-widest uppercase text-black/50">{title}</p>
        <p className="text-xl font-black text-black">{value}</p>
        <p className={`text-xs font-bold flex items-center gap-1 text-black/70`}>
          <Zap className="h-3 w-3" /> {change >= 0 ? '+' : ''}{change}% <span className="text-xs text-black/40">Δ last cycle</span>
        </p>
      </div>
      <div className={`p-2 rounded-xl ${color} shadow-md`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    {trendData && (
      <div className="mt-3 h-8 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
      <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-black/10 shadow-lg">
        <div className="relative">
          <Loader2 className="h-8 w-8 text-black animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-black bg-black/5 p-4 rounded-2xl shadow-lg border border-black/10">
        <Activity className="h-6 w-6 mx-auto mb-2 text-black" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 min-h-screen bg-white relative overflow-hidden">
      {/* Static background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-black/5 rounded-full mix-blend-multiply filter blur-xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-black/5 rounded-full mix-blend-multiply filter blur-xl" />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-black/5 rounded-full mix-blend-multiply filter blur-xl" />
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <MetricCard
          title="Total Users"
          value={data?.totals?.users || 0}
          change={80}
          icon={Users}
          color="bg-black"
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
          color="bg-black"
          trendData={data?.recentStores?.map(store => ({
            date: new Date(store.createdAt).toLocaleDateString(),
            value: 1,
          }))}
        />
        <MetricCard
          title="Revenue"
          value={`₦${data?.totals?.revenue?.toLocaleString('en-NG') || 0}`}
          change={15}
          icon={DollarSign}
          color="bg-black"
          trendData={aggregatedChartData.map(t => ({ date: t.date, value: t.revenue }))}
        />
        <MetricCard
          title="Total Orders"
          value={data?.totals?.orders || 0}
          change={-3}
          icon={ShoppingBag}
          color="bg-black"
          trendData={aggregatedChartData.map(t => ({ date: t.date, value: t.orders }))}
        />
      </div>

      {/* Chart Section */}
      <div className="relative z-10 rounded-2xl p-6 shadow-lg bg-white border border-black/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-black">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-black">Revenue & Orders</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartRange('week')}
              className={`px-3 py-1 rounded-full text-xs font-bold border border-black/20 ${chartRange === 'week' ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`}
            >
              Week
            </button>
            <button
              onClick={() => setChartRange('month')}
              className={`px-3 py-1 rounded-full text-xs font-bold border border-black/20 ${chartRange === 'month' ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`}
            >
              Month
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={aggregatedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#000" tick={{ fontSize: 10, fontWeight: 500 }} />
            <YAxis stroke="#000" tick={{ fontSize: 10, fontWeight: 500 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                fontSize: '11px',
                padding: '8px',
              }}
              labelStyle={{ color: '#000', fontWeight: 'bold' }}
              itemStyle={{ color: '#000' }}
            />
            <Bar dataKey="revenue" fill="#000" radius={[6, 6, 0, 0]} barSize={18} />
            <Line type="monotone" dataKey="orders" stroke="#000" strokeWidth={2} dot={{ fill: '#000', strokeWidth: 1, r: 3 }} activeDot={{ r: 5, fill: '#000' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Stores and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
        {/* Top Stores */}
        <div className="rounded-2xl p-6 shadow-lg bg-white border border-black/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-black">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-black">Top Stores</h3>
            </div>
            <button className="text-black hover:text-black/80 text-xs font-bold flex items-center gap-1">
              View all <Zap className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {data?.topStoresByOrders?.slice(0, 4).map((store) => (
              <div
                key={store._id}
                className="flex items-center justify-between p-4 rounded-xl bg-black/5 border border-black/10"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-black" />
                    <span className="text-sm font-bold text-black">{store.store.name}</span>
                    <StatusBadge status={store.store.isPublished ? 'active' : 'pending'} />
                  </div>
                  <p className="text-xs text-black/50">{store.store.products.length} products</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-black">{store.store.analytics.totalViews.toLocaleString()} views</p>
                  <p className="text-xs text-black/50">{new Date(store.store.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl p-6 shadow-lg bg-white border border-black/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-black">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-black">Recent Activity</h3>
            </div>
            <button className="text-black hover:text-black/80 text-xs font-bold flex items-center gap-1">
              View all <Zap className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {data?.recentOrders?.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-start space-x-3 p-4 rounded-xl bg-black/5 border border-black/10"
              >
                <div className="p-2 rounded-full bg-black mt-0.5">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-black">Order: ₦{order.totalAmount.toLocaleString('en-NG')}</p>
                  <p className="text-xs text-black/50 mt-1 flex items-center gap-2">
                    {order.customer?.fullName || 'Customer'} • {new Date(order.createdAt).toLocaleString()} <div className="w-1 h-1 rounded-full bg-black/40" />
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