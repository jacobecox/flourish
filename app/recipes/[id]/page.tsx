import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faClock,
  faUtensils,
  faPen,
  faStar as faStarSolid,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requireAuth } from "@/lib/auth";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import RecipeScaler from "@/components/RecipeScaler";
import { formatTime, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const [session, { id }] = await Promise.all([getSession(), params]);
  if (!session) return { title: "Recipe" };
  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: session.userId },
    select: { title: true },
  });
  return { title: recipe?.title ?? "Recipe" };
}

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [user, { id }, { from }] = await Promise.all([requireAuth(), params, searchParams]);

  const backHref = from?.startsWith("/") ? from : "/recipes";
  const backLabel = from?.startsWith("/journal") ? "Back to journal entry" : "Back to recipes";

  const [recipe, journalEntries] = await Promise.all([
    prisma.recipe.findFirst({
      where: { id, userId: user.id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.journalEntry.findMany({
      where: { recipeId: id, userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  if (!recipe) notFound();

  const ingredients = recipe.ingredients as string[];
  const instructions = recipe.instructions as string[];
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        {backLabel}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-muted">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] transition-colors"
          >
            <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
            Edit
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 mb-6">
        {totalTime > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-accent" />
            {recipe.prepTime ? `${formatTime(recipe.prepTime)} prep` : ""}
            {recipe.prepTime && recipe.cookTime ? " · " : ""}
            {recipe.cookTime ? `${formatTime(recipe.cookTime)} bake` : ""}
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <FontAwesomeIcon icon={faUtensils} className="w-3.5 h-3.5 text-accent" />
            {recipe.servings} servings
          </div>
        )}
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            View source
          </a>
        )}
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {recipe.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="bg-secondary text-foreground text-xs px-2.5 py-1 rounded border border-[var(--border)] font-medium"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Ingredients */}
        <RecipeScaler ingredients={ingredients} />

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Journal entries for this recipe */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-accent" />
            Bake History
          </h2>
          <Link
            href={`/journal/new?recipeId=${recipe.id}`}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            + Log a bake
          </Link>
        </div>

        {journalEntries.length === 0 ? (
          <div className="bg-card border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
            <p className="text-muted text-sm">No bakes logged for this recipe yet.</p>
            <Link
              href={`/journal/new?recipeId=${recipe.id}`}
              className="inline-block mt-3 text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Log your first bake
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="group block bg-card border border-[var(--border)] rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted mb-1">
                      {formatDate(entry.date)}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-foreground line-clamp-2">{entry.notes}</p>
                    )}
                  </div>
                  {entry.rating !== null && (
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FontAwesomeIcon
                          key={n}
                          icon={n <= entry.rating! ? faStarSolid : faStarRegular}
                          className={`w-3 h-3 ${n <= entry.rating! ? "text-amber-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
