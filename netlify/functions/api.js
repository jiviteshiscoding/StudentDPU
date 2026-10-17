// Netlify Serverless Function - Wraps all /api/* endpoints from server.js
// This is a single catch-all function that handles all API routes.

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Environment variables (set in Netlify dashboard)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'DYP_AI_Coordinator_Bot';

// Supabase admin client (service role - bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

// In-memory vaults (note: these reset on cold starts in serverless)
const IN_MEMORY_INVITES = new Map();
const IN_MEMORY_NOTIFICATIONS = new Map();
const ATTEMPT_RATE_LIMITS = new Map();

const ALLOWED_TASK_STATUSES = ['Backlog', 'To do', 'In progress', 'Blocked', 'In Review', 'Done', 'Cancelled'];

function hashInviteCode(code) {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

function checkRateLimit(key, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = ATTEMPT_RATE_LIMITS.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  ATTEMPT_RATE_LIMITS.set(key, entry);
  return entry.count <= limit;
}

// Helper to return JSON responses
function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(data),
  };
}

// Authenticate user from JWT
async function authenticateUser(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error('[API] Auth error:', err);
    return null;
  }
}

// Get authorized project context for a user
async function getAuthorizedUserContext(userId) {
  const [ownedProjects, memberships] = await Promise.all([
    supabaseAdmin.from('projects').select('id, name, description, status, deadline, created_by').eq('created_by', userId),
    supabaseAdmin.from('project_members').select('project_id, role').eq('user_id', userId).is('revoked_at', null),
  ]);

  const projectIds = new Set([
    ...(ownedProjects.data || []).map(p => p.id),
    ...(memberships.data || []).map(m => m.project_id),
  ]);

  if (projectIds.size === 0) {
    return { projects: [], tasks: [] };
  }

  const [projectsRes, tasksRes, membersRes, profilesRes] = await Promise.all([
    supabaseAdmin.from('projects').select('id, name, description, status, deadline, created_by').in('id', [...projectIds]),
    supabaseAdmin.from('tasks').select('id, project_id, title, description, status, priority, deadline, assigned_to').in('project_id', [...projectIds]),
    supabaseAdmin.from('project_members').select('user_id, role, project_id').in('project_id', [...projectIds]).is('revoked_at', null),
    supabaseAdmin.from('profiles').select('id, full_name, role, skills, department'),
  ]);

  const memberEfficiency = (profilesRes.data || []).map(prof => {
    const assignedTasks = (tasksRes.data || []).filter(t => t.assigned_to === prof.id);
    const completedTasks = assignedTasks.filter(t => t.status === 'completed' || t.status === 'Done');
    const rate = assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 100;
    return {
      userId: prof.id,
      name: prof.full_name || 'Team Member',
      role: prof.role || 'Member',
      assignedTasksCount: assignedTasks.length,
      completedTasksCount: completedTasks.length,
      efficiencyPercentage: `${rate}%`,
    };
  });

  return {
    projects: projectsRes.data || [],
    tasks: tasksRes.data || [],
    teamMembers: memberEfficiency,
  };
}

