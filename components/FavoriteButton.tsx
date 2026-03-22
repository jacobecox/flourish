"use client";

import { useOptimistic, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { toggleFavorite } from "@/lib/actions/recipes";

export default function FavoriteButton({
  recipeId,
  isFavorited,
}: {
  recipeId: string;
  isFavorited: boolean;
}) {
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavorited);
  const [, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          setOptimisticFav(!optimisticFav);
          await toggleFavorite(recipeId);
        });
      }}
      className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm shadow-md transition-all ${
        optimisticFav
          ? "text-primary"
          : "text-muted opacity-0 group-hover:opacity-100 hover:text-primary"
      }`}
      aria-label={optimisticFav ? "Remove from favorites" : "Add to favorites"}
    >
      <FontAwesomeIcon
        icon={optimisticFav ? faStarSolid : faStarRegular}
        className="w-4 h-4"
      />
    </button>
  );
}
