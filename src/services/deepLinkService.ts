// Deep Link Service - Share knowledge entries via URLs

export class DeepLinkService {
  private static readonly BASE_URL = "https://knowledge.company.com"; // Replace with your domain
  private static readonly EXTENSION_PROTOCOL = "teamknowledge://";

  /**
   * Generate a shareable link for a knowledge entry
   */
  static generateShareLink(
    entryId: string,
    type: "internal" | "external" = "external",
  ): string {
    if (type === "internal") {
      // Deep link for users with extension installed
      return `${this.EXTENSION_PROTOCOL}entry/${entryId}`;
    } else {
      // Web link that works for everyone
      return `${this.BASE_URL}/entry/${entryId}`;
    }
  }

  /**
   * Generate a shareable link with query context
   */
  static generateSearchLink(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `${this.BASE_URL}/search?q=${encodedQuery}`;
  }

  /**
   * Parse a deep link URL and extract entry ID
   */
  static parseDeepLink(url: string): {
    type: "entry" | "search" | null;
    id?: string;
    query?: string;
  } {
    // Handle extension protocol (teamknowledge://entry/123)
    if (url.startsWith(this.EXTENSION_PROTOCOL)) {
      const path = url.replace(this.EXTENSION_PROTOCOL, "");
      if (path.startsWith("entry/")) {
        return { type: "entry", id: path.replace("entry/", "") };
      }
      if (path.startsWith("search?q=")) {
        const query = decodeURIComponent(path.replace("search?q=", ""));
        return { type: "search", query };
      }
    }

    // Handle web URLs (https://knowledge.company.com/entry/123)
    if (url.startsWith(this.BASE_URL)) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");

      if (pathParts[1] === "entry" && pathParts[2]) {
        return { type: "entry", id: pathParts[2] };
      }

      if (pathParts[1] === "search") {
        const query = urlObj.searchParams.get("q");
        if (query) {
          return { type: "search", query };
        }
      }
    }

    return { type: null };
  }

  /**
   * Copy link to clipboard
   */
  static async copyToClipboard(link: string): Promise<boolean> {
    // Try modern clipboard API first
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error("Clipboard API failed, trying fallback:", error);

      // Fallback to execCommand method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          console.log("Copy successful using execCommand");
          return true;
        } else {
          console.error("execCommand copy failed");
          return false;
        }
      } catch (fallbackError) {
        console.error("Fallback copy method failed:", fallbackError);
        return false;
      }
    }
  }

  /**
   * Share via native share API (mobile)
   */
  static async shareNative(
    title: string,
    text: string,
    url: string,
  ): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return true;
      } catch (error) {
        console.error("Failed to share:", error);
        return false;
      }
    }
    return false;
  }

  /**
   * Generate sharing links for various platforms
   */
  static getSocialShareLinks(url: string, title: string) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return {
      teams: `https://teams.microsoft.com/share?msgText=${encodedTitle}%0A${encodedUrl}`,
      slack: `https://slack.com/intl/en-us/help/articles/201330256-Share-links-in-Slack?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this solution: ${encodedUrl}`,
      copy: url,
    };
  }

  /**
   * Store pending deep link for when app opens
   */
  static async storePendingLink(link: string): Promise<void> {
    await chrome.storage.local.set({ pendingDeepLink: link });
  }

  /**
   * Get and clear pending deep link
   */
  static async getPendingLink(): Promise<string | null> {
    const result = await chrome.storage.local.get("pendingDeepLink");
    if (result.pendingDeepLink) {
      await chrome.storage.local.remove("pendingDeepLink");
      return result.pendingDeepLink;
    }
    return null;
  }
}
