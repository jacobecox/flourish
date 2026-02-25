"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid, faXmark, faImage } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { toDateInputValue } from "@/lib/utils";
import { deleteJournalPhoto } from "@/lib/actions/journal";

type ExistingPhoto = { id: string; url: string };

type JournalEntryFormProps = {
  action: (formData: FormData) => Promise<void>;
  recipes: { id: string; title: string }[];
  defaultValues?: {
    date?: Date | string;
    notes?: string | null;
    rating?: number | null;
    recipeId?: string | null;
    photos?: ExistingPhoto[];
    // Bake metrics
    hydration?: number | null;
    flourType?: string | null;
    bulkTime?: number | null;
    proofTime?: number | null;
    bakeTemp?: number | null;
  };
  submitLabel?: string;
};

type PendingPhoto = {
  file: File;
  previewUrl: string;
};

export default function JournalEntryForm({
  action,
  recipes,
  defaultValues,
  submitLabel = "Save Entry",
}: JournalEntryFormProps) {
  const [rating, setRating] = useState<number>(defaultValues?.rating ?? 0);
  const [hovered, setHovered] = useState<number>(0);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
    defaultValues?.photos ?? []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const defaultDate = defaultValues?.date
    ? toDateInputValue(defaultValues.date)
    : (() => {
        const d = new Date();
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const dy = String(d.getDate()).padStart(2, "0");
        return `${y}-${mo}-${dy}`;
      })();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPending = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingPhotos((prev) => [...prev, ...newPending]);
    // Reset input so the same file can be re-added if removed
    e.target.value = "";
  }

  function removePending(index: number) {
    setPendingPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleDeleteExisting(photoId: string) {
    await deleteJournalPhoto(photoId);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  // useTransition is required here so Next.js correctly handles the redirect
  // inside the server action after file upload (form action={clientFn} breaks redirect)
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    pendingPhotos.forEach(({ file }) => formData.append("photos[]", file));
    startTransition(async () => {
      await action(formData);
    });
  }

  const hasPhotos = existingPhotos.length > 0 || pendingPhotos.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden rating field */}
      <input type="hidden" name="rating" value={rating > 0 ? String(rating) : ""} />

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          required
          className="bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={6}
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="How did the bake go? What would you change next time?"
          className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm resize-y"
        />
      </div>

      {/* Star rating */}
      <div>
        <p className="block text-sm font-medium text-foreground mb-2">Rating</p>
        <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hovered || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(rating === n ? 0 : n)}
                onMouseEnter={() => setHovered(n)}
                aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <FontAwesomeIcon
                  icon={filled ? faStarSolid : faStarRegular}
                  className={`w-6 h-6 transition-colors ${filled ? "text-amber-400" : "text-muted"}`}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-2 text-xs text-muted hover:text-foreground transition-colors self-center"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Recipe link */}
      <div>
        <label htmlFor="recipeId" className="block text-sm font-medium text-foreground mb-1">
          Linked Recipe <span className="text-muted font-normal">(optional)</span>
        </label>
        <select
          id="recipeId"
          name="recipeId"
          defaultValue={defaultValues?.recipeId ?? ""}
          className="bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
        >
          <option value="">— none —</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {/* Photos */}
      <div>
        <p className="block text-sm font-medium text-foreground mb-2">
          Photos <span className="text-muted font-normal">(optional)</span>
        </p>

        {hasPhotos && (
          <div className="flex flex-wrap gap-3 mb-3">
            {/* Existing saved photos */}
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative group w-24 h-24 shrink-0">
                <Image
                  src={photo.url}
                  alt="Journal photo"
                  fill
                  className="object-cover rounded-lg border border-[var(--border)]"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(photo.id)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Pending new photos */}
            {pendingPhotos.map((photo, i) => (
              <div key={i} className="relative group w-24 h-24 shrink-0">
                <Image
                  src={photo.previewUrl}
                  alt="Photo preview"
                  fill
                  className="object-cover rounded-lg border border-[var(--border)] opacity-80"
                />
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-foreground px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] transition-colors"
        >
          <FontAwesomeIcon icon={faImage} className="w-3.5 h-3.5" />
          Add Photos
        </button>
      </div>

      {/* Bake Metrics */}
      <div>
        <p className="block text-sm font-medium text-foreground mb-3">
          Bake Metrics <span className="text-muted font-normal">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Hydration */}
          <div>
            <label htmlFor="hydration" className="block text-xs text-muted mb-1">
              Hydration %
            </label>
            <input
              id="hydration"
              name="hydration"
              type="number"
              min="0"
              max="200"
              step="0.5"
              defaultValue={defaultValues?.hydration ?? ""}
              placeholder="e.g. 75"
              className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          {/* Flour type */}
          <div>
            <label htmlFor="flourType" className="block text-xs text-muted mb-1">
              Flour Type
            </label>
            <input
              id="flourType"
              name="flourType"
              type="text"
              defaultValue={defaultValues?.flourType ?? ""}
              placeholder="e.g. bread flour"
              className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          {/* Bulk fermentation */}
          <div>
            <p className="text-xs text-muted mb-1">Bulk Fermentation</p>
            <div className="flex gap-2">
              <input
                name="bulkTimeHr"
                type="number"
                min="0"
                defaultValue={
                  defaultValues?.bulkTime != null
                    ? Math.floor(defaultValues.bulkTime / 60)
                    : ""
                }
                placeholder="hr"
                className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
              <input
                name="bulkTimeMin"
                type="number"
                min="0"
                max="59"
                defaultValue={
                  defaultValues?.bulkTime != null ? defaultValues.bulkTime % 60 : ""
                }
                placeholder="min"
                className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>

          {/* Final proof */}
          <div>
            <p className="text-xs text-muted mb-1">Final Proof</p>
            <div className="flex gap-2">
              <input
                name="proofTimeHr"
                type="number"
                min="0"
                defaultValue={
                  defaultValues?.proofTime != null
                    ? Math.floor(defaultValues.proofTime / 60)
                    : ""
                }
                placeholder="hr"
                className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
              <input
                name="proofTimeMin"
                type="number"
                min="0"
                max="59"
                defaultValue={
                  defaultValues?.proofTime != null ? defaultValues.proofTime % 60 : ""
                }
                placeholder="min"
                className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>

          {/* Bake temp */}
          <div>
            <label htmlFor="bakeTemp" className="block text-xs text-muted mb-1">
              Bake Temp (°F)
            </label>
            <input
              id="bakeTemp"
              name="bakeTemp"
              type="number"
              min="0"
              defaultValue={defaultValues?.bakeTemp ?? ""}
              placeholder="e.g. 450"
              className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/journal"
          className="bg-secondary hover:bg-secondary-hover text-foreground px-5 py-2 rounded-lg font-semibold text-sm border border-[var(--border)] transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
