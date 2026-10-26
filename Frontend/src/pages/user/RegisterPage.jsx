import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, ShoppingBasket } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const input =
  "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-3 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

export default function RegisterPage() {
  const { register } = useAuth();
  const { pushToast } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", pass: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.first.trim()) er.first = "Required.";
    if (!form.last.trim()) er.last = "Required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) er.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) er.phone = "Enter a valid 10-digit mobile number.";
    if (form.pass.length < 6) er.pass = "Minimum 6 characters (demo only — never reuse a real password).";
    if (form.confirm !== form.pass) er.confirm = "Passwords do not match.";
    if (!terms) er.terms = "Please accept the demo terms to continue.";
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    setBusy(true);
    setTimeout(() => {
      const res = register({
        name: `${form.first.trim()} ${form.last.trim()}`,
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setBusy(false);
      if (!res.ok) {
        setErrors({ form: res.error });
        return;
      }
      pushToast("Demo account created — logged in!");
      navigate("/profile", { replace: true });
    }, 500);
  };

  const err = (k) => errors[k] && <p className="mt-1 text-xs font-medium text-red-600">{errors[k]}</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-7 ring-1 ring-stone-100 sm:p-9">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16A34A] text-white">
            <ShoppingBasket size={22} />
          </span>
          <span className="text-xl font-extrabold">Fresh<span className="text-[#16A34A]">Cart</span></span>
        </Link>
        <h1 className="mt-5 text-2xl font-extrabold">Create your demo account</h1>
        <p className="mt-1 text-sm text-stone-500">
          Frontend demonstration only — your details stay in this browser. No real account is created.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
          <div><label htmlFor="reg-first" className="mb-1.5 block text-[13px] font-bold">First name *</label><input id="reg-first" value={form.first} onChange={set("first")} placeholder="Priya" className={input} />{err("first")}</div>
          <div><label htmlFor="reg-last" className="mb-1.5 block text-[13px] font-bold">Last name *</label><input id="reg-last" value={form.last} onChange={set("last")} placeholder="Sharma" className={input} />{err("last")}</div>
          <div><label htmlFor="reg-email" className="mb-1.5 block text-[13px] font-bold">Email *</label><input id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={input} autoComplete="email" />{err("email")}</div>
          <div><label htmlFor="reg-phone" className="mb-1.5 block text-[13px] font-bold">Mobile *</label><input id="reg-phone" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" maxLength={10} inputMode="numeric" className={input} />{err("phone")}</div>
          <div>
            <label htmlFor="reg-pass" className="mb-1.5 block text-[13px] font-bold">Password *</label>
            <div className="relative">
              <input id="reg-pass" type={show ? "text" : "password"} value={form.pass} onChange={set("pass")} placeholder="Min. 6 characters" className={`${input} pr-11`} autoComplete="new-password" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {err("pass")}
          </div>
          <div><label htmlFor="reg-confirm" className="mb-1.5 block text-[13px] font-bold">Confirm password *</label><input id="reg-confirm" type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" className={input} autoComplete="new-password" />{err("confirm")}</div>

          <label className="flex cursor-pointer items-start gap-2 text-[13px] text-stone-500 sm:col-span-2">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#16A34A]" />
            I agree to the demo Terms & Conditions. I understand no real account is created.
          </label>
          {err("terms")}
          {errors.form && <p className="rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600 sm:col-span-2">{errors.form}</p>}
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 sm:col-span-2">
            Demo safety: use a throwaway password — never your real one. Nothing is sent to a server and no password is stored.
          </p>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy} className="rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:opacity-60 sm:col-span-2">
            {busy ? "Creating demo account…" : "Create Account"}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          Already have a demo account? <Link to="/login" className="font-bold text-[#16A34A] hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
