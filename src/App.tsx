import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
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
import { Task, Project, FileItem, TaskStatus, ChatMessage } from './types';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState<boolean>(true);

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

  const handleSendMessage = (msgContent: string, channel: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: isLeader ? 'member-alex' : 'member-maya',
      senderName: isLeader ? 'Alex' : 'Maya',
      senderAvatar: isLeader
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      timestamp: 'Just now',
      content: msgContent,
      channel,
      isAssistant: false,
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simulate smart coordinator assistant response
    setTimeout(() => {
      const assistantReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'assistant',
        senderName: 'Team assistant',
        timestamp: 'Just now',
        content: `I've noted this update for the team on [${channel}].\nI will monitor dependencies and ping relevant assignees if blocker criteria or milestone risks change.`,
        isAssistant: true,
      };
      setChatMessages(prev => [...prev, assistantReply]);
    }, 800);
  };

  // Find active project for workspace
  const activeProject = projects.find(p => p.id === (selectedProjectId || 'campus-events')) || projects[0];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        selectedProjectId={selectedProjectId}
        onNavigate={handleNavigate}
        projects={projects}
        isLeader={isLeader}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentUser={isLeader ? CURRENT_USER : members[1]}
          isLeader={isLeader}
          onToggleRole={setIsLeader}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
            />
          )}

          {currentScreen === 'create-project' && (
            <CreateProject
              onNavigate={handleNavigate}
              onApproveNewProject={handleApproveNewProject}
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
