import React from 'react'
import { FiX } from "react-icons/fi";

const CustomerModal = ({ isOpen, onClose, customerForm, setCustomerForm, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="glass-panel glass-panel-glow w-full max-w-md shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <FiX className="text-xl" />
                </button>
                <h2 className="text-lg font-display font-bold text-zinc-100 mb-6">Register New Customer</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={customerForm.full_name}
                            onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })}
                            placeholder="e.g. Alice Smith"
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={customerForm.email}
                            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                            placeholder="alice@domain.com"
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            required
                            value={customerForm.phone}
                            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
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
                            Register Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CustomerModal
