/**
 * One-time ingestion script — embeds all existing journal entries and recipes.
 * Run with:
 *   node --env-file=.env --import tsx/esm scripts/ingest.ts
 * Or via npm script:
 *   npm run ingest
 */

import { PrismaClient } from "../lib/generated/prisma/client";
import {
  upsertEmbedding,
  journalEntryToText,
  recipeToText,
} from "../lib/embeddings";

const flourish = new PrismaClient();

async function main() {
  console.log("── Journal Entries ──────────────────────────");
  const entries = await flourish.journalEntry.findMany({
    include: { recipe: { select: { title: true } } },
  });
  console.log(`Found ${entries.length} entries`);

  for (const entry of entries) {
    await upsertEmbedding({
      sourceType: "journal_entry",
      sourceId: entry.id,
      userId: entry.userId,
      content: journalEntryToText(entry),
      metadata: { date: entry.date, rating: entry.rating },
    });
    console.log(`  ✓ ${entry.id}`);
  }

  console.log("\n── Recipes ──────────────────────────────────");
  const recipes = await flourish.recipe.findMany();
  console.log(`Found ${recipes.length} recipes`);

  for (const recipe of recipes) {
    await upsertEmbedding({
      sourceType: "recipe",
      sourceId: recipe.id,
      userId: recipe.userId,
      content: recipeToText(recipe),
      metadata: { title: recipe.title },
    });
    console.log(`  ✓ ${recipe.title}`);
  }

  console.log("\nDone!");
  await flourish.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
