"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faJar, faRightFromBracket, faBars, faXmark, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
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
  { href: "/chat", label: "Ask AI", icon: faWandMagicSparkles },
];

export default function Navigation({ user }: { user: NavUser | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (item: typeof navItems[number]) =>
    "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav className="relative z-50 bg-card border-b border-[var(--border)] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
            <img src="/flourish-logo-transparent.svg" alt="Flourish" className="w-7 h-7" />
            <span>Flourish</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 transition-colors ${
                  isActive(item)
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
                <Link
                  href="/account"
                  className="text-sm text-muted hover:text-foreground transition-colors hidden sm:block"
                >
                  {user.name ?? user.email}
                </Link>
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

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-muted hover:text-foreground transition-colors p-1"
                aria-label="Toggle menu"
              >
                <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} className="w-5 h-5" />
              </button>
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

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-[var(--border)] bg-card px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-base transition-colors ${
                isActive(item)
                  ? "font-semibold text-primary bg-primary/10"
                  : "text-muted hover:text-foreground hover:bg-secondary"
              }`}
            >
              {"icon" in item && item.icon && (
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
              )}
              {item.label}
            </Link>
          ))}
          <div className="mt-2 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-muted hover:text-foreground transition-colors truncate"
            >
              {user.name ?? user.email}
            </Link>
            <a
              href="/auth/logout"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
              Sign out
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
