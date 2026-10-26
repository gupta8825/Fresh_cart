import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { PRODUCTS } from "../../data/products";
import { useShop } from "../../context/ShopContext";

export default function WishlistPage() {
  const { wishlist } = useShop();
  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
        <Heart size={26} className="text-red-500" fill="currentColor" /> My Wishlist ({items.length})
      </h1>
      <p className="mt-1 text-sm text-stone-500">Saved items are stored in your browser (demo).</p>
      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center ring-1 ring-stone-100 sm:p-14">
          <p className="text-5xl">💚</p>
          <h2 className="mt-4 font-extrabold">Nothing saved yet</h2>
          <p className="mt-1 text-sm text-stone-500">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="mt-5 inline-block rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Discover Products</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
