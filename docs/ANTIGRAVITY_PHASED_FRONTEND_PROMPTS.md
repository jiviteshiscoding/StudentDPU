# Antigravity Phase-by-Phase Frontend Prompts

## Purpose

Use this file to build the project in Google Antigravity in small, reviewable phases. It supplements `ANTIGRAVITY_FRONTEND_BUILD.md`; the uploaded screenshots remain the visual source of truth, and `BRAIN.md` plus `README.md` remain product references.

## Global rules for every phase

Paste these rules into the first Antigravity task. Keep them in force for every later phase:

```text
Build this as a frontend-only prototype. Do not create or connect a backend, database, authentication provider, real AI service, real calendar integration, or real messaging/file-storage integration. Use local mock data and frontend state only.

The uploaded screenshots are the exact visual references. Follow their page layout, information hierarchy, spacing, labels, colors, and blank areas. Do not redesign screens or add unrequested sections. Use BRAIN.md and README.md only for product context and workflow requirements that fit the screenshots.

The displayed Orbit wordmark is placeholder branding from the references. Do not use Orbit as the final app name or assistant name. Leave a clean, replaceable app-name placeholder and a simple replaceable logo mark; do not invent the final name or logo. Use “Ask Team” for the assistant page/feature label.

Add refined, lightweight UI animation: short ease-out transitions for navigation, tabs, dropdowns, dialogs, hover/focus states, card appearance, progress/status changes, and loading/skeleton states where relevant. Keep motion subtle and fast, avoid distracting looping effects, and respect prefers-reduced-motion. Animation must not change the screenshot layout or cause content to shift unexpectedly.

This is a student project coordination workspace. Important AI-generated actions are suggestions/drafts until the user confirms them. Clearly label mock/demo content, estimates, draft plans, and approved plans. Never imply an external message, meeting invite, task completion, or integration actually happened.

Before each phase, inspect the existing app and preserve working code. Implement only the phase described. Do not modify, rename, move, or delete anything in sources/ or any uploaded reference assets. At the end of the phase, summarize what changed, list the screens/interactions implemented, and identify any remaining visual mocks. Do not begin the next phase until I review and approve this phase.
```

## How to use this in Antigravity

1. Open the project folder in Antigravity. Keep `sources/` and the uploaded reference images available as read-only references.
2. Start in **Planning** mode, or ask Antigravity to inspect the project and propose an implementation approach. Give it the global rules above and the full `ANTIGRAVITY_FRONTEND_BUILD.md` as project context.
3. Have it inspect the existing files and identify the current framework before making changes. If the project is empty, use React + Vite + TypeScript as suggested in README.md.
4. Ask it to implement **Phase 1 only** using the prompt below. Review the running UI against the screenshots before approving.
5. If a visual detail is wrong, give a precise correction and ask it to revise the current phase. Do not advance until the result matches your reference.
6. After approval, send the next phase prompt. Keep the same chat/context so it retains the global rules and prior implementation.
7. Run the local frontend preview after each phase. Use Antigravity’s browser/preview if available; otherwise use the project’s existing run command. Do not ask Antigravity to add backend services.
8. Once all phases are approved, ask for one final frontend-only pass for responsive behavior, navigation consistency, animation/reduced-motion behavior, and removal of any accidental “Orbit” branding.

### Review checklist after each phase

- Does the page match its uploaded screenshot’s layout and visual hierarchy?
- Are the sidebar and project colors consistent with earlier phases?
- Are explicitly blank regions still blank?
- Do buttons, tabs, menus, and filters have the expected local UI behavior?
- Is every AI action clearly shown as a proposal until confirmed?
- Are transitions smooth but restrained, and does reduced-motion preference disable nonessential animation?
- Did Antigravity keep the work frontend-only and leave `sources/` untouched?

## Phase 1 — App shell and design foundation

```text
Implement Phase 1 only: create the reusable app shell and design foundation for the frontend prototype.

Inspect the current project first. Preserve existing structure and use the current frontend stack; if it is empty, initialize React + Vite + TypeScript. Create shared layout components for the left sidebar, top search/header, notification/profile controls, page container, buttons, status chips, cards, tables, dropdowns, and project-color dots.

Match the uploaded screenshots. Sidebar order: New project button, Home, My tasks, Projects, Team, Files, Activity, Ask Team, divider, Your projects list. Activity is leader-only. Use a replaceable app-name/logo placeholder: the final app name and logo are not decided, so never use Orbit as the final brand. Keep Ask Team as the assistant feature label. Use consistent project colors from ANTIGRAVITY_FRONTEND_BUILD.md.

Add routing or equivalent local navigation with empty page placeholders for the referenced screens. Make sidebar navigation, selected states, project selection, top search focus, profile menu, and notification menu work locally. Do not build the full page content yet. Add subtle, fast transitions for hover, active navigation, menus, and route/page changes; respect prefers-reduced-motion.

Frontend only. No backend, APIs, real auth, or real integrations. Do not modify sources/ or reference images. Stop after this phase and report what to review.
```

## Phase 2 — Home and My Tasks

```text
Implement Phase 2 only: Home and My Tasks. Use HOme tab.png and My tasks.png as exact visual references. Preserve the shared shell from Phase 1.

Home: match the greeting, four summary cards, upcoming deadlines, and needs-attention blocker. Keep all content below those cards completely blank: no Project Progress, Recent Activity, charts, or filler.

My Tasks: match the title, search, status filters, project filter, sort control, Add Task button, and task groups Overdue, Due today, This week, Later. Show task, project/color dot, status, priority, due date, dependency, and owner as pictured. Make filters, sort, group collapse, checkboxes, task details, and Add Task work with mock frontend state. Do not mark dependencies or parent tasks complete automatically.

Use coherent mock task data across both screens. Add subtle entrance/hover/filter transitions and reduced-motion support. Do not add unrequested sections. Stop after this phase for review.
```

