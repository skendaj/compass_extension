export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  expertiseTags: string[];
  contactMethods: {
    teams?: string;
    slack?: string;
    email: string;
  };
  stats: {
    questionsAsked: number;
    questionsAnswered: number;
    solutionRating: number;
    responseTime: number; // avg in minutes
  };
  availability: "available" | "busy" | "away";
  avatar?: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  problem: string;
  solution: {
    summary: string;
    steps: string[];
    codeSnippets?: string[];
  };
  askedBy: User;
  solvedBy: User[];
  tags: string[];
  category: "engineering" | "hr" | "general";
  resources: {
    links: string[];
    files: FileReference[];
    documentation: string[];
  };
  metadata: {
    createdAt: Date;
    resolvedAt: Date;
    resolutionTime: number; // minutes
    difficulty: "easy" | "medium" | "hard";
    views: number;
    helpfulCount: number;
    notHelpfulCount: number;
    confluenceUrl?: string; // URL to Confluence page if shared
  };
  status: "active" | "outdated" | "verified";
}

export interface FileReference {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface SearchResult {
  type: "solution" | "expert" | "documentation";
  relevanceScore: number;
  data: KnowledgeEntry | User | DocumentationLink;
}

export interface DocumentationLink {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  source: "confluence" | "wiki" | "github" | "other";
}

export interface ConversationTracker {
  id: string;
  queryId: string;
  participants: User[];
  platform: "teams" | "slack" | "email";
  messages: Message[];
  sharedResources: {
    links: string[];
    files: FileReference[];
  };
  status: "active" | "resolved" | "abandoned";
  startedAt: Date;
  resolvedAt?: Date;
  autoSummaryGenerated: boolean;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  attachments?: FileReference[];
}

export interface ExpertDirectory {
  userId: string;
  expertiseAreas: {
    tag: string;
    proficiencyLevel: 1 | 2 | 3 | 4 | 5;
    solvedIssues: number;
  }[];
  recentActivity: {
    lastActive: Date;
    responseRate: number; // percentage
    avgResponseTime: number; // minutes
  };
  ranking: number; // overall expert score
}

export type QueryCategory = "engineering" | "hr" | "general";

export interface ClassificationResult {
  category: QueryCategory;
  confidence: number;
  keywords: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: "entry" | "tag" | "user";
}

export interface GraphLink {
  source: string;
  target: string;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
