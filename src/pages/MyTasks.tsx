import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ArrowDown, 
  MoreHorizontal,
  ArrowRight,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { Task, Project, TeamMember, Priority, TaskStatus } from '../types';

interface MyTasksProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onToggleTaskComplete: (taskId: string) => void;
  onAddTask: (newTask: Partial<Task>) => void;
  onOpenTaskModal: (task: Task) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const MyTasks: React.FC<MyTasksProps> = ({
  tasks,
  projects,
  teamMembers,
  onToggleTaskComplete,
  onAddTask,
  onOpenTaskModal,
  isLoading = false,
  errorMessage = null,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority'>('due_date');
  const [showAddModal, setShowAddModal] = useState(false);

  // Group collapsed state
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    Overdue: false,
    'Due today': false,
    'This week': false,
    Later: false,
  });

  const toggleGroup = (grp: string) => {
    setCollapsedGroups(prev => ({ ...prev, [grp]: !prev[grp] }));
  };

  // Add Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSummary, setNewTaskSummary] = useState('');
  const [newTaskProject, setNewTaskProject] = useState(projects[0]?.id || 'campus-events');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [newTaskDue, setNewTaskDue] = useState('2025-04-20');
  const [newTaskOwner, setNewTaskOwner] = useState(teamMembers[0]?.id || 'member-alex');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const proj = projects.find(p => p.id === newTaskProject);
    const owner = teamMembers.find(m => m.id === newTaskOwner);

    onAddTask({
      title: newTaskTitle,
      summary: newTaskSummary || 'New task assigned to project.',
      projectId: newTaskProject,
      projectName: proj?.name || 'Campus Events Platform',
      projectColor: proj?.color || '#2563EB',
      status: 'To do',
      priority: newTaskPriority,
      dueDate: newTaskDue,
      dueDateDisplay: newTaskDue,
      dueCategory: 'This week',
      ownerId: newTaskOwner,
      ownerName: owner?.name || 'Alex Rivera',
      ownerAvatar: owner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    setNewTaskTitle('');
    setNewTaskSummary('');
    setShowAddModal(false);
  };

  // Filtering
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.summary.toLowerCase().includes(search.toLowerCase());
    const matchesProject = selectedProjectFilter === 'all' || t.projectId === selectedProjectFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'To do' && t.status === 'To do') ||
                          (statusFilter === 'In progress' && t.status === 'In progress') ||
                          (statusFilter === 'Blocked' && t.status === 'Blocked') ||
                          (statusFilter === 'Done' && t.status === 'Done');

    return matchesSearch && matchesProject && matchesStatus;
  });

  const overdueTasks = filteredTasks.filter(t => t.dueCategory === 'Overdue');
  const todayTasks = filteredTasks.filter(t => t.dueCategory === 'Due today');
  const thisWeekTasks = filteredTasks.filter(t => t.dueCategory === 'This week');
  const laterTasks = filteredTasks.filter(t => t.dueCategory === 'Later');

  const groups = [
    {
      id: 'Overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      color: 'text-rose-600',
      badgeBg: 'bg-rose-100 text-rose-700',
      items: overdueTasks,
    },
    {
      id: 'Due today',
      label: 'Due today',
      icon: Calendar,
      color: 'text-rose-500',
      badgeBg: 'bg-rose-100 text-rose-600',
      items: todayTasks,
    },
    {
      id: 'This week',
      label: 'This week',
      icon: Calendar,
      color: 'text-[#1E60FF]',
      badgeBg: 'bg-blue-100 text-[#1E60FF]',
      items: thisWeekTasks,
    },
    {
      id: 'Later',
      label: 'Later',
      icon: Clock,
      color: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-700',
      items: laterTasks,
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">My tasks</h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 font-normal">
          Your work across all projects, in one place.
        </p>
      </div>

      {/* Control Bar: Search, Status Filters, Project Filter, Due Date, Add Task */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-[#94A3B8] focus:border-[#1E60FF] focus:ring-1 focus:ring-[#1E60FF] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#F1F5F9]/70 dark:bg-slate-800/60 p-1 rounded-xl">
            {['All', 'To do', 'In progress', 'Blocked', 'Done'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1E60FF] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Add Task */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#334155] dark:text-slate-200 focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={() => setSortBy(sortBy === 'due_date' ? 'priority' : 'due_date')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#334155] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            <span>↑↓ Due date</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add task</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          <p className="font-bold">Unable to sync tasks with Supabase</p>
          <p className="mt-0.5">{errorMessage}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 animate-pulse flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span>Syncing tasks from Supabase...</span>
        </div>
      )}

      {/* Task Groups Table Container */}
      <div className="space-y-6">
        {groups.map((group) => {
          const Icon = group.icon;
          const isCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 overflow-hidden shadow-xs">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-6 py-3.5 bg-white dark:bg-[#0D131F] hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors border-b border-[#F1F5F9] dark:border-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${group.color}`} />
                    <span className={`text-sm font-bold ${group.color}`}>{group.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${group.badgeBg}`}>
                      {group.items.length}
                    </span>
                  </div>
                </div>
              </button>

              {/* Group Task Rows */}
              {!isCollapsed && (
                <div>
                  {/* Table Column Labels */}
                  <div className="grid grid-cols-12 gap-3 px-6 py-2 bg-[#F8FAFC] dark:bg-slate-900/60 text-[11px] font-semibold text-[#64748B] dark:text-slate-400 border-b border-[#E2E8F0]/60 dark:border-slate-800">
                    <div className="col-span-5 pl-7">Task</div>
                    <div className="col-span-2">Project</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-1">Due date</div>
                    <div className="col-span-1">Depends on</div>
                    <div className="col-span-1 text-right">Owner</div>
                  </div>

                  {group.items.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No tasks in this group.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F1F5F9] dark:divide-slate-800/60">
                      {group.items.map((task) => (
                        <div
                          key={task.id}
                          className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-[#F8FAFC]/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Task Info with Checkbox */}
                          <div className="col-span-5 flex items-start gap-3">
                            <button
                              onClick={() => onToggleTaskComplete(task.id)}
                              aria-label={`Toggle completion for ${task.title}`}
                              className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                                task.status === 'Done'
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-[#1E60FF]'
                              }`}
                            >
                              {task.status === 'Done' && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </button>
                            <div>
                              <div
                                onClick={() => onOpenTaskModal(task)}
                                className={`text-sm font-semibold cursor-pointer hover:text-[#1E60FF] dark:hover:text-blue-400 ${
                                  task.status === 'Done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-[#0F172A] dark:text-white'
                                }`}
                              >
                                {task.title}
                              </div>
                              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-1">
                                {task.summary}
                              </p>
                            </div>
                          </div>

                          {/* Project */}
                          <div className="col-span-2 flex items-center gap-1.5 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: task.projectColor }}
                            />
                            <span className="text-xs text-[#334155] dark:text-slate-300 font-medium truncate">
                              {task.projectName}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block ${
                                task.status === 'Blocked'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : task.status === 'In progress'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : task.status === 'Done'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>

                          {/* Priority */}
                          <div className="col-span-1 text-xs">
                            {task.priority === 'High' && (
                              <span className="flex items-center gap-1 font-semibold text-rose-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> High
                              </span>
                            )}
                            {task.priority === 'Medium' && (
                              <span className="flex items-center gap-1 font-medium text-amber-600">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Medium
                              </span>
                            )}
                            {task.priority === 'Low' && (
                              <span className="flex items-center gap-1 font-medium text-emerald-600">
                                <ArrowDown className="w-3.5 h-3.5 text-emerald-500" /> Low
                              </span>
                            )}
                          </div>

                          {/* Due Date */}
                          <div className="col-span-1">
                            {task.dueCategory === 'Overdue' && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                                {task.dueDateDisplay}
                              </span>
                            )}
                            {task.dueCategory === 'Due today' && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                                Today
                              </span>
                            )}
                            {task.dueDateDisplay === 'Tomorrow' && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-600">
                                Tomorrow
                              </span>
                            )}
                            {task.dueCategory === 'Later' || (task.dueCategory === 'This week' && task.dueDateDisplay !== 'Tomorrow') ? (
                              <span className="text-xs text-[#64748B]">
                                {task.dueDateDisplay}
                              </span>
                            ) : null}
                          </div>

                          {/* Depends On */}
                          <div className="col-span-1 text-xs text-[#64748B]">
                            {task.dependsOn ? (
                              <span className="flex items-center gap-1 text-[#1E60FF] font-medium truncate" title={task.dependsOn}>
                                <ArrowRight className="w-3 h-3 shrink-0" />
                                <span className="truncate">{task.dependsOn}</span>
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>

                          {/* Owner & Overflow */}
                          <div className="col-span-1 flex items-center justify-end gap-2">
                            <img
                              src={task.ownerAvatar}
                              alt={task.ownerName}
                              title={task.ownerName}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <button 
                              onClick={() => onOpenTaskModal(task)}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 animate-fade-rise">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add new task</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct usability walkthrough"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-[#1E60FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Summary / Context</label>
                <textarea
                  rows={2}
                  placeholder="Brief note on requirements or blocker details"
                  value={newTaskSummary}
                  onChange={(e) => setNewTaskSummary(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-[#1E60FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project</label>
                  <select
                    value={newTaskProject}
                    onChange={(e) => setNewTaskProject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-[#1E60FF] outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-[#1E60FF] outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-[#1E60FF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-[#1E60FF] outline-none"
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
