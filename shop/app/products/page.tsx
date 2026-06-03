import { Suspense } from 'react'
import { getProducts, getCategories } from '@/lib/products'
import ProductCard from '@/components/product/ProductCard'
import { Filter, SlidersHorizontal } from 'lucide-react'

interface SearchParams { category?: string; search?: string; page?: string; sort?: string }

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page || '1')
  const { products, total, pages } = getProducts({
    category: searchParams.category,
    search: searchParams.search,
    page,
    limit: 24,
  })
  const categories = getCategories()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-purple-100 mb-2">
          {searchParams.category ? categories.find(c => c.slug === searchParams.category)?.name || searchParams.category : 'Wszystkie produkty'}
        </h1>
        <div className="divider-gold w-32" />
        <p className="text-purple-400 text-sm mt-3">{total} produktów</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 space-y-6">
          <div className="card-satin p-5">
            <h3 className="font-serif text-sm font-semibold text-gold-400 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Kategorie
            </h3>
            <ul className="space-y-1">
              <li>
                <a href="/products" className={`block text-sm py-1.5 px-2 rounded-lg transition-colors ${!searchParams.category ? 'text-gold-400 bg-purple-800/30' : 'text-purple-300 hover:text-gold-400 hover:bg-purple-800/20'}`}>
                  Wszystkie ({total})
                </a>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <a href={`/products?category=${cat.slug}`} className={`block text-sm py-1.5 px-2 rounded-lg transition-colors ${searchParams.category === cat.slug ? 'text-gold-400 bg-purple-800/30' : 'text-purple-300 hover:text-gold-400 hover:bg-purple-800/20'}`}>
                    {cat.name} ({cat.count})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="card-satin p-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-serif text-xl text-purple-200 mb-2">Brak produktów</h3>
              <p className="text-purple-400 text-sm">Spróbuj innej kategorii lub frazy wyszukiwania.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <a key={p} href={`?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${p === page ? 'btn-gold' : 'card-satin text-purple-300 hover:text-gold-400'}`}>
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
