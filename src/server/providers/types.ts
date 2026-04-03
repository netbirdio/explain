import type { Message } from "../../types";

export type Tool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<string>;
};

export type McpServer = {
  server_label: string;
  server_url: string;
  headers?: Record<string, string>;
  allowed_tools?: string[];
};

export interface LLMProvider {
  chat(messages: Message[], systemPrompt?: string, tools?: Tool[], mcpServers?: McpServer[]): Promise<string>;
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