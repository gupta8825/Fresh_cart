import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { CategoryCard } from "../../components/CategorySection";
import { CATEGORIES, PRODUCTS } from "../../data/products";

export default function CategoriesPage() {
  const countFor = (id) => PRODUCTS.filter((p) => p.category === id).length;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} /> <span className="font-semibold text-stone-700">Categories</span>
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">Shop by Category</h1>
      <p className="mt-1 text-sm text-stone-500">{CATEGORIES.length} categories • {PRODUCTS.length} products. Click a card to shop it.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <div key={c.id} className="relative">
            <CategoryCard cat={c} index={i} />
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              {countFor(c.id)} items
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
