import { Suspense, lazy, useLayoutEffect, useRef, useState } from "react";
import { Star, Truck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_IMAGE } from "../data/products";
import { prefersReducedMotion } from "../hooks/useGsap";
import { SceneFallback, isWebGLAvailable } from "./3d/SceneLoader";
import HeroCarousel from "./HeroCarousel";

gsap.registerPlugin(ScrollTrigger);

const FreshCart3DHero = lazy(() => import("./3d/FreshCart3DHero"));

export default function HeroSection() {
  const scope = useRef(null);
  // Static image fallback for reduced-motion users or missing WebGL.
  const [show3D] = useState(() => {
    try {
      return !prefersReducedMotion() && isWebGLAvailable();
    } catch {
      return false;
    }
  });

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { y: 24, opacity: 0, duration: 0.6 })
        .from(".hero-title span", { y: 60, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.3")
        .from(".hero-sub", { y: 24, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { y: 24, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(".hero-proof", { opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-img-wrap", { scale: 0.94, opacity: 0, duration: 0.9 }, "-=0.9")
        .from(".hero-float", { y: 30, opacity: 0, duration: 0.7, stagger: 0.15 }, "-=0.6");
      gsap.to(".hero-float-1", { y: -12, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".hero-float-2", { y: 12, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
      // Subtle scroll parallax on the 3D scene (cleaned up with the context).
      gsap.to(".hero-3d-inner", {
        y: -46, ease: "none",
        scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 lg:grid-cols-2 lg:pt-16">
        <div>
          <div className="hero-badge inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-[#14532D]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#16A34A]" />
            Kirana essentials • Same-day delivery
          </div>
          <HeroCarousel />
          <div className="hero-proof mt-7 flex items-center gap-4 text-sm">
            <div className="flex -space-x-2">
              {["PS", "RV", "AI", "+9"].map((t, i) => (
                <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white ${i % 2 ? "bg-[#f97316]" : "bg-[#14532D]"}`}>
                  {t}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="ml-1 font-bold text-stone-800">4.8</span>
              </div>
              <p className="text-xs text-stone-500">12,000+ happy customers</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="hero-img-wrap overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-100 via-[#FAFAF5] to-orange-100 shadow-2xl shadow-green-100">
            {show3D ? (
              <div className="hero-3d-inner h-[340px] w-full sm:h-[420px] lg:h-[520px]">
                <Suspense fallback={<SceneFallback label="Arranging kirana shelves…" />}>
                  <FreshCart3DHero />
                </Suspense>
              </div>
            ) : (
              <img src={HERO_IMAGE} alt="Kirana store shelves" className="h-[420px] w-full object-cover lg:h-[520px]" loading="eager" />
            )}
          </div>
          <div className="hero-float hero-float-1 absolute -left-3 top-8 rounded-2xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-6">
            <p className="flex items-center gap-2 text-xs font-bold text-[#14532D]">
              <Truck size={16} className="text-[#16A34A]" /> Free Delivery
            </p>
            <p className="text-[11px] text-stone-500">on orders over ₹499</p>
          </div>
          <div className="hero-float hero-float-2 absolute -right-2 bottom-10 rounded-2xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:-right-4">
            <p className="text-xs font-bold text-stone-800">Today's Deal</p>
            <p className="text-sm font-extrabold text-[#f97316]">Up to 30% OFF</p>
          </div>
        </div>
      </div>
    </section>
  );
}
