"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faFileImport,
  faCircleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { importRecipeFromUrl, type ImportedRecipe } from "@/lib/actions/import-recipe";
import { createRecipe } from "@/lib/actions/recipes";
import RecipeForm from "@/components/RecipeForm";

export default function ImportRecipePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<ImportedRecipe | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setImported(null);
    setLoading(true);

    const result = await importRecipeFromUrl(url.trim());

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      setImported(result.recipe);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        Back to recipes
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">Import from URL</h1>
      <p className="text-muted mb-8">
        Paste a link to any recipe page and we&apos;ll extract the details automatically.
      </p>

      {/* URL input — hide once we have a result */}
      {!imported && (
        <form onSubmit={handleImport} className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
            Recipe URL
          </label>
          <div className="flex gap-3">
            <input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.kingarthurbaking.com/recipes/..."
              className="flex-1 bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shrink-0"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFileImport} className="w-3.5 h-3.5" />
                  Import
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-muted mt-3">
            Works with most major recipe sites (King Arthur, Serious Eats, AllRecipes, NYT Cooking, and more).
          </p>
        </form>
      )}

      {/* Pre-filled form after successful import */}
      {imported && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted">
              Review and edit the imported recipe before saving.
            </p>
            <button
              type="button"
              onClick={() => { setImported(null); setError(null); }}
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Try a different URL
            </button>
          </div>
          <RecipeForm
            action={createRecipe}
            submitLabel="Save Recipe"
            defaultValues={imported}
          />
        </div>
      )}
    </div>
  );
}
