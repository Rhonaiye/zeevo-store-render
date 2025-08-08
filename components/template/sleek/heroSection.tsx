'use client';
import React from 'react';

interface HeroSectionProps {
  name: string;
  description?: string;
  secondaryColor?: string;
  scrollDistance?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ name, description, secondaryColor = '#d97706', scrollDistance = 450 }) => {
  const handleViewProducts = () => {
    // Scroll down by custom distance
    window.scrollTo({
      top: scrollDistance,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative py-32" style={{ backgroundColor: secondaryColor }}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{name}</h1>
        {description && <p className="text-lg text-gray-100 mb-6 max-w-2xl mx-auto">{description}</p>}
        
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