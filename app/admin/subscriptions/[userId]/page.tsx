'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

// Types
interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  subscription: {
    plan: string;
    status: string;
    paymentProvider: string;
    subscriptionEndsAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  _id: string;
  userId: User;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentReference: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
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

// Subscription Details Component
const SubscriptionDetails: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { userId  } = useParams();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/subscriptions/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription details');
      const result: Subscription = await response.json();
      setSubscription(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchSubscription();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <XCircle className="h-12 w-12 text-red-600 mb-4" />
        <p className="text-red-600 text-lg">{error || 'Subscription not found'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Subscriptions
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Subscription Details</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{subscription.userId.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{subscription.userId.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-900">{subscription.userId.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Verified</label>
                <p className="text-gray-900">
                  {subscription.userId.isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600 inline" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 inline" />
                  )}
                  <span className="ml-2">{subscription.userId.isVerified ? 'Yes' : 'No'}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">User Created</label>
                <p className="text-gray-900">{new Date(subscription.userId.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Subscription Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600">Plan</label>
                <p className="text-gray-900">{subscription.planName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Amount</label>
                <p className="text-gray-900">{subscription.amount.toLocaleString()} {subscription.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <StatusBadge status={subscription.status} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-gray-900">{new Date(subscription.startDate).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">End Date</label>
                <p className="text-gray-900">{new Date(subscription.endDate).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Payment Reference</label>
                <p className="text-gray-900">{subscription.paymentReference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                <p className="text-gray-900">{subscription.paymentStatus}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Payment Provider</label>
                <p className="text-gray-900">{subscription.userId.subscription.paymentProvider}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Subscription Created</label>
                <p className="text-gray-900">{new Date(subscription.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{new Date(subscription.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;