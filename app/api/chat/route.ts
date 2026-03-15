import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { embedText, searchEmbeddings } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a sourdough baking assistant for Flourish, a sourdough companion app. \
You help users understand and improve their baking using their personal journal entries, recipes, \
and a curated sourdough knowledge base.

Guidelines:
- Reference specific journal entries or recipes when they are relevant
- Give practical, actionable advice
- Keep answers concise but thorough
- If the provided context doesn't contain enough to answer confidently, say so
- Stay focused on sourdough and bread baking topics`;

function buildContext(
  chunks: { content: string; sourceType: string; metadata: unknown }[]
): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((chunk) => {
      const meta = chunk.metadata as Record<string, unknown> | null;
      const label =
        chunk.sourceType === "journal_entry"
          ? "Your Journal"
          : chunk.sourceType === "recipe"
          ? "Your Recipe"
          : `Knowledge Base${meta?.title ? ` — ${meta.title}` : ""}`;
      return `[${label}]\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { message, history: rawHistory = [] } = await request.json();
  // Keep last 10 messages to prevent context bloat
  const history = rawHistory.slice(-10);
  if (!message?.trim()) {
    return new Response("Message required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send ping immediately so the proxy sees a response before we do any async work
      try {
        controller.enqueue(encoder.encode(": ping\n\n"));
      } catch {
        return;
      }

      try {
        const queryVector = await embedText(message);
        const chunks = await searchEmbeddings(queryVector, session.userId);
        const context = buildContext(chunks);

        const userMessage = context
          ? `Context from your baking data and knowledge base:\n\n${context}\n\n---\n\nQuestion: ${message}`
          : message;

        const claudeStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: "user", content: userMessage }],
        });

        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event.delta.text)}\n\n`));
          }
        }

        const final = await claudeStream.finalMessage();
        console.log(`Chat stream complete — stop_reason: ${final.stop_reason}, tokens: ${final.usage.output_tokens}`);
      } catch (err) {
        console.error("Chat stream error:", err);
      } finally {
        try {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          // Controller already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
