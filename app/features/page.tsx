'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  ArrowRight, Zap, Palette, Shield, TrendingUp, Users, Globe, 
  Menu, X, Check, Star, Paintbrush, ShoppingCart, Target, BarChart3,
  RefreshCw, Lock, Headphones
} from 'lucide-react';

export default function Features() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef(null);

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform opacity and y-position based on scroll progress
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  const heroFeatures = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Store Creation",
      description: "Build and launch your online store in under 5 minutes with no technical skills needed."
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Beautiful Store Templates", 
      description: "Choose from stunning, professionally designed templates that perfectly reflect your brand."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable Hosting",
      description: "Enterprise-grade security with 99.9% uptime guarantee, SSL certificates, and DDoS protection."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Built-in Analytics & Tools",
      description: "Track performance and grow your store with integrated analytics and marketing tools."
    }
  ];

  const featureCategories = [
    {
      icon: <Paintbrush className="w-10 h-10" />,
      title: "Store Building & Design",
      description: "Craft stunning stores with our intuitive drag-and-drop builder—no coding needed.",
      features: ["Visual Drag & Drop Editor", "50+ Premium Templates", "Mobile-First Responsive Design", "Custom CSS/HTML Support"]
    },
    {
      icon: <ShoppingCart className="w-10 h-10" />,
      title: "E-commerce Essentials",
      description: "Seamlessly manage inventory, payments, and shipping for a smooth selling experience.",
      features: ["Smart Inventory Management", "Optimized Shopping Cart", "50+ Payment Methods", "Shipping & Fulfillment"]
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: "Marketing & Growth Tools",
      description: "Drive traffic and boost sales with powerful, built-in marketing tools.",
      features: ["Advanced SEO Tools", "Email Marketing Suite", "Abandoned Cart Recovery", "Social Media Integration"]
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: "Analytics & Insights",
      description: "Gain actionable insights with real-time analytics and detailed reports.",
      features: ["Real-time Sales Dashboard", "Customer Behavior Analytics", "Product Performance Reports", "Growth Tracking & Forecasting"]
    }
  ];

  const advancedFeatures = [
    {
      title: "Multi-Currency Support",
      description: "Sell globally with automatic currency conversion and localized pricing.",
      icon: <Globe className="w-12 h-12" />
    },
    {
      title: "Advanced Integrations", 
      description: "Connect with your favorite tools and services to streamline operations.",
      icon: <RefreshCw className="w-12 h-12" />
    },
    {
      title: "Enterprise Security",
      description: "Bank-level security with PCI compliance and SSL encryption.",
      icon: <Lock className="w-12 h-12" />
    },
    {
      title: "24/7 Expert Support",
      description: "Get help when you need it with our dedicated support team.",
      icon: <Headphones className="w-12 h-12" />
    }
  ];

  const comparisonFeatures = [
    { feature: "Store Creation Time", zeevo: "Under 5 minutes", others: "Hours to days" },
    { feature: "Template Quality", zeevo: "Premium designed", others: "Basic templates" },
    { feature: "Payment Methods", zeevo: "50+ supported", others: "Limited options" },
    { feature: "Customer Support", zeevo: "24/7 expert help", others: "Limited hours" }
  ];

  return (
    <main className="min-h-screen bg-white" ref={containerRef}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-gray-900">
              <Image src="/zeevo.png" alt="Zeevo Logo" width={84} height={64} className="object-contain max-w-[72px]" priority />
            </div>
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/" className="text-base text-gray-600 hover:text-indigo-600 transition">Home</Link>
              <Link href="/features" className="text-base text-indigo-600 font-medium">Features</Link>
              <Link href="/pricing" className="text-base text-gray-600 hover:text-indigo-600 transition">Pricing</Link>
              <Link href="/auth/login" className="text-base text-gray-600 hover:text-indigo-600 transition">Sign In</Link>
              <Link href="/auth/sign-up" className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition text-base font-medium">
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mt-4 pb-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3 pt-4">
                <Link href="/" className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link href="/features" className="text-base text-indigo-600 font-medium px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                <Link href="/pricing" className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                <Link href="/auth/login" className="text-base text-gray-600 hover:text-indigo-600 transition px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/auth/sign-up" className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition text-base font-medium text-center mx-2" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="relative pt-16 pb-24 px-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden"
        style={{ opacity, y }}
      >
        <div className="absolute inset-0">
          <motion.div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-30 blur-3xl" 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 mb-8 font-medium border border-white/20">
              <Star className="w-5 h-5 text-yellow-500" />
              Everything you need to build and grow
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
              Powerful Features for <span className="text-indigo-600">Modern E-commerce</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From lightning-fast store creation to advanced analytics, Zeevo provides all the tools you need to build, launch, and scale your online business.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Core Features Grid */}
      <motion.section 
        className="py-20 px-6 bg-white"
        style={{ opacity, y }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {heroFeatures.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: index * 0.1 }} 
                className="text-center"
              >
                <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 w-fit mx-auto mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Feature Categories */}
      <motion.section 
        className="py-20 px-6 bg-gray-50"
        style={{ opacity, y }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Complete E-commerce Solution</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Every feature you need to create, manage, and grow your online store, all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featureCategories.map((category, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-cyan-50 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="bg-indigo-600 text-white rounded-xl p-3 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed font-medium">{category.description}</p>
                <div className="space-y-4">
                  {category.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-base text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Advanced Features */}
      <motion.section 
        className="py-20 px-6 bg-white"
        style={{ opacity, y }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Advanced Features for Growing Businesses</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Scale your business with enterprise-grade features designed for serious e-commerce success.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {advancedFeatures.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: index * 0.2 }} 
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="bg-indigo-100 text-indigo-600 rounded-xl p-4">{feature.icon}</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Comparison Table */}
      <motion.section 
        className="py-20 px-6 bg-gray-50"
        style={{ opacity, y }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose Zeevo?</h2>
            <p className="mt-4 text-lg text-gray-600">See how Zeevo compares to other e-commerce platforms.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-6 py-4 font-semibold text-gray-900">Feature</div>
              <div className="px-6 py-4 font-semibold text-indigo-600 text-center border-x border-gray-200">Zeevo</div>
              <div className="px-6 py-4 font-semibold text-gray-600 text-center">Others</div>
            </div>
            {comparisonFeatures.map((item, index) => (
              <div key={index} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-gray-25' : 'bg-white'} border-b border-gray-100 last:border-b-0`}>
                <div className="px-6 py-4 text-gray-900 font-medium">{item.feature}</div>
                <div className="px-6 py-4 text-center border-x border-gray-100">
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <Check className="w-4 h-4" />
                    {item.zeevo}
                  </span>
                </div>
                <div className="px-6 py-4 text-center text-gray-600">{item.others}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
        style={{ opacity, y }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Experience These Features?</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">Start building your online store today and see why thousands of businesses choose Zeevo.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up" className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition font-medium inline-flex items-center justify-center gap-3 text-lg shadow-lg">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="border border-white/30 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition font-medium inline-flex items-center justify-center gap-3 text-lg">
              View Pricing
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
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
    </main>
  );
}