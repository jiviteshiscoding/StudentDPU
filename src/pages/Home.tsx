import React from 'react';
import { 
  Folder, 
  CalendarCheck, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Task, Project } from '../types';

interface HomeProps {
  onNavigate: (screen: string, projectId?: string) => void;
  tasks: Task[];
  projects: Project[];
  onOpenTaskModal: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
  userName?: string;
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  tasks,
  projects,
  onOpenTaskModal,
  onToggleTaskComplete,
  userName = 'Alex',
}) => {
  // Derive metrics dynamically
  const activeProjectsCount = projects.length;
  const inPlanningCount = projects.filter(p => (p as any).status === 'Planning' || p.progress === 0).length;
  const inProgressCount = projects.filter(p => (p as any).status !== 'Planning' && p.progress > 0 && p.progress < 100).length;

  // Tasks due soon (due today, or in next 7 days)
  const tasksDueSoon = tasks.filter(t => 
    t.status !== 'Done' && (t.dueCategory === 'Due today' || t.dueCategory === 'This week')
  );

  // At risk tasks
  const atRiskTasks = tasks.filter(t => t.status === 'Blocked' || t.isRisk);
  const blockedTask = atRiskTasks[0] || tasks.find(t => t.status === 'Blocked') || tasks[0];

  // Team members count across all projects
  const teamMemberCount = React.useMemo(() => {
    const memberSet = new Set<string>();
    projects.forEach(p => {
      p.members?.forEach(m => {
        if (typeof m === 'string') memberSet.add(m);
        else if (m && (m as any).id) memberSet.add((m as any).id);
      });
    });
    return memberSet.size > 0 ? memberSet.size : 1;
  }, [projects]);

  // Dynamic upcoming tasks (top 5 pending/in_progress tasks)
  const upcomingTasks = React.useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Done')
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            Good morning, {userName} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 font-normal">
            Here's what's happening across your projects.
          </p>
        </div>
        <div className="text-sm font-medium text-[#64748B] dark:text-slate-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center text-[#1E60FF] dark:text-blue-400 shrink-0">
            <Folder className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">{activeProjectsCount}</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Active projects</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{inPlanningCount} in planning · {inProgressCount || activeProjectsCount - inPlanningCount} in progress</div>
          </div>
        </div>

        {/* Tasks Due Soon */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4 cursor-pointer hover:border-green-200 dark:hover:border-emerald-800 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center text-[#10B981] dark:text-emerald-400 shrink-0">
            <CalendarCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">{tasksDueSoon.length}</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Tasks due soon</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Due in the next 7 days</div>
          </div>
        </div>

        {/* At Risk */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-200 dark:hover:border-amber-800 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/60 flex items-center justify-center text-[#F59E0B] dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">{atRiskTasks.length}</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">At risk</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Tasks need attention</div>
          </div>
        </div>

        {/* Team Members */}
        <div 
          onClick={() => onNavigate('team')}
          className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-200 dark:hover:border-purple-800 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FAF5FF] dark:bg-purple-950/60 flex items-center justify-center text-[#8B5CF6] dark:text-purple-400 shrink-0">
            <Users className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">{teamMemberCount}</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Team members</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Across all your projects</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Deadlines & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My upcoming deadlines */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">My upcoming deadlines</h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-[#1E60FF] hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748B] dark:text-slate-400">
                No upcoming pending tasks. You're all caught up!
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      aria-label="Toggle task completion"
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        task.status === 'Done'
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-[#1E60FF]'
                      }`}
                    >
                      {task.status === 'Done' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div>
                      <div 
                        onClick={() => onOpenTaskModal(task)}
                        className={`text-sm font-semibold cursor-pointer ${
                          task.status === 'Done'
                            ? 'line-through text-[#94A3B8] dark:text-slate-500'
                            : 'text-[#0F172A] dark:text-white hover:text-[#1E60FF] dark:hover:text-blue-400'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.projectColor || '#2563EB' }} />
                        <span className="text-xs text-[#64748B] dark:text-slate-400">{task.projectName}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                    task.dueCategory === 'Due today'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {task.dueDateDisplay || task.dueDate || 'No due date'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Needs attention */}
        <div className="lg:col-span-5 bg-[#FFFBEB]/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-amber-400" />
              <h2 className="text-base font-bold text-[#D97706] dark:text-amber-400">Needs attention</h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-[#1E60FF] dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all ({atRiskTasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
            These tasks may be at risk or are blocking progress.
          </p>

          {/* Inner card */}
          {blockedTask ? (
            <div className="bg-white dark:bg-[#0D131F] rounded-xl border border-amber-100 dark:border-amber-900/40 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onToggleTaskComplete(blockedTask.id)}
                    aria-label="Toggle blocked task completion"
                    className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-[#1E60FF] transition-colors cursor-pointer mt-0.5"
                  />
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                    {blockedTask.title}
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 shrink-0">
                  {blockedTask.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 ml-6.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: blockedTask.projectColor || '#2563EB' }} />
                <span className="text-xs text-[#64748B] dark:text-slate-400">{blockedTask.projectName}</span>
              </div>

              <p className="text-xs text-[#475569] dark:text-slate-300 mt-2.5 ml-6.5 leading-relaxed">
                {blockedTask.summary || 'Action required to unblock progress.'}
              </p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img
                    src={blockedTask.ownerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"}
                    alt={blockedTask.ownerName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <span className="text-xs font-medium text-[#334155] dark:text-slate-300">
                    {blockedTask.ownerName}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 mx-1">·</span>
                  <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{blockedTask.dueDateDisplay || blockedTask.dueDate || 'Soon'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenTaskModal(blockedTask)}
                  className="px-3.5 py-1.5 bg-[#1E60FF] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  View task
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0D131F] rounded-xl border border-amber-100 dark:border-amber-900/40 p-6 text-center text-xs text-[#64748B]">
              No tasks currently blocked or at risk.
            </div>
          )}
        </div>
      </div>

      {/* 
        CRITICAL REQUIREMENT FROM BUILD BRIEF:
        "Keep all space below these cards blank. Do not add Project Progress, Recent Activity, charts, cards, or filler content to the lower area."
      */}
      <div className="h-16" />
    </div>
  );
};
