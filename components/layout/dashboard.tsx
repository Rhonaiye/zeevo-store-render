import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Store, 
  Plus, 
  BookOpen, 
  HelpCircle, 
  Play, 
  Crown,
  ArrowUpRight,

  X
} from 'lucide-react';
import { FC, JSX, useState } from 'react';
import { QuickStat, UserProfile, ActionCard } from '@/store/useAppStore';

// Improved interface with better typing
interface RenderDashboardProps {
  isLoading: boolean;
  userProfile?: UserProfile
  quickStats: QuickStat[];
  stores: Array<Record<string, any>>; // More explicit than 'any[]'
  handleCreateStore: () => void;
  actionCards: ActionCard[];
  setActiveSection: (section: string) => void;
  getStatusIcon: (status: string) => any;
  getButtonStyle: (card: ActionCard) => string;
}

// Animation variants for better performance and reusability
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const RenderDashboard: FC<RenderDashboardProps> = ({
  isLoading,
  quickStats,
  stores,
  handleCreateStore,
  actionCards,
  setActiveSection,
  getStatusIcon,
  getButtonStyle,
  userProfile
}) => {
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const isFreePlan = userProfile?.subscription?.plan?.toLowerCase() === 'free';

  // Handler for action card clicks - better separation of concerns
  const handleActionCardClick = (card: ActionCard) => {
    if (card.status === 'disabled' || card.status === 'coming-soon') return;
    
    switch (card.id) {
      case 'create':
        handleCreateStore();
        break;
      case 'manage':
        setActiveSection('store');
        break;
      case 'analytics':
        setActiveSection('analytics')
        break;
      default:
        // Handle other action types if needed
        break;
    }
  };

  // Loading state component
  const LoadingState = () => (
    <motion.div 
      className="flex justify-center items-center h-64"
      {...fadeIn}
    >
      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
    </motion.div>
  );

  // Pro upgrade banner for free users
  const ProUpgradeBanner = () => {
    if (!isFreePlan || !showUpgradeBanner) return null;

    return (
      <motion.div
        variants={slideInLeft}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-3 mb-4 text-white"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative">
          
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-yellow-300" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-0.5">
                  Upgrade to Pro
                </h3>
                <p className="text-indigo-100 text-xs">
                  Get your store live with advanced features
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Upgrade</span>
                <ArrowUpRight className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Enhanced quick stats grid
  const QuickStatsGrid = () => (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {quickStats.map((stat, index) => (
        <motion.div
          key={`stat-${index}`}
          variants={fadeInUp}
          transition={{ delay: index * 0.1 }}
          className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                {stat.value}
              </p>
            </div>
            {stat.change && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-green-700 bg-green-100">
                {stat.change}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Enhanced store status component
  const StoreStatus = () => (
    <motion.div
      variants={fadeIn}
      className="mb-6"
    >
      {stores.length === 0 ? (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 border border-indigo-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-900 mb-0.5">
                  Create your first store
                </h3>
                <p className="text-xs text-indigo-700">
                  Start building your online presence today
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateStore}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-1 w-full sm:w-auto justify-center"
            >
              <Plus className="w-3 h-3" />
              <span>Create Store</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-0.5">
                Store Limit Reached
              </h3>
              <p className="text-xs text-amber-700">
                {isFreePlan 
                  ? 'Free plan allows 1 store only.'
                  : 'Delete current store to create new one.'
                }
              </p>
              {isFreePlan && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-1.5 bg-amber-600 text-white px-2.5 py-1 rounded-lg font-medium text-xs hover:bg-amber-700 transition-colors duration-200 flex items-center space-x-1"
                >
                  <Crown className="w-3 h-3" />
                  <span>Upgrade</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Enhanced action cards section
  const ActionCardsSection = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Quick Actions
        </h2>
        <span className="text-xs text-gray-500">
          What would you like to do next?
        </span>
      </div>
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {actionCards.map((card, index) => (
          <motion.div
            key={card.id}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-gray-50 group-hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <card.icon className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors duration-200" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors duration-200">
                    {card.title}
                  </h3>
                  {getStatusIcon(card.status)}
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {card.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleActionCardClick(card)}
                  disabled={card.status === 'disabled' || card.status === 'coming-soon'}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle(card)}`}
                >
                  {card.buttonText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  // Enhanced help section
  const HelpSection = () => (
    <motion.div
      variants={fadeIn}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    >
      <div className="flex items-center space-x-2 mb-3">
        <HelpCircle className="w-4 h-4 text-indigo-600" />
        <h3 className="text-base font-semibold text-gray-900">
          Need assistance?
        </h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Get help from our comprehensive resources and support team.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: 'Documentation', href: '#', desc: 'Detailed guides' },
          { icon: HelpCircle, label: 'Support Center', href: '#', desc: '24/7 assistance' },
          { icon: Play, label: 'Video Tutorials', href: '#', desc: 'Step-by-step videos' }
        ].map(({ icon: Icon, label, href, desc }) => (
          <a
            key={label}
            href={href}
            className="group p-2.5 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
          >
            <div className="flex items-start space-x-2">
              <Icon className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors duration-200 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-indigo-900 transition-colors duration-200">
                  {label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {desc}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState />
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <ProUpgradeBanner />

            <QuickStatsGrid />
            <StoreStatus />
            <ActionCardsSection />
            <HelpSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RenderDashboard;