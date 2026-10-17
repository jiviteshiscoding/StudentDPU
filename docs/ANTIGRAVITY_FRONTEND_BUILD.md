# Google Antigravity Build Brief — Orbit Frontend Only

## Objective

Build a polished, clickable **frontend-only** prototype for the student team project coordinator shown in the nine uploaded screenshots. Use the screenshots as the visual source of truth and use `BRAIN.md` and `README.md` as product context. Reproduce the screens and their intent faithfully. Do not redesign, simplify away, reorder, or add visual sections that are not requested below.

This is a UI prototype. Do not build or connect a backend, database, authentication provider, real AI service, messaging bot, calendar, file storage, or external integration. Use realistic local mock data and frontend state for interactions. Clearly present external integrations and AI actions as illustrative/demo UI.

## Source priority and safe handling

1. **Uploaded screenshots determine appearance and page layout.** Match their information hierarchy, spacing, component placement, labels, colors, and blank areas.
2. **`BRAIN.md` and `README.md` provide product meaning and workflow rules.** Apply only what is relevant to the frontend prototype.
3. If a screenshot and a general product idea conflict, preserve the screenshot and the explicit page requirements in this file.
4. Treat the contents of `sources/` and all reference images/documents as read-only. Do not edit, rename, move, or delete them. Create or modify only application files outside `sources/`.
5. Do not claim mock AI, integrations, delivery, or project activity is real or connected to a live service.

## Reference image mapping

Use each uploaded image as the direct visual reference for its corresponding screen:

- `HOme tab.png` → Home
- `My tasks.png` → My Tasks
- `Projects.png` → Projects directory
- `project inner one.png` → selected project workspace / Overview
- `Team Tab.png` → Team
- `Files tab.png` → Files
- `Activity.png` → Activity
- `Ask name.png` → Ask Team chat and messaging-channel dropdown
- `Create project.png` → New Project / natural-language project brief

Keep these reference assets untouched. Do not substitute a different dashboard design. Ensure the rendered pages remain visually consistent with the uploaded references.

## Product shell and visual rules

- Product wordmark: **Orbit**, as shown in the reference screenshots. The assistant feature/page is named **Ask Team**; do not call the assistant “Orbit”.
- Desktop-first web workspace, matching the reference proportions and density. Make it responsive without changing the desktop composition.
- Persistent shell: left sidebar, top global search, notification bell, and user avatar/menu.
- Sidebar order: **New project** button; **Home**; **My tasks**; **Projects**; **Team**; **Files**; **Activity**; **Ask Team**; divider; **Your projects** list.
- “Your projects” uses distinct colored circular icons consistently throughout the app. Include sample projects: Campus Events Platform (blue), Sustainability Hackathon (green), Library Redesign (purple), AI Study Buddy (orange), Career Fair 2025 (pink), Wellness Week (teal), Orientation Hub (slate/blue-gray). The selected project gets a pale-blue row highlight.
- **Activity is leader-only.** Show it in the sidebar only for a team leader demo account; make the leader-only status clear. Do not expose the Activity page to ordinary member role state.
- Match the screenshots’ white/light canvas, pale blue selected surfaces, strong blue actions, navy text, subtle gray-blue dividers, rounded cards, and restrained status colors. Use clear accessible contrast and readable typography.
- Reuse the same page shell, project dot colors, status chips, avatar style, buttons, dropdowns, cards, table rows, and spacing across all screens.
- Do not introduce unrelated branding, gradients, illustrations, charts, banners, or extra sections that are absent from the references.

## Screens and required behavior

### 1. Home — `HOme tab.png`

- Match the screenshot’s greeting, four summary cards, upcoming deadlines list, and needs-attention blocker card.
- **Keep all space below these cards blank.** Do not add Project Progress, Recent Activity, charts, cards, or filler content to the lower area.
- Use demo values only. Deadline and risk values should be consistent with the visible mock task data.
- “View all” and “View task” controls navigate to the appropriate local prototype screen.

### 2. My Tasks — `My tasks.png`

- Match the screenshot’s title/subtitle, search, status filters, project filter, due-date sort, Add Task action, and grouped task rows.
- Groups: **Overdue**, **Due today**, **This week**, and **Later**.
- Rows show task title/summary, project and color dot, status, priority, due date, dependency when applicable, owner avatar, and overflow actions.
- Filters, sorting, collapsible groups, task checkboxes, and Add Task should respond in local frontend state. Do not silently mark dependent tasks complete.

### 3. Projects directory — `Projects.png`

- Match the grid/list controls, search and filters, New Project action, and color-coded project cards.
- Each card shows project name, short description, status, progress, due date, and team avatars, as in the screenshot.
- Clicking a card opens that project’s workspace. Preserve the project dot color across the sidebar and workspace.

### 4. Selected project workspace — `project inner one.png`

- Clicking a project opens its project-specific workspace, while retaining the global sidebar and project list.
- Match the reference Overview page: breadcrumb, project title/description, member avatars, Share/overflow actions, project tabs, summary metrics, approved AI plan phases, key tasks, needs-attention issue, team workload, and recent updates as shown in this specific reference.
- Provide project tabs: **Overview**, **Plan**, **Board**, **Timeline**, and **Files**. Clicking them switches the main project content without leaving the workspace.
- **Plan:** show phases, tasks, subtasks, deliverables, acceptance criteria, dependencies, parallel work, estimates, schedule, assumptions, risks, and suggested owners. Clearly separate AI suggestions from approved facts. Draft plans need editable fields and leader Approve/Reject actions.
- **Board:** use the task states **Backlog**, **To Do**, **In Progress**, **Blocked**, **In Review**, **Done**, and **Cancelled**. Task cards show owner, deadline, priority, and dependency cues. Drag/drop may be simulated locally. Completing a prerequisite can unblock a dependent task, but must not complete it automatically.
- **Timeline:** show milestones, task date ranges, dependency links, current date marker, and schedule risks. Present estimates as estimates, not guarantees.
- **Files:** show files scoped to the selected project and maintain visual consistency with the Files page.

