"use client";

import {
  Bot,
  MessageCircleQuestion,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "../types";
import * as S from "./styles";

export type MessageRenderer = (message: Message) => React.ReactNode;

type Props = {
  open: boolean;
  onClose: () => void;
  initialQuery: string;
  endpoint: string;
  apiKey?: string;
  title?: string;
  subtitle?: string;
  renderMessage?: MessageRenderer;
};

async function fetchAIResponse(
  endpoint: string,
  apiKey: string | undefined,
  messages: Message[],
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.reply;
}

function defaultRenderMessage(msg: Message): React.ReactNode {
  return msg.content.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {line
        .split(/(\*\*[^*]+\*\*)/)
        .map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} style={S.messageBold}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            <React.Fragment key={j}>{part}</React.Fragment>
          ),
        )}
      {i < msg.content.split("\n").length - 1 && <br />}
    </React.Fragment>
  ));
}

export default function AIChatBot({
  open,
  onClose,
  initialQuery,
  endpoint,
  apiKey,
  title = "AI Assistant",
  subtitle = "Ask anything",
  renderMessage,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProcessedInitialQuery = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const getAIResponse = useCallback(
    async (allMessages: Message[]) => {
      setIsTyping(true);
      try {
        const reply = await fetchAIResponse(endpoint, apiKey, allMessages);
        const response: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: reply,
        };
        setMessages((prev) => [...prev, response]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        const response: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Sorry, I couldn't get a response. Error: ${errorMsg}`,
        };
        setMessages((prev) => [...prev, response]);
      } finally {
        setIsTyping(false);
      }
    },
    [endpoint, apiKey],
  );

  // Handle initial query from explain mode
  useEffect(() => {
    if (open && initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;

      const lines = initialQuery.split("\n");
      const userMessage = lines[0];
      const docsLine = lines.find((l) => l.startsWith("Docs: "));

      const msgs: Message[] = [];

      if (docsLine) {
        msgs.push({
          id: Date.now().toString() + "-ctx",
          role: "context",
          content: docsLine,
        });
      }

      msgs.push({
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
      });

      setMessages(msgs);
      getAIResponse(msgs);
    }
  }, [open, initialQuery, getAIResponse]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      hasProcessedInitialQuery.current = false;
      setMessages([]);
      setInput("");
      setIsTyping(false);
    }
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    getAIResponse(updatedMessages);
  }, [input, isTyping, messages, getAIResponse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) return null;

  const active = !!input.trim() && !isTyping;

  return (
    <div style={S.chatPanel}>
      {/* Header */}
      <div style={S.chatHeader}>
        <div style={S.chatHeaderLeft}>
          <div style={S.chatHeaderIcon}>
            <Sparkles size={15} style={{ color: "var(--nb-explain-accent)" }} />
          </div>
          <div style={S.chatHeaderText}>
            <h3 style={S.chatHeaderTitle}>{title}</h3>
            <span style={S.chatHeaderSubtitle}>{subtitle}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={S.chatCloseBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--nb-explain-text)";
            e.currentTarget.style.background = "var(--nb-explain-bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--nb-explain-text-dim)";
            e.currentTarget.style.background = "none";
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={S.messagesArea}>
        {messages.length === 0 && !isTyping && (
          <div style={S.emptyState}>
            <MessageCircleQuestion
              size={40}
              style={{ color: "var(--nb-explain-text-dim)" }}
            />
            <div>
              <p style={S.emptyStateTitle}>How can I help?</p>
              <p style={S.emptyStateHint}>
                Use the Explain button to click on any element, or ask a
                question below.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "context" ? (
            <div key={msg.id} style={S.contextBadge}>
              <div style={S.contextBadgeInner}>
                <Sparkles
                  size={10}
                  style={{ color: "var(--nb-explain-accent)", opacity: 0.6 }}
                />
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} style={S.messageRow(msg.role === "user")}>
              {msg.role === "assistant" && (
                <div style={S.messageAvatar(false)}>
                  <Bot size={13} style={{ color: "var(--nb-explain-accent)" }} />
                </div>
              )}
              <div style={S.messageBubble(msg.role === "user")}>
                {renderMessage
                  ? renderMessage(msg)
                  : defaultRenderMessage(msg)}
              </div>
              {msg.role === "user" && (
                <div style={S.messageAvatar(true)}>
                  <User size={13} style={{ color: "var(--nb-explain-user-text)" }} />
                </div>
              )}
            </div>
          ),
        )}

        {isTyping && (
          <div style={S.typingRow}>
            <div style={S.messageAvatar(false)}>
              <Bot size={13} style={{ color: "var(--nb-explain-accent)" }} />
            </div>
            <div style={S.typingBubble}>
              <span className="nb-explain-dot-1" style={S.typingDot} />
              <span className="nb-explain-dot-2" style={S.typingDot} />
              <span className="nb-explain-dot-3" style={S.typingDot} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={S.inputArea}>
        <div style={S.inputRow}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question..."
            style={S.inputField}
          />
          <button
            onClick={sendMessage}
            disabled={!active}
            style={S.sendBtn(active)}
          >
            <Send size={15} />
          </button>
        </div>
        <p style={S.inputFooter}>AI-powered assistant</p>
      </div>
    </div>
  );
}