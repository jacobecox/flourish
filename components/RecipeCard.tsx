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
          <div className="h-44 overflow-hidden flex-shrink-0">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
                <img src="/flourish-logo-transparent.svg" alt="" className="w-16 h-16 opacity-20" />
              </div>
            )}
          </div>
          <div className="p-4 pr-12">
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
          </div>
        </div>
      </Link>
      <FavoriteButton recipeId={recipe.id} isFavorited={recipe.isFavorited} />
    </div>
  );
}
