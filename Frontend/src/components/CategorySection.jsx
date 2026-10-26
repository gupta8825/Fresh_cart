import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES } from "../data/products";
import { prefersReducedMotion } from "../hooks/useGsap";
import { useTranslatedCategory } from "../context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export function CategoryCard({ cat, index = 0 }) {
  const tc = useTranslatedCategory();
  const { name: displayName, description: displayDesc } = tc(cat);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 4) * 0.07, duration: 0.5 }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={cat.id === "spices" ? "/masala" : `/shop?category=${cat.id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition-shadow hover:shadow-xl hover:shadow-green-100"
      >
        <div className="relative h-36 overflow-hidden">
          <img src={cat.image} alt={displayName} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span>
              <span className="block text-[15px] font-bold text-white">{displayName}</span>
              <span className="block text-[11px] text-white/80">{displayDesc}</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#16A34A] transition group-hover:bg-[#16A34A] group-hover:text-white">
              <ArrowRight size={16} />
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategorySection() {
  const scope = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".cat-head", {
        y: 30, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: scope.current, start: "top 85%" },
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="categories" className="mx-auto max-w-7xl px-4 py-12">
      <div className="cat-head flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">Shop by Category</p>
          <h2 className="mt-1 text-2xl font-extrabold text-stone-900 sm:text-3xl">Popular kirana categories</h2>
        </div>
        <Link to="/categories" className="hidden items-center gap-1 rounded-full border border-green-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#14532D] hover:bg-green-50 sm:inline-flex">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <CategoryCard key={c.id} cat={c} index={i} />
        ))}
      </div>
    </section>
  );
}
