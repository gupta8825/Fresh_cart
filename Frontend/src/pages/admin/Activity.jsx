import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getActivity, formatDateTime, timeAgo, useDemoVersion } from "../../utils/demoStore";
import { EmptyState, SearchInput, card } from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useGsapScope } from "../../hooks/useGsap";

export default function Activity() {
  const v = useDemoVersion();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("All");

  const list = useMemo(() => getActivity(), [v]);
  const kinds = useMemo(() => ["All", ...new Set(list.map((a) => a.kind).filter(Boolean))], [list]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list
      .filter((a) => (kind === "All" ? true : a.kind === kind))
      .filter((a) =>
        needle ? [a.text, a.kind].filter(Boolean).join(" ").toLowerCase().includes(needle) : true
      );
  }, [list, q, kind]);

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Audit"
        title="Activity log"
        sub="Local demo events from orders, inventory, coupons and expenses — newest first."
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search activity…" />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          aria-label="Activity kind filter"
          className="w-auto rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white"
        >
          {kinds.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <span className="ml-auto self-center text-[13px] text-stone-500">{filtered.length} events (demo)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No demo activity"
          sub="Admin actions and new orders are logged here on this device."
          action={
            <Link
              to="/admin/orders"
              className="mt-4 inline-block rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]"
            >
              Open orders →
            </Link>
          }
        />
      ) : (
        <div className={`${card} !p-3`}>
          <ul className="divide-y divide-stone-100">
            {filtered.slice(0, 120).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2 px-2 py-2.5">
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-500">
                  {a.kind || "event"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-stone-800">{a.text}</span>
                  <span className="block text-[11px] text-stone-400">
                    {formatDateTime(a.date)} • {timeAgo(a.date)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
