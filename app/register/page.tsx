import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/recipes");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/flourish-logo-transparent.svg" alt="Flourish" className="w-10 h-10" />
          <span className="text-2xl font-bold text-foreground">Flourish</span>
        </div>

        <div className="bg-card border border-[var(--border)] rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground mb-1 text-center">
            Create your account
          </h1>
          <p className="text-sm text-muted text-center mb-6">
            Start your sourdough baking journey
          </p>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
