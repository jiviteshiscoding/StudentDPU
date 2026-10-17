import { Project, Task, TaskStatus, Priority, ProjectStatus, TeamMember } from '../types';
import { supabase } from './supabase';

/**
 * Stage 3A Supabase Data Access Service
 *
 * Adheres strictly to:
 * - Least-privilege columns and verified schema
 * - Preserves in-memory mock demo mode when Supabase is not in authenticated mode
 * - Task status bidirectional canonical mapping (pending/todo -> To do, completed -> Done, etc.)
 * - Deterministic UUID color generation
 * - Progress computation from completed/total tasks
 */

export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  deadline: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  deadline: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string | null;
  revoked_at: string | null;
}

export interface DbProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  skills: string[] | null;
}

// ------------------------------------------------------------------
// STATUS NORMALIZATION & MAPPING
// ------------------------------------------------------------------

/**
 * Normalizes database status strings to the UI's TaskStatus enum.
 * Telegram & DB "pending" / "todo" -> "To do"
 * "in_progress" -> "In progress"
 * "completed" -> "Done"
 * "blocked" -> "Blocked"
 * "in_review" -> "In Review"
 */
export function normalizeTaskStatus(rawStatus: string | null | undefined): TaskStatus {
  if (!rawStatus) return 'To do';

  const s = rawStatus.trim().toLowerCase();
  switch (s) {
    case 'pending':
    case 'todo':
    case 'to do':
      return 'To do';
    case 'in progress':
    case 'in_progress':
    case 'doing':
      return 'In progress';
    case 'completed':
    case 'done':
      return 'Done';
    case 'blocked':
      return 'Blocked';
    case 'in review':
    case 'in_review':
    case 'review':
      return 'In Review';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    case 'backlog':
      return 'Backlog';
    default:
      console.warn(`[PROJEX] Unknown task status in database: "${rawStatus}". Preserving safe fallback.`);
      return 'To do';
  }
}

/**
 * Converts a UI TaskStatus into the database's canonical string.
 */
export function toCanonicalDbTaskStatus(status: TaskStatus): string {
  switch (status) {
    case 'Done':
      return 'completed';
    case 'In progress':
      return 'in_progress';
    case 'Blocked':
      return 'blocked';
    case 'In Review':
      return 'in_review';
    case 'Cancelled':
      return 'cancelled';
    case 'To do':
    case 'Backlog':
    default:
      return 'pending';
  }
}

/**
 * Normalizes database project status to UI ProjectStatus enum.
 */
export function normalizeProjectStatus(rawStatus: string | null | undefined): ProjectStatus {
  if (!rawStatus) return 'Planning';

  const s = rawStatus.trim().toLowerCase();
  switch (s) {
    case 'on track':
    case 'active':
    case 'in_progress':
      return 'On track';
    case 'at risk':
    case 'at_risk':
      return 'At risk';
    case 'completed':
    case 'done':
      return 'Completed';
    case 'planning':
    default:
      return 'Planning';
  }
}

/**
 * Generates a consistent, aesthetic theme color from a project's UUID.
 */
