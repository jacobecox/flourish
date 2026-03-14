import { prismaVector } from "./prismaVector";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";

export type SourceType = "journal_entry" | "recipe" | "knowledge";

// ─────────────────────────────────────────────
// Voyage AI — embed a single text string
// ─────────────────────────────────────────────
export async function embedText(text: string): Promise<number[]> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ model: VOYAGE_MODEL, input: [text] }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

// ─────────────────────────────────────────────
// Upsert an embedding in the vector DB
// Deletes the existing row for sourceId (if any) then inserts fresh
// ─────────────────────────────────────────────
export async function upsertEmbedding({
  sourceType,
  sourceId,
  userId,
  content,
  metadata,
}: {
  sourceType: SourceType;
  sourceId?: string;
  userId?: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const vector = await embedText(content);
  const vectorStr = `[${vector.join(",")}]`;
  const id = crypto.randomUUID();

  if (sourceId) {
    await prismaVector.$executeRawUnsafe(
      `DELETE FROM "Embedding" WHERE "sourceType" = $1 AND "sourceId" = $2`,
      sourceType,
      sourceId
    );
  }

  await prismaVector.$executeRawUnsafe(
    `INSERT INTO "Embedding" (id, "sourceType", "sourceId", "userId", content, embedding, metadata, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::vector, $7::jsonb, NOW(), NOW())`,
    id,
    sourceType,
    sourceId ?? null,
    userId ?? null,
    content,
    vectorStr,
    metadata ? JSON.stringify(metadata) : null
  );
}

// ─────────────────────────────────────────────
// Delete all embeddings for a given source
// ─────────────────────────────────────────────
export async function deleteEmbedding(
  sourceType: SourceType,
  sourceId: string
): Promise<void> {
  await prismaVector.$executeRawUnsafe(
    `DELETE FROM "Embedding" WHERE "sourceType" = $1 AND "sourceId" = $2`,
    sourceType,
    sourceId
  );
}

// ─────────────────────────────────────────────
// Text serializers — convert app data to embeddable text
// ─────────────────────────────────────────────
export function journalEntryToText(entry: {
  date: Date;
  notes?: string | null;
  rating?: number | null;
  hydration?: number | null;
  flourType?: string | null;
  bulkTime?: number | null;
  proofTime?: number | null;
  bakeTemp?: number | null;
  recipe?: { title: string } | null;
}): string {
  return [
    `Journal Entry — ${entry.date.toISOString().split("T")[0]}`,
    entry.notes && `Notes: ${entry.notes}`,
    entry.rating && `Rating: ${entry.rating}/5`,
    entry.hydration && `Hydration: ${entry.hydration}%`,
    entry.flourType && `Flour type: ${entry.flourType}`,
    entry.bulkTime && `Bulk fermentation: ${entry.bulkTime} minutes`,
    entry.proofTime && `Final proof: ${entry.proofTime} minutes`,
    entry.bakeTemp && `Bake temperature: ${entry.bakeTemp}°F`,
    entry.recipe && `Recipe: ${entry.recipe.title}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function recipeToText(recipe: {
  title: string;
  description?: string | null;
  ingredients: unknown;
  instructions: unknown;
  servings?: number | null;
  prepTime?: number | null;
  cookTime?: number | null;
}): string {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.join(", ")
    : "";
  const instructions = Array.isArray(recipe.instructions)
    ? recipe.instructions.join(" ")
    : "";

  return [
    `Recipe: ${recipe.title}`,
    recipe.description && `Description: ${recipe.description}`,
    ingredients && `Ingredients: ${ingredients}`,
    instructions && `Instructions: ${instructions}`,
    recipe.servings && `Servings: ${recipe.servings}`,
    recipe.prepTime && `Prep time: ${recipe.prepTime} minutes`,
    recipe.cookTime && `Cook time: ${recipe.cookTime} minutes`,
  ]
    .filter(Boolean)
    .join("\n");
}
