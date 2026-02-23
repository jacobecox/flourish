import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateJournalEntry } from "@/lib/actions/journal";
import JournalEntryForm from "@/components/JournalEntryForm";

export const metadata: Metadata = { title: "Edit Entry" };

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requireAuth(), params]);

  const [entry, recipes] = await Promise.all([
    prisma.journalEntry.findUnique({
      where: { id, userId: user.id },
      include: { photos: true },
    }),
    prisma.recipe.findMany({
      where: { userId: user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  if (!entry) notFound();

  const boundAction = updateJournalEntry.bind(null, entry.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/journal/${entry.id}`}
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        Back to entry
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">Edit Entry</h1>
      <p className="text-muted mb-8">Update your journal entry.</p>

      <JournalEntryForm
        action={boundAction}
        recipes={recipes}
        defaultValues={{
          date: entry.date.toISOString(),
          notes: entry.notes,
          rating: entry.rating,
          recipeId: entry.recipeId,
          photos: entry.photos.map((p) => ({ id: p.id, url: p.url })),
          hydration: entry.hydration,
          flourType: entry.flourType,
          bulkTime: entry.bulkTime,
          proofTime: entry.proofTime,
          bakeTemp: entry.bakeTemp,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
