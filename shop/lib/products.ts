import fs from 'fs'
import path from 'path'
import type { Product, Category } from '@/types'

let _products: Product[] | null = null
let _categories: Category[] | null = null

// Normalizuje format scrapera v3 (pricing.finalPrice) do formatu sklepu (price)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(p: any): Product {
  const price: number = p.price ?? p.pricing?.finalPrice ?? 0
  const originalPrice: number | null = p.originalPrice ?? p.pricing?.basePrice ?? null
  const discount: number | null =
    originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : p.discount ?? null

  const breadcrumbs: string[] = Array.isArray(p.breadcrumbs)
    ? p.breadcrumbs.map((b: any) => (typeof b === 'string' ? b : b.name ?? ''))
    : []

  return {
    id: String(p.id ?? p.sku ?? ''),
    slug: p.slug ?? '',
    name: p.name ?? '',
    brand: p.brand ?? 'Maxi Zoo',
    sku: p.sku ?? String(p.id ?? ''),
    price,
    originalPrice,
    discount,
    category: p.category ?? p.categoryPath?.[0] ?? 'Inne',
    breadcrumbs,
    description: p.description ?? p.longDescription ?? '',
    images: Array.isArray(p.images) ? p.images : [],
    localImages: Array.isArray(p.localImages) ? p.localImages : [],
    attributes: p.attributes && typeof p.attributes === 'object' ? p.attributes : {},
    variants: Array.isArray(p.variants) ? p.variants : [],
    availability: p.availability === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
    shippingOptions: Array.isArray(p.shippingOptions) ? p.shippingOptions : [],
    rating: typeof p.rating === 'number' ? p.rating : null,
    reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
    sourceUrl: p.sourceUrl ?? p.url ?? 'https://www.maxizoo.pl',
    scrapedAt: p.scrapedAt ?? new Date().toISOString(),
  }
}

function loadProducts(): Product[] {
  if (_products) return _products
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: any[] = Array.isArray(data) ? data : (data.products ?? [])
    _products = list.map(normalizeProduct)
    return _products
  } catch {
    return getSampleProducts()
  }
}

function loadCategories(): Category[] {
  if (_categories) return _categories
  try {
    const filePath = path.join(process.cwd(), 'data', 'categories.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _categories = data.map((c: any) => ({
      id: c.id ?? c.slug ?? c.name,
      name: c.name,
      slug: c.slug ?? c.name?.toLowerCase().replace(/\s+/g, '-'),
      count: c.count ?? 0,
    }))
    return _categories as Category[]
  } catch {
    const products = loadProducts()
    const cats = new Map<string, number>()
    products.forEach(p => cats.set(p.category, (cats.get(p.category) || 0) + 1))
    return Array.from(cats.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count,
    }))
  }
}

export function getProducts(opts?: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  let products = loadProducts()
  if (opts?.category) {
    products = products.filter(
      p => p.category.toLowerCase() === opts.category?.toLowerCase()
    )
  }
  if (opts?.search) {
    const q = opts.search.toLowerCase()
    products = products.filter(
      p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    )
  }
  const total = products.length
  const limit = opts?.limit ?? 24
  const page = opts?.page ?? 1
  const start = (page - 1) * limit
  return { products: products.slice(start, start + limit), total, pages: Math.ceil(total / limit) }
}

export function getProductBySlug(slug: string): Product | undefined {
  return loadProducts().find(p => p.slug === slug)
}

export function getCategories(): Category[] {
  return loadCategories()
}

export function getFeaturedProducts(limit = 8): Product[] {
  return loadProducts()
    .filter(p => p.availability === 'in_stock')
    .slice(0, limit)
}

function getSampleProducts(): Product[] {
  return [
    {
      id: 'sample-001',
      slug: 'royal-canin-adult-12kg-001',
      name: 'Royal Canin Adult 12kg',
      brand: 'Royal Canin',
      sku: 'RC-AD-12',
      price: 239.99,
      originalPrice: 279.99,
      discount: 14,
      category: 'Psy',
      breadcrumbs: ['Sklep', 'Psy', 'Karma sucha'],
      description: '<p>Pełnoporcjowa karma dla dorosłych psów.</p>',
      images: [],
      localImages: [],
      attributes: { Waga: '12 kg', Gatunek: 'Pies' },
      variants: [],
      availability: 'in_stock',
      shippingOptions: [],
      rating: 4.8,
      reviewCount: 342,
      sourceUrl: 'https://www.maxizoo.pl',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'sample-002',
      slug: 'hills-science-plan-kitten-002',
      name: "Hill's Science Plan Kitten 3kg",
      brand: "Hill's",
      sku: 'HS-KIT-3',
      price: 89.99,
      originalPrice: null,
      discount: null,
      category: 'Koty',
      breadcrumbs: ['Sklep', 'Koty', 'Karma sucha'],
      description: '<p>Karma dla kociąt bogata w kurczaka.</p>',
      images: [],
      localImages: [],
      attributes: { Waga: '3 kg', Gatunek: 'Kot' },
      variants: [],
      availability: 'in_stock',
      shippingOptions: [],
      rating: 4.6,
      reviewCount: 218,
      sourceUrl: 'https://www.maxizoo.pl',
      scrapedAt: new Date().toISOString(),
    },
  ]
}
