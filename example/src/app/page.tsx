"use client";

import {
  AIAssistantProvider,
  useAIAssistant,
} from "@netbirdio/explain/client";

function DemoContent() {
  const { enterExplainMode, setExplainContext } = useAIAssistant();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>NetBird Explain — Example</h1>
      <p style={{ color: "#9ca3af", marginBottom: 32 }}>
        Click the floating button in the bottom-right to open the AI chat, or
        use the Explain Mode button below to click on any highlighted element.
      </p>

      <button
        onClick={() => {
          setExplainContext({ pageName: "Example Page" });
          enterExplainMode();
        }}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.06)",
          color: "#f0f0f5",
          cursor: "pointer",
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        Enter Explain Mode
      </button>

      {/* Example cards with data-nb-explain annotations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card
          title="Peers"
          description="Devices connected to your NetBird network."
          explain="Peers — devices registered in the NetBird network that can communicate via WireGuard tunnels"
        />
        <Card
          title="Access Control"
          description="Rules that govern which peers can reach each other."
          explain="Access Control — firewall-like policies defining allowed traffic between peer groups"
        />
        <Card
          title="Routes"
          description="Network routes distributed to peers for subnet access."
          explain="Routes — network routes pushed to peers so they can reach subnets behind a routing peer"
        />
        <Card
          title="DNS Settings"
          description="Custom DNS nameservers and domains for the network."
          explain="DNS — custom nameservers and search domains resolved via the NetBird network"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  explain,
}: {
  title: string;
  description: string;
  explain: string;
}) {
  return (
    <div
      data-nb-explain={explain}
      style={{
        padding: 20,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>{description}</p>
    </div>
  );
}

export default function Page() {
  return (
    <AIAssistantProvider
      endpoint="/api/explain"
      title="NetBird AI"
      subtitle="Ask about your network"
    >
      <DemoContent />
    </AIAssistantProvider>
  );
}