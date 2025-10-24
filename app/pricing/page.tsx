'use client';

import React, { useState, useRef } from 'react';
import { Menu, X, ArrowRight, Check, Ban, Star, Zap, Shield, Users, Globe, TrendingUp, Palette, HelpCircle } from 'lucide-react';
import Footer from '@/components/landing/footer';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Navbar Component
const Navbar = () => {
  const getPath = () => (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [path, setPath] = React.useState(getPath());
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleClick = (href: any, e: any) => {
    setPath(new URL(href, window.location.href).pathname);
    setMenuOpen(false);
  };

  return (
    <nav className="relative flex items-center justify-between px-4 py-3 md:px-5 md:py-0 bg-[#E2FEE4]" aria-label="Main navigation">
      <div className="flex items-center z-10 -my-7">
        <div className="w-[120px] h-[120px] md:w-[120px] md:h-[120px] relative">
          <img
            src="/zeevo-logo.png"
            alt="zeevo logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-x-8">
        {links.map(l => {
          const active = path === l.href || (l.href === '/' && path === '/');
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleClick(l.href, e)}
              className={`text-[#03E525] cursor-pointer ${
                active
                  ? 'font-semibold underline underline-offset-4 text-[#037834]'
                  : 'font-medium hover:text-[#03E525]/65 transition-colors'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {l.label}
            </a>
          );
        })}
      </div>

      <div className="hidden md:block">
        <button className="px-3.5 py-2 bg-[#037834] text-white font-semibold rounded-md hover:bg-[#037834]/90 transition-colors">
          Get Started
        </button>
      </div>

      <button
        className="md:hidden text-[#037834] z-50 relative"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed inset-0 bg-[#E2FEE4] z-40 md:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          {links.map((l, idx) => {
            const active = path === l.href || (l.href === '/' && path === '/');
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleClick(l.href, e)}
                className={`text-3xl cursor-pointer transition-all duration-300 transform ${
                  menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                } ${
                  active
                    ? 'font-bold text-[#037834]'
                    : 'font-semibold text-[#03E525] hover:text-[#037834] hover:scale-110'
                }`}
                style={{ transitionDelay: menuOpen ? `${idx * 50}ms` : '0ms' }}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </a>
            );
          })}
          <button 
            className={`px-8 py-3.5 bg-[#037834] text-white text-lg font-semibold rounded-lg hover:bg-[#037834]/90 transition-all duration-300 transform hover:scale-105 mt-4 ${
              menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: menuOpen ? `${links.length * 50}ms` : '0ms' }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showFAQ, setShowFAQ] = useState<Record<number, boolean>>({});

  const pricingPlans = [
    {
      name: "Launch",
      price: "₦0",
      period: "per month",
      originalPrice: null,
      description: "Perfect for getting started and testing your store concept",
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
      color: "gray" as const
    },
    {
      name: "Boost",
      price: isAnnual ? "₦45,600" : "₦4,000",
      originalPrice: isAnnual ? "₦48,000" : null,
      period: isAnnual ? "per year" : "per month",
      description: "Everything you need to launch and run your online store",
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
      color: "green" as const
    },
    {
      name: "Thrive",
      price: isAnnual ? "₦108,300" : "₦9,500",
      originalPrice: isAnnual ? "₦114,000" : null,
      period: isAnnual ? "per year" : "per month",
      description: "Advanced features for scaling your business",
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
      color: "emerald" as const
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Build stores in minutes"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Templates",
      description: "Stunning, customizable designs"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "99.9% uptime guarantee"
    },

    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Built-in Analytics",
      description: "Track and grow your business"
    },
   
  ];

  const faqs = [
    {
      question: "What's the difference between private and public stores?",
      answer: "Private stores (Launch plan) are only visible to you and can't be accessed by customers. Public stores (Boost and Thrive) are live on the internet and can be found by customers."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle."
    },
    {
      question: "Is there a setup fee or hidden costs?",
      answer: "No setup fees or hidden costs. The price you see is exactly what you pay. Payment processing fees may apply depending on your chosen payment gateway."
    },
    {
      question: "What happens if I exceed my limits?",
      answer: "All our plans include unlimited products, so you won't hit any product limits. We'll contact you if you significantly exceed fair usage limits."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans if you're not satisfied with our service."
    },
    {
      question: "Can I use my own domain?",
      answer: "Custom domains are available on the Thrive plan. Launch and Boost plans use a Zeevo subdomain (yourstore.zeevo.com)."
    }
  ];

  const toggleFAQ = (index: number) => {
    setShowFAQ(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getColorClasses = (color: 'gray' | 'green' | 'emerald', isPopular?: boolean) => {
    const colors = {
      gray: {
        border: 'border-gray-200',
        button: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        accent: 'text-gray-600'
      },
      green: {
        border: 'border-[#03E525]/30 shadow-lg shadow-[#03E525]/10',
        button: 'bg-[#037834] text-white hover:bg-[#037834]/90 shadow-lg shadow-[#037834]/25',
        accent: 'text-[#037834]'
      },
      emerald: {
        border: 'border-emerald-200',
        button: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        accent: 'text-emerald-600'
      }
    };
    return colors[color];
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative max-sm:pt-20 max-sm:pt-28 pt-16 pb-24 px-6 bg-gradient-to-br from-[#E2FEE4] via-white to-green-50 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
         
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Choose the Perfect Plan for <span className="text-[#037834]">Your Store</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start with our free plan and upgrade as you grow. All plans include unlimited products and essential e-commerce features.
          </p>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#E2FEE4] text-[#037834] rounded-lg p-3 w-fit mx-auto mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Pricing Built for Growth</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the plan that suits your business. Free plan stores are private for testing; paid plans are public and live.
            </p>
            
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 flex items-center border border-gray-200 shadow-sm">
                <button
                  className={`px-6 py-3 rounded-md text-sm font-medium transition ${!isAnnual ? 'bg-[#037834] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-3 rounded-md text-sm font-medium transition relative ${isAnnual ? 'bg-[#037834] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(true)}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-[#03E525] text-[#037834] text-xs px-2 py-1 rounded-full font-bold">
                    5% Off
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => {
              const colorClasses = getColorClasses(plan.color, plan.popular);
              
              return (
                <div
                  key={index}
                  className={`relative bg-white p-8 rounded-xl border transition-all duration-300 flex flex-col ${colorClasses.border} ${plan.popular ? 'transform md:scale-105' : 'hover:shadow-md'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#037834] text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{plan.originalPrice}</span>
                      )}
                      <div className={`text-4xl font-bold ${colorClasses.accent}`}>{plan.price}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">{plan.period}</div>
                    {isAnnual && plan.originalPrice && (
                      <div className="text-sm text-[#037834] font-medium mt-1">
                        Save ₦{parseInt(plan.originalPrice.replace('₦', '').replace(',', '')) - parseInt(plan.price.replace('₦', '').replace(',', ''))} per year
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        {typeof feature === 'object' && feature.highlight ? (
                          <>
                            <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{feature.text}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 text-[#03E525] flex-shrink-0 mt-0.5" />
                            <span>{typeof feature === 'string' ? feature : feature.text}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-4 rounded-lg font-medium transition text-base ${colorClasses.button}`}
                    disabled={plan.disabled}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">All plans include secure hosting, SSL certificates, and mobile-responsive designs.</p>
            <p className="text-sm text-gray-500">Need something custom? <a href="/contact" className="text-[#037834] hover:text-[#03E525] font-medium">Contact our sales team</a></p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about our pricing and plans.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <HelpCircle className={`w-5 h-5 text-gray-500 transition-transform ${showFAQ[index] ? 'rotate-180' : ''}`} />
                </button>
                {showFAQ[index] && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#037834] to-[#03E525] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who've built successful online stores with Zeevo. Start free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#037834] px-8 py-4 rounded-lg hover:bg-green-50 transition font-medium inline-flex items-center justify-center gap-3 text-lg shadow-lg">
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
     <Footer/>
    </main>
  );
}