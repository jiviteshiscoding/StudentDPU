import { TeamMember, Task, Project, FileItem, ActivityEvent, ChatMessage, DraftPlan } from '../types';

export const CURRENT_USER: TeamMember = {
  id: 'member-alex',
  name: 'Alex Rivera',
  email: 'alex.rivera@projex.edu',
  role: 'Project Lead',
  roleCategory: 'Lead',
  skills: ['Planning', 'Product'],
  availability: 'Available',
  availabilityStatus: 'available',
  workload: 40,
  activeTasksCount: 4,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  efficiency: {
    rate: 91,
    tasksCompletedRatio: '6 of 6',
    onTimeRatio: '5 of 6',
    workloadCapacity: '40%',
    summary: 'Consistent delivery rhythm; active leadership across team workstreams.'
  }
};

export const INITIAL_MEMBERS: TeamMember[] = [
  CURRENT_USER,
  {
    id: 'member-maya',
    name: 'Maya Chen',
    email: 'maya.chen@projex.edu',
    role: 'Designer',
    roleCategory: 'Designer',
    skills: ['UI/UX', 'Figma'],
    availability: 'Available',
    availabilityStatus: 'available',
    workload: 60,
    activeTasksCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    efficiency: {
      rate: 88,
      tasksCompletedRatio: '5 of 5',
      onTimeRatio: '4 of 5',
      workloadCapacity: '60%',
      summary: 'High UI output with rapid turnaround on screen specs.'
    }
  },
  {
    id: 'member-daniel',
    name: 'Daniel Kim',
    email: 'daniel.kim@projex.edu',
    role: 'Developer',
    roleCategory: 'Developer',
    skills: ['React', 'TypeScript'],
    availability: 'Limited this week',
    availabilityStatus: 'limited',
    workload: 85,
    activeTasksCount: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    efficiency: {
      rate: 82,
      tasksCompletedRatio: '4 of 5',
      onTimeRatio: '3 of 4',
      workloadCapacity: '85%',
      summary: 'Strong delivery pace; current workload may affect upcoming tasks.'
    }
  },
  {
    id: 'member-priya',
    name: 'Priya Singh',
    email: 'priya.singh@projex.edu',
    role: 'Developer',
    roleCategory: 'Developer',
    skills: ['APIs', 'Database'],
    availability: 'Available',
    availabilityStatus: 'available',
    workload: 50,
    activeTasksCount: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    efficiency: {
      rate: 86,
      tasksCompletedRatio: '3 of 3',
      onTimeRatio: '3 of 3',
      workloadCapacity: '50%',
      summary: 'Backend integrations on schedule with solid test coverage.'
    }
  },
  {
    id: 'member-jamie',
    name: 'Jamie Chen',
    email: 'jamie.chen@projex.edu',
    role: 'QA & Research',
    roleCategory: 'QA',
    skills: ['Testing', 'User research'],
    availability: 'Away until Friday',
    availabilityStatus: 'away',
    workload: 30,
    activeTasksCount: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    efficiency: {
      rate: 79,
      tasksCompletedRatio: '2 of 3',
      onTimeRatio: '2 of 2',
      workloadCapacity: '30%',
      summary: 'Conducting user tests; returning to full availability Friday.'
    }
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'campus-events',
    name: 'Campus Events Platform',
    color: '#2563EB', // Blue
    description: 'Build a unified platform for student event management, registration, and engagement.',
    status: 'On track',
    progress: 68,
    dueDate: 'Apr 28, 2025',
    daysRemaining: 14,
    milestonesTotal: 3,
    milestonesCompleted: 1,
    milestonesInProgress: 1,
    milestonesUpcoming: 1,
    members: ['member-alex', 'member-maya', 'member-daniel', 'member-priya', 'member-jamie'],
    phases: [
      {
        id: 'phase-1',
        number: 1,
        name: 'Discovery',
        status: 'Completed',
        dateRange: 'Mar 1 – Mar 21',
        description: 'User interviews, competitive analysis, and functional scope definition.'
      },
      {
        id: 'phase-2',
        number: 2,
        name: 'Build',
        status: 'In progress',
        dateRange: 'Mar 22 – Apr 18',
        description: 'Core application frontend, authentication, and event registration pipeline.'
      },
      {
        id: 'phase-3',
        number: 3,
        name: 'Review',
        status: 'Upcoming',
        dateRange: 'Apr 19 – Apr 28',
        description: 'End-to-end beta validation, accessibility audits, and final demo prep.'
      }
    ],
    keyTasks: [
      {
        id: 'kt-1',
        title: 'Build event registration flow',
        status: 'Done',
        ownerName: 'Emily Chen',
        ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        deadline: 'Apr 4, 2025'
      },
      {
        id: 'kt-2',
        title: 'Develop event management dashboard',
        status: 'In progress',
        ownerName: 'Jordan Kim',
        ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        deadline: 'Apr 15, 2025'
      },
      {
        id: 'kt-3',
        title: 'Run student beta testing',
        status: 'To do',
        ownerName: 'Alex Park',
        ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        deadline: 'Apr 24, 2025'
      }
    ],
    recentUpdates: [
      {
        id: 'up-1',
        date: 'Apr 14, 2025',
        authorName: 'Jordan Kim',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Pushed a new build of the event registration flow to staging.'
      },
      {
        id: 'up-2',
        date: 'Apr 11, 2025',
        authorName: 'Emily Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Completed UI designs for the event dashboard.'
      },
      {
        id: 'up-3',
        date: 'Apr 8, 2025',
        authorName: 'Alex Park',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        content: 'Started QA testing plan and created test cases.'
      }
    ],
    needsAttention: {
      title: 'Event payment integration is blocked',
      description: 'The third-party payment provider requires additional university compliance review, which is delaying development by ~1 week.',
      severity: 'high'
    }
  },
  {
    id: 'sustainability-hackathon',
    name: 'Sustainability Hackathon',
    color: '#10B981', // Green
    description: 'Plan and run a university-wide hackathon focused on sustainability solutions.',
    status: 'On track',
    progress: 42,
    dueDate: 'Apr 21, 2025',
    daysRemaining: 7,
    milestonesTotal: 4,
    milestonesCompleted: 1,
    milestonesInProgress: 2,
    milestonesUpcoming: 1,
    members: ['member-alex', 'member-maya', 'member-daniel', 'member-priya', 'member-jamie']
  },
  {
    id: 'library-redesign',
    name: 'Library Redesign',
    color: '#8B5CF6', // Purple
    description: 'Research and design an improved library experience for students.',
    status: 'At risk',
    progress: 25,
    dueDate: 'Apr 22, 2025',
    daysRemaining: 8,
    milestonesTotal: 3,
    milestonesCompleted: 0,
    milestonesInProgress: 1,
    milestonesUpcoming: 2,
    members: ['member-alex', 'member-maya', 'member-jamie']
  },
  {
    id: 'ai-study-buddy',
    name: 'AI Study Buddy',
    color: '#F59E0B', // Orange
    description: 'Develop an AI-powered study assistant to support student learning.',
    status: 'Planning',
    progress: 12,
    dueDate: 'May 6, 2025',
    daysRemaining: 22,
    milestonesTotal: 5,
    milestonesCompleted: 0,
    milestonesInProgress: 1,
    milestonesUpcoming: 4,
    members: ['member-alex', 'member-daniel', 'member-priya', 'member-maya', 'member-jamie']
  },
  {
    id: 'career-fair-2025',
    name: 'Career Fair 2025',
    color: '#F43F5E', // Pink
    description: 'Organize the annual career fair connecting students with top employers.',
    status: 'On track',
    progress: 56,
    dueDate: 'Apr 30, 2025',
    daysRemaining: 16,
    milestonesTotal: 4,
    milestonesCompleted: 2,
    milestonesInProgress: 1,
    milestonesUpcoming: 1,
    members: ['member-alex', 'member-maya', 'member-daniel', 'member-jamie']
  },
  {
    id: 'wellness-week',
    name: 'Wellness Week',
    color: '#14B8A6', // Teal
    description: 'Plan a week of wellness activities and resources for student well-being.',
    status: 'On track',
    progress: 73,
    dueDate: 'May 2, 2025',
    daysRemaining: 18,
    milestonesTotal: 3,
    milestonesCompleted: 2,
    milestonesInProgress: 1,
    milestonesUpcoming: 0,
    members: ['member-alex', 'member-maya', 'member-priya', 'member-daniel']
  },
  {
    id: 'orientation-hub',
    name: 'Orientation Hub',
    color: '#64748B', // Slate
    description: 'Create a centralized hub for new student orientation resources.',
    status: 'Planning',
    progress: 18,
    dueDate: 'May 16, 2025',
    daysRemaining: 32,
    milestonesTotal: 3,
    milestonesCompleted: 0,
    milestonesInProgress: 1,
    milestonesUpcoming: 2,
    members: ['member-alex', 'member-daniel', 'member-priya']
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Resolve payment integration issue',
    summary: 'The payment gateway is returning an error for student registrations. This is blocking the launch timeline.',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    status: 'Blocked',
    priority: 'High',
    dueDate: 'Apr 15, 2025',
    dueDateDisplay: 'Apr 15, 2025',
    dueCategory: 'Overdue',
    ownerId: 'member-daniel',
    ownerName: 'Daniel Kim',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isRisk: true,
    acceptanceCriteria: [
      'Webhook handler receives valid charge confirmation',
      'Student account marked as registered in DB',
      'Error logs cleared on university sandbox gateway'
    ]
  },
  {
    id: 'task-2',
    title: 'Review registration flow design',
    summary: 'Go through the latest designs and share feedback with the design team.',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    status: 'In progress',
    priority: 'Medium',
    dueDate: '2025-04-17',
    dueDateDisplay: 'Today',
    dueCategory: 'Due today',
    ownerId: 'member-maya',
    ownerName: 'Maya Chen',
    ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    acceptanceCriteria: [
      'Mobile responsive breakpoints validated',
      'Accessibility contrast check passed for CTA buttons',
      'Sign-off from product lead'
    ]
  },
  {
    id: 'task-3',
    title: 'Prepare sponsorship deck',
    summary: 'Include updated outreach list and value proposition for potential sponsors.',
    projectId: 'sustainability-hackathon',
    projectName: 'Sustainability Hackathon',
    projectColor: '#10B981',
    status: 'To do',
    priority: 'High',
    dueDate: '2025-04-18',
    dueDateDisplay: 'Tomorrow',
    dueCategory: 'This week',
    ownerId: 'member-alex',
    ownerName: 'Alex Rivera',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    acceptanceCriteria: [
      'Tier structure (Gold, Silver, Bronze) updated',
      'Logo placements and booth perks specified',
      'PDF deck export under 10MB'
    ]
  },
  {
    id: 'task-4',
    title: 'Finalize event space booking',
    summary: 'Confirm venue and submit final paperwork.',
    projectId: 'career-fair-2025',
    projectName: 'Career Fair 2025',
    projectColor: '#F43F5E',
    status: 'To do',
    priority: 'Medium',
    dueDate: 'Apr 21, 2025',
    dueDateDisplay: 'Apr 21, 2025',
    dueCategory: 'This week',
    dependsOn: '➔ Review regis...',
    dependsOnTaskId: 'task-2',
    ownerId: 'member-maya',
    ownerName: 'Maya Chen',
    ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    acceptanceCriteria: [
      'Facilities safety inspection signed',
      'Tables and electrical distribution layout approved'
    ]
  },
  {
    id: 'task-5',
    title: 'User testing summary',
    summary: 'Compile key findings and recommendations from user testing sessions.',
    projectId: 'library-redesign',
    projectName: 'Library Redesign',
    projectColor: '#8B5CF6',
    status: 'To do',
    priority: 'Low',
    dueDate: 'Apr 22, 2025',
    dueDateDisplay: 'Apr 22, 2025',
    dueCategory: 'Later',
    ownerId: 'member-jamie',
    ownerName: 'Jamie Chen',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    acceptanceCriteria: [
      'At least 6 student interview notes synthesized',
      'Affinity diagram with top 3 usability pain points'
    ]
  },
  {
    id: 'task-6',
    title: 'Confirm workshop facilitators',
    summary: 'Reach out to guest speakers and lock in schedule slots for mental health sessions.',
    projectId: 'wellness-week',
    projectName: 'Wellness Week',
    projectColor: '#14B8A6',
    status: 'To do',
    priority: 'Low',
    dueDate: 'Apr 25, 2025',
    dueDateDisplay: 'Apr 25, 2025',
    dueCategory: 'Later',
    ownerId: 'member-priya',
    ownerName: 'Priya Singh',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'file-1',
    name: 'Event platform proposal.pdf',
    size: '2.4 MB · PDF',
    type: 'PDF',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    lastModified: 'Today, 10:24 AM',
    ownerId: 'member-alex',
    ownerName: 'Alex Rivera',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'All',
    isStarred: true
  },
  {
    id: 'file-2',
    name: 'Brand guidelines.pdf',
    size: '1.8 MB · PDF',
    type: 'PDF',
    projectId: 'sustainability-hackathon',
    projectName: 'Sustainability Hackathon',
    projectColor: '#10B981',
    lastModified: 'Yesterday, 4:12 PM',
    ownerId: 'member-maya',
    ownerName: 'Maya Chen',
    ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    category: 'All',
    isStarred: false
  },
  {
    id: 'file-3',
    name: 'Event registration flow.fig',
    size: '5.6 MB · Figma',
    type: 'Figma',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    lastModified: 'Apr 24, 2025, 2:15 PM',
    ownerId: 'member-daniel',
    ownerName: 'Daniel Kim',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    category: 'All',
    isStarred: true
  },
  {
    id: 'file-4',
    name: 'User research summary.docx',
    size: '850 KB · Word',
    type: 'Word',
    projectId: 'library-redesign',
    projectName: 'Library Redesign',
    projectColor: '#8B5CF6',
    lastModified: 'Apr 22, 2025, 11:03 AM',
    ownerId: 'member-priya',
    ownerName: 'Priya Singh',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    category: 'All',
    isStarred: false
  },
  {
    id: 'file-5',
    name: 'Marketing plan.xlsx',
    size: '1.2 MB · Excel',
    type: 'Excel',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    lastModified: 'Apr 20, 2025, 3:41 PM',
    ownerId: 'member-jamie',
    ownerName: 'Jamie Chen',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: 'All',
    isStarred: false
  }
];

