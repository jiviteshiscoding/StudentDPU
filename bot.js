
import "dotenv/config";
import { Telegraf } from "telegraf";
import { createClient } from "@supabase/supabase-js";

for (const key of [
  "BOT_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  if (!process.env[key]) {
    throw new Error(`${key} is missing from .env`);
  }
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// ── In-memory rate limiter for bot commands ─────────────────────────────
const BOT_RATE_LIMITS = new Map(); // telegramUserId -> { count, resetAt }

function checkBotRateLimit(telegramUserId, limit = 8, windowMs = 60000) {
  const key = String(telegramUserId);
  const now = Date.now();
  const entry = BOT_RATE_LIMITS.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  BOT_RATE_LIMITS.set(key, entry);
  if (entry.count > limit) {
    const waitSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, waitSec };
  }
  return { allowed: true, waitSec: 0 };
}

async function getLinkedAccount(ctx) {
  if (ctx.chat.type !== "private") {
    return null;
  }

  // 1. Try to find by external_user_id
  let { data, error } = await supabase
    .from("messaging_accounts")
    .select("id, user_id, connection_status, username")
    .eq("platform", "telegram")
    .eq("external_user_id", String(ctx.from.id))
    .maybeSingle();

  if (error) throw error;

  // 2. If not found by external ID, try to match by username if the user registered on web
  if (!data && ctx.from.username) {
    const cleanUsername = ctx.from.username.toLowerCase();
    const { data: userByUsername, error: matchErr } = await supabase
      .from("messaging_accounts")
      .select("id, user_id, connection_status, username")
      .eq("platform", "telegram")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (!matchErr && userByUsername) {
      data = userByUsername;
    }
  }

  if (data) {
    const { error: updateError } = await supabase
      .from("messaging_accounts")
      .update({
        external_user_id: String(ctx.from.id),
        private_chat_id: String(ctx.chat.id),
        username: ctx.from.username ?? data.username ?? null,
        connection_status: "connected",
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (updateError) console.warn("Could not update messaging_accounts:", updateError.message);
  }

  return data;
}

async function getAccessibleProjects(userId) {
  const [ownedResult, membershipResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, deadline")
      .eq("created_by", userId),

    supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", userId)
      .is("revoked_at", null),
  ]);

  if (ownedResult.error) throw ownedResult.error;
  if (membershipResult.error) throw membershipResult.error;

  const projectIds = new Set([
    ...ownedResult.data.map((p) => p.id),
    ...membershipResult.data.map((m) => m.project_id),
  ]);

  if (projectIds.size === 0) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status, deadline")
    .in("id", [...projectIds])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

async function logIncomingMessage(ctx, account) {
  const { error } = await supabase
    .from("message_events")
    .insert({
      platform: "telegram",
      external_event_id: String(ctx.update.update_id),
      external_message_id: String(ctx.message.message_id),
      messaging_account_id: account.id,
      user_id: account.user_id,
      message_text: ctx.message.text,
      message_direction: "incoming",
      processing_status: "pending",
    });

  if (error) throw error;
}

bot.start(async (ctx) => {
  const startArg = ctx.message.text.split(/\s+/)[1];
  if (startArg && startArg.toUpperCase().startsWith("PRJ-")) {
    await handleJoinCommand(ctx, startArg);
    return;
  }

  await ctx.reply(
    "Welcome to PROJEX AI Coordinator!\n\n" +
    "Commands:\n" +
    "/projects - List your projects\n" +
    "/tasks 1 - List tasks in project 1\n" +
    "/task 1 Prepare presentation - Create a task\n" +
    "/join CODE - Join project with your invite code\n" +
    "/help - Show commands"
  );
});

async function handleJoinCommand(ctx, code) {
  try {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      await ctx.reply("Please provide your invite code. Format:\n/join PRJ-XXXX");
      return;
    }

    const res = await fetch("http://localhost:3001/api/invites/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: cleanCode,
        telegramUserId: String(ctx.from.id),
        telegramUsername: ctx.from.username || null,
        chatId: String(ctx.chat.id),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      await ctx.reply(`❌ ${data.error || "Invite verification failed."}`);
      return;
    }

    await ctx.reply(
      `✅ Invite verified for project "${data.projectName}"!\n` +
      `Role: ${data.role}\n\n` +
      `Your Telegram identity has been bound to this invite.\n\n` +
      `👉 Final Step: Open PROJEX on the web and click "Redeem Invite / Link Telegram", or sign up/log in to complete your membership setup.`
    );
  } catch (err) {
    console.error("Join command error:", err);
    await ctx.reply("Failed to verify invite code. Please make sure the PROJEX server is running.");
  }
}

bot.on("text", async (ctx) => {
  try {
    if (ctx.chat.type !== "private") {
      await ctx.reply("Please use this bot in a private chat.");
      return;
    }

    // Rate limit: 8 commands per minute per user
    const rateCheck = checkBotRateLimit(ctx.from.id);
    if (!rateCheck.allowed) {
      await ctx.reply(
        `⏳ You're sending commands too quickly. Please wait ${rateCheck.waitSec}s before trying again.`
      );
      return;
    }

    const text = ctx.message.text.trim();
    const [rawCommand = "", ...args] = text.split(/\s+/);
    const command = rawCommand.split("@")[0].toLowerCase();

    // Allow /join command even before the account is fully linked
    if (command === "/join") {
      await handleJoinCommand(ctx, args[0]);
      return;
    }

    const account = await getLinkedAccount(ctx);

    if (!account) {
      await ctx.reply(
        "Your Telegram account is not yet linked to a PROJEX project.\n\n" +
        "If you have an invite code from your project leader, join using:\n" +
        "/join YOUR-CODE"
      );
      return;
    }

    await logIncomingMessage(ctx, account);

    if (command === "/start" || command === "/help") {
      await ctx.reply(
        "Available commands:\n" +
        "/projects - List accessible projects\n" +
        "/tasks 1 - List tasks in project number 1\n" +
        "/task 1 Prepare presentation - Create a task\n" +
        "/help - Show this help"
      );
      return;
    }

    if (command === "/projects") {
      const projects = await getAccessibleProjects(account.user_id);

      if (!projects.length) {
        await ctx.reply(
          "No accessible projects found. Create a project in your website first."
        );
        return;
      }

      const message = projects
        .map(
          (p, index) =>
            `${index + 1}. ${p.name}\n   Status: ${p.status}`
        )
        .join("\n\n");

      await ctx.reply(`Your projects:\n\n${message}`);
      return;
    }

    if (command === "/tasks") {
      const projectNumber = Number(args[0]);

      if (!Number.isInteger(projectNumber) || projectNumber < 1) {
        await ctx.reply("Use: /tasks 1");
        return;
      }

      const projects = await getAccessibleProjects(account.user_id);
      const project = projects[projectNumber - 1];

      if (!project) {
        await ctx.reply("Invalid project number. Send /projects first.");
        return;
      }

      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("title, status, priority, deadline")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!tasks?.length) {
        await ctx.reply(`No tasks found in "${project.name}".`);
        return;
      }

      await ctx.reply(
        `Tasks in "${project.name}":\n\n` +
        tasks
          .map(
            (t, i) =>
              `${i + 1}. ${t.title}\n   Status: ${t.status} | Priority: ${t.priority}`
          )
          .join("\n\n")
      );
      return;
    }

    if (command === "/task") {
      const projectNumber = Number(args[0]);
      const title = args.slice(1).join(" ").trim();

      if (
        !Number.isInteger(projectNumber) ||
        projectNumber < 1 ||
        !title
      ) {
        await ctx.reply(
          "Use this format:\n/task 1 Prepare presentation"
        );
        return;
      }

      const projects = await getAccessibleProjects(account.user_id);
      const project = projects[projectNumber - 1];

      if (!project) {
        await ctx.reply("Invalid project number. Send /projects first.");
        return;
      }

      const { data: task, error } = await supabase
        .from("tasks")
        .insert({
          project_id: project.id,
          title,
          created_by: account.user_id,
          status: "pending",
          priority: "medium",
        })
        .select("id, title, status")
        .single();

      if (error) throw error;

      const { error: historyError } = await supabase
        .from("task_history")
        .insert({
          task_id: task.id,
          actor_user_id: account.user_id,
          source: "telegram",
          new_status: "pending",
          change_reason: "Task created through Telegram",
          original_message: text,
        });

      if (historyError) {
        console.error("Task history insert failed:", historyError);
      }

      await ctx.reply(
        `Task created successfully!\n\n` +
        `Project: ${project.name}\n` +
        `Task: ${task.title}\n` +
        `Status: ${task.status}`
      );
      return;
    }

    await ctx.reply(
      "I don't recognize that command. Send /help to see available commands."
    );
  } catch (error) {
    console.error("Telegram command failed:", error);
    await ctx.reply(
      "Something went wrong while processing your request. Check the VS Code terminal for details."
    );
  }
});

bot.catch((error) => {
  console.error("Telegram bot error:", error);
});

bot.launch()
  .then(() => console.log("AI Coordinator Telegram bot is running"))
  .catch((error) => {
    console.error("Bot startup failed:", error);
    process.exitCode = 1;
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
