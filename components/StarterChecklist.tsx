"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFire, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

const STORAGE_KEY = "flourish-starter-checklist";

const STEPS = [
  {
    id: "feed",
    title: "Discard & Feed",
    description:
      "Discard all but ~50g of starter. Feed with equal parts flour + water (e.g. 50g each). Mark the jar level with a rubber band or tape.",
  },
  {
    id: "bubbles-forming",
    title: "Bubbles Forming?",
    hint: "~2–4 hrs after feeding",
    description:
      "Small bubbles starting to appear on the sides and surface — the starter is waking up.",
  },
  {
    id: "doubled",
    title: "Doubled in Size?",
    hint: "~4–8 hrs after feeding",
    description:
      "Check the rubber band or tape mark. Has the starter doubled in volume?",
  },
  {
    id: "dome",
    title: "Domed Surface",
    description:
      "Is the top rounded and convex? A sunken or flat top means it may have passed its peak — act quickly.",
  },
  {
    id: "bubble-activity",
    title: "Active Bubbles",
    description:
      "Active bubbles visible on the sides and surface. Tipping the jar slightly should reveal a spongy, honeycomb-like network.",
  },
  {
    id: "smell",
    title: "Smell Test",
    description:
      "Smells yeasty and pleasantly tangy. Not like acetone (nail polish remover), sharp vinegar, or parmesan cheese.",
  },
  {
    id: "float",
    title: "Float Test",
    description:
      "Drop a small spoonful into room-temperature water. Does it float? If yes, you're ready to bake!",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface ChecklistState {
  feedTime: string | null;
  checkedSteps: StepId[];
}

function getDefault(): ChecklistState {
  return { feedTime: null, checkedSteps: [] };
}

function formatElapsed(feedTime: string): string {
  const diff = Date.now() - new Date(feedTime).getTime();
  const totalMins = Math.floor(diff / 60000);
  if (totalMins < 1) return "just now";
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins}m ago`;
  if (mins === 0) return `${hrs}h ago`;
  return `${hrs}h ${mins}m ago`;
}

function formatFeedTime(feedTime: string): string {
  return new Date(feedTime).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StarterChecklist() {
  const [state, setState] = useState<ChecklistState>(getDefault);
  const [elapsed, setElapsed] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChecklistState;
        setState(parsed);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, mounted]);

  // Update elapsed timer
  useEffect(() => {
    if (!state.feedTime) return;
    const update = () => setElapsed(formatElapsed(state.feedTime!));
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [state.feedTime]);

  const toggleStep = useCallback((id: StepId) => {
    setState((prev) => ({
      ...prev,
      checkedSteps: prev.checkedSteps.includes(id)
        ? prev.checkedSteps.filter((s) => s !== id)
        : [...prev.checkedSteps, id],
    }));
  }, []);

  const recordFeedTime = useCallback(() => {
    setState((prev) => ({ ...prev, feedTime: new Date().toISOString() }));
  }, []);

  const reset = useCallback(() => {
    setState(getDefault());
    setElapsed("");
  }, []);

  const checkedCount = state.checkedSteps.length;
  const totalCount = STEPS.length;
  const progress = checkedCount / totalCount;
  const allDone = checkedCount === totalCount;
  const hasAnyProgress = state.feedTime !== null || checkedCount > 0;

  // Avoid hydration mismatch — render nothing meaningful until client-side
  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-secondary rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {!state.feedTime ? (
            <button
              onClick={recordFeedTime}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faFire} className="w-3.5 h-3.5" />
              Record Feed Time
            </button>
          ) : (
            <div className="text-sm text-muted">
              <span className="font-medium text-foreground">
                Fed at {formatFeedTime(state.feedTime)}
              </span>
              <span className="mx-1.5 text-[var(--border)]">·</span>
              <span>{elapsed}</span>
            </div>
          )}
        </div>

        {hasAnyProgress && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted">Progress</span>
          <span className="font-medium text-foreground tabular-nums">
            {checkedCount} / {totalCount}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden border border-[var(--border)]">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Ready to Bake!</p>
            <p className="text-sm text-muted">
              Your starter has passed all checks. Time to mix your dough.
            </p>
          </div>
        </div>
      )}

      {/* Step list */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const checked = state.checkedSteps.includes(step.id);
          return (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                checked
                  ? "bg-secondary/60 border-[var(--border)] opacity-70"
                  : "bg-card border-[var(--border)] hover:border-primary hover:shadow-sm"
              }`}
            >
              {/* Step number / check indicator */}
              <div
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${
                  checked
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted border border-[var(--border)]"
                }`}
              >
                {checked ? (
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                ) : (
                  i + 1
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      checked ? "text-muted line-through" : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  {"hint" in step && step.hint && (
                    <span className="text-xs text-muted bg-secondary px-2 py-0.5 rounded-full border border-[var(--border)]">
                      {step.hint}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${checked ? "text-muted" : "text-muted"}`}>
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted text-center">
        Tap a step to check it off. Progress is saved automatically.
      </p>
    </div>
  );
}
