import React from 'react'
import { FiX, FiAlertTriangle } from "react-icons/fi";

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel glass-panel-glow border-accent-rose/30 w-full max-w-md shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <FiX className="text-xl" />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-rose/10 border border-accent-rose/25 flex items-center justify-center text-accent-rose mb-4 animate-bounce">
                        <FiAlertTriangle className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-zinc-100 mb-2">Confirm Action</h3>
                    <p className="text-sm text-zinc-400 font-medium px-4 mb-6 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 justify-center pt-4 border-t border-white/5">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-6 py-2.5 bg-gradient-to-r from-accent-rose to-red-600 hover:from-accent-rose hover:to-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-rose/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal
