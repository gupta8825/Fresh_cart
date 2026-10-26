import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function Toasts() {
  const { toasts } = useShop();
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${
              t.type === "error" ? "bg-stone-900 text-white" : "bg-[#14532D] text-white"
            }`}
          >
            {t.type === "error" ? <AlertCircle size={18} className="shrink-0 text-red-300" /> : <CheckCircle2 size={18} className="shrink-0 text-green-300" />}
            <span className="line-clamp-2">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
