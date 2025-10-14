import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';

const MemberSelector = ({ members, selectedMemberId, onMemberChange, showGlobalOption = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedMember = members.find(m => String(m.id) === String(selectedMemberId));

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (memberId) => {
    onMemberChange(memberId);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-52" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-pointer rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
      >
        <span className="flex items-center">
          {selectedMember ? (
            <img src={selectedMember.avatar} alt={selectedMember.name} className="h-6 w-6 flex-shrink-0 rounded-full" />
          ) : (
            <Users className="h-6 w-6 flex-shrink-0 rounded-full p-0.5 bg-slate-100 text-slate-500" />
          )}
          <span className="ml-3 block truncate font-medium">
            {selectedMember ? selectedMember.name : 'Todos'}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-slate-200">
          <ul tabIndex="-1" role="listbox" className="max-h-56 overflow-auto rounded-md py-1 text-base focus:outline-none sm:text-sm">
            {showGlobalOption && (
              <li
                onClick={() => handleSelect('all')}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-primary-50"
              >
                <div className="flex items-center">
                  <Users className="h-6 w-6 flex-shrink-0 rounded-full p-0.5 bg-slate-100 text-slate-500" />
                  <span className="ml-3 block truncate font-medium">Todos</span>
                </div>
              </li>
            )}
            {members.map((member) => (
              <li
                key={member.id}
                onClick={() => handleSelect(String(member.id))}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-primary-50"
              >
                <div className="flex items-center">
                  <img src={member.avatar} alt={member.name} className="h-6 w-6 flex-shrink-0 rounded-full" />
                  <span className="ml-3 block truncate font-medium">
                    {member.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MemberSelector;
