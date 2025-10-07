import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import ReportsPage from './pages/ReportsPage';
import CajasPage from './pages/CajasPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import BudgetsPage from './pages/BudgetsPage';
import { transactions as initialTransactions, cajas as initialCajas, members, budgets as initialBudgets } from './data/mockData';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';

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

  const periodProps = {
    selectedYear,
    selectedMonth,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
  };

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route 
            path="/" 
            element={<DashboardPage transactions={transactions} members={members} budgets={budgets} {...periodProps} />} 
          />
          <Route 
            path="/miembros" 
            element={<MembersPage transactions={transactions} onAddTransactions={handleAddTransactions} cajas={cajas} />} 
          />
          <Route 
            path="/cajas" 
            element={<CajasPage transactions={transactions} cajas={cajas} onAddCaja={handleAddCaja} members={members} />} 
          />
          <Route 
            path="/reportes" 
            element={<ReportsPage transactions={transactions} cajas={cajas} />} 
          />
           <Route 
            path="/analisis" 
            element={<AdvancedReportsPage transactions={transactions} members={members} {...periodProps} />} 
          />
          <Route 
            path="/presupuesto" 
            element={<BudgetsPage budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} {...periodProps} />} 
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
