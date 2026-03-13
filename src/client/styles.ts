/**
 * All styles for netbird-explain components.
 * Uses inline styles + CSS custom properties so the package
 * works without any external CSS framework.
 *
 * Consumers can override via CSS custom properties:
 *   --nb-explain-bg:          panel background
 *   --nb-explain-bg-subtle:   input/message background
 *   --nb-explain-border:      border color
 *   --nb-explain-text:        primary text
 *   --nb-explain-text-muted:  secondary text
 *   --nb-explain-text-dim:    tertiary/placeholder text
 *   --nb-explain-accent:      accent color (yellow)
 *   --nb-explain-accent-hover: accent hover
 *   --nb-explain-user-bg:     user message background
 *   --nb-explain-user-text:   user message text
 *   --nb-explain-radius:      border radius
 *   --nb-explain-font:        font family
 */

export const CSS_VARS = `
  :root {
    --nb-explain-bg: #0a0a0f;
    --nb-explain-bg-subtle: rgba(255,255,255,0.06);
    --nb-explain-bg-hover: rgba(255,255,255,0.08);
    --nb-explain-border: rgba(255,255,255,0.1);
    --nb-explain-text: #f0f0f5;
    --nb-explain-text-muted: #9ca3af;
    --nb-explain-text-dim: #6b7280;
    --nb-explain-accent: #eab308;
    --nb-explain-accent-hover: #facc15;
    --nb-explain-accent-glow: rgba(234,179,8,0.15);
    --nb-explain-user-bg: #4f46e5;
    --nb-explain-user-text: #ffffff;
    --nb-explain-user-glow: rgba(79,70,229,0.25);
    --nb-explain-radius: 12px;
    --nb-explain-radius-sm: 8px;
    --nb-explain-radius-xs: 6px;
    --nb-explain-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --nb-explain-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
    --nb-explain-banner-bg: rgba(234,179,8,0.92);
    --nb-explain-banner-text: #000000;
    --nb-explain-error-text: #f87171;
  }
`;

// --- Chat Panel ---

export const chatPanel: React.CSSProperties = {
  position: "fixed",
  bottom: 80,
  right: 20,
  zIndex: 9998,
  width: 420,
  height: 600,
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--nb-explain-radius)",
  border: "1px solid var(--nb-explain-border)",
  background: "var(--nb-explain-bg)",
  boxShadow: "var(--nb-explain-shadow)",
  fontFamily: "var(--nb-explain-font)",
  overflow: "hidden",
  animation: "nb-explain-slide-up 0.2s ease-out",
};

export const chatHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid var(--nb-explain-border)",
};

export const chatHeaderLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

export const chatHeaderIcon: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "var(--nb-explain-radius-sm)",
  background: "var(--nb-explain-accent-glow)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const chatHeaderTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--nb-explain-text)",
  lineHeight: 1,
  margin: 0,
};

export const chatHeaderSubtitle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--nb-explain-text-dim)",
};

export const chatCloseBtn: React.CSSProperties = {
  padding: 6,
  borderRadius: "var(--nb-explain-radius-xs)",
  color: "var(--nb-explain-text-dim)",
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "color 0.15s, background 0.15s",
};

// --- Messages ---

export const messagesArea: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

export const emptyState: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  textAlign: "center",
  gap: 12,
  opacity: 0.5,
};

export const emptyStateTitle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--nb-explain-text-muted)",
  fontWeight: 500,
  margin: 0,
};

export const emptyStateHint: React.CSSProperties = {
  fontSize: 12,
  color: "var(--nb-explain-text-dim)",
  marginTop: 4,
};

// Context badge
export const contextBadge: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
};

export const contextBadgeInner: React.CSSProperties = {
  fontSize: 11,
  color: "var(--nb-explain-text-dim)",
  background: "var(--nb-explain-bg-subtle)",
  borderRadius: 20,
  padding: "4px 12px",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// Message row
export const messageRow = (isUser: boolean): React.CSSProperties => ({
  display: "flex",
  gap: 10,
  justifyContent: isUser ? "flex-end" : "flex-start",
});

export const messageAvatar = (isUser: boolean): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: "var(--nb-explain-radius-xs)",
  background: isUser ? "var(--nb-explain-user-glow)" : "var(--nb-explain-accent-glow)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
});

