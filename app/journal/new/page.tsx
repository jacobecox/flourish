import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import { createJournalEntry } from "@/lib/actions/journal";
import JournalEntryForm from "@/components/JournalEntryForm";

export default async function NewJournalEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ recipeId?: string }>;
}) {
  const { recipeId } = await searchParams;

  const recipes = await prisma.recipe.findMany({
    where: { userId: DEV_USER_ID },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        Back to journal
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">New Entry</h1>
      <p className="text-muted mb-8">Log a baking session to your journal.</p>

      <JournalEntryForm
        action={createJournalEntry}
        recipes={recipes}
        defaultValues={{ recipeId: recipeId ?? null }}
        submitLabel="Save Entry"
      />
    </div>
  );
}
