import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const DateRangeFilter = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onDateChange({ start: new Date(startDate), end: new Date(endDate) });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-50 rounded-lg border">
      <div className="relative w-full sm:w-auto">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>
      <span className="text-slate-500 hidden sm:block">-</span>
      <div className="relative w-full sm:w-auto">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="block w-full rounded-md border-slate-300 pl-10 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleApply}
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
      >
        Aplicar
      </button>
    </div>
  );
};

export default DateRangeFilter;
