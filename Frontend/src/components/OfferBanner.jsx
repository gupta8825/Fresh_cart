import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, BadgePercent } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OFFER_IMAGE } from "../data/products";
import { prefersReducedMotion } from "../hooks/useGsap";

gsap.registerPlugin(ScrollTrigger);

export default function OfferBanner() {
  const scope = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".offer-card", {
        y: 50, opacity: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: scope.current, start: "top 82%" },
      });
      gsap.to(".offer-img", {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: scope.current, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} className="mx-auto max-w-7xl px-4 py-10">
      <div className="offer-card relative overflow-hidden rounded-[2rem] bg-[#14532D] text-white">
        <div className="grid items-center gap-6 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              <BadgePercent size={15} className="text-orange-300" /> Monthly Ration Sale
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              Get up to 30% OFF on atta, rice, dal & spices
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-green-100">
              Stock your kitchen with monthly ration at unbeatable prices.
              Use code <span className="rounded bg-white/20 px-2 py-0.5 font-mono font-bold">FRESH10</span> at checkout.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-6 inline-block">
              <Link to="/deals" className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600">
                Shop Deals <ArrowRight size={17} />
              </Link>
            </motion.div>
          </div>
          <div className="relative overflow-hidden rounded-3xl">
            <img src={OFFER_IMAGE} alt="Kirana sale" loading="lazy" className="offer-img h-64 w-full scale-110 object-cover md:h-80" />
          </div>
        </div>
      </div>
    </section>
  );
}
