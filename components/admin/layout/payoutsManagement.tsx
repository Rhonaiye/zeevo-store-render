'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ChevronDown, Eye, Loader2, ChevronLeft, ChevronRight, X, ExternalLink, Plus, Filter, DollarSign, User, Calendar, CheckCircle
} from 'lucide-react';

// Types - Updated to match backend structure
export interface PayoutAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export interface Account {
  _id: string;
  email: string;
  name: string;
  wallet: {
    payoutAccounts: PayoutAccount[];
  };
}

export interface Payout {
  _id: string;
  accountId: Account | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  requestedAt: string;
  transactionId?: string;
  notes?: string;
  splitCode?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  payouts: Payout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalAmount: number;
}

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onCancel} />
      <div className="relative bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
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
    <div className="relative w-full min-w-[100px] sm:min-w-[120px] md:w-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2 py-1 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 truncate"
      >
        <span className="truncate">{options.find(opt => opt.value === value)?.label || label}</span>
        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0 ml-1 sm:ml-2" />
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
              className="block w-full px-2 py-1 sm:px-3 sm:py-2 text-xs text-black hover:bg-green-50 text-left truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// PayoutModal Component (inlined) - Removed create mode
const PayoutModal: React.FC<{
  payout: Payout | null;
  onClose: () => void;
  onSave: (updatedPayout: Partial<Payout>) => void;
}> = ({ payout, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Payout>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (payout) {
      setFormData(payout);
    }
  }, [payout]);

  const handleChange = (field: keyof Payout, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof Payout, child: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev as any)?.[parent], [child]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payout) {
      setShowConfirm(true);
    }
  };

  const confirmSave = () => {
    setShowConfirm(false);
    onSave(formData);
  };

  if (!payout) return null;

  const sections = [
    {
      title: 'Basic Information',
      icon: <DollarSign className="h-4 w-4" />,
      fields: [
        { label: 'Amount', key: 'amount', type: 'number', readonly: true },
        { label: 'Currency', key: 'currency', type: 'text', readonly: true },
        { label: 'Status', key: 'status', type: 'select', options: [
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
        ] },
        { label: 'Transaction ID', key: 'transactionId', type: 'text', readonly: true },
        { label: 'Split Code', key: 'splitCode', type: 'text', readonly: true },
        { label: 'Notes', key: 'notes', type: 'textarea', readonly: true },
      ],
    },
    {
      title: 'Account Details',
      icon: <User className="h-4 w-4" />,
      fields: [
        { label: 'Account ID', key: 'accountId._id', type: 'text', readonly: true },
        { label: 'Recipient Name', key: 'accountId.name', type: 'text', readonly: true },
        { label: 'Recipient Email', key: 'accountId.email', type: 'email', readonly: true },
        //@ts-ignore
        ...(formData.accountId?.wallet?.payoutAccounts || []).length > 0 ? [{ label: 'Payout Accounts', key: 'accountId.wallet.payoutAccounts', type: 'list',  items: formData.accountId.wallet.payoutAccounts.map((acc: any) => `${acc.bankName}: ${acc.accountNumber} (${acc.accountName})`) }] : [],
      ],
    },
    {
      title: 'Timestamps',
      icon: <Calendar className="h-4 w-4" />,
      fields: [
        { label: 'Requested At', key: 'requestedAt', type: 'readonly', value: new Date(formData.requestedAt || '').toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
        { label: 'Processed At', key: 'processedAt', type: 'readonly', value: (formData as any).processedAt ? new Date((formData as any).processedAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' },
        { label: 'Created At', key: 'createdAt', type: 'readonly', value: new Date(formData.createdAt || '').toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
        { label: 'Updated At', key: 'updatedAt', type: 'readonly', value: new Date(formData.updatedAt || '').toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
      ],
    },
  ];

  const renderField = (field: any) => {
    const { key, type, value, readonly, options, items } = field;
    const isNested = key.includes('.');
    const [parent, child] = isNested ? key.split('.') : [null, key];
    const currentValue = isNested ? (formData as any)?.[parent]?.[child] : (formData as any)?.[key] ?? value;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => {
      const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      if (isNested) {
        handleNestedChange(parent as keyof Payout, child, newValue);
      } else {
        handleChange(key as keyof Payout, newValue);
      }
    };

    if (type === 'readonly') {
      return <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{currentValue || 'N/A'}</p>;
    }

    if (type === 'list') {
      return (
        <div className="bg-gray-50 p-2 rounded">
          <ul className="text-xs space-y-1 max-h-20 overflow-y-auto">
            {items?.length ? items.map((item: string, i: number) => <li key={i}>{item}</li>) : <li className="text-gray-400 italic">None</li>}
          </ul>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          value={currentValue || ''}
          onChange={handleInputChange}
          readOnly={readonly}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs text-black"
        />
      );
    }

    if (type === 'select') {
      return (
        <select value={currentValue || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-black">
           {/* @ts-ignore */} 
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    }

    return (
      <input
        type={type || 'text'}
        value={currentValue || ''}
        onChange={handleInputChange}
        readOnly={readonly}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs text-black"
      />
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Payout Details: {payout?.accountId?.name || 'N/A'}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {sections.map((section, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3 flex items-center">
                  {section.icon}
                  <span className="ml-1 sm:ml-2">{section.title}</span>
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                      <div>{renderField(field)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      {showConfirm && (
        <ConfirmationModal
          title="Confirm Changes"
          message="Are you sure you want to save these changes to the payout?"
          onConfirm={confirmSave}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

// Payouts Management Component
const PayoutsManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<string>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [accountIdFilter, setAccountIdFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [pendingPayoutId, setPendingPayoutId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order: order === 'desc' ? 'desc' : 'asc',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(accountIdFilter && { accountId: accountIdFilter }),
        ...(startDateFilter && { startDate: startDateFilter }),
        ...(endDateFilter && { endDate: endDateFilter }),
      }).toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/payouts?${query}`);
      if (!response.ok) throw new Error('Failed to fetch payouts');
      const result: ApiResponse = await response.json();
      console.log('Fetched payouts:', result);
      setPayouts(result.payouts);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setTotalAmount(result.totalAmount || 0);
      setPage(result.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, sortBy, order, searchQuery, statusFilter, accountIdFilter, startDateFilter, endDateFilter]);

  const handleSavePayout = async (updatedPayout: Partial<Payout>) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/payouts/${updatedPayout._id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayout),
      });
      if (!response.ok) throw new Error('Failed to update payout');
      await fetchPayouts();
      setSelectedPayout(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleMarkComplete = (payoutId: string) => {
    setPendingPayoutId(payoutId);
    setShowConfirmComplete(true);
  };

  const confirmMarkComplete = async () => {
    if (!pendingPayoutId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/payouts/${pendingPayoutId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to mark payout as complete');
      await fetchPayouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setShowConfirmComplete(false);
      setPendingPayoutId(null);
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setAccountIdFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <>
      <div className="p-2 sm:p-4 md:p-6 bg-white min-h-screen">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-black">Payouts Management</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto flex-wrap">
            <div className="relative w-full sm:w-48 md:w-64">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payouts..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-7 sm:pl-10 pr-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 w-full bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto items-center justify-start sm:justify-center">
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
                  { value: 'amount:asc', label: 'Amount Low-High' },
                  { value: 'amount:desc', label: 'Amount High-Low' },
                ]}
                label="Sort By"
              />
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                ]}
                label="Status"
              />
              <input
                type="text"
                placeholder="Account ID"
                value={accountIdFilter}
                onChange={e => setAccountIdFilter(e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs text-black w-24 sm:w-32"
              />
              <input
                type="date"
                value={startDateFilter}
                onChange={e => setStartDateFilter(e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs text-black w-28 sm:w-auto"
              />
              <input
                type="date"
                value={endDateFilter}
                onChange={e => setEndDateFilter(e.target.value)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs text-black w-28 sm:w-auto"
              />
              <button
                onClick={resetFilters}
                className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-xs flex items-center whitespace-nowrap"
              >
                <Filter className="h-3 w-3 mr-1" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="text-center text-xs text-red-600 p-4">{error}</div>
        ) : (
          <>
            <div className="mb-3 sm:mb-4 text-xs text-black p-2 sm:p-0">
              Total Amount: {(totalAmount || 0).toLocaleString()} NGN | Showing {payouts.length} of {total} payouts
            </div>
            <div className="rounded-xl shadow-md border border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[100px]">Recipient</th>
                    <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden sm:table-cell">Amount</th>
                    <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[80px] hidden md:table-cell">Status</th>
                    <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[100px] hidden lg:table-cell">Transaction ID</th>
                    <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider min-w-[120px] hidden xl:table-cell">Requested At</th>
                    <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-right text-xs font-medium text-black uppercase tracking-wider min-w-[60px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 sm:px-4 py-4 text-center text-xs text-black">No payouts found</td>
                    </tr>
                  ) : (
                    payouts.map(payout => (
                      <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 text-xs text-black truncate max-w-[120px] sm:max-w-[150px]">
                          {payout.accountId ? `${payout.accountId.name} (${payout.accountId.email})` : 'N/A'}
                        </td>
                        <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 text-xs text-black hidden sm:table-cell">{payout.currency} {(payout.amount || 0).toLocaleString()}</td>
                        <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 text-xs text-black hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 text-xs text-black truncate max-w-[100px] hidden lg:table-cell">{payout.transactionId || 'N/A'}</td>
                        <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 text-xs text-black hidden xl:table-cell">
                          {new Date(payout.requestedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 text-right">
                          <div className="flex justify-end space-x-1 sm:space-x-2">
                            {payout.status === 'pending' && (
                              <button
                                onClick={() => handleMarkComplete(payout._id)}
                                className="p-1 rounded-lg hover:bg-green-100 text-green-600"
                                title="Mark as Complete"
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPayout(payout)}
                              className="p-1 rounded-lg hover:bg-green-100"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs text-black text-center sm:text-left">
                Showing {payouts.length} of {total} payouts
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`p-1 sm:p-2 rounded-lg ${page === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} text-gray-600`}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <span className="text-xs text-black">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className={`p-1 sm:p-2 rounded-lg ${page >= totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} text-gray-600`}
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {showConfirmComplete && pendingPayoutId && (
          <ConfirmationModal
            title="Mark Payout as Complete"
            message="Are you sure you want to mark this payout as complete? This action cannot be undone."
            onConfirm={confirmMarkComplete}
            onCancel={() => setShowConfirmComplete(false)}
          />
        )}
      </div>

      <PayoutModal
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        onSave={handleSavePayout}
      />
    </>
  );
};

export default PayoutsManagement;