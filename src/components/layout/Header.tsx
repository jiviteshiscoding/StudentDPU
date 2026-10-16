import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Check, 
  Shield, 
  User, 
  Plus, 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  LogOut,
  MoreVertical,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { TeamMember } from '../../types';

interface HeaderProps {
  currentUser: TeamMember;
  isLeader: boolean;
  onToggleRole: (leader: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (screen: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isLeader,
  onToggleRole,
  searchQuery,
  onSearchChange,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenMobileSidebar,
  onSignOut,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileActionsMenu, setShowMobileActionsMenu] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const notifications = [
    {
      id: 'n1',
      title: 'Daniel Kim reported high workload',
      time: '10m ago',
      desc: 'Capacity reached 85% on Campus Events Platform.',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Payment gateway API blocked',
      time: '1h ago',
      desc: 'Awaiting university IT SSO review.',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Maya Chen completed design spec',
      time: '3h ago',
      desc: 'Registration flow wireframes ready for review.',
      unread: false,
    },
  ];

  return (
    <header className="h-16 bg-white dark:bg-[#0D131F] border-b border-[#E2E8F0] dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-3 w-full max-w-xl">
        {/* Mobile Sidebar Hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#F1F5F9]/80 dark:bg-slate-800/60 border border-transparent focus-within:border-[#93C5FD] dark:focus-within:border-blue-500/80 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#BFDBFE]/50 dark:focus-within:ring-blue-900/40 rounded-xl transition-all">
            <Search className="w-4 h-4 text-[#64748B] dark:text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search projects, tasks, files, or people..."
              className="w-full text-sm text-[#0F172A] dark:text-slate-100 placeholder-[#94A3B8] dark:placeholder-slate-500 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right Controls: Top Actions, Theme Toggle, Role Switcher, Bell, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-3">
        {/* Top-Right Prominent Actions (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Ask PROJEX Action */}
          <button
            onClick={() => onNavigate('ask-team')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#1E60FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            title="Open conversational assistant workspace"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Ask PROJEX</span>
          </button>

          {/* New Project Action */}
          <button
            onClick={() => onNavigate('create-project')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            title="Create a new project brief"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New project</span>
          </button>
        </div>

        {/* Mobile Top Actions Dropdown Menu (on narrow screens) */}
        <div className="relative md:hidden">
          <button
            onClick={() => {
              setShowMobileActionsMenu(!showMobileActionsMenu);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            aria-label="Quick actions menu"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMobileActionsMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 space-y-1">
              <button
                onClick={() => {
                  onNavigate('create-project');
                  setShowMobileActionsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl"
              >
                <Plus className="w-4 h-4 text-[#1E60FF]" />
                <span>New project</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('ask-team');
                  setShowMobileActionsMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1E60FF] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask PROJEX</span>
              </button>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Leader Demo Role Indicator & Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => onToggleRole(!isLeader)}
            title="Click to toggle between Team Leader and Member view"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              isLeader
                ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 border-[#BFDBFE] dark:border-blue-900/60'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#1E60FF] dark:text-blue-400" />
            <span>{isLeader ? 'Leader (Alex)' : 'Member (Maya)'}</span>
            <span className="text-[10px] text-gray-400 ml-1 underline">switch</span>
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowMobileActionsMenu(false);
              setHasUnread(false);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-slate-800 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800 px-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</span>
                <span className="text-xs text-[#1E60FF] dark:text-blue-400 font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.unread 
                        ? 'bg-[#EFF6FF]/70 dark:bg-blue-950/40 text-slate-800 dark:text-slate-200' 
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-slate-100">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">{n.time}</span>
                    </div>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowMobileActionsMenu(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="User profile menu"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-xs"
            />
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-slate-800 p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                  {currentUser.role}
                </span>
              </div>

              <div className="py-2 border-b border-gray-100 dark:border-slate-800">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Switch Active Role (Demo)
                </div>
                <button
                  onClick={() => {
                    onToggleRole(true);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                    isLeader ? 'bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Team Leader (Alex Rivera)</span>
                  </div>
                  {isLeader && <Check className="w-3.5 h-3.5 text-[#1E60FF] dark:text-blue-400" />}
                </button>
                <button
                  onClick={() => {
                    onToggleRole(false);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                    !isLeader ? 'bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Team Member (Maya Chen)</span>
                  </div>
                  {!isLeader && <Check className="w-3.5 h-3.5 text-[#1E60FF] dark:text-blue-400" />}
                </button>
              </div>

              <div className="py-1 border-b border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit demo to introduction</span>
                </button>
              </div>

              <div className="pt-1.5 px-3 py-1 text-xs text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300">PROJEX Prototype</span>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Frontend Mock · Local State</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
