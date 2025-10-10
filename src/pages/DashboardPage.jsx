import React, { useMemo, useState } from 'react';
import ExpenseChart from '../components/ExpenseChart';
import CashFlowChart from '../components/CashFlowChart';
import PeriodSelector from '../components/PeriodSelector';
import BudgetOverview from '../components/BudgetOverview';
import RecentTransactionsList from '../components/RecentTransactionsList';
import BalanceSummaryCard from '../components/BalanceSummaryCard';
import ProjectedBalanceCard from '../components/ProjectedBalanceCard';
import ProjectedExpensesModal from '../components/ProjectedExpensesModal';
import { Users } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { members as allMembers, expenseCategories } from '../data/mockData';

const DashboardPage = ({ transactions, members, budgets, cajas, scheduledExpenses, selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [isProjectedExpensesModalOpen, setProjectedExpensesModalOpen] = useState(false);

  const {
    summary,
    cashFlowData,
    expenseChartData,
    budgetOverviewData,
    recentTransactionsData,
    projectedBalanceData,
  } = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const dateRange = {
      from: startOfMonth(selectedDate),
      to: endOfMonth(selectedDate),
    };

    const filterTransactions = (txs, from, to, memberId) => {
      return txs.filter(t => {
        const transactionDate = new Date(t.date);
        const memberMatch = memberId === 'all' || t.memberId === memberId;
        return transactionDate >= from && transactionDate <= to && memberMatch;
      });
    };

    const currentTransactions = filterTransactions(transactions, dateRange.from, dateRange.to, selectedMemberId);

    const calculateSummary = (txs) => {
      const income = txs.filter(t => t.type === 'Ingreso').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'Gasto').reduce((s, t) => s + t.amount, 0);
      return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    };

    const currentSummary = calculateSummary(currentTransactions);

    const expenseByCategory = currentTransactions
      .filter(t => t.type === 'Gasto' && t.category)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    const donutData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    
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
    
    const recentWithAvatars = currentTransactions.slice(0, 5).map(t => ({
        ...t,
        memberAvatar: members.find(m => m.id === t.memberId)?.avatar,
    }));

    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const budgetsWithSpending = budgets.map(budget => {
      const spent = currentTransactions
        .filter(t => t.type === 'Gasto' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const categoryInfo = expenseCategories.find(c => c.name === budget.category);
      return { ...budget, spent, icon: categoryInfo?.icon };
    });
    const totalSpentOnBudgetCategories = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);
    
    const periodKey = format(selectedDate, 'yyyy-MM');
    const pendingScheduledExpenses = scheduledExpenses
      .filter(exp => {
        const isConfirmed = exp.confirmedMonths?.includes(periodKey);
        const memberMatch = selectedMemberId === 'all' || exp.memberId === selectedMemberId;
        return !isConfirmed && memberMatch;
      });

    const getCreditCardDebtForCycle = (creditCard) => {
        const closingDay = creditCard.closingDay;
        const cycleEndDate = new Date(selectedYear, selectedMonth, closingDay);
        const cycleStartDate = new Date(cycleEndDate);
        cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
        cycleStartDate.setDate(cycleStartDate.getDate() + 1);

        const cycleTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return t.cajaId === creditCard.id &&
                   t.type === 'Gasto' &&
                   txDate >= cycleStartDate &&
                   txDate <= cycleEndDate;
        });
        return cycleTransactions.reduce((s, t) => s + t.amount, 0);
    };

    const projectedExpensesWithDetails = pendingScheduledExpenses.map(exp => {
        if (exp.isCreditCardPayment) {
            const creditCard = cajas.find(c => c.id === exp.creditCardId);
            if (creditCard) {
                const debt = getCreditCardDebtForCycle(creditCard);
                return { ...exp, amount: debt };
            }
        }
        return exp;
    });

    const projectedExpensesSum = projectedExpensesWithDetails.reduce((sum, exp) => sum + exp.amount, 0);
    const availableBalance = currentSummary.balance - projectedExpensesSum;
    
    return {
      summary: currentSummary,
      cashFlowData: cashFlow,
      expenseChartData: donutData,
      budgetOverviewData: {
        budgetsWithSpending,
        totalBudget: totalBudgetLimit,
        totalSpent: totalSpentOnBudgetCategories,
      },
      recentTransactionsData: recentWithAvatars,
      projectedBalanceData: {
        currentBalance: currentSummary.balance,
        projectedExpenses: projectedExpensesSum,
        availableBalance: availableBalance,
        details: projectedExpensesWithDetails,
      },
    };
  }, [transactions, scheduledExpenses, selectedYear, selectedMonth, selectedMemberId, members, budgets, cajas]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-500 mt-1">Una vista completa de la salud financiera familiar.</p>
          </div>
          <div className="flex items-center gap-4">
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
              <PeriodSelector selectedYear={selectedYear} selectedMonth={selectedMonth} onYearChange={onYearChange} onMonthChange={onMonthChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BalanceSummaryCard summary={summary} />
          <ProjectedBalanceCard 
            data={projectedBalanceData} 
            onDetailsClick={() => setProjectedExpensesModalOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Flujo de Caja</h2>
            <CashFlowChart data={cashFlowData} />
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Distribución de Gastos</h2>
            <ExpenseChart data={expenseChartData} />
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Resumen de Presupuestos</h2>
              <BudgetOverview data={budgetOverviewData} />
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Transacciones Recientes</h2>
              <RecentTransactionsList transactions={recentTransactionsData} />
          </div>
        </div>
      </div>
      <ProjectedExpensesModal 
        isOpen={isProjectedExpensesModalOpen}
        onClose={() => setProjectedExpensesModalOpen(false)}
        expenses={projectedBalanceData.details}
      />
    </>
  );
};

export default DashboardPage;
