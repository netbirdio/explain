import type { Message } from "../../types";
import type { LLMProvider, ProviderConfig } from "./types";

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gpt-4o";
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<string> {
    const openaiMessages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      openaiMessages.push({ role: "system", content: systemPrompt });
    }

    for (const m of messages) {
      if (m.role === "context") {
        openaiMessages.push({ role: "user", content: `[Context]: ${m.content}` });
      } else if (m.role === "system") {
        openaiMessages.push({ role: "user", content: m.content });
      } else {
        openaiMessages.push({ role: m.role, content: m.content });
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: openaiMessages,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error("No content in OpenAI response");
    }
    return choice.message.content;
  }
}