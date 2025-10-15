import React, { useMemo, useState } from 'react';
import ExpenseChart from '../components/ExpenseChart';
import CashFlowChart from '../components/CashFlowChart';
import PeriodSelector from '../components/PeriodSelector';
import BudgetOverview from '../components/BudgetOverview';
import RecentTransactionsList from '../components/RecentTransactionsList';
import BalanceSummaryCard from '../components/BalanceSummaryCard';
import ProjectedBalanceCard from '../components/ProjectedBalanceCard';
import ProjectedExpensesModal from '../components/ProjectedExpensesModal';
import TransferDetailModal from '../components/TransferDetailModal';
import MemberSelector from '../components/MemberSelector';
import PendingExpensesSection from '../components/PendingExpensesSection';
import { Tag } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import * as Icons from 'lucide-react';

const DashboardPage = ({ transactions, members, budgets, cajas, scheduledExpenses, categories, selectedYear, selectedMonth, onYearChange, onMonthChange, availableYears, onReviewExpense }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [isProjectedExpensesModalOpen, setProjectedExpensesModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [transferModalData, setTransferModalData] = useState({ title: '', transactions: [] });

  const categoryIconMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const IconComponent = Icons[cat.icon_name] || Tag;
      acc[cat.name] = IconComponent;
      return acc;
    }, {});
  }, [categories]);

  const {
    summary,
    cashFlowData,
    expenseChartData,
    budgetOverviewData,
    recentTransactionsData,
    projectedBalanceData,
    netTransfersDetails,
    pendingExpenses,
  } = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const dateRange = {
      from: startOfMonth(selectedDate),
      to: endOfMonth(selectedDate),
    };

    const filterTransactions = (txs, from, to, memberId) => {
      return txs.filter(t => {
        const transactionDate = new Date(t.date);
        const memberMatch = memberId === 'all' || String(t.member_id) === String(memberId);
        return transactionDate >= from && transactionDate <= to && memberMatch;
      });
    };

    const currentTransactions = filterTransactions(transactions, dateRange.from, dateRange.to, selectedMemberId);

    const calculateSummary = (txs) => {
      const income = txs.filter(t => t.type === 'Ingreso' && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'Gasto' && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna').reduce((s, t) => s + t.amount, 0);
      
      const transfersReceived = txs.filter(t => t.type === 'Ingreso' && t.category === 'Transferencia').reduce((s, t) => s + t.amount, 0);
      const transfersSent = txs.filter(t => t.type === 'Gasto' && t.category === 'Transferencia').reduce((s, t) => s + t.amount, 0);

      const netTransfers = transfersReceived - transfersSent;

      return { 
        totalIncome: income, 
        totalExpenses: expenses, 
        netTransfers: netTransfers,
        balance: income - expenses + netTransfers,
      };
    };

    const currentSummary = calculateSummary(currentTransactions);

    const expenseByCategory = currentTransactions
      .filter(t => t.type === 'Gasto' && t.category && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    const donutData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    
    const dailyData = currentTransactions.reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { income: 0, expense: 0 };
        if (t.type === 'Ingreso' && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna') acc[date].income += t.amount;
        else if (t.type === 'Gasto' && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna') acc[date].expense += t.amount;
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
        memberName: members.find(m => m.id === t.member_id)?.name || 'N/A',
        memberAvatar: members.find(m => m.id === t.member_id)?.avatar,
    }));

    const monthlyBudgets = budgets.filter(b => b.year === selectedYear && b.month === selectedMonth);

    const totalBudgetLimit = monthlyBudgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const budgetsWithSpending = monthlyBudgets.map(budget => {
      const spent = currentTransactions
        .filter(t => t.type === 'Gasto' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const Icon = categoryIconMap[budget.category] || Icons.Tag;
      return { ...budget, spent, icon: Icon };
    });
    const totalSpentOnBudgetCategories = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);
    
    const periodKey = format(selectedDate, 'yyyy-MM');
    const pendingScheduledExpenses = scheduledExpenses
      .filter(exp => {
        const isConfirmed = exp.confirmed_months?.includes(periodKey);
        const memberMatch = selectedMemberId === 'all' || String(exp.member_id) === String(selectedMemberId);
        return !isConfirmed && memberMatch;
      });

    const getCreditCardDebtForCycle = (creditCard) => {
        const closingDay = creditCard.closing_day;
        const cycleEndDate = new Date(selectedYear, selectedMonth, closingDay);
        const cycleStartDate = new Date(cycleEndDate);
        cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
        cycleStartDate.setDate(cycleStartDate.getDate() + 1);

        const cycleTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return t.caja_id === creditCard.id &&
                   t.type === 'Gasto' &&
                   txDate >= cycleStartDate &&
                   txDate <= cycleEndDate;
        });
        return cycleTransactions.reduce((s, t) => s + t.amount, 0);
    };

    const projectedExpensesWithDetails = pendingScheduledExpenses.map(exp => {
        if (exp.is_credit_card_payment) {
            const creditCard = cajas.find(c => c.id === exp.credit_card_id);
            if (creditCard) {
                const debt = getCreditCardDebtForCycle(creditCard);
                return { ...exp, amount: debt };
            }
        }
        return exp;
    });

    const projectedExpensesSum = projectedExpensesWithDetails.reduce((sum, exp) => sum + exp.amount, 0);
    const availableBalance = currentSummary.balance - projectedExpensesSum;
    
    const netTransfersDetails = currentTransactions.filter(t => t.category === 'Transferencia');

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
      netTransfersDetails,
      pendingExpenses: pendingScheduledExpenses,
    };
  }, [transactions, scheduledExpenses, selectedYear, selectedMonth, selectedMemberId, members, budgets, cajas, categories, categoryIconMap]);

  const handleOpenTransferDetails = () => {
    setTransferModalData({
      title: 'Detalle de Transferencias Netas',
      transactions: netTransfersDetails,
    });
    setTransferModalOpen(true);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-500 mt-1">Una vista completa de la salud financiera familiar.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <MemberSelector 
                members={members}
                selectedMemberId={selectedMemberId}
                onMemberChange={setSelectedMemberId}
              />
              <PeriodSelector availableYears={availableYears} selectedYear={selectedYear} selectedMonth={selectedMonth} onYearChange={onYearChange} onMonthChange={onMonthChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <BalanceSummaryCard 
              summary={summary} 
              onDetailsClick={handleOpenTransferDetails} 
            />
            <ProjectedBalanceCard 
              data={projectedBalanceData} 
              onDetailsClick={() => setProjectedExpensesModalOpen(true)}
            />
          </div>
          <div className="lg:col-span-1">
            <PendingExpensesSection
              pendingExpenses={pendingExpenses}
              onReviewExpense={onReviewExpense}
              members={members}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Flujo de Caja Mensual</h2>
            <CashFlowChart data={cashFlowData} />
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Distribución de Gastos</h2>
            <ExpenseChart data={expenseChartData} />
          </div>
          <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Transacciones Recientes</h2>
              <RecentTransactionsList transactions={recentTransactionsData} />
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Resumen de Presupuestos</h2>
              <BudgetOverview data={budgetOverviewData} />
          </div>
        </div>
      </div>
      <ProjectedExpensesModal 
        isOpen={isProjectedExpensesModalOpen}
        onClose={() => setProjectedExpensesModalOpen(false)}
        expenses={projectedBalanceData.details}
      />
      <TransferDetailModal
        isOpen={isTransferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title={transferModalData.title}
        transactions={transferModalData.transactions}
        members={members}
      />
    </>
  );
};

export default DashboardPage;
