import React, { useState, useRef, useEffect } from 'react';
import { Bell, Tag, Calendar, User, Wallet } from 'lucide-react';
import { expenseCategories } from '../data/mockData';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const InfoLine = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-1.5 text-xs text-slate-500">
    <Icon size={12} />
    <span>{value}</span>
  </div>
);

const Notifications = ({ pendingExpenses, onReviewExpense, members, cajas }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800"
      >
        <Bell className="h-6 w-6" />
        {pendingExpenses.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white">
            {pendingExpenses.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200/80 z-50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Notificaciones</h3>
            <p className="text-xs text-slate-500">{pendingExpenses.length} gastos por confirmar</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {pendingExpenses.length > 0 ? (
              <ul>
                {pendingExpenses.map(expense => {
                  const member = members.find(m => m.id === expense.memberId);
                  const caja = cajas.find(c => c.id === expense.cajaId);
                  const category = expenseCategories.find(c => c.name === expense.category);
                  const CategoryIcon = category?.icon || Tag;

                  return (
                    <li key={expense.id} className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 cursor-pointer" onClick={() => { onReviewExpense(expense); setIsOpen(false); }}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm text-slate-800">{expense.description}</h4>
                        <CategoryIcon size={16} className="text-slate-400" />
                      </div>
                      <p className="text-lg font-bold text-red-500 mb-3">{formatCurrency(expense.amount)}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <InfoLine icon={Calendar} value={`Vence el día ${expense.dayOfMonth}`} />
                        {member && <InfoLine icon={User} value={member.name} />}
                        {caja && <InfoLine icon={Wallet} value={caja.name} />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-sm text-slate-500 p-8">No tienes notificaciones pendientes.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
