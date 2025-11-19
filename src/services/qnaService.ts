import { DocumentationLink, KnowledgeEntry, User } from '../types';

const BASE_URL = 'http://localhost:5001';

export interface QnAFoundResponse {
  found: true;
  question: string;
  answer: string;
  summary: string;
  fullGuideLink?: string;
  suggestedContacts?: Array<any>;
  relatedDocs?: Array<any>;
}

export interface QnANotFoundResponse {
  found: false;
  message: string;
  suggestedContacts?: Array<any>;
  relatedDocs?: Array<any>;
}

export type QnAResponse = QnAFoundResponse | QnANotFoundResponse;

export const qnaService = {
  ask: async (query: string): Promise<QnAResponse | null> => {
    try {
      const encoded = encodeURIComponent(query);
      const res = await fetch(`${BASE_URL}/qna/ask?q=${encoded}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json as QnAResponse;
    } catch (err) {
      console.warn('QnA service error', err);
      return null;
    }
  },

  mapSuggestedContactToUser: (c: any): User => {
    return {
      id: c.id || `contact-${Math.random().toString(36).slice(2, 9)}`,
      name: c.name || 'Unknown',
      email: c.email || '',
      role: c.role || 'N/A',
      department: c.department || '',
      expertiseTags: (c.expertise || c.expertiseTags || c.skills || []).slice(0, 8),
      contactMethods: {
        teams: undefined,
        slack: undefined,
        email: c.email || '',
      },
      stats: {
        questionsAsked: 0,
        questionsAnswered: 0,
        solutionRating: 4.5,
        responseTime: 60,
      },
      availability: 'available',
      avatar: c.profileImage || undefined,
    } as unknown as User;
  },

  mapRelatedDocToDocumentationLink: (d: any): DocumentationLink => {
    return {
      id: d.uid || d.name || Math.random().toString(36).slice(2, 9),
      title: d.title || d.name || 'Document',
      url: d.link || d.url || '#',
      description: d.description || '',
      tags: d.tags || [],
      source: 'confluence',
    } as DocumentationLink;
  },

  mapFoundToKnowledgeEntry: (resp: QnAFoundResponse, category: string, query: string): KnowledgeEntry => {
    const id = `qna-${Math.random().toString(36).slice(2, 9)}`;
    const steps = resp.answer ? resp.answer.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const suggested = (resp.suggestedContacts || []).map(qnaService.mapSuggestedContactToUser);

    return {
      id,
      title: resp.question || query,
      problem: query,
      solution: {
        summary: resp.summary || (steps[0] || ''),
        steps,
        codeSnippets: [],
      },
      askedBy: suggested[0] || ({ id: 'system', name: 'QnA', email: '', role: 'system', expertiseTags: [], contactMethods: { email: '' }, stats: { questionsAsked: 0, questionsAnswered: 0, solutionRating: 0, responseTime: 0 }, availability: 'available' }),
      solvedBy: suggested.slice(0, 3),
      tags: [],
      category: (category === 'hr' || category === 'engineering') ? (category as any) : 'general',
      resources: {
        links: resp.fullGuideLink ? [resp.fullGuideLink] : [],
        files: [],
        documentation: (resp.relatedDocs || []).map((d: any) => d.link || d.url).filter(Boolean),
      },
      metadata: {
        createdAt: new Date(),
        resolvedAt: new Date(),
        resolutionTime: 0,
        difficulty: 'easy',
        views: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        confluenceUrl: resp.fullGuideLink,
      },
      status: 'active',
    } as KnowledgeEntry;
  }
};

export default qnaService;
