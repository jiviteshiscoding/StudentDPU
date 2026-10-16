import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, Shield, User, AlertCircle } from 'lucide-react';
import { TeamMember } from '../../types';

interface HeaderProps {
  currentUser: TeamMember;
  isLeader: boolean;
  onToggleRole: (leader: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSearchResult?: (type: string, id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  isLeader,
  onToggleRole,
  searchQuery,
  onSearchChange,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Input */}
      <div className="relative w-full max-w-xl">
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#F1F5F9]/80 border border-transparent focus-within:border-[#93C5FD] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#BFDBFE]/50 rounded-xl transition-all">
          <Search className="w-4 h-4 text-[#64748B] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, tasks, files, or people..."
            className="w-full text-sm text-[#0F172A] placeholder-[#94A3B8] bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Right Controls: Role Pill, Bell, Avatar */}
      <div className="flex items-center gap-4">
        {/* Leader Demo Role Indicator & Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => onToggleRole(!isLeader)}
            title="Click to toggle between Team Leader and Member view"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              isLeader
                ? 'bg-[#EFF6FF] text-[#1E60FF] border-[#BFDBFE]'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#1E60FF]" />
            <span>Role: {isLeader ? 'Leader (Alex)' : 'Member (Maya)'}</span>
            <span className="text-[10px] text-gray-400 ml-1 underline">switch</span>
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setHasUnread(false);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-2">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                <span className="text-xs text-[#1E60FF] font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.unread ? 'bg-[#EFF6FF]/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-gray-900">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-gray-500 mt-1">{n.desc}</p>
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
            }}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#0F172A]">{currentUser.name}</p>
                <p className="text-xs text-[#64748B]">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                  {currentUser.role}
                </span>
              </div>

              <div className="py-2 border-b border-gray-100">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Switch Active Role (Demo)
                </div>
                <button
                  onClick={() => {
                    onToggleRole(true);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                    isLeader ? 'bg-[#EBF3FE] text-[#1E60FF] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Team Leader (Alex Rivera)</span>
                  </div>
                  {isLeader && <Check className="w-3.5 h-3.5 text-[#1E60FF]" />}
                </button>
                <button
                  onClick={() => {
                    onToggleRole(false);
                    setShowUserMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                    !isLeader ? 'bg-[#EBF3FE] text-[#1E60FF] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Team Member (Maya Chen)</span>
                  </div>
                  {!isLeader && <Check className="w-3.5 h-3.5 text-[#1E60FF]" />}
                </button>
              </div>

              <div className="pt-1">
                <div className="px-3 py-1.5 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Orbit Prototype</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Frontend Mock · Local State</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
