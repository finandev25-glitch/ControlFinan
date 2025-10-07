import React, { useState } from 'react';
import { PlusCircle, Tag, Wallet } from 'lucide-react';
import AddScheduledExpenseModal from '../components/AddScheduledExpenseModal';
import { expenseCategories } from '../data/mockData';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const categoryIconMap = expenseCategories.reduce((acc, cat) => {
  acc[cat.name] = cat.icon;
  return acc;
}, {});

const ScheduledExpensesPage = ({ scheduledExpenses, onAddScheduledExpense, members, cajas }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Gastos Programados</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            <PlusCircle size={18} />
            Añadir Gasto
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Día de Pago</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Caja</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {scheduledExpenses.map(expense => {
                  const member = members.find(m => m.id === expense.memberId);
                  const caja = cajas.find(c => c.id === expense.cajaId);
                  const CategoryIcon = categoryIconMap[expense.category] || Tag;
                  return (
                    <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <CategoryIcon size={16} />
                          <span>{expense.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">{expense.dayOfMonth}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {member ? (
                          <div className="flex items-center gap-2">
                            <img src={member.avatar} alt={member.name} className="h-6 w-6 rounded-full" />
                            <span>{member.name}</span>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {caja ? (
                          <div className="flex items-center gap-2">
                            <Wallet size={16} />
                            <span>{caja.name}</span>
                          </div>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {scheduledExpenses.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-slate-900">No hay gastos programados</h3>
              <p className="mt-1 text-sm text-slate-500">Añade tus gastos recurrentes para empezar a monitorearlos.</p>
            </div>
          )}
        </div>
      </div>
      <AddScheduledExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddScheduledExpense}
        members={members.filter(m => m.role !== 'Dependiente')}
        cajas={cajas}
      />
    </>
  );
};

export default ScheduledExpensesPage;
