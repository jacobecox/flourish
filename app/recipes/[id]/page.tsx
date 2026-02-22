import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faClock, faUtensils, faPen } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import { formatTime } from "@/lib/utils";

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const backHref = from?.startsWith("/") ? from : "/recipes";
  const backLabel = from?.startsWith("/journal") ? "Back to journal entry" : "Back to recipes";

  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: DEV_USER_ID },
    include: {
      tags: { include: { tag: true } },
    },
  });

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
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {ingredients.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-accent font-bold mt-0.5">·</span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

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
    </div>
  );
}
