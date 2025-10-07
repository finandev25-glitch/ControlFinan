import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const PeriodStats = ({ period, stats }) => (
    <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{period}</h4>
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-green-600">
                    <ArrowUp size={14} />
                    <span>Ingresos</span>
                </div>
                <span className="font-medium">{formatCurrency(stats.totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-red-600">
                    <ArrowDown size={14} />
                    <span>Gastos</span>
                </div>
                <span className="font-medium">{formatCurrency(stats.totalExpenses)}</span>
            </div>
        </div>
    </div>
);

const MemberSummary = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-slate-500 py-10">No hay datos para mostrar.</p>;
    }

    return (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {data.map(member => (
                <div key={member.id} className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-4">
                            <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.role}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                        <PeriodStats period="Mes Seleccionado" stats={member.currentMonth} />
                        <PeriodStats period="Mes Anterior" stats={member.previousMonth} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MemberSummary;
