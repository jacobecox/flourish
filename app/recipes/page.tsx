import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import RecipeSearch from "@/components/RecipeSearch";

export const metadata: Metadata = { title: "Recipes" };

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [user, { q }] = await Promise.all([requireAuth(), searchParams]);
  const query = q?.trim().toLowerCase() ?? "";

  const allRecipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });

  const recipes = query
    ? allRecipes.filter((r) => {
        const ingredients = r.ingredients as string[];
        const instructions = r.instructions as string[];
        return (
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          ingredients.some((i) => i.toLowerCase().includes(query)) ||
          instructions.some((i) => i.toLowerCase().includes(query))
        );
      })
    : allRecipes;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Recipe Manager</h1>
          <p className="text-muted">Import and manage your sourdough recipes</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            href="/recipes/import"
            className="bg-secondary hover:bg-secondary-hover text-foreground px-4 py-2 rounded-lg font-semibold border border-[var(--border)] transition-colors"
          >
            Import from URL
          </Link>
          <Link
            href="/recipes/new"
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add Recipe
          </Link>
        </div>
      </div>

      {allRecipes.length > 0 && (
        <div className="mb-6">
          <Suspense>
            <RecipeSearch />
          </Suspense>
        </div>
      )}

      {recipes.length === 0 && allRecipes.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-[var(--border)] rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2">No recipes yet</h3>
            <p className="text-muted mb-6">
              Get started by adding your first sourdough recipe
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/recipes/import"
                className="bg-secondary hover:bg-secondary-hover text-foreground px-5 py-2 rounded-lg font-semibold border border-[var(--border)] transition-colors"
              >
                Import from URL
              </Link>
              <Link
                href="/recipes/new"
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Manually
              </Link>
            </div>
          </div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-card border border-[var(--border)] rounded-lg p-12 text-center">
          <p className="text-muted">No recipes match &ldquo;{q}&rdquo;</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
