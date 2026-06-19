import React from 'react'
import { FiBox, FiEdit2, FiTrash2 } from "react-icons/fi";

const ProductTable = ({ products, handleOpenEditProduct, handleProductDelete }) => {
    return (
        <div className="glass-panel border-white/5 rounded-2xl overflow-hidden">
            {products.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <FiBox className="text-5xl mx-auto mb-4 opacity-30 text-accent-indigo animate-pulse" />
                    <p className="text-sm font-bold text-zinc-300">No products found</p>
                    <p className="text-xs text-zinc-500 mt-1">Register a product to start building your catalog.</p>
                </div>
            ) : (
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6 font-display">Product Name</th>
                                <th className="py-4 px-6 font-display">SKU / Code</th>
                                <th className="py-4 px-6 text-right font-display">Price</th>
                                <th className="py-4 px-6 text-right font-display">Quantity</th>
                                <th className="py-4 px-6 text-center font-display">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                                    <td className="py-4 px-6 font-bold text-zinc-200">{p.name}</td>
                                    <td className="py-4 px-6 font-mono text-xs text-zinc-400 font-semibold">{p.sku}</td>
                                    <td className="py-4 px-6 text-right text-zinc-200 font-semibold">${p.price.toFixed(2)}</td>
                                    <td className={`py-4 px-6 text-right font-extrabold ${p.quantity < 10 ? "text-accent-rose" : "text-zinc-300"}`}>
                                        {p.quantity}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenEditProduct(p)}
                                                className="p-2 hover:bg-accent-indigo/10 text-accent-indigo rounded-xl transition-all hover:scale-110"
                                                title="Edit Product"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleProductDelete(p.id)}
                                                className="p-2 hover:bg-accent-rose/10 text-accent-rose rounded-xl transition-all hover:scale-110"
                                                title="Delete Product"
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

export default ProductTable
