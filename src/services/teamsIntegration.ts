// Microsoft Teams Integration Service
// Uses Microsoft Graph API to retrieve and summarize chat conversations

interface TeamsConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
}

interface ChatMessage {
  id: string;
  createdDateTime: string;
  from: {
    user: {
      id: string;
      displayName: string;
    };
  };
  body: {
    content: string;
    contentType: string;
  };
}

interface ChatSummary {
  chatId: string;
  participants: string[];
  messageCount: number;
  startTime: string;
  endTime: string;
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  resolution?: string;
}

class TeamsIntegrationService {
  private accessToken: string | null = null;
  private config: TeamsConfig | null = null;

  // Microsoft Graph API endpoints
  private readonly GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";
  private readonly AUTH_ENDPOINT =
    "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize";
  private readonly TOKEN_ENDPOINT =
    "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token";

  /**
   * Initialize Teams configuration
   */
  async setConfig(config: TeamsConfig): Promise<void> {
    this.config = config;
    await chrome.storage.local.set({ teamsConfig: config });
  }

  /**
   * Load Teams configuration from storage
   */
  async loadConfig(): Promise<TeamsConfig | null> {
    if (this.config) {
      return this.config;
    }

    const result = await chrome.storage.local.get("teamsConfig");
    this.config = result.teamsConfig || null;
    return this.config;
  }

  /**
   * Check if Teams is configured
   */
  async isConfigured(): Promise<boolean> {
    const config = await this.loadConfig();
    return !!(config && config.clientId && config.tenantId);
  }

