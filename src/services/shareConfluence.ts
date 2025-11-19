// Confluence Blog Post Service
import { KnowledgeEntry } from "../types";

interface ConfluenceConfig {
  domain: string;
  email: string;
  apiToken: string;
  spaceId: string; // Can be either space key (e.g., "TEAM") or numeric ID
}

interface ConfluenceBlogPost {
  spaceId?: string; // Numeric ID
  status: "current" | "draft";
  title: string;
  body: {
    representation: "storage" | "atlas_doc_format";
    value: string;
  };
}

interface ConfluenceResponse {
  id: string;
  status: string;
  title: string;
  spaceId: string;
  _links: {
    webui: string;
  };
}

class ShareConfluenceService {
  private config: ConfluenceConfig | null = null;

  /**
   * Initialize Confluence configuration
   */
  async setConfig(config: ConfluenceConfig): Promise<void> {
    this.config = config;
    await chrome.storage.local.set({ confluenceConfig: config });
  }

  /**
   * Load Confluence configuration from storage
   */
  async loadConfig(): Promise<ConfluenceConfig | null> {
    if (this.config) {
      return this.config;
    }

    const result = await chrome.storage.local.get("confluenceConfig");
    this.config = result.confluenceConfig || null;
    return this.config;
  }

  /**
   * Check if Confluence is configured
   */
  async isConfigured(): Promise<boolean> {
    const config = await this.loadConfig();
    return !!(
      config &&
      config.domain &&
      config.email &&
      config.apiToken &&
      config.spaceId
    );
  }

