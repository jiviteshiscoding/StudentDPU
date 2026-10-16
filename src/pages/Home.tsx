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
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  tasks,
  projects,
  onOpenTaskModal,
  onToggleTaskComplete,
}) => {
  // Find the needs attention task
  const blockedTask = tasks.find(t => t.status === 'Blocked') || tasks[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            Good morning, Alex <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-normal">
            Here's what's happening across your projects.
          </p>
        </div>
        <div className="text-sm font-medium text-[#64748B]">
          Thursday, Apr 17, 2025
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1E60FF] shrink-0">
            <Folder className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] leading-tight">5</div>
            <div className="text-sm font-semibold text-[#0F172A]">Active projects</div>
            <div className="text-xs text-[#64748B] mt-0.5">2 in planning · 3 in progress</div>
          </div>
        </div>

        {/* Tasks Due Soon */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-4 cursor-pointer hover:border-green-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
            <CalendarCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] leading-tight">12</div>
            <div className="text-sm font-semibold text-[#0F172A]">Tasks due soon</div>
            <div className="text-xs text-[#64748B] mt-0.5">Due in the next 7 days</div>
          </div>
        </div>

        {/* At Risk */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B] shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] leading-tight">2</div>
            <div className="text-sm font-semibold text-[#0F172A]">At risk</div>
            <div className="text-xs text-[#64748B] mt-0.5">Tasks need attention</div>
          </div>
        </div>

        {/* Team Members */}
        <div 
          onClick={() => onNavigate('team')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FAF5FF] flex items-center justify-center text-[#8B5CF6] shrink-0">
            <Users className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] leading-tight">8</div>
            <div className="text-sm font-semibold text-[#0F172A]">Team members</div>
            <div className="text-xs text-[#64748B] mt-0.5">Across all your projects</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Deadlines & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: My upcoming deadlines */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#0F172A]">My upcoming deadlines</h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-[#1E60FF] hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Task 1 */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTaskComplete('task-2')}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-[#1E60FF] flex items-center justify-center transition-colors cursor-pointer"
                />
                <div>
                  <div 
                    onClick={() => onOpenTaskModal(tasks.find(t => t.id === 'task-2') || tasks[1])}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#1E60FF] cursor-pointer"
                  >
                    Review registration flow design
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span className="text-xs text-[#64748B]">Campus Events Platform</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                Today
              </span>
            </div>

            {/* Task 2 */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTaskComplete('task-3')}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-[#1E60FF] flex items-center justify-center transition-colors cursor-pointer"
                />
                <div>
                  <div 
                    onClick={() => onOpenTaskModal(tasks.find(t => t.id === 'task-3') || tasks[2])}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#1E60FF] cursor-pointer"
                  >
                    Prepare sponsorship deck
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-xs text-[#64748B]">Sustainability Hackathon</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-50 text-sky-600 border border-sky-100">
                Tomorrow
              </span>
            </div>

            {/* Task 3 */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTaskComplete('task-4')}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-[#1E60FF] flex items-center justify-center transition-colors cursor-pointer"
                />
                <div>
                  <div 
                    onClick={() => onOpenTaskModal(tasks.find(t => t.id === 'task-4') || tasks[3])}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#1E60FF] cursor-pointer"
                  >
                    Finalize event space booking
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                    <span className="text-xs text-[#64748B]">Career Fair 2025</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                Apr 21, 2025
              </span>
            </div>

            {/* Task 4 */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTaskComplete('task-5')}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-[#1E60FF] flex items-center justify-center transition-colors cursor-pointer"
                />
                <div>
                  <div 
                    onClick={() => onOpenTaskModal(tasks.find(t => t.id === 'task-5') || tasks[4])}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#1E60FF] cursor-pointer"
                  >
                    User testing summary
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <span className="text-xs text-[#64748B]">Library Redesign</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                Apr 22, 2025
              </span>
            </div>

            {/* Task 5 */}
            <div className="flex items-center justify-between py-2.5 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTaskComplete('task-6')}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-[#1E60FF] flex items-center justify-center transition-colors cursor-pointer"
                />
                <div>
                  <div 
                    onClick={() => onOpenTaskModal(tasks.find(t => t.id === 'task-6') || tasks[5])}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#1E60FF] cursor-pointer"
                  >
                    Confirm workshop facilitators
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                    <span className="text-xs text-[#64748B]">Wellness Week</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                Apr 25, 2025
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Needs attention */}
        <div className="lg:col-span-5 bg-[#FFFBEB]/50 rounded-2xl border border-amber-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <h2 className="text-base font-bold text-[#D97706]">Needs attention</h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-[#1E60FF] hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all (2)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-[#64748B] mb-4">
            These tasks may be at risk or are blocking progress.
          </p>

          {/* Inner card */}
          <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onToggleTaskComplete(blockedTask.id)}
                  className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-[#1E60FF] transition-colors cursor-pointer mt-0.5"
                />
                <span className="text-sm font-bold text-[#0F172A]">
                  {blockedTask.title}
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                {blockedTask.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 ml-6.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="text-xs text-[#64748B]">{blockedTask.projectName}</span>
            </div>

            <p className="text-xs text-[#475569] mt-2.5 ml-6.5 leading-relaxed">
              {blockedTask.summary}
            </p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={blockedTask.ownerAvatar}
                  alt={blockedTask.ownerName}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="text-xs font-medium text-[#334155]">
                  {blockedTask.ownerName}
                </span>
                <span className="text-slate-300 mx-1">·</span>
                <div className="flex items-center gap-1 text-xs text-[#64748B]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Apr 17, 2025</span>
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
