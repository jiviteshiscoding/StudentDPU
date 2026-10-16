import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  X, 
  Plus, 
  AtSign, 
  Paperclip, 
  Smile, 
  ChevronDown, 
  Flag, 
  FileText, 
  Layers, 
  Link, 
  UserCheck, 
  Clock, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { DraftPlan, Project } from '../types';
import { MOCK_DRAFT_PLAN } from '../data/mockData';

interface CreateProjectProps {
  onNavigate: (screen: string, projectId?: string) => void;
  onApproveNewProject: (newProject: Project) => void;
}

export const CreateProject: React.FC<CreateProjectProps> = ({
  onNavigate,
  onApproveNewProject,
}) => {
  const [ideaText, setIdeaText] = useState(
    "We're building a campus event platform with event discovery, registration, and an admin dashboard. We have five team members and two weeks. We know React and Supabase, and need a demo ready for class."
  );
  const [deadline, setDeadline] = useState('May 2, 2025');
  const [tags, setTags] = useState(['React', 'Supabase', 'Student budget']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showMentionHelper, setShowMentionHelper] = useState(true);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Draft plan state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DraftPlan | null>(null);
  const [refinementInput, setRefinementInput] = useState('');
  const [refinementChangeNotice, setRefinementChangeNotice] = useState<string | null>(null);

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedPlan({ ...MOCK_DRAFT_PLAN });
    }, 600);
  };

  const handleApplyRefinement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || !generatedPlan) return;

    const lower = refinementInput.toLowerCase();
    const updated = { ...generatedPlan };

    if (lower.includes('10 days') || lower.includes('ten days')) {
      updated.schedule = [
        { milestone: 'Milestone 1: Prototype wireframes & DB schema locked', targetDate: 'Day 2' },
        { milestone: 'Milestone 2: Frontend & Backend synchronized', targetDate: 'Day 5' },
        { milestone: 'Milestone 3: Regression test & bug fixes', targetDate: 'Day 8' },
        { milestone: 'Final Submission: Classroom demo', targetDate: 'Day 10 (Apr 27, 2025)' },
      ];
      setRefinementChangeNotice('Updated schedule timeline compressed from 14 days to 10 days.');
    } else if (lower.includes('parallel') || lower.includes('concurrent')) {
      updated.phases[1].tasks[0].parallelSafe = true;
      updated.phases[1].tasks[1].parallelSafe = true;
      setRefinementChangeNotice('Configured frontend and backend tasks to run concurrently in parallel.');
    } else {
      updated.assumptions = [
        ...updated.assumptions,
        `Refinement criteria: "${refinementInput}"`
      ];
      setRefinementChangeNotice(`Applied refinement: "${refinementInput}" to draft plan constraints.`);
    }

    setGeneratedPlan(updated);
    setRefinementInput('');
  };

  const handleApproveAndCreate = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: 'Campus Events Platform',
      color: '#2563EB',
      description: ideaText,
      status: 'On track',
      progress: 0,
      dueDate: deadline,
      daysRemaining: 14,
      milestonesTotal: 3,
      milestonesCompleted: 0,
      milestonesInProgress: 1,
      milestonesUpcoming: 2,
      members: ['member-alex', 'member-maya', 'member-daniel', 'member-priya', 'member-liam'],
    };

    onApproveNewProject(newProj);
    onNavigate('project-workspace', newProj.id);
  };

  const templates = [
    { title: 'Campus Event Website', desc: 'Discovery, RSVP registrations, admin check-in' },
    { title: 'Hackathon MVP Sprint', desc: '48-hour rapid development and live demo pitch' },
    { title: 'Mobile Study Companion', desc: 'React Native, flashcards, study timer' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
        <button onClick={() => onNavigate('projects')} className="hover:text-[#1E60FF] dark:hover:text-blue-400 cursor-pointer">
          Projects
        </button>
        <span>/</span>
        <span className="text-[#0F172A] dark:text-white font-semibold">New project</span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shadow-xs">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">Create a project with PROJEX</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-normal">
            Describe your idea in your own words. PROJEX will turn it into a draft plan you can review.
          </p>
        </div>
      </div>

      {!generatedPlan ? (
        /* STAGE A & B: Natural Language Brief Creation Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Area (8 cols): Input Form */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] dark:text-white mb-2">Project idea</label>
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 focus-within:border-[#1E60FF] focus-within:ring-1 focus-within:ring-[#1E60FF] transition-all bg-white dark:bg-slate-900/60">
                <textarea
                  rows={5}
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="w-full text-sm text-[#0F172A] dark:text-slate-100 bg-transparent leading-relaxed outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Describe what you want to build, the team size, deadlines, and requirements..."
                />

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="p-1 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer" aria-label="Mention">
                      <AtSign className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer" aria-label="Attach file">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer" aria-label="Insert emoji">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{ideaText.length}/2000</span>
                </div>
              </div>
            </div>

            {/* Mention helper notification bar */}
            {showMentionHelper && (
              <div className="flex items-center justify-between p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <AtSign className="w-3.5 h-3.5 text-[#1E60FF] dark:text-blue-400" />
                  <span>Mention team members to include them in the draft plan (e.g. @Alex, @Maya)</span>
                </div>
                <button onClick={() => setShowMentionHelper(false)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Deadline & Team Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Deadline */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex items-center justify-between bg-white dark:bg-slate-900/40">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Project deadline</div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-white">{deadline}</div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Team Selector */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex items-center justify-between bg-white dark:bg-slate-900/40">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Team</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center -space-x-1">
                        <img className="w-5 h-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Member" />
                        <img className="w-5 h-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" alt="Member" />
                        <img className="w-5 h-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Member" />
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                          +2
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#0F172A] dark:text-white">5 members</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Tags / Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Project tags & tech stack</label>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label={`Remove tag ${tag}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Tag name"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-full outline-none dark:bg-slate-800 dark:text-white"
                    />
                    <button onClick={handleAddTag} className="p-1 text-[#1E60FF] dark:text-blue-400 font-bold text-xs">
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add tag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Generate Plan Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                PROJEX generates reviewable goals, phases, deliverables, and role proposals.
              </span>
              <button
                disabled={isGenerating || !ideaText.trim()}
                onClick={handleGeneratePlan}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1E60FF] hover:bg-[#1A53DE] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Analyzing brief...' : 'Generate draft plan'}</span>
              </button>
            </div>
          </div>

          {/* Right Area (4 cols): AI Capabilities & Templates */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Templates */}
            <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Start with a template</h2>
              <div className="space-y-2">
                {templates.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => setIdeaText(`Building a ${tpl.title.toLowerCase()}: ${tpl.desc}. Team of 4, two-week sprint.`)}
                    className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#0F172A] dark:text-white">{tpl.title}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{tpl.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What PROJEX will do */}
            <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">What PROJEX will create</h2>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Flag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">Goals & Deliverables</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Clear objectives and measurable milestones</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">Phases & Tasks</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Sequenced work with dependency tracking</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">Role Suggestions</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Assignments based on skills and capacity</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">Assumptions</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">What PROJEX is assuming based on your input</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">Open questions</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Things to confirm with your team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STAGE E & F: Generated Draft Plan Preview & Natural Language Refinement */
        <div className="space-y-6 animate-fade-rise">
          {/* Top Review Banner */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  DRAFT PLAN — AWAITING LEADER APPROVAL
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Review the extracted goals, deliverables, phases, dependencies, and role suggestions. You can refine with natural language or approve to activate.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-4 py-2 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100/60 dark:hover:bg-amber-900/40 cursor-pointer"
              >
                Edit Brief
              </button>
              <button
                onClick={handleApproveAndCreate}
                className="px-5 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Activate Plan</span>
              </button>
            </div>
          </div>

          {/* Refinement Notice Alert if user refined */}
          {refinementChangeNotice && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                <span>{refinementChangeNotice}</span>
              </div>
              <button onClick={() => setRefinementChangeNotice(null)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Natural Language Refinement Input Box */}
          <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-4 shadow-xs">
            <form onSubmit={handleApplyRefinement} className="flex gap-3">
              <input
                type="text"
                placeholder='Refine draft conversationally (e.g. "We only have 10 days now" or "Frontend and backend run in parallel")...'
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                className="flex-1 px-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:border-[#1E60FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Apply Refinement
              </button>
            </form>
          </div>

          {/* Structured Plan Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Goals, Phases & Deliverables */}
            <div className="lg:col-span-8 space-y-6">
              {/* Goals & Deliverables */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <span>Goals & Major Deliverables</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Primary Goals:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      {generatedPlan.goals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Key Deliverables:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      {generatedPlan.deliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Phases and Concrete Tasks */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <span>Proposed Project Phases & Task Breakdown</span>
                </h3>

                <div className="space-y-4">
                  {generatedPlan.phases.map((ph, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{ph.name}</span>
                        <span className="text-[11px] font-semibold text-[#1E60FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded">
                          {ph.duration}
                        </span>
                      </div>

                      <div className="space-y-2 mt-3">
                        {ph.tasks.map((t, tidx) => (
                          <div key={tidx} className="bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Suggested Role: <strong className="text-slate-700 dark:text-slate-300">{t.role}</strong> · Dependencies: {t.dependencies}
                              </div>
                            </div>
                            {t.parallelSafe && (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded">
                                Parallel Safe
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Suggested Roles, Schedule, Assumptions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Suggested Roles & Owners */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <span>Suggested Role Assignments</span>
                </h3>

                <div className="space-y-2.5">
                  {generatedPlan.suggestedRoles.map((sr, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{sr.suggestedPerson}</span>
                        <span className="text-[10px] text-[#1E60FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-1.5 py-0.5 rounded font-normal">
                          {sr.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{sr.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Milestones */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <span>Target Milestones</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {generatedPlan.schedule.map((sch, idx) => (
                    <div key={idx} className="p-2 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between bg-white dark:bg-slate-900/40">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{sch.milestone}</span>
                      <span className="font-bold text-[#1E60FF] dark:text-blue-400 text-[11px] shrink-0 ml-2">{sch.targetDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Open Questions */}
              <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#1E60FF] dark:text-blue-400" />
                  <span>Assumptions & Open Questions</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-lg">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Assumptions:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400 mt-1 space-y-1">
                      {generatedPlan.assumptions.map((as, i) => (
                        <li key={i}>{as}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 rounded-lg">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">Open Questions for Team:</span>
                    <ul className="list-disc list-inside text-[11px] text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                      {generatedPlan.openQuestions.map((oq, i) => (
                        <li key={i}>{oq}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
