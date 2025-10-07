import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CategorySelector = ({ label, categories, selectedCategory, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedCategoryObject = categories.find(c => c.name === selectedCategory) || { name: 'Seleccionar', icon: () => null };
  const SelectedIcon = selectedCategoryObject.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (categoryName) => {
    onSelect(categoryName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
      >
        <span className="flex items-center">
          <SelectedIcon className="h-5 w-5 text-slate-500" />
          <span className="ml-3 block truncate">{selectedCategoryObject.name}</span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-slate-200">
          <ul tabIndex="-1" role="listbox" className="max-h-56 overflow-auto rounded-md py-1 text-base focus:outline-none sm:text-sm">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <li
                  key={category.name}
                  onClick={() => handleSelect(category.name)}
                  className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-primary-50"
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-slate-500" />
                    <span className={`ml-3 block truncate ${selectedCategory === category.name ? 'font-semibold' : 'font-normal'}`}>
                      {category.name}
                    </span>
                  </div>

                  {selectedCategory === category.name ? (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
