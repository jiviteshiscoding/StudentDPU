import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  X, 
  ArrowRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { TeamMember, Project } from '../types';

interface TeamProps {
  members: TeamMember[];
  projects: Project[];
  onNavigate: (screen: string) => void;
}

export const Team: React.FC<TeamProps> = ({
  members,
  projects,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'campus-events');
  // Default selected member for efficiency card is Daniel Kim as in screenshot
  const [selectedMemberId, setSelectedMemberId] = useState<string>('member-daniel');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[2];

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Breadcrumb */}
      <div className="text-xs font-medium text-[#64748B] dark:text-slate-400">Team</div>

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1E60FF] flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">Team</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-normal">
              People, roles, and availability across your projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Project dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-2 font-medium dark:text-slate-200"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Invite Members button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Invite members</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Team Members */}
        <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center text-[#1E60FF] dark:text-blue-400 shrink-0">
            <Users className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">5</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Team members</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Across all project roles</div>
          </div>
        </div>

        {/* Tasks Needing Owners */}
        <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/60 flex items-center justify-center text-[#F59E0B] dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">2</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Tasks needing owners</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Require assignment</div>
          </div>
        </div>

        {/* Availability Update */}
        <div className="bg-white dark:bg-[#0D131F] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 flex items-center justify-center text-[#1E60FF] dark:text-blue-400 shrink-0">
            <Calendar className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">1</div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Availability update</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">This week</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Team Members Table */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Team members</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                />
              </div>
              <button 
                aria-label="Member options"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-semibold text-[#64748B] dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Skills</div>
              <div className="col-span-2">Availability</div>
              <div className="col-span-1 text-center">Workload</div>
              <div className="col-span-1 text-right">Active tasks</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberId === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/60 dark:bg-blue-950/40' 
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Member Name & Email */}
                    <div className="col-span-4 flex items-center gap-3 truncate">
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="truncate">
                        <div className="font-bold text-[#0F172A] dark:text-white truncate">{m.name}</div>
                        <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">{m.email}</div>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block ${
                          m.role === 'Project Lead'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : m.role === 'Designer'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : m.role === 'Developer'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {m.skills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Availability */}
                    <div className="col-span-2 flex items-center gap-1.5 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          m.availabilityStatus === 'available'
                            ? 'bg-emerald-500'
                            : m.availabilityStatus === 'limited'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-[11px] text-[#334155] dark:text-slate-300 font-medium truncate">
                        {m.availability}
                      </span>
                    </div>

                    {/* Workload */}
                    <div className="col-span-1 flex items-center justify-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{m.workload}%</span>
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            m.workload > 80 ? 'bg-rose-500' : m.workload > 50 ? 'bg-[#8B5CF6]' : 'bg-[#1E60FF]'
                          }`}
                          style={{ width: `${m.workload}%` }}
                        />
                      </div>
                    </div>

                    {/* Active Tasks & Chevron */}
                    <div className="col-span-1 flex items-center justify-end gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <span>{m.activeTasksCount}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Team Coordination & AI Efficiency Insight */}
        <div className="lg:col-span-4 space-y-6">
          {/* Team Coordination Alert */}
          <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Team coordination</h2>
              </div>
              <button 
                aria-label="Coordination options"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  !
                </span>
                <div>
                  <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Daniel's workload is high
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                    Daniel Kim is at 85% capacity this week. Consider reassigning tasks or adjusting deadlines.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWorkloadModal(true)}
                className="mt-3.5 px-3.5 py-1.5 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review workload</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Efficiency Insight Card (Read-only estimate for selected person) */}
          <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">AI efficiency insight</h2>
              </div>
              <button 
                aria-label="Insight details"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Analysis Sprint Badge */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
              <span className="w-2 h-2 rounded-full bg-[#1E60FF] dark:bg-blue-400" />
              <span>AI analysis · This sprint</span>
            </div>

            {/* Selected Member Header with Efficiency Rate */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">{selectedMember.name}</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">{selectedMember.role}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-[#0F172A] dark:text-white">
                  {selectedMember.efficiency?.rate || 82}%
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-slate-400 flex items-center justify-end gap-1">
                  <span>AI estimated efficiency</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Key Signals */}
            <div>
              <div className="text-xs font-bold text-[#0F172A] dark:text-white mb-2.5">Key signals</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-[#334155] dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{selectedMember.efficiency?.tasksCompletedRatio || '4 of 5'} tasks completed</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#334155] dark:text-slate-300">
                  <Clock className="w-4 h-4 text-[#1E60FF] dark:text-blue-400 shrink-0" />
                  <span>{selectedMember.efficiency?.onTimeRatio || '3 of 4'} completed on time</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#334155] dark:text-slate-300">
                  <TrendingUp className="w-4 h-4 text-[#8B5CF6] dark:text-purple-400 shrink-0" />
                  <span>{selectedMember.efficiency?.workloadCapacity || '85%'} workload capacity</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="pt-2">
              <div className="text-xs font-bold text-[#0F172A] dark:text-white mb-1">AI summary</div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                {selectedMember.efficiency?.summary || 'Strong delivery pace; current workload may affect upcoming tasks.'}
              </p>
              <button 
                onClick={() => alert(`Detailed signals for ${selectedMember.name}: Completed 4 tasks this sprint, with average task turnaround of 1.8 days. 1 task delayed due to external API dependency. (Frontend simulation)`)}
                className="text-xs font-semibold text-[#1E60FF] dark:text-blue-400 hover:underline mt-2 flex items-center gap-1 cursor-pointer"
              >
                <span>View details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Disclaimer Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-[#94A3B8] dark:text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Estimate based on task progress, due dates, and reported availability.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        CRITICAL INSTRUCTION FROM BUILD BRIEF:
        "Remove Recent Activity and keep the lower area blank, as requested."
      */}
      <div className="h-16" />

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
              <button 
                onClick={() => setShowInviteModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close invite modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="student@projex.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                >
                  <option value="Developer" className="dark:bg-slate-900">Developer</option>
                  <option value="Designer" className="dark:bg-slate-900">UI/UX Designer</option>
                  <option value="QA & Research" className="dark:bg-slate-900">QA & Research</option>
                  <option value="Project Lead" className="dark:bg-slate-900">Project Lead</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    alert(`Invitation link created for ${inviteEmail || 'new member'}! (Frontend mock)`);
                  }}
                  className="px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Send invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workload Modal */}
      {showWorkloadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Rebalance Daniel's Workload</h3>
              <button 
                onClick={() => setShowWorkloadModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close workload modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3">
              Daniel Kim currently has 5 active tasks. AI suggests reassigning:
            </p>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-blue-900 dark:text-blue-300">Suggested Action:</div>
              <p className="text-blue-800 dark:text-blue-400">
                Reassign <strong>"Develop event management dashboard"</strong> to Priya Singh (current workload 50%).
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowWorkloadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setShowWorkloadModal(false);
                  alert('Reassignment proposal recorded. (Demo mock)');
                }}
                className="px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Apply Rebalance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
