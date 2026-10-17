# BRAIN.md — AI Group Project Coordinator

## 1. Product vision

Build an AI-driven workspace and messaging bot that helps student teams turn an informal project idea into an approved, executable plan—and then actively coordinates the people, tasks, dependencies, deadlines, meetings, and files needed to deliver it.

**Product promise:** The AI does not merely track tasks humans already created. It interprets the team leader's natural-language project brief, designs a suitable workflow, proposes roles and responsibilities, generates a schedule, and helps the team execute that plan.

The product should feel like a practical project coordinator for college teams, hackathons, assignments, and small collaborative projects.

## 2. Core principles

- **Database is the source of truth.** The AI may interpret and propose changes, but validated backend operations update the canonical project state.
- **Plan first, then execute.** Generated workflows, role assignments, and schedules are proposals until the team leader approves them.
- **No invented progress.** Never mark work complete or claim a member has done something without a grounded update or explicit action.
- **Natural language first.** Members should be able to report progress and ask for changes conversationally, not learn a complex command system.
- **Dependency-aware coordination.** Plans must represent what depends on what, what can run in parallel, and what is blocked.
- **Human control and auditability.** Important changes are visible, reversible where practical, and recorded.
- **Privacy by default.** Members see project information only when authorized. Do not read unrelated private conversations.
- **Useful notifications, not spam.** Reminders should be deduplicated, contextual, configurable, and suppressed when the issue is resolved.
- **Honest uncertainty.** Ask clarifying questions when missing information could materially change the plan.

## 3. Primary workflow: idea to execution

### Stage A — Team leader describes the project

The leader enters a natural-language brief. It can be informal or incomplete and may include:
- What the team is building or delivering.
- Desired features, requirements, and constraints.
- Team size and known member skills.
- Deadline, available working time, and milestones.
- Required technologies, tools, or submission format.
- Known limitations, dependencies, or risks.

Example brief:
> “We need to build a college event website with login, event registration, an admin panel, and a database. There are five of us and we have two weeks.”

The AI extracts a structured project brief: goals, scope, deliverables, constraints, assumptions, open questions, and success criteria. It must distinguish facts supplied by the leader from its own assumptions.

### Stage B — AI Workflow Architect creates a suitable workflow

This is a **core USP**, not an optional add-on. The AI interprets the brief and proposes an actionable plan tailored to the project's size, complexity, deadline, and team.

The workflow should include:
1. Project phases and milestones.
2. Workstreams and tasks.
3. Useful subtasks and concrete deliverables.
4. Dependencies and prerequisite relationships.
5. Tasks that can safely run in parallel.
6. Logical execution order and integration points.
7. Testing, review, documentation, and final submission.
8. Estimated task durations, with uncertainty where appropriate.
9. Risks, assumptions, and unresolved questions.
10. Completion criteria for important tasks.

The AI should avoid overengineering a small assignment. It should adapt the granularity of tasks to the scope and deadline. It should not invent mandatory technologies or requirements; recommendations must be labelled as recommendations.

### Stage C — AI proposes roles and assignments

The AI maps work to team members using known, explicitly provided information such as:
- Skills and experience.
- Stated interests and preferred responsibilities.
- Availability and expected workload.
- Existing assignments and dependencies.
- Learning goals, when members choose to provide them.

It proposes roles, task owners, reviewers, and collaboration pairs where useful. It should flag missing skill or availability information rather than pretending to know it. If member profiles are unavailable, it asks the leader to collect them or makes clearly labelled provisional assignments.

Example for a five-person website project:
- Frontend developer — pages, UI implementation, API integration.
- Backend developer — API design, business logic, authentication.
- Database owner — schema, data access, migrations.
- UI/UX designer — wireframes, design system, accessibility review.
- QA/integration owner — test plan, integration checks, bug verification.

These are illustrative roles only. Real assignments must follow the actual team context, and roles can overlap in small teams. AI must not assume that one person is capable or available simply because of their assigned label.

### Stage D — AI generates a schedule

The AI creates a timeline based on:
- Project deadline and milestones.
- Estimated durations and uncertainty.
- Dependency graph and critical path.
- Member availability and workload.
- Tasks that can run in parallel.
- Integration, review, testing, and contingency buffer.

The generated schedule should contain start targets, due dates, milestones, task owners, dependency-aware sequencing, and checkpoints. It should not schedule a downstream task as unblocked if a prerequisite is still incomplete. If the requested deadline appears unrealistic, the AI should explain why and propose options: reduce scope, add help, move the deadline, or accept clearly stated risks.

