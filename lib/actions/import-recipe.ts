"use server";

export type ImportedRecipe = {
  title: string;
  description?: string;
  sourceUrl: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags: string[];
};

export type ImportResult =
  | { success: true; recipe: ImportedRecipe }
  | { success: false; error: string };

// Decode HTML entities in strings from JSON-LD (e.g. &#8211; → –, &amp; → &)
function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&frac14;/g, "\u00BC")
    .replace(/&frac12;/g, "\u00BD")
    .replace(/&frac34;/g, "\u00BE");
}

// Parse ISO 8601 duration to minutes: "PT1H30M" → 90, "PT45M" → 45
function parseIsoDuration(duration: unknown): number | undefined {
  if (typeof duration !== "string") return undefined;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;
  const hours = parseInt(match[1] ?? "0");
  const minutes = parseInt(match[2] ?? "0");
  const total = hours * 60 + minutes;
  return total > 0 ? total : undefined;
}

// Extract a number from yield values like "8 servings", "Makes 1 loaf", 8, ["8"]
function parseServings(yieldVal: unknown): number | undefined {
  if (!yieldVal) return undefined;
  const raw = Array.isArray(yieldVal) ? yieldVal[0] : yieldVal;
  const match = String(raw).match(/\d+/);
  return match ? parseInt(match[0]) : undefined;
}

// Normalize recipeInstructions — can be a plain string, string[], or HowToStep[]
function parseInstructions(raw: unknown): string[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    return raw
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (typeof item === "object" && item !== null) {
          // HowToStep or HowToSection
          const step = item as Record<string, unknown>;
          if (typeof step.text === "string") return step.text.trim();
          if (typeof step.name === "string") return step.name.trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

// Parse tags from keywords field — can be comma-separated string or array
function parseTags(keywords: unknown): string[] {
  if (!keywords) return [];
  const raw = Array.isArray(keywords) ? keywords.join(",") : String(keywords);
  return raw
    .split(/[,;]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

// Find the Recipe object from a JSON-LD payload (handles @graph and arrays)
function findRecipeInJsonLd(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;

  if (obj["@type"] === "Recipe") return obj;

  // @type can be an array
  if (Array.isArray(obj["@type"]) && (obj["@type"] as string[]).includes("Recipe")) {
    return obj;
  }

  // Check @graph
  if (Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"] as unknown[]) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
  }

  return null;
}

export async function importRecipeFromUrl(url: string): Promise<ImportResult> {
  let html: string;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return { success: false, error: `Could not fetch the page (HTTP ${res.status}).` };
    }

    html = await res.text();
  } catch {
    return {
      success: false,
      error: "Could not reach that URL. Check that it's correct and publicly accessible.",
    };
  }

  // Extract all JSON-LD script blocks
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let recipe: Record<string, unknown> | null = null;

  for (const match of html.matchAll(scriptRegex)) {
    try {
      const parsed = JSON.parse(match[1]);
      recipe = findRecipeInJsonLd(parsed);
      if (recipe) break;
    } catch {
      // malformed JSON-LD — skip this block
    }
  }

  if (!recipe) {
    return {
      success: false,
      error:
        "No recipe data found on that page. The site may not support structured recipe data.",
    };
  }

  const ingredients = Array.isArray(recipe.recipeIngredient)
    ? (recipe.recipeIngredient as unknown[]).map((v) => decodeEntities(String(v))).filter(Boolean)
    : [];

  const instructions = parseInstructions(recipe.recipeInstructions).map(decodeEntities);

  if (!recipe.name || typeof recipe.name !== "string") {
    return { success: false, error: "Recipe found but missing a title." };
  }

  if (ingredients.length === 0 || instructions.length === 0) {
    return {
      success: false,
      error: "Recipe found but ingredients or instructions could not be extracted.",
    };
  }

  return {
    success: true,
    recipe: {
      title: decodeEntities(recipe.name),
      description:
        typeof recipe.description === "string" ? decodeEntities(recipe.description) : undefined,
      sourceUrl: url,
      ingredients,
      instructions,
      prepTime: parseIsoDuration(recipe.prepTime),
      cookTime: parseIsoDuration(recipe.cookTime),
      servings: parseServings(recipe.recipeYield),
      tags: parseTags(recipe.keywords),
    },
  };
}
