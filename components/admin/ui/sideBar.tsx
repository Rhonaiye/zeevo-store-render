'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Wallet2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, children }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payouts', label: 'Payouts', icon: Wallet2 },
    { id: 'products', label: 'products', icon: BarChart3 },
    { id: 'customer_care', label: 'Customer Care', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Close sidebar on mobile when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && sidebarOpen) {
        // On desktop, keep sidebar in collapsed state by default
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <>
      <style jsx>{`
        @keyframes subtle-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
          50% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .header-glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .sidebar-glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }
        .menu-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }
        .menu-item:hover {
          transform: translateX(4px);
        }
        .menu-item:active {
          transform: scale(0.98);
        }
        .active-indicator {
          background: #000;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
          animation: subtle-glow 2s infinite;
        }
        .logo-float {
          animation: float 3s ease-in-out infinite;
        }
        .label-slide {
          animation: slide-in 0.4s ease-out;
        }
        .overlay-fade {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .menu-item:hover {
            transform: none;
          }
        }
        
        /* Smooth scrolling for mobile */
        .sidebar-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>

      {/* Refined Header: Clean, elevated glassmorphism with subtle depth, monochrome */}
      <header className="fixed top-0 left-0 right-0 header-glass shadow-sm z-50">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 max-w-7xl mx-auto relative">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-black/5 active:bg-black/10 transition-colors duration-200 touch-manipulation"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-black" />
              ) : (
                <Menu className="h-5 w-5 text-black" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-lg flex items-center justify-center shadow-md logo-float">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="block">
                <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight">Zeevo Admin</h1>
                <p className="text-xs text-black/60 font-medium -mt-0.5 hidden sm:block">Control Center</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-sm text-black/50 font-medium">
            Welcome back
          </div>
        </div>
      </header>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 sm:hidden overlay-fade"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Enhanced Sidebar: Mobile slide-in, desktop collapse */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        } ${
          sidebarOpen ? 'w-64' : 'w-64 sm:w-16'
        } sidebar-glass shadow-2xl sm:shadow-lg transition-transform duration-300 ease-out flex flex-col fixed top-0 left-0 z-40 h-full pt-16 overflow-hidden`}
      >
        {/* Subtle vertical accent line */}
        <div className="absolute top-0 left-0 h-full w-0.5 bg-black/20" />
        
        {/* Navigation */}
        <nav className="flex-1 py-4 sm:py-6 px-2 space-y-1 overflow-y-auto sidebar-scroll">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="group relative">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      // Always close sidebar on mobile after selection
                      if (window.innerWidth < 640) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`menu-item w-full flex items-center relative rounded-xl transition-all duration-200 touch-manipulation ${
                      sidebarOpen ? 'pl-3 pr-4 py-3 sm:py-2.5 space-x-3' : 'justify-center p-2.5'
                    } ${
                      isActive
                        ? 'bg-black text-white border border-black/20 active-indicator'
                        : 'text-black/70 hover:bg-black/5 active:bg-black/10 hover:text-black border border-transparent'
                    }`}
                  >
                    <div className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-black/70'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {sidebarOpen && (
                      <span className={`text-sm font-medium label-slide whitespace-nowrap ${isActive ? 'text-white' : 'text-black/80'}`}>
                        {item.label}
                      </span>
                    )}
                    {isActive && sidebarOpen && (
                      <ChevronRight className="h-4 w-4 text-white ml-auto flex-shrink-0" />
                    )}
                    {/* Collapsed tooltip - only on desktop */}
                    {!sidebarOpen && (
                      <div className="hidden sm:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-r-4 border-b-4 border-transparent border-r-black" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: Minimal and integrated */}
        <div className="px-4 py-3 border-t border-black/10 bg-white/50">
          <div className="text-xs text-black/40 text-center font-medium">
            v2.0 • Zeevo
          </div>
        </div>
      </aside>

      {/* Main Content: Responsive padding and spacing */}
      <main
        className={`transition-all duration-300 w-full ${
          sidebarOpen ? 'sm:ml-64 ml-0' : 'sm:ml-16 ml-0'
        } pt-16 min-h-screen`}
      >
        <div className="max-w-7xl ">
          {children}
        </div>
      </main>
    </>
  );
};


export default Sidebar