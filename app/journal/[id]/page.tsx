import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faPencil,
  faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requireAuth } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/utils";
import DeleteJournalEntryButton from "@/components/DeleteJournalEntryButton";
import PhotoLightbox from "@/components/PhotoLightbox";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const [session, { id }] = await Promise.all([getSession(), params]);
  if (!session) return { title: "Entry" };
  const entry = await prisma.journalEntry.findUnique({
    where: { id, userId: session.userId },
    select: { date: true },
  });
  return { title: entry ? formatDate(entry.date) : "Entry" };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requireAuth(), params]);

  const entry = await prisma.journalEntry.findUnique({
    where: { id, userId: user.id },
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

      {/* Bake metrics */}
      {(() => {
        const hydration = entry.hydration !== null && !isNaN(entry.hydration) ? entry.hydration : null;
        const flourType = entry.flourType || null;
        const bulkTime = entry.bulkTime !== null && !isNaN(entry.bulkTime) ? entry.bulkTime : null;
        const proofTime = entry.proofTime !== null && !isNaN(entry.proofTime) ? entry.proofTime : null;
        const bakeTemp = entry.bakeTemp !== null && !isNaN(entry.bakeTemp) ? entry.bakeTemp : null;
        const hasAny = hydration !== null || flourType !== null || bulkTime !== null || proofTime !== null || bakeTemp !== null;
        return (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Bake Metrics</p>
            {hasAny ? (
              <div className="bg-card border border-[var(--border)] rounded-lg px-4 py-3 flex flex-wrap gap-x-6 gap-y-2">
                {hydration !== null && (
                  <div>
                    <p className="text-xs text-muted">Hydration</p>
                    <p className="text-sm font-medium text-foreground">{hydration}%</p>
                  </div>
                )}
                {flourType !== null && (
                  <div>
                    <p className="text-xs text-muted">Flour</p>
                    <p className="text-sm font-medium text-foreground">{flourType}</p>
                  </div>
                )}
                {bulkTime !== null && (
                  <div>
                    <p className="text-xs text-muted">Bulk Fermentation</p>
                    <p className="text-sm font-medium text-foreground">{formatTime(bulkTime)}</p>
                  </div>
                )}
                {proofTime !== null && (
                  <div>
                    <p className="text-xs text-muted">Final Proof</p>
                    <p className="text-sm font-medium text-foreground">{formatTime(proofTime)}</p>
                  </div>
                )}
                {bakeTemp !== null && (
                  <div>
                    <p className="text-xs text-muted">Bake Temp</p>
                    <p className="text-sm font-medium text-foreground">{bakeTemp}°F</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted text-sm italic">No bake metrics recorded.</p>
            )}
          </div>
        );
      })()}

      {entry.photos.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Photos</p>
          <PhotoLightbox photos={entry.photos} />
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
