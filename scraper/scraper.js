/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  MaxiZoo.pl Scraper v3  —  Kompletny                             ║
 * ║  • Wszystkie kategorie + podkategorie (rekurencyjnie)            ║
 * ║  • Pełne opisy, wszystkie zdjęcia, atrybuty, warianty            ║
 * ║  • Klasy wysyłki (wagowe)                                        ║
 * ║  • Automatyczna marża +10% na każdym produkcie                   ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 *
 * Uruchomienie:
 *   node scraper.js              — pełny scraping
 *   node scraper.js --test       — 5 produktów / kategorię (demo)
 *   node scraper.js --cat pies   — tylko jedna gałąź kategorii
 */

'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs-extra');
const path    = require('path');
const pLimit  = require('p-limit');

// ─── Konfiguracja ────────────────────────────────────────────────────
const BASE         = 'https://www.maxizoo.pl';
const MARGIN       = 0.10;                    // +10% marża
const IS_TEST      = process.argv.includes('--test');
const CAT_FILTER   = (() => { const i = process.argv.indexOf('--cat'); return i > -1 ? process.argv[i+1] : null; })();
const MAX_PER_CAT  = IS_TEST ? 5 : Infinity;
const REQ_DELAY    = () => new Promise(r => setTimeout(r, 800 + Math.random() * 700));

const OUT_DIR    = path.join(__dirname, '..', 'shop', 'data');
const IMG_DIR    = path.join(__dirname, '..', 'shop', 'public', 'images', 'products');

// ─── Klasy wysyłki (wagowe) ──────────────────────────────────────────
const SHIPPING_CLASSES = [
  {
    id:        'free',
    name:      'Darmowa wysyłka',
    condition: 'Zamówienie od 149 zł',
    methods: [
      { carrier: 'InPost Kurier',   price: 0,     time: '1-2 dni robocze' },
      { carrier: 'InPost Paczkomat', price: 0,    time: '1-2 dni robocze' },
    ],
  },
  {
    id:        'standard',
    name:      'Wysyłka standardowa',
    condition: 'Zamówienie poniżej 149 zł',
    methods: [
      { carrier: 'InPost Kurier',    price: 12.99, time: '1-2 dni robocze' },
      { carrier: 'InPost Paczkomat', price: 9.99,  time: '1-2 dni robocze' },
      { carrier: 'DHL Kurier',       price: 14.99, time: '1-2 dni robocze' },
      { carrier: 'Płatność przy odbiorze (DHL)', price: 18.99, time: '2-3 dni robocze' },
    ],
  },
  {
    id:        'heavy',
    name:      'Wysyłka ponadgabarytowa',
    condition: 'Zamówienie powyżej 31 kg',
    surcharge: 15.00,
    methods: [
      { carrier: 'InPost Kurier (2 paczki)', price: 27.98, time: '1-2 dni robocze' },
      { carrier: 'DHL Kurier (2 paczki)',    price: 29.98, time: '2-3 dni robocze' },
    ],
  },
  {
    id:        'click_collect',
    name:      'Odbiór w sklepie (Click & Collect)',
    condition: 'Zawsze dostępne',
    methods: [
      { carrier: 'Odbiór osobisty w sklepie Maxi Zoo', price: 0, time: 'Tego samego dnia' },
    ],
  },
];

// ─── HTTP klient ──────────────────────────────────────────────────────
const http = axios.create({
  baseURL: BASE,
  timeout: 25000,
  headers: {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control':   'no-cache',
    'Connection':      'keep-alive',
  },
});

const getHtml = async (url) => {
  try {
    const res = await http.get(url);
    return cheerio.load(res.data);
  } catch (e) {
    if (e.response?.status === 404) return null;
    if (e.response?.status === 429) { // rate limit
      await new Promise(r => setTimeout(r, 5000));
      return getHtml(url);
    }
    return null;
  }
};

