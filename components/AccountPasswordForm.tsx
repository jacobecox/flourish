"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { changePasswordAction } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
    >
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

function PasswordInput({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          placeholder={placeholder}
          className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 pr-10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AccountPasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);

  return (
    <form action={action} className="space-y-4">
      <PasswordInput name="currentPassword" label="Current password" />
      <PasswordInput name="password" label="New password" placeholder="At least 8 characters" />
      <PasswordInput name="passwordConfirm" label="Confirm new password" />

      {state && "error" in state && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-green-500 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
          Password updated successfully.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
