import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PiggyBank, LayoutDashboard, ArrowLeftRight, Wallet, Target, BarChart3, FileText, X, ClipboardCheck, CalendarClock, Settings, LogOut, Users, Home } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, onLogout, family }) => {
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

  const navLinks = [
    { to: "/", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/transacciones", icon: ArrowLeftRight, text: "Transacciones" },
    { to: "/cajas", icon: Wallet, text: "Cajas" },
    { to: "/arqueo", icon: ClipboardCheck, text: "Arqueo de Caja" },
    { to: "/gastos-programados", icon: CalendarClock, text: "Gastos Programados" },
    { to: "/presupuesto", icon: Target, text: "Presupuesto" },
    { to: "/reportes", icon: BarChart3, text: "Reportes" },
    { to: "/analisis", icon: FileText, text: "Análisis" },
    { to: "/miembros", icon: Users, text: "Miembros" },
    { to: "/familia", icon: Home, text: "Familia" },
    { to: "/configuracion", icon: Settings, text: "Configuración" },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-primary-900 text-white p-4">
        <div className="flex flex-col mb-8 px-2">
           <div className="flex items-center gap-3 mb-2">
            <PiggyBank className="h-10 w-10 text-white" />
            <span className="text-2xl font-bold">MiSaldo</span>
          </div>
          {family && <p className="text-sm text-primary-300 truncate" title={family.name}>{family.name}</p>}
        </div>
        <nav className="flex-1 space-y-2">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              <link.icon size={20} />
              <span>{link.text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 mt-4 border-t border-primary-800">
            <button onClick={onLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-primary-800 hover:text-white">
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      {/* Sidebar for Mobile/Tablet */}
      <div
        className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full lg:hidden transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : ''
        } bg-primary-900 text-white p-4 flex flex-col`}
      >
        <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-5 text-slate-300 hover:text-white"
        >
            <X size={24} />
        </button>
        <div className="flex flex-col mb-8 px-2">
           <div className="flex items-center gap-3 mb-2">
            <PiggyBank className="h-10 w-10 text-white" />
            <span className="text-2xl font-bold">MiSaldo</span>
          </div>
          {family && <p className="text-sm text-primary-300 truncate" title={family.name}>{family.name}</p>}
        </div>
        <nav className="flex-1 space-y-2">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              <link.icon size={20} />
              <span>{link.text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 mt-4 border-t border-primary-800">
            <button onClick={onLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-primary-800 hover:text-white">
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
