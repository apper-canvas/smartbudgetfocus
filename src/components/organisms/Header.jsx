import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "@/App";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Header = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg shadow-md">
              <ApperIcon name="Wallet" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SmartBudget
            </h1>
</div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200">
              <ApperIcon name="Bell" size={20} />
            </button>
<button 
              onClick={() => navigate('/profile')}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="Settings" size={20} />
            </button>
            <button
              onClick={() => {
                logout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
</div>
        </div>
      </div>
    </header>
  );
};

export default Header;