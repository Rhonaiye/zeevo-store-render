import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const  HeroSection = ()=> {
  return (
   <section className="relative  max-sm:pt-8 pt-28  pb-24 px-6 xl:pt-26 bg-[#E2FEE4] overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96  rounded-full opacity-30 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80  rounded-full opacity-30 blur-3xl"
            animate={{ 
              scale: [1, 1.15, 1], 
              opacity: [0.3, 0.4, 0.3],
              x: [0, -40, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-[4rem] font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
              Create Your Online Store, <span className="text-[#03E525]">Launch in Minutes</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl xl:text-[1.1rem] mx-auto leading-relaxed">
              Build stunning online stores with zero coding. Launch your e-commerce business effortlessly.
            </p>
            <div className="mt-10">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/sign-up"
                  className="bg-[#037834] text-white px-8 py-2.5 rounded-lg hover:bg-[#037834]/95 transition flex items-center gap-3 text-lg font-medium mx-auto shadow-lg shadow-indigo-[#037834]/95 w-fit"
                >
                  Get Started
                
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
  )
}

export default HeroSection