## Phase 3 — Projects directory and project workspace

```text
Implement Phase 3 only: Projects directory and selected project workspace. Use Projects.png and project inner one.png as the exact references.

Projects directory: match search, filters, grid/list controls, New project action, and color-coded project cards with description, status, progress, due date, and member avatars. Clicking a card opens that project workspace.

Project workspace: preserve global navigation and show breadcrumb, project name/description, members, share/overflow controls, project tabs Overview, Plan, Board, Timeline, Files, the overview metrics, approved plan phases, key tasks, needs-attention issue, team workload, and recent updates as shown in project inner one.png. Implement tab navigation locally. The Plan, Board, Timeline, and Files views should follow the full requirements in ANTIGRAVITY_FRONTEND_BUILD.md; keep task states and dependencies accurate. Use draft/approved/suggested labels. Never claim unimplemented AI is live.

Add subtle transitions for card hover, opening a project, tab switching, and Kanban state changes; respect reduced motion. Stop after this phase for review.
```

## Phase 4 — Team and Files

```text
Implement Phase 4 only: Team and Files. Use Team Tab.png and Files tab.png as exact references.

Team: match project selector, invite button, summary cards, and member table with role, declared skills, availability, workload, and active task count. Keep the right-side coordination notice and read-only AI efficiency insight for a selected member. It is an AI estimate with evidence signals and an explanatory caveat, not a calculator: no editable calculation fields and no Recalculate button. Remove Recent Activity and leave the lower area blank exactly as requested.

Files: match file tabs, search/filters, Upload action, colored project folder cards, and Recent files table with file type, name, project, modified time, and owner. Upload can use a local file picker/mock list only; no remote storage.

Use mock data consistently with prior phases. Add subtle table/card and dialog transitions, and support reduced motion. Stop after this phase for review.
```

## Phase 5 — Ask Team and messaging-channel selection

```text
Implement Phase 5 only: Ask Team, based on Ask name.png and the latest reviewed direction.

Match the Ask Team conversation layout, project context, People & roles panel, Recent requests panel, and composer. Use the replaceable app logo/name placeholder elsewhere, but do not call the assistant Orbit. The assistant page/feature label is Ask Team.

Support mock natural-language status questions, task updates, blockers/help requests, meeting requests, and plan questions. Include @person mentions and project-scoped role/team mentions such as @team-leads and @frontend. Actions that change work or send meeting/message requests must appear as drafts and wait for user confirmation.

Add a compact Send via dropdown, not a persistent icon bar. Options: In-app chat, Telegram, Discord, WhatsApp, Email. Show illustrative Connected/Connect states. Add a matching channel selector next to the composer send button. Make dropdown selection and mock confirmation work locally; do not connect to or message external services. Add brief dropdown/message transitions with reduced-motion support. Stop after this phase for review.
```

## Phase 6 — New Project natural-language flow

```text
Implement Phase 6 only: New Project using Create project.png as the exact visual reference.

Match the natural-language project brief, optional @mentions, deadline, team, tools/constraints, “will identify” summary, Generate draft plan action, and Start from a template. Use the replaceable app-name/logo placeholder, not Orbit as a final brand.

On Generate draft plan, show a frontend mock draft with goals, deliverables, phases, tasks/subtasks, dependencies, parallel work, suggested roles/owners, estimates, dates/milestones, assumptions, risks, and open questions. Distinguish user-provided facts from assumptions and recommendations. Allow edits and a small natural-language refinement interaction with a visible change summary. Require explicit leader approval before the mock plan becomes active. Do not call a real AI service or create real assignments.

Animate draft loading/progression tastefully; do not make loading look like a real network call. Respect reduced motion. Stop after this phase for review.
```

## Phase 7 — Activity, permissions, and final polish

```text
Implement Phase 7 only: Activity page, role visibility, and final cross-screen polish.

Match Activity.png with date/project filters, activity type chips, chronological audit rows, actor, action, project, timestamp, and summary panel. Activity is visible only to the leader demo role. Demonstrate member/leader role state locally; do not implement real authentication.

Review every page against its matching uploaded screenshot. Verify the Home and Team lower blank spaces remain empty; Team has AI efficiency insight and no Recent Activity; Ask Team has app-channel dropdown (not a static icon bar); New Project has mock draft-and-approval; the app name/logo remain replaceable and no visible UI labels call the app Orbit except that uploaded screenshots are preserved as untouched references.

Polish responsive layout, keyboard focus states, dropdown/dialog behavior, coherent sample data, route transitions, loading/empty states only where appropriate, and prefers-reduced-motion behavior. Do not add a backend or claim any real integration. Stop and provide a concise implementation summary plus any remaining limitations.
```

## Optional correction prompt

Use this when a phase needs a specific visual correction:

```text
Revise only the following part of the current phase: [describe the exact component or region]. Use [reference image filename] as the authority. Preserve all approved layout and behavior elsewhere. Do not add new sections or change unrelated screens. Keep this frontend-only and stop after showing the revised result for review.
```

## Notes on animation

- Prefer CSS transitions and small component-level animation over large motion libraries.
- Keep most transitions around 120–220 ms, with ease-out timing.
- Animate opacity/transform rather than layout dimensions when possible to avoid shifting content.
- Use simple feedback for navigation, dropdowns, modals, selected filters, and task status updates.
- Avoid continuous pulsing, bouncing, parallax, or decorative motion.
- Honor `prefers-reduced-motion: reduce` by removing nonessential movement while keeping state changes clear.
- Do not animate fake AI output as if it were real inference; use an obvious local prototype loading state.
