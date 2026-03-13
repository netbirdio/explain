"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ExplainContext } from "../types";
import AIChatBot from "./AIChatBot";
import AIFloatingButton from "./AIFloatingButton";
import * as S from "./styles";

type AIAssistantContextType = {
  openChat: (selectedText?: string) => void;
  closeChat: () => void;
  isChatOpen: boolean;
  explainMode: boolean;
  enterExplainMode: () => void;
  exitExplainMode: () => void;
  setExplainContext: (ctx: ExplainContext) => void;
  clearExplainContext: () => void;
};

const AIAssistantContext = createContext<AIAssistantContextType>({
  openChat: () => {},
  closeChat: () => {},
  isChatOpen: false,
  explainMode: false,
  enterExplainMode: () => {},
  exitExplainMode: () => {},
  setExplainContext: () => {},
  clearExplainContext: () => {},
});

export const useAIAssistant = () => useContext(AIAssistantContext);

type AIAssistantProviderProps = {
  endpoint: string;
  apiKey?: string;
  children: React.ReactNode;
};

/**
 * Find the closest ancestor (or self) with a data-nb-explain attribute.
 * Returns null if nothing is explainable.
 */
function findExplainable(el: HTMLElement): HTMLElement | null {
  return el.closest("[data-nb-explain]") as HTMLElement | null;
}

/**
 * Extract a short label from an explainable element by looking for
 * a label, heading, or first bit of text content.
 */
function extractLabel(el: HTMLElement): string {
  const label = el.querySelector("label") as HTMLElement | null;
  if (label?.innerText?.trim()) return label.innerText.trim();

  const heading = el.querySelector("h1, h2, h3, h4") as HTMLElement | null;
  if (heading?.innerText?.trim()) return heading.innerText.trim();

  const text = el.innerText?.trim();
  if (text && text.length <= 80) return text;
  if (text) return text.slice(0, 80) + "...";

  return "this element";
}

/**
 * Look for data-nb-explain-docs on the element or its ancestors.
 * Returns an array of documentation URLs, or an empty array.
 */
function findExplainDocs(el: HTMLElement): string[] {
  const withDocs = el.closest("[data-nb-explain-docs]") as HTMLElement | null;
  if (!withDocs) return [];

  const raw = withDocs.getAttribute("data-nb-explain-docs") || "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If not valid JSON, treat as a single URL
    if (raw.trim()) return [raw.trim()];
  }
  return [];
}

function buildQuery(
  label: string,
  ctx: ExplainContext | null,
  elementDocs: string[],
): string {
  let userMessage = `Explain "${label}"`;
  if (ctx) {
    if (ctx.modalName) userMessage += ` on ${ctx.modalName} modal`;
    if (ctx.pageName) userMessage += ` in ${ctx.pageName}`;
  }

  // Merge docs from context and element attribute
  const allDocs = [
    ...(ctx?.docsUrls || []),
    ...elementDocs,
  ];
  // Deduplicate
  const uniqueDocs = [...new Set(allDocs)];

  const parts = [userMessage];
  if (uniqueDocs.length > 0) {
    parts.push(`Docs: ${uniqueDocs.join(", ")}`);
  }
  return parts.join("\n");
}

export default function AIAssistantProvider({
  endpoint,
  apiKey,
  children,
}: AIAssistantProviderProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [explainMode, setExplainMode] = useState(false);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [explainCtx, setExplainCtx] = useState<ExplainContext | null>(null);

  const openChat = useCallback((selectedText?: string) => {
    setInitialQuery(selectedText || "");
    setIsChatOpen(true);
    setExplainMode(false);
    setHoveredEl(null);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setInitialQuery("");
  }, []);

  const enterExplainMode = useCallback(() => {
    setExplainMode(true);
  }, []);

  const exitExplainMode = useCallback(() => {
    setExplainMode(false);
    setHoveredEl(null);
  }, []);

  const setExplainContext = useCallback((ctx: ExplainContext) => {
    setExplainCtx(ctx);
  }, []);

  const clearExplainContext = useCallback(() => {
    setExplainCtx(null);
  }, []);

  // Explain mode: highlight explainable elements on hover, open chat on click
  useEffect(() => {
    if (!explainMode) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("[data-nb-explain-ignore]") ||
        target.closest("[data-nb-explain-banner]")
      )
        return;
      const explainable = findExplainable(target);
      setHoveredEl(explainable);
    };

    const handleMouseOut = () => {
      setHoveredEl(null);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("[data-nb-explain-ignore]") ||
        target.closest("[data-nb-explain-banner]")
      )
        return;

      e.preventDefault();
      e.stopPropagation();

      const explainable = findExplainable(target);
      if (!explainable) return;

      const attrValue = explainable.getAttribute("data-nb-explain") || "";
      const label =
        attrValue && attrValue !== "true"
          ? attrValue
          : extractLabel(explainable);

      const elementDocs = findExplainDocs(explainable);
      const query = buildQuery(label, explainCtx, elementDocs);
      openChat(query);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exitExplainMode();
      }
    };

    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("mouseout", handleMouseOut, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [explainMode, explainCtx, openChat, exitExplainMode]);

  // Apply/remove highlight on hovered explainable element via CSS class
  useEffect(() => {
    if (!hoveredEl) return;
    hoveredEl.setAttribute("data-nb-explain-highlight", "");
    return () => {
      hoveredEl.removeAttribute("data-nb-explain-highlight");
    };
  }, [hoveredEl]);

  // Force-remove all highlights when leaving explain mode
  useEffect(() => {
    if (!explainMode) {
      document.querySelectorAll("[data-nb-explain-highlight]").forEach((el) => {
        el.removeAttribute("data-nb-explain-highlight");
      });
    }
  }, [explainMode]);

  return (
    <AIAssistantContext.Provider
      value={{
        openChat,
        closeChat,
        isChatOpen,
        explainMode,
        enterExplainMode,
        exitExplainMode,
        setExplainContext,
        clearExplainContext,
      }}
    >
      {/* Inject CSS custom properties, animations, and highlight styles */}
      <style>{S.CSS_VARS + S.ANIMATIONS + S.HIGHLIGHT_STYLES}</style>

      {children}

      {/* Explain mode banner */}
      {explainMode && (
        <div data-nb-explain-banner style={S.banner}>
          <span>Click on a highlighted element to explain it</span>
          <button
            onClick={() => exitExplainMode()}
            style={S.bannerCancel}
          >
            Cancel
          </button>
        </div>
      )}

      <AIFloatingButton
        isOpen={isChatOpen}
        onClick={() => {
          if (isChatOpen) {
            closeChat();
          } else {
            openChat();
          }
        }}
      />

      <AIChatBot
        open={isChatOpen}
        onClose={closeChat}
        initialQuery={initialQuery}
        endpoint={endpoint}
        apiKey={apiKey}
      />
    </AIAssistantContext.Provider>
  );
}
