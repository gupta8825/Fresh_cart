// ---------------------------------------------------------------------------
// FreshCart demo list-parser (frontend-only, deterministic — NOT an AI model).
// Parses Hindi / English / Hinglish grocery requests into structured items
// matched against the shared catalog. Anything it cannot understand is
// returned as a clarification request, never invented.
// A future backend AI provider can replace `parseGroceryRequest` behind the
// same return shape; see Frontend/docs/AI_ASSISTANT_BACKEND_PLAN.md.
// ---------------------------------------------------------------------------

import { PRODUCTS } from "../data/products.js";

const DEVA_DIGITS = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };

const NUMBER_WORDS = {
  ek: 1, do: 2, doh: 2, teen: 3, chaar: 4, char: 4, paanch: 5, panch: 5, chhah: 6, chah: 6,
  saat: 7, sath: 7, aath: 8, ath: 8, nau: 9, das: 10, one: 1, two: 2, three: 3,
  four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  dozen: 12, aadha: 0.5, adha: 0.5, adh: 0.5, half: 0.5,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "छै": 6,
  "सात": 7, "आठ": 8, "नौ": 9, "दस": 10, "आधा": 0.5,
};

// Unicode-aware word boundaries (\b is ASCII-only and breaks Devanagari).
const NW = "[^a-zA-Z\\u0900-\\u097F]";
const wordRe = (word) => new RegExp(`(?:^|${NW})${word}(?!${NW.replace("[^", "[")})`);

const UNIT_SYNONYMS = [
  ["kgs?", "kilo", "kilos?", "kilograms?", "किलो", "kg"],
  ["gms?", "grams?", "gram", "ग्राम", "g"],
  ["litres?", "liters?", "लीटर", "L"],
  ["millilitres?", "milliliters?", "ml", "मिलीलीटर", "ml2"],
  ["packets?", "packs?", "pkts?", "पैकेट", "पैक", "packet"],
  ["pieces?", "pcs?", "peices?", "नग", "पीस", "pcs2"],
  ["bottles?", "बोतल", "bottle"],
  ["jars?", "डिब्बा", "डिब्बे", "jar"],
];

// Category-level Hindi/English keyword synonyms. Product-level keywords are
// derived from each product's own name tokens automatically.
const CATEGORY_KEYWORDS = {
  atta: ["atta", "aata", "आटा", "flour", "gehu", "गेहूं", "rava", "sooji", "maida"],
  rice: ["rice", "chawal", "chaval", "चावल", "basmati", "biryani rice"],
  dal: ["dal", "दाल", "toor", "moong", "masoor", "urad", "chana dal", "rajma", "chole", "pulses"],
  oil: ["tel", "तेल", "oil", "mustard", "sarson", "सरसों", "sunflower", "groundnut", "ghee"],
  spices: ["masala", "मसाला", "haldi", "हल्दी", "turmeric", "mirch", "मिर्च", "chilli", "dhania", "धनिया", "coriander", "jeera", "जीरा", "cumin", "garam", "elaichi", "laung", "spice"],
  "salt-sugar": ["namak", "नमक", "salt", "cheeni", "chini", "चीनी", "sugar", "gud", "jaggery", "shakkar"],
  biscuits: ["biscuit", "बिस्कुट", "parle", "marie", "glucose", "cookies", "rusk"],
  namkeen: ["namkeen", "नमकीन", "chips", "bhujia", "mixture", "peanuts", "snacks"],
  noodles: ["noodles", "नूडल्स", "maggi", "pasta", "vermicelli", "sevai"],
  beverages: ["chai", "चाय", "tea", "coffee", "कॉफी", "juice", "sharbat", "drinks"],
  packaged: ["poha", "upma", "oats", "ready", "mix", "instant"],
  dryfruits: ["badam", "बादाम", "almond", "kaju", "काजू", "cashew", "kishmish", "raisin", "dry fruit"],
  sauces: ["ketchup", "sauce", "achaar", "अचार", "pickle", "chutney", "jam"],
  cleaning: ["surf", "detergent", "soap", "साबुन", "vim", "cleaner", "phenyl", "broom", "cleaning"],
  personal: ["shampoo", "toothpaste", "paste", "brush", "soap", "tel", "oil"],
  pooja: ["pooja", "पूजा", "agarbatti", "अगरबत्ती", "diya", "camphor", "kapoor", "wick"],
};

const MONTHLY_PATTERN = /mahine|maheene|month(ly)?|महीन|मासिक|rashion|ration/i;

const DEFAULT_MONTHLY_BASKET = [
  { productId: null, keywords: ["atta"], qty: 10, unit: "kg" },
  { productId: null, keywords: ["rice", "chawal"], qty: 5, unit: "kg" },
  { productId: null, keywords: ["toor", "dal"], qty: 2, unit: "kg" },
  { productId: null, keywords: ["mustard", "tel", "oil"], qty: 2, unit: "L" },
  { productId: null, keywords: ["namak", "salt"], qty: 1, unit: "kg" },
  { productId: null, keywords: ["cheeni", "sugar"], qty: 2, unit: "kg" },
  { productId: null, keywords: ["chai", "tea"], qty: 0.5, unit: "kg" },
];

