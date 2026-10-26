import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, PRODUCTS, formatPrice } from "../../data/products";
import {
  deleteProductById, discountPctOf, getLowStockThreshold, getSku, logActivity, saveProduct, useDemoVersion,
} from "../../utils/demoStore";
import {
  ConfirmDialog, CsvButton, EmptyState, Modal, Pager, SearchInput,
  StatusBadge, TableWrap, btnPrimary, card, inputCls, tdCls, thCls,
} from "../../components/admin/ui";
import { SectionHead } from "../../components/admin/dark";
import { useShop } from "../../context/ShopContext";
import { useGsapScope } from "../../hooks/useGsap";

const PAGE_SIZE = 8;
const blankForm = () => ({
  id: "", name: "", category: CATEGORIES[0]?.id || "", unit: "1 pc", sku: "",
  price: "", originalPrice: "", cost: "", stock: "", rating: "4.5", reviews: "0",
  image: "", description: "", bestseller: false, featured: false, active: true,
});

function validate(f, existingIds) {
  const e = {};
  if (!String(f.name || "").trim()) e.name = "Product name is required.";
  if (!f.category) e.category = "Choose a category.";
  if (f.id === "" && existingIds.includes(`FC-${String(f.sku || "").trim().toUpperCase()}`)) e.sku = "SKU already in use.";
  const price = Number(f.price);
  const mrp = Number(f.originalPrice);
  const cost = f.cost === "" ? null : Number(f.cost);
  const stock = Number(f.stock);
  if (!(price >= 0) || f.price === "") e.price = "Selling price must be 0 or more.";
  if (!(mrp >= 0) || f.originalPrice === "") e.originalPrice = "Original price must be 0 or more.";
  else if (mrp < price) e.originalPrice = "Original price cannot be below selling price.";
  if (cost !== null && !(cost >= 0)) e.cost = "Cost must be 0 or more.";
  if (!Number.isInteger(stock) || stock < 0) e.stock = "Stock must be a whole number, 0 or more.";
  if (!(Number(f.rating) >= 0 && Number(f.rating) <= 5)) e.rating = "Rating must be 0–5.";
  if (!String(f.unit || "").trim()) e.unit = "Pack size is required.";
  return e;
}

