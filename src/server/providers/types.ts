import type { Message } from "../../types";

export type Tool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<string>;
};

export interface LLMProvider {
  chat(messages: Message[], systemPrompt?: string, tools?: Tool[]): Promise<string>;
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