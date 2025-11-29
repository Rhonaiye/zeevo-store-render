'use client';
import React from 'react';
import { Zap } from 'lucide-react';

interface HeroSectionProps {
  primaryColor?: string;
  secondaryColor?: string;
  name: string;
  description?: string;
  heroImage?: string;
}

const ElectronicsHeroSection: React.FC<HeroSectionProps> = ({
  primaryColor = '#FFFFFF',
  secondaryColor = '#0066cc',
  name,
  description,
  heroImage,
}) => {
  return (
    <section
      className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden"
      style={{
        backgroundImage: heroImage ? `url(${heroImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Gradient overlay for tech feel */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${secondaryColor}20 0%, ${secondaryColor}40 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Zap size={32} className="text-white" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {name}
          </h2>
          <Zap size={32} className="text-white" />
        </div>
        {description && (
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default ElectronicsHeroSection;
