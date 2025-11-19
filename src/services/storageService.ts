import { KnowledgeEntry, User, ConversationTracker } from '../types';

class StorageService {
  async saveKnowledgeEntry(entry: KnowledgeEntry): Promise<void> {
    const entries = await this.getAllKnowledgeEntries();
    entries.push(entry);
    await chrome.storage.local.set({ knowledgeEntries: entries });
  }

  async getAllKnowledgeEntries(): Promise<KnowledgeEntry[]> {
    const result = await chrome.storage.local.get('knowledgeEntries');
    return result.knowledgeEntries || [];
  }

  async getKnowledgeEntryById(id: string): Promise<KnowledgeEntry | null> {
    const entries = await this.getAllKnowledgeEntries();
    return entries.find(e => e.id === id) || null;
  }

  async updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): Promise<void> {
    const entries = await this.getAllKnowledgeEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      await chrome.storage.local.set({ knowledgeEntries: entries });
    }
  }

  async searchKnowledgeEntries(query: string, tags?: string[]): Promise<KnowledgeEntry[]> {
    const entries = await this.getAllKnowledgeEntries();
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry => {
      const matchesQuery = 
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.problem.toLowerCase().includes(lowerQuery) ||
        entry.solution.summary.toLowerCase().includes(lowerQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      const matchesTags = !tags || tags.length === 0 || 
        tags.some(tag => entry.tags.includes(tag));
      
      return matchesQuery && matchesTags;
    }).sort((a, b) => {
      const scoreA = a.metadata.helpfulCount - a.metadata.notHelpfulCount;
      const scoreB = b.metadata.helpfulCount - b.metadata.notHelpfulCount;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime();
    });
  }

  async incrementViews(entryId: string): Promise<void> {
    const entry = await this.getKnowledgeEntryById(entryId);
    if (entry) {
      entry.metadata.views++;
      await this.updateKnowledgeEntry(entryId, entry);
    }
  }

  async rateKnowledgeEntry(entryId: string, helpful: boolean): Promise<void> {
    const entry = await this.getKnowledgeEntryById(entryId);
    if (entry) {
      if (helpful) {
        entry.metadata.helpfulCount++;
      } else {
        entry.metadata.notHelpfulCount++;
      }
      await this.updateKnowledgeEntry(entryId, entry);
    }
  }

  async saveUser(user: User): Promise<void> {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    await chrome.storage.local.set({ users });
  }

  async getAllUsers(): Promise<User[]> {
    const result = await chrome.storage.local.get('users');
    return result.users || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  async searchExperts(tags: string[], limit: number = 5): Promise<User[]> {
    const users = await this.getAllUsers();
    
    return users
      .map(user => {
        const matchScore = tags.filter(tag => 
          user.expertiseTags.some(et => et.toLowerCase().includes(tag.toLowerCase()))
        ).length;
        return { user, matchScore };
      })
      .filter(({ matchScore }) => matchScore > 0)
      .sort((a, b) => {
        if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
        return b.user.stats.solutionRating - a.user.stats.solutionRating;
      })
      .slice(0, limit)
      .map(({ user }) => user);
  }

  async saveConversation(conversation: ConversationTracker): Promise<void> {
    const conversations = await this.getAllConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index !== -1) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    await chrome.storage.local.set({ conversations });
  }

  async getAllConversations(): Promise<ConversationTracker[]> {
    const result = await chrome.storage.local.get('conversations');
    return result.conversations || [];
  }

  async getActiveConversations(): Promise<ConversationTracker[]> {
    const conversations = await this.getAllConversations();
    return conversations.filter(c => c.status === 'active');
  }

  async saveSearchQuery(query: string): Promise<void> {
    const history = await this.getSearchHistory();
    history.unshift({ query, timestamp: new Date() });
    await chrome.storage.local.set({ 
      searchHistory: history.slice(0, 50) 
    });
  }

  async getSearchHistory(): Promise<{ query: string; timestamp: Date }[]> {
    const result = await chrome.storage.local.get('searchHistory');
    return result.searchHistory || [];
  }

  async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
  }
}

export const storageService = new StorageService();

