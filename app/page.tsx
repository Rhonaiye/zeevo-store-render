'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Icons
import {
  ArrowRight,
  Zap,
  Palette,
  Shield,
  TrendingUp,
  Users,
  Globe,
  Star,
  Check,
  Twitter,
  Instagram,
  Linkedin,
  Menu,
  X,
  Ban,
} from 'lucide-react';

// Components
import Navbar from '@/components/landing/navbar';
import HeroSection from '@/components/landing/heroSection';
import UseCase from '@/components/landing/useCase';
import DynamicCta from '@/components/landing/dynamicCta';
import Features from '@/components/landing/features';
import Reviews from '@/components/landing/reviews';
import Pricing from '@/components/landing/pricing';
import Footer from '@/components/landing/footer';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Use Case Section */}
      <UseCase />

      {/* CTA 1 */}
      <DynamicCta
        title="Get a business website to run online sales"
        description="Add products easily, run discount sales, ship products & integrate tools for online ads & website analytics."
        buttonText="Learn more"
        buttonLink="/learn-more"
        imageSrc="/images/lady.png"
        imageAlt="Lady holding laptop"
      />

      {/* Features Section */}
      <Features />

      {/* Reviews Section */}
      <Reviews />

      {/* Pricing Section */}
      <Pricing />

      {/* CTA 2 */}
      <DynamicCta
        title="Ready to Build Your Online Store?"
        description="Join thousands of entrepreneurs and create your stunning online store with Zeevo today."
        buttonText="Start Now"
        buttonLink="/learn-more"
        imageSrc="/images/lady.png"
        imageAlt="Lady holding smartphone"
        titleWide
        highlightLastTwoWords
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
