'use client'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { loadStripe } from '@stripe/stripe-js'
import { Shield, Truck, Check } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Step = 'address' | 'shipping' | 'payment'

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore()
  const total = totalPrice()
  const [step, setStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', postalCode: '',
    shipping: 'inpost',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const SHIPPING_OPTIONS = [
    { id: 'inpost', name: 'Paczkomat InPost', price: 9.99, time: '1-2 dni' },
    { id: 'dpd', name: 'Kurier DPD', price: 12.99, time: '1-2 dni' },
    { id: 'free', name: 'Odbior osobisty', price: 0, time: '2-3 dni' },
  ]
  const selectedShipping = SHIPPING_OPTIONS.find(s => s.id === form.shipping)!
  const orderTotal = total + selectedShipping.price

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: selectedShipping, customer: form }),
      })
      const { sessionId } = await res.json()
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-purple-100 mb-4">Koszyk jest pusty</h1>
        <Link href="/products" className="btn-luxury px-8 py-3.5">Wróć do sklepu</Link>
      </div>
    )
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'address', label: 'Adres' },
    { id: 'shipping', label: 'Dostawa' },
    { id: 'payment', label: 'Płatność' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-bold text-purple-100 mb-2">Kasa</h1>
      <div className="divider-gold w-24 mb-8" />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => {
          const active = s.id === step
          const done = steps.findIndex(x => x.id === step) > i
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'text-purple-950' : done ? 'text-green-400' : 'text-purple-500'}`}
                style={{ background: active ? 'linear-gradient(135deg,#d4af37,#fbbf24)' : done ? 'rgba(74,222,128,0.15)' : 'rgba(147,51,234,0.15)' }}>
                {done ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold">{i+1}</span>}
                {s.label}
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px bg-purple-700/40" />}
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <div className="card-satin p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-purple-100 mb-2">Dane dostawy</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-purple-400 mb-1 block">Imię</label>
                  <input className="input-luxury" value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Jan" />
                </div>
                <div>
                  <label className="text-xs text-purple-400 mb-1 block">Nazwisko</label>
                  <input className="input-luxury" value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Kowalski" />
                </div>
              </div>
              <div>
                <label className="text-xs text-purple-400 mb-1 block">Email</label>
                <input className="input-luxury" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="jan@example.com" />
              </div>
              <div>
                <label className="text-xs text-purple-400 mb-1 block">Telefon</label>
                <input className="input-luxury" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+48 123 456 789" />
              </div>
              <div>
                <label className="text-xs text-purple-400 mb-1 block">Ulica i numer</label>
                <input className="input-luxury" value={form.street} onChange={e => update('street', e.target.value)} placeholder="ul. Przykładowa 1/2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-purple-400 mb-1 block">Kod pocztowy</label>
                  <input className="input-luxury" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} placeholder="00-000" />
                </div>
                <div>
                  <label className="text-xs text-purple-400 mb-1 block">Miasto</label>
                  <input className="input-luxury" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Warszawa" />
                </div>
              </div>
              <button className="btn-luxury w-full py-3.5 mt-2" onClick={() => setStep('shipping')}>Dalej: Wybierz dostawę →</button>
            </div>
          )}

          {step === 'shipping' && (
            <div className="card-satin p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-purple-100 mb-2"><Truck className="inline w-5 h-5 text-gold-400 mr-2" />Metoda dostawy</h2>
              {SHIPPING_OPTIONS.map(opt => (
                <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${form.shipping === opt.id ? 'border-gold-400/50 bg-purple-800/20' : 'border-purple-700/30 hover:border-purple-600/50'}`}
                  style={{ border: `1px solid ${form.shipping === opt.id ? 'rgba(212,175,55,0.5)' : 'rgba(147,51,234,0.25)'}`, background: form.shipping === opt.id ? 'rgba(107,33,168,0.20)' : 'transparent' }}>
                  <input type="radio" name="shipping" value={opt.id} checked={form.shipping === opt.id} onChange={e => update('shipping', e.target.value)} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.shipping === opt.id ? 'border-gold-400' : 'border-purple-600'}`}>
                    {form.shipping === opt.id && <div className="w-2 h-2 rounded-full bg-gold-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-100">{opt.name}</p>
                    <p className="text-xs text-purple-400">{opt.time}</p>
                  </div>
                  <span className="text-sm font-bold text-gold-400">{opt.price === 0 ? 'Bezpłatna' : `${opt.price.toFixed(2)} zł`}</span>
                </label>
              ))}
              <div className="flex gap-3 mt-2">
                <button className="btn-luxury flex-1 py-3.5" onClick={() => setStep('address')}>← Wróć</button>
                <button className="btn-gold flex-1 py-3.5" onClick={() => setStep('payment')}>Dalej: Płatność →</button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="card-satin p-6 space-y-5">
              <h2 className="font-serif text-xl font-bold text-purple-100 flex items-center gap-2"><Shield className="w-5 h-5 text-gold-400" />Bezpieczna płatność</h2>
              <div className="rounded-xl p-4 text-sm text-purple-300 space-y-2" style={{ background:'rgba(59,7,100,0.4)', border:'1px solid rgba(147,51,234,0.20)' }}>
                <p>✅ Płatność przetwarzana przez <strong className="text-gold-400">Stripe</strong> — bezpieczne szyfrowanie SSL</p>
                <p>✅ Akceptujemy: Visa, Mastercard, BLIK, PayPal, Apple Pay, Google Pay</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-purple-400">Zamawia: <strong className="text-purple-200">{form.firstName} {form.lastName}</strong></p>
                <p className="text-xs text-purple-400">Dostawa na: <strong className="text-purple-200">{form.street}, {form.postalCode} {form.city}</strong></p>
                <p className="text-xs text-purple-400">Metoda dostawy: <strong className="text-purple-200">{selectedShipping.name}</strong></p>
              </div>
              <div className="flex gap-3">
                <button className="btn-luxury flex-1 py-3.5" onClick={() => setStep('shipping')}>← Wróć</button>
                <button className="btn-gold flex-1 py-4 text-base font-bold" onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Przetwarzanie...' : `Zamów i zapłać ${orderTotal.toFixed(2)} zł`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card-satin p-5 h-fit sticky top-24">
          <h3 className="font-serif text-lg font-bold text-purple-100 mb-4">Twoje zamówienie</h3>
          <ul className="space-y-3 mb-4">
            {items.map(item => (
              <li key={item.product.id} className="flex justify-between items-start text-sm">
                <span className="text-purple-300 truncate flex-1 mr-2">{item.product.name} <span className="text-purple-500">×{item.quantity}</span></span>
                <span className="text-gold-400 shrink-0 font-medium">{(item.product.price * item.quantity).toFixed(2)} zł</span>
              </li>
            ))}
          </ul>
          <div className="divider-gold mb-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-purple-400">
              <span>Produkty</span><span>{total.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between text-purple-400">
              <span>Dostawa</span><span>{selectedShipping.price === 0 ? 'Bezpłatna' : `${selectedShipping.price.toFixed(2)} zł`}</span>
            </div>
            <div className="divider-gold" />
            <div className="flex justify-between font-bold">
              <span className="font-serif text-purple-100">Razem</span>
              <span className="font-serif text-xl text-gold-400">{orderTotal.toFixed(2)} zł</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
