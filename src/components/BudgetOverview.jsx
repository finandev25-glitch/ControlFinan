import React from 'react';
import { Target } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const ProgressBar = ({ progress, color }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
            className={`${color} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
    </div>
);

const BudgetOverview = ({ data }) => {
    const { budgetsWithSpending, totalBudget, totalSpent } = data;

    if (!budgetsWithSpending || budgetsWithSpending.length === 0) {
        return <p className="text-center text-slate-500 py-10">No hay presupuestos definidos.</p>;
    }

    const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const getProgressBarColor = (progress) => {
        if (progress > 85) return 'bg-red-500';
        if (progress > 50) return 'bg-amber-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-slate-600">Presupuesto General</span>
                    <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(totalSpent)} / <span className="text-slate-500">{formatCurrency(totalBudget)}</span>
                    </span>
                </div>
                <ProgressBar progress={overallProgress} color={getProgressBarColor(overallProgress)} />
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-4">
                {budgetsWithSpending.map(budget => {
                    const { category, limit_amount: limit, spent, icon: Icon = Target } = budget;
                    const progress = limit > 0 ? (spent / limit) * 100 : 0;
                    const color = getProgressBarColor(progress);
                    
                    return (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    {Icon && <Icon size={16} className="text-slate-400" />}
                                    <span>{category}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-600">
                                    {formatCurrency(spent)} / {formatCurrency(limit)}
                                </span>
                            </div>
                            <ProgressBar progress={progress} color={color} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetOverview;
