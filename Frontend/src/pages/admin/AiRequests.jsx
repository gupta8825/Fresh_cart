import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Check, MessageCircle, Save, Send, X } from "lucide-react";
import { formatPrice } from "../../data/products";
import {
  formatDateTime, logActivity, useDemoVersion,
} from "../../utils/demoStore";
import {
  getAdminWhatsapp, getAiRequests, saveAdminWhatsapp, updateAiRequestStatus,
  validateWhatsappNumber,
} from "../../utils/assistantStore";
import { findCountry } from "../../data/countries";
import CountryCodeSelector from "../../components/CountryCodeSelector";
import { EmptyState, StatusBadge, TableWrap, btnPrimary, card, inputCls, tdCls, thCls } from "../../components/admin/ui";
import { useShop } from "../../context/ShopContext";
import { useLanguage } from "../../context/LanguageContext";

const REQ_STATUS = ["New", "Reviewed", "Quoted", "Closed"];

export default function AiRequests() {
  useDemoVersion();
  const { pushToast } = useShop();
  const { t } = useLanguage();
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("All");

  const cfg = getAdminWhatsapp();
  const [cc, setCc] = useState(cfg.countryCode || "IN");
  const [phone, setPhone] = useState(cfg.phoneNumber || "");
  const [waErrors, setWaErrors] = useState({});

  const requests = getAiRequests();
  const visible = filter === "All" ? requests : requests.filter((r) => r.status === filter);
  const openReq = openId ? requests.find((r) => r.id === openId) : null;

  const onSaveWa = () => {
    const country = findCountry(cc);
    const clean = String(phone).replace(/[\s\-().]/g, "");
    const errs = {};
    if (!clean) errs.phone = t("assistant.waInvalid");
    const v = validateWhatsappNumber({ countryCode: country.cc, dialCode: country.dial, phoneNumber: clean });
    if (clean && !v.ok) errs.phone = v.error;
    setWaErrors(errs);
    if (Object.keys(errs).length) {
      pushToast(t("assistant.waInvalid"), "error");
      return;
    }
    // NOTE: demo-only persistence (localStorage). Production needs a
    // protected backend endpoint with real admin authorization.
    saveAdminWhatsapp({ countryCode: country.cc, dialCode: country.dial, phoneNumber: clean });
    pushToast(t("assistant.waSaved"));
  };

  const onTestWa = () => {
    const country = findCountry(cc);
    const clean = String(phone).replace(/[\s\-().]/g, "");
    const v = validateWhatsappNumber({ countryCode: country.cc, dialCode: country.dial, phoneNumber: clean });
    if (!v.ok) {
      setWaErrors({ phone: v.error });
      pushToast(v.error, "error");
      return;
    }
    setWaErrors({});
    const msg = "FreshCart demo: WhatsApp test — please confirm you received this.";
    window.open(`https://wa.me/${v.digits}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    pushToast(t("assistant.waTested"));
  };

  const setStatus = (id, status) => {
    const res = updateAiRequestStatus(id, status);
    if (!res.ok) pushToast(res.error, "error");
    try {
      logActivity("ai-request", `Demo AI request ${id} marked ${status}`);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* WhatsApp configuration (demo settings — see note inside) */}
      <div className={card}>
        <h3 className="font-extrabold">{t("assistant.waConfigTitle")}</h3>
        <p className="mt-0.5 text-[11px] text-stone-400">{t("assistant.waConfigHint")}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="wa-cc" className="mb-1.5 block text-[13px] font-bold">{t("assistant.waCountry")}</label>
            <CountryCodeSelector value={cc} onChange={(c) => setCc(c.cc)} id="wa-cc" />
          </div>
          <div>
            <label htmlFor="wa-num" className="mb-1.5 block text-[13px] font-bold">{t("assistant.waNumber")}</label>
            <input
              id="wa-num"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d\s\-().]/g, ""))}
              placeholder={t("assistant.waNumberPlaceholder")}
              inputMode="tel"
              className={inputCls}
            />
            {waErrors.phone && <p className="mt-1 text-xs font-medium text-red-600">{waErrors.phone}</p>}
          </div>
          <div className="flex items-end gap-2">
            <button onClick={onSaveWa} className={btnPrimary}><Save size={15} /> {t("assistant.waSave")}</button>
            <button
              onClick={onTestWa}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-[13px] font-bold text-stone-600 hover:bg-stone-50"
            >
              <Send size={14} /> {t("assistant.waTest")}
            </button>
          </div>
        </div>
        <p className="mt-2 font-mono text-xs text-stone-400">
          {(() => {
            const c = findCountry(cc);
            const digits = `${c.dial.replace(/\D/g, "")}${String(phone).replace(/\D/g, "")}`;
            return phone.trim() ? `wa.me/${digits}` : `wa.me/… (${t("assistant.whatsappMissing")})`;
          })()}
        </p>
      </div>

      {/* Request log */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 text-base font-extrabold">
          <Bot size={18} className="text-[#16A34A]" /> {t("assistant.adminTitle")}
        </h3>
        <span className="text-xs text-stone-400">{t("assistant.adminSubtitle")}</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={t("assistant.colStatus")} className={`${inputCls} ml-auto w-auto`}>
          {["All", ...REQ_STATUS].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t("assistant.adminTitle")} sub={t("assistant.adminEmpty")} />
      ) : (
        <TableWrap>
          <thead><tr>
            <th className={thCls}>{t("assistant.colRequest")}</th>
            <th className={thCls}>{t("assistant.colCustomer")}</th>
            <th className={thCls}>{t("assistant.colItems")}</th>
            <th className={thCls}>{t("assistant.colStatus")}</th>
            <th className={thCls}>{t("assistant.colDate")}</th>
            <th className={thCls}><span className="sr-only">Open</span></th>
          </tr></thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="hover:bg-green-50/40">
                <td className={tdCls}><span className="font-mono font-extrabold text-[#14532D]">{r.id}</span></td>
                <td className={tdCls}>{r.customer || "—"}</td>
                <td className={tdCls}>{(r.items || []).length}</td>
                <td className={tdCls}><StatusBadge status={r.status} /></td>
                <td className={tdCls + " whitespace-nowrap text-xs text-stone-500"}>{formatDateTime(r.date)}</td>
                <td className={tdCls}>
                  <button onClick={() => setOpenId(r.id)} className="rounded-full bg-[#14532D] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#16A34A]">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <AnimatePresence>
        {openReq && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={openReq.id}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenId(null)} className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-base font-extrabold text-[#14532D]">{openReq.id}</h3>
                <button onClick={() => setOpenId(null)} aria-label="Close" className="rounded-lg p-2 hover:bg-stone-100"><X size={19} /></button>
              </div>
              <p className="mt-1 text-[13px] text-stone-500">
                {openReq.customer} • {openReq.lang === "hi" ? "हिन्दी" : "English"} • {formatDateTime(openReq.date)}
              </p>
              {openReq.text && (
                <p className="mt-2 rounded-2xl bg-[#FAFAF5] p-3 text-[13px] italic text-stone-500 ring-1 ring-stone-100">“{openReq.text}”</p>
              )}
              <ul className="mt-3 space-y-1.5">
                {(openReq.items || []).map((it, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-[#FAFAF5] px-3 py-2 text-[13px] ring-1 ring-stone-100">
                    <span className="min-w-0 flex-1 truncate font-semibold">{it.name} <span className="font-normal text-stone-400">× {it.qty} {it.unit}</span></span>
                    {it.productId ? <Check size={15} className="shrink-0 text-[#16A34A]" /> : <span className="shrink-0 text-[11px] text-stone-400">unmatched</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right text-sm font-extrabold">{formatPrice(openReq.subtotal || 0)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {REQ_STATUS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(openReq.id, s)}
                    disabled={openReq.status === s}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${openReq.status === s ? "bg-[#16A34A] text-white" : "border border-stone-200 hover:bg-stone-50"} disabled:opacity-60`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-400">
                <MessageCircle size={12} /> Demo log on this device — confirm stock/prices with the customer over WhatsApp before quoting.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
