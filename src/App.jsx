import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import ReportsPage from './pages/ReportsPage';
import CajasPage from './pages/CajasPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import BudgetsPage from './pages/BudgetsPage';
import ArqueoPage from './pages/ArqueoPage';
import ScheduledExpensesPage from './pages/ScheduledExpensesPage';
import ConfirmExpenseModal from './components/ConfirmExpenseModal';
import { transactions as initialTransactions, cajas as initialCajas, members, budgets as initialBudgets, scheduledExpenses as initialScheduledExpenses } from './data/mockData';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';
import { format, isWithinInterval, addDays, startOfDay } from 'date-fns';

const iconMap = {
  'Efectivo': Wallet,
  'Cuenta Bancaria': Landmark,
  'Tarjeta de Crédito': CreditCard,
  'Préstamos': University,
};

const initialCajasWithIcons = initialCajas.map(caja => ({
  ...caja,
  icon: iconMap[caja.type] || Wallet
}));

function App() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cajas, setCajas] = useState(initialCajasWithIcons);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [scheduledExpenses, setScheduledExpenses] = useState(initialScheduledExpenses);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [expenseToConfirm, setExpenseToConfirm] = useState(null);

  const handleAddTransactions = (newTransactions) => {
    const transactionsToAdd = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    setTransactions(prev => [...transactionsToAdd, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleAddCaja = (newCaja) => {
    const icon = iconMap[newCaja.type] || Wallet;
    setCajas(prev => [...prev, { ...newCaja, id: Date.now(), icon }]);
  };

  const handleSaveBudget = (newBudget) => {
    setBudgets(prev => {
      const existingIndex = prev.findIndex(b => b.category === newBudget.category);
      if (existingIndex > -1) {
        const updatedBudgets = [...prev];
        updatedBudgets[existingIndex] = newBudget;
        return updatedBudgets;
      }
      return [...prev, newBudget];
    });
  };

  const handleAddScheduledExpense = (newExpense) => {
    setScheduledExpenses(prev => [...prev, { ...newExpense, id: Date.now(), confirmedMonths: [] }]);
  };
  
  const handleOpenConfirmModal = (expense) => {
    setExpenseToConfirm(expense);
  };

  const handleCloseConfirmModal = () => {
    setExpenseToConfirm(null);
  };

  const handleConfirmExpense = (updatedTransactionData, scheduledExpenseId) => {
    const newTransaction = {
      ...updatedTransactionData,
      id: Date.now(),
      memberName: members.find(m => m.id === updatedTransactionData.memberId)?.name || 'N/A',
      type: 'Gasto',
    };
    handleAddTransactions([newTransaction]);

    const today = new Date();
    const periodKey = format(new Date(today.getFullYear(), today.getMonth()), 'yyyy-MM');

    setScheduledExpenses(prev => prev.map(exp => {
      if (exp.id === scheduledExpenseId) {
        return {
          ...exp,
          confirmedMonths: [...(exp.confirmedMonths || []), periodKey],
        };
      }
      return exp;
    }));
    handleCloseConfirmModal();
  };

  const periodProps = {
    selectedYear,
    selectedMonth,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
  };

  const pendingExpenses = useMemo(() => {
    const today = startOfDay(new Date());
    const fourDaysFromNow = addDays(today, 4);
    
    return scheduledExpenses.filter(exp => {
      const currentMonthPeriodKey = format(new Date(today.getFullYear(), today.getMonth()), 'yyyy-MM');
      
      const isConfirmedForCurrentMonth = exp.confirmedMonths?.includes(currentMonthPeriodKey);
      if (isConfirmedForCurrentMonth) {
        return false;
      }
      
      const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), exp.dayOfMonth);

      const isDueSoon = isWithinInterval(dueDateThisMonth, {
        start: today,
        end: fourDaysFromNow
      });
      
      return isDueSoon;
    });
  }, [scheduledExpenses]);

  return (
    <Router>
      <Layout 
        pendingExpenses={pendingExpenses}
        onReviewExpense={handleOpenConfirmModal}
        members={members}
        cajas={cajas}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <DashboardPage 
                transactions={transactions} 
                members={members} 
                budgets={budgets} 
                cajas={cajas} 
                {...periodProps} 
              />
            } 
          />
          <Route 
            path="/miembros" 
            element={<MembersPage transactions={transactions} onAddTransactions={handleAddTransactions} cajas={cajas} members={members} />} 
          />
          <Route 
            path="/cajas" 
            element={<CajasPage transactions={transactions} cajas={cajas} onAddCaja={handleAddCaja} members={members} />} 
          />
          <Route 
            path="/arqueo" 
            element={<ArqueoPage transactions={transactions} cajas={cajas} onAddTransactions={handleAddTransactions} members={members} />} 
          />
          <Route 
            path="/reportes" 
            element={<ReportsPage transactions={transactions} cajas={cajas} members={members} />} 
          />
           <Route 
            path="/analisis" 
            element={<AdvancedReportsPage transactions={transactions} members={members} {...periodProps} />} 
          />
          <Route 
            path="/presupuesto" 
            element={<BudgetsPage budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} {...periodProps} />} 
          />
          <Route
            path="/gastos-programados"
            element={
              <ScheduledExpensesPage
                scheduledExpenses={scheduledExpenses}
                onAddScheduledExpense={handleAddScheduledExpense}
                members={members}
                cajas={cajas}
              />
            }
          />
        </Routes>
      </Layout>
      <ConfirmExpenseModal
        isOpen={!!expenseToConfirm}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmExpense}
        expense={expenseToConfirm}
        members={members}
        cajas={cajas}
      />
    </Router>
  );
}

export default App;
