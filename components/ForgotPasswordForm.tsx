"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
    >
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, null);

  if (state && "success" in state) {
    return (
      <div className="text-center space-y-3">
        <p className="text-foreground font-medium">Check your email</p>
        <p className="text-sm text-muted">
          If an account exists for that address, we&apos;ve sent a password reset link. It may take a minute to arrive.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-primary hover:text-primary-hover transition-colors font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="w-full bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
          placeholder="you@example.com"
        />
      </div>

      <SubmitButton />

      <p className="text-sm text-muted text-center">
        <Link href="/login" className="text-primary hover:text-primary-hover transition-colors font-medium">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
