'use client';
import React from 'react';
import Image from 'next/image';
import { Store } from '@/store/useAppStore';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Clock } from 'lucide-react';
import { BsTiktok } from 'react-icons/bs';

function RestaurantFooter({ store }: { store: Store }) {
  const { name, logo, secondaryColor, primaryColor, contact, socialLinks, policies } = store;

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram size={18} />;
      case 'facebook':
        return <Facebook size={18} />;
      case 'twitter':
        return <Twitter size={18} />;
      case 'tiktok':
        return <BsTiktok size={18} />;
      default:
        return null;
    }
  };

  return (
    <footer
      className="text-white"
      style={{ backgroundColor: secondaryColor || '#d97706' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Restaurant Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              {logo && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image src={logo} alt={`${name} logo`} fill className="object-cover" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-sm opacity-90">Fine Dining Experience</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              Discover authentic flavors and exceptional culinary craftsmanship. We're committed to delivering the finest dining experience.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4 text-sm">
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 hover:opacity-80 transition"
                >
                  <Phone size={16} className="shrink-0" />
                  {contact.phone}
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 hover:opacity-80 transition break-all"
                >
                  <Mail size={16} className="shrink-0" />
                  {contact.email}
                </a>
              )}
              {contact?.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Follow Us</h4>
            <div className="flex flex-wrap gap-4">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
                  aria-label="Instagram"
                >
                  {getSocialIcon('instagram')}
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
                  aria-label="Facebook"
                >
                  {getSocialIcon('facebook')}
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
                  aria-label="Twitter"
                >
                  {getSocialIcon('twitter')}
                </a>
              )}
              {socialLinks?.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
                  aria-label="TikTok"
                >
                  {getSocialIcon('tiktok')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="border-t border-white/20 pt-8 pb-6">
          <div className="flex flex-wrap gap-6 text-sm">
            {policies?.terms && (
              <a
                href={policies.terms}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                Terms & Conditions
              </a>
            )}
            {policies?.returns && (
              <a
                href={policies.returns}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                Policies
              </a>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 text-center text-sm opacity-75">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default RestaurantFooter;
