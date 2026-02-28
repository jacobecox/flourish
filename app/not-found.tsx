import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <img src="/flourish-logo-transparent.svg" alt="Flourish" className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-3">404</h1>
        <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
        <p className="text-muted mb-8">
          Looks like this loaf didn&apos;t rise. The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
