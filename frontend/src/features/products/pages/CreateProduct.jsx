import { useState } from "react";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct.js";
import { LuPackagePlus, LuImagePlus, LuX, LuPlus, LuTrash2, LuLayers } from "react-icons/lu";
import { FaArrowLeft } from "react-icons/fa";
import Nav from "../components/Nav.jsx";
import { useToast } from "../../common/Toast";
import { useNavigate } from "react-router-dom";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp = "w-full bg-white border border-lacquered-licorice/10 text-lacquered-licorice placeholder:text-lacquered-licorice/25 px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-copper-green border border-lacquered-licorice/10 transition-all";
const lbl = "block text-[10px] font-black uppercase tracking-widest text-lacquered-licorice/40 mb-2";

const Section = ({ title, children }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lacquered-licorice/40 shrink-0">{title}</h3>
      <div className="flex-1 h-px bg-lacquered-licorice/8" />
    </div>
    {children}
  </div>
);

const ImgThumb = ({ src, onRemove }) => (
  <div className="relative w-16 h-16 rounded-xl overflow-hidden group border border-copper-green/20 shadow-sm">
    <img src={src} className="w-full h-full object-cover" alt="" />
    <button type="button" onClick={onRemove}
      className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <LuTrash2 size={16} className="text-white" />
    </button>
  </div>
);

