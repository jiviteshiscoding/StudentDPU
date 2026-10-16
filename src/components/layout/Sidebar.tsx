import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Folder, 
  Users, 
  FileText, 
  Activity, 
  Sparkles, 
  Plus,
  X
} from 'lucide-react';
import { Project } from '../../types';

interface SidebarProps {
  currentScreen: string;
  selectedProjectId: string | null;
  onNavigate: (screen: string, projectId?: string) => void;
  projects: Project[];
  isLeader: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  selectedProjectId,
  onNavigate,
  projects,
  isLeader,
  isOpenMobile,
  onCloseMobile,
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
    { id: 'ask-team', label: 'Ask PROJEX', icon: Sparkles, isPrimary: true },
  ];

  const handleNavClick = (screenId: string, projId?: string) => {
    onNavigate(screenId, projId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#0D131F] border-r border-[#E2E8F0] dark:border-slate-800/80 flex flex-col select-none shrink-0 transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-transparent">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E60FF] to-[#38BDF8] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-widest">P</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#0F172A] dark:text-white tracking-tight font-sans">
                PROJEX
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Action Buttons: New Project & Ask PROJEX prominent */}
        <div className="px-4 pt-2 pb-3 space-y-2">
          {/* New Project Action */}
          <button
            onClick={() => handleNavClick('create-project')}
            className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 bg-[#1E60FF] hover:bg-[#1A53DE] active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>New project</span>
          </button>

          {/* Ask PROJEX Action Highlight */}
          <button
            onClick={() => handleNavClick('ask-team')}
            className={`w-full flex items-center justify-start gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
              currentScreen === 'ask-team'
                ? 'bg-[#1E60FF] text-white border-[#1E60FF] shadow-sm'
                : 'bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-[#1E60FF] dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
            <span>Ask PROJEX</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="px-3 space-y-1 py-1">
          {navItems.filter(item => item.id !== 'ask-team').map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id && !selectedProjectId;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EBF3FE] dark:bg-blue-950/50 text-[#1E60FF] dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-[#475569] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800/60 hover:text-[#0F172A] dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#1E60FF] dark:text-blue-400 stroke-[2.5]' : 'text-[#64748B] dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 border border-[#BFDBFE] dark:border-blue-900/60">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="mt-4 px-3 flex-1 overflow-y-auto">
          <div className="pt-3 border-t border-[#E2E8F0]/80 dark:border-slate-800 mb-2 px-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 tracking-wider uppercase">
              Your projects
            </span>
          </div>

          <div className="space-y-0.5">
            {projects.map((proj) => {
              const isSelected = currentScreen === 'project-workspace' && selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleNavClick('project-workspace', proj.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left cursor-pointer truncate ${
                    isSelected
                      ? 'bg-[#EBF3FE] dark:bg-blue-950/50 text-[#1E60FF] dark:text-blue-400 font-semibold'
                      : 'text-[#475569] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 hover:text-[#0F172A] dark:hover:text-slate-200'
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
              onClick={() => handleNavClick('create-project')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#64748B] dark:text-slate-400 hover:text-[#1E60FF] dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#94A3B8] dark:text-slate-500" />
              <span className="font-medium">New project</span>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar Status */}
        <div className="p-3 border-t border-[#E2E8F0]/80 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>PROJEX Workspace</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Demo UI
          </span>
        </div>
      </aside>
    </>
  );
};