// Gemini AI query
async function queryGemini(prompt, userContext) {
  if (!GEMINI_API_KEY) {
    return { status: 'unconfigured', message: 'Gemini API key is not configured.' };
  }

  const systemInstruction = `You are PROJEX AI Coordinator, an intelligent and helpful project management coordinator.
You can:
1. Create new projects with title, description, deadline, and assigned members using proposeCreateProject.
2. Calculate and report team member efficiency based on completed vs assigned tasks using calculateMemberEfficiency.
3. Propose task status updates (To do, In progress, Done, Blocked) using proposeTaskStatusUpdate.
4. Answer questions about current projects, deadlines, workloads, and efficiency accurately.

When the user asks to create a project, call proposeCreateProject.
When the user asks about member efficiency, call calculateMemberEfficiency.

Authorized Context:
${JSON.stringify(userContext, null, 2)}`;

  const tools = [{
    functionDeclarations: [
      {
        name: 'proposeTaskStatusUpdate',
        description: 'Propose changing an existing task status.',
        parameters: {
          type: 'OBJECT',
          properties: {
            taskId: { type: 'STRING', description: 'The exact UUID of the task to update' },
            newStatus: { type: 'STRING', enum: ALLOWED_TASK_STATUSES, description: 'The proposed new status' },
            reason: { type: 'STRING', description: 'Reason for the proposed change' },
          },
          required: ['taskId', 'newStatus', 'reason'],
        },
      },
      {
        name: 'proposeCreateProject',
        description: 'Create or propose a new project with title, description, deadline, and optional members.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Project title/name' },
            description: { type: 'STRING', description: 'Short summary or purpose of the project' },
            deadline: { type: 'STRING', description: 'Target deadline or date' },
            members: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Names or roles of team members to add' },
          },
          required: ['title'],
        },
      },
      {
        name: 'calculateMemberEfficiency',
        description: 'Calculate or evaluate efficiency and workload metrics for team members.',
        parameters: {
          type: 'OBJECT',
          properties: {
            memberName: { type: 'STRING', description: 'Optional name of the member to evaluate' },
          },
        },
      },
    ],
  }];

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        tools,
      }),
    });

    if (!response.ok) {
      return { status: 'error', message: `Gemini API returned status ${response.status}.` };
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts) {
      return { status: 'error', message: 'No response from Gemini.' };
    }

    let answer = '';
    let functionCall = null;
    for (const part of candidate.content.parts) {
      if (part.text) answer += part.text;
      if (part.functionCall) functionCall = part.functionCall;
    }

    return { status: 'success', answer, functionCall };
  } catch (err) {
    console.error('[API] Gemini error:', err);
    return { status: 'error', message: 'Failed to communicate with Gemini API.' };
  }
}

