import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  LuImagePlus, LuX, LuPlus, LuTrash2, LuLayers, LuSave, LuArrowLeft, LuPackage,
} from "react-icons/lu";
import Nav from "../components/Nav";
import { useToast } from "../../common/Toast";
import Loader from "../../auth/components/Loader.jsx";

// ── Shared input style ────────────────────────────────────────────────────────
const input =
  "w-full bg-white border border-lacquered-licorice/10 text-lacquered-licorice placeholder:text-lacquered-licorice/25 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-copper-green border border-lacquered-licorice/10 transition-all";

const label = "block text-[10px] font-black uppercase tracking-widest text-lacquered-licorice/40 mb-2";

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lacquered-licorice/40">{title}</h3>
      <div className="flex-1 h-px bg-lacquered-licorice/8" />
    </div>
    {children}
  </div>
);

const SellerProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetProductDetails, handleUpdateProduct } = useProduct();
  const loading = useSelector((state) => state.product.loading);
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", priceAmount: "", priceCurrency: "INR",
    brand: "", category: "", gender: "Unisex",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);

  async function getProductDetails() {
    const res = await handleGetProductDetails(productId);
    if (res && !res.error) {
      setFormData({
        title: res.title, description: res.description,
        priceAmount: res.price.amount, priceCurrency: res.price.currency,
        brand: res.brand || "", category: res.category || "", gender: res.gender || "Unisex",
      });
      setExistingImages(res.images || []);
      setVariants((res.variants || []).map((v) => ({
        stock: v.stock, priceAmount: v.price.amount, priceCurrency: v.price.currency,
        attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value })),
        existingImages: v.images || [], newImages: [], newImagePreviews: [],
      })));
    }
  }

  useEffect(() => { if (productId) getProductDetails(); }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (i) => {
    URL.revokeObjectURL(newImagePreviews[i]);
    setNewImages((prev) => prev.filter((_, j) => j !== i));
    setNewImagePreviews((prev) => prev.filter((_, j) => j !== i));
  };

  const removeExistingImage = (i) => setExistingImages((prev) => prev.filter((_, j) => j !== i));

  // Variant helpers
  const addVariant = () => setVariants((prev) => [
    ...prev,
    { stock: 0, priceAmount: formData.priceAmount, priceCurrency: formData.priceCurrency,
      attributes: [{ key: "", value: "" }], existingImages: [], newImages: [], newImagePreviews: [] },
  ]);

  const removeVariant = (i) => {
    variants[i].newImagePreviews.forEach(URL.revokeObjectURL);
    setVariants((prev) => prev.filter((_, j) => j !== i));
  };

  const setVariant = (i, patch) =>
    setVariants((prev) => prev.map((v, j) => j === i ? { ...v, ...patch } : v));

  const handleVariantChange = (i, e) => setVariant(i, { [e.target.name]: e.target.value });

  const handleAttrChange = (vI, aI, field, val) =>
    setVariants((prev) => prev.map((v, j) => {
      if (j !== vI) return v;
      const attrs = v.attributes.map((a, k) => k === aI ? { ...a, [field]: val } : a);
      return { ...v, attributes: attrs };
    }));

  const addAttr = (vI) => setVariants((prev) => prev.map((v, j) =>
    j === vI ? { ...v, attributes: [...v.attributes, { key: "", value: "" }] } : v));

  const removeAttr = (vI, aI) => setVariants((prev) => prev.map((v, j) =>
    j === vI ? { ...v, attributes: v.attributes.filter((_, k) => k !== aI) } : v));

  const addVariantImage = (vI, e) => {
    const files = Array.from(e.target.files);
    setVariant(vI, {
      newImages: [...variants[vI].newImages, ...files],
      newImagePreviews: [...variants[vI].newImagePreviews, ...files.map((f) => URL.createObjectURL(f))],
    });
  };

  const removeVariantNewImg = (vI, iI) => {
    URL.revokeObjectURL(variants[vI].newImagePreviews[iI]);
    setVariant(vI, {
      newImages: variants[vI].newImages.filter((_, k) => k !== iI),
      newImagePreviews: variants[vI].newImagePreviews.filter((_, k) => k !== iI),
    });
  };

  const removeVariantExistImg = (vI, iI) =>
    setVariant(vI, { existingImages: variants[vI].existingImages.filter((_, k) => k !== iI) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("existingImages", JSON.stringify(existingImages));
    newImages.forEach((img) => data.append("images", img));

    const serializedVariants = variants.map((v, idx) => {
      v.newImages.forEach((img) => data.append(`variant_${idx}_images`, img));
      const attrs = {};
      v.attributes.forEach(({ key, value }) => { if (key && value) attrs[key] = value; });
      return { stock: v.stock, priceAmount: v.priceAmount, priceCurrency: v.priceCurrency, attributes: attrs, images: v.existingImages };
    });

    data.append("variants", JSON.stringify(serializedVariants));
    const result = await handleUpdateProduct(productId, data);
    setSaving(false);

    if (result?.success) {
      toast.success("Product updated successfully!");
      navigate("/seller/dashboard");
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  // ── Image thumbnail shared component ───────────────────────────────────────
  const ImgThumb = ({ src, onRemove, isNew, size = "16" }) => (
    <div className={`relative w-${size} h-${size} rounded-xl overflow-hidden group border ${isNew ? "border-copper-green shadow-sm shadow-copper-green/20" : "border-lacquered-licorice/8"}`}>
      <img src={src} className="w-full h-full object-cover" alt="" />
      {isNew && <span className="absolute top-1.5 left-1.5 bg-copper-green text-albescent-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">New</span>}
      <button type="button" onClick={onRemove}
        className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <LuTrash2 size={16} className="text-white" />
      </button>
    </div>
  );

  const AddImgBtn = ({ onChange, size = "16" }) => (
    <label className={`w-${size} h-${size} flex flex-col items-center justify-center border border-dashed border-lacquered-licorice/15 rounded-xl cursor-pointer hover:border-copper-green hover:bg-copper-green/5 transition-all text-lacquered-licorice/20 hover:text-copper-green`}>
      <LuImagePlus size={size === "16" ? 20 : 16} />
      <span className="text-[7px] mt-1 font-black uppercase tracking-widest hidden sm:block">Add</span>
      <input type="file" multiple accept="image/*" onChange={onChange} className="hidden" />
    </label>
  );

  if (loading && !formData.title) return <Loader />;

  return (
    <div className="min-h-screen bg-desert-khaki/30 flex flex-col font-sans">
      <Nav />

      <main className="flex-1 container mx-auto max-w-5xl px-4 md:px-8 py-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-lacquered-licorice/10 flex items-center justify-center text-lacquered-licorice/40 hover:bg-lacquered-licorice hover:text-albescent-white hover:border-lacquered-licorice transition-all shadow-sm">
            <LuArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-copper-green mb-0.5">Seller Dashboard</p>
            <h1 className="text-2xl font-bold text-lacquered-licorice uppercase tracking-tight flex items-center gap-2">
              <LuPackage size={20} className="text-copper-green" />
              Edit Product
            </h1>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 bg-lacquered-licorice/5 border border-lacquered-licorice/8 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-copper-green animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-lacquered-licorice/40">Live Listing</span>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid: left form + right image sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: General Info ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-lacquered-licorice/10 shadow-sm p-6 space-y-5">
                <Section title="General Information">
                  <div>
                    <label className={label}>Product Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required
                      placeholder="e.g. Oversized Acid Wash Tee" className={input} />
                  </div>
                  <div>
                    <label className={label}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                      placeholder="Tell buyers what makes this product special…"
                      className={`${input} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={label}>Brand</label>
                      <input name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Snitch" className={input} />
                    </div>
                    <div>
                      <label className={label}>Category</label>
                      <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. T-Shirts" className={input} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={label}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className={`${input} cursor-pointer`}>
                        {["Men", "Women", "Unisex", "Kids"].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Currency</label>
                      <select name="priceCurrency" value={formData.priceCurrency} onChange={handleChange} className={`${input} cursor-pointer`}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={label}>Base Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-lacquered-licorice/30">
                        {formData.priceCurrency === "INR" ? "₹" : formData.priceCurrency === "USD" ? "$" : formData.priceCurrency === "EUR" ? "€" : "£"}
                      </span>
                      <input type="number" name="priceAmount" value={formData.priceAmount} onChange={handleChange} required
                        placeholder="0.00" className={`${input} pl-8`} />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Variants ────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-lacquered-licorice/10 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lacquered-licorice/40">Product Variants</h3>
                    <div className="h-px flex-1 bg-lacquered-licorice/8 w-16" />
                    {variants.length > 0 && (
                      <span className="bg-lacquered-licorice text-albescent-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        {variants.length}
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={addVariant}
                    className="flex items-center gap-1.5 bg-copper-green text-albescent-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-lacquered-licorice transition-all shadow-sm active:scale-95">
                    <LuPlus size={12} /> Add Variant
                  </button>
                </div>

                {variants.length === 0 && (
                  <div className="border border-dashed border-lacquered-licorice/15 rounded-xl p-8 text-center bg-desert-khaki/10">
                    <LuLayers size={32} className="text-lacquered-licorice/15 mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-lacquered-licorice/30 uppercase tracking-widest">No variants yet</p>
                    <p className="text-xs text-lacquered-licorice/20 mt-1">Add size, colour or any attribute variant</p>
                  </div>
                )}

                <div className="space-y-5">
                  {variants.map((v, vI) => (
                    <div key={vI} className="border border-lacquered-licorice/10 rounded-xl p-5 space-y-4 transition-colors bg-desert-khaki/10">
                      {/* Variant header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LuLayers size={13} className="text-copper-green" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-lacquered-licorice/60">
                            Variant #{vI + 1}
                          </span>
                        </div>
                        <button type="button" onClick={() => removeVariant(vI)}
                          className="w-7 h-7 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                          <LuTrash2 size={12} />
                        </button>
                      </div>

                      {/* Price + Stock */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={label}>Price</label>
                          <input type="number" name="priceAmount" value={v.priceAmount}
                            onChange={(e) => handleVariantChange(vI, e)} className={input} />
                        </div>
                        <div>
                          <label className={label}>Stock</label>
                          <input type="number" name="stock" value={v.stock}
                            onChange={(e) => handleVariantChange(vI, e)} className={input} />
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="space-y-2">
                        <label className={label}>Attributes</label>
                        {v.attributes.map((attr, aI) => (
                          <div key={aI} className="flex gap-2 items-center">
                            <input type="text" placeholder="Key (e.g. Color)"
                              value={attr.key} onChange={(e) => handleAttrChange(vI, aI, "key", e.target.value)}
                              className={`${input} flex-1 text-xs py-2.5`} />
                            <input type="text" placeholder="Value (e.g. Crimson)"
                              value={attr.value} onChange={(e) => handleAttrChange(vI, aI, "value", e.target.value)}
                              className={`${input} flex-1 text-xs py-2.5`} />
                            <button type="button" onClick={() => removeAttr(vI, aI)}
                              className="w-8 h-10 flex items-center justify-center text-lacquered-licorice/20 hover:text-red-400 transition-colors shrink-0">
                              <LuX size={14} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addAttr(vI)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-copper-green hover:text-lacquered-licorice transition-colors">
                          <LuPlus size={11} /> Add Property
                        </button>
                      </div>

                      {/* Variant images */}
                      <div>
                        <label className={label}>Images</label>
                        <div className="flex flex-wrap gap-2.5">
                          {v.existingImages.map((img, iI) => (
                            <ImgThumb key={`ve-${iI}`} src={img.url} size="14" onRemove={() => removeVariantExistImg(vI, iI)} />
                          ))}
                          {v.newImagePreviews.map((url, iI) => (
                            <ImgThumb key={`vn-${iI}`} src={url} size="14" isNew onRemove={() => removeVariantNewImg(vI, iI)} />
                          ))}
                          <AddImgBtn size="14" onChange={(e) => addVariantImage(vI, e)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right sidebar: Images ───────────────────────────────────── */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-lacquered-licorice/10 shadow-sm p-6 space-y-5 lg:sticky lg:top-28">
                <Section title="Product Images">
                  <div className="grid grid-cols-3 gap-2.5">
                    {existingImages.map((img, i) => (
                      <ImgThumb key={`e-${i}`} src={img.url} onRemove={() => removeExistingImage(i)} />
                    ))}
                    {newImagePreviews.map((url, i) => (
                      <ImgThumb key={`n-${i}`} src={url} isNew onRemove={() => removeNewImage(i)} />
                    ))}
                    <AddImgBtn onChange={handleNewImageChange} />
                  </div>
                  <p className="text-[9px] font-bold text-lacquered-licorice/20 uppercase tracking-widest text-center">
                    {existingImages.length + newImages.length} image{existingImages.length + newImages.length !== 1 ? "s" : ""}
                  </p>
                </Section>

                {/* Save button */}
                <button type="submit" disabled={saving}
                  className="w-full bg-lacquered-licorice text-albescent-white font-bold py-4 rounded-xl hover:bg-copper-green transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] tracking-[0.25em] uppercase flex items-center justify-center gap-2.5">
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LuSave size={15} />
                  )}
                  {saving ? "Saving…" : "Update Product"}
                </button>

                <p className="text-[9px] text-center font-bold text-lacquered-licorice/20 uppercase tracking-widest">
                  Changes go live immediately
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-lacquered-licorice/5 text-center mt-8">
        <p className="text-[9px] font-black tracking-[0.4em] text-lacquered-licorice/20 uppercase">
          © 2026 Snitch Seller Platform
        </p>
      </footer>
    </div>
  );
};

export default SellerProductDetails;
