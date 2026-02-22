import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import JournalEntryCard from "@/components/JournalEntryCard";

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    where: { userId: DEV_USER_ID },
    include: { recipe: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Baker&apos;s Journal</h1>
          <p className="text-muted">Document your baking journey</p>
        </div>
        <Link
          href="/journal/new"
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
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
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
