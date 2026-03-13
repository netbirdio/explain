# netbird-explain

AI-powered "Explain" assistant for React apps. Users click on UI elements and get contextual AI explanations via a chat panel.

The package has two entry points:

- `netbird-explain/client` — React components (provider, chat panel, floating button)
- `netbird-explain/server` — Node.js handler that proxies requests to Anthropic or OpenAI

No CSS framework required — the package is fully self-contained with inline styles and CSS custom properties.

## Installation

```bash
npm install netbird-explain
```

Peer dependencies: `react >=18`, `react-dom >=18`.

For local development as a workspace package, add it to your `package.json`:

```json
{
  "dependencies": {
    "netbird-explain": "file:./packages/netbird-explain"
  }
}
```

If you're using Next.js, add to `next.config.js`:

```js
module.exports = {
  transpilePackages: ["netbird-explain"],
};
```

---

## Client

### Setup

Wrap your app with `AIAssistantProvider`:

```tsx
import { AIAssistantProvider } from "netbird-explain/client";

export default function App({ children }) {
  return (
    <AIAssistantProvider
      endpoint="http://localhost:3080/api/ai/chat"
      apiKey="your-api-key"
    >
      {children}
    </AIAssistantProvider>
  );
}
```

This renders the floating action button and chat panel automatically. No CSS imports are needed — the provider injects all required styles via CSS custom properties.

### Props

| Prop       | Type        | Required | Description                         |
| ---------- | ----------- | -------- | ----------------------------------- |
| `endpoint` | `string`    | Yes      | URL of the AI chat API              |
| `apiKey`   | `string`    | No       | Bearer token sent with each request |
| `children` | `ReactNode` | Yes      | Your application                    |

### Marking elements as explainable

Add the `data-nb-explain` attribute to any element you want users to be able to click on in explain mode:

```tsx
<div data-nb-explain>
  <Label>Name</Label>
  <Input value={name} onChange={setName} />
</div>
```

When clicked, the library extracts a label from the element (first `<label>`, heading, or text content) and sends it as the query.

You can also pass a custom label directly:

```tsx
<div data-nb-explain="Database connection string">...</div>
```

### Documentation URLs

Attach docs to an element or its parent so the AI can reference them:

```tsx
<div data-nb-explain-docs='["https://docs.example.com/resources"]'>
  <div data-nb-explain>...</div>
</div>
```

### Excluding elements

Use `data-nb-explain-ignore` to prevent an element from being selectable in explain mode:

```tsx
<button data-nb-explain-ignore onClick={enterExplainMode}>
  Explain
</button>
```

### Setting page/modal context

Use the `useAIAssistant` hook to provide context that gets included in every query:

```tsx
import { useAIAssistant } from "netbird-explain/client";

function MyModal() {
  const { setExplainContext, clearExplainContext } = useAIAssistant();

  useEffect(() => {
    setExplainContext({
      modalName: "Add Resource",
      pageName: "Networks",
      docsUrls: ["https://docs.example.com/networks"],
    });
    return () => clearExplainContext();
  }, []);

  return <div data-nb-explain>...</div>;
}
```

This produces queries like: `Explain "Name" on Add Resource modal in Networks`.

### Hook API

`useAIAssistant()` returns:

| Method / Property        | Description                                |
| ------------------------ | ------------------------------------------ |
| `openChat(query?)`       | Open the chat panel, optionally with a query |
| `closeChat()`            | Close the chat panel                       |
| `isChatOpen`             | Whether the chat panel is open             |
| `explainMode`            | Whether explain mode is active             |
| `enterExplainMode()`     | Activate explain mode (click-to-explain)   |
| `exitExplainMode()`      | Deactivate explain mode                    |
| `setExplainContext(ctx)` | Set page/modal context for queries         |
| `clearExplainContext()`  | Clear the context                          |

### Theming

The package ships with a dark theme out of the box. All visual properties are controlled via CSS custom properties (`--nb-explain-*`) injected into `:root` by the provider. Override any of them in your own CSS to match your app's look and feel.

#### How it works

