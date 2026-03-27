"use client";

import { useState } from "react";

export default function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 transition-all font-medium ${
        copied
          ? "bg-green-600 text-white"
          : "border border-white/20 text-white/50 hover:text-white hover:border-white/40"
      }`}
    >
      {copied ? "Copied ✓" : "Copy Prompt"}
    </button>
  );
}
