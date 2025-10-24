import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const Navbar = () => {
  const getPath = () => (typeof window !== 'undefined' ? window.location.pathname : '/')
  const [path, setPath] = useState(getPath())
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onPop = () => setPath(getPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const handleClick = (href: any, e: any) => {
    setPath(new URL(href, window.location.href).pathname)
    setMenuOpen(false)
  }

  return (
    <nav className="relative flex items-center justify-between px-4 py-3 md:px-5 md:py-0 bg-[#E2FEE4]" aria-label="Main navigation">
      {/* Left: Logo */}
      <div className="flex items-center z-10 -my-7">
        <div className="w-[120px] h-[120px] md:w-[120px] md:h-[120px] relative">
          <img
            src="/zeevo-logo.png"
            alt="zeevo logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Center: Desktop Navigation Links */}
      <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-x-8">
        {links.map(l => {
          const active = path === l.href || (l.href === '/' && path === '/')
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleClick(l.href, e)}
              className={`text-[#03E525] cursor-pointer ${
                active
                  ? 'font-semibold underline underline-offset-4 text-[#037834]'
                  : 'font-medium hover:text-[#03E525]/65 transition-colors'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {l.label}
            </a>
          )
        })}
      </div>

      {/* Right: Desktop Button */}
      <Link href={'/auth/sign-up'}>
         <div className="hidden md:block">
            <button className="px-3.5 py-2 bg-[#037834] text-white font-semibold rounded-md hover:bg-[#037834]/90 transition-colors">
              Get Started
            </button>
         </div>
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-[#037834] z-50 relative"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Full-Screen Menu */}
      <div
        className={`fixed inset-0 bg-[#E2FEE4] z-40 md:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          {links.map((l, idx) => {
            const active = path === l.href || (l.href === '/' && path === '/')
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleClick(l.href, e)}
                className={`text-3xl cursor-pointer transition-all duration-300 transform ${
                  menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                } ${
                  active
                    ? 'font-bold text-[#037834]'
                    : 'font-semibold text-[#03E525] hover:text-[#037834] hover:scale-110'
                }`}
                style={{ transitionDelay: menuOpen ? `${idx * 50}ms` : '0ms' }}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </a>
            )
          })}
          <Link href={'/auth/sign-up'}>
            <button 
            className={`px-8 py-3.5 bg-[#037834] text-white text-lg font-semibold rounded-lg hover:bg-[#037834]/90 transition-all duration-300 transform hover:scale-105 mt-4 ${
              menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: menuOpen ? `${links.length * 50}ms` : '0ms' }}
          >
            Get Started
          </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar