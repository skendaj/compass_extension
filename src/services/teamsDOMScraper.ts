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

  let sender = "";

  // First try to get email from data attributes
  const emailAttr =
    element.getAttribute("data-email") ||
    element.getAttribute("data-sender-email") ||
    element.getAttribute("data-upn");

  if (emailAttr && emailAttr.includes("@")) {
    sender = emailAttr;
  }

  // Try to extract from sender elements
  if (!sender) {
    for (const selector of senderSelectors) {
      const senderElement = element.querySelector(selector);
      if (senderElement && senderElement.textContent?.trim()) {
        sender = senderElement.textContent.trim();
        break;
      }
    }
  }

  // Try aria-label as fallback
  if (!sender) {
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) {
      const match = ariaLabel.match(/from (.*?)(?:,|$)/i);
      if (match) {
        sender = match[1].trim();
      }
    }
  }

  // If still no sender, try to get current page user info
  if (!sender) {
    const userButton = document.querySelector('[data-tid="user-button"]');
    const meButton = document.querySelector('[aria-label*="profile"]');
    if (userButton && userButton.getAttribute("aria-label")) {
      const label = userButton.getAttribute("aria-label");
      if (label && label.includes("@")) {
        const emailMatch = label.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          sender = emailMatch[0];
        }
      }
    } else if (meButton) {
      const label = meButton.getAttribute("aria-label");
      if (label && label.includes("@")) {
        const emailMatch = label.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          sender = emailMatch[0];
        }
      }
    }
  }

  // Default to "You" if still unknown
  if (!sender) {
    sender = "You";
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

export function extractQAPairs(messages: TeamsChatMessage[]): {
  question: string;
  answer: string;
  pairs: Array<{
    question: string;
    answer: string;
    questionBy: string;
    answerBy: string;
  }>;
  formattedQA: string;
  apiPayload: { content: string };
} {
  const pairs: Array<{
    question: string;
    answer: string;
    questionBy: string;
    answerBy: string;
  }> = [];
  let mainQuestion = "";
  let mainAnswer = "";

  // Group messages by question/answer pattern
  let currentQuestion: { text: string; sender: string } | null = null;
  const answerMessages: Array<{ text: string; sender: string }> = [];

  for (const msg of messages) {
    const isQuestion = msg.content.includes("?");

    if (isQuestion) {
      // Save previous Q&A pair if exists
      if (currentQuestion && answerMessages.length > 0) {
        const answer = answerMessages.map((a) => a.text).join(" ");
        pairs.push({
          question: currentQuestion.text,
          answer: answer,
          questionBy: currentQuestion.sender,
          answerBy: answerMessages[0].sender,
        });

        // Set as main Q&A if first pair
        if (!mainQuestion) {
          mainQuestion = currentQuestion.text;
          mainAnswer = answer;
        }
      }

      // Start new question
      currentQuestion = { text: msg.content, sender: msg.sender };
      answerMessages.length = 0; // Clear answers
    } else {
      // This is an answer/response
      answerMessages.push({ text: msg.content, sender: msg.sender });
    }
  }

  // Don't forget the last Q&A pair
  if (currentQuestion && answerMessages.length > 0) {
    const answer = answerMessages.map((a) => a.text).join(" ");
    pairs.push({
      question: currentQuestion.text,
      answer: answer,
      questionBy: currentQuestion.sender,
      answerBy: answerMessages[0].sender,
    });

    if (!mainQuestion) {
      mainQuestion = currentQuestion.text;
      mainAnswer = answer;
    }
  }

  // If no Q&A pairs found, try to extract from all messages
  if (pairs.length === 0 && messages.length >= 2) {
    const questionMsg = messages.find((m) => m.content.includes("?"));
    if (questionMsg) {
      mainQuestion = questionMsg.content;
      const otherMessages = messages.filter((m) => m !== questionMsg);
      mainAnswer = otherMessages
        .map((m) => `${m.sender}: ${m.content}`)
        .join("\n");
      pairs.push({
        question: mainQuestion,
        answer: mainAnswer,
        questionBy: questionMsg.sender,
        answerBy: otherMessages[0]?.sender || "Admin",
      });
    }
  }

  // Format for display
  let formattedQA = "";
  pairs.forEach((pair, index) => {
    formattedQA += `Q${index + 1} (${pair.questionBy}): ${pair.question}\n\n`;
    formattedQA += `A${index + 1} (${pair.answerBy}): ${pair.answer}\n\n`;
    if (index < pairs.length - 1) {
      formattedQA += "---\n\n";
    }
  });

  // Prepare API payload format
  const apiContent = pairs
    .map((pair) => {
      return `User: ${pair.question}\nAdmin: ${pair.answer}`;
    })
    .join("\n\n");

  const apiPayload = {
    content:
      apiContent ||
      formattedQA ||
      messages
        .map((m) => {
          const sender = m.sender === "Unknown" ? "User" : m.sender;
          return `${sender}: ${m.content}`;
        })
        .join("\n"),
  };

  return {
    question: mainQuestion,
    answer: mainAnswer,
    pairs,
    formattedQA: formattedQA || messages.map((m) => m.content).join("\n\n"),
    apiPayload,
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
  qaPairs: ReturnType<typeof extractQAPairs>;
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
  const qaPairs = extractQAPairs(keySummary.relevantMessages);

  return {
    summary: relevantSummary,
    formattedText,
    keySummary,
    context,
    qaPairs,
  };
}
