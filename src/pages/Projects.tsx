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
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  teamMembers,
  onSelectProject,
  onNavigate,
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Projects</h1>
        <p className="text-sm text-[#64748B] mt-1 font-normal">
          Manage your team's work in one place.
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
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm placeholder-[#94A3B8] focus:border-[#1E60FF] focus:ring-1 focus:ring-[#1E60FF] outline-none"
            />
          </div>

          <select
            defaultValue="all"
            className="px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All categories</option>
            <option value="academic">Academic Projects</option>
            <option value="hackathon">Hackathon</option>
            <option value="campus">Campus Events</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="on track">On track</option>
            <option value="at risk">At risk</option>
            <option value="planning">Planning</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#1E60FF]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#1E60FF]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('create-project')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const memberAvatars = teamMembers.map(m => ({ name: m.name, url: m.avatarUrl }));

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Title with Dot & Overflow */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: proj.color }}
                      />
                      <h3 className="text-base font-bold text-[#0F172A] truncate">
                        {proj.name}
                      </h3>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }} 
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#64748B] line-clamp-2 min-h-[32px] leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Status Tag */}
                  <div className="mt-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        proj.status === 'On track'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : proj.status === 'At risk'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
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
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mr-3">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${proj.progress}%`,
                            backgroundColor: proj.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#0F172A] shrink-0">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Due Date & Avatars */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
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
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{proj.name}</h3>
                    <p className="text-xs text-[#64748B] line-clamp-1">{proj.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      proj.status === 'On track'
                        ? 'bg-emerald-50 text-emerald-700'
                        : proj.status === 'At risk'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {proj.status}
                  </span>

                  <div className="w-32">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${proj.progress}%`, backgroundColor: proj.color }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-[#64748B] w-28 text-right">
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
