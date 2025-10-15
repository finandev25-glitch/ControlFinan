import React, { useState } from 'react';
import { Plus, Trash2, LoaderCircle, AlertTriangle, Users, Home } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const SetupPage = ({ setupFamilyAndInviteMembers }) => {
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState([{ id: 1, email: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    setMembers([...members, { id: Date.now(), email: '' }]);
  };

  const handleRemoveMember = (id) => {
    if (members.length > 1) {
      setMembers(members.filter(member => member.id !== id));
    } else {
      setMembers([{ id: 1, email: '' }]);
    }
  };

  const handleMemberEmailChange = (id, email) => {
    setMembers(members.map(member => member.id === id ? { ...member, email } : member));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) {
      setError('El nombre de la familia es obligatorio.');
      return;
    }
    setLoading(true);
    setError('');

    const memberEmails = members
      .map(m => m.email.trim())
      .filter(email => email !== '');
      
    const result = await setupFamilyAndInviteMembers(familyName, memberEmails);
    
    if (result?.error) {
        setError(result.error.message);
        setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Configura tu Espacio Familiar"
      subtitle="Dale un nombre a tu grupo familiar e invita a los miembros para empezar a gestionar sus finanzas."
    >
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Home size={16} className="text-gray-500" />
            Nombre de la Familia
          </label>
          <div className="mt-1">
            <input
              id="familyName"
              name="familyName"
              type="text"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ej: Familia Pérez"
              className="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            Invitar Miembros (Opcional)
          </label>
          <p className="text-xs text-gray-500 mt-1 mb-4">Pide a tus familiares que se registren con estos correos para unirse automáticamente.</p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {members.map((member, index) => (
              <div key={member.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                <input
                  type="email"
                  placeholder={`correo.miembro.${index + 1}@ejemplo.com`}
                  value={member.email}
                  onChange={(e) => handleMemberEmailChange(member.id, e.target.value)}
                  className="block w-full appearance-none rounded-md border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddMember}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            <Plus size={16} />
            Añadir otro miembro
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-full border border-transparent bg-primary-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="animate-spin" /> : 'Crear Familia y Continuar'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SetupPage;
