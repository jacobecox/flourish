"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBreadSlice, faJar, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "./ThemeToggle";

interface NavUser {
  name: string | null;
  email: string;
}

const navItems = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/recipes", label: "Recipes" },
  { href: "/journal", label: "Journal" },
  { href: "/starter", label: "Starter", icon: faJar },
];

export default function Navigation({ user }: { user: NavUser | null }) {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b border-[var(--border)] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
            <FontAwesomeIcon icon={faBreadSlice} className="w-5 h-5 text-primary" />
            <span>Flourish</span>
          </Link>

          <div className="flex items-center gap-6">
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 transition-colors ${
                  ("exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href))
                    ? "font-semibold text-primary border-b-2 border-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {"icon" in item && item.icon && (
                  <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5" />
                )}
                {item.label}
              </Link>
            ))}

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[var(--border)]">
                <span className="text-sm text-muted hidden sm:block">
                  {user.name ?? user.email}
                </span>
                <a
                  href="/auth/logout"
                  title="Sign out"
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                  <span className="hidden sm:block">Sign out</span>
                </a>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