const AddImgBtn = ({ onChange, small }) => (
  <label className={`${small ? "w-12 h-12" : "w-16 h-16"} flex flex-col items-center justify-center border border-dashed border-lacquered-licorice/15 rounded-xl cursor-pointer hover:border-copper-green hover:bg-copper-green/5 transition-all text-lacquered-licorice/20 hover:text-copper-green`}>
    <LuImagePlus size={small ? 16 : 20} />
    {!small && <span className="text-[7px] mt-1 font-black uppercase tracking-widest">Add</span>}
    <input type="file" multiple accept="image/*" onChange={onChange} className="hidden" />
  </label>
);

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const productLoading = useSelector((state) => state.product?.loading);
  const toast = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "", description: "", priceAmount: "", priceCurrency: "INR",
    category: "", brand: "", gender: "Unisex",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variants, setVariants] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i) => {
    URL.revokeObjectURL(imagePreviews[i]);
    setImages((prev) => prev.filter((_, j) => j !== i));
    setImagePreviews((prev) => prev.filter((_, j) => j !== i));
  };

  // Variant helpers
  const addVariant = () => setVariants((prev) => [
    ...prev,
    { stock: 0, priceAmount: formData.priceAmount, priceCurrency: formData.priceCurrency,
      attributes: [{ key: "", value: "" }], images: [], imagePreviews: [] },
  ]);

  const removeVariant = (i) => {
    variants[i].imagePreviews.forEach(URL.revokeObjectURL);
    setVariants((prev) => prev.filter((_, j) => j !== i));
  };

  const setVariant = (i, patch) =>
    setVariants((prev) => prev.map((v, j) => j === i ? { ...v, ...patch } : v));

  const handleVariantChange = (i, e) => setVariant(i, { [e.target.name]: e.target.value });

  const handleAttrChange = (vI, aI, field, val) =>
    setVariants((prev) => prev.map((v, j) => {
      if (j !== vI) return v;
      return { ...v, attributes: v.attributes.map((a, k) => k === aI ? { ...a, [field]: val } : a) };
    }));

  const addAttr = (vI) => setVariants((prev) => prev.map((v, j) =>
    j === vI ? { ...v, attributes: [...v.attributes, { key: "", value: "" }] } : v));

  const removeAttr = (vI, aI) => setVariants((prev) => prev.map((v, j) =>
    j === vI ? { ...v, attributes: v.attributes.filter((_, k) => k !== aI) } : v));

  const handleVariantImageChange = (vI, e) => {
    const files = Array.from(e.target.files);
    setVariant(vI, {
      images: [...variants[vI].images, ...files],
      imagePreviews: [...variants[vI].imagePreviews, ...files.map((f) => URL.createObjectURL(f))],
    });
  };

  const removeVariantImage = (vI, iI) => {
    URL.revokeObjectURL(variants[vI].imagePreviews[iI]);
    setVariant(vI, {
      images: variants[vI].images.filter((_, k) => k !== iI),
      imagePreviews: variants[vI].imagePreviews.filter((_, k) => k !== iI),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    images.forEach((img) => data.append("images", img));

    const serializedVariants = variants.map((v, idx) => {
      v.images.forEach((img) => data.append(`variant_${idx}_images`, img));
      const attrs = {};
      v.attributes.forEach(({ key, value }) => { if (key && value) attrs[key] = value; });
      return { stock: v.stock, priceAmount: v.priceAmount, priceCurrency: v.priceCurrency, attributes: attrs };
    });
    data.append("variants", JSON.stringify(serializedVariants));

    const result = await handleCreateProduct(data);
    setSaving(false);

    if (result && !result.error) {
      setFormData({ title: "", description: "", priceAmount: "", priceCurrency: "INR", category: "", brand: "", gender: "Unisex" });
      imagePreviews.forEach(URL.revokeObjectURL);
      setImages([]); setImagePreviews([]);
      variants.forEach((v) => v.imagePreviews.forEach(URL.revokeObjectURL));
      setVariants([]);
      toast.success("Product created successfully!");
      navigate("/seller/dashboard");
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  const currencySymbol = { INR: "₹", USD: "$", EUR: "€", GBP: "£" }[formData.priceCurrency] || "₹";

  return (
    <div className="min-h-screen bg-desert-khaki/30 flex flex-col font-sans">
      <Nav />

      <main className="flex-1 container mx-auto max-w-5xl px-4 md:px-8 py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-lacquered-licorice/10 flex items-center justify-center text-lacquered-licorice/40 hover:bg-lacquered-licorice hover:text-albescent-white hover:border-lacquered-licorice transition-all shadow-sm">
            <FaArrowLeft size={14} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-copper-green mb-0.5">Seller Dashboard</p>
            <h1 className="text-2xl font-bold text-lacquered-licorice uppercase tracking-tight flex items-center gap-2">
              <LuPackagePlus size={20} className="text-copper-green" />
              New Listing
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: Details + Variants ────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* General info card */}
              <div className="bg-white rounded-2xl border border-lacquered-licorice/10 shadow-sm p-6 space-y-5">
                <Section title="Product Details">
                  <div>
                    <label className={lbl}>Product Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required
                      placeholder="e.g. Oversized Acid Wash Tee" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                      placeholder="Tell buyers what makes this special…" className={`${inp} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Brand</label>
                      <input name="brand" value={formData.brand} onChange={handleChange}
                        placeholder="e.g. Snitch" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Category</label>
                      <input name="category" value={formData.category} onChange={handleChange}
                        placeholder="e.g. T-Shirts" className={inp} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className={`${inp} cursor-pointer`}>
                        {["Men", "Women", "Unisex", "Kids"].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Currency</label>
                      <select name="priceCurrency" value={formData.priceCurrency} onChange={handleChange} className={`${inp} cursor-pointer`}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Base Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-lacquered-licorice/30">{currencySymbol}</span>
                      <input type="number" name="priceAmount" value={formData.priceAmount} onChange={handleChange} required
                        placeholder="0.00" className={`${inp} pl-8`} />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Variants card */}
              <div className="bg-white rounded-2xl border border-lacquered-licorice/10 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lacquered-licorice/40">Variants</h3>
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
                    <LuLayers size={30} className="text-lacquered-licorice/12 mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-lacquered-licorice/25 uppercase tracking-widest">No variants yet</p>
                    <p className="text-xs text-lacquered-licorice/20 mt-1">Add size, colour or any attribute variant</p>
                  </div>
                )}

                <div className="space-y-5">
                  {variants.map((v, vI) => (
                    <div key={vI} className="border border-lacquered-licorice/10 rounded-xl p-5 space-y-4 transition-colors bg-desert-khaki/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LuLayers size={12} className="text-copper-green" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-lacquered-licorice/50">Variant #{vI + 1}</span>
                        </div>
                        <button type="button" onClick={() => removeVariant(vI)}
                          className="w-7 h-7 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                          <LuTrash2 size={12} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Price</label>
                          <input type="number" name="priceAmount" value={v.priceAmount}
                            onChange={(e) => handleVariantChange(vI, e)} placeholder="0.00" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Stock</label>
                          <input type="number" name="stock" value={v.stock}
                            onChange={(e) => handleVariantChange(vI, e)} placeholder="0" className={inp} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={lbl}>Attributes</label>
                        {v.attributes.map((attr, aI) => (
                          <div key={aI} className="flex gap-2 items-center">
                            <input type="text" placeholder="Key (e.g. Color)" value={attr.key}
                              onChange={(e) => handleAttrChange(vI, aI, "key", e.target.value)}
                              className={`${inp} flex-1 text-xs py-2.5`} />
                            <input type="text" placeholder="Value (e.g. Crimson)" value={attr.value}
                              onChange={(e) => handleAttrChange(vI, aI, "value", e.target.value)}
                              className={`${inp} flex-1 text-xs py-2.5`} />
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

                      <div>
                        <label className={lbl}>Variant Images</label>
                        <div className="flex flex-wrap gap-2.5">
                          {v.imagePreviews.map((url, iI) => (
                            <ImgThumb key={iI} src={url} onRemove={() => removeVariantImage(vI, iI)} />
                          ))}
                          <AddImgBtn small onChange={(e) => handleVariantImageChange(vI, e)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right sidebar: Images + Submit ──────────────────────────── */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-lacquered-licorice/10 shadow-sm p-6 space-y-5 lg:sticky lg:top-28">
                <Section title="Product Images">
                  <div className="grid grid-cols-3 gap-2.5">
                    {imagePreviews.map((url, i) => (
                      <ImgThumb key={i} src={url} onRemove={() => removeImage(i)} />
                    ))}
                    <AddImgBtn onChange={handleImageChange} />
                  </div>
                  {images.length === 0 && (
                    <p className="text-[9px] font-bold text-lacquered-licorice/20 uppercase tracking-widest text-center">
                      Add at least one photo
                    </p>
                  )}
                  {images.length > 0 && (
                    <p className="text-[9px] font-bold text-lacquered-licorice/20 uppercase tracking-widest text-center">
                      {images.length} image{images.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </Section>

                {/* Tips */}
                <div className="space-y-2 pt-2 border-t border-lacquered-licorice/5">
                  {[
                    "Use square images for best results",
                    "Min. 3 photos recommended",
                    "Variants can have their own photos",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper-green/40 mt-1.5 shrink-0" />
                      <p className="text-[9px] font-medium text-lacquered-licorice/25 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <button type="submit" disabled={saving}
                  className="w-full bg-lacquered-licorice text-albescent-white font-bold py-4 rounded-xl hover:bg-copper-green transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] tracking-[0.25em] uppercase flex items-center justify-center gap-2.5">
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LuPackagePlus size={15} />
                  )}
                  {saving ? "Publishing…" : "Publish Listing"}
                </button>

                <p className="text-[9px] text-center font-bold text-lacquered-licorice/20 uppercase tracking-widest">
                  Goes live immediately after publishing
                </p>
              </div>
            </div>

          </div>
        </form>
      </main>

      <footer className="py-8 border-t border-lacquered-licorice/5 text-center mt-8">
        <p className="text-[9px] font-black tracking-[0.4em] text-lacquered-licorice/20 uppercase">
          © 2026 Snitch Seller Platform · All rights reserved
        </p>
      </footer>
    </div>
  );
};

export default CreateProduct;
