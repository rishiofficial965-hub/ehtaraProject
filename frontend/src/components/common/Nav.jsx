import React from 'react'
import { FiTrendingUp, FiBox, FiUsers, FiShoppingCart } from "react-icons/fi";

const Nav = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="p-4 space-y-1.5">
      {[
        { id: "dashboard", label: "Dashboard", icon: FiTrendingUp },
        { id: "products", label: "Products Catalog", icon: FiBox },
        { id: "customers", label: "Customers", icon: FiUsers },
        { id: "orders", label: "Orders Tracking", icon: FiShoppingCart }
      ].map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group ${
              isActive
                ? "text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/15"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-accent-indigo to-accent-violet rounded-r-full" />
            )}
            <Icon
              className={`text-lg transition-transform group-hover:scale-110 ${
                isActive ? "text-accent-indigo" : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  )
}

export default Nav