export const messageBubble = (isUser: boolean): React.CSSProperties => ({
  maxWidth: "85%",
  borderRadius: "var(--nb-explain-radius-sm)",
  padding: "8px 12px",
  fontSize: 14,
  lineHeight: 1.6,
  background: isUser ? "var(--nb-explain-user-bg)" : "var(--nb-explain-bg-subtle)",
  color: isUser ? "var(--nb-explain-user-text)" : "var(--nb-explain-text)",
  wordBreak: "break-word",
});

export const messageBold: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--nb-explain-text)",
};

// Typing indicator
export const typingRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

export const typingBubble: React.CSSProperties = {
  background: "var(--nb-explain-bg-subtle)",
  borderRadius: "var(--nb-explain-radius-sm)",
  padding: "12px 16px",
  display: "flex",
  gap: 6,
};

export const typingDot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "var(--nb-explain-text-dim)",
};

// --- Input area ---

export const inputArea: React.CSSProperties = {
  padding: "12px 16px",
  borderTop: "1px solid var(--nb-explain-border)",
};

export const inputRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "var(--nb-explain-bg-subtle)",
  borderRadius: "var(--nb-explain-radius-sm)",
  padding: "8px 12px",
};

export const inputField: React.CSSProperties = {
  flex: 1,
  background: "none",
  border: "none",
  outline: "none",
  fontSize: 14,
  color: "var(--nb-explain-text)",
  fontFamily: "var(--nb-explain-font)",
};

export const sendBtn = (active: boolean): React.CSSProperties => ({
  padding: 6,
  borderRadius: "var(--nb-explain-radius-xs)",
  background: "none",
  border: "none",
  cursor: active ? "pointer" : "not-allowed",
  color: active ? "var(--nb-explain-accent)" : "var(--nb-explain-text-dim)",
  display: "flex",
  alignItems: "center",
  transition: "color 0.15s",
  opacity: active ? 1 : 0.5,
});

export const inputFooter: React.CSSProperties = {
  fontSize: 10,
  color: "var(--nb-explain-text-dim)",
  textAlign: "center",
  marginTop: 6,
};

// --- Floating button ---

export const fab = (isOpen: boolean): React.CSSProperties => ({
  position: "fixed",
  bottom: 20,
  right: 20,
  zIndex: 9997,
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  background: isOpen
    ? "var(--nb-explain-bg-hover)"
    : "linear-gradient(135deg, var(--nb-explain-accent), #f97316)",
  color: isOpen ? "var(--nb-explain-text-muted)" : "#fff",
});

// --- Banner ---

export const banner: React.CSSProperties = {
  position: "fixed",
  top: 12,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 9996,
  background: "var(--nb-explain-banner-bg)",
  color: "var(--nb-explain-banner-text)",
  fontSize: 14,
  fontWeight: 500,
  padding: "6px 16px",
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(234,179,8,0.3)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "var(--nb-explain-font)",
  animation: "nb-explain-fade-in 0.2s ease-out",
};

export const bannerCancel: React.CSSProperties = {
  marginLeft: 4,
  color: "rgba(0,0,0,0.5)",
  background: "none",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: 12,
  fontFamily: "var(--nb-explain-font)",
};

// --- Animations (injected as <style>) ---

export const ANIMATIONS = `
  @keyframes nb-explain-slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nb-explain-fade-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes nb-explain-bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-4px); }
  }
  .nb-explain-dot-1 { animation: nb-explain-bounce 1.2s infinite; animation-delay: 0ms; }
  .nb-explain-dot-2 { animation: nb-explain-bounce 1.2s infinite; animation-delay: 150ms; }
  .nb-explain-dot-3 { animation: nb-explain-bounce 1.2s infinite; animation-delay: 300ms; }
`;

export const HIGHLIGHT_STYLES = `
  [data-nb-explain-highlight] {
    outline: 2px solid rgba(234, 179, 8, 0.7) !important;
    border-radius: 6px;
    cursor: help !important;
    transition: outline 0.1s ease;
  }
`;