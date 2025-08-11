'use client';
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
} from 'lucide-react';
import { FC, useState, useEffect } from 'react';
import { QuickStat, UserProfile, ActionCard } from '@/store/useAppStore';
import Cookies from 'js-cookie';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

// Interface
interface RenderDashboardProps {
  isLoading: boolean;
  quickStats: QuickStat[];
  stores: Array<Record<string, any> & { slug: string; isPublished: boolean }>;
  actionCards: ActionCard[];
  setActiveSection: (section: string) => void;
  getStatusIcon: (status: string) => any;
  getButtonStyle: (card: ActionCard) => string;
  addNotification: (message: string, type: 'success' | 'error', duration?: number) => void;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const RenderDashboard: FC<RenderDashboardProps> = ({
  isLoading,
  quickStats,
  stores,
  actionCards,
  setActiveSection,
  getStatusIcon,
  getButtonStyle,
  addNotification
}) => {
  const router = useRouter();
  const { userProfile } = useAppStore();
  const isFreePlan = userProfile?.subscription?.plan?.toLowerCase() === 'free';
  const hasStores = stores.length > 0;
  const firstStore = hasStores ? stores[0] : null;

  // Load saved section on mount
  useEffect(() => {
    const savedSection = Cookies.get('lastActiveSection');
    if (savedSection && actionCards.some(card => card.id === savedSection)) {
      console.log('RenderDashboard: Loading saved section from cookie:', savedSection);
      setActiveSection(savedSection);
    }
  }, [setActiveSection, actionCards]);

  // Helper function to open store in new tab
  const openStoreInNewTab = (store: any) => {
    if (!store?.slug) {
      console.error('RenderDashboard: No store slug found');
      addNotification('Store URL not available', 'error');
      return;
    }
    
    const storeUrl = `https://${store.slug}.zeevo.shop`;
    console.log('RenderDashboard: Opening store URL:', storeUrl);
    window.open(storeUrl, '_blank');
  };

  // Helper function to navigate to section with cookie persistence
  const navigateToSection = (sectionId: string) => {
    console.log('RenderDashboard: Navigating to section:', sectionId);
    setActiveSection(sectionId);
    Cookies.set('lastActiveSection', sectionId, { expires: 30 });
  };

  // Handler for action card clicks
  const handleActionCardClick = (card: ActionCard) => {
    // Skip if card is disabled
    if (card.status === 'disabled' || card.status === 'coming-soon') {
      console.log(`RenderDashboard: Card ${card.id} is disabled or coming soon`);
      return;
    }

    console.log('RenderDashboard: Action card clicked:', card.id);

    switch (card.id) {
      case 'create':
        navigateToSection('store');
        break;
        
      case 'manage':
        if (hasStores) {
          navigateToSection('store');
        } else {
          console.log('RenderDashboard: No stores available to manage');
          addNotification('No stores available to manage', 'error');
        }
        break;
        
      case 'preview':
        if (hasStores && firstStore) {
          openStoreInNewTab(firstStore);
        } else {
          console.log('RenderDashboard: No stores available to preview');
          addNotification('No stores available to preview', 'error');
        }
        break;
        
      case 'analytics':
        navigateToSection('analytics');
        break;
        
      default:
        console.log('RenderDashboard: Unhandled action card:', card.id);
    }
  };

  const handleCreateStore = () => {
    navigateToSection('store');
  };

  const handleUpgrade = async () => {
    router.push('/dashboard/pricing');
  };

  // Full-screen loader component
  const FullScreenLoader = () => (
    <motion.div
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="text-white text-lg font-medium">Processing Upgrade...</p>
      </div>
    </motion.div>
  );

  // Loading state component
  const LoadingState = () => (
    <motion.div className="flex justify-center items-center h-64" {...fadeIn}>
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
    </motion.div>
  );

  // Quick stats grid
  const QuickStatsGrid = () => (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {quickStats.map((stat, index) => (
        <motion.div
          key={`stat-${index}`}
          variants={fadeInUp}
          transition={{ delay: index * 0.1 }}
          className="group bg-white rounded-lg border border-gray-100 p-4 hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-500 transition-colors duration-200">
                {stat.value}
              </p>
            </div>
            {stat.change && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-50">
                {stat.change}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Store status component
  const StoreStatus = () => (
    <motion.div variants={fadeIn} className="mb-6">
      {!hasStores ? (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-md">
                <Store className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-900">Launch Your First Store</h3>
                <p className="text-xs text-indigo-600">Begin your online journey today</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateStore}
              className="bg-indigo-500 text-white px-3 py-1.5 rounded-md font-medium text-xs hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-colors duration-150 flex items-center space-x-1 w-full sm:w-auto justify-center"
            >
              <Plus className="w-3 h-3" />
              <span>Create Store</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-md">
                <Store className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                {!firstStore?.isPublished ? (
                  <>
                    <h3 className="text-sm font-semibold text-amber-900">Store visibility is set to private</h3>
                    <p className="text-xs text-amber-600">
                      {isFreePlan && 'The free plan restricts store listings to private visibility.'}
                    </p>
                    {isFreePlan && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUpgrade}
                        className="mt-2 bg-amber-500 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors duration-150 flex items-center space-x-1 hover:bg-amber-600"
                      >
                        <Crown className="w-3 h-3" />
                        <span>Upgrade</span>
                      </motion.button>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-amber-900">Your store is live!</h3>
                    <p className="text-xs text-amber-600">Your store is publicly visible and ready for customers.</p>
                  </>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openStoreInNewTab(firstStore)}
              className="bg-amber-500 text-white px-3 py-1.5 rounded-md font-medium text-xs hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 transition-colors duration-150 flex items-center space-x-1 w-full sm:w-auto justify-center"
              aria-label="View live store in a new tab"
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>View Live Store</span>
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Action cards section
  const ActionCardsSection = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <span className="text-xs text-gray-500">Choose your next step</span>
      </div>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {actionCards.map((card, index) => {
          const isDisabled = card.status === 'disabled' || card.status === 'coming-soon';
          const isPreviewCard = card.id === 'preview';
          const isManageCard = card.id === 'manage';
          
          return (
            <motion.div
              key={card.id}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md hover:border-indigo-100 transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-50 group-hover:bg-indigo-50 rounded-md transition-colors duration-200">
                  <card.icon className="w-4 h-4 text-gray-600 group-hover:text-indigo-500 transition-colors duration-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-500 transition-colors duration-200">
                      {card.title}
                    </h3>
                    {getStatusIcon(card.status)}
                  </div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{card.description}</p>
                  <motion.button
                    whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                    onClick={() => {
                      console.log('RenderDashboard: Button clicked for card:', card.id);
                      handleActionCardClick(card);
                    }}
                    disabled={isDisabled}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${getButtonStyle(card)}`}
                    aria-label={getButtonAriaLabel(card)}
                  >
                    {(isManageCard || isPreviewCard) && (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    )}
                    <span>{getButtonText(card)}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );

  // Helper functions for button text and aria labels
  const getButtonText = (card: ActionCard): string => {
    switch (card.id) {
      case 'manage':
        return 'Manage Store';
      case 'preview':
        return 'Preview Store';
      default:
        return card.buttonText;
    }
  };

  const getButtonAriaLabel = (card: ActionCard): string => {
    switch (card.id) {
      case 'manage':
        return 'Navigate to store management section';
      case 'preview':
        return 'Preview store in a new tab';
      default:
        return card.buttonText;
    }
  };

  // Help section
  const HelpSection = () => (
    <motion.div
      variants={fadeIn}
      className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm"
    >
      <div className="flex items-center space-x-2 mb-3">
        <HelpCircle className="w-4 h-4 text-indigo-500" />
        <h3 className="text-base font-semibold text-gray-900">Need Help?</h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">Explore our resources for guidance and support.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: 'Documentation', href: '#', desc: 'In-depth guides' },
          { icon: HelpCircle, label: 'Support Center', href: '#', desc: '24/7 help' },
          { icon: Play, label: 'Video Tutorials', href: '#', desc: 'Visual walkthroughs' },
        ].map(({ icon: Icon, label, href, desc }) => (
          <a
            key={label}
            href={href}
            className="group p-2.5 border border-gray-100 rounded-md hover:border-indigo-100 hover:bg-indigo-50 transition-all duration-200"
          >
            <div className="flex items-start space-x-2">
              <Icon className="w-4 h-4 text-gray-600 group-hover:text-indigo-500 transition-colors duration-200 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-indigo-500 transition-colors duration-200">
                  {label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState />
        ) : (
          <motion.div initial="initial" animate="animate" exit="exit" className="space-y-6">
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