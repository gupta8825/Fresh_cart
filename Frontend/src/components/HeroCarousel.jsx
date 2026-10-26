import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import Carousel from "./Carousel";
import { useLanguage } from "../context/LanguageContext";

// Hero text slides. The 3D visual column in HeroSection stays exactly as-is;
// only this copy column becomes a swipeable carousel.
export default function HeroCarousel() {
  const { t } = useLanguage();
  const slides = useMemo(() => {
    const v = t("home.heroSlides");
    return Array.isArray(v) && v.length > 0 ? v : [];
  }, [t]);

  if (slides.length === 0) return null;

  return (
    <Carousel
      items={slides}
      slideClassName="w-full shrink-0 snap-start"
      ariaLabel={t("home.heroLabel")}
      prevLabel={t("home.carouselPrev")}
      nextLabel={t("home.carouselNext")}
      dotLabel={(i) => `${t("home.carouselGoTo")} ${i + 1}`}
      autoplay
      autoplayMs={7000}
      showArrows={false}
      renderSlide={(s) => (
        <div className="min-h-[330px] sm:min-h-[320px]">
          <h1 className="hero-title mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            <span className="block">{s.line1}</span>
            <span className="block">{s.line2}</span>
            <span className="block text-[#16A34A]">{s.line3}</span>
          </h1>
          <p className="hero-sub mt-5 max-w-md text-[15px] leading-relaxed text-stone-500">{s.desc}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <motion.div className="hero-cta" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={s.primaryTo}
                className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-[#14532D]"
              >
                {s.primary} <ArrowRight size={17} />
              </Link>
            </motion.div>
            <motion.div className="hero-cta" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={s.secondaryTo}
                className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-7 py-3.5 text-sm font-semibold text-[#14532D] transition hover:bg-green-50"
              >
                <LayoutGrid size={17} /> {s.secondary}
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    />
  );
}