### Stage E — Leader reviews and approves

Show the proposed plan in an editable preview before it becomes active. The leader can approve the entire plan or modify individual tasks, owners, dependencies, estimates, and dates.

The AI should ask for clarification when an ambiguity would significantly affect scope, feasibility, or ownership. Minor assumptions can be surfaced in an assumptions list for the leader to accept or change.

**Approval rule:** Do not activate assignments, send deadline commitments to members, or create external meeting invitations until the leader approves the plan or the relevant action.

### Stage F — Natural-language refinement

The leader can revise the plan conversationally, for example:
- “We only have ten days now.”
- “Member B is unavailable until Friday.”
- “Move testing to the final three days.”
- “Give the database work to someone else.”
- “Frontend and backend can start in parallel.”
- “Cut the optional analytics feature.”
- “Show me the tasks that are on the critical path.”

The AI should update only the affected portions, explain material changes, and re-evaluate dependencies, workload, milestones, and downstream dates. It should not silently overwrite the entire plan for a small change.

### Stage G — Ongoing coordination and replanning

After approval, the workflow becomes the team's shared plan. Members update progress through the web app or the messaging bot. The system compares actual progress with the schedule, detects blockers and risks, and proposes adjustments.

Routine actions explicitly authorized by project rules can be automated. Changes that materially affect scope, ownership, deadlines, or other members should be surfaced for approval according to project settings. Keep a history of what changed, why, who approved it, and which AI suggestion or user action initiated it.

## 4. Core USPs

1. **AI Workflow Architect:** Converts a vague project idea into a structured, dependency-aware plan.
2. **Automatic role and responsibility planning:** Suggests owners based on real skills, preferences, availability, and workload.
3. **Deadline-aware scheduling:** Builds a feasible timeline, identifies parallel work and critical dependencies, and flags unrealistic deadlines.
4. **Natural-language progress tracking:** Members describe what they did in ordinary language; the AI proposes structured updates.
5. **Dependency-aware AI coordinator:** Understands downstream impact when a task is delayed or blocked.
6. **Meeting-to-execution pipeline:** Turns decisions and action items into tracked tasks.
7. **Early-warning risk system:** Detects stale tasks, overload, schedule slippage, and blockers before final delivery.
8. **Autonomous follow-up loop:** Sends contextual reminders and asks for updates based on project state.
9. **Trustworthy AI with audit trail:** Validates proposed actions and records changes instead of letting the model mutate project state unchecked.

## 5. Product surfaces

### A. Web workspace

Main areas:
- Project overview/dashboard.
- Workflow plan preview and approval.
- Kanban board.
- Task detail and dependency view.
- Timeline/calendar and milestones.
- Team members, skills, roles, availability, and workload.
- Meetings and agenda.
- File library and deliverable submissions.
- Activity feed and change history.
- Reports, risks, and approval queue.
- Project settings, permissions, notification preferences, and integrations.

#### Dashboard
Show overall status, milestone progress, overdue tasks, blocked work, upcoming deadlines, workload distribution, recent activity, and AI-generated risks. Distinguish verified status from AI forecasts.

#### Workflow builder and plan preview
This is central to the product. Present the AI-generated phases, tasks, dependencies, owners, estimates, dates, assumptions, and risks in an editable preview. Allow the leader to approve, reject, regenerate a section, or change details in natural language.

#### Kanban
Suggested task states:
- Backlog
- To Do
- In Progress
- Blocked
- In Review
- Done
- Cancelled

Task cards show owner, deadline, priority, dependencies, and status. A completed subtask does not automatically complete its parent; a downstream task does not become complete just because its prerequisite is resolved.

#### Task detail
Include description, acceptance criteria, owner, collaborators, reviewer, status, priority, estimate, due date, dependencies, linked files, comments, updates, history, and suggested next action.

#### Team and workload
Show member roles, declared skills, preferences, availability, open tasks, estimated workload, and overdue assignments. Make assignment conflicts visible. Let members correct their profiles and availability.

#### Timeline and milestones
Show tasks over time, dependency links, milestone dates, schedule changes, and potential critical-path risks. Recompute affected dates when inputs change; do not imply exact estimates are guarantees.

#### Activity and approvals
Record task updates, reassignment, deadline changes, plan revisions, meeting decisions, and file changes. Provide an approval queue for actions requiring leader review.

