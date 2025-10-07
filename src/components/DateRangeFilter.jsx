import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { subDays } from 'date-fns';

const presets = [
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
];

const DateRangeFilter = ({ dateRange, setDateRange }) => {
  const [activePreset, setActivePreset] = useState(30);

  const handlePresetClick = (days) => {
    setActivePreset(days);
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200/80 shadow-sm">
      {presets.map(preset => (
        <button
          key={preset.days}
          onClick={() => handlePresetClick(preset.days)}
          className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
            activePreset === preset.days
              ? 'bg-primary-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

export default DateRangeFilter;
