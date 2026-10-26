import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductSection from "../../components/ProductSection";
import OfferBanner from "../../components/OfferBanner";
import { PRODUCTS } from "../../data/products";

export default function DealsPage() {
  const deals = PRODUCTS.filter((p) => p.originalPrice > p.price).sort(
    (a, b) => (1 - b.price / b.originalPrice) - (1 - a.price / a.originalPrice)
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} /> <span className="font-semibold text-stone-700">Deals</span>
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">Today's Kirana Deals <span className="text-[#f97316]">up to 30% OFF</span></h1>
      <p className="mt-1 text-sm text-stone-500">Discounted staples, snacks and household needs, plus demo coupon <b>FRESH10</b>.</p>
      <ProductSection id="deals-grid" eyebrow={`${deals.length} offers`} title="All deals" products={deals} linkTo="/shop" />
      <OfferBanner />
    </div>
  );
}
