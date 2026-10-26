import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en as coreEn, hi as coreHi } from "../i18n/core";
import { en as navEn, hi as navHi } from "../i18n/nav";
import { en as homeEn, hi as homeHi } from "../i18n/home";
import { en as ordersEn, hi as ordersHi } from "../i18n/orders";
import { en as accountEn, hi as accountHi } from "../i18n/account";
import { en as productsEn, hi as productsHi } from "../i18n/products";
import { en as masalaEn, hi as masalaHi } from "../i18n/masala";
import { en as assistantEn, hi as assistantHi } from "../i18n/assistant";

const LanguageContext = createContext(null);
const STORAGE_KEY = "freshcart_lang";

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    out[key] =
      source[key] && typeof source[key] === "object" && !Array.isArray(source[key])
        ? deepMerge(out[key] || {}, source[key])
        : source[key];
  }
  return out;
}

const en = [coreEn, navEn, homeEn, ordersEn, accountEn, productsEn, masalaEn, assistantEn].reduce(deepMerge, {});
const hi = [coreHi, navHi, homeHi, ordersHi, accountHi, productsHi, masalaHi, assistantHi].reduce(deepMerge, {});
const STRINGS = { en, hi };

function lookup(lang, key) {
  return key.split(".").reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined), STRINGS[lang]);
}

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStored);

  const setLang = useCallback((next) => {
    const v = next === "hi" ? "hi" : "en";
    setLangState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang === "hi" ? "hi" : "en";
    } catch { /* ignore */ }
  }, [lang]);

  // t("nav.home") -> translated string; falls back to English, then the key.
  const t = useCallback(
    (key) => lookup(lang, key) ?? lookup("en", key) ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

// Product / category display helpers: Hindi overrides live in the
// `products` namespace keyed by id; everything else falls back to English
// source data so prices, stock and IDs never change with language.
export function useTranslatedProduct() {
  const { lang, t } = useLanguage();
  return useCallback(
    (product) => {
      if (!product) return { name: "", description: "" };
      if (lang !== "hi") return { name: product.name, description: product.description };
      return {
        name: t(`products.items.${product.id}.name`) !== `products.items.${product.id}.name`
          ? t(`products.items.${product.id}.name`)
          : product.name,
        description: t(`products.items.${product.id}.desc`) !== `products.items.${product.id}.desc`
          ? t(`products.items.${product.id}.desc`)
          : product.description,
      };
    },
    [lang, t]
  );
}

export function useTranslatedCategory() {
  const { lang, t } = useLanguage();
  return useCallback(
    (category) => {
      if (!category) return { name: "", description: "" };
      if (lang !== "hi") return { name: category.name, description: category.description };
      const n = t(`products.categories.${category.id}.name`);
      const d = t(`products.categories.${category.id}.desc`);
      return {
        name: n !== `products.categories.${category.id}.name` ? n : category.name,
        description: d !== `products.categories.${category.id}.desc` ? d : category.description,
      };
    },
    [lang, t]
  );
}
