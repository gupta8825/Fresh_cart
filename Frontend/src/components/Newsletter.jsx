import { useState } from "react";
import { motion } from "motion/react";
import { MailCheck, Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });

  const submit = (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      setStatus({ type: "error", msg: "Please enter a valid email address." });
      return;
    }
    setStatus({ type: "success", msg: "You're subscribed! Fresh deals are on the way. (Demo only)" });
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-stone-100 md:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-[#16A34A]">
          <MailCheck size={26} />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-stone-900 sm:text-3xl">Get fresh deals in your inbox</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
          Kirana offers, monthly deals and festive picks. No spam — demo signup, no external service.
        </p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            className="flex-1 rounded-full border border-stone-200 bg-[#FAFAF5] px-5 py-3 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
          />
          <motion.button whileTap={{ scale: 0.96 }} type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white shadow-md shadow-green-200 hover:bg-[#14532D]">
            <Send size={16} /> Subscribe
          </motion.button>
        </form>
        {status.msg && (
          <p className={`mt-3 text-sm font-medium ${status.type === "error" ? "text-red-600" : "text-[#16A34A]"}`}>
            {status.msg}
          </p>
        )}
      </div>
    </section>
  );
}
