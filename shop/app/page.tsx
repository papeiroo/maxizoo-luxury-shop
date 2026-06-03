import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Shield, Truck, Star } from 'lucide-react'
import { getFeaturedProducts, getCategories } from '@/lib/products'
import ProductCard from '@/components/product/ProductCard'

export default function HomePage() {
  const featured = getFeaturedProducts(8)
  const categories = getCategories().slice(0, 6)

  return (
    <div className="animate-fade-in">
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d001a 0%, #1a0030 30%, #3b0764 65%, #4a0080 100%)' }}
      >
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #9333ea, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d4af37, transparent)' }} />
          {/* Satin sheen lines */}
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(147,51,234,0.03) 60px, rgba(147,51,234,0.03) 61px)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest uppercase font-medium text-gold-400"
              style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <Sparkles className="w-3 h-3" />
              Premium Sklep Zoologiczny
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-purple-100">Luksus dla</span>
              <br />
              <span style={{ background: 'linear-gradient(135deg,#d4af37,#fbbf24,#d4af37)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Twojego Pupila
              </span>
            </h1>

            <p className="text-lg text-purple-300 leading-relaxed max-w-lg">
              Odkryj najwyższej jakości produkty dla Twojego zwierzęcia. Premium karma,
              ekskluzywne akcesoria i wszystko co potrzebuje Twój czworonóg.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-gold text-sm px-8 py-4 rounded-xl font-semibold">
                Przeglądaj sklep
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </Link>
              <Link href="/products?sort=newest" className="btn-luxury text-sm px-8 py-4 rounded-xl">
                Nowości
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[['5000+','Produktów'],['50+','Marek'],['99%','Zadowolonych']].map(([n,l]) => (
                <div key={l} className="text-center">
                  <div className="font-serif text-2xl font-bold text-gold-400">{n}</div>
                  <div className="text-xs text-purple-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image placeholder */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80 animate-float">
              <div className="absolute inset-0 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.6), transparent)' }} />
              <div className="w-full h-full flex items-center justify-center text-[180px]">🐾</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USPs ──────────────────────────────────────────────────── */}
      <section className="py-8" style={{ background: 'rgba(59,7,100,0.30)', borderTop: '1px solid rgba(147,51,234,0.15)', borderBottom: '1px solid rgba(147,51,234,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-5 h-5" />, title: 'Darmowa dostawa', sub: 'Od 199 zł' },
              { icon: <Shield className="w-5 h-5" />, title: 'Bezpieczne płatności', sub: 'Stripe & Blik' },
              { icon: <Star className="w-5 h-5" />, title: 'Produkty premium', sub: 'Tylko sprawdzone marki' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'Zwrot 30 dni', sub: 'Bez pytań' },
            ].map(u => (
              <div key={u.title} className="flex items-center gap-3 p-3">
                <span className="text-gold-400">{u.icon}</span>
                <div>
                  <div className="text-sm font-medium text-purple-100">{u.title}</div>
                  <div className="text-xs text-purple-400">{u.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl font-bold text-purple-100 mb-3">Kategorie</h2>
          <div className="divider-gold w-32 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories.length > 0 ? categories : [
            { id:'psy', name:'Psy', slug:'psy', count:0 },
            { id:'koty', name:'Koty', slug:'koty', count:0 },
            { id:'ptaki', name:'Ptaki', slug:'ptaki', count:0 },
            { id:'gryzonie', name:'Gryzonie', slug:'gryzonie', count:0 },
            { id:'ryby', name:'Ryby', slug:'ryby', count:0 },
            { id:'gady', name:'Gady', slug:'gady', count:0 },
          ]).map(cat => {
            const emoji: Record<string,string> = { psy:'🐕', koty:'🐈', ptaki:'🦜', gryzonie:'🐹', ryby:'🐠', gady:'🦎', default:'🐾' }
            const e = emoji[cat.slug] || emoji.default
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="card-satin flex flex-col items-center gap-3 p-5 hover:border-gold-500/40 transition-all duration-300 group hover:-translate-y-1"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{e}</span>
                <span className="text-sm font-medium text-purple-200 group-hover:text-gold-400 transition-colors">{cat.name}</span>
                {cat.count > 0 && <span className="text-[10px] text-purple-500">{cat.count} prod.</span>}
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-purple-100 mb-3">Polecane produkty</h2>
              <div className="divider-gold w-40" />
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors">
              Zobacz wszystkie <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="btn-luxury px-10 py-3.5">
              Zobacz cały asortyment <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto card-satin p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(135deg, #d4af37 25%, transparent 25%), linear-gradient(-135deg, #d4af37 25%, transparent 25%)', backgroundSize: '20px 20px' }} />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-purple-100 mb-4 relative z-10">
            Zapisz się do newslettera
          </h2>
          <p className="text-purple-300 mb-8 relative z-10">Otrzymaj 10% rabatu na pierwsze zamówienie i bądź na bieżąco z nowościami.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
            <input type="email" placeholder="Twój adres e-mail" className="input-luxury flex-1" />
            <button className="btn-gold px-6 py-3 rounded-xl whitespace-nowrap">Zapisz mnie</button>
          </div>
        </div>
      </section>
    </div>
  )
}
