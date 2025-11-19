// Mock Data for Development and Demo
import { User, KnowledgeEntry, DocumentationLink } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Senior Backend Engineer',
    department: 'Engineering',
    expertiseTags: ['Node.js', 'PostgreSQL', 'API Design', 'Microservices', 'Docker'],
    contactMethods: {
      teams: 'john.smith',
      email: 'john.smith@company.com',
    },
    stats: {
      questionsAsked: 15,
      questionsAnswered: 47,
      solutionRating: 4.7,
      responseTime: 25,
    },
    availability: 'available',
    avatar: '👨‍💻',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'DevOps Lead',
    department: 'Engineering',
    expertiseTags: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Monitoring'],
    contactMethods: {
      teams: 'sarah.johnson',
      email: 'sarah.johnson@company.com',
    },
    stats: {
      questionsAsked: 8,
      questionsAnswered: 62,
      solutionRating: 4.9,
      responseTime: 18,
    },
    availability: 'available',
    avatar: '👩‍💻',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'Tech Lead',
    department: 'Engineering',
    expertiseTags: ['React', 'TypeScript', 'GraphQL', 'Frontend Architecture'],
    contactMethods: {
      teams: 'mike.chen',
      email: 'mike.chen@company.com',
    },
    stats: {
      questionsAsked: 22,
      questionsAnswered: 38,
      solutionRating: 4.5,
      responseTime: 32,
    },
    availability: 'busy',
    avatar: '👨‍💼',
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'HR Manager',
    department: 'Human Resources',
    expertiseTags: ['Benefits', 'Payroll', 'Employee Relations', 'Onboarding'],
    contactMethods: {
      teams: 'jane.smith',
      email: 'jane.smith@company.com',
    },
    stats: {
      questionsAsked: 5,
      questionsAnswered: 156,
      solutionRating: 4.8,
      responseTime: 45,
    },
    availability: 'available',
    avatar: '👩‍💼',
  },
];

