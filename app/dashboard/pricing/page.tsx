'use client'
import React, { useState } from 'react';
import { Check, Ban, Star, ArrowLeft } from 'lucide-react';
import Cookies from 'js-cookie';
import Notification from '@/components/ui/notification';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  planType: string;
  features: (string | { text: string; highlight: boolean })[];
  cta: string;
  popular: boolean;
  disabled?: boolean;
  free?: boolean;
}

interface ComparisonFeature {
  name: string;
  launch: string | boolean;
  boost: string | boolean;
  thrive: string | boolean;
}

interface ComparisonCategory {
  category: string;
  features: ComparisonFeature[];
}

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const showNotification = (message: string, type: 'success' | 'error'): void => {
    setNotificationMessage(message);
    setNotificationType(type);
    setNotificationVisible(true);
  };

  const closeNotification = (): void => {
    setNotificationVisible(false);
  };

  const handleUpgrade = async (planType: string): Promise<void> => {
    const token = Cookies.get('token');
    if (!token) {
      showNotification('Authentication error: No token found', 'error');
      return;
    }

    setIsUpgrading(true);
    try {
      const billingCycle = isAnnual ? 'yearly' : 'monthly';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planType,
          billingCycle: billingCycle,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/dashboard?upgrade=canceled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { paymentUrl }: { paymentUrl: string } = await response.json();
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      const err = error as Error;
      showNotification(`Failed to initiate upgrade: ${err.message}`, 'error');
      console.error('Error creating payment session:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const pricingPlans: PricingPlan[] = [
    {
      name: "Launch",
      price: "₦0",
      period: "per month",
      description: "Perfect for getting started with your store",
      planType: "launch",
      features: [
        { text: "Private store (not visible to customers)", highlight: true },
        "Default template only",
        "Unlimited products",
        "Basic payment integration",
        "Basic analytics (store visits, orders)",
        "Zeevo watermark on store",
        "No custom domain",
        "Email support only"
      ],
      cta: "Start Now",
      popular: false,
      free: true
    },
    {
      name: "Boost",
      price: isAnnual ? "₦45,600" : "₦4,000",
      period: isAnnual ? "per year" : "per month",
      description: "Best for growing businesses",
      planType: "boost",
      features: [
        "Public store (visible to customers)",
        "Everything in Launch",
        "All premium templates",
        "Unlimited products",
        "Zeevo watermark on store",
        "Custom branding (colors & logos)",
        "No custom domain",
        "Priority email support",
        "Basic analytics (store visits, orders)"
      ],
      cta: "Start Now",
      popular: true,
      free: false
    },
    {
      name: "Thrive",
      price: isAnnual ? "₦108,300" : "₦9,500",
      period: isAnnual ? "per year" : "per month",
      description: "For established businesses that need advanced features",
      planType: "thrive",
      features: [
        "Public store (visible to customers)",
        "Everything in Boost",
        "Unlimited products",
        "Full custom domain support",
        "Advanced analytics & reports (campaigns, product-level)",
        "Advanced integrations (CRM, email marketing)",
        "Scheduled product launches & sales",
        "Priority phone & chat support",
        "Custom checkout experience",
        "Abandoned cart recovery"
      ],
      cta: "Coming Soon",
      popular: false,
      disabled: true,
      free: false
    }
  ];

  const comparisonFeatures: ComparisonCategory[] = [
    { 
      category: "Store Setup",
      features: [
        { name: "Store visibility", launch: "Private only", boost: "Public", thrive: "Public" },
        { name: "Templates", launch: "Default only", boost: "All premium", thrive: "All premium" },
        { name: "Custom branding", launch: false, boost: true, thrive: true },
        { name: "Custom domain", launch: false, boost: false, thrive: true },
        { name: "Zeevo watermark", launch: true, boost: true, thrive: false }
      ]
    },
    { 
      category: "Products & Sales",
      features: [
        { name: "Products", launch: "Unlimited", boost: "Unlimited", thrive: "Unlimited" },
        { name: "Payment integration", launch: "Basic", boost: "Basic", thrive: "Advanced" },
        { name: "Checkout experience", launch: "Standard", boost: "Standard", thrive: "Custom" },
        { name: "Scheduled launches", launch: false, boost: false, thrive: true },
        { name: "Abandoned cart recovery", launch: false, boost: false, thrive: true }
      ]
    },
    { 
      category: "Analytics & Marketing",
      features: [
        { name: "Analytics", launch: "Basic", boost: "Basic", thrive: "Advanced" },
        { name: "Campaign tracking", launch: false, boost: false, thrive: true },
        { name: "Product-level reports", launch: false, boost: false, thrive: true },
        { name: "CRM integration", launch: false, boost: false, thrive: true },
        { name: "Email marketing", launch: false, boost: false, thrive: true }
      ]
    },
    { 
      category: "Support",
      features: [
        { name: "Email support", launch: true, boost: true, thrive: true },
        { name: "Priority email", launch: false, boost: true, thrive: true },
        { name: "Phone support", launch: false, boost: false, thrive: true },
        { name: "Chat support", launch: false, boost: false, thrive: true }
      ]
    }
  ];

  const renderFeatureValue = (value: string | boolean): React.ReactNode => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-[#03E525] mx-auto" />
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      );
    }
    return <span className="text-sm text-gray-900">{value}</span>;
  };

  const handleButtonClick = (plan: PricingPlan): void => {
    if (plan.free) {
      window.location.href = '/dashboard?plan=launch';
    } else if (!plan.disabled) {
      handleUpgrade(plan.planType);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Notification
        isOpen={notificationVisible}
        message={notificationMessage}
        type={notificationType}
        onClose={closeNotification}
      />

      {/* Back Button */}
      <div className="max-w-6xl px-6 pt-8 pb-8">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#03E525] transition-colors group mb-4"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#E2FEE4] via-white to-[#E2FEE4] pt-16 pb-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 mb-8 font-medium border border-white/20">
            <Star className="w-5 h-5 text-[#03E525]" />
            Transparent pricing for every business size
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Pricing Built for <span className="text-[#03E525]">Store Growth</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that suits your online store. Free plan stores are private and not visible to customers; paid plans are public.
          </p>
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="flex justify-center mb-16">
          <div className="bg-white rounded-lg p-1 flex items-center border border-gray-200 shadow-lg">
            <button
              className={`px-8 py-4 rounded-md text-base font-medium transition ${!isAnnual ? 'bg-[#03E525] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-8 py-4 rounded-md text-base font-medium transition ${isAnnual ? 'bg-[#03E525] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setIsAnnual(true)}
            >
              Yearly (5% Off)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white p-8 rounded-2xl border transition-all duration-300 flex flex-col ${
                plan.popular 
                  ? 'border-[#E2FEE4] shadow-xl shadow-[#03E525]/20 scale-105' 
                  : 'border-gray-200 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#03E525] to-[#02CE21] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="text-5xl font-bold text-[#03E525] mb-2">{plan.price}</div>
                <div className="text-gray-600">{plan.period}</div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-base">
                    {typeof feature === 'object' && feature.highlight ? (
                      <>
                        <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature.text}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 text-[#03E525] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{typeof feature === 'string' ? feature : feature.text}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleButtonClick(plan)}
                disabled={plan.disabled || isUpgrading}
                className={`w-full py-4 rounded-lg font-semibold transition text-base ${
                  plan.disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-[#03E525] to-[#02CE21] text-white hover:from-[#02B71D] hover:to-[#02A019] shadow-lg shadow-[#03E525]/25 disabled:opacity-70 disabled:cursor-not-allowed'
                    : 'bg-[#E2FEE4] text-[#03E525] hover:bg-[#CBE4CD] border border-[#E2FEE4] disabled:opacity-70 disabled:cursor-not-allowed'
                }`}
              >
                {isUpgrading && !plan.free && !plan.disabled ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-8 text-center border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Feature Comparison</h2>
            <p className="text-gray-600">Compare all features across our pricing plans</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Launch</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#03E525] bg-[#E2FEE4]">Boost</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Thrive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonFeatures.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {feature.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(feature.launch)}
                        </td>
                        <td className="px-6 py-4 text-center bg-[#E2FEE4]/50">
                          {renderFeatureValue(feature.boost)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(feature.thrive)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion */}
          <div className="lg:hidden">
            {comparisonFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border-b border-gray-200 last:border-b-0">
                <div className="bg-gray-50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="p-6">
                      <h4 className="text-base font-medium text-gray-900 mb-4">{feature.name}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-2">Launch</div>
                          {renderFeatureValue(feature.launch)}
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-[#03E525] font-medium mb-2">Boost</div>
                          {renderFeatureValue(feature.boost)}
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-2">Thrive</div>
                          {renderFeatureValue(feature.thrive)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default PricingPage;