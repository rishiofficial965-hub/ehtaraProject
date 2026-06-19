import React from 'react'
import { FiBox } from "react-icons/fi";

const Totalproduct = ({ products }) => {
    return (
        <div className="glass-panel glass-panel-glow p-6 rounded-2xl relative overflow-hidden group hover:border-accent-indigo/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 rounded-full blur-2xl group-hover:bg-accent-indigo/10 transition-all duration-300"></div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Products</p>
                    <h3 className="text-4xl font-display font-extrabold mt-2 text-zinc-100 tracking-tight">{products.length}</h3>
                </div>
                <div className="bg-gradient-to-tr from-accent-indigo/10 to-accent-violet/10 text-accent-indigo border border-accent-indigo/20 p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                    <FiBox className="text-xl" />
                </div>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">Unique SKU items</p>
        </div>
    )
}

export default Totalproduct
