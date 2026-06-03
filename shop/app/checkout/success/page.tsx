'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { CheckCircle, Sparkles } from 'lucide-react'

export default function SuccessPage() {
  const clearCart = useCartStore(s => s.clearCart)
  useEffect(() => { clearCart() }, [clearCart])
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="card-satin p-12 space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background:'rgba(74,222,128,0.15)', border:'2px solid rgba(74,222,128,0.4)' }}>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <h1 className="font-serif text-3xl font-bold text-purple-100">Dziękujemy za zamówienie!</h1>
        <p className="text-purple-300">Potwierdzenie zostanie wysłane na Twój adres e-mail. Twoje produkty wkrótce dotrą do pupila! 🐾</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-luxury px-6 py-3">Wróć na stronę główną</Link>
          <Link href="/products" className="btn-gold px-6 py-3">Kup więcej</Link>
        </div>
        <p className="text-xs text-purple-500 flex items-center justify-center gap-1"><Sparkles className="w-3 h-3 text-gold-500" />Twój pupil będzie wniebowzięty!</p>
      </div>
    </div>
  )
}