export function getProjectColorFromId(id: string): string {
  const PALETTE = [
    '#2563EB', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
  ];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

// ------------------------------------------------------------------
// DATA ADAPTERS (DB -> UI TYPES)
// ------------------------------------------------------------------

export function mapDbProjectToUI(
  dbProj: DbProject,
  tasksForProj: DbTask[] = [],
  memberIds: string[] = []
): Project {
  const totalTasks = tasksForProj.length;
  const completedTasks = tasksForProj.filter(t => normalizeTaskStatus(t.status) === 'Done').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format deadline for UI
  const dueDateStr = dbProj.deadline ? dbProj.deadline.split('T')[0] : 'No deadline';

  return {
    id: dbProj.id,
    name: dbProj.name,
    color: getProjectColorFromId(dbProj.id),
    description: dbProj.description || 'No description provided.',
    status: normalizeProjectStatus(dbProj.status),
    progress,
    dueDate: dueDateStr,
    milestonesTotal: totalTasks,
    milestonesCompleted: completedTasks,
    milestonesInProgress: tasksForProj.filter(t => normalizeTaskStatus(t.status) === 'In progress').length,
    milestonesUpcoming: tasksForProj.filter(t => normalizeTaskStatus(t.status) === 'To do').length,
    members: memberIds.length > 0 ? memberIds : [dbProj.created_by],
  };
}

export function mapDbTaskToUI(
  dbTask: DbTask,
  projectNameMap: Record<string, { name: string; color: string }>,
  profileMap: Record<string, { name: string; avatarUrl: string }> = {}
): Task {
  const projInfo = projectNameMap[dbTask.project_id] || {
    name: 'General Project',
    color: getProjectColorFromId(dbTask.project_id),
  };

  const assignedProfile = dbTask.assigned_to ? profileMap[dbTask.assigned_to] : null;
  const ownerName = assignedProfile?.name || 'Unassigned';
  const ownerAvatar = assignedProfile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}&backgroundColor=E2E8F0&textColor=475569`;

  const dueStr = dbTask.deadline ? dbTask.deadline.split('T')[0] : '2026-05-01';

  // Calculate due category relative to today
  let dueCategory: 'Overdue' | 'Due today' | 'This week' | 'Later' = 'Later';
  if (dbTask.deadline) {
    const dueTime = new Date(dbTask.deadline).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) dueCategory = 'Overdue';
    else if (diffDays === 0) dueCategory = 'Due today';
    else if (diffDays <= 7) dueCategory = 'This week';
    else dueCategory = 'Later';
  }

  const priorityNormalized: Priority = 
    dbTask.priority?.toLowerCase() === 'high' ? 'High' :
    dbTask.priority?.toLowerCase() === 'low' ? 'Low' : 'Medium';

  return {
    id: dbTask.id,
    title: dbTask.title,
    summary: dbTask.description || '',
    projectId: dbTask.project_id,
    projectName: projInfo.name,
    projectColor: projInfo.color,
    status: normalizeTaskStatus(dbTask.status),
    priority: priorityNormalized,
    dueDate: dueStr,
    dueDateDisplay: dueStr,
    dueCategory,
    ownerId: dbTask.assigned_to || '',
    ownerName,
    ownerAvatar,
  };
}

export function mapDbProfileToTeamMember(
  profile: DbProfile,
  membership?: DbProjectMember,
  isLeader: boolean = false,
  userEmail?: string
): TeamMember {
  const displayName = profile.full_name || 'Team Member';
  const roleName = isLeader 
    ? 'Project Lead' 
    : (membership?.role ? (membership.role.charAt(0).toUpperCase() + membership.role.slice(1)) : 'Developer');
  const roleCategory = isLeader ? 'Lead' : (roleName.includes('Design') ? 'Designer' : 'Developer');
  const skills = Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills : ['Engineering'];

  return {
    id: profile.id,
    name: displayName,
    email: userEmail || `${displayName.toLowerCase().replace(/\s+/g, '.')}@projex.edu`,
    role: roleName,
    roleCategory,
    skills,
    availability: 'Available',
    availabilityStatus: 'available',
    workload: 40,
    activeTasksCount: 0,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=1E60FF&textColor=ffffff`,
  };
}

// ------------------------------------------------------------------
// SUPABASE OPERATIONS (AUTHENTICATED ONLY)
// ------------------------------------------------------------------

/**
 * Fetches all projects accessible to the authenticated user.
 */
export async function fetchAuthenticatedProjects(): Promise<{
  projects: DbProject[];
  tasks: DbTask[];
  memberships: DbProjectMember[];
  profiles: DbProfile[];
}> {
  if (!supabase) throw new Error('Supabase client is not available.');

  // 1. Fetch accessible projects
  const { data: projects, error: pError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (pError) throw pError;

  const projectIds = (projects || []).map(p => p.id);

  if (projectIds.length === 0) {
    return { projects: [], tasks: [], memberships: [], profiles: [] };
  }

  // 2. Fetch tasks for accessible projects
  const { data: tasks, error: tError } = await supabase
    .from('tasks')
    .select('*')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false });

  if (tError) throw tError;

  // 3. Fetch project members
  const { data: memberships, error: pmError } = await supabase
    .from('project_members')
    .select('*')
    .in('project_id', projectIds)
    .is('revoked_at', null);

  if (pmError) console.warn('[PROJEX] Could not fetch project members:', pmError.message);

  // 4. Fetch profiles of involved users
  const userIds = Array.from(new Set([
    ...(projects || []).map(p => p.created_by),
    ...(tasks || []).map(t => t.assigned_to).filter(Boolean) as string[],
    ...(memberships || []).map(m => m.user_id)
  ]));

  let profiles: DbProfile[] = [];
  if (userIds.length > 0) {
    const { data: profData, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, skills')
      .in('id', userIds);

    if (profError) {
      console.warn('[PROJEX] Could not fetch profiles under RLS:', profError.message);
    } else {
      profiles = profData || [];
    }
  }

  return {
    projects: projects || [],
    tasks: tasks || [],
    memberships: memberships || [],
    profiles: profiles || []
  };
}

/**
 * Creates a project in Supabase under RLS.
 */
