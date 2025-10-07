import React, { useState, useMemo } from 'react';
import { members, expenseCategories, incomeCategories } from '../data/mockData';
import { Search, Filter } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES');

const allCategoryNames = [...new Set([...expenseCategories.map(c => c.name), ...incomeCategories.map(c => c.name)])];
const allCategories = ['Transferencia', ...allCategoryNames].sort();

const TypeBadge = ({ type }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
  const typeClasses = {
    'Ingreso': 'bg-green-100 text-green-800',
    'Gasto': 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${typeClasses[type]}`}>{type}</span>;
};

const ReportsPage = ({ transactions, cajas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterMember, setFilterMember] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterCaja, setFilterCaja] = useState('Todos');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType === 'Todos' || t.type === filterType;
      const memberMatch = filterMember === 'Todos' || t.memberId === parseInt(filterMember);
      const categoryMatch = filterCategory === 'Todos' || t.category === filterCategory;
      const cajaMatch = filterCaja === 'Todos' || t.cajaId === parseInt(filterCaja);
      return searchMatch && typeMatch && memberMatch && categoryMatch && cajaMatch;
    });
  }, [transactions, searchTerm, filterType, filterMember, filterCategory, filterCaja]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Reporte de Transacciones</h1>
        <p className="mt-1 text-slate-500">Busca, filtra y revisa todas las transacciones.</p>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-1">
            <label htmlFor="search" className="sr-only">Buscar</label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="search"
              className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              id="filterType"
              className="block w-full rounded-md border-slate-300 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Todos">Todos los Tipos</option>
              <option>Ingreso</option>
              <option>Gasto</option>
            </select>
          </div>
          <div>
            <select
              id="filterCategory"
              className="block w-full rounded-md border-slate-300 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="Todos">Todas las Categorías</option>
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <select
              id="filterMember"
              className="block w-full rounded-md border-slate-300 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
            >
              <option value="Todos">Todos los Miembros</option>
              {members.filter(m => m.role !== 'Dependiente').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
           <div>
            <select
              id="filterCaja"
              className="block w-full rounded-md border-slate-300 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={filterCaja}
              onChange={(e) => setFilterCaja(e.target.value)}
            >
              <option value="Todos">Todas las Cajas</option>
              {cajas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Miembro</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Caja</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.memberName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{cajas.find(c => c.id === t.cajaId)?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><TypeBadge type={t.type} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.category || 'N/A'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${t.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'Ingreso' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {filteredTransactions.length === 0 && (
          <div className="text-center p-12">
            <Filter className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No se encontraron transacciones</h3>
            <p className="mt-1 text-sm text-slate-500">Intenta ajustar tus filtros de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
