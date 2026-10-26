import { Check } from "lucide-react";

const STEPS = ["Cart", "Checkout", "Payment", "Confirmation"];

export default function CheckoutSteps({ current = 2 }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
            <span className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                  done ? "bg-[#16A34A] text-white" : active ? "bg-[#14532D] text-white" : "bg-stone-200 text-stone-500"
                }`}
              >
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span className={`truncate text-xs font-bold sm:text-[13px] ${active ? "text-stone-900" : "text-stone-400"}`}>
                {label}
              </span>
            </span>
            {i < STEPS.length - 1 && <span className={`mx-2 h-0.5 w-full min-w-3 rounded ${done ? "bg-[#16A34A]" : "bg-stone-200"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
