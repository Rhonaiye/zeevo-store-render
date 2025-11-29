'use client';
import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Phone, MapPin } from 'lucide-react';
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

const RestaurantHeader: React.FC<HeaderProps> = ({
  store,
  setIsCartOpen,
  setSearchQuery,
  searchQuery,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { name, logo, secondaryColor = '#d97706', primaryColor = '#FFFFFF', contact } = store;
  const { getTotalItems } = useCartStore();

  return (
    <header
      style={{ backgroundColor: primaryColor }}
      className="sticky top-0 z-50 shadow-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar with contact info */}
        <div
          className="hidden sm:flex items-center justify-between text-xs py-2 border-b"
          style={{ borderColor: `${secondaryColor}20` }}
        >
          <div className="flex gap-4">
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1 hover:opacity-70 transition"
                style={{ color: secondaryColor }}
              >
                <Phone size={14} />
                {contact.phone}
              </a>
            )}
            {contact?.address && (
              <div className="flex items-center gap-1" style={{ color: secondaryColor }}>
                <MapPin size={14} />
                {contact.address}
              </div>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h1
                className="text-lg sm:text-2xl font-bold"
                style={{ color: secondaryColor }}
              >
                {name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Delicious Food Awaits</p>
            </div>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: `${secondaryColor}30`,
                }}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
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

export default RestaurantHeader;
