import React from 'react';
import { Tag, Calendar, Edit, Trash2, ArrowLeftRight, Wallet } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

const typeDetails = {
  'Ingreso': { textColor: 'text-green-600', sign: '+' },
  'Gasto': { textColor: 'text-red-600', sign: '-' }
};

const typeBadgeClasses = {
  'Ingreso': 'bg-green-100 text-green-800',
  'Gasto': 'bg-red-100 text-red-800',
};

const TransactionCard = ({ transaction, cajas, categoryIconMap, onEdit, onDelete }) => {
    const isTransfer = transaction.category === 'Transferencia' || transaction.category === 'Transferencia Interna';
    
    const details = isTransfer 
        ? (transaction.type === 'Ingreso' ? { textColor: 'text-sky-600', sign: '+' } : { textColor: 'text-orange-600', sign: '-' })
        : typeDetails[transaction.type];

    if (!details) return null;

    const CategoryIcon = isTransfer ? ArrowLeftRight : (categoryIconMap[transaction.category] || Tag);
    const caja = cajas.find(c => c.id === transaction.caja_id);
    const CajaIcon = caja?.icon || Wallet;
    const badgeColor = typeBadgeClasses[transaction.type];
    
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300">
            <div className="flex gap-4">
                <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 flex-shrink-0">
                    <CajaIcon className="h-6 w-6 text-slate-500" />
                </div>
                
                <div className="flex-grow min-w-0">
                    {/* MOBILE VIEW - CORRECTED */}
                    <div className="sm:hidden flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 flex-wrap">
                                <CategoryIcon size={16} className="text-slate-500" />
                                <span className="text-sm font-medium text-slate-600">{transaction.category}</span>
                                {!isTransfer && badgeColor && (
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badgeColor}`}>
                                        {transaction.type}
                                    </span>
                                )}
                            </div>
                            <p className={`font-bold text-lg ${details.textColor} flex-shrink-0 ml-2`}>
                                {details.sign}{formatCurrency(transaction.amount)}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 text-base break-words">{transaction.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <CajaIcon size={14} />
                                    <span>{caja?.name || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Calendar size={12} />
                                <span>{formatDate(transaction.date)}</span>
                            </div>
                            <div className="flex items-center">
                                {!isTransfer && (
                                    <button onClick={() => onEdit(transaction)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-100 rounded-full transition-colors" title="Editar">
                                        <Edit size={16} />
                                    </button>
                                )}
                                <button onClick={() => onDelete(transaction)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Eliminar">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP VIEW */}
                    <div className="hidden sm:flex justify-between items-center h-full">
                        <div className="flex flex-col justify-center">
                            <p className="font-bold text-slate-800 text-md">{transaction.description}</p>
                            <div className="flex items-center gap-x-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {formatDate(transaction.date)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CategoryIcon size={12} />
                                    {transaction.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className={`font-bold text-lg ${details.textColor}`}>
                                    {details.sign}{formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-xs text-slate-500">{caja?.name || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                {!isTransfer && (
                                    <button onClick={() => onEdit(transaction)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-100 rounded-full transition-colors" title="Editar">
                                        <Edit size={14} />
                                    </button>
                                )}
                                <button onClick={() => onDelete(transaction)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Eliminar">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;
