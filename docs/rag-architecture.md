# Flourish — RAG + Chat Implementation

## Services & Technologies

| Component | Technology | Purpose |
|---|---|---|
| Embedding model | Voyage AI `voyage-3` | Converts text → 1024-dimensional vectors |
| Vector database | PostgreSQL + pgvector | Stores and searches embeddings via cosine distance |
| Vector DB client | Prisma (separate schema) | `lib/generated/prisma-vector` — isolated from app DB |
| LLM | Anthropic `claude-sonnet-4-6` | Generates chat responses |
| Streaming | Server-Sent Events (SSE) | Streams tokens from server → browser at 60fps via RAF |

---

## Data Sources in the Vector DB

Three types of content are embedded and stored, identified by `sourceType`:

| `sourceType` | What it contains | When it's written |
|---|---|---|
| `journal_entry` | Date, notes, rating, hydration %, flour type, bulk/proof times, bake temp, linked recipe name | On create/update of a journal entry (server action) |
| `recipe` | Title, description, ingredients, instructions, servings, prep/cook times | On create/update of a recipe (server action) |
| `knowledge` | Chunked text scraped from sourdough baking websites | One-time via `npm run scrape`, re-runnable safely |

---

## Embedding Pipeline

**Writing embeddings** — triggered automatically by server actions in `lib/actions/journal.ts` and `lib/actions/recipes.ts`:

```
User saves journal entry or recipe
  → serialize to plain text (journalEntryToText / recipeToText)
  → await upsertEmbedding()
      → DELETE existing row for that sourceId
      → POST text to Voyage AI /v1/embeddings
      → INSERT new row (id, sourceType, sourceId, userId, content, vector, metadata)
  → redirect to page
```

> The `await` before `redirect()` is critical — Next.js's `redirect()` throws internally,
> which would abandon any unawaited promises.

**Backfill** — existing data can be re-indexed anytime:

```
npm run ingest   → embeds all existing journal entries + recipes
npm run scrape   → scrapes knowledge base URLs, chunks by paragraph, embeds each chunk
```

---

## Chat Request Flow

Every message through `/api/chat` follows this sequence:

```
1. Browser sends POST /api/chat
      { message: "...", history: [...last 10 messages] }

2. Server validates session

3. SSE stream opens immediately
      → sends ": ping\n\n" comment (keeps proxy alive while async work runs)

4. Embed the user's question
      → POST to Voyage AI → 1024-dim query vector

5. Split vector search (parallel)
      Query A: top 4 chunks WHERE userId = current user
               (journal entries + recipes, sorted by cosine distance)
      Query B: top 3 chunks WHERE sourceType = 'knowledge'
               (scraped sourdough knowledge base)
      → combined: up to 7 context chunks

6. Build context string
      Each chunk is labelled:
        [Your Journal], [Your Recipe], or [Knowledge Base — {title}]

7. Construct Claude message
      "Context from your baking data...\n\n{context}\n\n---\n\nQuestion: {message}"

8. Stream Claude response
      → anthropic.messages.stream() with system prompt + conversation history
      → each text_delta event → SSE data frame → browser

9. Browser receives SSE frames
      → buffers text in bufferRef
      → flushes to React state at 60fps via requestAnimationFrame
      → renders with react-markdown + remark-gfm (tables, bold, lists, code)
```

---

## Split Search — Why It Matters

A single combined query would almost always return knowledge base chunks (there are 94 of them vs. a handful of user records). The split ensures the user's own recipes and journal entries **always appear in context**, regardless of how semantically similar the knowledge base is to the question.

```
Single query (old):  top 6 → [KB, KB, KB, KB, KB, recipe]  ← user data crowded out
Split query (new):   top 4 user + top 3 KB → [journal, recipe, recipe, journal, KB, KB, KB]
```

---

## Key Files

| File | Role |
|---|---|
| `lib/embeddings.ts` | `embedText`, `upsertEmbedding`, `deleteEmbedding`, `searchEmbeddings`, text serializers |
| `lib/prismaVector.ts` | Separate Prisma client pointed at the vector database |
| `prisma/vector.prisma` | Schema with `Embedding` model using `Unsupported("vector(1024)")` |
| `app/api/chat/route.ts` | SSE streaming endpoint — embeds query, retrieves context, streams Claude |
| `components/ChatInterface.tsx` | Chat UI — SSE reader, RAF-batched rendering, markdown display |
| `lib/actions/journal.ts` | Calls `upsertEmbedding` / `deleteEmbedding` on journal CRUD |
| `lib/actions/recipes.ts` | Calls `upsertEmbedding` / `deleteEmbedding` on recipe CRUD |
| `scripts/ingest.ts` | Backfill script for existing user data |
| `scripts/scrape-knowledge.ts` | One-time knowledge base scraper |
