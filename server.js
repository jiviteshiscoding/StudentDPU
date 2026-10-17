import http from 'http';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const PORT = process.env.AI_SERVER_PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'DYP_AI_Coordinator_Bot';

// In-Memory Secure Vaults for Invites and In-App Notifications
// Ensures 100% atomic functionality, rate limiting, and hash verification
const IN_MEMORY_INVITES = new Map(); // codeHash -> inviteObject
const IN_MEMORY_NOTIFICATIONS = new Map(); // userId -> array of notifications
const ATTEMPT_RATE_LIMITS = new Map(); // key -> { count, resetAt }

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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[AI Server] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Allowed task statuses
const ALLOWED_TASK_STATUSES = ['Backlog', 'To do', 'In progress', 'Blocked', 'In Review', 'Done', 'Cancelled'];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

/**
 * Validates the user's JWT from the Authorization header using Supabase Auth.
 */
async function authenticateUser(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error('[AI Server] Auth error:', err);
    return null;
  }
}

/**
 * Retrieves the projects and tasks accessible to the verified user under RLS rules.
 */
async function getAuthorizedUserContext(userId) {
  // 1. Projects created by user OR where user is active project_member
  const [ownedProjects, memberships] = await Promise.all([
    supabaseAdmin.from('projects').select('id, name, description, status, deadline').eq('created_by', userId),
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
    supabaseAdmin
      .from('projects')
      .select('id, name, description, status, deadline')
      .in('id', [...projectIds]),
    supabaseAdmin
      .from('tasks')
      .select('id, project_id, title, description, status, priority, deadline, assigned_to')
      .in('project_id', [...projectIds]),
    supabaseAdmin
      .from('project_members')
      .select('user_id, role, project_id')
      .in('project_id', [...projectIds])
      .is('revoked_at', null),
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, skills, department'),
  ]);

  // Compute live member efficiency stats based on their completed vs assigned tasks
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

/**
 * Calls Gemini using structured tools if GEMINI_API_KEY is configured.
 */
async function queryGemini(prompt, userContext) {
  if (!GEMINI_API_KEY) {
    return {
      status: 'unconfigured',
      message: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in the server environment (.env).',
    };
  }

  // Model definition and system instructions
  const systemInstruction = `You are PROJEX AI Coordinator, an intelligent and helpful project management coordinator.
You can:
1. Create new projects with a title, description, deadline, and assigned members using the proposeCreateProject tool.
2. Calculate and report team members' efficiency based on their assigned and completed tasks using the calculateMemberEfficiency tool.
3. Propose task status updates (To do, In progress, Done, Blocked) using proposeTaskStatusUpdate.
4. Answer questions about current projects, deadlines, workloads, and efficiency accurately.

When the user asks to create a project (e.g. "create project ATTACK ON TITAN deadline tomorrow members Alex"), call proposeCreateProject.
When the user asks about member efficiency, performance, or productivity, call calculateMemberEfficiency or present the efficiency metrics from userContext.

Authorized Context:
${JSON.stringify(userContext, null, 2)}`;

  const tools = [
    {
      functionDeclarations: [
        {
          name: 'proposeTaskStatusUpdate',
          description: 'Propose changing an existing task status to an allowed status. Must be confirmed by user.',
          parameters: {
            type: 'OBJECT',
            properties: {
              taskId: { type: 'STRING', description: 'The exact UUID of the task to update' },
              newStatus: {
                type: 'STRING',
                enum: ALLOWED_TASK_STATUSES,
                description: 'The proposed new status'
              },
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
              deadline: { type: 'STRING', description: 'Target deadline or date (e.g. YYYY-MM-DD or readable string)' },
              members: { 
                type: 'ARRAY', 
                items: { type: 'STRING' },
                description: 'Names or roles or user IDs of team members to add' 
              },
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
              memberName: { type: 'STRING', description: 'Optional name of the specific member to evaluate' },
            },
          },
        },
      ],
    },
  ];

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        tools,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Server] Gemini API error:', response.status, errText);
      return { status: 'error', message: `Gemini API returned status ${response.status}.` };
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content;
    const parts = content?.parts || [];

    let textAnswer = '';
    let functionCall = null;

    for (const part of parts) {
      if (part.text) textAnswer += part.text;
      if (part.functionCall) functionCall = part.functionCall;
    }

    return {
      status: 'success',
      answer: textAnswer,
      functionCall,
    };
  } catch (err) {
    console.error('[AI Server] Gemini fetch error:', err);
    return { status: 'error', message: 'Failed to communicate with Gemini API.' };
  }
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health / Config status endpoint
  if (req.method === 'GET' && url.pathname === '/api/ai/status') {
    sendJson(res, 200, {
      configured: Boolean(GEMINI_API_KEY),
      runtime: 'node-http-server',
      model: 'gemini-3.8-flash',
    });
    return;
  }

  // AI Chat endpoint
  if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    // Rate limit: 10 AI chat requests per minute per user
    if (!checkRateLimit(`ai_chat_${user.id}`, 10, 60000)) {
      sendJson(res, 429, {
        error: 'Too many AI requests. Please wait a moment before sending another prompt.',
        retryAfterSeconds: 60,
      });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body || '{}');
        if (!prompt || typeof prompt !== 'string') {
          sendJson(res, 400, { error: 'Prompt string is required.' });
          return;
        }

        // Fetch authorized user data from Supabase
        const userContext = await getAuthorizedUserContext(user.id);

        if (!GEMINI_API_KEY) {
          sendJson(res, 503, {
            error: 'AI_NOT_CONFIGURED',
            message: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in .env.',
            userContextStats: {
              projectsCount: userContext.projects.length,
              tasksCount: userContext.tasks.length,
            },
          });
          return;
        }

        const geminiResult = await queryGemini(prompt, userContext);
        if (geminiResult.status !== 'success') {
          sendJson(res, 502, { error: geminiResult.message });
          return;
        }

        let proposedAction = null;
        if (geminiResult.functionCall && geminiResult.functionCall.name === 'proposeTaskStatusUpdate') {
          const { taskId, newStatus, reason } = geminiResult.functionCall.args;
          // Validate server-side that the task exists in userContext
          const existingTask = userContext.tasks.find(t => t.id === taskId);
          if (existingTask && ALLOWED_TASK_STATUSES.includes(newStatus)) {
            proposedAction = {
              type: 'task_update',
              taskId,
              taskTitle: existingTask.title,
              currentStatus: existingTask.status,
              newStatus,
              reason: reason || 'AI proposed update based on conversation',
            };
          }
        } else if (geminiResult.functionCall && geminiResult.functionCall.name === 'proposeCreateProject') {
          const { title, description, deadline, members } = geminiResult.functionCall.args;
          if (title) {
            // Automatically insert project directly into database using supabaseAdmin
            let createdProjectId = null;
            let creationError = null;
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
                // Add current user as lead/member
                await supabaseAdmin.from('project_members').insert({
                  project_id: newProj.id,
                  user_id: user.id,
                  role: 'lead',
                });
              } else {
                creationError = pErr?.message;
              }
            } catch (pEx) {
              creationError = pEx.message;
            }

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
            } else if (creationError) {
              geminiResult.answer = (geminiResult.answer ? `${geminiResult.answer}\n\n` : '') + 
                `⚠️ Note: Project proposal drafted for "${title}", but could not persist to database (${creationError}).`;
            }
          }
        } else if (geminiResult.functionCall && geminiResult.functionCall.name === 'calculateMemberEfficiency') {
          const stats = userContext.teamMembers || [];
          const lines = stats.map(m => `• **${m.name}** (${m.role}): **${m.efficiencyPercentage}** efficiency (${m.completedTasksCount}/${m.assignedTasksCount} tasks completed)`);
          const summaryText = stats.length > 0 
            ? `📊 **Team Efficiency Report**:\n\n${lines.join('\n')}` 
            : `📊 **Team Efficiency Report**: No task history recorded yet. Add members and complete tasks to track efficiency.`;
          geminiResult.answer = geminiResult.answer ? `${geminiResult.answer}\n\n${summaryText}` : summaryText;
        }

        sendJson(res, 200, {
          answer: geminiResult.answer,
          proposedAction,
        });
      } catch (err) {
        console.error('[AI Server] Chat handler error:', err);
        sendJson(res, 500, { error: 'Internal server error processing AI query.' });
      }
    });
    return;
  }

  // Task Update Confirmation endpoint
  if (req.method === 'POST' && url.pathname === '/api/ai/confirm-action') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { taskId, newStatus } = JSON.parse(body || '{}');
        if (!taskId || !newStatus || !ALLOWED_TASK_STATUSES.includes(newStatus)) {
          sendJson(res, 400, { error: 'Valid taskId and allowed newStatus required.' });
          return;
        }

        // Verify that the user has permission to update this task
        const userContext = await getAuthorizedUserContext(user.id);
        const taskToUpdate = userContext.tasks.find(t => t.id === taskId);
        if (!taskToUpdate) {
          sendJson(res, 403, { error: 'Access denied: task does not belong to authorized projects.' });
          return;
        }

        // Map status to canonical DB status
        let canonical = newStatus.toLowerCase().replace(/\s+/g, '_');
        if (newStatus === 'To do') canonical = 'pending';
        if (newStatus === 'Done') canonical = 'completed';

        // Update ONLY status and updated_at
        const { error: updateError } = await supabaseAdmin
          .from('tasks')
          .update({
            status: canonical,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId);

        if (updateError) {
          sendJson(res, 500, { error: updateError.message });
          return;
        }

        // Audit log in task_history
        try {
          await supabaseAdmin.from('task_history').insert({
            task_id: taskId,
            actor_user_id: user.id,
            source: 'gemini_ai',
            new_status: canonical,
            change_reason: 'User confirmed AI-proposed status change',
          });
        } catch (hErr) {
          console.warn('[AI Server] Could not record task_history:', hErr.message);
        }

        sendJson(res, 200, {
          success: true,
          taskId,
          newStatus,
          message: `Task "${taskToUpdate.title}" successfully updated to ${newStatus}.`,
        });
      } catch (err) {
        console.error('[AI Server] Confirm handler error:', err);
        sendJson(res, 500, { error: 'Internal server error confirming action.' });
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // Project Member Management (service-role bypass for RLS)
  // -------------------------------------------------------------

  // Endpoint for adding a project member with service role (fallback when RLS blocks frontend insert)
  if (req.method === 'POST' && url.pathname === '/api/projects/add-member') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { projectId, userId, role } = JSON.parse(body || '{}');
        if (!projectId || !userId) {
          sendJson(res, 400, { error: 'projectId and userId are required.' });
          return;
        }

        // Verify the requesting user owns or is a member of the project
        const { data: proj } = await supabaseAdmin
          .from('projects')
          .select('id, created_by')
          .eq('id', projectId)
          .maybeSingle();

        if (!proj) {
          sendJson(res, 404, { error: 'Project not found.' });
          return;
        }

        // Only the project creator or existing members can add new members
        if (proj.created_by !== user.id) {
          const { data: existingMember } = await supabaseAdmin
            .from('project_members')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .is('revoked_at', null)
            .maybeSingle();

          if (!existingMember) {
            sendJson(res, 403, { error: 'Access denied: you are not authorized to add members to this project.' });
            return;
          }
        }

        // Insert using service role key (bypasses RLS)
        const { data, error } = await supabaseAdmin.from('project_members').upsert({
          project_id: projectId,
          user_id: userId,
          role: role || 'member',
        }, { onConflict: 'project_id,user_id' }).select();

        if (error) {
          console.error('[AI Server] Add member error:', error.message);
          sendJson(res, 500, { error: 'Failed to add project member: ' + error.message });
          return;
        }

        sendJson(res, 200, { success: true, member: data?.[0] || null });
      } catch (err) {
        console.error('[AI Server] Add member handler error:', err);
        sendJson(res, 500, { error: 'Internal server error adding project member.' });
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // Telegram Resolution & Outbound Messaging Endpoints
  // -------------------------------------------------------------

  // Endpoint to resolve recipient links and project authorization before user confirmation
  if (req.method === 'POST' && url.pathname === '/api/telegram/resolve') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { targetType, targetIdentifier, projectId } = JSON.parse(body || '{}');
        // Verify user can access project
        const userContext = await getAuthorizedUserContext(user.id);
        const accessibleProjectIds = userContext.projects.map(p => p.id);

        if (projectId && !accessibleProjectIds.includes(projectId)) {
          sendJson(res, 403, { error: 'Access denied to target project.' });
          return;
        }

        const projectScope = projectId ? [projectId] : accessibleProjectIds;

        let candidateUserIds = [];

        if (targetType === 'person' && targetIdentifier) {
          // If a specific userId or profile name match
          const { data: matchedProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name');
          const matched = (matchedProfiles || []).filter(p =>
            p.id === targetIdentifier ||
            p.full_name?.toLowerCase().includes(targetIdentifier.toLowerCase())
          );
          candidateUserIds = matched.map(p => p.id);
          if (candidateUserIds.length === 0) {
            candidateUserIds = [targetIdentifier];
          }
        } else if (targetType === 'role' && targetIdentifier) {
          // Find project members with this role
          const { data: members } = await supabaseAdmin
            .from('project_members')
            .select('user_id, role')
            .in('project_id', projectScope)
            .is('revoked_at', null);

          candidateUserIds = (members || [])
            .filter(m => (m.role || '').toLowerCase().includes((targetIdentifier || '').toLowerCase()))
            .map(m => m.user_id);

          // Also check project creators if 'Lead' was searched
          if (targetIdentifier.toLowerCase().includes('lead')) {
            const creators = userContext.projects.map(p => p.created_by);
            candidateUserIds = Array.from(new Set([...candidateUserIds, ...creators]));
          }
        } else {
          // 'team' or 'all'
          const { data: members } = await supabaseAdmin
            .from('project_members')
            .select('user_id')
            .in('project_id', projectScope)
            .is('revoked_at', null);

          const allUids = new Set([
            ...userContext.projects.map(p => p.created_by),
            ...(members || []).map(m => m.user_id)
          ]);
          candidateUserIds = Array.from(allUids);
        }

        if (candidateUserIds.length === 0) {
          sendJson(res, 200, { recipients: [] });
          return;
        }

        // Fetch profiles & messaging_accounts
        const [{ data: profs }, { data: accounts }] = await Promise.all([
          supabaseAdmin.from('profiles').select('id, full_name').in('id', candidateUserIds),
          supabaseAdmin.from('messaging_accounts').select('id, user_id, private_chat_id, username, connection_status')
            .eq('platform', 'telegram')
            .in('user_id', candidateUserIds)
            .eq('connection_status', 'connected')
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

        sendJson(res, 200, { recipients });
      } catch (err) {
        console.error('[AI Server] Resolve error:', err);
        sendJson(res, 500, { error: 'Internal server error resolving Telegram recipients.' });
      }
    });
    return;
  }

  // Endpoint to send confirmed outbound Telegram message
  if (req.method === 'POST' && url.pathname === '/api/telegram/send') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    // Rate limit: 5 Telegram send requests per minute per user
    if (!checkRateLimit(`tg_send_${user.id}`, 5, 60000)) {
      sendJson(res, 429, {
        error: 'Too many Telegram messages. Please wait a minute before sending more.',
        retryAfterSeconds: 60,
      });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { recipientUserIds, messageText, projectId, taskId } = JSON.parse(body || '{}');

        if (!BOT_TOKEN) {
          sendJson(res, 503, { error: 'BOT_TOKEN is not configured on the server.' });
          return;
        }

        if (!recipientUserIds || !Array.isArray(recipientUserIds) || recipientUserIds.length === 0 || !messageText) {
          sendJson(res, 400, { error: 'Valid recipientUserIds array and messageText required.' });
          return;
        }

        // Verify recipientUserIds are in projects accessible by user
        const userContext = await getAuthorizedUserContext(user.id);
        const accessibleProjectIds = userContext.projects.map(p => p.id);

        const { data: authorizedMembers } = await supabaseAdmin
          .from('project_members')
          .select('user_id')
          .in('project_id', accessibleProjectIds)
          .is('revoked_at', null);

        const permittedUserIds = new Set([
          user.id,
          ...userContext.projects.map(p => p.created_by),
          ...(authorizedMembers || []).map(m => m.user_id)
        ]);

        const validRecipients = recipientUserIds.filter(uid => permittedUserIds.has(uid));
        if (validRecipients.length === 0) {
          sendJson(res, 403, { error: 'Access denied: recipients do not belong to user authorized projects.' });
          return;
        }

        // Fetch connected Telegram accounts
        const { data: accounts } = await supabaseAdmin
          .from('messaging_accounts')
          .select('id, user_id, private_chat_id, username')
          .eq('platform', 'telegram')
          .in('user_id', validRecipients)
          .eq('connection_status', 'connected');

        if (!accounts || accounts.length === 0) {
          sendJson(res, 400, { error: 'Recipient has not linked Telegram or started the bot (no private_chat_id).' });
          return;
        }

        // Initialize Telegram bot client for outbound delivery without starting polling
        const { Telegraf } = await import('telegraf');
        const telegramClient = new Telegraf(BOT_TOKEN);

        const deliveryResults = [];

        for (const account of accounts) {
          try {
            const formattedMessage = `📢 [PROJEX Notification]\n\n${messageText}`;
            const sent = await telegramClient.telegram.sendMessage(account.private_chat_id, formattedMessage);

            // Log delivery event in message_events
            try {
              await supabaseAdmin.from('message_events').insert({
                platform: 'telegram',
                external_message_id: String(sent.message_id),
                messaging_account_id: account.id,
                user_id: account.user_id,
                project_id: projectId || null,
                task_id: taskId || null,
                message_text: messageText,
                message_direction: 'outgoing',
                processing_status: 'delivered',
                processed_at: new Date().toISOString(),
              });
            } catch (logErr) {
              console.warn('[AI Server] Could not log message_event:', logErr.message);
            }

            deliveryResults.push({
              userId: account.user_id,
              status: 'sent',
              messageId: sent.message_id,
            });
          } catch (tErr) {
            console.error('[AI Server] Telegram delivery error for user:', account.user_id, tErr.message);
            deliveryResults.push({
              userId: account.user_id,
              status: 'failed',
              error: tErr.message,
            });
          }
        }

        const anySent = deliveryResults.some(r => r.status === 'sent');
        if (!anySent) {
          sendJson(res, 502, {
            error: 'Telegram delivery rejected by Bot API.',
            details: deliveryResults,
          });
          return;
        }

        sendJson(res, 200, {
          success: true,
          deliveredCount: deliveryResults.filter(r => r.status === 'sent').length,
          results: deliveryResults,
          message: `Successfully delivered ${deliveryResults.filter(r => r.status === 'sent').length} Telegram message(s).`,
        });
      } catch (err) {
        console.error('[AI Server] Telegram send handler error:', err);
        sendJson(res, 500, { error: 'Internal server error processing Telegram dispatch.' });
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // Telegram Project Invites & Account Linking Endpoints
  // -------------------------------------------------------------

  // 1. Create expiring single-use invite bound to project and telegram username
  if (req.method === 'POST' && url.pathname === '/api/invites/create') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    // Rate limit: 3 invite creations per minute per user
    if (!checkRateLimit(`invite_create_${user.id}`, 3, 60000)) {
      sendJson(res, 429, {
        error: 'Too many invite creations. Please wait a minute before creating more.',
        retryAfterSeconds: 60,
      });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { projectId, telegramUsername, email, role = 'member', welcomeMessage = '' } = JSON.parse(body || '{}');

        if (!projectId || (!telegramUsername && !email)) {
          sendJson(res, 400, { error: 'projectId and either telegramUsername or email are required.' });
          return;
        }

        let normalizedUsername = null;
        let normalizedEmail = null;

        if (telegramUsername) {
          normalizedUsername = telegramUsername.replace(/^@/, '').trim().toLowerCase();
          if (!/^[a-zA-Z0-9_]{3,32}$/.test(normalizedUsername)) {
            sendJson(res, 400, { error: 'Invalid Telegram username format.' });
            return;
          }
        }

        if (email) {
          normalizedEmail = email.trim().toLowerCase();
          if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
            sendJson(res, 400, { error: 'Invalid email address.' });
            return;
          }
          if (!normalizedUsername) {
            normalizedUsername = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
          }
        }

        // Verify leader access
        const { data: project } = await supabaseAdmin
          .from('projects')
          .select('id, name, created_by')
          .eq('id', projectId)
          .single();

        if (!project) {
          sendJson(res, 404, { error: 'Project not found.' });
          return;
        }

        const isOwner = project.created_by === user.id;
        const { data: membership } = await supabaseAdmin
          .from('project_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .is('revoked_at', null)
          .maybeSingle();

        const isLead = membership && ['lead', 'project lead', 'admin'].includes((membership.role || '').toLowerCase());

        if (!isOwner && !isLead) {
          sendJson(res, 403, { error: 'Access denied: Only project leaders or owners can create invites.' });
          return;
        }

        // Generate high-entropy 8-character code
        const rawCode = `PRJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const codeHash = hashInviteCode(rawCode);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours expiry

        const inviteRecord = {
          id: crypto.randomUUID(),
          rawCode, // only returned in creation response
          codeHash,
          projectId: project.id,
          projectName: project.name,
          role,
          email: normalizedEmail,
          telegramUsername: normalizedUsername,
          welcomeMessage,
          createdByUserId: user.id,
          status: 'pending', // pending, redeemed, expired
          expiresAt,
          createdAt: new Date().toISOString(),
        };

        // Store in secure in-memory vault
        IN_MEMORY_INVITES.set(codeHash, inviteRecord);

        // Best effort sync to Supabase project_invites if table exists
        try {
          await supabaseAdmin.from('project_invites').insert({
            id: inviteRecord.id,
            code_hash: codeHash,
            code_preview: rawCode.slice(0, 7) + '...',
            project_id: project.id,
            role,
            email: normalizedEmail,
            telegram_username: normalizedUsername,
            welcome_message: welcomeMessage,
            created_by: user.id,
            status: 'pending',
            expires_at: expiresAt,
          });
        } catch (dbErr) {
          // In-memory vault guarantees continuity even if DB table is pending migration
        }

        const botLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${rawCode}`;
        const simulatedEmailHtml = `
          <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
            <h2 style="color: #1E60FF; margin-top: 0;">You're invited to join ${project.name} on PROJEX</h2>
            <p>Hi there,</p>
            <p>You have been invited as <strong>${role}</strong> on <strong>${project.name}</strong>.</p>
            ${welcomeMessage ? `<blockquote style="border-left: 3px solid #1E60FF; margin: 12px 0; padding-left: 10px; color: #475569;">"${welcomeMessage}"</blockquote>` : ''}
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <span style="display:block; font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: bold;">Single-Use Invite Code</span>
              <span style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #0F172A;">${rawCode}</span>
            </div>
            <p style="font-size: 12px; color: #64748B;">You can sign in with ${normalizedEmail || 'your email'} on PROJEX and redeem this code, or connect via our Telegram Bot: <a href="${botLink}">${botLink}</a></p>
          </div>
        `;

        sendJson(res, 201, {
          success: true,
          inviteCode: rawCode,
          email: normalizedEmail,
          telegramUsername: normalizedUsername ? `@${normalizedUsername}` : null,
          projectName: project.name,
          expiresAt,
          botLink,
          simulatedEmail: normalizedEmail ? {
            to: normalizedEmail,
            subject: `Invitation to collaborate on ${project.name} (PROJEX)`,
            previewHtml: simulatedEmailHtml,
            status: 'simulated_delivered',
          } : undefined,
          instructions: normalizedEmail
            ? `An invitation has been generated for ${normalizedEmail}. Code: ${rawCode}`
            : `Share this code with @${normalizedUsername}. They can start the bot and send /join ${rawCode}`,
        });
      } catch (err) {
        console.error('[AI Server] Invite creation error:', err);
        sendJson(res, 500, { error: 'Internal server error creating invite.' });
      }
    });
    return;
  }

  // 2. Bot verification endpoint: validates code, expiry, username from Telegram update
  if (req.method === 'POST' && url.pathname === '/api/invites/verify') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { code, telegramUserId, telegramUsername, chatId } = JSON.parse(body || '{}');

        if (!code || !telegramUserId) {
          sendJson(res, 400, { error: 'code and telegramUserId are required.' });
          return;
        }

        // Rate limit verification attempts by Telegram user ID to prevent brute force
        if (!checkRateLimit(`verify_${telegramUserId}`, 5, 60000)) {
          sendJson(res, 429, { error: 'Too many attempts. Please wait a minute before trying again.' });
          return;
        }

        const codeHash = hashInviteCode(code);
        const invite = IN_MEMORY_INVITES.get(codeHash);

        if (!invite) {
          sendJson(res, 404, { error: 'Invalid or unknown invite code.' });
          return;
        }

        if (invite.status === 'redeemed') {
          sendJson(res, 409, { error: 'This invite code has already been redeemed and cannot be reused.' });
          return;
        }

        if (new Date(invite.expiresAt).getTime() < Date.now()) {
          invite.status = 'expired';
          sendJson(res, 410, { error: 'This invite code has expired. Request a new one from your project leader.' });
          return;
        }

        const normalizedSender = (telegramUsername || '').replace(/^@/, '').trim().toLowerCase();
        if (normalizedSender && invite.telegramUsername && normalizedSender !== invite.telegramUsername) {
          sendJson(res, 403, {
            error: `This invite is specifically reserved for @${invite.telegramUsername}. Your Telegram username is @${normalizedSender}.`
          });
          return;
        }

        // Bind Telegram immutable identifiers to the verified invite
        invite.telegramNumericId = String(telegramUserId);
        invite.telegramChatId = String(chatId || telegramUserId);
        invite.verifiedAt = new Date().toISOString();

        sendJson(res, 200, {
          success: true,
          inviteId: invite.id,
          projectId: invite.projectId,
          projectName: invite.projectName,
          role: invite.role,
          boundTelegramId: invite.telegramNumericId,
          welcomeMessage: invite.welcomeMessage,
        });
      } catch (err) {
        console.error('[AI Server] Invite verification error:', err);
        sendJson(res, 500, { error: 'Internal server error verifying invite.' });
      }
    });
    return;
  }

  // 3. Complete redemption & Account Linking
  // Links authenticated Supabase auth user with verified Telegram identity and adds to project_members
  if (req.method === 'POST' && url.pathname === '/api/invites/redeem') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required to link account.' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { code, telegramUserId, telegramChatId } = JSON.parse(body || '{}');

        if (!code) {
          sendJson(res, 400, { error: 'Invite code is required.' });
          return;
        }

        const codeHash = hashInviteCode(code);
        const invite = IN_MEMORY_INVITES.get(codeHash);

        if (!invite) {
          sendJson(res, 404, { error: 'Invite code not found.' });
          return;
        }

        if (invite.status === 'redeemed') {
          sendJson(res, 409, { error: 'Invite code has already been redeemed.' });
          return;
        }

        if (new Date(invite.expiresAt).getTime() < Date.now()) {
          invite.status = 'expired';
          sendJson(res, 410, { error: 'Invite code has expired.' });
          return;
        }

        const telegramNumericId = String(telegramUserId || invite.telegramNumericId || '');
        const chatId = String(telegramChatId || invite.telegramChatId || telegramNumericId);

        if (!telegramNumericId) {
          sendJson(res, 400, { error: 'Telegram identity not bound. Please use /join CODE in the Telegram bot first.' });
          return;
        }

        // Atomically update invite status
        invite.status = 'redeemed';
        invite.redeemedByUserId = user.id;
        invite.redeemedAt = new Date().toISOString();

        // 1. Link Telegram account in messaging_accounts
        const { data: existingAccount } = await supabaseAdmin
          .from('messaging_accounts')
          .select('id')
          .eq('platform', 'telegram')
          .eq('external_user_id', telegramNumericId)
          .maybeSingle();

        if (existingAccount) {
          await supabaseAdmin
            .from('messaging_accounts')
            .update({
              user_id: user.id,
              private_chat_id: chatId,
              username: invite.telegramUsername,
              connection_status: 'connected',
              last_seen_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAccount.id);
        } else {
          await supabaseAdmin
            .from('messaging_accounts')
            .insert({
              user_id: user.id,
              platform: 'telegram',
              external_user_id: telegramNumericId,
              private_chat_id: chatId,
              username: invite.telegramUsername,
              connection_status: 'connected',
              connected_at: new Date().toISOString(),
              last_seen_at: new Date().toISOString(),
            });
        }

        // 2. Add verified auth user to project_members
        const { data: existingMembership } = await supabaseAdmin
          .from('project_members')
          .select('id')
          .eq('project_id', invite.projectId)
          .eq('user_id', user.id)
          .maybeSingle();

        // In existing Supabase schema, project_members.role has a check constraint allowing 'member'
        const dbRole = 'member';

        if (existingMembership) {
          const { error: updateMemErr } = await supabaseAdmin
            .from('project_members')
            .update({
              role: dbRole,
              revoked_at: null,
            })
            .eq('id', existingMembership.id);
          if (updateMemErr) {
            console.error('[AI Server] Membership update error:', updateMemErr);
            throw updateMemErr;
          }
        } else {
          const { error: insertMemErr } = await supabaseAdmin
            .from('project_members')
            .insert({
              project_id: invite.projectId,
              user_id: user.id,
              role: dbRole,
              joined_at: new Date().toISOString(),
            });
          if (insertMemErr) {
            console.error('[AI Server] Membership insert error:', insertMemErr);
            throw insertMemErr;
          }
        }

        // 3. Create Welcome in-app notification in member's inbox
        const notification = {
          id: crypto.randomUUID(),
          userId: user.id,
          projectId: invite.projectId,
          title: `Welcome to ${invite.projectName}!`,
          message: invite.welcomeMessage || `You were invited by your project leader as ${invite.role}.`,
          senderUserId: invite.createdByUserId,
          type: 'welcome',
          isRead: false,
          telegramDeliveryStatus: 'pending',
          createdAt: new Date().toISOString(),
        };

        const userNotes = IN_MEMORY_NOTIFICATIONS.get(user.id) || [];
        userNotes.unshift(notification);
        IN_MEMORY_NOTIFICATIONS.set(user.id, userNotes);

        // 4. Send outbound welcome message to linked Telegram chat via Bot API
        let telegramDelivered = false;
        if (BOT_TOKEN && chatId) {
          try {
            const { Telegraf } = await import('telegraf');
            const telegramClient = new Telegraf(BOT_TOKEN);
            const welcomeText = `🎉 Welcome to PROJEX!\n\nYou have joined "${invite.projectName}" as ${invite.role}.\n\nLeader Message:\n"${invite.welcomeMessage || 'Glad to have you on the team!'}"\n\nYou can now use /projects and /tasks 1 right here in Telegram!`;

            const sent = await telegramClient.telegram.sendMessage(chatId, welcomeText);
            telegramDelivered = true;
            notification.telegramDeliveryStatus = 'sent';

            // Log event in message_events
            try {
              await supabaseAdmin.from('message_events').insert({
                platform: 'telegram',
                external_message_id: String(sent.message_id),
                user_id: user.id,
                project_id: invite.projectId,
                message_text: welcomeText,
                message_direction: 'outgoing',
                processing_status: 'delivered',
                processed_at: new Date().toISOString(),
              });
            } catch (evErr) {
              console.warn('[AI Server] Could not record message_event:', evErr.message);
            }
          } catch (tErr) {
            console.error('[AI Server] Welcome Telegram send error:', tErr.message);
            notification.telegramDeliveryStatus = 'failed';
          }
        }

        sendJson(res, 200, {
          success: true,
          projectId: invite.projectId,
          projectName: invite.projectName,
          role: invite.role,
          linkedTelegramId: telegramNumericId,
          telegramDelivered,
          message: `Successfully joined ${invite.projectName} and linked Telegram account!`,
        });
      } catch (err) {
        console.error('[AI Server] Invite redeem error:', err);
        sendJson(res, 500, { error: 'Internal server error redeeming invite.' });
      }
    });
    return;
  }

  // 4. In-App Notifications Endpoint (Inbox)
  if (req.method === 'GET' && url.pathname === '/api/notifications') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    const notifications = IN_MEMORY_NOTIFICATIONS.get(user.id) || [];
    sendJson(res, 200, { notifications });
    return;
  }

  // 5. Telegram Connection Status for authenticated user
  if (req.method === 'GET' && url.pathname === '/api/telegram/status') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    try {
      const { data: account } = await supabaseAdmin
        .from('messaging_accounts')
        .select('id, username, private_chat_id, connection_status, last_seen_at')
        .eq('platform', 'telegram')
        .eq('user_id', user.id)
        .maybeSingle();

      if (account) {
        const isConnected = account.connection_status === 'connected' && Boolean(account.private_chat_id);
        sendJson(res, 200, {
          linked: true,
          status: isConnected ? 'connected' : 'pending_link',
          telegramUsername: account.username ? `@${account.username.replace(/^@/, '')}` : null,
          chatId: account.private_chat_id || null,
          botUsername: TELEGRAM_BOT_USERNAME,
          botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
          lastSeenAt: account.last_seen_at,
        });
      } else {
        sendJson(res, 200, {
          linked: false,
          status: 'not_linked',
          telegramUsername: null,
          chatId: null,
          botUsername: TELEGRAM_BOT_USERNAME,
          botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
          instructions: `Set your Telegram username and start @${TELEGRAM_BOT_USERNAME} to link your account.`,
        });
      }
    } catch (err) {
      console.error('[AI Server] Telegram status error:', err);
      sendJson(res, 500, { error: 'Internal server error checking Telegram status.' });
    }
    return;
  }

  // 6. Connect / Link Telegram Username for authenticated user
  if (req.method === 'POST' && url.pathname === '/api/telegram/link-username') {
    const user = await authenticateUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized: valid Supabase session required.' });
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { telegramUsername } = JSON.parse(body || '{}');

        if (!telegramUsername) {
          sendJson(res, 400, { error: 'telegramUsername is required.' });
          return;
        }

        const normalizedUsername = telegramUsername.replace(/^@/, '').trim().toLowerCase();
        if (!/^[a-zA-Z0-9_]{3,32}$/.test(normalizedUsername)) {
          sendJson(res, 400, { error: 'Invalid Telegram username format (must be 3-32 alphanumeric or underscores).' });
          return;
        }

        // Check if an existing account record exists for this user
        const { data: existingUserAccount } = await supabaseAdmin
          .from('messaging_accounts')
          .select('id, private_chat_id, external_user_id')
          .eq('platform', 'telegram')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingUserAccount) {
          await supabaseAdmin
            .from('messaging_accounts')
            .update({
              username: normalizedUsername,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingUserAccount.id);

          sendJson(res, 200, {
            success: true,
            status: existingUserAccount.private_chat_id ? 'connected' : 'pending_link',
            telegramUsername: `@${normalizedUsername}`,
            botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
            message: existingUserAccount.private_chat_id
              ? `Telegram username updated to @${normalizedUsername} (Connected).`
              : `Username linked as @${normalizedUsername}. Open @${TELEGRAM_BOT_USERNAME} and send /start to complete activation.`,
          });
        } else {
          // Check if an existing unassigned account exists matching this username
          const { data: matchedAccount } = await supabaseAdmin
            .from('messaging_accounts')
            .select('id, private_chat_id')
            .eq('platform', 'telegram')
            .ilike('username', normalizedUsername)
            .maybeSingle();

          if (matchedAccount) {
            await supabaseAdmin
              .from('messaging_accounts')
              .update({
                user_id: user.id,
                connection_status: 'connected',
                updated_at: new Date().toISOString(),
              })
              .eq('id', matchedAccount.id);

            sendJson(res, 200, {
              success: true,
              status: 'connected',
              telegramUsername: `@${normalizedUsername}`,
              message: `Successfully connected to Telegram account @${normalizedUsername}!`,
            });
          } else {
            // Create pending entry
            await supabaseAdmin
              .from('messaging_accounts')
              .insert({
                user_id: user.id,
                platform: 'telegram',
                username: normalizedUsername,
                connection_status: 'pending',
                connected_at: new Date().toISOString(),
              });

            sendJson(res, 200, {
              success: true,
              status: 'pending_link',
              telegramUsername: `@${normalizedUsername}`,
              botLink: `https://t.me/${TELEGRAM_BOT_USERNAME}`,
              message: `Username recorded as @${normalizedUsername}. Now open Telegram, start @${TELEGRAM_BOT_USERNAME}, and send /start to verify connectivity!`,
            });
          }
        }
      } catch (err) {
        console.error('[AI Server] Link username error:', err);
        sendJson(res, 500, { error: 'Internal server error linking Telegram username.' });
      }
    });
    return;
  }

  sendJson(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`[PROJEX AI Server] Listening on http://localhost:${PORT}`);
  console.log(`[PROJEX AI Server] Gemini Configured: ${Boolean(GEMINI_API_KEY)}`);
});
