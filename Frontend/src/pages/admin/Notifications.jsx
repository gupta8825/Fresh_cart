import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BellOff, CheckCheck } from "lucide-react";
import {
  formatDateTime, getNotifications, markAllNotificationsRead, markNotificationRead,
  timeAgo, useDemoVersion,
} from "../../utils/demoStore";
import { EmptyState, SearchInput, btnGhost, card } from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useShop } from "../../context/ShopContext";
import { useGsapScope } from "../../hooks/useGsap";

export default function Notifications() {
  const v = useDemoVersion();
  const { pushToast } = useShop();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [hideRead, setHideRead] = useState(false);

  const list = useMemo(() => getNotifications(), [v]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.filter((n) => (!hideRead || !n.read) && (!needle || [n.text, n.orderRef].filter(Boolean).join(" ").toLowerCase().includes(needle)));
  }, [list, q, hideRead]);
  const unread = list.filter((n) => !n.read).length;

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Inbox"
        title="Customer notifications"
        sub="In-app demo alerts linked to order IDs — no SMS/email/push service is connected."
        right={
          <>
            <button onClick={() => { markAllNotificationsRead(); pushToast("All demo notifications marked read."); }} disabled={!unread} className={`${btnGhost} disabled:opacity-40`}>
              <CheckCheck size={15} /> Mark all read
            </button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search notifications…" />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={hideRead} onChange={(e) => setHideRead(e.target.checked)} className="h-4 w-4 accent-[#16A34A]" />
          Hide read
        </label>
        <span className="ml-auto self-center text-[13px] text-stone-500">{unread} unread (demo)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No demo notifications"
          sub="New order alerts appear here while you work. Nothing is sent anywhere."
          action={<Link to="/admin/orders" className="mt-4 inline-block rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Open orders →</Link>}
        />
      ) : (
        <div className={`${card} !p-3`}>
          <ul className="divide-y divide-stone-100">
            {filtered.map((n) => (
              <li key={n.id} className={`flex flex-wrap items-center gap-2 px-2 py-2.5 ${n.read ? "opacity-60" : ""}`}>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#f97316]" aria-label="Unread" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-stone-800">{n.text}</span>
                  <span className="block text-[11px] text-stone-400">{formatDateTime(n.date)} • {timeAgo(n.date)}</span>
                </span>
                {n.orderRef && (
                  <Link to={`/admin/orders?ref=${n.orderRef}`} className="rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A]">
                    Open order
                  </Link>
                )}
                {!n.read ? (
                  <button onClick={() => markNotificationRead(n.id)} className="rounded-full border border-stone-200 px-3.5 py-1.5 text-xs font-bold hover:bg-stone-50">
                    Mark read
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-300"><BellOff size={13} /> Read</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