export const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    actorId: 'member-maya',
    actorName: 'Maya Chen',
    actorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    actionText: 'updated',
    targetObject: 'Event registration flow',
    targetType: 'task',
    badge: { text: 'In progress', variant: 'blue' },
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    timestamp: 'Today, 10:24 AM',
    group: 'Today',
    type: 'task'
  },
  {
    id: 'act-2',
    actorId: 'member-alex',
    actorName: 'Alex Rivera',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    actionText: 'changed the deadline for',
    targetObject: 'Marketing plan to Apr 30, 2025',
    targetType: 'task',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    timestamp: 'Today, 9:17 AM',
    group: 'Today',
    type: 'task'
  },
  {
    id: 'act-3',
    actorId: 'member-daniel',
    actorName: 'Daniel Kim',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    actionText: 'uploaded',
    targetObject: 'Event platform proposal.pdf',
    targetType: 'file',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    timestamp: 'Today, 8:03 AM',
    group: 'Today',
    type: 'file'
  },
  {
    id: 'act-4',
    actorId: 'member-priya',
    actorName: 'Priya Singh',
    actorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    actionText: 'commented on',
    targetObject: 'Authentication flow',
    targetType: 'comment',
    projectId: 'library-redesign',
    projectName: 'Library Redesign',
    projectColor: '#8B5CF6',
    timestamp: 'Yesterday, 4:12 PM',
    group: 'Yesterday',
    type: 'comment'
  },
  {
    id: 'act-5',
    actorId: 'member-jamie',
    actorName: 'Jamie Chen',
    actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    actionText: 'joined the project',
    targetObject: '',
    targetType: 'member',
    projectId: 'campus-events',
    projectName: 'Campus Events Platform',
    projectColor: '#2563EB',
    timestamp: 'Yesterday, 11:36 AM',
    group: 'Yesterday',
    type: 'member'
  },
  {
    id: 'act-6',
    actorId: 'member-maya',
    actorName: 'Maya Chen',
    actorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    actionText: 'updated',
    targetObject: 'authentication settings',
    targetType: 'project',
    projectId: 'library-redesign',
    projectName: 'Library Redesign',
    projectColor: '#8B5CF6',
    timestamp: 'Apr 24, 2025, 3:21 PM',
    group: 'Earlier this week',
    type: 'project'
  },
  {
    id: 'act-7',
    actorId: 'member-alex',
    actorName: 'Alex Rivera',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    actionText: 'uploaded',
    targetObject: 'Brand guidelines.pdf',
    targetType: 'file',
    projectId: 'sustainability-hackathon',
    projectName: 'Sustainability Hackathon',
    projectColor: '#10B981',
    timestamp: 'Apr 23, 2025, 2:08 PM',
    group: 'Earlier this week',
    type: 'file'
  },
  {
    id: 'act-8',
    actorId: 'member-alex',
    actorName: 'You',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    actionText: 'approved',
    targetObject: 'AI plan update',
    targetType: 'project',
    projectId: 'ai-study-buddy',
    projectName: 'AI Study Buddy',
    projectColor: '#F59E0B',
    timestamp: 'Apr 22, 2025, 11:03 AM',
    group: 'Earlier this week',
    type: 'project',
    approvedBy: 'Alex Rivera (Lead)'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'member-alex',
    senderName: 'Alex',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timestamp: '10:14 AM',
    content: '@team-leads , can we review registration blockers? Also @Maya , are the updated screens ready?',
    isAssistant: false
  },
  {
    id: 'msg-2',
    senderId: 'assistant',
    senderName: 'Team assistant',
    timestamp: '10:15 AM',
    content: `Here's the latest for Campus Events Platform:
• Registration UI is in progress (3 of 5 tasks complete). The frontend is targeting May 5, 2025.
• Authentication API is blocked pending university SSO details from IT. This is impacting user account creation for registration.
• Maya's design task for the updated registration screens is marked complete as of today.

I can help with next steps. Here are two suggested actions:`,
    isAssistant: true,
    actionCards: [
      {
        id: 'action-1',
        type: 'meeting',
        title: 'Request a 20-minute blocker review',
        description: 'Meet with the team to discuss the Authentication API blocker.',
        suggestedTimes: ['Today 3:00 PM', 'Tomorrow 10:00 AM', 'Thu 11:00 AM'],
        attendees: [
          { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
          { name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
          { name: 'Daniel Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { name: 'Priya Singh', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
        ],
        status: 'needs_confirmation'
      },
      {
        id: 'action-2',
        type: 'message',
        title: 'Ask Maya for a design update',
        description: 'Request a quick update on the registration screen designs.',
        targetPerson: {
          name: 'Maya',
          role: 'Product Designer',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
        },
        suggestedMessage: 'Hi Maya! Could you share a quick update on the registration screen designs and any next steps?',
        status: 'needs_confirmation'
      }
    ]
  }
];

export const MOCK_DRAFT_PLAN: DraftPlan = {
  goals: [
    'Build a unified, mobile-first student event platform in 14 days',
    'Enable student event discovery, RSVP registrations, and admin ticket verification',
    'Deliver a working classroom live demo using React and Supabase'
  ],
  deliverables: [
    'Event discovery catalog with search and tag filters',
    'Student registration checkout flow with QR confirmation',
    'Admin dashboard for organizer ticket scanning and capacity management',
    'Integrated database schema with Row Level Security (RLS)'
  ],
  phases: [
    {
      name: 'Phase 1: Architecture & Data Model',
      duration: 'Days 1–3',
      tasks: [
        { title: 'Define Supabase tables: events, registrations, attendees', role: 'Database Owner', dependencies: 'None', parallelSafe: true },
        { title: 'Create interactive Figma wireframes for discovery & checkout', role: 'UI/UX Designer', dependencies: 'None', parallelSafe: true },
        { title: 'Setup GitHub repository and CI linting pipelines', role: 'QA / Lead', dependencies: 'None', parallelSafe: true }
      ]
    },
    {
      name: 'Phase 2: Core Engineering',
      duration: 'Days 4–9',
      tasks: [
        { title: 'Build React event listing and filter components', role: 'Frontend Dev', dependencies: 'Figma wireframes', parallelSafe: true },
        { title: 'Implement registration API endpoints and auth guards', role: 'Backend Dev', dependencies: 'Supabase tables', parallelSafe: true },
        { title: 'Build organizer administrative check-in panel', role: 'Frontend Dev', dependencies: 'Registration API', parallelSafe: false }
      ]
    },
    {
      name: 'Phase 3: Integration, Testing & Presentation',
      duration: 'Days 10–14',
      tasks: [
        { title: 'Conduct end-to-end user registration testing', role: 'QA Lead', dependencies: 'Organizer panel', parallelSafe: false },
        { title: 'Prepare slide deck and 5-minute class presentation script', role: 'Project Lead', dependencies: 'Registration testing', parallelSafe: true }
      ]
    }
  ],
  suggestedRoles: [
    { role: 'Project Lead', suggestedPerson: 'Alex Rivera', reason: 'Strong coordination skills and team-wide milestone tracking' },
    { role: 'UI/UX Designer', suggestedPerson: 'Maya Chen', reason: 'Expert in Figma design systems and student user experience' },
    { role: 'Full Stack Dev', suggestedPerson: 'Daniel Kim', reason: 'Extensive React and state-management proficiency' },
    { role: 'Backend & DB Dev', suggestedPerson: 'Priya Singh', reason: 'Proficient in Supabase schema design and API integration' },
    { role: 'QA & Research', suggestedPerson: 'Jamie Chen', reason: 'Experienced with usability tests and validation checklists' }
  ],
  schedule: [
    { milestone: 'Milestone 1: Prototype wireframes & DB schema locked', targetDate: 'Day 3' },
    { milestone: 'Milestone 2: Frontend components hooked to live Supabase backend', targetDate: 'Day 8' },
    { milestone: 'Milestone 3: Feature freeze & end-to-end regression testing', targetDate: 'Day 11' },
    { milestone: 'Final Submission: Classroom live demo & project report', targetDate: 'Day 14 (May 2, 2025)' }
  ],
  assumptions: [
    'University SSO is optional for prototype; mock email authentication is sufficient for the demo',
    'Student tier hosting on Supabase free tier will support prototype volume',
    'All five team members can commit 10–15 hours weekly'
  ],
  openQuestions: [
    'Should organizers be able to export attendee CSVs from the dashboard in v1?',
    'Do we need QR code scanner support on mobile cameras or manual check-in buttons?'
  ]
};
