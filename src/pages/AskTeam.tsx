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
  onConfirmAction?: (action: ActionCardData) => Promise<{ success: boolean; message: string }>;
  teamMembers: TeamMember[];
  projects: Project[];
  isPendingResponse?: boolean;
}

export const AskTeam: React.FC<AskTeamProps> = ({
  messages,
  onSendMessage,
  onConfirmAction,
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

  // Telegram link status & inputs
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
  const [sideTgUsername, setSideTgUsername] = useState('');
  const [isLinkingTg, setIsLinkingTg] = useState(false);

  useEffect(() => {
    let isMounted = true;
    import('../lib/dataService').then(({ fetchTelegramStatus }) => {
      fetchTelegramStatus()
        .then(tg => {
          if (isMounted && tg) {
            setTelegramStatus(tg);
            if (tg.telegramUsername) {
              setSideTgUsername(tg.telegramUsername.replace(/^@/, ''));
            }
          }
        })
        .catch(() => {});
    });
    return () => { isMounted = false; };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const channels = [
    { name: 'In-app chat', status: 'Active', note: 'Primary workspace thread' },
    { name: 'Telegram', status: 'Demo', note: 'Simulated Bot integration' },
    { name: 'Discord', status: 'Demo', note: 'Simulated Webhook integration' },
    { name: 'WhatsApp', status: 'Not connected', note: 'Requires Meta API key' },
    { name: 'Email', status: 'Not connected', note: 'Requires SMTP service' },
  ];

  // Derive mentions dynamically from actual team members
  const peopleMentions = (teamMembers || []).map(m => ({
    name: m.name,
    role: m.role || 'Member',
    handle: `@${m.name.split(' ')[0]}`,
    avatar: m.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`,
  }));

  const roleMentions = [
    { name: 'team-leads', desc: 'Project Leadership', handle: '@team-leads', icon: Users },
    { name: 'frontend', desc: 'UI & Integration', handle: '@frontend', icon: Code },
    { name: 'design', desc: 'Wireframes & UI System', handle: '@design', icon: Palette },
    { name: 'product', desc: 'Scope & User Feedback', handle: '@product', icon: Briefcase },
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

  const handleConfirmAction = async () => {
    if (!actionConfirmModal) return;
    const action = actionConfirmModal;
    
    if (onConfirmAction && (action.type === 'task_update' || action.channel === 'Telegram')) {
      try {
        const res = await onConfirmAction(action);
        if (!res.success) {
          setToastMessage(`Delivery Failed: ${res.message}`);
          setTimeout(() => setToastMessage(null), 6000);
          return;
        }
        setSentActionIds(prev => ({ ...prev, [action.id]: true }));
        setActionConfirmModal(null);
        setToastMessage(res.message || `Sent: "${action.title}"`);
        setTimeout(() => setToastMessage(null), 5000);
      } catch (err: any) {
        setToastMessage(`Error: ${err?.message || 'Failed to dispatch action'}`);
        setTimeout(() => setToastMessage(null), 6000);
      }
    } else {
      setSentActionIds(prev => ({ ...prev, [action.id]: true }));
      setActionConfirmModal(null);
      setToastMessage(`Draft confirmed locally: "${action.title}". Note: No external message or calendar event was created.`);
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
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Project Context Engine Active</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                Gemini API Key: Server Unconfigured
              </span>
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
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                      isSent 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    }`}>
                                      {isSent ? '✓ Confirmed & Applied' : '⚠️ Draft · Needs confirmation'}
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
                                    {card.channel === 'Telegram' && card.telegramDelivery?.resolvedRecipients ? (
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                          <span className="flex items-center gap-1.5">
                                            <ChannelBrandIcon channel="Telegram" size={13} />
                                            <span>Target Telegram Recipients:</span>
                                          </span>
                                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                            {card.telegramDelivery.resolvedRecipients.filter(r => r.isLinked).length} Linked
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {card.telegramDelivery.resolvedRecipients.map((rec, i) => (
                                            <div key={i} className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                                              <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.name}</span>
                                                <span className="text-[10px] text-slate-400 truncate">({rec.role})</span>
                                              </div>
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                                rec.isLinked
                                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                              }`}>
                                                {rec.isLinked ? '✓ Telegram Linked' : '✗ Unlinked'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
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
                                    )}
                                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                      "{card.suggestedMessage}"
                                    </div>
                                  </div>
                                )}

                                {/* Task Update Details */}
                                {card.type === 'task_update' && (
                                  <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
                                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                        {card.currentStatus || 'To do'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-500 dark:text-slate-400">Proposed Status:</span>
                                      <span className="font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-[#1E60FF] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        {card.newStatus || 'Done'}
                                      </span>
                                    </div>
                                    {card.reason && (
                                      <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">Reason: </span>
                                        {card.reason}
                                      </div>
                                    )}
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
                                        : card.channel === 'Telegram'
                                        ? 'bg-[#229ED9] hover:bg-[#1E8BBE] text-white'
                                        : 'bg-[#1E60FF] hover:bg-[#1A53DE] text-white'
                                    }`}
                                  >
                                    {isSent ? 'Sent' : card.channel === 'Telegram' ? 'Review & Send' : 'Confirm Action'}
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

        {/* Right Side Panels: Telegram Status, People & Roles, Recent Requests (4 cols, collapsible) */}
        {showSidePanels && (
          <div className="lg:col-span-4 space-y-6 animate-fade-rise">
            {/* Telegram Bot Integration Card */}
            <div className="bg-white dark:bg-[#0D131F] rounded-3xl border border-[#E2E8F0] dark:border-slate-800/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#229ED9] flex items-center justify-center">
                    <ChannelBrandIcon channel="Telegram" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">Telegram AI Bot</h3>
                    <div className="text-[10px] text-slate-400">Inbound task listener & mentions</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  telegramStatus.status === 'connected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : telegramStatus.status === 'pending_link'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {telegramStatus.status === 'connected'
                    ? 'Connected'
                    : telegramStatus.status === 'pending_link'
                    ? 'Pending Link'
                    : 'Not Linked'}
                </span>
              </div>

              {/* Show username prompt if not linked */}
              {telegramStatus.status !== 'connected' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center justify-between">
                    <span>Connect your Telegram</span>
                    <span className="text-[9px] text-[#229ED9]">Required for mentions</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">@</span>
                      <input
                        type="text"
                        placeholder="telegram_username"
                        value={sideTgUsername}
                        onChange={(e) => setSideTgUsername(e.target.value.replace(/^@/, ''))}
                        className="w-full pl-6 pr-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#229ED9]"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isLinkingTg || !sideTgUsername.trim()}
                      onClick={async () => {
                        setIsLinkingTg(true);
                        try {
                          const { linkTelegramUsername, fetchTelegramStatus } = await import('../lib/dataService');
                          const res = await linkTelegramUsername(sideTgUsername.trim());
                          setToastMessage(res.message);
                          const updated = await fetchTelegramStatus();
                          setTelegramStatus(updated);
                        } catch (err: any) {
                          setToastMessage(err.message || 'Failed to link');
                        } finally {
                          setIsLinkingTg(false);
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#229ED9] hover:bg-[#1E8BBE] text-white rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                      {isLinkingTg ? 'Saving...' : 'Link'}
                    </button>
                  </div>
                  {telegramStatus.status === 'pending_link' && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400">
                      Almost there! Send <code className="bg-amber-100 dark:bg-amber-950 px-1 rounded">/start</code> to <a href={telegramStatus.botLink} target="_blank" rel="noreferrer" className="underline font-bold">@DYP_AI_Coordinator_Bot</a> to finish.
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Commands sent to the Telegram bot automatically sync to your database and update this website in real time:
              </p>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                <div><span className="text-[#1E60FF] font-bold">/projects</span> — List accessible projects</div>
                <div><span className="text-[#1E60FF] font-bold">/tasks 1</span> — List tasks in project #1</div>
                <div><span className="text-[#1E60FF] font-bold">/task 1 Title</span> — Create new task</div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 flex items-center justify-between">
                <span>Bot: @DYP_AI_Coordinator_Bot</span>
                <a href={telegramStatus.botLink || 'https://t.me/DYP_AI_Coordinator_Bot'} target="_blank" rel="noreferrer" className="text-[#229ED9] hover:underline font-semibold">
                  Open Bot ↗
                </a>
              </div>
            </div>

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
                {peopleMentions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No team members added yet
                  </div>
                ) : (
                  peopleMentions.map((p) => (
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
                  ))
                )}
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
                {actionConfirmModal.type === 'task_update'
                  ? 'Review the proposed database update before applying:'
                  : actionConfirmModal.channel === 'Telegram'
                  ? 'Review the Telegram broadcast message before sending via official Bot API:'
                  : 'You are about to confirm and execute the following coordinator action locally:'}
              </p>
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-200 text-sm">{actionConfirmModal.title}</div>
                <p className="text-blue-700 dark:text-blue-300 text-xs">{actionConfirmModal.description}</p>
                {actionConfirmModal.type === 'task_update' ? (
                  <div className="text-[11px] text-blue-800 dark:text-blue-300 pt-1.5 border-t border-blue-200/50 dark:border-blue-900/60 flex items-center justify-between">
                    <span>Target: <strong>{actionConfirmModal.currentStatus} → {actionConfirmModal.newStatus}</strong></span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">status, updated_at only</span>
                  </div>
                ) : actionConfirmModal.channel === 'Telegram' ? (
                  <div className="text-[11px] text-blue-800 dark:text-blue-300 pt-1.5 border-t border-blue-200/50 dark:border-blue-900/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Delivery Channel: <strong>Official Telegram Bot API</strong></span>
                      <span className="text-[10px] bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-1.5 py-0.5 rounded">Verified Chat ID</span>
                    </div>
                    {actionConfirmModal.suggestedMessage && (
                      <div className="text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-slate-900/70 p-2 rounded border border-blue-100 dark:border-blue-900">
                        "{actionConfirmModal.suggestedMessage}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/60">
                    Simulated channel: <strong>{selectedChannel}</strong>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {actionConfirmModal.type === 'task_update'
                  ? 'In PROJEX, AI-proposed database mutations require explicit human review. Confirming updates the live database.'
                  : actionConfirmModal.channel === 'Telegram'
                  ? 'Outbound Telegram messages are delivered directly to verified recipients who have started the PROJEX bot. Delivery will be logged to message_events.'
                  : 'In PROJEX, consequential team requests require explicit human confirmation. Confirming updates your local workspace simulation; no external communications are sent.'}
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
                className={`px-4 py-2 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs ${
                  actionConfirmModal.channel === 'Telegram'
                    ? 'bg-[#229ED9] hover:bg-[#1E8BBE]'
                    : 'bg-[#1E60FF] hover:bg-[#1A53DE]'
                }`}
              >
                {actionConfirmModal.type === 'task_update'
                  ? 'Confirm & Apply Update'
                  : actionConfirmModal.channel === 'Telegram'
                  ? 'Confirm & Send to Telegram'
                  : 'Confirm & Update Prototype'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
