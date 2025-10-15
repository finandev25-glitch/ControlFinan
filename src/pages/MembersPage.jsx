import React, { useState, useMemo } from 'react';
import { PlusCircle, Trash2, Edit, Mail } from 'lucide-react';
import ChangeAvatarModal from '../components/ChangeAvatarModal';
import AddMemberModal from '../components/AddMemberModal';
import DeleteMemberModal from '../components/DeleteMemberModal';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const MembersPage = ({
  members,
  transactions,
  inviteMember,
  onDeleteMember,
  onUpdateMemberAvatar,
}) => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const memberSummary = useMemo(() => {
    return members.map(member => {
      const memberTransactions = transactions.filter(t => t.member_id === member.id);
      const income = memberTransactions.filter(t => t.type === 'Ingreso' && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna').reduce((s, t) => s + t.amount, 0);
      const expenses = memberTransactions.filter(t => t.type === 'Gasto' && t.category !== 'Transferencia' && t.category !== 'Transferencia Interna').reduce((s, t) => s + t.amount, 0);
      const contribution = income - expenses;
      return { ...member, income, expenses, contribution };
    });
  }, [transactions, members]);

  const handleOpenAvatarModal = (member) => {
    setSelectedMember(member);
    setAvatarModalOpen(true);
  };

  const handleInviteMember = async (data) => {
    const { error } = await inviteMember(data);
    if (error) {
      alert(`Error al enviar la invitación: ${error.message}`);
    } else {
      alert('¡Invitación enviada con éxito!');
    }
    setIsAddMemberModalOpen(false);
  };

  const handleOpenDeleteModal = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestión de Miembros</h1>
            <p className="mt-1 text-slate-500">Invita, edita y visualiza los miembros de tu familia.</p>
          </div>
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
          >
            <Mail size={18} />
            Invitar Miembro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {memberSummary.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img src={member.avatar} alt={member.name} className="h-16 w-16 rounded-full" />
                    <button
                      onClick={() => handleOpenAvatarModal(member)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Edit size={20} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">{member.name}</h2>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenDeleteModal(member)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
                  title={`Eliminar a ${member.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Ingresos</span>
                    <span className="font-medium text-green-600">{formatCurrency(member.income)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Gastos</span>
                    <span className="font-medium text-red-600">{formatCurrency(member.expenses)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-slate-600">Contribución Neta</span>
                  <span className={`font-bold text-2xl ${member.contribution >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                    {formatCurrency(member.contribution)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddMemberModal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} onInvite={handleInviteMember} />
      <ChangeAvatarModal isOpen={isAvatarModalOpen} onClose={() => setAvatarModalOpen(false)} member={selectedMember} onSave={onUpdateMemberAvatar} />
      <DeleteMemberModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} memberName={memberToDelete?.name} />
    </>
  );
};

export default MembersPage;
