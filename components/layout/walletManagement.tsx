'use client'

import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowDown, CreditCard, User, Hash, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface Transaction {
  _id: string;
  storeId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  updatedAt: string;
  currency: string;
  customerEmail: string;
  customerName: string;
  orderId: {
    _id: string;
    customer: { address: string; email: string; fullName: string; phone: string };
    items: Array<{ name: string; price: number; productId: string; quantity: number; tags?: string[]; _id: string }>;
    paymentReference: string;
    status: string;
    storeId: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  reference: string;
  __v: number;
  expanded?: boolean;
}

interface WalletData {
  wallet: { balance: number };
  transactions: Transaction[];
}

const bankCodeMap: { [key: string]: string } = {
  GTBank: '058',
  'Access Bank': '044',
  'First Bank': '011',
  UBA: '033',
  'Zenith Bank': '057',
  'Fidelity Bank': '070',
};

export default function WalletManagement() {
  const [balance, setBalance] = useState<number>(0);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [bankCode, setBankCode] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get('token');
        if (!token) throw new Error('Authentication error: No token found');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/wallet`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) throw new Error(`Failed to fetch wallet data: ${response.statusText}`);
        const { data }: { data: WalletData } = await response.json();
        setBalance(data.wallet.balance);
        setTransactions(data.transactions.map(txn => ({ ...txn, expanded: false })));
        setStatus('Wallet data loaded successfully');
        setTimeout(() => setStatus(''), 2000);
      } catch (error: any) {
        setStatus(`Error fetching wallet data: ${error.message}`);
        console.error('WalletManagement: Error fetching wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAmountNext = (): void => {
    const amount = Number(withdrawAmount);
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }
    if (amount > balance) {
      setStatus('Insufficient balance');
      return;
    }
    if (amount < 1000) {
      setStatus('Minimum withdrawal amount is ₦1,000');
      return;
    }
    setStatus('');
    setStep(2);
  };

  const handleBankDetailsNext = async (): Promise<void> => {
    if (!accountNumber || !accountName || !bankName) {
      setStatus('Please fill all bank details');
      return;
    }
    if (accountNumber.length !== 10) {
      setStatus('Account number must be 10 digits');
      return;
    }

    const selectedBankCode = bankCodeMap[bankName];
    if (!selectedBankCode) {
      setStatus('Invalid bank selected');
      return;
    }
    setBankCode(selectedBankCode);

    setStatus('Verifying account...');
    try {
      const token = Cookies.get('token');
      if (!token) throw new Error('Authentication error: No token found');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/verify-account`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accountNumber, bankCode: selectedBankCode }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Account verification failed');
      }

      const { success, accountName: verifiedAccountName } = await response.json();

      if (!success || verifiedAccountName.toLowerCase().trim() !== accountName.toLowerCase().trim()) {
        setStatus('Account name does not match bank records');
        return;
      }

      setStatus('Account verified!');
      setTimeout(() => {
        setStatus('');
        setStep(3);
      }, 1000);
    } catch (error: any) {
      setStatus(`Verification failed: ${error.message}`);
      console.log(error)
    }
  };

  const handleWithdraw = async (): Promise<void> => {
    setIsProcessing(true);
    setStatus('Processing withdrawal...');
    try {
      const token = Cookies.get('token');
      if (!token) throw new Error('Authentication error: No token found');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/wallet/withdraw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          bankName,
          accountNumber,
          accountName,
          bankCode,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Withdrawal failed');
      }

      const { message } = await response.json();
      const walletResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/wallet`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!walletResponse.ok) throw new Error('Failed to fetch updated wallet data');
      const { data: walletData }: { data: WalletData } = await walletResponse.json();
      setBalance(walletData.wallet.balance);
      setTransactions(walletData.transactions.map(txn => ({ ...txn, expanded: false })));
      setStatus(message);
      setTimeout(() => {
        setWithdrawAmount('');
        setAccountNumber('');
        setAccountName('');
        setBankName('');
        setBankCode('');
        setStep(1);
        setStatus('');
      }, 3000);
    } catch (error: any) {
      setStatus(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = (): void => {
    setStep(1);
    setStatus('');
    setWithdrawAmount('');
    setAccountNumber('');
    setAccountName('');
    setBankName('');
    setBankCode('');
  };

  const toggleTransaction = (id: string) => {
    setTransactions(prev => prev.map(txn => 
      txn._id === id ? { ...txn, expanded: !txn.expanded } : txn
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-indigo-600"
            >
              <AlertCircle className="h-8 w-8" />
            </motion.div>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 sm:p-6 text-white shadow-xl shadow-indigo-200/50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-medium opacity-80">Available Balance</p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="rounded-full p-1 transition-colors hover:bg-indigo-500/50"
                  aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
                {showBalance ? `₦${balance.toLocaleString()}` : '₦••••••'}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                <CheckCircle2 className="h-3 w-3" />
                <span>Updated just now</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 sm:mb-8"
            >
              <div className="grid grid-cols-2 rounded-2xl bg-white p-1 shadow-md shadow-gray-100">
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`py-3 text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'withdraw' 
                      ? 'rounded-xl bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Withdraw
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('history');
                    resetFlow();
                  }}
                  className={`py-3 text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'history' 
                      ? 'rounded-xl bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <Clock className="h-4 w-4" />
                    History
                  </div>
                </button>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === 'withdraw' && (
                <motion.div
                  key="withdraw"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl bg-white p-4 sm:p-6 shadow-xl shadow-gray-100"
                >
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                    {[1, 2, 3].map((num, index) => (
                      <React.Fragment key={num}>
                        <div className="flex items-center gap-2">
                          <div className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs font-bold ${
                            step >= num ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {num}
                          </div>
                          <span className={`text-xs sm:text-sm font-medium ${
                            step >= num ? 'text-indigo-600' : 'text-gray-400'
                          }`}>
                            {['Amount', 'Details', 'Confirm'][index]}
                          </span>
                        </div>
                        {index < 2 && (
                          <div className={`h-4 w-0.5 sm:h-0.5 sm:flex-1 ${
                            step > num ? 'bg-indigo-600' : 'bg-gray-200'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {step === 1 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Enter Amount</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">How much would you like to withdraw?</p>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-bold text-gray-400">₦</span>
                        <input
                          type="number"
                          placeholder="1,000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 py-2 sm:py-3 pl-8 sm:pl-10 pr-3 sm:pr-4 text-lg sm:text-xl font-bold focus:border-indigo-300 focus:ring focus:ring-indigo-100 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {[10000, 25000, 50000].map(amount => (
                          <button
                            key={amount}
                            onClick={() => setWithdrawAmount(amount.toString())}
                            className="rounded-xl bg-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            ₦{amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleAmountNext}
                        className="w-full rounded-xl bg-indigo-600 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Continue <ArrowDown className="h-4 w-4 -rotate-90" />
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Bank Details</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">Where should we send the funds?</p>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Bank</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <select
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 py-2 sm:py-3 pl-10 pr-4 appearance-none focus:border-indigo-300 focus:ring focus:ring-indigo-100 focus:outline-none transition-all text-sm"
                            >
                              <option value="">Select bank</option>
                              {Object.keys(bankCodeMap).map(bank => <option key={bank} value={bank}>{bank}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Account Number</label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="w-full rounded-xl border border-gray-200 py-2 sm:py-3 pl-10 pr-4 focus:border-indigo-300 focus:ring focus:ring-indigo-100 focus:outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Account Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={accountName}
                              onChange={(e) => setAccountName(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 py-2 sm:py-3 pl-10 pr-4 focus:border-indigo-300 focus:ring focus:ring-indigo-100 focus:outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={resetFlow}
                          className="flex-1 rounded-xl border border-gray-200 py-2.5 sm:py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleBankDetailsNext}
                          disabled={status === 'Verifying account...'}
                          className="flex-1 rounded-xl bg-indigo-600 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                          {status === 'Verifying account...' ? 'Verifying...' : 'Verify & Continue'}
                          {status !== 'Verifying account...' && <ArrowDown className="h-4 w-4 -rotate-90" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirm</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">Review withdrawal details</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 sm:p-4 space-y-3 text-xs sm:text-sm">
                        {[
                          { label: 'Amount', value: `₦${Number(withdrawAmount).toLocaleString()}` },
                          { label: 'Bank', value: bankName },
                          { label: 'Account', value: accountNumber },
                          { label: 'Name', value: accountName },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-600">Receive</span>
                            <span className="text-indigo-600">₦{(Number(withdrawAmount) * 0.98).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">After 2% fee</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setStep(2)}
                          disabled={isProcessing}
                          className="flex-1 rounded-xl border border-gray-200 py-2.5 sm:py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleWithdraw}
                          disabled={isProcessing}
                          className="flex-1 rounded-xl bg-indigo-600 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                          {isProcessing ? 'Processing...' : 'Confirm'}
                          {!isProcessing && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {status && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-sm ${
                          status.includes('success') || status.includes('verified') || status.includes('loaded')
                            ? 'bg-green-50 text-green-700'
                            : status.includes('failed') || status.includes('match') || status.includes('Insufficient') || status.includes('error') || status.includes('Minimum')
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {status.includes('success') || status.includes('verified') || status.includes('loaded') ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span>{status}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl bg-white shadow-xl shadow-gray-100 overflow-hidden"
                >
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transaction History</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">Your recent transactions</p>
                  </div>
                  <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No transactions yet
                      </div>
                    ) : (
                      transactions.map(txn => (
                        <div key={txn._id} className="border-b border-gray-100 last:border-0">
                          <button 
                            onClick={() => toggleTransaction(txn._id)}
                            className="w-full p-4 sm:p-6 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <div className="rounded-xl bg-indigo-50 p-2 sm:p-3">
                                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900">Store Order</p>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(txn.status)}`}>
                                      {txn.status}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {txn.customerName} • Order #{txn.orderId._id.slice(-6)}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">{formatDate(txn.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right">
                                  <p className={`text-sm font-bold ${
                                    txn.status === 'completed' ? 'text-green-600' : txn.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    +₦{txn.amount.toLocaleString()}
                                  </p>
                                  {txn.status === 'completed' && (
                                    <p className="text-xs text-gray-500 mt-1">Net: ₦{(txn.amount * 0.98).toLocaleString()}</p>
                                  )}
                                </div>
                                <motion.div
                                  animate={{ rotate: txn.expanded ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </motion.div>
                              </div>
                            </div>
                          </button>
                          <AnimatePresence>
                            {txn.expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 bg-gray-50">
                                  <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                                      <div className="grid gap-1 text-gray-600">
                                        <p><span className="font-medium">Name:</span> {txn.orderId.customer.fullName}</p>
                                        <p><span className="font-medium">Email:</span> {txn.orderId.customer.email}</p>
                                        <p><span className="font-medium">Phone:</span> {txn.orderId.customer.phone}</p>
                                        <p><span className="font-medium">Address:</span> {txn.orderId.customer.address}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                                      <div className="space-y-4">
                                        {txn.orderId.items.map(item => (
                                          <div key={item._id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                                              <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-gray-600 mt-1">Qty: {item.quantity} × ₦{item.price.toLocaleString()}</p>
                                              </div>
                                              <p className="font-medium text-gray-900 sm:text-right">₦{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            {item.tags && item.tags.length > 0 && (
                                              <div className="mt-2 flex flex-wrap gap-2">
                                                {item.tags.map(tag => (
                                                  <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-800">
                                                    {tag}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                                      <div className="grid gap-1 text-gray-600">
                                        <p><span className="font-medium">Reference:</span> {txn.reference}</p>
                                        <p><span className="font-medium">Total:</span> ₦{txn.orderId.totalAmount.toLocaleString()}</p>
                                        <p><span className="font-medium">Created:</span> {formatDate(txn.createdAt)}</p>
                                        <p><span className="font-medium">Updated:</span> {formatDate(txn.updatedAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 sm:mt-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="w-full">
                  <h4 className="text-sm sm:text-base font-semibold text-amber-800 mb-2 sm:mb-3">Important Notes</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-amber-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-amber-600 flex-shrink-0" />
                      Zeevo supports withdrawals only - no top-ups available.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-amber-600 flex-shrink-0" />
                      Processed within 24 business hours.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-amber-600 flex-shrink-0" />
                      Account name must match exactly.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-amber-600 flex-shrink-0" />
                      Minimum: ₦1,000
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-amber-600 flex-shrink-0" />
                      2% fee on successful transactions.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}