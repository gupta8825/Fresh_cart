import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, MapPin, Package, Pencil } from "lucide-react";
import AccountLayout from "../../components/AccountLayout";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const input =
  "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

function orderCount() {
  try {
    return JSON.parse(localStorage.getItem("freshcart_orders") || "[]").length;
  } catch {
    return 0;
  }
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { wishlist, pushToast } = useShop();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [errors, setErrors] = useState({});

  const startEdit = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
    setErrors({});
    setEditing(true);
  };

  const save = () => {
    const er = {};
    if (form.name.trim().length < 3) er.name = "Enter your full name.";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      er.phone = "Enter a valid 10-digit mobile number.";
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
    setEditing(false);
    pushToast("Profile updated (demo)");
  };

  return (
    <AccountLayout title="My Account" subtitle="Frontend demo profile — stored only in this browser.">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-extrabold">Profile summary</h2>
            {!editing && (
              <button onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-full border border-green-200 px-4 py-2 text-[13px] font-bold text-[#14532D] hover:bg-green-50">
                <Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pf-name" className="mb-1.5 block text-[13px] font-bold">Full name</label>
                <input id="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
                {errors.name && <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="pf-phone" className="mb-1.5 block text-[13px] font-bold">Mobile</label>
                <input id="pf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={10} inputMode="numeric" className={input} />
                {errors.phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button onClick={save} className="rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Save Changes</button>
                <button onClick={() => setEditing(false)} className="rounded-full border border-stone-200 px-6 py-2.5 text-sm font-bold hover:bg-stone-50">Cancel</button>
              </div>
            </div>
          ) : (
            <dl className="mt-4 divide-y divide-stone-100 text-sm">
              {[
                ["Full name", user?.name || "—"],
                ["Email", user?.email || "—"],
                ["Mobile", user?.phone || "Not added"],
                ["Role", user?.role === "admin" ? "Demo Admin (frontend demo)" : "Demo Customer (frontend demo)"],
                ["Member since", user?.joined ? new Date(user.joined).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-stone-400">{k}</dt>
                  <dd className="min-w-0 break-all text-right font-semibold text-stone-800">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </motion.section>

        <aside className="flex flex-col gap-3">
          {[
            { to: "/orders", icon: Package, title: "My Orders", sub: `${orderCount()} demo orders` },
            { to: "/addresses", icon: MapPin, title: "Addresses", sub: "Manage delivery addresses" },
            { to: "/wishlist", icon: Heart, title: "Wishlist", sub: `${wishlist.length} saved items` },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-100 transition hover:shadow-md hover:shadow-green-100">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-[#16A34A]">
                <c.icon size={20} />
              </span>
              <span>
                <span className="block text-sm font-extrabold">{c.title}</span>
                <span className="block text-xs text-stone-400">{c.sub}</span>
              </span>
            </Link>
          ))}
        </aside>
      </div>
    </AccountLayout>
  );
}
