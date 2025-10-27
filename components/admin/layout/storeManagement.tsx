'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ChevronDown, Eye, Loader2, ChevronLeft, ChevronRight, X, ExternalLink
} from 'lucide-react';
import StoreModal from '../modals/storeModal';

// Types
export interface Store {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address?: string;
  };
  isPublished: boolean;
  isAvailable?: boolean; // Made optional to match provided data
  analytics?: {
    lastReset?: string;
    totalViews: number;
    viewsThisWeek: number;
    viewsToday: number;
  };
  currency: string;
  domain: string;
  font: string;
  heroImage: string;
  logo: string;
  orders: string[];
  owner: string;
  pickup: {
    enabled: boolean;
    note: string;
  };
  policies: {
    returns: string;
    terms: string;
  };
  primaryColor: string;
  products: any[]; // Assuming products have at least 'name' for display
  secondaryColor: string;
  shipping: {
    enabled: boolean;
    locations: any[];
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    tiktok: string;
  };
  template: string;
  __v: number;
}

interface ApiResponse {
  stores: Store[];
  total: number;
  page: number;
  limit: number;
}

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
    <div className="relative w-full min-w-[120px] sm:w-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
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
              className="block w-full px-3 py-2 text-xs text-black hover:bg-indigo-50 text-left truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Stores Management Component
const StoresManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<string>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
        ...(searchQuery && { search: searchQuery }),
      }).toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/stores?${query}`);
      if (!response.ok) throw new Error('Failed to fetch stores');
      const result: ApiResponse = await response.json();
      console.log('Fetched stores:', result);
      setStores(result.stores);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [page, sortBy, order, searchQuery]);

  const handleSaveStore = async (updatedStore: Store) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/stores/${updatedStore._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStore),
      });
      if (!response.ok) throw new Error('Failed to update store');
      setStores(stores.map(s => (s._id === updatedStore._id ? updatedStore : s)));
      setSelectedStore(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-black">Stores Management</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 w-full bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                { value: 'name:asc', label: 'Name A-Z' },
                { value: 'name:desc', label: 'Name Z-A' },
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
        <div className="text-center text-xs text-red-600">{error}</div>
      ) : (
        <>
          <div className="rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[120px]">Name</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[150px] hidden md:table-cell">Description</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden lg:table-cell">Products</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden lg:table-cell">Orders</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden xl:table-cell">Views</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[60px] hidden sm:table-cell">Currency</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden lg:table-cell">Published</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden xl:table-cell">Created</th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-black uppercase tracking-wider min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-2 sm:px-4 py-4 text-center text-xs text-black">No stores found</td>
                  </tr>
                ) : (
                  stores.map(store => (
                    <tr key={store._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 sm:px-4 py-4 text-xs text-black truncate max-w-[150px] sm:max-w-[200px]">{store.name}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black truncate max-w-[150px] hidden md:table-cell">{store.description}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black hidden lg:table-cell">{store.products.length}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black hidden lg:table-cell">{store.orders.length}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black hidden xl:table-cell">{store.analytics?.totalViews || 0}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black hidden sm:table-cell">{store.currency}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black hidden lg:table-cell">{store.isPublished ? 'Yes' : 'No'}</td>
                      <td className="px-2 sm:px-4 py-4 text-xs text-black hidden xl:table-cell">
                        {new Date(store.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-2 sm:px-4 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <a
                            href={`https://${store.domain || store.slug}.zeevo.shop`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg hover:bg-green-100"
                          >
                            <ExternalLink className="h-4 w-4 text-green-600" />
                          </a>
                          <button
                            onClick={() => setSelectedStore(store)}
                            className="p-1 rounded-lg hover:bg-green-100"
                          >
                            <Eye className="h-4 w-4 text-green-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-black">
              Showing {stores.length} of {total} stores
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`p-2 rounded-lg ${page === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} text-gray-600`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs text-black">
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

      <StoreModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onSave={handleSaveStore}
      />
    </div>
  );
};

export default StoresManagement;