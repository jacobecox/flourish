import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import JournalEntryList from "@/components/JournalEntryList";
import JournalSearch from "@/components/JournalSearch";

export const metadata: Metadata = { title: "Journal" };

const PAGE_SIZE = 12;

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rating?: string; recipe?: string }>;
}) {
  const [user, { q, rating, recipe }] = await Promise.all([requireAuth(), searchParams]);
  const query = q?.trim() || undefined;
  const minRating = rating ? parseInt(rating) : undefined;

  const filters = { q: query, rating, recipe };

  const where = {
    userId: user.id,
    ...(query ? { notes: { contains: query, mode: "insensitive" as const } } : {}),
    ...(minRating ? { rating: { gte: minRating } } : {}),
    ...(recipe ? { recipeId: recipe } : {}),
  };

  const [rawEntries, totalCount, recipes] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      include: { recipe: { select: { id: true, title: true } } },
      orderBy: { date: "desc" },
      take: PAGE_SIZE + 1,
    }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.recipe.findMany({
      where: { userId: user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const hasMore = rawEntries.length > PAGE_SIZE;
  const entries = (hasMore ? rawEntries.slice(0, PAGE_SIZE) : rawEntries).map((e) => ({
    ...e,
    date: e.date.toISOString(),
  }));
  const initialCursor = entries[entries.length - 1]?.id ?? null;
  const isFiltering = query || minRating !== undefined || recipe;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Baker&apos;s Journal</h1>
          <p className="text-muted">Document your baking journey</p>
        </div>
        <Link
          href="/journal/new"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors shrink-0"
        >
          New Entry
        </Link>
      </div>

      {totalCount > 0 && (
        <div className="mb-6">
          <Suspense>
            <JournalSearch recipes={recipes} />
          </Suspense>
        </div>
      )}

      {entries.length === 0 && !isFiltering ? (
        <div className="bg-card border-2 border-dashed border-[var(--border)] rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-2">No journal entries yet</h3>
            <p className="text-muted mb-6">
              Start documenting your bakes — add notes, rate your results, and track your progress.
            </p>
            <Link
              href="/journal/new"
              className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Create Your First Entry
            </Link>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-card border border-[var(--border)] rounded-lg p-12 text-center">
          <p className="text-muted">No entries match your filters.</p>
        </div>
      ) : (
        <JournalEntryList
          key={`${query}-${rating}-${recipe}`}
          initialEntries={entries}
          initialHasMore={hasMore}
          initialCursor={initialCursor}
          filters={filters}
        />
      )}
    </div>
  );
}
