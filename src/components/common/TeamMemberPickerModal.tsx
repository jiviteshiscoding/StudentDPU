import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Check, 
  X, 
  CheckSquare, 
  Square, 
  UserPlus, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { TeamMember } from '../../types';

interface TeamMemberPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: TeamMember[];
  selectedMemberIds: string[];
  onApplySelection: (selectedIds: string[]) => void;
}

export const TeamMemberPickerModal: React.FC<TeamMemberPickerModalProps> = ({
  isOpen,
  onClose,
  availableMembers,
  selectedMemberIds,
  onApplySelection,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedMemberIds);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedMemberIds);
      setSearch('');
    }
  }, [isOpen, selectedMemberIds]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMembers = availableMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleMember = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(availableMembers.map(m => m.id));
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  const handleConfirm = () => {
    onApplySelection(selectedIds);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-rise"
      role="dialog"
      aria-modal="true"
      aria-label="Assign Team Members to Project"
    >
      <div 
        className="bg-white dark:bg-[#0D131F] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden transition-colors flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose Project Team</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Assign members to collaborate on this project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close team selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar & Bulk actions */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members by name, role, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-[#1E60FF]"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-[#1E60FF] dark:text-blue-400 font-bold">{selectedIds.length}</span> of {availableMembers.length} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-semibold text-[#1E60FF] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Select all
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching team members found for "{search}"
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isSelected = selectedIds.includes(m.id);

              return (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {/* Checkbox indicator */}
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[#1E60FF] text-white'
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Member Avatar */}
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />

                    {/* Member info */}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {m.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          m.roleCategory === 'Lead'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : m.roleCategory === 'Designer'
                            ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {m.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{m.email}</span>
                        <span>•</span>
                        <span className="truncate">{m.skills.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workload badge */}
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {m.workload}% load
                    </span>
                    <div className="w-14 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          m.workload > 80 ? 'bg-rose-500' : m.workload > 50 ? 'bg-purple-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${m.workload}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Demo Disclaimer notice */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>Selecting members assigns them to this local project draft only. No external emails or invites are dispatched.</span>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white dark:bg-[#0D131F] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedIds.length === 0 ? 'No members selected' : `${selectedIds.length} members assigned`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Selection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
