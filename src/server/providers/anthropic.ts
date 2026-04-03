import type { Message } from "../../types";
import type { LLMProvider, ProviderConfig, Tool } from "./types";

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

  async chat(messages: Message[], systemPrompt?: string, tools?: Tool[]): Promise<string> {
    const anthropicMessages: AnthropicMessage[] = messages.map((m) => ({
      role: m.role === "context" || m.role === "system" ? ("user" as const) : m.role,
      content: m.role === "context" ? `[Context]: ${m.content}` : m.content,
    }));

    const toolDefs = tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    }));

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
      if (textBlock) {
        lastTextResponse = textBlock.text;
      }

      if (data.stop_reason !== "tool_use") {
        if (!lastTextResponse) {
          throw new Error("No text content in Anthropic response");
        }
        return lastTextResponse;
      }

      // Handle tool calls
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