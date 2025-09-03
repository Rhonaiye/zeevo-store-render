'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ChevronDown, Eye, Loader2, ChevronLeft, ChevronRight, X
} from 'lucide-react';

// Types
interface User {
  _id: string;
  fullName: string;
  email: string;
  status: 'pro' | 'free' | 'premium';
  role: 'admin' | 'user';
  createdAt: string;
}

interface ApiResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    pro: 'bg-indigo-100 text-indigo-800',
    free: 'bg-gray-100 text-gray-800',
    premium: 'bg-black text-white',
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

// User Modal Component
const UserModal: React.FC<{
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<User | null>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  if (!user || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">User Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as 'pro' | 'free' | 'premium' })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pro">Pro</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<string>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/users?${query}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const result: ApiResponse = await response.json();
      setUsers(result.users);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, sortBy, order, searchQuery]);

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/users/${updatedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) throw new Error('Failed to update user');
      setUsers(users.map(u => (u._id === updatedUser._id ? updatedUser : u)));
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
                { value: 'pro', label: 'Pro' },
                { value: 'free', label: 'Free' },
                { value: 'premium', label: 'Premium' },
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
                { value: 'fullName:asc', label: 'Name A-Z' },
                { value: 'fullName:desc', label: 'Name Z-A' },
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
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-900">{user.fullName}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{user.email}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500">{user.role}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
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
              Showing {users.length} of {total} users
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

      <UserModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManagement;