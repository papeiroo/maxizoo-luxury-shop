#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
#  MaxiZoo Luxury Shop — Skrypt instalacyjny
#  Uruchom: bash setup.sh
# ════════════════════════════════════════════════════════════
set -e

PURPLE='\033[0;35m'; GOLD='\033[0;33m'; GREEN='\033[0;32m'; RESET='\033[0m'
echo -e "${PURPLE}════════════════════════════════════════${RESET}"
echo -e "${GOLD}  MaxiZoo Luxury — Instalacja projektu${RESET}"
echo -e "${PURPLE}════════════════════════════════════════${RESET}\n"

# Sprawdź Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Brak Node.js. Zainstaluj z https://nodejs.org (wersja 18+)"
  exit 1
fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Wymagany Node.js 18+. Masz: $(node -v)"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${RESET}"

# ─── 1. Zainstaluj zależności scrapera ──────────────────────
echo -e "\n${PURPLE}[1/4] Instalacja scrapera...${RESET}"
cd scraper && npm install && cd ..
echo -e "${GREEN}✅ Scraper gotowy${RESET}"

# ─── 2. Zainstaluj zależności sklepu ────────────────────────
echo -e "\n${PURPLE}[2/4] Instalacja sklepu Next.js...${RESET}"
cd shop && npm install && cd ..
echo -e "${GREEN}✅ Sklep gotowy${RESET}"

# ─── 3. Konfiguracja .env ────────────────────────────────────
echo -e "\n${PURPLE}[3/4] Konfiguracja zmiennych środowiskowych...${RESET}"
if [ ! -f shop/.env.local ]; then
  cp shop/.env.example shop/.env.local
  echo ""
  echo -e "${GOLD}⚠️  Otwórz plik shop/.env.local i wklej klucze Stripe:${RESET}"
  echo "   STRIPE_SECRET_KEY=sk_test_..."
  echo "   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
  echo ""
  echo "   👉 Pobierz darmowe klucze testowe: https://dashboard.stripe.com"
else
  echo -e "${GREEN}✅ .env.local już istnieje${RESET}"
fi

# ─── 4. Scraping (opcjonalnie) ───────────────────────────────
echo -e "\n${PURPLE}[4/4] Scraping produktów...${RESET}"
echo -n "Czy chcesz teraz pobrać produkty z maxizoo.pl? [t/N]: "
read -r SCRAPE
if [[ "$SCRAPE" =~ ^[Tt]$ ]]; then
  echo "   Tryb: [p]ełny / [t]estowy (5 produktów/kat.) [t/P]: "
  read -r SCRAPE_MODE
  if [[ "$SCRAPE_MODE" =~ ^[Tt]$ ]]; then
    cd scraper && node scraper.js --test && cd ..
  else
    cd scraper && node scraper.js && cd ..
  fi
  echo -e "${GREEN}✅ Produkty pobrane${RESET}"
else
  echo "   Pominięto. Sklep będzie działał z przykładowymi produktami demo."
fi

echo ""
echo -e "${PURPLE}════════════════════════════════════════${RESET}"
echo -e "${GOLD}✨ Instalacja zakończona!${RESET}"
echo -e "${PURPLE}════════════════════════════════════════${RESET}"
echo ""
echo "  Uruchom sklep:"
echo "  cd shop && npm run dev"
echo ""
echo "  Otwórz w przeglądarce: http://localhost:3000"
echo ""
