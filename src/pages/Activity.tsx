import React, { useState } from 'react';
import { 
  Activity as ActivityIcon, 
  Folder, 
  Calendar, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronDown,
  UserPlus,
  Star
} from 'lucide-react';
import { ActivityEvent, Project } from '../types';

interface ActivityProps {
  activityEvents: ActivityEvent[];
  projects: Project[];
  isLeader: boolean;
  onToggleRole: (leader: boolean) => void;
  onNavigate: (screen: string) => void;
}

export const Activity: React.FC<ActivityProps> = ({
  activityEvents,
  projects,
  isLeader,
  onToggleRole,
  onNavigate,
}) => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Leader-only gate check
  if (!isLeader) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-4 animate-fade-rise">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leader-Only Access</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The Activity audit log is restricted to team leaders in the prototype to provide confidential milestone oversight and consequential plan approval tracking.
        </p>
        <div className="pt-4">
          <button
            onClick={() => onToggleRole(true)}
            className="px-5 py-2.5 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Switch to Team Leader Demo Account
          </button>
        </div>
      </div>
    );
  }

  const filterPills = [
    { id: 'all', label: 'All activity' },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
    { id: 'file', label: 'Files', icon: FileText },
    { id: 'comment', label: 'Comments', icon: MessageSquare },
    { id: 'member', label: 'Members', icon: Users },
    { id: 'project', label: 'Project changes', icon: Settings },
  ];

  const filteredEvents = activityEvents.filter(ev => {
    const matchesProj = selectedProject === 'all' || ev.projectId === selectedProject;
    const matchesType = selectedType === 'all' || ev.type === selectedType;
    return matchesProj && matchesType;
  });

  const todayEvents = filteredEvents.filter(e => e.group === 'Today');
  const yesterdayEvents = filteredEvents.filter(e => e.group === 'Yesterday');
  const earlierEvents = filteredEvents.filter(e => e.group === 'Earlier this week');

  const renderEventIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />;
      case 'file':
        return <FileText className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />;
      case 'member':
        return <UserPlus className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />;
      case 'project':
        return <Settings className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />;
      default:
        return <Star className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shadow-xs">
          <ActivityIcon className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">Activity</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-normal">
            Track important changes and audit records across your projects.
          </p>
        </div>
      </div>

      {/* Filter Row: Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white cursor-pointer">
          <Folder className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-transparent outline-none cursor-pointer pr-2 font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all" className="dark:bg-slate-900">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select className="bg-transparent outline-none cursor-pointer pr-2 font-medium text-slate-800 dark:text-slate-200">
            <option value="30" className="dark:bg-slate-900">Last 30 days</option>
            <option value="7" className="dark:bg-slate-900">Last 7 days</option>
            <option value="90" className="dark:bg-slate-900">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filterPills.map((pill) => {
          const Icon = pill.icon;
          const isActive = selectedType === pill.id;

          return (
            <button
              key={pill.id}
              onClick={() => setSelectedType(pill.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                isActive
                  ? 'border-[#1E60FF] bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400'
                  : 'border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#64748B] dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Layout: Feed & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Chronological Audit Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today Group */}
          {todayEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Today</h3>
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-4 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80">
                {todayEvents.map((ev) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                        {renderEventIcon(ev.type)}
                      </div>
                      <img
                        src={ev.actorAvatar}
                        alt={ev.actorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="text-xs text-slate-700 dark:text-slate-300 truncate">
                        <span className="font-bold text-[#0F172A] dark:text-white">{ev.actorName}</span>{' '}
                        <span>{ev.actionText}</span>{' '}
                        <span className="font-semibold text-[#1E60FF] dark:text-blue-400 cursor-pointer hover:underline">
                          {ev.targetObject}
                        </span>
                        {ev.badge && (
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {ev.badge.text}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ev.projectColor }}
                          />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{ev.projectName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {yesterdayEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Yesterday</h3>
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-4 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80">
                {yesterdayEvents.map((ev) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                        {renderEventIcon(ev.type)}
                      </div>
                      <img
                        src={ev.actorAvatar}
                        alt={ev.actorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="text-xs text-slate-700 dark:text-slate-300 truncate">
                        <span className="font-bold text-[#0F172A] dark:text-white">{ev.actorName}</span>{' '}
                        <span>{ev.actionText}</span>{' '}
                        {ev.targetObject && (
                          <span className="font-semibold text-[#1E60FF] dark:text-blue-400 cursor-pointer hover:underline">
                            {ev.targetObject}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ev.projectColor }}
                          />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{ev.projectName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earlier this week Group */}
          {earlierEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Earlier this week</h3>
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-4 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80">
                {earlierEvents.map((ev) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                        {renderEventIcon(ev.type)}
                      </div>
                      <img
                        src={ev.actorAvatar}
                        alt={ev.actorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="text-xs text-slate-700 dark:text-slate-300 truncate">
                        <span className="font-bold text-[#0F172A] dark:text-white">{ev.actorName}</span>{' '}
                        <span>{ev.actionText}</span>{' '}
                        <span className="font-semibold text-[#1E60FF] dark:text-blue-400 cursor-pointer hover:underline">
                          {ev.targetObject}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ev.projectColor }}
                          />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{ev.projectName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Activity Summary */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Activity summary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last 30 days across all projects</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-white">24</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Task updates</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-white">12</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Files shared</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-white">5</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Team changes</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A] dark:text-white">3</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Project changes</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#1E60FF] dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              Consequential plan changes show who approved them, so your team has full audit visibility.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
