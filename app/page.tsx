'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, Zap, Palette, Shield, TrendingUp, Users, Globe, Star, Check, Twitter, Instagram, Linkedin, Menu, X, Ban } from 'lucide-react';

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast Store Creation",
      description: "Build and launch your online store in under 5 minutes with no technical skills needed."
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Store Templates",
      description: "Choose from stunning, customizable templates that perfectly reflect your unique brand identity."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable Hosting",
      description: "Enterprise-grade security and hosting with 99.9% uptime guarantee for your peace of mind."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Built-in Analytics & Tools",
      description: "Track performance and grow your store with integrated analytics and marketing tools."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Complete E-commerce Features",
      description: "Everything you need - from payment processing to inventory management and customer support."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Ready",
      description: "Multi-currency support, global payment processing, and worldwide content delivery."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion Retailer",
      content: "Created my online store in 3 minutes. The templates are stunning and sales increased by 300%!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Artisan Seller",
      content: "Building my store was incredibly easy. The customization options let me create exactly what I envisioned.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Digital Seller",
      content: "Best store builder I've used. Created my online shop in one place - simple and powerful.",
      rating: 5
    }
  ];

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

  const useCases = [
    { title: "Fashion Store" },
    { title: "Artisan Shop" },
    { title: "Digital Products Store" },
    { title: "Local Retail Store" },
    { title: "Beauty & Cosmetics Shop" },
    { title: "Professional Services Store" },
    { title: "Content Creator Shop" },
    { title: "Restaurant Online Ordering" }
  ];

  return (
    <main className="min-h-screen bg-white">
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
              <Link href="/features" className="text-base text-gray-600 hover:text-indigo-600 transition">Features</Link>
              <Link href="/pricing" className="text-base text-gray-600 hover:text-indigo-600 transition">Pricing</Link>
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
                <Link 
                  href="/features" 
                  className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/auth/login" 
                  className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition text-base font-medium text-center mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <section className="relative pt-16 pb-24 px-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-30 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-30 blur-3xl"
            animate={{ 
              scale: [1, 1.15, 1], 
              opacity: [0.3, 0.4, 0.3],
              x: [0, -40, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 mb-8 font-medium border border-white/20">
              <Star className="w-5 h-5 text-yellow-500" />
              Trusted by 50,000+ businesses worldwide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
              Create Your Online Store, <span className="text-indigo-600">Launch in Minutes</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Build stunning online stores with zero coding. Launch your e-commerce business effortlessly.
            </p>
            <div className="mt-10">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/sign-up"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition flex items-center gap-3 text-lg font-medium mx-auto shadow-lg shadow-indigo-600/25 w-fit"
                >
                  Start Building
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Create Any Online Store</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From fashion boutiques to digital product shops, Zeevo helps you create and launch your online store across all industries.
            </p>
          </div>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: ['0%', '-100%'] }}
              transition={{ duration: windowWidth < 768 ? 8 : 12, repeat: Infinity, ease: 'linear' }}
            >
              {useCases.concat(useCases, useCases, useCases).map((useCase, index) => (
                <div
                  key={index}
                  className="min-w-[200px] bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-100 flex-shrink-0"
                >
                  <h3 className="text-base font-semibold text-gray-900 text-center">{useCase.title}</h3>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need to Build & Grow Your Store</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful creation tools and features to build, launch, and scale your online store effortlessly.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3 w-fit mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What Our Store Owners Say</h2>
            <p className="mt-4 text-lg text-gray-600">Trusted by entrepreneurs worldwide.</p>
          </div>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-8"
              animate={{ x: ['0%', '-33.33%'] }}
              transition={{ repeat: Infinity, duration: windowWidth < 768 ? 15 : 25, ease: 'linear' }}
            >
              {testimonials.concat(testimonials).map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-[320px] bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-100"
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-900 text-base mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-base">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Pricing Built for Store Growth</h2>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that suits your online store. Free plan stores are private and not visible to customers; paid plans are public.</p>
            <div className="mt-8 flex justify-center">
              <div className="bg-white rounded-lg p-1 flex items-center border border-gray-200">
                <button
                  className={`px-6 py-3 rounded-md text-sm font-medium transition ${!isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-3 rounded-md text-sm font-medium transition ${isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(true)}
                >
                  Yearly (5% Off)
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white p-8 rounded-xl border transition-all duration-300 flex flex-col ${plan.popular ? 'border-indigo-200 shadow-lg shadow-indigo-600/10' : 'border-gray-200 hover:shadow-md'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <div className="text-4xl font-bold text-indigo-600 mt-4">{plan.price}</div>
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
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25'
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
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25'
                          : 'bg-gray-100 text-indigo-600 hover:bg-indigo-50'
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

      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Build Your Online Store?</h2>
            <p className="mt-4 text-lg text-indigo-100">
              Join thousands of entrepreneurs and create your stunning online store with Zeevo today.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/sign-up"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition font-medium inline-flex items-center gap-3 text-lg shadow-lg"
              >
                Start Building Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-base font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/features" className="hover:text-indigo-400 transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-indigo-400 transition">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-indigo-400 transition">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/help" className="hover:text-indigo-400 transition">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-indigo-400 transition">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-indigo-400 transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-indigo-400 transition">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-indigo-400 transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-6 text-white">Connect</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="https://twitter.com" className="flex items-center gap-2 hover:text-indigo-400 transition"><Twitter className="w-4 h-4" /> Twitter</Link></li>
                <li><Link href="https://instagram.com" className="flex items-center gap-2 hover:text-indigo-400 transition"><Instagram className="w-4 h-4" /> Instagram</Link></li>
                <li><Link href="https://linkedin.com" className="flex items-center gap-2 hover:text-indigo-400 transition"><Linkedin className="w-4 h-4" /> LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} Zeevo — All rights reserved
          </div>
        </div>
      </footer>
    </main>
  );
}