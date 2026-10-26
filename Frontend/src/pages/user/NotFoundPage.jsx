import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-7xl">🍅</p>
      <h1 className="mt-4 text-4xl font-extrabold">404 — Page not found</h1>
      <p className="mt-2 text-sm text-stone-500">The page you're looking for wandered off the shelf.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white hover:bg-[#14532D]">Home</Link>
        <Link to="/shop" className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold hover:bg-stone-50">Shop</Link>
      </div>
    </div>
  );
}
