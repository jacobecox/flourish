import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { embedText, searchEmbeddings } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory rate limiter — 20 requests per user per hour
// Safe for single-instance deployments (maxScale: 1)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfterSecs: 0 };
}

const SYSTEM_PROMPT = `You are a sourdough baking assistant built into Flourish, a personal sourdough companion app. \
You help users understand and improve their baking by drawing on their own recipes, journal entries, and a curated sourdough knowledge base.

When context is provided:
- Refer to the user's recipes and journal entries by name (e.g. "your Beginners Sourdough Bread recipe" or "your March 2nd bake")
- Only cite measurements, times, or temperatures that appear in the provided context — never invent or assume values not given
- If multiple journal entries or recipes are relevant, compare them directly

When answering:
- Lead with the practical answer, then explain the reasoning
- Keep responses focused and scannable — use headers or lists when there are multiple points
- If the context doesn't contain enough to answer confidently, say so clearly rather than guessing
- Decline questions unrelated to sourdough or bread baking`;

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

  const { allowed, retryAfterSecs } = checkRateLimit(session.userId);
  if (!allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfterSecs) },
    });
  }

  const { message, history: rawHistory = [] } = await request.json();
  // Keep last 10 messages to prevent context bloat
  const history = rawHistory.slice(-10);
  if (!message?.trim()) {
    return new Response("Message required", { status: 400 });
  }
  if (message.length > 2000) {
    return new Response("Message too long", { status: 400 });
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

        // Send source citations — only user-owned records with internal links
        const sources = chunks
          .filter((c) => (c.sourceType === "recipe" || c.sourceType === "journal_entry") && c.sourceId)
          .map((c) => {
            const meta = c.metadata as Record<string, unknown> | null;
            const label =
              c.sourceType === "recipe"
                ? String(meta?.title ?? "Recipe")
                : `Journal — ${String(meta?.date ?? "").split("T")[0]}`;
            const href =
              c.sourceType === "recipe"
                ? `/recipes/${c.sourceId}`
                : `/journal/${c.sourceId}`;
            return { label, href };
          })
          // Deduplicate by href
          .filter((s, i, arr) => arr.findIndex((x) => x.href === s.href) === i);

        if (sources.length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "sources", items: sources })}\n\n`));
        }
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