### B. Telegram bot

The bot provides a low-friction interface for joining projects, updating work, receiving reminders, and accessing project information. It shares the same backend and permissions as the web workspace.

Important Telegram constraints:
- A bot generally cannot start a private conversation with a user who has never started it. The member must open the bot and press Start or send `/start` before private reminders can be delivered.
- Use Telegram's stable platform user ID for identity mapping, not mutable usernames alone.
- Use expiring, single-use or otherwise protected invitation tokens where appropriate.
- A bot cannot read Telegram Secret Chats and should not access unrelated private conversations.
- Members can interact privately with the bot; they do not necessarily need to be in a shared Telegram group.

#### Onboarding and membership
A member opens the bot via a deep link or uses a project invite code. The backend validates the invitation, associates the Telegram account with the project membership, and applies the project's role permissions. The bot confirms the project and available commands.

#### Example command set
- `/start` — start the bot and onboarding.
- `/help` — help and supported actions.
- `/join PROJECT-CODE` — join with a valid invitation.
- `/projects` — list joined projects.
- `/switch` — switch active project.
- `/tasks` — list the member's tasks.
- `/task TASK-ID` — show task details.
- `/update` — report progress.
- `/done TASK-ID` — request or record task completion, subject to validation.
- `/block TASK-ID` — report a blocker.
- `/unblock TASK-ID` — report that a blocker is resolved.
- `/myweek` — upcoming tasks and deadlines.
- `/status` — project status.
- `/blocked` — blocked work.
- `/who` — show relevant task owner/contact.
- `/ask` — ask a project-context question.
- `/meeting` — view or create a meeting flow.
- `/availability` — update availability.
- `/newtask` — propose a new task.
- `/assign` — request or propose assignment changes, subject to permissions.
- `/remind` — configure an allowed reminder.
- `/report weekly` — generate a weekly summary.
- `/invite` — request an invitation link, subject to permissions.
- `/files` — list project files.
- `/file search` — search authorized project files.

Commands are a fallback, not the only interaction mode. The bot should understand natural-language messages such as “I finished the login UI, but the API integration is waiting on the backend.” It should propose separate updates for completed work and blockers, ask for clarification if the target task is ambiguous, and then update the shared project state through validated backend operations.

### C. Natural-language progress loop

1. Member sends a progress message.
2. Backend resolves the member, active project, and relevant tasks.
3. AI extracts candidate updates, status changes, blockers, dates, and references.
4. Server validates project membership, permissions, task IDs, allowed state transitions, and evidence.
5. If ambiguous or consequential, ask the member to confirm.
6. Apply approved, validated changes to the database.
7. Record the change and its source in the activity history.
8. Recompute affected dependencies, schedule risks, and notifications.
9. Update the web workspace in real time and acknowledge the member.

Example: “I finished the API integration, but the backend authentication is still pending.” The AI should not infer that the entire backend is done. It should map the statement to the appropriate known tasks or ask which task the member means.

## 6. Proactive notifications and follow-up

The coordinator should send relevant notifications for:
- New assignments and reassignment.
- Upcoming and overdue deadlines.
- Tasks that have not received an update for a configurable period.
- Blockers and dependencies that are preventing work.
- A prerequisite becoming complete.
- Risk to a milestone or final deadline.
- Meeting invitations, reminders, and RSVP status.
- Agenda, decisions, and action-item summaries.
- Review requests and requested changes.
- New or updated project files.
- Weekly summaries and milestone reports.
- Changes to the approved workflow that affect a member.

Notification rules:
- Respect member preferences and project quiet hours where configured.
- Deduplicate repeated notifications.
- Stop reminders when a task is updated, completed, cancelled, or no longer overdue.
- Escalate only after a configured threshold.
- Do not expose private messages or sensitive member details to the whole team.
- If a user has not started a Telegram bot conversation, show the leader/member an onboarding prompt rather than claiming a private notification was delivered.

## 7. Meetings

### Initial integration
Prefer integrating with an existing meeting provider (for example, Google Meet through a supported calendar workflow) rather than building video infrastructure first.

Features:
- Create a meeting with title, time, participants, and project link.
- Send invitations and bot reminders.
- Track RSVP/availability when supported.
- Generate an agenda from blocked, overdue, and decision-pending tasks.
- Link meeting notes and relevant files.
- Capture decisions and action items.
- Convert confirmed action items into assigned tasks with due dates.
- Update the project timeline after approved decisions.

