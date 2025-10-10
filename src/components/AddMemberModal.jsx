import React, { useState } from 'react';
import { X } from 'lucide-react';

const FormInput = ({ id, label, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input 
            id={id}
            {...props}
            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
        />
    </div>
);

const FormSelect = ({ id, label, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <select
            id={id}
            {...props}
            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
        >
            {children}
        </select>
    </div>
);

const AddMemberModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Aportante');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !role) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSave({ name, role });
    onClose();
    setName('');
    setRole('Aportante');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Añadir Nuevo Miembro</h2>
        <p className="text-slate-500 mb-6">Completa los detalles del nuevo miembro de la familia.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput 
            id="name" 
            name="name" 
            label="Nombre Completo" 
            placeholder="Ej: Juan Pérez" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <FormSelect 
            id="role" 
            name="role" 
            label="Rol del Miembro" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Aportante Principal">Aportante Principal</option>
            <option value="Aportante">Aportante</option>
            <option value="Dependiente">Dependiente</option>
          </FormSelect>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 border border-transparent rounded-full hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            >
              Guardar Miembro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
