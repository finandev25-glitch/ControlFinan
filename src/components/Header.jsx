import React from 'react';
import { NavLink } from 'react-router-dom';
import { PiggyBank, UserCircle, LayoutDashboard, Users, BarChart3, Wallet, FileText } from 'lucide-react';

const Header = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
    }`;

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <PiggyBank className="h-8 w-8 text-primary-600" />
            <span className="ml-3 text-xl font-bold text-slate-800">FamilyFin</span>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={navLinkClass}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/miembros" className={navLinkClass}>
              <Users size={18} />
              <span>Miembros</span>
            </NavLink>
            <NavLink to="/cajas" className={navLinkClass}>
              <Wallet size={18} />
              <span>Cajas</span>
            </NavLink>
            <NavLink to="/reportes" className={navLinkClass}>
              <BarChart3 size={18} />
              <span>Reportes</span>
            </NavLink>
            <NavLink to="/analisis" className={navLinkClass}>
              <FileText size={18} />
              <span>Análisis</span>
            </NavLink>
          </nav>
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
