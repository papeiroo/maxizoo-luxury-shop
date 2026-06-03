'use client'
import { useState } from 'react'
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const handle = () => {
    addItem(product, qty)
    setAdded(true)
    toast.success(`${product.name} dodano do koszyka!`)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex gap-3">
      {/* Qty selector */}
      <div className="flex items-center rounded-xl overflow-hidden" style={{ border:'1px solid rgba(147,51,234,0.30)', background:'rgba(59,7,100,0.4)' }}>
        <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-3 text-purple-300 hover:text-gold-400 transition-colors">
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 text-purple-100 font-medium min-w-[3rem] text-center">{qty}</span>
        <button onClick={() => setQty(q => q+1)} className="px-3 py-3 text-purple-300 hover:text-gold-400 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {/* Add button */}
      <button
        onClick={handle}
        disabled={product.availability === 'out_of_stock'}
        className={`btn-gold flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${added ? 'opacity-90' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {added ? <><Check className="w-4 h-4 inline mr-2" />Dodano!</> : <><ShoppingCart className="w-4 h-4 inline mr-2" />Dodaj do koszyka</>}
      </button>
    </div>
  )
}
