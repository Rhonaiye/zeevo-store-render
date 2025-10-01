import React, { useState } from 'react'
import Image from 'next/image'
import { Store } from '@/store/useAppStore'
import { Mail, Phone, MapPin, ChevronDown, ChevronUp, Heart, Instagram, Facebook, Twitter } from 'lucide-react'
import { BsTiktok } from 'react-icons/bs'

function Footer({store}: {store: Store}) {
  const [showTerms, setShowTerms] = useState(false);
  const [showReturns, setShowReturns] = useState(false);

  return (
    <footer className="text-white relative" style={{ backgroundColor: store.secondaryColor }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Company Info - Takes 2 columns */}
          <div className="lg:col-span-2 pr-8">
            <div className="flex items-center space-x-3 mb-6">
              {store.logo && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                  <Image
                    src={store.logo}
                    alt={`${store.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="text-2xl font-bold">{store.name}</h3>
            </div>
            
            {store.description && (
              <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-sm">
                {store.description}
              </p>
            )}

            {/* Newsletter Signup */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 text-sm">Stay up to date</h4>
              <div className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-md bg-white/10 border border-white/20 rounded-l-md focus:outline-none focus:ring-1 focus:ring-white/40 text-white placeholder:text-white/60"
                />
                <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-r-md hover:bg-white/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Icons */}
            {store.socialLinks && (
              <div className="flex space-x-4">
                {store.socialLinks.instagram && (
                  <a 
                    href={store.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-white/80" />
                  </a>
                )}
                {store.socialLinks.facebook && (
                  <a 
                    href={store.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-white/80" />
                  </a>
                )}
                {store.socialLinks.twitter && (
                  <a 
                    href={store.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-white/80" />
                  </a>
                )}
                {store.socialLinks.tiktok && (
                  <a 
                    href={store.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
                    title="TikTok"
                  >
                   <BsTiktok className="w-4 h-4 text-white/80"/>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact & Policies */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Contact & Policies</h4>
            
            {/* Contact Info */}
            {store.contact && (
              <div className="space-y-3 mb-6">
                {store.contact.email && (
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${store.contact.email}`} className="hover:text-white transition-colors">
                      {store.contact.email}
                    </a>
                  </div>
                )}
                {store.contact.phone && (
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${store.contact.phone}`} className="hover:text-white transition-colors">
                      {store.contact.phone}
                    </a>
                  </div>
                )}
                {store.contact.address && (
                  <div className="flex items-start space-x-2 text-sm text-white/80">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{store.contact.address}</span>
                  </div>
                )}
              </div>
            )}

            {/* Policy Dropdowns */}
            <div className="space-y-3">
              {store.policies?.terms && (
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setShowTerms(!showTerms)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Terms of Service
                    {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showTerms && (
                    <div className="px-4 pb-4 text-xs text-white/70 leading-relaxed border-t border-white/10 pt-3">
                      {store.policies.terms}
                    </div>
                  )}
                </div>
              )}
              
              {store.policies?.returns && (
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setShowReturns(!showReturns)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Return Policy
                    {showReturns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showReturns && (
                    <div className="px-4 pb-4 text-xs text-white/70 leading-relaxed border-t border-white/10 pt-3">
                      {store.policies.returns}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            
            {/* Left Side - Copyright & Zeevo */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <p className="text-white/60">
                © 2025 {store.name}. All rights reserved.
              </p>
              <div className="flex items-center space-x-1">
                <span className="text-white/50">Made with</span>
                <Heart className="w-3 h-3 text-red-400 fill-current" />
                <span className="text-white/50">by</span>
                <a 
                  href="https://www.zeevo.shop/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#16A34A] font-medium hover:text-white/80 transition-colors"
                >
                  Zeevo
                </a>
              </div>
            </div>

            {/* Right Side - Payment & Language */}
            <div className="flex items-center space-x-6">
              {/* Language/Currency */}
              <div className="flex items-center space-x-1 text-sm text-white/70">
                <span>🌍</span>
                <span>English</span>
                <span>•</span>
                <span>{store.currency || 'USD'}</span>
              </div>

  
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer