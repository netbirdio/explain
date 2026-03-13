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