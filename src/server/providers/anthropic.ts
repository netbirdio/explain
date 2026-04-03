import type { Message } from "../../types";
import type { LLMProvider, McpServer, ProviderConfig, Tool } from "./types";

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
};

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "claude-sonnet-4-20250514";
  }

  async chat(messages: Message[], systemPrompt?: string, tools?: Tool[], mcpServers?: McpServer[]): Promise<string> {
    const anthropicMessages: AnthropicMessage[] = messages.map((m) => ({
      role: m.role === "context" || m.role === "system" ? ("user" as const) : m.role,
      content: m.role === "context" ? `[Context]: ${m.content}` : m.content,
    }));

    const toolDefs: Record<string, unknown>[] = [];

    if (tools?.length) {
      for (const t of tools) {
        toolDefs.push({
          name: t.name,
          description: t.description,
          input_schema: t.input_schema,
        });
      }
    }

    if (mcpServers?.length) {
      for (const mcp of mcpServers) {
        const mcpTool: Record<string, unknown> = {
          type: "mcp",
          server_label: mcp.server_label,
          server_url: mcp.server_url,
        };
        if (mcp.headers) mcpTool.headers = mcp.headers;
        if (mcp.allowed_tools) mcpTool.allowed_tools = mcp.allowed_tools;
        toolDefs.push(mcpTool);
      }
    }

    const toolsByName = new Map(tools?.map((t) => [t.name, t]));

    let lastTextResponse = "";

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const body: Record<string, unknown> = {
        model: this.model,
        max_tokens: 4096,
        messages: anthropicMessages,
      };

      if (systemPrompt) {
        body.system = systemPrompt;
      }

      if (toolDefs && toolDefs.length > 0) {
        body.tools = toolDefs;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      };

      if (mcpServers?.length) {
        headers["anthropic-beta"] = "mcp-client-2025-04-04";
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
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
      if (textBlock) {
        lastTextResponse = textBlock.text;
      }

      // MCP server-side tools hit iteration limit — re-send to continue
      if (data.stop_reason === "pause_turn") {
        anthropicMessages.push({ role: "assistant", content: data.content });
        continue;
      }

      if (data.stop_reason !== "tool_use") {
        if (!lastTextResponse) {
          throw new Error("No text content in Anthropic response");
        }
        return lastTextResponse;
      }

      // Handle client-side tool calls
      const toolUseBlocks = data.content.filter(
        (block: { type: string }) => block.type === "tool_use",
      );

      anthropicMessages.push({ role: "assistant", content: data.content });

      const toolResults: AnthropicContentBlock[] = [];
      for (const toolUse of toolUseBlocks) {
        const tool = toolsByName.get(toolUse.name);
        if (!tool) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Error: unknown tool "${toolUse.name}"`,
          });
          continue;
        }
        try {
          const result = await tool.execute(toolUse.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: result,
          });
        } catch (err) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }

      anthropicMessages.push({ role: "user", content: toolResults });
    }
  }
}