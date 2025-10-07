import React from 'react';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const monthOptions = [
  { label: 'Este Mes', offset: 0 },
  { label: 'Mes Pasado', offset: 1 },
  { label: 'Hace 2 Meses', offset: 2 },
  { label: 'Hace 3 Meses', offset: 3 },
];

const MonthSelector = ({ monthOffset, onMonthChange }) => {
  const now = new Date();
  
  const getMonthLabel = (offset) => {
    if (offset < 2) return monthOptions.find(o => o.offset === offset)?.label;
    const date = subMonths(now, offset);
    return capitalize(format(date, 'MMMM yyyy', { locale: es }));
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Calendar className="h-5 w-5 text-slate-400" />
      </div>
      <select
        id="monthSelector"
        className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        value={monthOffset}
        onChange={(e) => onMonthChange(parseInt(e.target.value))}
      >
        {monthOptions.map(option => (
          <option key={option.offset} value={option.offset}>
            {getMonthLabel(option.offset)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;
