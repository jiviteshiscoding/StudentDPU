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
      <div className="p-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Leader-Only Access</h2>
        <p className="text-sm text-slate-600">
          The Activity audit log is restricted to team leaders to provide confidential milestone oversight and consequential plan approval tracking.
        </p>
        <div className="pt-4">
          <button
            onClick={() => onToggleRole(true)}
            className="px-5 py-2.5 bg-[#1E60FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
        return <CheckSquare className="w-4 h-4 text-[#1E60FF]" />;
      case 'file':
        return <FileText className="w-4 h-4 text-[#1E60FF]" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-[#1E60FF]" />;
      case 'member':
        return <UserPlus className="w-4 h-4 text-[#1E60FF]" />;
      case 'project':
        return <Settings className="w-4 h-4 text-[#1E60FF]" />;
      default:
        return <Star className="w-4 h-4 text-[#1E60FF]" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shadow-xs">
          <ActivityIcon className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Activity</h1>
          <p className="text-sm text-[#64748B] mt-0.5 font-normal">
            Track important changes across your projects.
          </p>
        </div>
      </div>

      {/* Filter Row: Dropdowns */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] cursor-pointer">
          <Folder className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-transparent outline-none cursor-pointer pr-2 font-medium"
          >
            <option value="all">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select className="bg-transparent outline-none cursor-pointer pr-2 font-medium">
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="90">Last 90 days</option>
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
                  ? 'border-[#1E60FF] bg-[#EFF6FF] text-[#1E60FF]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-slate-300 hover:text-slate-900'
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
              <h3 className="text-xs font-bold text-slate-700">Today</h3>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs divide-y divide-slate-100">
                {todayEvents.map((ev) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        {renderEventIcon(ev.type)}
                      </div>
                      <img
                        src={ev.actorAvatar}
                        alt={ev.actorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="text-xs text-slate-700 truncate">
                        <span className="font-bold text-[#0F172A]">{ev.actorName}</span>{' '}
                        <span>{ev.actionText}</span>{' '}
                        <span className="font-semibold text-[#1E60FF] cursor-pointer hover:underline">
                          {ev.targetObject}
                        </span>
                        {ev.badge && (
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                            {ev.badge.text}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ev.projectColor }}
                          />
                          <span className="text-[11px] text-slate-400">{ev.projectName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {yesterdayEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700">Yesterday</h3>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs divide-y divide-slate-100">
                {yesterdayEvents.map((ev) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        {renderEventIcon(ev.type)}
                      </div>
                      <img
                        src={ev.actorAvatar}
                        alt={ev.actorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="text-xs text-slate-700 truncate">
                        <span className="font-bold text-[#0F172A]">{ev.actorName}</span>{' '}
                        <span>{ev.actionText}</span>{' '}
                        {ev.targetObject && (
                          <span className="font-semibold text-[#1E60FF] cursor-pointer hover:underline">
                            {ev.targetObject}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ev.projectColor }}
                          />
                          <span className="text-[11px] text-slate-400">{ev.projectName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earlier this week Group */}
          {earlierEvents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700">Earlier this week</h3>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs divide-y divide-slate-100">
                {earlierEvents.map((ev) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        {renderEventIcon(ev.type)}
                      </div>
                      <img
                        src={ev.actorAvatar}
                        alt={ev.actorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="text-xs text-slate-700 truncate">
                        <span className="font-bold text-[#0F172A]">{ev.actorName}</span>{' '}
                        <span>{ev.actionText}</span>{' '}
                        <span className="font-semibold text-[#1E60FF] cursor-pointer hover:underline">
                          {ev.targetObject}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: ev.projectColor }}
                          />
                          <span className="text-[11px] text-slate-400">{ev.projectName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Activity Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Activity summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last 30 days across all projects</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A]">24</div>
                <div className="text-xs text-slate-500">Task updates</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A]">12</div>
                <div className="text-xs text-slate-500">Files shared</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A]">5</div>
                <div className="text-xs text-slate-500">Team changes</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0F172A]">3</div>
                <div className="text-xs text-slate-500">Project changes</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#1E60FF] shrink-0 mt-0.5" />
            <span>
              Consequential plan changes show who approved them, so your team has full visibility.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
