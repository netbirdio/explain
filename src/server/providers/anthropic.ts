import type { Message } from "../../types";
import type { LLMProvider, ProviderConfig } from "./types";

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "claude-sonnet-4-20250514";
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<string> {
    const anthropicMessages = messages.map((m) => ({
      role: m.role === "context" || m.role === "system" ? ("user" as const) : m.role,
      content: m.role === "context" ? `[Context]: ${m.content}` : m.content,
    }));

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: 4096,
      messages: anthropicMessages,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === "text",
    );
    if (!textBlock) {
      throw new Error("No text content in Anthropic response");
    }
    return textBlock.text;
  }
}