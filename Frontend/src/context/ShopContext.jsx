import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ShopContext = createContext(null);

import { getAvailability } from "../utils/availability";

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => read("freshcart_cart", []));
  const [wishlist, setWishlist] = useState(() => read("freshcart_wishlist", []));
  const [toasts, setToasts] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("freshcart_cart", JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("freshcart_wishlist", JSON.stringify(wishlist));
    } catch { /* ignore */ }
  }, [wishlist]);

  const pushToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  const addToCart = useCallback((product, qty = 1) => {
    if (!product) return;
    const avail = getAvailability(product);
    if (!avail.purchasable) {
      pushToast(
        avail.key === "unavailable"
          ? `${product.name} is currently unavailable`
          : `${product.name} is out of stock`,
        "error"
      );
      return;
    }
    const stock = avail.stock;
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        const nextQty = Math.min(found.qty + qty, stock || 99);
        return prev.map((i) => (i.id === product.id ? { ...i, qty: nextQty } : i));
      }
      return [...prev, { id: product.id, qty: Math.min(qty, stock || 99) }];
    });
    pushToast(`${product.name} added to cart`);
  }, [pushToast]);

  const updateQty = useCallback((id, qty) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (!exists) pushToast(`${product.name} saved to wishlist`);
      return exists ? prev.filter((id) => id !== product.id) : [...prev, product.id];
    });
  }, [pushToast]);

  const value = useMemo(() => ({
    cart, wishlist, toasts, quickView, cartOpen,
    setQuickView, setCartOpen, pushToast,
    addToCart, updateQty, removeFromCart, clearCart, toggleWishlist,
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    isWishlisted: (id) => wishlist.includes(id),
  }), [cart, wishlist, toasts, quickView, cartOpen, pushToast, addToCart, updateQty, removeFromCart, clearCart, toggleWishlist]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
};
