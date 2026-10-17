export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Backlog' | 'To do' | 'In progress' | 'Blocked' | 'In Review' | 'Done' | 'Cancelled';
export type ProjectStatus = 'On track' | 'At risk' | 'Planning' | 'Completed';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleCategory: 'Lead' | 'Designer' | 'Developer' | 'QA';
  skills: string[];
  availability: 'Available' | 'Limited this week' | 'Away until Friday' | 'Busy';
  availabilityStatus: 'available' | 'limited' | 'away';
  workload: number; // percentage, e.g. 85
  activeTasksCount: number;
  avatarUrl: string;
  efficiency?: {
    rate: number; // e.g. 82
    tasksCompletedRatio: string; // "4 of 5"
    onTimeRatio: string; // "3 of 4"
    workloadCapacity: string; // "85%"
    summary: string;
  };
}

export interface Task {
  id: string;
  title: string;
  summary: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  dueDateDisplay: string;
  dueCategory: 'Overdue' | 'Due today' | 'This week' | 'Later';
  dependsOn?: string;
  dependsOnTaskId?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  acceptanceCriteria?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  isRisk?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string; // CSS color or hex
  description: string;
  status: ProjectStatus;
  progress: number; // e.g. 68
  dueDate: string;
  daysRemaining?: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  milestonesInProgress: number;
  milestonesUpcoming: number;
  members: string[]; // member IDs
  phases?: ProjectPhase[];
  keyTasks?: {
    id: string;
    title: string;
    status: TaskStatus;
    ownerName: string;
    ownerAvatar: string;
    deadline: string;
  }[];
  recentUpdates?: {
    id: string;
    date: string;
    authorName: string;
    authorAvatar: string;
    content: string;
  }[];
  needsAttention?: {
    title: string;
    description: string;
    severity: 'high' | 'medium';
  };
}

export interface ProjectPhase {
  id: string;
  number: number;
  name: string;
  status: 'Completed' | 'In progress' | 'Upcoming';
  dateRange: string;
  description?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'Figma' | 'Word' | 'Excel' | 'Image' | 'Code';
  projectId: string;
  projectName: string;
  projectColor: string;
  lastModified: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  category: 'All' | 'Project' | 'Shared' | 'Starred';
  isStarred?: boolean;
}

export interface ActivityEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  actionText: string;
  targetObject: string;
  targetType?: string;
  badge?: {
    text: string;
    variant: 'blue' | 'green' | 'amber' | 'red';
  };
  projectId: string;
  projectName: string;
  projectColor: string;
  timestamp: string;
  group: 'Today' | 'Yesterday' | 'Earlier this week';
  type: 'task' | 'file' | 'comment' | 'member' | 'project';
  approvedBy?: string;
}

export interface ChannelOption {
  id: 'in-app' | 'telegram' | 'discord' | 'whatsapp' | 'email';
  name: string;
  status: 'active' | 'connected' | 'connect';
  icon: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  content: string;
  isAssistant?: boolean;
  actionCards?: ActionCardData[];
  channel?: string;
}

export interface ActionCardData {
  id: string;
  type: 'meeting' | 'message' | 'task_update';
  title: string;
  description: string;
  taskId?: string;
  projectId?: string;
  currentStatus?: string;
  newStatus?: TaskStatus;
  reason?: string;
  channel?: string;
  recipientUserId?: string;
  recipientUserIds?: string[];
  recipientRole?: string;
  recipientCount?: number;
  telegramDelivery?: {
    resolvedRecipients?: {
      userId: string;
      name: string;
      role?: string;
      isLinked: boolean;
      username?: string | null;
      status: 'linked' | 'not_linked' | 'simulated';
    }[];
  };
  suggestedTimes?: string[];
  attendees?: { name: string; avatar: string }[];
  targetPerson?: { name: string; role: string; avatar: string };
  suggestedMessage?: string;
  status: 'needs_confirmation' | 'sent' | 'cancelled';
}

export interface DraftPlan {
  goals: string[];
  deliverables: string[];
  phases: {
    name: string;
    duration: string;
    tasks: {
      title: string;
      role: string;
      dependencies: string;
      parallelSafe: boolean;
    }[];
  }[];
  suggestedRoles: {
    role: string;
    suggestedPerson: string;
    reason: string;
  }[];
  schedule: {
    milestone: string;
    targetDate: string;
  }[];
  assumptions: string[];
  openQuestions: string[];
}
