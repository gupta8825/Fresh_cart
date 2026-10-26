import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import gsap from "gsap";
import ProductCard from "../../components/ProductCard";
import { CATEGORIES, PRODUCTS } from "../../data/products";
import { getAvailability } from "../../utils/availability";
import { prefersReducedMotion } from "../../hooks/useGsap";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "name", label: "Name: A to Z" },
];

const MAX_PRICE = 800;
const MIN_PRICE = 20;

const AVAIL_LABELS = { in: "In Stock", low: "Low Stock", out: "Out of Stock", unavailable: "Currently Unavailable" };

export default function ShopPage() {
  const [params] = useSearchParams();
  const scope = useRef(null);
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [availability, setAvailability] = useState("all");
  const [onlyBestseller, setOnlyBestseller] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync URL params (?q=, ?category=) into filter state on navigation.
  useEffect(() => {
    setQuery(params.get("q") || "");
    setCategory(params.get("category") || "all");
  }, [params]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".shop-head", { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" });
    }, scope);
    return () => ctx.revert();
  }, []);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.category, p.unit, p.description].join(" ").toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((p) => p.category === category);
    const lo = Math.min(minPrice, maxPrice);
    const hi = Math.max(minPrice, maxPrice);
    list = list.filter((p) => p.price >= lo && p.price <= hi);
    if (onlyDiscounted) list = list.filter((p) => p.originalPrice > p.price);
    if (availability !== "all") list = list.filter((p) => getAvailability(p).key === availability);
    if (onlyBestseller) list = list.filter((p) => p.bestseller);
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return list;
  }, [query, category, sort, minPrice, maxPrice, onlyDiscounted, availability, onlyBestseller, minRating]);

  const priceActive = minPrice > MIN_PRICE || maxPrice < MAX_PRICE;
  const chips = useMemo(() => {
    const c = [];
    if (query.trim()) c.push({ id: "q", label: `"${query.trim()}"`, clear: () => setQuery("") });
    if (category !== "all") c.push({ id: "cat", label: CATEGORIES.find((x) => x.id === category)?.name || category, clear: () => setCategory("all") });
    if (priceActive) c.push({ id: "price", label: `₹${Math.min(minPrice, maxPrice)} – ₹${Math.max(minPrice, maxPrice)}`, clear: () => { setMinPrice(MIN_PRICE); setMaxPrice(MAX_PRICE); } });
    if (onlyDiscounted) c.push({ id: "disc", label: "Discounted", clear: () => setOnlyDiscounted(false) });
    if (availability !== "all") c.push({ id: "avail", label: AVAIL_LABELS[availability], clear: () => setAvailability("all") });
    if (onlyBestseller) c.push({ id: "best", label: "Bestseller", clear: () => setOnlyBestseller(false) });
    if (minRating > 0) c.push({ id: "rate", label: `${minRating}★ & up`, clear: () => setMinRating(0) });
    return c;
  }, [query, category, minPrice, maxPrice, priceActive, onlyDiscounted, availability, onlyBestseller, minRating]);

  const clearAll = () => {
    setQuery(""); setCategory("all"); setMinPrice(MIN_PRICE); setMaxPrice(MAX_PRICE);
    setOnlyDiscounted(false); setAvailability("all"); setOnlyBestseller(false); setMinRating(0);
  };

  const filters = (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-sm font-bold text-stone-900">Category</h4>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {[{ id: "all", name: "All Products" }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                category === c.id ? "bg-[#16A34A] text-white shadow" : "bg-stone-100 text-stone-600 hover:bg-green-100 hover:text-[#14532D]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-900">
          Price range: <span className="text-[#16A34A]">₹{Math.min(minPrice, maxPrice)} – ₹{Math.max(minPrice, maxPrice)}</span>
        </h4>
        <input
          type="range" min={MIN_PRICE} max={MAX_PRICE} step={10} value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="mt-2 w-full accent-[#16A34A]"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-sm">
            <span className="text-stone-400">₹</span>
            <input
              type="number" min={MIN_PRICE} max={MAX_PRICE} value={minPrice}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                setMinPrice(Math.min(Math.max(v, MIN_PRICE), MAX_PRICE));
              }}
              aria-label="Minimum price"
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-sm">
            <span className="text-stone-400">₹</span>
            <input
              type="number" min={MIN_PRICE} max={MAX_PRICE} value={maxPrice}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                setMaxPrice(Math.min(Math.max(v, MIN_PRICE), MAX_PRICE));
              }}
              aria-label="Maximum price"
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
        </div>
        {minPrice > maxPrice && (
          <p className="mt-1.5 text-xs font-medium text-[#f97316]">Min exceeds max — range is auto-corrected.</p>
        )}
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-900">Availability</h4>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {[["all", "All Products"], ["in", "In Stock"], ["low", "Low Stock"], ["out", "Out of Stock"], ["unavailable", "Currently Unavailable"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setAvailability(id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                availability === id ? "bg-[#16A34A] text-white shadow" : "bg-stone-100 text-stone-600 hover:bg-green-100 hover:text-[#14532D]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        {[
          ["Discounted only", onlyDiscounted, setOnlyDiscounted],
          ["Bestsellers only", onlyBestseller, setOnlyBestseller],
        ].map(([label, val, set]) => (
          <label key={label} className="flex cursor-pointer items-center gap-2.5 text-stone-600">
            <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-[#16A34A]" />
            {label}
          </label>
        ))}
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-900">Minimum rating</h4>
        <div className="mt-2 flex gap-2">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${minRating === r ? "bg-[#14532D] text-white" : "bg-stone-100 text-stone-600 hover:bg-green-100"}`}
            >
              {r === 0 ? "Any" : `${r}★+`}
            </button>
          ))}
        </div>
      </div>
      <button onClick={clearAll} className="rounded-full border border-stone-200 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div ref={scope} className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} /> <span className="font-semibold text-stone-700">Shop</span>
      </nav>

      <div className="shop-head mt-3 overflow-hidden rounded-3xl bg-[#14532D] p-7 text-white md:p-10">
        <h1 className="text-2xl font-extrabold sm:text-4xl">Explore Everyday Essentials</h1>
        <p className="mt-2 max-w-lg text-sm text-green-100">
          {PRODUCTS.length} kirana essentials across atta, rice, dal, spices, snacks and household needs.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, pack size or description…"
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
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="flex-1 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold outline-none focus:border-[#16A34A] md:flex-none">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button key={c.id} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-[#14532D] hover:bg-green-200">
              {c.label} <X size={13} />
            </button>
          ))}
          <button onClick={clearAll} className="text-xs font-semibold text-stone-400 underline hover:text-stone-600">Clear all</button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-100 lg:block lg:self-start lg:sticky lg:top-32">
          {filters}
        </aside>
        <div>
          <p className="mb-4 text-sm text-stone-500">
            Showing <b className="text-stone-800">{filtered.length}</b> of {PRODUCTS.length} products
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-100 sm:p-14">
              <p className="text-5xl">🛒</p>
              <h3 className="mt-4 text-lg font-extrabold">No products match your filters</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">Try a different search term or clear the filters to see all kirana essentials.</p>
              <button onClick={clearAll} className="mt-5 rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">
                Clear all filters
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
