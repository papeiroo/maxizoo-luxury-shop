import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(180deg, rgba(26,0,48,0.98) 0%, #0d001a 100%)', borderTop: '1px solid rgba(147,51,234,0.20)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐾</span>
              <div>
                <span className="font-serif text-xl font-bold" style={{ background: 'linear-gradient(135deg,#d4af37,#fbbf24,#d4af37)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MaxiZoo</span>
                <span className="block text-[9px] tracking-[0.3em] uppercase text-purple-400">Luxury Pet Store</span>
              </div>
            </div>
            <p className="text-sm text-purple-400 leading-relaxed">Premium produkty dla Twojego pupila. Jakość i luksusu w każdym kąsku.</p>
          </div>
          {/* Sklep */}
          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Sklep</h4>
            <ul className="space-y-2 text-sm text-purple-400">
              {['Psy','Koty','Ptaki','Gryzonie','Ryby'].map(c => (
                <li key={c}><Link href={`/products?category=${c.toLowerCase()}`} className="hover:text-gold-400 transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          {/* Info */}
          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Informacje</h4>
            <ul className="space-y-2 text-sm text-purple-400">
              {['O nas','Kontakt','Regulamin','Polityka prywatności','Zwroty i reklamacje'].map(l => (
                <li key={l}><Link href="#" className="hover:text-gold-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Kontakt */}
          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm text-purple-400">
              <li>📧 kontakt@maxizoo-luxury.pl</li>
              <li>📞 +48 123 456 789</li>
              <li>⏰ Pn–Pt 8:00–18:00</li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-purple-500 mb-2 tracking-widest uppercase">Bezpieczne płatności</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa','Mastercard','Blik','Stripe','PayPal'].map(p => (
                  <span key={p} className="px-2 py-1 rounded-lg text-[10px] font-medium text-purple-300" style={{ background:'rgba(147,51,234,0.15)', border:'1px solid rgba(147,51,234,0.25)' }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="divider-gold my-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-purple-600">
          <span>© {new Date().getFullYear()} MaxiZoo Luxury. Wszelkie prawa zastrzeżone.</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-gold-500" />Zbudowany z pasją dla zwierząt</span>
        </div>
      </div>
    </footer>
  )
}
