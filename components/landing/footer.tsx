import React from 'react'
import Link from 'next/link'

const Footer = ()=> {
  return (
    <footer className="py-12 px-6 bg-[#EFEFEF] text-black">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-[#03E525]">Zeevo</div>
                <span className="text-gray-500">•</span>
                <span className="text-sm">Build your online store</span>
              </div>

              {/* Quick Links */}
              <div className="flex items-center gap-6 text-sm">
                <Link href="/help" className="hover:text-[#03E525] transition">Help</Link>
                <Link href="/privacy" className="hover:text-[#03E525] transition">Privacy</Link>
                <Link href="/terms" className="hover:text-[#03E525] transition">Terms</Link>
                <Link href="/contact" className="hover:text-[#03E525] transition">Contact</Link>
              </div>

              {/* Copyright */}
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} <span className='text-[#03E525]'>Zeevo</span>. All rights reserved.
              </div>
            </div>
          </div>
    </footer>
  )
}

export default Footer