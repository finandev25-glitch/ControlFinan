import React, { useState, useMemo } from 'react';
import { PlusCircle, Trash2, Edit, Users, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';
import AddCategoryModal from '../components/AddCategoryModal';
import ChangeAvatarModal from '../components/ChangeAvatarModal';
import AddMemberModal from '../components/AddMemberModal';
import DeleteMemberModal from '../components/DeleteMemberModal';

const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const CategoryList = ({ title, categories, onDelete, categoryIconMap }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
    <div className="space-y-2">
      {categories.map(category => {
        const Icon = categoryIconMap[category.name] || Icons.Tag;
        return (
          <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{category.name}</span>
            </div>
            <button
              onClick={() => onDelete(category.id)}
              className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
              title={`Eliminar ${category.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

const SettingsPage = ({ 
  categories, 
  members, 
  transactions,
  onAddCategory, 
  onDeleteCategory, 
  onAddMember,
  onDeleteMember,
  onUpdateMemberAvatar 
}) => {
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const incomeCategories = categories.filter(c => c.type === 'Ingreso');
  const expenseCategories = categories.filter(c => c.type === 'Gasto');

  const categoryIconMap = categories.reduce((acc, cat) => {
    const IconComponent = Icons[cat.icon_name] || Icons.Tag;
    acc[cat.name] = IconComponent;
    return acc;
  }, {});

  const memberSummary = useMemo(() => {
    return members.map(member => {
      const income = transactions.filter(t => t.member_id === member.id && t.type === 'Ingreso').reduce((s, t) => s + t.amount, 0);
      const expenses = transactions.filter(t => t.member_id === member.id && t.type === 'Gasto').reduce((s, t) => s + t.amount, 0);
      return { ...member, balance: income - expenses };
    });
  }, [transactions, members]);

  const handleOpenAvatarModal = (member) => {
    setSelectedMember(member);
    setAvatarModalOpen(true);
  };
  
  const handleSaveMember = (data) => {
    onAddMember(data);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
          <p className="mt-1 text-slate-500">Personaliza la aplicación a tu gusto.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3"><Users /> Gestión de Miembros</h2>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
            >
              <PlusCircle size={18} />
              Añadir Miembro
            </button>
          </div>
          <div className="space-y-2">
            {memberSummary.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full" />
                     <button
                      onClick={() => handleOpenAvatarModal(member)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Edit size={16} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm ${member.balance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>{formatCurrency(member.balance)}</p>
                  <button
                      onClick={() => handleOpenDeleteModal(member)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title={`Eliminar a ${member.name}`}
                  >
                      <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3"><Tag /> Gestión de Categorías</h2>
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
            >
              <PlusCircle size={18} />
              Añadir Categoría
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryList title="Categorías de Ingresos" categories={incomeCategories} onDelete={onDeleteCategory} categoryIconMap={categoryIconMap} />
            <CategoryList title="Categorías de Gastos" categories={expenseCategories} onDelete={onDeleteCategory} categoryIconMap={categoryIconMap} />
          </div>
        </div>
      </div>

      <AddCategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={onAddCategory} />
      <ChangeAvatarModal isOpen={isAvatarModalOpen} onClose={() => setAvatarModalOpen(false)} member={selectedMember} onSave={onUpdateMemberAvatar} />
      <AddMemberModal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} onSave={handleSaveMember} />
      <DeleteMemberModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} memberName={memberToDelete?.name} />
    </>
  );
};

export default SettingsPage;
