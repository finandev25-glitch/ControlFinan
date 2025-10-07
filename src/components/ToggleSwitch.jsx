import React from 'react';

const options = [
  { value: 'Ingreso', label: 'Ingresos' },
  { value: 'Gasto', label: 'Gastos' },
  { value: 'Transferencia', label: 'Transferencia' },
];

const ToggleSwitch = ({ selectedType, onChange }) => {
  return (
    <div className="flex w-full p-1 bg-gray-100 rounded-full">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full py-2.5 text-sm font-medium leading-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
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
