import React from 'react';
import { Tag, Calendar, Edit, Trash2, ArrowLeftRight, Wallet } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

const typeDetails = {
  'Ingreso': { textColor: 'text-green-600', sign: '+' },
  'Gasto': { textColor: 'text-red-600', sign: '-' }
};

const TransactionCard = ({ transaction, cajas, categoryIconMap, onEdit, onDelete, members, showMemberAvatar }) => {
    const isTransfer = transaction.category === 'Transferencia' || transaction.category === 'Transferencia Interna';
    
    const details = isTransfer 
        ? (transaction.type === 'Ingreso' ? { textColor: 'text-sky-600', sign: '+' } : { textColor: 'text-orange-600', sign: '-' })
        : typeDetails[transaction.type];

    if (!details) return null;

    const CategoryIcon = isTransfer ? ArrowLeftRight : (categoryIconMap[transaction.category] || Tag);
    const caja = cajas.find(c => c.id === transaction.caja_id);
    const CajaIcon = caja?.icon || Wallet;
    const member = members.find(m => m.id === transaction.member_id);
    
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300 group">
            <div className="flex gap-4 items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 flex-shrink-0">
                    <CategoryIcon className="h-6 w-6 text-slate-500" />
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-4">
                    <div className="md:col-span-2">
                        <p className="font-bold text-slate-800 text-md truncate" title={transaction.description}>{transaction.description}</p>
                        <div className="flex items-center gap-x-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                {formatDate(transaction.date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CajaIcon size={12} />
                                {caja?.name || 'N/A'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end mt-2 md:mt-0">
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <p className={`font-bold text-lg ${details.textColor}`}>
                                    {details.sign}{formatCurrency(transaction.amount)}
                                </p>
                                {showMemberAvatar && member && (
                                    <p className="text-xs text-slate-500">{member.name}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;
