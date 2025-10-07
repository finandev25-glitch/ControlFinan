import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PiggyBank, LayoutDashboard, Users, Wallet, Target, BarChart3, FileText, X, ClipboardCheck } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;
  const sidebar = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-700 text-white shadow-lg'
        : 'text-slate-200 hover:bg-primary-800 hover:text-white'
    }`;

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-primary-900 text-white p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <PiggyBank className="h-10 w-10 text-white" />
          <span className="text-2xl font-bold">FamilyFin</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/" className={navLinkClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/miembros" className={navLinkClass}>
            <Users size={20} />
            <span>Miembros</span>
          </NavLink>
          <NavLink to="/cajas" className={navLinkClass}>
            <Wallet size={20} />
            <span>Cajas</span>
          </NavLink>
          <NavLink to="/arqueo" className={navLinkClass}>
            <ClipboardCheck size={20} />
            <span>Arqueo de Caja</span>
          </NavLink>
          <NavLink to="/presupuesto" className={navLinkClass}>
            <Target size={20} />
            <span>Presupuesto</span>
          </NavLink>
          <NavLink to="/reportes" className={navLinkClass}>
            <BarChart3 size={20} />
            <span>Reportes</span>
          </NavLink>
          <NavLink to="/analisis" className={navLinkClass}>
            <FileText size={20} />
            <span>Análisis</span>
          </NavLink>
        </nav>
      </aside>

      {/* Sidebar for Mobile */}
      <div
        className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 md:hidden md:z-auto transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full md:hidden transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : ''
        } bg-primary-900 text-white p-4 flex flex-col`}
      >
        <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-5 text-slate-300 hover:text-white"
        >
            <X size={24} />
        </button>
        <div className="flex items-center gap-3 mb-8 px-2">
          <PiggyBank className="h-10 w-10 text-white" />
          <span className="text-2xl font-bold">FamilyFin</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLink to="/" className={navLinkClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/miembros" className={navLinkClass}>
            <Users size={20} />
            <span>Miembros</span>
          </NavLink>
          <NavLink to="/cajas" className={navLinkClass}>
            <Wallet size={20} />
            <span>Cajas</span>
          </NavLink>
          <NavLink to="/arqueo" className={navLinkClass}>
            <ClipboardCheck size={20} />
            <span>Arqueo de Caja</span>
          </NavLink>
          <NavLink to="/presupuesto" className={navLinkClass}>
            <Target size={20} />
            <span>Presupuesto</span>
          </NavLink>
          <NavLink to="/reportes" className={navLinkClass}>
            <BarChart3 size={20} />
            <span>Reportes</span>
          </NavLink>
          <NavLink to="/analisis" className={navLinkClass}>
            <FileText size={20} />
            <span>Análisis</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
