import { useState } from "react";
import {
  DEFAULT_SETTINGS,
  getSettings,
  resetSettings,
  saveSettings,
  useDemoVersion,
} from "../../utils/demoStore";
import { btnGhost, btnPrimary, card, inputCls } from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useShop } from "../../context/ShopContext";
import { useGsapScope } from "../../hooks/useGsap";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-stone-600">{label}</span>
      {children}
    </label>
  );
}

export default function Settings() {
  useDemoVersion();
  const scope = useGsapScope(() => {});
  const { pushToast } = useShop();
  const [form, setForm] = useState(() => getSettings());
  const [savedTick, setSavedTick] = useState(0);

  const set = (section, key, value) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));

  const submit = (e) => {
    e.preventDefault();
    saveSettings(form);
    setSavedTick((t) => t + 1);
    pushToast("Demo settings saved on this device.");
  };

  const reset = () => {
    resetSettings();
    setForm(getSettings());
    pushToast("Demo settings reset to defaults.");
  };

  void savedTick;
  void DEFAULT_SETTINGS;

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Preferences"
        title="Store settings"
        sub="Frontend demo preferences stored on this device. Checkout fees, thresholds and labels read from here."
      />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className={card}>
          <h3 className="font-extrabold">Store profile (demo)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Store name">
              <input value={form.store.name} onChange={(e) => set("store", "name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Support email">
              <input value={form.store.email} onChange={(e) => set("store", "email", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={form.store.phone} onChange={(e) => set("store", "phone", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Currency">
              <input value={form.store.currency} onChange={(e) => set("store", "currency", e.target.value)} className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <input value={form.store.address} onChange={(e) => set("store", "address", e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Announcement bar">
                <input value={form.store.announcement} onChange={(e) => set("store", "announcement", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-extrabold">Admin WhatsApp for assistant lists (demo)</h3>
          <p className="mt-1 text-[13px] text-stone-500">
            Used only to open a wa.me chat with the order summary. The PDF is never sent automatically — the customer attaches it manually.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Country code">
              <input
                value={form.store.adminWhatsapp?.countryCode || "IN"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    store: { ...f.store, adminWhatsapp: { ...(f.store.adminWhatsapp || {}), countryCode: e.target.value } },
                  }))
                }
                className={inputCls}
              />
            </Field>
            <Field label="Dial code">
              <input
                value={form.store.adminWhatsapp?.dialCode || "+91"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    store: { ...f.store, adminWhatsapp: { ...(f.store.adminWhatsapp || {}), dialCode: e.target.value } },
                  }))
                }
                className={inputCls}
              />
            </Field>
            <Field label="Phone number">
              <input
                value={form.store.adminWhatsapp?.phoneNumber || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    store: { ...f.store, adminWhatsapp: { ...(f.store.adminWhatsapp || {}), phoneNumber: e.target.value } },
                  }))
                }
                placeholder="9876543210"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-extrabold">Delivery fees (demo)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Standard fee (₹)">
              <input type="number" min="0" value={form.delivery.standardFee} onChange={(e) => set("delivery", "standardFee", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Express fee (₹)">
              <input type="number" min="0" value={form.delivery.expressFee} onChange={(e) => set("delivery", "expressFee", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Free above (₹)">
              <input type="number" min="0" value={form.delivery.freeThreshold} onChange={(e) => set("delivery", "freeThreshold", Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-extrabold">Inventory display (demo)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Low-stock threshold">
              <input type="number" min="1" value={form.inventory.lowStockThreshold} onChange={(e) => set("inventory", "lowStockThreshold", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Show out-of-stock">
              <select
                value={String(form.inventory.showOutOfStock)}
                onChange={(e) => set("inventory", "showOutOfStock", e.target.value === "true")}
                className={inputCls}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary}>Save demo settings</button>
          <button type="button" onClick={reset} className={btnGhost}>Reset to defaults</button>
        </div>
      </form>
    </div>
  );
}
