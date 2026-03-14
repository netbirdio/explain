import { NextRequest, NextResponse } from "next/server";

/**
 * Mock AI endpoint that returns canned responses.
 * Replace this with a real createAssistant() handler for production use.
 */
export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const last = messages?.[messages.length - 1]?.content ?? "";

  // Simulate a short delay
  await new Promise((r) => setTimeout(r, 600));

  const reply = `This is a demo response to: "${last}"\n\n`
    + `In a real setup you would configure **createAssistant()** from \`@netbirdio/explain/server\` `
    + `with your Anthropic or OpenAI API key to get actual AI responses.`;

  return NextResponse.json({ reply });
}