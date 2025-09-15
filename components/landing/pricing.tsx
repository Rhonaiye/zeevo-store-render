import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      name: "Launch",
      price: "₦0",
      period: "per month",
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
      popular: false
    },
    {
      name: "Boost",
      price: isAnnual ? "₦45,600" : "₦4,000",
      period: isAnnual ? "per year" : "per month",
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
      popular: true
    },
    {
      name: "Thrive",
      price: isAnnual ? "₦108,300" : "₦9,500",
      period: isAnnual ? "per year" : "per month",
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
      disabled: true
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Animated Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Pricing <span className="text-[#03E525]">Built for Store</span> Growth
          </h2>
          <p className="mt-4 text-lg xl:text-base xl:max-w-[55%] xl:mx-auto text-gray-600">
            Choose the plan that suits your online store. Free plan stores are private and not visible to customers; paid plans are public.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-lg p-1 flex items-center border border-[#03E525]">
              <button
                className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                  !isAnnual ? 'bg-[#037834] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                  isAnnual ? 'bg-[#037834] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Yearly (5% Off)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-xl border transition-all duration-300 flex flex-col
                ${
                  plan.popular
                    ? 'border-[#DCFEDE] shadow-lg shadow-indigo-600/10 bg-[#DCFEDE]'
                    : 'border-[#03E525] hover:shadow-md bg-white'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#037834] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="text-4xl font-bold text-[#03E525] mt-4">{plan.price}</div>
                <div className="text-sm text-gray-600 mt-2">{plan.period}</div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-gray-600">
                    {typeof feature === 'object' && feature.highlight ? (
                      <>
                        <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{feature.text}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{typeof feature === 'string' ? feature : feature.text}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {plan.disabled ? (
                <button
                  className={`w-full py-3.5 rounded-lg font-medium transition text-base ${
                    plan.disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-[#037834] text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-gray-100 text-indigo-600 hover:bg-indigo-50'
                  }`}
                  disabled={plan.disabled}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link href="/auth/sign-up">
                  <button
                    className={`w-full py-3.5 rounded-lg font-medium transition text-base ${
                      plan.disabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-[#037834] text-white hover:bg-[#037834]/90 shadow-lg shadow-indigo-[#037834]/25'
                        : 'bg-gray-100 text-[#037834] hover:bg-[#DCFEDE]'
                    }`}
                    disabled={plan.disabled}
                  >
                    {plan.cta}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
