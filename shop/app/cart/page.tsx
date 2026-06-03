'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()
  const total = totalPrice()
  const FREE_SHIPPING_THRESHOLD = 199
  const missingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - total)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h1 className="font-serif text-3xl font-bold text-purple-100 mb-4">Koszyk jest pusty</h1>
        <p className="text-purple-400 mb-8">Dodaj produkty, aby kontynuować zakupy.</p>
        <Link href="/products" className="btn-luxury px-8 py-3.5">Przeglądaj sklep</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-bold text-purple-100 mb-2">Koszyk</h1>
      <div className="divider-gold w-24 mb-8" />

      {/* Free shipping bar */}
      {missingForFree > 0 && (
        <div className="card-satin p-4 mb-6 flex items-center gap-3">
          <span className="text-sm text-purple-300">
            Brakuje <strong className="text-gold-400">{missingForFree.toFixed(2)} zł</strong> do darmowej wysyłki!
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-purple-800/50">
            <div className="h-full rounded-full bg-satin-gradient" style={{ width: `${Math.min(100, (total/FREE_SHIPPING_THRESHOLD)*100)}%`, transition:'width 0.5s ease' }} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const img = item.product.localImages?.[0] || item.product.images?.[0] || ''
            return (
              <div key={item.product.id} className="card-satin p-4 flex gap-4 items-center">
                {/* Image */}
                <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-purple-900/30">
                  {img ? <Image src={img} alt={item.product.name} fill className="object-contain p-2" unoptimized={img.startsWith('http')} sizes="80px" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-gold-500 mb-0.5">{item.product.brand}</p>
                  <h3 className="font-serif text-sm font-medium text-purple-100 truncate">{item.product.name}</h3>
                  {item.selectedVariant && <p className="text-xs text-purple-400 mt-0.5">{item.selectedVariant.label}</p>}
                  <p className="font-serif text-base font-bold text-gold-400 mt-1">{(item.product.price * item.quantity).toFixed(2)} zł</p>
                </div>
                {/* Qty + remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-lg overflow-hidden" style={{ border:'1px solid rgba(147,51,234,0.30)' }}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1.5 text-purple-300 hover:text-gold-400"><Minus className="w-3 h-3" /></button>
                    <span className="px-3 text-sm text-purple-100">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1.5 text-purple-300 hover:text-gold-400"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="p-2 text-purple-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card-satin p-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-purple-100 mb-5">Podsumowanie</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">Wartość produktów</span>
                <span className="text-purple-200">{total.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">Dostawa</span>
                <span className={total >= FREE_SHIPPING_THRESHOLD ? 'text-green-400' : 'text-purple-200'}>
                  {total >= FREE_SHIPPING_THRESHOLD ? 'Bezpłatna' : 'od 9.99 zł'}
                </span>
              </div>
              <div className="divider-gold" />
              <div className="flex justify-between">
                <span className="font-serif text-lg font-semibold text-purple-100">Razem</span>
                <span className="font-serif text-xl font-bold text-gold-400">{total.toFixed(2)} zł</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              Przejdź do kasy <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-gold-400 transition-colors py-2">
              <ArrowLeft className="w-4 h-4" /> Kontynuuj zakupy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
