import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import { updateRecipe } from "@/lib/actions/recipes";
import RecipeForm from "@/components/RecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: DEV_USER_ID },
    include: { tags: { include: { tag: true } } },
  });

  if (!recipe) notFound();

  const updateWithId = updateRecipe.bind(null, recipe.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/recipes/${recipe.id}`}
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        Back to recipe
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">Edit Recipe</h1>

      <RecipeForm
        action={updateWithId}
        submitLabel="Save Changes"
        defaultValues={{
          title: recipe.title,
          description: recipe.description ?? undefined,
          sourceUrl: recipe.sourceUrl ?? undefined,
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          ingredients: recipe.ingredients as string[],
          instructions: recipe.instructions as string[],
          tags: recipe.tags.map(({ tag }) => tag.name),
        }}
      />
    </div>
  );
}
