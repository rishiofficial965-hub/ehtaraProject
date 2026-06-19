import React from 'react'
import { FiX } from "react-icons/fi";

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="glass-panel glass-panel-glow w-full max-w-xl shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <FiX className="text-xl" />
                </button>

                <h2 className="text-lg font-display font-bold text-zinc-100 mb-2">Order Details</h2>
                <p className="text-xs font-mono text-accent-violet mb-6 font-bold bg-accent-violet/10 border border-accent-violet/15 px-2 py-0.5 rounded-lg inline-block">
                    #ORD-{order.id}
                </p>

                <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl mb-6 text-xs">
                    <div>
                        <p className="font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">Customer</p>
                        <p className="font-bold text-zinc-200 text-sm">{order.customer_name}</p>
                    </div>
                    <div>
                        <p className="font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">Order Date</p>
                        <p className="font-bold text-zinc-200 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 font-display">Purchased Items</h4>
                <div className="border border-white/5 rounded-xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-bold uppercase tracking-wider">
                                <th className="py-2.5 px-4 font-display">Product Name (SKU)</th>
                                <th className="py-2.5 px-4 text-right font-display">Unit Price</th>
                                <th className="py-2.5 px-4 text-right font-display">Qty</th>
                                <th className="py-2.5 px-4 text-right font-display">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                            {order.items.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4 font-bold text-zinc-200">
                                        {item.product_name || `Product ID ${item.product_id}`}
                                        {item.product_sku && (
                                            <span className="block text-[10px] font-mono text-zinc-500 mt-0.5 font-semibold">
                                                {item.product_sku}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold">${(item.product_price || 0).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right font-bold text-zinc-100">{item.quantity}</td>
                                    <td className="py-3 px-4 text-right text-zinc-200 font-extrabold">
                                        ${((item.product_price || 0) * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6 border-t border-white/5 pt-4">
                    <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Total Charge</p>
                        <p className="text-2xl font-display font-extrabold text-accent-emerald">
                            ${order.total_amount.toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-200 rounded-xl text-xs font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Close View
                    </button>
                </div>

            </div>
        </div>
    )
}

export default OrderDetailsModal
