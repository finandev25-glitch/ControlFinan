import React from 'react';
import { expenseCategories } from '../data/mockData';

const CategoryChips = ({ selectedCategory, onSelect }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
      <div className="flex flex-wrap gap-2">
        {expenseCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryChips;
