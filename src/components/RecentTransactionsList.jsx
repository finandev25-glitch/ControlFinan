import React from 'react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const RecentTransactionsList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <p className="text-center text-slate-500 py-10">No hay transacciones recientes.</p>;
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-4">
                {transactions.map((transaction, index) => (
                    <li key={transaction.id} className={`pb-4 ${index < transactions.length - 1 ? 'border-b border-slate-200' : ''} pt-4`}>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <img className="h-8 w-8 rounded-full" src={transaction.memberAvatar} alt={transaction.memberName} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{transaction.description}</p>
                                <p className="text-sm text-slate-500 truncate">{transaction.memberName}</p>
                            </div>
                            <div className={`inline-flex items-center text-base font-semibold ${transaction.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
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
