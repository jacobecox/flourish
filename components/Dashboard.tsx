import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBookOpen,
  faJar,
  faStar,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma/client";

const quickActions = [
  { href: "/recipes/new", icon: faPlus, label: "New Recipe", description: "Add or import a recipe" },
  { href: "/journal/new", icon: faPlus, label: "Log a Bake", description: "Record today's bake" },
  { href: "/starter", icon: faJar, label: "Check Starter", description: "Starter readiness checklist" },
];

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`w-3 h-3 ${i < rating ? "text-primary" : "text-[var(--border)]"}`}
        />
      ))}
    </span>
  );
}

export default async function Dashboard({ user }: { user: User }) {
  const [recipeCount, journalCount, recentRecipes, recentEntries] = await Promise.all([
    prisma.recipe.count({ where: { userId: user.id } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.recipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, createdAt: true, tags: { select: { tag: { select: { name: true } } } } },
    }),
    prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 3,
      select: { id: true, date: true, notes: true, rating: true, recipe: { select: { title: true } } },
    }),
  ]);

  const firstName = user.name?.split(" ")[0] ?? "Baker";

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {firstName}</h1>
        <p className="text-muted mt-1">Here&apos;s where things stand with your baking.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-card border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted">Recipes</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{recipeCount}</p>
        </div>
        <div className="bg-card border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <img src="/flourish-logo-transparent.svg" alt="" className="w-5 h-5" />
            <span className="text-sm font-medium text-muted">Bakes logged</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{journalCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 bg-card border border-[var(--border)] rounded-xl p-4 hover:border-primary transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <FontAwesomeIcon icon={action.icon} className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Recipes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Recent recipes</h2>
            <Link href="/recipes" className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              View all <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
            </Link>
          </div>
          {recentRecipes.length === 0 ? (
            <div className="bg-card border border-[var(--border)] rounded-xl p-6 text-center">
              <p className="text-sm text-muted mb-3">No recipes yet.</p>
              <Link href="/recipes/new" className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
                Add your first recipe
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="flex items-center justify-between bg-card border border-[var(--border)] rounded-xl px-4 py-3 hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{recipe.title}</p>
                    {recipe.tags.length > 0 && (
                      <p className="text-xs text-muted mt-0.5">{recipe.tags.map((t) => t.tag.name).join(", ")}</p>
                    )}
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Journal Entries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Recent bakes</h2>
            <Link href="/journal" className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              View all <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
            </Link>
          </div>
          {recentEntries.length === 0 ? (
            <div className="bg-card border border-[var(--border)] rounded-xl p-6 text-center">
              <p className="text-sm text-muted mb-3">No bakes logged yet.</p>
              <Link href="/journal/new" className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
                Log your first bake
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  className="flex items-center justify-between bg-card border border-[var(--border)] rounded-xl px-4 py-3 hover:border-primary transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {entry.recipe?.title ?? "Untitled bake"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted">{new Date(entry.date).toLocaleDateString()}</p>
                      <StarRating rating={entry.rating} />
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
