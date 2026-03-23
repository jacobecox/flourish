"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { saveSharedRecipe } from "@/lib/actions/recipes";

interface SaveRecipeButtonProps {
  recipeId: string;
  isAuthenticated: boolean;
  /** When true (coming back from login with ?save=true), auto-triggers save on mount */
  autoSave?: boolean;
}

export default function SaveRecipeButton({ recipeId, isAuthenticated, autoSave }: SaveRecipeButtonProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSave = async () => {
    setSaving(true);
    setError(null);
    const result = await saveSharedRecipe(recipeId);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => router.push(`/recipes/${result.newRecipeId}`), 800);
    } else if (result.error !== "already_yours") {
      setError("Something went wrong. Please try again.");
    }
  };

  // Auto-save when returning from login with ?save=true
  useEffect(() => {
    if (autoSave && isAuthenticated && !saved && !saving) {
      doSave();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(`${window.location.pathname}?save=true`);
      router.push(`/login?next=${next}`);
      return;
    }
    doSave();
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={saving || saved}
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <FontAwesomeIcon
          icon={saved ? faCheck : faBookmark}
          className={`w-3 h-3 ${saving ? "animate-pulse" : ""}`}
        />
        {saved ? "Saved!" : saving ? "Saving…" : "Save to my recipes"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
