import React from 'react'
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";

const Toast = ({ toast, setToasts }) => {
    return (
        <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${toast.type === "error"
                    ? "bg-accent-rose/10 border-accent-rose/20 text-accent-rose shadow-accent-rose/5"
                    : "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald shadow-accent-emerald/5"
                }`}
        >
            {toast.type === "error" ? (
                <FiAlertTriangle className="text-accent-rose animate-bounce" />
            ) : (
                <FiCheck className="text-accent-emerald" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
            <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-2 hover:opacity-75 transition-opacity"
            >
                <FiX />
            </button>
        </div>
    )
}

export default Toast
