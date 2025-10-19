'use client';
import React from 'react';

interface HeroSectionProps {
  name: string;
  heroImage?: string;
  description?: string;
  secondaryColor?: string;
  scrollDistance?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  name,
  description,
  secondaryColor = '#d97706',
  scrollDistance = 450,
  heroImage,
}) => {
  const handleViewProducts = () => {
    window.scrollTo({
      top: scrollDistance,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className="relative py-32"
      style={{
        backgroundColor: secondaryColor,
        backgroundImage: heroImage
          ? `url(${heroImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay to darken image for readability */}
      {heroImage && (
        <div className="absolute inset-0 bg-black/40"></div>
      )}

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{name}</h1>
        {description && (
          <p className="text-lg text-gray-100 mb-6 max-w-2xl mx-auto">{description}</p>
        )}

        {/* View Products Button */}
        <button
          onClick={handleViewProducts}
          className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          View Products
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
