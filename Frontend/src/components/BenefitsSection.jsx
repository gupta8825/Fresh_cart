import { motion } from "motion/react";
import { Leaf, Truck, ShieldCheck, BadgeIndianRupee } from "lucide-react";

const ITEMS = [
  { icon: Leaf, title: "Quality Essentials", text: "Trusted brands and pure staples, quality-checked.", bg: "bg-green-100", fg: "text-[#16A34A]" },
  { icon: Truck, title: "Fast Home Delivery", text: "Same-day doorstep delivery on kirana orders.", bg: "bg-orange-100", fg: "text-[#f97316]" },
  { icon: ShieldCheck, title: "Secure Shopping", text: "Safe payments & easy 7-day replacements.", bg: "bg-emerald-100", fg: "text-[#14532D]" },
  { icon: BadgeIndianRupee, title: "Great Prices Daily", text: "Honest kirana rates with daily deals.", bg: "bg-lime-100", fg: "text-lime-700" },
];

export default function BenefitsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${b.bg} ${b.fg}`}>
              <b.icon size={22} />
            </span>
            <span>
              <span className="block text-sm font-bold text-stone-900">{b.title}</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-stone-500">{b.text}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
