'use client';
import React from 'react';

interface HeroSectionProps {
  primaryColor?: string;
  secondaryColor?: string;
  name: string;
  description?: string;
  heroImage?: string;
}

const RestaurantHeroSection: React.FC<HeroSectionProps> = ({
  primaryColor = '#FFFFFF',
  secondaryColor = '#d97706',
  name,
  description,
  heroImage,
}) => {
  return (
    <section
      className="relative w-full h-64 sm:h-80 md:h-96 bg-linear-to-r overflow-hidden"
      style={{
        backgroundImage: heroImage ? `url(${heroImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
          Welcome to {name}
        </h2>
        {description && (
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default RestaurantHeroSection;
