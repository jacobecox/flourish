"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
    >
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, null);

  if (state && "success" in state) {
    return (
      <div className="text-center space-y-3">
        <p className="text-foreground font-medium">Password updated</p>
        <p className="text-sm text-muted">Your password has been changed. You can now sign in with your new password.</p>
        <Link
          href="/login"
          className="inline-block text-sm bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="new-password"
          className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-foreground mb-1">
          Confirm new password
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
