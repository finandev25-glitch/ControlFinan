import React from 'react';

const options = ['Diario', 'Semanal', 'Mensual'];

const IntervalToggle = ({ selectedInterval, onChange }) => {
  return (
    <div className="flex p-1 bg-slate-100 rounded-full text-sm">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            selectedInterval === option
              ? 'bg-white text-primary-600 shadow font-semibold'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default IntervalToggle;
