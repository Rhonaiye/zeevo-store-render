'use client'

import { useState } from 'react'
import { Wallet, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowDown, CreditCard, User, Hash, Clock, TrendingDown, TrendingUp } from 'lucide-react'

interface Transaction {
  id: string
  type: 'withdrawal' | 'earning'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  bankName?: string
  description?: string
  reference: string
  accountNumber?: string
}

export default function WalletManagement() {
  const [balance, setBalance] = useState<number>(85000)
  const [showBalance, setShowBalance] = useState<boolean>(true)
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [accountName, setAccountName] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [step, setStep] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw')

  const transactions: Transaction[] = [
    { id: 'TXN001', type: 'withdrawal', amount: 25000, status: 'completed', date: '2024-08-05T10:30:00Z', bankName: 'GTBank', reference: 'ZEE2408051030001' },
    { id: 'TXN002', type: 'earning', amount: 15000, status: 'completed', date: '2024-08-04T14:15:00Z', description: 'Store commission', reference: 'ZEE2408041415002' },
    { id: 'TXN003', type: 'withdrawal', amount: 50000, status: 'pending', date: '2024-08-03T16:45:00Z', bankName: 'Access Bank', reference: 'ZEE2408031645003' },
    { id: 'TXN004', type: 'earning', amount: 30000, status: 'completed', date: '2024-08-02T09:20:00Z', description: 'Product sales', reference: 'ZEE2408020920004' },
    { id: 'TXN005', type: 'withdrawal', amount: 10000, status: 'failed', date: '2024-08-01T11:00:00Z', bankName: 'UBA', reference: 'ZEE2408011100005' }
  ]

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleAmountNext = (): void => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      setStatus('Please enter a valid amount')
      return
    }
    if (Number(withdrawAmount) > balance) {
      setStatus('Insufficient balance')
      return
    }
    setStatus('')
    setStep(2)
  }

  const handleBankDetailsNext = async (): Promise<void> => {
    if (!accountNumber || !accountName || !bankName) {
      setStatus('Please fill all bank details')
      return
    }
    if (accountNumber.length !== 10) {
      setStatus('Account number must be 10 digits')
      return
    }
    
    setStatus('Verifying account name...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockVerifiedName: string = 'John Doe'
    if (accountName.toLowerCase().trim() !== mockVerifiedName.toLowerCase().trim()) {
      setStatus('Account name does not match bank records')
      return
    }
    
    setStatus('Account verified!')
    setTimeout(() => { setStatus(''); setStep(3) }, 1000)
  }

  const handleWithdraw = async (): Promise<void> => {
    setIsProcessing(true)
    setStatus('Processing withdrawal...')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setBalance(prev => prev - Number(withdrawAmount))
      setStatus('Withdrawal successful! Funds will be credited within 24 hours.')
      setTimeout(() => {
        setWithdrawAmount('')
        setAccountNumber('')
        setAccountName('')
        setBankName('')
        setStep(1)
        setStatus('')
      }, 3000)
    } catch (err) {
      setStatus('Withdrawal failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetFlow = (): void => {
    setStep(1)
    setStatus('')
    setWithdrawAmount('')
    setAccountNumber('')
    setAccountName('')
    setBankName('')
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto">

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 rounded-xl shadow-lg mb-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-indigo-100 font-medium">Available Balance</p>
            <button onClick={() => setShowBalance(!showBalance)} className="text-indigo-200 hover:text-white transition-colors">
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {showBalance ? `₦${balance.toLocaleString()}` : '₦••••••'}
          </h2>
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
                activeTab === 'withdraw' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Withdraw Funds
              </div>
            </button>
            <button
              onClick={() => {setActiveTab('history'); resetFlow()}}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
                activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Transaction History
              </div>
            </button>
          </div>
        </div>

        {/* Withdrawal Form */}
        {activeTab === 'withdraw' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              {[1,2,3].map((stepNum: number, index: number) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`flex items-center gap-1 ${step >= stepNum ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= stepNum ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                      {stepNum}
                    </div>
                    <span className="text-xs font-medium">{['Amount', 'Bank Details', 'Confirm'][index]}</span>
                  </div>
                  {index < 2 && <div className={`w-8 h-0.5 mx-2 ${step > stepNum ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5">
            {/* Step 1: Amount */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Withdrawal Amount</h3>
                  <p className="text-xs text-gray-600 mb-3">Enter the amount you want to withdraw</p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">₦</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-3 text-lg font-bold border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  {[10000, 25000, 50000].map((amount: number) => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(amount.toString())}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium"
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAmountNext}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
            )}

            {/* Step 2: Bank Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Bank Account Details</h3>
                  <p className="text-xs text-gray-600 mb-3">Enter your bank account information</p>
                </div>

                <div className="grid gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={bankName}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBankName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none appearance-none bg-white"
                      >
                        <option value="">Select your bank</option>
                        <option value="GTBank">GTBank</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="UBA">UBA</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="Fidelity Bank">Fidelity Bank</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Account Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="1234567890"
                        value={accountNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Full name as it appears on your account"
                        value={accountName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={resetFlow} className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-200">
                    Back
                  </button>
                  <button
                    onClick={handleBankDetailsNext}
                    disabled={status === 'Verifying account name...'}
                    className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === 'Verifying account name...' ? 'Verifying...' : 'Verify & Continue'}
                    {status !== 'Verifying account name...' && <ArrowDown className="w-4 h-4 rotate-[-90deg]" />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Confirm Withdrawal</h3>
                  <p className="text-xs text-gray-600 mb-3">Please review your withdrawal details</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {([
                    ['Amount', `₦${Number(withdrawAmount).toLocaleString()}`],
                    ['Bank', bankName],
                    ['Account Number', accountNumber],
                    ['Account Name', accountName]
                  ] as [string, string][]).map(([label, value]: [string, string]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-sm">You will receive</span>
                      <span className="text-indigo-600">₦{Number(withdrawAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
                    {!isProcessing && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Status Message */}
            {status && (
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs ${
                status.includes('successful') || status.includes('verified') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : status.includes('failed') || status.includes('not match') || status.includes('Insufficient')
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {status.includes('successful') || status.includes('verified') ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="font-medium">{status}</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Transaction History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Transaction History</h3>
              <p className="text-xs text-gray-600 mt-1">Your recent transactions</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {transactions.map((txn: Transaction) => (
                <div key={txn.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${txn.type === 'earning' ? 'bg-green-100' : 'bg-indigo-100'}`}>
                        {txn.type === 'earning' ? 
                          <TrendingUp className="w-4 h-4 text-green-600" /> : 
                          <TrendingDown className="w-4 h-4 text-indigo-600" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 capitalize">{txn.type}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {txn.description || `${txn.bankName} • ****${txn.accountNumber?.slice(-4)}`}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(txn.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${txn.type === 'earning' ? 'text-green-600' : 'text-gray-900'}`}>
                        {txn.type === 'earning' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{txn.reference}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Note */}
        <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-1">Important Information</h4>
              <ul className="text-amber-700 text-xs space-y-1">
                <li>• Zeevo does not support top-ups. You can only withdraw earned funds.</li>
                <li>• Withdrawals are processed within 24 hours on business days.</li>
                <li>• Account name must match your bank account exactly.</li>
                <li>• Minimum withdrawal amount is ₦1,000.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}