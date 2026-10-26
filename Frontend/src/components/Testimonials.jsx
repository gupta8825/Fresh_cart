import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "../data/products";

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">Customer Love</p>
        <h2 className="mt-1 text-2xl font-extrabold text-stone-900 sm:text-3xl">What our shoppers say</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">Sample reviews shown for UI demonstration.</p>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100"
          >
            <Quote size={26} className="text-green-200" fill="currentColor" />
            <blockquote className="mt-3 text-sm leading-relaxed text-stone-600">“{t.text}”</blockquote>
            <div className="mt-3 flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={14} fill={s < t.rating ? "currentColor" : "none"} className={s < t.rating ? "" : "text-stone-300"} />
              ))}
            </div>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: t.color }}>
                {t.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <span>
                <span className="block text-sm font-bold text-stone-900">{t.name}</span>
                <span className="block text-xs text-stone-400">{t.location} • Verified buyer</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
