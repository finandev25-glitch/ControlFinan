import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, format, startOfDay, endOfDay, subWeeks, startOfYear, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { members, expenseCategories } from '../data/mockData';
import MonthlyComparisonCard from '../components/MonthlyComparisonCard';
import ExpenseChart from '../components/ExpenseChart';
import DetailedExpenseTable from '../components/DetailedExpenseTable';
import ExpenseTimelineChart from '../components/ExpenseTimelineChart';
import MemberSummary from '../components/MemberSummary';
import IncomeBreakdownChart from '../components/IncomeBreakdownChart';
import IntervalToggle from '../components/IntervalToggle';
import TransactionDetailModal from '../components/TransactionDetailModal';
import PeriodSelector from '../components/PeriodSelector';
import { Users, Tag } from 'lucide-react';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const AdvancedReportsPage = ({ transactions, members, selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [timelineCategory, setTimelineCategory] = useState(expenseCategories[0].name);
  const [timelineInterval, setTimelineInterval] = useState('Diario');
  const [modalData, setModalData] = useState({ isOpen: false, title: '', transactions: [] });

  const { currentMonthStats, previousMonthStats } = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const startOfCurrentMonth = startOfMonth(selectedDate);
    const endOfCurrentMonth = endOfMonth(selectedDate);
    const startOfPrevMonth = startOfMonth(subMonths(selectedDate, 1));
    const endOfPrevMonth = endOfMonth(subMonths(selectedDate, 1));

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
  }, [transactions, selectedYear, selectedMonth]);

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
    const baseTransactions = transactions.filter(t => t.type === 'Gasto' && t.category === timelineCategory);
    const now = new Date();
    let data;
    let result = { labels: [], amounts: [], dateRanges: [] };

    if (timelineInterval === 'Diario') {
      const startOfCurrentYear = startOfYear(now);
      const endOfToday = endOfDay(now);
      
      const yearlyTransactions = baseTransactions.filter(t => {
          const txDate = new Date(t.date);
          return txDate >= startOfCurrentYear && txDate <= endOfToday;
      });

      data = yearlyTransactions.reduce((acc, t) => {
        const date = startOfDay(new Date(t.date)).toISOString();
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {});
      const dateMap = new Map(Object.entries(data));
      
      const allDates = eachDayOfInterval({ start: startOfCurrentYear, end: endOfToday });
      
      result.labels = allDates.map(d => format(d, 'dd MMM', { locale: es }));
      result.amounts = allDates.map(d => dateMap.get(startOfDay(d).toISOString()) || 0);
      result.dateRanges = allDates.map(d => ({ start: startOfDay(d), end: endOfDay(d) }));
      return result;
    }

    if (timelineInterval === 'Semanal') {
      const sixWeeksAgo = startOfWeek(subWeeks(now, 5), { weekStartsOn: 1 });
      const weeklyTransactions = baseTransactions.filter(t => new Date(t.date) >= sixWeeksAgo);
      data = weeklyTransactions.reduce((acc, t) => {
        const weekStart = startOfWeek(new Date(t.date), { weekStartsOn: 1 }).toISOString();
        acc[weekStart] = (acc[weekStart] || 0) + t.amount;
        return acc;
      }, {});
      const dateMap = new Map(Object.entries(data));
      const allWeeks = Array.from({ length: 6 }).map((_, i) => startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }).toISOString()).reverse();

      result.labels = allWeeks.map(w => format(endOfWeek(new Date(w), { weekStartsOn: 1 }), 'dd MMM', { locale: es }));
      result.amounts = allWeeks.map(w => dateMap.get(w) || 0);
      result.dateRanges = allWeeks.map(w => ({ start: new Date(w), end: endOfWeek(new Date(w), { weekStartsOn: 1 }) }));
      return result;
    }

    if (timelineInterval === 'Mensual') {
      const startOfCurrentYear = startOfYear(now);
      const monthlyTransactions = baseTransactions.filter(t => new Date(t.date) >= startOfCurrentYear);
      data = monthlyTransactions.reduce((acc, t) => {
        const monthStart = startOfMonth(new Date(t.date)).toISOString();
        acc[monthStart] = (acc[monthStart] || 0) + t.amount;
        return acc;
      }, {});
      const dateMap = new Map(Object.entries(data));
      const currentMonthIndex = now.getMonth();
      const allMonths = Array.from({ length: currentMonthIndex + 1 }).map((_, i) => startOfMonth(new Date(now.getFullYear(), i)).toISOString());

      result.labels = allMonths.map(m => capitalize(format(new Date(m), 'MMM yyyy', { locale: es })));
      result.amounts = allMonths.map(m => dateMap.get(m) || 0);
      result.dateRanges = allMonths.map(m => ({ start: new Date(m), end: endOfMonth(new Date(m)) }));
      return result;
    }

    return result;
  }, [transactions, timelineCategory, timelineInterval]);

  const memberFinancialSummaryData = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth);
    const prevDate = subMonths(selectedDate, 1);

    const currentPeriodStart = startOfMonth(selectedDate);
    const currentPeriodEnd = endOfMonth(selectedDate);
    const prevPeriodStart = startOfMonth(prevDate);
    const prevPeriodEnd = endOfMonth(prevDate);

    const calculateStatsForPeriod = (memberId, start, end) => {
        const memberTransactions = transactions.filter(t => 
            t.memberId === memberId && 
            new Date(t.date) >= start && 
            new Date(t.date) <= end
        );
        const income = memberTransactions.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0);
        const expenses = memberTransactions.filter(t => t.type === 'Gasto').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses };
    };

    return members
      .filter(m => m.role !== 'Dependiente')
      .map(member => ({
          ...member,
          currentMonth: calculateStatsForPeriod(member.id, currentPeriodStart, currentPeriodEnd),
          previousMonth: calculateStatsForPeriod(member.id, prevPeriodStart, prevPeriodEnd),
      }));
  }, [transactions, members, selectedYear, selectedMonth]);

  const incomeBreakdownData = useMemo(() => {
      const incomeByCategory = transactions
          .filter(t => t.type === 'Ingreso' && t.category !== 'Transferencia')
          .reduce((acc, t) => {
              acc[t.category] = (acc[t.category] || 0) + t.amount;
              return acc;
          }, {});
      
      return Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
  }, [transactions]);


  const balanceChange = currentMonthStats.balance - previousMonthStats.balance;

  const handleBarClick = (params) => {
    const { dataIndex } = params;
    const { start, end } = timelineChartData.dateRanges[dataIndex];
    const clickedLabel = timelineChartData.labels[dataIndex];
    
    let title = `Gastos de ${timelineCategory} para ${clickedLabel}`;
    if (timelineInterval === 'Semanal') {
        title = `Gastos de ${timelineCategory} para la semana que termina el ${clickedLabel}`;
    }

    const detailedTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'Gasto' &&
               t.category === timelineCategory &&
               txDate >= start &&
               txDate <= end;
    });

    setModalData({
        isOpen: true,
        title: title,
        transactions: detailedTransactions.sort((a,b) => new Date(b.date) - new Date(a.date)),
    });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, title: '', transactions: [] });
  };

  const onChartEvents = {
    'click': (params) => {
        if (params.componentType === 'series' && params.seriesType === 'bar') {
            handleBarClick(params);
        }
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Análisis Avanzado</h1>
            <p className="text-slate-500 mt-1">Compara períodos y profundiza en tus finanzas.</p>
          </div>
          <PeriodSelector selectedYear={selectedYear} selectedMonth={selectedMonth} onYearChange={onYearChange} onMonthChange={onMonthChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <MonthlyComparisonCard title="Este Mes" stats={currentMonthStats} balanceChange={balanceChange} />
          <MonthlyComparisonCard title="Mes Pasado" stats={previousMonthStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Resumen por Miembro</h2>
              <MemberSummary data={memberFinancialSummaryData} />
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Desglose de Ingresos</h2>
              <IncomeBreakdownChart data={incomeBreakdownData} />
          </div>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold">Línea de Tiempo de Gastos</h2>
              <div className="flex items-center gap-4">
                  <IntervalToggle selectedInterval={timelineInterval} onChange={setTimelineInterval} />
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
            </div>
            <ExpenseTimelineChart data={timelineChartData} onEvents={onChartEvents} interval={timelineInterval} />
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
      <TransactionDetailModal 
        isOpen={modalData.isOpen}
        onClose={handleCloseModal}
        title={modalData.title}
        transactions={modalData.transactions}
      />
    </>
  );
};

export default AdvancedReportsPage;
