import type { Message } from "../types";
import { AnthropicProvider } from "./providers/anthropic";
import { DifyProvider } from "./providers/dify";
import { OpenAIProvider } from "./providers/openai";
import type { LLMProvider, Middleware, Tool } from "./providers/types";

export type AssistantConfig = {
  provider: "anthropic" | "openai" | "dify" | LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  systemPrompt?: string;
  middleware?: Middleware[];
  tools?: Tool[];
};

type HandlerOptions = {
  apiKey?: string;
};

type ChatRequest = {
  messages: Message[];
};

type ChatResponse = {
  reply: string;
};

interface IncomingRequest {
  headers: Record<string, string | string[] | undefined> | { get(name: string): string | null };
  body?: unknown;
  method?: string;
  on?(event: string, callback: (...args: unknown[]) => void): unknown;
}

interface OutgoingResponse {
  status?(code: number): Pick<OutgoingResponse, "json" | "end">;
  statusCode?: number;
  json?(data: unknown): void;
  end?(data?: string): void;
  setHeader?(name: string, value: string): void;
  writeHead?(statusCode: number, headers?: Record<string, string>): void;
}

function getHeader(req: IncomingRequest, name: string): string | null {
  if (typeof req.headers === "object" && req.headers !== null) {
    if ("get" in req.headers && typeof req.headers.get === "function") {
      return req.headers.get(name);
    }
    const headers = req.headers as Record<string, string | string[] | undefined>;
    const value = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  }
  return null;
}

function sendJson(res: OutgoingResponse, statusCode: number, data: unknown): void {
  if (typeof res.status === "function" && typeof res.json === "function") {
    const chained = res.status(statusCode);
    if (chained && typeof chained.json === "function") {
      chained.json(data);
      return;
    }
  }
  if (typeof res.writeHead === "function" && typeof res.end === "function") {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    return;
  }
  if (typeof res.end === "function") {
    if (res.statusCode !== undefined) res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  }
}

async function parseBody(req: IncomingRequest): Promise<unknown> {
  if (req.body !== undefined && req.body !== null) {
    return req.body;
  }
  if (typeof req.on === "function") {
    const onFn = req.on.bind(req);
    return new Promise((resolve, reject) => {
      const chunks: string[] = [];
      onFn("data", (chunk: unknown) => chunks.push(String(chunk)));
      onFn("end", () => {
        try {
          resolve(JSON.parse(chunks.join("")));
        } catch {
          reject(new Error("Invalid JSON body"));
        }
      });
      onFn("error", reject);
    });
  }
  throw new Error("Unable to parse request body");
}

function createProvider(config: AssistantConfig): LLMProvider {
  if (typeof config.provider === "object") {
    return config.provider;
  }
  if (!config.apiKey) {
    throw new Error("apiKey is required when using a built-in provider");
  }
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider({ apiKey: config.apiKey, model: config.model });
    case "openai":
      return new OpenAIProvider({ apiKey: config.apiKey, model: config.model });
    case "dify":
      return new DifyProvider({ apiKey: config.apiKey, baseUrl: config.baseUrl });
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export function createAssistant(config: AssistantConfig) {
  const provider = createProvider(config);
  const middlewares = config.middleware || [];

  async function chat(req: ChatRequest): Promise<ChatResponse> {
    if (!req.messages || !Array.isArray(req.messages) || req.messages.length === 0) {
      throw new Error("messages array is required and must not be empty");
    }

    let messages = req.messages;
    let systemPrompt = config.systemPrompt;

    for (const mw of middlewares) {
      const result = await mw(messages, systemPrompt);
      messages = result.messages;
      systemPrompt = result.systemPrompt;
    }

    const reply = await provider.chat(messages, systemPrompt, config.tools);
    return { reply };
  }

  function handler(opts?: HandlerOptions) {
    return async (req: IncomingRequest, res: OutgoingResponse): Promise<void> => {
      try {
        if (opts?.apiKey) {
          const authHeader = getHeader(req, "Authorization") || getHeader(req, "authorization");
          const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
          if (token !== opts.apiKey) {
            sendJson(res, 401, { error: "Unauthorized" });
            return;
          }
        }

        let body: unknown;
        try {
          body = await parseBody(req);
        } catch {
          sendJson(res, 400, { error: "Invalid request body" });
          return;
        }

        const { messages } = body as { messages?: Message[] };
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          sendJson(res, 400, { error: "messages array is required and must not be empty" });
          return;
        }

        try {
          const result = await chat({ messages });
          sendJson(res, 200, result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "LLM request failed";
          sendJson(res, 502, { error: message });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Internal server error";
        sendJson(res, 500, { error: message });
      }
    };
  }

  return { chat, handler };
}