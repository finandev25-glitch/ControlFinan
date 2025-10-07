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
import { transactions as initialTransactions, cajas as initialCajas, members, budgets as initialBudgets, scheduledExpenses as initialScheduledExpenses } from './data/mockData';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';
import { format } from 'date-fns';

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
  
  const handleConfirmScheduledExpense = (scheduledExpenseId) => {
    const expenseToConfirm = scheduledExpenses.find(e => e.id === scheduledExpenseId);
    if (!expenseToConfirm) return;

    const member = members.find(m => m.id === expenseToConfirm.memberId);
    
    const newTransaction = {
      id: Date.now(),
      date: new Date(selectedYear, selectedMonth, expenseToConfirm.dayOfMonth),
      description: expenseToConfirm.description,
      memberId: expenseToConfirm.memberId,
      memberName: member?.name || 'N/A',
      cajaId: expenseToConfirm.cajaId,
      type: 'Gasto',
      category: expenseToConfirm.category,
      amount: expenseToConfirm.amount,
    };
    handleAddTransactions([newTransaction]);

    const periodKey = format(new Date(selectedYear, selectedMonth), 'yyyy-MM');
    setScheduledExpenses(prev => prev.map(exp => {
      if (exp.id === scheduledExpenseId) {
        return {
          ...exp,
          confirmedMonths: [...(exp.confirmedMonths || []), periodKey],
        };
      }
      return exp;
    }));
  };

  const periodProps = {
    selectedYear,
    selectedMonth,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
  };

  const pendingExpenses = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const periodKey = format(selectedDate, 'yyyy-MM');
    return scheduledExpenses.filter(exp => {
      const isConfirmed = exp.confirmedMonths?.includes(periodKey);
      return !isConfirmed;
    });
  }, [scheduledExpenses, selectedYear, selectedMonth]);

  return (
    <Router>
      <Layout 
        pendingExpenses={pendingExpenses}
        onConfirmScheduledExpense={handleConfirmScheduledExpense}
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
    </Router>
  );
}

export default App;
