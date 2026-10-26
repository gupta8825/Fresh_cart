import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, ShoppingBasket } from "lucide-react";
import { useShop } from "../../context/ShopContext";

const input =
  "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-3 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

export default function ResetPasswordPage() {
  const { pushToast } = useShop();
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (pass.length < 6) er.pass = "Minimum 6 characters (demo only).";
    if (confirm !== pass) er.confirm = "Passwords do not match.";
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    // Demo UI only: no password is changed or stored anywhere.
    pushToast("Demo reset complete — no real password was changed");
    navigate("/login");
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
        <h1 className="mt-5 text-2xl font-extrabold">Reset password <span className="text-sm font-medium text-stone-400">(demo UI)</span></h1>
        <p className="mt-1 text-sm text-stone-500">
          Demonstration only — nothing is changed or stored. Real resets require a backend.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="rp-pass" className="mb-1.5 block text-[13px] font-bold">New password</label>
            <div className="relative">
              <input id="rp-pass" type={show ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 6 characters" className={`${input} pr-11`} autoComplete="new-password" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.pass && <p className="mt-1 text-xs font-medium text-red-600">{errors.pass}</p>}
          </div>
          <div>
            <label htmlFor="rp-confirm" className="mb-1.5 block text-[13px] font-bold">Confirm new password</label>
            <input id="rp-confirm" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className={input} autoComplete="new-password" />
            {errors.confirm && <p className="mt-1 text-xs font-medium text-red-600">{errors.confirm}</p>}
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" className="rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D]">
            Reset Password (Demo)
          </motion.button>
          <Link to="/login" className="text-center text-sm font-semibold text-stone-400 hover:text-stone-600">Back to Login</Link>
        </form>
      </motion.div>
    </div>
  );
}
