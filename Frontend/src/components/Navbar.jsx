import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Languages, Check, LayoutDashboard, LogIn, LogOut, MapPin, Menu, Package, Search, ShoppingCart, ShoppingBasket, User, UserPlus, UserRound, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/masala", label: "Masala" },
  { to: "/categories", label: "Categories" },
  { to: "/deals", label: "Deals" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { cartCount, wishlist, setCartOpen, pushToast } = useShop();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click-only dropdown: close on outside click or Escape. No hover handlers.
  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  const closeProfile = () => setProfileOpen(false);

  const handleLogout = () => {
    logout();
    closeProfile();
    setMobileOpen(false);
    pushToast("Logged out. Your cart, wishlist and orders are kept.", "success");
    navigate("/");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          className="rounded-lg p-2 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16A34A] text-white shadow-md shadow-green-200">
            <ShoppingBasket size={22} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Fresh<span className="text-[#16A34A]">Cart</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-green-100 text-[#14532D]" : "text-stone-600 hover:bg-stone-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center md:flex">
          <div className="relative w-full">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search atta, dal, tea…"
              className="w-full rounded-full border border-stone-200 bg-[#FAFAF5] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              aria-expanded={profileOpen}
              aria-controls="profile-menu"
              aria-label="Open profile menu"
              className="rounded-full p-2.5 text-stone-600 hover:bg-green-50 hover:text-[#16A34A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
            >
              {isLoggedIn ? (
                <span className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#16A34A] text-[11px] font-extrabold text-white" aria-hidden="true">
                  {(user?.name || user?.email || "U").trim().charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={21} />
              )}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  id="profile-menu"
                  role="menu"
                  aria-label="Profile menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-stone-200"
                >
                  {isLoggedIn ? (
                    <>
                      <div className="border-b border-stone-100 px-4 py-3">
                        <p className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                          <UserRound size={16} className="text-[#16A34A]" />
                          <span className="truncate">{user?.name || "FreshCart user"}</span>
                        </p>
                        {user?.email && <p className="mt-0.5 truncate pl-6 text-xs text-stone-400">{user.email}</p>}
                      </div>
                      {[
                        { to: "/profile", icon: User, label: "My Profile" },
                        { to: "/orders", icon: Package, label: "My Orders" },
                        { to: "/wishlist", icon: Heart, label: "My Wishlist" },
                        { to: "/addresses", icon: MapPin, label: "My Addresses" },
                        ...(isAdmin ? [{ to: "/admin", icon: LayoutDashboard, label: "Admin Dashboard" }] : []),
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          onClick={closeProfile}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16A34A]"
                        >
                          <item.icon size={16} className="text-[#16A34A]" /> {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-stone-100 px-4 py-2">
                        <p className="flex items-center gap-2 px-0 py-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                          <Languages size={14} className="text-[#16A34A]" /> {t("nav.langLabel")}
                        </p>
                        {[
                          { code: "en", label: t("lang.english") },
                          { code: "hi", label: t("lang.hindi") },
                        ].map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            role="menuitemradio"
                            aria-checked={lang === l.code}
                            onClick={() => { setLang(l.code); closeProfile(); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-stone-700 hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16A34A]"
                          >
                            <span className="w-4 text-[#16A34A]">{lang === l.code ? <Check size={15} /> : null}</span> {l.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 border-t border-stone-100 px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-b border-stone-100 px-4 py-3">
                        <p className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                          <UserRound size={16} className="text-[#16A34A]" /> Welcome to FreshCart
                        </p>
                        <p className="mt-0.5 pl-6 text-xs text-stone-400">Log in for orders, wishlist & addresses (demo).</p>
                      </div>
                      <Link
                        to="/login"
                        role="menuitem"
                        onClick={closeProfile}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16A34A]"
                      >
                        <LogIn size={16} className="text-[#16A34A]" /> Login
                      </Link>
                      <Link
                        to="/register"
                        role="menuitem"
                        onClick={closeProfile}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16A34A]"
                      >
                        <UserPlus size={16} className="text-[#16A34A]" /> Sign Up
                      </Link>
                      <div className="border-t border-stone-100 px-4 py-2">
                        <p className="flex items-center gap-2 px-0 py-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                          <Languages size={14} className="text-[#16A34A]" /> {t("nav.langLabel")}
                        </p>
                        {[
                          { code: "en", label: t("lang.english") },
                          { code: "hi", label: t("lang.hindi") },
                        ].map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            role="menuitemradio"
                            aria-checked={lang === l.code}
                            onClick={() => { setLang(l.code); closeProfile(); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-stone-700 hover:bg-green-50 hover:text-[#14532D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16A34A]"
                          >
                            <span className="w-4 text-[#16A34A]">{lang === l.code ? <Check size={15} /> : null}</span> {l.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/wishlist" className="relative rounded-full p-2.5 text-stone-600 hover:bg-green-50 hover:text-[#16A34A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]" aria-label="Wishlist">
            <Heart size={21} />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f97316] px-1 text-[11px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2.5 text-stone-600 hover:bg-green-50 hover:text-[#16A34A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
            aria-label="Cart"
          >
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16A34A] px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* mobile search */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={submitSearch} className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groceries…"
            className="w-full rounded-full border border-stone-200 bg-[#FAFAF5] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#16A34A]"
          />
        </form>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold">Fresh<span className="text-[#16A34A]">Cart</span></span>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-stone-100" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-green-100 text-[#14532D]" : "hover:bg-stone-100"}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <NavLink to="/wishlist" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-stone-100">
                  Wishlist ({wishlist.length})
                </NavLink>
                <NavLink to="/cart" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-stone-100">
                  Cart ({cartCount})
                </NavLink>
                {isLoggedIn ? (
                  <>
                    <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-stone-100">
                      My Profile{user?.name ? ` (${user.name.split(" ")[0]})` : ""}
                    </NavLink>
                    <button onClick={handleLogout} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-stone-100">
                      Login
                    </NavLink>
                    <NavLink to="/register" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-stone-100">
                      Sign Up
                    </NavLink>
                  </>
                )}
              </nav>
              <p className="mt-auto text-xs text-stone-400">Free delivery over ₹499 • 100% fresh</p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
