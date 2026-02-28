import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faJar, faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faBookOpen,
    title: "Recipe Manager",
    description: "Save and organize your sourdough recipes in one place. Import directly from any URL or add your own from scratch.",
    bullets: ["Import from any recipe URL", "Manual recipe entry", "Tag and categorize"],
  },
  {
    icon: null,
    title: "Baker's Journal",
    description: "Document every bake with photos, notes, and ratings so you always know what worked — and what to try next.",
    bullets: ["Upload bake photos", "Track hydration, temps, and timing", "Link journal entries to recipes"],
  },
  {
    icon: faJar,
    title: "Starter Tracker",
    description: "Keep your sourdough starter healthy with a step-by-step readiness checklist and feeding timer.",
    bullets: ["7-step readiness checklist", "Feed time tracker with live timer", "Progress saved across sessions"],
  },
];

const steps = [
  { number: "1", title: "Create your free account", description: "Sign up in seconds with your email or Google." },
  { number: "2", title: "Add your recipes and log bakes", description: "Import recipes from the web or enter your own. Start logging every bake." },
  { number: "3", title: "Refine your craft over time", description: "Review your journal history and spot patterns that help you bake better bread." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-base font-medium px-4 py-1.5 rounded-full mb-6">
          <img src="/flourish-logo-transparent.svg" alt="" className="w-6 h-6" />
          Your sourdough companion
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight max-w-3xl mb-6">
          Bake better sourdough,{" "}
          <span className="text-primary">every time</span>
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mb-10">
          Flourish helps you save recipes, track every bake, and keep your starter healthy — so you can focus on making great bread.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Get started for free
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold border border-[var(--border)] text-foreground hover:bg-card transition-colors"
          >
            See what&apos;s inside
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 bg-card border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Everything a sourdough baker needs</h2>
            <p className="text-muted text-lg">Three tools, one place, zero friction.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-background border border-[var(--border)] rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {f.icon
                    ? <FontAwesomeIcon icon={f.icon} className="w-5 h-5 text-primary" />
                    : <img src="/flourish-logo-transparent.svg" alt="" className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted mb-4">{f.description}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-muted">
                      <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Up and running in minutes</h2>
            <p className="text-muted text-lg">No learning curve. Just start baking.</p>
          </div>
          <div className="flex flex-col gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-20 bg-card border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to bake smarter?
          </h2>
          <p className="text-muted text-lg mb-8">
            Join Flourish for free and start building the sourdough practice you&apos;ve always wanted.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
          >
            Create your free account
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
          </Link>
          <p className="text-sm text-muted mt-4">No credit card required.</p>
        </div>
      </section>
    </div>
  );
}
