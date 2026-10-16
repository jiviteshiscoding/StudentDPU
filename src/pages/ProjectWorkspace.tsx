import React, { useState } from 'react';
import { 
  Share2, 
  MoreHorizontal, 
  FileText, 
  ListOrdered, 
  Kanban, 
  Calendar, 
  Folder, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  Clock, 
  Flag, 
  Check, 
  X, 
  FileCheck, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { Project, Task, TeamMember, TaskStatus } from '../types';
import { AvatarGroup } from '../components/common/AvatarGroup';
import { ProjectTimelineFlowchart } from '../components/timeline/ProjectTimelineFlowchart';

interface ProjectWorkspaceProps {
  project: Project;
  allTasks: Task[];
  teamMembers: TeamMember[];
  onNavigate: (screen: string) => void;
  onOpenTaskModal: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  allTasks,
  teamMembers,
  onNavigate,
  onOpenTaskModal,
  onToggleTaskComplete,
  onUpdateTaskStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'board' | 'timeline' | 'files'>('overview');
  const [planApproved, setPlanApproved] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Filter tasks belonging to this project
  const projectTasks = allTasks.filter(t => t.projectId === project.id);

  // Mock members for the project
  const members = [
    { name: 'Emily Chen', role: 'Product Designer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', workload: 80, barColor: '#8B5CF6' },
    { name: 'Jordan Kim', role: 'Full Stack Developer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', workload: 65, barColor: '#2563EB' },
    { name: 'Alex Park', role: 'QA Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', workload: 40, barColor: '#38BDF8' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'plan', label: 'Plan', icon: ListOrdered },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'files', label: 'Files', icon: Folder },
  ];

  const boardColumns: TaskStatus[] = ['Backlog', 'To do', 'In progress', 'Blocked', 'In Review', 'Done', 'Cancelled'];

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
        <button 
          onClick={() => onNavigate('projects')}
          className="hover:text-[#1E60FF] dark:hover:text-blue-400 cursor-pointer"
        >
          Projects
        </button>
        <span>/</span>
        <span className="text-[#0F172A] dark:text-white font-semibold">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              {project.name}
            </h1>
          </div>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1.5 font-normal max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <AvatarGroup
            avatars={members.map(m => ({ name: m.name, url: m.avatar }))}
            max={3}
            size="md"
          />

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button 
            aria-label="More project actions"
            className="p-2 border border-[#E2E8F0] dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'border-[#1E60FF] text-[#1E60FF] dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/40'
                  : 'border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Project Status */}
            <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Project status</span>
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">On track</div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Progressing as planned.</div>
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                <span className="text-[#1E60FF] dark:text-blue-400 font-bold">||</span>
                <span>Progress</span>
              </div>
              <div className="text-xl font-bold text-[#0F172A] dark:text-white mt-2">68%</div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#1E60FF] h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                <Flag className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                <span>Milestones</span>
              </div>
              <div className="text-xl font-bold text-[#0F172A] dark:text-white mt-2">3 total</div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                1 completed · 1 in progress · 1 upcoming
              </div>
            </div>

            {/* Due Date */}
            <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                <Calendar className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                <span>Due date</span>
              </div>
              <div className="text-xl font-bold text-[#0F172A] dark:text-white mt-2">Apr 28, 2025</div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 mt-1">14 days remaining</div>
            </div>
          </div>

          {/* Middle Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): AI Project Plan */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#1E60FF] dark:text-blue-400" />
                  <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">AI project plan</h2>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved plan
                  </span>
                </div>
                <button 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="More plan options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mb-6">
                A structured plan to deliver the Campus Events Platform on time.
              </p>

              {/* Stepper / Timeline Phases */}
              <div className="relative flex items-center justify-between px-6 mb-8">
                {/* Connecting bar */}
                <div className="absolute left-10 right-10 top-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0">
                  <div className="h-full bg-emerald-500" style={{ width: '50%' }} />
                </div>

                {/* Step 1: Discovery */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-900 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white mt-2">Discovery</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Completed</div>
                  <div className="text-[10px] text-[#94A3B8] dark:text-slate-500">Mar 1 – Mar 21</div>
                </div>

                {/* Step 2: Build */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#1E60FF] text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-900 shadow-xs">
                    2
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white mt-2">Build</div>
                  <div className="text-[11px] text-[#1E60FF] dark:text-blue-400 font-medium">In progress</div>
                  <div className="text-[10px] text-[#94A3B8] dark:text-slate-500">Mar 22 – Apr 18</div>
                </div>

                {/* Step 3: Review */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-900 shadow-xs">
                    3
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white mt-2">Review</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">Upcoming</div>
                  <div className="text-[10px] text-[#94A3B8] dark:text-slate-500">Apr 19 – Apr 28</div>
                </div>
              </div>

              {/* Key Tasks Sub-Table */}
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-3">
                  Key tasks
                </h3>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
                    <div className="col-span-5">Task</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Owner</div>
                    <div className="col-span-2 text-right">Deadline</div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                    {/* Task 1 */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <div className="col-span-5 font-semibold text-[#0F172A] dark:text-white">
                        Build event registration flow
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Done
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2 truncate">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                          alt="Emily Chen"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate">Emily Chen</span>
                      </div>
                      <div className="col-span-2 text-right text-slate-500 dark:text-slate-400">
                        Apr 4, 2025
                      </div>
                    </div>

                    {/* Task 2 */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <div className="col-span-5 font-semibold text-[#0F172A] dark:text-white">
                        Develop event management dashboard
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E60FF]" /> In progress
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2 truncate">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                          alt="Jordan Kim"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate">Jordan Kim</span>
                      </div>
                      <div className="col-span-2 text-right text-slate-500 dark:text-slate-400">
                        Apr 15, 2025
                      </div>
                    </div>

                    {/* Task 3 */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <div className="col-span-5 font-semibold text-[#0F172A] dark:text-white">
                        Run student beta testing
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> To do
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2 truncate">
                        <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                          alt="Alex Park"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-700 dark:text-slate-300 truncate">Alex Park</span>
                      </div>
                      <div className="col-span-2 text-right text-slate-500 dark:text-slate-400">
                        Apr 24, 2025
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Needs attention & Team workload */}
            <div className="lg:col-span-5 space-y-6">
              {/* Needs Attention Card */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Needs attention</h2>
                  </div>
                  <button 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Red blocker alert */}
                <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      !
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        Event payment integration is blocked
                      </h3>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                        The third-party payment provider requires additional university compliance review, which is delaying development by ~1 week.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRecoveryModal(true)}
                    className="mt-3.5 px-3.5 py-1.5 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Review recovery plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Team Workload Card */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                    <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Team workload</h2>
                  </div>
                  <button 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="More workload options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {members.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">{m.name}</div>
                          <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">{m.role}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-32 shrink-0">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
                          {m.workload}%
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${m.workload}%`,
                              backgroundColor: m.barColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Recent Updates */}
          <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Recent updates</h2>
              </div>
              <button className="text-xs font-semibold text-[#1E60FF] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                <span>View all updates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {project.recentUpdates?.map((up) => (
                <div key={up.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-4 truncate">
                    <span className="text-slate-400 dark:text-slate-500 w-24 shrink-0">{up.date}</span>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <img
                        src={up.authorAvatar}
                        alt={up.authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-[#0F172A] dark:text-white">{up.authorName}</span>
                    </div>
                    <span className="text-[#475569] dark:text-slate-300 truncate">{up.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PLAN TAB */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#1E60FF] dark:text-blue-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Execution Plan</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    AI Generated · Leader Approved
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Phases, critical-path dependencies, deliverables, and role assignments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlanApproved(!planApproved)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    planApproved
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-[#1E60FF] text-white hover:bg-[#1A53DE]'
                  }`}
                >
                  {planApproved ? '✓ Plan is Approved' : 'Approve Plan'}
                </button>
              </div>
            </div>

            {/* Phases breakdown */}
            <div className="mt-6 space-y-6">
              {project.phases?.map((ph) => (
                <div key={ph.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1E60FF] dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                        {ph.number}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ph.name}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{ph.dateRange}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ph.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">{ph.description}</p>

                  <div className="bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Key Deliverables & Acceptance Criteria:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
                      <li>Deliverable: Responsive Figma UI prototypes validated with 3 student testers.</li>
                      <li>Prerequisite dependency: User requirements documented and approved by Lead.</li>
                      <li>Parallel execution: Frontend boilerplate can initialize concurrently with DB schema design.</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. BOARD TAB (Kanban) */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Kanban workflow: Backlog, To do, In progress, Blocked, In Review, Done, Cancelled.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {boardColumns.map((col) => {
              const colTasks = projectTasks.filter(t => t.status.toLowerCase() === col.toLowerCase());

              return (
                <div key={col} className="w-72 shrink-0 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col max-h-[700px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800 px-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      {col}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                    {colTasks.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onOpenTaskModal(t)}
                          className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3.5 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                              {t.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                t.priority === 'High' 
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' 
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {t.summary}
                          </p>

                          {t.dependsOn && (
                            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">
                              Depends on: {t.dependsOn}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">{t.dueDateDisplay}</span>
                            <img
                              src={t.ownerAvatar}
                              alt={t.ownerName}
                              title={t.ownerName}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TIMELINE TAB (Interactive Flowchart) */}
      {activeTab === 'timeline' && (
        <ProjectTimelineFlowchart
          project={project}
          onOpenRecoveryPlan={() => setShowRecoveryModal(true)}
          onOpenTaskModal={onOpenTaskModal}
          tasks={projectTasks}
        />
      )}

      {/* 5. FILES TAB */}
      {activeTab === 'files' && (
        <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Files: {project.name}</h2>
            <button
              onClick={() => onNavigate('files')}
              className="text-xs font-semibold text-[#1E60FF] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Open global file manager →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Event platform proposal.pdf</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">2.4 MB · Uploaded by Alex Rivera</div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                FIG
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Event registration flow.fig</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">5.6 MB · Uploaded by Daniel Kim</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-6 right-6 bg-[#0F172A] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-rise z-50 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Project link copied to clipboard! (Demo mock)</span>
        </div>
      )}

      {/* Recovery Plan Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 animate-fade-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recovery Plan Options</h3>
              </div>
              <button 
                onClick={() => setShowRecoveryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close recovery modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                AI Coordinator Proposal for Payment Gateway Blocker:
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-300">Option 1 (Recommended): Mock payment bypass for Demo</div>
                <p className="text-blue-700 dark:text-blue-400">
                  Implement student sandbox simulator allowing instant registration confirmation while university IT completes compliance check.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Option 2: Shift payment phase to post-presentation</div>
                <p className="text-slate-600 dark:text-slate-400">
                  Keep registration free-tier only for the class presentation on May 2.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  alert('Approved Recovery Plan: Sandbox payment simulator applied for class demo.');
                }}
                className="px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Apply Option 1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
