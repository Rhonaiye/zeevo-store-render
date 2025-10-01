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
  Wallet,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Banknote
} from 'lucide-react';
import React, { FC, useState, useEffect, useMemo } from 'react';
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
  const hasPayout = !!(userProfile?.wallet?.payoutAccounts && userProfile.wallet.payoutAccounts.length > 0);
  const [currentStep, setCurrentStep] = useState(1);

  const handleNavClick = (
    itemId: string,
  ) => {
    setActiveSection(itemId);
    Cookies.set('lastActiveSection', itemId, { expires: 30 });
    window.scrollTo(0, 0); // Scroll to top
  };

  // Update currentStep based on profile
  useEffect(() => {
    if (userProfile) {
      console.log('User Profile:', userProfile);
      const hasStore = hasStores;
      if (!hasStore) {
        setCurrentStep(1);
      } else if (!hasPayout) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
  }, [userProfile, hasStores, hasPayout]);

  const onboardingSteps = useMemo(() => [
    {
      step: 1,
      title: 'Create Your Shop',
      description: 'Set up your first store to start selling products online.',
      icon: Store,
      action: () => {
        handleNavClick('store');
      },
      completed: hasStores,
    },
    {
      step: 2,
      title: 'Add Payout Account',
      description: 'Connect your bank or payout method to receive earnings from sales.',
      icon: Wallet,
      action: () => {
        handleNavClick('zeevo_wallet');
      },
      completed: hasPayout,
    },
    {
      step: 3,
      title: 'Start Selling',
      description: 'Once your store is ready! Add products and watch sales come in.',
      icon: ShoppingCart,
      action: () => {
        addNotification('Welcome to selling! Your setup is complete.', 'success');
        handleNavClick('products');
      },
      completed: true,
    },
  ], [setActiveSection, userProfile, stores, addNotification, hasStores, hasPayout]);

  const renderOnboarding = () => {
    const progress = ((currentStep - 1) / (onboardingSteps.length - 1)) * 100;
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of {onboardingSteps.length}</span>
            <span>{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#41DD60] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-6">
          {onboardingSteps.map((stepItem, index) => (
            <motion.div
              key={stepItem.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-xl border ${
                stepItem.completed
                  ? 'bg-green-50 border-green-200'
                  : index + 1 < currentStep
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepItem.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stepItem.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{stepItem.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{stepItem.description}</p>
                {!stepItem.completed && index + 1 === currentStep && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={stepItem.action}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#41DD60] text-white rounded-lg text-sm font-medium hover:bg-[#41DD60]/90 transition-colors"
                  >
                    {index + 1 === onboardingSteps.length ? 'Get Started' : 'Complete Step'}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
                {stepItem.completed && index + 1 < onboardingSteps.length && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        {hasStores && hasPayout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 p-6 bg-blue-50 rounded-xl"
          >
            <Banknote className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Sell!</h2>
            <p className="text-gray-600 mb-4">Your store is set up and payout is configured. Start adding products now.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={onboardingSteps[2].action}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add First Product
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  };

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
        className="group bg-transparent rounded-lg border border-[#2FDD4C] p-4  transition-all duration-300"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-xl font-semibold text-gray-900 transition-colors duration-200">
              {stat.value}
            </p>
          </div>
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
        <div className="bg-[#DCFEDE] rounded-lg p-4 ">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#069A46] rounded-full">
                <Store className="w-4 h-4 text-white" />
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
                    <p className="text-xs text-[#03E525]">Your store is publicly visible and ready for customers.</p>
                  </>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openStoreInNewTab(firstStore)}
              className="bg-gradient-to-r from-[#06A841] to-[#04D32D] text-white px-3 py-1.5 rounded-md font-medium text-xs hover:from-[#05A338] hover:to-[#03C92A] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition-all duration-150 flex items-center space-x-1 w-full sm:w-auto justify-center"
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



  // Action cards sections
 const ActionCardsSection = () => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      <span className="text-xs text-gray-500">Choose your next step</span>
    </div>
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {actionCards.map((card, index) => {
        const isDisabled =
          card.status === "disabled" || card.status === "coming-soon";
        const isPreviewCard = card.id === "preview";
        const isManageCard = card.id === "manage";

        // First card (60%), Second card (40%), Last card (60%), the one before last (40%)
        let colSpan = "lg:col-span-2"; // default (40%)
        if (index === 0 || index === actionCards.length - 1) {
          colSpan = "lg:col-span-3"; // 60%
        }

        return (
          <motion.div
            key={card.id}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
            className={`group bg-transparent border border-gray-100 rounded-lg  p-3  transition-all duration-300 ${colSpan}`}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-[#069A46]  rounded-full transition-colors duration-200">
                <card.icon className="w-4 h-4 text-white  transition-colors duration-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 transition-colors duration-200">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                  {card.description}
                </p>
                <motion.button
                  whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                  whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                  onClick={() => {
                    console.log(
                      "RenderDashboard: Button clicked for card:",
                      card.id
                    );
                    handleActionCardClick(card);
                  }}
                  disabled={isDisabled}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${getButtonStyle(
                    card
                  )}`}
                  aria-label={getButtonAriaLabel(card)}
                >
                  {(isManageCard || isPreviewCard) && (
                    <ArrowUpRight className="w-3 h-3 mr-1 " />
                  )}
                  <span className=''>{getButtonText(card)}</span>
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
      default:
        return card.buttonText;
    }
  };

  const getButtonAriaLabel = (card: ActionCard): string => {
    switch (card.id) {
      case 'manage':
        return 'Navigate to store management section';
      case 'preview':
        return 'View live store in a new tab';
      default:
        return card.buttonText;
    }
  };

  // Help section
  const HelpSection = () => (
    <motion.div
      variants={fadeIn}
      className="bg-transparent rounded-lg border border-gray-100  p-4 shadow-lg"
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
          <motion.div
            key="loading"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingState />
          </motion.div>
        ) : !hasStores || !hasPayout ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderOnboarding()}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
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