import { Truck, BadgePercent, Leaf } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-[#14532D] text-white text-[13px]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center">
        <Truck size={15} className="shrink-0 text-green-300" />
        <p className="truncate">
          <span className="font-semibold">Kirana essentials delivered to your door</span>
          <span className="mx-2 hidden sm:inline text-green-300">•</span>
          <span className="hidden sm:inline">FREE delivery on orders over ₹499</span>
        </p>
        <BadgePercent size={15} className="shrink-0 text-orange-300" />
        <span className="hidden items-center gap-1 md:flex text-green-200">
          <Leaf size={13} /> 100% Fresh
        </span>
      </div>
    </div>
  );
}
