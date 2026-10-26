import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Carousel from "./Carousel";
import ProductCard from "./ProductCard";
import { useLanguage } from "../context/LanguageContext";

// Horizontal product carousel reusing the shared ProductCard (image, name,
// pack size, price/MRP/discount, stock gating, cart, wishlist, quick view
// all preserved — no duplicate product data, no per-card canvases).
// Visible cards scale with width: ~1 → 2 → 3 → 4 → 5.
const SLIDE_CLASS =
  "w-[74%] min-[420px]:w-[46.5%] md:w-[31.6%] lg:w-[23.4%] xl:w-[18.7%] shrink-0 snap-start";

export default function ProductCarousel({
  id,
  eyebrow,
  title,
  subtitle,
  products,
  linkTo = "/shop",
  linkLabel,
  autoplay = false,
}) {
  const { t } = useLanguage();
  if (!products || products.length === 0) return null;
  return (
    <section id={id} aria-label={typeof title === "string" ? title : id} className="mx-auto max-w-7xl overflow-hidden px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">{eyebrow}</p>}
          <h2 className="mt-1 text-2xl font-extrabold text-stone-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 max-w-lg text-sm text-stone-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to={linkTo} className="hidden items-center gap-1 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#14532D] hover:bg-green-50 sm:inline-flex">
            {linkLabel || t("home.viewAll")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <Carousel
          items={products}
          slideClassName={SLIDE_CLASS}
          ariaLabel={typeof title === "string" ? title : "Products"}
          prevLabel={t("home.carouselPrev")}
          nextLabel={t("home.carouselNext")}
          dotLabel={(i) => `${t("home.carouselGoTo")} ${i + 1}`}
          autoplay={autoplay}
          renderSlide={(p, i) => <ProductCard key={p.id} product={p} index={i} />}
        />
      </div>
      <div className="mt-5 text-center sm:hidden">
        <Link to={linkTo} className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#14532D] hover:bg-green-50">
          {linkLabel || t("home.viewAll")} <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
