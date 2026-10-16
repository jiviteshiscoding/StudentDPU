import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Folder, 
  Users, 
  FileText, 
  Activity, 
  Sparkles, 
  Plus 
} from 'lucide-react';
import { Project } from '../../types';

interface SidebarProps {
  currentScreen: string;
  selectedProjectId: string | null;
  onNavigate: (screen: string, projectId?: string) => void;
  projects: Project[];
  isLeader: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  selectedProjectId,
  onNavigate,
  projects,
  isLeader,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'My tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'files', label: 'Files', icon: FileText },
    ...(isLeader
      ? [{ id: 'activity', label: 'Activity', icon: Activity, badge: 'Leader' }]
      : []),
    { id: 'ask-team', label: 'Ask Team', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-transparent">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E60FF] to-[#38BDF8] flex items-center justify-center p-1.5 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 15" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        </div>
        <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-sans">Orbit</span>
      </div>

      {/* Primary Action: New Project Button */}
      <div className="px-4 py-3">
        <button
          onClick={() => onNavigate('create-project')}
          className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 bg-[#1E60FF] hover:bg-[#1A53DE] active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>New project</span>
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="px-3 space-y-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id && !selectedProjectId;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#EBF3FE] text-[#1E60FF] font-semibold'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#1E60FF] stroke-[2.5]' : 'text-[#64748B]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3FE] text-[#1E60FF] border border-[#BFDBFE]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Projects Section */}
      <div className="mt-4 px-3 flex-1 overflow-y-auto">
        <div className="pt-3 border-t border-[#E2E8F0]/80 mb-2 px-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            Your projects
          </span>
        </div>

        <div className="space-y-0.5">
          {projects.map((proj) => {
            const isSelected = currentScreen === 'project-workspace' && selectedProjectId === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => onNavigate('project-workspace', proj.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left cursor-pointer truncate ${
                  isSelected
                    ? 'bg-[#EBF3FE] text-[#1E60FF] font-semibold'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: proj.color }}
                />
                <span className="truncate">{proj.name}</span>
              </button>
            );
          })}

          <button
            onClick={() => onNavigate('create-project')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#64748B] hover:text-[#1E60FF] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-medium">New project</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
