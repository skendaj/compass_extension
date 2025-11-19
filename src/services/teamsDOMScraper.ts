// Teams DOM Scraper Service
// Extracts chat messages directly from the Teams web interface DOM

export interface TeamsChatMessage {
  timestamp: string;
  sender: string;
  content: string;
  isCurrentUser?: boolean;
}

export interface TeamsChatSummary {
  participants: string[];
  messageCount: number;
  messages: TeamsChatMessage[];
  dateRange: {
    start: string;
    end: string;
  };
  extractedAt: string;
}

/**
 * Detects if the current page is Microsoft Teams
 */
export function isTeamsPage(): boolean {
  const url = window.location.href;
  return (
    url.includes('teams.microsoft.com') ||
    url.includes('teams.live.com') ||
    document.querySelector('[data-app-name="microsoft-teams"]') !== null
  );
}

/**
 * Extracts chat messages from the Teams DOM
 */
export function extractTeamsMessages(): TeamsChatMessage[] {
  const messages: TeamsChatMessage[] = [];

  // Try multiple selectors as Teams DOM structure can vary
  const messageSelectors = [
    '[data-tid="chat-pane-message"]',
    '[data-tid="message-pane-item"]',
    '.ui-chat__messagelist__message',
    '[role="listitem"][data-tid*="message"]',
    '.ui-chat__item',
    '[class*="message-"]',
  ];

  let messageElements: NodeListOf<Element> | null = null;

  // Find which selector works
  for (const selector of messageSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      messageElements = elements;
      console.log(`[Teams Scraper] Found ${elements.length} messages using selector: ${selector}`);
      break;
    }
  }

  if (!messageElements || messageElements.length === 0) {
    console.warn('[Teams Scraper] No chat messages found. Teams DOM structure may have changed.');
    return messages;
  }

  messageElements.forEach((element) => {
    try {
      const message = extractMessageFromElement(element as HTMLElement);
      if (message) {
        messages.push(message);
      }
    } catch (error) {
      console.error('[Teams Scraper] Error extracting message:', error);
    }
  });

  return messages;
}

/**
 * Extracts a single message from a DOM element
 */
function extractMessageFromElement(element: HTMLElement): TeamsChatMessage | null {
  // Try to find sender name
  const senderSelectors = [
    '[data-tid="message-author-name"]',
    '[class*="author"]',
    '[class*="sender"]',
    '.ui-chat__message__author',
  ];

  let sender = 'Unknown';
  for (const selector of senderSelectors) {
    const senderElement = element.querySelector(selector);
    if (senderElement && senderElement.textContent?.trim()) {
      sender = senderElement.textContent.trim();
      break;
    }
  }

  // If no specific sender element, look for aria-label or data attributes
  if (sender === 'Unknown') {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      const match = ariaLabel.match(/from (.*?)(?:,|$)/i);
      if (match) {
        sender = match[1].trim();
      }
    }
  }

  // Try to find message content
  const contentSelectors = [
    '[data-tid="message-body-content"]',
    '[class*="message-body"]',
    '[class*="message-content"]',
    '.ui-chat__message__body',
    '[itemprop="text"]',
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const contentElement = element.querySelector(selector);
    if (contentElement && contentElement.textContent?.trim()) {
      content = contentElement.textContent.trim();
      break;
    }
  }

  // Fallback: get all text content excluding sender
  if (!content) {
    const allText = element.textContent?.trim() || '';
    content = allText.replace(sender, '').trim();
  }

  // Skip empty messages
  if (!content || content.length === 0) {
    return null;
  }

  // Try to find timestamp
  const timestampSelectors = [
    '[data-tid="message-timestamp"]',
    'time',
    '[class*="timestamp"]',
    '[datetime]',
  ];

  let timestamp = new Date().toISOString();
  for (const selector of timestampSelectors) {
    const timestampElement = element.querySelector(selector);
    if (timestampElement) {
      const datetime = timestampElement.getAttribute('datetime');
      if (datetime) {
        timestamp = datetime;
        break;
      }
      const text = timestampElement.textContent?.trim();
      if (text) {
        timestamp = text;
        break;
      }
    }
  }

  // Check if this is the current user's message
  const isCurrentUser =
    element.classList.contains('me') ||
    element.classList.contains('current-user') ||
    element.getAttribute('data-message-author-role') === 'user' ||
    element.querySelector('[data-tid="message-is-from-user"]') !== null;

  return {
    timestamp,
    sender,
    content,
    isCurrentUser,
  };
}

/**
 * Creates a summary of the extracted chat
 */