// ─── 1. Odkryj wszystkie kategorie i podkategorie ─────────────────────
async function discoverAllCategories() {
  console.log('🗂️  Odkrywanie kategorii i podkategorii...');
  const $ = await getHtml('/');
  if (!$) return [];

  const categories = [];
  const seen = new Set();

  // Zbierz wszystkie linki /c/... z nawigacji
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (!href.match(/^\/c\/[a-z0-9-/]+\/?$/)) return;
    if (href === '/c/' || text.length < 2 || text.length > 80) return;
    if (seen.has(href)) return;
    seen.add(href);

    const parts = href.replace(/^\/c\//, '').replace(/\/$/, '').split('/');
    const depth  = parts.length;
    const parent = depth > 1 ? '/c/' + parts.slice(0, -1).join('/') + '/' : null;

    categories.push({
      id:     href.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g,''),
      name:   text,
      slug:   parts[parts.length - 1],
      path:   href,
      url:    BASE + href,
      depth,
      parent,
    });
  });

  // Fallback: główne kategorie jeśli nawigacja nie oddała subcats
  const mainCats = [
    { name: 'Pies',           path: '/c/pies/' },
    { name: 'Kot',            path: '/c/kot/' },
    { name: 'Małe zwierzęta', path: '/c/male-zwierzeta/' },
    { name: 'Ptaki',          path: '/c/ptaki/' },
    { name: 'Akwarystyka',    path: '/c/akwarystyka/' },
    { name: 'Terrarystyka',   path: '/c/terrarystyka/' },
    { name: 'Ogród i staw',   path: '/c/ogrod-i-staw/' },
    { name: 'VET',            path: '/c/diety-vet/' },
  ];

  for (const mc of mainCats) {
    if (!seen.has(mc.path)) {
      categories.push({ id: mc.path.replace(/[^a-z0-9-]/g,'-'), name: mc.name,
        slug: mc.path.split('/').filter(Boolean).pop(), path: mc.path,
        url: BASE + mc.path, depth: 1, parent: null });
      seen.add(mc.path);
    }

    // Pobierz podkategorie z każdej kategorii głównej
    const $cat = await getHtml(mc.path);
    if ($cat) {
      $cat('a[href]').each((_, el) => {
        const href = $cat(el).attr('href') || '';
        const text = $cat(el).text().trim();
        if (!href.match(/^\/c\/[a-z0-9-/]+\/?$/) || seen.has(href)) return;
        if (text.length < 2 || text.length > 80) return;
        seen.add(href);
        const parts = href.replace(/^\/c\//, '').replace(/\/$/, '').split('/');
        categories.push({
          id: href.replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,''),
          name: text, slug: parts[parts.length-1],
          path: href, url: BASE+href,
          depth: parts.length,
          parent: parts.length > 1 ? '/c/'+parts.slice(0,-1).join('/')+'/': null,
        });
      });
      await REQ_DELAY();
    }
  }

  // Filtruj duplikaty i sortuj: najpierw najgłębsze (liściowe)
  const unique = [...new Map(categories.map(c => [c.path, c])).values()]
    .sort((a, b) => b.depth - a.depth);

  console.log(`  ✅ Odkryto ${unique.length} kategorii/podkategorii\n`);
  return unique;
}

// ─── 2. Pobierz URLe produktów z kategorii ────────────────────────────
async function getProductUrls(catPath, max) {
  const urls = new Set();
  let page = 1;

  while (urls.size < max) {
    const url = page === 1 ? catPath : `${catPath}?page=${page}`;
    const $ = await getHtml(url);
    if (!$) break;

    const before = urls.size;
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.match(/\/p\/[a-z0-9%-]+-\d{6,}\/?/)) {
        const full = (href.startsWith('http') ? href : BASE + href)
          .split('?')[0].replace(/([^/])$/, '$1/');
        urls.add(full);
      }
    });

    if (urls.size === before) break;
    if (urls.size >= max) break;
    page++;
    await REQ_DELAY();
    if (page > 200) break;
  }

  return [...urls].slice(0, max);
}

