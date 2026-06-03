/**
 * MaxiZoo.pl Scraper
 * Senior-grade scraper: pobiera kategorie, produkty, warianty, atrybuty,
 * zdjęcia, opcje wysyłki. Zapisuje wynik do ../shop/data/products.json
 *
 * Użycie:
 *   node scraper.js          — pełny scraping
 *   node scraper.js --test   — tylko 5 produktów testowo
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const slugify = require('slugify');
const pLimit = require('p-limit');
const { MultiBar, Presets } = require('cli-progress');

const BASE_URL = 'https://www.maxizoo.pl';
const OUTPUT_DIR = path.join(__dirname, '..', 'shop', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'shop', 'public', 'images', 'products');
const IS_TEST = process.argv.includes('--test');
const CONCURRENCY = 3;

// Delay helper
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Slug helper
const makeSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'pl' });

// ─── 1. Pobierz kategorie ────────────────────────────────────────────────────
async function scrapeCategories(page) {
  console.log('\n📂 Pobieranie kategorii...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(1500);

  const html = await page.content();
  const $ = cheerio.load(html);
  const categories = [];

  // Nawigacja główna — selector dostosuj do aktualnej struktury strony
  $('nav a[href*="/c/"], .main-navigation a[href*="/c/"], .nav-main a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const name = $(el).text().trim();
    if (!name || categories.find(c => c.href === href)) return;
    if (href.startsWith('/') || href.startsWith(BASE_URL)) {
      categories.push({
        id: makeSlug(name),
        name,
        slug: makeSlug(name),
        href: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        subcategories: [],
      });
    }
  });

  // Fallback — popularne kategorie zoologiczne
  if (categories.length === 0) {
    const fallback = [
      { name: 'Psy', path: '/c/psy' },
      { name: 'Koty', path: '/c/koty' },
      { name: 'Ptaki', path: '/c/ptaki' },
      { name: 'Gryzonie', path: '/c/gryzonie' },
      { name: 'Ryby', path: '/c/ryby-i-akwarium' },
      { name: 'Gady', path: '/c/gady-i-terrarium' },
    ];
    fallback.forEach(f => categories.push({
      id: makeSlug(f.name),
      name: f.name,
      slug: makeSlug(f.name),
      href: `${BASE_URL}${f.path}`,
      subcategories: [],
    }));
  }

  console.log(`  ✅ Znaleziono ${categories.length} kategorii`);
  return categories;
}

// ─── 2. Pobierz URLe produktów z kategorii ──────────────────────────────────
async function scrapeProductUrls(page, categoryUrl, maxProducts = Infinity) {
  const urls = new Set();
  let pageNum = 1;

  while (true) {
    const url = pageNum === 1 ? categoryUrl : `${categoryUrl}?page=${pageNum}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1000);
    } catch {
      break;
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    const prevSize = urls.size;
    // Różne selektory — strona może mieć różną strukturę
    $('a[href*="/p/"], .product-tile a, .product-item a, article.product a').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('/p/') || href.match(/\/[a-z0-9-]+-\d+$/)) {
        const full = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        urls.add(full);
      }
    });

    if (urls.size === prevSize || urls.size >= maxProducts) break;
    pageNum++;
    if (pageNum > 50) break; // zabezpieczenie
  }

  return [...urls].slice(0, maxProducts);
}

// ─── 3. Scrape pojedynczy produkt ───────────────────────────────────────────
async function scrapeProduct(page, url, categoryName) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(800);
  } catch {
    return null;
  }

  const html = await page.content();
  const $ = cheerio.load(html);

  // ── Podstawowe dane ──
  const name =
    $('h1.product-name, h1[itemprop="name"], h1').first().text().trim() ||
    $('title').text().split('|')[0].trim();

  const priceRaw =
    $('[itemprop="price"]').attr('content') ||
    $('.price-final, .product-price, [class*="price"]').first().text().replace(/[^0-9,.]/g, '').replace(',', '.');
  const price = parseFloat(priceRaw) || 0;

  const originalPriceRaw = $('.price-old, .price-before, [class*="original"]').first()
    .text().replace(/[^0-9,.]/g, '').replace(',', '.');
  const originalPrice = parseFloat(originalPriceRaw) || null;

  const brand =
    $('[itemprop="brand"]').text().trim() ||
    $('.product-brand, .brand-name').first().text().trim() || '';

  const sku =
    $('[itemprop="sku"]').text().trim() ||
    $('.product-sku, [class*="sku"]').first().text().trim() ||
    url.split('/').pop().split('?')[0];

  // ── Opis ──
  const description =
    $('[itemprop="description"], .product-description, .description-text').first().html() ||
    $('.product-details').first().html() || '';

  // ── Zdjęcia ──
  const images = [];
  $('img[src*="/product/"], img[src*="produkty"], .product-image img, [class*="gallery"] img, [class*="slider"] img').each((_, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy') || '';
    if (!src) return;
    if (!src.startsWith('http')) src = `${BASE_URL}${src}`;
    // Zamień na największą wersję
    src = src.replace(/_\d+x\d+\./, '_800x800.').replace(/\?.*$/, '');
    if (!images.includes(src)) images.push(src);
  });

  // ── Atrybuty / specyfikacja ──
  const attributes = {};
  $('.product-attributes tr, .product-specs tr, table.attributes tr').each((_, row) => {
    const cells = $(row).find('td, th');
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim();
      const val = $(cells[1]).text().trim();
      if (key) attributes[key] = val;
    }
  });
  // DL/DT/DD format
  $('dl.attributes, dl.specs').each((_, dl) => {
    $(dl).find('dt').each((i, dt) => {
      const dd = $(dl).find('dd').eq(i);
      attributes[$(dt).text().trim()] = dd.text().trim();
    });
  });

  // ── Warianty (rozmiary, smaki, itp.) ──
  const variants = [];
  // Select/options
  $('select[name*="variant"], select[name*="size"], select[id*="variant"]').each((_, select) => {
    const variantName = $(select).attr('name') || $(select).attr('id') || 'variant';
    $(select).find('option').each((_, opt) => {
      const text = $(opt).text().trim();
      const val = $(opt).attr('value') || '';
      const price = $(opt).attr('data-price') || '';
      if (text && val && val !== '' && val !== '0') {
        variants.push({ group: variantName, label: text, value: val, price: parseFloat(price) || null });
      }
    });
  });
  // Button variants
  $('.variant-button, [class*="variant"] button, .size-selector button').each((_, btn) => {
    const text = $(btn).text().trim();
    const val = $(btn).attr('data-value') || $(btn).attr('value') || text;
    if (text) variants.push({ group: 'variant', label: text, value: val, price: null });
  });

  // ── Dostępność ──
  const availability =
    $('[itemprop="availability"]').attr('href')?.includes('InStock') ||
    $('.in-stock, .product-available, [class*="in-stock"]').length > 0
      ? 'in_stock'
      : 'out_of_stock';

  // ── Opcje wysyłki ──
  const shippingOptions = [];
  $('.shipping-method, .delivery-option, [class*="shipping"] li, [class*="delivery"] li').each((_, el) => {
    const name = $(el).find('[class*="name"], span').first().text().trim();
    const priceText = $(el).find('[class*="price"]').text().trim();
    const timeText = $(el).find('[class*="time"], [class*="days"]').text().trim();
    if (name) {
      shippingOptions.push({
        name,
        price: parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
        deliveryTime: timeText || '',
      });
    }
  });
  // Domyślna opcja jeśli brak
  if (shippingOptions.length === 0) {
    shippingOptions.push(
      { name: 'Kurier DPD', price: 12.99, deliveryTime: '1-2 dni robocze' },
      { name: 'Paczkomat InPost', price: 9.99, deliveryTime: '1-2 dni robocze' },
      { name: 'Dostawa do sklepu', price: 0, deliveryTime: '2-3 dni robocze' }
    );
  }

  // ── Breadcrumbs / kategoria ──
  const breadcrumbs = [];
  $('[itemprop="breadcrumb"] li, .breadcrumb li, nav[aria-label="breadcrumb"] li').each((_, li) => {
    const text = $(li).text().trim().replace(/›|»|>/g, '').trim();
    if (text) breadcrumbs.push(text);
  });

  // ── Rating ──
  const ratingRaw = $('[itemprop="ratingValue"]').attr('content') || $('[class*="rating-value"]').text().trim();
  const rating = parseFloat(ratingRaw) || null;
  const reviewCount = parseInt($('[itemprop="reviewCount"]').attr('content') || '0') || 0;

  const slug = makeSlug(name) + '-' + sku.slice(-6);

  return {
    id: sku,
    slug,
    name,
    brand,
    sku,
    price,
    originalPrice,
    discount: originalPrice ? Math.round((1 - price / originalPrice) * 100) : null,
    category: categoryName,
    breadcrumbs,
    description,
    images: images.slice(0, 8),
    attributes,
    variants,
    availability,
    shippingOptions,
    rating,
    reviewCount,
    sourceUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}

// ─── 4. Pobieranie zdjęć ─────────────────────────────────────────────────────
async function downloadImages(products) {
  await fs.ensureDir(IMAGES_DIR);
  const limit = pLimit(4);
  let downloaded = 0;
  let skipped = 0;

  const tasks = [];
  for (const product of products) {
    product.localImages = [];
    for (let i = 0; i < product.images.length; i++) {
      const imgUrl = product.images[i];
      const ext = imgUrl.split('.').pop().split('?')[0] || 'jpg';
      const filename = `${product.slug}-${i}.${ext}`;
      const filepath = path.join(IMAGES_DIR, filename);
      product.localImages.push(`/images/products/${filename}`);

      tasks.push(limit(async () => {
        if (await fs.pathExists(filepath)) { skipped++; return; }
        try {
          const res = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MaxiZooShopBot/1.0)' }
          });
          await fs.writeFile(filepath, res.data);
          downloaded++;
        } catch {
          product.localImages[i] = imgUrl; // fallback do oryginału
        }
      }));
    }
  }

  await Promise.all(tasks);
  console.log(`  ✅ Zdjęcia: ${downloaded} pobrano, ${skipped} pominięto (istniały)`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  MaxiZoo.pl Scraper — Senior Dev Edition');
  console.log(`  Tryb: ${IS_TEST ? 'TEST (max 5 produktów/kategorię)' : 'PEŁNY'}`);
  console.log('═══════════════════════════════════════════════');

  await fs.ensureDir(OUTPUT_DIR);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  // Blokuj reklamy/trackers
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (['font', 'media'].includes(type)) req.abort();
    else req.continue();
  });

  let allProducts = [];

  try {
    const categories = await scrapeCategories(page);

    for (const category of categories) {
      console.log(`\n🐾 Kategoria: ${category.name}`);
      const maxPerCat = IS_TEST ? 5 : 200;
      const productUrls = await scrapeProductUrls(page, category.href, maxPerCat);
      console.log(`  🔗 URL produktów: ${productUrls.length}`);

      const limit = pLimit(1); // sekwencyjnie aby nie przeciążać serwera
      const results = await Promise.all(
        productUrls.map(url => limit(async () => {
          const p = await scrapeProduct(page, url, category.name);
          if (p) {
            process.stdout.write('.');
            allProducts.push(p);
          }
          await delay(500 + Math.random() * 500);
          return p;
        }))
      );
      console.log(`\n  ✅ Pobrano ${results.filter(Boolean).length} produktów`);
    }

    console.log(`\n📥 Pobieranie zdjęć (${allProducts.reduce((a, p) => a + p.images.length, 0)} szt.)...`);
    await downloadImages(allProducts);

    // Zapis JSON
    const outputPath = path.join(OUTPUT_DIR, 'products.json');
    await fs.writeJson(outputPath, {
      scrapedAt: new Date().toISOString(),
      totalProducts: allProducts.length,
      products: allProducts,
    }, { spaces: 2 });

    // Zapis kategorii
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))].map(name => ({
      id: makeSlug(name),
      name,
      slug: makeSlug(name),
      count: allProducts.filter(p => p.category === name).length,
    }));
    await fs.writeJson(path.join(OUTPUT_DIR, 'categories.json'), uniqueCategories, { spaces: 2 });

    console.log('\n═══════════════════════════════════════════════');
    console.log(`✅ Gotowe! Scraped ${allProducts.length} produktów`);
    console.log(`📄 Zapis: ${outputPath}`);
    console.log('═══════════════════════════════════════════════');

  } finally {
    await browser.close();
  }
})();
