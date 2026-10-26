import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import gsap from "gsap";
import ProductCard from "../../components/ProductCard";
import { PRODUCTS } from "../../data/products";
import { getAvailability } from "../../utils/availability";
import { useLanguage, useTranslatedProduct } from "../../context/LanguageContext";
import { prefersReducedMotion } from "../../hooks/useGsap";

const MAX_PRICE = 400;
const MIN_PRICE = 20;

const AVAIL_KEYS = ["all", "in", "low", "out", "unavailable"];

export default function MasalaPage() {
  const [params] = useSearchParams();
  const scope = useRef(null);
  const { t } = useLanguage();
  const tp = useTranslatedProduct();

  const [query, setQuery] = useState(params.get("q") || "");
  const [spiceType, setSpiceType] = useState("all");
  const [brand, setBrand] = useState("all");
  const [pack, setPack] = useState("all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [availability, setAvailability] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setQuery(params.get("q") || "");
    const st = params.get("type");
    if (st === "powder" || st === "whole") setSpiceType(st);
  }, [params]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".masala-head", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" });
    }, scope);
    return () => ctx.revert();
  }, []);

  const catalog = useMemo(() => PRODUCTS.filter((p) => p.category === "spices"), []);

  const brands = useMemo(
    () => [...new Set(catalog.map((p) => p.brand).filter(Boolean))].sort(),
    [catalog]
  );
  const packs = useMemo(
    () => [...new Set(catalog.map((p) => p.unit).filter(Boolean))],
    [catalog]
  );

  const tr = (key) => {
    const v = t(key);
    return v === key ? key.split(".").pop() : v;
  };

  const filtered = useMemo(() => {
    let list = [...catalog];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const { name, description } = tp(p);
        return [name, p.name, p.category, p.unit, p.brand, description, p.description]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      });
    }
    if (spiceType !== "all") list = list.filter((p) => p.spiceType === spiceType);
    if (brand !== "all") list = list.filter((p) => p.brand === brand);
    if (pack !== "all") list = list.filter((p) => p.unit === pack);
    const lo = Math.min(minPrice, maxPrice);
    const hi = Math.max(minPrice, maxPrice);
    list = list.filter((p) => p.price >= lo && p.price <= hi);
    if (onlyDiscounted) list = list.filter((p) => p.originalPrice > p.price);
    if (availability !== "all") list = list.filter((p) => getAvailability(p).key === availability);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "discount":
        list.sort((a, b) => (1 - b.price / b.originalPrice) - (1 - a.price / a.originalPrice));
        break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return list;
  }, [catalog, query, spiceType, brand, pack, sort, minPrice, maxPrice, onlyDiscounted, availability, tp]);

  const clearAll = () => {
    setQuery(""); setSpiceType("all"); setBrand("all"); setPack("all");
    setMinPrice(MIN_PRICE); setMaxPrice(MAX_PRICE);
    setOnlyDiscounted(false); setAvailability("all");
  };
  const activeCount =
    (query.trim() ? 1 : 0) + (spiceType !== "all" ? 1 : 0) + (brand !== "all" ? 1 : 0) +
    (pack !== "all" ? 1 : 0) + (minPrice > MIN_PRICE || maxPrice < MAX_PRICE ? 1 : 0) +
    (onlyDiscounted ? 1 : 0) + (availability !== "all" ? 1 : 0);

  const pill = (active) =>
    `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
      active ? "bg-[#16A34A] text-white shadow" : "bg-stone-100 text-stone-600 hover:bg-green-100 hover:text-[#14532D]"
    }`;

  const filters = (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-sm font-bold text-stone-900">{t("masala.brand")}</h4>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {["all", ...brands].map((b) => (
            <button key={b} onClick={() => setBrand(b)} className={pill(brand === b)}>
              {b === "all" ? t("masala.allBrands") : b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-900">{t("masala.packSize")}</h4>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {["all", ...packs].map((u) => (
            <button key={u} onClick={() => setPack(u)} className={pill(pack === u)}>
              {u === "all" ? t("masala.allPacks") : u}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-900">
          Price range: <span className="text-[#16A34A]">₹{Math.min(minPrice, maxPrice)} – ₹{Math.max(minPrice, maxPrice)}</span>
        </h4>
        <input
          type="range" min={MIN_PRICE} max={MAX_PRICE} step={5} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="mt-2 w-full accent-[#16A34A]"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { v: minPrice, set: setMinPrice, label: "Minimum price" },
            { v: maxPrice, set: setMaxPrice, label: "Maximum price" },
          ].map(({ v, set, label }) => (
            <label key={label} className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-sm">
              <span className="text-stone-400">₹</span>
              <input
                type="number" min={MIN_PRICE} max={MAX_PRICE} value={v}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  set(Math.min(Math.max(n, MIN_PRICE), MAX_PRICE));
                }}
                aria-label={label}
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-900">{t("masala.availability")}</h4>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {AVAIL_KEYS.map((id) => (
            <button key={id} onClick={() => setAvailability(id)} className={pill(availability === id)}>
              {id === "all" ? t("masala.all") : tr(`masala.avail.${id}`)}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-600">
        <input type="checkbox" checked={onlyDiscounted} onChange={(e) => setOnlyDiscounted(e.target.checked)} className="h-4 w-4 accent-[#16A34A]" />
        {t("masala.discounted")}
      </label>
      <button onClick={clearAll} className="rounded-full border border-stone-200 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100">
        {t("masala.clearAll")}
      </button>
    </div>
  );

  return (
    <div ref={scope} className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} /> <span className="font-semibold text-stone-700">{t("masala.title")}</span>
      </nav>

      <div className="masala-head relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-r from-[#14532D] via-[#1d6a3a] to-[#b45309] p-7 text-white md:p-10">
        <p className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
          {t("masala.bannerNote")}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">{t("masala.title")}</h1>
        <p className="mt-2 max-w-lg text-sm text-green-100">{t("masala.subtitle")}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["all", "masala.all"],
            ["powder", "masala.powder"],
            ["whole", "masala.whole"],
          ].map(([id, key]) => (
            <button
              key={id}
              onClick={() => setSpiceType(id)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                spiceType === id ? "bg-white text-[#14532D] shadow" : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("masala.searchPlaceholder")}
            className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-10 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-100 p-1 hover:bg-stone-200" aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold lg:hidden">
            <SlidersHorizontal size={16} /> Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="flex-1 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold outline-none focus:border-[#16A34A] md:flex-none">
            {["featured", "priceAsc", "priceDesc", "discount", "name"].map((id) => (
              <option key={id} value={id}>{t(`masala.sort.${id}`)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-100 lg:block lg:self-start lg:sticky lg:top-32">
          {filters}
        </aside>
        <div>
          <p className="mb-4 text-sm text-stone-500">
            {t("masala.showing")} <b className="text-stone-800">{filtered.length}</b> {t("masala.of")} {catalog.length} {t("masala.products")}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-100 sm:p-14">
              <p className="text-5xl">🫙</p>
              <h3 className="mt-4 text-lg font-extrabold">{t("masala.empty")}</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">{t("masala.emptyHint")}</p>
              <button onClick={clearAll} className="mt-5 rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">
                {t("masala.clearAll")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-50 bg-black/45" />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-extrabold">Filters</h3>
                <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-stone-100" aria-label="Close filters"><X size={20} /></button>
              </div>
              {filters}
              <button onClick={() => setDrawerOpen(false)} className="mt-5 w-full rounded-full bg-[#16A34A] py-3 text-sm font-bold text-white">
                Show {filtered.length} products
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
