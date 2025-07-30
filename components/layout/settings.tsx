import { motion } from 'framer-motion';
import { Loader2, User, Mail, Clock, Camera, Crown, ArrowUpRight, Check, X } from 'lucide-react';
import { FC } from 'react';
import { useAppStore } from '@/store/useAppStore';


// Define interface for component props
interface RenderSettingsProps {
  isLoading: boolean;
}

// Define the RenderSettings component
const RenderSettings: FC<RenderSettingsProps> = ({ isLoading }) => {
  const {  userProfile } = useAppStore()
  const isFreePlan = userProfile?.subscription?.plan?.toLowerCase() === 'free';
  const isPro = userProfile?.subscription?.plan?.toLowerCase() === 'pro';

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Account Settings</h2>
        <p className="text-xs text-gray-500 mt-1">Manage your account information and preferences</p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-48 sm:h-64">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin mb-3" />
          <p className="text-sm text-gray-500 text-center px-4">Loading your settings...</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Subscription Plan Section */}
          <div className={`p-3 sm:p-4 rounded-lg border-2 ${
            isFreePlan 
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
              : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isFreePlan ? 'bg-amber-100' : 'bg-indigo-100'
                }`}>
                  {isPro ? (
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {userProfile?.subscription?.plan || 'Free'} Plan
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      userProfile?.subscription?.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {userProfile?.subscription?.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {isFreePlan 
                      ? 'Limited features available. Upgrade to unlock more!'
                      : 'Enjoy premium features and priority support'
                    }
                  </p>
                </div>
              </div>
              
              {isFreePlan && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto"
                >
                  <Crown className="w-4 h-4" />
                  <span className="whitespace-nowrap">Upgrade to Pro</span>
                  <ArrowUpRight className="w-3 h-3" />
                </motion.button>
              )}
            </div>

            {/* Plan Features Comparison - Show only for free users */}
            {isFreePlan && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Free Plan</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">Basic features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-gray-600">Limited storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-gray-600">Standard support</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <h4 className="font-medium text-purple-700 mb-2">Pro Plan</h4>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">All features</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">Unlimited storage</span>
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

          {/* Profile Picture Section */}
          {userProfile?.avatar && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="relative flex-shrink-0">
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-sm" 
                />
                <button className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-200">
                  <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900">Profile Picture</h3>
                <p className="text-xs text-gray-500">Update your profile photo</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="group">
            <label className="block text-xs font-medium text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                value={userProfile?.email || 'Loading...'}
                disabled
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-500 p-0 min-w-0"
              />
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded whitespace-nowrap">Read-only</span>
            </div>
          </div>

          {/* Full Name Field */}
          <div className="group">
            <label className="block text-xs font-medium text-gray-700 mb-2">Full Name</label>
            <div className="flex items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                defaultValue={userProfile?.name || 'Loading...'}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400 p-0 min-w-0"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { id: 'email_notifications', label: 'Email notifications', description: 'Receive updates via email' },
                { id: 'order_updates', label: 'Order updates', description: 'Get notified about new orders' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="text-sm font-medium text-gray-700 block">{item.label}</label>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      defaultChecked={item.id !== 'marketing_emails'}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
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
              className="bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200 w-full sm:w-auto"
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