import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faJar,
  faArrowRight,
  faCheck,
  faComments,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faComments,
    title: "AI Baking Assistant",
    description: "Ask anything about sourdough and get answers drawn from your own recipes and journal — not generic advice from the internet.",
    bullets: [
      "Knows your exact recipes and bake history",
      "Compares your past bakes to find patterns",
      "Backed by expert sourdough knowledge",
    ],
    highlight: true,
  },
  {
    icon: faBookOpen,
    title: "Recipe Manager",
    description: "Save and organize your sourdough recipes in one place. Import directly from any URL or add your own from scratch.",
    bullets: ["Import from any recipe URL", "Manual recipe entry", "Tag and categorize"],
    highlight: false,
  },
  {
    icon: null,
    title: "Baker's Journal",
    description: "Document every bake with photos, notes, and ratings so you always know what worked — and what to try next.",
    bullets: ["Upload bake photos", "Track hydration, temps, and timing", "Link journal entries to recipes"],
    highlight: false,
  },
  {
    icon: faJar,
    title: "Starter Tracker",
    description: "Keep your sourdough starter healthy with a step-by-step readiness checklist and feeding timer.",
    bullets: ["7-step readiness checklist", "Feed time tracker with live timer", "Progress saved across sessions"],
    highlight: false,
  },
];

const steps = [
  { number: "1", title: "Create your free account", description: "Sign up in seconds with your email." },
  { number: "2", title: "Add your recipes and log bakes", description: "Import recipes from the web or enter your own. Every bake you log makes the AI smarter about your style." },
  { number: "3", title: "Ask your AI baking coach", description: "Get personalized answers about your specific recipes, past bakes, and what to try differently next time." },
];

const chatPreview = [
  {
    role: "user",
    text: "My last loaf from the Beginner's Sourdough recipe came out a bit dense. What should I adjust?",
  },
  {
    role: "assistant",
    text: "Looking at your March 2nd journal entry for that bake, you noted the dough felt a little stiff during shaping and the bulk ferment ran about 3.5 hours at 72°F. That's likely on the shorter side — try extending bulk to 4.5–5 hours, or look for 50–75% rise before shaping. Your recipe calls for 68% hydration which is manageable, but bumping to 72% would give you a more open crumb too.",
    sources: ["Beginner's Sourdough Recipe", "Journal — Mar 2"],
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-base font-medium px-4 py-1.5 rounded-full mb-6">
          <img src="/flourish-logo-transparent.svg" alt="" className="w-6 h-6" />
          Smarter baking, powered by AI
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight max-w-3xl mb-6">
          Bake better sourdough,
          <br />
          <span className="text-primary">every time</span>
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mb-10">
          Flourish helps you save recipes, track every bake, and keep your starter healthy — plus an AI assistant that knows your exact bakes and gives advice no generic app can match.
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
            href="#ai"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold border border-[var(--border)] text-foreground hover:bg-card transition-colors"
          >
            See what&apos;s inside
          </a>
        </div>
      </section>

      {/* AI Spotlight */}
      <section id="ai" className="px-4 py-20 bg-card border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
              <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5" />
              Industry-first feature
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              An AI that knows <em>your</em> sourdough
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Unlike generic AI chatbots, Flourish&apos;s assistant is trained on your own recipes and journal entries. Ask it to compare your bakes, troubleshoot a specific loaf, or figure out what changed between your best and worst results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Mock chat */}
            <div className="bg-background border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-[var(--border)] px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted font-medium">Ask AI · Flourish</span>
              </div>
              <div className="p-4 space-y-4">
                {chatPreview.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-card border border-[var(--border)] text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.sources && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
                          {msg.sources.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] bg-secondary text-muted"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <div className="flex items-center gap-2 bg-card border border-[var(--border)] rounded-lg px-3 py-2">
                  <span className="text-sm text-muted flex-1">Ask about sourdough…</span>
                  <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Value props */}
            <div className="space-y-6">
              {[
                {
                  title: "References your actual recipes",
                  body: "When you ask about a bake, it pulls context from your saved recipes — specific measurements, techniques, and the notes you wrote.",
                },
                {
                  title: "Draws from your journal history",
                  body: "Connected to every journal entry you've logged, so it can compare bakes, spot patterns, and explain why one loaf beat another.",
                },
                {
                  title: "Backed by expert knowledge",
                  body: "Combines your personal data with a curated sourdough knowledge base covering fermentation science, shaping, scoring, and more.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Everything a serious sourdough baker needs</h2>
            <p className="text-muted text-lg">Four tools, one place, built around AI.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`border rounded-xl p-6 ${
                  f.highlight
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-[var(--border)]"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.highlight ? "bg-primary/15" : "bg-primary/10"}`}>
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
      <section className="px-4 py-20 bg-card border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Up and running in minutes</h2>
            <p className="text-muted text-lg">The more you bake and log, the smarter your AI gets.</p>
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
      <section className="px-4 py-20 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to bake with an AI coach in your corner?
          </h2>
          <p className="text-muted text-lg mb-8">
            Join Flourish for free. Start logging your bakes and unlock an AI assistant that gets better the more you use it.
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