export const mockKnowledgeEntries: KnowledgeEntry[] = [
  {
    id: 'k1',
    title: 'How to fix "API returns 500 error in production"',
    problem: 'Getting intermittent 500 errors from the /api/users endpoint in production, but works fine in staging.',
    solution: {
      summary: 'Issue was caused by database connection pool exhaustion during high traffic.',
      steps: [
        'Check application logs for database connection errors',
        'Increase connection pool size in production config',
        'Add connection pool monitoring',
        'Implement request rate limiting',
      ],
      codeSnippets: [
        'pool: { min: 2, max: 20 } // Increased from max: 10',
      ],
    },
    askedBy: mockUsers[0],
    solvedBy: [mockUsers[1]],
    tags: ['API', 'Database', 'Production', 'PostgreSQL', '500 Error'],
    category: 'engineering',
    resources: {
      links: [
        'https://wiki.company.com/database-pooling',
        'https://confluence.company.com/production-debugging',
      ],
      files: [],
      documentation: ['Database Connection Management Guide'],
    },
    metadata: {
      createdAt: new Date('2024-11-01'),
      resolvedAt: new Date('2024-11-01'),
      resolutionTime: 120,
      difficulty: 'medium',
      views: 45,
      helpfulCount: 12,
      notHelpfulCount: 1,
    },
    status: 'verified',
  },
  {
    id: 'k2',
    title: 'Database migration best practices',
    problem: 'Need to migrate from MySQL to PostgreSQL. Looking for the best approach and common pitfalls.',
    solution: {
      summary: 'Successfully migrated using a phased approach with dual-write strategy.',
      steps: [
        'Analyze schema differences and create mapping',
        'Setup PostgreSQL instance and replicate schema',
        'Implement dual-write to both databases',
        'Migrate historical data in batches',
        'Switch read traffic gradually',
        'Monitor for data consistency',
        'Decommission MySQL after validation period',
      ],
    },
    askedBy: mockUsers[2],
    solvedBy: [mockUsers[0], mockUsers[1]],
    tags: ['Database', 'Migration', 'PostgreSQL', 'MySQL'],
    category: 'engineering',
    resources: {
      links: [
        'https://wiki.company.com/db-migration-guide',
      ],
      files: [
        { name: 'migration-script.sql', url: '/files/migration-script.sql', type: 'sql' },
      ],
      documentation: ['Database Migration Playbook'],
    },
    metadata: {
      createdAt: new Date('2024-09-15'),
      resolvedAt: new Date('2024-09-20'),
      resolutionTime: 7200,
      difficulty: 'hard',
      views: 89,
      helpfulCount: 23,
      notHelpfulCount: 0,
    },
    status: 'verified',
  },
  {
    id: 'k3',
    title: 'How to request parental leave',
    problem: 'I need to take parental leave in 3 months. What is the process and required documentation?',
    solution: {
      summary: 'Complete the parental leave form and submit 30 days before leave start date.',
      steps: [
        'Download parental leave form from HR portal',
        'Fill out form with expected dates',
        'Attach medical certificate (if required)',
        'Submit to HR at least 30 days in advance',
        'HR will confirm within 5 business days',
        'Coordinate handover with your manager',
      ],
    },
    askedBy: mockUsers[0],
    solvedBy: [mockUsers[3]],
    tags: ['HR', 'Parental Leave', 'Benefits', 'Time Off'],
    category: 'hr',
    resources: {
      links: [
        'https://hr.company.com/parental-leave-policy',
      ],
      files: [
        { name: 'parental-leave-form.pdf', url: '/files/parental-leave-form.pdf', type: 'pdf' },
      ],
      documentation: ['Parental Leave Policy'],
    },
    metadata: {
      createdAt: new Date('2024-10-20'),
      resolvedAt: new Date('2024-10-20'),
      resolutionTime: 30,
      difficulty: 'easy',
      views: 34,
      helpfulCount: 15,
      notHelpfulCount: 0,
    },
    status: 'active',
  },
  {
    id: 'k4',
    title: 'React component not re-rendering on state change',
    problem: 'My React component is not updating when I change the state. Using useState hook but UI stays the same.',
    solution: {
      summary: 'Issue was mutating state directly instead of creating new object/array.',
      steps: [
        'Never mutate state directly',
        'For objects: use spread operator {...oldState, newProp: value}',
        'For arrays: use methods that return new arrays (map, filter, concat)',
        'Use React DevTools to verify state changes',
      ],
      codeSnippets: [
        '// Wrong: setItems(items.push(newItem))',
        '// Correct: setItems([...items, newItem])',
      ],
    },
    askedBy: mockUsers[1],
    solvedBy: [mockUsers[2]],
    tags: ['React', 'JavaScript', 'State Management', 'Frontend'],
    category: 'engineering',
    resources: {
      links: [
        'https://react.dev/learn/updating-objects-in-state',
      ],
      files: [],
      documentation: ['React Best Practices Guide'],
    },
    metadata: {
      createdAt: new Date('2024-11-10'),
      resolvedAt: new Date('2024-11-10'),
      resolutionTime: 15,
      difficulty: 'easy',
      views: 28,
      helpfulCount: 8,
      notHelpfulCount: 0,
    },
    status: 'active',
  },
];

export const mockDocumentation: DocumentationLink[] = [
  {
    id: 'd1',
    title: 'API Development Guidelines',
    url: 'https://wiki.company.com/api-guidelines',
    description: 'Best practices for designing and implementing RESTful APIs',
    tags: ['API', 'Backend', 'REST'],
    source: 'wiki',
  },
  {
    id: 'd2',
    title: 'Production Deployment Checklist',
    url: 'https://confluence.company.com/deployment-checklist',
    description: 'Step-by-step guide for deploying to production safely',
    tags: ['Deployment', 'Production', 'DevOps'],
    source: 'confluence',
  },
  {
    id: 'd3',
    title: 'Frontend Component Library',
    url: 'https://github.com/company/design-system',
    description: 'Reusable React components and design system',
    tags: ['React', 'Frontend', 'UI', 'Design System'],
    source: 'github',
  },
];

// Function to initialize mock data in storage
export async function initializeMockData(): Promise<void> {
  await chrome.storage.local.set({
    users: mockUsers,
    knowledgeEntries: mockKnowledgeEntries,
    documentation: mockDocumentation,
  });
}

