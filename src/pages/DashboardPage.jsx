import React, { useMemo, useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import ExpenseChart from '../components/ExpenseChart';
import CashFlowChart from '../components/CashFlowChart';
import DateRangeFilter from '../components/DateRangeFilter';
import TopExpenses from '../components/TopExpenses';
import RecentTransactionsList from '../components/RecentTransactionsList';
import { ArrowUpCircle, ArrowDownCircle, Scale, Users } from 'lucide-react';
import { subDays } from 'date-fns';
import { members as allMembers } from '../data/mockData';

const DashboardPage = ({ transactions, members }) => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedMemberId, setSelectedMemberId] = useState('all');

  const {
    summary,
    previousSummary,
    cashFlowData,
    expenseChartData,
    topExpensesData,
    recentTransactionsData,
  } = useMemo(() => {
    // Helper to filter transactions by date and member
    const filterTransactions = (txs, from, to, memberId) => {
      return txs.filter(t => {
        const transactionDate = new Date(t.date);
        const memberMatch = memberId === 'all' || t.memberId === memberId;
        return transactionDate >= from && transactionDate <= to && memberMatch;
      });
    };

    // Filter for the current period
    const currentTransactions = filterTransactions(transactions, dateRange.from, dateRange.to, selectedMemberId);

    // Calculate and filter for the previous period
    const diff = dateRange.to.getTime() - dateRange.from.getTime();
    const prevFrom = new Date(dateRange.from.getTime() - diff);
    const prevTo = new Date(dateRange.from.getTime());
    const previousTransactions = filterTransactions(transactions, prevFrom, prevTo, selectedMemberId);

    // Helper to calculate summary stats
    const calculateSummary = (txs) => {
      const income = txs.filter(t => t.type === 'Ingreso').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'Gasto').reduce((s, t) => s + t.amount, 0);
      return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    };

    const currentSummary = calculateSummary(currentTransactions);
    const prevSummary = calculateSummary(previousTransactions);

    // Prepare data for Expense Donut Chart and Top Expenses
    const expenseByCategory = currentTransactions
      .filter(t => t.type === 'Gasto' && t.category)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    const donutData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    const topExpenses = Object.entries(expenseByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, percentage: (value / currentSummary.totalExpenses) * 100 }));

    // Prepare data for Cash Flow Area Chart
    const dailyData = currentTransactions.reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { income: 0, expense: 0 };
        if (t.type === 'Ingreso') acc[date].income += t.amount;
        else if (t.type === 'Gasto') acc[date].expense += t.amount;
        return acc;
    }, {});

    const sortedDates = Object.keys(dailyData).sort();
    const cashFlow = {
        dates: sortedDates.map(d => new Date(d).toLocaleDateString('es-ES', {month: 'short', day: 'numeric'})),
        incomes: sortedDates.map(d => dailyData[d].income),
        expenses: sortedDates.map(d => dailyData[d].expense),
    };
    
    // Prepare recent transactions with member avatars
    const recentWithAvatars = currentTransactions.slice(0, 5).map(t => ({
        ...t,
        memberAvatar: members.find(m => m.id === t.memberId)?.avatar,
    }));

    return {
      summary: currentSummary,
      previousSummary: prevSummary,
      cashFlowData: cashFlow,
      expenseChartData: donutData,
      topExpensesData: topExpenses,
      recentTransactionsData: recentWithAvatars,
    };
  }, [transactions, dateRange, selectedMemberId, members]);

  const getChange = (current, previous) => {
    if (previous === 0 && current > 0) return '+∞%';
    if (previous === 0 && current === 0) return '0%';
    if (previous === 0) return '0%';
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  const incomeChange = getChange(summary.totalIncome, previousSummary.totalIncome);
  const expenseChange = getChange(summary.totalExpenses, previousSummary.totalExpenses);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Avanzado</h1>
            <p className="text-slate-500 mt-1">Una vista completa de la salud financiera familiar.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Users className="h-5 w-5 text-slate-400" />
                </div>
                <select
                    id="memberFilter"
                    className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                >
                    <option value="all">Todos los Miembros</option>
                    {allMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
            <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Ingresos Totales" amount={summary.totalIncome} icon={<ArrowUpCircle />} colorClass={{bg: 'bg-green-100', text: 'text-green-600'}} change={incomeChange} changeType={summary.totalIncome >= previousSummary.totalIncome ? 'good' : 'bad'} metricType="income" />
        <SummaryCard title="Gastos Totales" amount={summary.totalExpenses} icon={<ArrowDownCircle />} colorClass={{bg: 'bg-red-100', text: 'text-red-600'}} change={expenseChange} changeType={summary.totalExpenses > previousSummary.totalExpenses ? 'bad' : 'good'} metricType="expense" />
        <SummaryCard title="Balance General" amount={summary.balance} icon={<Scale />} colorClass={{bg: 'bg-primary-100', text: 'text-primary-600'}} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Flujo de Caja</h2>
          <CashFlowChart data={cashFlowData} />
        </div>
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Distribución de Gastos</h2>
              <ExpenseChart data={expenseChartData} />
            </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Top 5 Categorías de Gastos</h2>
            <TopExpenses data={topExpensesData} totalExpenses={summary.totalExpenses} />
        </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Transacciones Recientes</h2>
            <RecentTransactionsList transactions={recentTransactionsData} />
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
