'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronDown, Eye, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

// Types
interface User {
  _id: string;
  email: string;
}

interface Subscription {
  _id: string;
  userId: User | null;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentReference: string;
  paymentStatus: string;
  createdAt: string;
}

interface ApiResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Custom Dropdown Component
const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}> = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
      >
        <span className="truncate">{options.find(opt => opt.value === value)?.label || label}</span>
        <ChevronDown className="h-4 w-4 text-gray-600 flex-shrink-0 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="block w-full px-3 py-2 text-sm text-gray-900 hover:bg-indigo-50 text-left truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Subscription Management Component
const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<string>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        order,
        ...(searchQuery && { search: searchQuery }),
      }).toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/subscriptions?${query}`);
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const result: ApiResponse = await response.json();
      setSubscriptions(result.subscriptions);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter, sortBy, order, searchQuery]);

  const handleViewDetails = (subscriptionId: string) => {
    router.push(`/admin/subscriptions/${subscriptionId}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <CustomDropdown
              value={statusFilter}
              onChange={value => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'pending', label: 'Pending' },
              ]}
              label="Filter by Status"
            />
            <CustomDropdown
              value={`${sortBy}:${order}`}
              onChange={value => {
                const [newSortBy, newOrder] = value.split(':');
                setSortBy(newSortBy);
                setOrder(newOrder);
                setPage(1);
              }}
              options={[
                { value: 'createdAt:desc', label: 'Newest First' },
                { value: 'createdAt:asc', label: 'Oldest First' },
                { value: 'planName:asc', label: 'Plan A-Z' },
                { value: 'planName:desc', label: 'Plan Z-A' },
                { value: 'amount:asc', label: 'Amount Low-High' },
                { value: 'amount:desc', label: 'Amount High-Low' },
              ]}
              label="Sort By"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <>
          <div className="rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 sm:px-6 py-4 text-center text-gray-500">No subscriptions found</td>
                  </tr>
                ) : (
                  subscriptions.map(subscription => (
                    <tr key={subscription._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{subscription.userId?.email || 'N/A'}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-900">{subscription.planName}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500">
                        {subscription.amount.toLocaleString()} {subscription.currency}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={subscription.status} />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(subscription._id)}
                          className="p-1 rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4 text-indigo-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {subscriptions.length} of {total} subscriptions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`p-2 rounded-lg ${page === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} text-gray-600`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`p-2 rounded-lg ${page === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} text-gray-600`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionManagement;