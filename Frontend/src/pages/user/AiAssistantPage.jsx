import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Bot, Camera, CheckCircle2, ChevronRight, Copy, Download, FileText,
  ImagePlus, Loader2, MessageCircleQuestion, Plus, Send, ShoppingCart, Trash2, X,
} from "lucide-react";
import { PRODUCTS, formatPrice } from "../../data/products";
import { getAvailability } from "../../utils/availability";
import { parseGroceryRequest } from "../../utils/assistantParser";
import { buildWhatsappUrl, getConfiguredWhatsapp, saveAiRequest } from "../../utils/assistantStore";
import { useLanguage, useTranslatedProduct } from "../../context/LanguageContext";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const EDIT_UNITS = ["kg", "g", "L", "ml", "packet", "pcs", "bottle", "jar"];

// Noto Sans Devanagari TTF candidates (tried in order; jsPDF needs TTF/OTF,
// not woff2). Failure => honest error, never a broken PDF.
const FONT_URLS = [
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-devanagari@latest/devanagari-400-normal.ttf",
  "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari@latest/files/noto-sans-devanagari-devanagari-400-normal.ttf",
];
let fontCache = null;

async function loadDevanagariBase64() {
  if (fontCache) return fontCache;
  let lastErr = null;
  for (const url of FONT_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      if (!buf || buf.byteLength < 20000) throw new Error("font file too small");
      const bytes = new Uint8Array(buf);
      let bin = "";
      const CHUNK = 8192;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      fontCache = btoa(bin);
      return fontCache;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("font download failed");
}

export default function AiAssistantPage() {
  const { t, lang } = useLanguage();
  const tp = useTranslatedProduct();
  const { addToCart, pushToast } = useShop();
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { items, clarifications, isEstimate }
  const [image, setImage] = useState(null); // { url, file }
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [customText, setCustomText] = useState("");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [pdfBusy, setPdfBusy] = useState(false);

  const byId = useMemo(() => Object.fromEntries(PRODUCTS.map((p) => [p.id, p])), []);

  const runParse = (raw) => {
    setBusy(true);
    try {
      const r = parseGroceryRequest(raw, PRODUCTS);
      const items = r.items.map((it, i) => ({ ...it, key: `${Date.now()}-${i}` }));
      setResult({ items, clarifications: r.clarifications, isEstimate: r.isEstimate });
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = () => runParse(text);

  const onFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      pushToast(t("assistant.invalidFile"), "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      pushToast(t("assistant.fileTooBig"), "error");
      return;
    }
    if (image?.url) {
      try { URL.revokeObjectURL(image.url); } catch { /* ignore */ }
    }
    setImage({ url: URL.createObjectURL(file), file });
    setOcrText("");
  };

  const onExtract = async () => {
    if (!image?.file) return;
    setOcrBusy(true);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng+hin");
      const { data } = await worker.recognize(image.file);
      await worker.terminate().catch(() => {});
      const found = String(data?.text || "").trim();
      if (!found) {
        pushToast(t("assistant.ocrEmpty"), "error");
        return;
      }
      setOcrText(found);
      const r = parseGroceryRequest(found, PRODUCTS);
      const ocrItems = r.items.map((it, i) => ({ ...it, key: `ocr-${Date.now()}-${i}` }));
      setResult((prev) => {
        const seen = new Set((prev?.items || []).map((x) => `${x.productId}|${x.qty}|${x.unit}`));
        const merged = [...(prev?.items || [])];
        for (const it of ocrItems) {
          if (!seen.has(`${it.productId}|${it.qty}|${it.unit}`)) merged.push(it);
        }
        const clar = [...(prev?.clarifications || []), ...r.clarifications.filter((c) => !(prev?.clarifications || []).includes(c))];
        return { items: merged, clarifications: clar, isEstimate: prev?.isEstimate || r.isEstimate };
      });
    } catch {
      pushToast(t("assistant.ocrError"), "error");
    } finally {
      setOcrBusy(false);
    }
  };

  const updateItem = (key, patch) => {
    setResult((prev) => prev && ({ ...prev, items: prev.items.map((it) => (it.key === key ? { ...it, ...patch } : it)) }));
  };
  const removeItem = (key) => {
    setResult((prev) => prev && ({ ...prev, items: prev.items.filter((it) => it.key !== key) }));
  };
  const addCustom = () => {
    if (!customText.trim()) return;
    const r = parseGroceryRequest(customText, PRODUCTS);
    const extra = r.items.map((it, i) => ({ ...it, key: `c-${Date.now()}-${i}` }));
    setResult((prev) => ({
      items: [...(prev?.items || []), ...extra],
      clarifications: [...(prev?.clarifications || []), ...r.clarifications],
      isEstimate: prev?.isEstimate || false,
    }));
    setCustomText("");
  };

  const rows = useMemo(() => {
    if (!result) return [];
    return result.items.map((it) => {
      const p = it.productId ? byId[it.productId] : null;
      const avail = p ? getAvailability(p) : null;
      const qty = Math.max(0, Number(it.qty) || 0);
      return { ...it, product: p, avail, qty, lineTotal: p ? p.price * qty : 0 };
    });
  }, [result, byId]);

  const availableRows = rows.filter((r) => r.product && r.avail?.purchasable && r.qty > 0);
  const problemRows = rows.filter((r) => !r.product || !r.avail?.purchasable);
  const subtotal = availableRows.reduce((s, r) => s + r.lineTotal, 0);

  const onAddToCart = () => {
    if (!availableRows.length) {
      pushToast(t("assistant.nothingAvailable"), "error");
      return;
    }
    availableRows.forEach((r) => addToCart(r.product, r.qty));
    pushToast(t("assistant.addedToCart"));
  };

  const statusLabel = (avail) => {
    if (!avail) return t("assistant.unmatchedNote");
    if (!avail.purchasable) return avail.key === "out" ? t("assistant.statusOut") : t("assistant.statusUnavailable");
    if (avail.key === "low") return t("assistant.statusLow");
    return t("assistant.statusInStock");
  };

  // ---------- PDF ----------
  const buildPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const base64 = await loadDevanagariBase64();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.addFileToVFS("NotoSansDevanagari.ttf", base64);
    doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
    doc.setFont("NotoSansDevanagari", "normal");

    const W = 595;
    let y = 0;
    doc.setFillColor(20, 83, 45);
    doc.rect(0, 0, W, 86, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("FreshCart", 40, 36);
    doc.setFontSize(12);
    doc.text(t("assistant.previewTitle") + " (demo estimate)", 40, 58);
    doc.setFontSize(9);
    doc.text(new Date().toLocaleString(lang === "hi" ? "hi-IN" : "en-IN"), 40, 74);

    doc.setTextColor(40, 40, 40);
    y = 112;
    if (customerName.trim()) {
      doc.setFontSize(10);
      doc.text(`${customerName.trim()}`, 40, y);
      y += 16;
    }
    if (result.isEstimate) {
      doc.setFontSize(9);
      doc.text(t("assistant.monthlyEstimateNote"), 40, y, { maxWidth: W - 80 });
      y += 26;
    }

    const cols = ["#", "Product / उत्पाद", "Qty", "Price", "Total", "Status"];
    const xs = [40, 70, 300, 360, 430, 495];
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    cols.forEach((c, i) => doc.text(c, xs[i], y));
    y += 6;
    doc.setDrawColor(220);
    doc.line(40, y, W - 40, y);
    y += 14;

    doc.setTextColor(30, 30, 30);
    let n = 0;
    const needPage = (h = 30) => {
      if (y + h > 800) {
        doc.addPage();
        y = 50;
      }
    };
    for (const r of rows) {
      needPage(34);
      n += 1;
      const hiName = r.product ? tp(r.product).name : "";
      doc.setFontSize(9);
      doc.text(String(n), xs[0], y);
      doc.text(String(r.product ? r.product.name : r.rawText).slice(0, 34), xs[1], y);
      if (hiName && hiName !== r.product?.name) {
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        doc.text(hiName.slice(0, 36), xs[1], y + 11);
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
      }
      doc.text(`${r.qty} ${r.unit}`, xs[2], y);
      doc.text(r.product ? formatPrice(r.product.price) : "—", xs[3], y);
      doc.text(r.product ? formatPrice(r.lineTotal) : "—", xs[4], y);
      doc.text(r.product ? statusLabel(r.avail) : t("assistant.unmatchedNote"), xs[5], y);
      y += hiName && hiName !== r.product?.name ? 26 : 18;
    }

    needPage(80);
    y += 6;
    doc.setFontSize(11);
    doc.text(`${t("assistant.subtotalAvailable")}: ${formatPrice(subtotal)}`, 40, y);
    y += 20;
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    const note = lang === "hi"
      ? "नोट: यह केवल खरीद अनुमान है — पक्का ऑर्डर या भुगतान रसीद नहीं। कीमत और स्टॉक एडमिन से दोबारा जांचें।"
      : "Note: this is a shopping-list estimate only — not a confirmed order or payment receipt. Prices and stock must be reconfirmed by the admin.";
    doc.text(note, 40, y, { maxWidth: W - 80 });
    return doc;
  };

  const onDownloadPdf = async () => {
    if (!rows.length) return;
    setPdfBusy(true);
    try {
      const doc = await buildPdf();
      doc.save(`freshcart-list-${Date.now()}.pdf`);
      pushToast(t("assistant.pdfReady"));
    } catch {
      pushToast(t("assistant.pdfFontError"), "error");
    } finally {
      setPdfBusy(false);
    }
  };

  // ---------- WhatsApp ----------
  const whatsappSummary = () => {
    const lines = availableRows.map((r, i) => {
      const hiName = r.product ? tp(r.product).name : "";
      const disp = hiName && hiName !== r.product.name ? `${r.product.name} (${hiName})` : r.product.name;
      return `${i + 1}. ${disp} — ${r.qty} ${r.unit} — ${formatPrice(r.lineTotal)}`;
    });
    const head = lang === "hi" ? "नमस्ते! मेरी किराना सूची:" : "Hello! My kirana list:";
    const tail = lang === "hi"
      ? `योग: ${formatPrice(subtotal)} (अनुमान)। PDF डाउनलोड कर ली है, अटैच करके भेज रहा/रही हूँ। कीमत/स्टॉक कृपया जांचें।`
      : `Subtotal: ${formatPrice(subtotal)} (estimate). I have downloaded the PDF and will attach it here. Please confirm price/stock.`;
    return [head, ...lines, tail].join("\n");
  };

  const handleWhatsapp = async () => {
    const mod = await import("../../utils/assistantStore.js");
    const res = mod.getConfiguredWhatsapp();
    if (!res.ok) {
      pushToast(t("assistant.whatsappMissing"), "error");
      return;
    }
    const message = customerName.trim()
      ? `${lang === "hi" ? "नाम" : "Name"}: ${customerName.trim()}\n${whatsappSummary()}`
      : whatsappSummary();
    window.open(mod.buildWhatsappUrl(res.digits, message), "_blank", "noopener");
    mod.saveAiRequest({
      customer: customerName.trim() || (lang === "hi" ? "अज्ञात" : "Unknown"),
      lang,
      text: text.slice(0, 500),
      items: rows.map((r) => ({ productId: r.product?.id || null, name: r.product?.name || r.rawText, qty: r.qty, unit: r.unit })),
      subtotal,
      source: "whatsapp",
    });
    pushToast(t("assistant.requestLogged"));
    pushToast(t("assistant.whatsappOpened"));
  };

  const field = "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-stone-400">
        <Link to="/" className="hover:text-[#16A34A]">Home</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-stone-700">{t("assistant.title")}</span>
      </nav>

      <div className="mt-3 overflow-hidden rounded-3xl bg-[#14532D] p-7 text-white md:p-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold">
          <Bot size={15} /> {t("assistant.demoBadge")}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">{t("assistant.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-green-100">{t("assistant.subtitle")}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* text input */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <label htmlFor="ai-text" className="text-base font-extrabold">{t("assistant.promptLabel")}</label>
            <textarea
              id="ai-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("assistant.promptPlaceholder")}
              rows={4}
              className={`${field} mt-3 resize-y`}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onGenerate}
              disabled={busy || !text.trim()}
              className="mt-4 rounded-full bg-[#16A34A] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D] disabled:opacity-60"
            >
              {busy ? t("assistant.generating") : t("assistant.generate")}
            </motion.button>
          </section>

          {/* image upload */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="flex items-center gap-2 text-base font-extrabold"><Camera size={19} className="text-[#16A34A]" /> {t("assistant.uploadTitle")}</h2>
            <p className="mt-1 text-[13px] text-stone-500">{t("assistant.uploadHint")}</p>
            <p className="mt-1 text-[11px] text-stone-400">{t("assistant.privacyNote")}</p>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {!image ? (
              <button onClick={() => fileRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-green-200 px-6 py-3 text-sm font-bold text-[#14532D] hover:bg-green-50">
                <ImagePlus size={17} /> {t("assistant.uploadButton")}
              </button>
            ) : (
              <div className="mt-4">
                <img src={image.url} alt="Uploaded list preview" className="max-h-64 rounded-2xl object-contain ring-1 ring-stone-200" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => fileRef.current?.click()} className="rounded-full border border-stone-200 px-4 py-2 text-[13px] font-bold hover:bg-stone-50">
                    {t("assistant.replaceImage")}
                  </button>
                  <button
                    onClick={() => { try { URL.revokeObjectURL(image.url); } catch { /* ignore */ } setImage(null); setOcrText(""); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50"
                  >
                    <X size={14} /> {t("assistant.removeImage")}
                  </button>
                  <button
                    onClick={onExtract}
                    disabled={ocrBusy}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#14532D] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#16A34A] disabled:opacity-60"
                  >
                    {ocrBusy ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />} {ocrBusy ? t("assistant.extracting") : t("assistant.extractButton")}
                  </button>
                </div>
                {ocrText && (
                  <details className="mt-3 rounded-2xl bg-[#FAFAF5] p-3 text-xs text-stone-500 ring-1 ring-stone-100">
                    <summary className="cursor-pointer font-bold">OCR text</summary>
                    <p className="mt-1 whitespace-pre-wrap">{ocrText.slice(0, 1000)}</p>
                  </details>
                )}
              </div>
            )}
          </section>

          {/* clarifications */}
          {result && result.clarifications.length > 0 && (
            <section className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-amber-800">
                <MessageCircleQuestion size={17} /> {t("assistant.clarificationsTitle")}
              </h2>
              <ul className="mt-2 space-y-1 text-[13px] text-amber-800">
                {result.clarifications.includes("monthly-estimate") && <li>• {t("assistant.monthlyEstimateNote")}</li>}
                {result.clarifications.filter((c) => c.startsWith("unmatched:")).map((c) => (
                  <li key={c}>• “{c.slice(10)}” — {t("assistant.unmatchedNote")}</li>
                ))}
                {result.clarifications.filter((c) => c.startsWith("qty-assumed:")).map((c) => (
                  <li key={c}>• {c.slice(12)} — {t("assistant.qtyAssumedNote")}</li>
                ))}
              </ul>
            </section>
          )}

          {/* preview list */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="text-base font-extrabold">{t("assistant.previewTitle")}</h2>
            {!rows.length ? (
              <p className="mt-2 text-sm text-stone-400">{t("assistant.emptyState")}</p>
            ) : (
              <>
                <div className="mt-3 flex flex-col gap-2.5">
                  {rows.map((r) => {
                    const hiName = r.product ? tp(r.product).name : "";
                    const showHi = hiName && r.product && hiName !== r.product.name;
                    return (
                      <div key={r.key} className="flex items-center gap-3 rounded-2xl bg-[#FAFAF5] p-3 ring-1 ring-stone-100">
                        {r.product ? (
                          <img src={r.product.image} alt={r.product.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-stone-400">
                            <X size={18} />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {r.product ? r.product.name : r.rawText}
                            {showHi && <span className="font-medium text-stone-400"> • {hiName}</span>}
                          </p>
                          <p className="text-xs text-stone-400">
                            {r.product ? `${formatPrice(r.product.price)} • ${statusLabel(r.avail)}` : t("assistant.unmatchedNote")}
                            {r.assumedQty && r.product ? ` • ${t("assistant.qtyAssumedNote")}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            step={r.unit === "kg" || r.unit === "L" ? 0.5 : 1}
                            value={r.qty}
                            onChange={(e) => updateItem(r.key, { qty: Math.max(0, Number(e.target.value) || 0) })}
                            aria-label={t("assistant.qtyLabel")}
                            className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-[#16A34A]"
                          />
                          <select
                            value={r.unit}
                            onChange={(e) => updateItem(r.key, { unit: e.target.value })}
                            aria-label="unit"
                            className="rounded-lg border border-stone-200 bg-white px-1.5 py-1.5 text-[13px] font-bold outline-none focus:border-[#16A34A]"
                          >
                            {EDIT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <span className="hidden w-20 shrink-0 text-right text-sm font-extrabold sm:block">
                          {r.product ? formatPrice(r.lineTotal) : "—"}
                        </span>
                        <button onClick={() => removeItem(r.key)} aria-label={t("assistant.removeItem")} className="shrink-0 rounded-lg p-2 text-stone-300 hover:bg-red-50 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
                    placeholder={t("assistant.addCustomPlaceholder")}
                    aria-label={t("assistant.addItem")}
                    className="min-w-0 flex-1 rounded-full border border-stone-200 bg-[#FAFAF5] px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white"
                  />
                  <button onClick={addCustom} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-200 px-4 py-2.5 text-sm font-bold text-[#14532D] hover:bg-green-50">
                    <Plus size={15} /> {t("assistant.addCustom")}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-stone-200 pt-3">
                  <span className="text-sm text-stone-500">{t("assistant.subtotalAvailable")}</span>
                  <span className="text-lg font-extrabold">{formatPrice(subtotal)}</span>
                </div>
                <button
                  onClick={onAddToCart}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#14532D]"
                >
                  <ShoppingCart size={17} /> {t("assistant.addAvailableToCart")}
                </button>
              </>
            )}
          </section>
        </div>

        {/* side panel: name + pdf + whatsapp */}
        <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-stone-100 lg:sticky lg:top-32">
          <label htmlFor="ai-name" className="text-[13px] font-bold">{t("assistant.customerNameLabel")}</label>
          <input id="ai-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("assistant.customerNamePlaceholder")} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100" />
          <button
            onClick={onDownloadPdf}
            disabled={pdfBusy || !rows.length}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#14532D] py-3 text-sm font-bold text-[#14532D] hover:bg-green-50 disabled:opacity-50"
          >
            {pdfBusy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {pdfBusy ? t("assistant.preparingPdf") : t("assistant.downloadPdf")}
          </button>
          <button
            onClick={handleWhatsapp}
            disabled={!rows.length}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-green-200 hover:brightness-95 disabled:opacity-50"
          >
            <Send size={16} /> {t("assistant.sendWhatsapp")}
          </button>
          <p className="mt-2.5 rounded-xl bg-stone-100 p-3 text-[11px] leading-relaxed text-stone-500">
            {t("assistant.whatsappSteps")}
          </p>
          <div className="mt-3 flex gap-2 text-[11px] text-stone-400">
            <button onClick={() => { try { navigator.clipboard.writeText(whatsappSummary()); } catch { /* ignore */ } pushToast("Copied"); }} className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 font-bold hover:bg-stone-50">
              <Copy size={12} /> Copy
            </button>
            <Link to="/shop" className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 font-bold hover:bg-stone-50">
              <CheckCircle2 size={12} /> Shop
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
