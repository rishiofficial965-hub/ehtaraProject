import React from 'react'
import { FiUsers, FiTrash2 } from "react-icons/fi";

const CustomerTable = ({ filteredCustomers, handleCustomerDelete }) => {
    return (
        <div className="glass-panel border-white/5 rounded-2xl overflow-hidden">
            {filteredCustomers.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                    <FiUsers className="text-5xl mx-auto mb-4 opacity-30 text-accent-indigo animate-pulse" />
                    <p className="text-sm font-bold text-zinc-300">No customers found</p>
                    <p className="text-xs text-zinc-500 mt-1">Register a customer to begin processing orders.</p>
                </div>
            ) : (
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="py-4 px-6 font-display">Customer Name</th>
                                <th className="py-4 px-6 font-display">Email Address</th>
                                <th className="py-4 px-6 font-display">Phone Number</th>
                                <th className="py-4 px-6 text-center font-display">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredCustomers.map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors duration-150">
                                    <td className="py-4 px-6 font-bold text-zinc-200">{c.full_name}</td>
                                    <td className="py-4 px-6 text-zinc-300 font-mono text-xs font-semibold">{c.email}</td>
                                    <td className="py-4 px-6 text-zinc-300 font-semibold">{c.phone}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => handleCustomerDelete(c.id)}
                                                className="p-2 hover:bg-accent-rose/10 text-accent-rose rounded-xl transition-all hover:scale-110"
                                                title="Delete Customer"
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

export default CustomerTable
