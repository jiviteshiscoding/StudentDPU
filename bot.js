
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

async function getLinkedAccount(ctx) {
  if (ctx.chat.type !== "private") {
    return null;
  }

  const { data, error } = await supabase
    .from("messaging_accounts")
    .select("id, user_id")
    .eq("platform", "telegram")
    .eq("external_user_id", String(ctx.from.id))
    .eq("connection_status", "connected")
    .maybeSingle();

  if (error) throw error;

  if (data) {
    const { error: updateError } = await supabase
      .from("messaging_accounts")
      .update({
        private_chat_id: String(ctx.chat.id),
        username: ctx.from.username ?? null,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (updateError) throw updateError;
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
  await ctx.reply(
    "Welcome to your AI Coordinator!\n\n" +
    "Commands:\n" +
    "/projects - List your projects\n" +
    "/tasks 1 - List tasks in project 1\n" +
    "/task 1 Prepare presentation - Create a task\n" +
    "/help - Show commands"
  );
});

bot.on("text", async (ctx) => {
  try {
    if (ctx.chat.type !== "private") {
      await ctx.reply("Please use this bot in a private chat.");
      return;
    }

    const account = await getLinkedAccount(ctx);

    if (!account) {
      await ctx.reply(
        "Your Telegram account is not linked. Please contact the project administrator."
      );
      return;
    }

    await logIncomingMessage(ctx, account);

    const text = ctx.message.text.trim();
    const [rawCommand = "", ...args] = text.split(/\s+/);
    const command = rawCommand.split("@")[0].toLowerCase();

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