Do not claim that live transcription, recording, or calendar integration works until it is implemented and authorized. Custom embedded video/WebRTC is a stretch goal.

## 8. File sharing and project knowledge

Features:
- Central project file library.
- Attach files or links to tasks, meetings, and milestones.
- Upload and retrieve files through the web app or bot.
- Version history and a clear indicator of the current/official file.
- Pin or mark the approved final deliverable.
- Review/submission status and feedback.
- Link to external resources such as Drive, GitHub, or Figma.
- Search file names, metadata, and authorized document contents.
- AI summaries and question answering grounded in the actual retrieved file content, with source references when possible.

Storage and access:
- Store actual file bytes in object storage; store metadata and permissions in the database.
- Use private buckets and short-lived signed URLs where appropriate.
- Validate file type and size; apply safe handling to uploaded content.
- Enforce project membership and role permissions for reads, writes, and AI retrieval.
- Never let document text override system instructions or permission checks.
- Do not fabricate document contents or pretend an external link is accessible if it has not been retrieved.

## 9. Task, dependency, and schedule rules

- A task can have one primary owner and optional collaborators/reviewer.
- Dependencies should be represented explicitly (for example, task B cannot start until task A is complete).
- Detect dependency cycles before saving a plan.
- Distinguish blockers from ordinary dependencies.
- A downstream task becoming unblocked does not mean it is completed.
- A subtask becoming complete does not automatically complete its parent.
- Reassignment and deadline changes should trigger workload and schedule recalculation.
- Keep original and revised dates in history.
- Preserve user edits when regenerating part of a workflow.
- Mark AI-generated duration and risk estimates as estimates.
- If a schedule is infeasible, explain the conflict and offer trade-offs rather than hiding it.
- Replanning should minimize unnecessary churn and preserve unaffected task dates where possible.

## 10. AI safety, permissions, and validation

The language model proposes structured changes; the backend decides whether they are valid and whether the acting user is authorized.

Required safeguards:
- Strict project membership and role-based access control.
- Server-side validation for every mutation.
- Structured output schema for extracted updates and generated workflows.
- Validate that dependencies reference real tasks and do not create cycles.
- Validate owners belong to the project and have permission to be assigned.
- Validate dates, state transitions, workload limits, and task ownership.
- Clarify ambiguous task matches instead of selecting one silently.
- Approval before activating the initial workflow and before high-impact changes.
- Audit logs for actor, timestamp, source message/action, before/after values, and approval.
- Idempotent handling of Telegram webhooks and background jobs.
- Treat messages, uploaded files, and external document content as untrusted input.
- Never expose API keys, service-role credentials, or private project data to the frontend or unauthorized users.
- Avoid sending personal or team data to external AI services unless required, disclosed, and configured appropriately.

## 11. Suggested architecture

A practical initial stack:
- **Frontend:** React + Vite + TypeScript.
- **Backend:** Node.js + Express + TypeScript.
- **Database/auth/realtime:** Supabase with PostgreSQL, Supabase Auth, and Realtime.
- **File storage:** Supabase Storage or equivalent private object storage.
- **Messaging:** Telegram Bot API.
- **AI:** LLM API called from the backend, with structured outputs and server-side validation.
- **Background work:** Persistent scheduler/worker for reminders, deadline checks, webhook retries, and recurring reports.
- **Meetings:** Start with a supported external calendar/video provider integration.

Keep the web app and bot connected to the same backend services and canonical project database. Do not duplicate business logic in the Telegram handler.

### High-level event flow
User action/message → authentication and project context → AI interpretation or normal command parser → schema validation → authorization/business rules → database transaction → audit event → schedule/risk recalculation → notification worker → realtime workspace update.

### Suggested data entities
- `users`
- `member_profiles` (skills, preferences, availability, optional learning goals)
- `projects`
- `project_members`
- `project_invites`
- `project_briefs`
- `workflow_versions`
- `phases`
- `tasks`
- `task_dependencies`
- `task_updates`
- `task_comments`
- `milestones`
- `schedule_versions` or schedule-change history
- `meetings`
- `meeting_attendees`
- `meeting_notes`
- `meeting_action_items`
- `files`
- `file_versions`
- `task_files`
- `notifications`
- `notification_preferences`
- `activity_events`
- `approval_requests`
- `integrations`
- `background_jobs`

