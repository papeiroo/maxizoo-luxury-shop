import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug, getFeaturedProducts } from '@/lib/products'
import AddToCartButton from '@/components/product/AddToCartButton'
import ProductCard from '@/components/product/ProductCard'
import { Star, Truck, Shield, Package, ChevronRight } from 'lucide-react'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  const related = getFeaturedProducts(4).filter(p => p.id !== product.id).slice(0, 4)
  const img = product.localImages?.[0] || product.images?.[0] || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-purple-500 mb-8">
        <a href="/" className="hover:text-gold-400 transition-colors">Sklep</a>
        <ChevronRight className="w-3 h-3" />
        <a href={`/products?category=${product.category}`} className="hover:text-gold-400 transition-colors">{product.category}</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-purple-300 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="card-satin aspect-square relative overflow-hidden">
            {img ? (
              <Image src={img} alt={product.name} fill className="object-contain p-8" unoptimized={img.startsWith('http')} sizes="(max-width:1024px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🐾</div>
            )}
            {product.discount && (
              <span className="absolute top-4 left-4 badge-luxury text-sm px-3 py-1">-{product.discount}%</span>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.slice(0, 5).map((img, i) => (
                <div key={i} className="shrink-0 w-20 h-20 card-satin relative overflow-hidden cursor-pointer hover:border-gold-400/50 transition-all">
                  <Image src={img} alt={`${product.name} ${i+1}`} fill className="object-contain p-2" unoptimized sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-500 font-medium mb-2">{product.brand}</p>
            <h1 className="font-serif text-3xl font-bold text-purple-100 leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating!) ? 'text-gold-400 fill-gold-400' : 'text-purple-700'}`} />
                  ))}
                </div>
                <span className="text-sm text-purple-400">{product.rating} ({product.reviewCount} opinii)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="card-satin p-5">
            <div className="flex items-end gap-3">
              <span className="font-serif text-4xl font-bold text-gold-400">{product.price.toFixed(2)} zł</span>
              {product.originalPrice && (
                <div className="pb-1">
                  <span className="text-lg text-purple-500 line-through">{product.originalPrice.toFixed(2)} zł</span>
                  <span className="ml-2 badge-luxury">Oszczędzasz {(product.originalPrice - product.price).toFixed(2)} zł</span>
                </div>
              )}
            </div>
            <p className={`text-sm mt-2 font-medium ${product.availability === 'in_stock' ? 'text-green-400' : 'text-red-400'}`}>
              {product.availability === 'in_stock' ? '✓ Dostępny — wysyłka do 24h' : '✗ Chwilowo niedostępny'}
            </p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-purple-200">Warianty</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button key={i} className="px-4 py-2 rounded-xl text-sm text-purple-200 transition-all hover:border-gold-400/60 hover:text-gold-400"
                    style={{ background: 'rgba(59,7,100,0.5)', border: '1px solid rgba(147,51,234,0.30)' }}>
                    {v.label}
                    {v.price && <span className="ml-1 text-gold-400 text-xs">({v.price.toFixed(2)} zł)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Shipping */}
          <div className="card-satin p-5 space-y-3">
            <h3 className="text-sm font-medium text-purple-200 flex items-center gap-2"><Truck className="w-4 h-4 text-gold-400" /> Opcje dostawy</h3>
            {product.shippingOptions.map((s, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-purple-300">{s.name}</span>
                <div className="text-right">
                  <span className="text-gold-400 font-medium">{s.price === 0 ? 'Bezpłatna' : `${s.price.toFixed(2)} zł`}</span>
                  <span className="block text-[11px] text-purple-500">{s.deliveryTime}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Attributes */}
          {Object.keys(product.attributes).length > 0 && (
            <div className="card-satin p-5">
              <h3 className="text-sm font-medium text-purple-200 flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-gold-400" /> Specyfikacja</h3>
              <dl className="space-y-2">
                {Object.entries(product.attributes).slice(0, 8).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <dt className="text-purple-400">{k}</dt>
                    <dd className="text-purple-200 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12 card-satin p-8">
          <h2 className="font-serif text-2xl font-bold text-purple-100 mb-4">Opis produktu</h2>
          <div className="divider-gold mb-6" />
          <div className="prose prose-invert prose-purple max-w-none text-purple-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-bold text-purple-100 mb-4">Może Ci się spodobać</h2>
          <div className="divider-gold mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
