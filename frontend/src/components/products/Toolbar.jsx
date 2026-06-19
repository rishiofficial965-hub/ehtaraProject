import React from 'react'
import { FiSearch, FiPlus } from 'react-icons/fi'

const Toolbar = ({ productSearch, setProductSearch, handleOpenAddProduct }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <FiSearch />
                </span>
                <input
                    type="text"
                    placeholder="Search catalog by name/SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all font-semibold"
                />
            </div>
            <button
                onClick={handleOpenAddProduct}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent-indigo to-accent-violet hover:scale-[1.02] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-accent-indigo/15"
            >
                <FiPlus className="stroke-[3]" /> Add Product
            </button>
        </div>
    )
}

export default Toolbar
