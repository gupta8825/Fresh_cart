import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "../../components/HeroSection";
import BenefitsSection from "../../components/BenefitsSection";
import CategorySection from "../../components/CategorySection";
import ProductCarousel from "../../components/ProductCarousel";
import OfferBanner from "../../components/OfferBanner";
import Testimonials from "../../components/Testimonials";
import Newsletter from "../../components/Newsletter";
import DeliveryStorySection from "../../components/DeliveryStorySection";
import { PRODUCTS } from "../../data/products";
import { prefersReducedMotion } from "../../hooks/useGsap";
import { useLanguage } from "../../context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const inCats = (...cats) => PRODUCTS.filter((p) => cats.includes(p.category));

export default function HomePage() {
  const scope = useRef(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  const bestsellers = PRODUCTS.filter((p) => p.bestseller).slice(0, 8);
  const dailyNeeds = inCats("atta", "rice", "dal", "oil", "spices").slice(0, 8);
  const snacks = inCats("biscuits", "namkeen", "noodles", "beverages", "packaged").slice(0, 8);
  const household = inCats("cleaning", "personal", "pooja", "sauces", "dryfruits").slice(0, 8);
  const masalaPicks = inCats("spices").filter((p) => p.bestseller).slice(0, 8);
  const powdered = inCats("spices").filter((p) => p.spiceType === "powder").slice(0, 8);
  const whole = inCats("spices").filter((p) => p.spiceType === "whole").slice(0, 8);
  const frequentlyBought = ["k01", "k04", "k07", "k32"]
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  const sec = (key, extra = {}) => ({
    eyebrow: t(`home.sections.${key}.eyebrow`),
    title: t(`home.sections.${key}.title`),
    subtitle: t(`home.sections.${key}.subtitle`),
    linkLabel: t(`home.sections.${key}.link`),
    ...extra,
  });

  return (
    <div ref={scope}>
      <HeroSection />
      <BenefitsSection />
      <CategorySection />
      <ProductCarousel
        id="bestsellers"
        products={bestsellers}
        linkTo="/shop"
        autoplay
        {...sec("bestsellers")}
      />
      <OfferBanner />
      <div className="gsap-reveal">
        <DeliveryStorySection />
      </div>
      <div className="gsap-reveal">
        <ProductCarousel
          id="daily-needs"
          products={dailyNeeds}
          linkTo="/shop?category=atta"
          {...sec("dailyNeeds")}
        />
      </div>
      <div className="gsap-reveal">
        <ProductCarousel
          id="snacks"
          products={snacks}
          linkTo="/shop?category=namkeen"
          {...sec("snacks")}
        />
      </div>
      <div className="gsap-reveal">
        <ProductCarousel
          id="household"
          products={household}
          linkTo="/shop?category=cleaning"
          {...sec("household")}
        />
      </div>
      {masalaPicks.length > 0 && (
        <div className="gsap-reveal">
          <ProductCarousel
            id="masala"
            products={masalaPicks}
            linkTo="/masala"
            {...sec("masala")}
          />
        </div>
      )}
      {powdered.length > 0 && (
        <div className="gsap-reveal">
          <ProductCarousel
            id="powdered-masala"
            products={powdered}
            linkTo="/masala?type=powder"
            {...sec("powdered")}
          />
        </div>
      )}
      {whole.length > 0 && (
        <div className="gsap-reveal">
          <ProductCarousel
            id="whole-spices"
            products={whole}
            linkTo="/masala?type=whole"
            {...sec("whole")}
          />
        </div>
      )}
      {frequentlyBought.length > 0 && (
        <div className="gsap-reveal">
          <ProductCarousel
            id="combo"
            products={frequentlyBought}
            linkTo="/shop"
            {...sec("combo")}
          />
        </div>
      )}
      <Testimonials />
      <Newsletter />
    </div>
  );
}
