import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const years = [new Date().getFullYear(), new Date().getFullYear() - 1];
const months = Array.from({ length: 12 }, (_, i) => i);

const PeriodSelector = ({ selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  return (
    <div className="flex items-center gap-2">
       <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <select
            id="yearSelector"
            className="block w-full appearance-none rounded-md border-slate-300 pl-10 pr-8 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
        >
            {years.map(year => (
            <option key={year} value={year}>{year}</option>
            ))}
        </select>
      </div>
       <div className="relative">
        <select
            id="monthSelector"
            className="block w-full appearance-none rounded-md border-slate-300 pl-3 pr-8 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
        >
            {months.map(month => (
            <option key={month} value={month}>
                {capitalize(format(new Date(2000, month), 'MMMM', { locale: es }))}
            </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default PeriodSelector;
