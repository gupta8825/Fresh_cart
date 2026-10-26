import { Link } from "react-router-dom";
import { ShoppingBasket, Globe, AtSign, Send, Play, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-8 bg-[#0f3d22] text-green-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16A34A] text-white">
              <ShoppingBasket size={22} />
            </span>
            <span className="text-xl font-extrabold text-white">Fresh<span className="text-green-400">Cart</span></span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-green-200/80">
            Everyday kirana essentials delivered fast. Atta, rice, dal, spices, snacks and household needs for every Indian kitchen.
          </p>
          <div className="mt-5 flex gap-2">
            {[Globe, AtSign, Send, Play].map((Icon, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} aria-label="Social link" className="rounded-full bg-white/10 p-2.5 transition hover:bg-[#16A34A]">
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-green-200/80">
            <li><Link to="/shop" className="hover:text-white">All Products</Link></li>
            <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link to="/deals" className="hover:text-white">Today's Deals</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-green-200/80">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/checkout" className="hover:text-white">Checkout</Link></li>
            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
            <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white">Delivery Info (demo)</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white">Returns (demo)</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-green-200/80">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> 123 Green Street, Mumbai 400001 (demo)</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" /> +91 98765 43210 (demo)</li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" /> hello@freshcart.demo</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-green-200/70 sm:flex-row">
          <p>© {new Date().getFullYear()} FreshCart. All rights reserved. Demo storefront.</p>
          <p>Made fresh daily • No real orders processed</p>
        </div>
      </div>
    </footer>
  );
}
