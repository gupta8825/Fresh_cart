import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Info, Mail, ShoppingBasket } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-7 ring-1 ring-stone-100 sm:p-9">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16A34A] text-white">
            <ShoppingBasket size={22} />
          </span>
          <span className="text-xl font-extrabold">Fresh<span className="text-[#16A34A]">Cart</span></span>
        </Link>
        <h1 className="mt-5 text-2xl font-extrabold">Forgot password?</h1>
        <p className="mt-1 text-sm text-stone-500">Enter your account email for a demo recovery message.</p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-green-50 p-5 ring-1 ring-green-100">
            <p className="flex items-start gap-2 text-sm font-semibold text-[#14532D]">
              <Info size={18} className="mt-0.5 shrink-0" />
              Demo only — no email was sent to <span className="break-all">{email.trim()}</span>.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-stone-500">
              Real password recovery needs a backend and email service. To preview the UI, continue to the demo
              reset screen, or go back to login and use a demo account.
            </p>
            <div className="mt-4 grid gap-2">
              <Link to="/reset-password" className="rounded-full bg-[#16A34A] py-3 text-center text-sm font-bold text-white hover:bg-[#14532D]">
                Preview Reset Screen (Demo)
              </Link>
              <Link to="/login" className="rounded-full border border-stone-200 py-3 text-center text-sm font-bold hover:bg-stone-50">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="fp-email" className="mb-1.5 block text-[13px] font-bold">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-stone-200 bg-[#FAFAF5] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100" />
              </div>
              {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
            </div>
            <motion.button whileTap={{ scale: 0.98 }} type="submit" className="rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D]">
              Send Reset Link (Demo)
            </motion.button>
            <Link to="/login" className="text-center text-sm font-semibold text-stone-400 hover:text-stone-600">Back to Login</Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
