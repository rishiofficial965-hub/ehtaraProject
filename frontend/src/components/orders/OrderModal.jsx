import React from 'react'
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

const OrderModal = ({
    isOpen,
    onClose,
    orderForm,
    customers,
    products,
    handleAddOrderLineItem,
    handleRemoveOrderLineItem,
    handleOrderLineChange,
    calculateLiveTotal,
    onSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="glass-panel glass-panel-glow w-full max-w-2xl shadow-2xl p-6 rounded-2xl relative max-h-[90vh] flex flex-col animate-fade-slide-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <FiX className="text-xl" />
                </button>

                <h2 className="text-lg font-display font-bold text-zinc-100 mb-6 shrink-0">Compile New Order</h2>

                <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 space-y-5">

                    {/* Customer Selector */}
                    <div className="shrink-0">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                            Target Customer
                        </label>
                        <select
                            value={orderForm.customer_id}
                            onChange={(e) => handleOrderLineChange(null, "customer_id", e.target.value)}
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none transition-all font-semibold"
                        >
                            {customers.map((c) => (
                                <option key={c.id} className="bg-obsidian-panel text-zinc-200" value={c.id}>
                                    {c.full_name} ({c.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Items Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-display">Line Items</span>
                            <button
                                type="button"
                                onClick={handleAddOrderLineItem}
                                className="flex items-center gap-1.5 text-xs text-accent-indigo hover:text-accent-indigo/80 font-bold transition-all"
                            >
                                <FiPlus /> Add Item Row
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {orderForm.items.map((line, index) => {
                                const selectedProduct = products.find((p) => p.id.toString() === line.product_id);
                                return (
                                    <div key={index} className="flex gap-4 items-end bg-black/20 border border-white/5 p-4 rounded-xl">
                                        <div className="flex-1">
                                            <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">
                                                Product
                                            </label>
                                            <select
                                                value={line.product_id}
                                                onChange={(e) => handleOrderLineChange(index, "product_id", e.target.value)}
                                                className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-all font-semibold"
                                            >
                                                {products.map((p) => (
                                                    <option key={p.id} className="bg-obsidian-panel text-zinc-200" value={p.id}>
                                                        {p.name} - ${p.price.toFixed(2)} ({p.quantity} in stock)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={line.quantity}
                                                onChange={(e) => handleOrderLineChange(index, "quantity", e.target.value)}
                                                className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-all font-semibold"
                                            />
                                        </div>
                                        <div className="w-24 text-right shrink-0">
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-display">Subtotal</p>
                                            <p className="text-xs font-bold text-zinc-300">
                                                ${((selectedProduct?.price || 0) * (parseInt(line.quantity) || 0)).toFixed(2)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={orderForm.items.length === 1}
                                            onClick={() => handleRemoveOrderLineItem(index)}
                                            className="p-2 hover:bg-white/5 text-accent-rose disabled:opacity-30 rounded-xl transition-all mb-0.5"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary and Actions */}
                    <div className="shrink-0 border-t border-white/5 pt-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-display">Estimated Total</p>
                            <p className="text-2xl font-display font-extrabold text-accent-emerald">${calculateLiveTotal()}</p>
                        </div>
                        <div className="flex gap-3">
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
                                Submit Order
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default OrderModal
