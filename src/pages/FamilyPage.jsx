import React, { useState } from 'react';
import { Shield, UserPlus, Mail } from 'lucide-react';
import FamilyMemberActions from '../components/FamilyMemberActions';

const FamilyPage = ({ family, familyMembers, onUpdateRole, onDeleteMember, currentUserId }) => {
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  const currentUserMember = familyMembers.find(m => m.user_id === currentUserId);
  const isCurrentUserAdmin = currentUserMember?.role === 'admin';

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestión Familiar</h1>
            <p className="mt-1 text-slate-500">Administra los miembros y roles de tu familia.</p>
          </div>
          {isCurrentUserAdmin && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
            >
              <UserPlus size={18} />
              Invitar Miembro
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Miembros de la Familia</h2>
          <div className="space-y-3">
            {familyMembers.map(member => {
              const profile = member.user_profiles;
              const nameForAvatar = profile?.full_name || profile?.email || 'A';
              const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`;

              return (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-4">
                    <img src={avatarUrl} alt={profile?.full_name} className="h-12 w-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-slate-800">{profile?.full_name || 'Usuario sin nombre'}</p>
                      <p className="text-sm text-slate-500">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${member.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-slate-200 text-slate-700'}`}>
                      <Shield size={14} />
                      {member.role === 'admin' ? 'Admin' : 'Miembro'}
                    </span>
                    <FamilyMemberActions
                      member={member}
                      currentUser={{ id: currentUserId, role: currentUserMember?.role }}
                      familyOwnerId={family.owner_id}
                      onUpdateRole={onUpdateRole}
                      onDeleteMember={onDeleteMember}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Invitar Miembro</h2>
                <p className="text-slate-500 mb-6">Ingresa el correo electrónico del usuario a invitar.</p>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="email" placeholder="email@ejemplo.com" className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 pl-10 shadow-sm" />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setInviteModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full">Cancelar</button>
                    <button onClick={() => {alert('Funcionalidad en desarrollo.'); setInviteModalOpen(false);}} className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-full shadow-sm">Enviar Invitación</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default FamilyPage;
