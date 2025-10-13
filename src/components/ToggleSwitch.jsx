import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const options = [
  { value: 'Ingreso', label: 'Ingresos', color: 'bg-green-100 text-green-800', borderColor: 'border-green-300' },
  { value: 'Gasto', label: 'Gastos', color: 'bg-red-100 text-red-800', borderColor: 'border-red-300' },
  { value: 'Transferencia', label: 'Transferencia', color: 'bg-sky-100 text-sky-800', borderColor: 'border-sky-300' },
  { value: 'Interna', label: 'Retiro/Depósito', color: 'bg-orange-100 text-orange-800', borderColor: 'border-orange-300' },
];

const ToggleSwitch = ({ selectedType, onChange }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (isMobile) {
    const selectedOption = options.find(opt => opt.value === selectedType) || options[0];
    return (
      <div>
        <label htmlFor="transactionType" className="block text-sm font-medium text-slate-700 mb-1">
          Tipo de Transacción
        </label>
        <select
          id="transactionType"
          value={selectedType}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full px-3 py-3 text-base border-2 focus:outline-none focus:ring-primary-500 sm:text-sm rounded-xl transition-colors duration-200 font-semibold ${selectedOption.color} ${selectedOption.borderColor}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-gray-100 rounded-full">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full py-2.5 text-xs sm:text-sm font-medium leading-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            selectedType === option.value
              ? 'bg-primary-600 text-white shadow'
              : 'text-gray-700 hover:bg-white/50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleSwitch;
