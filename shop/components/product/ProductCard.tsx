'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const img = product.localImages?.[0] || product.images?.[0] || '/images/placeholder.jpg'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} dodano do koszyka!`)
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <article className="product-card group h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-purple-900/30">
          {img && (
            <Image
              src={img}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              unoptimized={img.startsWith('http')}
            />
          )}
          {/* Discount badge */}
          {product.discount && (
            <span className="absolute top-3 left-3 badge-luxury">-{product.discount}%</span>
          )}
          {/* Wishlist */}
          <button className="absolute top-3 right-3 p-1.5 rounded-full bg-purple-900/60 hover:bg-purple-800/80 transition-colors">
            <Heart className="w-3.5 h-3.5 text-purple-300" />
          </button>
          {/* Out of stock overlay */}
          {product.availability === 'out_of_stock' && (
            <div className="absolute inset-0 bg-purple-950/70 flex items-center justify-center">
              <span className="text-purple-300 text-xs font-medium">Chwilowo niedostępny</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <p className="text-[10px] uppercase tracking-widest text-gold-500 font-medium">{product.brand}</p>
          <h3 className="font-serif text-sm font-medium text-purple-100 line-clamp-2 leading-snug">{product.name}</h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round(product.rating!) ? 'text-gold-400 fill-gold-400' : 'text-purple-700'}`} />
              ))}
              <span className="text-[10px] text-purple-400 ml-1">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-2 mt-auto pt-2">
            <span className="font-serif text-lg font-bold text-gold-400">{product.price.toFixed(2)} zł</span>
            {product.originalPrice && (
              <span className="text-xs text-purple-500 line-through">{product.originalPrice.toFixed(2)} zł</span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={product.availability === 'out_of_stock'}
            className="btn-luxury w-full text-xs py-2.5 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Dodaj do koszyka
          </button>
        </div>
      </article>
    </Link>
  )
}
