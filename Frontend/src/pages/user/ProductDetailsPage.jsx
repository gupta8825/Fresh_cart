import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight, Heart, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck, Zap } from "lucide-react";
import ProductSection from "../../components/ProductSection";
import TiltImage from "../../components/TiltImage";
import { PRODUCTS, CATEGORIES, discountPct, formatPrice, handleImgError } from "../../data/products";
import { getAvailability } from "../../utils/availability";
import { useShop } from "../../context/ShopContext";
import { useTranslatedProduct } from "../../context/LanguageContext";

const SAMPLE_REVIEWERS = [
  { name: "Priya Sharma", note: "Fresh and well packed. Will order again." },
  { name: "Rahul Verma", note: "Good quality for the price. Delivery was quick." },
  { name: "Ananya Iyer", note: "Kids loved it. Freshness lasted several days." },
];

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem("freshcart_recent") || "[]");
  } catch {
    return [];
  }
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useShop();
  const [qty, setQty] = useState(1);

  const product = PRODUCTS.find((p) => p.id === id);

  useEffect(() => {
    setQty(1);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    try {
      const prev = readRecent().filter((x) => x !== product.id);
      localStorage.setItem("freshcart_recent", JSON.stringify([product.id, ...prev].slice(0, 8)));
    } catch { /* ignore */ }
  }, [id, product]);

  const related = useMemo(() => {
    if (!product) return [];
    const same = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
    // Purchasable kirana items first — unavailable ones stay visible, never hidden.
    const rank = (p) => (getAvailability(p).purchasable ? 0 : 1);
    return [...same].sort((a, b) => rank(a) - rank(b)).slice(0, 4);
  }, [product]);

  const recent = useMemo(() => {
    if (!product) return [];
    return readRecent()
      .filter((rid) => rid !== product.id)
      .map((rid) => PRODUCTS.find((p) => p.id === rid))
      .filter(Boolean)
      .slice(0, 4);
  }, [product, id]);

  const reviews = useMemo(() => {
    if (!product) return [];
    return SAMPLE_REVIEWERS.map((r, i) => ({
      ...r,
      rating: Math.max(3, Math.min(5, Math.round(product.rating - i * 0.5))),
      date: `2026-0${(i % 9) + 1}-1${i + 2}`,
    }));
  }, [product]);

  const tp = useTranslatedProduct();

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-6xl">🔍</p>
        <h1 className="mt-4 text-2xl font-extrabold">Product not found</h1>
        <p className="mt-2 text-sm text-stone-500">This item may have been removed or the link is incorrect.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/shop" className="rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Back to Shop</Link>
          <Link to="/" className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold hover:bg-stone-50">Home</Link>
        </div>
      </div>
    );
  }

  const catName = CATEGORIES.find((c) => c.id === product.category)?.name || product.category;
  const { name: displayName, description: displayDesc } = tp(product);
  const pct = discountPct(product);
  const avail = getAvailability(product);
  const purchasable = avail.purchasable;
  const wished = isWishlisted(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-[#16A34A]">Shop</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-stone-700">{displayName}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-stone-100">
          <TiltImage>
            <img src={product.image} alt={displayName} onError={handleImgError} className="h-[380px] w-full object-cover lg:h-[520px]" />
          </TiltImage>
          {pct > 0 && <span className="absolute left-5 top-5 rounded-full bg-[#f97316] px-3.5 py-1.5 text-xs font-bold text-white shadow">{pct}% OFF</span>}
          {product.bestseller && <span className="absolute left-5 top-14 rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white shadow">Bestseller</span>}
          {!purchasable && (
            <span className={`absolute bottom-5 left-5 rounded-full px-4 py-2 text-sm font-bold text-white shadow ${avail.key === "unavailable" ? "bg-red-700" : "bg-stone-800"}`}>
              {avail.label}
            </span>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">{catName} • {product.unit}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">{displayName}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 font-bold text-[#14532D]">
              <Star size={14} className="text-amber-500" fill="currentColor" /> {product.rating}
            </span>
            <span className="text-stone-400">{product.reviews} reviews</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${
              avail.key === "in" ? "bg-[#16A34A]" : avail.key === "low" ? "bg-amber-500" : avail.key === "unavailable" ? "bg-red-700" : "bg-stone-800"
            }`}>
              {avail.label}
            </span>
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-stone-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-[#f97316]">Save {formatPrice(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-stone-500">{displayDesc}</p>

          <p className={`mt-4 text-sm font-bold ${!purchasable ? "text-red-600" : avail.key === "low" ? "text-[#f97316]" : "text-[#16A34A]"}`}>
            {!purchasable
              ? (avail.key === "unavailable"
                ? "Sorry, this item is currently unavailable."
                : "Sorry, this item is currently out of stock.")
              : avail.key === "low"
                ? `Only ${avail.stock} left in stock — order soon`
                : "In stock, ready to ship"}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {purchasable && (
              <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1.5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100" aria-label="Decrease"><Minus size={16} /></button>
                <span className="min-w-8 text-center font-extrabold">{qty}</span>
                <button onClick={() => setQty(Math.min(avail.stock || 1, qty + 1))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100" aria-label="Increase"><Plus size={16} /></button>
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={!purchasable}
              onClick={() => addToCart(product, qty)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none sm:flex-none sm:px-10"
            >
              <ShoppingCart size={17} /> {purchasable ? "Add to Cart" : avail.label}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleWishlist(product)}
              aria-label="Wishlist"
              className={`rounded-full border p-3.5 ${wished ? "border-red-200 bg-red-50 text-red-500" : "border-stone-200 bg-white text-stone-400 hover:text-red-500"}`}
            >
              <Heart size={19} fill={wished ? "currentColor" : "none"} />
            </motion.button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!purchasable}
              onClick={() => { addToCart(product, qty); setCartOpen(true); }}
              className="flex-1 rounded-full border-2 border-[#14532D] py-3 text-sm font-bold text-[#14532D] hover:bg-green-50 disabled:opacity-40 sm:flex-none sm:px-10"
            >
              <Zap size={16} className="mr-1.5 inline" />Buy Now
            </motion.button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-[13px]">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 ring-1 ring-stone-100">
              <Truck size={20} className="shrink-0 text-[#16A34A]" /> <span><b>Free delivery</b> over ₹499</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 ring-1 ring-stone-100">
              <ShieldCheck size={20} className="shrink-0 text-[#16A34A]" /> <span><b>7-day</b> easy replacement</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-stone-100">
            <h3 className="text-sm font-bold">Delivery information (demo)</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-stone-500">
              <li>Standard delivery in 2–4 hours • Express in 60 mins (demo charges apply).</li>
              <li>Sturdy packing for atta bags, oil bottles & glass jars.</li>
              <li>Cash on Delivery available. No real payment is processed.</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div className="mt-6">
          <ProductSection id="related" eyebrow="You may also like" title="Related products" products={related} linkTo={`/shop?category=${product.category}`} />
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
          <h2 className="text-base font-extrabold">Specifications</h2>
          <dl className="mt-3 divide-y divide-stone-100 text-sm">
            {[
              ["Category", catName],
              ["Package size", product.unit],
              ["Rating", `${product.rating} (${product.reviews} sample reviews)`],
              ["Availability", `${avail.label}${purchasable ? ` (${avail.stock} units)` : ""} (demo)`],
              ["Discount", pct > 0 ? `${pct}% off MRP` : "MRP price"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-stone-400">{k}</dt>
                <dd className="text-right font-semibold text-stone-800">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
          <h2 className="text-base font-extrabold">Customer reviews <span className="text-xs font-medium text-stone-400">(sample demo data)</span></h2>
          <div className="mt-3 flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-2xl bg-[#FAFAF5] p-4 ring-1 ring-stone-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{r.name}</p>
                  <span className="flex items-center gap-1 text-xs font-bold text-[#14532D]">
                    <Star size={13} className="text-amber-500" fill="currentColor" /> {r.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-stone-500">{r.note}</p>
                <p className="mt-1 text-[11px] text-stone-400">{r.date} • Demo review, no backend</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {recent.length > 0 && (
        <div className="mt-6">
          <ProductSection id="recent" eyebrow="Recently viewed" title="Recently viewed" products={recent} linkTo="/shop" linkLabel="Continue shopping" />
        </div>
      )}
    </div>
  );
}
