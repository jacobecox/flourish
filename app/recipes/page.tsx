import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import RecipeCard from "@/components/RecipeCard";
import RecipeSearch from "@/components/RecipeSearch";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";

  const allRecipes = await prisma.recipe.findMany({
    where: { userId: DEV_USER_ID },
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
        <Link
          href="/recipes/new"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors shrink-0"
        >
          Add Recipe
        </Link>
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
            <Link
              href="/recipes/new"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Add Your First Recipe
            </Link>
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