export function createChatSummary(messages: TeamsChatMessage[]): TeamsChatSummary {
  // Extract unique participants
  const participants = Array.from(new Set(messages.map(m => m.sender)));

  // Get date range
  const timestamps = messages
    .map(m => {
      try {
        return new Date(m.timestamp).getTime();
      } catch {
        return Date.now();
      }
    })
    .filter(t => !isNaN(t));

  const start = timestamps.length > 0
    ? new Date(Math.min(...timestamps)).toISOString()
    : new Date().toISOString();

  const end = timestamps.length > 0
    ? new Date(Math.max(...timestamps)).toISOString()
    : new Date().toISOString();

  return {
    participants,
    messageCount: messages.length,
    messages,
    dateRange: {
      start,
      end,
    },
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Formats the chat summary as text for display or saving
 */
export function formatChatSummary(summary: TeamsChatSummary): string {
  const startDate = new Date(summary.dateRange.start).toLocaleString();
  const endDate = new Date(summary.dateRange.end).toLocaleString();

  let formatted = `# Teams Chat Summary\n\n`;
  formatted += `**Participants:** ${summary.participants.join(', ')}\n`;
  formatted += `**Messages:** ${summary.messageCount}\n`;
  formatted += `**Date Range:** ${startDate} - ${endDate}\n\n`;
  formatted += `---\n\n`;

  // Group messages by conversation flow
  summary.messages.forEach((msg, index) => {
    const timestamp = new Date(msg.timestamp).toLocaleString();
    formatted += `### ${msg.sender}\n`;
    formatted += `*${timestamp}*\n\n`;
    formatted += `${msg.content}\n\n`;

    if (index < summary.messages.length - 1) {
      formatted += `---\n\n`;
    }
  });

  return formatted;
}

/**
 * Generates an AI-style summary of key points (basic extraction)
 */
export function generateKeySummary(summary: TeamsChatSummary): {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
  questions: string[];
} {
  const allText = summary.messages.map(m => m.content).join(' ').toLowerCase();

  // Simple keyword-based extraction
  const actionKeywords = ['todo', 'will do', 'need to', 'should', 'must', 'action item', 'task'];
  const questionKeywords = ['?', 'how', 'what', 'when', 'where', 'why', 'who'];

  const actionItems: string[] = [];
  const questions: string[] = [];
  const keyPoints: string[] = [];

  summary.messages.forEach(msg => {
    const content = msg.content;
    const lower = content.toLowerCase();

    // Detect action items
    if (actionKeywords.some(keyword => lower.includes(keyword))) {
      actionItems.push(`${msg.sender}: ${content}`);
    }

    // Detect questions
    if (questionKeywords.some(keyword => lower.includes(keyword)) || content.includes('?')) {
      questions.push(`${msg.sender}: ${content}`);
    }

    // Extract longer messages as key points (more than 50 chars, not questions)
    if (content.length > 50 && !content.includes('?')) {
      keyPoints.push(`${msg.sender}: ${content}`);
    }
  });

  // Create overview
  const overview = `Chat conversation between ${summary.participants.join(', ')} with ${summary.messageCount} messages. ` +
    `Discussion took place from ${new Date(summary.dateRange.start).toLocaleDateString()} to ${new Date(summary.dateRange.end).toLocaleDateString()}.`;

  return {
    overview,
    keyPoints: keyPoints.slice(0, 5), // Top 5 key points
    actionItems: actionItems.slice(0, 5), // Top 5 action items
    questions: questions.slice(0, 5), // Top 5 questions
  };
}

/**
 * Detects the current chat/conversation context
 */
export function detectChatContext(): {
  chatName?: string;
  chatType?: 'one-on-one' | 'group' | 'channel';
  channelName?: string;
} {
  // Try to find chat or channel name
  const titleSelectors = [
    '[data-tid="channel-name"]',
    '[data-tid="chat-header-title"]',
    'h2[class*="header"]',
    '[class*="conversation-header"]',
  ];

  let chatName: string | undefined;
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      chatName = element.textContent.trim();
      break;
    }
  }

  // Detect chat type from URL or DOM
  const url = window.location.href;
  let chatType: 'one-on-one' | 'group' | 'channel' | undefined;

  if (url.includes('/channel/')) {
    chatType = 'channel';
  } else if (url.includes('/conversations/')) {
    // Check if it's a group chat
    const participantCount = document.querySelectorAll('[data-tid="chat-participant"]').length;
    chatType = participantCount > 2 ? 'group' : 'one-on-one';
  }

  return {
    chatName,
    chatType,
    channelName: chatType === 'channel' ? chatName : undefined,
  };
}

/**
 * Main function to extract and process Teams chat
 */
export async function extractTeamsChat(): Promise<{
  summary: TeamsChatSummary;
  formattedText: string;
  keySummary: ReturnType<typeof generateKeySummary>;
  context: ReturnType<typeof detectChatContext>;
}> {
  if (!isTeamsPage()) {
    throw new Error('Not on a Microsoft Teams page');
  }

  const messages = extractTeamsMessages();

  if (messages.length === 0) {
    throw new Error('No messages found. Please open a chat conversation first.');
  }

  const summary = createChatSummary(messages);
  const formattedText = formatChatSummary(summary);
  const keySummary = generateKeySummary(summary);
  const context = detectChatContext();

  return {
    summary,
    formattedText,
    keySummary,
    context,
  };
}
