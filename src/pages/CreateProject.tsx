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
      description: ideaText.slice(0, 100) + '...',
      status: 'On track',
      progress: 0,
      dueDate: deadline,
      milestonesTotal: 4,
      milestonesCompleted: 0,
      milestonesInProgress: 1,
      milestonesUpcoming: 3,
      members: ['member-alex', 'member-maya', 'member-daniel', 'member-priya', 'member-jamie'],
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
        <button onClick={() => onNavigate('projects')} className="hover:text-[#1E60FF] cursor-pointer">
          Projects
        </button>
        <span>/</span>
        <span className="text-[#0F172A] font-semibold">New project</span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shadow-xs">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Create a project with Orbit</h1>
          <p className="text-sm text-[#64748B] mt-0.5 font-normal">
            Describe your idea in your own words. Orbit will turn it into a draft plan you can review.
          </p>
        </div>
      </div>

      {!generatedPlan ? (
        /* STAGE A & B: Natural Language Brief Creation Form (Matches Create project.png) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Area (8 cols): Input Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Project idea</label>
              <div className="border border-slate-200 rounded-2xl p-4 focus-within:border-[#1E60FF] focus-within:ring-1 focus-within:ring-[#1E60FF] transition-all">
                <textarea
                  rows={5}
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="w-full text-sm text-[#0F172A] leading-relaxed outline-none resize-none"
                  placeholder="Describe what you want to build, the team size, deadlines, and requirements..."
                />

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <button type="button" className="p-1 hover:text-slate-700 cursor-pointer">
                      <AtSign className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-700 cursor-pointer">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-700 cursor-pointer">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">{ideaText.length}/2000</span>
                </div>
              </div>
            </div>

            {/* Mention helper notification bar */}
            {showMentionHelper && (
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800">
                <div className="flex items-center gap-2">
                  <AtSign className="w-3.5 h-3.5 text-[#1E60FF]" />
                  <span>Mention team members to include them in the draft plan (e.g. @Alex, @Maya)</span>
                </div>
                <button onClick={() => setShowMentionHelper(false)} className="text-blue-500 hover:text-blue-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Deadline & Team Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Deadline */}
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#1E60FF]" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Project deadline</div>
                    <div className="text-xs font-bold text-[#0F172A]">{deadline}</div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Team Selector */}
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#1E60FF]" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Team</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center -space-x-1">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" alt="1" />
                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" alt="2" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" alt="3" />
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" alt="4" />
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" className="w-5 h-5 rounded-full object-cover ring-1 ring-white" alt="5" />
                      </div>
                      <span className="text-xs font-bold text-[#0F172A]">5 members</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Tools & Constraints */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] mb-2">
                <span className="text-slate-400">🛠</span>
                <span>Tools & constraints</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] text-[#1E60FF] text-xs font-medium rounded-lg border border-[#BFDBFE]"
                  >
                    <span>{tg}</span>
                    <button onClick={() => handleRemoveTag(tg)} className="hover:text-blue-800 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="e.g. Free tier only"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="px-2.5 py-1 text-xs border border-blue-400 rounded-lg outline-none w-32"
                      autoFocus
                    />
                    <button onClick={handleAddTag} className="text-xs font-bold text-[#1E60FF] px-1 cursor-pointer">
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-dashed border-slate-300 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add details</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  disabled={isGenerating}
                  onClick={handleGeneratePlan}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E60FF] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Analyzing brief...' : 'Generate draft plan'}</span>
                </button>

                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Start from a template</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showTemplateMenu && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                      {templates.map((tpl) => (
                        <button
                          key={tpl.title}
                          onClick={() => {
                            setIdeaText(`We are developing a ${tpl.title.toLowerCase()} with ${tpl.desc.toLowerCase()}. Team of 5 students, 2 week turnaround.`);
                            setShowTemplateMenu(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="text-xs font-bold text-slate-900">{tpl.title}</div>
                          <div className="text-[11px] text-slate-500">{tpl.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 font-normal">
                Nothing is assigned until you review and approve the plan.
              </p>
            </div>
          </div>

          {/* Right Area (4 cols): Orbit Will Identify Panel (Direct match to Create project.png) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1E60FF]" />
              <h2 className="text-base font-bold text-[#0F172A]">Orbit will identify</h2>
            </div>
            <p className="text-xs text-[#64748B]">
              Based on your description, Orbit will generate a draft plan including:
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Flag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Goals</div>
                  <div className="text-[11px] text-[#64748B]">Clear objectives for your project</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E60FF] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Key deliverables</div>
                  <div className="text-[11px] text-[#64748B]">Major outputs and milestones</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Project phases</div>
                  <div className="text-[11px] text-[#64748B]">A step-by-step plan with timelines</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Link className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Dependencies</div>
                  <div className="text-[11px] text-[#64748B]">What needs to happen and in what order</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Suggested roles</div>
                  <div className="text-[11px] text-[#64748B]">How to divide work across your team</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Schedule</div>
                  <div className="text-[11px] text-[#64748B]">A timeline for the next two weeks</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Assumptions</div>
                  <div className="text-[11px] text-[#64748B]">What Orbit is assuming based on your input</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Open questions</div>
                  <div className="text-[11px] text-[#64748B]">Things to confirm with your team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STAGE E & F: Generated Draft Plan Preview & Natural Language Refinement */
        <div className="space-y-6 animate-in fade-in">
          {/* Top Review Banner */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  DRAFT PLAN — AWAITING LEADER APPROVAL
                </span>
                <p className="text-xs text-amber-700 mt-0.5">
                  Review the extracted goals, deliverables, phases, dependencies, and role suggestions. You can refine with natural language or approve to activate.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="px-4 py-2 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold hover:bg-amber-100/60 cursor-pointer"
              >
                Edit Brief
              </button>
              <button
                onClick={handleApproveAndCreate}
                className="px-5 py-2 bg-[#1E60FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Activate Plan</span>
              </button>
            </div>
          </div>

          {/* Refinement Notice Alert if user refined */}
          {refinementChangeNotice && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E60FF]" />
                <span>{refinementChangeNotice}</span>
              </div>
              <button onClick={() => setRefinementChangeNotice(null)} className="text-blue-500 hover:text-blue-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Natural Language Refinement Input Box */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
            <form onSubmit={handleApplyRefinement} className="flex gap-3">
              <input
                type="text"
                placeholder='Refine draft conversationally (e.g. "We only have 10 days now" or "Frontend and backend run in parallel")...'
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#1E60FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E60FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
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
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-[#1E60FF]" />
                  <span>Goals & Major Deliverables</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800">Primary Goals:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {generatedPlan.goals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800">Key Deliverables:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {generatedPlan.deliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Phases and Concrete Tasks */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1E60FF]" />
                  <span>Proposed Project Phases & Task Breakdown</span>
                </h3>

                <div className="space-y-4">
                  {generatedPlan.phases.map((ph, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{ph.name}</span>
                        <span className="text-[11px] font-semibold text-[#1E60FF] bg-blue-50 px-2 py-0.5 rounded">
                          {ph.duration}
                        </span>
                      </div>

                      <div className="space-y-2 mt-3">
                        {ph.tasks.map((t, tidx) => (
                          <div key={tidx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-slate-800">{t.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Suggested Role: <strong className="text-slate-700">{t.role}</strong> · Dependencies: {t.dependencies}
                              </div>
                            </div>
                            {t.parallelSafe && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
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
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#1E60FF]" />
                  <span>Suggested Role Assignments</span>
                </h3>

                <div className="space-y-2.5">
                  {generatedPlan.suggestedRoles.map((sr, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{sr.suggestedPerson}</span>
                        <span className="text-[10px] text-[#1E60FF] bg-blue-50 px-1.5 py-0.5 rounded font-normal">
                          {sr.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{sr.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Milestones */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1E60FF]" />
                  <span>Target Milestones</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {generatedPlan.schedule.map((sch, idx) => (
                    <div key={idx} className="p-2 border border-slate-100 rounded-lg flex items-center justify-between">
                      <span className="font-medium text-slate-700">{sch.milestone}</span>
                      <span className="font-bold text-[#1E60FF] text-[11px] shrink-0 ml-2">{sch.targetDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Open Questions */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#1E60FF]" />
                  <span>Assumptions & Open Questions</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-700">Assumptions:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 mt-1 space-y-1">
                      {generatedPlan.assumptions.map((as, i) => (
                        <li key={i}>{as}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-lg">
                    <span className="font-semibold text-amber-900">Open Questions for Team:</span>
                    <ul className="list-disc list-inside text-[11px] text-amber-700 mt-1 space-y-1">
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
