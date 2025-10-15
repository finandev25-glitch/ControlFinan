import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Shield, Trash2 } from 'lucide-react';

const FamilyMemberActions = ({ member, currentUser, familyOwnerId, onUpdateRole, onDeleteMember }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSelf = member.user_id === currentUser.id;
  const isOwner = member.user_id === familyOwnerId;
  const isCurrentUserAdmin = currentUser.role === 'admin';

  if (!isCurrentUserAdmin || isSelf) {
    return null; // No actions for non-admins or for oneself
  }

  const handleRoleChange = (newRole) => {
    onUpdateRole(member.id, newRole);
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDeleteMember(member.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-slate-200/80 z-10">
          <div className="py-1">
            <p className="px-4 py-2 text-xs text-slate-400">Cambiar Rol</p>
            <button
              onClick={() => handleRoleChange('admin')}
              disabled={member.role === 'admin'}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield size={16} />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleRoleChange('member')}
              disabled={member.role === 'member'}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield size={16} />
              <span>Miembro</span>
            </button>
            
            {!isOwner && (
              <>
                <div className="my-1 h-px bg-slate-200"></div>
                <button
                  onClick={handleDelete}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  <span>Eliminar Miembro</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMemberActions;
