import type { Message } from "../../types";

export interface LLMProvider {
  chat(messages: Message[], systemPrompt?: string): Promise<string>;
}

export type ProviderConfig = {
  apiKey: string;
  model?: string;
};