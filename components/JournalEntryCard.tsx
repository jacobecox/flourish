import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { formatDate } from "@/lib/utils";

type JournalEntryCardProps = {
  entry: {
    id: string;
    date: Date | string;
    notes: string | null;
    rating: number | null;
    firstPhotoUrl: string | null;
    recipe: { id: string; title: string } | null;
  };
};

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  return (
    <Link href={`/journal/${entry.id}`} className="group block">
      <div className="bg-card border border-[var(--border)] rounded-lg overflow-hidden h-full hover:shadow-lg hover:border-primary transition-all">
        <div className="h-44 overflow-hidden flex-shrink-0">
          {entry.firstPhotoUrl ? (
            <img
              src={entry.firstPhotoUrl}
              alt="Bake photo"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
              <img src="/flourish-logo-transparent.svg" alt="" className="w-16 h-16 opacity-20" />
            </div>
          )}
        </div>
        <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-medium text-muted">{formatDate(entry.date)}</p>
          {entry.rating !== null && (
            <div className="flex gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((n) => (
                <FontAwesomeIcon
                  key={n}
                  icon={n <= entry.rating! ? faStarSolid : faStarRegular}
                  className={`w-3.5 h-3.5 ${n <= entry.rating! ? "text-amber-400" : "text-muted"}`}
                />
              ))}
            </div>
          )}
        </div>

        {entry.notes && (
          <p className="text-sm text-foreground line-clamp-2 mb-3">{entry.notes}</p>
        )}

        {entry.recipe && (
          <span className="inline-block bg-secondary text-foreground text-xs px-2 py-0.5 rounded border border-[var(--border)] font-medium">
            {entry.recipe.title}
          </span>
        )}
        </div>
      </div>
    </Link>
  );
}
