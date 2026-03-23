"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function ShareRecipeButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary-hover text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] transition-colors"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faShare} className="w-3 h-3" />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