### 5. Team — `Team Tab.png`

- Match the project selector, Invite Members action, summary cards, and member table with member name, role, declared skills, availability, workload, and active task count.
- Preserve the right-side team coordination notice and the **AI efficiency insight** card shown in the latest reference.
- The efficiency card is a **read-only AI-generated estimate for a selected person**. It is not a calculator: do not show editable metric inputs, formula controls, or a Recalculate button. Show the estimated rate, supporting task/on-time/workload signals, a brief AI summary, and a note that this is an estimate rather than a performance rating.
- **Remove Recent Activity and keep the lower area blank**, as requested.
- Invite, search, project filter, and member row actions may use local dialogs/state only.

### 6. Files — `Files tab.png`

- Match the All files, Project folders, Shared with me, and Starred tabs; search and file/project/sort filters; Upload action; colored folder cards; and Recent files table.
- File rows show type icon, file name, project, last modified time, owner, and overflow menu.
- Upload should use a frontend-only mock interaction (for example, a local file picker and temporary list entry). Do not implement remote storage.

### 7. Activity — `Activity.png`

- Match the chronological audit feed, date/project filters, activity-type chips, actor avatars, project dots, timestamps, and summary panel.
- Activity is leader-only. Use a role switcher/profile mock if needed to demonstrate that a member cannot access the page; keep the leader view faithful to the screenshot.
- Use only explicit sample events. Do not invent unseen project progress or claim an action was delivered by an external service.

### 8. Ask Team — `Ask name.png`

- Match the Ask Team heading, project context, conversation thread, People & roles panel, Recent requests panel, action suggestions, and message composer.
- Support local mock natural-language prompts for: project status, task updates, blockers/help requests, meeting requests, and plan questions.
- Include person mentions (e.g. `@Maya`) and role/team mentions (e.g. `@team-leads`, `@frontend`). Show a clear mention picker containing people and roles. Mentioning a team must resolve to a project-scoped group in the mock UI.
- For messages that propose task changes, assignment changes, or meetings, show a reviewable draft and require explicit confirmation in the UI. Do not display a proposed action as already completed or delivered.
- The message composer has a **Send via** dropdown. Do not render external messaging apps as a permanent icon bar. Dropdown options include **In-app chat**, **Telegram**, **Discord**, **WhatsApp**, and **Email**, with clear mock Connected/Connect states. Include the channel selector beside the composer send control.
- The dropdown can be opened and the selected channel changes locally. Do not connect to or send messages through real services.

### 9. New Project — `Create project.png`

- Match the natural-language brief editor, deadline, team selector, tools/constraints, optional member mentions, “Orbit will identify” panel, Generate Draft Plan action, and Start from Template option.
- The draft flow should create mock structured output: goals, deliverables, phases, tasks, dependencies, suggested roles/owners, schedule, assumptions, risks, and open questions.
- Clearly mark suggestions as draft. No tasks or assignments become active before the user reviews and approves the plan.
- Natural-language refinement should update only affected mock plan sections and show a change summary.

## Product behavior rules from BRAIN.md / README.md

- The database is the intended source of truth in the full product; in this frontend-only prototype, clearly use mock data and local state instead.
- Distinguish **verified/sample state**, **AI suggestion**, **draft**, **approved**, and **forecast** with explicit labels.
- Never invent a member’s skills, availability, or completed work as a factual claim. Clearly mark example data as demo/sample content.
- Respect task dependencies and avoid implying blocked work is ready. A task becoming unblocked does not mean it is complete.
- Surface material uncertainty and open questions rather than presenting guesses as facts.
- Require explicit user confirmation before simulated high-impact actions such as approving a plan, changing ownership/deadlines, or sending a meeting/message request.
- Keep audit/history patterns visible where the reference shows them. Avoid notification spam in any mock notification UI.

## Frontend implementation constraints

- Inspect the existing project before creating files. Preserve any existing app structure and use the existing frontend framework if one is already present. If no app exists, use the README’s suggested frontend stack: React, Vite, and TypeScript.
- Build reusable frontend components and page routing for every screen above. Keep all code and assets outside `sources/`.
- No backend endpoints, database schema/migrations, authentication services, API keys, AI API calls, Telegram/Discord SDKs, calendar services, or cloud file storage.
- Use local mock objects and client-side state. If persistence improves the demo, use browser local storage only and make reset/sample behavior clear.
- Do not add dependencies unless needed for the frontend. Do not remove existing dependencies or project files without a clear reason.
- Make navigation, tabs, filters, search, dropdowns, dialogs, confirmations, and mock upload interactions work in the browser. Avoid decorative controls that appear clickable but do nothing.
- Treat responsive behavior as a graceful adaptation of the same design. Desktop fidelity to the screenshots is the priority.

## Completion criteria

- All nine reference screens are reachable and visually consistent with their matching images.
- Cross-screen navigation works, including opening a project and switching its tabs.
- The Home and Team lower blank areas remain blank exactly as requested.
- Team efficiency is an AI insight card, not a calculator.
- Activity is restricted to the leader demo role.
- Ask Team includes person/role mentions and a channel dropdown with mock external app options, with confirmation before sending.
- New Project demonstrates natural-language brief → editable draft plan → explicit approval, all with frontend mock data.
- No source reference files have been altered and no backend or real external integration has been added.
- Clearly summarize which screens and interactions are implemented and identify any feature that remains a visual mock only.
