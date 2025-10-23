import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

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
      <div className="hidden md:block">
        <button className="px-3.5 py-2 bg-[#037834] text-white font-semibold rounded-md hover:bg-[#037834]/90 transition-colors">
          Get Started
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-[#037834] z-10"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 flex flex-col items-center py-6 gap-6 md:hidden z-50 shadow-lg">
          {links.map(l => {
            const active = path === l.href || (l.href === '/' && path === '/')
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleClick(l.href, e)}
                className={`text-lg cursor-pointer ${
                  active
                    ? 'font-semibold underline underline-offset-4 text-[#037834]'
                    : 'font-medium text-[#03E525] hover:text-[#037834] transition-colors'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </a>
            )
          })}
          <button className="px-6 py-2.5 bg-[#037834] text-white font-semibold rounded-md hover:bg-[#037834]/90 transition-colors mt-2">
            Get Started
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar