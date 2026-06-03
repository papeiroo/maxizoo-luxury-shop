import fs from 'fs'
import path from 'path'
import type { Product, Category } from '@/types'

let _products: Product[] | null = null
let _categories: Category[] | null = null

function loadProducts(): Product[] {
  if (_products) return _products
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    _products = data.products || data
    return _products as Product[]
  } catch {
    // Zwróć przykładowe produkty jeśli brak pliku
    return getSampleProducts()
  }
}

function loadCategories(): Category[] {
  if (_categories) return _categories
  try {
    const filePath = path.join(process.cwd(), 'data', 'categories.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    _categories = JSON.parse(raw)
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

export function getProducts(opts?: { category?: string; search?: string; page?: number; limit?: number }) {
  let products = loadProducts()
  if (opts?.category) products = products.filter(p => p.category.toLowerCase() === opts.category?.toLowerCase())
  if (opts?.search) {
    const q = opts.search.toLowerCase()
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  }
  const total = products.length
  const limit = opts?.limit || 24
  const page = opts?.page || 1
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
  return loadProducts().filter(p => p.availability === 'in_stock').slice(0, limit)
}

// ─── Przykładowe produkty (demo bez scrapera) ────────────────────────────────
function getSampleProducts(): Product[] {
  return [
    {
      id: 'sample-001', slug: 'royal-canin-adult-12kg-001',
      name: 'Royal Canin Adult 12kg', brand: 'Royal Canin', sku: 'RC-AD-12',
      price: 239.99, originalPrice: 279.99, discount: 14,
      category: 'Psy', breadcrumbs: ['Sklep', 'Psy', 'Karma sucha'],
      description: '<p>Pełnoporcjowa karma dla dorosłych psów. Bogata w białko i witaminy.</p>',
      images: ['https://www.maxizoo.pl/medias/Royal-Canin-Adult-12kg.jpg'],
      localImages: ['/images/products/royal-canin-adult-12kg-001-0.jpg'],
      attributes: { 'Waga': '12 kg', 'Gatunek': 'Pies', 'Wiek': 'Dorosły' },
      variants: [
        { group: 'Rozmiar', label: '2 kg', value: '2kg', price: 59.99 },
        { group: 'Rozmiar', label: '4 kg', value: '4kg', price: 109.99 },
        { group: 'Rozmiar', label: '12 kg', value: '12kg', price: 239.99 },
      ],
      availability: 'in_stock',
      shippingOptions: [
        { name: 'Kurier DPD', price: 12.99, deliveryTime: '1-2 dni robocze' },
        { name: 'Paczkomat InPost', price: 9.99, deliveryTime: '1-2 dni robocze' },
        { name: 'Odbiór własny', price: 0, deliveryTime: '2-3 dni robocze' },
      ],
      rating: 4.8, reviewCount: 342,
      sourceUrl: 'https://www.maxizoo.pl', scrapedAt: new Date().toISOString(),
    },
    {
      id: 'sample-002', slug: 'hill-science-plan-kitten-002',
      name: "Hill's Science Plan Kitten 3kg", brand: "Hill's", sku: 'HS-KIT-3',
      price: 89.99, originalPrice: null, discount: null,
      category: 'Koty', breadcrumbs: ['Sklep', 'Koty', 'Karma sucha'],
      description: '<p>Karma dla kociąt bogata w kurczaka. Wspiera prawidłowy rozwój.</p>',
      images: ['https://www.maxizoo.pl/medias/Hills-Kitten-3kg.jpg'],
      localImages: ['/images/products/hill-science-plan-kitten-002-0.jpg'],
      attributes: { 'Waga': '3 kg', 'Gatunek': 'Kot', 'Wiek': 'Kocię' },
      variants: [],
      availability: 'in_stock',
      shippingOptions: [
        { name: 'Kurier DPD', price: 12.99, deliveryTime: '1-2 dni robocze' },
        { name: 'Paczkomat InPost', price: 9.99, deliveryTime: '1-2 dni robocze' },
      ],
      rating: 4.6, reviewCount: 218,
      sourceUrl: 'https://www.maxizoo.pl', scrapedAt: new Date().toISOString(),
    },
  ]
}
