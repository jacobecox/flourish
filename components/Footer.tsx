import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <span>© {year} Flourish. All rights reserved.</span>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