1. `AIAssistantProvider` injects a `<style>` tag with default values for all `--nb-explain-*` variables.
2. Components use inline styles that reference these variables (e.g., `background: var(--nb-explain-bg)`).
3. Your CSS can override any variable — later declarations on `:root` or more specific selectors win.

#### Overriding in CSS

Add a stylesheet or `<style>` block **after** the provider mounts (or use higher specificity):

```css
:root {
  /* Change to a light theme */
  --nb-explain-bg: #ffffff;
  --nb-explain-bg-subtle: rgba(0, 0, 0, 0.04);
  --nb-explain-bg-hover: rgba(0, 0, 0, 0.06);
  --nb-explain-border: rgba(0, 0, 0, 0.12);
  --nb-explain-text: #1a1a1a;
  --nb-explain-text-muted: #6b7280;
  --nb-explain-text-dim: #9ca3af;
  --nb-explain-accent: #2563eb;
  --nb-explain-accent-hover: #3b82f6;
  --nb-explain-user-bg: #2563eb;
  --nb-explain-user-text: #ffffff;
}
```

#### Full variable reference

| Variable              | Default                          | Description                        |
| --------------------- | -------------------------------- | ---------------------------------- |
| `--nb-explain-bg`             | `#0a0a0f`                        | Chat panel background              |
| `--nb-explain-bg-subtle`      | `rgba(255,255,255,0.06)`         | Input field & assistant message bg |
| `--nb-explain-bg-hover`       | `rgba(255,255,255,0.08)`         | Hover state background             |
| `--nb-explain-border`         | `rgba(255,255,255,0.1)`          | Border color                       |
| `--nb-explain-text`           | `#f0f0f5`                        | Primary text color                 |
| `--nb-explain-text-muted`     | `#9ca3af`                        | Secondary text color               |
| `--nb-explain-text-dim`       | `#6b7280`                        | Placeholder / tertiary text        |
| `--nb-explain-accent`         | `#eab308`                        | Accent color (buttons, icons)      |
| `--nb-explain-accent-hover`   | `#facc15`                        | Accent hover state                 |
| `--nb-explain-accent-glow`    | `rgba(234,179,8,0.15)`           | Accent glow (avatar backgrounds)   |
| `--nb-explain-user-bg`        | `#4f46e5`                        | User message bubble background     |
| `--nb-explain-user-text`      | `#ffffff`                        | User message text color            |
| `--nb-explain-user-glow`      | `rgba(79,70,229,0.25)`           | User avatar glow                   |
| `--nb-explain-radius`         | `12px`                           | Panel border radius                |
| `--nb-explain-radius-sm`      | `8px`                            | Message bubble border radius       |
| `--nb-explain-radius-xs`      | `6px`                            | Button border radius               |
| `--nb-explain-font`           | system font stack                | Font family for all components     |
| `--nb-explain-shadow`         | large drop shadow                | Chat panel box shadow              |
| `--nb-explain-banner-bg`      | `rgba(234,179,8,0.92)`           | Explain mode banner background     |
| `--nb-explain-banner-text`    | `#000000`                        | Explain mode banner text           |
| `--nb-explain-error-text`     | `#f87171`                        | Error message text                 |

### Data attributes

| Attribute            | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `data-nb-explain`       | Marks element as explainable. Value can be a custom label or boolean. |
| `data-nb-explain-docs`  | JSON array of documentation URLs for context.                      |
| `data-nb-explain-ignore` | Element is non-interactive during explain mode.                   |

---

## Server

The server module provides a framework-agnostic handler that proxies chat requests to Anthropic or OpenAI.

### With Express

```ts
import express from "express";
import { createAssistant } from "netbird-explain/server";

const assistant = createAssistant({
  provider: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-sonnet-4-20250514",
  systemPrompt: "You are a helpful assistant for MyApp.",
});

const app = express();
app.use(express.json());

app.post("/api/ai/chat", assistant.handler({ apiKey: "your-api-key" }));

app.listen(3080);
```

### With plain Node.js HTTP

