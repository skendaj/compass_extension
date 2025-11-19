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

export function isTeamsPage(): boolean {
  const url = window.location.href;
  return (
    url.includes("teams.microsoft.com") ||
    url.includes("teams.live.com") ||
    document.querySelector('[data-app-name="microsoft-teams"]') !== null
  );
}

export function extractTeamsMessages(): TeamsChatMessage[] {
  const messages: TeamsChatMessage[] = [];

  const messageSelectors = [
    '[data-tid="chat-pane-message"]',
    '[data-tid="message-pane-item"]',
    ".ui-chat__messagelist__message",
    '[role="listitem"][data-tid*="message"]',
    ".ui-chat__item",
    '[class*="message-"]',
  ];

  let messageElements: NodeListOf<Element> | null = null;

  for (const selector of messageSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      messageElements = elements;
      console.log(
        `[Teams Scraper] Found ${elements.length} messages using selector: ${selector}`,
      );
      break;
    }
  }

  if (!messageElements || messageElements.length === 0) {
    console.warn(
      "[Teams Scraper] No chat messages found. Teams DOM structure may have changed.",
    );
    return messages;
  }

  messageElements.forEach((element) => {
    try {
      const message = extractMessageFromElement(element as HTMLElement);
      if (message) {
        messages.push(message);
      }
    } catch (error) {
      console.error("[Teams Scraper] Error extracting message:", error);
    }
  });

  return messages;
}

