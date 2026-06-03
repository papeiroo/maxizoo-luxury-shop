'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Search, Menu, X, Sparkles } from 'lucide-react'
import { useCartStore } from '@/lib/store'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const totalItems = useCartStore(s => s.totalItems())

  const navLinks = [
    { label: 'Psy', href: '/products?category=psy' },
    { label: 'Koty', href: '/products?category=koty' },
    { label: 'Ptaki', href: '/products?category=ptaki' },
    { label: 'Gryzonie', href: '/products?category=gryzonie' },
    { label: 'Ryby', href: '/products?category=ryby' },
    { label: 'Nowości', href: '/products?sort=newest' },
  ]

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-satin-gradient py-1.5 text-center text-xs text-purple-200 tracking-widest uppercase">
        <Sparkles className="inline w-3 h-3 mr-1 text-gold-400" />
        Darmowa dostawa od 199 zł • Dostawa 1-2 dni robocze
        <Sparkles className="inline w-3 h-3 ml-1 text-gold-400" />
      </div>

      {/* Main nav */}
      <nav
        style={{
          background: 'linear-gradient(180deg, rgba(26,0,48,0.98) 0%, rgba(59,7,100,0.95) 100%)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(147,51,234,0.20)',
          boxShadow: '0 4px 24px rgba(74,0,128,0.25)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🐾</span>
              <div className="leading-none">
                <span
                  className="font-serif text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #fbbf24, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  MaxiZoo
                </span>
                <span className="block text-[9px] tracking-[0.3em] uppercase text-purple-300 font-light">Luxury Pet Store</span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-purple-200 hover:text-gold-400 transition-colors duration-200 relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold-400 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden sm:flex items-center gap-2 bg-purple-900/40 rounded-xl px-3 py-2 border border-purple-700/30">
                <Search className="w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Szukaj produktów..."
                  className="bg-transparent text-sm text-purple-200 placeholder-purple-500 outline-none w-40"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                  }}
                />
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 rounded-xl hover:bg-purple-800/40 transition-colors">
                <ShoppingCart className="w-5 h-5 text-purple-200" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-purple-950"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #fbbf24)' }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu */}
              <button className="md:hidden p-2 text-purple-300" onClick={() => setOpen(!open)}>
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-purple-800/40 bg-purple-950/95 px-4 py-4 space-y-3">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="block text-sm text-purple-200 hover:text-gold-400 py-2 border-b border-purple-800/30"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
