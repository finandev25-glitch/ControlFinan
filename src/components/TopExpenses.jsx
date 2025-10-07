import React from 'react';
import { expenseCategories } from '../data/mockData';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const categoryIconMap = expenseCategories.reduce((acc, cat) => {
    acc[cat.name] = cat.icon;
    return acc;
}, {});

const TopExpenses = ({ data, totalExpenses }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-slate-500 py-10">No hay gastos para mostrar.</p>;
    }

    return (
        <div className="space-y-4">
            {data.map(item => {
                const Icon = categoryIconMap[item.name];
                return (
                    <div key={item.name}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <div className="flex items-center gap-2 font-medium text-slate-700">
                                {Icon && <Icon size={16} className="text-slate-400" />}
                                <span>{item.name}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                                className="bg-primary-500 h-2 rounded-full" 
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TopExpenses;
