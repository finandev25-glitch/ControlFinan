import React from 'react';
import { PiggyBank, UserCircle, Menu } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            <button
              className="text-slate-500 hover:text-slate-600 lg:hidden"
              aria-controls="sidebar"
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center">
            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800">
              <UserCircle className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
