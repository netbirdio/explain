export type Message = {
  id?: string;
  role: "user" | "assistant" | "context" | "system";
  content: string;
};

export type ExplainContext = {
  modalName?: string;
  pageName?: string;
  docsUrls?: string[];
};

export type ExplainEvent = {
  label: string;
  query: string;
  context: ExplainContext | null;
  docs: string[];
  element: HTMLElement;
};