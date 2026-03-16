import type { Message } from "../../types";
import type { LLMProvider, ProviderConfig } from "./types";

export class DifyProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    if (!config.baseUrl) {
      throw new Error("baseUrl is required for the Dify provider");
    }
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<string> {
    const query = this.buildQuery(messages, systemPrompt);

    const response = await fetch(`${this.baseUrl}/v1/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: "blocking",
        user: "explain-user",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Dify API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    if (!data.answer) {
      throw new Error("No answer in Dify response");
    }
    return data.answer;
  }

  private buildQuery(messages: Message[], systemPrompt?: string): string {
    const parts: string[] = [];

    if (systemPrompt) {
      parts.push(`[System]: ${systemPrompt}`);
    }

    for (const m of messages) {
      if (m.role === "context") {
        parts.push(`[Context]: ${m.content}`);
      } else if (m.role === "system") {
        parts.push(`[System]: ${m.content}`);
      } else if (m.role === "assistant") {
        parts.push(`[Assistant]: ${m.content}`);
      } else {
        parts.push(m.content);
      }
    }

    return parts.join("\n\n");
  }
}