export function normalizeInput(raw) {
  return String(raw || "")
    .replace(/[०-९]/g, (d) => DEVA_DIGITS[d])
    .toLowerCase()
    .replace(/[।!?.]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

// Product-specific Hindi/English synonyms (weighted higher than shared
// category keywords so "सरसों का तेल" picks mustard over sunflower oil).
const PRODUCT_KEYWORDS = {
  k11: ["sunflower", "surajmukhi", "सूरजमुखी"],
  k12: ["mustard", "sarson", "सरसों", "kachi ghani", "kachi-ghani"],
  k13: ["groundnut", "moongphali", "मूंगफली", "peanut oil"],
  k32: ["chai", "चाय", "assam", "ctc", "tea"],
  k33: ["coffee", "कॉफी", "filter coffee", "kaapi"],
  k34: ["juice", "mango drink", "frooti"],
  k14: ["haldi", "हल्दी"],
  k01: ["atta", "आटा", "gehu", "गेहूं"],
};

function productKeywords(p) {
  const nameTokens = String(p.name || "").toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);
  const catKeys = CATEGORY_KEYWORDS[p.category] || [];
  return [...new Set([...nameTokens, ...catKeys])];
}

export function matchProduct(text, catalog = PRODUCTS) {
  let best = null;
  let bestScore = 0;
  for (const p of catalog) {
    const keys = productKeywords(p);
    let score = 0;
    for (const k of keys) {
      if (k.length > 2 && text.includes(k)) score += k.length >= 5 ? 2 : 1;
    }
    // Product-specific synonyms count triple — they disambiguate siblings.
    for (const k of PRODUCT_KEYWORDS[p.id] || []) {
      if (k.length > 2 && text.includes(k)) score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore > 0 ? { product: best, score: bestScore } : { product: null, score: 0 };
}

const FILLER_WORDS = ["mujhe", "muje", "mujhko", "hamein", "humein", "mere", "liye", "chahiye", "chahie", "please", "kripya", "maan", "घर", "मुझे", "चाहिए", "ke liye", "ghar ke liye", "de do", "dedo"];

function splitChunks(normalized) {
  const parts = normalized.split(/,|;|\n| और | aur | and | plus | with | ke saath | chahiye| chahie | de do| dedo /);
  return parts
    .map((s) => {
      let out = ` ${s} `;
      for (const w of FILLER_WORDS) {
        out = out.replace(wordRe(w), " ");
      }
      return out.replace(/\s+/g, " ").trim();
    })
    .filter((s) => s.replace(/[^a-z0-9\u0900-\u097F]/g, "").length > 1);
}

function extractQtyUnit(chunk) {
  let qty = null;
  let unit = null;
  let rest = chunk.trim();
  const numMatch = rest.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    qty = parseFloat(numMatch[1]);
    rest = rest.replace(numMatch[0], " ");
  } else {
    for (const [word, val] of Object.entries(NUMBER_WORDS)) {
      const re = wordRe(word);
      if (re.test(` ${rest} `)) {
        qty = val;
        rest = ` ${rest} `.replace(re, " ");
        break;
      }
    }
  }
  for (const entry of UNIT_SYNONYMS) {
    const norm = entry[entry.length - 1];
    let hit = null;
    for (const syn of entry.slice(0, -1)) {
      const re = wordRe(syn);
      if (re.test(` ${rest} `)) { hit = re; break; }
    }
    if (hit) {
      unit = norm === "ml2" ? "ml" : norm === "pcs2" ? "pcs" : norm;
      rest = ` ${rest} `.replace(hit, " ");
      break;
    }
  }
  return { qty, unit, rest: rest.replace(/\s+/g, " ").trim() };
}

// Main entry: deterministic parse. Never invents products, prices or stock.
export function parseGroceryRequest(rawText, catalog = PRODUCTS) {
  const normalized = normalizeInput(rawText);
  const clarifications = [];
  if (!normalized) {
    return { items: [], clarifications: ["empty"], isEstimate: false, normalized };
  }
  const chunks = splitChunks(normalized);
  if (chunks.length === 0) {
    return { items: [], clarifications: ["unintelligible"], isEstimate: false, normalized };
  }

  const hasQtyAnywhere = chunks.some((c) => /\d/.test(c) || Object.keys(NUMBER_WORDS).some((w) => wordRe(w).test(` ${c} `)));
  const monthly = MONTHLY_PATTERN.test(normalized);

  let working = chunks;
  let isEstimate = false;
  if (monthly && !hasQtyAnywhere && chunks.length <= 2) {
    // Monthly ration requested without specifics: labelled estimate + ask.
    isEstimate = true;
    clarifications.push("monthly-estimate");
    working = [];
    for (const entry of DEFAULT_MONTHLY_BASKET) {
      const { product } = matchProduct(entry.keywords.join(" "), catalog);
      working.push({ entry, product });
    }
    const items = working.map(({ entry, product }, i) => ({
      key: `est-${i}`,
      rawText: entry.keywords.join(" "),
      qty: entry.qty,
      unit: entry.unit,
      assumedQty: false,
      productId: product ? product.id : null,
      unmatched: product ? null : entry.keywords.join(" "),
    }));
    return { items, clarifications, isEstimate, normalized };
  }

  const items = [];
  chunks.forEach((chunk, i) => {
    const { qty, unit, rest } = extractQtyUnit(chunk);
    const { product } = matchProduct(rest || chunk, catalog);
    if (!product) {
      clarifications.push(`unmatched:${chunk}`);
      items.push({ key: `u-${i}`, rawText: chunk, qty: qty ?? 1, unit: unit || "pcs", assumedQty: qty == null, productId: null, unmatched: chunk });
      return;
    }
    items.push({
      key: `m-${i}`,
      rawText: chunk,
      qty: qty ?? 1,
      unit: unit || "pcs",
      assumedQty: qty == null,
      productId: product.id,
      unmatched: null,
    });
    if (qty == null) clarifications.push(`qty-assumed:${product.name}`);
  });

  return { items, clarifications, isEstimate, normalized };
}
