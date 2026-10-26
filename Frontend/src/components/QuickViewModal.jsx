import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Heart, ShoppingCart, Star, X } from "lucide-react";
import { PRODUCTS, discountPct, formatPrice } from "../data/products";
import { getAvailability } from "../utils/availability";
import { useShop } from "../context/ShopContext";
import { useTranslatedProduct } from "../context/LanguageContext";

export default function QuickViewModal() {
  const { quickView, setQuickView, addToCart, toggleWishlist, isWishlisted } = useShop();
  const tp = useTranslatedProduct();
  const wished = quickView ? isWishlisted(quickView.id) : false;
  // Resolve live catalog data so admin stock/availability edits apply instantly.
  const live = quickView ? (PRODUCTS.find((p) => p.id === quickView.id) || quickView) : null;
  const { name: displayName, description: displayDesc } = tp(live);
  const avail = live ? getAvailability(live) : null;

  return (
    <AnimatePresence>
      {quickView && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setQuickView(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative grid max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl md:grid-cols-2"
          >
            <div className="relative h-60 md:h-full md:min-h-[360px]">
              <img src={quickView.image} alt={displayName} className="absolute inset-0 h-full w-full object-cover" />
              {discountPct(quickView) > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-[#f97316] px-3 py-1 text-xs font-bold text-white">
                  {discountPct(quickView)}% OFF
                </span>
              )}
              {avail && !avail.purchasable && (
                <span className={`absolute left-4 ${discountPct(quickView) > 0 ? "top-12" : "top-4"} rounded-full px-3 py-1 text-xs font-bold text-white ${avail.key === "unavailable" ? "bg-red-700" : "bg-stone-800"}`}>
                  {avail.label}
                </span>
              )}
            </div>
            <div className="p-6">
              <button onClick={() => setQuickView(null)} className="absolute right-4 top-4 rounded-full bg-stone-100 p-2.5 hover:bg-stone-200" aria-label="Close">
                <X size={18} />
              </button>
              <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">{quickView.category} • {quickView.unit}</p>
              <h3 className="mt-1 text-xl font-extrabold text-stone-900">{displayName}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm">
                <Star size={15} className="text-amber-500" fill="currentColor" />
                <b>{quickView.rating}</b>
                <span className="text-stone-400">({quickView.reviews} reviews)</span>
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-stone-500">{displayDesc}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold">{formatPrice(quickView.price)}</span>
                {quickView.originalPrice > quickView.price && (
                  <span className="text-sm text-stone-400 line-through">{formatPrice(quickView.originalPrice)}</span>
                )}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { if (live) addToCart(live); setQuickView(null); }}
                  disabled={!avail?.purchasable}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#16A34A] py-3 text-sm font-bold text-white hover:bg-[#14532D] disabled:bg-stone-200 disabled:text-stone-400"
                >
                  <ShoppingCart size={16} /> {avail?.purchasable ? "Add to Cart" : avail?.label}
                </button>
                <button
                  onClick={() => toggleWishlist(quickView)}
                  className={`rounded-full p-3 ${wished ? "bg-red-500 text-white" : "bg-stone-100 text-stone-500 hover:text-red-500"}`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} fill={wished ? "currentColor" : "none"} />
                </button>
              </div>
              <Link
                to={`/product/${quickView.id}`}
                onClick={() => setQuickView(null)}
                className="mt-3 block text-center text-sm font-semibold text-[#16A34A] hover:underline"
              >
                View full details →
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
