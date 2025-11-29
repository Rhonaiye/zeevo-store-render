'use client';
import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Filter } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Store } from '@/store/useAppStore';
import Link from 'next/link';

interface HeaderProps {
  store: Store;
  setIsCartOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  searchQuery: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const ElectronicsHeader: React.FC<HeaderProps> = ({
  store,
  setIsCartOpen,
  setSearchQuery,
  searchQuery,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { name, logo, secondaryColor = '#0066cc', primaryColor = '#FFFFFF' } = store;
  const { getTotalItems } = useCartStore();

  return (
    <header
      style={{ backgroundColor: primaryColor, borderBottomColor: secondaryColor }}
      className="sticky top-0 z-50 shadow-lg border-b-2"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo & Name */}
          <Link href={`/${store.slug}`} className="flex items-center gap-3 hover:opacity-80 transition">
            {logo && (
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h1
                className="text-lg sm:text-2xl font-bold"
                style={{ color: secondaryColor }}
              >
                {name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Tech & Gadgets</p>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: `${secondaryColor}30`,
                }}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile search button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Search"
            >
              <Search size={20} style={{ color: secondaryColor }} />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={20} style={{ color: secondaryColor }} />
              ) : (
                <Menu size={20} style={{ color: secondaryColor }} />
              )}
            </button>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} style={{ color: secondaryColor }} />
              {getTotalItems() > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ElectronicsHeader;
