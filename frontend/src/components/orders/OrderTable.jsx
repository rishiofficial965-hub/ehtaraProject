import React from 'react'
import { FiShoppingCart, FiEye, FiTrash2 } from "react-icons/fi";

const OrderTable = ({ orders, onView, onDelete }) => {
    return (
        <div className="glass-panel border-white/5 rounded-2xl overflow-hidden">
            {orders.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <FiShoppingCart className="text-5xl mx-auto mb-4 opacity-30 text-accent-indigo animate-pulse" />
                    <p className="text-sm font-bold text-zinc-300">No orders found</p>
                    <p className="text-xs text-zinc-500 mt-1">Place an order to start tracking stock reduction.</p>
                </div>
            ) : (
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6 font-display">Order ID</th>
                                <th className="py-4 px-6 font-display">Customer</th>
                                <th className="py-4 px-6 font-display">Date</th>
                                <th className="py-4 px-6 text-right font-display">Total Amount</th>
                                <th className="py-4 px-6 text-center font-display">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-white/5 transition-colors duration-150">
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-accent-violet/10 text-accent-violet border border-accent-violet/15">
                                            #ORD-{o.id}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-zinc-200">{o.customer_name}</td>
                                    <td className="py-4 px-6 text-zinc-400 font-semibold">
                                        {new Date(o.created_at).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-right text-accent-emerald font-extrabold">
                                        ${o.total_amount.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onView(o)}
                                                className="p-2 hover:bg-accent-indigo/10 text-accent-indigo rounded-xl transition-all hover:scale-110"
                                                title="View Details"
                                            >
                                                <FiEye />
                                            </button>
                                            <button
                                                onClick={() => onDelete(o.id)}
                                                className="p-2 hover:bg-accent-rose/10 text-accent-rose rounded-xl transition-all hover:scale-110"
                                                title="Cancel Order"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default OrderTable
