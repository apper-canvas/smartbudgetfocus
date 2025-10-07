import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

const navItems = [
    { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/transactions", label: "Transactions", icon: "ArrowLeftRight" },
    { path: "/budget", label: "Budget", icon: "PiggyBank" },
    { path: "/bank-accounts", label: "Bank Accounts", icon: "Wallet" },
    { path: "/goals", label: "Goals", icon: "Target" },
    { path: "/categories", label: "Categories", icon: "Layers" },
    { path: "/reports", label: "Reports", icon: "FileText" }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-slate-600 hover:bg-slate-100 transition-colors duration-200"
      >
        <ApperIcon name={isOpen ? "X" : "Menu"} size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 z-40",
          "lg:translate-x-0 lg:w-64",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                )
              }
            >
              <ApperIcon name={item.icon} size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;