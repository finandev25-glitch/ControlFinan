import React from 'react';
import { Wallet, Landmark, CreditCard, University } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const CajaBalancesCard = ({ cajas, members }) => {

  const groupedCajas = React.useMemo(() => {
    const groups = {};
    members.forEach(member => {
      groups[member.id] = {
        member,
        cajas: [],
        totalBalance: 0,
      };
    });

    groups['null'] = {
      member: { name: 'Cajas Generales', avatar: null },
      cajas: [],
      totalBalance: 0,
    };

    cajas.forEach(caja => {
      const groupId = caja.member_id || 'null';
      if (groups[groupId]) {
        groups[groupId].cajas.push(caja);
        if (caja.type !== 'Tarjeta de Crédito' && caja.type !== 'Préstamos') {
            groups[groupId].totalBalance += caja.balance;
        }
      }
    });

    return Object.values(groups).filter(g => g.cajas.length > 0);
  }, [cajas, members]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Saldos por Caja</h2>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {groupedCajas.map(group => (
          <div key={group.member.id || 'general'}>
            <div className="flex items-center gap-3 mb-2">
              {group.member.avatar && <img src={group.member.avatar} alt={group.member.name} className="h-8 w-8 rounded-full" />}
              <h3 className="font-semibold text-slate-700">{group.member.name}</h3>
            </div>
            <ul className="space-y-2 pl-4 border-l-2 border-slate-200 ml-4">
              {group.cajas.map(caja => {
                const Icon = caja.icon || Wallet;
                const isDebt = caja.type === 'Tarjeta de Crédito' || caja.type === 'Préstamos';
                
                return (
                  <li key={caja.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{caja.name}</span>
                    </div>
                    <span className={`font-medium ${isDebt ? 'text-red-500' : 'text-slate-800'}`}>{formatCurrency(caja.balance)}</span>
                  </li>
                );
              })}
               <li className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 mt-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-slate-500" />
                      <span className="font-bold text-slate-700">Total Disponible</span>
                    </div>
                    <span className="font-bold text-slate-800">{formatCurrency(group.totalBalance)}</span>
                </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CajaBalancesCard;
