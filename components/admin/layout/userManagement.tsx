'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ChevronDown, Eye, Loader2, ChevronLeft, ChevronRight, X, UserX, Crown
} from 'lucide-react';

// Types
interface Store {
  _id: string;
  name: string;
  domain: string;
  createdAt: string;
}

interface PayoutAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  status: string;
}

interface KYC {
  isVerified: boolean;
  type: string;
}

interface Subscription {
  plan: string;
  status: string;
  paymentProvider: string;
  subscriptionEndsAt: string;
}

interface Wallet {
  balance: number;
  payoutAccounts: PayoutAccount[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  kyc: KYC;
  stores: Store[];
  subscription: Subscription;
  wallet: Wallet;
  __v: number;
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
    pro: 'bg-gray-100 text-gray-800',
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
        className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 truncate"
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
              className="block w-full px-3 py-2 text-xs text-gray-900 hover:bg-gray-50 text-left truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Confirmation Overlay Component
const ConfirmationOverlay: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}> = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-xs"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-white rounded-lg text-xs flex items-center ${isLoading ? 'bg-red-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

// User Modal Component
const UserModal: React.FC<{
  user: User | null;
  onClose: () => void;
  onSuspend: () => Promise<void>;
  onGivePro: () => Promise<void>;
}> = ({ user, onClose, onSuspend, onGivePro }) => {
  const [formData, setFormData] = useState<Partial<User> | null>(user ? { ...user, password: undefined } : null);
  const [activeTab, setActiveTab] = useState<'basic' | 'kyc' | 'subscription' | 'stores' | 'wallet' | 'actions'>('basic');
  const [showProConfirm, setShowProConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: undefined });
    }
    setModalError(null);
  }, [user]);

  if (!user || !formData) return null;

  const handleSuspendUser = async () => {
    try {
      setIsActionLoading(true);
      setModalError(null);
      await onSuspend();
      setShowSuspendConfirm(false);
      onClose();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGivePro = async () => {
    try {
      setIsActionLoading(true);
      setModalError(null);
      await onGivePro();
      setShowProConfirm(false);
      onClose();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const TabButton = ({ tab, label, icon }: { tab: typeof activeTab; label: string; icon?: React.ReactNode }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setModalError(null);
      }}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  const renderBasicSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ID</label>
          <input
            type="text"
            value={formData._id}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name || ''}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
          <input
            type="text"
            value={formData.role || ''}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Joined</label>
          <input
            type="text"
            value={formatDate(formData.createdAt || '')}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Updated</label>
          <input
            type="text"
            value={formatDate(formData.updatedAt || '')}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Email Verified</label>
          <input
            type="text"
            value={formData.isVerified ? 'Yes' : 'No'}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderKYCSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Verified</label>
        <input
          type="text"
          value={formData.kyc?.isVerified ? 'Yes' : 'No'}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
        <input
          type="text"
          value={formData.kyc?.type || 'none'}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
        />
      </div>
    </div>
  );

  const renderSubscriptionSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
        <input
          type="text"
          value={formData.subscription?.plan || ''}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
        <input
          type="text"
          value={formData.subscription?.status || ''}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Provider</label>
        <input
          type="text"
          value={formData.subscription?.paymentProvider || ''}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Ends At</label>
        <input
          type="text"
          value={formData.subscription ? formatDate(formData.subscription.subscriptionEndsAt) : ''}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
        />
      </div>
    </div>
  );

  const renderStoresSection = () => (
    <>
      {formData.stores && formData.stores.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.stores.map((store) => (
                <tr key={store._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">{store.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{store.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formatDate(store.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">No stores associated with this user.</p>
      )}
    </>
  );

  const renderWalletSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Balance</label>
          <input
            type="text"
            value={`$${formData.wallet?.balance?.toFixed(2) || '0.00'}`}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-100 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Payout Accounts</label>
        {formData.wallet?.payoutAccounts && formData.wallet.payoutAccounts.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.wallet.payoutAccounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">{account.accountName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{account.accountNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{account.bankName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        account.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No payout accounts configured.</p>
        )}
      </div>
    </div>
  );

  const renderActionsSection = () => (
    <div className="space-y-6">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h5 className="text-xs font-semibold text-red-800 mb-2 flex items-center">
          <UserX className="h-4 w-4 mr-2" />
          Suspend User
        </h5>
        <p className="text-xs text-red-700 mb-4">This action will suspend the user's account, preventing access to features.</p>
        <button
          onClick={() => setShowSuspendConfirm(true)}
          disabled={isActionLoading}
          className={`px-4 py-2 ${isActionLoading ? 'bg-red-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg text-xs font-medium transition-colors flex items-center`}
        >
          {isActionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Suspend
        </button>
      </div>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h5 className="text-xs font-semibold text-yellow-800 mb-2 flex items-center">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Pro
        </h5>
        <p className="text-xs text-yellow-700 mb-4">Grant Pro subscription to the user. This requires confirmation.</p>
        <button
          onClick={() => setShowProConfirm(true)}
          disabled={isActionLoading}
          className={`px-4 py-2 ${isActionLoading ? 'bg-yellow-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg text-xs font-medium transition-colors flex items-center`}
        >
          {isActionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Give Pro
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[95vh] overflow-hidden m-4 shadow-2xl border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <p className="text-xs text-gray-500 mt-1">View and edit user information</p>
            </div>
            <button onClick={() => { onClose(); setModalError(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {modalError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{modalError}</p>
            </div>
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              <TabButton tab="basic" label="Basic" />
              <TabButton tab="kyc" label="KYC" />
              <TabButton tab="subscription" label="Subscription" />
              <TabButton tab="stores" label="Stores" />
              <TabButton tab="wallet" label="Wallet" />
              <TabButton tab="actions" label="Actions" />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div>
                {activeTab === 'basic' && renderBasicSection()}
                {activeTab === 'kyc' && renderKYCSection()}
                {activeTab === 'subscription' && renderSubscriptionSection()}
                {activeTab === 'stores' && renderStoresSection()}
                {activeTab === 'wallet' && renderWalletSection()}
                {activeTab === 'actions' && renderActionsSection()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProConfirm && (
        <ConfirmationOverlay
          title="Confirm Pro Upgrade"
          message="Are you sure you want to upgrade this user to Pro subscription? This action cannot be undone without further changes."
          onConfirm={handleGivePro}
          onCancel={() => setShowProConfirm(false)}
          confirmText="Upgrade to Pro"
          isLoading={isActionLoading}
        />
      )}

      {showSuspendConfirm && (
        <ConfirmationOverlay
          title="Confirm Suspension"
          message="Are you sure you want to suspend this user? They will lose access to their account and features."
          onConfirm={handleSuspendUser}
          onCancel={() => setShowSuspendConfirm(false)}
          confirmText="Suspend User"
          isLoading={isActionLoading}
        />
      )}
    </>
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
      setError(null);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        order,
        ...(searchQuery && { search: searchQuery }),
      }).toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/users?${query}`);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch users: ${errText}`);
      }
      const result: ApiResponse = await response.json();
      console.log(result)
      setUsers(result.users);
      setTotal(result.total);
      setPage(result.page);
    } catch (err) {
      console.error('fetchUsers error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOldestUser = async () => {
    try {
      const query = new URLSearchParams({
        page: '1',
        limit: '1',
        sortBy: 'createdAt',
        order: 'asc',
      }).toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/users?${query}`);
      if (!response.ok) throw new Error('Failed to fetch oldest user');
      const result: ApiResponse = await response.json();
      if (result.users.length > 0) {
        console.log('Oldest user from all 31:', result.users[0]);
      }
    } catch (err) {
      console.error('Error fetching oldest user:', err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    fetchOldestUser();
    fetchUsers();
  }, [page, statusFilter, sortBy, order, searchQuery]);

  const handleSuspend = async (): Promise<void> => {
    // --- Guard: Ensure a user is selected ---
    const userId = selectedUser?._id;
    if (!userId) {
      throw new Error('No user selected.');
    }

    // --- Guard: Ensure API base URL exists ---
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('Internal configuration error. Missing API base URL.');
    }

    // --- Make API call ---
    const response = await fetch(`${baseUrl}/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'subscription.status': 'suspended' }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to suspend user: ${errText}`);
    }

    // --- Refresh user list ---
    await fetchUsers();
    setSelectedUser(null);
  };

  const handleGivePro = async (): Promise<void> => {
    // --- Guard: Ensure a user is selected ---
    const userId = selectedUser?._id;
    if (!userId) {
      throw new Error('No user selected.');
    }

    // --- Guard: Ensure API base URL exists ---
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('Internal configuration error. Missing API base URL.');
    }

    // --- Make API call ---
    const response = await fetch(`${baseUrl}/v1/admin/users/${userId}/upgrade/pro`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to upgrade user to Pro: ${errText}`);
    }

    // --- Refresh user list ---
    await fetchUsers();
    setSelectedUser(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
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
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base"
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
          <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-red-600 text-xs underline">Dismiss</button>
        </div>
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
                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center text-gray-500 text-xs">No users found</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-900 text-xs">{user.name}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{user.email}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.subscription?.plan || 'free'} />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{user.role}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1 rounded-lg hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4 text-gray-900" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
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
              <span className="text-xs text-gray-600">
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
        onSuspend={handleSuspend}
        onGivePro={handleGivePro}
      />
    </div>
  );
};

export default UserManagement;