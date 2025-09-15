import React, { useState, useEffect, useRef } from 'react';
import { 
  Shirt, 
  Palette, 
  Download, 
  Store, 
  Sparkles, 
  Briefcase, 
  Camera, 
  UtensilsCrossed 
} from 'lucide-react';
import { useInView } from 'framer-motion';

const useCases = [
  { title: "Fashion Store", icon: Shirt },
  { title: "Artisan Shop", icon: Palette },
  { title: "Digital Products Store", icon: Download },
  { title: "Local Retail Store", icon: Store },
  { title: "Beauty & Cosmetics Shop", icon: Sparkles },
  { title: "Professional Services Store", icon: Briefcase },
  { title: "Content Creator Shop", icon: Camera },
  { title: "Restaurant Online Ordering", icon: UtensilsCrossed }
];

const UseCase = () => {
  const [windowWidth, setWindowWidth] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const animationDuration = windowWidth < 768 ? 85 : 80;

  return (
    <section ref={containerRef} className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Create Any Online <span className='text-[#03E525]'>Store</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl xl:text-[1em] mx-auto">
            From fashion boutiques to digital product shops, Zeevo helps you create and launch your online store across all industries.
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-6"
            style={{
              animation: isInView ? `scroll ${animationDuration}s linear infinite` : "none",
              width: 'fit-content'
            }}
          >
            {useCases.concat(useCases, useCases, useCases).map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <div
                  key={index}
                  className="min-w-[220px] p-6 rounded-xl border border-gray-100 flex-shrink-0 transition-shadow duration-300"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-[#03E525]/10 rounded-full">
                      <IconComponent className="w-6 h-6 text-[#03E525]" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{useCase.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .flex:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default UseCase;
