import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faPencil,
  faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { prisma } from "@/lib/prisma";
import { DEV_USER_ID } from "@/lib/dev-user";
import { formatDate } from "@/lib/utils";
import DeleteJournalEntryButton from "@/components/DeleteJournalEntryButton";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entry = await prisma.journalEntry.findUnique({
    where: { id, userId: DEV_USER_ID },
    include: { recipe: true, photos: true },
  });

  if (!entry) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        Back to journal
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted mb-1">{formatDate(entry.date)}</p>
          {entry.rating !== null && (
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <FontAwesomeIcon
                  key={n}
                  icon={n <= entry.rating! ? faStarSolid : faStarRegular}
                  className={`w-4 h-4 ${n <= entry.rating! ? "text-amber-400" : "text-muted"}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/journal/${entry.id}/edit`}
            className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] transition-colors"
          >
            <FontAwesomeIcon icon={faPencil} className="w-3 h-3" />
            Edit
          </Link>
          <DeleteJournalEntryButton id={entry.id} />
        </div>
      </div>

      {entry.recipe && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Recipe</p>
          <Link
            href={`/recipes/${entry.recipe.id}?from=/journal/${entry.id}`}
            className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-foreground text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] font-medium transition-colors"
          >
            {entry.recipe.title}
          </Link>
        </div>
      )}

      {entry.photos.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Photos</p>
          <div className="flex flex-wrap gap-3">
            {entry.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-28 h-28 shrink-0 block rounded-lg overflow-hidden border border-[var(--border)] hover:opacity-90 transition-opacity"
              >
                <Image
                  src={photo.url}
                  alt="Journal photo"
                  fill
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {entry.notes ? (
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Notes</p>
          <div className="bg-card border border-[var(--border)] rounded-lg p-5">
            <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
              {entry.notes}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-muted text-sm italic">No notes for this entry.</p>
      )}
    </div>
  );
}
