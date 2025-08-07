import { ArrowRight } from 'lucide-react'
import React from 'react'

function Herosection({ secondaryColor, description, name }: { secondaryColor: string, description: string | undefined, name: string }) {
  return (
    <section className="relative py-20 overflow-hidden" style={{ backgroundColor: secondaryColor }}>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/600')] bg-cover bg-center opacity-5" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {name}
            </span>
          </h1>
          {description && (
            <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-4 sm:mb-6 max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          <button
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
            style={{ backgroundColor: secondaryColor }}
            aria-label="Explore products"
          >
            Explore Products <ArrowRight className="w-4 h-4" />
          </button>
        </div>
    </section>
  )
}

export default Herosection