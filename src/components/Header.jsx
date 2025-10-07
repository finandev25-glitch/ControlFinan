import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PiggyBank, UserCircle, LayoutDashboard, Users, BarChart3, Wallet, FileText, Menu, X, Target } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
    }`;
    
  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
    }`;

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <PiggyBank className="h-8 w-8 text-primary-600" />
            <span className="ml-3 text-xl font-bold text-slate-800">FamilyFin</span>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
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
            <NavLink to="/presupuesto" className={navLinkClass}>
              <Target size={18} />
              <span>Presupuesto</span>
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
            <button className="hidden md:block p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800">
              <UserCircle className="h-7 w-7" />
            </button>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/miembros" className={mobileNavLinkClass} onClick={closeMenu}>
              <Users size={20} />
              <span>Miembros</span>
            </NavLink>
            <NavLink to="/cajas" className={mobileNavLinkClass} onClick={closeMenu}>
              <Wallet size={20} />
              <span>Cajas</span>
            </NavLink>
             <NavLink to="/presupuesto" className={mobileNavLinkClass} onClick={closeMenu}>
              <Target size={20} />
              <span>Presupuesto</span>
            </NavLink>
            <NavLink to="/reportes" className={mobileNavLinkClass} onClick={closeMenu}>
              <BarChart3 size={20} />
              <span>Reportes</span>
            </NavLink>
            <NavLink to="/analisis" className={mobileNavLinkClass} onClick={closeMenu}>
              <FileText size={20} />
              <span>Análisis</span>
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
