import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  Plus, 
  Calendar, 
  MoreHorizontal 
} from 'lucide-react';
import { Project, TeamMember } from '../types';
import { AvatarGroup } from '../components/common/AvatarGroup';

interface ProjectsProps {
  projects: Project[];
  teamMembers: TeamMember[];
  onSelectProject: (projectId: string) => void;
  onNavigate: (screen: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  teamMembers,
  onSelectProject,
  onNavigate,
  isLoading = false,
  errorMessage = null,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">Projects</h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 font-normal">
          Manage your team's work across all coordinated initiatives.
        </p>
      </div>

      {/* Control Bar: Search, Category, Status, Grid/List, New Project */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-[#94A3B8] focus:border-[#1E60FF] focus:ring-1 focus:ring-[#1E60FF] outline-none"
            />
          </div>

          <select
            defaultValue="all"
            className="px-3.5 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#334155] dark:text-slate-200 focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All categories</option>
            <option value="academic">Academic Projects</option>
            <option value="hackathon">Hackathon</option>
            <option value="campus">Campus Events</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#334155] dark:text-slate-200 focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="on track">On track</option>
            <option value="at risk">At risk</option>
            <option value="planning">Planning</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-[#F1F5F9] dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-[#1E60FF] dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-[#1E60FF] dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('create-project')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          <p className="font-bold">Unable to load projects from Supabase</p>
          <p className="mt-0.5">{errorMessage}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any accessible projects matching your search criteria. Create a new project to get started.
          </p>
          <button
            onClick={() => onNavigate('create-project')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create project</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const memberAvatars = teamMembers.map(m => ({ name: m.name, url: m.avatarUrl }));

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Title with Dot & Overflow */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: proj.color }}
                      />
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-white truncate">
                        {proj.name}
                      </h3>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }} 
                      aria-label="Project actions"
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Status Tag */}
                  <div className="mt-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        proj.status === 'On track'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60'
                          : proj.status === 'At risk'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          proj.status === 'On track'
                            ? 'bg-emerald-500'
                            : proj.status === 'At risk'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      {proj.status}
                    </span>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 mb-1.5">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mr-3">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${proj.progress}%`,
                            backgroundColor: proj.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 shrink-0">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Due Date & Avatars */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due {proj.dueDate}</span>
                  </div>

                  <AvatarGroup avatars={memberAvatars} max={3} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: proj.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{proj.name}</h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-1">{proj.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      proj.status === 'On track'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : proj.status === 'At risk'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {proj.status}
                  </span>

                  <div className="w-32">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${proj.progress}%`, backgroundColor: proj.color }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-[#64748B] dark:text-slate-400 w-28 text-right">
                    Due {proj.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
