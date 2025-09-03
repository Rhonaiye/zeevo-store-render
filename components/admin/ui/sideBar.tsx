'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import Cookies from 'js-cookie';

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
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Load active tab from cookie on mount
  useEffect(() => {
    const savedTab = Cookies.get('activeTab');
    if (savedTab && menuItems.some(item => item.id === savedTab)) {
      setActiveTab(savedTab);
    }
  }, [setActiveTab]);

  // Save active tab to cookie when it changes
  useEffect(() => {
    Cookies.set('activeTab', activeTab, { expires: 7 }); // Cookie expires in 7 days
  }, [activeTab]);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
        <div className="flex items-center justify-between p-3 sm:p-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-100"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <X className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
              ) : (
                <Menu className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
              )}
            </button>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900">Zeevo Admin</span>
          </div>
          <div className="text-sm text-gray-600">
            Admin Panel
          </div>
        </div>
      </header>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-56 sm:w-64' : 'w-0 sm:w-16'
        } bg-white shadow-lg transition-all duration-300 flex flex-col border-r border-gray-200 fixed top-0 left-0 z-40 h-full pt-16 sm:pt-20 ${
          sidebarOpen ? 'block' : 'hidden sm:block'
        }`}
      >
        <nav className="flex-1 p-1 sm:p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 640) {
                        setSidebarOpen(false); // Auto-close on mobile after selection
                      }
                    }}
                    className={`w-full flex items-center ${
                      sidebarOpen ? 'space-x-2 sm:space-x-3 px-2 sm:px-3' : 'justify-center'
                    } py-2 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="h-4 sm:h-5 w-4 sm:w-5 min-w-[1rem] sm:min-w-[1.25rem]" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                  {!sidebarOpen && (
                    <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:block hidden">
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 w-full ${
          sidebarOpen ? 'sm:ml-64 ml-0' : 'sm:ml-16 ml-0'
        } pt-14 sm:pt-16 min-h-screen`}
      >
        {children}
      </main>
    </>
  );
};

export default Sidebar;