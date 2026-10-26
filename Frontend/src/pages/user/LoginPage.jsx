import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail, ShoppingBasket } from "lucide-react";
import { DEMO_ACCOUNTS, useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const input =
  "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-3 pl-11 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

export default function LoginPage() {
  const { login } = useAuth();
  const { pushToast } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) er.email = "Enter a valid email address.";
    if (!password) er.password = "Enter your password.";
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    setBusy(true);
    setTimeout(() => {
      const res = login(email, password, { remember });
      setBusy(false);
      if (!res.ok) {
        setErrors({ form: res.error });
        return;
      }
      pushToast(`Welcome back, ${res.user.name.split(" ")[0]}! (demo session)`);
      if (res.demoNotice) pushToast(res.demoNotice, "error");
      navigate(from, { replace: true });
    }, 500);
  };

  const quickLogin = (acc) => {
    setBusy(true);
    setTimeout(() => {
      const res = login(acc.email, acc.password, { remember: true });
      setBusy(false);
      if (res.ok) {
        pushToast(`Logged in as ${res.user.name} (demo)`);
        navigate(res.user.role === "admin" ? "/profile" : from, { replace: true });
      }
    }, 400);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-2">
      <div className="hidden overflow-hidden rounded-3xl bg-[#14532D] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
            <ShoppingBasket size={22} />
          </span>
          <span className="text-xl font-extrabold">FreshCart</span>
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Fresh groceries, saved picks & faster demo checkout.</h2>
          <p className="mt-3 text-sm text-green-200">
            Log in to explore the demo account experience — orders, addresses and wishlist, all in your browser.
          </p>
        </div>
        <p className="text-xs text-green-200/70">Frontend demo only. No real authentication.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-7 ring-1 ring-stone-100 sm:p-9">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">Log in to your FreshCart demo account.</p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-bold">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} autoComplete="email" />
            </div>
            {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="login-pass" className="mb-1.5 block text-[13px] font-bold">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input id="login-pass" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${input} pr-11`} autoComplete="current-password" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
          </div>

          {errors.form && <p className="rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600">{errors.form}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-stone-500">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#16A34A]" />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-[#16A34A] hover:underline">Forgot password?</Link>
          </div>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy} className="rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:opacity-60">
            {busy ? "Logging in…" : "Login"}
          </motion.button>
        </form>

        <div className="mt-6 rounded-2xl bg-[#FAFAF5] p-4 ring-1 ring-stone-100">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#14532D]">Demo login — no backend</p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.email} onClick={() => quickLogin(a)} disabled={busy} className="rounded-2xl border border-green-200 bg-white p-3 text-left transition hover:bg-green-50 disabled:opacity-60">
                <p className="text-[13px] font-extrabold">{a.role === "admin" ? "Demo Admin" : "Demo User"}</p>
                <p className="text-[11px] text-stone-400">{a.email} • {a.password}</p>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-stone-500">
          New here? <Link to="/register" className="font-bold text-[#16A34A] hover:underline">Create a demo account</Link>
        </p>
      </motion.div>
    </div>
  );
}
