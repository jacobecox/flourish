import Link from "next/link";

type RecipeCardProps = {
  recipe: {
    id: string;
    title: string;
    description: string | null;
    prepTime: number | null;
    cookTime: number | null;
    tags: { tag: { id: string; name: string } }[];
  };
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block">
      <div className="bg-card border border-[var(--border)] rounded-lg p-5 h-full hover:shadow-lg hover:border-primary transition-all">
        <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-muted mb-3 line-clamp-2">{recipe.description}</p>
        )}
        {totalTime > 0 && (
          <p className="text-xs text-muted mb-3">
            {totalTime} min total
            {recipe.prepTime ? ` · ${recipe.prepTime} min prep` : ""}
            {recipe.cookTime ? ` · ${recipe.cookTime} min bake` : ""}
          </p>
        )}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="bg-secondary text-foreground text-xs px-2 py-0.5 rounded border border-[var(--border)] font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
