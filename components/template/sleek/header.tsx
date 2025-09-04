'use client';
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  name: string;
  logo?: string;
  storeSlug: string
  primaryColor?: string;
  secondaryColor?: string;
  getTotalItems: () => number;
  setIsCartOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  name, 
  logo, 
  secondaryColor = '#d97706', 
  storeSlug,
  getTotalItems, 
  setIsCartOpen, 
  primaryColor = '#059669' 
}) => {
  return (
    <header 
      className="sticky px-1 md:px-4 top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-white/10"
      style={{ 
        backgroundColor: primaryColor,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          {logo && (
            <div className="relative">
              <img 
                src={logo} 
                alt={`${name} logo`} 
                className="w-12 h-12 rounded-full object-cover border border-white/20" 
              />
            </div>
          )}
        </div>

        {/* Center on mobile, left on md+ */}
        <h1 
          className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none"
          style={{ color: secondaryColor }}
        >
          {name}
        </h1>

        {/* Right: Cart */}
        <Link href={'/cart?store=' + storeSlug }>
          <button
          className="relative p-2 rounded-lg transition-all duration-200"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: secondaryColor,
          }}
          aria-label="Open cart"
        
        >
          <ShoppingBag size={24} strokeWidth={1.5} />
          {getTotalItems() > 0 && (
                     <span style={{backgroundColor: secondaryColor}} className={`absolute top-0.5 left-5  text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium`}>
                       {getTotalItems()}
                     </span>
            )}
          
        </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
