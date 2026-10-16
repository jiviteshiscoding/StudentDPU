import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  AtSign, 
  Paperclip, 
  Smile, 
  ChevronDown, 
  Check, 
  Calendar, 
  Sparkles, 
  Users, 
  Code, 
  Palette, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ExternalLink 
} from 'lucide-react';
import { ChatMessage, ActionCardData, TeamMember, Project } from '../types';

interface AskTeamProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string, channel: string) => void;
  teamMembers: TeamMember[];
  projects: Project[];
}

export const AskTeam: React.FC<AskTeamProps> = ({
  messages,
  onSendMessage,
  teamMembers,
  projects,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'In-app chat' | 'Telegram' | 'Discord' | 'WhatsApp' | 'Email'>('In-app chat');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [actionConfirmModal, setActionConfirmModal] = useState<ActionCardData | null>(null);
  const [sentActionIds, setSentActionIds] = useState<{ [id: string]: boolean }>({});
  const [selectedProject, setSelectedProject] = useState('campus-events');

  const channels = [
    { name: 'In-app chat', status: 'active', icon: '💬' },
    { name: 'Telegram', status: 'Connected', icon: '✈️' },
    { name: 'Discord', status: 'Connected', icon: '👾' },
    { name: 'WhatsApp', status: 'Connect', icon: '💬' },
    { name: 'Email', status: 'Connect', icon: '✉️' },
  ];

  const peopleMentions = [
    { name: 'Maya', role: 'Product Designer', handle: '@Maya', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { name: 'Alex', role: 'Project Manager', handle: '@Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Daniel', role: 'Developer', handle: '@Daniel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  ];

  const roleMentions = [
    { name: 'team-leads', desc: '5 members • Project role', handle: '@team-leads', icon: Users },
    { name: 'frontend', desc: '3 members • Project role', handle: '@frontend', icon: Code },
    { name: 'design', desc: '4 members • Project role', handle: '@design', icon: Palette },
    { name: 'product', desc: '4 members • Project role', handle: '@product', icon: Briefcase },
  ];

  const handleInsertMention = (handle: string) => {
    setInputText(prev => (prev ? `${prev} ${handle} ` : `${handle} `));
    setShowMentionPicker(false);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText, selectedChannel);
    setInputText('');
  };

  const handleConfirmAction = () => {
    if (actionConfirmModal) {
      setSentActionIds(prev => ({ ...prev, [actionConfirmModal.id]: true }));
      setActionConfirmModal(null);
    }
  };

  // Helper to render message content with highlighted mentions
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(@[\w-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={i}
            className="inline-block px-1.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#1E60FF] font-semibold text-xs border border-[#BFDBFE]/60 mx-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Ask Team</h1>
            <p className="text-sm text-[#64748B] mt-0.5 font-normal">
              Message people, roles, or your team assistant in natural language.
            </p>
          </div>
        </div>

        {/* Project Selector & Members Avatars */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-1 font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center -space-x-1.5">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" alt="Alex" />
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" alt="Maya" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" alt="Daniel" />
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" className="w-7 h-7 rounded-full object-cover ring-2 ring-white" alt="Priya" />
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center ring-2 ring-white">
              +2
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Thread (8 cols) & Panels (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chat Thread Container (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col min-h-[640px]">
          {/* Channel dropdown at top right of chat */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-end relative">
            <div className="relative">
              <button
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
              >
                <span>Send via:</span>
                <span className="font-semibold text-[#0F172A]">{selectedChannel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Channel Dropdown Menu */}
              {showChannelDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-1.5 z-40">
                  {channels.map((ch) => (
                    <button
                      key={ch.name}
                      onClick={() => {
                        setSelectedChannel(ch.name as any);
                        setShowChannelDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>{ch.icon}</span>
                        <span className="font-medium text-slate-800">{ch.name}</span>
                      </div>
                      {ch.name === selectedChannel ? (
                        <Check className="w-3.5 h-3.5 text-[#1E60FF]" />
                      ) : ch.status === 'Connected' ? (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                        </span>
                      ) : ch.status === 'Connect' ? (
                        <span className="text-[10px] text-[#1E60FF] font-semibold">Connect</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Flow */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Message */}
                {!msg.isAssistant && (
                  <div className="flex items-start gap-3">
                    <img
                      src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">{msg.senderName}</span>
                        <span className="text-[11px] text-[#94A3B8]">{msg.timestamp}</span>
                      </div>
                      <div className="mt-1.5 p-3.5 bg-[#EFF6FF] rounded-2xl rounded-tl-sm text-xs text-[#0F172A] leading-relaxed max-w-xl">
                        {renderFormattedContent(msg.content)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistant Message with Action Cards */}
                {msg.isAssistant && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E60FF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">{msg.senderName}</span>
                        <span className="text-[11px] text-[#94A3B8]">{msg.timestamp}</span>
                      </div>

                      <div className="text-xs text-[#334155] leading-relaxed whitespace-pre-line">
                        {msg.content}
                      </div>

                      {/* Action Cards */}
                      {msg.actionCards && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {msg.actionCards.map((card) => {
                            const isSent = sentActionIds[card.id];

                            return (
                              <div
                                key={card.id}
                                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 relative hover:border-blue-200 transition-all"
                              >
                                {/* Badge */}
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isSent 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {isSent ? '✓ Sent to team' : '⚠️ Needs your confirmation'}
                                  </span>
                                </div>

                                {/* Title & Desc */}
                                <div className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E60FF] flex items-center justify-center shrink-0 mt-0.5">
                                    {card.type === 'meeting' ? <Calendar className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-[#0F172A]">{card.title}</h4>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">{card.description}</p>
                                  </div>
                                </div>

                                {/* Meeting Details */}
                                {card.type === 'meeting' && (
                                  <div className="space-y-2 text-xs text-[#475569] bg-slate-50 p-2.5 rounded-xl">
                                    <div>
                                      <span className="font-semibold text-slate-700">Suggested times:</span>
                                      <div className="text-[11px] text-slate-600 mt-0.5">
                                        Today 3:00 PM, Tomorrow 10:00 AM, Thu 11:00 AM
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                      <span className="text-[11px] font-semibold text-slate-700">Attendees</span>
                                      <div className="flex items-center -space-x-1">
                                        {card.attendees?.map((att, i) => (
                                          <img
                                            key={i}
                                            src={att.avatar}
                                            alt={att.name}
                                            className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                                          />
                                        ))}
                                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-1 ring-white">
                                          +2
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Message Details */}
                                {card.type === 'message' && (
                                  <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-semibold text-slate-700">To:</span>
                                      <img
                                        src={card.targetPerson?.avatar}
                                        alt={card.targetPerson?.name}
                                        className="w-4 h-4 rounded-full object-cover"
                                      />
                                      <span className="text-[11px] font-bold text-slate-900">{card.targetPerson?.name}</span>
                                      <span className="text-[10px] text-slate-500">({card.targetPerson?.role})</span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                                      "{card.suggestedMessage}"
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => alert('Opening edit modal... (Frontend mock)')}
                                    className="px-3 py-1.5 text-xs font-semibold text-[#334155] border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                                  >
                                    Edit details
                                  </button>
                                  <button
                                    disabled={isSent}
                                    onClick={() => setActionConfirmModal(card)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
                                      isSent
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-[#1E60FF] hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    {isSent ? 'Sent' : 'Send request'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-6 py-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setInputText('Give me a high-level status check on the Campus Events Platform project.')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer shrink-0"
            >
              <span>📊 Check status</span>
            </button>
            <button
              onClick={() => setInputText('@Daniel I completed the registration UI code, ready for backend integration.')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer shrink-0"
            >
              <span>✓ Update a task</span>
            </button>
            <button
              onClick={() => setInputText('@team-leads let us schedule a 15-minute sync tomorrow morning.')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-semibold text-slate-700 border border-slate-200 cursor-pointer shrink-0"
            >
              <span>📅 Request meeting</span>
            </button>
          </div>

          {/* Bottom Message Composer */}
          <div className="p-4 border-t border-slate-200 relative">
            {/* Mention Picker Popup */}
            {showMentionPicker && (
              <div className="absolute bottom-20 left-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Mention People
                </div>
                {peopleMentions.map((p) => (
                  <button
                    key={p.handle}
                    onClick={() => handleInsertMention(p.handle)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                  >
                    <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">{p.name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">{p.handle}</span>
                    </div>
                  </button>
                ))}

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-1 border-t border-slate-100">
                  Mention Team / Roles
                </div>
                {roleMentions.map((r) => (
                  <button
                    key={r.handle}
                    onClick={() => handleInsertMention(r.handle)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                  >
                    <r.icon className="w-4 h-4 text-[#1E60FF]" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">{r.name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">{r.handle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (e.target.value.endsWith('@')) {
                    setShowMentionPicker(true);
                  }
                }}
                placeholder="Ask about project status, update a task, request help, or schedule a meeting..."
                className="w-full px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E60FF] focus:bg-white"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowMentionPicker(!showMentionPicker)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    title="Mention someone (@)"
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Mock attachment file selection (Frontend mock)')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(prev => prev + ' 👍')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    title="Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748B]">
                    Send via: <strong className="text-[#0F172A]">{selectedChannel}</strong>
                  </span>
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl bg-[#1E60FF] hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side Panels (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* People & Roles Panel */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E60FF]" />
                <span>People & roles</span>
              </h2>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search people or roles..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E60FF]"
              />
            </div>

            {/* People List */}
            <div className="space-y-2">
              {peopleMentions.map((p) => (
                <div
                  key={p.handle}
                  onClick={() => handleInsertMention(p.handle)}
                  className="p-2 flex items-center justify-between rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">{p.name}</div>
                      <div className="text-[11px] text-[#64748B]">{p.role}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#1E60FF] bg-blue-50 px-2 py-0.5 rounded-md">
                    {p.handle}
                  </span>
                </div>
              ))}
            </div>

            {/* Roles List */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {roleMentions.map((r) => (
                <div
                  key={r.handle}
                  onClick={() => handleInsertMention(r.handle)}
                  className="p-2 flex items-center justify-between rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center">
                      <r.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">{r.name}</div>
                      <div className="text-[10px] text-[#64748B]">{r.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    {r.handle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests Panel */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F172A]">Recent requests</h2>
              <button className="text-xs font-semibold text-[#1E60FF] hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {/* Draft meeting item */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:bg-slate-100/60 cursor-pointer transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-[#1E60FF]" />
                    <span className="truncate">Draft meeting: Registration blocker...</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">10:15 AM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>To: Alex, Maya, +3</span>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                    Needs confirmation
                  </span>
                </div>
              </div>

              {/* Draft request item */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:bg-slate-100/60 cursor-pointer transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1E60FF]" />
                    <span className="truncate">Draft request: Design update</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">10:15 AM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>To: Maya</span>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                    Needs confirmation
                  </span>
                </div>
              </div>

              {/* Completed task item */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:bg-slate-100/60 cursor-pointer transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">Updated task: Event landing page</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">Apr 29</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Marked complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Sending Action Request */}
      {actionConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Confirm Action Request</h3>
              </div>
              <button onClick={() => setActionConfirmModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <p>
                You are about to execute the following coordinator action:
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900">{actionConfirmModal.title}</div>
                <p className="text-blue-700">{actionConfirmModal.description}</p>
                <div className="text-[11px] text-blue-600 mt-2">
                  Channel delivery: <strong>{selectedChannel}</strong> (Simulated Mock)
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                In Orbit, consequential team requests require explicit human confirmation prior to dispatching notifications.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setActionConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-[#1E60FF] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
