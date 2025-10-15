import React, { useState, useMemo } from 'react';
import { PlusCircle, Trash2, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';
import AddCategoryModal from '../components/AddCategoryModal';

const CategoryList = ({ title, categories, onDelete, categoryIconMap }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {categories.map(category => {
        const Icon = categoryIconMap[category.name] || Icons.Tag;
        return (
          <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{category.name}</span>
            </div>
            <button
              onClick={() => onDelete(category.id)}
              className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
              title={`Eliminar ${category.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

const SettingsPage = ({ 
  categories, 
  onAddCategory, 
  onDeleteCategory, 
}) => {
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const incomeCategories = categories.filter(c => c.type === 'Ingreso');
  const expenseCategories = categories.filter(c => c.type === 'Gasto');

  const categoryIconMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const IconComponent = Icons[cat.icon_name] || Icons.Tag;
      acc[cat.name] = IconComponent;
      return acc;
    }, {});
  }, [categories]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
          <p className="mt-1 text-slate-500">Personaliza las categorías de la aplicación.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3"><Tag /> Gestión de Categorías</h2>
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
            >
              <PlusCircle size={18} />
              Añadir Categoría
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryList title="Categorías de Ingresos" categories={incomeCategories} onDelete={onDeleteCategory} categoryIconMap={categoryIconMap} />
            <CategoryList title="Categorías de Gastos" categories={expenseCategories} onDelete={onDeleteCategory} categoryIconMap={categoryIconMap} />
          </div>
        </div>
      </div>

      <AddCategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={onAddCategory} />
    </>
  );
};

export default SettingsPage;
