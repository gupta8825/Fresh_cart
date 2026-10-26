import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductSection({ id, eyebrow, title, subtitle, products, linkTo = "/shop", linkLabel = "View all" }) {
  if (!products || products.length === 0) return null;
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">{eyebrow}</p>}
          <h2 className="mt-1 text-2xl font-extrabold text-stone-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 max-w-lg text-sm text-stone-500">{subtitle}</p>}
        </div>
        <Link to={linkTo} className="hidden items-center gap-1 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#14532D] hover:bg-green-50 sm:inline-flex">
          {linkLabel} <ArrowRight size={15} />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