```ts
import http from "http";
import { createAssistant } from "netbird-explain/server";

const assistant = createAssistant({
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
});

const handle = assistant.handler({ apiKey: "your-api-key" });

http.createServer(handle).listen(3080);
```

### Programmatic usage (no HTTP)

```ts
const assistant = createAssistant({
  provider: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const { reply } = await assistant.chat({
  messages: [{ role: "user", content: "What is a network resource?" }],
});
```

### `createAssistant(config)`

| Option         | Type                          | Required | Default                  |
| -------------- | ----------------------------- | -------- | ------------------------ |
| `provider`     | `"anthropic"` \| `"openai"`  | Yes      | —                        |
| `apiKey`       | `string`                      | Yes      | —                        |
| `model`        | `string`                      | No       | Provider default         |
| `systemPrompt` | `string`                      | No       | Generic assistant prompt |

### `assistant.handler(opts?)`

Returns a `(req, res) => Promise<void>` handler compatible with Express, plain `http`, and similar frameworks.

| Option   | Type     | Description                                                    |
| -------- | -------- | -------------------------------------------------------------- |
| `apiKey` | `string` | If set, requires `Authorization: Bearer <key>` on requests     |

### API contract

**Request** `POST /api/ai/chat`

```json
{
  "messages": [
    { "role": "context", "content": "Docs: https://..." },
    { "role": "user", "content": "Explain network routes" }
  ]
}
```

**Response**

```json
{
  "reply": "Network routes allow you to..."
}
```

**Error codes:** `400` (bad request), `401` (unauthorized), `502` (LLM error).

---

## Standalone dev server

The `server/` directory in the dashboard repo contains a ready-to-run Express server for local development.

```bash
cd server
cp .env .env.local   # edit with your LLM API key
npm install
node index.js
```

Environment variables:

| Variable            | Default                    | Description            |
| ------------------- | -------------------------- | ---------------------- |
| `PORT`              | `3080`                     | Server port            |
| `API_KEY`           | `nb-ai-dev-key-change-me`  | Bearer token for auth  |
| `LLM_PROVIDER`      | `anthropic`                | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY`  | —                          | Anthropic API key      |
| `ANTHROPIC_MODEL`   | `claude-sonnet-4-20250514` | Model ID               |
| `OPENAI_API_KEY`     | —                          | OpenAI API key         |
| `OPENAI_MODEL`      | `gpt-4o`                   | Model ID               |
| `SYSTEM_PROMPT`     | Generic NetBird prompt      | System prompt for the LLM |

---

## Full integration example

```tsx
// layout.tsx — wrap app with provider
import { AIAssistantProvider } from "netbird-explain/client";

export default function Layout({ children }) {
  return (
    <AIAssistantProvider
      endpoint={process.env.NEXT_PUBLIC_AI_SERVER_URL || "http://localhost:3080/api/ai/chat"}
      apiKey={process.env.NEXT_PUBLIC_AI_API_KEY || "nb-ai-dev-key-change-me"}
    >
      {children}
    </AIAssistantProvider>
  );
}
```

```tsx
// MyModal.tsx — add explain support to a modal
import { useAIAssistant } from "netbird-explain/client";
import { Sparkles } from "lucide-react";

function MyModal() {
  const { setExplainContext, clearExplainContext, explainMode, enterExplainMode, exitExplainMode } =
    useAIAssistant();

  useEffect(() => {
    setExplainContext({
      modalName: "Add Resource",
      pageName: "Networks",
      docsUrls: ["https://docs.netbird.io/manage/networks"],
    });
    return () => clearExplainContext();
  }, []);

  return (
    <div data-nb-explain>
      <button
        data-nb-explain-ignore
        onClick={() => (explainMode ? exitExplainMode() : enterExplainMode())}
      >
        <Sparkles size={13} />
        {explainMode ? "Click an element..." : "Explain"}
      </button>

      <div data-nb-explain>
        <label>Name</label>
        <input placeholder="e.g., Postgres Database" />
      </div>

      <div data-nb-explain>
        <label>Address</label>
        <input placeholder="e.g., 10.0.0.1" />
      </div>
    </div>
  );
}
```

## License

BSD-3-Clause