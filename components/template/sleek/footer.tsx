'use client';
import React from 'react';

interface Contact {
  email?: string;
  phone?: string;
  address?: string;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
}

interface Policies {
  returns?: string;
  terms?: string;
}

interface FooterProps {
  name: string;
  logo?: string;
  secondaryColor?: string;
  contact?: Contact;
  socialLinks?: SocialLinks;
  policies?: Policies;
}

const Footer: React.FC<FooterProps> = ({
  name,
  logo,
  secondaryColor = '#0a0a0a',
  contact,
  socialLinks,
  policies,
}) => {
  const socialIcons = {
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.036.388a5.918 5.918 0 0 0-2.14 1.394A5.954 5.954 0 0 0 .382 4.322c-.186.484-.307 1.058-.342 2.007C.013 7.075 0 7.482 0 12.017s.013 4.942.048 5.89c.035.949.156 1.523.342 2.007a5.918 5.918 0 0 0 1.394 2.14 5.954 5.954 0 0 0 2.14 1.394c.484.186 1.058.307 2.007.342.948.035 1.355.048 5.89.048s4.942-.013 5.89-.048c.949-.035 1.523-.156 2.007-.342a5.918 5.918 0 0 0 2.14-1.394 5.954 5.954 0 0 0 1.394-2.14c.186-.484.307-1.058.342-2.007.035-.948.048-1.355.048-5.89s-.013-4.942-.048-5.89c-.035-.949-.156-1.523-.342-2.007a5.918 5.918 0 0 0-1.394-2.14A5.954 5.954 0 0 0 19.322.382c-.484-.186-1.058-.307-2.007-.342C16.367.013 15.96 0 12.017 0zm0 5.838a6.18 6.18 0 1 1 0 12.36 6.18 6.18 0 0 1 0-12.36zm6.18-1.617a1.444 1.444 0 1 1 0 2.888 1.444 1.444 0 0 1 0-2.888zm-6.18 2.506a4.673 4.673 0 1 0 0 9.346 4.673 4.673 0 0 0 0-9.346z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  };

  return (
    <footer 
      id="footer" 
      className="relative overflow-hidden border-t border-gray-800"
      style={{ 
        background: `linear-gradient(135deg, ${secondaryColor} 0%, ${secondaryColor}cc 100%)`,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="relative">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Brand section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {logo && (
                  <img 
                    src={logo} 
                    alt={`${name} logo`} 
                    className="w-12 h-12 rounded-2xl bg-white flex-shrink-0" 
                  />
                )}
                <div>
                  <h2 className="text-white font-bold text-2xl tracking-tight">{name}</h2>
                  <p className="text-gray-300 text-sm">Elevating commerce</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-base leading-relaxed max-w-md">
                Crafting exceptional shopping experiences with premium quality products and unmatched service excellence.
              </p>

              {/* Social links with modern styling */}
              {(socialLinks?.twitter || socialLinks?.instagram || socialLinks?.facebook || socialLinks?.tiktok) && (
                <div className="flex items-center gap-3">
                  {Object.entries(socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        aria-label={`Follow us on ${platform}`}
                      >
                        <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                          {socialIcons[platform as keyof typeof socialIcons]}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact section */}
            <div className="space-y-6">
              <h3 className="text-white font-semibold text-lg">Get in Touch</h3>
              <div className="space-y-4">
                {contact?.email && (
                  <div className="group">
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300 p-2 -m-2 rounded-lg hover:bg-white/5"
                    >
                      <div className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <span className="text-sm">{contact.email}</span>
                    </a>
                  </div>
                )}
                
                {contact?.phone && (
                  <div className="group">
                    <a 
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300 p-2 -m-2 rounded-lg hover:bg-white/5"
                    >
                      <div className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <span className="text-sm">{contact.phone}</span>
                    </a>
                  </div>
                )}
                
                {contact?.address && (
                  <div className="flex items-start gap-3 text-gray-300 p-2 -m-2">
                    <div className="w-5 h-5 text-gray-400 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm">{contact.address}</span>
                  </div>
                )}
                
                {(!contact?.email && !contact?.phone && !contact?.address) && (
                  <p className="text-gray-400 text-sm">Contact information coming soon</p>
                )}
              </div>
            </div>

            {/* Policies section */}
            <div className="space-y-6">
              <h3 className="text-white font-semibold text-lg">Policies</h3>
              <div className="space-y-3">
                {policies?.returns && (
                  <div className="text-gray-300 hover:text-white transition-colors duration-300">
                    <span className="text-sm">{policies.returns}</span>
                  </div>
                )}
                
                {policies?.terms && (
                  <div className="text-gray-300 hover:text-white transition-colors duration-300">
                    <span className="text-sm">{policies.terms}</span>
                  </div>
                )}
                
                {(!policies?.returns && !policies?.terms) && (
                  <p className="text-gray-400 text-sm">Policies coming soon</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 {name}. All rights reserved.
              </p>
              
              <a
                href="https://zeevo.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 text-sm"
              >
                <span>Powered by</span>
                <span className="font-semibold text-[#16A34A]  group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                 Zeevo
                </span>
                <div className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300 group-hover:translate-x-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;