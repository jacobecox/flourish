import { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { requireAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import AccountProfileForm from "@/components/AccountProfileForm";
import AccountPasswordForm from "@/components/AccountPasswordForm";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Account</h1>

      <div className="space-y-6">
        {/* Profile */}
        <section className="bg-card border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-5">Profile</h2>
          <AccountProfileForm currentName={user.name} email={user.email} />
        </section>

        {/* Security */}
        <section className="bg-card border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Password</h2>
          <p className="text-sm text-muted mb-5">
            Choose a strong password of at least 8 characters.
          </p>
          <AccountPasswordForm />
        </section>

        {/* Account info + sign out */}
        <section className="bg-card border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Member since</span>
              <span className="text-foreground">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Email</span>
              <span className="text-foreground">{user.email}</span>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <a
              href="/auth/logout"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
              Sign out
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
