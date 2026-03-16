import type { Message } from "../../types";

export interface LLMProvider {
  chat(messages: Message[], systemPrompt?: string): Promise<string>;
}

export type ProviderConfig = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

/**
 * Middleware that can transform messages before they reach the LLM.
 * Useful for RAG context injection, logging, filtering, etc.
 * Return the (possibly modified) messages array.
 */
export type Middleware = (
  messages: Message[],
  systemPrompt?: string,
) => Promise<{ messages: Message[]; systemPrompt?: string }>;