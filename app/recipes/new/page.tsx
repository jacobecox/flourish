import { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import RecipeForm from "@/components/RecipeForm";
import { createRecipe } from "@/lib/actions/recipes";

export const metadata: Metadata = { title: "New Recipe" };

export default function NewRecipePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        Back to recipes
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">New Recipe</h1>

      <RecipeForm action={createRecipe} submitLabel="Create Recipe" />
    </div>
  );
}
