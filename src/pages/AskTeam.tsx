import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink,
  Loader2,
  Clock,
  Layers,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { ChatMessage, ActionCardData, TeamMember, Project } from '../types';
import { ChannelBrandIcon } from '../components/common/BrandIcons';
import { ProjexLogo } from '../components/common/ProjexLogo';

interface AskTeamProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string, channel: string) => void;
  teamMembers: TeamMember[];
  projects: Project[];
  isPendingResponse?: boolean;
}

export const AskTeam: React.FC<AskTeamProps> = ({
  messages,
  onSendMessage,
  teamMembers,
  projects,
  isPendingResponse = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'In-app chat' | 'Telegram' | 'Discord' | 'WhatsApp' | 'Email'>('In-app chat');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [actionConfirmModal, setActionConfirmModal] = useState<ActionCardData | null>(null);
  const [sentActionIds, setSentActionIds] = useState<{ [id: string]: boolean }>({});
  const [selectedProject, setSelectedProject] = useState('campus-events');
  const [showSidePanels, setShowSidePanels] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const channels = [
    { name: 'In-app chat', status: 'Active', note: 'Primary workspace thread' },
    { name: 'Telegram', status: 'Demo', note: 'Simulated Bot integration' },
    { name: 'Discord', status: 'Demo', note: 'Simulated Webhook integration' },
    { name: 'WhatsApp', status: 'Not connected', note: 'Requires Meta API key' },
    { name: 'Email', status: 'Not connected', note: 'Requires SMTP service' },
  ];

  const peopleMentions = [
    { name: 'Alex Rivera', role: 'Project Lead', handle: '@Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Maya Chen', role: 'Product Designer', handle: '@Maya', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { name: 'Daniel Kim', role: 'Fullstack Developer', handle: '@Daniel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { name: 'Priya Singh', role: 'Backend & DB', handle: '@Priya', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { name: 'Jamie Chen', role: 'QA & Research', handle: '@Jamie', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  ];

  const roleMentions = [
    { name: 'team-leads', desc: 'Project Leadership', handle: '@team-leads', icon: Users },
    { name: 'frontend', desc: 'UI & Integration (3)', handle: '@frontend', icon: Code },
    { name: 'design', desc: 'Wireframes & Design System (2)', handle: '@design', icon: Palette },
    { name: 'product', desc: 'Scope & User Feedback (2)', handle: '@product', icon: Briefcase },
  ];

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isPendingResponse]);

  const handleInsertMention = (handle: string) => {
    setInputText(prev => (prev ? `${prev} ${handle} ` : `${handle} `));
    setShowMentionPicker(false);
    textareaRef.current?.focus();
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping || isPendingResponse) return;

    const query = inputText;
    setInputText('');
    setShowMentionPicker(false);

    // Call upstream
    onSendMessage(query, selectedChannel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmAction = () => {
    if (actionConfirmModal) {
      setSentActionIds(prev => ({ ...prev, [actionConfirmModal.id]: true }));
      setActionConfirmModal(null);
      setToastMessage(`Draft confirmed locally: "${actionConfirmModal.title}". Note: No external message or calendar event was created.`);
      setTimeout(() => setToastMessage(null), 5000);
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
            className="inline-block px-1.5 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-blue-950/70 text-[#1E60FF] dark:text-blue-400 font-semibold text-xs border border-[#BFDBFE]/60 dark:border-blue-900/60 mx-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-rise">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-fade-rise">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-800 dark:text-slate-200">
            <span className="font-bold block text-emerald-700 dark:text-emerald-400">Simulation Updated</span>
            <p className="mt-0.5 leading-relaxed">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                Ask PROJEX
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Coordinator Standby
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5 font-normal">
              Main conversational workspace for project status, role delegation, task updates, and meeting drafts.
            </p>
          </div>
        </div>

        {/* Project Context & Toggle Panels Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-white shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-1 font-medium dark:text-slate-200"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowSidePanels(!showSidePanels)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Toggle side reference panels"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showSidePanels ? 'Hide Panels' : 'Show Panels'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Thread Container (8 or 12 cols based on panel toggle) */}
        <div className={`${showSidePanels ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white dark:bg-[#0D131F] rounded-3xl border border-[#E2E8F0] dark:border-slate-800/80 shadow-sm flex flex-col min-h-[680px] h-[calc(100vh-210px)] transition-all overflow-hidden`}>
          
          {/* Top Chat Bar: Channel Selector and Status */}
          <div className="p-3.5 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Bot className="w-4 h-4 text-[#1E60FF]" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">PROJEX Coordinator</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Dependency-aware model</span>
            </div>

            {/* Channel dropdown at top right of chat */}
            <div className="relative">
              <button
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs cursor-pointer transition-colors"
                aria-label="Select messaging channel"
              >
                <ChannelBrandIcon channel={selectedChannel} size={15} />
                <span className="font-bold text-[#0F172A] dark:text-white">{selectedChannel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Channel Dropdown Menu */}
              {showChannelDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 p-2 z-40 space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulated Channel Delivery
                  </div>
                  {channels.map((ch) => (
                    <button
                      key={ch.name}
                      onClick={() => {
                        setSelectedChannel(ch.name as any);
                        setShowChannelDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <ChannelBrandIcon channel={ch.name} size={18} />
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{ch.name}</div>
                          <div className="text-[10px] text-slate-400">{ch.note}</div>
                        </div>
                      </div>
                      {ch.name === selectedChannel ? (
                        <Check className="w-4 h-4 text-[#1E60FF]" />
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          ch.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : ch.status === 'Demo'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {ch.status}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                    Selecting external channels simulates message routing for demo purposes without external delivery.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages Flow Area */}
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1E60FF] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Welcome to Ask PROJEX</h3>
                <p className="text-xs max-w-sm leading-relaxed">
                  Ask about project deadlines, update your task progress conversationally, report blockers, or draft team meetings.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3 animate-fade-rise">
                {/* User Message */}
                {!msg.isAssistant && (
                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-[#94A3B8]">{msg.timestamp}</span>
                        <span className="text-xs font-bold text-[#0F172A] dark:text-white">{msg.senderName}</span>
                      </div>
                      <div className="p-3.5 bg-[#1E60FF] text-white rounded-2xl rounded-tr-xs text-xs leading-relaxed max-w-xl shadow-xs">
                        {renderFormattedContent(msg.content)}
                      </div>
                      {msg.channel && msg.channel !== 'In-app chat' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          <ChannelBrandIcon channel={msg.channel} size={12} />
                          <span>via {msg.channel} (Simulated)</span>
                        </div>
                      )}
                    </div>
                    <img
                      src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 ring-2 ring-white dark:ring-slate-800 shadow-xs"
                    />
                  </div>
                )}

                {/* PROJEX Assistant Message */}
                {msg.isAssistant && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs border border-slate-700">
                      <ProjexLogo variant="mark" size={22} animated={false} />
                    </div>
                    <div className="space-y-3 flex-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A] dark:text-white">{msg.senderName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                          PROJEX AI
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">{msg.timestamp}</span>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl rounded-tl-xs text-xs text-[#334155] dark:text-slate-200 leading-relaxed whitespace-pre-line shadow-2xs">
                        {msg.content}
                      </div>

                      {/* Action Cards (Draft proposals) */}
                      {msg.actionCards && msg.actionCards.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {msg.actionCards.map((card) => {
                            const isSent = sentActionIds[card.id];

                            return (
                              <div
                                key={card.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 relative hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                              >
                                {/* Badge */}
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                    isSent 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  }`}>
                                    {isSent ? '✓ Confirmed in prototype' : '⚠️ Draft · Needs confirmation'}
                                  </span>
                                </div>

                                {/* Title & Desc */}
                                <div className="flex items-start gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                    {card.type === 'meeting' ? <Calendar className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">{card.title}</h4>
                                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{card.description}</p>
                                  </div>
                                </div>

                                {/* Meeting Details */}
                                {card.type === 'meeting' && (
                                  <div className="space-y-2 text-xs text-[#475569] dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">Proposed Agenda Slots:</span>
                                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                        Today 3:00 PM, Tomorrow 10:00 AM, Thu 11:00 AM
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Invitees</span>
                                      <div className="flex items-center -space-x-1">
                                        {card.attendees?.map((att, i) => (
                                          <img
                                            key={i}
                                            src={att.avatar}
                                            alt={att.name}
                                            className="w-5 h-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900"
                                          />
                                        ))}
                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                                          +2
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Message Details */}
                                {card.type === 'message' && (
                                  <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Target Assignee:</span>
                                      {card.targetPerson && (
                                        <>
                                          <img
                                            src={card.targetPerson.avatar}
                                            alt={card.targetPerson.name}
                                            className="w-4 h-4 rounded-full object-cover"
                                          />
                                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">{card.targetPerson.name}</span>
                                          <span className="text-[10px] text-slate-500">({card.targetPerson.role})</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                      "{card.suggestedMessage}"
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => alert('Edit draft proposal (Frontend simulation)')}
                                    className="px-3 py-1.5 text-xs font-semibold text-[#334155] dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    Edit draft
                                  </button>
                                  <button
                                    disabled={isSent}
                                    onClick={() => setActionConfirmModal(card)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
                                      isSent
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                        : 'bg-[#1E60FF] hover:bg-[#1A53DE] text-white'
                                    }`}
                                  >
                                    {isSent ? 'Confirmed' : 'Confirm Action'}
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

            {/* Simulated Typing Indicator */}
            {isPendingResponse && (
              <div className="flex items-start gap-3 animate-fade-rise">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs border border-slate-700">
                  <ProjexLogo variant="mark" size={22} animated={true} />
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl rounded-tl-xs flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1E60FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#1E60FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#1E60FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    PROJEX Assistant is analyzing task dependencies and calculating update...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt Chips */}
          <div className="px-4 sm:px-6 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto bg-slate-50/30 dark:bg-slate-900/20">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Suggested:
            </span>
            <button
              onClick={() => {
                setInputText('Give me a high-level status check on the Campus Events Platform project.');
                textareaRef.current?.focus();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer shrink-0 transition-colors"
            >
              <span>📊 Check project status</span>
            </button>
            <button
              onClick={() => {
                setInputText('@Daniel I completed the event registration UI; ready for backend integration.');
                textareaRef.current?.focus();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer shrink-0 transition-colors"
            >
              <span>✓ Update a task</span>
            </button>
            <button
              onClick={() => {
                setInputText('@team-leads let us schedule a 15-minute sync on payment gateway blockers tomorrow morning.');
                textareaRef.current?.focus();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer shrink-0 transition-colors"
            >
              <span>📅 Request a meeting</span>
            </button>
          </div>

          {/* Bottom Sticky Composer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 relative bg-white dark:bg-[#0D131F]">
            {/* Mention Picker Popup */}
            {showMentionPicker && (
              <div className="absolute bottom-24 left-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-rise">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Mention People</span>
                  <span className="text-[9px] lowercase font-normal">Esc to close</span>
                </div>
                {peopleMentions.map((p) => (
                  <button
                    key={p.handle}
                    onClick={() => handleInsertMention(p.handle)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{p.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">{p.handle}</span>
                    </div>
                  </button>
                ))}

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                  Mention Team / Roles
                </div>
                {roleMentions.map((r) => (
                  <button
                    key={r.handle}
                    onClick={() => handleInsertMention(r.handle)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <r.icon className="w-4 h-4 text-[#1E60FF]" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{r.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">{r.handle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-3">
              <div className="relative border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl p-2.5 focus-within:border-[#1E60FF] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.endsWith('@')) {
                      setShowMentionPicker(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about project status, update a task with @person, or schedule a meeting... (Press Enter to send)"
                  className="w-full px-2 py-1 text-xs sm:text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-400 bg-transparent outline-none resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/60 mt-1">
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => setShowMentionPicker(!showMentionPicker)}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title="Mention someone or a team (@)"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Mock attachment file selection (Frontend simulation)')}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputText(prev => prev + ' 👍')}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-xs text-[#64748B] dark:text-slate-400">
                      Sending via: <strong className="text-[#0F172A] dark:text-white">{selectedChannel}</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isPendingResponse}
                      className={`h-9 px-4 rounded-xl text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                        !inputText.trim() || isPendingResponse
                          ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-[#1E60FF] hover:bg-[#1A53DE] active:scale-95'
                      }`}
                    >
                      {isPendingResponse ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Thinking...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side Panels: People & Roles, Recent Requests (4 cols, collapsible) */}
        {showSidePanels && (
          <div className="lg:col-span-4 space-y-6 animate-fade-rise">
            {/* People & Roles Panel */}
            <div className="bg-white dark:bg-[#0D131F] rounded-3xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E60FF]" />
                  <span>People & roles</span>
                </h2>
                <span className="text-[10px] text-slate-400">Click to mention</span>
              </div>

              {/* People List */}
              <div className="space-y-1">
                {peopleMentions.map((p) => (
                  <div
                    key={p.handle}
                    onClick={() => handleInsertMention(p.handle)}
                    className="p-2 flex items-center justify-between rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-[#0F172A] dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-[#64748B] dark:text-slate-400">{p.role}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#1E60FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      {p.handle}
                    </span>
                  </div>
                ))}
              </div>

              {/* Roles List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                  Project Roles
                </div>
                {roleMentions.map((r) => (
                  <div
                    key={r.handle}
                    onClick={() => handleInsertMention(r.handle)}
                    className="p-2 flex items-center justify-between rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#8B5CF6] flex items-center justify-center">
                        <r.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F172A] dark:text-white">{r.name}</div>
                        <div className="text-[10px] text-[#64748B] dark:text-slate-400">{r.desc}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                      {r.handle}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Requests Panel */}
            <div className="bg-white dark:bg-[#0D131F] rounded-3xl border border-[#E2E8F0] dark:border-slate-800/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Recent requests</h2>
                <span className="text-[10px] font-semibold text-[#1E60FF] dark:text-blue-400">Audit Log</span>
              </div>

              <div className="space-y-3">
                {/* Draft meeting item */}
                <div 
                  onClick={() => alert('Reviewing draft meeting request (Frontend simulation)')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5 hover:bg-slate-100/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-[#1E60FF]" />
                      <span className="truncate">Draft meeting: Registration blocker</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">10:15 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>To: Alex, Maya, +3</span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
                      Draft
                    </span>
                  </div>
                </div>

                {/* Draft request item */}
                <div 
                  onClick={() => alert('Reviewing draft request (Frontend simulation)')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5 hover:bg-slate-100/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-[#1E60FF]" />
                      <span className="truncate">Draft request: Design update</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">10:15 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>To: Maya</span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
                      Draft
                    </span>
                  </div>
                </div>

                {/* Completed task item */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="truncate">Updated task: Event landing page</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">Apr 29</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Marked complete in prototype
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal Before Executing Action Proposal */}
      {actionConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 animate-fade-rise">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Coordinator Draft</h3>
              </div>
              <button 
                onClick={() => setActionConfirmModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p>
                You are about to confirm and execute the following coordinator action locally:
              </p>
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-200 text-sm">{actionConfirmModal.title}</div>
                <p className="text-blue-700 dark:text-blue-300 text-xs">{actionConfirmModal.description}</p>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/60">
                  Simulated channel: <strong>{selectedChannel}</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                In PROJEX, consequential team requests require explicit human confirmation. Confirming updates your local workspace simulation; no external communications are sent.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setActionConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Confirm & Update Prototype
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
