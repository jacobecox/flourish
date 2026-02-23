import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/recipes");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Welcome to Flourish
          </h1>
          <p className="text-xl text-muted mb-8">
            Your sourdough baking companion
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="bg-secondary hover:bg-secondary-hover text-foreground px-6 py-3 rounded-lg font-semibold border border-[var(--border)] transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">
              📖 Recipe Manager
            </h2>
            <p className="text-muted">
              Import, save, and organize your favorite sourdough recipes
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Import from URL
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Manual recipe entry
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Tag and categorize
              </li>
            </ul>
          </div>

          <div className="bg-card border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">
              📝 Baker&apos;s Journal
            </h2>
            <p className="text-muted">
              Document your bakes with photos and notes
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Upload photos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Track what works
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                Link to recipes
              </li>
            </ul>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-12 bg-secondary border border-[var(--border)] rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            🚀 Coming Soon
          </h3>
          <p className="text-muted">
            AI-powered recipe recommendations and baking insights
          </p>
        </div>
      </div>
    </div>
  );
}
