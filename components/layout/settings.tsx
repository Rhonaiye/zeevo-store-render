'use client';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Camera, Crown, ArrowUpRight, Check, X, CreditCard, Ban as Bank, Plus, Trash2, ChevronDown } from 'lucide-react';
import { FC, useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Define interface for component props
interface RenderSettingsProps {
  isLoading: boolean;
  addNotification?: (message: string, type: 'success' | 'error', duration?: number) => void;
}

// Define payout account interface
interface PayoutAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  status: 'pending' | 'verified' | 'suspended';
  createdAt: string;
  isDefault: boolean;
  updatedAt: string;
  userId: string;
}

// Define the RenderSettings component
const RenderSettings: FC<RenderSettingsProps> = ({ isLoading, addNotification }) => {
  const { userProfile } = useAppStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showAddPayout, setShowAddPayout] = useState(false);
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    accountNumber: '',
    bankCode: '',
    isSubmitting: false,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // State for verification loader
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFreePlan = userProfile?.subscription?.plan?.toLowerCase() === 'free';
  const isPro = userProfile?.subscription?.plan?.toLowerCase() === 'pro';
  const router = useRouter();

  // Reduced list of Nigerian banks including OPay
  const nigerianBanks = [
    { code: '044', name: 'Access Bank' },
    { code: '058', name: 'Guarantee Trust Bank' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '057', name: 'Zenith Bank' },
    { code: '999992', name: 'OPay' },
  ];

  // Map bankCode to bankName for display
  const getBankName = (bankCode: string) => {
    const bank = nigerianBanks.find((b) => b.code === bankCode);
    return bank ? bank.name : 'Select Bank';
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Upgrade to Pro button click
  const handleUpgrade = async () => {
    router.push('/dashboard/pricing');
  };

  // Set payout accounts from userProfile
  useEffect(() => {
    if (!isLoading && userProfile?.wallet?.payoutAccounts) {
      setPayoutAccounts(
        userProfile.wallet.payoutAccounts.map((account: any) => ({
          ...account,
          status: account.status === 'active' ? 'verified' : account.status,
        }))
      );
    }
  }, [isLoading, userProfile]);

  // Handle adding payout account
  const handleAddPayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payoutForm.accountNumber || !payoutForm.bankCode) {
      if (addNotification) {
        addNotification('Please fill in all fields', 'error');
      }
      return;
    }

    setPayoutForm((prev) => ({ ...prev, isSubmitting: true }));

    const token = Cookies.get('token');
    if (!token && addNotification) {
      addNotification('Please login to access this feature', 'error');
      return;
    }

    const bankName = getBankName(payoutForm.bankCode);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/wallet/create-payout-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber: payoutForm.accountNumber,
          bankCode: payoutForm.bankCode,
          bankName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (addNotification) {
          addNotification('Payout account added successfully', 'success');
        }
        if (data.data && typeof data.data === 'object') {
          setPayoutAccounts((prev) => [...prev, {
            ...data.data,
            accountName: data.data.accountName || 'Unknown',
            bankName: getBankName(payoutForm.bankCode),
            status: data.data.status || 'pending',
            createdAt: data.data.createdAt || new Date().toISOString(),
            updatedAt: data.data.updatedAt || new Date().toISOString(),
            isDefault: data.data.isDefault || false,
            userId: data.data.userId || userProfile?._id || '',
          }]);
        } else {
          setPayoutAccounts((prev) => [
            ...prev,
            {
              _id: `temp-${Date.now()}`,
              accountName: 'Unknown',
              accountNumber: payoutForm.accountNumber,
              bankName: getBankName(payoutForm.bankCode),
              bankCode: payoutForm.bankCode,
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDefault: false,
              userId: userProfile?._id || '',
            },
          ]);
        }
        setPayoutForm({ accountNumber: '', bankCode: '', isSubmitting: false });
        setShowAddPayout(false);
      } else {
        if (addNotification) {
          addNotification(data.message || 'Failed to add payout account', 'error');
        }
      }
    } catch (error) {
      console.error('Error adding payout account:', error);
      if (addNotification) {
        addNotification('Failed to add payout account', 'error');
      }
    } finally {
      setPayoutForm((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle deleting payout account
  const handleDeletePayoutAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this payout account?')) {
      return;
    }

    const token = Cookies.get('token');
    if (!token && addNotification) {
      addNotification('Please login to access this feature', 'error');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/wallet/delete-payout-account/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        addNotification?.('Payout account deleted successfully', 'success');
        setPayoutAccounts((prev) => prev.filter((account) => account._id !== accountId));
      } else {
        addNotification?.('Failed to delete payout account', 'error');
      }
    } catch (error) {
      console.error('Error deleting payout account:', error);
      addNotification?.('Failed to delete payout account', 'error');
    }
  };

  // Handle sending verification link
  const handleSendVerificationLink = async (accountId: string) => {
    const token = Cookies.get('token');
    if (!token && addNotification) {
      addNotification('Please login to access this feature', 'error');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/request-verify-payout-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ payoutAccountId: accountId }),
      });

      const data = await response.json();

      if (response.ok) {
        addNotification?.('Verification link sent to your email', 'success');
      } else {
        addNotification?.(data.message || 'Failed to send verification link', 'error');
      }
    } catch (error) {
      console.error('Error sending verification link:', error);
      addNotification?.('Failed to send verification link', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
      {/* Fullscreen Loader */}
      {isVerifying && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-800">Sending verification link...</p>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Account Settings</h2>
        <p className="text-xs text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-48 sm:h-64">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin mb-3" />
          <p className="text-sm text-gray-600 text-center px-4">Loading your settings...</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Subscription Plan Section */}
          <div
            className={`p-3 sm:p-4 rounded-lg border-[0.5px] ${
              isFreePlan
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                : 'bg-[#DCFEDE] border-[#03E525]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isFreePlan ? 'bg-amber-100' : 'bg-indigo-100'
                  }`}
                >
                  {isPro ? (
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {userProfile?.subscription?.plan || 'Free'} Plan
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        userProfile?.subscription?.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {userProfile?.subscription?.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {isFreePlan
                      ? 'Limited features available. Upgrade to unlock more!'
                      : 'Enjoy premium features and priority support'}
                  </p>
                </div>
              </div>

              {isFreePlan && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className={`bg-gradient-to-b from-[#069F44] to-[#04DB2A] text-white px-3 sm:px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto ${
                    isUpgrading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    ''
                  )}
                  <span className="whitespace-nowrap">{isUpgrading ? 'Processing...' : 'Upgrade to Pro'}</span>
                  {!isUpgrading && <ArrowUpRight className="w-3 h-3" />}
                </motion.button>
              )}
            </div>

            {/* Plan Features Comparison - Show only for free users */}
            {isFreePlan && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Free Plan</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">Basic features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-gray-600">Store is set to private</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-gray-600">Standard support</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <h4 className="font-medium text-indigo-700 mb-2">Pro Plan</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">All features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">Store can be toggled to public</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">Priority support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payout Accounts Section */}
          <div className="p-3 sm:p-4 bg-[#DCFEDE] rounded-lg border border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bank className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Payout Accounts</h3>
                  <p className="text-xs text-gray-600">Manage your bank accounts for payouts</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddPayout(!showAddPayout)}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 font-medium text-sm transition-all duration-200 flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:inline">Add Account</span>
              </motion.button>
            </div>

            {/* Add Payout Account Form */}
            {showAddPayout && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-white rounded-lg border border-green-200"
              >
                <form onSubmit={handleAddPayoutAccount} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-xs font-medium text-gray-800 mb-2">Bank</label>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 flex items-center justify-between focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-50 transition-all"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="listbox"
                      >
                        <span>{getBankName(payoutForm.bankCode)}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isDropdownOpen && (
                        <ul
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                          role="listbox"
                        >
                          {nigerianBanks.map((bank) => (
                            <li
                              key={bank.code}
                              onClick={() => {
                                setPayoutForm((prev) => ({ ...prev, bankCode: bank.code }));
                                setIsDropdownOpen(false);
                              }}
                              className="px-3 py-2 text-sm text-gray-800 hover:bg-green-50 cursor-pointer transition-all"
                              role="option"
                              aria-selected={payoutForm.bankCode === bank.code}
                            >
                              {bank.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={payoutForm.accountNumber}
                        onChange={(e) => setPayoutForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-50 transition-all"
                        placeholder="Enter account number"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={payoutForm.isSubmitting}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {payoutForm.isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {payoutForm.isSubmitting ? 'Adding...' : 'Add Account'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowAddPayout(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200 w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Payout Accounts List */}
            {loadingPayouts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                <span className="ml-2 text-sm text-gray-600">Loading accounts...</span>
              </div>
            ) : payoutAccounts.length > 0 ? (
              <div className="space-y-3">
                {payoutAccounts.map((account) => (
                  <div
                    key={account._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg border border-gray-200 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-800 truncate">{account.accountName}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              account.status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : account.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {account.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {getBankName(account.bankCode)} • ****{account.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {account.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendVerificationLink(account._id)}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium text-sm transition-all duration-200 flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Verify
                        </motion.button>
                      )}
                      <button
                        onClick={() => handleDeletePayoutAccount(account._id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bank className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">No payout accounts added yet</p>
                <p className="text-xs text-gray-500">Add a bank account to receive payouts</p>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          {userProfile?.avatar && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="relative flex-shrink-0">
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <button className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors duration-200">
                  <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-800">Profile Picture</h3>
                <p className="text-xs text-gray-600">Update your profile photo</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="group">
            <label className="block text-xs font-medium text-gray-800 mb-2">Email Address</label>
            <div className="flex items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                value={userProfile?.email || 'Loading...'}
                disabled
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-600 p-0 min-w-0"
              />
              <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded whitespace-nowrap">Read-only</span>
            </div>
          </div>

          {/* Full Name Field */}
          <div className="group">
            <label className="block text-xs font-medium text-gray-800 mb-2">Full Name</label>
            <div className="flex items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                defaultValue={userProfile?.name || 'Loading...'}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-500 p-0 min-w-0"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-medium text-gray-800">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { id: 'email_notifications', label: 'Email notifications', description: 'Receive updates via email' },
                { id: 'order_updates', label: 'Order updates', description: 'Get notified about new orders' },
              ].map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="text-sm font-medium text-gray-800 block">{item.label}</label>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-end sm:self-center">
                    <input
                      type="checkbox"
                      defaultChecked={item.id !== 'marketing_emails'}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-gradient-to-b from-[#069F44] to-[#04DB2A]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-b from-[#069F44] to-[#04DB2A] text-white px-4 py-2.5 rounded-lg hover:bg-gray-900 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200 w-full sm:w-auto"
            >
              Reset
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenderSettings;