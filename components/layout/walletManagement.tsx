'use client'

import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowDown, CreditCard, User, Hash, Clock, TrendingUp } from 'lucide-react';
import Cookies from 'js-cookie';



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

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl p-4 text-gray-600">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-sm text-gray-600">Loading wallet data...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 text-white shadow-lg">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-indigo-100">Available Balance</p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-indigo-200 transition-colors hover:text-white"
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <h2 className="mb-2 text-2xl font-bold">{showBalance ? `₦${balance.toLocaleString()}` : '₦••••••'}</h2>
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <CheckCircle2 className="h-3 w-3" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="mb-6 rounded-xl bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${activeTab === 'withdraw' ? 'border-b-2 border-indigo-600 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                aria-selected={activeTab === 'withdraw'}
              >
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Withdraw Funds
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  resetFlow();
                }}
                className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-indigo-600 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                aria-selected={activeTab === 'history'}
              >
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Transaction History
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && !isLoading && (
          <div className="rounded-xl bg-white shadow-lg">
            <div className="border-b bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNum, index) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`flex items-center gap-1 ${step >= stepNum ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${step >= stepNum ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                        {stepNum}
                      </div>
                      <span className="text-xs font-medium">{['Amount', 'Bank Details', 'Confirm'][index]}</span>
                    </div>
                    {index < 2 && <div className={`mx-2 h-0.5 w-8 ${step > stepNum ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-gray-900">Withdrawal Amount</h3>
                    <p className="mb-3 text-xs text-gray-600">Enter the amount you want to withdraw</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="font-medium text-gray-500">₦</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-200 py-3 pl-7 pr-4 text-lg font-bold focus:border-indigo-600 focus:outline-none"
                      aria-label="Withdrawal amount"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[10000, 25000, 50000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setWithdrawAmount(amount.toString())}
                        className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                        aria-label={`Set withdrawal amount to ₦${amount}`}
                      >
                        ₦{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleAmountNext}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    aria-label="Continue to bank details"
                  >
                    Continue
                    <ArrowDown className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-gray-900">Bank Account Details</h3>
                    <p className="mb-3 text-xs text-gray-600">Enter your bank account information</p>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <label htmlFor="bankName" className="mb-1 block text-xs font-medium text-gray-700">
                        Bank Name
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                          id="bankName"
                          value={bankName}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBankName(e.target.value)}
                          className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-indigo-600 focus:outline-none"
                          aria-label="Select bank"
                        >
                          <option value="">Select your bank</option>
                          {Object.keys(bankCodeMap).map(bank => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="accountNumber" className="mb-1 block text-xs font-medium text-gray-700">
                        Account Number
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          id="accountNumber"
                          type="text"
                          placeholder="1234567890"
                          value={accountNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-indigo-600 focus:outline-none"
                          aria-label="Bank account number"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="accountName" className="mb-1 block text-xs font-medium text-gray-700">
                        Account Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          id="accountName"
                          type="text"
                          placeholder="Full name as it appears on your account"
                          value={accountName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountName(e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-indigo-600 focus:outline-none"
                          aria-label="Bank account name"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetFlow}
                      className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                      aria-label="Go back to amount step"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBankDetailsNext}
                      disabled={status === 'Verifying account...'}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      aria-label="Verify bank details and continue"
                    >
                      {status === 'Verifying account...' ? 'Verifying...' : 'Verify & Continue'}
                      {status !== 'Verifying account...' && <ArrowDown className="h-4 w-4 -rotate-90" />}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-gray-900">Confirm Withdrawal</h3>
                    <p className="mb-3 text-xs text-gray-600">Please review your withdrawal details</p>
                  </div>
                  <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                    {([
                      ['Amount', `₦${Number(withdrawAmount).toLocaleString()}`],
                      ['Bank', bankName],
                      ['Account Number', accountNumber],
                      ['Account Name', accountName],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-sm">You will receive</span>
                        <span className="text-indigo-600">₦{(Number(withdrawAmount) * 0.98).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(2)}
                      disabled={isProcessing}
                      className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      aria-label="Go back to bank details"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={isProcessing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      aria-label="Confirm withdrawal"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
                      {!isProcessing && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {status && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-xs ${
                    status.includes('successful') || status.includes('verified') || status.includes('loaded')
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : status.includes('failed') || status.includes('not match') || status.includes('Insufficient') || status.includes('error') || status.includes('Minimum')
                      ? 'border-red-200 bg-red-50 text-red-800'
                      : 'border-blue-200 bg-blue-50 text-blue-800'
                  }`}
                >
                  {status.includes('successful') || status.includes('verified') || status.includes('loaded') ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{status}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && !isLoading && (
          <div className="rounded-xl bg-white shadow-lg">
            <div className="border-b p-5">
              <h3 className="text-base font-semibold text-gray-900">Transaction History</h3>
              <p className="mt-1 text-xs text-gray-600">View your recent store transactions</p>
            </div>
            <div className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-600">No transactions found</p>
                </div>
              ) : (
                transactions.map(txn => (
                  <div key={txn._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-indigo-100 p-2">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">Store Order</p>
                            <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(txn.status)}`}>{txn.status}</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {txn.customerName} • {txn.orderId.items[0]?.name || 'Order'} • Order #{txn.orderId._id.slice(-6)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(txn.createdAt)}</p>
                          {txn.status === 'completed' && (
                            <p className="mt-1 text-xs text-green-600">Net received: ₦{(txn.amount * 0.98).toLocaleString()} (after 2% fee)</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            txn.status === 'completed' ? 'text-green-600' : txn.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}
                        >
                          +₦{txn.amount.toLocaleString()}
                        </p>
                        <button
                          onClick={() => setTransactions(prev => prev.map(t => (t._id === txn._id ? { ...t, expanded: !t.expanded } : t)))}
                          className="mt-1 text-xs text-indigo-600 hover:text-indigo-800"
                          aria-expanded={txn.expanded || false}
                          aria-controls={`transaction-details-${txn._id}`}
                        >
                          {txn.expanded ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>
                    </div>
                    {txn.expanded && (
                      <div id={`transaction-details-${txn._id}`} className="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
                        <div className="grid gap-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Customer Details</h4>
                            <div className="mt-1 space-y-1 text-xs text-gray-600">
                              <p>
                                <span className="font-medium">Name:</span> {txn.orderId.customer.fullName}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span> {txn.orderId.customer.email}
                              </p>
                              <p>
                                <span className="font-medium">Phone:</span> {txn.orderId.customer.phone}
                              </p>
                              <p>
                                <span className="font-medium">Address:</span> {txn.orderId.customer.address}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Order Items</h4>
                            <div className="mt-1 space-y-2">
                              {txn.orderId.items && txn.orderId.items.length > 0 ? (
                                txn.orderId.items.map(item => (
                                  <div key={item._id} className="flex justify-between text-xs text-gray-600">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p>
                                        Quantity: {item.quantity} • ₦{item.price.toLocaleString()} each
                                      </p>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {item.tags.map((tag, index) => (
                                            <span key={index} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-600">No items found</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Transaction Details</h4>
                            <div className="mt-1 space-y-1 text-xs text-gray-600">
                              <p>
                                <span className="font-medium">Reference:</span> {txn.reference}
                              </p>
                              <p>
                                <span className="font-medium">Order Total:</span> ₦{txn.orderId.totalAmount.toLocaleString()}
                              </p>
                              <p>
                                <span className="font-medium">Created:</span> {formatDate(txn.createdAt)}
                              </p>
                              <p>
                                <span className="font-medium">Updated:</span> {formatDate(txn.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <div>
                <h4 className="mb-1 text-sm font-semibold text-amber-800">Important Information</h4>
                <ul className="space-y-1 text-xs text-amber-700">
                  <li>Zeevo does not support top-ups. You can only withdraw earned funds.</li>
                  <li>Withdrawals are processed within 24 hours on business days.</li>
                  <li>Account name must match your bank account exactly.</li>
                  <li>Minimum withdrawal amount is ₦1,000.</li>
                  <li>A 2% service fee is deducted from successful transactions.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}