// ─── 3. Pobierz szczegóły produktu ────────────────────────────────────
async function scrapeProduct(url, categoryName, categoryPath) {
  const $ = await getHtml(url);
  if (!$) return null;

  // ── Nazwa ──
  const name = $('h1').first().text().trim();
  if (!name || name.length < 3) return null;

  // ── SKU ──
  const sku = url.match(/-(\d{5,})\/?$/)?.[1] ||
    $('*').filter((_, el) => /Nr art\./i.test($(el).text())).first()
      .text().match(/Nr art\.\:\s*(\d+)/i)?.[1] || Date.now().toString();

  // ── Marka ──
  const brand = $('a[href*="/c/marki/"]').first().text()
    .replace(/sucha karma|mokra karma|karma|zabawki|akcesoria/gi, '').trim();

  // ── Cena bazowa ──
  let rawPrice = 0;
  // Szukamy pierwszego "X,XX zł" w contencie produktu (nie nawigacja)
  const pricePatterns = $('*').toArray();
  for (const el of pricePatterns) {
    const t = $(el).clone().children().remove().end().text().trim();
    if (/^\d{1,4}[,.]\d{2}\s*zł$/.test(t)) {
      rawPrice = parseFloat(t.replace(/[^\d,]/g,'').replace(',','.'));
      break;
    }
  }
  // Fallback — regex po całym HTML
  if (!rawPrice) {
    const match = $.html().match(/"price"\s*:\s*"?(\d+[.,]\d+)"?/);
    if (match) rawPrice = parseFloat(match[1].replace(',','.'));
  }

  // ── Marża +10% ──
  const basePrice  = rawPrice;
  const finalPrice = rawPrice > 0 ? Math.ceil(rawPrice * (1 + MARGIN) * 100) / 100 : 0;

  // ── Cena jednostkowa (per kg itp.) ──
  const unitPriceMatch = $.html().match(/\((\d+[.,]\d+)\s*zł\/\w+\)/);
  const unitPrice = unitPriceMatch
    ? Math.ceil(parseFloat(unitPriceMatch[1].replace(',','.')) * (1 + MARGIN) * 100) / 100
    : null;

  // ── Zdjęcia — z CDN fressnapf ──
  const images = [];
  const imgSeen = new Set();
  // Thumbnails i główne zdjęcia
  $('a[href*="fressnapf.com/products"], img[src*="fressnapf.com/products"]').each((_, el) => {
    const src = $(el).attr('href') || $(el).attr('src') || '';
    if (src && !imgSeen.has(src)) { imgSeen.add(src); images.push(src); }
  });
  // Data-src (lazy)
  $('[data-src*="fressnapf.com"]').each((_, el) => {
    const src = $(el).attr('data-src') || '';
    if (src && !imgSeen.has(src)) { imgSeen.add(src); images.push(src); }
  });
  // Szukaj w atrybucie srcset
  $('img[srcset*="fressnapf.com"]').each((_, el) => {
    const srcset = $(el).attr('srcset') || '';
    srcset.split(',').forEach(part => {
      const s = part.trim().split(' ')[0];
      if (s.includes('fressnapf.com') && !imgSeen.has(s)) { imgSeen.add(s); images.push(s); }
    });
  });
  // Szukaj w JSON-LD lub script tags
  $('script').each((_, el) => {
    const content = $(el).html() || '';
    const matches = content.matchAll(/https:\/\/media\.os\.fressnapf\.com\/products[^"'\s,)]+/g);
    for (const m of matches) {
      if (!imgSeen.has(m[0])) { imgSeen.add(m[0]); images.push(m[0]); }
    }
  });

  // ── Opis krótki (bullet points) ──
  const shortDesc = [];
  $('h1').first().nextAll('ul').first().find('li').each((_, li) => {
    const t = $(li).text().trim();
    if (t) shortDesc.push(t);
  });
  // Fallback
  if (shortDesc.length === 0) {
    $('ul li').each((_, li) => {
      const t = $(li).text().trim();
      if (t.length > 30 && t.length < 350 && !/nawigacja|koszyk|menu|Pies|Kot|Promocje|Poradnik/i.test(t)) {
        shortDesc.push(t);
      }
    });
  }

  // ── Opis długi ──
  let longDesc = '';
  // Szukaj sekcji "Informacje o produkcie"
  $('h2, h3').each((_, heading) => {
    const text = $(heading).text().trim();
    if (/informacje o produkcie|opis/i.test(text)) {
      let content = '';
      $(heading).nextAll('p, ul, div').slice(0, 5).each((_, el) => {
        const t = $(el).text().trim();
        if (t.length > 30 && !/newsletter|regulamin|polityka/i.test(t)) {
          content += t + '\n\n';
        }
      });
      if (content.length > 100) { longDesc = content.trim(); return false; }
    }
  });
  // Fallback: pierwsze długie paragrafy
  if (!longDesc) {
    $('p').each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > 100 && !/newsletter|polityka prywatności|koszty przesyłki|zapisz się/i.test(t)) {
        longDesc += t + '\n\n';
        if (longDesc.length > 1000) return false;
      }
    });
    longDesc = longDesc.trim();
  }

  // ── Składniki analityczne ──
  let ingredients = '';
  $('h2, h3, strong').each((_, el) => {
    const t = $(el).text().trim();
    if (/składniki analityczne|skład:/i.test(t)) {
      ingredients = $(el).nextAll().first().text().trim().slice(0, 800) ||
        $(el).parent().text().replace(t, '').trim().slice(0, 800);
      return false;
    }
  });
  // Fallback z tekstu strony
  if (!ingredients) {
    const bodyText = $('body').text();
    const m = bodyText.match(/Składniki analityczne[:\s]*([\s\S]{50,500}?)(?:Skład:|##|Zalecenia)/);
    if (m) ingredients = m[1].trim();
  }

  // ── Tabele atrybutów ──
  const attributes = {};

  // Tabela składu / zaleceń karmienia
  $('table').each((_, table) => {
    const caption = $(table).find('caption').text().trim() ||
      $(table).prev('h2, h3, strong').text().trim();

    $(table).find('tr').each((_, row) => {
      const cells = $(row).find('td, th');
      if (cells.length >= 2) {
        const key = $(cells[0]).text().trim().replace(/\*\*/g, '');
        const val = $(cells[1]).text().trim();
        if (key && val && key.length < 100 && val.length < 300) {
          attributes[key] = val;
        }
      }
    });
  });

  // DL/DT format (specyfikacja techniczna)
  $('dl').each((_, dl) => {
    $(dl).find('dt').each((i, dt) => {
      const dd = $(dl).find('dd').eq(i);
      const key = $(dt).text().trim();
      const val = dd.text().trim();
      if (key && val) attributes[key] = val;
    });
  });

  // Podmiot wprowadzający
  const supplierMatch = $('table').text().match(/Podmiot wprowadzający[^|]+?\|\s*(.+?)(?:\n|\|)/);
  if (supplierMatch) attributes['Podmiot wprowadzający'] = supplierMatch[1].trim();

  // Nr artykułu
  attributes['Nr artykułu'] = sku;

  // ── Warianty ──
  const variants = [];
  const variantSeen = new Set();

  // Smaki/rozmiary jako linki produktowe
  $('a[href*="/p/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (!href.match(/\/p\/[a-z0-9%-]+-\d{5,}/) || text.length > 100 || text.length < 2) return;

    const varUrl = (href.startsWith('http') ? href : BASE + href)
      .split('?')[0].replace(/([^/])$/, '$1/');
    if (variantSeen.has(varUrl)) return;
    variantSeen.add(varUrl);

    // Wyciągnij cenę wariantu
    const priceM = text.match(/(\d+[,.]\d+)\s*zł/);
    const sizeM  = text.match(/(\d+(?:[,x]\d+)?\s*(?:kg|g|ml|l|szt\.?|pack|tab))/i);
    const flavorM = text.match(/^([A-ZŁŚŹ][a-złśźćęóąń\s]+)(?:\s+\d)/);

    const varBasePrice = priceM ? parseFloat(priceM[1].replace(',','.')) : null;
    const varFinalPrice = varBasePrice ? Math.ceil(varBasePrice * (1 + MARGIN) * 100) / 100 : null;

    variants.push({
      label:      text.replace(/\s+/g, ' ').slice(0, 80),
      url:        varUrl,
      size:       sizeM?.[1]  || null,
      flavor:     flavorM?.[1]?.trim() || null,
      basePrice:  varBasePrice,
      finalPrice: varFinalPrice,
      isCurrentVariant: varUrl === url.split('?')[0].replace(/([^/])$/, '$1/'),
    });
  });

  // ── Zalecenia karmienia (tabela) ──
  const feedingGuide = [];
  $('table').each((_, table) => {
    const header = $(table).prev('h2, h3, strong').text();
    if (/zalecenia|karmien|dawkow/i.test(header)) {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          feedingGuide.push({
            weight: $(cells[0]).text().trim(),
            amount: $(cells[1]).text().trim(),
          });
        }
      });
    }
  });

  // ── Dostępność ──
  const bodyText = $('body').text();
  const availability = /Do koszyka|Dodaj do koszyka|W ciągu \d/i.test(bodyText)
    ? 'in_stock' : 'out_of_stock';

  // Czas dostawy
  const deliveryMatch = bodyText.match(/W ciągu\s+(\d+\s*[-–]\s*\d+\s*dni[a-z\s]*)/i);
  const deliveryTime = deliveryMatch?.[1]?.trim() || '1-3 dni robocze';

  // ── Breadcrumbs ──
  const breadcrumbs = [];
  const bcSeen = new Set();
  $('a[href*="/c/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (href.startsWith('/c/') && text.length > 1 && text.length < 60 && !bcSeen.has(href)) {
      bcSeen.add(href);
      breadcrumbs.push({ name: text, url: BASE + href });
    }
  });
  breadcrumbs.push({ name, url });

  // ── Klasa wysyłki na podstawie wagi produktu ──
  const weightAttr = attributes['Waga'] || attributes['Waga produktu'] || attributes['Masa'] || '';
  const weightKg = parseFloat(weightAttr.replace(',','.')) || 0;
  let shippingClass = 'standard';
  if (weightKg >= 25)      shippingClass = 'heavy';
  else if (finalPrice >= 149) shippingClass = 'free';

  // Slug z URL
  const slug = url.replace(BASE + '/p/', '').replace(/\/$/, '');

  return {
    // ── Identyfikacja ──
    id:           sku,
    slug,
    sku,
    name,
    brand:        brand || 'Maxi Zoo',
    category:     categoryName,
    categoryPath,
    breadcrumbs,

    // ── Ceny (z marżą) ──
    pricing: {
      basePrice,              // cena oryginalna z maxizoo.pl
      margin:    MARGIN,      // 0.10 = 10%
      finalPrice,             // cena w Twoim sklepie (+10%)
      unitPrice,              // cena/kg lub /l (z marżą)
      currency:  'PLN',
    },

    // ── Treść ──
    description:     shortDesc.join('\n'),
    longDescription: longDesc,
    ingredients,
    feedingGuide,

    // ── Media ──
    images:      images.slice(0, 12),
    localImages: [],

    // ── Dane techniczne ──
    attributes,
    variants: variants.slice(0, 20),

    // ── Dostępność i wysyłka ──
    availability,
    deliveryTime,
    shippingClass,
    shippingOptions: SHIPPING_CLASSES,

    // ── Meta ──
    sourceUrl:  url,
    scrapedAt:  new Date().toISOString(),
  };
}

