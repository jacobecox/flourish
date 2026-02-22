"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { deleteJournalEntry } from "@/lib/actions/journal";

export default function DeleteJournalEntryButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await deleteJournalEntry(id);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] transition-colors"
      >
        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
        Delete
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div className="bg-card border border-[var(--border)] rounded-xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 shrink-0">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="w-4 h-4 text-red-600 dark:text-red-400"
                />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Delete entry?</h2>
            </div>
            <p className="text-sm text-muted mb-6">
              This journal entry will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={pending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary hover:bg-secondary-hover text-foreground border border-[var(--border)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
