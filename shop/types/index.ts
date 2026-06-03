export interface ShippingOption {
  name: string;
  price: number;
  deliveryTime: string;
}

export interface ProductVariant {
  group: string;
  label: string;
  value: string;
  price: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  category: string;
  breadcrumbs: string[];
  description: string;
  images: string[];
  localImages: string[];
  attributes: Record<string, string>;
  variants: ProductVariant[];
  availability: 'in_stock' | 'out_of_stock';
  shippingOptions: ShippingOption[];
  rating: number | null;
  reviewCount: number;
  sourceUrl: string;
  scrapedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}
