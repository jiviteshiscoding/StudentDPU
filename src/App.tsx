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
import { Task, Project, FileItem, TaskStatus, ChatMessage, ActionCardData } from './types';

export const App: React.FC = () => {
  // Application Stage: 'landing' (public introduction) | 'login' (authentication entry) | 'app' (workspace)
  const [appStage, setAppStage] = useState<'landing' | 'login' | 'app'>('landing');

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

  // Core application entities state (in-memory mock with local reactivity)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activityEvents, setActivityEvents] = useState(INITIAL_ACTIVITY);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

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
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => {
      const currentTask = prevTasks.find(t => t.id === taskId);
      if (!currentTask) return prevTasks;

      const isBecomingDone = currentTask.status !== 'Done';
      const updatedStatus: TaskStatus = isBecomingDone ? 'Done' : 'To do';

      return prevTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: updatedStatus };
        }

        // Rule compliance from BRAIN.md:
        // "A downstream task becoming unblocked does not mean it is completed."
        // "Completing a prerequisite can unblock a dependent task, but must not complete it automatically."
        if (t.dependsOnTaskId === taskId) {
          if (isBecomingDone && t.status === 'Blocked') {
            return { ...t, status: 'To do' };
          }
        }
        return t;
      });
    });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (inspectingTask && inspectingTask.id === taskId) {
      setInspectingTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAddTask = (newTask: Partial<Task>) => {
    const created: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'New Task',
      summary: newTask.summary || '',
      projectId: newTask.projectId || 'campus-events',
      projectName: newTask.projectName || 'Campus Events Platform',
      projectColor: newTask.projectColor || '#2563EB',
      status: newTask.status || 'To do',
      priority: newTask.priority || 'Medium',
      dueDate: newTask.dueDate || '2025-04-20',
      dueDateDisplay: newTask.dueDateDisplay || 'Apr 20, 2025',
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

  const handleApproveNewProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
    setSelectedProjectId(newProj.id);
  };

  // Conversational Assistant message handler with contextual intelligence & reviewable action cards
  const handleSendMessage = (msgContent: string, channel: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: isLeader ? 'member-alex' : 'member-maya',
      senderName: isLeader ? 'Alex Rivera' : 'Maya Chen',
      senderAvatar: isLeader
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      timestamp: 'Just now',
      content: msgContent,
      channel,
      isAssistant: false,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsPendingResponse(true);

    const lower = msgContent.toLowerCase();

    // Contextual simulated responses
    setTimeout(() => {
      let assistantText = '';
      let actionCards: ActionCardData[] | undefined = undefined;

      if (lower.includes('meeting') || lower.includes('sync') || lower.includes('schedule')) {
        assistantText = `I have drafted a reviewable meeting proposal for your team sync based on current availability calendars.\n\nReview the draft details below before confirming. (Note: Confirming updates local demo records; no external calendar invites will be transmitted).`;
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
      } else if (lower.includes('status') || lower.includes('check')) {
        assistantText = `Here is the current status summary for Campus Events Platform:\n• Milestone 1 (Discovery): Completed.\n• Milestone 2 (Core Build): In Progress, Due Apr 18 (At Risk due to payment provider review).\n• Milestone 3 (Classroom Demo): Scheduled for Apr 28.\n\nOverall progress is estimated at 68% with 4 out of 6 sprint deliverables on track.`;
      } else if (lower.includes('update') || lower.includes('completed') || lower.includes('finished')) {
        assistantText = `I've noted this task update and logged it for the project timeline.\n\nI checked downstream dependencies: Dependent integration tasks are now eligible for unblocking once review criteria are verified.`;
        actionCards = [
          {
            id: `act-${Date.now()}`,
            type: 'message',
            title: 'Notify Assignee of Ready Handoff',
            description: 'Coordinate component handoff for backend endpoint integration.',
            targetPerson: {
              name: 'Daniel Kim',
              role: 'Full Stack Developer',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            },
            suggestedMessage: 'Registration UI flow wireframes are complete. Ready for API endpoint binding.',
            status: 'needs_confirmation',
          }
        ];
      } else {
        assistantText = `I've received your inquiry on simulated channel [${channel}].\n\nPROJEX Coordinator is tracking active project tasks, upcoming deadlines, and workload distribution. Let me know if you would like me to check milestone risks or draft a team action.`;
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
        onLoginSuccess={(asLeader) => {
          setIsLeader(asLeader);
          setAppStage('app');
          setCurrentScreen('home');
        }}
        onBackToIntro={() => setAppStage('landing')}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

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
          currentUser={isLeader ? CURRENT_USER : members[1]}
          isLeader={isLeader}
          onToggleRole={setIsLeader}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={handleNavigate}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSignOut={() => setAppStage('landing')}
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
            />
          )}

          {currentScreen === 'projects' && (
            <Projects
              projects={projects}
              teamMembers={members}
              onSelectProject={(projId) => handleNavigate('project-workspace', projId)}
              onNavigate={handleNavigate}
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
