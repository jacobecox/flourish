"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

type JournalSearchProps = {
  recipes: { id: string; title: string }[];
};

export default function JournalSearch({ recipes }: JournalSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rating = searchParams.get("rating") ?? "";
  const recipe = searchParams.get("recipe") ?? "";

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Debounce text search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateUrl({ q: query }), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, updateUrl]);

  const hasFilters = query || rating || recipe;

  function clearAll() {
    setQuery("");
    const params = new URLSearchParams();
    router.replace(pathname);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Text search */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes…"
          className="bg-card border border-[var(--border)] rounded-lg pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors w-56 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Rating filter */}
      <select
        value={rating}
        onChange={(e) => updateUrl({ rating: e.target.value })}
        className="bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        <option value="">Any rating</option>
        <option value="5">5 stars</option>
        <option value="4">4+ stars</option>
        <option value="3">3+ stars</option>
        <option value="2">2+ stars</option>
        <option value="1">1+ star</option>
      </select>

      {/* Recipe filter */}
      {recipes.length > 0 && (
        <select
          value={recipe}
          onChange={(e) => updateUrl({ recipe: e.target.value })}
          className="bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors max-w-48"
        >
          <option value="">Any recipe</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      )}

      {/* Clear all */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