Use migrations, indexes, foreign keys, and row-level security policies where appropriate. The exact schema can evolve during implementation; do not build every table before validating the core loop.

## 12. Reliability and operational behavior

- Use persistent jobs for scheduled reminders; do not rely on an in-memory timer that disappears on restart.
- Make webhook processing idempotent.
- Retry transient failures with backoff and log failures.
- Track notification delivery state where supported.
- Handle timezone explicitly for each member/project.
- Avoid duplicate assignments and duplicate tasks when an AI request is retried.
- Use database transactions for related updates.
- Handle simultaneous edits with timestamps/version checks or optimistic concurrency.
- Provide a way to inspect and retry failed jobs.
- Make AI operations observable: record input reference, parsed proposal, validation outcome, and final mutation without logging unnecessary private content.

## 13. Implementation phases

### Phase 1 — Reliable core
- Authentication and projects.
- Project members and roles.
- Tasks, statuses, dependencies, milestones.
- Basic dashboard and Kanban.
- Activity log and permissions.

### Phase 2 — AI Workflow Architect (must-have differentiator)
- Natural-language project brief.
- Structured extraction of scope, constraints, deliverables, and unknowns.
- AI-generated workflow phases, tasks, subtasks, dependencies, estimates, and acceptance criteria.
- Skill/availability-aware role and owner proposals.
- Deadline-aware schedule and feasibility warnings.
- Editable preview, clarification flow, and leader approval.
- Natural-language plan refinement with change comparison and audit trail.

### Phase 3 — Telegram coordination
- Bot onboarding and project join flow.
- Natural-language progress updates.
- Task commands and blocker reporting.
- Private assignment/deadline/reminder messages after users start the bot.
- Shared backend and activity history.

### Phase 4 — Realtime and proactive coordination
- Live dashboard updates.
- Persistent reminder jobs.
- Stale-progress and overdue detection.
- Dependency-aware risk alerts and weekly reports.
- Schedule-impact analysis and suggested replanning.

### Phase 5 — Meetings and files
- Meeting scheduling and invitations.
- Agenda and action-item capture.
- File library, attachments, versioning, and submission/review.
- Authorized file search and grounded summaries.

### Phase 6 — Polish and stretch features
- Advanced analytics and workload balancing.
- More messaging platforms.
- Rich dependency visualization.
- Custom video/WebRTC only if time and reliability allow.

## 14. Acceptance tests

The product should not be considered complete for its core promise until these work:

1. A leader describes a project in natural language and receives a coherent workflow draft.
2. The draft includes phases, concrete tasks, acceptance criteria, dependencies, estimates, milestones, and a schedule.
3. The system identifies unknown skills or availability instead of inventing them.
4. The leader can edit and approve the generated plan before it activates.
5. The AI can propose role assignments using actual member profiles and workload.
6. The AI flags an unrealistic deadline and offers practical trade-offs.
7. A change in deadline or member availability recalculates affected tasks without unnecessarily moving every task.
8. The system rejects dependency cycles and invalid task references.
9. A member's natural-language update changes only the correctly identified tasks after validation/confirmation.
10. A blocker is reflected in the workspace and affects downstream risk calculations.
11. The bot sends a private message only when Telegram permits it and the member has initiated the bot.
12. Reminders stop when their triggering condition is resolved.
13. Meeting action items can become tracked tasks with owners and due dates after confirmation.
14. File search respects project permissions and grounds answers in retrieved content.
15. Every significant AI-generated or user-initiated mutation has an audit record.

## 15. Scope discipline and open decisions

Build a working end-to-end loop before attempting every integration. The best demo is:
1. Leader enters a vague project brief.
2. AI generates workflow, roles, dependencies, and schedule.
3. Leader reviews and approves it.
4. Members join via Telegram and report progress in natural language.
5. Workspace updates in real time.
6. AI detects a blocker, explains its schedule impact, and proposes a recovery plan.

Decisions to confirm during implementation:
- Which LLM provider/model and budget.
- Whether Google Calendar/Meet integration is available and authorized.
- How member skills and availability are collected.
- Which actions can be automatic versus approval-required.
- Reminder cadence and quiet hours.
- File size/type limits and retention policy.
- Whether project members can create tasks directly or only propose them.
- Which capabilities are required for the hackathon demo versus later roadmap.

Keep the distinction clear between **planned**, **prototyped**, and **working** features. Do not describe an integration as functional until it has been tested end to end.
