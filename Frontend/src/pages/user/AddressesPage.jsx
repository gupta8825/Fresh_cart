import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Home, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import AccountLayout from "../../components/AccountLayout";
import { useShop } from "../../context/ShopContext";
import { EMPTY_ADDRESS, getAddresses, saveAddresses, validateAddress } from "../../utils/addresses";

const input =
  "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";

export default function AddressesPage() {
  const { pushToast } = useShop();
  const [list, setList] = useState(getAddresses);
  const [modal, setModal] = useState(null); // null | {index:number, draft:object}
  const [errors, setErrors] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);

  const persist = (next) => {
    setList(next);
    saveAddresses(next);
  };

  const openAdd = () => {
    setErrors({});
    setModal({ index: -1, draft: { ...EMPTY_ADDRESS } });
  };

  const openEdit = (i) => {
    setErrors({});
    setModal({ index: i, draft: { ...list[i] } });
  };

  const save = () => {
    const er = validateAddress(modal.draft);
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    let next;
    if (modal.index === -1) {
      const entry = { ...modal.draft, id: `a-${Date.now()}` };
      next = [...list, entry];
      if (entry.isDefault || next.length === 1) {
        next = next.map((a) => ({ ...a, isDefault: a.id === entry.id }));
      }
      pushToast("Address added (demo)");
    } else {
      next = list.map((a, i) => (i === modal.index ? { ...modal.draft } : a));
      if (modal.draft.isDefault) next = next.map((a) => ({ ...a, isDefault: a.id === modal.draft.id }));
      pushToast("Address updated (demo)");
    }
    persist(next);
    setModal(null);
  };

  const remove = (id) => {
    persist(list.filter((a) => a.id !== id));
    setConfirmDel(null);
    pushToast("Address deleted");
  };

  const setDefault = (id) => {
    persist(list.map((a) => ({ ...a, isDefault: a.id === id })));
    pushToast("Default address updated");
  };

  const setDraft = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setModal((m) => ({ ...m, draft: { ...m.draft, [k]: v } }));
  };
  const err = (k) => errors[k] && <p className="mt-1 text-xs font-medium text-red-600">{errors[k]}</p>;

  return (
    <AccountLayout title="Delivery Addresses" subtitle="Demo address book — stored only in this browser.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{list.length} saved address{list.length === 1 ? "" : "es"}</p>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {list.length === 0 ? (
        <div className="mt-5 rounded-3xl bg-white p-8 text-center ring-1 ring-stone-100 sm:p-14">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
            <MapPin size={34} />
          </span>
          <h2 className="mt-4 font-extrabold">No saved addresses</h2>
          <p className="mt-1 text-sm text-stone-500">Add your first delivery address for faster demo checkout.</p>
          <button onClick={openAdd} className="mt-5 rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#14532D]">
            Add Address
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {list.map((a, i) => (
            <div key={a.id} className="rounded-3xl bg-white p-5 ring-1 ring-stone-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-[#14532D]">
                  <Home size={12} /> {a.label || "Home"}
                </span>
                {a.isDefault && (
                  <span className="rounded-full bg-[#14532D] px-2.5 py-1 text-[11px] font-bold text-white">Default</span>
                )}
              </div>
              <p className="mt-2.5 text-sm font-extrabold">{a.name} • {a.phone}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
                {a.flat}, {a.street}{a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} — {a.pin}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-semibold">
                {!a.isDefault && (
                  <button onClick={() => setDefault(a.id)} className="rounded-full border border-green-200 px-3.5 py-2 text-[#14532D] hover:bg-green-50">
                    Set Default
                  </button>
                )}
                <button onClick={() => openEdit(i)} className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-3.5 py-2 hover:bg-stone-50">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setConfirmDel(a.id)} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3.5 py-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold">{modal.index === -1 ? "Add address" : "Edit address"}</h3>
                <button onClick={() => setModal(null)} aria-label="Close" className="rounded-lg p-2 hover:bg-stone-100"><X size={19} /></button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold">Label</label>
                  <select value={modal.draft.label} onChange={setDraft("label")} className={input}>
                    {["Home", "Work", "Other"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold">Recipient name *</label>
                  <input value={modal.draft.name} onChange={setDraft("name")} placeholder="Full name" className={input} />{err("name")}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-bold">Mobile *</label>
                  <input value={modal.draft.phone} onChange={setDraft("phone")} maxLength={10} inputMode="numeric" placeholder="10-digit mobile" className={input} />{err("phone")}
                </div>
                <div><label className="mb-1.5 block text-[13px] font-bold">House / Flat *</label><input value={modal.draft.flat} onChange={setDraft("flat")} className={input} />{err("flat")}</div>
                <div><label className="mb-1.5 block text-[13px] font-bold">Street & locality *</label><input value={modal.draft.street} onChange={setDraft("street")} className={input} />{err("street")}</div>
                <div><label className="mb-1.5 block text-[13px] font-bold">Landmark (optional)</label><input value={modal.draft.landmark} onChange={setDraft("landmark")} className={input} /></div>
                <div><label className="mb-1.5 block text-[13px] font-bold">City *</label><input value={modal.draft.city} onChange={setDraft("city")} className={input} />{err("city")}</div>
                <div><label className="mb-1.5 block text-[13px] font-bold">State *</label><input value={modal.draft.state} onChange={setDraft("state")} className={input} />{err("state")}</div>
                <div><label className="mb-1.5 block text-[13px] font-bold">PIN code *</label><input value={modal.draft.pin} onChange={setDraft("pin")} maxLength={6} inputMode="numeric" className={input} />{err("pin")}</div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600 sm:col-span-2">
                  <input type="checkbox" checked={!!modal.draft.isDefault} onChange={setDraft("isDefault")} className="h-4 w-4 accent-[#16A34A]" />
                  Set as default address
                </label>
              </div>
              <button onClick={save} className="mt-5 w-full rounded-full bg-[#16A34A] py-3 text-sm font-bold text-white hover:bg-[#14532D]">
                {modal.index === -1 ? "Add Address" : "Save Changes"}
              </button>
            </motion.div>
          </div>
        )}
        {confirmDel && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDel(null)} className="absolute inset-0 bg-black/50" />
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
              <h3 className="text-lg font-extrabold">Delete this address?</h3>
              <p className="mt-1 text-sm text-stone-500">This demo action can't be undone.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setConfirmDel(null)} className="rounded-full border border-stone-200 py-2.5 text-sm font-bold hover:bg-stone-50">Keep</button>
                <button onClick={() => remove(confirmDel)} className="rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountLayout>
  );
}
