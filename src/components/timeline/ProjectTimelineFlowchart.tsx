import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  AlertTriangle, 
  Flag, 
  ArrowRight, 
  ArrowDown, 
  Users, 
  Calendar, 
  Layers, 
  ChevronRight, 
  Info, 
  ExternalLink,
  ShieldAlert,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { Project, Task } from '../../types';

interface FlowchartTask {
  id: string;
  title: string;
  owner: string;
  status: string;
  role: string;
  parallelSafe?: boolean;
  isBlocker?: boolean;
}

interface FlowchartPhase {
  id: string;
  number: number;
  name: string;
  dateRange: string;
  status: 'completed' | 'at-risk' | 'upcoming' | string;
  statusLabel: string;
  progress: number;
  milestone: string;
  milestoneDate: string;
  dependsOn?: string;
  tasks: FlowchartTask[];
  blockerInfo?: {
    title: string;
    reason: string;
    delay: string;
  };
  description: string;
}

interface ProjectTimelineFlowchartProps {
  project: Project;
  onOpenRecoveryPlan?: () => void;
  onOpenTaskModal?: (task: Task) => void;
  tasks?: Task[];
}

export const ProjectTimelineFlowchart: React.FC<ProjectTimelineFlowchartProps> = ({
  project,
  onOpenRecoveryPlan,
  onOpenTaskModal,
  tasks = [],
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('phase-1');
  const [inspectingNode, setInspectingNode] = useState<any | null>(null);

  // Phase Definitions: dynamically constructed from project and actual tasks
  const isDemoProject = project.id === 'campus-events' || (!tasks || tasks.length === 0);

  const phases: FlowchartPhase[] = React.useMemo(() => {
    // If user has real tasks for this project, derive real phases and status
    if (tasks && tasks.length > 0) {
      const completedTasks = tasks.filter(t => t.status === 'Done');
      const inProgressTasks = tasks.filter(t => t.status === 'In progress' || t.status === 'In Review');
      const blockedTasks = tasks.filter(t => t.status === 'Blocked' || t.isRisk);
      const todoTasks = tasks.filter(t => t.status === 'To do' || t.status === 'Backlog');

      const total = tasks.length;
      const progress = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

      // Group into dynamic phases
      const p1Tasks: FlowchartTask[] = completedTasks.map(t => ({
        id: t.id,
        title: t.title,
        owner: t.ownerName || 'Member',
        status: 'Done',
        role: 'Completed',
      }));

      const p2Tasks: FlowchartTask[] = [...inProgressTasks, ...blockedTasks].map(t => ({
        id: t.id,
        title: t.title,
        owner: t.ownerName || 'Member',
        status: t.status,
        role: t.status === 'Blocked' ? 'Blocker' : 'In Progress',
        isBlocker: t.status === 'Blocked' || t.isRisk,
      }));

      const p3Tasks: FlowchartTask[] = todoTasks.map(t => ({
        id: t.id,
        title: t.title,
        owner: t.ownerName || 'Member',
        status: 'To do',
        role: 'Upcoming',
      }));

      return [
        {
          id: 'phase-1',
          number: 1,
          name: 'Completed Sprints',
          dateRange: 'Recent',
          status: completedTasks.length > 0 ? 'completed' : 'upcoming',
          statusLabel: completedTasks.length > 0 ? 'Completed' : 'Pending',
          progress: completedTasks.length > 0 ? 100 : 0,
          milestone: completedTasks[0]?.title || 'Foundation Milestones',
          milestoneDate: completedTasks[0]?.dueDateDisplay || 'Completed',
          tasks: p1Tasks.length > 0 ? p1Tasks.slice(0, 4) : [{ id: 'none-1', title: 'No completed tasks yet', owner: 'Team', status: 'To do', role: 'Pending' }],
          description: `${completedTasks.length} task(s) completed successfully.`,
        },
        {
          id: 'phase-2',
          number: 2,
          name: 'Active Sprint & Execution',
          dateRange: 'Current',
          status: blockedTasks.length > 0 ? 'at-risk' : inProgressTasks.length > 0 ? 'in-progress' : 'upcoming',
          statusLabel: blockedTasks.length > 0 ? 'At Risk · In Progress' : inProgressTasks.length > 0 ? 'In Progress' : 'Planned',
          progress: progress,
          milestone: blockedTasks[0]?.title || inProgressTasks[0]?.title || 'Core Deliverables',
          milestoneDate: project.dueDate || 'Active',
          tasks: p2Tasks.length > 0 ? p2Tasks.slice(0, 5) : [{ id: 'none-2', title: 'No active tasks in progress', owner: 'Team', status: 'To do', role: 'Ready' }],
          blockerInfo: blockedTasks.length > 0 ? {
            title: blockedTasks[0].title,
            reason: blockedTasks[0].summary || 'Task flagged as blocked. Requires immediate team review.',
            delay: 'Needs unblocking',
          } : undefined,
          description: 'Current tasks actively being worked on by the team.',
        },
        {
          id: 'phase-3',
          number: 3,
          name: 'Upcoming Delivery & Milestones',
          dateRange: project.dueDate || 'Upcoming',
          status: 'upcoming',
          statusLabel: 'Upcoming',
          progress: 0,
          milestone: todoTasks[0]?.title || 'Final Project Hand-off',
          milestoneDate: project.dueDate || 'Flexible',
          dependsOn: 'phase-2',
          tasks: p3Tasks.length > 0 ? p3Tasks.slice(0, 4) : [{ id: 'none-3', title: 'All planned tasks are scheduled', owner: 'Team', status: 'To do', role: 'Pending' }],
          description: 'Scheduled milestones and backlog tasks queued for upcoming sprints.',
        },
      ];
    }

    // Default template for empty demo state (without false critical blocker)
    return [
      {
        id: 'phase-1',
        number: 1,
        name: 'Sprint Planning & Setup',
        dateRange: 'Sprint 01',
        status: 'completed',
        statusLabel: 'Completed',
        progress: 100,
        milestone: 'Workspace initialized',
        milestoneDate: 'Setup',
        tasks: [
          { id: 't1-1', title: 'Project created & team invited', owner: 'You', status: 'Done', role: 'Lead' },
        ],
        description: 'Initial project setup and repository workspace configuration.',
      },
      {
        id: 'phase-2',
        number: 2,
        name: 'Sprint Execution',
        dateRange: 'Current',
        status: 'in-progress',
        statusLabel: 'In Progress',
        progress: 50,
        milestone: 'First Deliverable',
        milestoneDate: project.dueDate || 'Flexible',
        tasks: [
          { id: 't2-1', title: 'Define tasks and assign owners', owner: 'Team', status: 'In progress', role: 'Developer' },
        ],
        description: 'Add new tasks in the board tab to populate this timeline.',
      },
      {
        id: 'phase-3',
        number: 3,
        name: 'Review & Submission',
        dateRange: project.dueDate || 'Upcoming',
        status: 'upcoming',
        statusLabel: 'Upcoming',
        progress: 0,
        milestone: 'Final Project Demo',
        milestoneDate: project.dueDate || 'Upcoming',
        dependsOn: 'phase-2',
        tasks: [
          { id: 't3-1', title: 'Final project review & showcase', owner: 'Team', status: 'To do', role: 'Review' },
        ],
        description: 'Sprint wrap-up and final demo delivery.',
      },
    ];
  }, [project, tasks]);

  return (
    <div className="space-y-6">
      {/* Flowchart Control Header & Legend */}
      <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Project Schedule Flowchart
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sequence, dependencies, critical paths, and milestone deadlines at a glance.
            </p>
          </div>

          {/* Current Date Beacon */}
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#1E60FF] animate-pulse" />
            <span className="font-bold text-[#1E60FF] dark:text-blue-400">Current Day: Apr 17, 2025</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">(14 days until due)</span>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Legend:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E60FF]" />
            <span>In progress</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950" />
            <span className="font-semibold text-rose-600 dark:text-rose-400">At risk / Blocked</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Upcoming</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flag className="w-3 h-3 text-[#1E60FF]" />
            <span>Milestone Marker</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>Dependency Flow</span>
          </div>
        </div>
      </div>

      {/* DESKTOP FLOWCHART VIEW (Large Screens) */}
      <div className="hidden lg:block bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-xs relative overflow-hidden">
        {/* Directional Flow Grid */}
        <div className="grid grid-cols-3 gap-6 relative items-start">
          {phases.map((ph, idx) => {
            const isCompleted = ph.status === 'completed';
            const isAtRisk = ph.status === 'at-risk';
            const isUpcoming = ph.status === 'upcoming';
            const isSelected = selectedPhaseId === ph.id;

            return (
              <div key={ph.id} className="relative flex flex-col space-y-4">
                {/* Arrow Connector to next phase */}
                {idx < phases.length - 1 && (
                  <div className="absolute -right-3.5 top-12 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Phase Main Card */}
                <div
                  onClick={() => setSelectedPhaseId(ph.id)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer space-y-3 relative ${
                    isAtRisk
                      ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs ring-1 ring-rose-300/40'
                      : isCompleted
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 shadow-xs'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  } ${isSelected ? 'ring-2 ring-[#1E60FF]' : 'hover:border-blue-300 dark:hover:border-blue-700'}`}
                >
                  {/* Top Phase Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isAtRisk
                          ? 'bg-[#1E60FF] text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : ph.number}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Phase 0{ph.number}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {ph.name}
                        </h3>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                        : isAtRisk
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {ph.statusLabel}
                    </span>
                  </div>

                  {/* Date range & Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{ph.dateRange}</span>
                      <span className="font-semibold">{ph.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? 'bg-emerald-500' : isAtRisk ? 'bg-amber-500' : 'bg-[#1E60FF]'
                        }`}
                        style={{ width: `${ph.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestone Banner */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                    isCompleted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200/60 text-emerald-800 dark:text-emerald-300'
                      : isAtRisk
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Flag className={`w-3.5 h-3.5 shrink-0 ${
                      isCompleted ? 'text-emerald-600' : isAtRisk ? 'text-amber-600' : 'text-slate-400'
                    }`} />
                    <div className="truncate">
                      <span className="font-semibold truncate block">{ph.milestone}</span>
                      <span className="text-[10px] text-slate-400 block">{ph.milestoneDate}</span>
                    </div>
                  </div>

                  {/* Tasks Breakdown list in phase */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Subtasks & Dependencies:
                    </span>
                    {ph.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingNode(task);
                        }}
                        className={`p-2 rounded-xl text-xs border transition-all flex items-center justify-between ${
                          task.isBlocker
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                            : task.status === 'Done'
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {task.isBlocker ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : task.status === 'Done' ? (
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <span className="truncate font-medium">{task.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {task.owner}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Critical Blocker Alert on Phase 2 */}
                  {ph.blockerInfo && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
                      <div className="flex items-start gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                        <span>Critical Blocker: {ph.blockerInfo.title}</span>
                      </div>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-tight">
                        {ph.blockerInfo.reason}
                      </p>
                      {onOpenRecoveryPlan && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRecoveryPlan();
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Inspect Recovery Options</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 'Today' Vertical Flow Anchor Bar */}
        <div 
          className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
          style={{ left: '65%' }}
        >
          <div className="w-0.5 h-full bg-[#1E60FF]/40 border-r border-dashed border-[#1E60FF]" />
          <div className="absolute top-2 -translate-x-1/2 bg-[#1E60FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Today (Apr 17)</span>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET VERTICAL TIMELINE FLOWCHART */}
      <div className="lg:hidden bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs space-y-6">
        <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {phases.map((ph, idx) => {
            const isCompleted = ph.status === 'completed';
            const isAtRisk = ph.status === 'at-risk';

            return (
              <div key={ph.id} className="relative space-y-3">
                {/* Node icon along the vertical rail */}
                <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[10px] shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isAtRisk
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : ph.number}
                </div>

                {/* Mobile Phase Card */}
                <div className={`p-4 rounded-2xl border ${
                  isAtRisk
                    ? 'bg-rose-50/30 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                    : isCompleted
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                    : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phase 0{ph.number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700' : isAtRisk ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ph.statusLabel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ph.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {ph.dateRange}
                  </div>

                  {/* Tasks List */}
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    {ph.tasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 truncate">
                          {t.isBlocker ? (
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          ) : t.status === 'Done' ? (
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <span className="truncate">{t.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 ml-2">{t.owner}</span>
                      </div>
                    ))}
                  </div>

                  {/* Blocker Callout */}
                  {ph.blockerInfo && (
                    <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1.5 text-xs">
                      <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Critical Blocker</span>
                      </div>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        {ph.blockerInfo.reason}
                      </p>
                      {onOpenRecoveryPlan && (
                        <button
                          type="button"
                          onClick={onOpenRecoveryPlan}
                          className="mt-1 w-full py-1.5 bg-rose-600 text-white rounded-lg font-semibold text-xs"
                        >
                          Review Recovery Options
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
