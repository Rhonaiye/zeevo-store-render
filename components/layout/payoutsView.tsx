import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';

interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

interface Payout {
    _id?: string;
    accountId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    requestedAt: Date;
    processedAt?: Date;
    transactionId?: string;
    notes?: string;
    splitCode?: string;
    bankDetails?: BankDetails;
    createdAt?: Date;
    updatedAt?: Date;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'text-green-700 bg-green-100';
        case 'pending': return 'text-yellow-700 bg-yellow-100';
        case 'failed': return 'text-red-700 bg-red-100';
        default: return 'text-gray-700 bg-gray-100';
    }
};

// Custom Dropdown Component
const CustomDropdown: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}> = ({ value, onChange, options, placeholder }) => {
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

    const selectedOption = options.find(opt => opt.value === value) || { value: '', label: placeholder };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-left flex items-center justify-between w-full"
            >
                <span>{selectedOption.label}</span>
                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 text-gray-900"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PayoutsView: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayouts = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = Cookies.get('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/payouts`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch payouts');
                const data = await res.json();
                console.log('Fetched payouts:', data);
                // Convert date strings to Date objects
                const payoutsData: Payout[] = (data.userPayouts || []).map((p: any) => ({
                    ...p,
                    requestedAt: new Date(p.requestedAt),
                    processedAt: p.processedAt ? new Date(p.processedAt) : undefined,
                }));
                setPayouts(payoutsData);
            } catch (err: any) {
                setError(err.message || 'Error fetching payouts');
            } finally {
                setLoading(false);
            }
        };
        fetchPayouts();
    }, []);

    const filteredPayouts = payouts.filter((payout) => {
        return statusFilter === 'all' || payout.status === statusFilter;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <div className="text-xs font-medium mb-2">Loading payouts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-red-500">
                <div className="text-xs font-medium mb-2">Error loading payouts</div>
                <p className="text-xs">{error}</p>
            </div>
        );
    }

    if (!filteredPayouts || filteredPayouts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <div className="text-xs font-medium mb-2">No payouts yet</div>
                <p className="text-xs">No payouts yet — they'll appear once a product is bought.</p>
            </div>
        );
    }

    return (
        <div className="w-full text-black">
            {/* Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2 p-2 bg-gray-50 rounded-md">
                <CustomDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'failed', label: 'Failed' },
                    ]}
                    placeholder="Select status"
                />
            </div>

            {/* Table for sm+ */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acct No</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayouts.map((payout, index) => (
                            <tr key={payout._id || index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs">{new Date(payout.requestedAt).toLocaleDateString()}</td>
                                <td className="px-3 py-2 text-xs">{payout.amount} {payout.currency}</td>
                                <td className="px-3 py-2">
                                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-xs">{payout.bankDetails?.bankName || '-'}</td>
                                <td className="px-3 py-2 text-xs">{payout.bankDetails?.accountNumber ? `****${payout.bankDetails.accountNumber.slice(-4)}` : '-'}</td>
                                <td className="px-3 py-2 text-xs">{payout.transactionId || '-'}</td>
                                <td className="px-3 py-2 text-xs">{payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '-'}</td>
                                <td className="px-3 py-2 text-xs">{payout.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
                {filteredPayouts.map((payout, index) => (
                    <div key={payout._id || index} className="bg-white p-3 rounded-lg shadow border border-gray-200 text-xs">
                        <div className="flex justify-between">
                            <span className="font-medium">{new Date(payout.requestedAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${getStatusColor(payout.status)}`}>
                                {payout.status}
                            </span>
                        </div>
                        <div className="mt-2">
                            <div><span className="font-medium">Amount:</span> {payout.amount} {payout.currency}</div>
                            <div><span className="font-medium">Bank:</span> {payout.bankDetails?.bankName || '-'}</div>
                            <div><span className="font-medium">Acct:</span> {payout.bankDetails?.accountNumber ? `****${payout.bankDetails.accountNumber.slice(-4)}` : '-'}</div>
                            <div><span className="font-medium">Tx ID:</span> {payout.transactionId || '-'}</div>
                            <div><span className="font-medium">Processed:</span> {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '-'}</div>
                            <div><span className="font-medium">Notes:</span> {payout.notes || '-'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PayoutsView;