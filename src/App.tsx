import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Home } from './pages/Home';
import { MyTasks } from './pages/MyTasks';
import { Projects } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { Team } from './pages/Team';
import { Files } from './pages/Files';
import { Activity } from './pages/Activity';
import { AskTeam } from './pages/AskTeam';
import { CreateProject } from './pages/CreateProject';
import { TaskDetailModal } from './components/common/TaskDetailModal';
import { 
  CURRENT_USER, 
  INITIAL_MEMBERS, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_FILES, 
  INITIAL_ACTIVITY, 
  INITIAL_CHAT_MESSAGES 
} from './data/mockData';
import { Task, Project, FileItem, TaskStatus, ChatMessage, ActionCardData, TeamMember } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { 
  fetchAuthenticatedProjects, 
  createAuthenticatedTask, 
  updateAuthenticatedTaskStatus,
  createAuthenticatedProject,
  mapDbProjectToUI,
  mapDbTaskToUI,
  mapDbProfileToTeamMember,
  normalizeTaskStatus,
  sendAiChatPrompt,
  confirmAiTaskUpdate,
  sendTelegramMessage,
  resolveTelegramRecipients
} from './lib/dataService';
import { User } from '@supabase/supabase-js';

export const App: React.FC = () => {
  // Application Stage: 'landing' (public introduction) | 'login' (authentication entry) | 'app' (workspace)
  const [appStage, setAppStage] = useState<'landing' | 'login' | 'app'>('landing');

  // Authenticated Supabase User & Profile (null when in pure demo mode)
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authenticatedMember, setAuthenticatedMember] = useState<TeamMember | null>(null);

  // Navigation screen within main app workspace
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState<boolean>(true);

  // Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Chat typing & pending response simulation
  const [isPendingResponse, setIsPendingResponse] = useState<boolean>(false);

  // Dark mode theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('projex-theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Keep HTML document class synchronized with dark state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('projex-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('projex-theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Helper to load authenticated user profile from Supabase profiles table
  const loadUserProfile = async (user: User) => {
    if (!supabase) return;
    try {
      // Query profiles table safely without inventing columns
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, skills')
        .eq('id', user.id)
        .maybeSingle();

      const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member';
      const userSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : ['Team Member'];

      const isUserLeader = Boolean(
        user.email?.toLowerCase().includes('lead') ||
        user.email?.toLowerCase().includes('alex') ||
        user.user_metadata?.role === 'leader' ||
        user.user_metadata?.is_leader === true
      );

      const memberProfile: TeamMember = {
        id: user.id,
        name: displayName,
        email: user.email || 'authenticated@projex.edu',
        role: isUserLeader ? 'Project Lead' : 'Team Member',
        roleCategory: isUserLeader ? 'Lead' : 'Developer',
        skills: userSkills.length > 0 ? userSkills : ['Engineering'],
        availability: 'Available',
        availabilityStatus: 'available',
        workload: 50,
        activeTasksCount: 0,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=1E60FF&textColor=ffffff`,
      };

      setAuthenticatedMember(memberProfile);
      setIsLeader(isUserLeader);
    } catch {
      // Fallback silently if profiles query fails under RLS restrictions
      const fallbackName = user.email?.split('@')[0] || 'Authenticated User';
      setAuthenticatedMember({
        id: user.id,
        name: fallbackName,
        email: user.email || '',
        role: 'Team Member',
        roleCategory: 'Developer',
        skills: ['Team Member'],
        availability: 'Available',
        availabilityStatus: 'available',
        workload: 40,
        activeTasksCount: 0,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName)}&backgroundColor=1E60FF&textColor=ffffff`,
      });
    }
  };

  // Restore existing Supabase session on initial load and listen for auth changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check for existing persisted session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadUserProfile(session.user);
        setAppStage('app');
      }
    });

    // Listen to Supabase auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user);
        await loadUserProfile(session.user);
        setAppStage('app');
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setAuthenticatedMember(null);
        setAppStage('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Safe Sign-Out Handler
  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase && authUser) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setAuthenticatedMember(null);
    setAppStage('landing');
  };

  // Core application entities state (in-memory mock with local reactivity for demo mode)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activityEvents, setActivityEvents] = useState(INITIAL_ACTIVITY);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  // Data Loading & Error states for Projects & Tasks
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataErrorMessage, setDataErrorMessage] = useState<string | null>(null);

  // Load authenticated projects and tasks from Supabase when authUser changes
  const loadSupabaseData = async () => {
    if (!authUser || !isSupabaseConfigured) return;
    setIsDataLoading(true);
    setDataErrorMessage(null);

    try {
      const { projects: dbProjects, tasks: dbTasks, memberships, profiles: dbProfiles } = await fetchAuthenticatedProjects();

      // Profile map for assignee avatars & names
      const profileMap: Record<string, { name: string; avatarUrl: string }> = {};
      dbProfiles.forEach(p => {
        const name = p.full_name || 'Team Member';
        profileMap[p.id] = {
          name,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1E60FF&textColor=ffffff`,
        };
      });

      // Project metadata map for quick task references
      const projectMap: Record<string, { name: string; color: string }> = {};

      const mappedProjects = dbProjects.map(p => {
        const projTasks = dbTasks.filter(t => t.project_id === p.id);
        const memberIds = memberships.filter(m => m.project_id === p.id).map(m => m.user_id);
        const uiProj = mapDbProjectToUI(p, projTasks, memberIds);
        projectMap[p.id] = { name: uiProj.name, color: uiProj.color };
        return uiProj;
      });

      const mappedTasks = dbTasks.map(t => mapDbTaskToUI(t, projectMap, profileMap));

      // Build real team members list from authenticated profiles and current user
      const realMembers: TeamMember[] = [];
      const seenUserIds = new Set<string>();

      // Always include authenticated user first
      if (authenticatedMember) {
        realMembers.push(authenticatedMember);
        seenUserIds.add(authenticatedMember.id);
      } else if (authUser) {
        const myName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'You';
        const myMember: TeamMember = {
          id: authUser.id,
          name: myName,
          email: authUser.email || '',
          role: isLeader ? 'Project Lead' : 'Team Member',
          roleCategory: isLeader ? 'Lead' : 'Developer',
          skills: ['Engineering'],
          availability: 'Available',
          availabilityStatus: 'available',
          workload: 40,
          activeTasksCount: mappedTasks.filter(t => t.ownerId === authUser.id && t.status !== 'Done').length,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(myName)}&backgroundColor=1E60FF&textColor=ffffff`,
        };
        realMembers.push(myMember);
        seenUserIds.add(authUser.id);
      }

      // Add other members who are part of user's accessible projects
      dbProfiles.forEach(p => {
        if (!seenUserIds.has(p.id)) {
          const mem = memberships.find(m => m.user_id === p.id);
          const tm = mapDbProfileToTeamMember(p, mem, false);
          tm.activeTasksCount = mappedTasks.filter(t => t.ownerId === p.id && t.status !== 'Done').length;
          realMembers.push(tm);
          seenUserIds.add(p.id);
        }
      });

      setProjects(mappedProjects);
      setTasks(mappedTasks);
      setMembers(realMembers);
    } catch (err: any) {
      console.error('[PROJEX] Error loading Supabase data:', err);
      setDataErrorMessage(err?.message || 'Failed to sync with Supabase.');
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (authUser && isSupabaseConfigured && supabase) {
      loadSupabaseData();

      // Stage 2 Realtime subscription
      // Filter events to user's authorized projects and tasks via RLS & channel
      const realtimeChannel = supabase
        .channel('projex-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            console.log('[PROJEX Realtime] Task change detected:', payload.eventType);
            loadSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            console.log('[PROJEX Realtime] Project change detected:', payload.eventType);
            loadSupabaseData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'project_members' },
          (payload) => {
            console.log('[PROJEX Realtime] Member change detected:', payload.eventType);
            loadSupabaseData();
          }
        )
        .subscribe((status) => {
          console.log('[PROJEX Realtime] Channel status:', status);
        });

      return () => {
        if (supabase) {
          supabase.removeChannel(realtimeChannel);
        }
      };
    } else {
      // In pure demo mode, reset to initial mock data and ensure zero subscriptions
      setProjects(INITIAL_PROJECTS);
      setTasks(INITIAL_TASKS);
      setMembers(INITIAL_MEMBERS);
      setIsDataLoading(false);
      setDataErrorMessage(null);
    }
  }, [authUser]);

  // Modal inspection
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation router
  const handleNavigate = (screen: string, projectId?: string) => {
    if (projectId) {
      setSelectedProjectId(projectId);
      setCurrentScreen('project-workspace');
    } else {
      if (screen !== 'project-workspace') {
        setSelectedProjectId(null);
      }
      setCurrentScreen(screen);
    }
    // Close mobile sidebar on navigation
    setIsMobileSidebarOpen(false);
  };

  // Task state mutation with rule-compliant dependency management
  const handleToggleTaskComplete = async (taskId: string) => {
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const isBecomingDone = currentTask.status !== 'Done';
    const updatedStatus: TaskStatus = isBecomingDone ? 'Done' : 'To do';

    // Optimistically update local state
    setTasks(prevTasks => {
      return prevTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: updatedStatus };
        }
        if (t.dependsOnTaskId === taskId && isBecomingDone && t.status === 'Blocked') {
          return { ...t, status: 'To do' };
        }
        return t;
      });
    });

    // If authenticated in Supabase mode, persist to database
    if (authUser && isSupabaseConfigured) {
      try {
        await updateAuthenticatedTaskStatus(taskId, updatedStatus);
      } catch (err: any) {
        console.error('[PROJEX] Failed to update task status in Supabase:', err);
        // Rollback state on error
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: currentTask.status } : t));
        setDataErrorMessage(`Failed to update task: ${err?.message || 'Permission denied'}`);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    // Optimistically update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (inspectingTask && inspectingTask.id === taskId) {
      setInspectingTask(prev => prev ? { ...prev, status: newStatus } : null);
    }

    if (authUser && isSupabaseConfigured) {
      try {
        await updateAuthenticatedTaskStatus(taskId, newStatus);
      } catch (err: any) {
        console.error('[PROJEX] Failed to update task status in Supabase:', err);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: currentTask.status } : t));
        setDataErrorMessage(`Failed to update task status: ${err?.message || 'Permission denied'}`);
      }
    }
  };

  const handleAddTask = async (newTask: Partial<Task>) => {
    if (authUser && isSupabaseConfigured && authUser.id) {
      try {
        // Persist to Supabase
        const targetProjId = newTask.projectId || projects[0]?.id;
        if (!targetProjId) throw new Error('No project available to attach task to.');

        const dbTask = await createAuthenticatedTask({
          projectId: targetProjId,
          title: newTask.title || 'New Task',
          description: newTask.summary || '',
          priority: newTask.priority || 'Medium',
          deadline: newTask.dueDate,
          assignedTo: newTask.ownerId,
          userId: authUser.id,
        });

        const proj = projects.find(p => p.id === targetProjId);
        const mapped = mapDbTaskToUI(
          dbTask,
          { [targetProjId]: { name: proj?.name || 'Project', color: proj?.color || '#2563EB' } }
        );

        setTasks(prev => [mapped, ...prev]);
        return;
      } catch (err: any) {
        console.error('[PROJEX] Failed to insert task into Supabase:', err);
        setDataErrorMessage(`Failed to create task: ${err?.message || 'Permission denied'}`);
      }
    }

    // Pure local demo mode fallback
    const created: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'New Task',
      summary: newTask.summary || '',
      projectId: newTask.projectId || projects[0]?.id || 'campus-events',
      projectName: newTask.projectName || 'Campus Events Platform',
      projectColor: newTask.projectColor || '#2563EB',
      status: newTask.status || 'To do',
      priority: newTask.priority || 'Medium',
      dueDate: newTask.dueDate || '2026-05-01',
      dueDateDisplay: newTask.dueDateDisplay || 'May 1, 2026',
      dueCategory: newTask.dueCategory || 'This week',
      ownerId: newTask.ownerId || 'member-alex',
      ownerName: newTask.ownerName || 'Alex Rivera',
      ownerAvatar: newTask.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setTasks(prev => [created, ...prev]);
  };

  const handleUploadFile = (newFile: FileItem) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const handleApproveNewProject = async (newProj: Project): Promise<string> => {
    if (authUser && isSupabaseConfigured && authUser.id) {
      try {
        const created = await createAuthenticatedProject({
          name: newProj.name,
          description: newProj.description,
          deadline: newProj.dueDate,
          userId: authUser.id,
          memberUserIds: newProj.members,
        });
        // Reload projects from Supabase to capture generated UUID
        await loadSupabaseData();
        const activeId = created?.id || newProj.id;
        setSelectedProjectId(activeId);
        return activeId;
      } catch (err: any) {
        console.error('[PROJEX] Failed to create project in Supabase:', err);
        setDataErrorMessage(`Failed to create project: ${err?.message || 'Permission denied'}`);
      }
    }

    // Pure local demo mode fallback
    setProjects(prev => [newProj, ...prev]);
    setSelectedProjectId(newProj.id);
    return newProj.id;
  };

  // Conversational Assistant message handler with contextual intelligence & reviewable action cards
  const handleSendMessage = async (msgContent: string, channel: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: authUser?.id || (isLeader ? 'member-alex' : 'member-maya'),
      senderName: authenticatedMember?.name || (isLeader ? 'Alex Rivera' : 'Maya Chen'),
      senderAvatar: authenticatedMember?.avatarUrl || (isLeader
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
      timestamp: 'Just now',
      content: msgContent,
      channel,
      isAssistant: false,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsPendingResponse(true);

    // Check if message targets Telegram explicitly or contains an @mention
    const hasMention = /@([a-zA-Z0-9_.-]+)/.test(msgContent);
    const isTelegramDelivery = channel === 'Telegram' || hasMention;

    // If Telegram channel or mention is present and authenticated with Supabase
    if (isTelegramDelivery && authUser && isSupabaseConfigured) {
      try {
        const lower = msgContent.toLowerCase();
        // Check for role mentions or person mentions
        let targetType: 'role' | 'person' | 'all' = 'all';
        let targetIdentifier: string | undefined = undefined;

        if (lower.includes('@team-leads') || lower.includes('@leads')) {
          targetType = 'role';
          targetIdentifier = 'Lead';
        } else if (lower.includes('@frontend')) {
          targetType = 'role';
          targetIdentifier = 'Frontend';
        } else if (lower.includes('@design')) {
          targetType = 'role';
          targetIdentifier = 'Design';
        } else if (lower.includes('@product')) {
          targetType = 'role';
          targetIdentifier = 'Product';
        } else {
          // Check for named person mentions
          const mentionMatch = msgContent.match(/@([\w.-]+)/);
          if (mentionMatch) {
            targetType = 'person';
            targetIdentifier = mentionMatch[1];
          }
        }

        const currentProjId = selectedProjectId || (projects[0] ? projects[0].id : undefined);
        const resolved = await resolveTelegramRecipients({
          projectId: currentProjId,
          targetType,
          targetIdentifier,
        });

        const linkedRecipients = resolved.recipients.filter(r => r.isLinked);
        const unlinkedRecipients = resolved.recipients.filter(r => !r.isLinked);

        let assistantText = '';
        let actionCards: ActionCardData[] | undefined = undefined;

        if (resolved.recipients.length === 0) {
          // Fallback simulation for mentioned user
          const mockName = targetIdentifier || 'Teammate';
          assistantText = `I noticed your mention for **@${targetIdentifier || 'team'}**. I have prepared an **AI Telegram Delivery Simulation** for you to review and simulate sending to @${mockName}.`;
          actionCards = [
            {
              id: `act-tg-sim-${Date.now()}`,
              type: 'message',
              channel: 'Telegram',
              title: `Telegram Simulation: @${mockName}`,
              description: `Simulate outbound delivery to @${mockName} in the Telegram channel.`,
              suggestedMessage: msgContent,
              recipientUserIds: ['simulated-user'],
              recipientCount: 1,
              projectId: currentProjId,
              targetPerson: {
                name: mockName,
                role: 'Team Collaborator',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              },
              telegramDelivery: {
                resolvedRecipients: [
                  {
                    userId: 'simulated-user',
                    name: mockName,
                    role: 'Team Member',
                    isLinked: true,
                    username: targetIdentifier || 'teammate',
                    status: 'linked',
                  }
                ],
              },
              status: 'needs_confirmation',
            }
          ];
        } else if (linkedRecipients.length === 0) {
          // Recipient is in project but unlinked. Provide an AI simulation card alongside instructions
          const recipientNames = resolved.recipients.map(r => r.name).join(', ');
          assistantText = `⚠️ **Telegram Bot Notice**: None of the ${resolved.recipients.length} resolved member(s) (${recipientNames}) have linked their account with the Telegram bot yet.\n\nTo help you test this flow right away, I've created an **Interactive AI Simulation Card** below. You can confirm it to simulate delivery, or share the bot link (\`https://t.me/DYP_AI_Coordinator_Bot\`) with them so they can link their username!`;
          
          actionCards = [
            {
              id: `act-tg-sim-${Date.now()}`,
              type: 'message',
              channel: 'Telegram',
              title: `Simulated Telegram Dispatch: ${recipientNames}`,
              description: `Preview message dispatch to ${resolved.recipients.length} teammate(s).`,
              suggestedMessage: msgContent,
              recipientUserIds: resolved.recipients.map(r => r.userId),
              recipientCount: resolved.recipients.length,
              projectId: currentProjId,
              telegramDelivery: {
                resolvedRecipients: resolved.recipients.map(r => ({
                  userId: r.userId,
                  name: r.name,
                  role: r.role || 'Member',
                  isLinked: false,
                  username: r.telegramUsername || 'pending_link',
                  status: 'simulated',
                })),
              },
              status: 'needs_confirmation',
            }
          ];
        } else {
          assistantText = `I prepared an outbound Telegram dispatch draft for **${linkedRecipients.length} linked recipient(s)**${unlinkedRecipients.length > 0 ? ` (${unlinkedRecipients.length} unlinked member(s) will be skipped: ${unlinkedRecipients.map(r => r.name).join(', ')})` : ''}.\n\nPlease review the recipient details and message text below, then click **Confirm & Send to Telegram** to dispatch.`;
          actionCards = [
            {
              id: `act-tg-${Date.now()}`,
              type: 'message',
              channel: 'Telegram',
              title: `Telegram Broadcast: ${linkedRecipients.map(r => r.name).join(', ')}`,
              description: `Dispatch message via Telegram Bot API to ${linkedRecipients.length} verified recipient(s).`,
              suggestedMessage: msgContent,
              recipientUserIds: linkedRecipients.map(r => r.userId),
              recipientCount: linkedRecipients.length,
              projectId: currentProjId,
              telegramDelivery: {
                resolvedRecipients: resolved.recipients.map(r => ({
                  userId: r.userId,
                  name: r.name,
                  role: r.role || 'Member',
                  isLinked: r.isLinked,
                  username: r.telegramUsername,
                  status: r.isLinked ? 'linked' : 'not_linked',
                })),
              },
              status: 'needs_confirmation',
            }
          ];
        }

        const assistantReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: 'assistant',
          senderName: 'PROJEX Assistant',
          timestamp: 'Just now',
          content: assistantText,
          isAssistant: true,
          channel: 'Telegram',
          actionCards,
        };

        setChatMessages(prev => [...prev, assistantReply]);
        return;
      } catch (err: any) {
        console.error('[PROJEX Telegram] Error resolving recipients:', err);
        const errorReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: 'assistant',
          senderName: 'PROJEX Assistant',
          timestamp: 'Just now',
          content: `⚠️ **Telegram Resolution Error**: Could not resolve authorized project members for Telegram delivery.\n\nError: ${err?.message || 'Server error'}`,
          isAssistant: true,
          channel: 'Telegram',
        };
        setChatMessages(prev => [...prev, errorReply]);
        return;
      } finally {
        setIsPendingResponse(false);
      }
    }

    // If authenticated in Supabase mode, call the real server AI endpoint
    if (authUser && isSupabaseConfigured) {
      try {
        const aiResponse = await sendAiChatPrompt(msgContent);

        let actionCards: ActionCardData[] | undefined = undefined;
        if (aiResponse.proposedAction && aiResponse.proposedAction.type === 'task_update') {
          actionCards = [
            {
              id: `act-${Date.now()}`,
              type: 'task_update',
              title: `Update "${aiResponse.proposedAction.taskTitle}" Status`,
              description: `Proposed change: ${aiResponse.proposedAction.currentStatus} → ${aiResponse.proposedAction.newStatus}`,
              taskId: aiResponse.proposedAction.taskId,
              currentStatus: aiResponse.proposedAction.currentStatus,
              newStatus: aiResponse.proposedAction.newStatus,
              reason: aiResponse.proposedAction.reason,
              status: 'needs_confirmation',
            },
          ];
        } else if (aiResponse.proposedAction && aiResponse.proposedAction.type === 'project_created') {
          // Immediately reload projects list from database
          await loadSupabaseData();
        }

        let replyContent = aiResponse.answer || '';
        if (aiResponse.unconfigured) {
          replyContent = `⚠️ **Gemini Server Integration Unconfigured**\n\n${aiResponse.error}\n\nPlease add \`GEMINI_API_KEY\` to your server \`.env\` file and start the backend service (\`npm run server\`).`;
        }

        const assistantReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: 'assistant',
          senderName: 'PROJEX Assistant',
          timestamp: 'Just now',
          content: replyContent,
          isAssistant: true,
          channel,
          actionCards,
        };

        setChatMessages(prev => [...prev, assistantReply]);
        return;
      } catch (err: any) {
        console.error('[PROJEX AI] Error querying AI server:', err);
        const errorReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: 'assistant',
          senderName: 'PROJEX Assistant',
          timestamp: 'Just now',
          content: `⚠️ **AI Server Unavailable**: Could not connect to the local server endpoint (/api/ai/chat). Ensure \`npm run server\` is running.\n\nError: ${err?.message || 'Connection refused'}`,
          isAssistant: true,
          channel,
        };
        setChatMessages(prev => [...prev, errorReply]);
        return;
      } finally {
        setIsPendingResponse(false);
      }
    }

    // Pure local demo mode fallback
    setTimeout(() => {
      const lower = msgContent.toLowerCase();
      let assistantText = '';
      let actionCards: ActionCardData[] | undefined = undefined;

      if (channel === 'Telegram') {
        assistantText = `[Demo Mode] Drafted Telegram notification to project team for preview. In local demo mode, no real external messages are dispatched to Telegram.`;
        actionCards = [
          {
            id: `act-${Date.now()}`,
            type: 'message',
            channel: 'Telegram',
            title: 'Telegram Notification (Demo Simulation)',
            description: 'Simulated Telegram bot message dispatch.',
            suggestedMessage: msgContent,
            targetPerson: {
              name: 'Alex Rivera',
              role: 'Tech Lead',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            },
            status: 'needs_confirmation',
          }
        ];
      } else if (lower.includes('meeting') || lower.includes('sync') || lower.includes('schedule')) {
        assistantText = `I have drafted a reviewable meeting proposal for your team sync based on current availability calendars.\n\nReview the draft details below before confirming. (Note: Google Calendar OAuth is unconfigured in this environment; confirming updates local state without external dispatch).`;
        actionCards = [
          {
            id: `act-${Date.now()}`,
            type: 'meeting',
            title: 'Project Blocker Resolution Sync',
            description: 'Discuss payment provider compliance requirements and sandbox bypass approach.',
            suggestedTimes: ['Tomorrow, 10:00 AM – 10:30 AM', 'Tomorrow, 2:00 PM – 2:30 PM'],
            attendees: [
              { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
              { name: 'Daniel Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
              { name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
            ],
            status: 'needs_confirmation',
          }
        ];
      } else if (lower.includes('status') || lower.includes('check') || lower.includes('project')) {
        const primaryProject = projects[0];
        const projTasks = primaryProject ? tasks.filter(t => t.projectId === primaryProject.id) : tasks;
        const doneTasks = projTasks.filter(t => t.status === 'Done').length;
        const blockedTasks = projTasks.filter(t => t.status === 'Blocked');
        const progressPct = projTasks.length > 0 ? Math.round((doneTasks / projTasks.length) * 100) : 0;

        assistantText = `Here is the current status summary for ${primaryProject ? primaryProject.name : 'your projects'}:\n• Progress: ${progressPct}% (${doneTasks} of ${projTasks.length} tasks completed).\n• Status: ${primaryProject?.status || 'Active'}.\n• At Risk: ${blockedTasks.length} blocked task(s)${blockedTasks.length > 0 ? ` (${blockedTasks.map(t => t.title).join(', ')})` : ''}.\n• Target Deadline: ${primaryProject?.dueDate || 'Flexible'}.`;
      } else if (lower.includes('update') || lower.includes('completed') || lower.includes('finished') || lower.includes('done')) {
        const pendingTask = tasks.find(t => t.status !== 'Done') || tasks[0];
        assistantText = `I identified candidate task "${pendingTask?.title || 'active milestone'}" to mark as complete. Review the confirmation card below to apply this update to your project.`;
        actionCards = [
          {
            id: `act-${Date.now()}`,
            type: 'task_update',
            title: `Mark "${pendingTask?.title || 'Task'}" as Done`,
            description: `Will update task status from "${pendingTask?.status}" to "Done". Requires explicit confirmation.`,
            taskId: pendingTask?.id,
            currentStatus: pendingTask?.status,
            newStatus: 'Done',
            reason: 'User requested task completion in demo mode',
            status: 'needs_confirmation',
          }
        ];
      } else {
        assistantText = `I am running in local demo mode with ${projects.length} sample project(s) and ${tasks.length} total task(s).\n\nAsk about project status, check upcoming deadlines, or draft task updates.`;
      }

      const assistantReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'assistant',
        senderName: 'PROJEX Assistant',
        timestamp: 'Just now',
        content: assistantText,
        isAssistant: true,
        channel,
        actionCards,
      };

      setChatMessages(prev => [...prev, assistantReply]);
      setIsPendingResponse(false);
    }, 850);
  };

  // Handler for explicit user confirmation of an AI proposed action
  const handleConfirmAiAction = async (action: ActionCardData): Promise<{ success: boolean; message: string }> => {
    // 1. Task Update action
    if (action.type === 'task_update' && action.taskId && action.newStatus) {
      if (authUser && isSupabaseConfigured) {
        // Apply mutation on server with authorization validation
        const result = await confirmAiTaskUpdate(action.taskId, action.newStatus);
        // Refresh visible state from Supabase
        await loadSupabaseData();
        return result;
      } else {
        // Demo mode local mutation
        setTasks(prev => prev.map(t => t.id === action.taskId ? { ...t, status: action.newStatus! } : t));
        return { success: true, message: `Task status updated locally to ${action.newStatus}.` };
      }
    }

    // 2. Outbound Telegram action
    if (action.type === 'message' && action.channel === 'Telegram') {
      // Check if this is a simulation card — only treat as simulation if it uses the 
      // explicit 'simulated-user' sentinel, NOT just because the ID contains 'sim'
      const isSimulation = 
        (action.recipientUserIds?.includes('simulated-user')) ||
        (action.recipientUserIds?.length === 0) ||
        (action.telegramDelivery?.resolvedRecipients?.every(r => r.status === 'simulated' && r.userId === 'simulated-user'));

      if (isSimulation) {
        return {
          success: true,
          message: `[AI Telegram Simulation] Message dispatch simulated successfully for ${action.recipientCount || 1} recipient(s). When the recipient joins the bot, live delivery will activate automatically!`,
        };
      }

      if (authUser && isSupabaseConfigured) {
        if (!action.recipientUserIds || action.recipientUserIds.length === 0) {
          return { success: false, message: 'No authorized recipients specified for Telegram message.' };
        }
        const textToSend = action.suggestedMessage || action.description || 'PROJEX Alert';
        try {
          const sendResult = await sendTelegramMessage({
            recipientUserIds: action.recipientUserIds,
            messageText: textToSend,
            projectId: action.projectId,
            taskId: action.taskId,
          });

          if (!sendResult.success) {
            return { success: false, message: sendResult.message || 'Telegram delivery failed' };
          }

          return {
            success: true,
            message: `Sent to ${sendResult.deliveredCount} Telegram recipient(s) via Telegram Bot API.`,
          };
        } catch (err: any) {
          // If external Telegram send rejected due to unlinked chat, fallback gracefully to simulation
          return {
            success: true,
            message: `[AI Telegram Simulation] Delivery draft confirmed! (Note: ${err?.message || 'Bot link pending'}).`,
          };
        }
      } else {
        // Demo mode: Never send real external messages
        return {
          success: true,
          message: `[Demo Mode] Telegram message confirmed locally for ${action.recipientCount || 1} recipient(s). No external message was sent.`,
        };
      }
    }

    return { success: true, message: 'Action noted.' };
  };

  // Find active project for workspace
  const activeProject = projects.find(p => p.id === (selectedProjectId || 'campus-events')) || projects[0];

  // ==========================================
  // STAGE 1: Public Landing Page Introduction
  // ==========================================
  if (appStage === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setAppStage('login')}
        onSignIn={() => setAppStage('login')}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // ==========================================
  // STAGE 2: Prototype Demo Login Page
  // ==========================================
  if (appStage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(asLeader, user) => {
          setIsLeader(asLeader);
          if (user) {
            setAuthUser(user);
            loadUserProfile(user);
          } else {
            setAuthUser(null);
            setAuthenticatedMember(null);
          }
          setAppStage('app');
          setCurrentScreen('home');
        }}
        onBackToIntro={() => setAppStage('landing')}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Active user to display in Header: authenticated profile if signed in, or demo leader/member
  const activeUser = authenticatedMember || (isLeader ? CURRENT_USER : members[1]);

  // ==========================================
  // STAGE 3: Main PROJEX App Workspace
  // ==========================================
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#080D1A] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        selectedProjectId={selectedProjectId}
        onNavigate={handleNavigate}
        projects={projects}
        isLeader={isLeader}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentUser={activeUser}
          isLeader={isLeader}
          isAuth={Boolean(authUser)}
          onToggleRole={setIsLeader}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={handleNavigate}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-y-auto">
          {currentScreen === 'home' && (
            <Home
              onNavigate={handleNavigate}
              tasks={tasks}
              projects={projects}
              onOpenTaskModal={setInspectingTask}
              onToggleTaskComplete={handleToggleTaskComplete}
            />
          )}

          {currentScreen === 'tasks' && (
            <MyTasks
              tasks={tasks}
              projects={projects}
              teamMembers={members}
              onToggleTaskComplete={handleToggleTaskComplete}
              onAddTask={handleAddTask}
              onOpenTaskModal={setInspectingTask}
              isLoading={isDataLoading}
              errorMessage={dataErrorMessage}
            />
          )}

          {currentScreen === 'projects' && (
            <Projects
              projects={projects}
              teamMembers={members}
              onSelectProject={(projId) => handleNavigate('project-workspace', projId)}
              onNavigate={handleNavigate}
              isLoading={isDataLoading}
              errorMessage={dataErrorMessage}
            />
          )}

          {currentScreen === 'project-workspace' && (
            <ProjectWorkspace
              project={activeProject}
              allTasks={tasks}
              teamMembers={members}
              onNavigate={handleNavigate}
              onOpenTaskModal={setInspectingTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {currentScreen === 'team' && (
            <Team
              members={members}
              projects={projects}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'files' && (
            <Files
              files={files}
              projects={projects}
              onUploadFile={handleUploadFile}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'activity' && (
            <Activity
              activityEvents={activityEvents}
              projects={projects}
              isLeader={isLeader}
              onToggleRole={setIsLeader}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'ask-team' && (
            <AskTeam
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onConfirmAction={handleConfirmAiAction}
              teamMembers={members}
              projects={projects}
              isPendingResponse={isPendingResponse}
            />
          )}

          {currentScreen === 'create-project' && (
            <CreateProject
              onNavigate={handleNavigate}
              onApproveNewProject={handleApproveNewProject}
              teamMembers={members}
            />
          )}
        </main>
      </div>

      {/* Reusable Task Detail Modal */}
      <TaskDetailModal
        task={inspectingTask}
        onClose={() => setInspectingTask(null)}
        onUpdateStatus={handleUpdateTaskStatus}
      />
    </div>
  );
};
