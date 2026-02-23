import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBreadSlice } from "@fortawesome/free-solid-svg-icons";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/recipes");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FontAwesomeIcon icon={faBreadSlice} className="w-7 h-7 text-primary" />
          <span className="text-2xl font-bold text-foreground">Flourish</span>
        </div>

        <div className="bg-card border border-[var(--border)] rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground mb-1 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-muted text-center mb-6">
            Sign in to your sourdough companion
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