function extractMessageFromElement(
  element: HTMLElement,
): TeamsChatMessage | null {
  const senderSelectors = [
    '[data-tid="message-author-name"]',
    '[class*="author"]',
    '[class*="sender"]',
    ".ui-chat__message__author",
  ];

  let sender = "Unknown";
  for (const selector of senderSelectors) {
    const senderElement = element.querySelector(selector);
    if (senderElement && senderElement.textContent?.trim()) {
      sender = senderElement.textContent.trim();
      break;
    }
  }

  if (sender === "Unknown") {
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) {
      const match = ariaLabel.match(/from (.*?)(?:,|$)/i);
      if (match) {
        sender = match[1].trim();
      }
    }
  }

  const contentSelectors = [
    '[data-tid="message-body-content"]',
    '[class*="message-body"]',
    '[class*="message-content"]',
    ".ui-chat__message__body",
    '[itemprop="text"]',
  ];

  let content = "";
  for (const selector of contentSelectors) {
    const contentElement = element.querySelector(selector);
    if (contentElement && contentElement.textContent?.trim()) {
      content = contentElement.textContent.trim();
      break;
    }
  }

  if (!content) {
    const allText = element.textContent?.trim() || "";
    content = allText.replace(sender, "").trim();
  }

  if (!content || content.length === 0) {
    return null;
  }

  const timestampSelectors = [
    '[data-tid="message-timestamp"]',
    "time",
    '[class*="timestamp"]',
    "[datetime]",
  ];

  let timestamp = new Date().toISOString();
  for (const selector of timestampSelectors) {
    const timestampElement = element.querySelector(selector);
    if (timestampElement) {
      const datetime = timestampElement.getAttribute("datetime");
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

  const isCurrentUser =
    element.classList.contains("me") ||
    element.classList.contains("current-user") ||
    element.getAttribute("data-message-author-role") === "user" ||
    element.querySelector('[data-tid="message-is-from-user"]') !== null;

  return {
    timestamp,
    sender,
    content,
    isCurrentUser,
  };
}

export function createChatSummary(
  messages: TeamsChatMessage[],
): TeamsChatSummary {
  const participants = Array.from(new Set(messages.map((m) => m.sender)));

  const timestamps = messages
    .map((m) => {
      try {
        return new Date(m.timestamp).getTime();
      } catch {
        return Date.now();
      }
    })
    .filter((t) => !isNaN(t));

  const start =
    timestamps.length > 0
      ? new Date(Math.min(...timestamps)).toISOString()
      : new Date().toISOString();

  const end =
    timestamps.length > 0
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

export function formatChatSummary(summary: TeamsChatSummary): string {
  const startDate = new Date(summary.dateRange.start).toLocaleString();
  const endDate = new Date(summary.dateRange.end).toLocaleString();

  let formatted = `# Teams Chat Summary\n\n`;
  formatted += `**Participants:** ${summary.participants.join(", ")}\n`;
  formatted += `**Messages:** ${summary.messageCount}\n`;
  formatted += `**Date Range:** ${startDate} - ${endDate}\n\n`;
  formatted += `---\n\n`;

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

export function generateKeySummary(
  summary: TeamsChatSummary,
  autoGeneratedQuestion?: string,
): {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
  questions: string[];
  extractedQuestion?: string;
  relevantMessages: TeamsChatMessage[];
} {
  let relevantMessages = summary.messages;
  let extractedQuestion: string | undefined;

  // If there's an auto-generated question, find it and filter messages after it
  if (autoGeneratedQuestion) {
    const questionPattern = /Hi [^,]+,\s*(.+)/;
    const match = autoGeneratedQuestion.match(questionPattern);

    if (match) {
      const questionText = match[1].trim();
      extractedQuestion = questionText.endsWith("?")
        ? questionText
        : `${questionText}?`;

      // Find the index of the auto-generated message
      const autoGenIndex = summary.messages.findIndex(
        (msg) =>
          msg.content.includes(questionText) ||
          msg.content.includes(extractedQuestion!),
      );

      // Only keep messages AFTER the auto-generated question
      if (autoGenIndex !== -1 && autoGenIndex < summary.messages.length - 1) {
        relevantMessages = summary.messages.slice(autoGenIndex + 1);
      }
    }
  } else {
    // Try to detect auto-generated question from messages
    for (let i = 0; i < summary.messages.length; i++) {
      const msg = summary.messages[i];
      const hiPattern = /^Hi [^,]+,\s*(.+)/;
      const match = msg.content.match(hiPattern);

      if (match && match[1].includes("?")) {
        extractedQuestion = match[1].trim();
        if (!extractedQuestion.endsWith("?")) {
          extractedQuestion = `${extractedQuestion}?`;
        }

        // Keep only messages after this one
        if (i < summary.messages.length - 1) {
          relevantMessages = summary.messages.slice(i + 1);
        }
        break;
      }
    }
  }

  const actionKeywords = [
    "todo",
    "will do",
    "need to",
    "should",
    "must",
    "action item",
    "task",
  ];
  const questionKeywords = ["?", "how", "what", "when", "where", "why", "who"];

  const actionItems: string[] = [];
  const questions: string[] = [];
  const keyPoints: string[] = [];

  relevantMessages.forEach((msg) => {
    const content = msg.content;
    const lower = content.toLowerCase();

    if (actionKeywords.some((keyword) => lower.includes(keyword))) {
      actionItems.push(`${msg.sender}: ${content}`);
    }

    if (
      questionKeywords.some((keyword) => lower.includes(keyword)) ||
      content.includes("?")
    ) {
      questions.push(`${msg.sender}: ${content}`);
    }

    if (content.length > 50 && !content.includes("?")) {
      keyPoints.push(`${msg.sender}: ${content}`);
    }
  });

  const overview =
    `Chat conversation between ${summary.participants.join(", ")} with ${relevantMessages.length} relevant messages. ` +
    `Discussion took place from ${new Date(summary.dateRange.start).toLocaleDateString()} to ${new Date(summary.dateRange.end).toLocaleDateString()}.`;

  return {
    overview,
    keyPoints: keyPoints.slice(0, 5),
    actionItems: actionItems.slice(0, 5),
    questions: questions.slice(0, 5),
    extractedQuestion,
    relevantMessages,
  };
}

export function detectChatContext(): {
  chatName?: string;
  chatType?: "one-on-one" | "group" | "channel";
  channelName?: string;
} {
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

  const url = window.location.href;
  let chatType: "one-on-one" | "group" | "channel" | undefined;

  if (url.includes("/channel/")) {
    chatType = "channel";
  } else if (url.includes("/conversations/")) {
    const participantCount = document.querySelectorAll(
      '[data-tid="chat-participant"]',
    ).length;
    chatType = participantCount > 2 ? "group" : "one-on-one";
  }

  return {
    chatName,
    chatType,
    channelName: chatType === "channel" ? chatName : undefined,
  };
}

export async function extractTeamsChat(
  autoGeneratedQuestion?: string,
): Promise<{
  summary: TeamsChatSummary;
  formattedText: string;
  keySummary: ReturnType<typeof generateKeySummary>;
  context: ReturnType<typeof detectChatContext>;
}> {
  if (!isTeamsPage()) {
    throw new Error("Not on a Microsoft Teams page");
  }

  const messages = extractTeamsMessages();

  if (messages.length === 0) {
    throw new Error(
      "No messages found. Please open a chat conversation first.",
    );
  }

  const summary = createChatSummary(messages);
  const keySummary = generateKeySummary(summary, autoGeneratedQuestion);

  // Use relevant messages for formatted text
  const relevantSummary = {
    ...summary,
    messages: keySummary.relevantMessages,
    messageCount: keySummary.relevantMessages.length,
  };
  const formattedText = formatChatSummary(relevantSummary);
  const context = detectChatContext();

  return {
    summary: relevantSummary,
    formattedText,
    keySummary,
    context,
  };
}
