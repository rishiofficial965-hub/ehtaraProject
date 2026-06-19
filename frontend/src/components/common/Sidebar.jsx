import React from 'react'
import { FiTrendingUp } from "react-icons/fi";

const Sidebar = () => {
    return (
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="bg-gradient-to-tr from-accent-indigo to-accent-violet p-2.5 rounded-xl text-white shadow-lg shadow-accent-indigo/25">
                <FiTrendingUp className="text-xl" />
            </div>
            <div>
                <h1 className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-zinc-100 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                    INVENIO
                </h1>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
        </div>
    )
}

export default Sidebar
