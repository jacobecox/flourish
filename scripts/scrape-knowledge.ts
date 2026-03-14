/**
 * Knowledge base scraper — fetches curated sourdough articles,
 * chunks the text, embeds via Voyage AI, and stores in the vector DB.
 *
 * Run with:
 *   npm run scrape
 *
 * Safe to re-run — existing chunks for each URL are replaced.
 */

import * as cheerio from "cheerio";
import { prismaVector } from "../lib/prismaVector";
import { upsertEmbedding } from "../lib/embeddings";

// ─────────────────────────────────────────────
// Curated sourdough knowledge sources
// Add more URLs here as the knowledge base grows
// ─────────────────────────────────────────────
const SOURCES = [
  // King Arthur Baking
  {
    url: "https://www.kingarthurbaking.com/learn/guides/sourdough/overview",
    title: "King Arthur: Sourdough Overview",
  },
  {
    url: "https://www.kingarthurbaking.com/learn/guides/sourdough/troubleshoot",
    title: "King Arthur: Sourdough Troubleshooting",
  },
  {
    url: "https://www.kingarthurbaking.com/learn/guides/sourdough/maintain",
    title: "King Arthur: Maintaining Your Sourdough Starter",
  },
  // The Perfect Loaf
  {
    url: "https://www.theperfectloaf.com/beginners-sourdough-starter/",
    title: "The Perfect Loaf: Beginner's Sourdough Starter",
  },
  {
    url: "https://www.theperfectloaf.com/troubleshoot-your-sourdough-starter/",
    title: "The Perfect Loaf: Troubleshoot Your Starter",
  },
  {
    url: "https://www.theperfectloaf.com/guides/how-to-make-sourdough-bread/",
    title: "The Perfect Loaf: How to Make Sourdough Bread",
  },
  // Breadtopia
  {
    url: "https://breadtopia.com/make-your-own-sourdough-starter/",
    title: "Breadtopia: Make Your Own Sourdough Starter",
  },
  {
    url: "https://breadtopia.com/sourdough-bread-baking-tips/",
    title: "Breadtopia: Sourdough Baking Tips",
  },
];

const MIN_CHUNK_LENGTH = 120;
const MAX_CHUNK_LENGTH = 1000;
const REQUEST_DELAY_MS = 1500; // be respectful to servers

// ─────────────────────────────────────────────
// Fetch and extract readable text from a URL
// ─────────────────────────────────────────────
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FlourishBot/1.0; sourdough knowledge base)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    "script, style, nav, header, footer, aside, .sidebar, .ads, .comments, form, iframe"
  ).remove();

  // Try to find main content area, fall back to body
  const main =
    $("article, main, [role='main'], .entry-content, .post-content").first();
  const root = main.length ? main : $("body");

  // Extract text from paragraphs and headings
  const chunks: string[] = [];
  root.find("p, h1, h2, h3, h4, li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length >= MIN_CHUNK_LENGTH) {
      chunks.push(text);
    }
  });

  return chunks.join("\n\n");
}

// ─────────────────────────────────────────────
// Split text into embeddable chunks
// ─────────────────────────────────────────────
function chunkText(text: string): string[] {
  const paragraphs = text.split("\n\n").map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_LENGTH) {
      chunks.push(para);
    } else {
      // Split long paragraphs at sentence boundaries
      const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
      let current = "";
      for (const sentence of sentences) {
        if ((current + sentence).length > MAX_CHUNK_LENGTH && current) {
          chunks.push(current.trim());
          current = sentence;
        } else {
          current += sentence;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }

  return chunks.filter((c) => c.length >= MIN_CHUNK_LENGTH);
}

// ─────────────────────────────────────────────
// Sleep helper for rate limiting
// ─────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  for (const source of SOURCES) {
    console.log(`\nScraping: ${source.title}`);
    console.log(`  URL: ${source.url}`);

    try {
      const text = await fetchText(source.url);
      const chunks = chunkText(text);
      console.log(`  Found ${chunks.length} chunks`);

      // Delete all existing knowledge chunks for this URL before reinserting
      await prismaVector.$executeRawUnsafe(
        `DELETE FROM "Embedding" WHERE "sourceType" = 'knowledge' AND metadata->>'url' = $1`,
        source.url
      );

      for (let i = 0; i < chunks.length; i++) {
        await upsertEmbedding({
          sourceType: "knowledge",
          content: chunks[i],
          metadata: { url: source.url, title: source.title, chunkIndex: i },
        });
        process.stdout.write(`  ✓ chunk ${i + 1}/${chunks.length}\r`);
      }
      console.log(`  ✓ ${chunks.length} chunks embedded`);
    } catch (err) {
      console.error(`  ✗ Failed: ${(err as Error).message}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log("\nDone!");
  await prismaVector.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
