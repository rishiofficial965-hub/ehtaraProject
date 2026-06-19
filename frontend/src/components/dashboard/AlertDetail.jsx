import React from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

const AlertDetail = ({ lowStockProducts, lowStockThreshold }) => {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2.5 mb-6">
                <FiAlertTriangle className="text-accent-rose text-xl" />
                <h4 className="font-display font-bold text-zinc-200">Critical Stock Exceptions</h4>
            </div>
            {lowStockProducts.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 border border-dashed border-white/5 rounded-xl">
                    <p className="text-sm">All products have sufficient stock levels.</p>
                </div>
            ) : (
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="pb-3 pr-4 font-display">Product Name</th>
                                <th className="pb-3 px-4 font-display">SKU / Code</th>
                                <th className="pb-3 px-4 font-display text-right">Price</th>
                                <th className="pb-3 px-4 font-display text-right">In Stock</th>
                                <th className="pb-3 pl-4 text-right font-display">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {lowStockProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                                    <td className="py-3.5 pr-4 font-bold text-zinc-200">{p.name}</td>
                                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">{p.sku}</td>
                                    <td className="py-3.5 px-4 text-right text-zinc-300 font-semibold">${p.price.toFixed(2)}</td>
                                    <td className="py-3.5 px-4 text-right text-accent-rose font-bold">{p.quantity} units</td>
                                    <td className="py-3.5 pl-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-rose/10 text-accent-rose border border-accent-rose/15 uppercase tracking-wide">
                                            {p.quantity === 0 ? "Out of Stock" : "Restock Needed"}
                                        </span>
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

export default AlertDetail
