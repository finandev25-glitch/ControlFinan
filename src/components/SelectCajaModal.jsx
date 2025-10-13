import React, { useMemo } from 'react';
import { X, Wallet } from 'lucide-react';

const SelectCajaModal = ({ isOpen, onClose, cajas, members, onSelect, title, excludeMemberId }) => {
  if (!isOpen) return null;

  const groupedCajas = useMemo(() => {
    const groups = {};

    const filteredMembers = excludeMemberId
      ? members.filter(member => String(member.id) !== String(excludeMemberId))
      : members;

    filteredMembers.forEach(member => {
      groups[member.id] = {
        member,
        cajas: [],
      };
    });

    groups['null'] = {
      member: { name: 'Cajas Generales', id: 'general' },
      cajas: [],
    };

    cajas.forEach(caja => {
      const groupId = caja.member_id || 'null';
      if (groups[groupId]) {
        groups[groupId].cajas.push(caja);
      }
    });

    return Object.values(groups).filter(g => g.cajas.length > 0);
  }, [cajas, members, excludeMemberId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-500 mb-6">Selecciona una de las cajas disponibles.</p>
        
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
          {groupedCajas.map(group => (
            <div key={group.member.id}>
              <h4 className="font-semibold text-primary-800 bg-primary-100 p-2 rounded-lg mb-2 flex items-center gap-3">
                {group.member.avatar && <img src={group.member.avatar} className="h-6 w-6 rounded-full" />}
                {group.member.name}
              </h4>
              <div className="space-y-2">
                {group.cajas.map(caja => {
                  const Icon = caja.icon || Wallet;
                  return (
                    <button
                      key={caja.id}
                      onClick={() => onSelect(caja)}
                      className="w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors hover:bg-primary-50"
                    >
                      <div className="p-2 bg-slate-100 rounded-full">
                        <Icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{caja.name}</p>
                        <p className="text-xs text-slate-500">{caja.type}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectCajaModal;