// Main handler
export async function handler(event) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  // Extract the API path from the Netlify function path
  // Netlify redirects /api/* to /.netlify/functions/api/*
  const rawPath = event.path || event.rawUrl || '';
  const pathname = rawPath.replace('/.netlify/functions/api', '/api');
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  // =====================================================
  // GET /api/ai/status
  // =====================================================
  if (method === 'GET' && pathname === '/api/ai/status') {
    return jsonResponse(200, {
      configured: Boolean(GEMINI_API_KEY),
      runtime: 'netlify-functions',
      model: 'gemini-3.8-flash',
    });
  }

  // =====================================================
  // POST /api/ai/chat
  // =====================================================
  if (method === 'POST' && pathname === '/api/ai/chat') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized: valid Supabase session required.' });

    if (!checkRateLimit(`ai_chat_${user.id}`, 10, 60000)) {
      return jsonResponse(429, { error: 'Too many AI requests. Please wait.', retryAfterSeconds: 60 });
    }

    const { prompt } = body;
    if (!prompt || typeof prompt !== 'string') {
      return jsonResponse(400, { error: 'Prompt string is required.' });
    }

    const userContext = await getAuthorizedUserContext(user.id);

    if (!GEMINI_API_KEY) {
      return jsonResponse(503, {
        error: 'AI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY is not configured. Please set it in Netlify environment variables.',
        userContextStats: { projectsCount: userContext.projects.length, tasksCount: userContext.tasks.length },
      });
    }

    const geminiResult = await queryGemini(prompt, userContext);
    if (geminiResult.status !== 'success') {
      return jsonResponse(502, { error: geminiResult.message });
    }

    let proposedAction = null;
    if (geminiResult.functionCall?.name === 'proposeTaskStatusUpdate') {
      const { taskId, newStatus, reason } = geminiResult.functionCall.args;
      const existingTask = userContext.tasks.find(t => t.id === taskId);
      if (existingTask && ALLOWED_TASK_STATUSES.includes(newStatus)) {
        proposedAction = {
          type: 'task_update', taskId, taskTitle: existingTask.title,
          currentStatus: existingTask.status, newStatus, reason,
        };
      }
    } else if (geminiResult.functionCall?.name === 'proposeCreateProject') {
      const { title, description, deadline, members } = geminiResult.functionCall.args;
      if (title) {
        let createdProjectId = null;
        try {
          const { data: newProj, error: pErr } = await supabaseAdmin.from('projects').insert({
            name: title.trim(),
            description: description || 'Created via PROJEX AI Coordinator',
            deadline: deadline || null,
            status: 'planning',
            created_by: user.id,
          }).select('id, name').single();

          if (!pErr && newProj) {
            createdProjectId = newProj.id;
            await supabaseAdmin.from('project_members').insert({
              project_id: newProj.id,
              user_id: user.id,
              role: 'lead',
            });
          }
        } catch (_) {}

        proposedAction = {
          type: 'project_created',
          projectId: createdProjectId,
          title: `Project: ${title}`,
          description: description || `Target deadline: ${deadline || 'Not specified'}`,
          deadline: deadline || null,
          members: members || [],
          createdSuccessfully: Boolean(createdProjectId),
        };

        if (createdProjectId) {
          geminiResult.answer = (geminiResult.answer ? `${geminiResult.answer}\n\n` : '') + 
            `✅ **Project "${title}" created successfully!**\n- **Status:** Planning\n- **Deadline:** ${deadline || 'Not set'}\n- **Assigned:** ${members && members.length > 0 ? members.join(', ') : 'You'}\n\nYou can now view and manage tasks for "${title}" in your workspace.`;
        }
      }
    } else if (geminiResult.functionCall?.name === 'calculateMemberEfficiency') {
      const stats = userContext.teamMembers || [];
      const lines = stats.map(m => `• **${m.name}** (${m.role}): **${m.efficiencyPercentage}** efficiency (${m.completedTasksCount}/${m.assignedTasksCount} tasks completed)`);
      const summaryText = stats.length > 0 
        ? `📊 **Team Efficiency Report**:\n\n${lines.join('\n')}` 
        : `📊 **Team Efficiency Report**: No task history recorded yet. Add members and complete tasks to track efficiency.`;
      geminiResult.answer = geminiResult.answer ? `${geminiResult.answer}\n\n${summaryText}` : summaryText;
    }

    return jsonResponse(200, { answer: geminiResult.answer, proposedAction });
  }

  // =====================================================
  // POST /api/ai/confirm-action
  // =====================================================
  if (method === 'POST' && pathname === '/api/ai/confirm-action') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { taskId, newStatus } = body;
    if (!taskId || !newStatus || !ALLOWED_TASK_STATUSES.includes(newStatus)) {
      return jsonResponse(400, { error: 'Invalid taskId or newStatus.' });
    }

    const userContext = await getAuthorizedUserContext(user.id);
    const task = userContext.tasks.find(t => t.id === taskId);
    if (!task) {
      return jsonResponse(403, { error: 'Task not found or access denied.' });
    }

    const { error } = await supabaseAdmin.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) {
      return jsonResponse(500, { error: 'Failed to update task: ' + error.message });
    }

    return jsonResponse(200, {
      success: true,
      message: `Task "${task.title}" updated from "${task.status}" to "${newStatus}".`,
    });
  }

  // =====================================================
  // POST /api/projects/add-member
  // =====================================================
  if (method === 'POST' && pathname === '/api/projects/add-member') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { projectId, userId, role } = body;
    if (!projectId || !userId) {
      return jsonResponse(400, { error: 'projectId and userId are required.' });
    }

    const { data: proj } = await supabaseAdmin.from('projects').select('id, created_by').eq('id', projectId).maybeSingle();
    if (!proj) return jsonResponse(404, { error: 'Project not found.' });

    if (proj.created_by !== user.id) {
      const { data: existingMember } = await supabaseAdmin.from('project_members').select('id')
        .eq('project_id', projectId).eq('user_id', user.id).is('revoked_at', null).maybeSingle();
      if (!existingMember) return jsonResponse(403, { error: 'Access denied.' });
    }

    const { data, error } = await supabaseAdmin.from('project_members').upsert({
      project_id: projectId, user_id: userId, role: role || 'member',
    }, { onConflict: 'project_id,user_id' }).select();

    if (error) return jsonResponse(500, { error: 'Failed to add member: ' + error.message });
    return jsonResponse(200, { success: true, member: data?.[0] || null });
  }

  // =====================================================
  // POST /api/telegram/resolve
  // =====================================================
  if (method === 'POST' && pathname === '/api/telegram/resolve') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { targetType, targetIdentifier, projectId } = body;
    const userContext = await getAuthorizedUserContext(user.id);
    const accessibleProjectIds = userContext.projects.map(p => p.id);

    if (projectId && !accessibleProjectIds.includes(projectId)) {
      return jsonResponse(403, { error: 'Access denied to target project.' });
    }

    const projectScope = projectId ? [projectId] : accessibleProjectIds;
    let candidateUserIds = [];

    if (targetType === 'person' && targetIdentifier) {
      const { data: matchedProfiles } = await supabaseAdmin.from('profiles').select('id, full_name');
      const matched = (matchedProfiles || []).filter(p =>
        p.id === targetIdentifier || p.full_name?.toLowerCase().includes(targetIdentifier.toLowerCase())
      );
      candidateUserIds = matched.map(p => p.id);
      if (candidateUserIds.length === 0) candidateUserIds = [targetIdentifier];
    } else if (targetType === 'role' && targetIdentifier) {
      const { data: members } = await supabaseAdmin.from('project_members').select('user_id, role')
        .in('project_id', projectScope).is('revoked_at', null);
      candidateUserIds = (members || [])
        .filter(m => (m.role || '').toLowerCase().includes((targetIdentifier || '').toLowerCase()))
        .map(m => m.user_id);
      if (targetIdentifier.toLowerCase().includes('lead')) {
        const creators = userContext.projects.map(p => p.created_by);
        candidateUserIds = Array.from(new Set([...candidateUserIds, ...creators]));
      }
    } else {
      const { data: members } = await supabaseAdmin.from('project_members').select('user_id')
        .in('project_id', projectScope).is('revoked_at', null);
      const allUids = new Set([
        ...userContext.projects.map(p => p.created_by),
        ...(members || []).map(m => m.user_id),
      ]);
      candidateUserIds = Array.from(allUids);
    }

    if (candidateUserIds.length === 0) {
      return jsonResponse(200, { recipients: [] });
    }

    const [{ data: profs }, { data: accounts }] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name').in('id', candidateUserIds),
      supabaseAdmin.from('messaging_accounts').select('id, user_id, private_chat_id, username, connection_status')
        .eq('platform', 'telegram').in('user_id', candidateUserIds).eq('connection_status', 'connected'),
    ]);

    const accountMap = {};
    (accounts || []).forEach(a => { accountMap[a.user_id] = a; });

    const recipients = candidateUserIds.map(uid => {
      const prof = (profs || []).find(p => p.id === uid);
      const acc = accountMap[uid];
      return {
        userId: uid,
        name: prof?.full_name || 'Team Member',
        isLinked: Boolean(acc && acc.private_chat_id),
        telegramUsername: acc?.username || null,
        messagingAccountId: acc?.id || null,
      };
    });

    return jsonResponse(200, { recipients });
  }

  // =====================================================
  // POST /api/telegram/send
  // =====================================================
  if (method === 'POST' && pathname === '/api/telegram/send') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    if (!checkRateLimit(`tg_send_${user.id}`, 5, 60000)) {
      return jsonResponse(429, { error: 'Too many Telegram messages. Please wait.' });
    }

    const { recipientUserIds, messageText, projectId, taskId } = body;

    if (!BOT_TOKEN) return jsonResponse(503, { error: 'BOT_TOKEN is not configured.' });
    if (!recipientUserIds?.length || !messageText) {
      return jsonResponse(400, { error: 'Valid recipientUserIds and messageText required.' });
    }

    const userContext = await getAuthorizedUserContext(user.id);
    const accessibleProjectIds = userContext.projects.map(p => p.id);

    const { data: authorizedMembers } = await supabaseAdmin.from('project_members').select('user_id')
      .in('project_id', accessibleProjectIds).is('revoked_at', null);

    const permittedUserIds = new Set([
      user.id, ...userContext.projects.map(p => p.created_by),
      ...(authorizedMembers || []).map(m => m.user_id),
    ]);

    const validRecipients = recipientUserIds.filter(uid => permittedUserIds.has(uid));
    if (validRecipients.length === 0) {
      return jsonResponse(403, { error: 'Recipients not in authorized projects.' });
    }

    const { data: accounts } = await supabaseAdmin.from('messaging_accounts')
      .select('id, user_id, private_chat_id, username')
      .eq('platform', 'telegram').in('user_id', validRecipients).eq('connection_status', 'connected');

    if (!accounts?.length) {
      return jsonResponse(400, { error: 'Recipients have not linked Telegram.' });
    }

    // Use Telegram Bot API directly via fetch (no Telegraf dependency needed)
    const deliveryResults = [];
    for (const account of accounts) {
      try {
        const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const formattedMessage = `📢 [PROJEX Notification]\n\n${messageText}`;
        const tgRes = await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: account.private_chat_id, text: formattedMessage }),
        });
        const tgData = await tgRes.json();

        if (tgData.ok) {
          try {
            await supabaseAdmin.from('message_events').insert({
              platform: 'telegram', external_message_id: String(tgData.result.message_id),
              messaging_account_id: account.id, user_id: account.user_id,
              project_id: projectId || null, task_id: taskId || null,
              message_text: messageText, message_direction: 'outgoing',
              processing_status: 'delivered', processed_at: new Date().toISOString(),
            });
          } catch (_) { /* best effort logging */ }
          deliveryResults.push({ userId: account.user_id, status: 'sent', messageId: tgData.result.message_id });
        } else {
          deliveryResults.push({ userId: account.user_id, status: 'failed', error: tgData.description });
        }
      } catch (tErr) {
        deliveryResults.push({ userId: account.user_id, status: 'failed', error: tErr.message });
      }
    }

    const anySent = deliveryResults.some(r => r.status === 'sent');
    if (!anySent) return jsonResponse(502, { error: 'Telegram delivery failed.', details: deliveryResults });

    return jsonResponse(200, {
      success: true,
      deliveredCount: deliveryResults.filter(r => r.status === 'sent').length,
      results: deliveryResults,
      message: `Delivered ${deliveryResults.filter(r => r.status === 'sent').length} message(s).`,
    });
  }

  // =====================================================
  // POST /api/invites/create
  // =====================================================
  if (method === 'POST' && pathname === '/api/invites/create') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { projectId, telegramUsername, email, role, welcomeMessage } = body;
    if (!projectId) return jsonResponse(400, { error: 'projectId is required.' });

    const { data: proj } = await supabaseAdmin.from('projects').select('id, name, created_by').eq('id', projectId).maybeSingle();
    if (!proj) return jsonResponse(404, { error: 'Project not found.' });
    if (proj.created_by !== user.id) return jsonResponse(403, { error: 'Only the project creator can issue invites.' });

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const codeHash = hashInviteCode(inviteCode);
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const inviteObj = {
      code_hash: codeHash, project_id: projectId, created_by: user.id,
      telegram_username: telegramUsername || null, email: email || null,
      role: role || 'member', expires_at: expiresAt, redeemed: false,
    };

    // Try Supabase first, fall back to in-memory
    try {
      await supabaseAdmin.from('project_invites').insert(inviteObj);
    } catch (_) {
      IN_MEMORY_INVITES.set(codeHash, { ...inviteObj, created_at: new Date().toISOString() });
    }

    const normalizedUsername = telegramUsername ? telegramUsername.replace(/^@/, '') : null;

    return jsonResponse(200, {
      success: true, inviteCode, projectName: proj.name,
      expiresAt, telegramUsername: normalizedUsername ? `@${normalizedUsername}` : undefined,
      botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=join_${inviteCode}`,
      instructions: `Share this code: ${inviteCode}. Recipient should open the bot and send /join ${inviteCode}`,
    });
  }

  // =====================================================
  // POST /api/invites/verify
  // =====================================================
  if (method === 'POST' && pathname === '/api/invites/verify') {
    const { inviteCode } = body;
    if (!inviteCode) return jsonResponse(400, { error: 'inviteCode is required.' });

    const codeHash = hashInviteCode(inviteCode);

    // Check Supabase first
    const { data: dbInvite } = await supabaseAdmin.from('project_invites')
      .select('*, projects(name)').eq('code_hash', codeHash).eq('redeemed', false).maybeSingle();

    if (dbInvite) {
      if (new Date(dbInvite.expires_at) < new Date()) {
        return jsonResponse(410, { error: 'Invite has expired.' });
      }
      return jsonResponse(200, {
        valid: true, projectName: dbInvite.projects?.name || 'Project',
        role: dbInvite.role || 'member', expiresAt: dbInvite.expires_at,
      });
    }

    // Check in-memory
    const memInvite = IN_MEMORY_INVITES.get(codeHash);
    if (memInvite && !memInvite.redeemed) {
      if (new Date(memInvite.expires_at) < new Date()) {
        return jsonResponse(410, { error: 'Invite has expired.' });
      }
      const { data: p } = await supabaseAdmin.from('projects').select('name').eq('id', memInvite.project_id).maybeSingle();
      return jsonResponse(200, {
        valid: true, projectName: p?.name || 'Project',
        role: memInvite.role || 'member', expiresAt: memInvite.expires_at,
      });
    }

    return jsonResponse(404, { error: 'Invalid or expired invite code.' });
  }

  // =====================================================
  // POST /api/invites/redeem
  // =====================================================
  if (method === 'POST' && pathname === '/api/invites/redeem') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { inviteCode } = body;
    if (!inviteCode) return jsonResponse(400, { error: 'inviteCode is required.' });

    const codeHash = hashInviteCode(inviteCode);

    // Try Supabase
    const { data: dbInvite } = await supabaseAdmin.from('project_invites')
      .select('*').eq('code_hash', codeHash).eq('redeemed', false).maybeSingle();

    let invite = dbInvite;
    let isMemory = false;

    if (!invite) {
      const memInvite = IN_MEMORY_INVITES.get(codeHash);
      if (memInvite && !memInvite.redeemed) {
        invite = memInvite;
        isMemory = true;
      }
    }

    if (!invite) return jsonResponse(404, { error: 'Invalid or already redeemed invite.' });
    if (new Date(invite.expires_at) < new Date()) return jsonResponse(410, { error: 'Invite expired.' });

    // Add user as project member
    const { error: memberError } = await supabaseAdmin.from('project_members').upsert({
      project_id: invite.project_id, user_id: user.id, role: invite.role || 'member',
    }, { onConflict: 'project_id,user_id' });

    if (memberError) {
      return jsonResponse(500, { error: 'Failed to join project: ' + memberError.message });
    }

    // Mark invite as redeemed
    if (isMemory) {
      invite.redeemed = true;
      invite.redeemed_by = user.id;
    } else {
      await supabaseAdmin.from('project_invites').update({
        redeemed: true, redeemed_by: user.id, redeemed_at: new Date().toISOString(),
      }).eq('code_hash', codeHash);
    }

    const { data: proj } = await supabaseAdmin.from('projects').select('name').eq('id', invite.project_id).maybeSingle();

    return jsonResponse(200, {
      success: true,
      message: `Successfully joined "${proj?.name || 'Project'}" as ${invite.role || 'member'}!`,
      projectId: invite.project_id, projectName: proj?.name || 'Project',
    });
  }

  // =====================================================
  // GET /api/notifications
  // =====================================================
  if (method === 'GET' && pathname === '/api/notifications') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const notifications = IN_MEMORY_NOTIFICATIONS.get(user.id) || [];
    return jsonResponse(200, { notifications });
  }

  // =====================================================
  // GET /api/telegram/status
  // =====================================================
  if (method === 'GET' && pathname === '/api/telegram/status') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { data: account } = await supabaseAdmin.from('messaging_accounts')
      .select('id, username, private_chat_id, connection_status')
      .eq('platform', 'telegram').eq('user_id', user.id).maybeSingle();

    if (!account) {
      return jsonResponse(200, {
        linked: false, status: 'not_linked',
        botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
        message: 'Telegram account not linked. Start the bot to connect.',
      });
    }

    return jsonResponse(200, {
      linked: Boolean(account.private_chat_id),
      status: account.connection_status || 'unknown',
      username: account.username || null,
      hasChatId: Boolean(account.private_chat_id),
      botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
    });
  }

  // =====================================================
  // POST /api/telegram/link-username
  // =====================================================
  if (method === 'POST' && pathname === '/api/telegram/link-username') {
    const user = await authenticateUser(event);
    if (!user) return jsonResponse(401, { error: 'Unauthorized.' });

    const { username } = body;
    if (!username) return jsonResponse(400, { error: 'Telegram username is required.' });

    const normalizedUsername = username.replace(/^@/, '').trim();
    if (!normalizedUsername || normalizedUsername.length < 3) {
      return jsonResponse(400, { error: 'Invalid Telegram username.' });
    }

    const { data: existing } = await supabaseAdmin.from('messaging_accounts')
      .select('id, connection_status, private_chat_id')
      .eq('platform', 'telegram').eq('user_id', user.id).maybeSingle();

    if (existing) {
      await supabaseAdmin.from('messaging_accounts').update({
        username: normalizedUsername,
        connection_status: existing.private_chat_id ? 'connected' : 'pending',
      }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('messaging_accounts').insert({
        user_id: user.id, platform: 'telegram', username: normalizedUsername,
        connection_status: 'pending',
      });
    }

    return jsonResponse(200, {
      success: true, status: 'pending_link',
      telegramUsername: `@${normalizedUsername}`,
      botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
      message: `Username recorded. Now open Telegram, start @${TELEGRAM_BOT_USERNAME}, and send /start!`,
    });
  }

  // 404 fallback
  return jsonResponse(404, { error: 'Endpoint not found' });
}
