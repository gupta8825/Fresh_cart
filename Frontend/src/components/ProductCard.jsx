import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { discountPct, formatPrice, handleImgError } from "../data/products";
import { getAvailability } from "../utils/availability";
import { useShop } from "../context/ShopContext";
import { useLanguage, useTranslatedProduct } from "../context/LanguageContext";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickView } = useShop();
  const { t } = useLanguage();
  const tp = useTranslatedProduct();
  const { name: displayName } = tp(product);
  const wished = isWishlisted(product.id);
  const pct = discountPct(product);
  const avail = getAvailability(product);
  const purchasable = avail.purchasable;
  const availLabel = (() => {
    const v = t(`masala.avail.${avail.key}`);
    return v === `masala.avail.${avail.key}` ? avail.label : v;
  })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition-shadow hover:shadow-xl hover:shadow-green-100"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={displayName}
            loading="lazy"
            onError={handleImgError}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {pct > 0 && (
            <span className="rounded-full bg-[#f97316] px-2.5 py-1 text-[11px] font-bold text-white shadow">
              {pct}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-[#14532D] px-2.5 py-1 text-[11px] font-bold text-white shadow">
              Bestseller
            </span>
          )}
          {avail.key === "out" && (
            <span className="rounded-full bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-white">
              {availLabel}
            </span>
          )}
          {avail.key === "unavailable" && (
            <span className="rounded-full bg-red-700 px-2.5 py-1 text-[11px] font-bold text-white">
              {availLabel}
            </span>
          )}
          {avail.key === "low" && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white">
              {availLabel}
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleWishlist(product)}
            aria-label="Wishlist"
            className={`rounded-full p-2 shadow-md backdrop-blur transition ${
              wished ? "bg-red-500 text-white" : "bg-white/95 text-stone-500 hover:text-red-500"
            }`}
          >
            <Heart size={16} fill={wished ? "currentColor" : "none"} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setQuickView(product)}
            aria-label="Quick view"
            className="rounded-full bg-white/95 p-2 text-stone-500 shadow-md backdrop-blur transition hover:text-[#16A34A]"
          >
            <Eye size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#16A34A]">{product.category}</p>
        <Link to={`/product/${product.id}`} className="mt-1 line-clamp-2 text-sm font-bold text-stone-900 hover:text-[#16A34A]">
          {displayName}
        </Link>
        <p className="mt-0.5 text-xs text-stone-400">{product.unit}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-bold text-[#14532D]">
            <Star size={12} className="text-amber-500" fill="currentColor" /> {product.rating}
          </span>
          <span className="text-stone-400">({product.reviews})</span>
          {avail.key === "low" && (
            <span className="ml-auto font-semibold text-[#f97316]">Only {avail.stock} left</span>
          )}
          {avail.key === "in" && (
            <span className="ml-auto font-semibold text-[#16A34A]">In Stock</span>
          )}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-stone-900">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-[13px] text-stone-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={!purchasable}
          onClick={() => addToCart(product)}
          className={`mt-3 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition ${
            !purchasable
              ? "cursor-not-allowed bg-stone-100 text-stone-400"
              : "bg-[#16A34A] text-white shadow-md shadow-green-200 hover:bg-[#14532D]"
          }`}
        >
          <ShoppingCart size={16} /> {!purchasable ? availLabel : "Add to Cart"}
        </motion.button>
      </div>
    </motion.article>
  );
}

export function QtyStepper({ qty, onChange, max = 99, small = false }) {
  return (
    <div className={`flex items-center gap-1 rounded-full border border-stone-200 bg-white ${small ? "p-0.5" : "p-1"}`}>
      <button
        onClick={() => onChange(Math.max(0, qty - 1))}
        className={`${small ? "h-7 w-7" : "h-8 w-8"} flex items-center justify-center rounded-full hover:bg-stone-100`}
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className={`min-w-6 text-center text-sm font-bold ${small ? "" : ""}`}>{qty}</span>
      <button
        onClick={() => onChange(Math.min(max, qty + 1))}
        className={`${small ? "h-7 w-7" : "h-8 w-8"} flex items-center justify-center rounded-full hover:bg-stone-100`}
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
