import React from 'react'
import { FiX } from "react-icons/fi";

const ProductModal = ({ isOpen, onClose, editingProduct, productForm, setProductForm, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="glass-panel glass-panel-glow w-full max-w-md shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <FiX className="text-xl" />
                </button>
                <h2 className="text-lg font-display font-bold text-zinc-100 mb-6">
                    {editingProduct ? "Edit Product Specifications" : "Register New Product"}
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                            Product Name
                        </label>
                        <input
                            type="text"
                            required
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Leather Executive Chair"
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                            SKU / Code
                        </label>
                        <input
                            type="text"
                            required
                            disabled={editingProduct !== null}
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                            placeholder="e.g. FURN-CH-002"
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo disabled:opacity-40 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono font-semibold"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={productForm.price}
                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                placeholder="129.99"
                                className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                                Stock Level
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={productForm.quantity}
                                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                                placeholder="50"
                                className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-indigo/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Save Specs
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProductModal
