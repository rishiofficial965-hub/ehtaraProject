import React from 'react'
import { FiAlertTriangle } from "react-icons/fi";

const LowstockAlert = ({ lowStockProducts, lowStockThreshold }) => {
    return (
        <div
            className={`glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 ${lowStockProducts.length > 0
                ? "border-accent-rose/30 hover:border-accent-rose/50"
                : "glass-panel-glow hover:border-accent-indigo/20"
                }`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-rose/5 rounded-full blur-2xl group-hover:bg-accent-rose/10 transition-all duration-300"></div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Low Stock Items</p>
                    <h3
                        className={`text-4xl font-display font-extrabold mt-2 tracking-tight ${lowStockProducts.length > 0 ? "text-accent-rose animate-pulse" : "text-zinc-100"
                            }`}
                    >
                        {lowStockProducts.length}
                    </h3>
                </div>
                <div
                    className={`p-3.5 rounded-xl border transition-all duration-300 group-hover:scale-110 ${lowStockProducts.length > 0
                        ? "bg-accent-rose/10 text-accent-rose border-accent-rose/25"
                        : "bg-gradient-to-tr from-accent-indigo/10 to-accent-violet/10 text-accent-indigo border border-accent-indigo/20"
                        }`}
                >
                    <FiAlertTriangle className="text-xl" />
                </div>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">
                Inventory Alert Level &lt; {lowStockThreshold}
            </p>
        </div>
    )
}

export default LowstockAlert
