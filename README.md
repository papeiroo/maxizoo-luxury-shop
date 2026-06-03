# Maxizoo Luxury Shop

Sklep zoologiczny z produktami z maxizoo.pl — luxury purple/satin/gold design.

## Struktura

```
├── shop/          ← Next.js 14 + Stripe (deploy na Vercel)
└── scraper/       ← Scraper maxizoo.pl v3 (uruchamiany lokalnie)
```

## Szybki start

### 1. Sklep (Vercel)
- Połącz repo z Vercel
- Ustaw Root Directory: `shop`
- Dodaj zmienne środowiskowe z `.env.example`
- Deploy!

### 2. Scraper (lokalnie)
```bash
cd scraper
npm install
npm run scrape:test    # test
npm run scrape         # pełny scrape
```
Skopiuj `scraper/output/products.json` → `shop/data/products.json`

## Technologie
- Next.js 14, TypeScript, Tailwind CSS
- Stripe Checkout (Visa, Mastercard, BLIK, P24)
- Zustand (koszyk)
- Framer Motion (animacje)
