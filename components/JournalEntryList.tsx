"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import JournalEntryCard from "@/components/JournalEntryCard";
import { fetchJournalEntries } from "@/lib/actions/journal";

type Entry = {
  id: string;
  date: string;
  notes: string | null;
  rating: number | null;
  recipeId: string | null;
  recipe: { id: string; title: string } | null;
};

type Props = {
  initialEntries: Entry[];
  initialHasMore: boolean;
  initialCursor: string | null;
  filters: { q?: string; rating?: string; recipe?: string };
};

export default function JournalEntryList({
  initialEntries,
  initialHasMore,
  initialCursor,
  filters,
}: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current || !cursor) return;
    loadingRef.current = true;
    setLoading(true);
    const result = await fetchJournalEntries(filters, cursor);
    setEntries((prev) => [...prev, ...result.entries]);
    setHasMore(result.hasMore);
    setCursor(result.nextCursor);
    loadingRef.current = false;
    setLoading(false);
  }, [hasMore, cursor, filters]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry) => (
          <JournalEntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      <div ref={sentinelRef} className="mt-6 flex justify-center h-6">
        {loading && <p className="text-muted text-sm">Loading more…</p>}
      </div>
    </>
  );
}
