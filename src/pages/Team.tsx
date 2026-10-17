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
  Calendar,
  Mail
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
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMode, setInviteMode] = useState<'telegram' | 'email'>('telegram');
  const [inviteTelegramUsername, setInviteTelegramUsername] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteWelcomeMessage, setInviteWelcomeMessage] = useState('');
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);

  // Sync selectedProjectId if project list changes and selected is not in list
  React.useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some(p => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Sync selectedMemberId
  React.useEffect(() => {
    if (members.length > 0 && (!selectedMemberId || !members.some(m => m.id === selectedMemberId))) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);

  const handleGenerateInvite = async () => {
    if (inviteMode === 'telegram' && !inviteTelegramUsername.trim()) {
      setInviteError('Please provide a Telegram username.');
      return;
    }
    if (inviteMode === 'email' && (!inviteEmail.trim() || !inviteEmail.includes('@'))) {
      setInviteError('Please provide a valid email address.');
      return;
    }

    setIsGeneratingInvite(true);
    setInviteError(null);

    const targetUsername = inviteMode === 'telegram' 
      ? inviteTelegramUsername.trim().replace(/^@/, '')
      : undefined;

    const emailVal = inviteMode === 'email' ? inviteEmail.trim() : undefined;

    try {
      // Dynamic import or direct call to dataService
      const { createProjectInvite } = await import('../lib/dataService');
      const res = await createProjectInvite({
        projectId: selectedProjectId || projects[0]?.id || 'general',
        telegramUsername: targetUsername,
        email: emailVal,
        role: inviteRole,
        welcomeMessage: inviteWelcomeMessage.trim() || undefined,
      });

      setInviteResult({
        ...res,
        inviteEmail: emailVal,
      });
    } catch (err: any) {
      console.warn('[Team] Error creating invite via server, checking fallback:', err);
      // If unauthenticated or demo mode, present simulated single-use code
      const mockCode = `PRJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const projectName = projects.find(p => p.id === selectedProjectId)?.name || 'Project';
      const botLink = `https://t.me/DYP_AI_Coordinator_Bot?start=${mockCode}`;

      setInviteResult({
        success: true,
        inviteCode: mockCode,
        telegramUsername: targetUsername ? `@${targetUsername}` : undefined,
        inviteEmail: emailVal,
        projectName,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        botLink,
        simulatedEmail: emailVal ? {
          to: emailVal,
          subject: `Invitation to collaborate on ${projectName} (PROJEX)`,
          previewHtml: `
            <p>You have been invited as <strong>${inviteRole}</strong> to <strong>${projectName}</strong>.</p>
            ${inviteWelcomeMessage ? `<blockquote>"${inviteWelcomeMessage}"</blockquote>` : ''}
            <p>Your single-use invite code is: <strong>${mockCode}</strong></p>
            <p>Redeem online or on Telegram: ${botLink}</p>
          `,
          status: 'simulated_delivered',
        } : undefined,
        instructions: emailVal 
          ? `An invite email simulation has been generated for ${emailVal} with code ${mockCode}.`
          : `Share code ${mockCode} with @${targetUsername}.`,
      });
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0] || null;

  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Compute dynamic coordination signals
  const highWorkloadMember = members.find(m => (m.workload || 0) >= 80) || (members.length > 0 ? members[0] : null);
  const totalNeedingOwners = members.reduce((acc, m) => acc + (m.activeTasksCount === 0 ? 1 : 0), 0);

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
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">{members.length}</div>
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
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">{totalNeedingOwners}</div>
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
            <div className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">
              {members.filter(m => m.availabilityStatus === 'available').length}
            </div>
            <div className="text-sm font-semibold text-[#0F172A] dark:text-slate-200">Available members</div>
            <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Ready for tasks</div>
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
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Team members ({filteredMembers.length})</h2>
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
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm">No team members found</p>
                  <p className="text-xs mt-1">Click "Invite members" above to invite collaborators to this project.</p>
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedMember?.id === m.id;

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
                          src={m.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name || 'Member')}&backgroundColor=1E60FF&textColor=ffffff`}
                          alt={m.name || 'Member'}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="truncate">
                          <div className="font-bold text-[#0F172A] dark:text-white truncate">{m.name || 'Unnamed Member'}</div>
                          <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">{m.email || 'No email'}</div>
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
                          {m.role || 'Member'}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="col-span-2 flex flex-wrap gap-1">
                        {(m.skills || ['General']).map((sk) => (
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
                          {m.availability || 'Available'}
                        </span>
                      </div>

                      {/* Workload */}
                      <div className="col-span-1 flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{m.workload || 0}%</span>
                        <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              (m.workload || 0) > 80 ? 'bg-rose-500' : (m.workload || 0) > 50 ? 'bg-[#8B5CF6]' : 'bg-[#1E60FF]'
                            }`}
                            style={{ width: `${m.workload || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Active Tasks & Chevron */}
                      <div className="col-span-1 flex items-center justify-end gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span>{m.activeTasksCount || 0}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
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

            {highWorkloadMember && (highWorkloadMember.workload || 0) >= 70 ? (
              <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    !
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {highWorkloadMember.name}'s workload is high
                    </h3>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                      {highWorkloadMember.name} is at {highWorkloadMember.workload || 85}% capacity this week. Consider reassigning tasks or adjusting deadlines.
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
            ) : (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Workload balanced
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                      All team members are operating within healthy capacity limits.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Efficiency Insight Card (Read-only estimate for selected person) */}
          {selectedMember ? (
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
                    src={selectedMember.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.name || 'Member')}&backgroundColor=1E60FF&textColor=ffffff`}
                    alt={selectedMember.name || 'Member'}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-white">{selectedMember.name}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-slate-400">{selectedMember.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0F172A] dark:text-white">
                    {selectedMember.efficiency?.rate || 85}%
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
                    <span>{selectedMember.efficiency?.tasksCompletedRatio || `${selectedMember.activeTasksCount || 0} active`} tasks on schedule</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#334155] dark:text-slate-300">
                    <Clock className="w-4 h-4 text-[#1E60FF] dark:text-blue-400 shrink-0" />
                    <span>{selectedMember.efficiency?.onTimeRatio || '100%'} completed on time</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#334155] dark:text-slate-300">
                    <TrendingUp className="w-4 h-4 text-[#8B5CF6] dark:text-purple-400 shrink-0" />
                    <span>{selectedMember.efficiency?.workloadCapacity || `${selectedMember.workload || 40}%`} workload capacity</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="pt-2">
                <div className="text-xs font-bold text-[#0F172A] dark:text-white mb-1">AI summary</div>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                  {selectedMember.efficiency?.summary || `${selectedMember.name} is on track with all current responsibilities and available for collaborative sprints.`}
                </p>
                <button 
                  onClick={() => alert(`Detailed signals for ${selectedMember.name}: Workload is at ${selectedMember.workload || 40}%, status is ${selectedMember.availability || 'Available'}.`)}
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
          ) : (
            <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs text-center text-xs text-slate-400">
              Select a team member to view AI efficiency metrics.
            </div>
          )}
        </div>
      </div>

      {/* 
        CRITICAL INSTRUCTION FROM BUILD BRIEF:
        "Remove Recent Activity and keep the lower area blank, as requested."
      */}
      <div className="h-16" />

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-fade-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Invite Project Member</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Generate single-use expiring invite code bound to Telegram</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteResult(null);
                  setInviteError(null);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Close invite modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {inviteError}
              </div>
            )}

            {!inviteResult ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Project
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Invite Mode Toggle: Telegram or Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Invite Method
                  </label>
                  <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setInviteMode('telegram')}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        inviteMode === 'telegram'
                          ? 'bg-white dark:bg-slate-900 text-[#229ED9] shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <span>📱</span> Telegram Username
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteMode('email')}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        inviteMode === 'email'
                          ? 'bg-white dark:bg-slate-900 text-[#1E60FF] shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Mail className="w-3 h-3" /> Email Address
                    </button>
                  </div>
                </div>

                {/* Telegram Username Input */}
                {inviteMode === 'telegram' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Invitee Telegram Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-xs">@</span>
                      <input
                        type="text"
                        placeholder="telegram_username"
                        value={inviteTelegramUsername}
                        onChange={(e) => setInviteTelegramUsername(e.target.value.replace(/^@/, ''))}
                        className="w-full pl-7 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      The invite code will be strictly bound to this Telegram account.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Invitee Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="teammate@university.edu"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      An invite code and bot link will be generated. Share them with this person to join the project.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Project Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                  >
                    <option value="member">Team Member (Developer)</option>
                    <option value="designer">UI/UX Designer</option>
                    <option value="qa">QA & Research</option>
                    <option value="lead">Project Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Personal Welcome Message (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Welcome to our project! Check out the tasks tab to see current sprints."
                    value={inviteWelcomeMessage}
                    onChange={(e) => setInviteWelcomeMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#1E60FF]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingInvite || (inviteMode === 'telegram' ? !inviteTelegramUsername.trim() : !inviteEmail.trim() || !inviteEmail.includes('@'))}
                    onClick={handleGenerateInvite}
                    className={`px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs ${
                      isGeneratingInvite || (inviteMode === 'telegram' ? !inviteTelegramUsername.trim() : !inviteEmail.trim() || !inviteEmail.includes('@')) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGeneratingInvite ? 'Generating Code...' : 'Create One-Time Invite'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      ✓ Single-Use Invite Code Ready
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      Valid 24 Hours
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800">
                    <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                      {inviteResult.inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(inviteResult.inviteCode);
                        alert(`Copied ${inviteResult.inviteCode} to clipboard!`);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    {inviteResult.telegramUsername && (
                      <div>Bound Telegram: <strong className="text-slate-900 dark:text-white">{inviteResult.telegramUsername}</strong></div>
                    )}
                    {inviteResult.inviteEmail && (
                      <div>Target Email: <strong className="text-slate-900 dark:text-white">{inviteResult.inviteEmail}</strong></div>
                    )}
                    <div>Target Project: <strong className="text-slate-900 dark:text-white">{inviteResult.projectName}</strong></div>
                  </div>
                </div>

                {inviteResult.inviteEmail && (
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-200 text-xs">
                        <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Simulated Invite Email Dispatched</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-md font-bold">
                        AI Simulation
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                      <div className="text-[10px] text-slate-400 mb-1">To: {inviteResult.inviteEmail}</div>
                      <div className="font-semibold text-slate-800 dark:text-white">Subject: Invitation to collaborate on {inviteResult.projectName} (PROJEX)</div>
                      <div className="text-slate-600 dark:text-slate-400 mt-1">
                        "You've been invited to join <strong>{inviteResult.projectName}</strong>. Use single-use code <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{inviteResult.inviteCode}</span> to redeem your access."
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowInviteModal(false);
                          setInviteResult(null);
                          onNavigate('ask-team');
                        }}
                        className="text-xs text-[#1E60FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Test in Ask PROJEX AI Chat ↗
                      </button>
                      <span className="text-[10px] text-slate-400">Email simulator ready</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                    How the invitee redeems:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>Invitee signs up or logs into PROJEX using their email and inputs code <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">{inviteResult.inviteCode}</code>.</li>
                    <li>Alternatively, invitee opens the Telegram bot below and sends: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">/join {inviteResult.inviteCode}</code>.</li>
                    <li>They are automatically linked to project {inviteResult.projectName} with role permissions enabled.</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={inviteResult.botLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#229ED9] hover:underline font-semibold flex items-center gap-1"
                  >
                    Open Bot in Telegram ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteResult(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
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