export default function Products() {
  const v = useDemoVersion();
  const { pushToast } = useShop();
  const scope = useGsapScope(() => {});
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [avail, setAvail] = useState("All");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // null | form object
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [imgError, setImgError] = useState("");

  const live = PRODUCTS;
  const threshold = getLowStockThreshold();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = [...live];
    if (needle) {
      out = out.filter((p) => [p.name, p.id, getSku(p), p.sku, p.category, p.unit].filter(Boolean).join(" ").toLowerCase().includes(needle));
    }
    if (cat !== "All") out = out.filter((p) => p.category === cat);
    if (avail === "In stock") out = out.filter((p) => p.active !== false && (Number(p.stock) || 0) > threshold);
    if (avail === "Low stock") out = out.filter((p) => p.active !== false && (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= threshold);
    if (avail === "Out of stock") out = out.filter((p) => p.active !== false && (Number(p.stock) || 0) <= 0);
    if (avail === "Inactive") out = out.filter((p) => p.active === false);
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "stock-asc": (a, b) => (a.stock || 0) - (b.stock || 0),
      "stock-desc": (a, b) => (b.stock || 0) - (a.stock || 0),
      "rating-desc": (a, b) => (b.rating || 0) - (a.rating || 0),
    }[sort] || ((a, b) => a.name.localeCompare(b.name));
    return out.sort(by);
  }, [live, v, q, cat, avail, sort, threshold]);

  useEffect(() => { setPage(0); }, [q, cat, avail, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const openAdd = () => { setEditing(blankForm()); setErrors({}); setImgError(""); };
  const openEdit = (p) => {
    setEditing({
      id: p.id, name: p.name, category: p.category, unit: p.unit || "", sku: p.sku || "",
      price: String(p.price ?? ""), originalPrice: String(p.originalPrice ?? p.price ?? ""),
      cost: p.cost ?? "", stock: String(p.stock ?? 0), rating: String(p.rating ?? 0),
      reviews: String(p.reviews ?? 0), image: p.image || "", description: p.description || "",
      bestseller: !!p.bestseller, featured: !!p.featured, active: p.active !== false,
    });
    setErrors({});
    setImgError("");
  };

  const onImageFile = (file) => {
    setImgError("");
    if (!file) return;
    if (!String(file.type || "").startsWith("image/")) {
      setImgError("Only image files (JPEG, PNG, WebP) are accepted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImgError("Image must be 2 MB or smaller (stored locally for this demo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditing((f) => (f ? { ...f, image: String(reader.result || "") } : f));
    reader.onerror = () => setImgError("Could not read that file — try another image.");
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    const existingIds = live.map((p) => getSku(p));
    const errs = validate(editing, existingIds);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const isNew = !editing.id;
    const product = {
      id: isNew ? `n-${Date.now().toString(36)}` : editing.id,
      name: editing.name.trim(),
      category: editing.category,
      unit: editing.unit.trim(),
      sku: editing.sku.trim() || undefined,
      price: Number(editing.price),
      originalPrice: Number(editing.originalPrice),
      ...(editing.cost === "" ? {} : { cost: Number(editing.cost) }),
      stock: Math.floor(Number(editing.stock)),
      rating: Number(editing.rating),
      reviews: Math.max(0, Math.floor(Number(editing.reviews) || 0)),
      image: editing.image || "",
      description: editing.description.trim(),
      bestseller: !!editing.bestseller,
      featured: !!editing.featured,
      active: editing.active !== false,
      ...(isNew ? { createdAt: new Date().toISOString() } : {}),
      updatedAt: new Date().toISOString(),
    };
    saveProduct(product);
    // Mutate the live array in place so the storefront (which imports
    // PRODUCTS directly) reflects the change instantly, no reload needed.
    if (isNew) {
      PRODUCTS.push({ ...product });
    } else {
      const at = PRODUCTS.findIndex((p) => p.id === product.id);
      if (at >= 0) PRODUCTS[at] = { ...PRODUCTS[at], ...product };
    }
    try { logActivity("product", `${isNew ? "Added" : "Updated"} demo product ${product.name}`); } catch { /* ignore */ }
    pushToast(isNew ? "Demo product added — live in the storefront." : "Demo product updated.", "success");
    setEditing(null);
  };

  const onDelete = () => {
    if (!deleting) return;
    const res = deleteProductById(deleting.id, live.map((p) => p.id));
    if (!res.ok) {
      pushToast(res.error, "error");
    } else {
      const at = PRODUCTS.findIndex((p) => p.id === deleting.id);
      if (at >= 0) PRODUCTS.splice(at, 1);
      try { logActivity("product", `Deleted demo product ${deleting.name}`); } catch { /* ignore */ }
      pushToast("Demo product deleted.", "success");
    }
    setDeleting(null);
  };

  const setF = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditing((f) => (f ? { ...f, [k]: v } : f));
  };
  const ferr = (k) => errors[k] && <p className="mt-1 text-xs font-medium text-red-600">{errors[k]}</p>;
  const field = "w-full rounded-xl border border-stone-200 bg-[#FAFAF5] px-3.5 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:bg-white focus:ring-2 focus:ring-green-100";
  const flabel = "mb-1.5 block text-[13px] font-bold";

  const csvRows = useMemo(() => ([
    ["SKU", "Name", "Category", "Pack", "Price", "MRP", "Discount %", "Cost", "Stock", "Status", "Rating", "Demo data"],
    ...filtered.map((p) => [getSku(p), p.name, p.category, p.unit, p.price, p.originalPrice, discountPctOf(p.originalPrice, p.price), p.cost ?? "", p.stock, p.active === false ? "Inactive" : "Active", p.rating ?? "", "yes"]),
  ]), [filtered]);

  return (
    <div ref={scope} className="flex flex-col gap-4">
      <SectionHead
        eyebrow="Catalogue"
        title="Product management"
        sub="Edits apply to the shared demo catalogue instantly — shop, carousels and details update."
        right={
          <>
            <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#14532D]">
              <Plus size={15} /> Add Product
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, SKU or ID…" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category filter" className={`${inputCls} w-auto`}>
          {["All", ...CATEGORIES.map((c) => c.id)].map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={avail} onChange={(e) => setAvail(e.target.value)} aria-label="Availability filter" className={`${inputCls} w-auto`}>
          {["All", "In stock", "Low stock", "Out of stock", "Inactive"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className={`${inputCls} w-auto`}>
          {[["name", "Name A–Z"], ["price-asc", "Price ↑"], ["price-desc", "Price ↓"], ["stock-asc", "Stock ↑"], ["stock-desc", "Stock ↓"], ["rating-desc", "Rating"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <p className="text-xs text-stone-400">{filtered.length} products • low-stock threshold: {threshold} units (demo) • SKU auto-generates when blank.</p>

      {filtered.length === 0 ? (
        <div className={card}><p className="p-6 text-center text-sm text-stone-400">No demo products match — adjust filters or add one.</p></div>
      ) : (
        <>
          <TableWrap>
            <thead><tr>
              <th className={thCls}>Product</th><th className={thCls}>SKU</th><th className={thCls}>Category</th>
              <th className={thCls}>Price / MRP</th><th className={thCls}>Stock</th><th className={thCls}>Status</th>
              <th className={thCls}><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-green-50/40">
                  <td className={tdCls}>
                    <span className="flex items-center gap-2.5">
                      {p.image ? <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">—</span>}
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold">{p.name}</span>
                        <span className="block text-[11px] text-stone-400">{p.unit} {p.bestseller ? "• Bestseller" : ""}{p.featured ? " • Featured" : ""}</span>
                      </span>
                    </span>
                  </td>
                  <td className={tdCls + " font-mono text-xs"}>{getSku(p)}</td>
                  <td className={tdCls + " text-[13px]"}>{p.category}</td>
                  <td className={tdCls + " text-[13px]"}><b>₹{p.price}</b> <span className="text-stone-400 line-through">₹{p.originalPrice}</span> <span className="font-bold text-[#f97316]">{discountPctOf(p.originalPrice, p.price)}%</span></td>
                  <td className={tdCls + " font-extrabold"}>{p.stock}</td>
                  <td className={tdCls}><StatusBadge status={p.active === false ? "Inactive" : (Number(p.stock) || 0) <= 0 ? "Out of stock" : (Number(p.stock) || 0) <= threshold ? "Low stock" : "In stock"} /></td>
                  <td className={tdCls}>
                    <span className="flex gap-1.5">
                      <button onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50"><Pencil size={15} /></button>
                      <button onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <Pager page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
          <div><CsvButton filename="freshcart-products-demo.csv" rows={csvRows} label="Export CSV" /></div>
        </>
      )}

      <AnimatePresence>
        {editing && (
          <Modal key="pform" title={editing.id ? `Edit — ${editing.name || "product"}` : "Add Product (demo)"} onClose={() => setEditing(null)} wide>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={flabel} htmlFor="pf-name">Product name *</label>
                <input id="pf-name" value={editing.name} onChange={setF("name")} className={field} placeholder="e.g. Toor Dal" />{ferr("name")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-cat">Category *</label>
                <select id="pf-cat" value={editing.category} onChange={setF("category")} className={field}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>{ferr("category")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-unit">Pack size *</label>
                <input id="pf-unit" value={editing.unit} onChange={setF("unit")} className={field} placeholder="1 kg" />{ferr("unit")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-sku">SKU (blank = auto)</label>
                <input id="pf-sku" value={editing.sku} onChange={setF("sku")} className={field} placeholder="FC-…" />{ferr("sku")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-price">Selling price (₹) *</label>
                <input id="pf-price" type="number" min="0" value={editing.price} onChange={setF("price")} className={field} />{ferr("price")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-mrp">Original price (₹) *</label>
                <input id="pf-mrp" type="number" min="0" value={editing.originalPrice} onChange={setF("originalPrice")} className={field} />{ferr("originalPrice")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-cost">Cost price (₹, optional)</label>
                <input id="pf-cost" type="number" min="0" value={editing.cost} onChange={setF("cost")} className={field} placeholder="For profit estimates" />{ferr("cost")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-stock">Stock quantity *</label>
                <input id="pf-stock" type="number" min="0" step="1" value={editing.stock} onChange={setF("stock")} className={field} />{ferr("stock")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-rating">Rating (0–5)</label>
                <input id="pf-rating" type="number" min="0" max="5" step="0.1" value={editing.rating} onChange={setF("rating")} className={field} />{ferr("rating")}
              </div>
              <div>
                <label className={flabel} htmlFor="pf-reviews">Review count</label>
                <input id="pf-reviews" type="number" min="0" step="1" value={editing.reviews} onChange={setF("reviews")} className={field} />
              </div>
              <div className="sm:col-span-2">
                <span className={flabel}>Product image (demo — stored locally, never uploaded)</span>
                <div className="flex flex-wrap items-center gap-3">
                  {editing.image ? (
                    <img src={editing.image} alt="Preview" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-stone-200" />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 text-stone-300"><ImagePlus size={24} /></span>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-[13px] font-bold hover:bg-stone-50">
                      <ImagePlus size={15} /> Upload image
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onImageFile(e.target.files?.[0])} />
                    </label>
                    {editing.image && (
                      <button onClick={() => setEditing((f) => (f ? { ...f, image: "" } : f))} className="rounded-full border border-red-200 px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50">
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
                {imgError && <p className="mt-1 text-xs font-medium text-red-600">{imgError}</p>}
                <input value={editing.image?.startsWith("data:") ? "(uploaded preview stored)" : editing.image} onChange={(e) => setEditing((f) => (f ? { ...f, image: e.target.value } : f))} placeholder="…or paste an image URL" aria-label="Image URL" className={`${field} mt-2`} />
              </div>
              <div className="sm:col-span-2">
                <label className={flabel} htmlFor="pf-desc">Description</label>
                <textarea id="pf-desc" value={editing.description} onChange={setF("description")} rows={2} className={field} />
              </div>
              {[
                ["bestseller", "Bestseller flag"], ["featured", "Featured flag"], ["active", "Active (visible & purchasable)"],
              ].map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
                  <input type="checkbox" checked={!!editing[k]} onChange={setF(k)} className="h-4 w-4 accent-[#16A34A]" /> {label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-stone-400">
              Discount shown = (Original − Selling) ÷ Original × 100.
              {editing.price !== "" && editing.originalPrice !== "" && Number(editing.originalPrice) > 0
                ? ` Current: ${discountPctOf(Number(editing.originalPrice), Number(editing.price))}%.` : ""}
              {" "}Inactive products stay visible but cannot be purchased.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="rounded-full border border-stone-200 px-6 py-2.5 text-sm font-bold hover:bg-stone-50">Cancel</button>
              <button onClick={onSave} className="rounded-full bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#14532D]">Save Product</button>
            </div>
          </Modal>
        )}
        {deleting && (
          <ConfirmDialog
            key="pdel"
            title={`Delete ${deleting.name}?`}
            body="Removes it from the demo catalogue (kept in local history). Carts referencing it stay untouched."
            confirmLabel="Delete"
            onCancel={() => setDeleting(null)}
            onConfirm={onDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