// ─── 4. Pobierz zdjęcia ──────────────────────────────────────────────
async function downloadImages(products) {
  await fs.ensureDir(IMG_DIR);
  const limit = pLimit(4);
  let ok = 0, skip = 0, fail = 0;

  const tasks = products.flatMap(p =>
    p.images.map((imgUrl, i) => limit(async () => {
      const cleanUrl = imgUrl.split('?')[0];
      const ext = cleanUrl.split('.').pop().toLowerCase().replace(/[^a-z]/g,'') || 'jpg';
      const fname = `${p.slug.replace(/[^a-z0-9-]/g,'').slice(-45)}-${i}.${ext}`;
      const fpath = path.join(IMG_DIR, fname);
      p.localImages[i] = `/images/products/${fname}`;

      if (await fs.pathExists(fpath)) { skip++; return; }
      try {
        const res = await axios.get(cleanUrl, {
          responseType: 'arraybuffer', timeout: 20000,
          headers: { Referer: BASE + '/', 'User-Agent': 'Mozilla/5.0' },
        });
        await fs.writeFile(fpath, res.data);
        ok++;
      } catch {
        p.localImages[i] = imgUrl; // fallback do oryginalnego URL
        fail++;
      }
    }))
  );

  await Promise.all(tasks);
  console.log(`  📸 Zdjęcia: ✅ ${ok} pobrano  ⏩ ${skip} pominięto  ❌ ${fail} błędów`);
}

