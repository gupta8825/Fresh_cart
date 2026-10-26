// Hand-rolled responsive SVG charts (no extra dependencies):
// AreaChart (sales line/area + P&L bars), HBarList (rankings), DonutChart
// (status/category splits), Sparkline (KPI minis). All include empty states,
// text labels and <title> tooltips for accessibility.

function fmtShort(n) {
  n = Number(n) || 0;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}

export function ChartEmpty({ label = "No data in this period", dark = false }) {
  return (
    <div className={`flex h-44 items-center justify-center rounded-2xl text-sm ring-1 ${dark ? "bg-white/5 text-slate-400 ring-white/10" : "bg-[#FAFAF5] text-stone-400 ring-stone-100"}`}>
      {label} — demo data only, nothing fabricated.
    </div>
  );
}

export function AreaChart({ points = [], xKey = "label", series = [{ key: "net", color: "#16A34A", label: "Net sales" }], height = 220, money = true, dark = false }) {
  const ax = dark ? "#94a3b8" : "#a8a29e";
  const lx = dark ? "#cbd5e1" : "#57534e";
  const grid = dark ? "rgba(255,255,255,0.12)" : "#e7e5e4";
  if (!points.length || points.every((p) => series.every((s) => !(Number(p[s.key]) > 0)))) {
    return <ChartEmpty dark={dark} />;
  }
  const W = 640;
  const H = height;
  const PAD = { l: 52, r: 12, t: 12, b: 30 };
  const max = Math.max(1, ...points.map((p) => Math.max(...series.map((s) => Number(p[s.key]) || 0))));
  const stepX = points.length > 1 ? (W - PAD.l - PAD.r) / (points.length - 1) : 0;
  const y = (v) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const x = (i) => PAD.l + i * stepX;
  const ticks = [0, 0.5, 1].map((f) => max * f);
  const stride = Math.max(1, Math.ceil(points.length / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${series.map((s) => s.label).join(", ")} chart`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke={grid} strokeDasharray="4 4" />
          <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill={ax}>{money ? fmtShort(t) : Math.round(t)}</text>
        </g>
      ))}
      {series.map((s) => {
        const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(Number(p[s.key]) || 0)}`).join(" ");
        const area = `${line} L${x(points.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`;
        return (
          <g key={s.key}>
            <title>{s.label}</title>
            <path d={area} fill={s.color} opacity={0.12} />
            <path d={line} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={x(i)} cy={y(Number(p[s.key]) || 0)} r={2.4} fill={s.color}>
                <title>{`${p[xKey]}: ${s.label} ${money ? fmtShort(p[s.key]) : p[s.key]}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
      {points.map((p, i) => (
        i % stride === 0 ? <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="10.5" fill={ax}>{String(p[xKey]).slice(0, 9)}</text> : null
      ))}
      <g fontSize="11.5">
        {series.map((s, i) => (
          <g key={s.key} transform={`translate(${PAD.l + i * 130},${H - 2})`}>
            <rect width="10" height="10" rx="3" fill={s.color} />
            <text x="14" y="9.5" fill={lx}>{s.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function GroupBars({ points = [], xKey = "label", bars = [{ key: "net", color: "#16A34A", label: "Net" }, { key: "cogs", color: "#f97316", label: "COGS" }], height = 220, dark = false }) {
  const ax = dark ? "#94a3b8" : "#a8a29e";
  const lx = dark ? "#cbd5e1" : "#57534e";
  const grid = dark ? "rgba(255,255,255,0.12)" : "#e7e5e4";
  if (!points.length || points.every((p) => bars.every((b) => !(Number(p[b.key]) > 0)))) {
    return <ChartEmpty dark={dark} />;
  }
  const W = 640;
  const H = height;
  const PAD = { l: 52, r: 12, t: 12, b: 46 };
  const max = Math.max(1, ...points.map((p) => Math.max(...bars.map((b) => Number(p[b.key]) || 0))));
  const slot = (W - PAD.l - PAD.r) / points.length;
  const bw = Math.min(26, (slot - 8) / bars.length);
  const y = (v) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const stride = Math.max(1, Math.ceil(points.length / 8));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Profit and loss bar chart">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(max * f)} y2={y(max * f)} stroke={grid} strokeDasharray="4 4" />
          <text x={PAD.l - 6} y={y(max * f) + 4} textAnchor="end" fontSize="11" fill={ax}>{fmtShort(max * f)}</text>
        </g>
      ))}
      {points.map((p, i) => (
        <g key={i}>
          {bars.map((b, j) => {
            const v = Number(p[b.key]) || 0;
            const bx = PAD.l + i * slot + (slot - bw * bars.length) / 2 + j * bw;
            return (
              <rect key={b.key} x={bx} y={y(v)} width={bw} height={Math.max(1, H - PAD.b - y(v))} rx={3} fill={b.color} opacity={0.9}>
                <title>{`${p[xKey]}: ${b.label} ${fmtShort(v)}`}</title>
              </rect>
            );
          })}
          {i % stride === 0 && <text x={PAD.l + i * slot + slot / 2} y={H - 30} textAnchor="middle" fontSize="10.5" fill={ax}>{String(p[xKey]).slice(0, 8)}</text>}
        </g>
      ))}
      <g fontSize="11.5">
        {bars.map((b, i) => (
          <g key={b.key} transform={`translate(${PAD.l + i * 110},${H - 12})`}>
            <rect width="10" height="10" rx="3" fill={b.color} />
            <text x="14" y="9.5" fill={lx}>{b.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const DONUT_COLORS = ["#16A34A", "#f97316", "#14532D", "#eab308", "#38bdf8", "#a78bfa", "#f472b6", "#78716c"];

export function DonutChart({ slices = [], height = 200, dark = false }) {
  const total = slices.reduce((s, x) => s + (Number(x.value) || 0), 0);
  if (!slices.length || !total) return <ChartEmpty dark={dark} />;
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <svg viewBox="0 0 180 180" height={height} role="img" aria-label="Distribution chart">
        <circle cx="90" cy="90" r={R} fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "#f5f5f4"} strokeWidth="26" />
        {slices.map((s, i) => {
          const frac = (Number(s.value) || 0) / total;
          const dash = `${Math.max(0, frac * C - 3)} ${C}`;
          const rot = (acc / total) * 360;
          acc += Number(s.value) || 0;
          return (
            <circle key={s.label} cx="90" cy="90" r={R} fill="none" stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="26" strokeDasharray={dash} transform={`rotate(${-90 + rot} 90 90)`}>
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
        })}
        <text x="90" y="86" textAnchor="middle" fontSize="20" fontWeight="800" fill={dark ? "#fff" : "#1c1917"}>{total}</text>
        <text x="90" y="104" textAnchor="middle" fontSize="11" fill={dark ? "#94a3b8" : "#a8a29e"}>total</text>
      </svg>
      <ul className="w-full min-w-0 space-y-1.5 text-[13px]">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className={`min-w-0 flex-1 truncate font-semibold ${dark ? "text-slate-200" : ""}`}>{s.label}</span>
            <b className={dark ? "text-white" : ""}>{s.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBarList({ rows = [], valueFmt = (v) => v, dark = false }) {
  if (!rows.length) return <ChartEmpty dark={dark} />;
  const max = Math.max(1, ...rows.map((r) => Number(r.value) || 0));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className={`min-w-0 truncate font-semibold ${dark ? "text-slate-200" : ""}`} title={r.label}>{r.label}</span>
            <b className={`shrink-0 ${dark ? "text-white" : ""}`}>{valueFmt(r.value)}{r.sub ? <span className={`font-normal ${dark ? "text-slate-400" : "text-stone-400"}`}> • {r.sub}</span> : null}</b>
          </div>
          <div className={`mt-1 h-2 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-stone-100"}`}>
            <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${Math.round(((Number(r.value) || 0) / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({ values = [], color = "#16A34A" }) {
  if (values.length < 2) return null;
  const W = 100;
  const H = 30;
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = Math.max(1e-9, max - min);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - 3 - ((v - min) / span) * (H - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-8 w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
