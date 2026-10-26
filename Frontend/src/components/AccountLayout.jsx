import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, LogOut, MapPin, Package, ShoppingBasket, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

const TABS = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/addresses", label: "Addresses", icon: MapPin },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
];

export default function AccountLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const { pushToast } = useShop();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    pushToast("Logged out of the demo session");
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl bg-[#14532D] p-7 text-white md:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold">
            {(user?.name || "G").trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold sm:text-2xl">{title}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-green-200">
              <span className="min-w-0 truncate">{user?.name} • {user?.email}</span>
              {user?.role === "admin" && (
                <span className="rounded-full bg-[#f97316] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  DEMO ADMIN
                </span>
              )}
            </p>
            {subtitle && <p className="mt-0.5 text-xs text-green-200/80">{subtitle}</p>}
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20"
          >
            <ShoppingBasket size={15} /> Back to store
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-3xl bg-white p-3 ring-1 ring-stone-100 lg:sticky lg:top-32">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-green-100 text-[#14532D]" : "text-stone-500 hover:bg-stone-100"
                  }`
                }
              >
                <t.icon size={17} /> {t.label}
              </NavLink>
            ))}
            <button
              onClick={onLogout}
              className="flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
            >
              <LogOut size={17} /> Logout
            </button>
          </nav>
          <p className="mt-2 px-4 pb-2 text-[11px] leading-relaxed text-stone-400">
            Frontend demo session only — not secure authentication.
          </p>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
