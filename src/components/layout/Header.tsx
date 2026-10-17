import React, { useState, useEffect } from 'react';
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
  isAuth?: boolean;
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
  isAuth = false,
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
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

  // Telegram connectivity state
  const [telegramStatus, setTelegramStatus] = useState<{
    linked: boolean;
    status: 'connected' | 'pending_link' | 'not_linked';
    telegramUsername: string | null;
    botLink: string;
  }>({
    linked: false,
    status: 'not_linked',
    telegramUsername: null,
    botLink: 'https://t.me/DYP_AI_Coordinator_Bot',
  });
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [inputTgUsername, setInputTgUsername] = useState('');
  const [isLinkingTg, setIsLinkingTg] = useState(false);
  const [tgModalMessage, setTgModalMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    import('../../lib/dataService').then(({ fetchInAppNotifications, fetchTelegramStatus }) => {
      fetchInAppNotifications()
        .then(notes => {
          if (isMounted && notes && notes.length > 0) {
            setLiveNotifications(notes);
            setHasUnread(notes.some(n => !n.isRead));
          }
        })
        .catch(() => {});

      fetchTelegramStatus()
        .then(tg => {
          if (isMounted && tg) {
            setTelegramStatus(tg);
            if (tg.telegramUsername) {
              setInputTgUsername(tg.telegramUsername.replace(/^@/, ''));
            }
          }
        })
        .catch(() => {});
    });

    return () => { isMounted = false; };
  }, [showNotifications]);

  const handleSaveTelegramUsername = async () => {
    if (!inputTgUsername.trim()) return;
    setIsLinkingTg(true);
    setTgModalMessage(null);
    try {
      const { linkTelegramUsername, fetchTelegramStatus } = await import('../../lib/dataService');
      const res = await linkTelegramUsername(inputTgUsername.trim());
      setTgModalMessage(res.message);
      const updated = await fetchTelegramStatus();
      setTelegramStatus(updated);
    } catch (err: any) {
      setTgModalMessage(err.message || 'Failed to link username');
    } finally {
      setIsLinkingTg(false);
    }
  };

  const defaultNotifications = [
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

  const displayNotifications = [
    ...liveNotifications.map(n => ({
      id: n.id,
      title: n.title,
      time: 'Just now',
      desc: n.message,
      unread: !n.isRead,
      telegramStatus: n.telegramDeliveryStatus,
    })),
    ...defaultNotifications
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

        {/* Telegram Connectivity Status & Prompt */}
        <div className="relative">
          <button
            onClick={() => setShowTelegramModal(true)}
            title={
              telegramStatus.status === 'connected'
                ? `Telegram Connected (${telegramStatus.telegramUsername || 'Linked'})`
                : telegramStatus.status === 'pending_link'
                ? `Telegram Pending Activation (${telegramStatus.telegramUsername})`
                : 'Connect your Telegram username for AI mentions & alerts'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              telegramStatus.status === 'connected'
                ? 'bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] border-sky-200 dark:border-sky-900/60 hover:bg-sky-100'
                : telegramStatus.status === 'pending_link'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#229ED9] hover:text-[#229ED9]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              telegramStatus.status === 'connected'
                ? 'bg-emerald-500'
                : telegramStatus.status === 'pending_link'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-slate-400'
            }`} />
            <span className="hidden xl:inline">Telegram:</span>
            <span>
              {telegramStatus.status === 'connected'
                ? telegramStatus.telegramUsername || 'Connected'
                : telegramStatus.status === 'pending_link'
                ? 'Pending Link'
                : 'Connect'}
            </span>
          </button>
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

        {/* Role Indicator & Quick Switcher */}
        <div className="relative">
          {isAuth ? (
            <div
              title={`Authenticated Supabase User: ${currentUser.email}`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isLeader ? 'Leader' : 'Member'}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">({currentUser.name.split(' ')[0]})</span>
            </div>
          ) : (
            <button
              onClick={() => onToggleRole(!isLeader)}
              title="Click to toggle between Team Leader and Member view (Demo)"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                isLeader
                  ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 border-[#BFDBFE] dark:border-blue-900/60'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#1E60FF] dark:text-blue-400" />
              <span>{isLeader ? 'Demo Leader' : 'Demo Member'}</span>
              <span className="text-[10px] text-gray-400 ml-1 underline">switch</span>
            </button>
          )}
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
                {displayNotifications.map((n: any) => (
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
                    {n.telegramStatus && (
                      <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800 text-[10px]">
                        <span className="text-slate-400">Telegram Sync:</span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold ${
                          n.telegramStatus === 'sent'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                            : n.telegramStatus === 'failed'
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                        }`}>
                          {n.telegramStatus === 'sent' ? '✓ Delivered' : n.telegramStatus === 'failed' ? '✗ Delivery Failed' : 'Pending'}
                        </span>
                      </div>
                    )}
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
                <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">{currentUser.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                  isAuth 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                }`}>
                  {isAuth ? `Authenticated · ${currentUser.role}` : currentUser.role}
                </span>
              </div>

              {!isAuth && (
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
              )}

              <div className="py-1 border-b border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAuth ? 'Sign out of PROJEX' : 'Exit demo to introduction'}</span>
                </button>
              </div>

              <div className="pt-1.5 px-3 py-1 text-xs text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300">
                  {isAuth ? 'Supabase Live Connected' : 'PROJEX Prototype'}
                </span>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                  {isAuth ? 'Live Session · RLS Protected' : 'Frontend Mock · Local State'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telegram Link Username Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 animate-fade-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] flex items-center justify-center font-bold text-sm">
                  TG
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Telegram Connectivity</h3>
                  <p className="text-[11px] text-slate-400">Receive mentions & task updates in real time</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowTelegramModal(false);
                  setTgModalMessage(null);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Status Banner */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                telegramStatus.status === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : telegramStatus.status === 'pending_link'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    telegramStatus.status === 'connected'
                      ? 'bg-emerald-500'
                      : telegramStatus.status === 'pending_link'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-slate-400'
                  }`} />
                  <div>
                    <div className="font-bold text-xs">
                      {telegramStatus.status === 'connected'
                        ? 'Connected & Active'
                        : telegramStatus.status === 'pending_link'
                        ? 'Pending Bot Activation'
                        : 'Not Connected'}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {telegramStatus.telegramUsername
                        ? `Bound to ${telegramStatus.telegramUsername}`
                        : 'No Telegram username linked to this account'}
                    </div>
                  </div>
                </div>

                <a
                  href={telegramStatus.botLink || 'https://t.me/DYP_AI_Coordinator_Bot'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#229ED9] hover:bg-[#1E8BBE] text-white rounded-xl cursor-pointer"
                >
                  Open Bot ↗
                </a>
              </div>

              {/* Username Input Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Telegram Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    placeholder="your_telegram_handle"
                    value={inputTgUsername}
                    onChange={(e) => setInputTgUsername(e.target.value.replace(/^@/, ''))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-[#229ED9]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  When teammates @mention you in Ask PROJEX AI Chat, messages will be delivered to this handle.
                </p>
              </div>

              {tgModalMessage && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-900 dark:text-blue-200 text-xs">
                  {tgModalMessage}
                </div>
              )}

              {/* Instructions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Setup Instructions:</span>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Enter your Telegram username above and click <strong>Save Username</strong>.</li>
                  <li>Click <strong>Open Bot</strong> or open <a href={telegramStatus.botLink || 'https://t.me/DYP_AI_Coordinator_Bot'} target="_blank" rel="noreferrer" className="text-[#229ED9] underline">@DYP_AI_Coordinator_Bot</a> in Telegram.</li>
                  <li>Press <strong>Start</strong> or send <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[10px]">/start</code> to verify connectivity.</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowTelegramModal(false);
                  setTgModalMessage(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isLinkingTg || !inputTgUsername.trim()}
                onClick={handleSaveTelegramUsername}
                className="px-4 py-2 bg-[#229ED9] hover:bg-[#1E8BBE] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLinkingTg ? 'Saving...' : 'Save Username'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
