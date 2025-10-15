import React from 'react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const RecentTransactionsList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">No hay transacciones recientes.</div>;
    }

    return (
        <div className="flow-root h-full">
            <ul role="list" className="divide-y divide-slate-200/80">
                {transactions.map((transaction) => (
                    <li key={transaction.id} className="py-3">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <img className="h-10 w-10 rounded-full" src={transaction.memberAvatar} alt={transaction.memberName} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{transaction.description}</p>
                                <p className="text-sm text-slate-500 truncate">{transaction.memberName}</p>
                            </div>
                            <div className={`inline-flex items-center text-sm font-semibold ${transaction.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'Ingreso' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentTransactionsList;
