import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 h-16">
           <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-600"
          >
            <span className="sr-only">Abrir menú</span>
            <Menu className="h-6 w-6" />
          </button>
           <div className="flex items-center">
             {/* You can add user profile or other icons here for mobile header */}
           </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
