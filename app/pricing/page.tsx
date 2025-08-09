'use client';

import Link from 'next/link';
import { motion, useInView, Variants } from 'framer-motion';
import { useState, useEffect, useRef, JSX } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, Ban, Star, Zap, Shield, Users, Globe, TrendingUp, Palette, Menu, X, HelpCircle } from 'lucide-react';

// Animation variants for scroll animations
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// Animation wrapper component
const ScrollAnimatedDiv: React.FC<{ 
  children: React.ReactNode; 
  variants?: Variants; 
  className?: string 
}> = ({ 
  children, 
  variants = fadeInUp, 
  className = "" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function PricingPage(): JSX.Element {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
      color: "indigo" as const
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
      color: "purple" as const
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
      icon: <Users className="w-6 h-6" />,
      title: "Complete Features",
      description: "Everything you need included"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Built-in Analytics",
      description: "Track and grow your business"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Ready",
      description: "Multi-currency support"
    }
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

  const toggleFAQ = (index: number): void => {
    setShowFAQ(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getColorClasses = (color: 'gray' | 'indigo' | 'purple', isPopular?: boolean) => {
    const colors = {
      gray: {
        border: 'border-gray-200',
        button: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        accent: 'text-gray-600'
      },
      indigo: {
        border: 'border-indigo-200 shadow-lg shadow-indigo-600/10',
        button: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25',
        accent: 'text-indigo-600'
      },
      purple: {
        border: 'border-purple-200',
        button: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        accent: 'text-purple-600'
      }
    };
    return colors[color];
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 p-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-gray-900">
              <Image
                src="/zeevo.png"
                alt="Zeevo Logo"
                width={84}
                height={64}
                className="object-contain max-w-[154px] my-0 sm:max-w-[72px] max-h-[580px]"
                priority
              />
            </div>
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/" className="text-base text-gray-600 hover:text-indigo-600 transition">Home</Link>
              <Link href="/features" className="text-base text-gray-600 hover:text-indigo-600 transition">Features</Link>
              <Link href="/pricing" className="text-base text-indigo-600 font-medium">Pricing</Link>
              <Link href="/auth/login" className="text-base text-gray-600 hover:text-indigo-600 transition">Sign In</Link>
              <Link
                href="/auth/sign-up"
                className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition text-base font-medium"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4 pb-4 border-t border-gray-100"
            >
              <div className="flex flex-col space-y-3 pt-4">
                <Link href="/" className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1">Home</Link>
                <Link href="/features" className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1">Features</Link>
                <Link href="/pricing" className="text-base text-indigo-600 font-medium px-2 py-1">Pricing</Link>
                <Link href="/auth/login" className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1">Sign In</Link>
                <Link href="/auth/sign-up" className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition text-base font-medium text-center mx-2">Get Started</Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl"
            animate={{ 
              scale: [1, 1.15, 1], 
              opacity: [0.2, 0.25, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollAnimatedDiv>
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 mb-8 font-medium border border-white/20">
              <Star className="w-5 h-5 text-yellow-500" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Choose the Perfect Plan for <span className="text-indigo-600">Your Store</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start with our free plan and upgrade as you grow. All plans include unlimited products and essential e-commerce features.
            </p>
          </ScrollAnimatedDiv>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={scaleIn} className="text-center">
                <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3 w-fit mx-auto mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimatedDiv className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Pricing Built for Growth</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the plan that suits your business. Free plan stores are private for testing; paid plans are public and live.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 flex items-center border border-gray-200 shadow-sm">
                <button
                  className={`px-6 py-3 rounded-md text-sm font-medium transition ${!isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-3 rounded-md text-sm font-medium transition relative ${isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(true)}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    5% Off
                  </span>
                </button>
              </div>
            </div>
          </ScrollAnimatedDiv>

          {/* Pricing Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {pricingPlans.map((plan, index) => {
              const colorClasses = getColorClasses(plan.color, plan.popular);
              
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`relative bg-white p-8 rounded-xl border transition-all duration-300 flex flex-col ${colorClasses.border} ${plan.popular ? 'transform md:scale-105' : 'hover:shadow-md'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
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
                      <div className="text-sm text-green-600 font-medium mt-1">
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
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{typeof feature === 'string' ? feature : feature.text}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.disabled ? (
                    <button
                      className={`w-full py-4 rounded-lg font-medium transition text-base ${colorClasses.button}`}
                      disabled={plan.disabled}
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <Link href="/auth/sign-up">
                      <button className={`w-full py-4 rounded-lg font-medium transition text-base ${colorClasses.button}`}>
                        {plan.cta}
                      </button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          <ScrollAnimatedDiv className="text-center">
            <p className="text-gray-600 mb-4">All plans include secure hosting, SSL certificates, and mobile-responsive designs.</p>
            <p className="text-sm text-gray-500">Need something custom? <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">Contact our sales team</Link></p>
          </ScrollAnimatedDiv>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimatedDiv className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about our pricing and plans.</p>
          </ScrollAnimatedDiv>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="border border-gray-200 rounded-lg"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <HelpCircle className={`w-5 h-5 text-gray-500 transition-transform ${showFAQ[index] ? 'rotate-180' : ''}`} />
                </button>
                {showFAQ[index] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimatedDiv>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Building?</h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who've built successful online stores with Zeevo. Start free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition font-medium inline-flex items-center gap-3 text-lg shadow-lg"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
           
            </div>
          </ScrollAnimatedDiv>
        </div>
      </section>

      {/* Basic Footer */}
      <ScrollAnimatedDiv>
        <footer className="py-12 px-6 bg-gray-900 text-gray-300">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-white">Zeevo</div>
                <span className="text-gray-500">•</span>
                <span className="text-sm">Build your online store</span>
              </div>

              {/* Quick Links */}
              <div className="flex items-center gap-6 text-sm">
                <Link href="/help" className="hover:text-white transition">Help</Link>
                <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition">Terms</Link>
                <Link href="/contact" className="hover:text-white transition">Contact</Link>
              </div>

              {/* Copyright */}
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Zeevo. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </ScrollAnimatedDiv>
    </main>
  );
}