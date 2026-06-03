import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variant) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }))
        } else {
          set(state => ({ items: [...state.items, { product, quantity, selectedVariant: variant }] }))
        }
      },

      removeItem: (productId) => set(state => ({
        items: state.items.filter(i => i.product.id !== productId),
      })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((a, i) => a + i.quantity, 0),
      totalPrice: () => get().items.reduce((a, i) => a + i.product.price * i.quantity, 0),
    }),
    { name: 'maxizoo-cart' }
  )
)