// ─── MAIN ────────────────────────────────────────────────────────────
(async () => {
  const startTime = Date.now();
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  MaxiZoo.pl Scraper v3  —  Senior Dev Edition        ║');
  console.log(`║  Marża: +${(MARGIN*100).toFixed(0)}%  |  Tryb: ${IS_TEST ? 'TEST (5 prod/kat)    ' : 'PEŁNY               '}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await fs.ensureDir(OUT_DIR);
  await fs.ensureDir(IMG_DIR);

  // 1. Odkryj kategorie
  const allCategories = await discoverAllCategories();
  const categories = CAT_FILTER
    ? allCategories.filter(c => c.path.includes(CAT_FILTER) || c.name.toLowerCase().includes(CAT_FILTER.toLowerCase()))
    : allCategories;

  await fs.writeJson(path.join(OUT_DIR, 'categories.json'), allCategories, { spaces: 2 });
  console.log(`📁 Zapisano ${allCategories.length} kategorii → categories.json\n`);

  // 2. Scrape produktów
  const allProducts = [];
  const seenProductUrls = new Set();
  const limit = pLimit(1);

  for (const cat of categories) {
    const maxProd = IS_TEST ? 5 : Infinity;
    process.stdout.write(`🐾 [${cat.depth === 1 ? '●' : cat.depth === 2 ? '○' : '·'}] ${cat.name.padEnd(40)} `);

    let urls;
    try { urls = await getProductUrls(cat.path, maxProd); }
    catch { console.log('BŁĄD'); continue; }

    // Tylko nowe URLe (unikamy duplikatów z nakładających się kategorii)
    const newUrls = urls.filter(u => !seenProductUrls.has(u));
    newUrls.forEach(u => seenProductUrls.add(u));
    console.log(`→ ${newUrls.length} prod.`);

    const catProducts = [];
    const tasks = newUrls.map(url => limit(async () => {
      try {
        const p = await scrapeProduct(url, cat.name, cat.path);
        if (p) { allProducts.push(p); catProducts.push(p); }
      } catch { /* silent */ }
      await REQ_DELAY();
    }));
    await Promise.all(tasks);

    // Zapis częściowy co 50 produktów
    if (allProducts.length % 50 === 0 && allProducts.length > 0) {
      await saveProducts(allProducts);
      process.stdout.write(`  💾 Autosave: ${allProducts.length} produktów\n`);
    }
  }

  // 3. Pobierz zdjęcia
  const totalImages = allProducts.reduce((a, p) => a + p.images.length, 0);
  console.log(`\n📥 Pobieranie ${totalImages} zdjęć (${allProducts.length} produktów)...`);
  await downloadImages(allProducts);

  // 4. Zapis finalny
  await saveProducts(allProducts);
  await saveStats(allProducts, allCategories, startTime);

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ✅ GOTOWE!  ${String(allProducts.length).padEnd(6)} produktów  ⏱️  ${elapsed} min          ║`);
  console.log(`║  Marża +10%: ceny podniesione automatycznie          ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
})();

// ─── Zapis do pliku ───────────────────────────────────────────────────
async function saveProducts(products) {
  const outPath = path.join(OUT_DIR, 'products.json');
  await fs.writeJson(outPath, {
    source:        'maxizoo.pl',
    margin:        '10%',
    scrapedAt:     new Date().toISOString(),
    totalProducts: products.length,
    products,
  }, { spaces: 2 });
}

async function saveStats(products, categories, startTime) {
  const stats = {
    scrapedAt:      new Date().toISOString(),
    duration:       `${((Date.now()-startTime)/1000/60).toFixed(1)} min`,
    totalProducts:  products.length,
    totalCategories: categories.length,
    totalImages:    products.reduce((a,p) => a + p.images.length, 0),
    margin:         '10%',
    byCategory: categories.map(c => ({
      name:  c.name,
      path:  c.path,
      count: products.filter(p => p.categoryPath === c.path).length,
    })).filter(c => c.count > 0),
    priceRange: {
      min: Math.min(...products.map(p => p.pricing.finalPrice).filter(Boolean)),
      max: Math.max(...products.map(p => p.pricing.finalPrice).filter(Boolean)),
      avg: Math.round(products.reduce((a,p) => a + (p.pricing.finalPrice||0), 0) / products.length * 100) / 100,
    },
    brands: [...new Set(products.map(p => p.brand))].sort(),
    shippingClasses: SHIPPING_CLASSES.map(s => s.id),
  };
  await fs.writeJson(path.join(OUT_DIR, 'scrape-stats.json'), stats, { spaces: 2 });
  console.log('\n📊 Statystyki zapisane → scrape-stats.json');
}
