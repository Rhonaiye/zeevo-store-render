'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Zap, Palette, Shield, TrendingUp, Users, Globe, Star, Check, Twitter, Instagram, Linkedin, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast Setup",
      description: "Launch your store in under 5 minutes with no technical skills needed."
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Brand Customization",
      description: "Tailor colors, fonts, and layouts to reflect your unique brand identity."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with a 99.9% uptime guarantee."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Built-in Analytics",
      description: "Gain insights with detailed tracking of sales and customer behavior."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Customer Management",
      description: "Effortlessly manage orders, inventory, and customer relationships."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Support multi-currency and global payment processing."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion Designer",
      content: "Launched my boutique in 3 minutes. Sales increased by 300% in the first month!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Artisan Maker",
      content: "The customization options are incredible. My store perfectly matches my brand.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Digital Creator",
      content: "Best platform I've used. Simple, powerful, and just works flawlessly.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Launch",
      price: isAnnual ? "₦0" : "₦0",
      period: "per month",
      features: [
        "1 Store",
        "Default template only",
        "Limited products (e.g. 10)",
        "Paystack subaccount integration",
        "Basic analytics",
        "Zeevo watermark on site",
        "WhatsApp live chat support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Boost",
      price: isAnnual ? "₦39,900" : "₦3,500",
      period: isAnnual ? "per year" : "per month",
      features: [
        "Everything in Launch",
        "3 stores",
        "All templates access",
        "Up to 50 products/store",
        "Remove watermark",
        "Custom branding (logo, colors)",
        "Domain mapping (e.g. yourbrand.zeevosite.com)",
        "WhatsApp live chat customization"
      ],
      cta: "Start 3-Day Trial",
      popular: true
    },
    {
      name: "Thrive",
      price: isAnnual ? "₦108,300" : "₦9,500",
      period: isAnnual ? "per year": "per month",
      features: [
        "Everything in Boost",
        "Unlimited stores",
        "Unlimited products",
        "Priority support",
        "Advanced analytics",
        "Custom domain support (e.g. yourbrand.com)",
        "Facebook Pixel & Google Analytics integration",
        "Scheduled product drops"
      ],
      cta: "Start 3-Day Trial",
      popular: false
    }
  ];

  const useCases = [
    { title: "Fashion Boutique" },
    { title: "Artisan Crafts" },
    { title: "Digital Products" },
    { title: "Local Retail" },
    { title: "Beauty & Cosmetics" }
  ];

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
                  width={84} // Larger logo size
                  height={64}
                  className="object-contain max-w-[154px] my-0 sm:max-w-[72px] max-h-[580px]" // Caps size and adjusts for larger screens
                  priority // Preload for faster rendering
                />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/features" className="text-sm text-gray-600 hover:text-indigo-600 transition">Features</Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-indigo-600 transition">Pricing</Link>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-indigo-600 transition">Sign In</Link>
              <Link
                href="/auth/sign-up"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
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
                  className="text-sm text-gray-600 hover:text-indigo-600 transition px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-sm text-gray-600 hover:text-indigo-600 transition px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/auth/login" 
                  className="text-sm text-gray-600 hover:text-indigo-600 transition px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium text-center mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
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
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-700 mb-6 font-medium border border-white/20">
              <Star className="w-4 h-4 text-yellow-500" />
              Trusted by 50,000+ businesses worldwide
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
              Your Online Store, <span className="text-indigo-600">Live in Minutes</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
              Build a professional e-commerce platform with zero coding. Fast, simple, and powerful—start selling today.
            </p>
            <div className="mt-8">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/sign-up"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm font-medium mx-auto shadow-lg shadow-indigo-600/25 w-fit"
                >
                  Start Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sell Anywhere, Anytime</h2>
            <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
              From fashion to digital products, Zeevo powers your business across industries.
            </p>
          </motion.div>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: ['0%', '-100%'] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              {useCases.concat(useCases, useCases, useCases).map((useCase, index) => (
                <motion.div
                  key={index}
                  className="min-w-[180px] bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100 flex-shrink-0"
                >
                  <h3 className="text-xs font-semibold text-gray-900 text-center">{useCase.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything You Need to Thrive</h2>
            <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
              Powerful tools to build, grow, and scale your online business effortlessly.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-indigo-100 text-indigo-600 rounded-lg p-2 w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-3 text-sm text-gray-600">Trusted by entrepreneurs worldwide.</p>
          </motion.div>
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: ['0%', '-33.33%'] }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            >
              {testimonials.concat(testimonials).map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="min-w-[280px] bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100"
                >
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-900 text-sm mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-600">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pricing Built for Growth</h2>
            <p className="mt-3 text-sm text-gray-600">Choose the plan that suits your business.</p>
            <div className="mt-6 flex justify-center">
              <div className="bg-white rounded-lg p-1 flex items-center border border-gray-200">
                <button
                  className={`px-4 py-2 rounded-md text-xs font-medium transition ${!isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-xs font-medium transition ${isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setIsAnnual(true)}
                >
                  Yearly (5% Off)
                </button>
              </div>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative bg-white p-6 rounded-xl border transition-all duration-300 ${plan.popular ? 'border-indigo-200 shadow-lg shadow-indigo-600/10' : 'border-gray-200 hover:shadow-md'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="text-3xl font-bold text-indigo-600 mt-3">{plan.price}</div>
                  <div className="text-xs text-gray-600 mt-1">{plan.period}</div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button className={`w-full py-2.5 rounded-lg font-medium transition text-sm ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25' : 'bg-gray-100 text-indigo-600 hover:bg-indigo-50'}`}>
                    {plan.cta}
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to Build Your Store?</h2>
            <p className="mt-3 text-sm text-indigo-100">
              Join thousands of entrepreneurs and start selling with Zeevo today.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
              <Link
                href="/auth/sign-up"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition font-medium inline-flex items-center gap-2 text-sm shadow-lg"
              >
                Create Your Store
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/features" className="hover:text-indigo-400 transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-indigo-400 transition">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-indigo-400 transition">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/help" className="hover:text-indigo-400 transition">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-indigo-400 transition">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/about" className="hover:text-indigo-400 transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-indigo-400 transition">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-indigo-400 transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-white">Connect</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="https://twitter.com" className="flex items-center gap-2 hover:text-indigo-400 transition"><Twitter className="w-4 h-4" /> Twitter</Link></li>
                <li><Link href="https://instagram.com" className="flex items-center gap-2 hover:text-indigo-400 transition"><Instagram className="w-4 h-4" /> Instagram</Link></li>
                <li><Link href="https://linkedin.com" className="flex items-center gap-2 hover:text-indigo-400 transition"><Linkedin className="w-4 h-4" /> LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Zeevo — All rights reserved
          </div>
        </div>
      </footer>
    </main>
  );
}