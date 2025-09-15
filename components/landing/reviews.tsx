import React, { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

function Reviews() {
  const [windowWidth, setWindowWidth] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 }); 

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const animationDuration = windowWidth < 768 ? 30 : 40; // slower on desktop

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion Retailer",
      content: "Created my online store in 3 minutes. The templates are stunning and sales increased by 300%!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Artisan Seller",
      content: "Building my store was incredibly easy. The customization options let me create exactly what I envisioned.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Digital Seller",
      content: "Best store builder I've used. Created my online shop in one place - simple and powerful.",
      rating: 5
    }
  ];

  return (
    <section ref={containerRef} className="pb-20 pt-10 px-6 bg-[#03E525]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[1.6em] sm:text-4xl font-bold text-white">
            What Our Store Owners Say
          </h2>
          <p className="mt-1 md:mt-3 text-base md:text-lg text-white">
            Trusted by entrepreneurs worldwide.
          </p>
        </div>
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-8"
            style={{
              animation: isInView ? `scroll ${animationDuration}s linear infinite` : "none",
              width: 'fit-content'
            }}
          >
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div
                key={index}
                className="min-w-[320px] bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-gray-100 shadow-sm"
              >
                <p className="text-gray-900 text-sm mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  {/* Name + Role */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {testimonial.role}
                    </span>
                  </div>
                  {/* Stars */}
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 text-[#03E525] fill-[#03E525]" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CSS for scrolling */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}

export default Reviews