export async function createAuthenticatedProject(params: {
  name: string;
  description?: string;
  deadline?: string;
  userId: string;
  memberUserIds?: string[];
}): Promise<{ id: string; name: string } | null> {
  if (!supabase) throw new Error('Supabase client is not available.');

  // 1. PostgREST INSERT without select() avoids header evaluation collisions under WITH CHECK policies
  const { error } = await supabase.from('projects').insert({
    name: params.name.trim(),
    description: params.description?.trim() || null,
    deadline: params.deadline || null,
    created_by: params.userId,
    status: 'planning',
  });

  if (error) throw error;

  // 2. Query back the created project to obtain its id for member insertion
  const { data: createdProj } = await supabase
    .from('projects')
    .select('id, name')
    .eq('created_by', params.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (createdProj) {
    // Always add the creator as a project member first
    const allMemberIds = [params.userId];
    
    // Then add any additional members (validated UUIDs, excluding duplicates)
    if (params.memberUserIds && params.memberUserIds.length > 0) {
      const validMemberIds = params.memberUserIds.filter(id => 
        id !== params.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      );
      allMemberIds.push(...validMemberIds);
    }

    for (const memId of allMemberIds) {
      try {
        const { error: memError } = await supabase.from('project_members').insert({
          project_id: createdProj.id,
          user_id: memId,
          role: 'member',
        });
        if (memError) {
          console.warn('[PROJEX] Could not insert project member row:', memError.message);
          // Fallback: try via server endpoint with service role key
          try {
            await fetch('/api/projects/add-member', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
              body: JSON.stringify({ projectId: createdProj.id, userId: memId, role: 'member' }),
            });
          } catch (_) { /* best effort */ }
        }
      } catch (mErr) {
        console.warn('[PROJEX] Could not insert project member row:', mErr);
      }
    }
  }

  return createdProj ? { id: createdProj.id, name: createdProj.name } : null;
}

/**
 * Inserts a new task for an accessible project.
 */
export async function createAuthenticatedTask(params: {
  projectId: string;
  title: string;
  description?: string;
  priority?: Priority;
  deadline?: string;
  assignedTo?: string;
  userId: string;
}): Promise<DbTask> {
  if (!supabase) throw new Error('Supabase client is not available.');

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: params.projectId,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      priority: (params.priority || 'Medium').toLowerCase(),
      deadline: params.deadline ? `${params.deadline}T00:00:00+00:00` : null,
      assigned_to: params.assignedTo || null,
      created_by: params.userId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates a task status using strictly the permitted (status, updated_at) columns.
 */
export async function updateAuthenticatedTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
  if (!supabase) throw new Error('Supabase client is not available.');

  const canonicalStatus = toCanonicalDbTaskStatus(newStatus);

  // Send ONLY status and updated_at matching the column-level grant
  const { error } = await supabase
    .from('tasks')
    .update({
      status: canonicalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) throw error;
}

// ------------------------------------------------------------------
// SERVER-SIDE AI CLIENT METHODS
// ------------------------------------------------------------------

export interface AiChatResponse {
  answer?: string;
  proposedAction?: {
    type: 'task_update';
    taskId: string;
    taskTitle: string;
    currentStatus: string;
    newStatus: TaskStatus;
    reason: string;
  } | {
    type: 'project_created';
    projectId?: string | null;
    title: string;
    description?: string;
    deadline?: string | null;
    members?: string[];
    createdSuccessfully?: boolean;
  };
  error?: string;
  unconfigured?: boolean;
}

/**
 * Sends a user prompt to the secure server AI endpoint using the authenticated user JWT.
 */
export async function sendAiChatPrompt(prompt: string): Promise<AiChatResponse> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to query the AI assistant.');
  }

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 503 && data.error === 'AI_NOT_CONFIGURED') {
    return {
      unconfigured: true,
      error: data.message || 'GEMINI_API_KEY is not configured on the server.',
    };
  }

  if (!response.ok) {
    throw new Error(data.error || `Server returned error (${response.status})`);
  }

  return data;
}

/**
 * Confirms an AI-proposed task status update through the secure server endpoint.
 */
export async function confirmAiTaskUpdate(taskId: string, newStatus: TaskStatus): Promise<{ success: boolean; message: string }> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to confirm AI actions.');
  }

  const response = await fetch('/api/ai/confirm-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ taskId, newStatus }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Action confirmation failed (${response.status})`);
  }

  return data;
}

// ------------------------------------------------------------------
export interface TelegramRecipientResolution {
  userId: string;
  name: string;
  isLinked: boolean;
  telegramUsername: string | null;
  messagingAccountId: string | null;
  role?: string;
}

/**
 * Resolves Telegram account links and permissions for a candidate recipient or role.
 */
