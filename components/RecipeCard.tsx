import Link from "next/link";
import { formatTime } from "@/lib/utils";
import FavoriteButton from "./FavoriteButton";

type RecipeCardProps = {
  recipe: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    prepTime: number | null;
    cookTime: number | null;
    isFavorited: boolean;
    tags: { tag: { id: string; name: string } }[];
  };
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="group relative">
      <Link href={`/recipes/${recipe.id}`} className="block">
        <div className="bg-card border border-[var(--border)] rounded-lg overflow-hidden h-full hover:shadow-lg hover:border-primary transition-all">
          {recipe.imageUrl && (
            <div className="h-44 overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className={recipe.imageUrl ? "p-4 pr-12" : "p-5 pr-12"}>
          <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sm text-muted mb-3 line-clamp-2">{recipe.description}</p>
          )}
          {totalTime > 0 && (
            <p className="text-xs text-muted mb-3">
              {formatTime(totalTime)} total
              {recipe.prepTime ? ` · ${formatTime(recipe.prepTime)} prep` : ""}
              {recipe.cookTime ? ` · ${formatTime(recipe.cookTime)} bake` : ""}
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
        </div>
      </Link>
      <FavoriteButton recipeId={recipe.id} isFavorited={recipe.isFavorited} />
    </div>
  );
}
