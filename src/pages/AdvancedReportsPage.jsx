import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { members, expenseCategories } from '../data/mockData';
import MonthlyComparisonCard from '../components/MonthlyComparisonCard';
import ExpenseChart from '../components/ExpenseChart';
import DetailedExpenseTable from '../components/DetailedExpenseTable';
import ExpenseTimelineChart from '../components/ExpenseTimelineChart';
import { Users, Tag } from 'lucide-react';

const AdvancedReportsPage = ({ transactions }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [timelineCategory, setTimelineCategory] = useState(expenseCategories[0].name);

  const { currentMonthStats, previousMonthStats } = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfPrevMonth = startOfMonth(subMonths(now, 1));
    const endOfPrevMonth = endOfMonth(subMonths(now, 1));

    const calculateStats = (startDate, endDate) => {
      const filtered = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= startDate && txDate <= endDate;
      });

      const income = filtered.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
      const expenses = filtered.filter(t => t.type === 'Gasto').reduce((sum, t) => sum + t.amount, 0);
      
      const expenseDistribution = filtered
        .filter(t => t.type === 'Gasto' && t.category)
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});
      
      const distributionData = Object.entries(expenseDistribution).map(([name, value]) => ({ name, value }));

      return { income, expenses, balance: income - expenses, distributionData };
    };

    return {
      currentMonthStats: calculateStats(startOfCurrentMonth, endOfCurrentMonth),
      previousMonthStats: calculateStats(startOfPrevMonth, endOfPrevMonth),
    };
  }, [transactions]);

  const memberFilteredExpenses = useMemo(() => {
    const filtered = transactions.filter(t => {
      const memberMatch = selectedMemberId === 'all' || t.memberId === parseInt(selectedMemberId);
      return t.type === 'Gasto' && t.category && memberMatch;
    });

    const expenseDistribution = filtered.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    return Object.entries(expenseDistribution).map(([name, value]) => ({ name, value }));
  }, [transactions, selectedMemberId]);

  const categoryFilteredExpenses = useMemo(() => {
    return transactions.filter(t => {
      const categoryMatch = selectedCategoryId === 'all' || t.category === selectedCategoryId;
      return t.type === 'Gasto' && categoryMatch;
    });
  }, [transactions, selectedCategoryId]);

  const timelineChartData = useMemo(() => {
    const data = transactions
      .filter(t => t.type === 'Gasto' && t.category === timelineCategory)
      .reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {});
    
    const sortedDates = Object.keys(data).sort();
    return {
      dates: sortedDates.map(d => new Date(d).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
      amounts: sortedDates.map(d => data[d]),
    };
  }, [transactions, timelineCategory]);

  const balanceChange = currentMonthStats.balance - previousMonthStats.balance;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Análisis Avanzado</h1>
        <p className="text-slate-500 mt-1">Compara períodos y profundiza en tus gastos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <MonthlyComparisonCard title="Este Mes" stats={currentMonthStats} balanceChange={balanceChange} />
        <MonthlyComparisonCard title="Mes Pasado" stats={previousMonthStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Distribución de Gastos</h2>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <select
                id="memberFilter"
                className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="all">Global</option>
                {members.filter(m => m.role !== 'Dependiente').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <ExpenseChart data={memberFilteredExpenses} />
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Línea de Tiempo de Gastos</h2>
             <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Tag className="h-5 w-5 text-slate-400" />
              </div>
              <select
                id="timelineCategoryFilter"
                className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={timelineCategory}
                onChange={(e) => setTimelineCategory(e.target.value)}
              >
                {expenseCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <ExpenseTimelineChart data={timelineChartData} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detalle de Gastos por Categoría</h2>
            <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Tag className="h-5 w-5 text-slate-400" />
            </div>
            <select
              id="categoryFilter"
              className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              {expenseCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <DetailedExpenseTable transactions={categoryFilteredExpenses} />
      </div>
    </div>
  );
};

export default AdvancedReportsPage;
