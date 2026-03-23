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
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import RecipeScaler from "@/components/RecipeScaler";
import ShareRecipeButton from "@/components/ShareRecipeButton";
import SaveRecipeButton from "@/components/SaveRecipeButton";
import { formatTime, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id }, select: { title: true } });
  return { title: recipe?.title ?? "Recipe" };
}

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; save?: string }>;
}) {
  const [session, { id }, { from, save }] = await Promise.all([
    getSession(),
    params,
    searchParams,
  ]);

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });

  if (!recipe) notFound();

  const isOwner = session?.userId === recipe.userId;
  const isAuthenticated = !!session;
  const autoSave = save === "true" && isAuthenticated && !isOwner;

  // Journal entries only relevant for the owner
  const journalEntries = isOwner
    ? await prisma.journalEntry.findMany({
        where: { recipeId: id, userId: session!.userId },
        orderBy: { date: "desc" },
      })
    : [];

  // Owner attribution for non-owner views
  const ownerName = !isOwner
    ? (await prisma.user.findUnique({ where: { id: recipe.userId }, select: { name: true } }))?.name ?? null
    : null;

  const ingredients = recipe.ingredients as string[];
  const instructions = recipe.instructions as string[];
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  const backHref = isOwner
    ? (from?.startsWith("/") ? from : "/recipes")
    : isAuthenticated
    ? "/recipes"
    : "/";
  const backLabel = isOwner && from?.startsWith("/journal")
    ? "Back to journal entry"
    : isAuthenticated
    ? "Back to recipes"
    : "Back to Flourish";

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        {backLabel}
      </Link>

      {/* Shared-by banner for non-owners */}
      {!isOwner && ownerName && (
        <div className="mb-4 text-sm text-muted bg-card border border-[var(--border)] rounded-lg px-4 py-2.5">
          Shared by <span className="font-medium text-foreground">{ownerName}</span>
          {!isAuthenticated && (
            <> · <Link href="/register" className="text-primary hover:text-primary-hover transition-colors">Create an account</Link> to save recipes and track your bakes</>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-muted">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {isOwner ? (
            <>
              <ShareRecipeButton />
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] transition-colors"
              >
                <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                Edit
              </Link>
              <DeleteRecipeButton id={recipe.id} />
            </>
          ) : (
            <SaveRecipeButton
              recipeId={recipe.id}
              isAuthenticated={isAuthenticated}
              autoSave={autoSave}
            />
          )}
        </div>
      </div>

      {/* Hero image */}
      {recipe.imageUrl && (
        <div className="rounded-xl overflow-hidden mb-6 h-72">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

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
        <RecipeScaler ingredients={ingredients} />
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

      {/* Save CTA for non-owners — shown at the bottom after reading the recipe */}
      {!isOwner && (
        <div className="mt-12 bg-card border border-[var(--border)] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Want to use this recipe?</p>
            <p className="text-sm text-muted mt-0.5">
              Save it to your collection to log bakes and track your progress.
            </p>
          </div>
          <SaveRecipeButton
            recipeId={recipe.id}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}

      {/* Bake History — owner only */}
      {isOwner && (
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
      )}
    </div>
  );
}
