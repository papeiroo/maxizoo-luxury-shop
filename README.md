# 🐾 MaxiZoo Luxury — Premium Sklep Zoologiczny

Sklep internetowy zbudowany w **Next.js 14** z designem w stylu luksusowym (purpura + satyna + złoto). Produkty pobierane automatycznie ze scraperem z maxizoo.pl.

---

## 🚀 Szybki start

### Wymagania
- **Node.js 18+** — pobierz z [nodejs.org](https://nodejs.org)
- **Konto Stripe** (darmowe) — [dashboard.stripe.com](https://dashboard.stripe.com)

### Instalacja (automatyczna)

```bash
bash setup.sh
```

### Instalacja (ręczna)

```bash
# 1. Scraper
cd scraper
npm install

# 2. Sklep
cd ../shop
npm install
cp .env.example .env.local
# Edytuj .env.local — wklej klucze Stripe

# 3. Uruchom sklep
npm run dev
```

Otwórz **http://localhost:3000**

---

## 🕷️ Scraper produktów

```bash
cd scraper

# Testowy (5 produktów/kategorię — szybki)
npm run scrape:test

# Pełny scraping
npm run scrape
```

Scraper pobierze:
- ✅ Wszystkie kategorie
- ✅ Produkty z pełnymi danymi (nazwa, cena, warianty, atrybuty)
- ✅ Zdjęcia do `shop/public/images/products/`
- ✅ Opcje wysyłki
- ✅ Oceny i recenzje

Wynik zapisywany do `shop/data/products.json`.

---

## 🛠️ Technologie

| Warstwa | Technologia |
|---------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS — luxury purple/satin theme |
| State | Zustand (koszyk persystowany w localStorage) |
| Płatności | Stripe Checkout (Visa, MC, BLIK, P24) |
| Animacje | Framer Motion |
| Scraper | Puppeteer + Cheerio + Axios |

---

## 📁 Struktura projektu

```
maxizoo-shop/
├── scraper/
│   ├── scraper.js        ← Puppeteer scraper maxizoo.pl
│   └── package.json
├── shop/
│   ├── app/
│   │   ├── page.tsx            ← Strona główna
│   │   ├── products/
│   │   │   ├── page.tsx        ← Katalog produktów
│   │   │   └── [slug]/page.tsx ← Strona produktu
│   │   ├── cart/page.tsx       ← Koszyk
│   │   ├── checkout/page.tsx   ← Checkout + Stripe
│   │   └── api/stripe/route.ts ← Stripe API endpoint
│   ├── components/
│   │   ├── layout/  ← Navbar, Footer
│   │   └── product/ ← ProductCard, AddToCartButton
│   ├── lib/
│   │   ├── store.ts     ← Zustand cart store
│   │   └── products.ts  ← Ładowanie produktów z JSON
│   ├── data/
│   │   └── products.json ← (generowany przez scraper)
│   └── .env.example
├── setup.sh  ← Skrypt instalacyjny
└── README.md
```

---

## 💳 Konfiguracja Stripe

1. Wejdź na [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys
2. Skopiuj **Publishable key** i **Secret key** (testowe)
3. Wklej do `shop/.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🌐 Wdrożenie na produkcję (Vercel — darmowe)

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

cd shop
vercel

# Dodaj zmienne środowiskowe w panelu Vercel:
# STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_BASE_URL
```

---

## 📤 GitHub — pierwsze wgranie

### 1. Załóż konto GitHub
Wejdź na [github.com](https://github.com) → Sign up → wypełnij formularz

### 2. Utwórz repozytorium
- Kliknij **+** → **New repository**
- Nazwa: `maxizoo-luxury-shop`
- Visibility: **Private** (zalecane)
- NIE zaznaczaj "Add README"
- Kliknij **Create repository**

### 3. Zainstaluj Git
Pobierz z [git-scm.com](https://git-scm.com) i zainstaluj.

### 4. Wgraj projekt

```bash
cd maxizoo-shop

git init
git add .
git commit -m "feat: initial MaxiZoo Luxury shop"
git branch -M main
git remote add origin https://github.com/TWOJ_LOGIN/maxizoo-luxury-shop.git
git push -u origin main
```

> Zastąp `TWOJ_LOGIN` swoją nazwą użytkownika GitHub.

GitHub poprosi o login i hasło (lub token — wygeneruj w Settings → Developer settings → Tokens).

---

## ⚡ Produkcja — lista rzeczy do zrobienia

- [ ] Uruchomić scraper i wypełnić bazę produktów
- [ ] Dodać klucze Stripe (produkcyjne, nie testowe)
- [ ] Wdrożyć na Vercel lub VPS
- [ ] Skonfigurować domenę
- [ ] Dodać panel admina (opcjonalnie: Sanity CMS lub Strapi)
- [ ] Skonfigurować email transakcyjny (Resend lub SendGrid)

