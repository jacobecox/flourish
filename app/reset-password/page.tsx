import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/forgot-password");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
          <p className="text-sm text-muted mt-1">Choose a strong password for your account.</p>
        </div>
        <div className="bg-card border border-[var(--border)] rounded-xl shadow-sm p-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
