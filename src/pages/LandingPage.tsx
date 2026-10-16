import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  FolderKanban, 
  MessageSquare, 
  ShieldCheck, 
  Layers, 
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

import { ProjexLogo } from '../components/common/ProjexLogo';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  isDark,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#0B0F19]/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ProjexLogo variant="mark" size={36} animated={false} className="text-[#1E60FF]" />
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight font-sans text-slate-900 dark:text-white">PROJEX</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#1E60FF] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Prototype v1.0
              </span>
            </div>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onSignIn}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 cursor-pointer"
            >
              Sign in
            </button>

            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold text-[#1E60FF] dark:text-blue-400 mb-6 animate-fade-rise">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Coordination for Student & Team Projects</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none text-slate-900 dark:text-white animate-fade-rise">
            Turn informal ideas into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E60FF] to-[#38BDF8]">
              coordinated team success.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed animate-fade-rise animate-delay-1">
            PROJEX combines project boards, task tracking, member workload balancing, shared deliverables, and conversational AI coordination in one unified workspace.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-rise animate-delay-2">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Prototype Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign in to your team</span>
            </button>
          </div>

          {/* Prototype disclaimer pill */}
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Interactive Frontend Prototype · No backend account required · Real integrations simulated</span>
          </div>

          {/* Coordinated Project Work Visual Representation */}
          <div className="mt-14 max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-left relative overflow-hidden transition-all">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-2">PROJEX Workspace Coordinate</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#1E60FF] animate-pulse" />
                <span>AI Coordinator Active</span>
              </div>
            </div>

            {/* Grid of sample cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {/* Card 1: Workflow Architect */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#1E60FF] flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#1E60FF] dark:text-blue-300">
                    Workflow
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Workflow Architect</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Turn informal briefs into phased, dependency-aware plans ready for leader review and approval.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-[#1E60FF] flex items-center gap-1">
                  <span>Structured milestone plan</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Card 2: Conversational Coordination */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300">
                    Ask PROJEX
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Natural Language Updates</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Report progress or blockers conversationally. PROJEX updates local tasks and identifies dependency risks.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <span>Mentions & draft confirmation</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Card 3: Team & Workload */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
                    Balance
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workload Intelligence</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Map declared skills, observe capacity signals, and balance active assignments with AI efficiency insights.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>Balanced assignment distribution</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="bg-slate-100/70 dark:bg-slate-900/40 py-16 border-y border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Everything required for seamless project execution
              </h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Designed specifically for student groups, hackathon squads, and collaborative project teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] flex items-center justify-center mb-4">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Projects & Boards</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Color-coded projects with overview metrics, phases, board view, timeline view, and project-scoped files.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Dependency Awareness</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Completing a prerequisite unblocks downstream tasks without false completion claims. Respects project flow.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Shared File Library</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Centralized deliverables, project folders, and mock local file uploads for tracking course assets.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Leader Audit Trail</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Role-protected Activity history shows chronological events, team updates, and approvals for team leads.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Architecture Disclaimer Note */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-6 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
              <Sparkles className="w-4 h-4 text-[#1E60FF]" />
              <span>Architecture & Prototype Scope Notice</span>
            </div>
            <p>
              External messaging (Telegram, Discord, WhatsApp) and automated calendar invites shown in this prototype require connected API services in production. In this prototype, all actions are safely simulated client-side to demonstrate the coordination UX without sending unauthorized communications.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-[#0B0F19] transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">PROJEX</span>
            <span>— AI Group Project Coordinator</span>
          </div>
          <div>
            Frontend Prototype · Built with React, Vite & TypeScript
          </div>
        </div>
      </footer>
    </div>
  );
};
