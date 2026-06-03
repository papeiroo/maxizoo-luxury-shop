# Maxizoo Scraper v3

Pełny scraper produktów z maxizoo.pl z 10% marżą.

## Instalacja

```bash
# Skopiuj scraper.js i package.json do folderu scraper/
cd maxizoo-shop/scraper
npm install
```

## Użycie

```bash
# Scrape wszystkich kategorii (pełny)
npm run scrape

# Test - tylko 3 produkty z każdej kategorii
npm run scrape:test

# Tylko psy
npm run scrape:pies

# Tylko koty
npm run scrape:koty
```

## Wyniki

Po zakończeniu w folderze `output/` znajdziesz:
- `products.json` - wszystkie produkty gotowe do importu
- `scrape-stats.json` - statystyki (ile produktów, kategorii, czas)
- `images/` - pobrane zdjęcia produktów

## Struktura produktu

```json
{
  "id": "1325145",
  "slug": "hills-science-plan-medium-adult",
  "name": "Hill's Science Plan Medium Adult z kurczakiem 14 kg",
  "sku": "1325145",
  "price": 251.78,
  "originalPrice": 228.89,
  "margin": 0.10,
  "currency": "PLN",
  "categories": ["pies", "karma-dla-psow", "karma-sucha"],
  "brand": "Hill's",
  "images": ["https://media.os.fressnapf.com/..."],
  "attributes": { "Waga": "14 kg", "Smak": "Kurczak" },
  "variants": [...],
  "shippingClass": "free",
  "description": "...",
  "shortDescription": ["...", "..."],
  "ingredients": "...",
  "feedingGuide": [...]
}
```

## Marża

Ceny są automatycznie powiększone o 10%:
`cena_końcowa = zaokrąglij_w_górę(cena_bazowa × 1.10, 2 miejsca)`
