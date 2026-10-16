import React from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Link2 
} from 'lucide-react';
import { Task, TaskStatus } from '../../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
}) => {
  if (!task) return null;

  const statuses: TaskStatus[] = ['Backlog', 'To do', 'In progress', 'Blocked', 'In Review', 'Done', 'Cancelled'];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-fade-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: task.projectColor }}
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{task.projectName}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close task details modal"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 dark:text-slate-400 font-semibold mb-1">Status</label>
            <select
              value={task.status}
              onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl font-semibold outline-none focus:border-[#1E60FF]"
            >
              {statuses.map(st => (
                <option key={st} value={st} className="dark:bg-slate-900">{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 dark:text-slate-400 font-semibold mb-1">Priority</label>
            <div className="px-3 py-1.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              {task.priority} Priority
            </div>
          </div>
        </div>

        {/* Summary Description */}
        <div>
          <label className="block text-xs text-slate-400 dark:text-slate-400 font-semibold mb-1">Summary</label>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {task.summary}
          </p>
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 dark:text-slate-400 font-semibold mb-1">Assignee</label>
            <div className="flex items-center gap-2 p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <img
                src={task.ownerAvatar}
                alt={task.ownerName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{task.ownerName}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 dark:text-slate-400 font-semibold mb-1">Due Date</label>
            <div className="flex items-center gap-2 p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{task.dueDateDisplay}</span>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        {task.dependsOn && (
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
              <Link2 className="w-3.5 h-3.5" />
              <span>Prerequisite Dependency:</span>
            </div>
            <p className="text-amber-800 dark:text-amber-400">
              This task depends on <strong>{task.dependsOn}</strong>. Completing prerequisites updates downstream readiness according to PROJEX rules.
            </p>
          </div>
        )}

        {/* Acceptance Criteria */}
        {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
          <div>
            <label className="block text-xs text-slate-400 dark:text-slate-400 font-semibold mb-1">
              Acceptance Criteria
            </label>
            <div className="space-y-1.5">
              {task.acceptanceCriteria.map((ac, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{ac}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
