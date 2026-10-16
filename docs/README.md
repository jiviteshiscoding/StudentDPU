# AI Group Project Coordinator

An AI-powered workspace and messaging bot for college teams, hackathons, and collaborative projects. It turns a natural-language project idea into an approved workflow, proposes team roles and a deadline-aware schedule, and then coordinates execution through task tracking, dependency awareness, reminders, meetings, and files.

## The core idea

**The AI doesn't just track tasks. It helps create the plan and coordinates the team needed to complete it.**

A team leader can describe a project in informal language—even if the brief is incomplete. The AI interprets the requirements, proposes project phases and tasks, connects dependencies, assigns suggested roles based on team information, and generates a schedule. The leader reviews and approves the plan before it becomes active.

## Main features

### 1. AI Workflow Architect — core differentiator
- Interprets a vague natural-language project brief.
- Extracts goals, scope, deliverables, constraints, assumptions, and open questions.
- Generates phases, tasks, subtasks, acceptance criteria, dependencies, and milestones.
- Identifies parallel work and important integration points.
- Estimates durations and flags uncertainty or unrealistic deadlines.
- Creates a timeline based on deadlines, dependencies, availability, and workload.
- Lets the leader refine the plan conversationally.
- Shows an editable preview; the leader approves before activation.

### 2. AI role and task assignment
- Suggests roles and owners using declared skills, experience, preferences, availability, and current workload.
- Identifies overloaded members and assignment gaps.
- Supports reassignment and workload balancing.
- Asks for missing information rather than pretending to know members' capabilities.
- Keeps the leader in control of initial assignments and consequential changes.

### 3. AI scheduling and replanning
- Creates start targets, due dates, milestones, and checkpoints.
- Respects task dependencies and schedules independent work in parallel.
- Flags critical dependencies, blocked work, and infeasible deadlines.
- Recalculates affected dates when deadlines, scope, or availability changes.
- Explains trade-offs such as reducing scope, adding help, or moving a deadline.

### 4. Natural-language coordination
Members can message the Telegram bot in ordinary language, for example:
> “I finished the API integration, but backend authentication is still pending.”

The AI maps the message to candidate task updates, validates them, asks for clarification if needed, records the change, and updates the shared workspace.

### 5. Web workspace
- Project dashboard and activity feed.
- Editable workflow preview and approval.
- Kanban board: Backlog, To Do, In Progress, Blocked, In Review, Done, Cancelled.
- Task details, dependencies, deadlines, and linked files.
- Team roles, skills, availability, and workload.
- Timeline, milestones, risk reports, and approval queue.
- Meetings, files, and project knowledge.

### 6. Telegram bot
Example commands:
`/start`, `/help`, `/join PROJECT-CODE`, `/projects`, `/switch`, `/tasks`, `/task TASK-ID`, `/update`, `/done TASK-ID`, `/block TASK-ID`, `/unblock TASK-ID`, `/myweek`, `/status`, `/blocked`, `/ask`, `/meeting`, `/availability`, `/newtask`, `/assign`, `/remind`, `/report weekly`, `/invite`, `/files`, `/file search`.

Commands are a fallback: natural-language updates should be a first-class interaction. Members can interact privately with the bot and do not have to be in a shared Telegram group.

**Telegram constraint:** users generally need to start a private bot conversation before it can message them. Onboarding should explain this and must not claim a private notification was delivered when it was not.

### 7. Proactive reminders and risk detection
- Assignment and deadline notifications.
- Stale-progress and overdue-task follow-ups.
- Blocker and dependency alerts.
- Milestone risk warnings.
- Meeting reminders and review requests.
- Weekly status summaries.
- Deduplication and reminder suppression after the issue is resolved.

### 8. Meetings
- Schedule meetings through an existing provider where supported.
- Send invitations and reminders.
- Prepare agendas from blocked or overdue work.
- Capture decisions and action items.
- Convert confirmed action items into tasks.

Start with an existing meeting provider; custom embedded video/WebRTC is a stretch goal.

### 9. File sharing and project knowledge
- Shared project file library and task-linked attachments.
- Version history and clear identification of official deliverables.
- Submission, review, and feedback workflow.
- External links to tools such as Drive, GitHub, and Figma.
- Authorized file search and AI summaries grounded in retrieved content.

## Example end-to-end flow

1. Leader: “We need a college event website with login, registration, admin controls, and a database. Five people, two weeks.”
2. AI interprets the brief and lists assumptions or important questions.
3. AI proposes phases, tasks, dependencies, deliverables, owners, estimates, and dates.
4. Leader edits and approves the workflow.
5. Members join through the web app or Telegram onboarding.
6. Members report progress and blockers naturally.
7. Workspace updates, reminders are sent, and risks are detected.
8. If a deadline or availability changes, the AI proposes a revised schedule and explains the impact.

## Suggested technology stack

- **Frontend:** React, Vite, TypeScript.
- **Backend:** Node.js, Express, TypeScript.
- **Database/auth/realtime:** Supabase, PostgreSQL, Supabase Auth, Realtime.
- **File storage:** private Supabase Storage bucket or equivalent object storage.
- **Messaging:** Telegram Bot API.
- **AI:** backend LLM integration with structured output and server-side validation.
- **Background jobs:** persistent worker/scheduler for reminders, deadline checks, retries, and reports.
- **Meetings:** supported external calendar/video provider integration.

The web app and bot should use the same backend and canonical database.

## Architecture rules

- The database is the source of truth.
- The model proposes structured actions; the backend validates permissions, task references, dependencies, dates, and state transitions before committing changes.
- Initial workflow, roles, and schedule require leader approval.
- Use audit logs for significant changes.
- Validate dependency graphs and reject cycles.
- Keep secrets and service-role credentials out of frontend code.
- Enforce project-level access control and row-level security.
- Treat messages and uploaded files as untrusted content.
- Use persistent jobs and idempotent webhook handling.
- Avoid notification spam and respect user preferences.
- Do not invent progress, member skills, file contents, or successful delivery.

## Task state model

- Backlog
- To Do
- In Progress
- Blocked
- In Review
- Done
- Cancelled

Completing a prerequisite can unblock a downstream task but must not mark that downstream task complete. Completing a subtask must not automatically complete its parent.

## Implementation priority

1. Projects, members, tasks, dependencies, milestones, permissions, and audit history.
2. **AI Workflow Architect:** natural-language brief → workflow → role proposals → schedule → editable preview → approval.
3. Telegram onboarding and natural-language progress updates.
4. Realtime workspace updates, persistent reminders, blocker detection, and schedule-impact analysis.
5. Meetings and file library.
6. Advanced reporting, grounded file search, additional platforms, and optional custom video.

## Demo acceptance criteria

A strong end-to-end demo should show:
- A vague project brief becoming a coherent, dependency-aware workflow.
- Suggested roles grounded in member profiles rather than invented skills.
- A deadline-aware schedule with feasibility warnings.
- Leader review and approval before the plan activates.
- Natural-language progress updates from Telegram reflected in the workspace.
- A blocker causing a visible risk assessment and a proposed recovery plan.
- An audit trail for meaningful changes.

## Project status

This README describes the intended product and implementation plan. Mark features as **planned**, **in progress**, or **working** based on actual implementation and end-to-end tests. Do not claim integrations are operational before testing them.

For the complete specification, architecture, detailed workflows, validation rules, and acceptance tests, see [`BRAIN.md`](BRAIN.md).
