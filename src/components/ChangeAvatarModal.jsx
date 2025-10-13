import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { faker } from '@faker-js/faker';

const ChangeAvatarModal = ({ isOpen, onClose, member, onSave }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    if (isOpen) {
      const generatedAvatars = Array.from({ length: 12 }, () => faker.image.avatar());
      setAvatars(generatedAvatars);
      setSelectedAvatar(member?.avatar || '');
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const handleSave = () => {
    onSave(member.id, selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cambiar Avatar de {member.name}</h2>
        <p className="text-slate-500 mb-6">Selecciona una nueva imagen de perfil.</p>
        
        <div className="grid grid-cols-4 gap-4">
          {avatars.map((avatarUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedAvatar(avatarUrl)}
              className={`rounded-full p-1 transition-all duration-200 ${selectedAvatar === avatarUrl ? 'ring-4 ring-primary-500' : 'hover:ring-2 hover:ring-primary-300'}`}
            >
              <img src={avatarUrl} alt={`Avatar ${index + 1}`} className="w-20 h-20 rounded-full object-cover" />
            </button>
          ))}
        </div>

        <div className="pt-8 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-full shadow-sm hover:bg-primary-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeAvatarModal;
