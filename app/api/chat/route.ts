import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { embedText, searchEmbeddings } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory rate limiter — 10 requests per hour, 30 per day per user
// Safe for single-instance deployments (maxScale: 1)
const rateLimitMap = new Map<string, {
  hourCount: number; hourResetAt: number;
  dayCount: number; dayResetAt: number;
}>();
const HOURLY_LIMIT = 10;
const DAILY_LIMIT = 30;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function checkRateLimit(userId: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  const hourCount = entry && now < entry.hourResetAt ? entry.hourCount : 0;
  const hourResetAt = entry && now < entry.hourResetAt ? entry.hourResetAt : now + HOUR_MS;
  const dayCount = entry && now < entry.dayResetAt ? entry.dayCount : 0;
  const dayResetAt = entry && now < entry.dayResetAt ? entry.dayResetAt : now + DAY_MS;

  if (hourCount >= HOURLY_LIMIT) {
    return { allowed: false, retryAfterSecs: Math.ceil((hourResetAt - now) / 1000) };
  }
  if (dayCount >= DAILY_LIMIT) {
    return { allowed: false, retryAfterSecs: Math.ceil((dayResetAt - now) / 1000) };
  }

  rateLimitMap.set(userId, {
    hourCount: hourCount + 1, hourResetAt,
    dayCount: dayCount + 1, dayResetAt,
  });
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
          : `Knowledge Base${typeof meta?.title === "string" && meta.title ? ` — ${meta.title}` : ""}`;
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

        await claudeStream.finalMessage();

        // Send source citations — only user-owned records with internal links
        const sources = chunks
          .filter((c) => (c.sourceType === "recipe" || c.sourceType === "journal_entry") && c.sourceId)
          .map((c) => {
            const meta = c.metadata as Record<string, unknown> | null;
            const rawTitle = meta?.title;
            const rawDate = meta?.date;
            const label =
              c.sourceType === "recipe"
                ? (typeof rawTitle === "string" && rawTitle ? rawTitle : "Recipe")
                : `Journal — ${typeof rawDate === "string" ? rawDate.split("T")[0] : ""}`;
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
