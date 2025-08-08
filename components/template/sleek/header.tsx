'use client';
import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  getTotalItems: () => number;
  setIsCartOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  name, 
  logo, 
  secondaryColor = '#d97706', 
  getTotalItems, 
  setIsCartOpen, 
  primaryColor = '#059669' 
}) => {
  return (
    <header 
      className="sticky px-4 top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-white/10"
      style={{ 
        backgroundColor: primaryColor,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo && (
            <div className="relative">
              <img 
                src={logo} 
                alt={`${name} logo`} 
                className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-md" 
              />
            </div>
          )}
          <h1 
            className="text-xl font-bold"
            style={{ color: secondaryColor }}
          >
            {name}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-lg transition-all duration-200"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: secondaryColor,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            aria-label="Open cart"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.boxShadow = '0 8px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <ShoppingBag size={24} strokeWidth={1.5} />
            {getTotalItems() > 0 && (
              <span
                className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg ring-2 ring-white/30 animate-pulse"
                style={{ 
                  backgroundColor: secondaryColor,
                  boxShadow: `0 0 0 2px ${primaryColor}, 0 4px 8px rgba(0, 0, 0, 0.15)`
                }}
              >
                {getTotalItems() > 99 ? '99+' : getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;