"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { updateDisplayNameAction } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function AccountProfileForm({
  currentName,
  email,
}: {
  currentName: string | null;
  email: string;
}) {
  const [state, action] = useActionState(updateDisplayNameAction, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={currentName ?? ""}
          placeholder="Your name"
          className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Email address
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full bg-secondary border border-[var(--border)] rounded-lg px-3 py-2 text-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted mt-1">Email cannot be changed here.</p>
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-green-500 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
          Display name updated.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
