import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ShoppingCart, Trash2, X } from "lucide-react";
import { PRODUCTS, formatPrice } from "../data/products";
import { useShop } from "../context/ShopContext";
import { QtyStepper } from "./ProductCard";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeFromCart, cartCount } = useShop();
  const navigate = useNavigate();

  const detailed = cart
    .map((ci) => ({ ...ci, product: PRODUCTS.find((p) => p.id === ci.id) }))
    .filter((x) => x.product);

  const subtotal = detailed.reduce((s, x) => s + x.product.price * x.qty, 0);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[81] flex h-full w-full max-w-md flex-col bg-[#FAFAF5] shadow-2xl"
          >
            <div className="flex items-center justify-between bg-white px-5 py-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <ShoppingCart size={19} className="text-[#16A34A]" /> Your Cart ({cartCount})
              </h3>
              <button onClick={() => setCartOpen(false)} className="rounded-lg p-2 hover:bg-stone-100" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {detailed.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
                    <ShoppingCart size={32} />
                  </span>
                  <p className="mt-4 font-bold text-stone-800">Your cart is empty</p>
                  <p className="mt-1 text-sm text-stone-500">Add fresh groceries to get started.</p>
                  <button
                    onClick={() => { setCartOpen(false); navigate("/shop"); }}
                    className="mt-5 rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {detailed.map(({ product, qty }) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100"
                      >
                        <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-stone-900">{product.name}</p>
                          <p className="text-xs text-stone-400">{formatPrice(product.price)} • {product.unit}</p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <QtyStepper qty={qty} max={product.stock} small onChange={(q) => (q === 0 ? removeFromCart(product.id) : updateQty(product.id, q))} />
                            <span className="text-sm font-extrabold">{formatPrice(product.price * qty)}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(product.id)} className="self-start rounded-lg p-2 text-stone-300 hover:bg-red-50 hover:text-red-500" aria-label="Remove">
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {detailed.length > 0 && (
              <div className="bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-lg font-extrabold">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-stone-400">
                  {subtotal >= 499 ? "You've unlocked FREE delivery!" : `Add ${formatPrice(499 - subtotal)} more for FREE delivery`}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link to="/cart" onClick={() => setCartOpen(false)} className="rounded-full border border-green-200 py-2.5 text-center text-sm font-bold text-[#14532D] hover:bg-green-50">
                    View Cart
                  </Link>
                  <Link to="/checkout" onClick={() => setCartOpen(false)} className="flex items-center justify-center gap-1 rounded-full bg-[#16A34A] py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">
                    Checkout <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
