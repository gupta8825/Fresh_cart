import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Frontend-only demo session. NOT real authentication, NOT secure.
// - Demo credentials live in code (never in storage).
// - No password is ever written to localStorage/sessionStorage.
// - Registered demo profiles store name/email/phone/role only.
// ---------------------------------------------------------------------------
export const DEMO_ACCOUNTS = [
  { email: "priya@example.com", password: "fresh123", name: "Priya Sharma", role: "customer", phone: "9812345678" },
  { email: "admin@freshcart.in", password: "admin123", name: "FreshCart Admin", role: "admin", phone: "9876543210" },
];

const SESSION_KEY = "freshcart_user";
const USERS_KEY = "freshcart_demo_users";

function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readSession() {
  try {
    return (
      JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null") ||
      JSON.parse(localStorage.getItem(SESSION_KEY) || "null")
    );
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [remember, setRemember] = useState(() => {
    try {
      return !!localStorage.getItem(SESSION_KEY);
    } catch {
      return true;
    }
  });

  const persist = useCallback((next, sticky) => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      if (next) {
        (sticky ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(next));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    persist(user, remember);
  }, [user, remember, persist]);

  const login = useCallback((email, password, opts = {}) => {
    const emailNorm = String(email || "").trim().toLowerCase();
    const demo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === emailNorm);
    if (demo) {
      if (password !== demo.password) {
        return { ok: false, error: "Incorrect demo password for this demo account." };
      }
      const safe = {
        id: `demo-${demo.role}`,
        name: demo.name,
        email: demo.email,
        phone: demo.phone,
        role: demo.role,
        joined: "2025-06-02T10:00:00.000Z",
        demo: true,
      };
      if (typeof opts.remember === "boolean") setRemember(opts.remember);
      setUser(safe);
      return { ok: true, user: safe };
    }
    // Self-registered demo profiles: no password is stored or verified
    // (there is no backend). Entry is a labelled demo convenience.
    const users = readStore(USERS_KEY) || [];
    const found = users.find((u) => u.email.toLowerCase() === emailNorm);
    if (!found) {
      return { ok: false, error: "No demo account found for this email. Use a demo login or Register." };
    }
    if (typeof opts.remember === "boolean") setRemember(opts.remember);
    setUser({ ...found, demo: true });
    return { ok: true, user: found, demoNotice: "Demo session — password is not verified (no backend)." };
  }, []);

  const register = useCallback((profile) => {
    const emailNorm = String(profile.email || "").trim().toLowerCase();
    if (DEMO_ACCOUNTS.some((d) => d.email.toLowerCase() === emailNorm)) {
      return { ok: false, error: "This email belongs to a built-in demo account. Try logging in." };
    }
    const users = readStore(USERS_KEY) || [];
    if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
      return { ok: false, error: "This email is already registered in the demo. Try logging in." };
    }
    // NOTE: password is intentionally NOT stored anywhere.
    const nu = {
      id: `u-${Date.now()}`,
      name: String(profile.name || "").trim(),
      email: String(profile.email || "").trim(),
      phone: String(profile.phone || ""),
      role: "customer",
      joined: new Date().toISOString(),
      demo: true,
    };
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, nu]));
    } catch { /* ignore */ }
    setUser(nu);
    return { ok: true, user: nu };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persist(null, true);
  }, [persist]);

  const updateProfile = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, demo: true };
      try {
        const users = readStore(USERS_KEY) || [];
        if (users.some((u) => u.id === prev.id)) {
          localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users.map((u) => (u.id === prev.id ? { ...u, ...patch } : u)))
          );
        }
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isAdmin: user?.role === "admin",
      remember,
      setRemember,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, remember, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