export async function resolveTelegramRecipients(params: {
  targetType: 'person' | 'role' | 'team' | 'all';
  targetIdentifier?: string;
  projectId?: string;
}): Promise<{ recipients: TelegramRecipientResolution[] }> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to resolve Telegram recipients.');
  }

  const response = await fetch('/api/telegram/resolve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Recipient resolution failed (${response.status})`);
  }

  return { recipients: data.recipients || [] };
}

/**
 * Sends a confirmed outbound Telegram notification through the secure server Bot API endpoint.
 */
export async function sendTelegramMessage(params: {
  recipientUserIds: string[];
  messageText: string;
  projectId?: string;
  taskId?: string;
}): Promise<{ success: boolean; deliveredCount: number; message: string }> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to send Telegram messages.');
  }

  const response = await fetch('/api/telegram/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Telegram delivery rejected (${response.status})`);
  }

  return data;
}

// ------------------------------------------------------------------
// PROJECT INVITES & ACCOUNT LINKING CLIENT METHODS
// ------------------------------------------------------------------

export interface ProjectInviteResult {
  success: boolean;
  inviteCode: string;
  telegramUsername?: string;
  inviteEmail?: string;
  projectName: string;
  expiresAt: string;
  botLink: string;
  instructions: string;
  simulatedEmail?: {
    to: string;
    subject: string;
    previewHtml: string;
    status: string;
  };
}

/**
 * Creates an expiring, single-use invite code bound to a project and Telegram username or Email.
 */
export async function createProjectInvite(params: {
  projectId: string;
  telegramUsername?: string;
  email?: string;
  role?: string;
  welcomeMessage?: string;
}): Promise<ProjectInviteResult> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in as a project leader to create an invite.');
  }

  const response = await fetch('/api/invites/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Invite creation failed (${response.status})`);
  }

  return {
    ...data,
    inviteEmail: data.email || params.email,
  };
}

export interface TelegramStatusResult {
  linked: boolean;
  status: 'connected' | 'pending_link' | 'not_linked';
  telegramUsername: string | null;
  chatId: string | null;
  botUsername: string;
  botLink: string;
  instructions?: string;
  lastSeenAt?: string;
}

/**
 * Fetches the current user's Telegram link and connection status.
 */
export async function fetchTelegramStatus(): Promise<TelegramStatusResult> {
  if (!supabase) {
    return {
      linked: false,
      status: 'not_linked',
      telegramUsername: null,
      chatId: null,
      botUsername: 'DYP_AI_Coordinator_Bot',
      botLink: 'https://t.me/DYP_AI_Coordinator_Bot',
    };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return {
      linked: false,
      status: 'not_linked',
      telegramUsername: null,
      chatId: null,
      botUsername: 'DYP_AI_Coordinator_Bot',
      botLink: 'https://t.me/DYP_AI_Coordinator_Bot',
    };
  }

  try {
    const response = await fetch('/api/telegram/status', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Telegram status');
    }

    return await response.json();
  } catch (err) {
    return {
      linked: false,
      status: 'not_linked',
      telegramUsername: null,
      chatId: null,
      botUsername: 'DYP_AI_Coordinator_Bot',
      botLink: 'https://t.me/DYP_AI_Coordinator_Bot',
    };
  }
}

/**
 * Links a Telegram username to the current authenticated user.
 */
export async function linkTelegramUsername(telegramUsername: string): Promise<{
  success: boolean;
  status: 'connected' | 'pending_link';
  telegramUsername: string;
  botLink?: string;
  message: string;
}> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to link your Telegram username.');
  }

  const response = await fetch('/api/telegram/link-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ telegramUsername }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to link Telegram username');
  }

  return data;
}

/**
 * Redeems an invite code and links the authenticated user's account to the verified Telegram account.
 */
export async function redeemProjectInvite(params: {
  code: string;
  telegramUserId?: string;
  telegramChatId?: string;
}): Promise<{ success: boolean; projectName: string; role: string; message: string }> {
  if (!supabase) throw new Error('Supabase client not initialized.');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to link your account and redeem this invite.');
  }

  const response = await fetch('/api/invites/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Invite redemption failed (${response.status})`);
  }

  return data;
}

export interface InAppNotification {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  message: string;
  senderUserId?: string;
  type: string;
  isRead: boolean;
  telegramDeliveryStatus: 'pending' | 'sent' | 'failed' | 'skipped';
  createdAt: string;
}

/**
 * Fetches member's in-app inbox notifications.
 */
export async function fetchInAppNotifications(): Promise<InAppNotification[]> {
  if (!supabase) return [];

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return [];

  const response = await fetch('/api/notifications', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  return data.notifications || [];
}