  /**
   * Authenticate with Microsoft Graph API using OAuth 2.0
   */
  async authenticate(): Promise<boolean> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error("Teams is not configured. Please configure it first.");
    }

    const scopes = [
      "Chat.Read",
      "Chat.ReadWrite",
      "ChatMessage.Read",
      "User.Read",
    ].join(" ");

    const authUrl =
      this.AUTH_ENDPOINT.replace("{tenant}", config.tenantId) +
      `?client_id=${config.clientId}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_mode=fragment`;

    return new Promise((resolve) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            console.error("Authentication failed:", chrome.runtime.lastError);
            resolve(false);
            return;
          }

          // Extract access token from redirect URL
          const urlParams = new URLSearchParams(
            redirectUrl.split("#")[1] || "",
          );
          const accessToken = urlParams.get("access_token");

          if (accessToken) {
            this.accessToken = accessToken;
            chrome.storage.local.set({ teamsAccessToken: accessToken });
            resolve(true);
          } else {
            resolve(false);
          }
        },
      );
    });
  }

  /**
   * Load saved access token
   */
  async loadAccessToken(): Promise<string | null> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const result = await chrome.storage.local.get("teamsAccessToken");
    this.accessToken = result.teamsAccessToken || null;
    return this.accessToken;
  }

  /**
   * Make authenticated request to Microsoft Graph API
   */
  private async graphRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.loadAccessToken();
    if (!token) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    const response = await fetch(`${this.GRAPH_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, need to re-authenticate
        this.accessToken = null;
        await chrome.storage.local.remove("teamsAccessToken");
        throw new Error("Authentication expired. Please re-authenticate.");
      }
      throw new Error(
        `Graph API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Get all chats for the current user
   */
  async getChats(): Promise<any[]> {
    const data = await this.graphRequest<{ value: any[] }>("/me/chats");
    return data.value;
  }

  /**
   * Get chat messages between user and specific person
   */
  async getChatMessages(
    chatId: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const data = await this.graphRequest<{ value: ChatMessage[] }>(
      `/chats/${chatId}/messages?$top=${limit}&$orderby=createdDateTime desc`,
    );
    return data.value.reverse(); // Oldest first
  }

  /**
   * Find chat with specific user by email
   */
  async findChatWithUser(userEmail: string): Promise<string | null> {
    try {
      const chats = await this.getChats();

      for (const chat of chats) {
        if (chat.chatType === "oneOnOne") {
          // Get chat members
          const membersData = await this.graphRequest<{ value: any[] }>(
            `/chats/${chat.id}/members`,
          );

          // Check if target user is in this chat
          const hasUser = membersData.value.some(
            (member: any) =>
              member.email?.toLowerCase() === userEmail.toLowerCase(),
          );

          if (hasUser) {
            return chat.id;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error finding chat with user:", error);
      return null;
    }
  }

  /**
   * Get recent messages from chat with specific user
   */
  async getRecentChatWithUser(
    userEmail: string,
    limit: number = 50,
  ): Promise<ChatMessage[] | null> {
    const chatId = await this.findChatWithUser(userEmail);
    if (!chatId) {
      console.log(`No chat found with user: ${userEmail}`);
      return null;
    }

    return this.getChatMessages(chatId, limit);
  }

  /**
   * Extract key information from chat messages using simple NLP
   */
  private extractKeyInformation(messages: ChatMessage[]): {
    topics: string[];
    actionItems: string[];
    questions: string[];
  } {
    const topics: Set<string> = new Set();
    const actionItems: string[] = [];
    const questions: string[] = [];

    // Keywords that indicate action items
    const actionKeywords = [
      "todo",
      "task",
      "action item",
      "need to",
      "should",
      "must",
      "will do",
      "going to",
      "plan to",
    ];

    // Technical terms and common topics
    const technicalTerms = [
      "api",
      "database",
      "server",
      "deployment",
      "bug",
      "error",
      "issue",
      "feature",
      "code",
      "production",
      "staging",
      "testing",
      "authentication",
      "authorization",
      "migration",
      "performance",
      "security",
    ];

    messages.forEach((msg) => {
      const content = msg.body.content.toLowerCase();

      // Extract questions
      if (content.includes("?")) {
        questions.push(msg.body.content);
      }

      // Extract action items
      if (actionKeywords.some((keyword) => content.includes(keyword))) {
        actionItems.push(msg.body.content);
      }

      // Extract topics based on technical terms
      technicalTerms.forEach((term) => {
        if (content.includes(term)) {
          topics.add(term);
        }
      });
    });

    return {
      topics: Array.from(topics),
      actionItems: actionItems.slice(0, 5), // Top 5 action items
      questions: questions.slice(-3), // Last 3 questions
    };
  }

  /**
   * Generate a summary of the chat conversation
   */
  async summarizeChat(userEmail: string): Promise<ChatSummary | null> {
    try {
      const messages = await this.getRecentChatWithUser(userEmail);

      if (!messages || messages.length === 0) {
        return null;
      }

      const chatId = await this.findChatWithUser(userEmail);
      if (!chatId) return null;

      // Extract information
      const { topics, actionItems, questions } =
        this.extractKeyInformation(messages);

      // Get participants
      const participants = Array.from(
        new Set(messages.map((m) => m.from.user.displayName)),
      );

      // Get time range
      const startTime = messages[0].createdDateTime;
      const endTime = messages[messages.length - 1].createdDateTime;

      // Generate summary text
      const summary = this.generateSummaryText(
        messages,
        topics,
        actionItems,
        questions,
      );

      // Check if issue was resolved
      const resolution = this.detectResolution(messages);

      return {
        chatId,
        participants,
        messageCount: messages.length,
        startTime,
        endTime,
        summary,
        keyTopics: topics,
        actionItems,
        resolution,
      };
    } catch (error) {
      console.error("Error summarizing chat:", error);
      return null;
    }
  }

  /**
   * Generate human-readable summary text
   */
  private generateSummaryText(
    messages: ChatMessage[],
    topics: string[],
    actionItems: string[],
    questions: string[],
  ): string {
    const parts: string[] = [];

    // Overview
    parts.push(
      `Chat conversation with ${messages.length} messages exchanged.`,
    );

    // Topics discussed
    if (topics.length > 0) {
      parts.push(`Main topics: ${topics.join(", ")}.`);
    }

    // Questions asked
    if (questions.length > 0) {
      parts.push(
        `Key questions were asked about implementation and troubleshooting.`,
      );
    }

    // Action items
    if (actionItems.length > 0) {
      parts.push(`${actionItems.length} action items were identified.`);
    }

    // Recent messages summary
    const recentMessages = messages.slice(-5);
    const hasCode = recentMessages.some((m) =>
      m.body.content.includes("```"),
    );
    const hasLinks = recentMessages.some(
      (m) => m.body.content.includes("http"),
    );

    if (hasCode) {
      parts.push("Code snippets were shared.");
    }
    if (hasLinks) {
      parts.push("Reference links were provided.");
    }

    return parts.join(" ");
  }

  /**
   * Detect if the issue was resolved based on message content
   */
  private detectResolution(messages: ChatMessage[]): string | undefined {
    const resolutionKeywords = [
      "solved",
      "fixed",
      "resolved",
      "working now",
      "thank you",
      "thanks",
      "got it",
      "that worked",
      "problem solved",
      "issue fixed",
    ];

    // Check last 5 messages for resolution indicators
    const recentMessages = messages.slice(-5);

    for (const msg of recentMessages) {
      const content = msg.body.content.toLowerCase();
      if (resolutionKeywords.some((keyword) => content.includes(keyword))) {
        return msg.body.content;
      }
    }

    return undefined;
  }

  /**
   * Save chat summary as a knowledge entry
   */
  async saveAsKnowledgeEntry(
    summary: ChatSummary,
    originalQuery: string,
    expertEmail: string,
  ): Promise<void> {
    // This would integrate with your storage service
    const knowledgeEntry = {
      id: `chat-${summary.chatId}-${Date.now()}`,
      title: `Resolved: ${originalQuery}`,
      problem: originalQuery,
      solution: {
        summary: summary.summary,
        steps: summary.actionItems,
        codeSnippets: [],
      },
      tags: summary.keyTopics,
      category: "engineering" as const,
      metadata: {
        source: "teams-chat",
        chatId: summary.chatId,
        expertEmail: expertEmail,
        messageCount: summary.messageCount,
      },
    };

    console.log("Knowledge entry created from chat:", knowledgeEntry);
    // Save to storage service
    // await storageService.saveKnowledgeEntry(knowledgeEntry);
  }

  /**
   * Clear authentication
   */
  async logout(): Promise<void> {
    this.accessToken = null;
    await chrome.storage.local.remove("teamsAccessToken");
  }

  /**
   * Clear all configuration
   */
  async clearConfig(): Promise<void> {
    this.config = null;
    this.accessToken = null;
    await chrome.storage.local.remove(["teamsConfig", "teamsAccessToken"]);
  }
}

export const teamsIntegrationService = new TeamsIntegrationService();
