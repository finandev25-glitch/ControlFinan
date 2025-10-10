import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteMemberModal = ({ isOpen, onClose, onConfirm, memberName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
        </div>
        <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-slate-800">¿Estás seguro?</h2>
            <p className="text-slate-500 mt-2">
                Estás a punto de eliminar a <strong className="text-slate-700">{memberName}</strong>. Esta acción también eliminará todas sus cajas de efectivo asociadas y no se puede deshacer.
            </p>
        </div>
        
        <div className="mt-8 flex justify-center gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-full shadow-sm hover:bg-red-700"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMemberModal;
