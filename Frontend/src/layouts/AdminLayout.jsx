import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity, BarChart3, Bell, Bot, ChevronDown, FileText, LayoutDashboard, LogOut,
  Menu, Package, Settings, ShoppingBasket, ShoppingCart, Tags, Ticket, Users, Warehouse, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { getActivity, seedActivityIfEmpty } from "../utils/demoStore";

export const ADMIN_LINKS = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/requests", label: "AI Requests", icon: Bot },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/activity", label: "Activity Log", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const TITLES = {
  "/admin": ["Dashboard", "Store overview"],
  "/admin/analytics": ["Analytics", "Sales trends (demo data)"],
  "/admin/products": ["Products", "Catalogue management (demo)"],
  "/admin/categories": ["Categories", "Category management (demo)"],
  "/admin/orders": ["Orders", "Demo order management"],
  "/admin/requests": ["AI Requests", "Demo assistant request log"],
  "/admin/customers": ["Customers", "Demo customer directory"],
  "/admin/inventory": ["Inventory", "Stock management (demo)"],
  "/admin/coupons": ["Coupons", "Demo promotion management"],
  "/admin/reports": ["Reports", "Summaries + CSV export (demo)"],
  "/admin/activity": ["Activity Log", "Local demo events"],
  "/admin/settings": ["Settings", "Demo store preferences"],
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pushToast } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    seedActivityIfEmpty();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const [title, subtitle] = TITLES[location.pathname] || ["Admin", "FreshCart demo administration"];

  const doLogout = () => {
    logout();
    pushToast("Logged out of the demo admin session");
    navigate("/login");
  };

  const recentActivity = getActivity().slice(0, 5);

  const searchMatches = adminSearch.trim()
    ? ADMIN_LINKS.filter((l) => l.label.toLowerCase().includes(adminSearch.trim().toLowerCase()))
    : [];

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#16A34A] text-white">
          <ShoppingBasket size={22} />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold text-white">FreshCart <span className="text-green-400">Admin</span></span>
            <span className="block text-[11px] text-green-200/70">Demo dashboard</span>
          </span>
        )}
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {ADMIN_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            title={l.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-[#16A34A] text-white shadow" : "text-green-100/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <l.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{l.label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div className="px-3 pb-2">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-green-100/70 hover:bg-white/10 hover:text-white">
            <ShoppingBasket size={18} /> Back to Store
          </Link>
          <button onClick={doLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/20">
            <LogOut size={18} /> Logout
          </button>
          <p className="px-3.5 pb-3 pt-2 text-[11px] leading-relaxed text-green-200/50">
            Frontend demo only — not secure administration.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F2]">
      {/* desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden bg-[#0f3d22] transition-all lg:block ${collapsed ? "w-20" : "w-64"}`}>
        {sidebar}
      </aside>
      {collapsed && (
        <div className="fixed bottom-4 left-0 z-40 hidden w-20 flex-col items-center gap-1 lg:flex">
          <Link to="/" title="Back to Store" className="rounded-xl p-2.5 text-green-100/70 hover:bg-white/10 hover:text-white"><ShoppingBasket size={18} /></Link>
          <button onClick={doLogout} title="Logout" className="rounded-xl p-2.5 text-red-300 hover:bg-red-500/20"><LogOut size={18} /></button>
        </div>
      )}

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-50 bg-black/50 lg:hidden" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0f3d22] lg:hidden"
            >
              <div className="flex items-center justify-end px-4 pt-4">
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-white hover:bg-white/10"><X size={20} /></button>
              </div>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`transition-all ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* topbar */}
        <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-2 px-4 py-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open admin menu" className="rounded-lg p-2 hover:bg-stone-100 lg:hidden">
              <Menu size={20} />
            </button>
            <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="hidden rounded-lg p-2 hover:bg-stone-100 lg:block">
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold sm:text-lg">{title}</h1>
              <p className="hidden truncate text-xs text-stone-400 sm:block">{subtitle}</p>
            </div>

            <div className="relative ml-auto hidden md:block">
              <input
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Jump to… (products, orders)"
                aria-label="Admin navigation search"
                className="w-56 rounded-full border border-stone-200 bg-[#FAFAF5] px-4 py-2 text-sm outline-none focus:border-[#16A34A] focus:bg-white"
              />
              {searchMatches.length > 0 && (
                <div className="absolute right-0 top-11 w-60 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-200">
                  {searchMatches.map((m) => (
                    <Link key={m.to} to={m.to} onClick={() => setAdminSearch("")} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-green-50">
                      <m.icon size={16} className="text-[#16A34A]" /> {m.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative ml-auto md:ml-0" ref={notifRef}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} aria-label="Notifications" className="relative rounded-full p-2.5 hover:bg-stone-100">
                <Bell size={20} />
                {recentActivity.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f97316]" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-200">
                  <p className="border-b border-stone-100 px-4 py-3 text-sm font-extrabold">Notifications <span className="font-medium text-stone-400">(demo)</span></p>
                  {recentActivity.map((a) => (
                    <Link key={a.id} to="/admin/activity" className="block border-b border-stone-50 px-4 py-2.5 last:border-0 hover:bg-green-50/50">
                      <p className="truncate text-[13px] font-semibold">{a.text}</p>
                      <p className="text-[11px] text-stone-400">{new Date(a.date).toLocaleString("en-IN")}</p>
                    </Link>
                  ))}
                  <Link to="/admin/activity" className="block bg-stone-50 px-4 py-2.5 text-center text-[13px] font-bold text-[#14532D] hover:bg-green-100">View all activity</Link>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-1.5 rounded-full p-1 hover:bg-stone-100" aria-label="Admin profile menu">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532D] text-sm font-extrabold text-white">
                  {(user?.name || "A").trim().charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={15} className="text-stone-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-200">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="truncate text-sm font-extrabold">{user?.name}</p>
                    <p className="truncate text-xs text-stone-400">{user?.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">DEMO ADMIN</span>
                  </div>
                  <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-green-50">My Profile</Link>
                  <Link to="/" className="block px-4 py-2.5 text-sm hover:bg-green-50">Back to Store</Link>
                  <button onClick={doLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">
          <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-2.5 text-xs text-amber-800 ring-1 ring-amber-100">
            Demo dashboard — metrics and records are frontend sample data. No real sales, secure admin, or backend is involved.
          </p>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
