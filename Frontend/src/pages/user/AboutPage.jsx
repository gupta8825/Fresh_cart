import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Truck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A]">Our Story</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Your neighbourhood kirana, <span className="text-[#16A34A]">now online</span></h1>
      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-500">
        FreshCart is a demo kirana storefront built with React, Vite, Tailwind, Motion and GSAP.
        We stock atta, rice, dal, spices, snacks and household needs at honest prices — every single day.
      </p>
      <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        {[
          { icon: Leaf, t: "Quality checked", d: "Trusted staples, verified before dispatch." },
          { icon: Truck, t: "Same-day delivery", d: "Neat packing keeps everything safe." },
          { icon: ShieldCheck, t: "Easy replacements", d: "Damaged pack? 7-day no-question replacement (demo)." },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl bg-white p-5 ring-1 ring-stone-100">
            <x.icon size={22} className="text-[#16A34A]" />
            <p className="mt-2 font-bold">{x.t}</p>
            <p className="mt-1 text-sm text-stone-500">{x.d}</p>
          </div>
        ))}
      </div>
      <Link to="/shop" className="mt-8 inline-block rounded-full bg-[#16A34A] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#14532D]">
        Shop Essentials Now
      </Link>
    </div>
  );
}