  /**
   * Convert KnowledgeEntry to Confluence Storage format (HTML)
   */
  private convertToStorageFormat(entry: KnowledgeEntry): string {
    let html = `<h2>Problem</h2>`;
    html += `<p>${this.escapeHtml(entry.problem)}</p>`;

    html += `<h2>Solution</h2>`;
    html += `<p>${this.escapeHtml(entry.solution.summary)}</p>`;

    if (entry.solution.steps && entry.solution.steps.length > 0) {
      html += `<h3>Steps</h3><ol>`;
      entry.solution.steps.forEach((step) => {
        html += `<li>${this.escapeHtml(step)}</li>`;
      });
      html += `</ol>`;
    }

    if (entry.solution.codeSnippets && entry.solution.codeSnippets.length > 0) {
      html += `<h3>Code Examples</h3>`;
      entry.solution.codeSnippets.forEach((snippet) => {
        html += `<ac:structured-macro ac:name="code">`;
        html += `<ac:plain-text-body><![CDATA[${snippet}]]></ac:plain-text-body>`;
        html += `</ac:structured-macro>`;
      });
    }

    if (entry.tags && entry.tags.length > 0) {
      html += `<h3>Tags</h3><p>`;
      html += entry.tags
        .map(
          (tag) =>
            `<ac:link><ri:page ri:content-title="${this.escapeHtml(tag)}" /></ac:link>`,
        )
        .join(", ");
      html += `</p>`;
    }

    if (entry.resources.links && entry.resources.links.length > 0) {
      html += `<h3>Related Links</h3><ul>`;
      entry.resources.links.forEach((link) => {
        html += `<li><a href="${this.escapeHtml(link)}">${this.escapeHtml(link)}</a></li>`;
      });
      html += `</ul>`;
    }

    html += `<hr />`;
    html += `<p><em>Created by: ${this.escapeHtml(entry.askedBy.name)}</em></p>`;
    html += `<p><em>Solved by: ${entry.solvedBy.map((u) => this.escapeHtml(u.name)).join(", ")}</em></p>`;
    html += `<p><em>Category: ${this.escapeHtml(entry.category)}</em></p>`;

    return html;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Get numeric space ID from space key
   */
  private async getSpaceId(
    spaceKey: string,
    config: ConfluenceConfig,
  ): Promise<string> {
    // If it's already numeric, return it
    if (/^\d+$/.test(spaceKey)) {
      return spaceKey;
    }

    // Otherwise, fetch the space to get its numeric ID
    const url = `https://${config.domain}/wiki/api/v2/spaces?keys=${encodeURIComponent(spaceKey)}`;
    const authHeader = this.createAuthHeader(config.email, config.apiToken);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch space: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].id;
      } else {
        throw new Error(`Space with key '${spaceKey}' not found`);
      }
    } catch (error) {
      console.error("Error fetching space ID:", error);
      throw error;
    }
  }

  /**
   * Create a blog post on Confluence from a KnowledgeEntry
   */
  async createBlogPost(entry: KnowledgeEntry): Promise<ConfluenceResponse> {
    const config = await this.loadConfig();

    if (!config) {
      throw new Error(
        "Confluence is not configured. Please configure it first.",
      );
    }

    // Get numeric space ID
    const numericSpaceId = await this.getSpaceId(config.spaceId, config);

    const blogPost: ConfluenceBlogPost = {
      spaceId: numericSpaceId,
      status: "current",
      title: entry.title,
      body: {
        representation: "storage",
        value: this.convertToStorageFormat(entry),
      },
    };

    const url = `https://${config.domain}/wiki/api/v2/blogposts`;

    const authHeader = this.createAuthHeader(config.email, config.apiToken);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogPost),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create blog post: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result: ConfluenceResponse = await response.json();

      // Log success
      console.log(
        `Blog post created successfully: ${result.title} (ID: ${result.id})`,
      );

      return result;
    } catch (error) {
      console.error("Error creating Confluence blog post:", error);
      throw error;
    }
  }

  /**
   * Create a custom blog post with specific content
   */
  async createCustomPost(
    title: string,
    content: string,
    spaceId?: string,
  ): Promise<ConfluenceResponse> {
    const config = await this.loadConfig();

    if (!config) {
      throw new Error(
        "Confluence is not configured. Please configure it first.",
      );
    }

    // Get numeric space ID
    const numericSpaceId = await this.getSpaceId(
      spaceId || config.spaceId,
      config,
    );

    const blogPost: ConfluenceBlogPost = {
      spaceId: numericSpaceId,
      status: "current",
      title: title,
      body: {
        representation: "storage",
        value: content,
      },
    };

    const url = `https://${config.domain}/wiki/api/v2/blogposts`;

    const authHeader = this.createAuthHeader(config.email, config.apiToken);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogPost),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create blog post: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result: ConfluenceResponse = await response.json();

      console.log(
        `Custom blog post created successfully: ${result.title} (ID: ${result.id})`,
      );

      return result;
    } catch (error) {
      console.error("Error creating Confluence blog post:", error);
      throw error;
    }
  }

  /**
   * Create Basic Auth header
   */
  private createAuthHeader(email: string, apiToken: string): string {
    const credentials = `${email}:${apiToken}`;
    const base64Credentials = btoa(credentials);
    return `Basic ${base64Credentials}`;
  }

  /**
   * Test Confluence connection
   */
  async testConnection(): Promise<boolean> {
    const config = await this.loadConfig();

    if (!config) {
      throw new Error(
        "Confluence is not configured. Please configure it first.",
      );
    }

    try {
      // Try to get the space ID - this will test both authentication and space access
      await this.getSpaceId(config.spaceId, config);
      return true;
    } catch (error) {
      console.error("Error testing Confluence connection:", error);
      return false;
    }
  }

  /**
   * Get the web URL for a created blog post
   */
  getWebUrl(response: ConfluenceResponse, config?: ConfluenceConfig): string {
    if (response._links && response._links.webui) {
      const domain = config?.domain || this.config?.domain;
      return `https://${domain}/wiki${response._links.webui}`;
    }
    return "";
  }

  /**
   * Clear Confluence configuration
   */
  async clearConfig(): Promise<void> {
    this.config = null;
    await chrome.storage.local.remove("confluenceConfig");
  }
}

export const shareConfluenceService = new ShareConfluenceService();
