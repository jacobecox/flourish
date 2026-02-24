import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect("/recipes");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
          <p className="text-sm text-muted mt-1">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <div className="bg-card border border-[var(--border)] rounded-xl shadow-sm p-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
